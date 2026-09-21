'use strict';

const SUPABASE_URL = 'https://wsrbjgiscfxsyucsgzof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EenxYjB0VmulAQRr24IyDw_mj1AxX38';
const PAGE_SIZE = 1000;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function parseContentRange(header) {
  const m = String(header || '').match(/(\d+)\s*-\s*(\d+)\s*\/\s*(\d+|\*)/);
  if (!m || m[3] === '*') return null;
  const total = parseInt(m[3], 10);
  return Number.isFinite(total) ? total : null;
}

function headers(extra) {
  return Object.assign({
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  }, extra || {});
}

async function fetchCount() {
  const res = await fetch(SUPABASE_URL + '/rest/v1/providers?select=id', {
    headers: headers({
      'Range-Unit': 'items',
      Range: '0-0',
      Prefer: 'count=exact'
    })
  });
  if (!res.ok) {
    throw new Error('count HTTP ' + res.status + ': ' + await res.text());
  }
  await res.json().catch(() => []);
  return parseContentRange(res.headers.get('content-range') || res.headers.get('Content-Range'));
}

async function fetchRange(from, to) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/providers?select=*', {
    headers: headers({
      'Range-Unit': 'items',
      Range: from + '-' + to
    })
  });
  if (!res.ok) {
    throw new Error('range ' + from + '-' + to + ' HTTP ' + res.status + ': ' + await res.text());
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const total = await fetchCount();
    if (!total || total < 1) {
      json(res, 200, { ok: true, total: total || 0, rows: [] });
      return;
    }

    const ranges = [];
    for (let from = 0; from < total; from += PAGE_SIZE) {
      ranges.push([from, Math.min(from + PAGE_SIZE - 1, total - 1)]);
    }

    const parts = await Promise.all(ranges.map(([from, to]) => fetchRange(from, to)));
    const rows = [].concat(...parts);
    json(res, 200, {
      ok: true,
      total,
      count: rows.length,
      rows
    });
  } catch (err) {
    json(res, 502, {
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
};
