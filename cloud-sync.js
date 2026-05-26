// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';
/** 定时同步间隔：万级数据下全量拉取成本高，适当拉长 */
const CLOUD_SYNC_INTERVAL_MS = 45000;
const CLOUD_RETRY_DELAY_MS = 5000;
const LOCAL_DIRTY_KEY = 'rule_library_local_dirty';
/** 行数超过此值且基线可用时，尽量走增量上传（避免 DELETE 全表 + POST 上万行） */
const INCREMENTAL_SYNC_MIN_ROWS = 400;
/** 变更条数超过此值仍回退为整表替换（大批量导入等） */
const INCREMENTAL_MAX_CHANGES = 2000;
const SYNC_HTTP_CHUNK = 400;
/** 拉取全表列（表结构见 providers-setup.sql，含 naming 列） */
const PROVIDERS_REST_PATH = '/rest/v1/providers?select=*';
/** 已知总行数时并行拉取分页 */
const FETCH_CLOUD_PARALLEL_PAGES = 3;
const CLOUD_SNAPSHOT_KEY = 'rule_library_cloud_snapshot';
/** 本地条数超过此值且云端拉取为 0 时，禁止自动整表上传（防止 DELETE 清空云端） */
const BLOCK_UPLOAD_WHEN_REMOTE_EMPTY_MIN_LOCAL = 50;

let onCloudSyncReady = null;
let cloudSyncTimer = null;
let isCloudSyncing = false;
let lastCloudSnapshot = '';
/** 上次与云端对齐后的本地 providers JSON（用于增量 diff）；与 localStorage 内容格式一致 */
let lastSyncedRawProvidersStr = null;
let retryTimer = null;
let retryCountdownTimer = null;
let retryRemainSec = 0;
let lastSuccessAt = null;
let pendingSyncData = null;

function emitSyncStatus(status, message, extra) {
  window.dispatchEvent(new CustomEvent('cloud-sync-status', {
    detail: Object.assign({
      status: status || 'idle',
      message: message || '',
      lastSuccessAt: lastSuccessAt
    }, extra || {})
  }));
}

function clearRetryTimers() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (retryCountdownTimer) {
    clearInterval(retryCountdownTimer);
    retryCountdownTimer = null;
  }
  retryRemainSec = 0;
}

function markSyncSuccess(message) {
  clearRetryTimers();
  lastSuccessAt = Date.now();
  emitSyncStatus('success', message || '已同步');
}

function queuePendingSync(data) {
  pendingSyncData = Array.isArray(data) ? data : [];
  emitSyncStatus('syncing', '检测到本地变更，排队回传中...', {
    pendingSyncCount: pendingSyncData.length
  });
}

function flushPendingSync() {
  if (isCloudSyncing || !pendingSyncData) return;
  var nextData = pendingSyncData;
  pendingSyncData = null;
  emitSyncStatus('syncing', '正在回传本地变更...', {
    pendingSyncCount: nextData.length
  });
  setTimeout(function() {
    syncToCloud(nextData);
  }, 0);
}

function scheduleRetry() {
  if (retryTimer || isCloudSyncing) return;
  retryRemainSec = Math.max(1, Math.floor(CLOUD_RETRY_DELAY_MS / 1000));
  emitSyncStatus('error', '同步失败，' + retryRemainSec + 's后重试', { retryInSec: retryRemainSec });
  retryCountdownTimer = setInterval(function() {
    retryRemainSec -= 1;
    if (retryRemainSec <= 0) {
      if (retryCountdownTimer) {
        clearInterval(retryCountdownTimer);
        retryCountdownTimer = null;
      }
      return;
    }
    emitSyncStatus('error', '同步失败，' + retryRemainSec + 's后重试', { retryInSec: retryRemainSec });
  }, 1000);
  retryTimer = setTimeout(function() {
    retryTimer = null;
    cloudSync();
  }, CLOUD_RETRY_DELAY_MS);
}

function toLocalProvider(p) {
  return {
    id: p.id,
    shop: p.shop || '',
    shopname: p.shopname || p.shop_name || '',
    name: p.name || '',
    brand: p.brand || '',
    series: p.series || '',
    naming: p.naming || '',
    split: p.split || '',
    pricing: p.pricing || '',
    publishTime: p.publishtime || p.publishTime || '',
    specialCase: p.specialcase || p.specialCase || '',
    otherInfo: p.otherinfo || p.otherInfo || ''
  };
}

function toCloudProvider(p) {
  return {
    shop: p.shop || '',
    shopname: p.shopname || '',
    name: p.name || '',
    brand: p.brand || '',
    series: p.series || '',
    naming: p.naming || '',
    split: p.split || '',
    pricing: p.pricing || '',
    publishtime: p.publishTime || p.publishtime || '',
    specialcase: p.specialCase || p.specialcase || '',
    otherinfo: p.otherInfo || p.otherinfo || ''
  };
}

/** 写入 Supabase（字段与 providers-setup.sql 一致） */
function toCloudProviderDbRow(p) {
  return toCloudProvider(p || {});
}

function calcSnapshot(data) {
  var list = (data || []).map(function(item) {
    return toCloudProvider(item || {});
  });
  // 按业务主键排序后再序列化，避免仅顺序不同却误判为「本地/云端不一致」
  list.sort(function(a, b) {
    return providerIdentityKey(a).localeCompare(providerIdentityKey(b), 'zh-Hans-CN');
  });
  return JSON.stringify(list);
}

function providerIdentityKey(p) {
  var shop = String(p.shop || '').trim().toLowerCase();
  var shopname = String(p.shopname || '').trim().toLowerCase();
  var name = String(p.name || '').trim().toLowerCase();
  var brand = String(p.brand || '').trim().toLowerCase();
  var series = String(p.series || '').trim().toLowerCase();
  return [shop, shopname, name, brand, series].join('|');
}

/** 将当前内存中的规则列表转为上传用行，并按主键去重（后者覆盖前者）；保留数据库 id 供增量同步 */
function isPositiveIntId(id) {
  if (id === undefined || id === null || id === '') return false;
  var n = typeof id === 'number' ? id : parseInt(String(id), 10);
  return Number.isFinite(n) && n > 0 && n < 2147483647;
}

function toCloudProviderListForUpload(data) {
  var map = new Map();
  (data || []).forEach(function(item) {
    var c = toCloudProvider(item || {});
    var key = providerIdentityKey(c);
    if (!key.replace(/\|/g, '')) return;
    var row = Object.assign({}, c);
    if (isPositiveIntId(item && item.id)) row.id = Number(item.id);
    map.set(key, row);
  });
  return Array.from(map.values());
}

function providerRowForDb(p) {
  var o = toCloudProviderDbRow(p || {});
  if (isPositiveIntId(p && p.id)) o.id = Number(p.id);
  return o;
}

function providerContentSignature(p) {
  return JSON.stringify(toCloudProvider(p || {}));
}

function computeProviderSyncDelta(prevFormatted, nextFormatted) {
  var prevById = new Map();
  (prevFormatted || []).forEach(function(p) {
    if (isPositiveIntId(p && p.id)) prevById.set(Number(p.id), p);
  });
  var nextIds = new Set();
  var upserts = [];
  var insertsNoId = [];
  (nextFormatted || []).forEach(function(p) {
    if (isPositiveIntId(p && p.id)) {
      var id = Number(p.id);
      nextIds.add(id);
      var prevP = prevById.get(id);
      if (!prevP) {
        upserts.push(p);
      } else if (providerContentSignature(prevP) !== providerContentSignature(p)) {
        upserts.push(p);
      }
    } else {
      insertsNoId.push(p);
    }
  });
  var deletes = [];
  prevById.forEach(function(_p, id) {
    if (!nextIds.has(id)) deletes.push(id);
  });
  return { upserts: upserts, insertsNoId: insertsNoId, deletes: deletes };
}

function captureSyncBaselineFromStorage() {
  try {
    lastSyncedRawProvidersStr = localStorage.getItem('rule_library_providers');
  } catch (e) {
    lastSyncedRawProvidersStr = null;
  }
}

function persistCloudSnapshot(snapshot) {
  lastCloudSnapshot = snapshot || '';
  try {
    if (snapshot) localStorage.setItem(CLOUD_SNAPSHOT_KEY, snapshot);
    else localStorage.removeItem(CLOUD_SNAPSHOT_KEY);
  } catch (e) {}
}

function loadPersistedCloudSnapshot() {
  try {
    var s = localStorage.getItem(CLOUD_SNAPSHOT_KEY);
    if (s) lastCloudSnapshot = s;
  } catch (e) {}
}

/** 本地无待传且快照与当前一致时，可只做行数探测而跳过万级全表 GET */
function canSkipFullCloudPull(localProviders) {
  var list = localProviders || [];
  if (!list.length) return false;
  var storedSnap = lastCloudSnapshot;
  try {
    if (!storedSnap) storedSnap = localStorage.getItem(CLOUD_SNAPSHOT_KEY) || '';
  } catch (e) {}
  if (!storedSnap) return false;
  return calcSnapshot(list) === storedSnap;
}

async function fetchProvidersRange(from, to, withCountExact) {
  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Range-Unit': 'items',
    'Range': from + '-' + to
  };
  if (withCountExact) headers['Prefer'] = 'count=exact';
  var res = await fetch(SUPABASE_URL + PROVIDERS_REST_PATH, { headers: headers });
  if (!res.ok) {
    var errText = await res.text();
    throw new Error('拉取云端失败: ' + res.status + ' ' + errText);
  }
  var rows = await res.json();
  return {
    list: Array.isArray(rows) ? rows : [],
    contentRange: res.headers.get('content-range') || res.headers.get('Content-Range')
  };
}

async function httpPostProvidersJson(pathSuffix, bodyArray, preferPrefer) {
  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': preferPrefer || 'return=minimal'
  };
  var res = await fetch(SUPABASE_URL + '/rest/v1/providers' + (pathSuffix || ''), {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bodyArray)
  });
  if (!res.ok) {
    var errText = await res.text();
    throw new Error(errText || String(res.status));
  }
}

/**
 * 按 id 删除 / upsert / 纯插入，避免全表 DELETE + 整包 POST。
 */
async function syncProvidersIncrementalApply(delta) {
  var i;
  for (i = 0; i < delta.deletes.length; i += SYNC_HTTP_CHUNK) {
    var delChunk = delta.deletes.slice(i, i + SYNC_HTTP_CHUNK);
    var inList = delChunk.join(',');
    var delRes = await fetch(SUPABASE_URL + '/rest/v1/providers?id=in.(' + inList + ')', {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    if (!delRes.ok) {
      var delErr = await delRes.text();
      throw new Error(delErr || String(delRes.status));
    }
  }
  for (i = 0; i < delta.upserts.length; i += SYNC_HTTP_CHUNK) {
    var upChunk = delta.upserts.slice(i, i + SYNC_HTTP_CHUNK).map(providerRowForDb);
    await httpPostProvidersJson(
      '?on_conflict=id',
      upChunk,
      'resolution=merge-duplicates,return=minimal'
    );
  }
  for (i = 0; i < delta.insertsNoId.length; i += SYNC_HTTP_CHUNK) {
    var insChunk = delta.insertsNoId.slice(i, i + SYNC_HTTP_CHUNK).map(function(p) {
      return toCloudProviderDbRow(p || {});
    });
    await httpPostProvidersJson('', insChunk, 'return=minimal');
  }
}

/** 解析 PostgREST Content-Range，例如 0-99/5000 或 items 0-99/5000；total 为 * 时返回 null */
function parseContentRangeItems(header) {
  if (!header || typeof header !== 'string') return null;
  var m = header.trim().match(/(\d+)\s*-\s*(\d+)\s*\/\s*(\d+|\*)/);
  if (!m) return null;
  return {
    start: parseInt(m[1], 10),
    end: parseInt(m[2], 10),
    total: m[3] === '*' ? null : parseInt(m[3], 10)
  };
}

/** 轻量请求：用 Prefer:count=exact 取 providers 总行数（与 RLS 下可见行数一致） */
async function fetchCloudProvidersDeclaredTotal() {
  try {
    var res = await fetch(SUPABASE_URL + '/rest/v1/providers?select=id', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    if (!res.ok) return null;
    await res.json().catch(function() { return []; });
    var cr = res.headers.get('content-range') || res.headers.get('Content-Range');
    var parsed = parseContentRangeItems(cr);
    if (parsed && typeof parsed.total === 'number' && !isNaN(parsed.total)) return parsed.total;
  } catch (e) {
    console.warn('🌥️ 无法获取 providers 精确总数:', e);
  }
  return null;
}

async function fetchCloudProviders() {
  var pageSize = 1000;
  var totalHint = await fetchCloudProvidersDeclaredTotal();
  var all = [];

  /** 计数为 0 时再拉一页，避免 Content-Range 误报 0 导致误判「云端无数据」 */
  if (totalHint === 0) {
    var probe = await fetchProvidersRange(0, pageSize - 1, true);
    if (!probe.list.length) return [];
    all = probe.list;
    var probeTotal = parseContentRangeItems(probe.contentRange);
    if (probeTotal && typeof probeTotal.total === 'number' && probeTotal.total > probe.list.length) {
      totalHint = probeTotal.total;
    } else {
      return all;
    }
  }

  if (typeof totalHint === 'number' && totalHint > 0) {
    var pageStarts = [];
    for (var ps = 0; ps < totalHint; ps += pageSize) pageStarts.push(ps);
    for (var pi = 0; pi < pageStarts.length; pi += FETCH_CLOUD_PARALLEL_PAGES) {
      var batchStarts = pageStarts.slice(pi, pi + FETCH_CLOUD_PARALLEL_PAGES);
      var parts = await Promise.all(batchStarts.map(function(from) {
        var to = Math.min(from + pageSize - 1, totalHint - 1);
        return fetchProvidersRange(from, to, false);
      }));
      parts.forEach(function(part) {
        if (part.list.length === 0 && all.length < totalHint) {
          console.warn('🌥️ 并行分页返回 0 行，可能遭 max-rows 截断');
        }
        all = all.concat(part.list);
      });
    }
    return all;
  }

  /** 拿不到总数时：用每页 Content-Range，避免「本页未满 1000」误判为已拉完 */
  var from = 0;
  var declaredTotal = null;
  while (true) {
    var to = from + pageSize - 1;
    var page = await fetchProvidersRange(from, to, true);
    var list = page.list;
    var parsed = parseContentRangeItems(page.contentRange);
    if (parsed && typeof parsed.total === 'number' && !isNaN(parsed.total)) {
      declaredTotal = parsed.total;
    }

    all = all.concat(list);

    if (typeof declaredTotal === 'number' && declaredTotal >= 0) {
      if (all.length >= declaredTotal || list.length === 0) break;
      from = all.length;
      continue;
    }

    if (list.length < pageSize || list.length === 0) break;
    from += pageSize;
  }

  return all;
}

function notifyProvidersUpdated(source) {
  window.dispatchEvent(new CustomEvent('providers-data-updated', {
    detail: { source: source || 'unknown' }
  }));
}

// 云同步API - 加载时拉取数据
// opts.fromTimer：定时触发；opts.quickCheck：手动「立即同步」先探测行数/快照
// opts.forcePull：强制全表拉取（「以云端为准」）
async function cloudSync(opts) {
  if (opts && opts.forcePull && isMultiUserSyncBlocked()) {
    opts = Object.assign({}, opts, { forcePull: false });
  }
  opts = opts || {};
  var fromTimer = !!opts.fromTimer;
  var quickCheck = !!opts.quickCheck;

  if (isCloudSyncing) return;
  isCloudSyncing = true;
  if (typeof window !== 'undefined') {
    window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC = true;
  }
  clearRetryTimers();
  emitSyncStatus('syncing', '同步中...');
  try {
    console.log('🌥️ 开始同步云端数据...');
    const localProviders = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
    const localDirty = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';

    /** 本地有待传：直接上传，不再先拉 2000+ 行（删改卡后最常见） */
    if (localDirty && !opts.forcePull) {
      emitSyncStatus('syncing', '正在上传本地变更…');
      await syncToCloud(localProviders, { reentrant: true });
      if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
      return;
    }

    if (fromTimer && localDirty) {
      const localProvidersNow = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      localStorage.setItem(LOCAL_DIRTY_KEY, '1');
      queuePendingSync(localProvidersNow);
      notifyProvidersUpdated('cloud-timer-skip-pull');
      markSyncSuccess('本地有待回传（已跳过定时拉取）');
      return;
    }

    /** 打开页面 / 定时 / 手动同步：本地干净且快照一致时，仅探测行数即可 */
    var tryFastSkip = !localDirty && !opts.forcePull;
    if (tryFastSkip && canSkipFullCloudPull(localProviders)) {
      var rcSnap = await fetchCloudProvidersDeclaredTotal();
      var localLenSnap = localProviders.length;
      if (typeof rcSnap === 'number' && rcSnap === localLenSnap) {
        markSyncSuccess('已是最新');
        if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
        return;
      }
    }

    if (tryFastSkip && !canSkipFullCloudPull(localProviders)) {
      var rc = await fetchCloudProvidersDeclaredTotal();
      var localLen = localProviders.length;
      if (typeof rc === 'number' && rc === localLen && localLen > 0) {
        markSyncSuccess('已是最新');
        if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
        return;
      }
    }

    const remoteData = await fetchCloudProviders();
    console.log('🌥️ 云端数据:', remoteData);

    if (!remoteData || remoteData.length === 0) {
      const localData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      var declaredEmpty = await fetchCloudProvidersDeclaredTotal();
      if (localData.length > BLOCK_UPLOAD_WHEN_REMOTE_EMPTY_MIN_LOCAL && !opts.forcePushUpload) {
        var msg = '云端拉取为 ' + (declaredEmpty === null ? '0(不可读)' : declaredEmpty) +
          ' 条，本地有 ' + localData.length + ' 条，已阻止自动上传以免误删云端。' +
          '请先在 Supabase 检查 RLS/数据；确认要灌库时在控制台执行 forceRestoreLocalProvidersToCloud()';
        console.error('🌥️ ' + msg);
        emitSyncStatus('error', '已阻止自动上传，请检查 Supabase');
        if (typeof alert === 'function') {
          alert(msg);
        }
        return;
      }
      console.log('🌥️ 云端拉取为 0 条，从本地上传...');
      if (localData.length > 0) {
        await syncToCloud(localData, { reentrant: true });
      }
    } else {
      // 远程有数据，转回驼峰后更新本地
      const formatted = remoteData.map(toLocalProvider);
      const remoteSnapshot = calcSnapshot(formatted);
      const localProvidersNow = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      const localSnapshotNow = calcSnapshot(localProvidersNow);
      /** fetch 期间 DOMContentLoaded 可能已 setData，必须在拉取结束后再读 dirty */
      var localDirtyAfterFetch = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';

      // lastCloudSnapshot 仅在内存中，刷新后会清空；须结合 localDirty，否则会每次打开都误判「并发」并全量回传
      var localEdited =
        localDirtyAfterFetch ||
        (lastCloudSnapshot !== '' && localSnapshotNow !== lastCloudSnapshot);

      // 本地有未对齐云端的修改（含删除）：必须以本地列表为准。
      // 与远程做「并集」会把「本地已删、云端仍在」的行再次写回，导致删卡后刷新又出现。
      if (localEdited && localSnapshotNow !== remoteSnapshot) {
        console.log('🌥️ 检测到本地与云端不一致，以本地为准排队回传');
        localStorage.setItem('rule_library_providers', JSON.stringify(localProvidersNow));
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        queuePendingSync(localProvidersNow);
        notifyProvidersUpdated('cloud-merge');
        markSyncSuccess('检测到本地变更，已排队回传云端');
        return;
      }

      // 仍有 dirty 标记但快照与云端一致（极少见）：也不要用远程整表覆盖本地，以免冲掉刚写入尚未反映到快照的变更
      if (localDirtyAfterFetch) {
        console.log('🌥️ 本地有待同步标记，保留本地数据并排队回传');
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        queuePendingSync(localProvidersNow);
        notifyProvidersUpdated('cloud-local-dirty');
        markSyncSuccess('本地待同步，已排队回传云端');
        return;
      }

      /** 云端条数远少于本机时，禁止用云端覆盖本地（避免 2364 条被 1～2 条冲掉） */
      if (localProvidersNow.length >= 100 && formatted.length < localProvidersNow.length * 0.5) {
        var blockMsg = '已阻止同步：云端仅 ' + formatted.length + ' 条，本机有 ' + localProvidersNow.length +
          ' 条。请先用 recover.html 从本机恢复云端，勿用少量云端覆盖本机。';
        console.error('🌥️ ' + blockMsg);
        emitSyncStatus('error', '云端数据过少，已保护本机');
        if (typeof alert === 'function') alert(blockMsg);
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        queuePendingSync(localProvidersNow);
        return;
      }

      localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
      localStorage.setItem(LOCAL_DIRTY_KEY, '0');
      persistCloudSnapshot(remoteSnapshot);
      if (remoteSnapshot !== localSnapshotNow) {
        notifyProvidersUpdated('cloud-pull');
      }
      markSyncSuccess('已同步');
      console.log('🌥️ 已从云端同步数据，本地更新');
    }

    // 同步完成回调
    if (typeof onCloudSyncReady === 'function') {
      onCloudSyncReady();
    }
  } catch (e) {
    console.error('🌥️ 同步失败:', e);
    scheduleRetry();
  } finally {
    isCloudSyncing = false;
    if (typeof window !== 'undefined') {
      window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC = false;
    }
    flushPendingSync();
    try {
      if (localStorage.getItem(LOCAL_DIRTY_KEY) !== '1') {
        captureSyncBaselineFromStorage();
      }
    } catch (e3) {}
  }
}

/**
 * 整表 DELETE + POST（大批量变更或增量失败时回退）
 */
async function syncProvidersFullTableReplace(data) {
  const formatted = toCloudProviderListForUpload(data);
  const nextSnapshot = calcSnapshot(formatted);

  var remoteCount = await fetchCloudProvidersDeclaredTotal();
  if (typeof remoteCount === 'number' && remoteCount > 0 && remoteCount < formatted.length * 0.5) {
    console.error('🌥️ 已阻止整表替换：云端现有 ' + remoteCount + ' 条，本地将上传 ' + formatted.length +
      ' 条。请用 forceRestoreLocalProvidersToCloud() 仅追加写入，或先备份。');
    emitSyncStatus('error', '已阻止整表删除，云端数据过少');
    return false;
  }

  const deleteRes = await fetch(SUPABASE_URL + '/rest/v1/providers?id=gt.0', {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  if (!deleteRes.ok) {
    const deleteErrText = await deleteRes.text();
    console.error('🌥️ 清空云端失败:', deleteRes.status, deleteErrText);
    scheduleRetry();
    return false;
  }

  if (formatted.length === 0) {
    persistCloudSnapshot(nextSnapshot);
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    lastSyncedRawProvidersStr = JSON.stringify(data);
    markSyncSuccess('已同步');
    console.log('🌥️ 已同步到云端');
    return true;
  }

  for (var off = 0; off < formatted.length; off += SYNC_HTTP_CHUNK) {
    var chunk = formatted.slice(off, off + SYNC_HTTP_CHUNK).map(providerRowForDb);
    var res = await fetch(SUPABASE_URL + '/rest/v1/providers', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chunk)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('🌥️ 同步失败:', res.status, errText);
      scheduleRetry();
      return false;
    }
  }

  persistCloudSnapshot(nextSnapshot);
  localStorage.setItem(LOCAL_DIRTY_KEY, '0');
  lastSyncedRawProvidersStr = JSON.stringify(data);
  markSyncSuccess('已同步');
  console.log('🌥️ 已同步到云端');
  return true;
}

/**
 * 与基线对比，仅推送删除/变更/新增行。返回 true 表示已处理完毕。
 */
async function trySyncToCloudIncremental(data, formatted) {
  var baselineStr = lastSyncedRawProvidersStr;
  if (!baselineStr || formatted.length < INCREMENTAL_SYNC_MIN_ROWS) {
    return false;
  }
  var baselineFormatted;
  try {
    baselineFormatted = toCloudProviderListForUpload(JSON.parse(baselineStr));
  } catch (e) {
    return false;
  }
  var delta = computeProviderSyncDelta(baselineFormatted, formatted);
  var opCount = delta.deletes.length + delta.upserts.length + delta.insertsNoId.length;
  if (opCount <= 0) {
    persistCloudSnapshot(calcSnapshot(formatted));
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    lastSyncedRawProvidersStr = JSON.stringify(data);
    markSyncSuccess('已同步');
    return true;
  }
  if (opCount > INCREMENTAL_MAX_CHANGES || opCount >= formatted.length * 0.95) {
    return false;
  }
  await syncProvidersIncrementalApply(delta);
  if (delta.insertsNoId.length > 0) {
    var remoteList = await fetchCloudProviders();
    var locFmt = remoteList.map(toLocalProvider);
    localStorage.setItem('rule_library_providers', JSON.stringify(locFmt));
    notifyProvidersUpdated('cloud-incremental-refresh');
  }
  var stored = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
  var storedFmt = toCloudProviderListForUpload(stored);
  persistCloudSnapshot(calcSnapshot(storedFmt));
  lastSyncedRawProvidersStr = JSON.stringify(stored);
  localStorage.setItem(LOCAL_DIRTY_KEY, '0');
  markSyncSuccess('已增量同步（' + opCount + ' 项）');
  return true;
}

// 保存数据后自动同步到云端
async function syncToCloudImpl(data) {
    console.log('🌥️ 同步到云端...', (data || []).length, '条');

    const formatted = toCloudProviderListForUpload(data);

    if (formatted.length === 0) {
      const remoteRows = await fetchCloudProviders();
      const remoteCount = (remoteRows && remoteRows.length) || 0;
      if (remoteCount > 200) {
        console.error('🌥️ 已阻止用空列表覆盖云端（云端 ' + remoteCount + ' 条），疑为误清空，已从云端恢复本地。');
        localStorage.setItem('rule_library_providers', JSON.stringify(remoteRows.map(toLocalProvider)));
        localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        persistCloudSnapshot(calcSnapshot(remoteRows.map(toLocalProvider)));
        notifyProvidersUpdated('cloud-recovered-from-empty-sync');
        markSyncSuccess('已阻止误清空，已从云端恢复');
        captureSyncBaselineFromStorage();
        return;
      }
    }

    const nextSnapshot = calcSnapshot(formatted);
    if (nextSnapshot === lastCloudSnapshot) {
      localStorage.setItem(LOCAL_DIRTY_KEY, '0');
      lastSyncedRawProvidersStr = JSON.stringify(data);
      markSyncSuccess('已同步');
      return;
    }

    var didInc = false;
    try {
      didInc = await trySyncToCloudIncremental(data, formatted);
    } catch (incErr) {
      console.warn('🌥️ 增量同步失败，回退整表替换:', incErr);
    }
    if (didInc) {
      console.log('🌥️ 增量同步完成');
      return;
    }

    var ok = await syncProvidersFullTableReplace(data);
    if (!ok) {
      return;
    }
}

async function syncToCloud(data, options) {
  options = options || {};
  if (isCloudSyncing && !options.reentrant) {
    queuePendingSync(data);
    emitSyncStatus('syncing', '同步排队中...');
    return;
  }
  var manageLock = !options.reentrant;
  if (manageLock) {
    isCloudSyncing = true;
    clearRetryTimers();
    emitSyncStatus('syncing', '同步中...');
  }
  try {
    await syncToCloudImpl(data);
  } catch (e) {
    console.error('🌥️ 同步失败:', e);
    scheduleRetry();
  } finally {
    if (manageLock) {
      isCloudSyncing = false;
      flushPendingSync();
    }
  }
}

function startCloudAutoSync() {
  if (cloudSyncTimer) return;
  cloudSyncTimer = setInterval(function() {
    cloudSync({ fromTimer: true });
  }, CLOUD_SYNC_INTERVAL_MS);
}

/**
 * 直接把云端 providers 全表写入本机（绕过 cloudSync 的分支判断，避免一直合并不了远程全量）。
 * 慎用：本机未上传的修改会丢失。
 */
function isMultiUserSyncBlocked() {
  var cfg = window.RULE_LIBRARY_CONFIG;
  if (!cfg || !cfg.multiUser) return false;
  if (typeof window.isSyncAdminMode === 'function' && window.isSyncAdminMode()) return false;
  try {
    if (localStorage.getItem('rule_library_sync_admin') === '1') return false;
  } catch (e) { /* ignore */ }
  return true;
}

window.forcePullProvidersFromCloud = async function() {
  if (isMultiUserSyncBlocked()) {
    if (typeof showToast === 'function') showToast('多人协作模式已禁用「以云端为准」');
    else if (typeof alert === 'function') alert('多人协作模式已禁用「以云端为准」。请使用「立即同步」。');
    return;
  }
  if (isCloudSyncing) {
    if (typeof showToast === 'function') showToast('正在同步中，请稍候再试');
    return;
  }
  if (typeof confirm === 'function' && !confirm(
    '将把 Supabase 里 providers 表的<strong>全部行</strong>下载并覆盖写入本机浏览器存储。\n\n本机未上传的修改会丢失。\n\n确定继续？'
  )) {
    return;
  }
  isCloudSyncing = true;
  emitSyncStatus('syncing', '正在从云端强制拉取…');
  try {
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    persistCloudSnapshot('');
    pendingSyncData = null;
    clearRetryTimers();

    var remoteData = await fetchCloudProviders();
    var cnt = (remoteData && remoteData.length) || 0;
    if (cnt === 0) {
      markSyncSuccess('云端为 0 条');
      if (typeof alert === 'function') {
        alert('Supabase 返回 0 条。请到 Supabase 控制台检查表 providers 是否有数据，或 Row Level Security 是否禁止当前密钥读取。');
      }
      return;
    }
    var formatted = remoteData.map(toLocalProvider);
    localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    persistCloudSnapshot(calcSnapshot(formatted));
    notifyProvidersUpdated('cloud-force-pull');
    markSyncSuccess('已从云端写入本地 ' + cnt + ' 条');
    if (typeof updateStats === 'function') updateStats();
    if (typeof showToast === 'function') showToast('已写入 ' + cnt + ' 条，请核对首页数字');
    captureSyncBaselineFromStorage();
  } catch (e) {
    emitSyncStatus('error', String((e && e.message) || e));
    if (typeof alert === 'function') alert(String((e && e.message) || e));
  } finally {
    isCloudSyncing = false;
    flushPendingSync();
  }
};

/**
 * 仅从本机 POST 灌入云端，不执行 DELETE 全表（用于 Supabase 误删后的恢复）。
 * 在网站打开 F12 控制台执行：await forceRestoreLocalProvidersToCloud()
 */
window.forceRestoreLocalProvidersToCloud = async function() {
  if (isMultiUserSyncBlocked()) {
    if (typeof alert === 'function') {
      alert('多人协作模式请在 recover.html 维护页操作，或联系管理员加 ?admin=1');
    }
    return;
  }
  if (typeof confirm === 'function' && !confirm(
    '将把浏览器里 rule_library_providers 的全部数据分批写入 Supabase（不先清空表）。\n\n确定继续？'
  )) {
    return;
  }
  var localData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
  if (!localData.length) {
    if (typeof alert === 'function') alert('本地无数据，无法恢复');
    return;
  }
  isCloudSyncing = true;
  emitSyncStatus('syncing', '正在恢复写入云端 ' + localData.length + ' 条…');
  try {
    var formatted = toCloudProviderListForUpload(localData);
    for (var off = 0; off < formatted.length; off += SYNC_HTTP_CHUNK) {
      var chunk = formatted.slice(off, off + SYNC_HTTP_CHUNK).map(providerRowForDb);
      await httpPostProvidersJson('', chunk, 'return=minimal');
    }
    persistCloudSnapshot(calcSnapshot(formatted));
    lastSyncedRawProvidersStr = JSON.stringify(localData);
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    markSyncSuccess('已恢复写入 ' + formatted.length + ' 条');
    if (typeof showToast === 'function') showToast('已写入 ' + formatted.length + ' 条，请到 Supabase 核对行数');
    if (typeof alert === 'function') alert('已分批写入 ' + formatted.length + ' 条，请到 Supabase Table Editor 核对 providers 行数');
  } catch (e) {
    emitSyncStatus('error', String((e && e.message) || e));
    if (typeof alert === 'function') alert('恢复失败：' + String((e && e.message) || e));
    throw e;
  } finally {
    isCloudSyncing = false;
  }
};

loadPersistedCloudSnapshot();
captureSyncBaselineFromStorage();

/** 覆盖 app.js 的手动同步：先快速探测，必要时再全表拉取 */
window.addEventListener('load', function() {
  window.triggerManualSync = function() {
    if (typeof cloudSync !== 'function') {
      if (typeof showToast === 'function') showToast('同步功能不可用');
      return;
    }
    cloudSync({ quickCheck: true });
    if (typeof showToast === 'function') showToast('已开始同步');
  };
});
