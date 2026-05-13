// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';
const CLOUD_SYNC_INTERVAL_MS = 10000;
const CLOUD_RETRY_DELAY_MS = 5000;
const LOCAL_DIRTY_KEY = 'rule_library_local_dirty';

let onCloudSyncReady = null;
let cloudSyncTimer = null;
let isCloudSyncing = false;
let lastCloudSnapshot = '';
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
    shopname: p.shopname || '',
    name: p.name || '',
    brand: p.brand || '',
    series: p.series || '',
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
    split: p.split || '',
    pricing: p.pricing || '',
    publishtime: p.publishTime || p.publishtime || '',
    specialcase: p.specialCase || p.specialcase || '',
    otherinfo: p.otherInfo || p.otherinfo || ''
  };
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

/** 将当前内存中的规则列表转为上传用行，并按主键去重（后者覆盖前者） */
function toCloudProviderListForUpload(data) {
  var map = new Map();
  (data || []).forEach(function(item) {
    var c = toCloudProvider(item || {});
    var key = providerIdentityKey(c);
    if (!key.replace(/\|/g, '')) return;
    map.set(key, c);
  });
  return Array.from(map.values());
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

  if (totalHint === 0) return [];

  if (typeof totalHint === 'number' && totalHint > 0) {
    while (all.length < totalHint) {
      var from = all.length;
      var to = Math.min(from + pageSize - 1, totalHint - 1);
      var res = await fetch(SUPABASE_URL + '/rest/v1/providers?select=*', {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Range-Unit': 'items',
          'Range': from + '-' + to,
          'Prefer': 'count=exact'
        }
      });
      if (!res.ok) {
        var errText = await res.text();
        throw new Error('拉取云端失败: ' + res.status + ' ' + errText);
      }
      var rows = await res.json();
      var list = Array.isArray(rows) ? rows : [];
      if (list.length === 0) {
        console.warn('🌥️ Content-Range 声明 ' + totalHint + ' 条，但从下标 ' + from + ' 起无行，提前结束（请检查 max-rows / 代理截断）');
        break;
      }
      all = all.concat(list);
    }
    return all;
  }

  /** 拿不到总数时：用每页 Content-Range，避免「本页未满 1000」误判为已拉完（服务端 max-rows 小于请求的 Range 时会发生） */
  var from = 0;
  var declaredTotal = null;
  while (true) {
    var to = from + pageSize - 1;
    var res = await fetch(SUPABASE_URL + '/rest/v1/providers?select=*', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Range-Unit': 'items',
        'Range': from + '-' + to,
        'Prefer': 'count=exact'
      }
    });
    if (!res.ok) {
      var errText = await res.text();
      throw new Error('拉取云端失败: ' + res.status + ' ' + errText);
    }

    var rows = await res.json();
    var list = Array.isArray(rows) ? rows : [];
    var cr = res.headers.get('content-range') || res.headers.get('Content-Range');
    var parsed = parseContentRangeItems(cr);
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
async function cloudSync() {
  if (isCloudSyncing) return;
  isCloudSyncing = true;
  clearRetryTimers();
  emitSyncStatus('syncing', '同步中...');
  try {
    console.log('🌥️ 开始同步云端数据...');
    const localProviders = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
    const localSnapshot = calcSnapshot(localProviders);
    const localDirty = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';

    const remoteData = await fetchCloudProviders();
    console.log('🌥️ 云端数据:', remoteData);
    
    if (!remoteData || remoteData.length === 0) {
      // 远程为空，从本地上传
      console.log('🌥️ 云端无数据，从本地上传...');
      const localData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      
      if (localData.length > 0) {
        const formatted = localData.map(function(p) {
          return {
            shop: p.shop || '',
            shopname: p.shopname || '',
            name: p.name || '',
            brand: p.brand || '',
            series: p.series || '',
            split: p.split || '',
            pricing: p.pricing || '',
            publishtime: p.publishTime || '',
            specialcase: p.specialCase || '',
            otherinfo: p.otherInfo || ''
          };
        });
        await syncToCloud(formatted);
      }
    } else {
      // 远程有数据，转回驼峰后更新本地
      const formatted = remoteData.map(toLocalProvider);
      const remoteSnapshot = calcSnapshot(formatted);
      const localProvidersNow = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      const localSnapshotNow = calcSnapshot(localProvidersNow);

      // lastCloudSnapshot 仅在内存中，刷新后会清空；须结合 localDirty，否则会每次打开都误判「并发」并全量回传
      var localEdited =
        localDirty ||
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
      if (localDirty) {
        console.log('🌥️ 本地有待同步标记，保留本地数据并排队回传');
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        queuePendingSync(localProvidersNow);
        notifyProvidersUpdated('cloud-local-dirty');
        markSyncSuccess('本地待同步，已排队回传云端');
        return;
      }

      localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
      localStorage.setItem(LOCAL_DIRTY_KEY, '0');
      lastCloudSnapshot = remoteSnapshot;
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
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
    scheduleRetry();
  } finally {
    isCloudSyncing = false;
    flushPendingSync();
  }
}

// 保存数据后自动同步到云端
async function syncToCloud(data) {
  if (isCloudSyncing) {
    queuePendingSync(data);
    emitSyncStatus('syncing', '同步排队中...');
    return;
  }
  isCloudSyncing = true;
  clearRetryTimers();
  emitSyncStatus('syncing', '同步中...');
  try {
    console.log('🌥️ 同步到云端...', (data || []).length, '条');
    
    // 整表替换上传：必须以本次传入的本地列表为准，否则与云端 merge 会把「仅云端仍有」的已删行再次 POST 上去
    const formatted = toCloudProviderListForUpload(data);
    // 首屏 cleanup 等竞态可能把本地写成 [] 后立即同步，会 DELETE 掉云端上千条；若云端仍大量有数据则中止并拉回本地
    if (formatted.length === 0) {
      const remoteRows = await fetchCloudProviders();
      const remoteCount = (remoteRows && remoteRows.length) || 0;
      if (remoteCount > 200) {
        console.error('🌥️ 已阻止用空列表覆盖云端（云端 ' + remoteCount + ' 条），疑为误清空，已从云端恢复本地。');
        localStorage.setItem('rule_library_providers', JSON.stringify(remoteRows.map(toLocalProvider)));
        localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        lastCloudSnapshot = calcSnapshot(remoteRows.map(toLocalProvider));
        notifyProvidersUpdated('cloud-recovered-from-empty-sync');
        markSyncSuccess('已阻止误清空，已从云端恢复');
        return;
      }
    }
    const nextSnapshot = JSON.stringify(formatted);
    if (nextSnapshot === lastCloudSnapshot) {
      localStorage.setItem(LOCAL_DIRTY_KEY, '0');
      markSyncSuccess('已同步');
      return;
    }

    const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/providers?id=gt.0`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!deleteRes.ok) {
      const deleteErrText = await deleteRes.text();
      console.error('🌥️ 清空云端失败:', deleteRes.status, deleteErrText);
      scheduleRetry();
      return;
    }
    
    if (formatted.length === 0) {
      lastCloudSnapshot = nextSnapshot;
      localStorage.setItem(LOCAL_DIRTY_KEY, '0');
      markSyncSuccess('已同步');
      console.log('🌥️ 已同步到云端');
      return;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formatted)
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error('🌥️ 同步失败:', res.status, errText);
      scheduleRetry();
      return;
    }

    lastCloudSnapshot = nextSnapshot;
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    markSyncSuccess('已同步');
    console.log('🌥️ 已同步到云端');
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
    scheduleRetry();
  } finally {
    isCloudSyncing = false;
    flushPendingSync();
  }
}

function startCloudAutoSync() {
  if (cloudSyncTimer) return;
  cloudSyncTimer = setInterval(function() {
    cloudSync();
  }, CLOUD_SYNC_INTERVAL_MS);
}

/**
 * 直接把云端 providers 全表写入本机（绕过 cloudSync 的分支判断，避免一直合并不了远程全量）。
 * 慎用：本机未上传的修改会丢失。
 */
window.forcePullProvidersFromCloud = async function() {
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
    lastCloudSnapshot = '';
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
    lastCloudSnapshot = calcSnapshot(formatted);
    notifyProvidersUpdated('cloud-force-pull');
    markSyncSuccess('已从云端写入本地 ' + cnt + ' 条');
    if (typeof updateStats === 'function') updateStats();
    if (typeof showToast === 'function') showToast('已写入 ' + cnt + ' 条，请核对首页数字');
  } catch (e) {
    emitSyncStatus('error', String((e && e.message) || e));
    if (typeof alert === 'function') alert(String((e && e.message) || e));
  } finally {
    isCloudSyncing = false;
    flushPendingSync();
  }
};