/**
 * 教辅店铺个性化生产规则库 - 应用脚本
 * 构建号需与 index.html 中 app.js?v= 保持一致，便于确认浏览器未缓存旧脚本。
 */
var RULE_LIBRARY_BUILD = '20260512-21';
window.RULE_LIBRARY_BUILD = RULE_LIBRARY_BUILD;

var currentBrand = '';
var currentProvider = '';
var currentEditingBrand = '';
var currentEditingShop = '';
var currentEditingSeries = '';

// ========================================
// 数据存储（本地存储）
// ========================================
const STORAGE_KEYS = {
  PROVIDERS: 'rule_library_providers',
  BRANDS: 'rule_library_brands',
  SERIES: 'rule_library_series'
};
const APP_LOCAL_DIRTY_KEY = 'rule_library_local_dirty';
const DELETED_BRANDS_KEY = 'rule_library_deleted_brands';

 

// 默认数据
const defaultData = {
  providers: [],
  brands: [],
  series: []
};

// 初始化数据
function initData() {
  if (typeof presetData === 'undefined') return;
  
  // 检查是否已经有数据，避免覆盖用户保存的数据
  var existingData = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  if (existingData && existingData !== '[]') {
    // 已有数据，不覆盖
    var providers = JSON.parse(existingData);
    var brands = localStorage.getItem(STORAGE_KEYS.BRANDS);
    brands = brands ? JSON.parse(brands) : [];
    
    if (typeof updateStats === 'function') updateStats();
    return;
  }
  
  var providers = presetData.providers;
  var brands = presetData.brands;
  
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands.map(function(n, i) { return { id: String(i+1), name: n }; })));
  localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify([]));
  
  if (typeof updateStats === 'function') updateStats();
}

function initCollapsibles() {
  // 占位函数
}

// 重置为预置数据（可清除所有修改）
function resetToPresetData() {
  if (confirm('确定要重置所有数据吗？这将清除所有已修改的数据，恢复为初始数据。')) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(presetData.brands.map((name, i) => ({ id: (i + 1).toString(), name }))));
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(defaultData.series));
    loadProviders();
    loadBrands();
    updateStats();
    showToast('数据已重置为初始状态');
  }
}

// 数据操作
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/** 用于 innerHTML 文本节点，避免 < 等破坏结构；换行仍保留为 \n，配合 white-space:pre-wrap 显示 */
function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** AI / 列表展示：空或纯空白显示为「无」，否则保留原文（含换行） */
function formatAiFieldDisplay(raw) {
  if (raw === undefined || raw === null) return '无';
  var s = String(raw);
  if (s.trim() === '') return '无';
  return s;
}

/** 在可编辑框光标处插入文本（支持 Alt+空格 手动换行） */
function insertTextAtCaret(el, text) {
  if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
  if (el.readOnly || el.disabled) return;
  if (el.type === 'number' || el.type === 'email' || el.type === 'url' || el.type === 'date') return;
  var start = el.selectionStart;
  var end = el.selectionEnd;
  if (typeof start !== 'number' || typeof end !== 'number') return;
  var val = el.value;
  el.value = val.slice(0, start) + text + val.slice(end);
  var pos = start + text.length;
  try {
    el.setSelectionRange(pos, pos);
  } catch (err) {
    /* ignore */
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function isAltSpaceNewlineField(el) {
  if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return false;
  if (el.readOnly || el.disabled) return false;
  if (el.classList.contains('alt-space-newline')) return true;
  if (el.tagName === 'TEXTAREA' && el.classList.contains('rule-input')) return true;
  return false;
}

function normalizeText(value) {
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

function getDeletedBrandSet() {
  var arr = JSON.parse(localStorage.getItem(DELETED_BRANDS_KEY) || '[]');
  return new Set((arr || []).map(function(name) { return normalizeText(name); }).filter(Boolean));
}

function saveDeletedBrandSet(setObj) {
  localStorage.setItem(DELETED_BRANDS_KEY, JSON.stringify(Array.from(setObj || [])));
}

function markBrandDeleted(name) {
  var normalized = normalizeText(name);
  if (!normalized) return;
  var setObj = getDeletedBrandSet();
  setObj.add(normalized);
  saveDeletedBrandSet(setObj);
}

function unmarkBrandDeleted(name) {
  var normalized = normalizeText(name);
  if (!normalized) return;
  var setObj = getDeletedBrandSet();
  if (!setObj.has(normalized)) return;
  setObj.delete(normalized);
  saveDeletedBrandSet(setObj);
}

function normalizeEntityKey(value) {
  return normalizeText(value).replace(/[()（）\s]/g, '');
}

/** 公司/店铺名对齐：常见「文化」与「文化传媒」混用；「洛阳市」与「洛阳」工商/点评差异 */
function alignCompanyMatchKey(value) {
  var k = normalizeEntityKey(value);
  if (!k) return '';
  return k
    .replace(/文化传媒/g, '文化')
    .replace(/^洛阳市/, '洛阳');
}

function isEntityMatched(source, target) {
  var sourceKey = normalizeEntityKey(source);
  var targetKey = normalizeEntityKey(target);
  if (!sourceKey || !targetKey) return false;
  if (sourceKey === targetKey || sourceKey.indexOf(targetKey) !== -1 || targetKey.indexOf(sourceKey) !== -1) return true;
  var sa = alignCompanyMatchKey(source);
  var ta = alignCompanyMatchKey(target);
  if (!sa || !ta) return false;
  return sa === ta || sa.indexOf(ta) !== -1 || ta.indexOf(sa) !== -1;
}

function isEntitySameExact(source, target) {
  var sourceKey = normalizeEntityKey(source);
  var targetKey = normalizeEntityKey(target);
  /** 两边都无店铺/实体键时视为一致（否则「店名为空」与 encode 出的空串永远对不上，编辑/保存会报未找到） */
  if (!sourceKey && !targetKey) return true;
  if (!sourceKey || !targetKey) return false;
  return sourceKey === targetKey;
}

/**
 * 与「规则卡片」展示条件一致：店铺框可为空；非空时用 rowShopMatchesSearch（含 name 兜底）。
 */
function ruleRowMatchesEditIdentity(p, targetShop, targetProvider, targetBrand, targetSeries) {
  var ts = String(targetShop || '').trim();
  var tp = String(targetProvider || '').trim();
  var shopLeg = !ts || rowShopMatchesSearch(p, ts);
  var nameLeg = !tp || isEntityMatched(p && p.name, tp);
  return shopLeg &&
    nameLeg &&
    normalizeText(p && p.brand) === normalizeText(targetBrand) &&
    normalizeText((p && p.series) || '') === normalizeText(targetSeries);
}

/** 品牌下拉/搜索与行内品牌：严格相等或模糊一致（避免不可见字符、简写差异） */
function brandMatchesUi(pBrand, selectedBrand) {
  var a = normalizeText(pBrand);
  var b = normalizeText(selectedBrand);
  if (a === b) return true;
  if (!a || !b) return false;
  if (isEntityMatched(pBrand, selectedBrand)) return true;
  var ak = normalizeEntityKey(pBrand);
  var bk = normalizeEntityKey(selectedBrand);
  if (ak && bk && Math.min(ak.length, bk.length) >= 3) {
    if (ak.indexOf(bk) !== -1 || bk.indexOf(ak) !== -1) return true;
  }
  return false;
}

/** 在 shop/shopname/name/brand 拼接串中粗搜 needle（实体键），用于 0 条时的对照提示 */
function providersRoughFieldMatch(providersData, needleRaw) {
  var needle = normalizeEntityKey(needleRaw);
  if (!needle || needle.length < 2) return [];
  var out = [];
  (providersData || []).forEach(function(p, i) {
    if (!p) return;
    var blob = normalizeEntityKey(
      [p.shop, p.shopname, p.name, p.brand].map(function(x) { return String(x || ''); }).join('|')
    );
    if (blob.indexOf(needle) === -1) return;
    out.push({ data: p, index: i });
  });
  return out;
}

function buildRoughMatchSamplesHtml(providersData, needles) {
  var seenKey = new Set();
  var samples = [];
  (needles || []).forEach(function(nw) {
    providersRoughFieldMatch(providersData, nw).forEach(function(item) {
      var p = item.data;
      var k = normalizeEntityKey([p.shop, p.shopname, p.name, p.brand].join('|'));
      if (seenKey.has(k)) return;
      seenKey.add(k);
      samples.push(p);
    });
  });
  if (!samples.length) {
    var n = (providersData && providersData.length) || 0;
    var pullBtn =
      n < 400
        ? '<p style="margin:10px 0 0;"><button type="button" class="sync-btn" style="cursor:pointer;padding:8px 14px;border-radius:8px;border:none;background:var(--primary-cyan, #22d3ee);color:#0f172a;font-weight:600;" onclick="if(typeof window.forcePullProvidersFromCloud===\'function\'){window.forcePullProvidersFromCloud();}else{alert(\'请刷新页面后重试\');}">从云端重新拉取完整书目</button> ' +
          '<span style="font-size:12px;">（会清除「待同步」标记；仅在确认<strong>云端</strong>数据更全时使用）</span></p>'
        : '';
    return (
      '<div class="match-hint" style="margin-top:10px;font-size:13px;color:#64748b;line-height:1.55;">在现有 ' +
      n +
      ' 条卡片中，未在「店铺/别名/提供者/品牌」里搜到「朝霞」「王朝霞」。说明<strong>本机当前数据里很可能没有该校书目</strong>；若你曾在云端录入过大量规则，可点击下方按钮尝试<strong>强制以云端为准</strong>重新下载。</div>' +
      pullBtn
    );
  }
  var lis = samples.slice(0, 5).map(function(p) {
    return '<li style="margin:6px 0;word-break:break-all;">店铺「' + escapeHtmlText(p.shop || '') + '」· 别名「' +
      escapeHtmlText(p.shopname || '') + '」· 提供者「' + escapeHtmlText(p.name || '') + '」· 品牌「' +
      escapeHtmlText(p.brand || '') + '」</li>';
  }).join('');
  return '<div class="match-hint" style="margin-top:10px;background:rgba(14,165,233,0.08);border-color:rgba(14,165,233,0.35);">' +
    '<span class="match-icon">🔎</span><span class="match-text"><strong>在现有卡片中按关键字反查</strong>：下列为库中实际出现的「含朝霞/王朝霞」写法，请把<strong>店铺框</strong>改成与之一致（或改品牌框与品牌列一致）：</span>' +
    '<ul style="margin:8px 0 0;padding-left:18px;">' + lis + '</ul></div>';
}

function hasParentheses(value) {
  return /[()（）]/.test(String(value || ''));
}

function pickPreferredDisplayName(names, preferWithParentheses) {
  var validNames = (names || []).map(function(name) {
    return String(name || '').trim();
  }).filter(Boolean);
  if (validNames.length === 0) return '';

  var withParentheses = validNames.filter(function(name) { return hasParentheses(name); });
  var withoutParentheses = validNames.filter(function(name) { return !hasParentheses(name); });

  if (preferWithParentheses) {
    return (withParentheses[0] || validNames[0] || '');
  }
  return (withoutParentheses[0] || validNames[0] || '');
}

function getAllProvidersForSearch() {
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var deletedBrandSet = getDeletedBrandSet();
  var presetProviders = (typeof presetData !== 'undefined' && presetData && Array.isArray(presetData.providers)) ? presetData.providers : [];
  var merged = [].concat(localProviders || [], presetProviders || []);
  var seen = new Set();
  var result = [];
  merged.forEach(function(p) {
    if (!p) return;
    var key = [
      normalizeText(p.shop),
      normalizeText(p.shopname),
      normalizeText(p.name),
      normalizeText(p.brand),
      normalizeText(p.series)
    ].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    result.push(p);
  });
  return result;
}

/**
 * 店铺搜索框是否与该行「店铺语境」一致。
 * 旧数据常见：公司全称写在 name（提供者）里；或 shop 填了分店名、与搜索的公司全称对不上 —— 需用 name 兜底。
 */
function rowShopMatchesSearch(p, shopName) {
  var target = String(shopName || '').trim();
  if (!target) return false;
  var shop = p && p.shop;
  var shopname = p && p.shopname;
  if (isEntityMatched(shop, shopName) || isEntityMatched(shopname, shopName)) return true;
  if (isEntityMatched(p && p.name, shopName)) return true;
  // 合并店铺/别名/提供者后做实体键包含（处理字段拆错、点评名与工商名混填）
  var blob = normalizeEntityKey(
    String(shop || '') + String(shopname || '') + String((p && p.name) || '')
  );
  var nd = normalizeEntityKey(shopName);
  if (blob && nd && (blob.indexOf(nd) !== -1 || nd.indexOf(blob) !== -1)) return true;
  return false;
}

function isSameContextProvider(p, shopName, providerName) {
  var targetShop = String(shopName || '').trim();
  var targetProvider = String(providerName || '').trim();
  var shopMatched = !targetShop || rowShopMatchesSearch(p, shopName);
  var providerMatched = !targetProvider || isEntityMatched(p && p.name, targetProvider);
  return shopMatched && providerMatched;
}

function setData(key, data, options) {
  options = options || {};
  localStorage.setItem(key, JSON.stringify(data));

  var suppressProviders =
    key === STORAGE_KEYS.PROVIDERS &&
    (options.skipCloudSync ||
      (typeof window !== 'undefined' && window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC));

  if (!suppressProviders) {
    localStorage.setItem(APP_LOCAL_DIRTY_KEY, '1');
  }

  window.dispatchEvent(new CustomEvent('providers-data-updated', { detail: { source: 'local' } }));

  if (key !== STORAGE_KEYS.PROVIDERS || typeof syncToCloud !== 'function' || suppressProviders) {
    return;
  }

  console.log('📤 setData 开始同步...');
  console.log('📤 格式化数据:', (data || []).length, '条');
  syncToCloud(data);
}

// ========================================
// 页面导航
// ========================================
function goPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);
  
  if (pageId === 'provider') {
    loadProviders();
    loadBrands();
    loadProviderSelect();
  }
  
  if (pageId === 'ai') {
    // AI页面初始化
  }
}

function goHome() {
  goPage('home');
}

// 彻底回滚最近一次通过导入页面添加的批次数据
function rollbackLastBatch() {
  const batchId = localStorage.getItem('rule_import_last_batch');
  if (!batchId) {
    showToast('无最近导入批次记录');
    return;
  }
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const filtered = providers.filter(p => p.batch !== batchId);
  setData(STORAGE_KEYS.PROVIDERS, filtered);
  localStorage.removeItem('rule_import_last_batch');
  showToast('已回滚最近批次数据');
  loadProviders();
  updateStats();
}

// 强制刷新数据
function forceRefreshData() {
  localStorage.clear();
  initData();
  setTimeout(() => {
    const providers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROVIDERS) || '[]');
    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    alert('数据已刷新！\n提供者数量：' + providers.length + '\n品牌数量：' + brands.length);
    location.reload();
  }, 100);
}

// 全量清理：若同组已存在有效规则，则删除纯空白占位卡
function cleanupBlankPlaceholderProviders() {
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  if (!Array.isArray(providers) || providers.length === 0) return;

  function hasMeaningfulRule(p) {
    return !!(
      String((p && p.split) || '').trim() ||
      String((p && p.pricing) || '').trim() ||
      String((p && p.publishTime) || '').trim() ||
      String((p && p.specialCase) || '').trim() ||
      String((p && p.otherInfo) || '').trim()
    );
  }

  function groupKey(p) {
    return [
      normalizeEntityKey(p && p.shop),
      normalizeEntityKey(p && p.shopname),
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
  }

  var meaningfulGroupMap = {};
  var hasShopByBrandSeriesKey = {};
  providers.forEach(function(p) {
    if (!hasMeaningfulRule(p)) return;
    meaningfulGroupMap[groupKey(p)] = true;
  });
  providers.forEach(function(p) {
    var providerKey = [
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
    var hasShop = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
    if (hasShop) hasShopByBrandSeriesKey[providerKey] = true;
  });

  var next = providers.filter(function(p) {
    var noSeries = !String((p && p.series) || '').trim();
    var isBlank = !hasMeaningfulRule(p);
    if (noSeries && isBlank) return false;

    var providerKey = [
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
    var hasShop = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
    if (!hasShop && hasShopByBrandSeriesKey[providerKey]) return false;

    if (hasMeaningfulRule(p)) return true;
    var key = groupKey(p);
    return !meaningfulGroupMap[key];
  });

  if (next.length !== providers.length) {
    // 预置数据多为「无系列 + 全空白」占位行，本清理会全部滤掉 → 若写回 [] 会触发 setData 同步 0 条并误清空云端（与 cloudSync 竞态）
    if (next.length === 0 && providers.length > 0) {
      console.warn('[cleanupBlankPlaceholderProviders] 已跳过：清理结果为空，避免误删全书目并同步清空云端。');
      return;
    }
    setData(STORAGE_KEYS.PROVIDERS, next);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initData();
  if (typeof cloudSync !== 'function') {
    cleanupBlankPlaceholderProviders();
  }
  if (typeof initCollapsibles === 'function') initCollapsibles();
  loadProviderSelect();
  loadProviders();
  loadBrands();
  updateStats();
  
  var brandSelect = document.getElementById('brand-select');
  if (brandSelect) {
    brandSelect.onchange = function() { onBrandChange(); };
  }
  
  ['provider-search', 'shop-search', 'shopname-search'].forEach(id => {
    document.getElementById(id)?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchProvider();
    });
  });

  document.getElementById('ai-query')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') aiQuery();
  });
  
  // 点击其他地方关闭下拉框
  document.addEventListener('click', (e) => {
    const providerDropdown = document.getElementById('provider-dropdown');
    const shopDropdown = document.getElementById('shop-dropdown');
    const brandDropdown = document.getElementById('brand-dropdown');
    const providerInput = document.getElementById('provider-search-input');
    const shopInput = document.getElementById('shop-search-input');
    const brandInput = document.getElementById('brand-input');
    
    if (providerDropdown && !providerDropdown.contains(e.target) && (!providerInput || !providerInput.contains(e.target))) {
      providerDropdown.style.display = 'none';
    }
    if (shopDropdown && !shopDropdown.contains(e.target) && (!shopInput || !shopInput.contains(e.target))) {
      shopDropdown.style.display = 'none';
    }
    if (brandDropdown && !brandDropdown.contains(e.target) && (!brandInput || !brandInput.contains(e.target))) {
      brandDropdown.style.display = 'none';
    }
  });

  // 多标签/多人场景：本地变化和云端拉取后都刷新当前页面
  window.addEventListener('storage', function(evt) {
    if (!evt || evt.key !== STORAGE_KEYS.PROVIDERS) return;
    refreshProviderViews();
  });
  window.addEventListener('providers-data-updated', function() {
    refreshProviderViews();
  });

  window.addEventListener('cloud-sync-status', function(evt) {
    var detail = evt ? evt.detail : null;
    updateSyncStatusBadge(detail && detail.status, detail && detail.message);
  });
  var manualSyncBtn = document.getElementById('manual-sync-btn');
  if (manualSyncBtn) {
    manualSyncBtn.addEventListener('click', function() {
      triggerManualSync();
    });
  }
  updateSyncStatusBadge('idle', '等待同步');

  console.log('[规则库] 已加载脚本 build=' + RULE_LIBRARY_BUILD + '（若与页顶版本不一致请 Ctrl+F5 强刷）');

  // Alt + 空格：在规则编辑、带 alt-space-newline 的录入框中插入换行
  document.addEventListener('keydown', function(e) {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.code !== 'Space' && e.key !== ' ') return;
    var el = e.target;
    if (!isAltSpaceNewlineField(el)) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) insertTextAtCaret(el, '\n');
  }, true);
});

function refreshProviderViews() {
  loadProviderSelect();
  loadProviders();
  loadBrands();
  updateStats();
  if (currentEditingBrand) {
    showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries);
  }
}

function updateSyncStatusBadge(status, message) {
  var dot = document.getElementById('sync-status-dot');
  var text = document.getElementById('sync-status-text');
  var btn = document.getElementById('manual-sync-btn');
  if (!dot || !text) return;

  var nextStatus = status || 'idle';
  dot.classList.remove('sync-idle', 'syncing', 'sync-success', 'sync-error');

  if (nextStatus === 'syncing') {
    dot.classList.add('syncing');
    text.textContent = message || '同步中...';
    if (btn) btn.disabled = true;
    return;
  }
  if (nextStatus === 'success') {
    dot.classList.add('sync-success');
    text.textContent = message || '已同步';
    if (btn) btn.disabled = false;
    return;
  }
  if (nextStatus === 'error') {
    dot.classList.add('sync-error');
    text.textContent = message || '同步失败';
    if (btn) btn.disabled = false;
    return;
  }

  dot.classList.add('sync-idle');
  text.textContent = message || '等待同步';
  if (btn) btn.disabled = false;
}

function triggerManualSync() {
  if (typeof cloudSync !== 'function') {
    showToast('同步功能不可用');
    return;
  }
  cloudSync();
  showToast('已开始手动同步');
}

window.addEventListener('cloud-sync-status', function(evt) {
  var detail = evt ? evt.detail : null;
  var indicator = document.getElementById('sync-status-indicator');
  if (!indicator) return;
  if (detail && typeof detail.pendingSyncCount === 'number') {
    indicator.setAttribute('data-pending-sync', String(detail.pendingSyncCount));
  } else {
    indicator.removeAttribute('data-pending-sync');
  }
  if (detail && detail.lastSuccessAt) {
    var time = new Date(detail.lastSuccessAt);
    var hh = String(time.getHours()).padStart(2, '0');
    var mm = String(time.getMinutes()).padStart(2, '0');
    var ss = String(time.getSeconds()).padStart(2, '0');
    var pendingCount = indicator.getAttribute('data-pending-sync');
    if (pendingCount) {
      indicator.title = '最近同步时间：' + hh + ':' + mm + ':' + ss + '；待回传变更：' + pendingCount + ' 条';
    } else {
      indicator.title = '最近同步时间：' + hh + ':' + mm + ':' + ss;
    }
  } else {
    indicator.title = '最近同步时间：暂无';
  }
});

// ========================================
// 统计更新
// ========================================
function updateStats() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  var shopKeySet = new Set();
  (providers || []).forEach(function(p) {
    if (!p) return;
    var a = String(p.shop || '').trim();
    var b = String(p.shopname || '').trim();
    if (a) shopKeySet.add(normalizeEntityKey(a));
    else if (b) shopKeySet.add(normalizeEntityKey(b));
    else {
      var n = String(p.name || '').trim();
      if (n) shopKeySet.add(normalizeEntityKey(n));
    }
  });
  const shopCount = shopKeySet.size;

  const statProviders = document.getElementById('stat-providers');
  const statBrands = document.getElementById('stat-brands');
  const statShops = document.getElementById('stat-shops');

  if (statProviders) statProviders.textContent = String(providers.length);
  if (statBrands) statBrands.textContent = String(brands.length);
  if (statShops) statShops.textContent = String(shopCount);
}

// ========================================
// 提供者查询
// ========================================
function loadProviders() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  const container = document.getElementById('provider-list');
  const countBadge = document.getElementById('provider-count');
  
  if (!container) return;
  
  if (providers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无提供者，请点击上方「新增提供者」按钮添加</p>
      </div>
    `;
    if (countBadge) countBadge.textContent = '0';
    return;
  }
  
  container.innerHTML = providers.map((p, index) => {
    const brandName = p.brand || '';
    const seriesName = p.series || '';
    
    return `
      <div class="provider-item">
        <div class="provider-avatar">${(p.name || '未').charAt(0).toUpperCase()}</div>
        <div class="provider-info">
          <div class="provider-name">${p.name || '未命名'}</div>
          <div class="provider-meta">
            ${p.shop || p.shopname ? '🏪' + (p.shop || '') + (p.shop && p.shopname ? ' / ' : '') + (p.shopname || '') : ''} ${brandName}${seriesName ? ' · ' + seriesName : ''}
          </div>
          <div class="provider-tags">
            ${p.split ? '<span class="ptag">拆分:' + p.split + '</span>' : ''}
            ${p.pricing ? '<span class="ptag">定价:' + p.pricing + '</span>' : ''}
            ${p.publishTime ? '<span class="ptag">发布:' + p.publishTime + '</span>' : ''}
            ${p.specialCase ? '<span class="ptag ptag-warn">特例:' + p.specialCase + '</span>' : ''}
          </div>
        </div>
        <div class="provider-actions">
          <button onclick="editProvider(${index})">编辑</button>
          <button onclick="deleteProvider(${index})">删除</button>
        </div>
      </div>
    `;
  }).join('');
  
  if (countBadge) countBadge.textContent = providers.length;
}

function loadBrands() {
  var brands = getData(STORAGE_KEYS.BRANDS);
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var deletedBrandSet = getDeletedBrandSet();

  // 保证品牌库与提供者数据一致：如果提供者里出现新品牌，自动补齐到品牌库
  var normalizedBrands = (brands || []).map(function(b) {
    if (typeof b === 'string') {
      return { id: b, name: b };
    }
    return b;
  });
  var brandNameSet = new Set(
    normalizedBrands
      .map(function(b) { return (b && b.name ? String(b.name).trim() : ''); })
      .filter(Boolean)
  );
  var providerBrandNames = [...new Set(
    (providers || [])
      .map(function(p) { return p && p.brand ? String(p.brand).trim() : ''; })
      .filter(Boolean)
      .filter(function(name) { return !deletedBrandSet.has(normalizeText(name)); })
  )];
  var hasBrandChanges = false;

  providerBrandNames.forEach(function(name, idx) {
    if (brandNameSet.has(name)) return;
    normalizedBrands.push({
      id: 'auto_' + Date.now() + '_' + idx,
      name: name
    });
    brandNameSet.add(name);
    hasBrandChanges = true;
  });

  if (hasBrandChanges) {
    brands = normalizedBrands;
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  } else {
    brands = normalizedBrands;
  }

  // 如果本地没有，尝试从presetData获取
  if ((!brands || brands.length === 0) && typeof presetData !== 'undefined' && presetData.brands) {
    brands = presetData.brands;
  }
  var selects = [
    document.getElementById('brand-select'),
    document.getElementById('new-provider-brand'),
    document.getElementById('new-series-brand')
  ];
  
  selects.forEach(function(select) {
    if (!select) return;
    var currentVal = select.value;
    var optionsHtml = '<option value="">— 选择品牌 —</option>';
    if (brands && brands.length > 0) {
      optionsHtml += brands.map(function(b) {
        var name = b.name || b;
        if (deletedBrandSet.has(normalizeText(name))) return '';
        var id = b.id || name;
        return '<option value="' + id + '">' + name + '</option>';
      }).join('');
    }
    select.innerHTML = optionsHtml;
    select.value = currentVal;
  });
}

function loadProviderSelect() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const select = document.getElementById('provider-select');
  if (!select) return;
  
  const uniqueProviders = [...new Set(providers.map(p => p.name).filter(Boolean))];
  select.innerHTML = '<option value="">— 选择提供者 —</option>' + 
    uniqueProviders.map(p => `<option value="${p}">${p}</option>`).join('');
}

function onProviderSelect() {
  const providerName = document.getElementById('provider-select')?.value;
  if (!providerName) return;
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const matched = providers.filter(p => p.name === providerName);
  
  if (matched.length > 0) {
    // 获取该提供者下的所有品牌（去重）
    const uniqueBrands = [...new Set(matched.map(p => p.brand).filter(Boolean))];
    
    // 填充品牌下拉框
    const brandSelect = document.getElementById('brand-select');
    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">— 选择品牌 —</option>' + 
        uniqueBrands.map(b => `<option value="${b}">${b}</option>`).join('');
    }
    
    // 清空系列下拉框
    const seriesSelect = document.getElementById('series-select');
    if (seriesSelect) {
      seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>';
    }
    
    // 自动选择第一个品牌并显示匹配
    if (uniqueBrands.length > 0) {
      brandSelect.value = uniqueBrands[0];
      onBrandChange();
    }
    
    showMatchHint(matched);
  }
  
  loadProviders();
}

// 店铺名称搜索
function onShopSearchInput() {
  var input = document.getElementById('shop-search-input').value.trim().toLowerCase();
  var dropdown = document.getElementById('shop-dropdown');
  
  if (!input) {
    dropdown.style.display = 'none';
    return;
  }
  
  var providersData = getAllProvidersForSearch();
  var shopMap = {};
  providersData.forEach(function(p) {
    var hasShopFields = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
    [p && p.shop, p && p.shopname].forEach(function(rawName) {
      var name = String(rawName || '').trim();
      if (!name) return;
      var key = normalizeEntityKey(name);
      if (!key) return;
      if (!shopMap[key]) shopMap[key] = [];
      shopMap[key].push(name);
    });
    if (!hasShopFields) {
      var pn = String((p && p.name) || '').trim();
      if (pn) {
        var keyN = normalizeEntityKey(pn);
        if (!keyN) return;
        if (!shopMap[keyN]) shopMap[keyN] = [];
        shopMap[keyN].push(pn);
      }
    }
  });

  var uniqueShops = Object.keys(shopMap).map(function(key) {
    return pickPreferredDisplayName(shopMap[key], true);
  }).filter(Boolean);
  var matched = uniqueShops.filter(function(s) { return s.toLowerCase().indexOf(input) !== -1; });
  
  if (matched.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = matched.slice(0, 10).map(function(s) { 
    return '<div class="dropdown-item" onmousedown="event.preventDefault();selectShop(\'' + s + '\')">' + s + '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function searchShopByInput() {
  var input = document.getElementById('shop-search-input').value.trim();
  if (!input) return;
  selectShop(input);
}

function selectShop(shopName) {
  var input = document.getElementById('shop-search-input');
  var dropdown = document.getElementById('shop-dropdown');
  if (input) input.value = shopName;
  if (dropdown) dropdown.style.display = 'none';

  var providerInput = document.getElementById('provider-search-input');
  // 切换店铺时先清空提供者，避免上一家店铺的提供者把当前店铺下的品牌列表收窄成空
  if (providerInput) providerInput.value = '';

  var providersData = getAllProvidersForSearch();
  loadBrandsByShopAndShowDropdown(shopName);

  // 仅当该店铺语境下只有一个 distinct 提供者名时才自动填入，避免误锁到错误提供者
  if (providerInput) {
    var providerNameMap = {};
    providersData.forEach(function(p) {
      if (!rowShopMatchesSearch(p, shopName)) return;
      var pn = String((p && p.name) || '').trim();
      if (!pn) return;
      var providerKey = normalizeEntityKey(pn);
      if (!providerNameMap[providerKey]) providerNameMap[providerKey] = [];
      providerNameMap[providerKey].push(pn);
    });
    var distinctKeys = Object.keys(providerNameMap);
    if (distinctKeys.length === 1) {
      providerInput.value = pickPreferredDisplayName(providerNameMap[distinctKeys[0]], false);
      loadBrandsByShopAndShowDropdown(shopName);
    }
  }

  // 清空规则显示
  var display = document.getElementById('custom-rule-display');
  if (display) display.style.display = 'none';
  clearSeriesTags();
  var addSeriesBtn = document.getElementById('add-series-btn');
  if (addSeriesBtn) addSeriesBtn.style.display = 'none';
}

function loadBrandsByShopAndShowDropdown(shopName) {
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : (typeof presetData !== 'undefined' ? presetData.providers : []);
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var hasShop = String(shopName || '').trim();
  var matched = providersData.filter(function(p) {
    if (!hasShop && !providerName) return false;
    if (hasShop && !rowShopMatchesSearch(p, shopName)) return false;
    if (providerName && !isEntityMatched(p && p.name, providerName)) return false;
    return true;
  });
  var deletedBrandSet = getDeletedBrandSet();
  var brands = [...new Set(matched.map(function(p) { return p.brand; }).filter(Boolean))].filter(function(name) {
    return !deletedBrandSet.has(normalizeText(name));
  });
  
  var brandInput = document.getElementById('brand-input');
  
  if (brandInput) {
    brandInput.placeholder = '点击选择品牌...';
    brandInput.value = '';
    // 存储该店铺的品牌到 brandInput 的 data 属性
    brandInput.setAttribute('data-shop-brands', JSON.stringify(brands));
    brandInput.setAttribute('data-current-shop', shopName);
    brandInput.setAttribute('data-current-provider', providerName);
  }
}

function showBrandList(e) {
  if (e) e.stopPropagation();
  var brandInput = document.getElementById('brand-input');
  var dropdown = document.getElementById('brand-dropdown');
  if (!brandInput || !dropdown) return;
  var shopBrandsStr = brandInput.getAttribute('data-shop-brands');
  var shopBrands = shopBrandsStr ? JSON.parse(shopBrandsStr) : [];
  if (!shopBrands.length) {
    var legacyPb = brandInput.getAttribute('data-provider-brands');
    if (legacyPb) {
      try {
        shopBrands = JSON.parse(legacyPb);
      } catch (e) {
        shopBrands = [];
      }
    }
  }
  
  if (shopBrands.length > 0) {
    dropdown.innerHTML = shopBrands.slice(0, 80).map(function(b) { 
      return '<div class="dropdown-item" onclick="selectBrand(&quot;' + b + '&quot;)">' + b + '</div>';
    }).join('');
    dropdown.style.display = 'block';
  }
}

function loadBrandsByShop(shopName) {
  var providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  var providersData = providers ? JSON.parse(providers) : (presetData ? presetData.providers : []);
  var matched = providersData.filter(function(p) { return p.shop === shopName; });
  var brands = [...new Set(matched.map(function(p) { return p.brand; }).filter(Boolean))];
  
  var brandInput = document.getElementById('brand-input');
  if (brandInput) {
    brandInput.placeholder = shopName ? '从 ' + shopName + ' 的品牌中搜索...' : '输入品牌名称搜索...';
  }
}

function onBrandInput() {
  var input = document.getElementById('brand-input').value.trim().toLowerCase();
  var dropdown = document.getElementById('brand-dropdown');
  var brandInput = document.getElementById('brand-input');
  var shopBrands = brandInput && brandInput.getAttribute('data-shop-brands') ? JSON.parse(brandInput.getAttribute('data-shop-brands')) : [];
  if (!shopBrands.length && brandInput) {
    var legacyPb2 = brandInput.getAttribute('data-provider-brands');
    if (legacyPb2) {
      try {
        shopBrands = JSON.parse(legacyPb2);
      } catch (e2) {
        shopBrands = [];
      }
    }
  }
  var currentShopDisplay = (brandInput && brandInput.getAttribute('data-current-shop')) || document.getElementById('shop-search-input')?.value || '';
  var currentProviderRaw = document.getElementById('provider-search-input')?.value || '';
  
  // 如果没有输入，显示该店铺的所有品牌
  if (!input) {
    if (shopBrands.length > 0) {
      dropdown.innerHTML = shopBrands.slice(0, 80).map(function(b) { 
        return '<div class="dropdown-item" onmousedown="event.preventDefault();selectBrand(\'' + b + '\')">' + b + '</div>';
      }).join('');
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
    return;
  }
  
  // 有输入时，搜索过滤
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : (typeof presetData !== 'undefined' ? presetData.providers : []);
  
  // 优先从该店铺的品牌中搜索
  var uniqueBrands;
  if (shopBrands.length > 0) {
    uniqueBrands = shopBrands.filter(function(b) { return b.toLowerCase().indexOf(input) !== -1; });
  } else {
    var shopFiltered = providersData;
    if (String(currentShopDisplay || '').trim()) {
      shopFiltered = providersData.filter(function(p) {
        var shopMatched = rowShopMatchesSearch(p, currentShopDisplay);
        var providerMatched = !String(currentProviderRaw || '').trim() || isEntityMatched(p && p.name, currentProviderRaw);
        return shopMatched && providerMatched;
      });
    }
    uniqueBrands = [...new Set(shopFiltered.map(function(p) { return p.brand; }).filter(Boolean))];
    uniqueBrands = uniqueBrands.filter(function(b) { return b.toLowerCase().indexOf(input) !== -1; });
  }
  
  if (uniqueBrands.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = uniqueBrands.slice(0, 40).map(function(b) { 
    return '<div class="dropdown-item" onmousedown="event.preventDefault();selectBrand(\'' + b + '\')">' + b + '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function searchBrandByInput() {
  var input = document.getElementById('brand-input').value.trim();
  if (!input) return;
  selectBrand(input);
}

function clearSeriesTags() {
  var container = document.getElementById('series-tag-container');
  if (!container) return;
  container.style.display = 'none';
  container.innerHTML = '';
  currentEditingSeries = '';
}

function renderSeriesTags(matched, selectedSeries) {
  var container = document.getElementById('series-tag-container');
  if (!container) return;

  var seriesMap = {};
  (matched || []).forEach(function(item) {
    var p = item && item.data ? item.data : {};
    var key = (p.series || '').trim() || '未设置系列';
    seriesMap[key] = (seriesMap[key] || 0) + 1;
  });

  var seriesList = Object.keys(seriesMap).sort();
  if (seriesList.length <= 1) {
    clearSeriesTags();
    return;
  }

  var currentSeries = String(selectedSeries || '').trim();
  var allClass = currentSeries ? 'series-tag' : 'series-tag active';
  var html = '<span class="series-tag-label">系列：</span>';
  html += '<button class="' + allClass + '" type="button" onclick="selectSeriesFilter(\'\')">全部系列（' + matched.length + '）</button>';

  seriesList.forEach(function(seriesName) {
    var count = seriesMap[seriesName];
    var isActive = currentSeries === seriesName;
    var cls = isActive ? 'series-tag active' : 'series-tag';
    html += '<button class="' + cls + '" type="button" onclick="selectSeriesFilter(\'' + encodeURIComponent(seriesName) + '\')">' + seriesName + '（' + count + '）</button>';
  });

  container.innerHTML = html;
  container.style.display = 'flex';
}

function selectSeriesFilter(seriesEncoded) {
  var seriesName = seriesEncoded ? decodeURIComponent(seriesEncoded) : '';
  currentEditingSeries = seriesName;
  showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, seriesName);
}

function selectBrand(brandName) {
  console.log('selectBrand called:', brandName);
  var input = document.getElementById('brand-input');
  var dropdown = document.getElementById('brand-dropdown');
  if (input) input.value = brandName;
  if (dropdown) dropdown.style.display = 'none';
  
  var shopInput = document.getElementById('shop-search-input');
  var shopName = shopInput ? shopInput.value : '';
  
  currentEditingBrand = brandName;
  currentEditingShop = shopName;
  currentEditingSeries = '';
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var addSeriesBtn = document.getElementById('add-series-btn');
  if (addSeriesBtn) {
    addSeriesBtn.style.display = (shopName && providerName && brandName) ? 'inline-flex' : 'none';
  }
  
  console.log('calling showRulesByBrandAndShop with:', brandName, shopName);
  showRulesByBrandAndShop(brandName, shopName, '');
}

function showRulesByBrandAndShop(brandName, shopName, seriesFilter) {
  console.log('showRulesByBrandAndShop called:', brandName, shopName);
  brandName = String(brandName || '').trim();
  shopName = String(shopName || '').trim();
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : (typeof presetData !== 'undefined' ? presetData.providers : []);
  var targetBrand = normalizeText(brandName);
  var deletedBrandSet = getDeletedBrandSet();
  if (deletedBrandSet.has(targetBrand)) {
    var deletedDisplay = document.getElementById('custom-rule-display');
    if (deletedDisplay) {
      deletedDisplay.style.display = 'block';
      deletedDisplay.innerHTML = '<div class="match-hint"><span class="match-icon">ℹ️</span><span class="match-text">该品牌已删除，不再展示规则。</span></div>';
    }
    clearSeriesTags();
    return;
  }
  var targetShopTrim = String(shopName || '').trim();
  var targetSeries = normalizeText(seriesFilter || '');
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var relaxedHintHtml = '';
  
  // 过滤：品牌 + 店铺语境 + 提供者（与 loadBrandsByShopAndShowDropdown 一致，避免「有品牌名、规则卡片为 0」）
  var matched = [];
  providersData.forEach(function(p, i) {
    var brandMatched = brandMatchesUi(p && p.brand, brandName);
    var shopMatched = !targetShopTrim || rowShopMatchesSearch(p, shopName);
    var providerMatched = !providerName || isEntityMatched(p && p.name, providerName);
    if (brandMatched && shopMatched && providerMatched) {
      matched.push({ data: p, index: i });
    }
  });

  // 有店铺、有品牌，但因「提供者」框填错导致 0 条时：忽略提供者再筛一次（常见：框里仍是上一家主体）
  if (matched.length === 0 && providerName && targetShopTrim) {
    var retry = [];
    providersData.forEach(function(p, i) {
      if (!brandMatchesUi(p && p.brand, brandName)) return;
      if (!rowShopMatchesSearch(p, shopName)) return;
      retry.push({ data: p, index: i });
    });
    if (retry.length > 0) {
      matched = retry;
      relaxedHintHtml = '<div class="match-hint" style="margin-bottom:12px;"><span class="match-icon">⚠️</span><span class="match-text">已忽略「提供者」筛选（框内名称与该公司规则不一致），共显示 ' + retry.length + ' 条。请清空或改为规则卡片上的公司名称。</span></div>';
    }
  }
  
  // 仅在“未选择店铺”时才允许按品牌兜底，避免跨店铺串数据
  if (matched.length === 0 && !targetShopTrim) {
    providersData.forEach(function(p, i) {
      if (brandMatchesUi(p && p.brand, brandName)) {
        matched.push({ data: p, index: i });
      }
    });
  }
  
  var display = document.getElementById('custom-rule-display');
  if (!display) return;
  
  if (matched.length === 0) {
    clearSeriesTags();
    if (targetBrand && targetShopTrim) {
      var shopHit = 0;
      var brandHit = 0;
      var bothHit = 0;
      providersData.forEach(function(p) {
        var s = rowShopMatchesSearch(p, shopName);
        var b = brandMatchesUi(p && p.brand, brandName);
        if (s) shopHit += 1;
        if (b) brandHit += 1;
        if (s && b) bothHit += 1;
      });
      display.style.display = 'block';
      display.innerHTML =
        '<div class="match-hint"><span class="match-icon">ℹ️</span><span class="match-text">当前店铺下未找到该品牌规则。</span></div>' +
        '<div class="match-hint" style="margin-top:8px;font-size:13px;color:#64748b;line-height:1.5;">' +
        '本地共 <strong>' + providersData.length + '</strong> 条卡片；按当前规则粗算：店铺语境约 <strong>' + shopHit + '</strong> 条，品牌「' +
        escapeHtmlText(brandName) + '」约 <strong>' + brandHit + '</strong> 条，两者同时约 <strong>' + bothHit + '</strong> 条。' +
        (bothHit === 0 && brandHit === 0
          ? ' 若品牌为 0，多半是<strong>品牌名字与库里不一致</strong>（可在「AI 智能查询」搜王朝霞核对）。'
          : '') +
        (bothHit === 0 && shopHit === 0
          ? ' 若店铺为 0，请核对库里「店铺/店铺别名/提供者」是否含「洛阳」「朝霞」等关键字。'
          : '') +
        '</div>' +
        buildRoughMatchSamplesHtml(providersData, ['朝霞', '王朝霞', '洛阳朝霞']);
    } else {
      display.style.display = 'none';
    }
    return;
  }

  var matchedBeforeSeriesFilter = matched.slice();
  if (targetSeries) {
    matched = matched.filter(function(item) {
      var p = item && item.data ? item.data : {};
      return normalizeText((p.series || '').trim() || '未设置系列') === targetSeries;
    });
  }

  // 删除空白规则卡片：同一店铺/提供者/品牌/系列已存在有效规则时，隐藏纯空白占位记录
  var hasMeaningfulRule = function(p) {
    if (!p) return false;
    return !!(
      String(p.split || '').trim() ||
      String(p.pricing || '').trim() ||
      String(p.publishTime || '').trim() ||
      String(p.specialCase || '').trim() ||
      String(p.otherInfo || '').trim()
    );
  };
  var groupIdentityKey = function(p) {
    return [
      normalizeEntityKey(p && p.shop),
      normalizeEntityKey(p && p.shopname),
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
  };
  var meaningfulGroupMap = {};
  matched.forEach(function(item) {
    var p = item && item.data ? item.data : {};
    var key = groupIdentityKey(p);
    if (hasMeaningfulRule(p)) meaningfulGroupMap[key] = true;
  });
  matched = matched.filter(function(item) {
    var p = item && item.data ? item.data : {};
    var key = groupIdentityKey(p);
    if (!meaningfulGroupMap[key]) return true;
    return hasMeaningfulRule(p);
  });
  // 纯占位（无系列+规则全空）：仅当本列表中已存在至少一条「有内容」的规则时才隐藏，否则保留占位便于录入（洛阳朝霞等仅有骨架卡时否则会 0 条）
  var hasAnyMeaningfulInView = matched.some(function(item) {
    return hasMeaningfulRule(item && item.data);
  });
  if (hasAnyMeaningfulInView) {
    matched = matched.filter(function(item) {
      var p = item && item.data ? item.data : {};
      var noSeries = !String((p.series || '')).trim();
      var isBlank = !hasMeaningfulRule(p);
      return !(noSeries && isBlank);
    });
  }

  renderSeriesTags(matchedBeforeSeriesFilter, seriesFilter || '');
  if (matched.length === 0) {
    display.style.display = 'block';
    display.innerHTML = '<div class="match-hint"><span class="match-icon">ℹ️</span><span class="match-text">该品牌下未找到所选系列，请点 +新增系列添加。</span></div>';
    return;
  }
  
  // 同一品牌下按系列分组展示，避免多个系列难以区分
  var grouped = {};
  matched.slice(0, 50).forEach(function(item) {
    var p = item.data || {};
    var seriesKey = (p.series || '').trim() || '未设置系列';
    if (!grouped[seriesKey]) grouped[seriesKey] = [];
    grouped[seriesKey].push(item);
  });

  var html = (relaxedHintHtml || '') + '<div class="rule-result-list">';
  Object.keys(grouped).sort().forEach(function(seriesName) {
    var seriesItems = grouped[seriesName];
    html += '<div class="rule-group-header" style="margin:10px 0 8px;color:#0f766e;font-weight:600;">📚 系列：' + seriesName + '（' + seriesItems.length + '）</div>';

    seriesItems.forEach(function(item) {
      var p = item.data;
      var globalIndex = item.index;
      var ruleName = (p.brand || p.name || '未命名规则') + ' · ' + ((p.series || '').trim() || '未设置系列');
      var shopForEdit = String(shopName || '').trim() || (p.shop || '');
      var shopEncoded = encodeURIComponent(shopForEdit);
      var providerEncoded = encodeURIComponent(p.name || '');
      var brandEncoded = encodeURIComponent(p.brand || '');
      var seriesEncoded = encodeURIComponent((p.series || '').trim());
      var actionButtons = '<button class="rule-edit-btn" onclick="editRuleByIndex(' + globalIndex + ',\'' + shopEncoded + '\',\'' + providerEncoded + '\',\'' + brandEncoded + '\',\'' + seriesEncoded + '\')">✏️ 修改</button>' +
                       '<button class="rule-delete-btn" onclick="deleteRuleByIndex(' + globalIndex + ')">🗑️ 删除</button>';
      html += '<div class="rule-card">';
      html += '  <div class="rule-card-header">';
      html += '    <div class="rule-card-title">' + escapeHtmlText(ruleName) + '</div>';
      html += '    <div class="rule-card-actions">' + actionButtons + '</div>';
      html += '  </div>';
      html += '  <div class="rule-card-body">';
      html += '    <div class="rule-row"><span class="rule-label">系列：</span><span class="rule-value">' + escapeHtmlText((p.series || '').trim() || '未设置系列') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">拆分：</span><span class="rule-value">' + escapeHtmlText(p.split || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">定价：</span><span class="rule-value">' + escapeHtmlText(p.pricing || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">发布时间：</span><span class="rule-value">' + escapeHtmlText(p.publishTime || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">特例：</span><span class="rule-value">' + escapeHtmlText(p.specialCase || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">其他信息：</span><span class="rule-value">' + escapeHtmlText(p.otherInfo || '待录入') + '</span></div>';
      html += '  </div>';
      html += '</div>';
    });
  });

  html += '</div>';
  display.innerHTML = html;
  display.style.display = 'block';
}

function showRulesByShop(shopName) {
  var providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  var providersData = providers ? JSON.parse(providers) : (presetData ? presetData.providers : []);
  var matched = providersData.filter(function(p) { return p.shop === shopName; });
  
  var display = document.getElementById('custom-rule-display');
  if (!display) return;
  
  if (matched.length === 0) {
    display.style.display = 'none';
    return;
  }
  
  var html = '<div class="rule-result-header"><h3>匹配到 ' + matched.length + ' 条规则</h3></div>';
  html += '<div class="rule-result-list">';
  
  matched.slice(0, 20).forEach(function(p) {
    html += '<div class="rule-result-item">';
    html += '<div class="rule-result-title"><strong>品牌：</strong>' + (p.brand || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>拆分：</strong>' + (p.split || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>定价：</strong>' + (p.pricing || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>发布时间：</strong>' + (p.publishTime || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>特例：</strong>' + (p.specialCase || '-') + '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  display.innerHTML = html;
  display.style.display = 'block';
}

// 提供者输入搜索
function onProviderSearchInput() {
  var rawInput = document.getElementById('provider-search-input').value.trim();
  var input = normalizeText(rawInput);
  var dropdown = document.getElementById('provider-dropdown');
  
  if (!input) {
    dropdown.style.display = 'none';
    var shopEl = document.getElementById('shop-search-input');
    var shopVal = shopEl ? String(shopEl.value || '').trim() : '';
    if (shopVal) loadBrandsByShopAndShowDropdown(shopVal);
    return;
  }
  
  var providersData = getAllProvidersForSearch();
  var providerMap = {};
  providersData.forEach(function(p) {
    var rawName = String((p && p.name) || '').trim();
    if (!rawName) return;
    var key = normalizeEntityKey(rawName);
    if (!key) return;
    if (!providerMap[key]) providerMap[key] = [];
    providerMap[key].push(rawName);
  });
  var uniqueProviders = Object.keys(providerMap).map(function(key) {
    return pickPreferredDisplayName(providerMap[key], false);
  }).filter(Boolean);
  var matched = uniqueProviders.filter(function(p) {
    var normalizedName = normalizeText(p);
    return normalizedName.indexOf(input) !== -1 || input.indexOf(normalizedName) !== -1;
  });
  
  if (matched.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = matched.slice(0, 10).map(function(p) { 
    return '<div class="dropdown-item" onclick="selectProvider(\'' + p + '\')">' + p + '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function searchProviderByInput() {
  var input = document.getElementById('provider-search-input').value.trim();
  if (!input) return;
  
  var normalizedInput = normalizeText(input);
  var providersData = getAllProvidersForSearch();
  var matched = providersData.filter(function(p) {
    var name = normalizeText(p && p.name);
    return name && (name.indexOf(normalizedInput) !== -1 || normalizedInput.indexOf(name) !== -1);
  });
  
  // 如果存在匹配提供者，调用选择逻辑
  if (matched.length > 0) {
    selectProvider(matched[0].name);
  } else {
    // 如果不存在，弹出新增提供者窗口
    openAddProviderDirect(input);
  }
}

// 直接新增提供者（搜索不匹配时触发）
function openAddProviderDirect(name) {
  currentProvider = name;
  var input = document.getElementById('provider-search-input');
  if (input) input.value = name;
  var dropdown = document.getElementById('provider-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  openAddProvider();
}

function selectProvider(providerName) {
  var dropdown = document.getElementById('provider-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  
  var input = document.getElementById('provider-search-input');
  if (input) input.value = providerName;
  currentProvider = providerName;
  clearSeriesTags();
  var addSeriesBtn = document.getElementById('add-series-btn');
  if (addSeriesBtn) addSeriesBtn.style.display = 'none';
  
  var normalizedProvider = normalizeEntityKey(providerName);
  var providersData = getAllProvidersForSearch();
  var matched = providersData.filter(function(p) {
    return normalizeEntityKey(p && p.name) === normalizedProvider;
  });
  
  if (matched.length === 0) {
    matched = providersData.filter(function(p) { 
      var name = normalizeEntityKey(p && p.name);
      return name && (name.indexOf(normalizedProvider) !== -1 || normalizedProvider.indexOf(name) !== -1); 
    });
  }
  
  hideManualInput();
    
  if (matched.length > 0) {
    // 获取该提供者关联的所有店铺（兼容历史字段）
    var shopMap = {};
    matched.forEach(function(p) {
      var candidates = [
        p && p.shop,
        p && p.shopname,
        p && p.shopName,
        p && p.store,
        p && p.storeName
      ];
      candidates.forEach(function(rawShop) {
        var shopText = String(rawShop || '').trim();
        if (!shopText) return;
        var key = normalizeEntityKey(shopText);
        if (!key || shopMap[key]) return;
        shopMap[key] = shopText;
      });
    });
    var uniqueShops = Object.keys(shopMap).map(function(key) { return shopMap[key]; });
    
    // 历史数据仅有「提供者」公司名、shop/shopname 全空时，用提供者显示名填入店铺框，便于与 rowShopMatchesSearch 对齐
    if (uniqueShops.length === 0 && matched.length > 0) {
      var nameCandidates = matched.map(function(p) { return String((p && p.name) || '').trim(); }).filter(Boolean);
      if (nameCandidates.length > 0) uniqueShops = [pickPreferredDisplayName(nameCandidates, false)];
    }
    
    // 自动填充店铺：若输入框里还留着「与当前提供者卡片无关」的旧店铺名，不能沿用，否则 loadBrands 会把品牌列表收窄成空
    var shopInput = document.getElementById('shop-search-input');
    var currentShopValue = shopInput ? String(shopInput.value || '').trim() : '';
    if (currentShopValue && !matched.some(function(p) { return rowShopMatchesSearch(p, currentShopValue); })) {
      currentShopValue = '';
    }
    var preferredShop = '';
    if (currentShopValue) {
      preferredShop = uniqueShops.find(function(s) { return isEntityMatched(s, currentShopValue); }) || '';
    }
    if (!preferredShop) {
      preferredShop = uniqueShops[0] || '';
    }
    if (shopInput) {
      if (preferredShop) {
        shopInput.value = preferredShop;
      } else {
        shopInput.value = '';
        showToast('该提供者未关联店铺信息，请先补录店铺');
        if (confirm('该提供者暂无店铺信息，是否现在补录？')) {
          openAddProviderDirect(providerName);
        }
      }
    }
    
    var uniqueBrands = matched.map(function(p) { return p.brand; }).filter(Boolean);
    uniqueBrands = [...new Set(uniqueBrands)];
    var deletedBrandSet = getDeletedBrandSet();
    uniqueBrands = uniqueBrands.filter(function(name) {
      return !deletedBrandSet.has(normalizeText(name));
    });
    
    var brandInput = document.getElementById('brand-input');
    if (brandInput) {
      brandInput.setAttribute('data-shop-brands', JSON.stringify(uniqueBrands));
      brandInput.setAttribute('data-current-shop', preferredShop || '');
      brandInput.setAttribute('data-current-provider', providerName);
      brandInput.removeAttribute('data-provider-brands');
      brandInput.placeholder = '点击选择品牌...';
    }
    
    if (preferredShop) {
      loadBrandsByShopAndShowDropdown(preferredShop);
    }
    if (brandInput) {
      var afterList = JSON.parse(brandInput.getAttribute('data-shop-brands') || '[]');
      if (afterList.length === 0 && uniqueBrands.length > 0) {
        brandInput.setAttribute('data-shop-brands', JSON.stringify(uniqueBrands));
      }
    }
    
    loadProviders();
  }
}

function onBrandChange() {
  var brandSelect = document.getElementById('brand-select');
  var brandId = brandSelect ? brandSelect.value : '';
  
  // 获取显示的文本（品牌名）
  var brandName = brandSelect ? brandSelect.options[brandSelect.selectedIndex].text : '';
  if (brandName === '— 选择品牌 —') brandName = '';
  
  currentBrand = brandId;
  
  if (!brandId) return;
  
  // 获取当前选择的品牌名（用于匹配）
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  // 从预置数据和本地存储中匹配
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  var matched;
  if (providerName && providerName.trim() !== '') {
    matched = allProviders.filter(function(p) { 
      return p.name === providerName && (p.brand === brandName || p.brand === brandId);
    });
  } else {
    matched = allProviders.filter(function(p) { 
      return p.brand === brandName || p.brand === brandId;
    });
  }
  
  var uniqueSeries = matched.map(function(p) { return p.series; }).filter(Boolean);
  uniqueSeries = [...new Set(uniqueSeries)];
  
  var seriesSelect = document.getElementById('series-select');
  if (seriesSelect) {
    seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>' + 
      uniqueSeries.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  }
}

function displayBrandRule(brandName) {
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  if (!brandName) return;
  
  var matched = presetData.providers.filter(function(p) { 
    if (providerName) {
      return p.brand === brandName && p.name === providerName;
    }
    return p.brand === brandName;
  });
  
  if (matched.length === 0) return;
  
  // 显示第一个匹配项的规则作为示例
  var rule = matched[0];
  var displayBox = document.getElementById('custom-rule-display');
  if (displayBox) {
    displayBox.style.display = 'block';
    displayBox.innerHTML = '<div class="rule-display-header"><span class="rule-icon">📋</span> <span>' + brandName + ' 规则</span></div>' +
      '<div class="rule-display-content">' +
      '<div class="rule-item"><span class="label">拆分：</span><span class="value">' + (rule.split || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">定价：</span><span class="value">' + (rule.pricing || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">发布时间：</span><span class="value">' + (rule.publishTime || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">特例：</span><span class="value">' + (rule.specialCase || '无') + '</span></div>' +
      '</div>';
  }
}

function onSeriesChange() {
  var seriesSelect = document.getElementById('series-select');
  var seriesName = seriesSelect ? seriesSelect.value : '';
  var brandSelect = document.getElementById('brand-select');
  var brandName = brandSelect ? brandSelect.value : '';
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  if (!seriesName || !brandName) {
    // 如果没有选择完整，仍显示提示
    var displayBox = document.getElementById('custom-rule-display');
    if (displayBox) {
      displayBox.style.display = 'block';
      displayBox.innerHTML = '<div class="rule-display-header"><span class="rule-icon">📋</span> 规则查询</span></div>' +
        '<div class="rule-display-content">' +
        '<p>请完整选择：提供者 → 品牌 → 系列</p>' +
        '</div>';
    }
    return;
  }
  
  // 检查 presetData 和 localStorage
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  // 获取匹配的规则数据：宽松匹配（包含关系）
  var matched = allProviders.filter(function(p) {
    return p.name && p.name.includes(providerName) && p.brand === brandName && p.series === seriesName;
  });
  
  // 如果没有精确匹配，按品牌+系列匹配
  if (matched.length === 0) {
    matched = allProviders.filter(function(p) {
      return p.brand === brandName && p.series === seriesName;
    });
  }
  
  console.log('matched:', matched.length);
  
  // 显示规则
  var currentRule = matched.length > 0 ? matched[0] : {split: '', pricing: '', publishTime: '', specialCase: ''};
  var displayBox = document.getElementById('custom-rule-display');
  if (displayBox) {
    displayBox.style.display = 'block';
    displayBox.innerHTML = '<div class="rule-display-header">' +
        '<span class="rule-icon">📋</span> <span>' + brandName + ' - ' + seriesName + ' 规则</span>' +
        '<button class="btn-edit-rule" onclick="editRule()">✏️ 修改</button>' +
      '</div>' +
      '<div class="rule-display-content" id="rule-content">' +
        '<div class="rule-item"><span class="label">拆分：</span><span class="value" id="rule-split">' + escapeHtmlText(currentRule.split || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">定价：</span><span class="value" id="rule-pricing">' + escapeHtmlText(currentRule.pricing || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><span class="value" id="rule-publishTime">' + escapeHtmlText(currentRule.publishTime || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">特例：</span><span class="value" id="rule-specialCase">' + escapeHtmlText(currentRule.specialCase || '待录入') + '</span></div>' +
      '</div>' +
      '<div class="rule-edit-content" id="rule-edit" style="display:none;">' +
        '<div class="rule-item"><span class="label">拆分：</span><textarea rows="2" id="edit-split" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">定价：</span><textarea rows="2" id="edit-pricing" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><textarea rows="2" id="edit-publishTime" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">特例：</span><textarea rows="2" id="edit-specialCase" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-btn-wrap">' +
          '<button class="btn-cancel" onclick="cancelEdit()">取消</button>' +
          '<button class="btn-save" onclick="saveEditRule()">保存</button>' +
        '</div>' +
      '</div>';
    var splitEl = document.getElementById('edit-split');
    if (splitEl) splitEl.value = currentRule.split || '';
    var prEl = document.getElementById('edit-pricing');
    if (prEl) prEl.value = currentRule.pricing || '';
    var pubEl = document.getElementById('edit-publishTime');
    if (pubEl) pubEl.value = currentRule.publishTime || '';
    var spEl = document.getElementById('edit-specialCase');
    if (spEl) spEl.value = currentRule.specialCase || '';
  }
}

// 修改规则
function editRule() {
  document.getElementById('rule-content').style.display = 'none';
  document.querySelector('.rule-display-header .btn-edit-rule').style.display = 'none';
  document.getElementById('rule-edit').style.display = 'block';
}

// 取消修改
function cancelEdit() {
  document.getElementById('rule-content').style.display = 'block';
  document.querySelector('.rule-display-header .btn-edit-rule').style.display = 'inline-block';
  document.getElementById('rule-edit').style.display = 'none';
}

// 保存修改
function saveEditRule() {
  var seriesSelect = document.getElementById('series-select');
  var seriesName = seriesSelect ? seriesSelect.value : '';
  var brandSelect = document.getElementById('brand-select');
  var brandName = brandSelect ? brandSelect.value : '';
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  var newSplit = document.getElementById('edit-split').value.trim();
  var newPricing = document.getElementById('edit-pricing').value.trim();
  var newPublishTime = document.getElementById('edit-publishTime').value.trim();
  var newSpecialCase = document.getElementById('edit-specialCase').value.trim();
  
  // 获取当前数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  // 查找匹配项
  var matchedIndex = -1;
  var newProvidersList = [...localProviders];
  
  for (var i = 0; i < newProvidersList.length; i++) {
    if (newProvidersList[i].name === providerName && newProvidersList[i].brand === brandName && newProvidersList[i].series === seriesName) {
      matchedIndex = i;
      break;
    }
  }
  
  if (matchedIndex >= 0) {
    // 更新现有项
    newProvidersList[matchedIndex].split = newSplit;
    newProvidersList[matchedIndex].pricing = newPricing;
    newProvidersList[matchedIndex].publishTime = newPublishTime;
    newProvidersList[matchedIndex].specialCase = newSpecialCase;
  } else {
    // 新增项
    newProvidersList.push({
      name: providerName,
      brand: brandName,
      series: seriesName,
      split: newSplit,
      pricing: newPricing,
      publishTime: newPublishTime,
      specialCase: newSpecialCase
    });
  }
  
  setData(STORAGE_KEYS.PROVIDERS, newProvidersList);
  showToast('保存成功');
  cancelEdit();
  
  // 刷新显示
  onSeriesChange();
}

function editRuleByIndex(globalIndex, shopEncoded, providerEncoded, brandEncoded, seriesEncoded) {
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : [];
  var resolvedIndex = globalIndex;
  var rule = providersData[resolvedIndex];
  var targetShop = decodeURIComponent(shopEncoded || '');
  var targetProvider = decodeURIComponent(providerEncoded || '');
  var targetBrand = decodeURIComponent(brandEncoded || '');
  var targetSeries = decodeURIComponent(seriesEncoded || '');

  if (rule && !ruleRowMatchesEditIdentity(rule, targetShop, targetProvider, targetBrand, targetSeries)) {
    rule = null;
  }

  if (!rule) {
    resolvedIndex = providersData.findIndex(function(p) {
      return ruleRowMatchesEditIdentity(p, targetShop, targetProvider, targetBrand, targetSeries);
    });
    rule = resolvedIndex >= 0 ? providersData[resolvedIndex] : null;
  }
  
  if (!rule) {
    showToast('未找到该规则');
    return;
  }
  
  var display = document.getElementById('custom-rule-display');
  
  var html = '<div class="rule-card-edit">';
  html += '  <div class="rule-card-header">';
  html += '    <div class="rule-card-title">编辑: ' + escapeHtmlText((rule.brand || '未命名规则') + ' · ' + ((rule.series || '').trim() || '未设置系列')) + '</div>';
  html += '    <button class="rule-edit-btn" onclick="showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries)">✖ 取消</button>';
  html += '  </div>';
  html += '  <div class="rule-card-body">';
  html += '    <p class="rule-edit-hint">提示：在输入框中按 <strong>Alt + 空格</strong> 可插入换行。</p>';
  html += '    <div class="rule-row"><span class="rule-label">店铺：</span><span class="rule-value">' + escapeHtmlText(rule.shop || '未设置店铺') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">提供者：</span><span class="rule-value">' + escapeHtmlText(rule.name || '未设置提供者') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">品牌：</span><span class="rule-value">' + escapeHtmlText(rule.brand || '未设置品牌') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">系列：</span><span class="rule-value">' + escapeHtmlText((rule.series || '').trim() || '未设置系列') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">拆分：</span><textarea class="rule-input alt-space-newline" rows="3" id="edit-split"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">定价：</span><textarea class="rule-input alt-space-newline" rows="3" id="edit-pricing"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">发布时间：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-publishTime"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">特例：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-specialCase"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">其他信息：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-otherInfo"></textarea></div>';
  html += '    <div class="rule-row"><button class="rule-save-btn" id="save-rule-btn" data-index="' + resolvedIndex + '">💾 保存</button></div>';
  html += '  </div>';
  html += '</div>';
  
  display.innerHTML = html;
  document.getElementById('edit-split').value = rule.split || '';
  document.getElementById('edit-pricing').value = rule.pricing || '';
  document.getElementById('edit-publishTime').value = rule.publishTime || '';
  document.getElementById('edit-specialCase').value = rule.specialCase || '';
  document.getElementById('edit-otherInfo').value = rule.otherInfo || '';
  
  document.getElementById('save-rule-btn').addEventListener('click', function() {
    saveRuleByIndex(resolvedIndex, targetShop, targetProvider, targetBrand, targetSeries);
  });
}

function saveRuleByIndex(globalIndex, targetShop, targetProvider, targetBrand, targetSeries) {
  try {
    console.log('💾 saveRuleByIndex 被调用，globalIndex:', globalIndex);
    var newSplit = document.getElementById('edit-split') ? document.getElementById('edit-split').value.trim() : '';
    var newPricing = document.getElementById('edit-pricing') ? document.getElementById('edit-pricing').value.trim() : '';
    var newPublishTime = document.getElementById('edit-publishTime') ? document.getElementById('edit-publishTime').value.trim() : '';
    var newSpecialCase = document.getElementById('edit-specialCase') ? document.getElementById('edit-specialCase').value.trim() : '';
    var newOtherInfo = document.getElementById('edit-otherInfo') ? document.getElementById('edit-otherInfo').value.trim() : '';
    
    var providers = localStorage.getItem('rule_library_providers');
    var providersData = providers ? JSON.parse(providers) : [];
    var resolvedIndex = globalIndex;
    var candidate = providersData[resolvedIndex];
    var hasIdentity = !!(targetShop || targetProvider || targetBrand || targetSeries);
    var identityMismatched = false;
    if (candidate && hasIdentity) {
      identityMismatched = !ruleRowMatchesEditIdentity(candidate, targetShop, targetProvider, targetBrand, targetSeries);
    }
    if (!candidate || identityMismatched) {
      resolvedIndex = providersData.findIndex(function(p) {
        return ruleRowMatchesEditIdentity(p, targetShop, targetProvider, targetBrand, targetSeries);
      });
    }
    if (resolvedIndex < 0 || !providersData[resolvedIndex]) {
      showToast('未找到该规则');
      return;
    }
    
    providersData[resolvedIndex].split = newSplit;
    providersData[resolvedIndex].pricing = newPricing;
    providersData[resolvedIndex].publishTime = newPublishTime;
    providersData[resolvedIndex].specialCase = newSpecialCase;
    providersData[resolvedIndex].otherInfo = newOtherInfo;
    // 系列/品牌/提供者/店铺不在“编辑规则”里改动，避免上次规则带值导致联动串改
    
    console.log('💾 保存的数据:', providersData[resolvedIndex]);
    setData(STORAGE_KEYS.PROVIDERS, providersData);
    showToast('保存成功');
    showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries);
  } catch (err) {
    console.error('saveRuleByIndex 失败:', err);
    showToast('保存失败，请重试');
  }
}

function deleteRuleByIndex(globalIndex) {
  if (!confirm('确定要删除这条规则吗？')) return;
  
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : [];
  if (!providersData[globalIndex]) {
    showToast('未找到该规则');
    return;
  }
  
  providersData.splice(globalIndex, 1);
  setData(STORAGE_KEYS.PROVIDERS, providersData);
  showToast('删除成功');
  showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries);
}

function showManualInput() {
  var section = document.getElementById('manual-input-section');
  var form = document.getElementById('manual-input-form');
  if (section) section.style.display = 'block';
  if (form) form.style.display = 'flex';
}

function hideManualInput() {
  var section = document.getElementById('manual-input-section');
  var form = document.getElementById('manual-input-form');
  if (section) section.style.display = 'none';
  if (form) form.style.display = 'none';
}

function loadSeries(brandId, targetSelect) {
  const allSeries = getData(STORAGE_KEYS.SERIES);
  const filteredSeries = brandId ? allSeries.filter(s => s.brandId === brandId) : allSeries;
  
  if (!targetSelect) return;
  
  const currentVal = targetSelect.value;
  targetSelect.innerHTML = '<option value="">— 选择系列 —</option>' +
    filteredSeries.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  targetSelect.value = currentVal;
}

function searchProvider() {
  const shopKeyword = document.getElementById('shop-search')?.value.trim().toLowerCase();
  const providerKeyword = document.getElementById('provider-search')?.value.trim().toLowerCase();
  const brandId = document.getElementById('brand-select')?.value;
  const seriesId = document.getElementById('series-select')?.value;
  
  const brands = getData(STORAGE_KEYS.BRANDS);
  const series = getData(STORAGE_KEYS.SERIES);
  let providers = getData(STORAGE_KEYS.PROVIDERS);
  
  // 智能匹配：如果输入了店铺信息，自动填充提供者、品牌、系列
  if (shopKeyword) {
    const matchedProviders = providers.filter(p => 
      (p.shop && p.shop.toLowerCase().includes(shopKeyword)) ||
      (p.shopname && p.shopname.toLowerCase().includes(shopKeyword))
    );
    
    if (matchedProviders.length > 0) {
      // 自动填充第一个匹配的提供者信息
      const firstMatch = matchedProviders[0];
      if (!providerKeyword) {
        document.getElementById('provider-search').value = firstMatch.name || '';
      }
      
      // 自动选择品牌
      if (!brandId && firstMatch.brand) {
        const brandItem = brands.find(b => b.name === firstMatch.brand);
        if (brandItem) {
          document.getElementById('brand-select').value = brandItem.id;
          loadSeries(brandItem.id, document.getElementById('series-select'));
        }
      }
      
      // 自动选择系列
      setTimeout(() => {
        if (!seriesId && firstMatch.series) {
          document.getElementById('series-select').value = firstMatch.series;
        }
      }, 100);
      
      // 显示匹配结果提示
      showMatchHint(matchedProviders);
    }
  }
  
  // 继续过滤
  const filtered = providers.filter(p => {
    const shopMatch = !shopKeyword || 
      (p.shop && p.shop.toLowerCase().includes(shopKeyword)) ||
      (p.shopname && p.shopname.toLowerCase().includes(shopKeyword));
    const providerMatch = !providerKeyword || (p.name && p.name.toLowerCase().includes(providerKeyword));
    const brandMatch = !brandId || p.brand === brandId || (brands.find(b => b.id === brandId)?.name === p.brand);
    const seriesMatch = !seriesId || p.series === seriesId;
    
    return shopMatch && providerMatch && brandMatch && seriesMatch;
  });

  const container = document.getElementById('provider-list');
  if (!container) return;
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>未找到匹配的提供者</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((p, index) => {
    const brandName = p.brand || '';
    const seriesName = p.series || '';
    const realIndex = providers.indexOf(p);
    
    return `
      <div class="provider-item">
        <div class="provider-avatar">${(p.name || '未').charAt(0).toUpperCase()}</div>
        <div class="provider-info">
          <div class="provider-name">${p.name || '未命名'}</div>
          <div class="provider-meta">
            ${p.shop || p.shopname ? '🏪' + (p.shop || '') + (p.shop && p.shopname ? ' / ' : '') + (p.shopname || '') : ''} ${brandName}${seriesName ? ' · ' + seriesName : ''}
          </div>
          <div class="provider-tags">
            ${p.split ? '<span class="ptag">拆分:' + p.split + '</span>' : ''}
            ${p.pricing ? '<span class="ptag">定价:' + p.pricing + '</span>' : ''}
            ${p.publishTime ? '<span class="ptag">发布:' + p.publishTime + '</span>' : ''}
            ${p.specialCase ? '<span class="ptag ptag-warn">特例:' + p.specialCase + '</span>' : ''}
          </div>
        </div>
        <div class="provider-actions">
          <button onclick="editProvider(${realIndex})">编辑</button>
          <button onclick="deleteProvider(${realIndex})">删除</button>
        </div>
      </div>
    `;
  }).join('');
  
  const countBadge = document.getElementById('provider-count');
  if (countBadge) countBadge.textContent = filtered.length;
}

function showMatchHint(matchedProviders) {
  const display = document.getElementById('custom-rule-display');
  if (!display) return;
  
  if (matchedProviders.length === 0) {
    display.style.display = 'none';
    return;
  }
  
  const first = matchedProviders[0];
  display.style.display = 'block';
  display.innerHTML = `
    <div class="match-hint">
      <span class="match-icon">✅</span>
      <span class="match-text">已自动匹配：提供者 <strong>${first.name || '-'}</strong> · 品牌 <strong>${first.brand || '-'}</strong> · 系列 <strong>${first.series || '-'}</strong></span>
      ${matchedProviders.length > 1 ? `<span class="match-count">（共${matchedProviders.length}条匹配）</span>` : ''}
    </div>
  `;
}

// ========================================
// 手工录入信息保存
// ========================================
function saveRuleInput() {
  const brandId = document.getElementById('brand-select')?.value;
  const seriesId = document.getElementById('series-select')?.value;
  const providerKeyword = document.getElementById('provider-search')?.value.trim();
  
  if (!providerKeyword && !brandId && !seriesId) {
    showToast('请先选择或输入提供者信息');
    return;
  }
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  
  // 查找匹配的提供者
  let targetProvider = null;
  let targetIndex = -1;
  
  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    const brandMatch = !brandId || p.brand === brandId || (brands.find(b => b.id === brandId)?.name === p.brand);
    const seriesMatch = !seriesId || p.series === seriesId;
    const providerMatch = !providerKeyword || (p.name && p.name.includes(providerKeyword));
    
    if (brandMatch && seriesMatch && providerMatch) {
      targetProvider = p;
      targetIndex = i;
      break;
    }
  }
  
  // 如果没找到匹配的新提供者
  if (!targetProvider) {
    showToast('未找到匹配的提供者，请先新增');
    return;
  }
  
  // 更新录入信息
  const split = document.getElementById('split-dimension')?.value.trim();
  const pricing = document.getElementById('pricing')?.value.trim();
  const publishTime = document.getElementById('publish-time')?.value.trim();
  const specialCase = document.getElementById('special-case')?.value.trim();
  
  providers[targetIndex] = {
    ...providers[targetIndex],
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || ''
  };
  
  setData(STORAGE_KEYS.PROVIDERS, providers);
  loadProviders();
  showToast('录入信息已保存');
}

// ========================================
// 弹窗操作
// ========================================
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = '';
}

function openAddProvider() {
  document.getElementById('modal-provider-title').textContent = '新增提供者';
  
  // 获取当前已选择的店铺和提供者
  var shopInput = document.getElementById('shop-search-input');
  var providerInput = document.getElementById('provider-search-input');
  var brandInput = document.getElementById('brand-input');
  
  var currentShop = shopInput ? shopInput.value : '';
  var currentProvider = providerInput ? providerInput.value : '';
  
  // 清空表单（先清空，再填充店铺和提供者）
  document.getElementById('new-provider-shop').value = '';
  document.getElementById('new-provider-name').value = '';
  document.getElementById('new-provider-brand').value = '';
  var seriesEl = document.getElementById('new-provider-series');
  if (seriesEl) seriesEl.value = '';
  document.getElementById('new-provider-split').value = '';
  document.getElementById('new-provider-pricing').value = '';
  document.getElementById('new-provider-publishtime').value = '';
  document.getElementById('new-provider-special').value = '';
  
  // 填充已选择的店铺和提供者
  document.getElementById('new-provider-shop').value = currentShop;
  document.getElementById('new-provider-name').value = currentProvider;
  
  // 如果已选择店铺或提供者，则禁用对应字段
  var shopField = document.getElementById('new-provider-shop');
  var providerField = document.getElementById('new-provider-name');
  
  if (currentShop) {
    shopField.readOnly = true;
    shopField.style.background = '#f5f5f5';
  } else {
    shopField.readOnly = false;
    shopField.style.background = '';
  }
  
  if (currentProvider) {
    providerField.readOnly = true;
    providerField.style.background = '#f5f5f5';
  } else {
    providerField.readOnly = false;
    providerField.style.background = '';
  }
  
  openModal('modal-provider');
}

function openAddShop() {
  openAddProvider();
  var titleEl = document.getElementById('modal-provider-title');
  if (titleEl) titleEl.textContent = '新增店铺名称';
}

function openAddBrand() {
  var name = window.prompt('请输入品牌名称');
  if (name == null) return;
  saveBrand(name);
}

function openDeleteBrand() {
  var inputEl = document.getElementById('brand-input');
  var defaultBrand = (inputEl ? inputEl.value : '').trim();
  var brandName = window.prompt('请输入要删除的品牌名称', defaultBrand);
  if (brandName == null) return;
  deleteBrand(brandName);
}

function openAddSeries() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var brandName = (document.getElementById('brand-input')?.value || '').trim();
  if (!shopName || !providerName || !brandName) {
    showToast('新增系列前请先填写店铺、提供者、品牌');
    return;
  }
  var seriesName = window.prompt('请输入系列名称');
  if (seriesName == null) return;
  saveSeries('', seriesName, brandName, shopName, providerName);
}

// ========================================
// 保存操作
// ========================================
function saveProvider() {
  const shop = document.getElementById('new-provider-shop')?.value.trim();
  const name = document.getElementById('new-provider-name')?.value.trim();
  const brandName = document.getElementById('new-provider-brand')?.value.trim();
  const seriesName = document.getElementById('new-provider-series')?.value.trim();
  const split = document.getElementById('new-provider-split')?.value.trim();
  const pricing = document.getElementById('new-provider-pricing')?.value.trim();
  const publishTime = document.getElementById('new-provider-publishtime')?.value.trim();
  const specialCase = document.getElementById('new-provider-special')?.value.trim();
  const otherInfo = document.getElementById('new-provider-otherinfo')?.value.trim();
  
  if (!name) {
    showToast('请输入提供者名称');
    return;
  }
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers.push({
    shop: shop || '',
    name,
    brand: brandName || '',
    series: seriesName || '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || '',
    otherInfo: otherInfo || ''
  });
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  showToast('保存成功');
  closeModal('modal-provider');
  
  loadProviders();
  
  var brandInput = document.getElementById('brand-input');
  var shopInput = document.getElementById('shop-search-input');
  var currentShop = shopInput ? shopInput.value : '';
  
  if (brandInput) {
    brandInput.value = brandName;
  }
  
  if (brandName && currentShop) {
    showRulesByBrandAndShop(brandName, currentShop);
  } else if (brandName) {
    showRulesByBrandAndShop(brandName, '');
  }
}

function saveBrand(nameInput) {
  const name = (nameInput || document.getElementById('new-brand-name')?.value || '').trim();
  
  if (!name) {
    showToast('请输入品牌名称');
    return;
  }
  unmarkBrandDeleted(name);

  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  if (!shopName || !providerName) {
    showToast('新增品牌前请先填写店铺名称和提供者');
    return;
  }

  const brands = getData(STORAGE_KEYS.BRANDS);
  var brandExists = brands.some(function(b) {
    return (b.name || b) === name;
  });
  if (!brandExists) {
    brands.push({ id: Date.now().toString(), name });
    setData(STORAGE_KEYS.BRANDS, brands);
  }

  // 自动建立品牌与店铺/提供者的关联，确保可被搜索链路命中
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var hasLinkedRecord = providers.some(function(p) {
    return isSameContextProvider(p, shopName, providerName) &&
      normalizeText(p.brand) === normalizeText(name);
  });
  if (!hasLinkedRecord) {
    providers.push({
      shop: shopName,
      name: providerName,
      brand: name,
      series: '',
      split: '',
      pricing: '',
      publishTime: '',
      specialCase: '',
      otherInfo: ''
    });
    setData(STORAGE_KEYS.PROVIDERS, providers);
  }

  // 新增后立即刷新当前店铺品牌缓存，避免搜索仍使用旧列表
  loadBrandsByShopAndShowDropdown(shopName);
  var brandInputEl = document.getElementById('brand-input');
  if (brandInputEl) {
    brandInputEl.value = name;
    brandInputEl.setAttribute('data-current-shop', shopName);
  }
  onBrandInput();
  // 新增后直接触发品牌选择，立即弹出规则卡片
  selectBrand(name);
  
  var modalBrand = document.getElementById('modal-brand');
  if (modalBrand) closeModal('modal-brand');
  loadBrands();
  updateStats();
  if (hasLinkedRecord) {
    showToast(brandExists ? '品牌已存在并已关联到当前店铺/提供者' : '品牌添加成功');
  } else {
    showToast(brandExists ? '品牌已存在，已新增当前店铺/提供者关联' : '品牌添加成功');
  }
}

function deleteBrand(nameInput) {
  var name = String(nameInput || '').trim();
  if (!name) {
    showToast('请输入品牌名称');
    return;
  }
  markBrandDeleted(name);

  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var currentShop = (document.getElementById('shop-search-input')?.value || '').trim();
  var currentProvider = (document.getElementById('provider-search-input')?.value || '').trim();
  var normalizedBrand = normalizeText(name);

  var matchedRecords = providers.filter(function(p) {
    if (normalizeText(p && p.brand) !== normalizedBrand) return false;
    if (currentShop && currentProvider) {
      return isSameContextProvider(p, currentShop, currentProvider);
    }
    return true;
  });

  if (matchedRecords.length > 0) {
    var scopeText = (currentShop && currentProvider)
      ? '当前店铺/提供者下'
      : '所有店铺/提供者下';
    var confirmDeleteRules = confirm(
      '品牌「' + name + '」在' + scopeText + '有 ' + matchedRecords.length + ' 条已录入规则。\n确定同时删除这些规则吗？'
    );
    if (!confirmDeleteRules) return;
    providers = providers.filter(function(p) {
      if (normalizeText(p && p.brand) !== normalizedBrand) return true;
      if (currentShop && currentProvider) {
        return !isSameContextProvider(p, currentShop, currentProvider);
      }
      return false;
    });
    setData(STORAGE_KEYS.PROVIDERS, providers);
  }

  var brands = getData(STORAGE_KEYS.BRANDS);
  var hasBrandInUse = providers.some(function(p) {
    return normalizeText(p && p.brand) === normalizedBrand;
  });

  var nextBrands = hasBrandInUse ? brands : brands.filter(function(b) {
    return normalizeText((b && b.name) || b) !== normalizeText(name);
  });

  if (nextBrands.length === brands.length && matchedRecords.length === 0) {
    showToast('未找到该品牌');
    return;
  }

  if (matchedRecords.length === 0) {
    if (!confirm('确定删除品牌「' + name + '」吗？')) return;
  }

  setData(STORAGE_KEYS.BRANDS, nextBrands);

  var brandInputEl = document.getElementById('brand-input');
  if (brandInputEl && normalizeText(brandInputEl.value) === normalizeText(name)) {
    brandInputEl.value = '';
  }

  var brandDropdown = document.getElementById('brand-dropdown');
  if (brandDropdown) {
    brandDropdown.style.display = 'none';
  }

  loadBrands();
  updateStats();
  if (hasBrandInUse) {
    showToast('已删除当前关联规则；该品牌在其他规则中仍在使用');
  } else {
    showToast('品牌删除成功');
  }
}

function saveSeries(brandIdInput, nameInput, brandNameInput, shopInput, providerInput) {
  const brandId = brandIdInput || document.getElementById('new-series-brand')?.value || '';
  const name = (nameInput || document.getElementById('new-series-name')?.value || '').trim();
  const shopName = (shopInput || document.getElementById('shop-search-input')?.value || '').trim();
  const providerName = (providerInput || document.getElementById('provider-search-input')?.value || '').trim();
  const brandName = (brandNameInput || document.getElementById('brand-input')?.value || '').trim();

  if (!shopName || !providerName || !brandName) {
    showToast('新增系列前请先填写店铺、提供者、品牌');
    return;
  }

  if (!name) {
    showToast('请输入系列名称');
    return;
  }
  
  const series = getData(STORAGE_KEYS.SERIES);

  if (series.some(s => (s.brandId || '') === brandId && s.name === name)) {
    showToast('该系列已存在');
  } else {
    series.push({ id: Date.now().toString(), brandId, name });
    setData(STORAGE_KEYS.SERIES, series);
  }

  // 核心：将系列挂到当前店铺+提供者+品牌记录，确保能弹规则卡片且刷新后可搜索
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  var linked = false;
  providers.forEach(function(p) {
    if ((p.shop || '') === shopName && (p.name || '') === providerName && (p.brand || '') === brandName && (p.series || '') === name) {
      linked = true;
    }
  });

  if (!linked) {
    providers.push({
      shop: shopName,
      name: providerName,
      brand: brandName,
      series: name,
      split: '',
      pricing: '',
      publishTime: '',
      specialCase: '',
      otherInfo: ''
    });
    setData(STORAGE_KEYS.PROVIDERS, providers);
  }

  var seriesSelect = document.getElementById('series-select');
  if (seriesSelect) {
    seriesSelect.innerHTML += '<option value="' + name + '">' + name + '</option>';
    seriesSelect.value = name;
  }

  showRulesByBrandAndShop(brandName, shopName);
  showToast(linked ? '系列已存在并已关联当前规则' : '系列添加成功');
}

// ========================================
// 编辑删除
// ========================================
let editingProviderIndex = null;

function editProvider(index) {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const provider = providers[index];
  
  if (!provider) return;
  
  editingProviderIndex = index;
  document.getElementById('modal-provider-title').textContent = '编辑提供者';
  
  document.getElementById('new-provider-shop').value = provider.shop || '';
  document.getElementById('new-provider-shopname').value = provider.shopname || '';
  document.getElementById('new-provider-name').value = provider.name || '';
  document.getElementById('new-provider-brand').value = provider.brand || '';
  document.getElementById('new-provider-series').value = provider.series || '';
  document.getElementById('new-provider-split').value = provider.split || '';
  document.getElementById('new-provider-pricing').value = provider.pricing || '';
  document.getElementById('new-provider-publishtime').value = provider.publishTime || '';
  document.getElementById('new-provider-special').value = provider.specialCase || '';
  
  openModal('modal-provider');
  
  const saveBtn = document.querySelector('#modal-provider .btn-save');
  saveBtn.onclick = () => updateProvider();
}

function updateProvider() {
  const shop = document.getElementById('new-provider-shop')?.value.trim();
  const shopname = document.getElementById('new-provider-shopname')?.value.trim();
  const name = document.getElementById('new-provider-name')?.value.trim();
  const brandName = document.getElementById('new-provider-brand')?.value.trim();
  const seriesName = document.getElementById('new-provider-series')?.value.trim();
  const split = document.getElementById('new-provider-split')?.value.trim();
  const pricing = document.getElementById('new-provider-pricing')?.value.trim();
  const publishTime = document.getElementById('new-provider-publishtime')?.value.trim();
  const specialCase = document.getElementById('new-provider-special')?.value.trim();
  
  if (!name) {
    showToast('请输入提供者名称');
    return;
  }
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers[editingProviderIndex] = {
    shop: shop || '',
    shopname: shopname || '',
    name,
    brand: brandName,
    series: seriesName || '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || ''
  };
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  closeModal('modal-provider');
  loadProviders();
  showToast('提供者更新成功');
  
  const saveBtn = document.querySelector('#modal-provider .btn-save');
  saveBtn.onclick = saveProvider;
  editingProviderIndex = null;
}

function deleteProvider(index) {
  if (!confirm('确定要删除该提供者吗？')) return;
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers.splice(index, 1);
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  loadProviders();
  updateStats();
  showToast('提供者已删除');
}

// ========================================
// AI 查询
// ========================================
function setAiQuery(keyword) {
  document.getElementById('ai-query').value = keyword;
  aiQuery();
}

function aiQuery() {
  const query = document.getElementById('ai-query')?.value.trim();
  const resultBox = document.getElementById('ai-result');
  
  if (!query) {
    resultBox.innerHTML = '';
    return;
  }
  
  const queryLower = query.toLowerCase();
  const normalizedQuery = normalizeForSearch(query);
  const queryTerms = buildQueryTerms(query);
  const isStrictMultiTermQuery = queryTerms.length >= 2;
  
  // 首先搜索提供者/品牌/系列数据 - 只搜索 localStorage 中的用户保存数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var deletedBrandSet = getDeletedBrandSet();
  
  // 只搜索本地数据（用户保存的规则），不使用 presetData
  var providerCandidates = localProviders
    .filter(function(p) {
      var brand = normalizeText(p && p.brand);
      return !deletedBrandSet.has(brand);
    })
    .map(function(p) {
      var identityText = [
        p.name || '',
        p.brand || '',
        p.series || '',
        p.shop || '',
        p.shopname || ''
      ].join(' ');
      var normalizedIdentity = normalizeForSearch(identityText);
      var searchableText = [
        p.name || '',
        p.brand || '',
        p.series || '',
        p.shop || '',
        p.shopname || '',
        p.split || '',
        p.pricing || '',
        p.publishTime || '',
        p.specialCase || '',
        p.otherInfo || ''
      ].join(' ');
      var normalizedText = normalizeForSearch(searchableText);
      var termMatchedCount = queryTerms.filter(function(term) {
        return normalizedText.indexOf(term) !== -1;
      }).length;
      var allTermsMatched = queryTerms.length > 0 && termMatchedCount === queryTerms.length;
      var exactContains = normalizedText.indexOf(normalizedQuery) !== -1;
      var identityExactContains = normalizedIdentity.indexOf(normalizedQuery) !== -1;
      var providerText = [
        p.name || '',
        p.brand || '',
        p.series || '',
        p.shop || '',
        p.shopname || '',
        p.split || '',
        p.pricing || '',
        p.publishTime || '',
        p.specialCase || '',
        p.otherInfo || ''
      ].join(' ');
      return {
        data: p,
        score: getFuzzyScore(query, providerText) + (termMatchedCount * 40) + (allTermsMatched ? 80 : 0),
        termMatchedCount: termMatchedCount,
        allTermsMatched: allTermsMatched,
        exactContains: exactContains,
        identityExactContains: identityExactContains
      };
    })
    .filter(function(item) { return item.score > 0; });

  // 组合词（如“木牍中考”）时收窄结果：优先要求在品牌/系列/提供者/店铺中命中完整短语
  if (isStrictMultiTermQuery) {
    var exactPhraseProviders = providerCandidates.filter(function(item) {
      return item.identityExactContains;
    });
    if (exactPhraseProviders.length > 0) {
      providerCandidates = exactPhraseProviders;
    } else {
    var strictProviders = providerCandidates.filter(function(item) {
      return item.allTermsMatched || item.exactContains;
    });
    if (strictProviders.length > 0) {
      providerCandidates = strictProviders;
    }
    }
  }

  var matchedProviders = providerCandidates
    .sort(function(a, b) { return b.score - a.score; })
    .map(function(item) { return item.data; });

  // AI 查询与提供者查询保持一致：仅删除“同组已有有效规则”下的空白占位卡
  var hasMeaningfulRuleForAi = function(p) {
    if (!p) return false;
    return !!(
      String(p.split || '').trim() ||
      String(p.pricing || '').trim() ||
      String(p.publishTime || '').trim() ||
      String(p.specialCase || '').trim() ||
      String(p.otherInfo || '').trim()
    );
  };
  var aiGroupIdentityKey = function(p) {
    return [
      normalizeEntityKey(p && p.shop),
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
  };
  var aiMeaningfulGroupMap = {};
  matchedProviders.forEach(function(p) {
    var key = aiGroupIdentityKey(p);
    if (hasMeaningfulRuleForAi(p)) aiMeaningfulGroupMap[key] = true;
  });
  matchedProviders = matchedProviders.filter(function(p) {
    var key = aiGroupIdentityKey(p);
    if (!aiMeaningfulGroupMap[key]) return true;
    return hasMeaningfulRuleForAi(p);
  });

  // 当查询词与品牌存在精确匹配时，仅保留该品牌结果，避免返回“包含但不一致”的品牌卡片
  var exactBrandMatches = matchedProviders.filter(function(p) {
    return normalizeForSearch(p && p.brand) === normalizedQuery;
  });
  if (exactBrandMatches.length > 0) {
    matchedProviders = exactBrandMatches;
  }

  // AI 查询结果去重：同一店铺/提供者/品牌/系列只保留一张卡，优先保留信息更完整的
  var dedupedMap = new Map();
  matchedProviders.forEach(function(p) {
    var key = aiGroupIdentityKey(p);
    var existing = dedupedMap.get(key);
    if (!existing) {
      dedupedMap.set(key, p);
      return;
    }
    var existingScore = (
      (String(existing.split || '').trim() ? 1 : 0) +
      (String(existing.pricing || '').trim() ? 1 : 0) +
      (String(existing.publishTime || '').trim() ? 1 : 0) +
      (String(existing.specialCase || '').trim() ? 1 : 0) +
      (String(existing.otherInfo || '').trim() ? 1 : 0)
    );
    var currentScore = (
      (String(p.split || '').trim() ? 1 : 0) +
      (String(p.pricing || '').trim() ? 1 : 0) +
      (String(p.publishTime || '').trim() ? 1 : 0) +
      (String(p.specialCase || '').trim() ? 1 : 0) +
      (String(p.otherInfo || '').trim() ? 1 : 0)
    );
    if (currentScore > existingScore) {
      dedupedMap.set(key, p);
    }
  });
  matchedProviders = Array.from(dedupedMap.values());

  // AI 端最终兜底：过滤未设置系列的纯空白卡，以及“同品牌同系列已有店铺版本”时的无店铺孤立卡
  var aiHasShopByBrandSeriesKey = {};
  matchedProviders.forEach(function(p) {
    var key = [
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
    var hasShop = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
    if (hasShop) aiHasShopByBrandSeriesKey[key] = true;
  });
  matchedProviders = matchedProviders.filter(function(p) {
    var hasShop = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
    if (!hasShop) return false;

    var noSeries = !String((p && p.series) || '').trim();
    var isBlank = !hasMeaningfulRuleForAi(p);
    if (noSeries && isBlank) return false;
    var key = [
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
    if (!hasShop && aiHasShopByBrandSeriesKey[key]) return false;
    return true;
  });

  // 强一致：仅保留“在提供者查询口径下可展示”的卡片，其他一律删除
  var providerVisibleKey = function(p) {
    return [
      normalizeEntityKey(p && p.shop),
      normalizeEntityKey(p && p.shopname),
      normalizeEntityKey(p && p.name),
      normalizeText(p && p.brand),
      normalizeText((p && p.series) || '')
    ].join('|');
  };
  var providerCandidatesForVisible = localProviders
    .filter(function(p) {
      var brand = normalizeText(p && p.brand);
      if (deletedBrandSet.has(brand)) return false;
      var hasShop = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
      if (!hasShop) return false;
      var noSeries = !String((p && p.series) || '').trim();
      var isBlank = !hasMeaningfulRuleForAi(p);
      if (noSeries && isBlank) return false;
      return true;
    });
  var providerVisibleSet = new Set(providerCandidatesForVisible.map(function(p) { return providerVisibleKey(p); }));
  matchedProviders = matchedProviders.filter(function(p) {
    return providerVisibleSet.has(providerVisibleKey(p));
  });
  
  if (matchedProviders.length > 0) {
    // 一条规则一张卡片，提升可读性（避免同卡片内信息过密）
    var html = matchedProviders.map(function(rule) {
      var providerName = rule.name || '未命名提供者';
      var brandName = rule.brand || '未设置品牌';
      var seriesName = (rule.series || '').trim() || '未设置系列';
      var shopName = rule.shop || rule.shopname || '未设置店铺';
      return '<div class="ai-result-card">' +
        '<div class="ai-result-header">' +
          '<span class="ai-result-icon">📌</span>' +
          '<span class="ai-result-title">' + escapeHtmlText(providerName + ' · ' + brandName + ' · ' + seriesName) + '</span>' +
        '</div>' +
        '<div class="ai-result-body">' +
          '<div class="ai-result-section">' +
            '<div class="ai-result-row"><span class="ai-result-label">店铺</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(shopName)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">提供者</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(providerName)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">品牌</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(brandName)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">系列</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(seriesName)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">拆分</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.split)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">定价</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.pricing)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">发布时间</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.publishTime)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">特例</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.specialCase)) + '</span></div>' +
            '<div class="ai-result-row"><span class="ai-result-label">其他信息</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.otherInfo)) + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    
    resultBox.innerHTML = html;
    return;
  }
  
  // 如果没有匹配到提供者/品牌/系列，搜索通用规则
  const rules = getAIRules();
  var ruleCandidates = rules
    .map(function(rule) {
      var sectionText = (rule.sections || []).map(function(s) {
        return (s.title || '') + ' ' + stripHtmlTags(s.content || '');
      }).join(' ');
      var searchableText = [
        rule.keyword || '',
        rule.title || '',
        sectionText
      ].join(' ');
      var normalizedText = normalizeForSearch(searchableText);
      var termMatchedCount = queryTerms.filter(function(term) {
        return normalizedText.indexOf(term) !== -1;
      }).length;
      var allTermsMatched = queryTerms.length > 0 && termMatchedCount === queryTerms.length;
      var exactContains = normalizedText.indexOf(normalizedQuery) !== -1;
      return {
        rule: rule,
        score: getFuzzyScore(query, searchableText) + (termMatchedCount * 40) + (allTermsMatched ? 80 : 0),
        termMatchedCount: termMatchedCount,
        allTermsMatched: allTermsMatched,
        exactContains: exactContains
      };
    })
    .filter(function(item) { return item.score > 0; });

  if (isStrictMultiTermQuery) {
    var strictRules = ruleCandidates.filter(function(item) {
      return item.allTermsMatched || item.exactContains;
    });
    if (strictRules.length > 0) {
      ruleCandidates = strictRules;
    }
  }

  const matched = ruleCandidates
    .sort(function(a, b) { return b.score - a.score; })
    .map(function(item) { return item.rule; });
  
  if (matched.length === 0) {
    resultBox.innerHTML =
      '<div class="ai-result-card">' +
        '<div class="ai-result-header">' +
          '<span class="ai-result-icon">🔍</span>' +
          '<span class="ai-result-title">未找到匹配规则</span>' +
        '</div>' +
        '<div class="ai-result-body">' +
          '<p class="ai-result-empty-msg">未找到与「' + escapeHtmlText(query) + '」直接相关的规则。请尝试其他关键词，或查看通用规则页面获取完整信息。</p>' +
        '</div>' +
      '</div>';
    return;
  }
  
  resultBox.innerHTML = matched.map(function(rule) {
    return (
      '<div class="ai-result-card">' +
        '<div class="ai-result-header">' +
          '<span class="ai-result-icon">' + escapeHtmlText(rule.icon) + '</span>' +
          '<span class="ai-result-title">' + escapeHtmlText(rule.title) + '</span>' +
        '</div>' +
        '<div class="ai-result-body">' +
          rule.sections.map(function(s) {
            return (
              '<div class="ai-result-section">' +
                '<h5>' + escapeHtmlText(s.title) + '</h5>' +
                '<div class="ai-result-html">' + (s.content || '') + '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function stripHtmlTags(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeForSearch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim();
}

function buildQueryTerms(query) {
  var q = normalizeForSearch(query);
  if (!q) return [];

  // 英文/拼音/空格分词
  if (/\s/.test(String(query || ''))) {
    return String(query || '')
      .toLowerCase()
      .split(/\s+/)
      .map(function(t) { return normalizeForSearch(t); })
      .filter(function(t) { return t.length > 0; });
  }

  // 中文连续输入时按 2 字分块，提升组合词精度（如：木牍中考 -> 木牍 / 中考）
  if (q.length >= 4) {
    var parts = [];
    for (var i = 0; i < q.length; i += 2) {
      var part = q.slice(i, i + 2);
      if (part.length >= 2) parts.push(part);
    }
    if (parts.length > 1) return parts;
  }

  return [q];
}

function getFuzzyScore(query, text) {
  var q = normalizeForSearch(query);
  var t = normalizeForSearch(text);
  if (!q || !t) return 0;

  // 完全包含优先级最高
  if (t.indexOf(q) !== -1) return 100 + q.length;
  if (q.indexOf(t) !== -1) return 80 + t.length;

  // 子序列匹配（允许中间有间隔字符）
  var qi = 0;
  var firstHit = -1;
  var lastHit = -1;
  for (var i = 0; i < t.length && qi < q.length; i++) {
    if (t.charAt(i) === q.charAt(qi)) {
      if (firstHit === -1) firstHit = i;
      lastHit = i;
      qi++;
    }
  }
  if (qi === q.length) {
    var span = Math.max(1, lastHit - firstHit + 1);
    var compactBonus = Math.max(0, 30 - (span - q.length));
    return 50 + q.length + compactBonus;
  }

  // 连续字符片段匹配
  var maxChunk = 0;
  for (var start = 0; start < q.length; start++) {
    for (var end = start + 2; end <= q.length; end++) {
      var chunk = q.slice(start, end);
      if (t.indexOf(chunk) !== -1 && chunk.length > maxChunk) {
        maxChunk = chunk.length;
      }
    }
  }
  if (maxChunk >= 2) return 20 + maxChunk;

  return 0;
}

function getAIRules() {
  return [
    {
      keyword: 'pdf',
      icon: '📄',
      title: 'PDF 资料处理规则',
      sections: [
        {
          title: '拆分维度',
          content: `
            <ul>
              <li><strong>按目录拆分</strong> - 有目录的PDF按目录结构进行拆分</li>
              <li><strong>按标题拆分</strong> - 无目录则按标题进行拆分</li>
              <li><strong>杜绝单页</strong> - 禁止出现单独一页的情况</li>
            </ul>
          `
        },
        {
          title: '特殊情况',
          content: '<p>若存在主书+小册子，小册子拆分后需单独建立专辑上传。</p>'
        }
      ]
    },
    {
      keyword: 'ppt',
      icon: '📽️',
      title: 'PPT 资料处理规则',
      sections: [
        {
          title: '处理流程',
          content: `
            <ul>
              <li>检查并删除敏感信息（联系方式、二维码等）</li>
              <li>确认无误后直接上传</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: 'word',
      icon: '📝',
      title: 'WORD 资料处理规则',
      sections: [
        {
          title: '处理流程',
          content: `
            <ul>
              <li>检查并删除敏感信息（联系方式、二维码等）</li>
              <li>确认无误后直接上传</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: '真题',
      icon: '📋',
      title: '真题试卷处理规则',
      sections: [
        {
          title: '高考真题',
          content: '<p><span class="sc-action green">不处理上传</span></p>'
        },
        {
          title: '中考/小升初真题',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        },
        {
          title: '普通真题卷（校考/统考）',
          content: `
            <ul>
              <li>作者打标：<code>教辅精选</code></li>
              <li>发布后在 XMP 后台加入网校通</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: '电子样书',
      icon: '📖',
      title: '电子样书处理规则',
      sections: [
        {
          title: '命名规范',
          content: '<p>专辑名 & 资料名末尾补充 <code>-电子样书</code></p>'
        },
        {
          title: '标签设置',
          content: `
            <ul>
              <li>资料和专辑额外勾选「样书」标签</li>
              <li>资料额外勾选「禁止下载」标签</li>
            </ul>
          `
        },
        {
          title: '其他',
          content: '<p>定价 <code>0元</code>，选择「立即发布」</p>'
        }
      ]
    },
    {
      keyword: '定价',
      icon: '💰',
      title: '上传规则',
      sections: [
        {
          title: '1、定价',
          content: '<p>参考定价文档：<a href="https://docs.qq.com/doc/DUVNLeVZ0TXl5S1VT" target="_blank">查看定价文档 →</a></p>'
        },
        {
          title: '2、发布时间',
          content: '<p>（1）专辑：立即发布</p><p>（2）资料：立即发布1/10，剩余按教学进度发布，一般以月为颗粒度同步</p><p>教学中高考进度统计表：<a href="https://docs.qq.com/sheet/DQW1jb2FtaGVGbHZr?nlc=1&tab=m5junw" target="_blank">点击查看 →</a></p>'
        }
      ]
    },
    {
      keyword: '中考',
      icon: '📋',
      title: '中考相关规则',
      sections: [
        {
          title: '中考真题',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        },
        {
          title: '中考复习资料',
          content: '<p>按通用规则处理：PDF按目录拆分，命名规范等</p>'
        }
      ]
    },
    {
      keyword: '人教',
      icon: '🏷️',
      title: '人教版相关规则',
      sections: [
        {
          title: '专辑命名',
          content: '<p>【人教版】学年 + 年级 + 学科 + 具体名称（版本）</p>'
        },
        {
          title: '通用规则',
          content: '<p>人教版产品遵循通用生产规则，包括资料拆分、命名、专辑设置等。</p>'
        }
      ]
    },
    {
      keyword: '音视频',
      icon: '🎬',
      title: '音视频处理规则',
      sections: [
        {
          title: '必选操作',
          content: '<p>勾选 <span class="sc-action red">「禁止下载」标签</span></p>'
        }
      ]
    },
    {
      keyword: '中职',
      icon: '🏫',
      title: '中职产品规则',
      sections: [
        {
          title: '处理方式',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        }
      ]
    },
    {
      keyword: '专辑',
      icon: '🗂️',
      title: '专辑设置规则',
      sections: [
        {
          title: '专辑目录',
          content: `
            <ul>
              <li><strong>有目录书籍</strong>：1:1 还原目录结构，资料按顺序排序</li>
              <li><strong>同步书籍</strong>：获取主数据目录，资料放入对应目录下</li>
            </ul>
          `
        },
        {
          title: '专辑封面',
          content: `
            <ul>
              <li>无封面 → 使用去年同期产品封面</li>
              <li>去年无 → 智能平台生成，最下标须写：学科网书城</li>
            </ul>
          `
        },
        {
          title: '标签设置',
          content: '<p>专辑"热点""推荐"等标签栏，<strong>不做任何勾选</strong></p>'
        }
      ]
    }
  ];
}

// ========================================
// Toast 提示
// ========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.querySelector('.toast-message').textContent = message;
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ========================================
// 动态样式
// ========================================

// 重置提供者/品牌/系列数据（仅清空本地存储中的录入数据，不影响预置数据）
function resetProviderData() {
  if (!confirm('将清空已录入的提供者/品牌/系列数据，仅保留预置数据。是否继续？')) return;

  // 清空本地存储的相关数据
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, '[]');
  localStorage.setItem(STORAGE_KEYS.BRANDS, '[]');
  localStorage.setItem(STORAGE_KEYS.SERIES, '[]');

  // 重新加载/刷新界面相关下拉选项（尽量让界面回到空状态，用户可重新录入）
  try {
    if (typeof loadBrands === 'function') loadBrands();
    if (typeof loadProviderSelect === 'function') loadProviderSelect();
  } catch (e) {
    // 兜底：忽略刷新错误
  }

  showToast('已清空提供者/品牌/系列数据，请重新录入。');
}
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  .empty-state {
    text-align: center;
    padding: 60px 24px;
    color: var(--text-muted);
  }
  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  .empty-state p {
    font-size: 14px;
  }
  .provider-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .ptag {
    background: rgba(79, 140, 255, 0.1);
    color: var(--primary-blue);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
  }
  .ptag-warn {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
  }
  .custom-rule-box {
    background: linear-gradient(135deg, rgba(79, 140, 255, 0.08) 0%, rgba(124, 92, 246, 0.08) 100%);
    border: 1px solid rgba(79, 140, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
  }
  .rule-display-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-blue);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rule-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(79, 140, 255, 0.1);
  }
  .rule-item .label {
    width: 80px;
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 13px;
  }
  .rule-item .value {
    min-width: 0;
    flex: 1;
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
  .rule-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    min-width: 0;
  }
  .rule-card-header {
    background: linear-gradient(135deg, rgba(79, 140, 255, 0.1) 0%, rgba(124, 92, 246, 0.1) 100%);
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border-light);
  }
  .rule-card-title {
    font-weight: 600;
    color: var(--primary-blue);
    font-size: 15px;
    min-width: 0;
    flex: 1;
    line-height: 1.45;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
  .rule-edit-btn {
    background: var(--primary-cyan);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  .rule-edit-btn:hover {
    opacity: 0.8;
  }
  .rule-card-body {
    padding: 16px;
  }
  .rule-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
    min-width: 0;
  }
  .rule-row:last-child {
    border-bottom: none;
  }
  .rule-label {
    width: 80px;
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 13px;
  }
  .rule-value {
    min-width: 0;
    flex: 1 1 0;
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
  .rule-input {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 13px;
    box-sizing: border-box;
  }
  textarea.rule-input {
    min-height: 4.5rem;
    resize: vertical;
    line-height: 1.45;
  }
  .rule-save-btn {
    background: var(--primary-cyan);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 8px;
  }
  .rule-card-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .rule-delete-btn {
    background: #ff4757;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  .rule-delete-btn:hover {
    background: #ff6b7a;
  }
  .series-tag-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: -6px;
    margin-bottom: 8px;
  }
  .series-tag-label {
    font-size: 13px;
    color: var(--text-muted);
  }
  .series-tag {
    border: 1px solid var(--border-color);
    background: #fff;
    color: var(--text-primary);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    cursor: pointer;
  }
  .series-tag.active {
    border-color: var(--primary-cyan);
    color: var(--primary-cyan);
    background: rgba(34, 211, 238, 0.08);
  }
  .rule-edit-hint {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0 0 12px;
    line-height: 1.5;
  }
  .rule-edit-hint strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;
document.head.appendChild(extraStyles);
