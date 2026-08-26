'use strict';

const { SOURCE_URL, findShareRatio } = require('../lib/qq-share-ratio');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function readQuery(req) {
  const q = req.query || {};
  return {
    shop: q.shop ? String(q.shop).trim() : '',
    shopname: q.shopname ? String(q.shopname).trim() : '',
    provider: q.provider ? String(q.provider).trim() : '',
    orgName: q.orgName ? String(q.orgName).trim() : '',
    orgId: q.orgId ? String(q.orgId).trim() : '',
    shopId: q.shopId ? String(q.shopId).trim() : '',
    providerId: q.providerId ? String(q.providerId).trim() : '',
    force: q.force === '1' || q.force === 'true',
    debug: q.debug === '1' || q.debug === 'true'
  };
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

  const query = readQuery(req);
  if (!query.orgId && !query.shopId && !query.providerId && !query.shop && !query.shopname && !query.provider && !query.orgName) {
    json(res, 400, {
      ok: false,
      error: '缺少查询参数：请提供 orgId/shopId/providerId 或店铺/提供者名称',
      sourceUrl: SOURCE_URL
    });
    return;
  }

  try {
    const result = await findShareRatio(query, { force: query.force });
    if (!query.debug && result && result.match) {
      delete result.match.providerId;
    }
    json(res, 200, result);
  } catch (err) {
    json(res, 502, {
      ok: false,
      error: '分成比例爬取失败：' + (err && err.message ? err.message : String(err)),
      sourceUrl: SOURCE_URL
    });
  }
};
