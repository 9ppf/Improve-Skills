/**
 * exam-data-loader.js
 * 从 JSON 文件异步加载真题数据，填充 window.EXAM_DATA
 * 替代旧的 exam-data-{科目}.js 同步 script 标签
 */
window.EXAM_DATA = window.EXAM_DATA || {};

window.examDataReady = (async function() {
  var subjects = ['13015', '02324', '13003'];
  for (var i = 0; i < subjects.length; i++) {
    var subj = subjects[i];
    try {
      var resp = await fetch('../../data/exam-data-' + subj + '.json');
      if (resp.ok) {
        window.EXAM_DATA[subj] = await resp.json();
      }
    } catch(e) {
      console.error('exam-data-' + subj + ' 加载失败:', e);
    }
  }
  window.dispatchEvent(new Event('exam-data-loaded'));
})();
