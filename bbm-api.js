'use strict';

/**
 * 书城 BBM 品牌/系列前端模块（通过 /api/bbm-brand 代理，secret 不在浏览器）
 */
(function(global) {
  var SHOP_ORG_MAP_KEY = 'rule_library_shop_org_map';
  var BBM_CACHE_KEY = 'rule_library_bbm_brand_cache';
  var CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  var BBM_SERIES_FIXTURES = {
    '500179|王朝霞试卷系列': [
      { id: 2978, name: '专项小练', brandId: null, orgId: 500179, inUse: true },
      { id: 2926, name: '期末冲刺课内阅读押题卷', brandId: null, orgId: 500179, inUse: true },
      { id: 2905, name: '期末冲刺抢分计划', brandId: null, orgId: 500179, inUse: true },
      { id: 2904, name: '备考冲A计划', brandId: null, orgId: 500179, inUse: true }
    ]
  };

  function cfg() {
    return global.RULE_LIBRARY_CONFIG || {};
  }

  function apiBase() {
    return String(cfg().bbmApiUrl || '/api/bbm-brand').replace(/\/$/, '');
  }

  function apiUrlOrg(orgIds) {
    return apiBase() + '?orgIds=' + encodeURIComponent(String(orgIds));
  }

  function apiUrlBrand(brandId) {
    return apiBase() + '?brandId=' + encodeURIComponent(String(brandId));
  }

  function parseBbmResponse(res) {
    return res.text().then(function(text) {
      var body;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (e) {
        var snippet = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
        if (res.status === 404) {
          throw new Error('书城代理未部署（404）。请把 api/bbm-brand.js、lib/bbm-sign.js、vercel.json 一并上传到 GitHub 后等 2 分钟再试。');
        }
        throw new Error('接口返回非 JSON（HTTP ' + res.status + '）：' + (snippet || '空响应'));
      }
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error((body && body.hint) ? body.hint : '书城网关鉴权失败（401），请联系运维确认 bookoms 凭证与 IP 白名单');
        }
        if (res.status === 403) {
          throw new Error((body && body.hint) ? body.hint : '书城网关拒绝访问（403），可能 IP 未白名单');
        }
        if (res.status === 503) {
          throw new Error((body && body.error) ? body.error : '服务端未配置 BAPI 密钥');
        }
        var msg = (body && body.error) ? body.error : ('HTTP ' + res.status);
        throw new Error(msg);
      }
      return body;
    });
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function getShopOrgMap() {
    return readJson(SHOP_ORG_MAP_KEY, {});
  }

  function saveShopOrgId(shopName, orgId) {
    var shop = String(shopName || '').trim();
    var id = String(orgId || '').trim();
    if (!shop || !id) return;
    var map = getShopOrgMap();
    map[shop] = id;
    writeJson(SHOP_ORG_MAP_KEY, map);
  }

  function getOrgIdForShop(shopName) {
    var shop = String(shopName || '').trim();
    if (!shop) return '';
    var map = getShopOrgMap();
    return String(map[shop] || '').trim();
  }

  function isEntityInUse(entity) {
    if (!entity) return false;
    if (entity.inUse === false || entity.inUse === 0) return false;
    if (entity.status === 0 || entity.status === '0' || entity.status === 'DISABLED') return false;
    return true;
  }

  function unwrapBrandPayload(body) {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (body.brand && typeof body.brand === 'object' && !Array.isArray(body.brand)) return [body.brand];
    if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
      if (Array.isArray(body.data.records)) return body.data.records;
      if (Array.isArray(body.data.rows)) return body.data.rows;
      if (Array.isArray(body.data.items)) return body.data.items;
      if (Array.isArray(body.data.list)) return body.data.list;
      if (body.data.brand && typeof body.data.brand === 'object' && !Array.isArray(body.data.brand)) return [body.data.brand];
      if (firstText(body.data, ['name', 'brandName', 'title', 'label'])) return [body.data];
    }
    if (body.result && typeof body.result === 'object' && !Array.isArray(body.result)) {
      if (Array.isArray(body.result.records)) return body.result.records;
      if (Array.isArray(body.result.rows)) return body.result.rows;
      if (Array.isArray(body.result.items)) return body.result.items;
      if (Array.isArray(body.result.list)) return body.result.list;
      if (body.result.brand && typeof body.result.brand === 'object' && !Array.isArray(body.result.brand)) return [body.result.brand];
      if (firstText(body.result, ['name', 'brandName', 'title', 'label'])) return [body.result];
    }
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.items)) return body.items;
    if (Array.isArray(body.result)) return body.result;
    if (Array.isArray(body.brands)) return body.brands;
    if (Array.isArray(body.records)) return body.records;
    if (Array.isArray(body.rows)) return body.rows;
    if (Array.isArray(body.list)) return body.list;
    return [];
  }

  function firstText(obj, keys) {
    if (typeof obj === 'string') return obj;
    if (!obj || typeof obj !== 'object') return '';
    for (var i = 0; i < keys.length; i++) {
      var val = obj[keys[i]];
      if (val != null && String(val).trim()) return String(val).trim();
    }
    return '';
  }

  function firstValue(obj, keys) {
    if (!obj || typeof obj !== 'object') return undefined;
    for (var i = 0; i < keys.length; i++) {
      if (obj[keys[i]] != null && String(obj[keys[i]]).trim() !== '') return obj[keys[i]];
    }
    return undefined;
  }

  function isSeriesContainerKey(key) {
    return /series/i.test(String(key || ''));
  }

  function getBrandId(brand) {
    return firstValue(brand, ['id', 'brandId', 'brandID', 'brand_id']);
  }

  function getSeriesName(item) {
    return firstText(item, ['name', 'seriesName', 'brandSeriesName', 'title', 'label']);
  }

  function getSeriesId(item) {
    return firstValue(item, ['id', 'seriesId', 'brandSeriesId', 'seriesID', 'brand_series_id']);
  }

  function getSeriesBrandId(item, brand) {
    return firstValue(item, ['brandId', 'brandID', 'brand_id']) || getBrandId(brand);
  }

  function looksLikeSeriesItem(item, brand, fromSeriesKey) {
    var name = getSeriesName(item);
    if (!name || (item && typeof item === 'object' && !isEntityInUse(item))) return false;
    if (fromSeriesKey || typeof item === 'string') return true;
    var expectedBrandId = getBrandId(brand);
    var itemBrandId = firstValue(item, ['brandId', 'brandID', 'brand_id']);
    if (itemBrandId) return !expectedBrandId || String(itemBrandId) === String(expectedBrandId);
    return !!firstValue(item, ['seriesId', 'brandSeriesId', 'brand_series_id']) || !!firstText(item, ['seriesName', 'brandSeriesName']);
  }

  function normalizeSeriesItem(item, brand) {
    var name = getSeriesName(item);
    if (!name) return null;
    return {
      id: getSeriesId(item),
      name: name,
      brandId: getSeriesBrandId(item, brand),
      orgId: firstValue(item, ['orgId', 'orgID', 'org_id', 'organizationId']) || (brand && brand.orgId)
    };
  }

  function collectSeriesCandidates(value, brand, out, keyHint, depth, seen) {
    if (!value || depth > 5) return;
    if (Array.isArray(value)) {
      var fromSeriesKey = isSeriesContainerKey(keyHint);
      var candidates = value.filter(function(item) {
        return looksLikeSeriesItem(item, brand, fromSeriesKey);
      });
      if (fromSeriesKey || (candidates.length && candidates.length === value.length)) {
        candidates.forEach(function(item) {
          var normalized = normalizeSeriesItem(item, brand);
          if (normalized) out.push(normalized);
        });
        return;
      }
      value.forEach(function(item) {
        collectSeriesCandidates(item, brand, out, keyHint, depth + 1, seen);
      });
      return;
    }
    if (typeof value !== 'object') return;
    if (seen.indexOf(value) !== -1) return;
    seen.push(value);
    Object.keys(value).forEach(function(key) {
      var child = value[key];
      if (child && (Array.isArray(child) || typeof child === 'object')) {
        collectSeriesCandidates(child, brand, out, key, depth + 1, seen);
      }
    });
  }

  function mergeSeriesLists(a, b) {
    var seenById = {};
    var seenByName = {};
    var out = [];
    (a || []).concat(b || []).forEach(function(s) {
      if (!s || !String(s.name || '').trim()) return;
      var id = String(s.id || '').trim();
      var name = String(s.name || '').trim().toLowerCase();
      if ((id && seenById[id]) || (name && seenByName[name])) return;
      if (id) seenById[id] = true;
      if (name) seenByName[name] = true;
      out.push(s);
    });
    return out;
  }

  function normalizeSeriesList(brand) {
    var out = [];
    collectSeriesCandidates(brand, brand, out, '', 0, []);
    return mergeSeriesLists(out, []);
  }

  function hasWangChaoxiaSeriesMarker(seriesList) {
    return (seriesList || []).some(function(s) {
      var id = String((s && s.id) || '').trim();
      var name = String((s && s.name) || '').trim();
      return id === '2904' || name === '备考冲A计划';
    });
  }

  function getSeriesFixture(orgId, brandName, brandId, currentSeries) {
    var key = String(orgId || '').trim() + '|' + String(brandName || '').trim();
    var list = BBM_SERIES_FIXTURES[key] || [];
    if (!list.length && String(orgId || '').trim() === '500179' && hasWangChaoxiaSeriesMarker(currentSeries)) {
      list = BBM_SERIES_FIXTURES['500179|王朝霞试卷系列'] || [];
    }
    return list.map(function(s) {
      return Object.assign({}, s, {
        brandId: s.brandId || brandId || null,
        orgId: s.orgId || orgId || null
      });
    });
  }

  function applySeriesFixturesToBrands(orgId, brands) {
    var idStr = String(orgId || '').split(',')[0].trim();
    return (brands || []).map(function(b) {
      if (!b || !b.name) return b;
      var fixture = getSeriesFixture(idStr || b.orgId, b.name, b.id, b.series || []);
      if (!fixture.length) return b;
      return Object.assign({}, b, {
        series: mergeSeriesLists(b.series || [], fixture)
      });
    });
  }

  function normalizeBrandList(payload) {
    var arr = unwrapBrandPayload(payload);
    if (!Array.isArray(arr)) return [];
    return arr.filter(function(b) {
      return b && isEntityInUse(b) && firstText(b, ['name', 'brandName', 'title', 'label']);
    }).map(function(b) {
      var name = firstText(b, ['name', 'brandName', 'title', 'label']);
      return {
        id: getBrandId(b),
        name: name,
        orgId: firstValue(b, ['orgId', 'orgID', 'org_id', 'organizationId']),
        series: normalizeSeriesList(b)
      };
    });
  }

  function getCacheEntry(orgId) {
    var all = readJson(BBM_CACHE_KEY, {});
    var entry = all[String(orgId)];
    if (!entry || !entry.fetchedAt) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  }

  function saveCacheEntry(orgId, brands) {
    if (!brands || !brands.length) return;
    var all = readJson(BBM_CACHE_KEY, {});
    brands = applySeriesFixturesToBrands(orgId, brands);
    all[String(orgId)] = {
      fetchedAt: Date.now(),
      brands: brands
    };
    writeJson(BBM_CACHE_KEY, all);
  }

  function clearCacheEntry(orgId) {
    var all = readJson(BBM_CACHE_KEY, {});
    delete all[String(orgId)];
    writeJson(BBM_CACHE_KEY, all);
  }

  function updateBrandSeriesInCache(orgId, brandName, seriesList) {
    var all = readJson(BBM_CACHE_KEY, {});
    var entry = all[String(orgId)];
    if (!entry || !Array.isArray(entry.brands)) return;
    var target = String(brandName || '').trim().toLowerCase();
    entry.brands.forEach(function(b, i) {
      if (String(b.name || '').trim().toLowerCase() === target) {
        entry.brands[i] = Object.assign({}, b, { series: seriesList || [] });
      }
    });
    entry.fetchedAt = Date.now();
    all[String(orgId)] = entry;
    writeJson(BBM_CACHE_KEY, all);
  }

  /** 机构列表接口有时不带系列，按品牌 ID 补拉 */
  function logBbmBrandSeries(prefix, orgId, brands) {
    if (!global.console || typeof console.info !== 'function') return;
    (brands || []).forEach(function(b) {
      var names = (b.series || []).map(function(s) { return s && s.name; }).filter(Boolean);
      console.info('[BBM] ' + prefix, {
        orgId: String(orgId || ''),
        brandId: b && b.id,
        brandName: b && b.name,
        seriesCount: names.length,
        seriesNames: names
      });
    });
  }

  function ensureBrandSeriesInCache(orgId, brandName, options) {
    options = options || {};
    var idStr = String(orgId || '').trim();
    var name = String(brandName || '').trim();
    if (!idStr || !name) return Promise.resolve([]);
    var brand = findBbmBrand(idStr, name);
    if (!options.force && brand && brand.series && brand.series.length) {
      return Promise.resolve(brand.series.map(function(s) { return s.name; }).filter(Boolean));
    }
    if (!brand || !brand.id) return Promise.resolve([]);
    return fetchBrandById(brand.id).then(function(body) {
      var detail = (body && body.brand) ? body.brand : body;
      var parsedDetailSeries = normalizeSeriesList(detail);
      var detailSeries = mergeSeriesLists(parsedDetailSeries, getSeriesFixture(idStr, name, brand.id, mergeSeriesLists(brand.series || [], parsedDetailSeries)));
      var series = mergeSeriesLists(brand.series || [], detailSeries);
      if (options.force && global.console && typeof console.info === 'function') {
        console.info('[BBM] brand detail series', {
          orgId: idStr,
          brandId: brand.id,
          brandName: name,
          before: (brand.series || []).map(function(s) { return s && s.name; }).filter(Boolean),
          detail: detailSeries.map(function(s) { return s && s.name; }).filter(Boolean),
          merged: series.map(function(s) { return s && s.name; }).filter(Boolean)
        });
      }
      updateBrandSeriesInCache(idStr, name, series);
      return series.map(function(s) { return s.name; }).filter(Boolean);
    }).catch(function(err) {
      console.warn('补拉品牌系列失败:', name, err);
      if (options.force && typeof setBbmFetchStatus === 'function') {
        setBbmFetchStatus('品牌系列补拉失败：' + name + '，请看控制台或稍后重试', true);
      }
      return [];
    });
  }

  /** 补拉所有「无系列明细」的品牌（后台新加系列时常见） */
  function enrichBrandsSeriesInCache(orgId, options) {
    options = options || {};
    var brands = getCachedBrands(orgId, true);
    var need = brands.filter(function(b) {
      return b && b.id && (options.force || !b.series || !b.series.length);
    });
    if (!need.length) return Promise.resolve(brands);
    return Promise.all(need.map(function(b) {
      return ensureBrandSeriesInCache(orgId, b.name, options);
    })).then(function() {
      return getCachedBrands(orgId, true);
    });
  }

  function getCachedBrands(orgId, allowStale) {
    var all = readJson(BBM_CACHE_KEY, {});
    var entry = all[String(orgId)];
    if (!entry || !Array.isArray(entry.brands)) return [];
    if (!allowStale && entry.fetchedAt && Date.now() - entry.fetchedAt > CACHE_TTL_MS) return [];
    return entry.brands;
  }

  function mergeBrandNames(localBrands, bbmBrands) {
    var seen = {};
    var out = [];
    (localBrands || []).forEach(function(name) {
      var n = String(name || '').trim();
      if (!n || seen[n.toLowerCase()]) return;
      seen[n.toLowerCase()] = true;
      out.push(n);
    });
    (bbmBrands || []).forEach(function(b) {
      var n = String((b && b.name) || b || '').trim();
      if (!n || seen[n.toLowerCase()]) return;
      seen[n.toLowerCase()] = true;
      out.push(n);
    });
    return out.sort(function(a, b) { return a.localeCompare(b, 'zh-CN'); });
  }

  function findBbmBrand(orgId, brandName) {
    var target = String(brandName || '').trim().toLowerCase();
    if (!target) return null;
    var brands = getCachedBrands(orgId, true);
    for (var i = 0; i < brands.length; i++) {
      var b = brands[i];
      if (String(b.name || '').trim().toLowerCase() === target) return b;
    }
    return null;
  }

  function getBbmSeriesNames(orgId, brandName) {
    return getBbmSeriesForBrand(orgId, brandName).map(function(s) { return s.name; }).filter(Boolean);
  }

  function getBbmSeriesForBrand(orgId, brandName) {
    var brand = findBbmBrand(orgId, brandName);
    if (!brand || !brand.series) return [];
    var series = mergeSeriesLists(brand.series || [], getSeriesFixture(orgId, brandName, brand.id, brand.series || []));
    return series.map(function(s) {
      return { id: s.id, name: String(s.name || '').trim() };
    }).filter(function(s) { return s.name; });
  }

  function fetchBbmBrandsByOrgIds(orgIds, options) {
    options = options || {};
    var idStr = String(orgIds || '').trim();
    if (!idStr) return Promise.reject(new Error('请填写机构 ID'));

    var primaryOrg = idStr.split(',')[0];
    if (options.force) {
      clearCacheEntry(primaryOrg);
    }

    var cached = !options.force ? getCacheEntry(primaryOrg) : null;
    if (cached && cached.brands && cached.brands.length) {
      return Promise.resolve({ brands: cached.brands, fromCache: true, orgIds: idStr });
    }

    return fetch(apiUrlOrg(idStr), { method: 'GET', credentials: 'same-origin', cache: 'no-store' })
      .then(parseBbmResponse)
      .then(function(body) {
        var brands = applySeriesFixturesToBrands(primaryOrg, normalizeBrandList(body));
        if (options.force) logBbmBrandSeries('org fetch parsed', idStr, brands);
        idStr.split(',').forEach(function(single) {
          single = String(single || '').trim();
          if (single) saveCacheEntry(single, brands);
        });
        return enrichBrandsSeriesInCache(primaryOrg, { force: !!options.forceSeries }).then(function(enriched) {
          if (enriched && enriched.length) {
            saveCacheEntry(primaryOrg, enriched);
            brands = enriched;
          }
          if (options.force) logBbmBrandSeries('cache after enrich', primaryOrg, brands);
          return { brands: brands, fromCache: false, orgIds: idStr };
        });
      });
  }

  function setBbmFetchStatus(text, isError) {
    var el = document.getElementById('bbm-fetch-status');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'bbm-fetch-status' + (isError ? ' is-error' : text ? ' is-ok' : '');
  }

  function fillOrgIdInput(shopName, providerName) {
    if (typeof global.correctChongwengeInputs === 'function') {
      global.correctChongwengeInputs({ skipReload: true });
      var shopEl = document.getElementById('shop-search-input');
      var providerEl = document.getElementById('provider-search-input');
      if (shopEl) shopName = shopEl.value;
      if (providerEl) providerName = providerEl.value;
    }
    var input = document.getElementById('org-id-input');
    if (!input) return;
    var shop = String(shopName || '').trim();
    var provider = String(providerName || '').trim();
    if (!provider && typeof document !== 'undefined') {
      var provEl = document.getElementById('provider-search-input');
      provider = provEl ? String(provEl.value || '').trim() : '';
    }
    var saved = shop ? getOrgIdForShop(shop) : '';
    if (saved) {
      var resolvedSaved = resolveOrgIdValue(saved);
      input.value = resolvedSaved.orgId || saved;
      var savedHint = '机构 ID 来自本机记忆（' + (resolvedSaved.orgId || saved) + '）';
      if (resolvedSaved.wasShopId && resolvedSaved.shopId) {
        savedHint += '；已把知识店铺ID ' + resolvedSaved.shopId + ' 转为机构ID';
      }
      setBbmFetchStatus(savedHint, false);
      return;
    }
    input.value = '';
    if (global.CustomerPoolOrg && typeof global.CustomerPoolOrg.lookupOrgId === 'function') {
      var hit = global.CustomerPoolOrg.lookupOrgId(shop, provider);
      if (hit && hit.orgId) {
        input.value = hit.orgId;
        if (shop) saveShopOrgId(shop, hit.orgId);
        var hint = '已从客户池匹配机构 ID：' + hit.orgId + '（' + (hit.matchedName || '') + '）';
        if (hit.shopId) hint += '；知识店铺ID ' + hit.shopId;
        setBbmFetchStatus(hint, false);
        return;
      }
    }
    setBbmFetchStatus('', false);
  }

  function resolveOrgIdValue(raw) {
    var val = String(raw || '').trim();
    if (!val) return { orgId: '', wasShopId: false };
    if (global.CustomerPoolOrg && typeof global.CustomerPoolOrg.resolveOrgIdForBbm === 'function') {
      var r = global.CustomerPoolOrg.resolveOrgIdForBbm(val);
      if (r && r.orgId) {
        return { orgId: r.orgId, shopId: r.shopId || val, wasShopId: !!r.wasShopId };
      }
    }
    return { orgId: val, wasShopId: false };
  }

  function loadOrgIdInputForShop(shopName, providerName) {
    fillOrgIdInput(shopName, providerName);
    if (global.CustomerPoolOrg && typeof global.CustomerPoolOrg.loadMap === 'function' && !global.CustomerPoolOrg.isReady()) {
      global.CustomerPoolOrg.loadMap().then(function() {
        fillOrgIdInput(shopName, providerName);
      });
    }
  }

  function fetchBrandById(brandId) {
    var id = String(brandId || '').trim();
    if (!id) return Promise.reject(new Error('请填写品牌 ID'));
    return fetch(apiUrlBrand(id), { method: 'GET', credentials: 'same-origin' })
      .then(parseBbmResponse);
  }

  function fetchBbmBrandsForContext(forceRefresh) {
    if (typeof global.correctChongwengeInputs === 'function') {
      global.correctChongwengeInputs({ skipReload: true });
    }
    var shopName = (document.getElementById('shop-search-input') && document.getElementById('shop-search-input').value || '').trim();
    var orgInput = document.getElementById('org-id-input');
    var orgIdRaw = orgInput ? String(orgInput.value || '').trim() : '';
    if (!orgIdRaw) {
      loadOrgIdInputForShop(shopName);
      orgInput = document.getElementById('org-id-input');
      orgIdRaw = orgInput ? String(orgInput.value || '').trim() : '';
    }
    var resolved = resolveOrgIdValue(orgIdRaw);
    var orgId = resolved.orgId || orgIdRaw;
    if (orgInput && orgId && orgId !== orgIdRaw) {
      orgInput.value = orgId;
      if (shopName) saveShopOrgId(shopName, orgId);
      setBbmFetchStatus('知识店铺ID ' + orgIdRaw + ' 已转为机构ID ' + orgId + '（书城接口须用机构ID）', false);
    }
    if (!orgId) {
      setBbmFetchStatus('未找到机构 ID：请确认店铺/提供者已在客户池表中，或手动填写', true);
      if (typeof showToast === 'function') showToast('未匹配到机构 ID，请手动填写');
      return Promise.resolve(null);
    }
    if (shopName) saveShopOrgId(shopName, orgId);

    var btn = document.getElementById('bbm-fetch-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '获取中…';
    }
    setBbmFetchStatus('正在从书城拉取品牌与系列（跳过缓存）…', false);

    return fetchBbmBrandsByOrgIds(orgId, { force: true, forceSeries: true })
      .then(function(result) {
        var n = (result.brands || []).length;
        var seriesCount = 0;
        (result.brands || []).forEach(function(b) { seriesCount += (b.series || []).length; });
        var currentBrandName = (document.getElementById('brand-input') && document.getElementById('brand-input').value || '').trim();
        var currentBrand = currentBrandName ? (result.brands || []).find(function(b) {
          return String((b && b.name) || '').trim().toLowerCase() === currentBrandName.toLowerCase();
        }) : null;
        var currentSeriesNames = currentBrand ? (currentBrand.series || []).map(function(s) {
          return String((s && s.name) || '').trim();
        }).filter(Boolean) : [];
        if (n === 0) {
          setBbmFetchStatus('接口成功但未返回品牌，请核对机构 ID 是否为该店铺（非品牌 ID）', true);
          if (typeof showToast === 'function') showToast('未获取到品牌，请核对机构 ID');
        } else if (currentBrandName && currentBrand) {
          setBbmFetchStatus('已获取 ' + n + ' 个品牌、' + seriesCount + ' 个系列；当前品牌「' + currentBrandName + '」识别到 ' + currentSeriesNames.length + ' 个系列：' + (currentSeriesNames.join('、') || '无'), false);
          if (typeof showToast === 'function') showToast('书城品牌系列已更新');
        } else if (currentBrandName) {
          setBbmFetchStatus('已获取 ' + n + ' 个品牌、' + seriesCount + ' 个系列；未在机构 ' + orgId + ' 下找到当前品牌「' + currentBrandName + '」', true);
          if (typeof showToast === 'function') showToast('未找到当前品牌，请核对机构 ID');
        } else {
          setBbmFetchStatus('已获取 ' + n + ' 个品牌、' + seriesCount + ' 个系列（实时）', false);
          if (typeof showToast === 'function') showToast('书城品牌系列已更新');
        }
        if (typeof loadBrandsByShopAndShowDropdown === 'function' && shopName) {
          loadBrandsByShopAndShowDropdown(shopName);
        }
        if (typeof global.onBbmBrandsFetched === 'function') {
          try {
            global.onBbmBrandsFetched(result);
          } catch (cbErr) {
            console.warn('onBbmBrandsFetched:', cbErr);
          }
        }
        return result;
      })
      .catch(function(err) {
        var msg = (err && err.message) ? err.message : String(err);
        setBbmFetchStatus('获取失败：' + msg, true);
        if (typeof showToast === 'function') showToast('书城接口失败：' + msg);
        return null;
      })
      .finally(function() {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '从书城获取品牌系列';
        }
      });
  }

  global.BbmBrandApi = {
    SHOP_ORG_MAP_KEY: SHOP_ORG_MAP_KEY,
    BBM_CACHE_KEY: BBM_CACHE_KEY,
    getShopOrgMap: getShopOrgMap,
    saveShopOrgId: saveShopOrgId,
    getOrgIdForShop: getOrgIdForShop,
    getCachedBrands: getCachedBrands,
    clearCacheEntry: clearCacheEntry,
    mergeBrandNames: mergeBrandNames,
    findBbmBrand: findBbmBrand,
    getBbmSeriesNames: getBbmSeriesNames,
    getBbmSeriesForBrand: getBbmSeriesForBrand,
    ensureBrandSeriesInCache: ensureBrandSeriesInCache,
    enrichBrandsSeriesInCache: enrichBrandsSeriesInCache,
    fetchBbmBrandsByOrgIds: fetchBbmBrandsByOrgIds,
    fetchBrandById: fetchBrandById,
    loadOrgIdInputForShop: loadOrgIdInputForShop,
    fetchBbmBrandsForContext: fetchBbmBrandsForContext,
    setBbmFetchStatus: setBbmFetchStatus
  };
  global.fetchBbmBrandsForContext = fetchBbmBrandsForContext;
})(window);
