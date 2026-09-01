/**
 * theme-sync.js — 内容页面主题同步
 * 监听父窗口（工作台外壳）的主题切换，同步到 iframe 内的内容页面
 * 统一使用工作台右上角按钮，无需独立 UI
 * 主题颜色由 _root.scss 的 [data-theme] CSS 规则定义
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'workbench-theme';

  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
  }

  // 监听父窗口的主题切换消息
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'workbench-theme-change') {
      applyTheme(e.data.theme);
    }
  });

  // 初始加载：从 localStorage 读取已保存的主题（CSS 规则自动生效）
  var saved = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(saved);
})();
