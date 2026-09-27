// ============================================================
// 练习测验 - 在线测验 页面 JS
// 抽离自 练习测验-在线测验.html
// ============================================================

// 知识框架 JSON 转换为卡片数组（统一数据源，不再依赖 recite-cards）
function transformKfToCards(data) {
  var cards = [];
  if (!data || !data.chapters) return cards;
  data.chapters.forEach(function(ch) {
    var chName = ch.name || ch.title || ('第' + (ch.id || '?') + '章');
    var sections = ch.sections || [];
    for (var si = 0; si < sections.length; si++) {
      var s = sections[si];
      if (s.type === '核心概念') {
        var concepts = s.coreConcepts || s.items || [];
        concepts.forEach(function(c) {
          var term = c.term || '';
          if (!term) return;
          var defParts = [];
          if (c.summary) defParts.push(c.summary);
          if (c.points && c.points.length) {
            c.points.forEach(function(p) { defParts.push('• ' + p); });
          }
          var card = {
            term: term,
            chapter: chName,
            question: '什么是' + term + '？',
            def: defParts.join('\n'),
            ex: c.ex || '',
            exam: c.exam || '',
            hint: c.hint || '',
            cardType: c.cardType || 'memory'
          };
          if (c.formula) card.formula = c.formula;
          if (c.steps) card.steps = c.steps;
          if (c.answer) card.answer = c.answer;
          if (c.answerAliases) card.answerAliases = c.answerAliases;
          cards.push(card);
        });
      } else if (s.type === '必会公式') {
        var formulas = s.items || s.points || [];
        formulas.forEach(function(f) {
          var formulaText = typeof f === 'string' ? f : (f.term || f.point || '');
          if (!formulaText) return;
          var colonIdx = formulaText.indexOf('：');
          var title = colonIdx > 0 ? formulaText.substring(0, colonIdx) : formulaText.substring(0, 10);
          var content = colonIdx > 0 ? formulaText.substring(colonIdx + 1) : formulaText;
          cards.push({
            term: title,
            chapter: chName,
            question: title + '的公式是什么？',
            def: content,
            ex: '',
            exam: '',
            hint: '',
            cardType: 'calculation'
          });
        });
      }
    }
  });
  return cards;
}

var SUBJECT_CONFIG = {
  '13015': { name: '计算机系统原理', types: ['choice','fill','calculate','shortAnswer','nounExplain','essay'] },
  '02324': { name: '离散数学', types: ['choice','fill','calculate','proof'] },
  '13003': { name: '数据结构与算法', types: ['choice','fill','calculate','shortAnswer','essay'] }
};
var TYPE_META = {
  choice: { label: '选择题', icon: '📋', badge: 'badge-choice' },
  fill: { label: '填空题', icon: '✏️', badge: 'badge-fill' },
  calculate: { label: '计算题', icon: '🧮', badge: 'badge-calculate' },
  shortAnswer: { label: '简答题', icon: '📝', badge: 'badge-shortAnswer' },
  nounExplain: { label: '名词解释', icon: '📖', badge: 'badge-nounExplain' },
  essay: { label: '论述题', icon: '📖', badge: 'badge-essay' },
  proof: { label: '证明题', icon: '🔬', badge: 'badge-proof' }
};
var QUIZ_SYMBOLS = ['×','÷','=','≠','≈','≤','≥','<','>','±','²','³','ⁿ','√','π','Σ','∞','%','①','②','③','④','⑤','⑥','⑦','⑧','α','β','γ','δ','θ','λ','μ','σ','φ','ψ','ω','Δ','¬','∧','∨','→','↔','⊕','⊢','⇔','∀','∃','∈','∪','∩','⊆','⊇','∅','≡','P','Q','R','S','T','F','0','1'];

var apiUrl = QuizUtils.apiUrl;

var urlParams = new URLSearchParams(window.location.search);
var currentSubject = urlParams.get('subject') || '13015';
var fromRecite = urlParams.get('from') === 'recite';
var chapterParam = urlParams.get('chapter') || '';
var questionIdParam = urlParams.get('questionId') || '';
var currentTypeFilter = 'all';
var currentChapterFilter = 'all';     /* 章节筛选 */
var currentStatusFilter = 'all'; /* 状态筛选：all/undone/wrong/right */
var currentSourceFilter = 'all'; /* 来源筛选：all/textbook/chapter/review/ai */
var currentKeywordFilter = 'all'; /* 考点频率筛选：all/高频/中频/低频 */
var quizData = [];
var results = {};
var allRecords = [];  /* 全部答题记录（用于往期答案） */
var expandedSet = {}; /* questionId → true（展开答案） */
var markedMap = {};   /* questionId → true（手动加入错题库） */
var tipExampleMap = {}; /* questionId → [tipId1, tipId2]（属于哪些做题技巧的例题） */
var tipList = [];     /* 所有做题技巧列表 */

/* 真题关键词词典：用于统计历年真题中各知识点出现次数 */
var EXAM_KEYWORDS = {
  '13015': ['总线','中断','Cache','补码','浮点数','指令','DMA','冯·诺依曼','流水线','过程调用','虚拟存储','存储层次','指令周期','数据通路','栈','汇编','编译','链接','局部性','命中率','寄存器','CPI','存储器','二进制','操作码','地址','文件系统','内核','主存','外设'],
  '13003': ['二叉树','排序','图','栈','队列','链表','数组','查找','递归','哈希','树','遍历','时间复杂度','空间复杂度','森林','线索','矩阵','串','广义表','完全二叉树','平衡','AVL','B树','散列'],
  '02324': ['命题','逻辑','集合','关系','函数','图','代数','群','格','布尔代数','谓词','量词','推理','等价','蕴含','自反','对称','传递','偏序','连通','欧拉','哈密顿','树']
};

/* Subject code -> study-plan 中文名映射 */
var SUBJECT_NAME_MAP = { '13015': '系统原理', '02324': '离散数学', '13003': '数据结构' };
var currentMode = 'today';        /* 'today' | 'ai' */
var todayChapters = [];           /* 本周计划中当前科目的章节列表 */

/* ====== 筛选状态持久化（localStorage + API 双写，换浏览器也能恢复）====== */
function saveFilterState() {
  var state = {
    subject: currentSubject,
    mode: currentMode,
    chapter: currentChapterFilter,
    type: currentTypeFilter,
    status: currentStatusFilter,
    source: currentSourceFilter,
    keyword: currentKeywordFilter
  };
  try {
    localStorage.setItem('quiz-filter-' + currentSubject, JSON.stringify(state));
  } catch(e) {}
  try {
    fetch(apiUrl('/api/quiz-preference'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(state)
    }).catch(function(){});
  } catch(e) {}
}

function loadFilterState(callback) {
  var local = null;
  try {
    var saved = localStorage.getItem('quiz-filter-' + currentSubject);
    if (saved) local = JSON.parse(saved);
  } catch(e) {}
  if (local && local.source !== undefined) {
    callback(local);
  }
  try {
    fetch(apiUrl('/api/quiz-preference?subject=' + currentSubject))
      .then(function(r){ return r.json(); })
      .then(function(data) {
        if (data && data.subject) callback(data);
      })
      .catch(function(){});
  } catch(e) {}
}

/* 根据当前模式更新按钮/提示 UI（不修改筛选值，用于恢复状态） */
function applyModeUI() {
  var todayBtn = document.getElementById('todayBtn');
  var aiBtn = document.getElementById('aiBtn');
  if (currentMode === 'ai') {
    if (todayBtn) todayBtn.classList.remove('zk-active');
    if (aiBtn) aiBtn.classList.add('zk-active');
  } else {
    if (todayBtn) todayBtn.classList.add('zk-active');
    if (aiBtn) aiBtn.classList.remove('zk-active');
  }
  var hint = document.getElementById('todayHint');
  if (hint && currentMode === 'today') {
    var chLabel = todayChapters.length > 0 ? todayChapters.join('、') : '未加载';
    hint.textContent = '本周计划：' + chLabel;
  }
  updateModeHint();
  updateChrome(currentMode);
}

/* ====== 拍照上传（计算题手写答案替代键盘输入）====== */
var quizPhotos = {};  /* qId -> dataURL 内存缓存 */

function getPhotoKey(qId) {
  return 'quiz-photo-' + currentSubject + '-' + qId;
}

function savePhoto(qId, dataURL) {
  quizPhotos[qId] = dataURL;
  try { localStorage.setItem(getPhotoKey(qId), dataURL); } catch(e) { console.warn('照片存储失败:', e); }
  // 异步上传到服务端（跨设备同步）
  uploadPhotoToServer(qId, dataURL);
}

/* 上传照片到服务端（静默失败，离线时存本地待同步） */
function uploadPhotoToServer(qId, dataURL) {
  var payload = { subject: currentSubject, questionId: qId, dataURL: dataURL };
  // 先写本地待同步队列
  var pending = getPendingPhotos();
  pending = pending.filter(function(p) { return p.questionId !== qId; });
  pending.push(payload);
  setPendingPhotos(pending);
  // 再异步发请求，成功则清本地
  fetch(apiUrl('/api/quiz-photo'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var cur = getPendingPhotos();
    var before = cur.length;
    cur = cur.filter(function(p) { return p.questionId !== qId; });
    if (cur.length !== before) setPendingPhotos(cur);
  }).catch(function(e) {
    console.warn('照片同步到服务端失败，已暂存本地，下次加载时自动重传:', e);
  });
}

function loadPhoto(qId) {
  if (quizPhotos[qId]) return quizPhotos[qId];
  try {
    var saved = localStorage.getItem(getPhotoKey(qId));
    if (saved) { quizPhotos[qId] = saved; return saved; }
  } catch(e) {}
  return null;
}

function removePhoto(qId) {
  delete quizPhotos[qId];
  try { localStorage.removeItem(getPhotoKey(qId)); } catch(e) {}
}

/* ====== 照片跨设备同步 ====== */
function getPendingPhotos() {
  try {
    var raw = localStorage.getItem('quiz-pending-photos-' + currentSubject);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
function setPendingPhotos(arr) {
  try { localStorage.setItem('quiz-pending-photos-' + currentSubject, JSON.stringify(arr)); } catch(e) {}
}
function flushPendingPhotos() {
  var pending = getPendingPhotos();
  if (!pending.length) return Promise.resolve();
  var promises = pending.map(function(payload) {
    return fetch(apiUrl('/api/quiz-photo'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (r.ok) {
        var remaining = getPendingPhotos().filter(function(p) {
          return p.questionId !== payload.questionId;
        });
        setPendingPhotos(remaining);
        return true;
      }
      return false;
    }).catch(function() { return false; });
  });
  return Promise.all(promises);
}
/* 页面加载时从服务端拉取全部照片，与本地合并 */
function syncPhotosFromServer() {
  return fetch(apiUrl('/api/quiz-photos?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(serverPhotos) {
      if (!serverPhotos || typeof serverPhotos !== 'object') return;
      // 服务端照片覆盖本地缓存（服务端是最新的）
      for (var qId in serverPhotos) {
        if (serverPhotos.hasOwnProperty(qId)) {
          quizPhotos[qId] = serverPhotos[qId];
          try { localStorage.setItem(getPhotoKey(qId), serverPhotos[qId]); } catch(e) {}
        }
      }
    })
    .catch(function(e) {
      console.warn('从服务端拉取照片失败:', e);
    });
}

/* 压缩图片：限制最大宽度 800px，JPEG 0.7 质量，避免 localStorage 溢出 */
function compressImage(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var maxW = 800;
      var scale = Math.min(1, maxW / img.width);
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* 拍照上传处理：压缩→存 localStorage→创建答题记录→显示自评按钮 */
function uploadQuizPhoto(qId, file) {
  var inputFile = file || (function() {
    var el = document.getElementById('photo-input-' + qId);
    return el && el.files ? el.files[0] : null;
  })();
  if (!inputFile) return;
  compressImage(inputFile, function(dataURL) {
    savePhoto(qId, dataURL);
    if (!results[qId]) {
      var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
      if (q) {
        results[qId] = { score: 0, total: 1, level: 'unknown', details: { userAnswer: '📷 照片提交', photo: true }, selfOverride: null, wrongReason: '' };
        saveQuizRecord(q, '📷 照片提交', null, results[qId]);
        updateMastery(q.chapter, 'unknown');
      }
    }
    input.value = '';
    updateStats(); render();
  });
}

/* 拍照缩略图 — 委托共享函数 */
function renderQuizPhoto(qId) {
  return H.renderPhoto(loadPhoto(qId));
}

function levelText(level) {
  if (level === 'mastered') return { text: '已掌握', icon: '🟢', cls: 'mastered' };
  if (level === 'unsure') return { text: '不熟练', icon: '🟡', cls: 'unsure' };
  return { text: '不会', icon: '🔴', cls: 'unknown' };
}

function getCurrentLevel(qId) {
  var r = results[qId];
  if (!r) return null;
  return r.selfOverride || r.level;
}

function updateStats() {
  var m=0,u=0,n=0;
  Object.keys(results).forEach(function(id) {
    var lv = getCurrentLevel(id);
    if (lv==='mastered') m++; else if (lv==='unsure') u++; else n++;
  });
  document.getElementById('statMastered').textContent = m;
  document.getElementById('statUnsure').textContent = u;
  document.getElementById('statUnknown').textContent = n;
  updateGuideFlow(m, u, n);
}

function updateGuideFlow(m, u, n) {
  var guide = document.getElementById('guideFlow');
  var btn = document.getElementById('guideBtn');
  var sub = document.getElementById('guideSubText');
  if (!guide || !btn) return;
  var total = m + u + n;
  if (total === 0) { guide.classList.remove('zk-show'); return; }
  guide.classList.add('zk-show');
  var wrongCount = u + n;
  if (wrongCount > 0) {
    btn.classList.remove('success'); btn.classList.add('warn');
    btn.firstChild.textContent = '✅ 去复盘总结 →';
    if (sub) sub.textContent = '有' + wrongCount + '道错题，点击查看错题和解析';
  } else {
    btn.classList.remove('warn'); btn.classList.add('success');
    btn.firstChild.textContent = '✅ 全部正确，继续保持！';
    if (sub) sub.textContent = '点击返回复盘总结查看学习记录';
  }
  var basePath = (location.protocol === 'file:') ? '' : '';
  btn.href = basePath + '复盘总结-章节复盘.html?subject=' + currentSubject + '&tab=wrong#wrong';
}

function updateMastery(chapter, level) {
  try {
    fetch(apiUrl('/api/mastery'), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ subject: currentSubject, chapter: chapter, level: level })
    }).catch(function(){});
  } catch(e) {}
}

/* 答题后写入记录（静默失败，不影响用户体验） */
function saveQuizRecord(q, userAnswer, userSelection, result) {
  try {
    var record = {
      questionId: q.id,
      timestamp: new Date().toISOString(),
      type: q.type,
      chapter: q.chapter,
      userAnswer: (userAnswer !== null && userAnswer !== undefined) ? userAnswer : (userSelection || ''),
      isCorrect: result.score >= result.total,
      score: result.score,
      total: result.total,
      level: result.level,
      source: 'practice',
      session: currentMode === 'today' ? 'today-task' : 'free-practice'
    };
    var payload = { subject: currentSubject, record: record };
    allRecords.push(record);
    // 先写本地 localStorage（追加式，不去重）
    var pending = getPendingRecords();
    pending.push(payload);
    setPendingRecords(pending);
    // 再异步发请求，成功则按 timestamp 移除本地条目
    fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var cur = getPendingRecords();
      cur = cur.filter(function(p) { return p.record.timestamp !== record.timestamp; });
      setPendingRecords(cur);
    }).catch(function(e) {
      console.warn('记录保存到服务器失败，已暂存本地，下次加载时自动重传:', e);
    });
  } catch(e) { console.error('记录保存失败:', e); }
}

/* 待重传记录队列（localStorage 兜底） */
function getPendingRecords() {
  try {
    var raw = localStorage.getItem('quiz-pending-records-' + currentSubject);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
function setPendingRecords(arr) {
  try { localStorage.setItem('quiz-pending-records-' + currentSubject, JSON.stringify(arr)); } catch(e) {}
}
function flushPendingRecords() {
  var pending = getPendingRecords();
  if (!pending.length) return Promise.resolve();
  // 逐个重传，成功就按 timestamp 从队列里移除
  var promises = pending.map(function(payload) {
    return fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (r.ok) {
        var remaining = getPendingRecords().filter(function(p) {
          return p.record.timestamp !== payload.record.timestamp;
        });
        setPendingRecords(remaining);
        return true;
      }
      return false;
    }).catch(function() { return false; });
  });
  return Promise.all(promises);
}

/* 错因待重传队列 */
function getPendingWrongReasons() {
  try {
    var raw = localStorage.getItem('quiz-pending-wrong-reasons-' + currentSubject);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
function setPendingWrongReasons(arr) {
  try { localStorage.setItem('quiz-pending-wrong-reasons-' + currentSubject, JSON.stringify(arr)); } catch(e) {}
}
function flushPendingWrongReasons() {
  var pending = getPendingWrongReasons();
  if (!pending.length) return Promise.resolve();
  var promises = pending.map(function(payload) {
    return fetch(apiUrl('/api/quiz-wrong-reason'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (r.ok) {
        var remaining = getPendingWrongReasons().filter(function(p) {
          return p.questionId !== payload.questionId;
        });
        setPendingWrongReasons(remaining);
        // 错因同步成功后更新本地 results 并重新渲染
        if (results[payload.questionId]) {
          results[payload.questionId].wrongReason = payload.wrongReason;
          render();
        }
        return true;
      }
      // 404 说明记录不存在（可能是答题记录还没同步上），留着下次重试
      return false;
    }).catch(function() { return false; });
  });
  return Promise.all(promises);
}

/* ====== 后台自动同步 ====== */
var _syncTimer = null;
var _syncing = false;
function updateSyncStatus() {
  try {
    var pr = getPendingRecords();
    var pw = getPendingWrongReasons();
    var total = pr.length + pw.length;
    var el = document.getElementById('syncStatusText');
    if (!el) return;
    if (_syncing) {
      el.textContent = '🔄 同步中…';
      var dot0 = document.getElementById('syncStatus');
      if (dot0) dot0.style.background = '#fff3cd';
    } else if (total > 0) {
      el.textContent = '⏳ 待同步 ' + total + ' 条';
      var dot = document.getElementById('syncStatus');
      if (dot) dot.style.background = '#fff3cd';
    } else {
      el.textContent = '✅ 已同步';
      var dot2 = document.getElementById('syncStatus');
      if (dot2) dot2.style.background = '#d4edda';
    }
  } catch(e) {}
}
function syncNow() {
  if (_syncing) return;
  _syncing = true;
  updateSyncStatus();
  // 先同步答题记录，全部完成后再同步错因（错因依赖记录存在），最后同步照片
  flushPendingRecords().then(function() {
    return flushPendingWrongReasons();
  }).then(function() {
    return flushPendingPhotos();
  }).then(function() {
    _syncing = false;
    setTimeout(updateSyncStatus, 300);
  }).catch(function() {
    _syncing = false;
    updateSyncStatus();
  });
}
function startAutoSync() {
  if (_syncTimer) return;
  updateSyncStatus();
  /* 每 15 秒尝试重传一次待同步记录，先传记录再传错因 */
  _syncTimer = setInterval(function() {
    var pr = getPendingRecords();
    var pw = getPendingWrongReasons();
    var pp = getPendingPhotos();
    if (pr.length || pw.length || pp.length) {
      syncNow();
    }
  }, 15000);
  /* 页面从后台切回前台时，立即尝试同步 */
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      syncNow();
    }
  });
  /* 页面前进/后退缓存恢复时同步 */
  window.addEventListener('pageshow', function() {
    syncNow();
  });
  /* 每次答题保存后更新状态 */
  var _origSetPendingRecords = setPendingRecords;
  setPendingRecords = function(arr) {
    _origSetPendingRecords(arr);
    updateSyncStatus();
  };
  var _origSetPendingWrongReasons = setPendingWrongReasons;
  setPendingWrongReasons = function(arr) {
    _origSetPendingWrongReasons(arr);
    updateSyncStatus();
  };
}

/* ====== RENDERERS ====== */

var esc = QuizUtils.esc;

var H = QuizHelpers;
var renderContent = H.renderContent;
var levelText = H.levelText;

/* 特殊符号面板 — 委托共享函数 */
function renderSymbolPalette(qId) {
  return H.renderSymbolPalette(qId);
}

function renderSelfEval(qId, label) {
  var r = results[qId];
  var overrideLevel = r ? (r.selfOverride || r.level) : null;
  return H.renderSelfEval(overrideLevel, qId, label);
}

function renderScoreHeader(qId, q) {
  var r = results[qId];
  return H.renderScoreHeader(r.score, r.total, r.selfOverride || r.level, q.passThreshold, r.selfOverride);
}

function renderReference(label, content, isProof) {
  return H.renderReference(label, content, isProof);
}

function renderUserAnswer(qId) {
  var r = results[qId];
  if (!r || !r.details) return '';
  return H.renderUserAnswer(r.details.userAnswer);
}

function renderWrongReason(qId) {
  var r = results[qId];
  if (!r) return '';
  if (r.score >= r.total) return '';
  return H.renderWrongReason(r.wrongReason, qId);
}

var SRC_LABELS = H.SRC_LABELS;

function renderSrcTag(q) {
  return H.renderSrcTag(q.src);
}

/* 判断题目是否在错题库中：手动标记 或 答错自动进入 */
function isInWrongBook(q) {
  var r = results[q.id];
  return !!markedMap[q.id] || (r && r.isCorrect === false);
}

function renderChoiceCard(q) {
  var r = results[q.id];
  return H.renderChoiceCard(q, r, {
    selected: window.choiceSelections[q.id] || '',
    subType: q.subType,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

function renderFillCard(q) {
  var r = results[q.id];
  return H.renderFillCard(q, r, { showComparison: true, history: getHistory(q.id), expanded: expandedSet[q.id] === true, marked: isInWrongBook(q), tipExample: !!tipExampleMap[q.id], tipCount: (tipExampleMap[q.id] || []).length });
}

/* 计算题 — 委托共享函数 */
function renderCalculateCard(q) {
  return H.renderCalculateCard(q, results[q.id], {
    getPhoto: loadPhoto,
    showSymbol: true,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

function toggleRef(qId) {
  expandedSet[qId] = expandedSet[qId] !== true;
  render();
}

function redoQuestion(qId) {
  delete results[qId];
  if (window.choiceSelections) delete window.choiceSelections[qId];
  updateStats();
  render();
}

/* 简答题 — 委托共享函数 */
function renderShortAnswerCard(q) {
  return H.renderShortAnswerCard(q, results[q.id], {
    showSymbol: true,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

/* 论述题 — 委托共享函数 */
function renderEssayCard(q) {
  return H.renderEssayCard(q, results[q.id], {
    showSymbol: true,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

/* 证明题 — 委托共享函数 */
function renderProofCard(q) {
  return H.renderProofCard(q, results[q.id], {
    getPhoto: loadPhoto,
    showSymbol: true,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

/* 统一分发器 — 委托共享函数 */
function renderCard(q) {
  return H.renderCard(q, results[q.id], {
    selected: window.choiceSelections[q.id] || '',
    subType: q.subType,
    showComparison: true,
    getPhoto: loadPhoto,
    showSymbol: true,
    showPoints: true,
    showSteps: true,
    history: getHistory(q.id),
    expanded: expandedSet[q.id] === true,
    marked: isInWrongBook(q),
    tipExample: !!tipExampleMap[q.id],
    tipCount: (tipExampleMap[q.id] || []).length
  });
}

/* 获取某题的往期答题记录 */
function getHistory(qId) {
  return allRecords.filter(function(r) { return r.questionId === qId; });
}

/* ====== SUBMIT HANDLERS ====== */

window.choiceSelections = {};

function toggleChoiceOption(qId, letter) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  if (q.subType === 'multi') {
    var sel = window.choiceSelections[qId] || '';
    var idx = sel.indexOf(letter);
    if (idx >= 0) sel = sel.replace(letter, '');
    else sel += letter;
    window.choiceSelections[qId] = sel;
  } else {
    window.choiceSelections[qId] = letter;
  }
  render();
}

function submitChoice(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var sel = window.choiceSelections[qId] || '';
  if (!sel) { alert('请先选择答案'); return; }
  var result = H.scoreChoice(q, sel);
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, null, sel, result);
  expandedSet[qId] = true;
  updateStats(); render();
}

function submitFill(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var answers = (q.blanks || []).map(function(b, i) {
    var el = document.getElementById('fill-'+qId+'-'+i) || document.querySelector('[data-blank-id="'+qId+'"][data-blank-idx="'+i+'"]');
    return el ? el.value.trim() : '';
  });
  if (answers.every(function(a){return !a;})) { alert('请先填写答案'); return; }
  var result = H.scoreFill(q, answers);
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, answers.join(' | '), null, result);
  expandedSet[qId] = true;
  updateStats(); render();
}

function submitText(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var ta = document.getElementById('input-'+qId) || document.querySelector('[data-input-id="'+qId+'"]');
  if (!ta) return;
  var ans = ta.value.trim();
  if (!ans) { alert('请先输入答案'); return; }
  var result = H.scoreQuestion(q, ans, null);
  if (!result) {
    /* 无 points/steps 的主观题回退到自评 */
    results[qId] = { score: 0, total: 1, level: 'unknown', details: { userAnswer: ans }, selfOverride: null, wrongReason: '', pendingAssess: true };
    updateMastery(q.chapter, 'unknown');
    saveQuizRecord(q, ans, null, { score: 0, total: 1, level: 'unknown', details: { userAnswer: ans } });
    expandedSet[qId] = true;
    updateStats(); render();
    return;
  }
  if (!result.details) result.details = {};
  result.details.userAnswer = ans;
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, ans, null, result);
  expandedSet[qId] = true;
  updateStats(); render();
}

function selfEval(qId, level) {
  if (!results[qId]) return;
  results[qId].selfOverride = level;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (q) updateMastery(q.chapter, level);
  expandedSet[qId] = true;
  updateStats(); render();
}

/* ====== 做题技巧：设为/移除例题 ====== */
function toggleTipExample(qId) {
  var existing = tipExampleMap[qId] || [];
  if (existing.length > 0) {
    // 已经在某些技巧里了，显示选择菜单让用户选要加入哪个，或移除
    showTipSelector(qId, existing);
  } else {
    // 还没加入任何技巧，直接弹选择器
    showTipSelector(qId, []);
  }
}

function showTipSelector(qId, existingTipIds) {
  if (tipList.length === 0) {
    alert('还没有做题技巧，先去「做题技巧」页面新建一个吧！');
    return;
  }
  // 简单用 prompt 让用户输入技巧序号
  var msg = '选择要加入的技巧编号（输入编号即可，多个用逗号分隔，留空取消）：\n\n';
  tipList.forEach(function(tip, i) {
    var isIn = existingTipIds.indexOf(tip.id) >= 0;
    msg += (i + 1) + '. ' + tip.title + (isIn ? ' 【已加入】' : '') + '\n';
  });
  msg += '\n提示：输入 0 可从所有技巧中移除';
  var input = prompt(msg);
  if (input === null || input.trim() === '') return;

  var val = input.trim();
  if (val === '0') {
    // 从所有技巧中移除
    existingTipIds.forEach(function(tipId) {
      removeFromTip(qId, tipId);
    });
    return;
  }

  var indices = val.split(/[,，\s]+/).map(function(s) { return parseInt(s); }).filter(function(n) { return n > 0 && n <= tipList.length; });
  indices.forEach(function(idx) {
    var tip = tipList[idx - 1];
    if (tip && existingTipIds.indexOf(tip.id) < 0) {
      addToTip(qId, tip.id);
    }
  });
}

function addToTip(qId, tipId) {
  fetch(apiUrl('/api/study-tips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: currentSubject, action: 'add-example', tipId: tipId, questionId: qId })
  }).then(function() {
    if (!tipExampleMap[qId]) tipExampleMap[qId] = [];
    if (tipExampleMap[qId].indexOf(tipId) < 0) {
      tipExampleMap[qId].push(tipId);
    }
    render();
  }).catch(function() {});
}

function removeFromTip(qId, tipId) {
  fetch(apiUrl('/api/study-tips'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: currentSubject, action: 'remove-example', tipId: tipId, questionId: qId })
  }).then(function() {
    if (tipExampleMap[qId]) {
      tipExampleMap[qId] = tipExampleMap[qId].filter(function(id) { return id !== tipId; });
      if (tipExampleMap[qId].length === 0) delete tipExampleMap[qId];
    }
    render();
  }).catch(function() {});
}

function toggleWrongReasonEdit(qId) {
  var editor = document.getElementById('wr-edit-'+qId);
  if (editor) {
    editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
    if (editor.style.display === 'block') {
      var ta = document.getElementById('wr-input-'+qId);
      if (ta) ta.focus();
    }
  }
}

function saveWrongReason(qId) {
  var ta = document.getElementById('wr-input-'+qId);
  if (!ta) return;
  var reason = ta.value.trim();
  if (!results[qId]) return;
  results[qId].wrongReason = reason;
  var wrPayload = { subject: currentSubject, questionId: qId, wrongReason: reason };
  // 先写本地，再异步发请求
  var pendingWr = getPendingWrongReasons();
  pendingWr = pendingWr.filter(function(p) { return p.questionId !== qId; });
  pendingWr.push(wrPayload);
  setPendingWrongReasons(pendingWr);
  fetch(apiUrl('/api/quiz-wrong-reason'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wrPayload)
  }).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var cur = getPendingWrongReasons();
    var before = cur.length;
    cur = cur.filter(function(p) { return p.questionId !== qId; });
    if (cur.length !== before) setPendingWrongReasons(cur);
  }).catch(function(e) {
    console.warn('错因保存到服务器失败，已暂存本地:', e);
  });
  render();
}

function cancelWrongReason(qId) {
  var editor = document.getElementById('wr-edit-'+qId);
  if (editor) editor.style.display = 'none';
}

function toggleSymbols(qId) {
  var pal = document.getElementById('sym-'+qId);
  if (pal) pal.classList.toggle('zk-show');
}

function insertSymbol(qId, sym) {
  var ta = document.getElementById('input-'+qId) || document.querySelector('[data-input-id="'+qId+'"]');
  if (!ta || ta.disabled) return;
  var s = ta.selectionStart || 0, e = ta.selectionEnd || 0;
  ta.value = ta.value.substring(0, s) + sym + ta.value.substring(e);
  ta.selectionStart = ta.selectionEnd = s + sym.length;
  ta.focus();
}

/* ====== RENDER ====== */

function renderTypeFilter() {
  var config = SUBJECT_CONFIG[currentSubject];
  if (!config) return;
  var availableTypes = {};
  var source = currentMode === 'ai' ? aiQuizData : quizData;
  source.forEach(function(q) { if (q.type) availableTypes[q.type] = (availableTypes[q.type]||0)+1; });
  var filter = document.getElementById('typeFilter');
  if (!filter) return;
  var html = '<option value="all"'+(currentTypeFilter==='all'?' selected':'')+'>📝 题型：全部 ('+source.length+')</option>';
  config.types.forEach(function(t) {
    if (!availableTypes[t]) return;
    var meta = TYPE_META[t];
    if (meta) html += '<option value="'+t+'"'+(currentTypeFilter===t?' selected':'')+'>'+meta.icon+' '+meta.label+' ('+availableTypes[t]+')</option>';
  });
  filter.innerHTML = html;
}

/* 章节筛选：从 quizData 提取 chapter 去重 */
function renderChapterFilter() {
  var chMap = {};
  var source = currentMode === 'ai' ? aiQuizData : quizData;
  source.forEach(function(q) {
    var ch = q.chapter || '';
    if (ch) chMap[ch] = (chMap[ch]||0)+1;
  });
  var filter = document.getElementById('chapterFilter');
  if (!filter) return;
  var total = source.length;
  var html = '<option value="all"'+(currentChapterFilter==='all'?' selected':'')+'>📖 章节：全部 ('+total+')</option>';
  Object.keys(chMap).sort().forEach(function(ch) {
    html += '<option value="'+ch+'"'+(currentChapterFilter===ch?' selected':'')+'>'+ch+' ('+chMap[ch]+')</option>';
  });
  filter.innerHTML = html;
}

/* 状态筛选：根据答题记录分类 */
function renderStatusFilter() {
  var filter = document.getElementById('statusFilter');
  if (!filter) return;
  var source = currentMode === 'ai' ? aiQuizData : quizData;
  var undone = 0, wrong = 0, right = 0;
  source.forEach(function(q) {
    var r = results[q.id];
    if (!r) { undone++; }
    else {
      var lv = getCurrentLevel(q.id);
      if (lv === 'mastered') right++; else wrong++;
    }
  });
  var html = '<option value="all"'+(currentStatusFilter==='all'?' selected':'')+'>📊 状态：全部 ('+source.length+')</option>';
  html += '<option value="undone"'+(currentStatusFilter==='undone'?' selected':'')+'>未做 ('+undone+')</option>';
  html += '<option value="wrong"'+(currentStatusFilter==='wrong'?' selected':'')+'>做错 ('+wrong+')</option>';
  html += '<option value="right"'+(currentStatusFilter==='right'?' selected':''  )+'>做对 ('+right+')</option>';
  filter.innerHTML = html;
}

/* 来源筛选：教材/章节/复习/AI */
function renderSourceFilter() {
  var filter = document.getElementById('sourceFilter');
  if (!filter) return;
  var source = currentMode === 'ai' ? aiQuizData : quizData;
  var srcMap = {};
  source.forEach(function(q) {
    var s = q.src || 'ai';
    srcMap[s] = (srcMap[s] || 0) + 1;
  });
  var SRC_META = {
    textbook: { icon: '📘', label: '教材' },
    chapter: { icon: '📝', label: '章节' },
    review: { icon: '📋', label: '复习' },
    ai: { icon: '🤖', label: 'AI' },
    '老师总结': { icon: '👨‍🏫', label: '老师总结' }
  };
  var total = source.length;
  var html = '<option value="all"'+(currentSourceFilter==='all'?' selected':'')+'>📦 来源：全部 ('+total+')</option>';
  ['textbook', 'chapter', 'review', 'ai', '老师总结'].forEach(function(s) {
    if (srcMap[s]) {
      var meta = SRC_META[s];
      html += '<option value="'+s+'"'+(currentSourceFilter===s?' selected':'')+'>'+meta.icon+' '+meta.label+' ('+srcMap[s]+')</option>';
    }
  });
  filter.innerHTML = html;
}

function switchChapter(val) { currentChapterFilter = val; saveFilterState(); renderChapterFilter(); updateFilterCount(); render(); }
function switchStatus(val) { currentStatusFilter = val; saveFilterState(); renderStatusFilter(); updateFilterCount(); render(); }
function switchSource(val) { currentSourceFilter = val; saveFilterState(); renderSourceFilter(); updateFilterCount(); render(); }

/* 考点频率筛选：从真题数据统计关键词出现次数 */
function renderKeywordFilter() {
  var filter = document.getElementById('keywordFilter');
  if (!filter) return;
  var keywords = EXAM_KEYWORDS[currentSubject] || [];
  var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
  if (!examData || !examData.questions) {
    filter.innerHTML = '<option value="all"' + (currentKeywordFilter === 'all' ? ' selected' : '') + '>🎯 考点：全部</option>';
    return;
  }
  /* 统计每个关键词在真题题干+答案中出现的次数 */
  var freq = {};
  keywords.forEach(function(kw) { freq[kw] = 0; });
  examData.questions.forEach(function(q) {
    var text = (q.question || '') + ' ' + (q.answer || '') + ' ' + (q.options ? q.options.join(' ') : '');
    keywords.forEach(function(kw) {
      if (text.indexOf(kw) >= 0) freq[kw]++;
    });
  });
  /* 按频率降序排列，只显示出现2次以上的 */
  var sorted = Object.keys(freq).filter(function(kw) { return freq[kw] >= 2; })
    .sort(function(a, b) { return freq[b] - freq[a]; });
  var html = '<option value="all"' + (currentKeywordFilter === 'all' ? ' selected' : '') + '>🎯 考点：全部</option>';
  sorted.forEach(function(kw) {
    html += '<option value="' + kw + '"' + (currentKeywordFilter === kw ? ' selected' : '') + '>' + kw + ' (' + freq[kw] + '次)</option>';
  });
  filter.innerHTML = html;
}

function switchKeyword(val) { currentKeywordFilter = val; saveFilterState(); renderKeywordFilter(); updateFilterCount(); render(); }

/* 更新筛选计数 */
function updateFilterCount() {
  var filtered = getFilteredQuiz();
  var el = document.getElementById('filterCount');
  if (el) el.textContent = '显示 ' + filtered.length + ' 题';
}

/* 四层筛选：章节 + 题型 + 状态 + 来源 */
function getFilteredQuiz() {
  var source = currentMode === 'ai' ? aiQuizData : quizData;
  return source.filter(function(q) {
    /* 章节筛选 */
    if (currentChapterFilter !== 'all') {
      if ((q.chapter || '') !== currentChapterFilter) return false;
    }
    /* 题型筛选 */
    if (currentTypeFilter !== 'all') {
      if (q.type !== currentTypeFilter) return false;
    }
    /* 状态筛选 */
    if (currentStatusFilter !== 'all') {
      var r = results[q.id];
      if (currentStatusFilter === 'undone' && r) return false;
      if (currentStatusFilter === 'wrong' && (!r || getCurrentLevel(q.id) === 'mastered')) return false;
      if (currentStatusFilter === 'right' && (!r || getCurrentLevel(q.id) !== 'mastered')) return false;
    }
    /* 来源筛选 */
    if (currentSourceFilter !== 'all') {
      if ((q.src || 'ai') !== currentSourceFilter) return false;
    }
    /* 考点频率筛选 */
    if (currentKeywordFilter !== 'all') {
      var qText = (q.question || q.title || '') + ' ' + (q.answer || '') + ' ' + (q.explanation || '');
      if (qText.indexOf(currentKeywordFilter) < 0) return false;
    }
    return true;
  });
}

/* 判断题目章节是否属于本周计划 */
function isTodayChapter(ch) {
  if (!ch || todayChapters.length === 0) return false;
  return todayChapters.some(function(tc) { return ch === tc || ch.indexOf(tc + ' ') === 0; });
}

/* 今日任务：自动筛选本周章节 */
function activateToday() {
  currentMode = 'today';
  var chapterFilterEl = document.getElementById('chapterFilter');
  if (!chapterFilterEl) return;
  /* 找出今日章节列表 */
  var todayChs = {};
  quizData.forEach(function(q) {
    if (isTodayChapter(q.chapter)) todayChs[q.chapter] = true;
  });
  var todayList = Object.keys(todayChs);
  if (todayList.length === 1) {
    currentChapterFilter = todayList[0];
  } else {
    currentChapterFilter = 'all';
  }
  /* 更新今日按钮状态 */
  var todayBtn = document.getElementById('todayBtn');
  var aiBtn = document.getElementById('aiBtn');
  if (todayBtn) todayBtn.classList.add('zk-active');
  if (aiBtn) aiBtn.classList.remove('zk-active');
  /* 显示提示 */
  var hint = document.getElementById('todayHint');
  if (hint) {
    var chLabel = todayChapters.length > 0 ? todayChapters.join('、') : '未加载';
    hint.textContent = '本周计划：' + chLabel;
  }
  saveFilterState(); renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); renderSourceFilter(); renderKeywordFilter(); updateFilterCount(); render();
}

function updateSessionAndStats(filtered) {
  var answered = 0, correct = 0, wrong = 0;
  filtered.forEach(function(q) {
    if (results[q.id]) {
      answered++;
      var lv = getCurrentLevel(q.id);
      if (lv === 'mastered') correct++; else wrong++;
    }
  });
  var bar = document.getElementById('sessionBar');
  if (bar) {
    bar.classList.toggle('zk-show', filtered.length > 0);
    document.getElementById('sessionAnswered').textContent = answered;
    document.getElementById('sessionTotal').textContent = filtered.length;
    document.getElementById('sessionFill').style.setProperty('--fill-pct', (answered / filtered.length * 100) + '%');
    var rate = answered > 0 ? Math.round(correct / answered * 100) : 0;
    document.getElementById('sessionRate').textContent = answered > 0 ? '✅' + correct + ' ❌' + wrong + ' · ' + rate + '%' : '';
  }
}

/* ====== 单题AI助手 ====== */
var aiHelpHistory = {}; /* 按题目ID存储对话历史 */

/* 从服务器加载AI对话历史 */
function loadAIHelpConversation(qId) {
  return fetch(apiUrl('/api/quiz-ai-help?subject=' + currentSubject + '&questionId=' + qId), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data)) {
        aiHelpHistory[qId] = data;
      }
      return data;
    })
    .catch(function() {
      aiHelpHistory[qId] = aiHelpHistory[qId] || [];
      return aiHelpHistory[qId];
    });
}

/* 保存AI对话历史到服务器 */
function saveAIHelpConversation(qId) {
  var conversation = aiHelpHistory[qId] || [];
  return fetch(apiUrl('/api/quiz-ai-help'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: currentSubject,
      questionId: qId,
      conversation: conversation
    })
  }).catch(function() {
    /* 保存失败不影响用户体验，静默处理 */
  });
}

/* 切换AI助手面板显示 */
function toggleAIHelp(qId) {
  var panel = document.getElementById('ai-help-' + qId);
  if (!panel) {
    /* 面板不存在，创建并插入到卡片末尾 */
    var card = document.getElementById('card-' + qId);
    if (!card) return;
    panel = document.createElement('div');
    panel.className = 'ai-help-panel zk-show';
    panel.id = 'ai-help-' + qId;
    /* 先加载历史对话，再渲染面板 */
    panel.innerHTML = '<div class="ai-help-messages"><div class="ai-msg loading">正在加载历史对话...</div></div>';
    card.appendChild(panel);
    loadAIHelpConversation(qId).then(function() {
      panel.innerHTML = renderAIHelpPanel(qId);
      /* 聚焦输入框 */
      var input = panel.querySelector('.ai-help-input');
      if (input) input.focus();
      /* 滚动到底部 */
      var msgs = panel.querySelector('.ai-help-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  } else {
    panel.classList.toggle('zk-show');
  }
}

/* 渲染AI助手面板内容 */
function renderAIHelpPanel(qId) {
  var history = aiHelpHistory[qId] || [];
  var msgsHTML = history.map(function(m) {
    return '<div class="ai-msg '+m.role+'">'+esc(m.content)+'</div>';
  }).join('');
  if (msgsHTML === '') {
    msgsHTML = '<div class="ai-msg assistant">你好！我是AI学习助手，关于这道题有什么疑问尽管问我。可以问"这道题考什么知识点"、"这道题怎么解"等。</div>';
  }
  return '<div class="ai-help-messages" id="ai-msgs-'+qId+'">'+msgsHTML+'</div>' +
    '<div class="ai-help-input-row">' +
    '<input type="text" class="ai-help-input" id="ai-input-'+qId+'" placeholder="输入你的问题..." data-action="ai-input" data-id="'+qId+'">' +
    '<button class="ai-help-send zk-btn-primary" id="ai-send-'+qId+'" data-action="ai-send" data-id="'+qId+'">发送</button>' +
    '</div>';
}

/* 发送问题给AI */
function sendAIHelp(qId) {
  var input = document.getElementById('ai-input-' + qId);
  if (!input) return;
  var question = input.value.trim();
  if (!question) return;

  /* 初始化对话历史 */
  if (!aiHelpHistory[qId]) aiHelpHistory[qId] = [];

  /* 添加用户消息 */
  aiHelpHistory[qId].push({ role: 'user', content: question });
  input.value = '';
  input.disabled = true;
  var sendBtn = document.getElementById('ai-send-' + qId);
  if (sendBtn) sendBtn.disabled = true;
  /* 保存用户消息到服务器，防止刷新丢失 */
  saveAIHelpConversation(qId);

  /* 渲染用户消息 + loading */
  var msgs = document.getElementById('ai-msgs-' + qId);
  if (msgs) {
    msgs.innerHTML += '<div class="ai-msg user">'+esc(question)+'</div>';
    msgs.innerHTML += '<div class="ai-msg loading" id="ai-loading-'+qId+'">AI正在思考...</div>';
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* 构造题目上下文 */
  var allQuestions = quizData.concat(aiQuizData);
  var q = allQuestions.find(function(x) { return x.id === qId; });
  var questionContext = '';
  if (q) {
    questionContext = '当前题目信息：\n';
    questionContext += '科目：' + (SUBJECT_CONFIG[currentSubject] ? SUBJECT_CONFIG[currentSubject].name : '') + '\n';
    questionContext += '章节：' + (q.chapter || '') + '\n';
    questionContext += '题型：' + (TYPE_META[q.type] ? TYPE_META[q.type].label : q.type) + '\n';
    questionContext += '题目：' + (q.question || q.text || '') + '\n';
    if (q.options) questionContext += '选项：' + q.options.map(function(o,i){return 'ABCDEFGH'[i]+'.'+o;}).join('  ') + '\n';
    if (q.answer) questionContext += '正确答案：' + q.answer + '\n';
    if (q.formula) questionContext += '公式：' + q.formula + '\n';
    if (q.steps) questionContext += '解题步骤：' + q.steps.join(' → ') + '\n';
    if (q.blanks) questionContext += '填空答案：' + q.blanks.map(function(b){return (typeof b==='string')?b:(b.answer||'');}).join('、') + '\n';
    if (q.referenceAnswer) questionContext += '参考答案：' + q.referenceAnswer + '\n';
    if (q.explanation) questionContext += '解析：' + q.explanation + '\n';
  }

  /* 构造消息列表 */
  var messages = [{ role: 'system', content: '你是一个专业的学习助手。用户正在做练习题，请基于题目内容回答用户的疑问。要求：1.解答清晰易懂 2.给出涉及的知识点 3.不要直接给出答案，引导用户思考（除非用户明确要求看答案）\n\n' + questionContext }];
  aiHelpHistory[qId].forEach(function(m) {
    messages.push({ role: m.role, content: m.content });
  });

  /* 调用AI */
  AIChat.chat({
    messages: messages,
    maxTokens: 1500,
    onDone: function(content) {
      if (!content || !content.trim()) {
        content = 'AI 返回了空内容';
      }
      var loading = document.getElementById('ai-loading-' + qId);
      if (loading) loading.remove();
      aiHelpHistory[qId].push({ role: 'assistant', content: content });
      if (msgs) {
        msgs.innerHTML += '<div class="ai-msg assistant">'+AIChat.formatText(content)+'</div>';
        msgs.scrollTop = msgs.scrollHeight;
      }
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
      saveAIHelpConversation(qId);
    },
    onError: function(err) {
      var loading = document.getElementById('ai-loading-' + qId);
      if (loading) loading.remove();
      if (msgs) {
        msgs.innerHTML += '<div class="ai-msg assistant error">⚠️ '+esc(AIChat.formatError(err))+'，请重试</div>';
        msgs.scrollTop = msgs.scrollHeight;
      }
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  });
}

function renderCardWithAIActions(q) {
  var html = renderCard(q);
  if (q.src === 'ai') {
    var bookmarked = q._bookmarked ? ' done' : '';
    var bookmarkText = q._bookmarked ? '⭐ 已收藏' : '⭐ 收藏';
    var cardBadge = q.cardId ? 'AI生成 · 来源：卡片' + q.cardId : 'AI生成';
    var actions = '<div class="card-badge-row">' +
      '<span class="card-badge ai">🤖 ' + cardBadge + '</span>' +
      '<button class="ai-action-btn ai-action-bookmark' + bookmarked + ' zk-btn-ghost" data-action="ai-bookmark" data-id="' + q.id + '"' + (q._bookmarked ? ' disabled' : '') + '>' + bookmarkText + '</button>' +
      '<button class="ai-action-btn ai-action-delete zk-btn-ghost" data-action="ai-delete" data-id="' + q.id + '">🗑️ 删除</button>' +
      '</div>';
    var pos = html.lastIndexOf('</div>');
    if (pos !== -1) html = html.substring(0, pos) + actions + '</div>';
  }
  return html;
}

function bookmarkAIQuestion(qId) {
  var q = aiQuizData.find(function(x) { return x.id === qId; });
  if (!q || q._bookmarked) return;
  fetch(apiUrl('/api/quiz-bank?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(bank) {
      bank = Array.isArray(bank) ? bank : [];
      var clean = JSON.parse(JSON.stringify(q));
      delete clean._bookmarked;
      clean.id = 'bk-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      clean.src = 'ai-bookmarked';
      bank.push(clean);
      return fetch(apiUrl('/api/quiz-bank'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, data: bank })
      });
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      q._bookmarked = true;
      render();
    })
    .catch(function(err) {
      alert('收藏失败：' + (err.message || '网络错误'));
    });
}

function deleteAIQuestion(qId) {
  aiQuizData = aiQuizData.filter(function(q) { return q.id !== qId; });
  delete results[qId];
  render();
}

function render() {
  var list = document.getElementById('quizList');
  var filtered;

  /* AI出题模式 */
  if (currentMode === 'ai') {
    if (aiLoading) {
      list.innerHTML = '<div class="ai-loading">' +
        '<div class="ai-loading-spinner"></div>' +
        '<div class="ai-loading-text">AI正在出题...</div>' +
        '<div class="ai-loading-sub">正在分析背诵卡内容 · 生成5道结构化题目</div>' +
        '</div>';
      var sb0 = document.getElementById('sessionBar');
      if (sb0) sb0.classList.remove('zk-show');
      return;
    }
    if (aiQuizData.length === 0) {
      var chapterInfo = todayChapters.length > 0 ? '本周章节：' + todayChapters.join('、') : '全部章节';
      list.innerHTML = '<div class="empty-state">' +
        '<div class="ai-gen-header">🤖 AI出题</div>' +
        '<div class="ai-gen-info">' + chapterInfo + ' · 根据背诵卡内容生成5道题</div>' +
        '<button data-action="generate-ai" class="ai-gen-btn zk-btn-primary">🤖 生成5道题</button>' +
        '</div>';
      var sb1 = document.getElementById('sessionBar');
      if (sb1) sb1.classList.remove('zk-show');
      return;
    }
    filtered = getFilteredQuiz();
    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state">该筛选条件下暂无AI题目</div>';
      var sb2 = document.getElementById('sessionBar');
      if (sb2) sb2.classList.remove('zk-show');
      return;
    }
    list.innerHTML = filtered.map(function(q, i) {
      var html = renderCardWithAIActions(q);
      return html.replace('class="quiz-meta">', 'class="quiz-meta"><span class="quiz-num">#' + (i+1) + '</span>');
    }).join('');
    updateSessionAndStats(filtered);
    renderQuizNav();
    return;
  }

  /* 三层筛选：知识点 + 题型 + 状态 */
  filtered = getFilteredQuiz();
  /* URL参数过滤（从背诵卡跳转） */
  if (chapterParam) filtered = filtered.filter(function(q) { return q.chapter === chapterParam; });
  if (questionIdParam) filtered = filtered.filter(function(q) { return q.id === questionIdParam; });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">该筛选条件下暂无题目</div>';
    var sb = document.getElementById('sessionBar');
    if (sb) sb.classList.remove('zk-show');
    return;
  }
  list.innerHTML = filtered.map(function(q, i) {
    var html = renderCard(q);
    return html.replace('class="quiz-meta">', 'class="quiz-meta"><span class="quiz-num">#' + (i+1) + '</span>');
  }).join('');
  updateSessionAndStats(filtered);
  renderQuizNav();
}

function switchType(type) {
  currentTypeFilter = type;
  saveFilterState();
  renderTypeFilter();
  updateFilterCount();
  render();
}


/* ====== MODE / STUDY PLAN ====== */

function loadStudyPlan(callback) {
  fetch(apiUrl('/api/study-plan'), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var weeks = data && data.weeks ? data.weeks : [];
      var currentWeek = null;
      for (var i = 0; i < weeks.length; i++) {
        if (weeks[i].isCurrent) { currentWeek = weeks[i]; break; }
      }
      todayChapters = [];
      if (currentWeek && currentWeek.goals) {
        var subjectName = SUBJECT_NAME_MAP[currentSubject];
        for (var j = 0; j < currentWeek.goals.length; j++) {
          var g = currentWeek.goals[j];
          if (g.subject === subjectName && g.chapter) {
            todayChapters.push(g.chapter);
          }
        }
      }
      if (callback) callback();
    })
    .catch(function() {
      todayChapters = [];
      if (callback) callback();
    });
}

function getTodayFiltered() {
  if (todayChapters.length === 0) return [];
  return quizData.filter(function(q) {
    if (!q.chapter) return false;
    return todayChapters.some(function(tc) { return q.chapter === tc || q.chapter.indexOf(tc + ' ') === 0; });
  });
}

function updateModeHint() {
  var hint = document.getElementById('modeHint');
  if (!hint) return;
  if (currentMode === 'ai') {
    hint.className = 'mode-hint zk-show';
    hint.classList.add('ai');
    hint.textContent = '🤖 AI出题 · 根据背诵卡内容生成5道结构化题目';
  } else {
    hint.className = 'mode-hint';
    hint.classList.remove('ai');
  }
}

function switchMode(mode) {
  if (mode !== 'ai') return;
  currentMode = 'ai';
  currentChapterFilter = 'all';
  currentTypeFilter = 'all';
  currentStatusFilter = 'all';
  currentSourceFilter = 'all';
  currentKeywordFilter = 'all';
  var todayBtn = document.getElementById('todayBtn');
  var aiBtn = document.getElementById('aiBtn');
  if (todayBtn) todayBtn.classList.remove('zk-active');
  if (aiBtn) aiBtn.classList.add('zk-active');
  saveFilterState(); renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); renderSourceFilter(); renderKeywordFilter(); updateFilterCount();
  updateModeHint();
  updateChrome(mode);
  render();
}

function updateChrome(mode) {
  var statsMini = document.getElementById('statsMini');
  var sb = document.getElementById('sessionBar');
  if (statsMini) statsMini.classList.toggle('zk-hidden', mode === 'ai' || mode === 'weak');
  if (sb) {
    sb.classList.remove('mode-normal', 'mode-weak', 'mode-ai');
    if (mode === 'weak') sb.classList.add('mode-weak');
    else if (mode === 'ai') sb.classList.add('mode-ai');
    else sb.classList.add('mode-normal');
  }
}

/* ====== AI 出题 ====== */
var aiQuizData = [];
var aiLoading = false;


function generateAIQuestions() {
  if (aiLoading) return;
  aiLoading = true;
  render();

  var subjectName = SUBJECT_CONFIG[currentSubject].name;
  var chapterList = todayChapters.length > 0 ? todayChapters.join('、') : '全部章节';

  /* 1. 从知识框架 JSON 获取知识点内容并转换为卡片 */
  var kfUrl = apiUrl('/data/knowledge-framework-' + currentSubject + '.json');
  fetch(kfUrl, { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var cards = transformKfToCards(data);
      if (cards.length === 0) {
        throw new Error('该科目暂无知识点内容，无法生成题目');
      }
      /* 筛选今日章节卡片（前缀匹配，兼容"第1章"和"第1章 标题"），或全量 */
      var targetCards = todayChapters.length > 0
        ? cards.filter(function(c) {
            return c.chapter && todayChapters.some(function(tc) { return c.chapter.indexOf(tc) >= 0; });
          })
        : cards;
      if (targetCards.length === 0) targetCards = cards.slice(0, 5);

      /* 2. 构造 prompt */
      var cardText = targetCards.slice(0, 8).map(function(c, i) {
        var parts = ['卡片' + (i+1) + '：' + (c.question || '')];
        if (c.def) parts.push('定义：' + c.def);
        if (c.ex) parts.push('举例：' + c.ex);
        if (c.exam) parts.push('考点：' + c.exam);
        if (c.formula) parts.push('公式：' + c.formula);
        if (c.steps) parts.push('步骤：' + c.steps.join('；'));
        return parts.join('\n');
      }).join('\n\n');

      var config = SUBJECT_CONFIG[currentSubject];
      var typeList = config.types.map(function(t) { return t + '(' + TYPE_META[t].label + ')'; }).join('、');
      var prompt = '你是自考出题专家。根据以下知识点生成5道练习题。\n\n' +
        '科目：' + subjectName + '\n' +
        '章节：' + chapterList + '\n' +
        '可用题型（type字段必须用英文key）：' + typeList + '\n\n' +
        '知识点内容：\n' + cardText + '\n\n' +
        '要求：\n' +
        '1. 生成5道题，题型尽量覆盖：2道选择题+1道填空题+1道计算题+1道简答题\n' +
        '2. 每题的type字段必须使用英文key：choice(选择题)、fill(填空题)、calculate(计算题)、shortAnswer(简答题)、essay(论述题)、proof(证明题)\n' +
        '3. 选择题包含options数组（4个选项）和answer（正确选项字母如A）\n' +
        '4. 填空题包含text字段（题目中用___表示空格）和blanks数组（各空答案）\n' +
        '5. 计算题包含formula、steps数组、answer和answerAliases数组\n' +
        '6. 简答题包含points数组（每项含point和synonyms）、referenceAnswer和passThreshold\n' +
        '7. 每题包含chapter、question、explanation字段\n' +
        '8. 严格返回JSON数组格式，不要有其他文字\n' +
        '9. 每题加src字段值为"ai"，cardId字段填写对应知识点卡片的序号（1、2、3...，对应上面给出的卡片编号）';

      /* 3. 调用 AI API */
      return AIChat.ask({
        prompt: prompt,
        maxTokens: 3000
      });
    })
    .then(function(content) {
      var questions = parseAIQuestions(content);
      if (questions.length === 0) {
        throw new Error('AI返回格式解析失败，请重试');
      }

      var TYPE_ALIAS = {
        '单选题':'choice','多选题':'choice','选择题':'choice',
        '填空题':'fill','填空':'fill',
        '计算题':'calculate','计算':'calculate',
        '简答题':'shortAnswer','简答':'shortAnswer',
        '论述题':'essay','论述':'essay',
        '证明题':'proof','证明':'proof'
      };
      questions.forEach(function(q, i) {
        if (q.type && TYPE_ALIAS[q.type]) q.type = TYPE_ALIAS[q.type];
        q.id = 'ai-' + Date.now() + '-' + i;
        q.src = 'ai';
        if (!q.cardId) q.cardId = null;
      });

      aiQuizData = questions;
      aiLoading = false;
      render();
    })
    .catch(function(err) {
      aiLoading = false;
      var list = document.getElementById('quizList');
      if (list) {
        list.innerHTML = '<div class="empty-state">⚠️ AI出题失败：' + AIChat.formatError(err) + '<br><button data-action="generate-ai" class="ai-retry-btn zk-btn-outline">重试</button></div>';
      }
    });
}

function parseAIQuestions(content) {
  if (!content) return [];
  /* 尝试直接 JSON.parse */
  var text = content.trim();
  /* 去除可能的 markdown 代码块 */
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  /* 找 JSON 数组起始 */
  var start = text.indexOf('[');
  var end = text.lastIndexOf(']');
  if (start >= 0 && end > start) {
    text = text.substring(start, end + 1);
  }
  try {
    var arr = JSON.parse(text);
    if (Array.isArray(arr)) return arr;
    if (arr && typeof arr === 'object') return [arr];
  } catch(e) {}
  /* 尝试逐题提取 */
  var questions = [];
  var pattern = /\{[^{}]*\}/g;
  var match;
  while ((match = pattern.exec(text)) !== null) {
    try {
      var obj = JSON.parse(match[0]);
      if (obj.question || obj.type) questions.push(obj);
    } catch(e) {}
  }
  return questions;
}

/* ====== INIT ====== */

function init() {
  var config = SUBJECT_CONFIG[currentSubject];
  if (!config) { currentSubject = '13015'; config = SUBJECT_CONFIG[currentSubject]; }
  document.title = config.name + ' - 练习测验';
  document.getElementById('pageTitle').textContent = config.name + ' · 练习测验';
  var tag = document.getElementById('subjectTag');
  if (tag) tag.textContent = config.name;
  if (fromRecite || questionIdParam) {
    currentMode = 'free';
  }
  renderTypeFilter();
  renderChapterFilter();
  renderStatusFilter();
  renderSourceFilter();
  renderKeywordFilter();
  /* 并行加载学习计划、题库、答题记录，三者就绪后再渲染 */
  var planDone = false, bankDone = false, recordsDone = false;
  var pendingRecords = [];
  function finalize() {
    if (!planDone || !bankDone || !recordsDone) return;
    /* 题库就绪后，用 pendingRecords 重构 details */
    /* 构建单条记录的 result 对象工具函数 */
    function buildResultFromRecord(rec) {
      var q = quizData.find(function(x) { return x.id === rec.questionId; });
      var details = '';
      if (q && rec.userAnswer) {
        if (q.type === 'choice') {
          details = { isCorrect: rec.isCorrect, userAnswer: rec.userAnswer, correctAnswer: q.answer || '' };
        } else if (q.type === 'fill' && q.blanks) {
          var userArr = rec.userAnswer.split(' | ');
          details = { hits: q.blanks.map(function(b, i) {
            var bAns = (typeof b === 'string') ? b : (b.answer || '');
            return { idx: i, userAnswer: userArr[i] || '', correctAnswer: bAns, matched: (userArr[i] || '').indexOf(bAns) >= 0 };
          })};
        } else if (q.type === 'calculate') {
          details = { isCorrect: rec.isCorrect, userAnswer: rec.userAnswer || '' };
        } else if ((q.type === 'shortAnswer' || q.type === 'essay') && q.points) {
          details = { userAnswer: rec.userAnswer || '', hits: q.points.map(function(p) {
            var matched = false; var matchedTerm = null;
            var ua = rec.userAnswer.toLowerCase();
            var candidates = [p.point].concat(p.synonyms || []);
            for (var c = 0; c < candidates.length; c++) {
              if (candidates[c] && ua.indexOf(candidates[c].toLowerCase()) >= 0) { matched = true; matchedTerm = candidates[c]; break; }
            }
            return { point: p.point, synonyms: p.synonyms || [], matched: matched, matchedTerm: matchedTerm, weight: p.weight || 1 };
          })};
        } else if (q.type === 'proof' && q.steps) {
          details = { userAnswer: rec.userAnswer || '', hits: q.steps.map(function(s) {
            var matched = false; var matchedTerm = null;
            var ua = rec.userAnswer.toLowerCase();
            var keywords = s.keywords || [];
            for (var k = 0; k < keywords.length; k++) {
              if (keywords[k] && ua.indexOf(keywords[k].toLowerCase()) >= 0) { matched = true; matchedTerm = keywords[k]; break; }
            }
            return { desc: s.desc, keywords: keywords, matched: matched, matchedTerm: matchedTerm, hint: s.hint || '' };
          })};
        }
      }
      return {
        score: rec.score || 0,
        total: rec.total || 1,
        level: rec.level || 'unknown',
        details: details,
        selfOverride: null,
        wrongReason: rec.wrongReason || ''
      };
    }
    /* 第一步：应用服务端记录（追加式：同题取最新一条） */
    allRecords = pendingRecords.slice();
    var latestByQid = {};
    pendingRecords.forEach(function(rec) {
      if (!rec.questionId) return;
      var prev = latestByQid[rec.questionId];
      if (!prev || (rec.timestamp && prev.timestamp && rec.timestamp > prev.timestamp)) {
        latestByQid[rec.questionId] = rec;
      }
    });
    Object.keys(latestByQid).forEach(function(qid) {
      results[qid] = buildResultFromRecord(latestByQid[qid]);
    });
    pendingRecords = [];
    /* 第二步：用 localStorage 待重传记录覆盖（本地记录更新，优先级更高） */
    var localPending = getPendingRecords();
    localPending.forEach(function(p) {
      if (!p.record || !p.record.questionId) return;
      results[p.record.questionId] = buildResultFromRecord(p.record);
    });
    /* 第三步：合并 localStorage 待重传错因（错因是独立更新的，也要覆盖） */
    var localWrPending = getPendingWrongReasons();
    localWrPending.forEach(function(w) {
      if (!w.questionId) return;
      if (!results[w.questionId]) {
        /* 只有错因而没有答题记录的情况，创建一个占位 result */
        results[w.questionId] = {
          score: 0, total: 1, level: 'unknown', details: '', selfOverride: null, wrongReason: ''
        };
      }
      results[w.questionId].wrongReason = w.wrongReason || '';
    });
    /* 初始化筛选器和今日任务 */
    renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); renderSourceFilter(); renderKeywordFilter();
    if (currentMode !== 'free') {
      /* 尝试恢复保存的筛选状态（localStorage + API 双写） */
      loadFilterState(function(saved) {
        if (saved && saved.mode && saved.mode !== 'ai') {
          currentMode = saved.mode;
          currentChapterFilter = saved.chapter || 'all';
          currentTypeFilter = saved.type || 'all';
          currentStatusFilter = saved.status || 'all';
          currentSourceFilter = saved.source || 'all';
          currentKeywordFilter = saved.keyword || 'all';
          if (currentChapterFilter !== 'all') {
            var chExists = quizData.some(function(q) { return (q.chapter || '') === currentChapterFilter; });
            if (!chExists) currentChapterFilter = 'all';
          }
          if (currentTypeFilter !== 'all') {
            var tpExists = quizData.some(function(q) { return q.type === currentTypeFilter; });
            if (!tpExists) currentTypeFilter = 'all';
          }
          applyModeUI();
          renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); renderSourceFilter(); renderKeywordFilter();
          updateFilterCount();
          render();
        } else {
          activateToday();
        }
      });
    } else {
      updateFilterCount();
      updateChrome(currentMode);
      render();
    }
    updateModeHint();
    /* 重传本地保存的失败记录 + 错因 + 照片（网络恢复后自动补同步） */
    flushPendingRecords().then(function() {
      return flushPendingWrongReasons();
    }).then(function() {
      return flushPendingPhotos();
    });
    /* 从服务端拉取照片（跨设备同步：手机拍照 → 电脑查看） */
    syncPhotosFromServer().then(function() {
      if (typeof render === 'function') render();
    });
    /* 启动后台自动同步（每 15 秒 + 页面可见时重试） */
    startAutoSync();
    if (questionIdParam) {
      setTimeout(function() {
        var card = document.getElementById('card-' + questionIdParam);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }
  loadStudyPlan(function() { planDone = true; finalize(); });
  fetch(apiUrl('/api/quiz-bank?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      quizData = Array.isArray(data) ? data : [];
      bankDone = true;
      finalize();
    })
    .catch(function() {
      quizData = [];
      bankDone = true;
      finalize();
    });
  /* 加载已答题记录（先存储，等题库就绪后在 finalize 中处理） */
  fetch(apiUrl('/api/quiz-records?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(records) {
      pendingRecords = Array.isArray(records) ? records : [];
      recordsDone = true;
      finalize();
    })
    .catch(function() {
      recordsDone = true;
      finalize();
    });
  /* 加载手动标记错题 */
  fetch(apiUrl('/api/wrong-marked?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) { markedMap = data || {}; })
    .catch(function() { markedMap = {}; });

  /* 加载做题技巧数据 */
  fetch(apiUrl('/api/study-tips?subject=' + currentSubject), { cache: 'no-cache' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      tipList = data.tips || [];
      tipExampleMap = {};
      tipList.forEach(function(tip) {
        (tip.examples || []).forEach(function(qid) {
          if (!tipExampleMap[qid]) tipExampleMap[qid] = [];
          tipExampleMap[qid].push(tip.id);
        });
      });
      render();
    })
    .catch(function() { tipList = []; tipExampleMap = {}; });
}

/* 统一 data-action 事件委托 */
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  var id = el.dataset.id || el.dataset.qid;

  switch (action) {
    case 'select-option':
      toggleChoiceOption(el.dataset.qid, el.dataset.letter);
      break;
    case 'submit-choice':
      submitChoice(id);
      break;
    case 'submit-fill':
      submitFill(id);
      break;
    case 'submit-text':
      submitText(id);
      break;
    case 'ai-help':
      toggleAIHelp(id);
      break;
    case 'ai-send':
      sendAIHelp(id);
      break;
    case 'toggle-symbols':
      toggleSymbols(id);
      break;
    case 'insert-symbol':
      insertSymbol(id, el.dataset.symbol);
      break;
    case 'self-assess':
      selfEval(id, el.dataset.level);
      break;
    case 'toggle-marked':
      markedMap[id] = !markedMap[id];
      fetch(apiUrl('/api/wrong-marked'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, questionId: id, marked: markedMap[id] })
      }).catch(function() {});
      render();
      break;
    case 'toggle-tip-example':
      toggleTipExample(id);
      break;
    case 'toggle-wr-edit':
      toggleWrongReasonEdit(id);
      break;
    case 'save-wr':
      saveWrongReason(id);
      break;
    case 'cancel-wr':
      cancelWrongReason(id);
      break;
    case 'take-photo':
      document.getElementById('photo-input-' + id).click();
      break;
    case 'open-photo':
      window.open(el.src, '_blank');
      break;
    case 'toggle-ref':
      toggleRef(id);
      break;
    case 'toggle-history':
      var histPanel = document.getElementById('hist-' + id);
      if (histPanel) histPanel.style.display = histPanel.style.display === 'none' ? '' : 'none';
      break;
    case 'redo':
      redoQuestion(id);
      break;
    case 'ai-bookmark':
      bookmarkAIQuestion(id);
      break;
    case 'ai-delete':
      deleteAIQuestion(id);
      break;
    case 'generate-ai':
      generateAIQuestions();
      break;
    case 'toggle-quiz-nav':
      toggleQuizNav();
      break;
    case 'quiz-nav-jump':
      quizNavJump(id);
      break;
  }
});

/* AI输入框回车发送 */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  var el = e.target.closest('[data-action="ai-input"]');
  if (el) sendAIHelp(el.dataset.id);
});

/* 文件上传 change 事件 */
document.addEventListener('change', function(e) {
  var el = e.target.closest('[data-action="upload-photo"]');
  if (el && el.files && el.files[0]) uploadQuizPhoto(el.dataset.id, el.files[0]);
});

(window.examDataReady || Promise.resolve()).then(function() { init(); });


/* ====== 浮动题号导航面板 ====== */
function renderQuizNav() {
  var panel = document.getElementById('quizNavPanel');
  if (!panel || panel.classList.contains('collapsed')) return;

  var filtered = getFilteredQuiz();
  if (chapterParam) filtered = filtered.filter(function(q) { return q.chapter === chapterParam; });
  if (questionIdParam) filtered = filtered.filter(function(q) { return q.id === questionIdParam; });

  if (filtered.length === 0) {
    panel.innerHTML = '<div class="quiz-nav-header"><span class="quiz-nav-count">无题目</span>' +
      '<button class="quiz-nav-toggle" data-action="toggle-quiz-nav">▾</button></div>';
    return;
  }

  var answered = 0;
  var items = filtered.map(function(q, i) {
    var r = results[q.id];
    var level = r ? getCurrentLevel(q.id) : null;
    var cls = 'unanswered';
    if (level === 'mastered') { cls = 'answered'; answered++; }
    else if (level === 'unknown') { cls = 'wrong'; answered++; }
    else if (level === 'unsure') { cls = 'unsure'; answered++; }
    else if (r) { cls = 'answered'; answered++; }

    var title = (q.chapter || '') + ' · ' + (q.type || '');
    return '<div class="quiz-nav-item ' + cls + '" data-action="quiz-nav-jump" data-id="' + q.id + '" title="' + title + '">' + (i + 1) + '</div>';
  }).join('');

  panel.innerHTML =
    '<div class="quiz-nav-header">' +
      '<span class="quiz-nav-count">已答 ' + answered + '/' + filtered.length + '</span>' +
      '<button class="quiz-nav-toggle" data-action="toggle-quiz-nav">▾</button>' +
    '</div>' +
    '<div class="quiz-nav-grid">' + items + '</div>';
}

function quizNavJump(qId) {
  var card = document.getElementById('card-' + qId);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.transition = 'box-shadow 0.3s';
    card.style.boxShadow = '0 0 0 3px var(--accent)';
    setTimeout(function() { card.style.boxShadow = ''; }, 1000);
  }
}

function toggleQuizNav() {
  var panel = document.getElementById('quizNavPanel');
  if (!panel) return;
  panel.classList.toggle('collapsed');
  if (!panel.classList.contains('collapsed')) {
    renderQuizNav();
  } else {
    panel.innerHTML = '<button class="quiz-nav-collapsed-btn" data-action="toggle-quiz-nav">📋</button>';
  }
}
