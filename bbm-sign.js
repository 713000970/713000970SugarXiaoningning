'use strict';

const crypto = require('crypto');

const GATEWAY = process.env.BAPI_GATEWAY || 'https://gw.xkw.com';

const HMAC = {
  APP_ID: 'Bapi-App-Id',
  TIMESTAMP: 'Bapi-Timestamp',
  SIGN: 'Bapi-Sign',
  SUB_APP_ID: 'Bapi-Sub-App-Id',
  REQUEST_ID: 'X-Request-Id',
  URL: 'bapi_url'
};

/** 与 xkw-bapi-hmac 3.0.1 HmacUtils.formatString 一致 */
function formatString(value) {
  var str = typeof value === 'string' ? value : String(value);
  var urlStr = encodeURIComponent(str);
  urlStr = urlStr.replace(/\+/g, '%20').replace(/\*/g, '%2A').replace(/%7E/g, '~');
  return urlStr;
}

function base64Str(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

/** xkw-bapi-hmac 3.0.1：排序 → key=URLEncode(value)& → secret= → Base64 → SHA1 hex */
function getSignatureString(signMap, secret) {
  var keys = Object.keys(signMap)
    .filter(function(k) { return k != null && signMap[k] != null; })
    .sort();
  var sb = '';
  keys.forEach(function(key) {
    sb += key + '=' + formatString(signMap[key]) + '&';
  });
  sb += 'secret=' + secret;
  var encoded = base64Str(sb);
  return crypto.createHash('sha1').update(encoded, 'utf8').digest('hex');
}

function newRequestId() {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * @param {string} appId
 * @param {string} secret
 * @param {string} uri 相对 /bbm 的路径，如 /brand 或 /brand/1373
 * @param {Record<string, string>} [queryParams]
 * @param {string} [subAppId]
 */
function buildBbmHeaders(appId, secret, uri, queryParams, subAppId) {
  var timestamp = String(Math.floor(Date.now() / 1000));
  var signMap = {};
  signMap[HMAC.APP_ID] = appId;
  signMap[HMAC.TIMESTAMP] = timestamp;
  if (queryParams) {
    Object.keys(queryParams).forEach(function(k) {
      signMap[k] = String(queryParams[k]);
    });
  }
  signMap[HMAC.URL] = uri;
  var sign = getSignatureString(signMap, secret);

  var headers = {};
  headers[HMAC.APP_ID] = appId;
  headers[HMAC.TIMESTAMP] = timestamp;
  headers[HMAC.SIGN] = sign;
  headers[HMAC.REQUEST_ID] = newRequestId();
  if (subAppId) headers[HMAC.SUB_APP_ID] = subAppId;
  return headers;
}

module.exports = {
  GATEWAY,
  HMAC,
  formatString,
  buildBbmHeaders,
  getSignatureString,
  newRequestId
};
