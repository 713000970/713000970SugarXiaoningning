'use strict';

/**
 * 书城 BBM 品牌/系列前端模块（通过 /api/bbm-brand 代理，secret 不在浏览器）
 */
(function(global) {
  var SHOP_ORG_MAP_KEY = 'rule_library_shop_org_map';
  var BBM_CACHE_KEY = 'rule_library_bbm_brand_cache';
  var CACHE_TTL_MS = 6 * 60 * 60 * 1000;

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
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.items)) return body.items;
    if (Array.isArray(body.result)) return body.result;
    if (Array.isArray(body.brands)) return body.brands;
    if (Array.isArray(body.list)) return body.list;
    return [];
  }

  function normalizeSeriesList(brand) {
    var list = (brand && brand.series) || (brand && brand.brandSeries) || (brand && brand.seriesList) || [];
    if (!Array.isArray(list)) return [];
    return list.filter(function(s) {
      return s && isEntityInUse(s) && String(s.name || s.seriesName || '').trim();
    }).map(function(s) {
      return {
        id: s.id,
        name: String(s.name || s.seriesName || '').trim(),
        brandId: s.brandId || (brand && brand.id)
      };
    });
  }

  function normalizeBrandList(payload) {
    var arr = unwrapBrandPayload(payload);
    if (!Array.isArray(arr)) return [];
    return arr.filter(function(b) {
      return b && isEntityInUse(b) && String(b.name || b.brandName || '').trim();
    }).map(function(b) {
      return {
        id: b.id,
        name: String(b.name || b.brandName || '').trim(),
        orgId: b.orgId,
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
  function ensureBrandSeriesInCache(orgId, brandName) {
    var idStr = String(orgId || '').trim();
    var name = String(brandName || '').trim();
    if (!idStr || !name) return Promise.resolve([]);
    var brand = findBbmBrand(idStr, name);
    if (brand && brand.series && brand.series.length) {
      return Promise.resolve(brand.series.map(function(s) { return s.name; }).filter(Boolean));
    }
    if (!brand || !brand.id) return Promise.resolve([]);
    return fetchBrandById(brand.id).then(function(body) {
      var detail = (body && body.brand) ? body.brand : body;
      var series = normalizeSeriesList(detail);
      updateBrandSeriesInCache(idStr, name, series);
      return series.map(function(s) { return s.name; }).filter(Boolean);
    }).catch(function(err) {
      console.warn('补拉品牌系列失败:', name, err);
      return [];
    });
  }

  /** 补拉所有「无系列明细」的品牌（后台新加系列时常见） */
  function enrichBrandsSeriesInCache(orgId) {
    var brands = getCachedBrands(orgId, true);
    var need = brands.filter(function(b) {
      return b && b.id && (!b.series || !b.series.length);
    });
    if (!need.length) return Promise.resolve(brands);
    return Promise.all(need.map(function(b) {
      return ensureBrandSeriesInCache(orgId, b.name);
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
    return brand.series.map(function(s) {
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
      .then(function(res) {
        return res.json().then(function(body) {
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error((body && body.hint) ? body.hint : '书城网关鉴权失败（401），请联系运维确认 bookoms 凭证与 IP 白名单');
            }
            if (res.status === 403) {
              throw new Error((body && body.hint) ? body.hint : '书城网关拒绝访问（403），可能 IP 未白名单');
            }
            var msg = (body && body.error) ? body.error : ('HTTP ' + res.status);
            throw new Error(msg);
          }
          return body;
        });
      })
      .then(function(body) {
        var brands = normalizeBrandList(body);
        idStr.split(',').forEach(function(single) {
          single = String(single || '').trim();
          if (single) saveCacheEntry(single, brands);
        });
        return enrichBrandsSeriesInCache(primaryOrg).then(function(enriched) {
          if (enriched && enriched.length) {
            saveCacheEntry(primaryOrg, enriched);
            brands = enriched;
          }
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
      .then(function(res) {
        return res.json().then(function(body) {
          if (!res.ok) {
            var msg = (body && body.hint) ? body.hint : ((body && body.error) ? body.error : ('HTTP ' + res.status));
            throw new Error(msg);
          }
          return body;
        });
      });
  }

  function fetchBbmBrandsForContext(forceRefresh) {
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

    return fetchBbmBrandsByOrgIds(orgId, { force: true })
      .then(function(result) {
        var n = (result.brands || []).length;
        var seriesCount = 0;
        (result.brands || []).forEach(function(b) { seriesCount += (b.series || []).length; });
        if (n === 0) {
          setBbmFetchStatus('接口成功但未返回品牌，请核对机构 ID 是否为该店铺（非品牌 ID）', true);
          if (typeof showToast === 'function') showToast('未获取到品牌，请核对机构 ID');
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
