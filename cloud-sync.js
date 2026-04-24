// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';

let onCloudSyncReady = null;

// 云同步API - 加载时拉取数据
async function cloudSync() {
  try {
    console.log('🌥️ 开始同步云端数据...');
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers?select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    
    if (!res.ok) {
      console.error('请求失败:', res.status);
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
      const formatted = remoteData.map(function(p) {
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
      });
      localStorage.setItem('rule_library_providers', JSON.stringify(formatted));
      console.log('🌥️ 已从云端同步数据，本地更新');
    }
    
    // 同步完成回调
    if (typeof onCloudSyncReady === 'function') {
      onCloudSyncReady();
    }
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
  }
}

// 保存数据后自动同步到云端
async function syncToCloud(data) {
  try {
    console.log('🌥️ 同步到云端...', data.length, '条');
    
    // 转为小写字段上传
    const formatted = data.map(function(p) {
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
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(formatted)
    });
    
    if (res.ok) {
      console.log('🌥️ 已同步到云端');
    } else {
      const errText = await res.text();
      console.error('🌥️ 同步失败:', res.status, errText);
    }
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
  }
}