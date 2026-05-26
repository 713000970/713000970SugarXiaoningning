/**
 * 站点配置（在 app.js / cloud-sync.js 之前加载）
 * multiUser: true 时隐藏「以云端为准」等易覆盖他人数据的入口
 * 维护人员可在地址栏加 ?admin=1 临时显示
 */
window.RULE_LIBRARY_CONFIG = Object.assign(
  {
    multiUser: true
  },
  window.RULE_LIBRARY_CONFIG || {}
);
