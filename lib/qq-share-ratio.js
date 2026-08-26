'use strict';

const zlib = require('zlib');

const PAGE_ID = 'DUUV4bUZ5b05KcWhl';
const TAB_ID = 'hdmzy1';
const SOURCE_URL = `https://docs.qq.com/sheet/${PAGE_ID}?tab=${TAB_ID}`;
const OPENDOC_URL = `https://docs.qq.com/dop-api/opendoc?id=${PAGE_ID}&tab=${TAB_ID}&outformat=1&normal=1&noEscape=1`;
const FALLBACK_ULTRABUF_URL = 'https://docs.gtimg.com/sheet/js/initial_ultrabuf.503acc1aaef3dad6.js';
const COMMAND_DATA_TYPE = 17810;
const INLINE_NUMBER_MAX_VALUE_ID = 128;
const CACHE_TTL_MS = 10 * 60 * 1000;

const REQUEST_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  accept: '*/*',
  referer: SOURCE_URL
};

let decoderPromise = null;
let rowsCache = null;

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchText(url, options) {
  if (typeof fetch !== 'function') {
    throw new Error('当前 Node 版本不支持 fetch');
  }
  const res = await fetch(url, options || {});
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${url} HTTP ${res.status}: ${text.slice(0, 160)}`);
  }
  return text;
}

function parseMaybeJsonp(text) {
  const raw = String(text || '').trim();
  if (!raw) return {};
  if (raw[0] === '{' || raw[0] === '[') return JSON.parse(raw);

  const start = raw.indexOf('(');
  const end = raw.lastIndexOf(')');
  if (start < 0 || end <= start) {
    throw new Error('无法解析腾讯文档 opendoc 返回');
  }

  const body = raw.slice(start + 1, end).trim();
  try {
    return JSON.parse(body);
  } catch (err) {
    const decoded = decodeEntities(body);
    if (decoded[0] === '"' && decoded[decoded.length - 1] === '"') {
      return JSON.parse(JSON.parse(decoded));
    }
    return JSON.parse(decoded.replace(/\\"/g, '"'));
  }
}

function base64UrlToBuffer(value) {
  let b64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64');
}

class Reader {
  constructor(buf) {
    this.buf = Buffer.from(buf);
    this.pos = 0;
    this.len = this.buf.length;
  }

  static create(buf) { return new Reader(buf); }

  uint32() { return Number(this._varint()); }
  int32() { return this.uint32() | 0; }
  bool() { return this.uint32() !== 0; }
  sint32() {
    const n = this.uint32();
    return (n >>> 1) ^ -(n & 1);
  }
  uint64() { return this._varint(); }
  int64() { return this._varint(); }
  sint64() {
    const n = this._varint();
    const v = (n >> 1n) ^ (-(n & 1n));
    return Number(v);
  }
  fixed32() {
    const v = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return v;
  }
  sfixed32() {
    const v = this.buf.readInt32LE(this.pos);
    this.pos += 4;
    return v;
  }
  fixed64() {
    const v = this.buf.readBigUInt64LE(this.pos);
    this.pos += 8;
    return v;
  }
  sfixed64() {
    const v = this.buf.readBigInt64LE(this.pos);
    this.pos += 8;
    return v;
  }
  float() {
    const v = this.buf.readFloatLE(this.pos);
    this.pos += 4;
    return v;
  }
  double() {
    const v = this.buf.readDoubleLE(this.pos);
    this.pos += 8;
    return v;
  }
  bytes() {
    const len = this.uint32();
    const end = this.pos + len;
    const out = this.buf.slice(this.pos, end);
    this.pos = end;
    return out;
  }
  string() {
    return this.bytes().toString('utf8');
  }
  skipType(wire) {
    if (wire === 0) { this._varint(); return; }
    if (wire === 1) { this.pos += 8; return; }
    if (wire === 2) { this.pos += this.uint32(); return; }
    if (wire === 5) { this.pos += 4; return; }
    throw new Error('skip wire ' + wire);
  }
  _varint() {
    let result = 0n;
    let shift = 0n;
    while (this.pos < this.len) {
      const b = this.buf[this.pos++];
      result |= BigInt(b & 0x7f) << shift;
      if ((b & 0x80) === 0) {
        if (result <= BigInt(Number.MAX_SAFE_INTEGER)) return Number(result);
        return result;
      }
      shift += 7n;
    }
    throw new Error('truncated varint');
  }
}

async function discoverUltrabufUrl() {
  try {
    const html = await fetchText(SOURCE_URL, {
      headers: Object.assign({}, REQUEST_HEADERS, {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      })
    });
    const direct = html.match(/https?:\/\/docs\.gtimg\.com\/sheet\/js\/initial_ultrabuf\.[^"'<>]+\.js/);
    if (direct) return direct[0];
    const protocolRelative = html.match(/\/\/docs\.gtimg\.com\/sheet\/js\/initial_ultrabuf\.[^"'<>]+\.js/);
    if (protocolRelative) return 'https:' + protocolRelative[0];
    const relative = html.match(/["']([^"']*initial_ultrabuf\.[^"']+\.js)["']/);
    if (relative && relative[1]) {
      const url = decodeEntities(relative[1]);
      if (/^https?:\/\//.test(url)) return url;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('/')) return 'https://docs.gtimg.com' + url;
      return 'https://docs.gtimg.com/sheet/js/' + url.replace(/^.*\//, '');
    }
  } catch (err) {
    // The fallback is the currently observed ultrabuf bundle. Tencent may keep it stable for long periods.
  }
  return FALLBACK_ULTRABUF_URL;
}

async function loadDecoder() {
  if (decoderPromise) return decoderPromise;
  decoderPromise = (async function() {
    const ultrabufUrl = await discoverUltrabufUrl();
    const code = await fetchText(ultrabufUrl, {
      headers: Object.assign({}, REQUEST_HEADERS, { referer: 'https://docs.qq.com/' })
    });

    const chunks = [];
    const self = {
      webpackChunk_tencent_sheet: {
        push(args) {
          chunks.push(args);
        }
      }
    };
    Function('self', code + '\nreturn self.webpackChunk_tencent_sheet;')(self);

    const modules = {};
    chunks.forEach((chunk) => Object.assign(modules, chunk[1] || {}));
    const cache = {};

    function req(id) {
      id = String(id);
      if (cache[id]) return cache[id].exports;
      if (!modules[id]) {
        if (id === '227983') {
          return {
            _: function(sub, sup) {
              sub.prototype = Object.create(sup.prototype);
              sub.prototype.constructor = sub;
              if (Object.setPrototypeOf) Object.setPrototypeOf(sub, sup);
              else sub.__proto__ = sup; // eslint-disable-line no-proto
            }
          };
        }
        if (id === '318732') {
          return {
            Reader,
            Writer: { create: function() { throw new Error('Writer not implemented'); } }
          };
        }
        if (['82422', '996064', '235528', '513139', '524322', '483297', '809169'].includes(id)) return {};
        throw new Error('missing Tencent ultrabuf module ' + id);
      }

      const mod = { exports: {} };
      cache[id] = mod;
      modules[id](mod, mod.exports, req);
      return mod.exports;
    }

    req.d = function(exports, definition) {
      Object.keys(definition).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      });
    };
    req.n = function(module) {
      const getter = module && module.__esModule ? function() { return module.default; } : function() { return module; };
      req.d(getter, { a: getter });
      return getter;
    };
    req.o = function(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
    req.r = function(exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
    req.g = globalThis;
    req.j = 67070;

    const exp = req(621518);
    if (!exp || !exp.e || !exp.e._CGV || typeof exp.e._CGV.decode !== 'function') {
      throw new Error('腾讯文档 ultrabuf 解码器不可用');
    }

    return {
      decode: exp.e._CGV.decode.bind(exp.e._CGV),
      commandDataType: exp.G && exp.G.CommandData ? exp.G.CommandData : COMMAND_DATA_TYPE,
      ultrabufUrl
    };
  })();
  return decoderPromise;
}

async function fetchOpendoc() {
  const text = await fetchText(OPENDOC_URL + '&t=' + Date.now(), {
    headers: REQUEST_HEADERS
  });
  return parseMaybeJsonp(text);
}

function readRelatedSheet(data) {
  const vars = data && data.clientVars;
  const collab = vars && vars.collab_client_vars;
  const attributed = collab && collab.initialAttributedText;
  const text = attributed && attributed.text;
  const first = Array.isArray(text) ? text[0] : null;
  const related = first && first.related_sheet;
  if (!related) throw new Error('腾讯文档返回中缺少 related_sheet');
  return related;
}

function normalizeCellValue(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return Number.isFinite(value) ? value : '';
  if (Array.isArray(value)) return value.map(normalizeCellValue).join('');
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    return '';
  }
  return String(value).trim();
}

function resolveRichString(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value.r)) {
    return value.r.map((part) => part && part.t ? String(part.t) : '').join('');
  }
  return '';
}

function resolveValueRef(ref, valueDelta, depth) {
  if (!ref || ref.valueId === undefined || ref.valueId === null || depth > 8) return '';
  const valueId = Number(ref.valueId);
  const type = Number(ref.type);

  if (type === 1 || type === 2) {
    if (Number.isInteger(valueId) && valueId >= 0 && valueId <= INLINE_NUMBER_MAX_VALUE_ID) return valueId;
    return normalizeCellValue((valueDelta.numbers || [])[valueId - INLINE_NUMBER_MAX_VALUE_ID - 1]);
  }
  if (type === 4) return normalizeCellValue((valueDelta.strings || [])[valueId]);
  if (type === 5) {
    const formula = (valueDelta.formulas || [])[valueId];
    return resolveValueRef(formula && formula.formulaResult, valueDelta, depth + 1);
  }
  if (type === 6 || type === 8) return resolveRichString((valueDelta.richStrings || [])[valueId]);

  const stringValue = (valueDelta.strings || [])[valueId];
  if (stringValue !== undefined) return normalizeCellValue(stringValue);
  const numberValue = (valueDelta.numbers || [])[valueId];
  if (numberValue !== undefined) return normalizeCellValue(numberValue);
  return '';
}

function buildSheetRows(decoded) {
  const mutations = decoded && decoded.mutations ? decoded.mutations : [];
  const setRangeMutation = mutations.find((m) => m && m.setRange);
  const setRange = setRangeMutation && setRangeMutation.setRange;
  if (!setRange || !setRange.valueDelta || !Array.isArray(setRange.cellDeltaAtPositions)) {
    throw new Error('腾讯文档表格数据结构异常');
  }

  const rowsByIndex = new Map();
  setRange.cellDeltaAtPositions.forEach((pos) => {
    if (!pos || !pos.cellDelta) return;
    const value = normalizeCellValue(resolveValueRef(pos.cellDelta, setRange.valueDelta, 0));
    if (value === '') return;
    const rowIndex = Number(pos.rowIndex);
    const colIndex = Number(pos.colIndex);
    if (!rowsByIndex.has(rowIndex)) rowsByIndex.set(rowIndex, {});
    rowsByIndex.get(rowIndex)[colIndex] = value;
  });

  return Array.from(rowsByIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rowIndex, cells]) => ({ rowIndex, cells }));
}

function normalizeHeader(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function findHeaderRow(sheetRows) {
  const required = ['机构ID', '知识店铺ID', '提供者ID', '机构名称', '知识店铺店铺名称', '提供者（店长）', '是否独家', '分成比例'];
  let best = null;

  sheetRows.forEach((row) => {
    const headers = Object.values(row.cells || {}).map(normalizeHeader);
    const score = required.reduce((n, key) => n + (headers.includes(key) ? 1 : 0), 0);
    if (!best || score > best.score) best = { row, score };
  });

  if (!best || best.score < 5) {
    throw new Error('未找到包含「机构ID/分成比例」的表头行');
  }
  return best.row;
}

function headerIndexMap(headerRow) {
  const aliases = {
    orgId: ['机构ID'],
    shopId: ['知识店铺ID'],
    providerId: ['提供者ID'],
    orgName: ['机构名称'],
    shopName: ['知识店铺店铺名称', '知识店铺名称', '店铺名称'],
    providerName: ['提供者（店长）', '提供者', '店长'],
    exclusive: ['是否独家'],
    shareRatio: ['分成比例']
  };
  const byName = {};
  Object.keys(headerRow.cells || {}).forEach((col) => {
    const name = normalizeHeader(headerRow.cells[col]);
    if (name) byName[name] = Number(col);
  });

  const out = {};
  Object.keys(aliases).forEach((field) => {
    const hit = aliases[field].find((name) => byName[name] !== undefined);
    if (hit) out[field] = byName[hit];
  });
  if (out.shareRatio === undefined) throw new Error('表头缺少「分成比例」列');
  return out;
}

function normalizeLookupText(value) {
  let s = String(value || '');
  try {
    if (typeof s.normalize === 'function') s = s.normalize('NFKC');
  } catch (err) {
    // ignore
  }
  return s
    .replace(/\u00a0/g, ' ')
    .replace(/\u3000/g, ' ')
    .trim()
    .toLowerCase();
}

function isMissingSheetValue(value) {
  const s = normalizeLookupText(value);
  return !s || s === '#n/a' || s === '#na' || s === 'n/a' || s === 'na' || s === '/' || s === '0';
}

function normalizeEntityKey(value) {
  if (isMissingSheetValue(value)) return '';
  return normalizeLookupText(value).replace(/[()（）\s]/g, '');
}

function normalizeId(value) {
  if (isMissingSheetValue(value)) return '';
  return String(value === undefined || value === null ? '' : value).trim().replace(/\.0$/, '');
}

function formatPercent(percent) {
  if (percent === undefined || percent === null || Number.isNaN(percent)) return '';
  const rounded = Math.round(percent * 100) / 100;
  return String(rounded).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') + '%';
}

function normalizeShareRatio(value) {
  if (value === undefined || value === null) {
    return { raw: '', shareRatio: '', sharePercent: null, isDefault70: false };
  }
  const raw = String(value).trim();
  if (!raw) return { raw: '', shareRatio: '', sharePercent: null, isDefault70: false };
  let percent = null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    percent = Math.abs(value) <= 1 ? value * 100 : value;
  } else {
    const text = raw.replace(/％/g, '%').replace(/\s+/g, '');
    const numMatch = text.match(/-?\d+(?:\.\d+)?/);
    if (numMatch) {
      const n = Number(numMatch[0]);
      if (Number.isFinite(n)) percent = Math.abs(n) <= 1 ? n * 100 : n;
    } else if (/三七|3\/7|七成|70%?/.test(text)) {
      percent = 70;
    } else if (/四六|4\/6|六成|60%?/.test(text)) {
      percent = 60;
    } else if (/五五|5\/5|五成|50%?/.test(text)) {
      percent = 50;
    } else if (/二八|2\/8|八成|80%?/.test(text)) {
      percent = 80;
    }
  }

  const shareRatio = percent === null ? raw : formatPercent(percent);
  const isReasonablePercent = percent === null || (percent > 0 && percent <= 100);
  return {
    raw,
    shareRatio: isReasonablePercent ? shareRatio : '',
    sharePercent: isReasonablePercent ? percent : null,
    isDefault70: percent !== null && Math.abs(percent - 70) < 0.01
  };
}

function convertRows(sheetRows) {
  const header = findHeaderRow(sheetRows);
  const indexes = headerIndexMap(header);
  return sheetRows
    .filter((row) => row.rowIndex > header.rowIndex)
    .map((row) => {
      const cells = row.cells || {};
      const ratio = normalizeShareRatio(cells[indexes.shareRatio]);
      const item = {
        rowNumber: row.rowIndex + 1,
        orgId: normalizeId(cells[indexes.orgId]),
        shopId: normalizeId(cells[indexes.shopId]),
        providerId: normalizeId(cells[indexes.providerId]),
        orgName: normalizeCellValue(cells[indexes.orgName]),
        shopName: normalizeCellValue(cells[indexes.shopName]),
        providerName: normalizeCellValue(cells[indexes.providerName]),
        exclusive: normalizeCellValue(cells[indexes.exclusive]),
        shareRatioRaw: ratio.raw,
        shareRatio: ratio.shareRatio,
        sharePercent: ratio.sharePercent,
        isDefault70: ratio.isDefault70
      };
      item.searchKeys = {
        orgName: normalizeEntityKey(item.orgName),
        shopName: normalizeEntityKey(item.shopName),
        providerName: normalizeEntityKey(item.providerName)
      };
      return item;
    })
    .filter((row) => row.orgId || row.shopId || row.providerId || row.orgName || row.shopName || row.providerName);
}

async function loadShareRows(options) {
  options = options || {};
  const now = Date.now();
  if (!options.force && rowsCache && rowsCache.expiresAt > now) {
    return rowsCache;
  }

  const raw = await loadRawSheetRows();
  const rows = convertRows(raw.sheetRows);

  rowsCache = {
    rows,
    rowCount: rows.length,
    crawledAt: raw.crawledAt,
    expiresAt: now + CACHE_TTL_MS,
    sourceUrl: SOURCE_URL,
    ultrabufUrl: raw.ultrabufUrl
  };
  return rowsCache;
}

async function loadRawSheetRows() {
  const decoder = await loadDecoder();
  const opendoc = await fetchOpendoc();
  const relatedSheet = readRelatedSheet(opendoc);
  const inflated = zlib.inflateSync(base64UrlToBuffer(relatedSheet));
  const decoded = decoder.decode(inflated, decoder.commandDataType);
  return {
    sheetRows: buildSheetRows(decoded),
    decoded,
    crawledAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    ultrabufUrl: decoder.ultrabufUrl
  };
}

function hasExactId(rows, field, value) {
  const id = normalizeId(value);
  if (!id) return false;
  return rows.some((row) => normalizeId(row[field]) === id);
}

function rowTextMatches(row, query) {
  const shop = normalizeEntityKey(query.shop);
  const shopname = normalizeEntityKey(query.shopname);
  const provider = normalizeEntityKey(query.provider);
  const org = normalizeEntityKey(query.orgName);
  const rowOrg = row.searchKeys.orgName;
  const rowShop = row.searchKeys.shopName;
  const rowProvider = row.searchKeys.providerName;

  let score = 0;
  const reasons = [];

  if (org && rowOrg && (rowOrg === org || rowOrg.indexOf(org) !== -1 || org.indexOf(rowOrg) !== -1)) {
    score += rowOrg === org ? 40 : 20;
    reasons.push('机构名称');
  }
  if (shop && rowShop && (rowShop === shop || rowShop.indexOf(shop) !== -1 || shop.indexOf(rowShop) !== -1)) {
    score += rowShop === shop ? 30 : 15;
    reasons.push('店铺名称');
  }
  if (shopname && rowShop && (rowShop === shopname || rowShop.indexOf(shopname) !== -1 || shopname.indexOf(rowShop) !== -1)) {
    score += rowShop === shopname ? 30 : 15;
    reasons.push('店铺别名');
  }
  if (provider && rowProvider && (rowProvider === provider || rowProvider.indexOf(provider) !== -1 || provider.indexOf(rowProvider) !== -1)) {
    score += rowProvider === provider ? 35 : 18;
    reasons.push('提供者');
  }

  const hasTextQuery = !!(org || shop || shopname || provider);
  return {
    ok: !hasTextQuery || score > 0,
    score,
    reasons
  };
}

function pickBestMatch(rows, query) {
  query = query || {};
  let candidates = rows.slice();
  const reasons = [];

  const orgId = normalizeId(query.orgId);
  if (orgId) {
    const exact = candidates.filter((row) => normalizeId(row.orgId) === orgId);
    if (exact.length) {
      candidates = exact;
      reasons.push('机构ID');
    } else {
      return null;
    }
  }

  const shopId = normalizeId(query.shopId);
  if (shopId && hasExactId(candidates, 'shopId', shopId)) {
    candidates = candidates.filter((row) => normalizeId(row.shopId) === shopId);
    reasons.push('知识店铺ID');
  }

  const providerId = normalizeId(query.providerId);
  if (providerId && hasExactId(candidates, 'providerId', providerId)) {
    candidates = candidates.filter((row) => normalizeId(row.providerId) === providerId);
    reasons.push('提供者ID');
  }

  const scored = candidates
    .map((row) => {
      const textMatch = rowTextMatches(row, query);
      return {
        row,
        score: textMatch.score + reasons.length * 100,
        reasons: reasons.concat(textMatch.reasons)
      };
    })
    .filter((item) => item.score > 0 || reasons.length > 0);

  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score || a.row.rowNumber - b.row.rowNumber);
  return scored[0];
}

async function findShareRatio(query, options) {
  const cache = await loadShareRows(options || {});
  const hit = pickBestMatch(cache.rows, query || {});
  if (!hit) {
    return {
      ok: true,
      found: false,
      rowCount: cache.rowCount,
      sourceUrl: cache.sourceUrl,
      crawledAt: cache.crawledAt
    };
  }

  const row = hit.row;
  return {
    ok: true,
    found: true,
    rowCount: cache.rowCount,
    sourceUrl: cache.sourceUrl,
    crawledAt: cache.crawledAt,
    matchReason: Array.from(new Set(hit.reasons)).join('+') || '名称匹配',
    match: {
      rowNumber: row.rowNumber,
      orgId: row.orgId,
      shopId: row.shopId,
      providerId: row.providerId,
      orgName: row.orgName,
      shopName: row.shopName,
      providerName: row.providerName,
      exclusive: row.exclusive
    },
    shareRatioRaw: row.shareRatioRaw,
    shareRatio: row.shareRatio,
    sharePercent: row.sharePercent,
    isDefault70: row.isDefault70,
    cooperationMode: row.isDefault70 ? '' : '非独家合作'
  };
}

module.exports = {
  SOURCE_URL,
  normalizeShareRatio,
  loadRawSheetRows,
  loadShareRows,
  findShareRatio
};
