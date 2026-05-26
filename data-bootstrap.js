/**
 * 官方数据：教辅生产说明-工作表2.csv → providers-from-csv.json
 * 本地缓存过少时用 CSV 灌入，避免 db.js 仅 911 条或云端 0 条覆盖。
 */
window.OFFICIAL_PROVIDERS_URL = 'providers-from-csv.json?v=csv-20260526';

function buildBrandsFromProviders(providers) {
  var seen = {};
  var names = [];
  (providers || []).forEach(function(p) {
    var b = String((p && p.brand) || '').trim();
    if (!b || seen[b]) return;
    seen[b] = true;
    names.push(b);
  });
  names.sort(function(a, b) { return a.localeCompare(b, 'zh-Hans-CN'); });
  return names.map(function(name, i) {
    return { id: String(i + 1), name: name };
  });
}

window.ensureOfficialProvidersLoaded = async function(opts) {
  opts = opts || {};
  var force = !!opts.force;
  var minCount = typeof opts.minCount === 'number' ? opts.minCount : 500;

  var raw = localStorage.getItem('rule_library_providers');
  var list = [];
  try {
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }

  if (!force && list.length >= minCount) {
    return { source: 'local', count: list.length };
  }

  var res = await fetch(window.OFFICIAL_PROVIDERS_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('未找到 ' + window.OFFICIAL_PROVIDERS_URL + '，请与 index.html 一并部署');
  }
  var providers = await res.json();
  if (!Array.isArray(providers) || !providers.length) {
    throw new Error('providers-from-csv.json 为空');
  }

  localStorage.setItem('rule_library_providers', JSON.stringify(providers));
  localStorage.setItem('rule_library_brands', JSON.stringify(buildBrandsFromProviders(providers)));
  localStorage.setItem('rule_library_local_dirty', '1');

  console.log('[规则库] 已从 CSV 官方表载入本机 ' + providers.length + ' 条');
  return { source: 'csv', count: providers.length };
};
