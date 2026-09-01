/**
 * QuizUtils — 公共工具函数（IIFE + 命名空间，与现有代码风格一致）
 * 各页面通过 QuizUtils.xxx() 调用，避免重复实现。
 */
var QuizUtils = (function() {

  /* ====== localStorage 读写（JSON 自动序列化）====== */
  function storageGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : {});
    } catch(e) { return fallback !== undefined ? fallback : {}; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
  }

  function storageRemove(key) {
    try { localStorage.removeItem(key); } catch(e) {}
  }

  /* ====== URL / 参数 ====== */
  function getSubjectFromUrl(defaultSubject) {
    var s = new URLSearchParams(window.location.search).get('subject');
    return s || (defaultSubject || '13015');
  }

  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  /* ====== HTML 转义 ====== */
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ====== API 地址拼接 ====== */
  function apiUrl(path) {
    var base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    return base.replace(/\/$/, '') + path;
  }

  /* ====== DOM 简写 ====== */
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* ====== 防抖 ====== */
  function debounce(fn, wait) {
    var t;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(t);
      t = setTimeout(function() { fn.apply(ctx, args); }, wait);
    };
  }

  /* ====== 日期格式化 ====== */
  function formatDate(d) {
    if (!d) return '';
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var day = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  /* ====== 复制到剪贴板 ====== */
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  return {
    storageGet: storageGet,
    storageSet: storageSet,
    storageRemove: storageRemove,
    getSubjectFromUrl: getSubjectFromUrl,
    getUrlParam: getUrlParam,
    esc: esc,
    apiUrl: apiUrl,
    qs: qs,
    qsa: qsa,
    debounce: debounce,
    formatDate: formatDate,
    copyToClipboard: copyToClipboard
  };
})();
