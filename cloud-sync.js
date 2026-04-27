// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';
const CLOUD_SYNC_INTERVAL_MS = 10000;
const CLOUD_RETRY_DELAY_MS = 5000;

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
  return JSON.stringify((data || []).map(toCloudProvider));
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
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    
    if (!res.ok) {
      console.error('请求失败:', res.status);
      scheduleRetry();
      return;
    }
    
    const remoteData = await res.json();
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
      const localProviders = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      const localSnapshot = calcSnapshot(localProviders);

      // 本地有尚未上云的新数据时，不用远程覆盖本地，改为排队回传本地
      if (localSnapshot !== lastCloudSnapshot && localSnapshot !== remoteSnapshot) {
        console.log('🌥️ 检测到本地未同步的新数据，保留本地并排队回传云端');
        queuePendingSync(localProviders);
        markSyncSuccess('检测到本地新数据，已排队回传');
        return;
      }

      localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
      lastCloudSnapshot = remoteSnapshot;
      if (remoteSnapshot !== localSnapshot) {
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
    console.log('🌥️ 同步到云端...', data.length, '条');
    
    // 全量覆盖，确保删除也能同步到云端（最后写入生效）
    const formatted = (data || []).map(toCloudProvider);
    const nextSnapshot = JSON.stringify(formatted);
    if (nextSnapshot === lastCloudSnapshot) {
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