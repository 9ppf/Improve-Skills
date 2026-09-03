/* ====== 考点分析 v2.1 — 环形图 + 趋势线 + 洞察 ====== */

var SUBJECT_MAP = {
  '13015': '计算机系统原理',
  '02324': '离散数学',
  '13003': '数据结构与算法'
};

var CHAPTER_COLORS = {
  '第一章': { main: '#6366f1', soft: 'rgba(99,102,241,0.2)' },
  '第二章': { main: '#8b5cf6', soft: 'rgba(139,92,246,0.2)' },
  '第三章': { main: '#10b981', soft: 'rgba(16,185,129,0.2)' },
  '第四章': { main: '#f43f5e', soft: 'rgba(244,63,94,0.2)' },
  '第五章': { main: '#f59e0b', soft: 'rgba(245,158,11,0.2)' },
  '第六章': { main: '#06b6d4', soft: 'rgba(6,182,212,0.2)' }
};

var TYPE_SCORES = {
  '选择题': 1, '填空题': 2, '名词解释题': 3, '简答题': 6,
  '综合应用题': 10, '论述题': 10, '计算题': 9, '分析设计题': 6,
  '解答题': 5, '算法阅读题': 5, '算法设计题': 10
};

var allQuestions = [];
var allPapers = [];
var subject = '';
var detailView = 'all';
var selectedYear = '';
var activeChapters = {}; // 趋势图显示状态
var masteryState = null; // 掌握度数据
var kfChapters = null; // 知识框架章节数据

var MASTERY_LABELS = ['待学习', '学习中', '不会', '不熟', '掌握'];
var MASTERY_COLORS = ['gray', 'yellow', 'red', 'orange', 'green'];
var MASTERY_HEX = { 0: '#94a3b8', 1: '#facc15', 2: '#f43f5e', 3: '#fb923c', 4: '#10b981' };

// 复盘页章节名映射（科目→章名数组，与复盘总结JS一致）
var REVIEW_CHAPTERS = {
  '13015': ['计算机系统概述', '数据的表示和运算', '程序的转换及机器级表示', '可执行文件的生成与加载执行', '程序的存储访问', '程序中I/O操作的实现'],
  '13003': ['绪论', '线性表', '栈和队列', '数组、广义表和串', '树与二叉树', '图结构', '内部排序', '查找'],
  '02324': ['命题与命题公式', '命题逻辑的推理理论', '谓词逻辑', '集合', '关系与函数', '代数系统的一般概念', '格与布尔代数', '图', '图的应用']
};

// ====== 章节前缀→复盘页章节名映射 ======
function getReviewChapterName(prefix) {
  var m = prefix.match(/^第([一二三四五六七八九十]+)章/);
  if (!m) return null;
  var numMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
  var idx = numMap[m[1]];
  if (!idx) return null;
  var chapters = REVIEW_CHAPTERS[subject];
  if (!chapters || idx > chapters.length) return null;
  return chapters[idx - 1];
}

// ====== 读取掌握度数据 ======
function loadMasteryData() {
  var key = 'ss_mastery_' + subject;
  try {
    var raw = localStorage.getItem(key);
    var state = raw ? JSON.parse(raw) : { mastery: {}, kp: {}, toc: {} };
    if (!state.toc) state.toc = {};
    if (!state.mastery) state.mastery = {};
    masteryState = state;
  } catch (e) {
    masteryState = { mastery: {}, kp: {}, toc: {} };
  }
}

// ====== 加载知识框架（异步） ======
function loadKnowledgeFramework() {
  var apiBase = (location.protocol === 'file:') ? 'http://localhost:8000' : '';
  var kfFile = 'knowledge-framework-' + subject + '.json';
  var url = apiBase + '/data/knowledge-frameworks/' + kfFile;
  fetch(url)
    .then(function(r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(function(data) {
      kfChapters = data.chapters || [];
      // 重新渲染需要掌握度的部分
      renderDonutChart();
      renderAdvice();
    })
    .catch(function(e) {
      // 知识框架不可用，只显示权重新不显示掌握度
    });
}

// ====== 获取某章的掌握度概览 ======
function getChapterMastery(prefix) {
  if (!masteryState || !kfChapters) return null;
  var m = prefix.match(/^第([一二三四五六七八九十]+)章/);
  if (!m) return null;
  var numMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
  var chIdx = numMap[m[1]];
  if (!chIdx) return null;

  // 找到知识框架中对应章节
  var ch = null;
  for (var i = 0; i < kfChapters.length; i++) {
    if (kfChapters[i].id === chIdx) { ch = kfChapters[i]; break; }
  }
  if (!ch) return null;

  // 收集该章节所有核心概念的掌握度
  var concepts = [];
  (ch.sections || []).forEach(function(s) {
    if (s.type === '核心概念') {
      (s.items || []).forEach(function(item) {
        var term = item.term || item.title || '';
        if (term) {
          var level = masteryState.toc[term] || 0;
          concepts.push({ term: term, level: level });
        }
      });
    }
  });

  if (concepts.length === 0) return null;

  var total = concepts.length;
  var avgLevel = concepts.reduce(function(s, c) { return s + c.level; }, 0) / total;
  var mastered = concepts.filter(function(c) { return c.level >= 3; }).length;
  var needWork = concepts.filter(function(c) { return c.level < 3; }).length;

  return {
    avgLevel: Math.round(avgLevel * 10) / 10,
    mastered: mastered,
    needWork: needWork,
    total: total,
    pct: Math.round(avgLevel / 4 * 100)
  };
}

// ====== 生成复盘页跳转URL ======
function reviewUrl(chapter) {
  var url = '复盘总结-章节复盘.html?subject=' + subject;
  if (chapter) url += '&chapter=' + encodeURIComponent(chapter);
  return url;
}

function masteryDot(level) {
  return '<span class="mastery-dot" style="background:' + (MASTERY_HEX[level] || MASTERY_HEX[0]) + '" title="掌握度: ' + (MASTERY_LABELS[level] || MASTERY_LABELS[0]) + '"></span>';
}

// ====== 初始化 ======
function init() {
  subject = QuizUtils.getSubjectFromUrl();
  document.getElementById('subjectTag').textContent = SUBJECT_MAP[subject] || subject;

  var data = (window.EXAM_DATA && window.EXAM_DATA[subject]) || { papers: [], questions: [] };
  allPapers = data.papers || [];
  allQuestions = data.questions || [];
  selectedYear = allPapers.length > 0 ? allPapers[0].year : '';

  // 读取掌握度数据
  loadMasteryData();

  renderStats();
  renderYearSelector();
  renderDonutChart();
  renderTrendChart();
  renderInsights();
  renderPrediction();
  renderDetailVChart();
  renderAdvice();

  // 异步加载知识框架（加载后重新渲染掌握度相关部分）
  loadKnowledgeFramework();

  // 设置去复盘链接
  var reviewLink = document.getElementById('reviewLink');
  if (reviewLink) reviewLink.href = reviewUrl();

  // 筛选tab事件
  document.querySelectorAll('#detailTabs .filter-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#detailTabs .filter-tab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      detailView = btn.getAttribute('data-view');
      renderDetailVChart();
    });
  });
}

function getChapterPrefix(ch) {
  var m = ch.match(/^(第[一二三四五六七八九十]+章)/);
  return m ? m[1] : '其他';
}

function getChapterColor(ch) {
  var prefix = getChapterPrefix(ch);
  return CHAPTER_COLORS[prefix] || { main: '#94a3b8', soft: '#cbd5e1' };
}

// ====== 统计 ======
function renderStats() {
  var chapters = {};
  allQuestions.forEach(function(q) { chapters[q.chapter] = true; });
  document.getElementById('statPapers').textContent = allPapers.length;
  document.getElementById('statQuestions').textContent = allQuestions.length;
  document.getElementById('statChapters').textContent = Object.keys(chapters).length;
}

// ====== 计算每年各章分值 ======
function calcYearChapterScores() {
  var years = allPapers.map(function(p) { return p.year; });
  var chSet = {};
  allQuestions.forEach(function(q) { chSet[getChapterPrefix(q.chapter)] = true; });
  var chapters = Object.keys(chSet).sort();

  var scores = {};
  years.forEach(function(y) { scores[y] = {}; chapters.forEach(function(c) { scores[y][c] = 0; }); });

  allQuestions.forEach(function(q) {
    var ch = getChapterPrefix(q.chapter);
    var s = TYPE_SCORES[q.type] || 1;
    scores[q.year][ch] = (scores[q.year][ch] || 0) + s;
  });

  return { years: years, chapters: chapters, scores: scores };
}

// ====== 年份选择器 ======
function renderYearSelector() {
  var years = allPapers.map(function(p) { return p.year; });
  var html = years.map(function(y) {
    var cls = y === selectedYear ? 'year-btn active' : 'year-btn';
    return '<button class="' + cls + '" data-year="' + y + '">' + y + '</button>';
  }).join('');
  var el = document.getElementById('yearSelector');
  el.innerHTML = html;
  el.querySelectorAll('.year-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      selectedYear = btn.getAttribute('data-year');
      el.querySelectorAll('.year-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderDonutChart();
    });
  });
}

// ====== 环形图（SVG）======
function renderDonutChart() {
  var data = calcYearChapterScores();
  var chapters = data.chapters;
  var scores = data.scores[selectedYear] || {};
  var total = chapters.reduce(function(s, c) { return s + (scores[c] || 0); }, 0);

  var svg = document.getElementById('donutChart');
  var cx = 100, cy = 100, r = 75, innerR = 50;
  var circ = 2 * Math.PI * r;

  // 计算各段偏移
  var offset = 0;
  var paths = [];
  chapters.forEach(function(ch) {
    var val = scores[ch] || 0;
    var pct = total > 0 ? val / total : 0;
    var dashLen = pct * circ;
    var color = getChapterColor(ch + '·x').main;
    if (dashLen > 0) {
      paths.push(
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' +
        'fill="none" stroke="' + color + '" stroke-width="' + (r - innerR) + '" ' +
        'stroke-dasharray="' + dashLen + ' ' + (circ - dashLen) + '" ' +
        'stroke-dashoffset="' + (-offset) + '" ' +
        'class="donut-seg" data-chapter="' + ch + '" ' +
        'style="transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;cursor:pointer;"/>'
      );
    }
    offset += dashLen;
  });

  svg.innerHTML = paths.join('');

  // 更新中心文字
  document.getElementById('donutYear').textContent = selectedYear;
  document.getElementById('donutTotal').textContent = Math.round(total) + '分';

  // 图例（含掌握度和去复盘链接）
  var legendHtml = chapters.map(function(ch) {
    var val = scores[ch] || 0;
    var pct = total > 0 ? (val / total * 100).toFixed(1) : 0;
    var color = getChapterColor(ch + '·x').main;
    var m = getChapterMastery(ch);
    var masteryHtml = '';
    if (m) {
      masteryHtml = '<span class="donut-legend-mastery" title="掌握' + m.mastered + '/' + m.total + ' (' + m.pct + '%)">' +
        masteryDot(m.avgLevel >= 4 ? 4 : Math.floor(m.avgLevel)) +
        '<span class="mastery-text">' + m.pct + '%</span></span>';
    }
    var chName = getReviewChapterName(ch);
    var reviewLink = chName ? '<a class="donut-legend-review" href="' + reviewUrl(chName) + '" title="去复盘' + ch + '">去复盘</a>' : '';
    return '<div class="donut-legend-item" data-chapter="' + ch + '">' +
      '<span class="donut-legend-dot" style="background:' + color + '"></span>' +
      '<span class="donut-legend-name">' + ch + '</span>' +
      masteryHtml +
      '<span class="donut-legend-value">' + val + '分/' + pct + '%</span>' +
      reviewLink +
    '</div>';
  }).join('');
  document.getElementById('donutLegend').innerHTML = legendHtml;
}

// ====== 趋势折线图（SVG）======
function renderTrendChart() {
  var data = calcYearChapterScores();
  var years = data.years.slice().reverse(); // 旧到新
  var chapters = data.chapters;
  var scores = data.scores;

  // 初始化active状态
  chapters.forEach(function(ch) {
    if (activeChapters[ch] === undefined) activeChapters[ch] = true;
  });

  var W = 520, H = 280;
  var padL = 36, padR = 70, padT = 16, padB = 28;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;

  // 计算总分（每年）用于百分比
  var yearTotals = {};
  years.forEach(function(y) {
    yearTotals[y] = chapters.reduce(function(s, c) { return s + (scores[y][c] || 0); }, 0);
  });

  // Y轴：0到最大百分比
  var maxPct = 0;
  years.forEach(function(y) {
    chapters.forEach(function(ch) {
      var pct = (scores[y][ch] || 0) / yearTotals[y] * 100;
      if (pct > maxPct) maxPct = pct;
    });
  });
  maxPct = Math.ceil(maxPct / 5) * 5; // 向上取整到5的倍数

  var xScale = function(i) { return padL + (i / (years.length - 1)) * chartW; };
  var yScale = function(v) { return padT + chartH - (v / maxPct) * chartH; };

  var svgHtml = '';

  // 网格线（更淡）
  for (var g = 0; g <= 4; g++) {
    var yVal = (maxPct / 4) * g;
    var y = yScale(yVal);
    svgHtml += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--rule)" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.6"/>';
    svgHtml += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end" font-size="10" fill="var(--muted)" font-weight="500">' + Math.round(yVal) + '%</text>';
  }

  // X轴标签
  years.forEach(function(y, i) {
    var x = xScale(i);
    svgHtml += '<text x="' + x + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="500">' + y + '</text>';
    // 垂直辅助线（淡）
    svgHtml += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + chartH) + '" stroke="var(--rule)" stroke-width="0.5" opacity="0.3"/>';
  });

  // 数据线 — 先画非激活的，再画激活的（保证激活的在上面）
  var activeList = chapters.filter(function(ch) { return activeChapters[ch]; });
  var inactiveList = chapters.filter(function(ch) { return !activeChapters[ch]; });

  // 非激活线（很淡）
  inactiveList.forEach(function(ch) {
    var color = getChapterColor(ch + '·x').main;
    var pts = [];
    years.forEach(function(y, i) {
      var val = scores[y][ch] || 0;
      var pct = yearTotals[y] > 0 ? val / yearTotals[y] * 100 : 0;
      pts.push({ x: xScale(i), y: yScale(pct), val: val, pct: pct, year: y });
    });
    var pathD = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; }).join(' ');
    svgHtml += '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.25" class="trend-line" data-chapter="' + ch + '"/>';
  });

  // 激活线（清晰）
  activeList.forEach(function(ch) {
    var color = getChapterColor(ch + '·x').main;
    var pts = [];
    years.forEach(function(y, i) {
      var val = scores[y][ch] || 0;
      var pct = yearTotals[y] > 0 ? val / yearTotals[y] * 100 : 0;
      pts.push({ x: xScale(i), y: yScale(pct), val: val, pct: pct, year: y });
    });

    var pathD = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; }).join(' ');

    // 线条（较粗）
    svgHtml += '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="trend-line trend-line-active" data-chapter="' + ch + '" style="cursor:pointer;"/>';

    // 数据点
    pts.forEach(function(p, idx) {
      var isLast = idx === pts.length - 1;
      var r = isLast ? 5 : 3.5;
      svgHtml += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + color + '" stroke="var(--surface)" stroke-width="2" class="trend-dot" data-chapter="' + ch + '" style="cursor:pointer;">' +
        '<title>' + ch + ' · ' + p.year + ': ' + p.val + '分 (' + p.pct.toFixed(1) + '%)</title>' +
      '</circle>';
    });

    // 末端标签（右侧直接标注章节名和数值）
    var lastPt = pts[pts.length - 1];
    svgHtml += '<text x="' + (lastPt.x + 8) + '" y="' + (lastPt.y + 3) + '" font-size="10" font-weight="600" fill="' + color + '" class="trend-end-label" data-chapter="' + ch + '">' +
      ch.replace(/^第/, '').replace(/章$/, '') + ' ' + lastPt.val + '分' +
    '</text>';
  });

  // 悬浮交互层（透明宽线条，方便hover）
  activeList.forEach(function(ch) {
    var color = getChapterColor(ch + '·x').main;
    var pts = [];
    years.forEach(function(y, i) {
      var val = scores[y][ch] || 0;
      var pct = yearTotals[y] > 0 ? val / yearTotals[y] * 100 : 0;
      pts.push({ x: xScale(i), y: yScale(pct) });
    });
    var pathD = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; }).join(' ');
    svgHtml += '<path d="' + pathD + '" fill="none" stroke="transparent" stroke-width="16" class="trend-hit" data-chapter="' + ch + '" style="cursor:pointer;"/>';
  });

  document.getElementById('trendChart').innerHTML = svgHtml;

  // 绑定悬浮事件
  var svgEl = document.getElementById('trendChart');
  svgEl.querySelectorAll('.trend-hit, .trend-dot, .trend-line-active, .trend-end-label').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      var ch = el.getAttribute('data-chapter');
      highlightTrendLine(ch);
    });
    el.addEventListener('mouseleave', function() {
      resetTrendHighlight();
    });
  });

  // 图例
  var legendHtml = chapters.map(function(ch) {
    var color = getChapterColor(ch + '·x').main;
    var cls = 'tcl-item' + (activeChapters[ch] ? ' active' : ' muted');
    return '<span class="' + cls + '" data-chapter="' + ch + '">' +
      '<span class="tcl-dot" style="background:' + color + '"></span>' + ch +
    '</span>';
  }).join('');
  var legendEl = document.getElementById('trendLegend');
  legendEl.innerHTML = legendHtml;
  legendEl.querySelectorAll('.tcl-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var ch = item.getAttribute('data-chapter');
      activeChapters[ch] = !activeChapters[ch];
      renderTrendChart();
    });
  });
}

// 高亮某条趋势线
function highlightTrendLine(ch) {
  var svgEl = document.getElementById('trendChart');
  svgEl.querySelectorAll('.trend-line-active').forEach(function(line) {
    if (line.getAttribute('data-chapter') === ch) {
      line.setAttribute('stroke-width', '3.5');
    } else {
      line.setAttribute('opacity', '0.25');
    }
  });
  svgEl.querySelectorAll('.trend-dot').forEach(function(dot) {
    if (dot.getAttribute('data-chapter') !== ch) {
      dot.setAttribute('opacity', '0.3');
    }
  });
  svgEl.querySelectorAll('.trend-end-label').forEach(function(label) {
    if (label.getAttribute('data-chapter') !== ch) {
      label.setAttribute('opacity', '0.3');
    }
  });
}

// 重置趋势线高亮
function resetTrendHighlight() {
  var svgEl = document.getElementById('trendChart');
  svgEl.querySelectorAll('.trend-line-active').forEach(function(line) {
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('opacity', '1');
  });
  svgEl.querySelectorAll('.trend-dot').forEach(function(dot) {
    dot.setAttribute('opacity', '1');
  });
  svgEl.querySelectorAll('.trend-end-label').forEach(function(label) {
    label.setAttribute('opacity', '1');
  });
}

// ====== 洞察卡片 ======
function renderInsights() {
  var data = calcYearChapterScores();
  var years = data.years; // 新到旧
  var chapters = data.chapters;
  var scores = data.scores;

  var latestYear = years[0];
  var oldestYear = years[years.length - 1];

  // 计算各章百分比变化
  var changes = [];
  var yearTotals = {};
  years.forEach(function(y) {
    yearTotals[y] = chapters.reduce(function(s, c) { return s + (scores[y][c] || 0); }, 0);
  });

  chapters.forEach(function(ch) {
    var newPct = yearTotals[latestYear] > 0 ? (scores[latestYear][ch] || 0) / yearTotals[latestYear] * 100 : 0;
    var oldPct = yearTotals[oldestYear] > 0 ? (scores[oldestYear][ch] || 0) / yearTotals[oldestYear] * 100 : 0;
    var diff = newPct - oldPct;
    changes.push({ ch: ch, newPct: newPct, oldPct: oldPct, diff: diff, newVal: scores[latestYear][ch] || 0 });
  });

  // 升温最多
  var up = changes.filter(function(c) { return c.diff > 1; }).sort(function(a, b) { return b.diff - a.diff; });
  // 降温最多
  var down = changes.filter(function(c) { return c.diff < -1; }).sort(function(a, b) { return a.diff - b.diff; });
  // 稳定且高分（变化小且占比高）
  var stable = changes.filter(function(c) { return Math.abs(c.diff) <= 2 && c.newPct > 15; }).sort(function(a, b) { return b.newPct - a.newPct; });
  // 必考（每套都考）
  var must = chapters.filter(function(ch) {
    return years.every(function(y) { return (scores[y][ch] || 0) > 0; });
  });

  var insights = [];

  if (up.length > 0) {
    var top = up[0];
    insights.push({
      type: 'up',
      icon: '📈',
      title: top.ch + ' 权重上升 ' + top.diff.toFixed(1) + '%',
      body: '从最早的 ' + top.oldPct.toFixed(0) + '% 上升到最新的 <strong>' + top.newPct.toFixed(0) + '%</strong>，考频明显增加，建议重点关注。'
    });
  }

  if (down.length > 0) {
    var topDown = down[0];
    insights.push({
      type: 'down',
      icon: '📉',
      title: topDown.ch + ' 权重下降 ' + Math.abs(topDown.diff).toFixed(1) + '%',
      body: '占比从 ' + topDown.oldPct.toFixed(0) + '% 降至 <strong>' + topDown.newPct.toFixed(0) + '%</strong>，但仍是重要章节，基础题不可丢分。'
    });
  }

  if (stable.length > 0) {
    var topStable = stable[0];
    insights.push({
      type: 'stable',
      icon: '⚖️',
      title: topStable.ch + ' 权重稳定在 ' + topStable.newPct.toFixed(0) + '%',
      body: '各套真题中占比波动很小，属于<strong>稳定高分章节</strong>，是必须牢牢掌握的基础分。'
    });
  }

  if (must.length > 0) {
    insights.push({
      type: 'must',
      icon: '✅',
      title: must.length + '个章节每套必考',
      body: '<strong>' + must.join('、') + '</strong> 在近 ' + years.length + ' 套真题中每套都有出题，属于核心必考点。'
    });
  }

  var html = insights.map(function(item) {
    return '<div class="insight-card ' + item.type + '">' +
      '<div class="insight-head"><span class="insight-icon">' + item.icon + '</span>' + item.title + '</div>' +
      '<div class="insight-body">' + item.body + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('insightsList').innerHTML = html;
}

// ====== 预测 ======
function predictNextYear() {
  var data = calcYearChapterScores();
  var years = data.years.slice().reverse();
  var chapters = data.chapters;
  var scores = data.scores;

  var weights = [];
  var totalW = 0;
  for (var i = 0; i < years.length; i++) {
    var w = Math.pow(1.5, i);
    weights.push(w);
    totalW += w;
  }

  var predicted = {};
  chapters.forEach(function(ch) {
    var vals = years.map(function(y) { return scores[y][ch] || 0; });
    var wAvg = 0;
    for (var i = 0; i < vals.length; i++) { wAvg += vals[i] * weights[i]; }
    wAvg /= totalW;
    var n = vals.length;
    var xMean = (n - 1) / 2;
    var yMean = vals.reduce(function(s, v) { return s + v; }, 0) / n;
    var num = 0, den = 0;
    for (var j = 0; j < n; j++) {
      num += (j - xMean) * (vals[j] - yMean);
      den += (j - xMean) * (j - xMean);
    }
    var slope = den > 0 ? num / den : 0;
    var pred = wAvg + slope * 0.3;
    predicted[ch] = Math.max(0, Math.round(pred * 10) / 10);
  });

  var predTotal = chapters.reduce(function(s, c) { return s + predicted[c]; }, 0);
  var avgTotal = years.reduce(function(s, y) {
    return s + chapters.reduce(function(ss, c) { return ss + (scores[y][c] || 0); }, 0);
  }, 0) / years.length;
  var ratio = avgTotal / predTotal;
  chapters.forEach(function(c) { predicted[c] = Math.round(predicted[c] * ratio * 10) / 10; });

  return { chapters: chapters, predicted: predicted, years: years, scores: scores };
}

// ====== 预测柱状图 ======
function renderPrediction() {
  var pred = predictNextYear();
  var chapters = pred.chapters;
  var predicted = pred.predicted;
  var scores = pred.scores;
  var years = pred.years;

  var sorted = chapters.slice().sort(function(a, b) { return predicted[b] - predicted[a]; });
  var maxVal = Math.max.apply(null, sorted.map(function(c) { return predicted[c]; }));
  var latestYear = years[years.length - 1];

  var barHtml = sorted.map(function(ch) {
    var val = predicted[ch];
    var pct = maxVal > 0 ? (val / maxVal * 100) : 0;
    var color = getChapterColor(ch + '·x').main;
    var prev = scores[latestYear][ch] || 0;
    var diff = val - prev;
    var diffCls = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : '';
    var diffText = diff > 0.5 ? '+' + diff.toFixed(1) : diff < -0.5 ? diff.toFixed(1) : '持平';

    return '<div class="pbc-item">' +
      '<span class="pbc-label">' + ch + '</span>' +
      '<div class="pbc-bar-wrap">' +
        '<div class="pbc-bar" style="width:' + pct + '%;">' +
          '<div class="pbc-bar-fill" style="width:100%;height:100%;background:' + color + ';"></div>' +
        '</div>' +
        '<span class="pbc-value">' + val.toFixed(1) + '分</span>' +
      '</div>' +
      '<span class="pbc-trend ' + diffCls + '">' + diffText + '</span>' +
    '</div>';
  }).join('');

  document.getElementById('predictBarChart').innerHTML = barHtml;
  renderPredictTopList();
}

// ====== 知识点预测Top10 ======
function renderPredictTopList() {
  var years = allPapers.map(function(p) { return p.year; }).reverse();
  var chData = {};

  allQuestions.forEach(function(q) {
    if (!chData[q.chapter]) { chData[q.chapter] = {}; years.forEach(function(y) { chData[q.chapter][y] = 0; }); }
    chData[q.chapter][q.year] = (chData[q.chapter][q.year] || 0) + 1;
  });

  var weights = [];
  var totalW = 0;
  for (var i = 0; i < years.length; i++) {
    var w = Math.pow(1.5, i);
    weights.push(w); totalW += w;
  }

  var predictions = {};
  Object.keys(chData).forEach(function(ch) {
    var vals = years.map(function(y) { return chData[ch][y] || 0; });
    var wAvg = 0;
    for (var i = 0; i < vals.length; i++) { wAvg += vals[i] * weights[i]; }
    wAvg /= totalW;
    var n = vals.length;
    var xMean = (n - 1) / 2;
    var yMean = vals.reduce(function(s, v) { return s + v; }, 0) / n;
    var num = 0, den = 0;
    for (var j = 0; j < n; j++) {
      num += (j - xMean) * (vals[j] - yMean);
      den += (j - xMean) * (j - xMean);
    }
    var slope = den > 0 ? num / den : 0;
    var pred = wAvg + slope * 0.3;
    predictions[ch] = Math.max(0, Math.round(pred * 10) / 10);
  });

  var sorted = Object.keys(predictions).sort(function(a, b) { return predictions[b] - predictions[a]; }).slice(0, 10);

  var html = sorted.map(function(ch, i) {
    var rank = i + 1;
    var rankCls = rank <= 3 ? 'rank-' + rank : '';
    var color = getChapterColor(ch).main;
    return '<div class="ptl-item">' +
      '<span class="ptl-rank ' + rankCls + '">' + rank + '</span>' +
      '<span class="ptl-name" title="' + ch + '">' + ch + '</span>' +
      '<span class="ptl-score" style="color:' + color + '">' + predictions[ch].toFixed(1) + '</span>' +
    '</div>';
  }).join('');

  document.getElementById('predictTopList').innerHTML = html;
}

// ====== 知识点明细（列表卡片形式）======
function renderDetailVChart() {
  // 按章分组，统计每个知识点的题量和题型分布
  var groups = {};
  allQuestions.forEach(function(q) {
    var prefix = getChapterPrefix(q.chapter);
    if (!groups[prefix]) groups[prefix] = {};
    if (!groups[prefix][q.chapter]) {
      groups[prefix][q.chapter] = { count: 0, types: {} };
    }
    groups[prefix][q.chapter].count += 1;
    groups[prefix][q.chapter].types[q.type] = (groups[prefix][q.chapter].types[q.type] || 0) + 1;
  });

  var sortedGroups = Object.keys(groups).sort();

  var html = sortedGroups.map(function(group) {
    var items = Object.keys(groups[group]).sort(function(a, b) {
      return groups[group][b].count - groups[group][a].count;
    });

    var displayItems = items;
    if (detailView === 'top10') {
      displayItems = items.slice(0, 5);
    }

    var maxVal = Math.max.apply(null, items.map(function(i) { return groups[group][i].count; }));
    var color = getChapterColor(group + '·x').main;

    var itemsHtml = displayItems.map(function(item, idx) {
      var data = groups[group][item];
      var val = data.count;
      var pct = maxVal > 0 ? (val / maxVal * 100) : 0;
      var shortName = item.replace(/^第.+章·/, '');

      // 统计主要题型（取最多的2种）
      var typeList = Object.keys(data.types).sort(function(a, b) {
        return data.types[b] - data.types[a];
      });
      var typeLabels = typeList.slice(0, 2).map(function(t) {
        var shortType = t.replace('题', '');
        return '<span class="dvc-type-tag">' + shortType + '</span>';
      }).join('');

      // 完整题型分布（悬浮提示）
      var typeDetail = typeList.map(function(t) {
        return t + '：' + data.types[t] + '题';
      }).join('、');

      return '<div class="dvc-item" title="' + shortName + '：' + val + '题（' + typeDetail + '）">' +
        '<span class="dvc-item-rank" style="color:' + color + ';">' + (idx + 1) + '</span>' +
        '<span class="dvc-item-name">' + shortName + '</span>' +
        '<div class="dvc-item-bar">' +
          '<div class="dvc-item-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div>' +
        '</div>' +
        '<span class="dvc-item-count">' + val + '题</span>' +
        '<div class="dvc-item-types">' + typeLabels + '</div>' +
      '</div>';
    }).join('');

    return '<div class="dvc-group">' +
      '<div class="dvc-group-title" style="border-color:' + color + ';">' +
        group + ' · 共' + items.length + '个知识点 · 累计' + items.reduce(function(s, i) { return s + groups[group][i].count; }, 0) + '题' +
      '</div>' +
      '<div class="dvc-item-list">' + itemsHtml + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('detailVChart').innerHTML = html;
}

// ====== 学习建议 ======
function renderAdvice() {
  var pred = predictNextYear();
  var chapters = pred.chapters;
  var predicted = pred.predicted;

  var sorted = chapters.slice().sort(function(a, b) { return predicted[b] - predicted[a]; });
  var total = chapters.reduce(function(s, c) { return s + predicted[c]; }, 0);

  var data = calcYearChapterScores();
  var mustChapters = chapters.filter(function(ch) {
    return data.years.every(function(y) { return (data.scores[y][ch] || 0) > 0; });
  });

  var warmChapters = [];
  var years = pred.years;
  var scores = pred.scores;
  var latestYear = years[years.length - 1];
  var oldestYear = years[0];
  chapters.forEach(function(ch) {
    var diff = (scores[latestYear][ch] || 0) - (scores[oldestYear][ch] || 0);
    if (diff > 0) warmChapters.push({ ch: ch, diff: diff });
  });
  warmChapters.sort(function(a, b) { return b.diff - a.diff; });

  var items = [];

  var top3 = sorted.slice(0, 3);
  var top3Score = top3.reduce(function(s, c) { return s + predicted[c]; }, 0);
  items.push({
    type: 'priority',
    title: '🎯 预测重点：前三章占' + Math.round(top3Score / total * 100) + '%分值',
    desc: '根据趋势预测，<strong>' + top3.join('、') + '</strong> 三章合计约占 <strong>' + Math.round(top3Score) + '分</strong>，是复习的重中之重。',
    chapters: top3
  });

  if (mustChapters.length > 0) {
    items.push({
      type: 'must',
      title: '✅ 必掌握：每套真题都考的章节',
      desc: '<strong>' + mustChapters.join('、') + '</strong> 在近 ' + data.years.length + ' 套真题中每套都有出题，属于核心必考内容。',
      chapters: mustChapters
    });
  }

  if (warmChapters.length > 0) {
    var topWarm = warmChapters.slice(0, 2).map(function(w) { return w.ch + '(+' + w.diff + '分)'; }).join('、');
    items.push({
      type: 'trend',
      title: '📈 升温趋势：近年考频上升',
      desc: '<strong>' + topWarm + '</strong> 在最新真题中的分值占比明显上升，建议重点关注并加强练习。',
      chapters: warmChapters.slice(0, 2).map(function(w) { return w.ch; })
    });
  }

  var bigChapters = [];
  allQuestions.forEach(function(q) {
    if (q.type === '综合应用题' || q.type === '论述题' || q.type === '计算题' || q.type === '分析设计题') {
      var p = getChapterPrefix(q.chapter);
      if (bigChapters.indexOf(p) === -1) bigChapters.push(p);
    }
  });
  items.push({
    type: 'score',
    title: '💎 大题章节：综合题/论述题出处',
    desc: '<strong>' + bigChapters.slice(0, 3).join('、') + '</strong> 常出10分大题，一题顶10道选择题，务必掌握典型题型。',
    chapters: bigChapters.slice(0, 3)
  });

  // 权重高×掌握低 = 最需要复习
  var weakChapters = [];
  sorted.forEach(function(ch) {
    var m = getChapterMastery(ch);
    if (m && m.pct < 60 && predicted[ch] > 10) {
      weakChapters.push({ ch: ch, pct: m.pct, pred: predicted[ch] });
    }
  });
  if (weakChapters.length > 0) {
    var weakList = weakChapters.slice(0, 3).map(function(w) {
      return w.ch + '(掌握' + w.pct + '%)';
    }).join('、');
    items.push({
      type: 'priority',
      title: '⚠️ 权重高但掌握低：最该补的章节',
      desc: '<strong>' + weakList + '</strong> 预测分值高但掌握度低于60%，建议优先复盘这些章节。'
    });
  }

  var html = items.map(function(item) {
    var actionHtml = '';
    if (item.chapters && item.chapters.length > 0) {
      var links = item.chapters.map(function(ch) {
        var chName = getReviewChapterName(ch);
        if (!chName) return '';
        return '<a class="advice-action" href="' + reviewUrl(chName) + '">📋 ' + ch + '复盘</a>';
      }).filter(function(s) { return s; }).join('');
      if (links) actionHtml = '<div class="advice-actions">' + links + '</div>';
    }
    return '<div class="advice-item ' + item.type + '">' +
      '<div class="advice-title">' + item.title + '</div>' +
      '<div class="advice-desc">' + item.desc + '</div>' +
      actionHtml +
    '</div>';
  }).join('');

  document.getElementById('adviceList').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);
