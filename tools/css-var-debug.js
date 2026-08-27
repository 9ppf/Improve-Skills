/**
 * CSS 变量调试脚本
 * 用法1：在浏览器控制台粘贴本文件全部内容
 * 用法2：browser_evaluate 加载本文件
 *
 * 输出格式：
 *   ✅ --bg: #F0F9FF
 *   ❌ --accent: (空值!) ← 根因线索
 *   📋 data-theme: dark
 *   🔍 .ask-ai-btn background: rgba(0,0,0,0) ← 透明背景
 */
(function () {
  var root = document.documentElement;
  var rs = getComputedStyle(root);
  var theme = root.getAttribute('data-theme') || '(未设置)';

  // 收集 :root 上所有自定义属性
  var vars = [];
  for (var i = 0; i < rs.length; i++) {
    var prop = rs[i];
    if (prop.startsWith('--')) {
      var val = rs.getPropertyValue(prop).trim();
      vars.push({ name: prop, value: val });
    }
  }

  // 分类输出
  var ok = vars.filter(function (v) { return v.value !== ''; });
  var empty = vars.filter(function (v) { return v.value === ''; });

  console.log('════════════════════════════════');
  console.log('📋 data-theme: ' + theme);
  console.log('📊 变量总数: ' + vars.length + ' | 有值: ' + ok.length + ' | 空值: ' + empty.length);
  console.log('════════════════════════════════');

  // 先输出空值（问题变量）
  if (empty.length > 0) {
    console.log('\n❌ 空值变量（' + empty.length + '个）— 这些可能是样式不生效的根因:');
    empty.forEach(function (v) {
      console.log('  ❌ ' + v.name + ': (空值!)');
    });
  } else {
    console.log('\n✅ 所有变量都有值，无空值问题');
  }

  // 再输出关键变量
  var keyVars = ['--bg', '--surface', '--sidebar', '--ink', '--accent', '--accent2', '--grad-135', '--grad-90'];
  console.log('\n🔑 关键变量值:');
  keyVars.forEach(function (name) {
    var val = rs.getPropertyValue(name).trim();
    var icon = val === '' ? '❌' : '✅';
    console.log('  ' + icon + ' ' + name + ': ' + (val || '(空值!)'));
  });

  // 检查指定元素的 computed style（如果有参数传入）
  // 用法：cssVarDebug('.ask-ai-btn')
  if (window.__cssDebugTarget) {
    var el = document.querySelector(window.__cssDebugTarget);
    if (el) {
      var cs = getComputedStyle(el);
      console.log('\n🔍 元素 "' + window.__cssDebugTarget + '" 关键样式:');
      ['background', 'backgroundColor', 'backgroundImage', 'color', 'opacity', 'display', 'visibility'].forEach(function (prop) {
        console.log('  ' + prop + ': ' + cs[prop]);
      });
    } else {
      console.log('\n⚠️ 未找到元素: ' + window.__cssDebugTarget);
    }
  }

  console.log('\n────────────────────────────────');
  console.log('提示: 检查元素请先设置 window.__cssDebugTarget = \'.ask-ai-btn\' 然后重新运行');
  console.log('────────────────────────────────\n');

  // 返回结构化数据供 browser_evaluate 使用
  return {
    theme: theme,
    totalVars: vars.length,
    emptyCount: empty.length,
    emptyVars: empty.map(function (v) { return v.name; }),
    keyVars: keyVars.reduce(function (acc, name) {
      acc[name] = rs.getPropertyValue(name).trim();
      return acc;
    }, {})
  };
})();
