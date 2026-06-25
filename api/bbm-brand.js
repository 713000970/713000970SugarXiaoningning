'use strict';

const { GATEWAY, buildBbmHeaders } = require('../lib/bbm-sign');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function readQuery(req) {
  var q = req.query || {};
  var orgIds = q.orgIds ? String(q.orgIds).trim() : '';
  var brandId = q.brandId ? String(q.brandId).trim() : (q.id ? String(q.id).trim() : '');
  return { orgIds: orgIds, brandId: brandId };
}

function buildRequest(orgIds, brandId) {
  if (brandId && !orgIds) {
    return {
      uri: '/brand/' + encodeURIComponent(brandId),
      queryParams: null,
      url: GATEWAY + '/bbm/brand/' + encodeURIComponent(brandId),
      mode: 'brandId'
    };
  }
  if (orgIds) {
    return {
      uri: '/brand',
      queryParams: { orgIds: orgIds },
      url: GATEWAY + '/bbm/brand?orgIds=' + encodeURIComponent(orgIds),
      mode: 'orgIds'
    };
  }
  return null;
}

function mapUpstreamError(status, mode) {
  if (status === 401) {
    return {
      error: 'BAPI 鉴权失败（401）',
        hint: mode === 'orgIds'
        ? '请确认 bookoms 已开通 BBM 品牌系列接口。此处应填机构 ID（示例 520495），不是网关调试里的品牌 ID（如 1373）。'
        : '请确认 bookoms 已开通 BBM 品牌系列接口。',
      status: 401
    };
  }
  if (status === 403) {
    return {
      error: 'BAPI 禁止访问（403）',
      hint: '当前服务器 IP 可能未加入白名单，请联系书城/运维。',
      status: 403
    };
  }
  return null;
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
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  var query = readQuery(req);
  var spec = buildRequest(query.orgIds, query.brandId);
  if (!spec) {
    json(res, 400, { error: '缺少参数 orgIds 或 brandId' });
    return;
  }

  var appId = process.env.BAPI_APP_ID;
  var secret = process.env.BAPI_SECRET;
  if (!appId || !secret) {
    json(res, 503, { error: '服务端未配置 BAPI_APP_ID / BAPI_SECRET 环境变量' });
    return;
  }

  var headers = buildBbmHeaders(appId, secret, spec.uri, spec.queryParams, process.env.BAPI_SUB_APP_ID || '');
  headers['User-Agent'] = 'xkw-bbm-api-java-sdk';

  try {
    var upstream = await fetch(spec.url, {
      method: 'GET',
      headers: headers
    });
    var text = await upstream.text();
    var data;
    try {
      data = text ? JSON.parse(text) : (spec.mode === 'orgIds' ? [] : {});
    } catch (e) {
      data = { error: text || upstream.statusText, status: upstream.status };
    }

    var mapped = mapUpstreamError(upstream.status, spec.mode);
    if (mapped) data = mapped;

    if (upstream.status === 200 && spec.mode === 'brandId' && data && data.orgId != null) {
      data = {
        brand: data,
        orgId: data.orgId,
        hint: '已按品牌 ID 查询；机构 ID 为 ' + data.orgId + '，可用该机构 ID 拉取全部品牌系列。'
      };
    }

    json(res, upstream.status, data);
  } catch (err) {
    json(res, 502, { error: '请求书城网关失败: ' + (err && err.message ? err.message : String(err)) });
  }
};

