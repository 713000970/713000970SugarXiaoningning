// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';
/** 定时同步间隔：万级数据下全量拉取成本高，适当拉长 */
const CLOUD_SYNC_INTERVAL_MS = 45000;
/** 本机有未传云端修改时，更频繁自动重试上传 */
const CLOUD_DIRTY_RETRY_MS = 12000;
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
/** 本地条数 ≥ 此值且云端可见行数低于本地 × 比例，视为云端不完整（需补全而非整表 DELETE） */
const CLOUD_DEFICIENT_MIN_LOCAL = 100;
const CLOUD_DEFICIENT_RATIO = 0.85;
/** 单次 Supabase 请求超时（毫秒） */
const FETCH_TIMEOUT_MS = 90000;
/** 整轮同步最长耗时，超时则解除锁定 */
const SYNC_WATCHDOG_MS = 180000;

let onCloudSyncReady = null;
let cloudSyncTimer = null;
let isCloudSyncing = false;
let syncWatchdogTimer = null;
let lastCloudSnapshot = '';
/** 上次与云端对齐后的本地 providers JSON（用于增量 diff）；与 localStorage 内容格式一致 */
let lastSyncedRawProvidersStr = null;
let retryTimer = null;
let retryCountdownTimer = null;
let retryRemainSec = 0;
let lastSuccessAt = null;
let pendingSyncData = null;
let dirtyRetryTimer = null;
/** 刚完成补传后短暂跳过定时全量拉取，避免 2377↔2379 死循环 */
let cloudPullCooldownUntil = 0;

function isMultiUserClientSyncMode() {
  var cfg = (typeof window !== 'undefined') ? window.RULE_LIBRARY_CONFIG : null;
  if (!cfg || !cfg.multiUser) return false;
  if (typeof window.isSyncAdminMode === 'function' && window.isSyncAdminMode()) return false;
  return true;
}

function emitSyncStatus(status, message, extra) {
  window.dispatchEvent(new CustomEvent('cloud-sync-status', {
    detail: Object.assign({
      status: status || 'idle',
      message: message || '',
      lastSuccessAt: lastSuccessAt
    }, extra || {})
  }));
}

function fetchWithTimeout(url, options, timeoutMs) {
  timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() {
      reject(new Error('云端请求超时（' + Math.round(timeoutMs / 1000) + ' 秒），请检查网络后点「立即同步」'));
    }, timeoutMs);
    fetch(url, options).then(function(res) {
      clearTimeout(timer);
      resolve(res);
    }).catch(function(err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function clearSyncWatchdog() {
  if (syncWatchdogTimer) {
    clearTimeout(syncWatchdogTimer);
    syncWatchdogTimer = null;
  }
}

function armSyncWatchdog() {
  clearSyncWatchdog();
  syncWatchdogTimer = setTimeout(function() {
    if (!isCloudSyncing) return;
    console.warn('🌥️ 同步耗时过长，强制解除锁定');
    forceResetCloudSync('同步超时，已暂停。数据仍在本地，请点「立即同步」重试');
  }, SYNC_WATCHDOG_MS);
}

/** 解除「一直同步中」锁定（控制台可调用 resetCloudSyncStuck()） */
function forceResetCloudSync(message) {
  isCloudSyncing = false;
  pendingSyncData = null;
  clearRetryTimers();
  clearSyncWatchdog();
  if (typeof window !== 'undefined') {
    window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC = false;
  }
  emitSyncStatus('error', message || '同步已暂停，请稍后重试');
}

window.resetCloudSyncStuck = function() {
  forceResetCloudSync('已手动解除同步锁定');
  if (typeof showToast === 'function') showToast('已解除同步锁定，可继续操作');
};

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

function keepCloudDeficientDirty(localCount, remoteCount, message) {
  var missing = (typeof remoteCount === 'number' && typeof localCount === 'number') ?
    Math.max(0, localCount - remoteCount) :
    null;
  var text = message ||
    (missing !== null && missing > 0 ?
      '云端少 ' + missing + ' 条，待继续同步' :
      '云端未补全，待继续同步');
  try {
    localStorage.setItem(LOCAL_DIRTY_KEY, '1');
  } catch (e) { /* ignore */ }
  emitSyncStatus('error', text, {
    localCount: localCount,
    remoteCount: remoteCount,
    missingCount: missing
  });
}

async function fetchBestEffortCloudCount() {
  var count = await fetchCloudProvidersDeclaredTotal();
  if (typeof count === 'number' && !isNaN(count)) return count;
  try {
    var rows = await fetchCloudProviders();
    if (Array.isArray(rows)) return rows.length;
  } catch (e) {
    console.warn('🌥️ 无法兜底拉取 providers 行数:', e);
  }
  return count;
}

function markUploadVerified(data, message) {
  var formatted = toCloudProviderListForUpload(data);
  persistCloudSnapshot(calcSnapshot(formatted));
  lastSyncedRawProvidersStr = JSON.stringify(data);
  localStorage.setItem(LOCAL_DIRTY_KEY, '0');
  markSyncSuccess(message || '已同步');
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
    album: p.album || '',
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
    album: p.album || '',
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
  var list = toCloudProviderListForUpload(data || []).map(function(item) {
    return toCloudProvider(item || {});
  });
  // 按业务主键排序后再序列化，避免仅顺序不同却误判为「本地/云端不一致」
  list.sort(function(a, b) {
    return providerIdentityKey(a).localeCompare(providerIdentityKey(b), 'zh-Hans-CN');
  });
  return JSON.stringify(list);
}

function normalizeCloudKeyText(value) {
  var s = String(value || '');
  try {
    if (typeof s.normalize === 'function') s = s.normalize('NFKC');
  } catch (e) {
    /* ignore */
  }
  return s
    .replace(/\u00a0/g, ' ')
    .replace(/\u3000/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeCloudEntityKey(value) {
  return normalizeCloudKeyText(value).replace(/[()\uFF08\uFF09\s]/g, '');
}

function providerShopIdentityPart(p) {
  var shop = normalizeCloudEntityKey(p && p.shop);
  var shopname = normalizeCloudEntityKey(p && p.shopname);
  if (!shop) return shopname;
  if (!shopname) return shop;
  if (shop === shopname) return shop;
  if (shop.indexOf(shopname) !== -1) return shop;
  if (shopname.indexOf(shop) !== -1) return shopname;
  return shop + '#' + shopname;
}

function providerIdentityKey(p) {
  var shop = providerShopIdentityPart(p);
  var name = normalizeCloudEntityKey(p && p.name);
  var brand = normalizeCloudKeyText(p && p.brand);
  var series = normalizeCloudKeyText((p && p.series) || '');
  return [shop, name, brand, series].join('|');
}

function providerMergeScoreForCloud(p) {
  if (!p) return 0;
  var score = 0;
  if (isPositiveIntId(p.id)) score += 1;
  ['shop', 'shopname', 'name', 'brand', 'series', 'bbmSeriesId', 'bbmOrgId'].forEach(function(field) {
    if (String((p && p[field]) || '').trim()) score += 1;
  });
  ['album', 'naming', 'split', 'pricing', 'publishTime', 'publishtime', 'specialCase', 'specialcase', 'otherInfo', 'otherinfo'].forEach(function(field) {
    if (String((p && p[field]) || '').trim()) score += 3;
  });
  return score;
}

function mergeLocalProviderForCloud(base, incoming) {
  var baseScore = providerMergeScoreForCloud(base);
  var incomingScore = providerMergeScoreForCloud(incoming);
  var keep = Object.assign({}, incomingScore > baseScore ? incoming : base);
  var fill = incomingScore > baseScore ? base : incoming;
  if (!fill) return keep;
  if (!isPositiveIntId(keep.id) && isPositiveIntId(fill.id)) keep.id = Number(fill.id);
  [
    'shop', 'shopname', 'name', 'brand', 'series',
    'album', 'naming', 'split', 'pricing', 'publishTime',
    'specialCase', 'otherInfo', 'bbmSeriesId', 'bbmOrgId'
  ].forEach(function(field) {
    if (!String(keep[field] || '').trim() && String((fill && fill[field]) || '').trim()) {
      keep[field] = fill[field];
    }
  });
  if (!String(keep.publishTime || '').trim() && String((fill && fill.publishtime) || '').trim()) {
    keep.publishTime = fill.publishtime;
  }
  if (!String(keep.specialCase || '').trim() && String((fill && fill.specialcase) || '').trim()) {
    keep.specialCase = fill.specialcase;
  }
  if (!String(keep.otherInfo || '').trim() && String((fill && fill.otherinfo) || '').trim()) {
    keep.otherInfo = fill.otherinfo;
  }
  return keep;
}

function isEmptyRulePlaceholderProvider(p) {
  if (!p) return true;
  if (String((p && p.series) || '').trim()) return false;
  return !(
    String((p && p.album) || '').trim() ||
    String((p && p.naming) || '').trim() ||
    String((p && p.split) || '').trim() ||
    String((p && p.pricing) || '').trim() ||
    String((p && p.publishTime) || (p && p.publishtime) || '').trim() ||
    String((p && p.specialCase) || (p && p.specialcase) || '').trim() ||
    String((p && p.otherInfo) || (p && p.otherinfo) || '').trim()
  );
}

function canonicalizeProvidersForCloudSync(data) {
  var input = Array.isArray(data) ? data : [];
  var list = [];
  var byKey = new Map();
  var merged = 0;
  var droppedBlank = 0;
  var droppedPlaceholder = 0;

  input.forEach(function(item) {
    if (isEmptyRulePlaceholderProvider(item || {})) {
      droppedPlaceholder += 1;
      return;
    }
    var key = providerIdentityKey(toCloudProvider(item || {}));
    if (!key.replace(/\|/g, '')) {
      droppedBlank += 1;
      return;
    }
    if (!byKey.has(key)) {
      byKey.set(key, list.length);
      list.push(Object.assign({}, item || {}));
      return;
    }
    var idx = byKey.get(key);
    list[idx] = mergeLocalProviderForCloud(list[idx], item || {});
    merged += 1;
  });

  return {
    list: list,
    changed: merged > 0 || droppedBlank > 0 || droppedPlaceholder > 0 || list.length !== input.length,
    merged: merged,
    droppedBlank: droppedBlank,
    droppedPlaceholder: droppedPlaceholder,
    before: input.length,
    after: list.length
  };
}

function normalizeProvidersForCloudSync(data, opts) {
  opts = opts || {};
  var result = canonicalizeProvidersForCloudSync(data);
  if (result.changed && opts.persist !== false) {
    try {
      localStorage.setItem('rule_library_providers', JSON.stringify(result.list));
      localStorage.setItem(LOCAL_DIRTY_KEY, '1');
    } catch (e) { /* ignore */ }
    console.warn('🌥️ 本地规则卡已合并重复/空键：' + result.before + ' → ' + result.after +
      '（重复 ' + result.merged + '，空键 ' + result.droppedBlank + '，占位 ' + result.droppedPlaceholder + '）');
    if (typeof notifyProvidersUpdated === 'function') notifyProvidersUpdated('cloud-local-canonicalize');
    if (typeof updateStats === 'function') updateStats();
  }
  return result;
}

function hasMeaningfulRuleCloud(p) {
  if (!p) return false;
  return !!(
    String(p.album || '').trim() ||
    String(p.naming || '').trim() ||
    String(p.split || '').trim() ||
    String(p.pricing || '').trim() ||
    String(p.publishTime || p.publishtime || '').trim() ||
    String(p.specialCase || p.specialcase || '').trim() ||
    String(p.otherInfo || p.otherinfo || '').trim()
  );
}

/**
 * 从云端拉取时合并本机：保留「仅本机有」或「本机已录入规则、云端仍为空」的行，避免次日打开被旧云端冲掉。
 */
function isCloudCountDeficient(localCount, remoteCount) {
  if (typeof remoteCount !== 'number' || isNaN(remoteCount)) return false;
  if (localCount < CLOUD_DEFICIENT_MIN_LOCAL) return false;
  /** 云端条数少于本机任意一条即视为未齐（避免 2377 vs 2379 误判已同步陷入死循环） */
  if (remoteCount < localCount) return true;
  return remoteCount < localCount * CLOUD_DEFICIENT_RATIO;
}

function verifyCloudCountAtLeast(localCount, remoteCount, message) {
  if (localCount >= CLOUD_DEFICIENT_MIN_LOCAL && (typeof remoteCount !== 'number' || isNaN(remoteCount))) {
    keepCloudDeficientDirty(localCount, remoteCount, message || '无法确认云端行数，待继续同步');
    return false;
  }
  if (isCloudCountDeficient(localCount, remoteCount)) {
    keepCloudDeficientDirty(localCount, remoteCount, message);
    return false;
  }
  return true;
}

function buildRemoteProvidersByKey(remoteRows) {
  var byKey = new Map();
  (remoteRows || []).forEach(function(r) {
    var lp = toLocalProvider(r);
    var k = providerIdentityKey(lp);
    if (!k.replace(/\|/g, '')) return;
    if (!byKey.has(k)) byKey.set(k, lp);
  });
  return byKey;
}

async function deleteCloudProviderIds(ids) {
  var list = (ids || []).filter(isPositiveIntId).map(function(id) { return Number(id); });
  for (var i = 0; i < list.length; i += SYNC_HTTP_CHUNK) {
    var chunk = list.slice(i, i + SYNC_HTTP_CHUNK);
    if (!chunk.length) continue;
    var delRes = await fetchWithTimeout(SUPABASE_URL + '/rest/v1/providers?id=in.(' + chunk.join(',') + ')', {
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
}

async function compactCloudDuplicateProviders(remoteRows) {
  var rows = (remoteRows || []).map(toLocalProvider);
  var groups = new Map();
  rows.forEach(function(row) {
    var key = providerIdentityKey(row);
    if (!key.replace(/\|/g, '')) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  var toDelete = [];
  var toUpdate = [];
  groups.forEach(function(group) {
    if (group.length <= 1) return;
    var keep = group[0];
    group.forEach(function(row) {
      if (providerMergeScoreForCloud(row) > providerMergeScoreForCloud(keep)) keep = row;
    });
    var merged = keep;
    group.forEach(function(row) {
      if (row === keep) return;
      merged = mergeLocalProviderForCloud(merged, row);
      if (isPositiveIntId(row.id)) toDelete.push(Number(row.id));
    });
    if (isPositiveIntId(keep.id)) merged.id = Number(keep.id);
    if (providerContentSignature(merged) !== providerContentSignature(keep)) {
      toUpdate.push(merged);
    }
  });

  if (!toDelete.length && !toUpdate.length) {
    return { ok: true, removed: 0, updated: 0 };
  }

  emitSyncStatus('syncing', '正在清理云端重复规则 ' + toDelete.length + ' 条…');
  for (var i = 0; i < toUpdate.length; i += SYNC_HTTP_CHUNK) {
    var upChunk = toUpdate.slice(i, i + SYNC_HTTP_CHUNK).map(providerRowForDb);
    await httpPostProvidersJson(
      '?on_conflict=id',
      upChunk,
      'resolution=merge-duplicates,return=minimal'
    );
  }
  await deleteCloudProviderIds(toDelete);
  var afterCount = await fetchBestEffortCloudCount();
  return {
    ok: true,
    removed: toDelete.length,
    updated: toUpdate.length,
    remoteCount: afterCount
  };
}

/**
 * 云端行数少于本机时：按业务主键补 INSERT 缺失行、PATCH 本机已录入而云端为空的行。
 * 不 DELETE 全表，避免误删；也不会像 recover 那样盲目 POST 全量造成翻倍。
 */
async function syncProvidersGapFillToCloud(localData, opts) {
  opts = opts || {};
  var normalizedLocal = normalizeProvidersForCloudSync(localData);
  localData = normalizedLocal.list;
  var formatted = toCloudProviderListForUpload(localData);
  var remoteRows = opts.remoteRows;
  if (!remoteRows) {
    remoteRows = await fetchCloudProviders();
  }
  var remoteByKey = buildRemoteProvidersByKey(remoteRows);
  var toInsert = [];
  var toUpsert = [];

  formatted.forEach(function(row) {
    var k = providerIdentityKey(row);
    var remote = remoteByKey.get(k);
    if (!remote) {
      toInsert.push(row);
      return;
    }
    var localSig = providerContentSignature(row);
    var remoteSig = providerContentSignature(remote);
    if (localSig === remoteSig) return;
    var localLp = toLocalProvider(row);
    if (hasMeaningfulRuleCloud(localLp) && (!hasMeaningfulRuleCloud(remote) || localSig !== remoteSig)) {
      var upsert = Object.assign({}, row);
      upsert.id = remote.id;
      toUpsert.push(upsert);
    }
  });

  var opCount = toInsert.length + toUpsert.length;
  if (opCount === 0) {
    var remoteCountNoop = await fetchBestEffortCloudCount();
    if (remoteCountNoop === null && remoteRows) remoteCountNoop = remoteRows.length;
    if (!verifyCloudCountAtLeast(formatted.length, remoteCountNoop)) {
      return {
        ok: false,
        reason: 'still_deficient',
        localCount: formatted.length,
        remoteCount: remoteCountNoop
      };
    }
    markUploadVerified(localData, '已同步');
    return { ok: true, inserted: 0, updated: 0 };
  }

  emitSyncStatus('syncing', '补全云端：新增 ' + toInsert.length + '，更新 ' + toUpsert.length + '…');

  var i;
  for (i = 0; i < toUpsert.length; i += SYNC_HTTP_CHUNK) {
    var upChunk = toUpsert.slice(i, i + SYNC_HTTP_CHUNK).map(providerRowForDb);
    await httpPostProvidersJson(
      '?on_conflict=id',
      upChunk,
      'resolution=merge-duplicates,return=minimal'
    );
  }
  for (i = 0; i < toInsert.length; i += SYNC_HTTP_CHUNK) {
    var insChunk = toInsert.slice(i, i + SYNC_HTTP_CHUNK).map(function(p) {
      return toCloudProviderDbRow(p || {});
    });
    await httpPostProvidersJson('', insChunk, 'return=minimal');
  }

  var newRemoteCount = await fetchBestEffortCloudCount();
  if (!verifyCloudCountAtLeast(formatted.length, newRemoteCount)) {
    console.warn('🌥️ 补全后云端仍不足（' + newRemoteCount + ' / ' + formatted.length + '）');
    return {
      ok: false,
      reason: 'still_deficient',
      inserted: toInsert.length,
      updated: toUpsert.length,
      localCount: formatted.length,
      remoteCount: newRemoteCount
    };
  }
  markUploadVerified(localData, '已补全云端（+' + toInsert.length + ' 更新' + toUpsert.length + '）');
  cloudPullCooldownUntil = Date.now() + 60000;
  console.log('🌥️ 补全完成，云端约 ' + newRemoteCount + ' 条');
  return {
    ok: true,
    inserted: toInsert.length,
    updated: toUpsert.length,
    remoteCount: newRemoteCount
  };
}

function mergeRemoteProvidersPreservingLocal(localRows, remoteRows) {
  var local = (localRows || []).map(toLocalProvider);
  var remote = (remoteRows || []).map(toLocalProvider);
  var byKey = new Map();
  remote.forEach(function(p) {
    byKey.set(providerIdentityKey(p), p);
  });
  var changed = false;

  local.forEach(function(lp) {
    var k = providerIdentityKey(lp);
    if (!k.replace(/\|/g, '')) return;
    var rp = byKey.get(k);
    if (!rp) {
      var keepLocalOnly = hasMeaningfulRuleCloud(lp) ||
        String(lp.series || '').trim() ||
        String(lp.brand || '').trim();
      if (keepLocalOnly) {
        byKey.set(k, lp);
        changed = true;
      }
      return;
    }
    var localSig = providerContentSignature(lp);
    var remoteSig = providerContentSignature(rp);
    if (localSig === remoteSig) return;
    if (hasMeaningfulRuleCloud(lp) && !hasMeaningfulRuleCloud(rp)) {
      byKey.set(k, lp);
      changed = true;
      return;
    }
    if (hasMeaningfulRuleCloud(lp) && hasMeaningfulRuleCloud(rp) && localSig !== remoteSig) {
      byKey.set(k, lp);
      changed = true;
    }
  });

  return { list: Array.from(byKey.values()), changed: changed };
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
    var local = toLocalProvider(item || {});
    if (isPositiveIntId(item && item.id)) local.id = Number(item.id);
    var key = providerIdentityKey(local);
    if (!key.replace(/\|/g, '')) return;
    if (map.has(key)) {
      local = mergeLocalProviderForCloud(toLocalProvider(map.get(key)), local);
    }
    var row = toCloudProvider(local);
    if (isPositiveIntId(local && local.id)) row.id = Number(local.id);
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
    var raw = localStorage.getItem('rule_library_providers');
    var list = raw ? JSON.parse(raw) : [];
    var normalized = normalizeProvidersForCloudSync(list, { persist: false });
    if (normalized.changed && normalized.list.length > 0) {
      raw = JSON.stringify(normalized.list);
      localStorage.setItem('rule_library_providers', raw);
      console.warn('🌥️ 启动时已合并本机重复规则：' + normalized.before + ' → ' + normalized.after);
      if (typeof notifyProvidersUpdated === 'function') notifyProvidersUpdated('cloud-local-startup-canonicalize');
      if (typeof updateStats === 'function') updateStats();
    }
    lastSyncedRawProvidersStr = raw;
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
  var res = await fetchWithTimeout(SUPABASE_URL + PROVIDERS_REST_PATH, { headers: headers });
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
  var res = await fetchWithTimeout(SUPABASE_URL + '/rest/v1/providers' + (pathSuffix || ''), {
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
    var res = await fetchWithTimeout(SUPABASE_URL + '/rest/v1/providers?select=id', {
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

function markCloudStatsReady(count, rawCount) {
  if (typeof window === 'undefined') return;
  window.__RULE_LIB_CLOUD_STATS_READY = true;
  window.__RULE_LIB_WAIT_CLOUD_STATS = false;
  window.__RULE_LIB_CLOUD_EFFECTIVE_COUNT = count;
  window.__RULE_LIB_CLOUD_RAW_COUNT = rawCount;
  try {
    var list = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
    var brandSet = new Set();
    var shopSet = new Set();
    (list || []).forEach(function(p) {
      var brand = normalizeCloudKeyText(p && p.brand);
      var shop = providerShopIdentityPart(p || {});
      if (brand) brandSet.add(brand);
      if (shop) shopSet.add(shop);
    });
    window.__RULE_LIB_CLOUD_BRAND_COUNT = brandSet.size;
    window.__RULE_LIB_CLOUD_SHOP_COUNT = shopSet.size;
  } catch (e) { /* ignore */ }
  if (typeof updateStats === 'function') updateStats();
}

async function pullCloudCanonicalForStats() {
  var remoteData = await fetchCloudProviders();
  if (!remoteData || !remoteData.length) return false;
  var remoteCanonical = normalizeProvidersForCloudSync(remoteData.map(toLocalProvider), { persist: false });
  var formatted = remoteCanonical.list;
  localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
  localStorage.setItem(LOCAL_DIRTY_KEY, '0');
  persistCloudSnapshot(calcSnapshot(formatted));
  lastSyncedRawProvidersStr = JSON.stringify(formatted);
  markCloudStatsReady(formatted.length, remoteCanonical.before);
  notifyProvidersUpdated('cloud-pull-stats');
  markSyncSuccess('已从云端同步有效 ' + formatted.length + ' 条' +
    (remoteCanonical.before !== formatted.length ? '（云端原始 ' + remoteCanonical.before + '）' : ''));
  return true;
}

window.pullCloudCanonicalForStats = pullCloudCanonicalForStats;

// 云同步API - 加载时拉取数据
// opts.fromTimer：定时触发；opts.quickCheck：手动「立即同步」先探测行数/快照；opts.silent：启动同步不打扰顶栏
// opts.forcePull：强制全表拉取（「以云端为准」）
async function applyCloudCanonicalProvidersToLocal(statusPrefix) {
  const latestRemote = await fetchCloudProviders();
  if (!latestRemote || !latestRemote.length) return false;
  var latestCanonical = normalizeProvidersForCloudSync(latestRemote.map(toLocalProvider), { persist: false });
  var latestFormatted = latestCanonical.list;
  var latestSnapshot = calcSnapshot(latestFormatted);
  localStorage.setItem('rule_library_providers', JSON.stringify(latestFormatted));
  localStorage.setItem(LOCAL_DIRTY_KEY, '0');
  persistCloudSnapshot(latestSnapshot);
  lastCloudSnapshot = latestSnapshot;
  lastSyncedRawProvidersStr = JSON.stringify(latestFormatted);
  markCloudStatsReady(latestFormatted.length, latestCanonical.before);
  notifyProvidersUpdated('cloud-pull-canonical-after-upload');
  markSyncSuccess((statusPrefix || '已从云端同步有效 ') + latestFormatted.length + ' 条' +
    (latestCanonical.before !== latestFormatted.length ? '（云端原始 ' + latestCanonical.before + '）' : ''));
  return true;
}

async function cloudSync(opts) {
  if (opts && opts.forcePull && isMultiUserSyncBlocked()) {
    opts = Object.assign({}, opts, { forcePull: false });
  }
  opts = opts || {};
  var fromTimer = !!opts.fromTimer;
  var quickCheck = !!opts.quickCheck;
  var silentStatus = !!opts.silent || fromTimer;
  var cloudCanonicalMode = isMultiUserClientSyncMode();

  if (isCloudSyncing) return;
  if (opts.fromTimer && Date.now() < cloudPullCooldownUntil) {
    if (isLocalProvidersDirty()) {
      var dirtyData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      if (dirtyData.length) {
        await syncToCloud(dirtyData, { reentrant: false, uploadOnly: true });
      }
    } else {
      if (cloudCanonicalMode) {
        return;
      }
      var cleanData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      var cleanNormalize = normalizeProvidersForCloudSync(cleanData, { persist: false });
      var rcCooldown = await fetchBestEffortCloudCount();
      if (!verifyCloudCountAtLeast(cleanNormalize.list.length, rcCooldown)) {
        await syncToCloud(cleanNormalize.list, { reentrant: false, forcePushUpload: true });
        return;
      }
      markSyncSuccess('已同步');
    }
    return;
  }
  isCloudSyncing = true;
  armSyncWatchdog();
  if (typeof window !== 'undefined') {
    window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC = true;
  }
  clearRetryTimers();
  if (!silentStatus) {
    emitSyncStatus('syncing', '同步中...');
  }
  try {
    console.log('🌥️ 开始同步云端数据...');
    const localProvidersRaw = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
    const localDirtyBeforeNormalize = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';
    const localNormalize = normalizeProvidersForCloudSync(localProvidersRaw, { persist: false });
    const localProviders = localNormalize.list;
    if (localNormalize.changed && localProviders.length > 0) {
      localStorage.setItem('rule_library_providers', JSON.stringify(localProviders));
      localStorage.setItem(LOCAL_DIRTY_KEY, localDirtyBeforeNormalize ? '1' : '0');
      console.warn('🌥️ 已显示本机有效规则：' + localNormalize.before + ' → ' + localNormalize.after +
        '（合并重复 ' + localNormalize.merged + '，空键 ' + localNormalize.droppedBlank + '）');
      notifyProvidersUpdated('cloud-local-canonicalize-readonly');
      if (typeof updateStats === 'function') updateStats();
    }
    const localDirty = localDirtyBeforeNormalize;
    const cloudCanonical = isMultiUserClientSyncMode();

    /** 本地有待传：直接上传，不再先拉 2000+ 行（删改卡后最常见） */
    if (localDirty && !opts.forcePull) {
      emitSyncStatus('syncing', '正在上传本地变更…');
      var dirtyUpload = await syncToCloud(localProviders, { reentrant: true });
      if (cloudCanonicalMode && dirtyUpload && dirtyUpload.ok) {
        await applyCloudCanonicalProvidersToLocal('已上传并从云端同步有效 ');
      }
      if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
      return;
    }

    if (!cloudCanonical && !opts.forcePull && localProviders.length > 0) {
      var rcQuick = await fetchBestEffortCloudCount();
      if (typeof rcQuick === 'number' && rcQuick < localProviders.length) {
        console.warn('🌥️ 同步预检发现云端不足（' + rcQuick + ' / ' + localProviders.length + '），开始补传');
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        emitSyncStatus('syncing', '云端少 ' + (localProviders.length - rcQuick) + ' 条，自动补传中…');
        await syncToCloud(localProviders, { reentrant: true, forcePushUpload: true });
        if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
        return;
      }
      if (typeof rcQuick === 'number' && rcQuick > localProviders.length) {
        console.warn('🌥️ 云端原始行数多于本机有效规则（' + rcQuick + ' / ' + localProviders.length + '），继续拉取并按有效规则合并显示');
      }
    }

    if (fromTimer && localDirty) {
      const localProvidersNowRaw = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      const localProvidersNow = normalizeProvidersForCloudSync(localProvidersNowRaw, { persist: false }).list;
      localStorage.setItem(LOCAL_DIRTY_KEY, '1');
      queuePendingSync(localProvidersNow);
      notifyProvidersUpdated('cloud-timer-skip-pull');
      emitSyncStatus('syncing', '本地有待回传，已排队');
      return;
    }

    /** 打开页面 / 定时 / 手动同步：本地干净且快照一致时，仅探测行数即可 */
    var tryFastSkip = !cloudCanonical && !localDirty && !opts.forcePull;
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
      var declaredEmpty = await fetchBestEffortCloudCount();
      var localDirtyNow = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';

      /** 本地有待上传：直接增量/上传，不因「读不到云端」而拦截 */
      if (localDirtyNow && localData.length > 0) {
        emitSyncStatus('syncing', '正在上传本地变更…');
        await syncToCloud(localData, { reentrant: true, forcePushUpload: true });
        if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
        return;
      }

      /** 读不到行数（多为 RLS/API），不是「云端真为空」 */
      if (declaredEmpty === null && localData.length > BLOCK_UPLOAD_WHEN_REMOTE_EMPTY_MIN_LOCAL) {
        var rlsMsg =
          '无法读取云端 providers（显示为 0 不可读），本地 ' + localData.length + ' 条已保留。\n\n' +
          '请在 Supabase → SQL Editor 运行 providers-fix-rls-only.sql，然后点「立即同步」。\n' +
          '（不要执行整表 DELETE；新增店铺保存后也会自动标为待上传）';
        console.error('🌥️ ' + rlsMsg);
        emitSyncStatus('error', '无法读取云端，请修复 RLS');
        if (typeof alert === 'function') alert(rlsMsg);
        return;
      }

      if (localData.length > BLOCK_UPLOAD_WHEN_REMOTE_EMPTY_MIN_LOCAL && !opts.forcePushUpload) {
        var msg = '云端拉取为 ' + declaredEmpty + ' 条，本地有 ' + localData.length +
          ' 条，已阻止自动整库上传以免误删云端。\n\n若你刚新增规则，请先修复 RLS 再点「立即同步」。';
        console.error('🌥️ ' + msg);
        emitSyncStatus('error', '已阻止自动上传');
        if (typeof alert === 'function') alert(msg);
        return;
      }
      console.log('🌥️ 云端拉取为 0 条，从本地上传...');
      if (localData.length > 0) {
        await syncToCloud(localData, { reentrant: true, forcePushUpload: true });
      }
    } else {
      // 远程有数据，先转回驼峰并按业务键去重，避免云端重复行把各设备首页数字放大
      var remoteCanonical = normalizeProvidersForCloudSync(remoteData.map(toLocalProvider), { persist: false });
      const formatted = remoteCanonical.list;
      const remoteSnapshot = calcSnapshot(formatted);
      const localProvidersNowRaw = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      const localProvidersNowCanonical = normalizeProvidersForCloudSync(localProvidersNowRaw, { persist: false });
      const localProvidersNow = localProvidersNowCanonical.list;
      /** fetch 期间 DOMContentLoaded 可能已 setData，必须在拉取结束后再读 dirty */
      var localDirtyAfterFetch = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';
      if (localProvidersNowCanonical.changed && localProvidersNow.length > 0) {
        localStorage.setItem('rule_library_providers', JSON.stringify(localProvidersNow));
        localStorage.setItem(LOCAL_DIRTY_KEY, localDirtyAfterFetch ? '1' : '0');
        notifyProvidersUpdated('cloud-local-canonicalize-fetch');
        if (typeof updateStats === 'function') updateStats();
      }
      const localSnapshotNow = calcSnapshot(localProvidersNow);

      if (cloudCanonical && !localDirtyAfterFetch) {
        localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
        localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        persistCloudSnapshot(remoteSnapshot);
        lastSyncedRawProvidersStr = JSON.stringify(formatted);
        markCloudStatsReady(formatted.length, remoteCanonical.before);
        if (remoteSnapshot !== localSnapshotNow || formatted.length !== localProvidersNow.length) {
          notifyProvidersUpdated('cloud-pull-canonical');
        }
        markSyncSuccess('已从云端同步有效 ' + formatted.length + ' 条' + (remoteCanonical.before !== formatted.length ? '（云端原始 ' + remoteCanonical.before + '）' : ''));
        console.log('🌥️ 多人协作：已按云端覆盖本机 providers，本机 ' + localProvidersNow.length + ' → 云端有效 ' + formatted.length + '（原始 ' + remoteCanonical.before + '）');
        if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
        return;
      }

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
        emitSyncStatus('syncing', '检测到本地变更，正在回传云端');
        return;
      }

      // 仍有 dirty 标记但快照与云端一致（极少见）：也不要用远程整表覆盖本地，以免冲掉刚写入尚未反映到快照的变更
      if (localDirtyAfterFetch) {
        console.log('🌥️ 本地有待同步标记，保留本地数据并排队回传');
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        queuePendingSync(localProvidersNow);
        notifyProvidersUpdated('cloud-local-dirty');
        emitSyncStatus('syncing', '本地待同步，正在回传云端');
        return;
      }

      /** 云端条数少于本机：自动补全缺失行（不覆盖本机、不 DELETE 全表） */
      if (isCloudCountDeficient(localProvidersNow.length, formatted.length)) {
        console.warn('🌥️ 云端仅 ' + formatted.length + ' 条，本机 ' + localProvidersNow.length + ' 条，尝试补全…');
        emitSyncStatus('syncing', '云端少 ' + (localProvidersNow.length - formatted.length) + ' 条，正在补全…');
        try {
          var gapPull = await syncProvidersGapFillToCloud(localProvidersNow, { remoteRows: remoteData });
          if (gapPull && gapPull.ok) {
            notifyProvidersUpdated('cloud-gap-fill');
            markSyncSuccess('云端已补全（+' + (gapPull.inserted || 0) + ' 条）');
            if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
            return;
          }
        } catch (gapPullErr) {
          console.error('🌥️ 自动补全失败:', gapPullErr);
        }
        var blockMsg = '已阻止同步：云端仅 ' + formatted.length + ' 条，本机有 ' + localProvidersNow.length +
          ' 条。自动补全未成功，请点「立即同步」重试，或打开 recover.html 手动恢复。';
        console.error('🌥️ ' + blockMsg);
        keepCloudDeficientDirty(localProvidersNow.length, formatted.length, '云端少 ' + (localProvidersNow.length - formatted.length) + ' 条，补全失败');
        if (typeof alert === 'function') alert(blockMsg);
        queuePendingSync(localProvidersNow);
        return;
      }

      var mergeResult = mergeRemoteProvidersPreservingLocal(localProvidersNow, formatted);
      localStorage.setItem('rule_library_providers', JSON.stringify(mergeResult.list));
      if (mergeResult.changed) {
        console.log('🌥️ 合并云端时保留了本机已录入规则，将回传云端');
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
        emitSyncStatus('syncing', '正在回传本地变更…');
        try {
          var gapMerge = await syncProvidersGapFillToCloud(mergeResult.list, { remoteRows: remoteData });
          if (gapMerge && gapMerge.ok) {
            notifyProvidersUpdated('cloud-merge-local-edits');
            markSyncSuccess('已上传本地变更（新增 ' + (gapMerge.inserted || 0) + '，更新 ' + (gapMerge.updated || 0) + '）');
            if (typeof onCloudSyncReady === 'function') onCloudSyncReady();
            return;
          }
        } catch (gapMergeErr) {
          console.error('🌥️ 合并后补传失败:', gapMergeErr);
        }
        queuePendingSync(mergeResult.list);
        notifyProvidersUpdated('cloud-merge-local-edits');
        emitSyncStatus('syncing', '已保留本机录入，正在回传云端');
      } else {
        localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        persistCloudSnapshot(calcSnapshot(mergeResult.list));
        if (remoteSnapshot !== localSnapshotNow) {
          notifyProvidersUpdated('cloud-pull');
        }
        markSyncSuccess('已同步有效 ' + mergeResult.list.length + ' 条' + (remoteCanonical.before !== formatted.length ? '（云端原始 ' + remoteCanonical.before + '）' : ''));
        console.log('🌥️ 已从云端同步有效数据，本地更新为 ' + mergeResult.list.length + ' 条');
      }
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
    clearSyncWatchdog();
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

/** 仅推送相对上次基线的新增/修改，不 DELETE 云端行（RLS 异常或本地 dirty 时用） */
async function syncProvidersPushLocalChangesOnly(data, opts) {
  opts = opts || {};
  var normalizedLocal = normalizeProvidersForCloudSync(data);
  data = normalizedLocal.list;
  var formatted = toCloudProviderListForUpload(data);
  var baselineFmt = [];
  if (lastSyncedRawProvidersStr) {
    try {
      baselineFmt = toCloudProviderListForUpload(JSON.parse(lastSyncedRawProvidersStr));
    } catch (e) { /* ignore */ }
  }
  if (!baselineFmt.length && formatted.length >= CLOUD_DEFICIENT_MIN_LOCAL) {
    console.warn('🌥️ 无同步基线，改用业务键补写/更新，避免把本机全量作为新行插入云端');
    var gapNoBaseline = await syncProvidersGapFillToCloud(data);
    return !!(gapNoBaseline && gapNoBaseline.ok);
  }
  var delta = computeProviderSyncDelta(baselineFmt, formatted);
  delta.deletes = [];
  var opCount = delta.upserts.length + delta.insertsNoId.length;
  if (opCount <= 0) {
    if (opts.skipCountVerify) {
      markUploadVerified(data, '已同步');
      return true;
    }
    var rcZero = await fetchBestEffortCloudCount();
    if (!verifyCloudCountAtLeast(formatted.length, rcZero)) {
      var gapZero = await syncProvidersGapFillToCloud(data);
      return !!(gapZero && gapZero.ok);
    }
    markUploadVerified(data, '已同步');
    return true;
  }
  await syncProvidersIncrementalApply(delta);
  var stored = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
  var storedFmt = toCloudProviderListForUpload(stored);
  if (opts.skipCountVerify) {
    markUploadVerified(stored, '已上传 ' + opCount + ' 项变更');
    return true;
  }
  var rcPush = await fetchBestEffortCloudCount();
  if (!verifyCloudCountAtLeast(storedFmt.length, rcPush)) {
    var gapPush = await syncProvidersGapFillToCloud(stored);
    if (!gapPush || !gapPush.ok) {
      keepCloudDeficientDirty(storedFmt.length, rcPush, '已上传部分，云端仍不足');
      return false;
    }
  }
  markUploadVerified(stored, '已上传 ' + opCount + ' 项变更');
  return true;
}

/**
 * 整表 DELETE + POST（大批量变更或增量失败时回退）
 */
async function syncProvidersFullTableReplace(data, options) {
  options = options || {};
  var normalizedLocal = normalizeProvidersForCloudSync(data);
  data = normalizedLocal.list;
  const formatted = toCloudProviderListForUpload(data);
  const nextSnapshot = calcSnapshot(formatted);

  var remoteCount = await fetchBestEffortCloudCount();
  if (isMultiUserClientSyncMode()) {
    console.warn('🌥️ 多人协作普通设备已禁止整表替换，改为仅补写/更新本机变更');
    return await syncProvidersPushLocalChangesOnly(data);
  }
  if ((remoteCount === null && formatted.length > BLOCK_UPLOAD_WHEN_REMOTE_EMPTY_MIN_LOCAL) ||
      (options.forcePushUpload && (remoteCount === null || remoteCount === 0))) {
    console.warn('🌥️ 云端不可读或为空，跳过整表 DELETE，仅推送本地变更');
    return await syncProvidersPushLocalChangesOnly(data);
  }
  if (isCloudCountDeficient(formatted.length, remoteCount)) {
    console.warn('🌥️ 整表替换已拦截（云端 ' + remoteCount + ' / 本地 ' + formatted.length + '），改走补全上传');
    var gapReplace = await syncProvidersGapFillToCloud(data, options);
    return !!(gapReplace && gapReplace.ok);
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

  var remoteCountAfterReplace = await fetchBestEffortCloudCount();
  if (!verifyCloudCountAtLeast(formatted.length, remoteCountAfterReplace)) {
    console.warn('🌥️ 整表上传后云端仍不足（' + remoteCountAfterReplace + ' / ' + formatted.length + '）');
    return false;
  }
  markUploadVerified(data, '已同步');
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
    var remoteCountInc = await fetchBestEffortCloudCount();
    if (!verifyCloudCountAtLeast(formatted.length, remoteCountInc)) {
      return false;
    }
    markUploadVerified(data, '已同步');
    return true;
  }
  if (opCount > INCREMENTAL_MAX_CHANGES || opCount >= formatted.length * 0.95) {
    return false;
  }
  await syncProvidersIncrementalApply(delta);
  if (delta.insertsNoId.length > 0) {
    var remoteList = await fetchCloudProviders();
    if (!verifyCloudCountAtLeast(formatted.length, remoteList.length)) {
      return false;
    }
    var locFmt = remoteList.map(toLocalProvider);
    localStorage.setItem('rule_library_providers', JSON.stringify(locFmt));
    notifyProvidersUpdated('cloud-incremental-refresh');
  }
  var stored = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
  var storedFmt = toCloudProviderListForUpload(stored);
  var remoteCountAfterInc = await fetchBestEffortCloudCount();
  if (!verifyCloudCountAtLeast(storedFmt.length, remoteCountAfterInc)) {
    return false;
  }
  markUploadVerified(stored, '已增量同步（' + opCount + ' 项）');
  return true;
}

// 保存数据后自动同步到云端
async function syncToCloudImpl(data, options) {
    options = options || {};
    console.log('🌥️ 同步到云端...', (data || []).length, '条');

    var normalizedLocal = normalizeProvidersForCloudSync(data);
    data = normalizedLocal.list;
    const formatted = toCloudProviderListForUpload(data);

    if (isMultiUserClientSyncMode() && !options.allowFullReplace) {
      var pushOnly = await syncProvidersPushLocalChangesOnly(data, { skipCountVerify: true });
      if (pushOnly) return;
      throw new Error('multi_user_push_only_failed');
    }

    if (options.uploadOnly) {
      var gapOnly = await syncProvidersGapFillToCloud(data);
      if (gapOnly && gapOnly.ok) return;
      throw new Error('sync_upload_only_failed');
    }

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
      var remoteCountSnap = await fetchBestEffortCloudCount();
      if (typeof remoteCountSnap === 'number' && remoteCountSnap >= formatted.length) {
        markUploadVerified(data, '已同步');
        return;
      }
      console.warn('🌥️ 快照一致但云端仅 ' + remoteCountSnap + ' 条，本机 ' + formatted.length + ' 条，需补全');
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

    if (options.forcePushUpload) {
      var pushedOnly = await syncProvidersPushLocalChangesOnly(data);
      if (pushedOnly) {
        var rcAfterPush = await fetchBestEffortCloudCount();
        if (verifyCloudCountAtLeast(formatted.length, rcAfterPush)) return;
        console.warn('🌥️ 增量推送后云端仍不足（' + rcAfterPush + ' / ' + formatted.length + '），继续补全');
      }
    }

    var ok = await syncProvidersFullTableReplace(data, options);
    if (!ok) {
      var gapUpload = await syncProvidersGapFillToCloud(data);
      if (gapUpload && gapUpload.ok) return;
      throw new Error('sync_upload_failed');
    }
}

function isLocalProvidersDirty() {
  try {
    return localStorage.getItem(LOCAL_DIRTY_KEY) === '1';
  } catch (e) {
    return false;
  }
}

async function syncToCloud(data, options) {
  options = options || {};
  if (isCloudSyncing && !options.reentrant) {
    queuePendingSync(data);
    emitSyncStatus('syncing', '同步排队中...');
    return { ok: false, queued: true };
  }
  var manageLock = !options.reentrant;
  if (manageLock) {
    isCloudSyncing = true;
    armSyncWatchdog();
    clearRetryTimers();
    emitSyncStatus('syncing', '正在上传…');
  }
  try {
    await syncToCloudImpl(data, options);
    var ok = !isLocalProvidersDirty();
    if (!ok) {
      scheduleRetry();
    }
    return { ok: ok };
  } catch (e) {
    console.error('🌥️ 同步失败:', e);
    scheduleRetry();
    return { ok: false, error: String((e && e.message) || e) };
  } finally {
    if (manageLock) {
      isCloudSyncing = false;
      clearSyncWatchdog();
      flushPendingSync();
    }
  }
}

window.syncProvidersToCloud = syncToCloud;
window.isLocalProvidersDirty = isLocalProvidersDirty;

function startDirtyAutoRetry() {
  if (dirtyRetryTimer) return;
  dirtyRetryTimer = setInterval(function() {
    if (!isLocalProvidersDirty() || isCloudSyncing) return;
    var data;
    try {
      data = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
    } catch (e) {
      return;
    }
    if (!data.length) return;
    emitSyncStatus('syncing', '后台自动上传…');
    syncToCloud(data, { reentrant: false });
  }, CLOUD_DIRTY_RETRY_MS);
}

function startCloudAutoSync() {
  if (cloudSyncTimer) return;
  cloudSyncTimer = setInterval(function() {
    cloudSync({ fromTimer: true });
  }, CLOUD_SYNC_INTERVAL_MS);
  startDirtyAutoRetry();
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
    var remoteCanonical = normalizeProvidersForCloudSync(remoteData.map(toLocalProvider), { persist: false });
    var formatted = remoteCanonical.list;
    localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
    localStorage.setItem(LOCAL_DIRTY_KEY, '0');
    persistCloudSnapshot(calcSnapshot(formatted));
    notifyProvidersUpdated('cloud-force-pull');
    markSyncSuccess('已从云端写入本地 ' + formatted.length + ' 条' + (remoteCanonical.merged ? '（合并重复 ' + remoteCanonical.merged + '）' : ''));
    if (typeof updateStats === 'function') updateStats();
    if (typeof showToast === 'function') showToast('已写入有效规则 ' + formatted.length + ' 条' + (cnt !== formatted.length ? '（云端原始 ' + cnt + '）' : ''));
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
  var localData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
  if (!localData.length) {
    if (typeof alert === 'function') alert('本地无数据，无法恢复');
    return;
  }
  if (typeof confirm === 'function' && !confirm(
    '将把本机缺失的规则补写入 Supabase（不 DELETE 全表、不重复已有行）。\n\n本机 ' + localData.length + ' 条，确定继续？'
  )) {
    return;
  }
  isCloudSyncing = true;
  emitSyncStatus('syncing', '正在补全云端 ' + localData.length + ' 条…');
  try {
    var gapRestore = await syncProvidersGapFillToCloud(localData);
    if (!gapRestore || !gapRestore.ok) {
      throw new Error((gapRestore && gapRestore.reason) || 'gap_fill_failed');
    }
    if (typeof showToast === 'function') {
      showToast('已补全 +' + (gapRestore.inserted || 0) + ' 条，云端约 ' + (gapRestore.remoteCount || '?') + ' 条');
    }
    if (typeof alert === 'function') {
      alert('补全完成：新增 ' + (gapRestore.inserted || 0) + ' 条，更新 ' + (gapRestore.updated || 0) +
        ' 条。请到 Supabase 核对 providers 行数。');
    }
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
