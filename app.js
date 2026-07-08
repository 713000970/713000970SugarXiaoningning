/**
 * 教辅店铺个性化生产规则库 - 应用脚本
 * 构建号需与 index.html 中 app.js?v= 保持一致，便于确认浏览器未缓存旧脚本。
 */
var RULE_LIBRARY_BUILD = '20260708-06';
window.RULE_LIBRARY_BUILD = RULE_LIBRARY_BUILD;

function isMultiUserMode() {
  return !!(window.RULE_LIBRARY_CONFIG && window.RULE_LIBRARY_CONFIG.multiUser);
}

/** 维护：地址栏 ?admin=1 或控制台 localStorage.setItem('rule_library_sync_admin','1') */
function isSyncAdminMode() {
  if (!isMultiUserMode()) return true;
  try {
    if (/[?&]admin=1(?:&|$)/.test(String(location.search || ''))) return true;
    if (localStorage.getItem('rule_library_sync_admin') === '1') return true;
  } catch (e) { /* ignore */ }
  return false;
}

function applyMultiUserUi() {
  if (!isMultiUserMode() || isSyncAdminMode()) return;
  ['force-pull-btn'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });
  var hint = document.getElementById('multi-user-hint');
  if (hint) hint.hidden = false;
}
window.isMultiUserMode = isMultiUserMode;
window.isSyncAdminMode = isSyncAdminMode;

var currentBrand = '';
var currentProvider = '';
var currentEditingBrand = '';
var currentEditingShop = '';
var currentEditingSeries = '';
var aiSeriesFilter = '';
var aiLastMatchedProviders = [];
var aiSeriesTagsExpanded = false;
var providerSeriesTagsExpanded = false;
/** 系列标签默认只渲染前 N 个，避免上千按钮卡死页面 */
var SERIES_TAG_INITIAL_LIMIT = 40;
/** 未选系列时结果卡片最多先渲染条数 */
var AI_RESULT_RENDER_LIMIT = 40;
var showRulesDebounceTimer = null;
/** 正在编辑规则卡片时锁定列表刷新，避免云同步/定时刷新把编辑页冲掉（表现为闪退） */
var providerRuleEditLock = null;

// ========================================
// 数据存储（本地存储）
// ========================================
const STORAGE_KEYS = {
  PROVIDERS: 'rule_library_providers',
  BRANDS: 'rule_library_brands',
  SERIES: 'rule_library_series',
  BRAND_DEFAULTS: 'rule_library_brand_defaults'
};
const APP_LOCAL_DIRTY_KEY = 'rule_library_local_dirty';
const DELETED_BRANDS_KEY = 'rule_library_deleted_brands';
const DELETED_SHOPS_KEY = 'rule_library_deleted_shops';
const DELETED_PROVIDERS_KEY = 'rule_library_deleted_providers';
const DELETED_RULE_CARDS_KEY = 'rule_library_deleted_rule_cards';
const STANDARD_RULE_FILL_DONE_KEY = 'rule_library_standard_fill_v1';
const CHONGWENGE_PROVIDER_NAME = '北京时代圣哲教育科技有限公司';
const CHONGWENGE_SHOP_NAME = '崇文阁';
const CHONGWENGE_ORG_ID = '490090';
const YIBEN_CULTURE_SHOP_NAME = '山东一本图书文化有限公司';
const YIBEN_CULTURE_ORG_ID = '655943';

function providerHasMeaningfulRule(p) {
  if (!p) return false;
  return !!(
    String(p.album || '').trim() ||
    String(p.naming || '').trim() ||
    String(p.split || '').trim() ||
    String(p.pricing || '').trim() ||
    String(p.publishTime || '').trim() ||
    String(p.specialCase || '').trim() ||
    String(p.otherInfo || '').trim()
  );
}

var ALBUM_COVER_BUILD_URL = 'https://bar.xkw.com/cover/build';

function buildDefaultAlbumRule(_bookTitle, providerName) {
  var book = 'XXXX（书籍名称）';
  var provider = String(providerName || '').trim() || 'XXXX（提供者名称）';
  return '1、专辑简介：' + book + '系列资料由' + provider + '提供，并授权学科网在互联网进行发布，侵权必究！\n' +
    '2、专辑封面：若无教辅图书封面，则用智能平台生成，要求最下标必须写学科网书城 ' + ALBUM_COVER_BUILD_URL + '\n' +
    '3、其他：专辑"热点""推荐"等该栏标签不做任何勾选';
}

function resolveAlbumRule(p) {
  var stored = String((p && p.album) || '').trim();
  if (stored) return stored;
  return buildDefaultAlbumRule(null, p && p.name);
}

function resolveAlbumForSave(rawAlbum, brand, series, providerName) {
  var trimmed = String(rawAlbum || '').trim();
  if (trimmed) return trimmed;
  return buildDefaultAlbumRule(null, providerName);
}

/** 平台级默认（新建系列规则卡时填充；个性化在系列卡上改） */
var PLATFORM_RULE_DEFAULTS = {
  naming: '【品牌】学年 + 年级 + 学科 + 对应封面/文件名称（版本）',
  split: '按照各类型规则拆分',
  pricing: '通用规则',
  publishTime: '通用规则',
  specialCase: '/',
  otherInfo: '/'
};

/** 视为「尚未录入规则」的占位值（含旧版默认），用于批量填充 */
var LEGACY_PLACEHOLDER_RULE_VALUES = {
  naming: ['', '待录入', '按教辅通用规范'],
  split: ['', '待录入', '按教辅通用规范'],
  pricing: ['', '待录入', '通用规则'],
  publishTime: ['', '待录入', '立即发布', '通用规则'],
  specialCase: ['', '待录入', '/'],
  otherInfo: ['', '待录入', '/']
};

function isPlaceholderRuleField(field, value) {
  var v = String(value || '').trim();
  var list = LEGACY_PLACEHOLDER_RULE_VALUES[field] || [''];
  return list.indexOf(v) !== -1;
}

/** 命名/拆分/定价等均未个性化录入（全空或仍为占位默认） */
function isUnfilledRuleCard(p) {
  if (!p) return false;
  return isPlaceholderRuleField('naming', p.naming) &&
    isPlaceholderRuleField('split', p.split) &&
    isPlaceholderRuleField('pricing', p.pricing) &&
    isPlaceholderRuleField('publishTime', p.publishTime) &&
    isPlaceholderRuleField('specialCase', p.specialCase) &&
    isPlaceholderRuleField('otherInfo', p.otherInfo);
}

/** 命名尚未录入（空或旧占位） */
function isNamingUnfilled(p) {
  return isPlaceholderRuleField('naming', p && p.naming);
}

function isPlatformDefaultRuleField(field, value) {
  var def = PLATFORM_RULE_DEFAULTS[field];
  if (def === undefined) return false;
  return normalizeText(value) === normalizeText(def);
}

function getStandardRuleFillPayload() {
  return {
    naming: PLATFORM_RULE_DEFAULTS.naming,
    split: PLATFORM_RULE_DEFAULTS.split,
    pricing: PLATFORM_RULE_DEFAULTS.pricing,
    publishTime: PLATFORM_RULE_DEFAULTS.publishTime,
    specialCase: PLATFORM_RULE_DEFAULTS.specialCase,
    otherInfo: PLATFORM_RULE_DEFAULTS.otherInfo
  };
}

function brandDefaultsContextKey(shop, provider, brand) {
  var shopKey = String(shop || '').trim().toLowerCase();
  var provKey = String(provider || '').trim().toLowerCase();
  var brandKey = String(brand || '').trim().toLowerCase();
  return [shopKey, provKey, brandKey].join('|');
}

function getBrandDefaultsMap() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.BRAND_DEFAULTS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveBrandDefaultsMap(map) {
  localStorage.setItem(STORAGE_KEYS.BRAND_DEFAULTS, JSON.stringify(map || {}));
}

function getStoredBrandDefaults(shop, provider, brand) {
  var key = brandDefaultsContextKey(shop, provider, brand);
  var map = getBrandDefaultsMap();
  return map[key] || null;
}

function inferBrandDefaultsFromProviders(shop, provider, brand) {
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var found = null;
  var fields = ['naming', 'split', 'pricing', 'publishTime'];
  providers.forEach(function(p) {
    if (found) return;
    if (!isSameContextProvider(p, shop, provider)) return;
    if (!brandMatchesUi(p && p.brand, brand)) return;
    if (isUnfilledRuleCard(p)) return;
    var inferred = {};
    fields.forEach(function(field) {
      if (!isPlaceholderRuleField(field, p && p[field])) {
        inferred[field] = String(p[field] || '').trim();
      }
    });
    if (Object.keys(inferred).length > 0) found = inferred;
  });
  return found;
}

/** 品牌默认：显式配置 > 同品牌已有规则 > 平台默认 */
function getBrandDefaults(shop, provider, brand) {
  var stored = getStoredBrandDefaults(shop, provider, brand);
  if (stored && (stored.naming || stored.split || stored.pricing || stored.publishTime)) {
    return Object.assign({}, PLATFORM_RULE_DEFAULTS, stored);
  }
  var inferred = inferBrandDefaultsFromProviders(shop, provider, brand);
  if (inferred) {
    return Object.assign({}, PLATFORM_RULE_DEFAULTS, inferred);
  }
  return Object.assign({}, PLATFORM_RULE_DEFAULTS);
}

function setBrandDefaults(shop, provider, brand, fields) {
  var key = brandDefaultsContextKey(shop, provider, brand);
  if (!key.replace(/\|/g, '')) return;
  var map = getBrandDefaultsMap();
  map[key] = {
    naming: String((fields && fields.naming) || '').trim(),
    split: String((fields && fields.split) || '').trim(),
    pricing: String((fields && fields.pricing) || '').trim(),
    publishTime: String((fields && fields.publishTime) || '').trim()
  };
  saveBrandDefaultsMap(map);
}

function buildNewProviderRuleCard(shop, provider, brand, series, bbmSeriesId, bbmOrgId) {
  var defs = getBrandDefaults(shop, provider, brand);
  var card = {
    shop: String(shop || '').trim(),
    shopname: String(shop || '').trim(),
    name: String(provider || '').trim(),
    brand: String(brand || '').trim(),
    series: String(series || '').trim(),
    album: buildDefaultAlbumRule(null, provider),
    naming: defs.naming || '',
    split: defs.split || '',
    pricing: defs.pricing || '',
    publishTime: defs.publishTime || '',
    specialCase: defs.specialCase || PLATFORM_RULE_DEFAULTS.specialCase || '',
    otherInfo: defs.otherInfo || PLATFORM_RULE_DEFAULTS.otherInfo || ''
  };
  if (bbmSeriesId != null && bbmSeriesId !== '') card.bbmSeriesId = bbmSeriesId;
  if (bbmOrgId != null && bbmOrgId !== '') card.bbmOrgId = String(bbmOrgId || '').trim();
  return card;
}

function applyDefaultRulesToExistingCard(p, shop, provider, brand) {
  if (!p) return { changed: false, data: p };
  var defs = getBrandDefaults(shop, provider, brand || p.brand);
  var next = Object.assign({}, p);
  var changed = false;
  if (shop && String(next.shop || '').trim() !== String(shop || '').trim()) {
    next.shop = String(shop || '').trim();
    changed = true;
  }
  if (shop && String(next.shopname || '').trim() !== String(shop || '').trim()) {
    next.shopname = String(shop || '').trim();
    changed = true;
  }
  if (provider && String(next.name || '').trim() !== String(provider || '').trim()) {
    next.name = String(provider || '').trim();
    changed = true;
  }
  if (brand && String(next.brand || '').trim() !== String(brand || '').trim()) {
    next.brand = String(brand || '').trim();
    changed = true;
  }
  ['naming', 'split', 'pricing', 'publishTime', 'specialCase', 'otherInfo'].forEach(function(field) {
    var value = defs[field] || PLATFORM_RULE_DEFAULTS[field] || '';
    if (!value) return;
    if (!isPlaceholderRuleField(field, next[field])) return;
    if (String(next[field] || '').trim() === String(value || '').trim()) return;
    next[field] = value;
    changed = true;
  });
  if (!String(next.album || '').trim()) {
    next.album = buildDefaultAlbumRule(null, next.name || provider);
    changed = true;
  }
  return { changed: changed, data: next };
}

function shouldUseIncomingRuleField(field, currentValue, incomingValue) {
  var incoming = String(incomingValue || '').trim();
  if (!incoming) return false;
  if (isPlaceholderRuleField(field, currentValue)) return true;
  if (isPlatformDefaultRuleField(field, currentValue) && !isPlatformDefaultRuleField(field, incoming)) return true;
  return false;
}

function mergeRuleCardData(base, incoming) {
  var next = Object.assign({}, base || {});
  var changed = false;
  if (!next.id && incoming && incoming.id) {
    next.id = incoming.id;
    changed = true;
  }
  ['shop', 'shopname', 'name', 'brand', 'series'].forEach(function(field) {
    if (!String(next[field] || '').trim() && String((incoming && incoming[field]) || '').trim()) {
      next[field] = incoming[field];
      changed = true;
    }
  });
  ['album', 'naming', 'split', 'pricing', 'publishTime', 'specialCase', 'otherInfo'].forEach(function(field) {
    if (field === 'album') {
      if (!String(next.album || '').trim() && String((incoming && incoming.album) || '').trim()) {
        next.album = incoming.album;
        changed = true;
      }
      return;
    }
    if (shouldUseIncomingRuleField(field, next[field], incoming && incoming[field])) {
      next[field] = incoming[field];
      changed = true;
    }
  });
  if (!next.bbmSeriesId && incoming && incoming.bbmSeriesId) {
    next.bbmSeriesId = incoming.bbmSeriesId;
    changed = true;
  }
  if (!next.bbmOrgId && incoming && incoming.bbmOrgId) {
    next.bbmOrgId = incoming.bbmOrgId;
    changed = true;
  }
  return { changed: changed, data: next };
}

function getBbmSeriesListForBrand(brandName) {
  var orgId = getBbmOrgIdForCurrentShop();
  if (!orgId || !window.BbmBrandApi || typeof BbmBrandApi.getBbmSeriesForBrand !== 'function') return [];
  return BbmBrandApi.getBbmSeriesForBrand(orgId, brandName).map(function(s) {
    return Object.assign({}, s, { orgId: String(orgId || '').trim() });
  });
}

function providerSeriesIdentityKey(p) {
  return [
    normalizeEntityKey(p && p.shop),
    normalizeEntityKey(p && p.shopname),
    normalizeEntityKey(p && p.name),
    normalizeText(p && p.brand),
    normalizeText((p && p.series) || '')
  ].join('|');
}

function buildBbmSeriesLookup(seriesList) {
  var byId = {};
  var byName = {};
  (seriesList || []).forEach(function(s) {
    if (!s) return;
    var id = String(s.id || '').trim();
    var name = normalizeText(s.name || '');
    if (id) byId[id] = s;
    if (name) byName[name] = s;
  });
  return { byId: byId, byName: byName };
}

function isDefaultOrPlaceholderRuleField(field, value) {
  if (field === 'split' && normalizeText(value) === normalizeText('通用规则')) return true;
  return isPlaceholderRuleField(field, value) || isPlatformDefaultRuleField(field, value);
}

function isAutoGeneratedBbmRuleCard(p) {
  if (!p || !String(p.bbmSeriesId || '').trim()) return false;
  return ['naming', 'split', 'pricing', 'publishTime', 'specialCase', 'otherInfo'].every(function(field) {
    return isDefaultOrPlaceholderRuleField(field, p && p[field]);
  });
}

function isStaleBbmSeriesForCurrentOrg(p, seriesList, orgId) {
  if (!p || (!String(p.bbmSeriesId || '').trim() && !String(p.bbmOrgId || '').trim())) return false;
  if (!seriesList || !seriesList.length) return false;
  var lookup = buildBbmSeriesLookup(seriesList);
  var id = String(p.bbmSeriesId || '').trim();
  if (id && lookup.byId[id]) return false;
  var name = normalizeText((p && p.series) || '');
  if (name && lookup.byName[name]) return false;
  if (p.bbmOrgId && orgId && String(p.bbmOrgId) === String(orgId)) return false;
  return true;
}

function pruneStaleBbmSeriesRuleCardsForContext(providers, shopName, providerName, brandName, seriesList, orgId) {
  var list = Array.isArray(providers) ? providers.slice() : [];
  if (!seriesList || !seriesList.length) {
    return { providers: list, changed: false, removed: 0, relinked: 0, hidden: 0 };
  }
  var lookup = buildBbmSeriesLookup(seriesList);
  var changed = false;
  var removed = 0;
  var relinked = 0;
  var hidden = 0;
  var removeIdx = {};
  list.forEach(function(p, i) {
    if (!p || isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!String((p && p.series) || '').trim()) return;
    if (!String(p.bbmSeriesId || '').trim() && !String(p.bbmOrgId || '').trim()) return;

    var id = String(p.bbmSeriesId || '').trim();
    var name = normalizeText(p.series || '');
    if (id && lookup.byId[id]) {
      if (orgId && String(p.bbmOrgId || '') !== String(orgId)) {
        list[i] = Object.assign({}, p, { bbmOrgId: String(orgId) });
        changed = true;
        relinked += 1;
      }
      return;
    }
    if (name && lookup.byName[name]) {
      var current = lookup.byName[name];
      list[i] = Object.assign({}, p, {
        bbmSeriesId: current.id,
        bbmOrgId: String(orgId || current.orgId || '')
      });
      changed = true;
      relinked += 1;
      return;
    }

    hidden += 1;
    if (isAutoGeneratedBbmRuleCard(p)) {
      removeIdx[i] = true;
      removed += 1;
    }
  });

  if (removed > 0) {
    list = list.filter(function(_, i) { return !removeIdx[i]; });
    changed = true;
  }
  return { providers: list, changed: changed, removed: removed, relinked: relinked, hidden: hidden };
}

function contextSeriesIdentityKey(p, shopName, providerName) {
  return [
    normalizeEntityKey(shopName || (p && (p.shop || p.shopname))),
    normalizeEntityKey(providerName || (p && p.name)),
    normalizeText(p && p.brand),
    normalizeText((p && p.series) || '')
  ].join('|');
}

function repairSeriesRulesForContext(providers, shopName, providerName, brandName) {
  var list = Array.isArray(providers) ? providers.slice() : [];
  shopName = String(shopName || '').trim();
  providerName = String(providerName || '').trim();
  brandName = String(brandName || '').trim();
  if (!shopName || !providerName || !brandName) {
    return { providers: list, changed: false, filled: 0, deduped: 0 };
  }

  var changed = false;
  var filled = 0;
  var groups = {};
  list.forEach(function(p, i) {
    if (!p || isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!String((p && p.series) || '').trim()) return;

    var fill = applyDefaultRulesToExistingCard(p, shopName, providerName, brandName);
    if (fill.changed) {
      list[i] = fill.data;
      p = list[i];
      changed = true;
      filled += 1;
    }

    var key = contextSeriesIdentityKey(p, shopName, providerName);
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  var removeIdx = {};
  var deduped = 0;
  Object.keys(groups).forEach(function(key) {
    var indices = groups[key];
    if (indices.length <= 1) return;
    var keep = indices[0];
    indices.slice(1).forEach(function(i) {
      var merged = mergeRuleCardData(list[keep], list[i]);
      if (merged.changed) {
        list[keep] = merged.data;
        changed = true;
      }
      removeIdx[i] = true;
    });
    deduped += indices.length - 1;
  });

  if (deduped > 0) {
    list = list.filter(function(_, i) { return !removeIdx[i]; });
    changed = true;
  }

  return { providers: list, changed: changed, filled: filled, deduped: deduped };
}

function dedupeMatchedRuleItemsForDisplay(items, shopName, providerName) {
  var map = {};
  var result = [];
  (items || []).forEach(function(item) {
    var p = item && item.data ? item.data : {};
    if (!String((p && p.series) || '').trim()) {
      result.push(item);
      return;
    }
    var key = contextSeriesIdentityKey(p, shopName, providerName);
    if (!map[key]) {
      map[key] = { item: item, resultIndex: result.length };
      result.push(item);
      return;
    }
    var existing = map[key].item;
    var merged = mergeRuleCardData(existing.data, p);
    if (merged.changed) {
      existing.data = merged.data;
      result[map[key].resultIndex] = existing;
    }
  });
  return result;
}

function providerDuplicateIdentityKey(p) {
  var shopKey = normalizeEntityKey((p && p.shopname) || (p && p.shop) || (p && p.name));
  var providerKey = normalizeEntityKey(p && p.name);
  var brandKey = normalizeText(p && p.brand);
  var seriesKey = normalizeText((p && p.series) || '');
  if (!shopKey && !providerKey && !brandKey && !seriesKey) return '';
  return [shopKey, providerKey, brandKey, seriesKey].join('|');
}

function providerSuspectIdentityKey(p) {
  var providerKey = normalizeEntityKey(p && p.name);
  var brandKey = normalizeText(p && p.brand);
  var seriesKey = normalizeText((p && p.series) || '');
  if (!providerKey && !brandKey && !seriesKey) return '';
  return [providerKey, brandKey, seriesKey].join('|');
}

function providerRuleCompletenessScore(p) {
  if (!p) return 0;
  var score = 0;
  if (String(p.id || '').trim()) score += 1;
  if (String(p.bbmSeriesId || '').trim()) score += 2;
  if (String(p.shop || '').trim()) score += 1;
  if (String(p.shopname || '').trim()) score += 1;
  if (String(p.album || '').trim()) score += 1;
  ['naming', 'split', 'pricing', 'publishTime', 'specialCase', 'otherInfo'].forEach(function(field) {
    if (!isPlaceholderRuleField(field, p && p[field])) score += 3;
    else if (String((p && p[field]) || '').trim()) score += 1;
  });
  return score;
}

function compactDuplicateProviderRules(providers) {
  var list = Array.isArray(providers) ? providers.slice() : getData(STORAGE_KEYS.PROVIDERS);
  var groups = {};
  list.forEach(function(p, i) {
    var key = providerDuplicateIdentityKey(p);
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  var removeIdx = {};
  var duplicateGroups = 0;
  var removed = 0;
  var changed = false;

  Object.keys(groups).forEach(function(key) {
    var indices = groups[key];
    if (indices.length <= 1) return;
    duplicateGroups += 1;
    var keep = indices[0];
    indices.forEach(function(i) {
      if (providerRuleCompletenessScore(list[i]) > providerRuleCompletenessScore(list[keep])) keep = i;
    });
    indices.forEach(function(i) {
      if (i === keep) return;
      var merged = mergeRuleCardData(list[keep], list[i]);
      if (merged.changed) {
        list[keep] = merged.data;
        changed = true;
      }
      removeIdx[i] = true;
      removed += 1;
    });
  });

  if (removed > 0) {
    list = list.filter(function(_, i) { return !removeIdx[i]; });
    changed = true;
  }

  return {
    list: list,
    changed: changed,
    duplicateGroups: duplicateGroups,
    removed: removed,
    before: Array.isArray(providers) ? providers.length : getData(STORAGE_KEYS.PROVIDERS).length,
    after: list.length
  };
}

function auditProviderDuplicateStats(providers) {
  var list = Array.isArray(providers) ? providers : getData(STORAGE_KEYS.PROVIDERS);
  var groups = {};
  var suspectGroups = {};
  var seriesRows = 0;
  var blankSeriesRows = 0;
  (list || []).forEach(function(p) {
    var key = providerDuplicateIdentityKey(p);
    if (key) groups[key] = (groups[key] || 0) + 1;
    var suspectKey = providerSuspectIdentityKey(p);
    if (suspectKey) suspectGroups[suspectKey] = (suspectGroups[suspectKey] || 0) + 1;
    if (String((p && p.series) || '').trim()) seriesRows += 1;
    else blankSeriesRows += 1;
  });
  var duplicateGroups = 0;
  var duplicateRows = 0;
  var suspectDuplicateGroups = 0;
  var suspectDuplicateRows = 0;
  Object.keys(groups).forEach(function(key) {
    if (groups[key] <= 1) return;
    duplicateGroups += 1;
    duplicateRows += groups[key] - 1;
  });
  Object.keys(suspectGroups).forEach(function(key) {
    if (suspectGroups[key] <= 1) return;
    suspectDuplicateGroups += 1;
    suspectDuplicateRows += suspectGroups[key] - 1;
  });
  return {
    total: (list || []).length,
    duplicateGroups: duplicateGroups,
    duplicateRows: duplicateRows,
    unique: (list || []).length - duplicateRows,
    suspectDuplicateGroups: suspectDuplicateGroups,
    suspectDuplicateRows: suspectDuplicateRows,
    seriesRows: seriesRows,
    blankSeriesRows: blankSeriesRows
  };
}

/** 书城系列改名后：按 bbmSeriesId / 1:1 孤儿匹配重命名本地卡，并合并重复系列卡 */
function syncBbmSeriesNamesForBrand(shopName, providerName, brandName, providersOpt) {
  shopName = String(shopName || '').trim();
  providerName = String(providerName || '').trim();
  brandName = String(brandName || '').trim();
  if (!shopName || !providerName || !brandName) {
    return { renamed: 0, deduped: 0, changed: false, providers: providersOpt || getData(STORAGE_KEYS.PROVIDERS) };
  }

  var seriesList = getBbmSeriesListForBrand(brandName);
  var providers = Array.isArray(providersOpt) ? providersOpt.slice() : getData(STORAGE_KEYS.PROVIDERS);
  if (!seriesList.length) return { renamed: 0, deduped: 0, changed: false, providers: providers };
  var orgId = (seriesList[0] && seriesList[0].orgId) || getBbmOrgIdForCurrentShop();
  var lookup = buildBbmSeriesLookup(seriesList);
  var bbmNameSet = {};
  seriesList.forEach(function(s) { bbmNameSet[normalizeText(s.name)] = true; });
  var renamed = 0;
  var relinked = 0;

  providers.forEach(function(p, i) {
    if (isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!p.bbmSeriesId) return;
    var bbm = lookup.byId[String(p.bbmSeriesId)];
    if (!bbm) {
      var sameName = lookup.byName[normalizeText(p.series || '')];
      if (sameName) {
        providers[i] = Object.assign({}, p, {
          bbmSeriesId: sameName.id,
          bbmOrgId: String(orgId || sameName.orgId || '')
        });
        relinked += 1;
      }
      return;
    }
    if (orgId && String(p.bbmOrgId || '') !== String(orgId)) {
      providers[i] = Object.assign({}, p, { bbmOrgId: String(orgId) });
      p = providers[i];
      relinked += 1;
    }
    if (normalizeText(p.series) !== normalizeText(bbm.name)) {
      var renamedRule = Object.assign({}, p, { series: bbm.name });
      if (isRuleCardDeleted(renamedRule, shopName)) return;
      providers[i] = renamedRule;
      renamed += 1;
    }
  });

  providers.forEach(function(p, i) {
    if (isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (p.bbmSeriesId) return;
    var sn = normalizeText(p.series);
    if (!sn) return;
    var bbm = seriesList.find(function(s) { return normalizeText(s.name) === sn; });
    if (bbm) providers[i] = Object.assign({}, p, { bbmSeriesId: bbm.id, bbmOrgId: String(orgId || bbm.orgId || '') });
  });

  function matchedBbmIdSet() {
    var set = {};
    providers.forEach(function(p) {
      if (isRuleCardDeleted(p, shopName)) return;
      if (!isSameContextProvider(p, shopName, providerName)) return;
      if (!brandMatchesUi(p && p.brand, brandName)) return;
      if (!String(p.series || '').trim()) return;
      if (p.bbmSeriesId) {
        set[String(p.bbmSeriesId)] = true;
        return;
      }
      if (bbmNameSet[normalizeText(p.series)]) {
        var hit = seriesList.find(function(s) { return normalizeText(s.name) === normalizeText(p.series); });
        if (hit) set[String(hit.id)] = true;
      }
    });
    return set;
  }

  var orphanLocals = [];
  providers.forEach(function(p) {
    if (isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!String(p.series || '').trim()) return;
    if (p.bbmSeriesId) return;
    if (!bbmNameSet[normalizeText(p.series)]) orphanLocals.push(p);
  });

  var matchedIds = matchedBbmIdSet();
  var unmatchedBbm = seriesList.filter(function(s) { return !matchedIds[String(s.id)]; });

  if (orphanLocals.length === 1 && unmatchedBbm.length === 1) {
    var orphanKey = normalizeText(orphanLocals[0].series);
    var target = unmatchedBbm[0];
    providers.forEach(function(p, i) {
      if (isRuleCardDeleted(p, shopName)) return;
      if (!isSameContextProvider(p, shopName, providerName)) return;
      if (!brandMatchesUi(p && p.brand, brandName)) return;
      if (p.bbmSeriesId) return;
      if (normalizeText(p.series) !== orphanKey) return;
      var renamedOrphan = Object.assign({}, p, { series: target.name, bbmSeriesId: target.id, bbmOrgId: String(orgId || target.orgId || '') });
      if (isRuleCardDeleted(renamedOrphan, shopName)) return;
      providers[i] = renamedOrphan;
      renamed += 1;
    });
  }

  var deduped = 0;
  var groups = {};
  providers.forEach(function(p, i) {
    if (isRuleCardDeleted(p, shopName)) return;
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!String(p.series || '').trim()) return;
    var key = contextSeriesIdentityKey(p, shopName, providerName);
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  var removeIdx = {};
  Object.keys(groups).forEach(function(key) {
    var indices = groups[key];
    if (indices.length <= 1) return;
    var best = indices[0];
    indices.forEach(function(i) {
      if (providerHasMeaningfulRule(providers[i]) && !providerHasMeaningfulRule(providers[best])) best = i;
    });
    indices.forEach(function(i) {
      if (i !== best) {
        var merged = mergeRuleCardData(providers[best], providers[i]);
        if (merged.changed) providers[best] = merged.data;
        removeIdx[i] = true;
      }
    });
    deduped += indices.length - 1;
  });

  if (Object.keys(removeIdx).length) {
    providers = providers.filter(function(_, i) { return !removeIdx[i]; });
  }

  return { renamed: renamed, deduped: deduped, relinked: relinked, changed: renamed > 0 || deduped > 0 || relinked > 0, providers: providers };
}

function isSeriesRuleBlank(p) {
  return isUnfilledRuleCard(p);
}

function seriesRuleExists(providers, shop, provider, brand, seriesName, bbmSeriesId) {
  var normSeries = normalizeText(seriesName);
  var probe = buildRuleCardDeletionProbe(shop, provider, brand, seriesName);
  if (isRuleCardDeleted(probe, shop)) return true;
  return providers.some(function(p) {
    if (isRuleCardDeleted(p, shop)) return false;
    if (!isSameContextProvider(p, shop, provider)) return false;
    if (!brandMatchesUi(p && p.brand, brand)) return false;
    if (bbmSeriesId != null && bbmSeriesId !== '' && String(p.bbmSeriesId) === String(bbmSeriesId)) return true;
    return normalizeText(String((p && p.series) || '').trim()) === normSeries;
  });
}

var _ensureBbmSeriesInflight = false;

/** 书城系列自动建卡并填充品牌默认（命名/拆分/定价等） */
async function ensureBbmSeriesRuleCardsForBrand(shopName, providerName, brandName, options) {
  options = options || {};
  shopName = String(shopName || '').trim();
  providerName = String(providerName || '').trim();
  brandName = String(brandName || '').trim();
  if (!shopName || !providerName || !brandName) return { created: 0 };

  var seriesList = getBbmSeriesListForBrand(brandName);
  if (!seriesList.length) return { created: 0 };

  if (_ensureBbmSeriesInflight) return { created: 0, skipped: true };
  _ensureBbmSeriesInflight = true;
  try {
    var syncResult = syncBbmSeriesNamesForBrand(shopName, providerName, brandName, getData(STORAGE_KEYS.PROVIDERS));
    var providers = syncResult.providers || getData(STORAGE_KEYS.PROVIDERS);
    var created = 0;
    var renamed = syncResult.renamed || 0;
    var deduped = syncResult.deduped || 0;
    var relinked = syncResult.relinked || 0;
    var staleRemoved = 0;
    var filled = 0;
    var orgId = (seriesList[0] && seriesList[0].orgId) || getBbmOrgIdForCurrentShop();

    var pruneResult = pruneStaleBbmSeriesRuleCardsForContext(providers, shopName, providerName, brandName, seriesList, orgId);
    providers = pruneResult.providers;
    staleRemoved = pruneResult.removed || 0;
    relinked += pruneResult.relinked || 0;

    seriesList.forEach(function(item) {
      var seriesName = item.name;
      if (seriesRuleExists(providers, shopName, providerName, brandName, seriesName, item.id)) return;
      var candidate = buildNewProviderRuleCard(shopName, providerName, brandName, seriesName, item.id, orgId || item.orgId);
      if (isRuleCardDeleted(candidate, shopName)) return;
      providers.push(candidate);
      created += 1;
    });

    var repairResult = repairSeriesRulesForContext(providers, shopName, providerName, brandName);
    providers = repairResult.providers;
    filled = repairResult.filled || 0;
    deduped += repairResult.deduped || 0;

    if (created > 0 || syncResult.changed || repairResult.changed || pruneResult.changed) {
      if (typeof persistProviders === 'function') {
        await persistProviders(providers, { awaitCloud: !!options.awaitCloud });
      } else {
        setData(STORAGE_KEYS.PROVIDERS, providers);
      }
      if (!options.silent && typeof showToast === 'function') {
        if (renamed > 0) {
          showToast('已同步书城系列改名 ' + renamed + ' 条' + (deduped ? '，合并重复 ' + deduped + ' 条' : ''));
        } else if (staleRemoved > 0) {
          showToast('已清理旧机构书城系列 ' + staleRemoved + ' 条');
        } else if (created > 0) {
          showToast('已为书城 ' + created + ' 个系列创建规则卡（已填默认）');
        } else if (filled > 0) {
          showToast('已补齐已有系列默认规则 ' + filled + ' 条' + (deduped ? '，合并重复 ' + deduped + ' 条' : ''));
        } else if (deduped > 0) {
          showToast('已合并重复系列规则卡 ' + deduped + ' 条');
        }
      }
    }
    return { created: created, renamed: renamed, deduped: deduped, relinked: relinked, staleRemoved: staleRemoved, filled: filled };
  } finally {
    _ensureBbmSeriesInflight = false;
  }
}

function renderBrandDefaultsPanel(shopName, providerName, brandName) {
  var panel = document.getElementById('brand-defaults-panel');
  if (!panel) return;
  shopName = String(shopName || '').trim();
  providerName = String(providerName || '').trim();
  brandName = String(brandName || '').trim();
  if (!shopName || !providerName || !brandName) {
    panel.style.display = 'none';
    return;
  }
  var defs = getBrandDefaults(shopName, providerName, brandName);
  var stored = getStoredBrandDefaults(shopName, providerName, brandName);
  var sourceHint = stored ? '已保存的品牌默认' : (inferBrandDefaultsFromProviders(shopName, providerName, brandName) ? '继承自本品牌已有规则' : '平台默认（新建系列时自动填充）');
  panel.style.display = 'block';
  panel.innerHTML =
    '<div class="brand-defaults-header">' +
      '<span class="brand-defaults-title">📌 品牌默认规则</span>' +
      '<span class="brand-defaults-source">' + escapeHtmlText(sourceHint) + '</span>' +
    '</div>' +
    '<p class="brand-defaults-desc">新建系列规则卡时自动填充；有个性化需求在系列卡上修改即可。</p>' +
    '<div class="brand-defaults-grid">' +
      '<label class="brand-defaults-field"><span>命名</span><textarea id="brand-def-naming" class="rule-input alt-space-newline" rows="2"></textarea></label>' +
      '<label class="brand-defaults-field"><span>拆分</span><textarea id="brand-def-split" class="rule-input alt-space-newline" rows="2"></textarea></label>' +
      '<label class="brand-defaults-field"><span>定价</span><textarea id="brand-def-pricing" class="rule-input alt-space-newline" rows="2"></textarea></label>' +
      '<label class="brand-defaults-field"><span>发布时间</span><textarea id="brand-def-publishTime" class="rule-input alt-space-newline" rows="2"></textarea></label>' +
    '</div>' +
    '<div class="brand-defaults-actions">' +
      '<button type="button" class="btn-add-sm" onclick="saveBrandDefaultsFromPanel()">保存品牌默认</button>' +
      '<button type="button" class="btn-add-sm btn-muted-sm" onclick="applyBrandDefaultsToBlankSeries()">应用到空白系列卡</button>' +
    '</div>';
  var elNaming = document.getElementById('brand-def-naming');
  var elSplit = document.getElementById('brand-def-split');
  var elPricing = document.getElementById('brand-def-pricing');
  var elPub = document.getElementById('brand-def-publishTime');
  if (elNaming) elNaming.value = defs.naming || '';
  if (elSplit) elSplit.value = defs.split || '';
  if (elPricing) elPricing.value = defs.pricing || '';
  if (elPub) elPub.value = defs.publishTime || '';
}

function readBrandDefaultsPanelFields() {
  return {
    naming: (document.getElementById('brand-def-naming') && document.getElementById('brand-def-naming').value || '').trim(),
    split: (document.getElementById('brand-def-split') && document.getElementById('brand-def-split').value || '').trim(),
    pricing: (document.getElementById('brand-def-pricing') && document.getElementById('brand-def-pricing').value || '').trim(),
    publishTime: (document.getElementById('brand-def-publishTime') && document.getElementById('brand-def-publishTime').value || '').trim()
  };
}

async function saveBrandDefaultsFromPanel() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var brandName = (document.getElementById('brand-input')?.value || '').trim();
  if (!shopName || !providerName || !brandName) {
    showToast('请先选择店铺、提供者、品牌');
    return;
  }
  var fields = readBrandDefaultsPanelFields();
  setBrandDefaults(shopName, providerName, brandName, fields);
  renderBrandDefaultsPanel(shopName, providerName, brandName);
  showToast('已保存品牌「' + brandName + '」默认规则');
}

async function applyBrandDefaultsToBlankSeries() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var brandName = (document.getElementById('brand-input')?.value || '').trim();
  if (!shopName || !providerName || !brandName) {
    showToast('请先选择店铺、提供者、品牌');
    return;
  }
  var fields = readBrandDefaultsPanelFields();
  setBrandDefaults(shopName, providerName, brandName, fields);
  var defs = getBrandDefaults(shopName, providerName, brandName);
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var updated = 0;
  providers.forEach(function(p, i) {
    if (!isSameContextProvider(p, shopName, providerName)) return;
    if (!brandMatchesUi(p && p.brand, brandName)) return;
    if (!String((p && p.series) || '').trim()) return;
    if (!isSeriesRuleBlank(p)) return;
    providers[i] = Object.assign({}, p, {
      naming: defs.naming || '',
      split: defs.split || '',
      pricing: defs.pricing || '',
      publishTime: defs.publishTime || '',
      specialCase: defs.specialCase || PLATFORM_RULE_DEFAULTS.specialCase || '',
      otherInfo: defs.otherInfo || PLATFORM_RULE_DEFAULTS.otherInfo || ''
    });
    updated += 1;
  });
  if (!updated) {
    showToast('没有需要填充的空白系列卡');
    return;
  }
  if (typeof persistProviders === 'function') {
    await persistProviders(providers, { awaitCloud: true });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, providers);
  }
  showToast('已为 ' + updated + ' 张空白系列卡填入品牌默认');
  showRulesByBrandAndShop(brandName, shopName, '', true);
}

window.saveBrandDefaultsFromPanel = saveBrandDefaultsFromPanel;
window.applyBrandDefaultsToBlankSeries = applyBrandDefaultsToBlankSeries;

window.onBbmBrandsFetched = function() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var brandName = (document.getElementById('brand-input')?.value || '').trim();
  if (!shopName || !providerName) return;

  var orgId = getBbmOrgIdForCurrentShop();
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var totalRenamed = 0;
  var totalDeduped = 0;
  var syncChanged = false;

  if (orgId && window.BbmBrandApi) {
    (BbmBrandApi.getCachedBrands(orgId, true) || []).forEach(function(b) {
      if (!b || !b.name) return;
      var sync = syncBbmSeriesNamesForBrand(shopName, providerName, b.name, providers);
      providers = sync.providers || providers;
      if (sync.changed) {
        syncChanged = true;
        totalRenamed += sync.renamed || 0;
        totalDeduped += sync.deduped || 0;
      }
    });
  }

  var afterSync = function() {
    if (!brandName) return;
    ensureBbmSeriesRuleCardsForBrand(shopName, providerName, brandName, { silent: true, awaitCloud: true })
      .then(function() {
        showRulesByBrandAndShop(brandName, shopName, '', true);
      });
  };

  if (syncChanged) {
    var persist = typeof persistProviders === 'function'
      ? persistProviders(providers, { awaitCloud: true })
      : Promise.resolve(setData(STORAGE_KEYS.PROVIDERS, providers));
    persist.then(function() {
      if (typeof showToast === 'function' && totalRenamed > 0) {
        showToast('已同步书城系列改名 ' + totalRenamed + ' 条' + (totalDeduped ? '，合并重复 ' + totalDeduped + ' 条' : ''));
      }
      afterSync();
    }).catch(afterSync);
    return;
  }

  if (!brandName) return;
  ensureBbmSeriesRuleCardsForBrand(shopName, providerName, brandName, { silent: false, awaitCloud: true })
    .then(function(res) {
      if (res && res.renamed > 0 && typeof showToast === 'function') {
        showToast('已同步书城系列改名 ' + res.renamed + ' 条' + (res.deduped ? '，合并重复 ' + res.deduped + ' 条' : ''));
      }
      showRulesByBrandAndShop(brandName, shopName, '', true);
    });
};

/** 是否为系统生成的三行专辑模板（书籍名尚为品牌/系列，非 XXXX 占位） */
function isLegacyAutoAlbumTemplate(album) {
  var text = String(album || '').trim();
  if (!text || text.indexOf('XXXX（书籍名称）') !== -1) return false;
  if (text.indexOf('1、专辑简介：') !== 0) return false;
  if (text.indexOf('2、专辑封面：') === -1 || text.indexOf('3、其他：') === -1) return false;
  if (text.indexOf('系列资料由') === -1 || text.indexOf('提供，并授权学科网') === -1) return false;
  return /^1、专辑简介：.+系列资料由/.test(text.split('\n')[0] || text);
}

function migrateLegacyAlbumBookPlaceholder(album, providerName) {
  if (!isLegacyAutoAlbumTemplate(album)) return String(album || '');
  var text = String(album || '').trim();
  var m = text.match(/系列资料由(.+?)提供，并授权学科网/);
  var provider = (m && m[1] ? m[1].trim() : '') || String(providerName || '').trim();
  return buildDefaultAlbumRule(null, provider);
}

/**
 * 批量把旧默认专辑（品牌/系列作书名）改为 XXXX（书籍名称）；可重复执行，已是新格式则跳过。
 * @returns {{ list: Array, changed: number }}
 */
function migrateLegacyAlbumBookPlaceholders(providers) {
  var list = Array.isArray(providers) ? providers.slice() : getData(STORAGE_KEYS.PROVIDERS);
  var changed = 0;
  list.forEach(function(p, i) {
    if (!p || !isLegacyAutoAlbumTemplate(p.album)) return;
    var next = migrateLegacyAlbumBookPlaceholder(p.album, p.name);
    if (next && next !== String(p.album || '').trim()) {
      list[i] = Object.assign({}, p, { album: next });
      changed += 1;
    }
  });
  return { list: list, changed: changed };
}

async function runLegacyAlbumBookPlaceholderMigration() {
  var result = migrateLegacyAlbumBookPlaceholders();
  if (!result.changed) return result;
  console.log('[规则库] 专辑简介占位符迁移：' + result.changed + ' 条 → XXXX（书籍名称）');
  if (typeof persistProviders === 'function') {
    await persistProviders(result.list, { awaitCloud: true });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, result.list);
  }
  if (typeof showToast === 'function') {
    showToast('已自动更新 ' + result.changed + ' 条专辑简介为 XXXX（书籍名称）');
  }
  return result;
}

window.migrateLegacyAlbumBookPlaceholders = migrateLegacyAlbumBookPlaceholders;
window.runLegacyAlbumBookPlaceholderMigration = runLegacyAlbumBookPlaceholderMigration;

/**
 * 为所有「无规则/仅占位」卡片统一填入平台标准规则。
 * @returns {{ list: Array, changed: number }}
 */
function migrateUnfilledRuleCards(providers) {
  var list = Array.isArray(providers) ? providers.slice() : getData(STORAGE_KEYS.PROVIDERS);
  var fill = getStandardRuleFillPayload();
  var changed = 0;
  list.forEach(function(p, i) {
    if (!isUnfilledRuleCard(p)) return;
    list[i] = Object.assign({}, p, fill);
    changed += 1;
  });
  return { list: list, changed: changed };
}

async function runStandardRuleFillMigration(options) {
  options = options || {};
  if (!options.force && localStorage.getItem(STANDARD_RULE_FILL_DONE_KEY) === '1') {
    return { list: getData(STORAGE_KEYS.PROVIDERS), changed: 0, skipped: true };
  }
  var result = migrateUnfilledRuleCards();
  var namingResult = migrateMissingNamingRuleCards(result.list);
  var finalList = namingResult.list;
  var totalChanged = result.changed + namingResult.changed;
  localStorage.setItem(STANDARD_RULE_FILL_DONE_KEY, '1');
  if (!totalChanged) return { list: finalList, changed: 0 };
  console.log('[规则库] 标准规则填充：全量 ' + result.changed + ' 条，补命名 ' + namingResult.changed + ' 条');
  if (typeof persistProviders === 'function') {
    await persistProviders(finalList, { awaitCloud: true });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, finalList);
  }
  if (typeof showToast === 'function') {
    var msg = '已更新 ' + totalChanged + ' 张规则卡';
    if (namingResult.changed > 0) {
      msg = '已为 ' + namingResult.changed + ' 张卡片补全命名规则' +
        (result.changed > 0 ? '（另 ' + result.changed + ' 张全量填充）' : '');
    }
    showToast(msg);
  }
  if (typeof updateStats === 'function') updateStats();
  return { list: finalList, changed: totalChanged };
}

/**
 * 仅补「命名」：其它字段已有个性化内容、命名仍为空的卡片。
 * @returns {{ list: Array, changed: number }}
 */
function migrateMissingNamingRuleCards(providers) {
  var list = Array.isArray(providers) ? providers.slice() : getData(STORAGE_KEYS.PROVIDERS);
  var standardNaming = PLATFORM_RULE_DEFAULTS.naming;
  var changed = 0;
  list.forEach(function(p, i) {
    if (!isNamingUnfilled(p)) return;
    if (isUnfilledRuleCard(p)) return;
    list[i] = Object.assign({}, p, { naming: standardNaming });
    changed += 1;
  });
  return { list: list, changed: changed };
}

async function runMissingNamingRuleFillMigration() {
  var result = migrateMissingNamingRuleCards();
  if (!result.changed) return result;
  console.log('[规则库] 补全命名：' + result.changed + ' 条');
  if (typeof persistProviders === 'function') {
    await persistProviders(result.list, { awaitCloud: true });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, result.list);
  }
  if (typeof showToast === 'function') {
    showToast('已为 ' + result.changed + ' 张卡片补全命名规则');
  }
  if (typeof updateStats === 'function') updateStats();
  return result;
}

window.migrateUnfilledRuleCards = migrateUnfilledRuleCards;
window.migrateMissingNamingRuleCards = migrateMissingNamingRuleCards;
window.runStandardRuleFillMigration = runStandardRuleFillMigration;
window.runMissingNamingRuleFillMigration = runMissingNamingRuleFillMigration;

function migrateChongwengeShopName(providers) {
  var list = Array.isArray(providers) ? providers.slice() : getData(STORAGE_KEYS.PROVIDERS);
  var changed = 0;
  list.forEach(function(p, i) {
    if (!p) return;
    var providerMatch = isEntityMatched(p.name, CHONGWENGE_PROVIDER_NAME);
    var oldShopMatch =
      isEntityMatched(p.shop, CHONGWENGE_PROVIDER_NAME) ||
      isEntityMatched(p.shopname, CHONGWENGE_PROVIDER_NAME);
    var alreadyShop =
      isEntityMatched(p.shop, CHONGWENGE_SHOP_NAME) &&
      isEntityMatched(p.shopname, CHONGWENGE_SHOP_NAME);
    if (!providerMatch && !oldShopMatch) return;
    if (alreadyShop) return;
    list[i] = Object.assign({}, p, {
      shop: CHONGWENGE_SHOP_NAME,
      shopname: CHONGWENGE_SHOP_NAME
    });
    changed += 1;
  });
  return { list: list, changed: changed };
}

async function runChongwengeShopNameMigration() {
  var result = migrateChongwengeShopName();
  if (!result.changed) return result;
  console.log('[规则库] 已修正崇文阁店铺名称：' + result.changed + ' 条');
  if (typeof persistProviders === 'function') {
    await persistProviders(result.list, { awaitCloud: true });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, result.list);
  }
  if (typeof updateStats === 'function') updateStats();
  return result;
}

window.migrateChongwengeShopName = migrateChongwengeShopName;
window.runChongwengeShopNameMigration = runChongwengeShopNameMigration;
window.correctChongwengeInputs = correctChongwengeInputs;

// 默认数据
const defaultData = {
  providers: [],
  brands: [],
  series: []
};

// 初始化数据（优先 CSV 官方表，见 data-bootstrap.js / providers-from-csv.json）
function initData() {
  var existingData = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  if (existingData && existingData !== '[]') {
    if (typeof updateStats === 'function') updateStats();
    return;
  }
  if (typeof presetData !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(presetData.brands.map(function(n, i) { return { id: String(i+1), name: n }; })));
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify([]));
  }
  if (typeof updateStats === 'function') updateStats();
}

function initCollapsibles() {
  // 占位函数
}

// 重置为官方数据（优先 CSV 表 providers-from-csv.json，约 2361 条）
function resetToPresetData() {
  if (isMultiUserMode() && !isSyncAdminMode()) {
    alert('多人协作模式下已禁用全库重置。请联系管理员。');
    return;
  }
  if (!confirm('确定要重置所有数据吗？将恢复为「教辅生产说明」CSV 官方表（约 2361 条）。')) return;
  (async function() {
    try {
      if (typeof ensureOfficialProvidersLoaded === 'function') {
        await ensureOfficialProvidersLoaded({ force: true, markDirty: true });
      } else if (typeof presetData !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(presetData.brands.map(function(name, i) {
          return { id: String(i + 1), name: name };
        })));
      }
      localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(defaultData.series));
      localStorage.setItem(APP_LOCAL_DIRTY_KEY, '1');
      loadProviders();
      loadBrands();
      updateStats();
      showToast('已恢复为 CSV 官方表');
    } catch (e) {
      alert('重置失败：' + (e.message || e));
    }
  })();
}

// 数据操作
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/** db.js 未加载或失败时避免整页崩溃 */
function getPresetProvidersSafe() {
  if (typeof presetData === 'undefined' || !presetData || !Array.isArray(presetData.providers)) return [];
  return presetData.providers;
}

/** 用于 innerHTML 文本节点，避免 < 等破坏结构；换行仍保留为 \n，配合 white-space:pre-wrap 显示 */
function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 写入 HTML 属性（data-* 等），避免品牌/系列名含引号导致脚本中断 */
function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

function getDeletedShopSet() {
  var arr = JSON.parse(localStorage.getItem(DELETED_SHOPS_KEY) || '[]');
  return new Set((arr || []).map(function(name) { return normalizeEntityKey(name); }).filter(Boolean));
}

function saveDeletedShopSet(setObj) {
  localStorage.setItem(DELETED_SHOPS_KEY, JSON.stringify(Array.from(setObj || [])));
}

function markShopDeleted(name) {
  var key = normalizeEntityKey(name);
  if (!key) return;
  var setObj = getDeletedShopSet();
  setObj.add(key);
  saveDeletedShopSet(setObj);
}

function isShopDeleted(name) {
  var key = normalizeEntityKey(name);
  if (!key) return false;
  return getDeletedShopSet().has(key);
}

function getDeletedProviderSet() {
  var arr = JSON.parse(localStorage.getItem(DELETED_PROVIDERS_KEY) || '[]');
  return new Set((arr || []).map(function(name) { return normalizeEntityKey(name); }).filter(Boolean));
}

function saveDeletedProviderSet(setObj) {
  localStorage.setItem(DELETED_PROVIDERS_KEY, JSON.stringify(Array.from(setObj || [])));
}

function markProviderDeleted(name) {
  var key = normalizeEntityKey(name);
  if (!key) return;
  var setObj = getDeletedProviderSet();
  setObj.add(key);
  saveDeletedProviderSet(setObj);
}

function isProviderDeleted(name) {
  var key = normalizeEntityKey(name);
  if (!key) return false;
  return getDeletedProviderSet().has(key);
}

function normalizeEntityKey(value) {
  return normalizeText(value).replace(/[()（）\s]/g, '');
}

var _deletedRuleCardSetCacheRaw = null;
var _deletedRuleCardSetCache = null;

function getDeletedRuleCardSet() {
  var raw = localStorage.getItem(DELETED_RULE_CARDS_KEY) || '[]';
  if (_deletedRuleCardSetCache && _deletedRuleCardSetCacheRaw === raw) {
    return _deletedRuleCardSetCache;
  }
  var arr;
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    arr = [];
  }
  _deletedRuleCardSetCacheRaw = raw;
  _deletedRuleCardSetCache = new Set((arr || []).map(function(key) { return String(key || ''); }).filter(Boolean));
  return _deletedRuleCardSetCache;
}

function saveDeletedRuleCardSet(setObj) {
  var raw = JSON.stringify(Array.from(setObj || []));
  localStorage.setItem(DELETED_RULE_CARDS_KEY, raw);
  _deletedRuleCardSetCacheRaw = raw;
  _deletedRuleCardSetCache = new Set(Array.from(setObj || []));
}

function resolveRuleCardDeletionShop(p, contextShop) {
  var ctx = String(contextShop || '').trim();
  if (ctx) return ctx;
  return String((p && (p.shop || p.shopname)) || '').trim();
}

function buildRuleCardDeletionKeyFromParts(shop, provider, brand, series) {
  var shopKey = normalizeEntityKey(shop);
  var providerKey = normalizeEntityKey(provider);
  var brandKey = normalizeText(brand);
  var seriesKey = normalizeText(series || '');
  if (!shopKey && !providerKey && !brandKey && !seriesKey) return '';
  return [shopKey, providerKey, brandKey, seriesKey].join('|');
}

function ruleCardDeletionKeys(p, contextShop) {
  if (!p) return [];
  var shops = [
    contextShop,
    p && p.shop,
    p && p.shopname
  ].map(function(value) {
    return String(value || '').trim();
  }).filter(Boolean);
  if (!shops.length) shops = [''];

  var seen = {};
  var keys = [];
  shops.forEach(function(shop) {
    var key = buildRuleCardDeletionKeyFromParts(shop, p && p.name, p && p.brand, (p && p.series) || '');
    if (!key || seen[key]) return;
    seen[key] = true;
    keys.push(key);
  });
  return keys;
}

function ruleCardDeletionKey(p, contextShop) {
  var keys = ruleCardDeletionKeys(p, contextShop);
  return keys[0] || '';
}

function buildRuleCardDeletionProbe(shop, provider, brand, series) {
  shop = String(shop || '').trim();
  return {
    shop: shop,
    shopname: shop,
    name: String(provider || '').trim(),
    brand: String(brand || '').trim(),
    series: String(series || '').trim()
  };
}

function markRuleCardDeleted(rule, contextShop) {
  var keys = ruleCardDeletionKeys(rule, contextShop);
  if (!keys.length) return;
  var setObj = getDeletedRuleCardSet();
  keys.forEach(function(key) { setObj.add(key); });
  saveDeletedRuleCardSet(setObj);
}

function unmarkRuleCardDeleted(rule, contextShop) {
  var keys = ruleCardDeletionKeys(rule, contextShop);
  if (!keys.length) return;
  var setObj = getDeletedRuleCardSet();
  keys.forEach(function(key) { setObj.delete(key); });
  saveDeletedRuleCardSet(setObj);
}

function isRuleCardDeleted(rule, contextShop) {
  var keys = ruleCardDeletionKeys(rule, contextShop);
  if (!keys.length) return false;
  var setObj = getDeletedRuleCardSet();
  return keys.some(function(key) { return setObj.has(key); });
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

function isChongwengeProviderName(value) {
  return isEntityMatched(value, CHONGWENGE_PROVIDER_NAME);
}

function shouldUseChongwengeShop(shopName, providerName, orgId) {
  return isChongwengeProviderName(shopName) ||
    isChongwengeProviderName(providerName) ||
    String(orgId || '').trim() === CHONGWENGE_ORG_ID;
}

function isYibenCultureShopName(value) {
  return normalizeEntityKey(value) === normalizeEntityKey(YIBEN_CULTURE_SHOP_NAME);
}

function shouldUseYibenCultureShop(shopName, providerName, orgId) {
  return isYibenCultureShopName(shopName) ||
    isYibenCultureShopName(providerName) ||
    String(orgId || '').trim() === YIBEN_CULTURE_ORG_ID;
}

function correctYibenCultureInputs(options) {
  options = options || {};
  var shopInput = document.getElementById('shop-search-input');
  var providerInput = document.getElementById('provider-search-input');
  var orgInput = document.getElementById('org-id-input');
  var shopVal = shopInput ? String(shopInput.value || '').trim() : '';
  var providerVal = providerInput ? String(providerInput.value || '').trim() : '';
  var orgVal = orgInput ? String(orgInput.value || '').trim() : '';
  if (!shouldUseYibenCultureShop(shopVal, providerVal, orgVal)) return false;
  if (shopInput && shopInput.value !== YIBEN_CULTURE_SHOP_NAME) {
    shopInput.value = YIBEN_CULTURE_SHOP_NAME;
  }
  if (providerInput && !providerVal) {
    providerInput.value = YIBEN_CULTURE_SHOP_NAME;
  }
  if (orgInput && orgInput.value !== YIBEN_CULTURE_ORG_ID) {
    orgInput.value = YIBEN_CULTURE_ORG_ID;
  }
  if (window.BbmBrandApi && typeof BbmBrandApi.saveShopOrgId === 'function') {
    BbmBrandApi.saveShopOrgId(YIBEN_CULTURE_SHOP_NAME, YIBEN_CULTURE_ORG_ID);
  }
  if (!options.skipReload) {
    loadBrandsByShopAndShowDropdown(YIBEN_CULTURE_SHOP_NAME);
  }
  return true;
}

function correctChongwengeInputs(options) {
  options = options || {};
  var shopInput = document.getElementById('shop-search-input');
  var providerInput = document.getElementById('provider-search-input');
  var orgInput = document.getElementById('org-id-input');
  var shopVal = shopInput ? String(shopInput.value || '').trim() : '';
  var providerVal = providerInput ? String(providerInput.value || '').trim() : '';
  var orgVal = orgInput ? String(orgInput.value || '').trim() : '';
  if (!shouldUseChongwengeShop(shopVal, providerVal, orgVal)) return false;
  if (shopInput && shopInput.value !== CHONGWENGE_SHOP_NAME) {
    shopInput.value = CHONGWENGE_SHOP_NAME;
  }
  if (providerInput && !providerVal) {
    providerInput.value = CHONGWENGE_PROVIDER_NAME;
  }
  if (orgInput && !orgVal) {
    orgInput.value = CHONGWENGE_ORG_ID;
  }
  if (!options.skipReload) {
    loadBrandsByShopAndShowDropdown(CHONGWENGE_SHOP_NAME);
  }
  return true;
}

window.correctYibenCultureInputs = correctYibenCultureInputs;

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

/** 品牌筛选：仅完全相等（NFKC+去空格后比较），不用「包含」以免「暑假」带出「小学暑假专项训练」 */
function brandMatchesUi(pBrand, selectedBrand) {
  var a = normalizeText(pBrand);
  var b = normalizeText(selectedBrand);
  if (!a || !b) return false;
  return a === b;
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
    var pullBtn = '';
    if (n < 400 && !isMultiUserMode()) {
      pullBtn =
        '<p style="margin:10px 0 0;"><button type="button" class="sync-btn" style="cursor:pointer;padding:8px 14px;border-radius:8px;border:none;background:var(--primary-cyan, #22d3ee);color:#0f172a;font-weight:600;" onclick="if(typeof window.forcePullProvidersFromCloud===\'function\'){window.forcePullProvidersFromCloud();}else{alert(\'请刷新页面后重试\');}">从云端重新拉取完整书目</button> ' +
        '<span style="font-size:12px;">（会清除「待同步」标记；仅在确认<strong>云端</strong>数据更全时使用）</span></p>';
    }
    var hintExtra = isMultiUserMode()
      ? '多人协作下请点顶栏「立即同步」获取最新数据，勿用本机覆盖云端。'
      : '若你曾在云端录入过大量规则，可尝试从云端重新拉取（单人维护时用）。';
    return (
      '<div class="match-hint" style="margin-top:10px;font-size:13px;color:#64748b;line-height:1.55;">在现有 ' +
      n +
      ' 条卡片中，未在「店铺/别名/提供者/品牌」里搜到「朝霞」「王朝霞」。说明<strong>本机当前数据里很可能没有该校书目</strong>。' +
      hintExtra + '</div>' +
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
    if (deletedBrandSet.has(normalizeText(p && p.brand))) return;
    if (isRuleCardDeleted(p)) return;
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

function looksLikeCompanyShopName(name) {
  return /公司|有限|集团|传媒|图书|文化|出版|策划|责任/.test(String(name || ''));
}

function pickPreferredShopForProvider(shopNames, providerName) {
  var names = (shopNames || []).map(function(s) { return String(s || '').trim(); }).filter(Boolean);
  if (!names.length) return '';
  var prov = String(providerName || '').trim();
  var companies = names.filter(function(s) {
    return s !== prov && looksLikeCompanyShopName(s);
  });
  if (companies.length) {
    companies.sort(function(a, b) { return b.length - a.length; });
    return companies[0];
  }
  var notProvider = names.filter(function(s) { return s !== prov; });
  if (notProvider.length) return notProvider[0];
  return names[0];
}

/** 同提供者下其它规则卡里的公司全称（旧数据 shop 误填提供者时兜底） */
function inferCompanyShopForProvider(providerName) {
  var prov = String(providerName || '').trim();
  if (!prov) return '';
  var list = getData(STORAGE_KEYS.PROVIDERS);
  var i;
  for (i = 0; i < list.length; i++) {
    var row = list[i];
    if (!isEntityMatched(row && row.name, prov)) continue;
    var s = String(row.shop || '').trim();
    var sn = String(row.shopname || '').trim();
    if (s && s !== prov && looksLikeCompanyShopName(s)) return s;
    if (sn && sn !== prov && looksLikeCompanyShopName(sn)) return sn;
  }
  return '';
}

/** 导出/展示用店铺名：旧数据常把提供者填进 shop；筛选框填提供者简称时不应覆盖公司全称 */
function resolveRuleShopName(p, contextShop) {
  if (!p) return String(contextShop || '').trim() || '-';
  var shop = String(p.shop || '').trim();
  var shopname = String(p.shopname || '').trim();
  var provider = String(p.name || '').trim();
  var ctx = String(contextShop || '').trim();

  if (shop && shop !== provider && looksLikeCompanyShopName(shop)) return shop;
  if (shopname && shopname !== provider && looksLikeCompanyShopName(shopname)) return shopname;

  if (shop && shop !== provider) return shop;
  if (shopname && shopname !== provider) return shopname;

  var peerShop = inferCompanyShopForProvider(provider);
  if (peerShop) return peerShop;

  if (ctx && ctx !== provider && looksLikeCompanyShopName(ctx) && rowShopMatchesSearch(p, ctx)) {
    return ctx;
  }

  if (shop && shop !== provider) return shop;
  if (shopname) return shopname;
  if (ctx && rowShopMatchesSearch(p, ctx) && ctx !== provider) return ctx;
  if (shop) return shop;
  return ctx || '-';
}

function setData(key, data, options) {
  options = options || {};
  localStorage.setItem(key, JSON.stringify(data));

  var fromCloud = !!options.fromCloud;
  var suppressProviders =
    key === STORAGE_KEYS.PROVIDERS &&
    (options.skipCloudSync ||
      (!fromCloud && typeof window !== 'undefined' && window.__RULE_LIB_SUPPRESS_PROVIDER_SYNC));

  /** 用户改规则必须标 dirty；仅云端写入本地时不要标（避免误拦上传） */
  if (key === STORAGE_KEYS.PROVIDERS && !fromCloud) {
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

/** 保存规则并尽量立即上传云端；awaitCloud 时等待上传结果（录入用，无需每条手动点同步） */
async function persistProviders(data, options) {
  options = options || {};
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(data));
  localStorage.setItem(APP_LOCAL_DIRTY_KEY, '1');
  window.dispatchEvent(new CustomEvent('providers-data-updated', { detail: { source: 'local' } }));
  updateSyncStatusFromDirty();

  if (options.skipCloudSync || typeof syncToCloud !== 'function') {
    return { ok: true, localOnly: true };
  }
  if (!options.awaitCloud) {
    syncToCloud(data);
    return { ok: null, pending: true };
  }
  var result = await syncToCloud(data, { reentrant: false });
  updateSyncStatusFromDirty();
  return result || { ok: false };
}

function updateSyncStatusFromDirty() {
  if (typeof updateSyncStatusBadge !== 'function') return;
  if (localStorage.getItem(APP_LOCAL_DIRTY_KEY) === '1') {
    updateSyncStatusBadge('idle', '待同步（自动上传）');
  }
}

function toastAfterProviderSync(syncResult) {
  if (syncResult && syncResult.ok) {
    showToast('已保存，同事可见');
  } else if (syncResult && syncResult.queued) {
    showToast('已保存，正在上传…');
  } else {
    showToast('已保存，后台约 12 秒内自动上传');
  }
}

// ========================================
// 页面导航
// ========================================
/** 进入提供者查询页时清空上次搜索条件与结果（从首页再次进入为空白表单） */
function resetProviderQueryPage() {
  currentBrand = '';
  currentProvider = '';
  currentEditingBrand = '';
  currentEditingShop = '';
  currentEditingSeries = '';
  providerSeriesTagsExpanded = false;
  setProviderRuleEditLock(null);
  if (showRulesDebounceTimer) {
    clearTimeout(showRulesDebounceTimer);
    showRulesDebounceTimer = null;
  }

  var shopInput = document.getElementById('shop-search-input');
  if (shopInput) shopInput.value = '';
  var providerInput = document.getElementById('provider-search-input');
  if (providerInput) providerInput.value = '';
  var brandInput = document.getElementById('brand-input');
  if (brandInput) {
    brandInput.value = '';
    brandInput.placeholder = '请先选择店铺...';
    brandInput.removeAttribute('data-shop-brands');
    brandInput.removeAttribute('data-current-shop');
    brandInput.removeAttribute('data-current-provider');
    brandInput.removeAttribute('data-provider-brands');
  }

  ['shop-dropdown', 'provider-dropdown', 'brand-dropdown'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  var display = document.getElementById('custom-rule-display');
  if (display) {
    display.style.display = 'none';
    display.innerHTML = '';
  }
  clearSeriesTags();

  var addSeriesBtn = document.getElementById('add-series-btn');
  if (addSeriesBtn) addSeriesBtn.style.display = 'none';

  var orgInput = document.getElementById('org-id-input');
  if (orgInput) orgInput.value = '';
  if (window.BbmBrandApi && typeof BbmBrandApi.setBbmFetchStatus === 'function') {
    BbmBrandApi.setBbmFetchStatus('', false);
  }
}

// ========================================
// 规则导出（Word / TXT）
// ========================================

function downloadExportBlob(filename, blob) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 2000);
}

function formatRuleExportTextBlock(p, index, contextShop) {
  var album = resolveAlbumRule(p);
  var shopLabel = resolveRuleShopName(p, contextShop);
  var providerLabel = String(p.name || '').trim() || '-';
  var lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '【' + index + '】' + [shopLabel, providerLabel, p.brand, p.series].filter(Boolean).join(' · '),
    '店铺：' + shopLabel,
    '提供者：' + providerLabel,
    '品牌：' + (p.brand || '-'),
    '系列：' + (p.series || '-'),
    '命名：' + (p.naming || '-'),
    '拆分：' + (p.split || '-'),
    '定价：' + (p.pricing || '-'),
    '发布时间：' + (p.publishTime || '-'),
    '专辑：' + album,
    '特例：' + (p.specialCase || '-'),
    '其他信息：' + (p.otherInfo || '-')
  ];
  return lines.join('\n');
}

function buildRulesExportWordHtml(list, scopeLabel, contextShop) {
  var now = new Date();
  var cards = list.map(function(p, i) {
    var shopLabel = resolveRuleShopName(p, contextShop);
    var providerLabel = String(p.name || '').trim() || '-';
    var title = escapeHtmlText([shopLabel, providerLabel, p.brand, p.series].filter(Boolean).join(' · '));
    var album = escapeHtmlText(resolveAlbumRule(p)).replace(/\n/g, '<br/>');
    return (
      '<div class="rule-card">' +
        '<h2>【' + (i + 1) + '】' + title + '</h2>' +
        '<table class="rule-table">' +
          '<tr><td class="lbl">店铺</td><td>' + escapeHtmlText(shopLabel) + '</td></tr>' +
          '<tr><td class="lbl">提供者</td><td>' + escapeHtmlText(providerLabel) + '</td></tr>' +
          '<tr><td class="lbl">品牌</td><td>' + escapeHtmlText(p.brand || '-') + '</td></tr>' +
          '<tr><td class="lbl">系列</td><td>' + escapeHtmlText(p.series || '-') + '</td></tr>' +
          '<tr><td class="lbl">命名</td><td>' + escapeHtmlText(p.naming || '-') + '</td></tr>' +
          '<tr><td class="lbl">拆分</td><td>' + escapeHtmlText(p.split || '-') + '</td></tr>' +
          '<tr><td class="lbl">定价</td><td>' + escapeHtmlText(p.pricing || '-') + '</td></tr>' +
          '<tr><td class="lbl">发布时间</td><td>' + escapeHtmlText(p.publishTime || '-') + '</td></tr>' +
          '<tr><td class="lbl">专辑</td><td>' + album + '</td></tr>' +
          '<tr><td class="lbl">特例</td><td>' + escapeHtmlText(p.specialCase || '-') + '</td></tr>' +
          '<tr><td class="lbl">其他信息</td><td>' + escapeHtmlText(p.otherInfo || '-') + '</td></tr>' +
        '</table>' +
      '</div>'
    );
  }).join('');

  return (
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="zh-CN">' +
    '<head><meta charset="utf-8">' +
    '<title>教辅生产规则导出</title>' +
    '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->' +
    '<style>' +
      'body{font-family:"Microsoft YaHei",SimSun,sans-serif;font-size:11pt;line-height:1.5;color:#111;}' +
      'h1{font-size:16pt;border-bottom:2px solid #0891b2;padding-bottom:8px;}' +
      '.meta{color:#555;font-size:10pt;margin-bottom:16px;}' +
      '.rule-card{margin:18px 0 24px;page-break-inside:avoid;}' +
      'h2{font-size:13pt;color:#0f766e;margin:0 0 8px;}' +
      'table.rule-table{width:100%;border-collapse:collapse;}' +
      'table.rule-table td{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;}' +
      'table.rule-table td.lbl{width:88px;background:#f0fdfa;font-weight:bold;}' +
    '</style></head><body>' +
    '<h1>教辅店铺个性化生产规则库</h1>' +
    '<p class="meta">导出范围：' + escapeHtmlText(scopeLabel) + '<br/>' +
    '导出时间：' + escapeHtmlText(now.toLocaleString('zh-CN')) + '<br/>' +
    '规则条数：' + list.length + '</p>' +
    cards +
    '</body></html>'
  );
}

function makeSingleRuleExportFilename(ext, p) {
  var date = new Date().toISOString().slice(0, 10);
  var safe = [p && p.brand, p && p.series].filter(Boolean).join('-')
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .slice(0, 72);
  return '生产规则-' + (safe || '未命名') + '-' + date + '.' + ext;
}

function resolveRuleForExport(index) {
  var list = getData(STORAGE_KEYS.PROVIDERS);
  if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= list.length) return null;
  return list[index] || null;
}

function buildRuleCardExportButtons(globalIndex, contextShop) {
  if (typeof globalIndex !== 'number' || globalIndex < 0) return '';
  var shopAttr = contextShop
    ? ' data-export-shop="' + escapeHtmlAttr(encodeURIComponent(String(contextShop))) + '"'
    : '';
  return '<button type="button" class="rule-export-btn" data-export-txt="1" data-index="' + globalIndex + '"' + shopAttr + ' title="导出本条为 TXT">📄 TXT</button>' +
    '<button type="button" class="rule-export-btn rule-export-btn-word" data-export-word="1" data-index="' + globalIndex + '"' + shopAttr + ' title="导出本条为 Word">📘 Word</button>';
}

function readExportContextShop(btn, ruleRow) {
  var provider = ruleRow ? String(ruleRow.name || '').trim() : '';
  var peer = inferCompanyShopForProvider(provider);
  if (peer) return peer;
  if (!btn) {
    var shopInput = document.getElementById('shop-search-input');
    var provInput = document.getElementById('provider-search-input');
    var shopVal = shopInput ? String(shopInput.value || '').trim() : '';
    var provVal = provInput ? String(provInput.value || '').trim() : '';
    if (shopVal && shopVal !== provVal && looksLikeCompanyShopName(shopVal)) return shopVal;
    return '';
  }
  var enc = btn.getAttribute('data-export-shop');
  if (!enc) {
    var shopInput2 = document.getElementById('shop-search-input');
    var shopVal2 = shopInput2 ? String(shopInput2.value || '').trim() : '';
    if (shopVal2 && shopVal2 !== provider && looksLikeCompanyShopName(shopVal2)) return shopVal2;
    return '';
  }
  try {
    var decoded = decodeURIComponent(enc);
    if (decoded && decoded !== provider && looksLikeCompanyShopName(decoded)) return decoded;
    if (ruleRow) return resolveRuleShopName(ruleRow, '');
    return decoded;
  } catch (e) {
    return enc;
  }
}

function exportRuleCardByIndex(globalIndex, format, contextShop) {
  var p = resolveRuleForExport(globalIndex);
  if (!p) {
    showToast('未找到该规则');
    return;
  }
  var shopLabel = resolveRuleShopName(p, contextShop);
  var scopeLabel = [p.brand, p.series].filter(Boolean).join(' · ') || '单条规则';
  if (format === 'txt') {
    var txtBody = formatRuleExportTextBlock(p, 1, contextShop) + '\n';
    var blob = new Blob(['\uFEFF' + txtBody], { type: 'text/plain;charset=utf-8' });
    downloadExportBlob(makeSingleRuleExportFilename('txt', p), blob);
    showToast('已导出 TXT');
    return;
  }
  var html = buildRulesExportWordHtml([p], scopeLabel, contextShop);
  var wordBlob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
  downloadExportBlob(makeSingleRuleExportFilename('doc', p), wordBlob);
  showToast('已导出 Word');
}

function exportRulesAsTxt(index) {
  exportRuleCardByIndex(index, 'txt');
}

function exportRulesAsWord(index) {
  exportRuleCardByIndex(index, 'word');
}

window.exportRuleCardByIndex = exportRuleCardByIndex;
window.exportRulesAsTxt = exportRulesAsTxt;
window.exportRulesAsWord = exportRulesAsWord;

function handleRuleCardExportClick(e) {
  var txtBtn = e.target.closest('[data-export-txt]');
  if (txtBtn) {
    e.preventDefault();
    var rowTxt = resolveRuleForExport(parseInt(txtBtn.getAttribute('data-index'), 10));
    exportRuleCardByIndex(parseInt(txtBtn.getAttribute('data-index'), 10), 'txt', readExportContextShop(txtBtn, rowTxt));
    return true;
  }
  var wordBtn = e.target.closest('[data-export-word]');
  if (wordBtn) {
    e.preventDefault();
    var rowWord = resolveRuleForExport(parseInt(wordBtn.getAttribute('data-index'), 10));
    exportRuleCardByIndex(parseInt(wordBtn.getAttribute('data-index'), 10), 'word', readExportContextShop(wordBtn, rowWord));
    return true;
  }
  return false;
}

function goPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);
  
  if (pageId === 'provider') {
    resetProviderQueryPage();
    loadProviders();
    loadBrands();
    loadProviderSelect();
  }

  if (pageId === 'provider' || pageId === 'ai') {
    initScrollTopButtons();
    updateScrollTopButtonsVisibility();
  } else {
    hideAllScrollTopButtons();
  }
}

var _scrollTopBound = false;
var SCROLL_TOP_PAGES = [
  { pageId: 'provider', btnId: 'provider-scroll-top' },
  { pageId: 'ai', btnId: 'ai-scroll-top' }
];

function initScrollTopButtons() {
  if (_scrollTopBound) return;
  _scrollTopBound = true;
  window.addEventListener('scroll', updateScrollTopButtonsVisibility, { passive: true });
  SCROLL_TOP_PAGES.forEach(function(cfg) {
    var btn = document.getElementById(cfg.btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function updateScrollTopButtonsVisibility() {
  var y = window.scrollY || document.documentElement.scrollTop || 0;
  SCROLL_TOP_PAGES.forEach(function(cfg) {
    var btn = document.getElementById(cfg.btnId);
    var page = document.getElementById('page-' + cfg.pageId);
    if (!btn || !page) return;
    var show = page.classList.contains('active') && y > 280;
    btn.style.display = show ? 'flex' : 'none';
    btn.classList.toggle('visible', show);
  });
}

function hideAllScrollTopButtons() {
  SCROLL_TOP_PAGES.forEach(function(cfg) {
    var btn = document.getElementById(cfg.btnId);
    if (!btn) return;
    btn.style.display = 'none';
    btn.classList.remove('visible');
  });
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
    return providerHasMeaningfulRule(p);
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

async function runProviderDuplicateCleanupMigration(options) {
  options = options || {};
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var beforeAudit = auditProviderDuplicateStats(providers);
  console.log('[规则库] 当前运行数据审计（清理前）：' + JSON.stringify(beforeAudit));
  var result = compactDuplicateProviderRules(providers);
  if (!result.changed) {
    console.log('[规则库] 重复规则卡检查：总数 ' + result.before + '，安全重复 ' + beforeAudit.duplicateRows + ' 条，疑似同系列重复 ' + beforeAudit.suspectDuplicateRows + ' 条');
    return result;
  }
  var afterAudit = auditProviderDuplicateStats(result.list);
  console.log('[规则库] 已合并重复规则卡：' + result.removed + ' 条，' + result.before + ' → ' + result.after + '；清理后：' + JSON.stringify(afterAudit));
  if (typeof persistProviders === 'function') {
    await persistProviders(result.list, { awaitCloud: !!options.awaitCloud });
  } else {
    setData(STORAGE_KEYS.PROVIDERS, result.list);
  }
  if (typeof updateStats === 'function') updateStats();
  if (typeof loadProviders === 'function') loadProviders();
  if (!options.silent && typeof showToast === 'function') {
    showToast('已合并重复规则卡 ' + result.removed + ' 条');
  }
  return result;
}

window.auditProviderDuplicateStats = auditProviderDuplicateStats;
window.compactDuplicateProviderRules = compactDuplicateProviderRules;
window.runProviderDuplicateCleanupMigration = runProviderDuplicateCleanupMigration;

document.addEventListener('DOMContentLoaded', () => {
  initData();
  if (typeof cloudSync !== 'function') {
    cleanupBlankPlaceholderProviders();
    runProviderDuplicateCleanupMigration({ silent: true });
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

  document.getElementById('org-id-input')?.addEventListener('input', function() {
    correctChongwengeInputs();
    correctYibenCultureInputs();
  });
  document.getElementById('provider-search-input')?.addEventListener('input', function() {
    correctChongwengeInputs();
    correctYibenCultureInputs();
  });
  document.getElementById('shop-search-input')?.addEventListener('blur', function() {
    correctChongwengeInputs();
    correctYibenCultureInputs();
  });
  correctChongwengeInputs();
  correctYibenCultureInputs({ skipReload: true });
  
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
    var seriesTagContainer = document.getElementById('series-tag-container');
    if (brandDropdown && !brandDropdown.contains(e.target) && (!brandInput || !brandInput.contains(e.target)) &&
        (!seriesTagContainer || !seriesTagContainer.contains(e.target))) {
      brandDropdown.style.display = 'none';
    }
  });

  var shopDropdownEl = document.getElementById('shop-dropdown');
  if (shopDropdownEl) {
    shopDropdownEl.addEventListener('mousedown', function(e) {
      var item = e.target.closest('[data-shop-pick]');
      if (!item) return;
      e.preventDefault();
      selectShop(item.getAttribute('data-shop-pick') || '');
    });
  }

  var providerDropdownEl = document.getElementById('provider-dropdown');
  if (providerDropdownEl) {
    providerDropdownEl.addEventListener('mousedown', function(e) {
      var item = e.target.closest('[data-provider-pick]');
      if (!item) return;
      e.preventDefault();
      selectProvider(item.getAttribute('data-provider-pick') || '');
    });
  }

  var brandDropdownEl = document.getElementById('brand-dropdown');
  if (brandDropdownEl) {
    brandDropdownEl.addEventListener('mousedown', function(e) {
      var item = e.target.closest('[data-brand-name]');
      if (!item) return;
      e.preventDefault();
      selectBrand(item.getAttribute('data-brand-name') || '');
    });
  }

  var seriesTagEl = document.getElementById('series-tag-container');
  if (seriesTagEl) {
    seriesTagEl.addEventListener('click', function(e) {
      var expandBtn = e.target.closest('[data-series-expand]');
      if (expandBtn) {
        e.preventDefault();
        providerSeriesTagsExpanded = expandBtn.getAttribute('data-series-expand') === '1';
        if (typeof _providerSeriesTagContext !== 'undefined' && _providerSeriesTagContext.matched) {
          renderSeriesTags(
            _providerSeriesTagContext.matched,
            _providerSeriesTagContext.selected,
            providerSeriesTagsExpanded,
            _providerSeriesTagContext.bbmSeriesNames
          );
        }
        return;
      }
      var btn = e.target.closest('[data-series-filter]');
      if (!btn) return;
      e.stopPropagation();
      selectSeriesFilter(btn.getAttribute('data-series-filter') || '');
    });
  }

  var ruleDisplayEl = document.getElementById('custom-rule-display');
  if (ruleDisplayEl) {
    ruleDisplayEl.addEventListener('click', function(e) {
      var editBtn = e.target.closest('[data-edit-rule]');
      if (editBtn) {
        e.preventDefault();
        editRuleByIndex(
          parseInt(editBtn.getAttribute('data-index'), 10),
          decodeURIComponent(editBtn.getAttribute('data-shop') || ''),
          decodeURIComponent(editBtn.getAttribute('data-provider') || ''),
          decodeURIComponent(editBtn.getAttribute('data-brand') || ''),
          decodeURIComponent(editBtn.getAttribute('data-series') || '')
        );
        return;
      }
      var delBtn = e.target.closest('[data-delete-rule]');
      if (delBtn) {
        e.preventDefault();
        deleteRuleByIndex(parseInt(delBtn.getAttribute('data-index'), 10));
        return;
      }
      if (handleRuleCardExportClick(e)) return;
    });
  }

  var aiResultEl = document.getElementById('ai-result');
  if (aiResultEl) {
    aiResultEl.addEventListener('click', function(e) {
      handleRuleCardExportClick(e);
    });
  }

  var aiSeriesTagEl = document.getElementById('ai-series-tag-container');
  if (aiSeriesTagEl) {
    aiSeriesTagEl.addEventListener('click', function(e) {
      var expandBtn = e.target.closest('[data-ai-series-expand]');
      if (expandBtn) {
        e.preventDefault();
        aiSeriesTagsExpanded = expandBtn.getAttribute('data-ai-series-expand') === '1';
        if (aiLastMatchedProviders.length) {
          renderAiSeriesTags(aiLastMatchedProviders, aiSeriesFilter, aiSeriesTagsExpanded);
        }
        return;
      }
      var btn = e.target.closest('[data-ai-series-filter]');
      if (!btn) return;
      selectAiSeriesFilter(btn.getAttribute('data-ai-series-filter') || '');
    });
  }

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
    if (detail && detail.status === 'success' && localStorage.getItem(APP_LOCAL_DIRTY_KEY) !== '1') {
      updateSyncStatusBadge('success', detail.message || '已同步');
    } else if (detail && detail.status === 'syncing') {
      updateSyncStatusBadge('syncing', detail.message || '正在上传…');
    } else if (detail && detail.status === 'error') {
      updateSyncStatusBadge('error', detail.message || '上传失败，自动重试');
    } else if (localStorage.getItem(APP_LOCAL_DIRTY_KEY) === '1') {
      updateSyncStatusBadge('idle', '待同步（自动上传）');
    } else {
      updateSyncStatusBadge(detail && detail.status, detail && detail.message);
    }
  });

  window.addEventListener('beforeunload', function(e) {
    try {
      if (localStorage.getItem(APP_LOCAL_DIRTY_KEY) === '1') {
        e.preventDefault();
        e.returnValue = '有修改尚未同步到云端，离开可能丢失，请先点「立即同步」。';
        return e.returnValue;
      }
    } catch (err) { /* ignore */ }
  });
  var manualSyncBtn = document.getElementById('manual-sync-btn');
  if (manualSyncBtn) {
    manualSyncBtn.addEventListener('click', function() {
      triggerManualSync();
    });
  }
  applyMultiUserUi();
  var forcePullBtn = document.getElementById('force-pull-btn');
  if (forcePullBtn) {
    forcePullBtn.addEventListener('click', function() {
      if (typeof window.forcePullProvidersFromCloud === 'function') {
        window.forcePullProvidersFromCloud();
      } else {
        showToast('请 Ctrl+F5 强刷后再点，或见控制台说明');
      }
    });
  }
  updateSyncStatusBadge('idle', isMultiUserMode() ? '自动同步' : '等待同步');

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

function isProviderRuleEditActive() {
  if (!providerRuleEditLock) return false;
  var display = document.getElementById('custom-rule-display');
  if (!display || !display.querySelector('.rule-card-edit')) {
    providerRuleEditLock = null;
    return false;
  }
  return true;
}

function setProviderRuleEditLock(lock) {
  providerRuleEditLock = lock || null;
}

function cancelProviderRuleEdit() {
  setProviderRuleEditLock(null);
  showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries, true);
}

function refreshProviderViews() {
  loadProviderSelect();
  loadProviders();
  loadBrands();
  updateStats();
  if (currentEditingBrand && !isProviderRuleEditActive()) {
    scheduleShowRulesByBrandAndShop();
  }
}

function scheduleShowRulesByBrandAndShop() {
  if (showRulesDebounceTimer) clearTimeout(showRulesDebounceTimer);
  showRulesDebounceTimer = setTimeout(function() {
    showRulesDebounceTimer = null;
    if (currentEditingBrand) {
      showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries);
    }
  }, 120);
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
            ${p.naming ? '<span class="ptag">命名:' + p.naming + '</span>' : ''}
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
  }).filter(Boolean).filter(function(s) { return !isShopDeleted(s); });
  var matched = uniqueShops.filter(function(s) { return s.toLowerCase().indexOf(input) !== -1; });
  
  if (matched.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = matched.slice(0, 10).map(function(s) { 
    return '<div class="dropdown-item" data-shop-pick="' + escapeHtmlAttr(s) + '">' + escapeHtmlText(s) + '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function searchShopByInput() {
  var input = document.getElementById('shop-search-input').value.trim();
  if (!input) return;
  selectShop(input);
}

function selectShop(shopName) {
  if (shouldUseChongwengeShop(shopName, '', '')) {
    shopName = CHONGWENGE_SHOP_NAME;
  }
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

function getBbmOrgIdForCurrentShop() {
  var shop = (document.getElementById('shop-search-input') && document.getElementById('shop-search-input').value || '').trim();
  var provider = (document.getElementById('provider-search-input') && document.getElementById('provider-search-input').value || '').trim();
  var orgInput = document.getElementById('org-id-input');
  var typed = orgInput ? String(orgInput.value || '').trim() : '';
  if (shouldUseChongwengeShop(shop, provider, typed)) {
    correctChongwengeInputs({ skipReload: true });
    return CHONGWENGE_ORG_ID;
  }
  if (shouldUseYibenCultureShop(shop, provider, typed)) {
    correctYibenCultureInputs({ skipReload: true });
    return YIBEN_CULTURE_ORG_ID;
  }
  if (typed) return typed;
  if (window.BbmBrandApi && shop) {
    var saved = BbmBrandApi.getOrgIdForShop(shop);
    if (saved) return saved;
  }
  if (window.CustomerPoolOrg && typeof CustomerPoolOrg.lookupOrgId === 'function') {
    var hit = CustomerPoolOrg.lookupOrgId(shop, provider);
    if (hit && hit.orgId) return hit.orgId;
  }
  return '';
}

function getBbmSeriesNamesForBrand(brandName) {
  var orgId = getBbmOrgIdForCurrentShop();
  if (!orgId || !window.BbmBrandApi) return [];
  return BbmBrandApi.getBbmSeriesNames(orgId, brandName);
}

function loadBrandsByShopAndShowDropdown(shopName) {
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : (typeof presetData !== 'undefined' ? presetData.providers : []);
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var hasShop = String(shopName || '').trim();
  var matched = providersData.filter(function(p) {
    if (isRuleCardDeleted(p, shopName)) return false;
    if (!hasShop && !providerName) return false;
    if (hasShop && !rowShopMatchesSearch(p, shopName)) return false;
    if (providerName && !isEntityMatched(p && p.name, providerName)) return false;
    return true;
  });
  var deletedBrandSet = getDeletedBrandSet();
  var brands = [...new Set(matched.map(function(p) { return p.brand; }).filter(Boolean))].filter(function(name) {
    return !deletedBrandSet.has(normalizeText(name));
  });

  if (window.BbmBrandApi) {
    BbmBrandApi.loadOrgIdInputForShop(shopName, providerName);
    var orgId = getBbmOrgIdForCurrentShop();
    if (orgId) {
      var bbmBrands = BbmBrandApi.getCachedBrands(orgId, true);
      brands = BbmBrandApi.mergeBrandNames(brands, bbmBrands);
    }
  }
  
  var brandInput = document.getElementById('brand-input');
  
  if (brandInput) {
    brandInput.placeholder = brands.length ? '点击选择品牌（含书城）...' : '点击选择品牌...';
    brandInput.value = '';
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
      var bbmMark = '';
      if (window.BbmBrandApi) {
        var orgId = getBbmOrgIdForCurrentShop();
        if (orgId && BbmBrandApi.findBbmBrand(orgId, b)) bbmMark = ' <span class="bbm-tag">书城</span>';
      }
      return '<div class="dropdown-item" data-brand-name="' + escapeHtmlAttr(b) + '">' + escapeHtmlText(b) + bbmMark + '</div>';
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
        return '<div class="dropdown-item" data-brand-name="' + escapeHtmlAttr(b) + '">' + escapeHtmlText(b) + '</div>';
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
    return '<div class="dropdown-item" data-brand-name="' + escapeHtmlAttr(b) + '">' + escapeHtmlText(b) + '</div>';
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
  providerSeriesTagsExpanded = false;
}

function buildSeriesTagsHtml(seriesMap, options) {
  options = options || {};
  var filterAttr = options.filterAttr || 'data-series-filter';
  var expandToggleAttr = options.expandToggleAttr || 'data-series-expand';
  var selectedSeries = String(options.selectedSeries || '').trim();
  var totalMatched = options.totalMatched != null ? options.totalMatched : 0;
  var expanded = !!options.expanded;
  var bbmOnlySet = options.bbmOnlySet || {};

  var seriesList = Object.keys(seriesMap).sort();
  if (seriesList.length === 0) return '';

  var showAll = expanded || seriesList.length <= SERIES_TAG_INITIAL_LIMIT;
  var visibleList = showAll ? seriesList : seriesList.slice(0, SERIES_TAG_INITIAL_LIMIT);
  var hiddenCount = showAll ? 0 : seriesList.length - SERIES_TAG_INITIAL_LIMIT;

  var allClass = selectedSeries ? 'series-tag' : 'series-tag active';
  var html = '<span class="series-tag-label">系列：</span>';
  html += '<button class="' + allClass + '" type="button" ' + filterAttr + '="">全部系列（' + totalMatched + '）</button>';

  visibleList.forEach(function(seriesName) {
    var count = seriesMap[seriesName];
    var isActive = selectedSeries === seriesName;
    var cls = isActive ? 'series-tag active' : 'series-tag';
    var countLabel = count > 0 ? count : (bbmOnlySet[seriesName] ? '书城' : count);
    html += '<button class="' + cls + '" type="button" ' + filterAttr + '="' + escapeHtmlAttr(encodeURIComponent(seriesName)) + '">' +
      escapeHtmlText(seriesName) + '（' + countLabel + '）</button>';
  });

  if (hiddenCount > 0) {
    html += '<button class="series-tag series-tag-more" type="button" ' + expandToggleAttr + '="1">展开其余 ' + hiddenCount + ' 个系列 ▼</button>';
  } else if (expanded && seriesList.length > SERIES_TAG_INITIAL_LIMIT) {
    html += '<button class="series-tag series-tag-more" type="button" ' + expandToggleAttr + '="0">收起系列 ▲</button>';
  }
  return html;
}

var _providerSeriesTagContext = { matched: [], selected: '' };

function renderSeriesTags(matched, selectedSeries, expandedOpt, bbmSeriesNames) {
  var container = document.getElementById('series-tag-container');
  if (!container) return;

  var seriesMap = {};
  var bbmOnlySet = {};
  (matched || []).forEach(function(item) {
    var p = item && item.data ? item.data : {};
    var key = (p.series || '').trim() || '未设置系列';
    seriesMap[key] = (seriesMap[key] || 0) + 1;
  });

  (bbmSeriesNames || []).forEach(function(name) {
    var key = String(name || '').trim();
    if (!key) return;
    if (!seriesMap[key]) {
      seriesMap[key] = 0;
      bbmOnlySet[key] = true;
    }
  });

  var seriesList = Object.keys(seriesMap).sort();
  if (seriesList.length === 0) {
    clearSeriesTags();
    return;
  }

  if (expandedOpt !== undefined) providerSeriesTagsExpanded = !!expandedOpt;
  _providerSeriesTagContext = {
    matched: matched,
    selected: String(selectedSeries || '').trim(),
    bbmSeriesNames: bbmSeriesNames || []
  };

  container.innerHTML = buildSeriesTagsHtml(seriesMap, {
    filterAttr: 'data-series-filter',
    expandToggleAttr: 'data-series-expand',
    selectedSeries: _providerSeriesTagContext.selected,
    totalMatched: matched.length,
    expanded: providerSeriesTagsExpanded,
    bbmOnlySet: bbmOnlySet
  });
  container.style.display = 'flex';
}

function renderAiSeriesTags(matchedProviders, selectedSeries, expandedOpt) {
  var container = document.getElementById('ai-series-tag-container');
  if (!container) return;

  var seriesMap = {};
  (matchedProviders || []).forEach(function(p) {
    var key = String((p && p.series) || '').trim() || '未设置系列';
    seriesMap[key] = (seriesMap[key] || 0) + 1;
  });
  if (Object.keys(seriesMap).length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  if (expandedOpt !== undefined) aiSeriesTagsExpanded = !!expandedOpt;
  container.innerHTML = buildSeriesTagsHtml(seriesMap, {
    filterAttr: 'data-ai-series-filter',
    expandToggleAttr: 'data-ai-series-expand',
    selectedSeries: String(selectedSeries || '').trim(),
    totalMatched: (matchedProviders || []).length,
    expanded: aiSeriesTagsExpanded
  });
  container.style.display = 'flex';
}

function selectAiSeriesFilter(seriesEncoded) {
  aiSeriesFilter = seriesEncoded ? decodeURIComponent(seriesEncoded) : '';
  if (!aiLastMatchedProviders.length) return;
  aiRenderProviderResults(aiLastMatchedProviders);
}

function aiRenderProviderResults(fullList) {
  var resultBox = document.getElementById('ai-result');
  if (!resultBox) return;

  aiLastMatchedProviders = fullList || [];
  var list = aiLastMatchedProviders;
  if (aiSeriesFilter) {
    list = list.filter(function(rule) {
      var key = String((rule && rule.series) || '').trim() || '未设置系列';
      return key === aiSeriesFilter;
    });
  }

  if (list.length <= 1) {
    renderAiSeriesTags([], '');
  } else {
    renderAiSeriesTags(aiLastMatchedProviders, aiSeriesFilter);
  }

  if (list.length === 0) {
    resultBox.innerHTML =
      '<div class="ai-result-card">' +
        '<div class="ai-result-header">' +
          '<span class="ai-result-icon">ℹ️</span>' +
          '<span class="ai-result-title">该系列下暂无规则</span>' +
        '</div>' +
        '<div class="ai-result-body">' +
          '<p class="ai-result-empty-msg">请点上方「全部系列」查看该品牌下所有规则。</p>' +
        '</div>' +
      '</div>';
    return;
  }

  var truncated = !aiSeriesFilter && list.length > AI_RESULT_RENDER_LIMIT;
  var renderList = truncated ? list.slice(0, AI_RESULT_RENDER_LIMIT) : list;

  resultBox.innerHTML = renderList.map(function(rule) {
    var providerName = rule.name || '未命名提供者';
    var brandName = rule.brand || '未设置品牌';
    var seriesName = (rule.series || '').trim() || '未设置系列';
    var shopName = resolveRuleShopName(rule, '');
    var providersData = getData(STORAGE_KEYS.PROVIDERS);
    var globalIndex = providersData.findIndex(function(p) {
      return ruleRowMatchesEditIdentity(p, shopName, providerName, brandName, seriesName);
    });
    var exportBtns = buildRuleCardExportButtons(globalIndex, shopName);
    return '<div class="ai-result-card">' +
      '<div class="ai-result-header">' +
        '<span class="ai-result-icon">📌</span>' +
        '<span class="ai-result-title">' + escapeHtmlText(providerName + ' · ' + brandName + ' · ' + seriesName) + '</span>' +
        (exportBtns ? '<div class="rule-card-actions ai-card-actions">' + exportBtns + '</div>' : '') +
      '</div>' +
      '<div class="ai-result-body">' +
        '<div class="ai-result-section">' +
          '<div class="ai-result-row"><span class="ai-result-label">店铺</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(shopName)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">提供者</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(providerName)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">品牌</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(brandName)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">系列</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(seriesName)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">命名</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.naming)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">拆分</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.split)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">定价</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.pricing)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">发布时间</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.publishTime)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">专辑</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(resolveAlbumRule(rule))) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">特例</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.specialCase)) + '</span></div>' +
          '<div class="ai-result-row"><span class="ai-result-label">其他信息</span><span class="ai-result-value">' + escapeHtmlText(formatAiFieldDisplay(rule.otherInfo)) + '</span></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('') + (truncated
    ? '<div class="ai-result-truncate-hint">共匹配 <strong>' + list.length + '</strong> 条规则，已显示前 ' + AI_RESULT_RENDER_LIMIT + ' 条。请点上方系列标签筛选，或展开系列后选择具体系列查看。</div>'
    : '');
}

function selectSeriesFilter(seriesEncoded) {
  var seriesName = seriesEncoded ? decodeURIComponent(seriesEncoded) : '';
  currentEditingSeries = seriesName;
  showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, seriesName);
}

var _ensureSeriesRuleInflight = false;

/** 书城/本地选中的系列尚无规则卡片时，自动建一条空白占位并刷新展示 */
async function autoEnsureSeriesRuleAndRefresh(shopName, providerName, brandName, seriesName) {
  if (_ensureSeriesRuleInflight) return;
  _ensureSeriesRuleInflight = true;
  try {
    shopName = String(shopName || '').trim();
    providerName = String(providerName || '').trim();
    brandName = String(brandName || '').trim();
    seriesName = String(seriesName || '').trim();
    if (!shopName || !providerName || !brandName || !seriesName) return;

    var providers = getData(STORAGE_KEYS.PROVIDERS);
    var normSeries = normalizeText(seriesName);
    var exists = providers.some(function(p) {
      if (isRuleCardDeleted(p, shopName)) return false;
      return isSameContextProvider(p, shopName, providerName) &&
        brandMatchesUi(p && p.brand, brandName) &&
        normalizeText(String((p && p.series) || '').trim()) === normSeries;
    });

    if (!exists) {
      var newRule = buildNewProviderRuleCard(shopName, providerName, brandName, seriesName);
      if (isRuleCardDeleted(newRule, shopName)) {
        showRulesByBrandAndShop(brandName, shopName, seriesName, true);
        return;
      }
      providers.push(newRule);
      if (typeof persistProviders === 'function') {
        await persistProviders(providers, { awaitCloud: true });
      } else {
        setData(STORAGE_KEYS.PROVIDERS, providers);
      }
      if (typeof showToast === 'function') {
        showToast('已为系列「' + seriesName + '」创建规则卡（已填默认）');
      }
    }
    showRulesByBrandAndShop(brandName, shopName, seriesName, true);
  } catch (err) {
    console.error('autoEnsureSeriesRuleAndRefresh 失败:', err);
    if (typeof showToast === 'function') showToast('创建系列规则失败，请重试');
  } finally {
    _ensureSeriesRuleInflight = false;
  }
}

function tryAutoEnsureSeriesRuleCard(shopName, providerName, brandName, seriesFilter, forceRefresh) {
  var seriesLabel = String(seriesFilter || '').trim();
  if (!seriesLabel || forceRefresh || _ensureSeriesRuleInflight) return false;
  shopName = String(shopName || '').trim();
  providerName = String(providerName || '').trim();
  brandName = String(brandName || '').trim();
  if (!shopName || !providerName || !brandName) return false;

  var display = document.getElementById('custom-rule-display');
  if (display) {
    display.style.display = 'block';
    display.innerHTML = '<div class="match-hint"><span class="match-icon">⏳</span><span class="match-text">正在为系列「' +
      escapeHtmlText(seriesLabel) + '」准备规则卡片…</span></div>';
  }
  autoEnsureSeriesRuleAndRefresh(shopName, providerName, brandName, seriesLabel);
  return true;
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

  renderBrandDefaultsPanel(shopName, providerName, brandName);
  
  console.log('calling showRulesByBrandAndShop with:', brandName, shopName);
  var providerNameForBbm = (document.getElementById('provider-search-input')?.value || '').trim();
  var orgIdForBbm = getBbmOrgIdForCurrentShop();
  var afterBrandReady = function() {
    ensureBbmSeriesRuleCardsForBrand(shopName, providerNameForBbm, brandName, { silent: true, awaitCloud: true })
      .then(function(res) {
        if (res && res.created > 0 && typeof showToast === 'function') {
          showToast('已为书城 ' + res.created + ' 个系列创建规则卡（已填默认）');
        }
        showRulesByBrandAndShop(brandName, shopName, '');
      })
      .catch(function() {
        showRulesByBrandAndShop(brandName, shopName, '');
      });
  };
  if (orgIdForBbm && window.BbmBrandApi && typeof BbmBrandApi.ensureBrandSeriesInCache === 'function') {
    BbmBrandApi.ensureBrandSeriesInCache(orgIdForBbm, brandName).then(afterBrandReady).catch(afterBrandReady);
  } else {
    afterBrandReady();
  }
}

function showRulesByBrandAndShop(brandName, shopName, seriesFilter, forceRefresh) {
  console.log('showRulesByBrandAndShop called:', brandName, shopName);
  if (!forceRefresh && isProviderRuleEditActive()) {
    return;
  }
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
  var currentBbmOrgId = getBbmOrgIdForCurrentShop();
  var currentBbmSeriesList = getBbmSeriesListForBrand(brandName);

  if (targetShopTrim && providerName && brandName) {
    if (currentBbmSeriesList.length) {
      var pruneResult = pruneStaleBbmSeriesRuleCardsForContext(providersData, targetShopTrim, providerName, brandName, currentBbmSeriesList, currentBbmOrgId);
      if (pruneResult.changed) {
        providersData = pruneResult.providers;
        setData(STORAGE_KEYS.PROVIDERS, providersData);
      }
    }
    var repairResult = repairSeriesRulesForContext(providersData, targetShopTrim, providerName, brandName);
    if (repairResult.changed) {
      providersData = repairResult.providers;
      setData(STORAGE_KEYS.PROVIDERS, providersData);
    }
  }
  
  // 过滤：品牌 + 店铺语境 + 提供者（与 loadBrandsByShopAndShowDropdown 一致，避免「有品牌名、规则卡片为 0」）
  var matched = [];
  providersData.forEach(function(p, i) {
    if (isRuleCardDeleted(p, shopName)) return;
    var brandMatched = brandMatchesUi(p && p.brand, brandName);
    var shopMatched = !targetShopTrim || rowShopMatchesSearch(p, shopName);
    var providerMatched = !providerName || isEntityMatched(p && p.name, providerName);
    if (currentBbmSeriesList.length && isStaleBbmSeriesForCurrentOrg(p, currentBbmSeriesList, currentBbmOrgId)) return;
    if (brandMatched && shopMatched && providerMatched) {
      matched.push({ data: p, index: i });
    }
  });

  // 有店铺、有品牌，但因「提供者」框填错导致 0 条时：忽略提供者再筛一次（常见：框里仍是上一家主体）
  if (matched.length === 0 && providerName && targetShopTrim) {
    var retry = [];
    providersData.forEach(function(p, i) {
      if (isRuleCardDeleted(p, shopName)) return;
      if (!brandMatchesUi(p && p.brand, brandName)) return;
      if (!rowShopMatchesSearch(p, shopName)) return;
      if (currentBbmSeriesList.length && isStaleBbmSeriesForCurrentOrg(p, currentBbmSeriesList, currentBbmOrgId)) return;
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
      if (isRuleCardDeleted(p, shopName)) return;
      if (currentBbmSeriesList.length && isStaleBbmSeriesForCurrentOrg(p, currentBbmSeriesList, currentBbmOrgId)) return;
      if (brandMatchesUi(p && p.brand, brandName)) {
        matched.push({ data: p, index: i });
      }
    });
  }

  if (matched.length > 1) {
    matched = dedupeMatchedRuleItemsForDisplay(matched, targetShopTrim, providerName);
  }
  
  var display = document.getElementById('custom-rule-display');
  if (!display) return;
  
  if (matched.length === 0) {
    if (tryAutoEnsureSeriesRuleCard(shopName, providerName, brandName, seriesFilter, forceRefresh)) {
      return;
    }
    clearSeriesTags();
    if (targetBrand && targetShopTrim) {
      var shopHit = 0;
      var brandHit = 0;
      var bothHit = 0;
      providersData.forEach(function(p) {
        if (isRuleCardDeleted(p, shopName)) return;
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
          ? ' 若品牌为 0，多半是<strong>品牌名字与库里不一致</strong>（可在「规则快速检索」搜王朝霞核对）。'
          : '') +
        (bothHit === 0 && shopHit === 0
          ? ' 若店铺为 0，请核对库里「店铺/店铺别名/提供者」是否含「洛阳」「朝霞」等关键字。'
          : '') +
        '</div>' +
        buildRoughMatchSamplesHtml(providersData.filter(function(p) { return !isRuleCardDeleted(p, shopName); }), ['朝霞', '王朝霞', '洛阳朝霞']);
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
  var hasMeaningfulRule = providerHasMeaningfulRule;
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

  var bbmSeriesNames = (currentBbmSeriesList.length
    ? currentBbmSeriesList.map(function(s) { return s.name; }).filter(Boolean)
    : getBbmSeriesNamesForBrand(brandName)
  ).filter(function(seriesName) {
    return !isRuleCardDeleted(buildRuleCardDeletionProbe(shopName, providerName, brandName, seriesName), shopName);
  });
  renderSeriesTags(matchedBeforeSeriesFilter, seriesFilter || '', undefined, bbmSeriesNames);
  if (matched.length === 0) {
    if (tryAutoEnsureSeriesRuleCard(shopName, providerName, brandName, seriesFilter, forceRefresh)) {
      return;
    }
    display.style.display = 'block';
    var emptyHint = bbmSeriesNames.length
      ? '正在同步书城系列规则卡…若仍为空请点选上方系列标签。'
      : '该品牌下未找到所选系列，请点 +新增系列添加。';
    display.innerHTML = '<div class="match-hint"><span class="match-icon">ℹ️</span><span class="match-text">' + emptyHint + '</span></div>';
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
      var shopForEdit = String(shopName || '').trim() || String(p.shop || p.shopname || '').trim();
      var shopEncoded = encodeURIComponent(shopForEdit);
      var providerEncoded = encodeURIComponent(p.name || '');
      var brandEncoded = encodeURIComponent(p.brand || '');
      var seriesEncoded = encodeURIComponent((p.series || '').trim());
      var actionButtons = '<button type="button" class="rule-edit-btn" data-edit-rule="1" data-index="' + globalIndex + '" data-shop="' + escapeHtmlAttr(shopEncoded) + '" data-provider="' + escapeHtmlAttr(providerEncoded) + '" data-brand="' + escapeHtmlAttr(brandEncoded) + '" data-series="' + escapeHtmlAttr(seriesEncoded) + '">✏️ 修改</button>' +
                       buildRuleCardExportButtons(globalIndex, shopForEdit) +
                       '<button type="button" class="rule-delete-btn" data-delete-rule="1" data-index="' + globalIndex + '">🗑️ 删除</button>';
      html += '<div class="rule-card">';
      html += '  <div class="rule-card-header">';
      html += '    <div class="rule-card-title">' + escapeHtmlText(ruleName) + '</div>';
      html += '    <div class="rule-card-actions">' + actionButtons + '</div>';
      html += '  </div>';
      html += '  <div class="rule-card-body">';
      html += '    <div class="rule-row"><span class="rule-label">系列：</span><span class="rule-value">' + escapeHtmlText((p.series || '').trim() || '未设置系列') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">命名：</span><span class="rule-value">' + escapeHtmlText(p.naming || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">拆分：</span><span class="rule-value">' + escapeHtmlText(p.split || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">定价：</span><span class="rule-value">' + escapeHtmlText(p.pricing || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">发布时间：</span><span class="rule-value">' + escapeHtmlText(p.publishTime || '待录入') + '</span></div>';
      html += '    <div class="rule-row"><span class="rule-label">专辑：</span><span class="rule-value">' + escapeHtmlText(resolveAlbumRule(p)) + '</span></div>';
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
    html += '<div class="rule-result-row"><strong>命名：</strong>' + (p.naming || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>拆分：</strong>' + (p.split || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>定价：</strong>' + (p.pricing || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>发布时间：</strong>' + (p.publishTime || '-') + '</div>';
    html += '<div class="rule-result-row"><strong>专辑：</strong>' + escapeHtmlText(resolveAlbumRule(p)) + '</div>';
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
  var shopEl = document.getElementById('shop-search-input');
  var shopVal = shopEl ? String(shopEl.value || '').trim() : '';
  var providerMap = {};
  providersData.forEach(function(p) {
    if (shopVal && !rowShopMatchesSearch(p, shopVal)) return;
    var rawName = String((p && p.name) || '').trim();
    if (!rawName || isProviderDeleted(rawName)) return;
    var key = normalizeEntityKey(rawName);
    if (!key) return;
    if (!providerMap[key]) providerMap[key] = [];
    providerMap[key].push(rawName);
  });
  var uniqueProviders = Object.keys(providerMap).map(function(key) {
    return pickPreferredDisplayName(providerMap[key], false);
  }).filter(Boolean).filter(function(p) { return !isProviderDeleted(p); });
  var matched = uniqueProviders.filter(function(p) {
    var normalizedName = normalizeText(p);
    return normalizedName.indexOf(input) !== -1 || input.indexOf(normalizedName) !== -1;
  });
  
  if (matched.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = matched.slice(0, 10).map(function(p) { 
    return '<div class="dropdown-item" data-provider-pick="' + escapeHtmlAttr(p) + '">' + escapeHtmlText(p) + '</div>';
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
  var forceChongwenge = shouldUseChongwengeShop('', providerName, '');
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
      preferredShop = pickPreferredShopForProvider(uniqueShops, providerName);
    }
    if (forceChongwenge) {
      preferredShop = CHONGWENGE_SHOP_NAME;
    }
    if (shopInput) {
      if (preferredShop) {
        // 已有公司全称时不降级为提供者简称（如龙门书局）
        if (
          currentShopValue &&
          looksLikeCompanyShopName(currentShopValue) &&
          matched.some(function(p) { return rowShopMatchesSearch(p, currentShopValue); })
        ) {
          preferredShop = currentShopValue;
        }
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
  var localProviders = getData(STORAGE_KEYS.PROVIDERS).filter(function(p) { return !isRuleCardDeleted(p); });
  var allProviders = getPresetProvidersSafe()
    .filter(function(p) { return !isRuleCardDeleted(p); })
    .concat(localProviders);
  
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
  
  var matched = getPresetProvidersSafe().filter(function(p) {
    if (isRuleCardDeleted(p)) return false;
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
      '<div class="rule-item"><span class="label">命名：</span><span class="value">' + (rule.naming || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">拆分：</span><span class="value">' + (rule.split || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">定价：</span><span class="value">' + (rule.pricing || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">发布时间：</span><span class="value">' + (rule.publishTime || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">专辑：</span><span class="value">' + escapeHtmlText(resolveAlbumRule(rule)) + '</span></div>' +
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
  var localProviders = getData(STORAGE_KEYS.PROVIDERS).filter(function(p) { return !isRuleCardDeleted(p); });
  var allProviders = getPresetProvidersSafe()
    .filter(function(p) { return !isRuleCardDeleted(p); })
    .concat(localProviders);
  
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
  var currentRule = matched.length > 0 ? matched[0] : {album: '', naming: '', split: '', pricing: '', publishTime: '', specialCase: ''};
  var displayAlbum = resolveAlbumRule(currentRule);
  var displayBox = document.getElementById('custom-rule-display');
  if (displayBox) {
    displayBox.style.display = 'block';
    displayBox.innerHTML = '<div class="rule-display-header">' +
        '<span class="rule-icon">📋</span> <span>' + brandName + ' - ' + seriesName + ' 规则</span>' +
        '<button class="btn-edit-rule" onclick="editRule()">✏️ 修改</button>' +
      '</div>' +
      '<div class="rule-display-content" id="rule-content">' +
        '<div class="rule-item"><span class="label">命名：</span><span class="value" id="rule-naming">' + escapeHtmlText(currentRule.naming || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">拆分：</span><span class="value" id="rule-split">' + escapeHtmlText(currentRule.split || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">定价：</span><span class="value" id="rule-pricing">' + escapeHtmlText(currentRule.pricing || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><span class="value" id="rule-publishTime">' + escapeHtmlText(currentRule.publishTime || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">专辑：</span><span class="value" id="rule-album">' + escapeHtmlText(displayAlbum) + '</span></div>' +
        '<div class="rule-item"><span class="label">特例：</span><span class="value" id="rule-specialCase">' + escapeHtmlText(currentRule.specialCase || '待录入') + '</span></div>' +
      '</div>' +
      '<div class="rule-edit-content" id="rule-edit" style="display:none;">' +
        '<div class="rule-item"><span class="label">命名：</span><textarea rows="2" id="edit-naming" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">拆分：</span><textarea rows="2" id="edit-split" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">定价：</span><textarea rows="2" id="edit-pricing" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><textarea rows="2" id="edit-publishTime" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">专辑：</span><textarea rows="5" id="edit-album" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-item"><span class="label">特例：</span><textarea rows="2" id="edit-specialCase" class="rule-input alt-space-newline"></textarea></div>' +
        '<div class="rule-btn-wrap">' +
          '<button class="btn-cancel" onclick="cancelEdit()">取消</button>' +
          '<button class="btn-save" onclick="saveEditRule()">保存</button>' +
        '</div>' +
      '</div>';
    var albumEl = document.getElementById('edit-album');
    if (albumEl) albumEl.value = displayAlbum;
    var namingEl = document.getElementById('edit-naming');
    if (namingEl) namingEl.value = currentRule.naming || '';
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
  
  var elAlbum = document.getElementById('edit-album');
  var elNaming = document.getElementById('edit-naming');
  var elSplit = document.getElementById('edit-split');
  var elPricing = document.getElementById('edit-pricing');
  var elPub = document.getElementById('edit-publishTime');
  var elSpec = document.getElementById('edit-specialCase');
  var newAlbumRaw = elAlbum ? elAlbum.value.trim() : '';
  var newNaming = elNaming ? elNaming.value.trim() : '';
  var newSplit = elSplit ? elSplit.value.trim() : '';
  var newPricing = elPricing ? elPricing.value.trim() : '';
  var newPublishTime = elPub ? elPub.value.trim() : '';
  var newSpecialCase = elSpec ? elSpec.value.trim() : '';

  // 获取当前数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  
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
    newProvidersList[matchedIndex].album = resolveAlbumForSave(newAlbumRaw, brandName, seriesName, providerName);
    newProvidersList[matchedIndex].naming = newNaming;
    newProvidersList[matchedIndex].split = newSplit;
    newProvidersList[matchedIndex].pricing = newPricing;
    newProvidersList[matchedIndex].publishTime = newPublishTime;
    newProvidersList[matchedIndex].specialCase = newSpecialCase;
    unmarkRuleCardDeleted(newProvidersList[matchedIndex]);
  } else {
    // 新增项
    var newEditedRule = {
      name: providerName,
      brand: brandName,
      series: seriesName,
      album: resolveAlbumForSave(newAlbumRaw, brandName, seriesName, providerName),
      naming: newNaming,
      split: newSplit,
      pricing: newPricing,
      publishTime: newPublishTime,
      specialCase: newSpecialCase
    };
    unmarkRuleCardDeleted(newEditedRule);
    newProvidersList.push(newEditedRule);
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
  html += '    <button type="button" class="rule-edit-btn" onclick="cancelProviderRuleEdit()">✖ 取消</button>';
  html += '  </div>';
  html += '  <div class="rule-card-body">';
  html += '    <p class="rule-edit-hint">提示：在输入框中按 <strong>Alt + 空格</strong> 可插入换行。</p>';
  html += '    <div class="rule-row"><span class="rule-label">店铺：</span><span class="rule-value">' + escapeHtmlText(rule.shop || '未设置店铺') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">提供者：</span><span class="rule-value">' + escapeHtmlText(rule.name || '未设置提供者') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">品牌：</span><span class="rule-value">' + escapeHtmlText(rule.brand || '未设置品牌') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">系列：</span><span class="rule-value">' + escapeHtmlText((rule.series || '').trim() || '未设置系列') + '</span></div>';
  html += '    <div class="rule-row"><span class="rule-label">命名：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-naming"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">拆分：</span><textarea class="rule-input alt-space-newline" rows="3" id="edit-split"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">定价：</span><textarea class="rule-input alt-space-newline" rows="3" id="edit-pricing"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">发布时间：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-publishTime"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">专辑：</span><textarea class="rule-input alt-space-newline" rows="5" id="edit-album"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">特例：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-specialCase"></textarea></div>';
  html += '    <div class="rule-row"><span class="rule-label">其他信息：</span><textarea class="rule-input alt-space-newline" rows="2" id="edit-otherInfo"></textarea></div>';
  html += '    <div class="rule-row"><button class="rule-save-btn" id="save-rule-btn" data-index="' + resolvedIndex + '">💾 保存</button></div>';
  html += '  </div>';
  html += '</div>';
  
  display.innerHTML = html;
  document.getElementById('edit-album').value = resolveAlbumRule(rule);
  document.getElementById('edit-naming').value = rule.naming || '';
  document.getElementById('edit-split').value = rule.split || '';
  document.getElementById('edit-pricing').value = rule.pricing || '';
  document.getElementById('edit-publishTime').value = rule.publishTime || '';
  document.getElementById('edit-specialCase').value = rule.specialCase || '';
  document.getElementById('edit-otherInfo').value = rule.otherInfo || '';

  setProviderRuleEditLock({
    resolvedIndex: resolvedIndex,
    targetShop: targetShop,
    targetProvider: targetProvider,
    targetBrand: targetBrand,
    targetSeries: targetSeries
  });
  
  document.getElementById('save-rule-btn').addEventListener('click', function() {
    saveRuleByIndex(resolvedIndex, targetShop, targetProvider, targetBrand, targetSeries);
  });
}

async function saveRuleByIndex(globalIndex, targetShop, targetProvider, targetBrand, targetSeries) {
  var saveBtn = document.getElementById('save-rule-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = '保存并上传…';
  }
  try {
    console.log('💾 saveRuleByIndex 被调用，globalIndex:', globalIndex);
    var newAlbumRaw = document.getElementById('edit-album') ? document.getElementById('edit-album').value.trim() : '';
    var newNaming = document.getElementById('edit-naming') ? document.getElementById('edit-naming').value.trim() : '';
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
    
    var row = providersData[resolvedIndex];
    providersData[resolvedIndex].album = resolveAlbumForSave(newAlbumRaw, row.brand, row.series, row.name);
    providersData[resolvedIndex].naming = newNaming;
    providersData[resolvedIndex].split = newSplit;
    providersData[resolvedIndex].pricing = newPricing;
    providersData[resolvedIndex].publishTime = newPublishTime;
    providersData[resolvedIndex].specialCase = newSpecialCase;
    providersData[resolvedIndex].otherInfo = newOtherInfo;
    // 系列/品牌/提供者/店铺不在“编辑规则”里改动，避免上次规则带值导致联动串改
    
    console.log('💾 保存的数据:', providersData[resolvedIndex]);
    setProviderRuleEditLock(null);
    var syncResult = await persistProviders(providersData, { awaitCloud: true });
    toastAfterProviderSync(syncResult);
    showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries, true);
  } catch (err) {
    console.error('saveRuleByIndex 失败:', err);
    showToast('保存失败，请重试');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 保存';
    }
  }
}

function deleteRuleByIndex(globalIndex) {
  if (isProviderRuleEditActive()) {
    setProviderRuleEditLock(null);
  }
  if (!confirm('确定要删除这条规则吗？')) return;
  
  var providers = localStorage.getItem('rule_library_providers');
  var providersData = providers ? JSON.parse(providers) : [];
  var deletedRule = providersData[globalIndex];
  if (!deletedRule) {
    showToast('未找到该规则');
    return;
  }
  
  markRuleCardDeleted(deletedRule, currentEditingShop);
  var deletedKey = ruleCardDeletionKey(deletedRule, currentEditingShop);
  providersData = providersData.filter(function(p, i) {
    if (i === globalIndex) return false;
    if (isRuleCardDeleted(p, currentEditingShop)) return false;
    return ruleCardDeletionKey(p, currentEditingShop) !== deletedKey;
  });
  setData(STORAGE_KEYS.PROVIDERS, providersData);
  showToast('删除成功');
  showRulesByBrandAndShop(currentEditingBrand, currentEditingShop, currentEditingSeries, true);
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
            ${p.naming ? '<span class="ptag">命名:' + p.naming + '</span>' : ''}
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

function setNewProviderModalReadOnly(lockShop, lockProvider) {
  var shopField = document.getElementById('new-provider-shop');
  var shopnameField = document.getElementById('new-provider-shopname');
  var providerField = document.getElementById('new-provider-name');
  if (shopField) {
    shopField.readOnly = !!lockShop;
    shopField.style.background = lockShop ? '#f5f5f5' : '';
  }
  if (shopnameField) {
    shopnameField.readOnly = !!lockShop;
    shopnameField.style.background = lockShop ? '#f5f5f5' : '';
  }
  if (providerField) {
    providerField.readOnly = !!lockProvider;
    providerField.style.background = lockProvider ? '#f5f5f5' : '';
  }
}

function applyShopRenameOnRow(p, oldName, newName) {
  var touched = false;
  if (isEntityMatched(p.shop, oldName)) {
    p.shop = newName;
    touched = true;
  }
  if (isEntityMatched(p.shopname, oldName)) {
    p.shopname = newName;
    touched = true;
  }
  var hasShopFields = !!(String((p && p.shop) || '').trim() || String((p && p.shopname) || '').trim());
  if (!hasShopFields && isEntityMatched(p && p.name, oldName)) {
    p.name = newName;
    touched = true;
  }
  return touched;
}

function renameShopInContext() {
  var oldName = (document.getElementById('shop-search-input')?.value || '').trim();
  if (!oldName) {
    showToast('请先在店铺框输入或选择要修改的店铺名称');
    return;
  }
  var newName = window.prompt(
    '将店铺「' + oldName + '」更名为（会更新该店铺下所有规则卡片中的店铺/别名字段）',
    oldName
  );
  if (newName == null) return;
  newName = String(newName).trim();
  if (!newName || normalizeEntityKey(newName) === normalizeEntityKey(oldName)) return;

  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var hit = 0;
  providers.forEach(function(p) {
    if (!rowShopMatchesSearch(p, oldName)) return;
    if (applyShopRenameOnRow(p, oldName, newName)) hit += 1;
  });
  if (hit === 0) {
    showToast('未找到与该店铺匹配的规则卡片');
    return;
  }
  setData(STORAGE_KEYS.PROVIDERS, providers);
  document.getElementById('shop-search-input').value = newName;
  var providerInput = document.getElementById('provider-search-input');
  if (providerInput) providerInput.value = '';
  loadBrandsByShopAndShowDropdown(newName);
  var display = document.getElementById('custom-rule-display');
  if (display) display.style.display = 'none';
  clearSeriesTags();
  showToast('已更新 ' + hit + ' 条规则中的店铺名称');
}

function deleteShopInContext() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  if (!shopName) {
    showToast('请先在店铺框输入或选择要删除的店铺');
    return;
  }
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var remain = [];
  var removed = 0;
  providers.forEach(function(p) {
    if (rowShopMatchesSearch(p, shopName)) {
      removed += 1;
    } else {
      remain.push(p);
    }
  });
  var msg = removed > 0
    ? '将删除店铺「' + shopName + '」下的 ' + removed + ' 条规则卡片，并从搜索中隐藏该店铺。确定吗？'
    : '未找到该店铺下的规则卡片。是否仅从搜索中隐藏店铺「' + shopName + '」？';
  if (!window.confirm(msg)) return;
  if (removed > 0) setData(STORAGE_KEYS.PROVIDERS, remain);
  markShopDeleted(shopName);
  document.getElementById('shop-search-input').value = '';
  var providerInput = document.getElementById('provider-search-input');
  if (providerInput) providerInput.value = '';
  var brandInput = document.getElementById('brand-input');
  if (brandInput) brandInput.value = '';
  var display = document.getElementById('custom-rule-display');
  if (display) display.style.display = 'none';
  clearSeriesTags();
  showToast(removed > 0 ? ('已删除 ' + removed + ' 条规则，店铺已隐藏') : '店铺已从搜索中隐藏');
}

function renameProviderInContext() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var oldName = (document.getElementById('provider-search-input')?.value || '').trim();
  if (!oldName) {
    showToast('请先在提供者框输入或选择要修改的提供者名称');
    return;
  }
  var newName = window.prompt(
    '将提供者「' + oldName + '」更名为' + (shopName ? '（仅当前店铺「' + shopName + '」下）' : '（全部匹配记录）'),
    oldName
  );
  if (newName == null) return;
  newName = String(newName).trim();
  if (!newName || normalizeEntityKey(newName) === normalizeEntityKey(oldName)) return;

  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var hit = 0;
  providers.forEach(function(p) {
    if (!isEntityMatched(p && p.name, oldName)) return;
    if (shopName && !rowShopMatchesSearch(p, shopName)) return;
    p.name = newName;
    hit += 1;
  });
  if (hit === 0) {
    showToast('未找到匹配的提供者记录');
    return;
  }
  setData(STORAGE_KEYS.PROVIDERS, providers);
  document.getElementById('provider-search-input').value = newName;
  if (shopName) loadBrandsByShopAndShowDropdown(shopName);
  showToast('已更新 ' + hit + ' 条规则中的提供者名称');
}

function deleteProviderInContext() {
  var shopName = (document.getElementById('shop-search-input')?.value || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  if (!providerName) {
    showToast('请先在提供者框输入或选择要删除的提供者');
    return;
  }
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var remain = [];
  var removed = 0;
  providers.forEach(function(p) {
    var matchProvider = isEntityMatched(p && p.name, providerName);
    var matchShop = !shopName || rowShopMatchesSearch(p, shopName);
    if (matchProvider && matchShop) {
      removed += 1;
    } else {
      remain.push(p);
    }
  });
  var scope = shopName ? '店铺「' + shopName + '」下' : '全部';
  var msg = removed > 0
    ? ('将删除' + scope + '提供者「' + providerName + '」的 ' + removed + ' 条规则卡片，并从搜索中隐藏该提供者' +
      (shopName ? '；同时隐藏店铺「' + shopName + '」' : '') + '。确定吗？')
    : ('未找到匹配的规则卡片。是否仅从搜索中隐藏提供者「' + providerName + '」' +
      (shopName ? '及店铺「' + shopName + '」' : '') + '？');
  if (!window.confirm(msg)) return;
  if (removed > 0) setData(STORAGE_KEYS.PROVIDERS, remain);
  markProviderDeleted(providerName);
  if (shopName) markShopDeleted(shopName);
  document.getElementById('provider-search-input').value = '';
  if (shopName) document.getElementById('shop-search-input').value = '';
  var brandInput = document.getElementById('brand-input');
  if (brandInput) brandInput.value = '';
  var display = document.getElementById('custom-rule-display');
  if (display) display.style.display = 'none';
  clearSeriesTags();
  showToast(removed > 0 ? ('已删除 ' + removed + ' 条规则，已从搜索中隐藏') : '已从搜索中隐藏');
}

function openAddProvider() {
  editingProviderIndex = null;
  document.getElementById('modal-provider-title').textContent = '新增提供者';
  
  var shopInput = document.getElementById('shop-search-input');
  var providerInput = document.getElementById('provider-search-input');
  
  var currentShop = shopInput ? shopInput.value.trim() : '';
  var currentProvider = providerInput ? providerInput.value.trim() : '';
  
  document.getElementById('new-provider-shop').value = '';
  document.getElementById('new-provider-shopname').value = '';
  document.getElementById('new-provider-name').value = '';
  document.getElementById('new-provider-brand').value = '';
  var seriesEl = document.getElementById('new-provider-series');
  if (seriesEl) seriesEl.value = '';
  document.getElementById('new-provider-album').value = '';
  document.getElementById('new-provider-naming').value = '';
  document.getElementById('new-provider-split').value = '';
  document.getElementById('new-provider-pricing').value = '';
  document.getElementById('new-provider-publishtime').value = '';
  document.getElementById('new-provider-special').value = '';
  var otherEl = document.getElementById('new-provider-otherinfo');
  if (otherEl) otherEl.value = '';
  
  document.getElementById('new-provider-shop').value = currentShop;
  document.getElementById('new-provider-shopname').value = currentShop;
  document.getElementById('new-provider-name').value = currentProvider;

  var brandForAlbum = (document.getElementById('new-provider-brand')?.value || '').trim();
  var seriesForAlbum = (document.getElementById('new-provider-series')?.value || '').trim();
  var albumEl = document.getElementById('new-provider-album');
  if (albumEl) {
    albumEl.value = buildDefaultAlbumRule(null, currentProvider);
  }
  
  setNewProviderModalReadOnly(!!currentShop, !!currentProvider);

  var saveBtn = document.querySelector('#modal-provider .btn-save');
  if (saveBtn) saveBtn.onclick = saveProvider;
  
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
  var shopName = (document.getElementById('shop-search-input')?.value || currentEditingShop || '').trim();
  var providerName = (document.getElementById('provider-search-input')?.value || '').trim();
  var brandName = (document.getElementById('brand-input')?.value || currentEditingBrand || '').trim();
  if (!shopName || !providerName || !brandName) {
    showToast('新增系列前请先填写店铺、提供者、品牌');
    return;
  }
  var presetSeries = String(currentEditingSeries || '').trim();
  var seriesName = presetSeries;
  if (!seriesName) {
    seriesName = window.prompt('请输入系列名称');
    if (seriesName == null) return;
    seriesName = String(seriesName).trim();
  }
  if (!seriesName) {
    showToast('请输入系列名称');
    return;
  }
  saveSeries('', seriesName, brandName, shopName, providerName);
}

// ========================================
// 保存操作
// ========================================
async function saveProvider() {
  const shop = document.getElementById('new-provider-shop')?.value.trim();
  const name = document.getElementById('new-provider-name')?.value.trim();
  const brandName = document.getElementById('new-provider-brand')?.value.trim();
  const seriesName = document.getElementById('new-provider-series')?.value.trim();
  const albumRaw = document.getElementById('new-provider-album')?.value.trim();
  const naming = document.getElementById('new-provider-naming')?.value.trim();
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
  var shopnameVal = document.getElementById('new-provider-shopname')?.value.trim() || shop || '';
  var newProviderRule = {
    shop: shop || '',
    shopname: shopnameVal,
    name,
    brand: brandName || '',
    series: seriesName || '',
    album: resolveAlbumForSave(albumRaw, brandName, seriesName, name),
    naming: naming || '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || '',
    otherInfo: otherInfo || ''
  };
  unmarkRuleCardDeleted(newProviderRule, shop);
  providers.push(newProviderRule);
  var syncResult = await persistProviders(providers, { awaitCloud: true });
  toastAfterProviderSync(syncResult);
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

async function saveBrand(nameInput) {
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
    setData(STORAGE_KEYS.BRANDS, brands, { skipCloudSync: true });
  }

  // 自动建立品牌与店铺/提供者的关联，确保可被搜索链路命中
  var providers = getData(STORAGE_KEYS.PROVIDERS);
  var hasLinkedRecord = providers.some(function(p) {
    if (isRuleCardDeleted(p, shopName)) return false;
    return isSameContextProvider(p, shopName, providerName) &&
      normalizeText(p.brand) === normalizeText(name);
  });
  if (!hasLinkedRecord) {
    var newBrandRule = buildNewProviderRuleCard(shopName, providerName, name, '');
    unmarkRuleCardDeleted(newBrandRule, shopName);
    providers.push(newBrandRule);
    var syncResult = await persistProviders(providers, { awaitCloud: true });
    toastAfterProviderSync(syncResult);
  } else {
    unmarkRuleCardDeleted(buildRuleCardDeletionProbe(shopName, providerName, name, ''), shopName);
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
  } else if (!brandExists) {
    showToast('品牌添加成功');
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

async function saveSeries(brandIdInput, nameInput, brandNameInput, shopInput, providerInput) {
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
    var newSeriesRule = buildNewProviderRuleCard(shopName, providerName, brandName, name);
    unmarkRuleCardDeleted(newSeriesRule, shopName);
    providers.push(newSeriesRule);
    var syncResult = await persistProviders(providers, { awaitCloud: true });
    toastAfterProviderSync(syncResult);
  } else {
    unmarkRuleCardDeleted(buildRuleCardDeletionProbe(shopName, providerName, brandName, name), shopName);
  }

  var seriesSelect = document.getElementById('series-select');
  if (seriesSelect) {
    seriesSelect.innerHTML += '<option value="' + name + '">' + name + '</option>';
    seriesSelect.value = name;
  }

  showRulesByBrandAndShop(brandName, shopName);
  if (linked) showToast('系列已存在并已关联当前规则');
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
  setNewProviderModalReadOnly(false, false);
  
  document.getElementById('new-provider-shop').value = provider.shop || '';
  document.getElementById('new-provider-shopname').value = provider.shopname || provider.shop || '';
  document.getElementById('new-provider-name').value = provider.name || '';
  document.getElementById('new-provider-brand').value = provider.brand || '';
  document.getElementById('new-provider-series').value = provider.series || '';
  document.getElementById('new-provider-album').value = resolveAlbumRule(provider);
  document.getElementById('new-provider-naming').value = provider.naming || '';
  document.getElementById('new-provider-split').value = provider.split || '';
  document.getElementById('new-provider-pricing').value = provider.pricing || '';
  document.getElementById('new-provider-publishtime').value = provider.publishTime || '';
  document.getElementById('new-provider-special').value = provider.specialCase || '';
  var otherEditEl = document.getElementById('new-provider-otherinfo');
  if (otherEditEl) otherEditEl.value = provider.otherInfo || '';
  
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
  const albumRaw = document.getElementById('new-provider-album')?.value.trim();
  const naming = document.getElementById('new-provider-naming')?.value.trim();
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
  var prev = providers[editingProviderIndex] || {};
  var updatedRule = {
    id: prev.id,
    shop: shop || '',
    shopname: shopname || '',
    name,
    brand: brandName,
    series: seriesName || '',
    album: resolveAlbumForSave(albumRaw, brandName, seriesName, name),
    naming: naming || '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || '',
    otherInfo: otherInfo || ''
  };
  unmarkRuleCardDeleted(updatedRule, shop);
  providers[editingProviderIndex] = updatedRule;
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
    aiSeriesFilter = '';
    aiLastMatchedProviders = [];
    aiSeriesTagsExpanded = false;
    renderAiSeriesTags([], '');
    return;
  }

  aiSeriesFilter = '';
  aiSeriesTagsExpanded = false;

  const brandSeriesQuery = parseBrandSeriesQuery(query);
  
  const queryLower = query.toLowerCase();
  const normalizedQuery = normalizeForSearch(query);
  const queryTerms = buildQueryTerms(query);
  const isStrictMultiTermQuery = queryTerms.length >= 2;
  
  // 首先搜索提供者/品牌/系列数据 - 只搜索 localStorage 中的用户保存数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS).filter(function(p) {
    return !isRuleCardDeleted(p);
  });
  var deletedBrandSet = getDeletedBrandSet();
  var matchedProviders = [];

  // 「品牌 · 系列」精确查询：直接定位唯一规则，不走宽泛模糊匹配
  if (brandSeriesQuery && brandSeriesQuery.brandHint && brandSeriesQuery.seriesHint) {
    matchedProviders = localProviders.filter(function(p) {
      var brand = normalizeText(p && p.brand);
      if (deletedBrandSet.has(brand)) return false;
      return providerMatchesBrandSeries(p, brandSeriesQuery.brandHint, brandSeriesQuery.seriesHint);
    });
    if (matchedProviders.length > 0) {
      aiSeriesFilter = brandSeriesQuery.seriesHint;
    }
  }

  if (!matchedProviders.length) {
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
        p.album || '',
        p.naming || '',
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
        p.album || '',
        p.naming || '',
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

  matchedProviders = providerCandidates
    .sort(function(a, b) { return b.score - a.score; })
    .map(function(item) { return item.data; });
  }

  if (brandSeriesQuery && brandSeriesQuery.brandHint && brandSeriesQuery.seriesHint && matchedProviders.length) {
    var bsNarrow = matchedProviders.filter(function(p) {
      return providerMatchesBrandSeries(p, brandSeriesQuery.brandHint, brandSeriesQuery.seriesHint);
    });
    if (bsNarrow.length > 0) {
      matchedProviders = bsNarrow;
      aiSeriesFilter = brandSeriesQuery.seriesHint;
    }
  }

  // AI 查询与提供者查询保持一致：仅删除“同组已有有效规则”下的空白占位卡
  var hasMeaningfulRuleForAi = providerHasMeaningfulRule;
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

  // 当查询词与品牌存在精确匹配时，仅保留该品牌结果（「品牌·系列」组合查询不在此收窄）
  if (!brandSeriesQuery) {
    var exactBrandMatches = matchedProviders.filter(function(p) {
      return normalizeForSearch(p && p.brand) === normalizedQuery;
    });
    if (exactBrandMatches.length > 0) {
      matchedProviders = exactBrandMatches;
    }
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
      (String(existing.album || '').trim() ? 1 : 0) +
      (String(existing.naming || '').trim() ? 1 : 0) +
      (String(existing.split || '').trim() ? 1 : 0) +
      (String(existing.pricing || '').trim() ? 1 : 0) +
      (String(existing.publishTime || '').trim() ? 1 : 0) +
      (String(existing.specialCase || '').trim() ? 1 : 0) +
      (String(existing.otherInfo || '').trim() ? 1 : 0)
    );
    var currentScore = (
      (String(p.album || '').trim() ? 1 : 0) +
      (String(p.naming || '').trim() ? 1 : 0) +
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
    aiRenderProviderResults(matchedProviders);
    return;
  }

  aiLastMatchedProviders = [];
  renderAiSeriesTags([], '');

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
          '<p class="ai-result-empty-msg">未找到与「' + escapeHtmlText(query) + '」直接相关的规则。请尝试其他关键词，或查看教辅通用规范获取完整信息。</p>' +
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

/** 解析「品牌 · 系列」组合查询，如：众相原创 · 时政热点 */
function parseBrandSeriesQuery(query) {
  var raw = String(query || '').trim();
  if (!raw) return null;
  var parts = raw.split(/\s*[·•|｜/／>\-—–]+\s*/).map(function(s) { return s.trim(); }).filter(Boolean);
  if (parts.length >= 2) {
    return {
      brandHint: parts[0],
      seriesHint: parts.slice(1).join('·').trim()
    };
  }
  return null;
}

function providerMatchesBrandSeries(p, brandHint, seriesHint) {
  if (!p) return false;
  var brandOk = brandMatchesUi(p.brand, brandHint) || isEntityMatched(p.brand, brandHint);
  var seriesVal = String((p.series || '')).trim();
  var seriesOk = brandMatchesUi(seriesVal, seriesHint) || isEntityMatched(seriesVal, seriesHint);
  return brandOk && seriesOk;
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
  if (isMultiUserMode() && !isSyncAdminMode()) {
    alert('多人协作模式下已禁用清空本地库。');
    return;
  }
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
  .rule-export-btn {
    background: #7c3aed;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
  }
  .rule-export-btn-word {
    background: #2563eb;
  }
  .rule-export-btn:hover {
    opacity: 0.85;
  }
  .rule-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }
  .ai-result-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
  }
  .ai-result-header .ai-result-title {
    flex: 1;
    min-width: 0;
  }
  .ai-card-actions {
    margin-left: auto;
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
  .series-tag-more {
    border-style: dashed;
    color: var(--primary-cyan);
    font-weight: 600;
  }
  .ai-result-truncate-hint {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: var(--radius-md, 8px);
    background: rgba(0, 180, 216, 0.08);
    border: 1px solid rgba(0, 180, 216, 0.25);
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
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
