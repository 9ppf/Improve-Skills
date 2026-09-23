/* 做题技巧页面逻辑 */
var urlParams = new URLSearchParams(window.location.search);
var currentSubject = urlParams.get('subject') || '13015';
var API_BASE = (location.protocol === 'file:') ? 'http://localhost:8000' : '';
var apiUrl = QuizUtils.apiUrl;

var allTips = [];
var categories = [];
var currentTipId = null;
var editingTipId = null;

/* ====== Markdown 渲染器 ====== */
function renderMarkdown(text) {
  if (!text) return '';
  var lines = text.split('\n');
  var html = '';

  // 用栈处理嵌套列表
  var listStack = []; // [{type: 'ul'|'ol', indent: N, liOpen: bool}]
  var inTable = false;
  var tableHeaderDone = false;
  var paraBuffer = [];

  function flushPara() {
    if (paraBuffer.length > 0) {
      html += '<p>' + renderInline(paraBuffer.join(' ')) + '</p>';
      paraBuffer = [];
    }
  }

  function closeAllLists() {
    while (listStack.length > 0) {
      var top = listStack.pop();
      if (top.liOpen) { html += '</li>'; top.liOpen = false; }
      html += '</' + top.type + '>';
    }
  }

  function closeListsToLevel(indent) {
    // 关闭所有缩进 > indent 的层，回到 <= indent 的层级
    while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
      var top = listStack.pop();
      if (top.liOpen) { html += '</li>'; top.liOpen = false; }
      html += '</' + top.type + '>';
      // 回到上一层后，上一层的 li 应该是"打开"状态（因为子列表是嵌在 li 内部的）
      // 不需要额外关闭 li
    }
  }

  function ensureLiOpen(indent) {
    // 找到当前层对应的 li 是否打开
    var top = listStack[listStack.length - 1];
    if (!top) return;
    // 如果当前层 li 未打开，说明需要新的 li（由调用方处理）
  }

  function getIndent(line) {
    var match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  // 处理列表项：正确处理嵌套，子列表放入上一级 li 内部
  function processListItem(type, indent, content) {
    var top = listStack[listStack.length - 1];

    if (!top || indent > top.indent) {
      // 更深的嵌套：新开一层列表
      // 如果上一层有未关闭的 li，先不关闭 li，直接把 ul/ol 嵌进去
      if (top && top.liOpen) {
        // ul/ol 放在 li 内部，不关闭 li
      } else if (top) {
        // 上一层 li 已关闭，那应该是同级或更深？理论不会到这里
      }
      listStack.push({ type: type, indent: indent, liOpen: false });
      html += '<' + type + '>';
      html += '<li>' + renderInline(content);
      listStack[listStack.length - 1].liOpen = true;
    } else if (indent < top.indent) {
      // 返回上层：关闭当前层及更深的层
      closeListsToLevel(indent);
      top = listStack[listStack.length - 1];
      if (!top || top.type !== type || top.indent !== indent) {
        // 到达的层类型不对或缩进不对，新开一层
        // 但先保证上层 li 是开的
        if (top && !top.liOpen) {
          // 不应该发生，indent == top.indent 时 top 应该存在
        }
        listStack.push({ type: type, indent: indent, liOpen: false });
        html += '<' + type + '>';
        html += '<li>' + renderInline(content);
        listStack[listStack.length - 1].liOpen = true;
      } else {
        // 到达了同层同类型，关闭上一个 li，开新 li
        if (top.liOpen) {
          html += '</li>';
          top.liOpen = false;
        }
        html += '<li>' + renderInline(content);
        top.liOpen = true;
      }
    } else {
      // 同层
      if (top.type !== type) {
        // 类型不同，关闭当前层，新开一层
        closeListsToLevel(indent);
        listStack.push({ type: type, indent: indent, liOpen: false });
        html += '<' + type + '>';
        html += '<li>' + renderInline(content);
        listStack[listStack.length - 1].liOpen = true;
      } else {
        // 同层同类型，关闭上一个 li，开新 li
        if (top.liOpen) {
          html += '</li>';
          top.liOpen = false;
        }
        html += '<li>' + renderInline(content);
        top.liOpen = true;
      }
    }
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();
    var indent = getIndent(line);

    // 表格
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushPara();
      closeAllLists();
      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        html += '<table class="tips-md-table">';
      }
      var cells = trimmed.substring(1, trimmed.length - 1).split('|');
      var isSeparator = cells.every(function(c) { return /^[-:]+$/.test(c.trim()); });
      if (isSeparator) {
        tableHeaderDone = true;
        continue;
      }
      var tag = tableHeaderDone ? 'td' : 'th';
      html += '<tr>';
      cells.forEach(function(cell) {
        html += '<' + tag + '>' + renderInline(cell.trim()) + '</' + tag + '>';
      });
      html += '</tr>';
      continue;
    } else if (inTable) {
      inTable = false;
      html += '</table>';
    }

    // 空行：结束段落和列表
    if (trimmed === '') {
      flushPara();
      closeAllLists();
      continue;
    }

    // 分割线
    if (/^[-*_]{3,}\s*$/.test(trimmed) && trimmed.indexOf(' ') < 0) {
      flushPara();
      closeAllLists();
      html += '<hr>';
      continue;
    }

    // 标题
    if (trimmed.startsWith('### ')) {
      flushPara();
      closeAllLists();
      html += '<h3>' + renderInline(trimmed.substring(4)) + '</h3>';
      continue;
    } else if (trimmed.startsWith('## ')) {
      flushPara();
      closeAllLists();
      html += '<h2>' + renderInline(trimmed.substring(3)) + '</h2>';
      continue;
    } else if (trimmed.startsWith('# ')) {
      flushPara();
      closeAllLists();
      html += '<h1>' + renderInline(trimmed.substring(2)) + '</h1>';
      continue;
    }

    // 无序列表
    var ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      flushPara();
      processListItem('ul', indent, ulMatch[1]);
      continue;
    }

    // 有序列表
    var olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      flushPara();
      processListItem('ol', indent, olMatch[1]);
      continue;
    }

    // 普通段落
    paraBuffer.push(trimmed);
  }

  flushPara();
  closeAllLists();
  if (inTable) html += '</table>';
  return html;
}

function renderInline(text) {
  // 代码
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 加粗
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 斜体
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 数学公式（简单处理 $...$）
  text = text.replace(/\$([^$]+)\$/g, '<span class="tips-formula-inline">$1</span>');
  return text;
}

/* ====== 加载数据 ====== */
function loadTips() {
  fetch(apiUrl('/api/study-tips?subject=' + currentSubject))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allTips = data.tips || [];
      categories = data.categories || [];
      initFilters();
      renderTipList();
      updateStats();
    })
    .catch(function() {
      allTips = [];
      categories = [];
      renderTipList();
    });
}

/* ====== 筛选器 ====== */
function initFilters() {
  var catSelect = document.getElementById('filterCategory');
  var currentVal = catSelect.value;
  catSelect.innerHTML = '<option value="">全部分类</option>';
  categories.forEach(function(cat) {
    catSelect.innerHTML += '<option value="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</option>';
  });
  catSelect.value = currentVal;

  // 弹窗的 datalist
  var dl = document.getElementById('categoryList');
  if (dl) {
    dl.innerHTML = '';
    categories.forEach(function(cat) {
      dl.innerHTML += '<option value="' + escapeHtml(cat) + '">';
    });
  }
}

function getFilteredTips() {
  var cat = document.getElementById('filterCategory').value;
  var imp = document.getElementById('filterImportance').value;
  var mastery = document.getElementById('filterMastery').value;
  var keyword = document.getElementById('searchInput').value.trim().toLowerCase();

  return allTips.filter(function(tip) {
    if (cat && tip.category !== cat) return false;
    if (imp && (tip.importance || 0) < parseInt(imp)) return false;
    if (mastery && tip.mastery !== mastery) return false;
    if (keyword) {
      var haystack = (tip.title + ' ' + (tip.summary || '') + ' ' + (tip.content || '')).toLowerCase();
      if (haystack.indexOf(keyword) < 0) return false;
    }
    return true;
  }).sort(function(a, b) {
    // 按重要程度降序，再按更新时间降序
    var impDiff = (b.importance || 0) - (a.importance || 0);
    if (impDiff !== 0) return impDiff;
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
}

/* ====== 渲染列表 ====== */
function renderTipList() {
  var filtered = getFilteredTips();
  var list = document.getElementById('tipList');
  document.getElementById('filterCount').textContent = filtered.length + ' 条';

  if (filtered.length === 0) {
    list.innerHTML = '<div class="tips-empty">' + (allTips.length === 0 ? '还没有做题技巧，点击右上角「新建技巧」开始添加' : '没有匹配的技巧') + '</div>';
    return;
  }

  list.innerHTML = filtered.map(function(tip) {
    var active = tip.id === currentTipId ? ' active' : '';
    var impStars = '';
    for (var i = 0; i < (tip.importance || 0); i++) impStars += '⭐';
    var masteryClass = tip.mastery || 'unknown';
    var masteryLabel = { known: '已掌握', unsure: '不太熟', unknown: '还不会' }[masteryClass] || '';
    var exampleCount = (tip.examples || []).length;

    return '<div class="tip-card' + active + '" data-id="' + tip.id + '" onclick="selectTip(\'' + tip.id + '\')">' +
      '<div class="tip-card-header">' +
      '<div class="tip-card-title">' + escapeHtml(tip.title || '未命名') + '</div>' +
      '<div class="tip-card-stars">' + impStars + '</div>' +
      '</div>' +
      (tip.summary ? '<div class="tip-card-summary">' + escapeHtml(tip.summary) + '</div>' : '') +
      '<div class="tip-card-meta">' +
      (tip.category ? '<span class="tip-badge tip-badge-cat">📂 ' + escapeHtml(tip.category) + '</span>' : '') +
      '<span class="tip-badge tip-badge-mastery tip-m-' + masteryClass + '">' + masteryLabel + '</span>' +
      (exampleCount > 0 ? '<span class="tip-badge tip-badge-example">📝 ' + exampleCount + ' 例题</span>' : '') +
      '</div>' +
      '</div>';
  }).join('');
}

/* ====== 渲染详情 ====== */
function selectTip(id) {
  currentTipId = id;
  renderTipList();
  renderTipDetail(id);
}

function renderTipDetail(id) {
  var tip = allTips.find(function(t) { return t.id === id; });
  var detail = document.getElementById('tipDetail');
  if (!tip) {
    detail.innerHTML = '<div class="tips-detail-empty"><div class="tips-detail-icon">📚</div><div class="tips-detail-text">选择左侧的技巧，查看详细内容</div></div>';
    return;
  }

  var impStars = '';
  for (var i = 0; i < (tip.importance || 0); i++) impStars += '⭐';

  // 例题
  var examplesHTML = '';
  var examples = tip.examples || [];
  if (examples.length > 0) {
    examplesHTML = '<div class="tips-detail-section">' +
      '<h3>📝 例题（' + examples.length + ' 道）</h3>' +
      '<div class="tips-example-list" id="exampleList">' +
      '<div class="tips-example-loading">加载例题中...</div>' +
      '</div></div>';
  }

  detail.innerHTML = '<div class="tips-detail-content">' +
    '<div class="tips-detail-header">' +
    '<div class="tips-detail-title">' + escapeHtml(tip.title || '') + '</div>' +
    '<div class="tips-detail-stars">' + impStars + '</div>' +
    '</div>' +
    '<div class="tips-detail-meta">' +
    (tip.category ? '<span class="tip-badge tip-badge-cat">📂 ' + escapeHtml(tip.category) + '</span>' : '') +
    (tip.chapter ? '<span class="tip-badge">📖 ' + escapeHtml(tip.chapter) + '</span>' : '') +
    '<span class="tip-badge tip-badge-mastery tip-m-' + (tip.mastery || 'unknown') + '">' +
    ({ known: '已掌握', unsure: '不太熟', unknown: '还不会' }[tip.mastery || 'unknown']) + '</span>' +
    (tip.source ? '<span class="tip-badge">📌 ' + escapeHtml(tip.source) + '</span>' : '') +
    '</div>' +
    (tip.summary ? '<div class="tips-detail-summary">' + escapeHtml(tip.summary) + '</div>' : '') +
    '<div class="tips-detail-body">' + renderMarkdown(tip.content || '') + '</div>' +
    examplesHTML +
    '<div class="tips-detail-actions">' +
    '<button class="tips-link-btn" onclick="editTip(\'' + tip.id + '\')">✏️ 编辑</button>' +
    '<button class="tips-link-btn tips-link-danger" onclick="deleteTip(\'' + tip.id + '\')">🗑️ 删除</button>' +
    '<a class="tips-link-btn" href="练习测验.html?subject=' + currentSubject + '&tipId=' + tip.id + '" target="_blank">📝 去做相关练习</a>' +
    '</div>' +
    '</div>';

  // 加载例题
  if (examples.length > 0) {
    loadExampleQuestions(examples);
  }
}

/* ====== 加载例题题目数据 ====== */
function loadExampleQuestions(exampleIds) {
  var listEl = document.getElementById('exampleList');
  if (!listEl) return;

  // 从真题数据里找
  var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
  if (!examData || !examData.questions) {
    listEl.innerHTML = '<div class="tips-example-loading">暂无题目数据</div>';
    return;
  }

  var qMap = {};
  examData.questions.forEach(function(q) { qMap[q.id] = q; });

  var found = exampleIds.map(function(id) { return qMap[id]; }).filter(Boolean);

  if (found.length === 0) {
    listEl.innerHTML = '<div class="tips-example-empty">这些例题暂时不在题库中</div>';
    return;
  }

  listEl.innerHTML = found.map(function(q) {
    var typeLabel = q.type || '题目';
    var questionText = (q.question || '').substring(0, 80) + ((q.question || '').length > 80 ? '...' : '');
    return '<div class="tips-example-item">' +
      '<div class="tips-example-type">' + escapeHtml(typeLabel) + '</div>' +
      '<div class="tips-example-q">' + escapeHtml(questionText) + '</div>' +
      '<button class="tips-link-btn tips-link-sm" onclick="removeExample(\'' + q.id + '\')">移除</button>' +
      '</div>';
  }).join('');
}

/* ====== 增删改 ====== */
function openAddModal() {
  editingTipId = null;
  document.getElementById('modalTitle').textContent = '新建做题技巧';
  document.getElementById('formTitle').value = '';
  document.getElementById('formCategory').value = '';
  document.getElementById('formChapter').value = '';
  document.getElementById('formSummary').value = '';
  document.getElementById('formImportance').value = '3';
  document.getElementById('formMastery').value = 'unknown';
  document.getElementById('formTags').value = '';
  document.getElementById('formContent').value = '';
  document.getElementById('tipModal').style.display = 'flex';
}

function editTip(id) {
  var tip = allTips.find(function(t) { return t.id === id; });
  if (!tip) return;
  editingTipId = id;
  document.getElementById('modalTitle').textContent = '编辑做题技巧';
  document.getElementById('formTitle').value = tip.title || '';
  document.getElementById('formCategory').value = tip.category || '';
  document.getElementById('formChapter').value = tip.chapter || '';
  document.getElementById('formSummary').value = tip.summary || '';
  document.getElementById('formImportance').value = tip.importance || '3';
  document.getElementById('formMastery').value = tip.mastery || 'unknown';
  document.getElementById('formTags').value = (tip.tags || []).join(' ');
  document.getElementById('formContent').value = tip.content || '';
  document.getElementById('tipModal').style.display = 'flex';
}

function saveTip() {
  var title = document.getElementById('formTitle').value.trim();
  if (!title) { alert('请填写技巧标题'); return; }

  var tagStr = document.getElementById('formTags').value.trim();
  var tags = tagStr ? tagStr.split(/\s+/).filter(Boolean) : [];

  var tip = {
    id: editingTipId || ('tip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
    title: title,
    category: document.getElementById('formCategory').value.trim(),
    chapter: document.getElementById('formChapter').value.trim(),
    summary: document.getElementById('formSummary').value.trim(),
    importance: parseInt(document.getElementById('formImportance').value) || 3,
    mastery: document.getElementById('formMastery').value || 'unknown',
    tags: tags,
    content: document.getElementById('formContent').value,
    source: '手动整理',
    updatedAt: new Date().toISOString(),
  };

  if (!editingTipId) {
    tip.createdAt = new Date().toISOString();
  }

  fetch(apiUrl('/api/study-tips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: currentSubject, tip: tip })
  })
  .then(function(r) { return r.json(); })
  .then(function() {
    document.getElementById('tipModal').style.display = 'none';
    loadTips();
    if (!editingTipId) {
      // 新建后选中它
      currentTipId = tip.id;
      setTimeout(function() { renderTipDetail(tip.id); }, 100);
    } else {
      renderTipDetail(editingTipId);
    }
  })
  .catch(function() { alert('保存失败，请检查服务器连接'); });
}

function deleteTip(id) {
  if (!confirm('确定删除这个做题技巧吗？')) return;
  fetch(apiUrl('/api/study-tips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: currentSubject, action: 'delete', tipId: id })
  })
  .then(function() {
    if (currentTipId === id) currentTipId = null;
    loadTips();
  })
  .catch(function() { alert('删除失败'); });
}

function removeExample(qId) {
  if (!currentTipId) return;
  if (!confirm('从例题中移除这道题？')) return;
  fetch(apiUrl('/api/study-tips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: currentSubject, action: 'remove-example', tipId: currentTipId, questionId: qId })
  })
  .then(function() {
    loadTips();
    // 更新详情里的例题列表
    var tip = allTips.find(function(t) { return t.id === currentTipId; });
    if (tip) {
      tip.examples = (tip.examples || []).filter(function(e) { return e !== qId; });
      renderTipDetail(currentTipId);
    }
  })
  .catch(function() { alert('操作失败'); });
}

/* ====== 统计 ====== */
function updateStats() {
  document.getElementById('statTotal').textContent = allTips.length;
  var total = document.getElementById('pageTitle');
  if (window.EXAM_DATA && window.EXAM_DATA[currentSubject]) {
    // 用科目名
  }
}

/* ====== 工具 ====== */
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ====== 事件绑定 ====== */
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('btnAddTip').addEventListener('click', openAddModal);
  document.getElementById('modalClose').addEventListener('click', function() {
    document.getElementById('tipModal').style.display = 'none';
  });
  document.getElementById('modalCancel').addEventListener('click', function() {
    document.getElementById('tipModal').style.display = 'none';
  });
  document.getElementById('modalSave').addEventListener('click', saveTip);
  document.getElementById('tipModal').addEventListener('click', function(e) {
    if (e.target.id === 'tipModal') {
      document.getElementById('tipModal').style.display = 'none';
    }
  });

  document.getElementById('filterCategory').addEventListener('change', function() { renderTipList(); });
  document.getElementById('filterImportance').addEventListener('change', function() { renderTipList(); });
  document.getElementById('filterMastery').addEventListener('change', function() { renderTipList(); });
  document.getElementById('searchInput').addEventListener('input', function() { renderTipList(); });

  loadTips();
});

// 暴露给全局
window.selectTip = selectTip;
window.editTip = editTip;
window.deleteTip = deleteTip;
window.removeExample = removeExample;
