// 云同步配置
const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';

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
      const brands = JSON.parse(localStorage.getItem('rule_library_brands') || '[]');
      if (localData.length > 0) {
        // 格式化数据（去掉id让Supabase自动生成）
        const formatted = localData.map((p, i) => ({
          shop: p.shop || '',
          shopname: p.shopname || '',
          name: p.name || '',
          brand: p.brand || '',
          series: p.series || '',
          split: p.split || '',
          pricing: p.pricing || '',
          publishTime: p.publishTime || '',
          specialCase: p.specialCase || '',
          otherInfo: p.otherInfo || ''
        }));
        
        await syncToCloud(formatted);
      }
    } else {
      // 远程有数据，更新本地
      localStorage.setItem('rule_library_providers', JSON.stringify(remoteData));
      console.log('🌥️ 已从云端同步数据，本地更新');
    }
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
  }
}

// 保存数据后自动同步到云端
async function syncToCloud(data) {
  try {
    console.log('🌥️ 同步到云端...', data.length, '条');
    
    // 直接插入（不清空，因为Supabase会处理重复）
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      console.log('🌥️ 已同步到云端');
    } else {
      console.error('🌥️ 同步失败:', res.status);
    }
  } catch(e) {
    console.error('🌥️ 同步失败:', e);
  }
}
    
    const remoteData = await res.json();
    console.log('🌥️ 云端数据:', remoteData);
    
    if (!remoteData || remoteData.length === 0) {
      // 远程为空
      console.log('🌥️ 云端无数据');
      const localData = JSON.parse(localStorage.getItem('rule_library_providers') || '[]');
      if (localData.length > 0) {
        await syncToCloud(localData);
      }
    } else {
      // 远程有数据，更新本地
      localStorage.setItem('rule_library_providers', JSON.stringify(remoteData));
      console.log('🌥️ 已从云端同步数据，本地更新');
    }
  } catch (e) {
    console.error('🌥️ 同步失败:', e);
  }
}

// 保存数据后自动同步到云端
async function syncToCloud(data) {
  try {
    console.log('🌥️ 同步到云端...');
    
    // 先清空远程数据
    await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
      method: 'DELETE',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    
    // 再上传本地数据
    await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    console.log('🌥️ 已同步到云端');
  } catch (e) {
    console.error('🌥️ 同步失败:', e);
  }
}