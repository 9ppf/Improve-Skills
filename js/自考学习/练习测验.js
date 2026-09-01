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
  '13015': { name: '计算机系统原理', types: ['choice','fill','calculate','shortAnswer','essay'] },
  '02324': { name: '离散数学', types: ['choice','fill','calculate','proof'] },
  '13003': { name: '数据结构与算法', types: ['choice','fill','calculate','shortAnswer','essay'] }
};
var TYPE_META = {
  choice: { label: '选择题', icon: '📋', badge: 'badge-choice' },
  fill: { label: '填空题', icon: '✏️', badge: 'badge-fill' },
  calculate: { label: '计算题', icon: '🧮', badge: 'badge-calculate' },
  shortAnswer: { label: '简答题', icon: '📝', badge: 'badge-shortAnswer' },
  essay: { label: '论述题', icon: '📖', badge: 'badge-essay' },
  proof: { label: '证明题', icon: '🔬', badge: 'badge-proof' }
};
var QUIZ_SYMBOLS = ['×','÷','=','≠','≈','≤','≥','<','>','±','²','³','ⁿ','√','π','Σ','∞','%','①','②','③','④','⑤','⑥','⑦','⑧','α','β','γ','δ','θ','λ','μ','σ','φ','ψ','ω','Δ','¬','∧','∨','→','↔','⊕','⊢','⇔','∀','∃','∈','∪','∩','⊆','⊇','∅','≡','P','Q','R','S','T','F','0','1'];

var API_BASE = (location.protocol === 'file:') ? 'http://localhost:8000' : '';
function apiUrl(path) { return API_BASE + path; }

var urlParams = new URLSearchParams(window.location.search);
var currentSubject = urlParams.get('subject') || '13015';
var fromRecite = urlParams.get('from') === 'recite';
var chapterParam = urlParams.get('chapter') || '';
var questionIdParam = urlParams.get('questionId') || '';
var currentTypeFilter = 'all';
var currentChapterFilter = 'all';     /* 章节筛选 */
var currentStatusFilter = 'all'; /* 状态筛选：all/undone/wrong/right */
var quizData = [];
var results = {};

/* Subject code -> study-plan 中文名映射 */
var SUBJECT_NAME_MAP = { '13015': '系统原理', '02324': '离散数学', '13003': '数据结构' };
var currentMode = 'today';        /* 'today' | 'ai' */
var todayChapters = [];           /* 本周计划中当前科目的章节列表 */

/* ====== 筛选状态持久化（按科目存 localStorage）====== */
function saveFilterState() {
  try {
    localStorage.setItem('quiz-filter-' + currentSubject, JSON.stringify({
      mode: currentMode,
      chapter: currentChapterFilter,
      type: currentTypeFilter,
      status: currentStatusFilter
    }));
  } catch(e) {}
}

function loadFilterState() {
  try {
    var saved = localStorage.getItem('quiz-filter-' + currentSubject);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch(e) { return null; }
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
function uploadQuizPhoto(qId) {
  var input = document.getElementById('photo-input-' + qId);
  if (!input || !input.files || !input.files[0]) return;
  compressImage(input.files[0], function(dataURL) {
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

/* 渲染照片缩略图（点击新窗口查看原图） */
function renderQuizPhoto(qId) {
  var photo = loadPhoto(qId);
  if (!photo) return '';
  return '<div class="quiz-photo zk-show"><div class="quiz-photo-label">📷 我的拍照</div>' +
    '<img src="'+photo+'" class="quiz-photo-img" onclick="window.open(this.src, \'_blank\')"/></div>';
}

function normalize(str) {
  if (!str) return '';
  return str.replace(/\s+/g, '').replace(/[，。、；：""''（）\(\)\[\]\{\}]/g, '').toLowerCase();
}

function getLevel(score, total, passThreshold) {
  if (score >= passThreshold) return 'mastered';
  if (score >= Math.ceil(passThreshold * 0.5)) return 'unsure';
  return 'unknown';
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
      session: currentMode === 'today' ? 'today-task' : 'free-practice'
    };
    var payload = { subject: currentSubject, record: record };
    // 先写本地 localStorage（防止页面被 reload 时连兜底都来不及执行）
    var pending = getPendingRecords();
    pending = pending.filter(function(p) { return p.record.questionId !== record.questionId; });
    pending.push(payload);
    setPendingRecords(pending);
    // 再异步发请求，成功则清本地
    fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var cur = getPendingRecords();
      var before = cur.length;
      cur = cur.filter(function(p) { return p.record.questionId !== record.questionId; });
      if (cur.length !== before) setPendingRecords(cur);
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
  // 逐个重传，成功就从队列里移除，返回 Promise 以便链式调用
  var promises = pending.map(function(payload) {
    return fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (r.ok) {
        var remaining = getPendingRecords().filter(function(p) {
          return p.record.questionId !== payload.record.questionId;
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

/* ====== SCORERS ====== */

function scoreChoice(q, userSelection) {
  var correct = q.answer;
  var isCorrect = false;
  if (q.subType === 'multi') {
    var userSet = (userSelection || '').split('').sort().join('');
    var correctSet = correct.split('').sort().join('');
    isCorrect = userSet === correctSet;
  } else {
    // 默认按单选题处理（subType 为 'single'、'judge' 或未定义）
    isCorrect = userSelection === correct;
  }
  return {
    score: isCorrect ? 1 : 0, total: 1,
    level: isCorrect ? 'mastered' : 'unknown',
    details: { isCorrect: isCorrect, userAnswer: userSelection, correctAnswer: correct }
  };
}

function scoreFill(q, userAnswers) {
  var hits = [], hitCount = 0;
  q.blanks.forEach(function(b, i) {
    var ua = normalize(userAnswers[i] || '');
    var allTerms = [b.answer].concat(b.synonyms || []);
    var matched = false;
    for (var j=0; j<allTerms.length; j++) {
      if (ua.indexOf(normalize(allTerms[j])) >= 0) { matched = true; break; }
    }
    hits.push({ idx: i, userAnswer: userAnswers[i]||'', correctAnswer: b.answer, matched: matched });
    if (matched) hitCount++;
  });
  var threshold = Math.ceil(q.blanks.length * 0.6);
  return {
    score: hitCount, total: q.blanks.length,
    level: getLevel(hitCount, q.blanks.length, threshold),
    details: { hits: hits }
  };
}

function scoreCalculate(q, userAnswer) {
  var normUser = normalize(userAnswer);
  var allTerms = [q.answer].concat(q.answerAliases || []);
  var matched = false;
  for (var i=0; i<allTerms.length; i++) {
    var normTerm = normalize(allTerms[i]);
    if (!normTerm) continue;
    if (normUser === normTerm || normUser.indexOf(normTerm) >= 0 || normTerm.indexOf(normUser) >= 0) { matched = true; break; }
  }
  return {
    score: matched ? 1 : 0, total: 1,
    level: matched ? 'mastered' : 'unknown',
    details: { isCorrect: matched }
  };
}

function scorePointsBased(q, userAnswer) {
  var normUser = normalize(userAnswer);
  var hits = [], totalWeight = 0, hitWeight = 0;
  (q.points || []).forEach(function(p) {
    totalWeight += p.weight || 1;
    var allTerms = [p.point].concat(p.synonyms || []);
    var matched = false, matchedTerm = null;
    for (var i=0; i<allTerms.length; i++) {
      if (normUser.indexOf(normalize(allTerms[i])) >= 0) { matched = true; matchedTerm = allTerms[i]; break; }
    }
    hits.push({ point: p.point, synonyms: p.synonyms||[], matched: matched, matchedTerm: matchedTerm, weight: p.weight||1 });
    if (matched) hitWeight += (p.weight||1);
  });
  return {
    score: hitWeight, total: totalWeight,
    level: getLevel(hitWeight, totalWeight, q.passThreshold || Math.ceil(totalWeight*0.6)),
    details: { hits: hits }
  };
}

function scoreProof(q, userAnswer) {
  var normUser = normalize(userAnswer);
  var hits = [], hitCount = 0;
  (q.steps || []).forEach(function(s) {
    var matched = false, matchedTerm = null;
    for (var i=0; i<(s.keywords||[]).length; i++) {
      if (normUser.indexOf(normalize(s.keywords[i])) >= 0) { matched = true; matchedTerm = s.keywords[i]; break; }
    }
    hits.push({ desc: s.desc, keywords: s.keywords||[], matched: matched, matchedTerm: matchedTerm, hint: s.hint||'' });
    if (matched) hitCount++;
  });
  return {
    score: hitCount, total: (q.steps||[]).length,
    level: getLevel(hitCount, (q.steps||[]).length, q.passThreshold || Math.ceil((q.steps||[]).length*0.6)),
    details: { hits: hits }
  };
}

function scoreQuestion(q, userAnswer, userSelection) {
  switch(q.type) {
    case 'choice': return scoreChoice(q, userSelection);
    case 'fill': return scoreFill(q, userAnswer);
    case 'calculate': return scoreCalculate(q, userAnswer);
    case 'shortAnswer':
    case 'essay': return scorePointsBased(q, userAnswer);
    case 'proof': return scoreProof(q, userAnswer);
    default: return { score:0, total:1, level:'unknown', details:{} };
  }
}

/* ====== RENDERERS ====== */

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* 渲染选项内容：支持 svg: 前缀（内联SVG）、img: 前缀（图片）、纯文本 */
function renderContent(s) {
  s = String(s || '');
  s = s.replace(/^[A-H]\.\s*/, '');
  if (s.indexOf('svg:') === 0) return s.slice(4);
  if (s.indexOf('img:') === 0) return '<img src="' + s.slice(4) + '" style="max-width:100%;border-radius:6px;display:block;margin:4px 0" />';
  return esc(s);
}

function renderSymbolPalette(qId) {
  return '<span class="symbol-toggle" onclick="toggleSymbols(\''+qId+'\')">🔣 特殊符号</span>' +
    '<div class="symbol-palette" id="sym-'+qId+'">' +
    QUIZ_SYMBOLS.map(function(s){ return '<button type="button" class="symbol-btn zk-btn-outline" onclick="insertSymbol(\''+qId+'\',\''+s+'\')">'+s+'</button>'; }).join('') +
    '</div>';
}

function renderSelfEval(qId, label) {
  var r = results[qId];
  var overrideLevel = r ? (r.selfOverride || r.level) : null;
  return '<div class="self-eval zk-show"><div class="self-eval-label">'+label+'</div>' +
    '<div class="self-eval-buttons">' +
    '<button class="self-eval-btn '+(overrideLevel==='mastered'?'quiz-selected':'')+' zk-btn-outline" onclick="selfEval(\''+qId+'\',\'mastered\')">🟢 完全掌握</button>' +
    '<button class="self-eval-btn '+(overrideLevel==='unsure'?'quiz-selected':'')+' zk-btn-outline" onclick="selfEval(\''+qId+'\',\'unsure\')">🟡 部分掌握</button>' +
    '<button class="self-eval-btn '+(overrideLevel==='unknown'?'quiz-selected':'')+' zk-btn-outline" onclick="selfEval(\''+qId+'\',\'unknown\')">🔴 不会</button>' +
    '</div></div>';
}

function renderScoreHeader(qId, q) {
  var r = results[qId];
  var overrideLevel = r.selfOverride || r.level;
  var olt = levelText(overrideLevel);
  var detail = '得分 ' + r.score + '/' + r.total;
  if (q.passThreshold) detail += '（通过线 ' + q.passThreshold + '）';
  if (r.selfOverride) detail += ' · 自评覆盖';
  return '<div class="score-header"><span class="score-badge '+olt.cls+'">'+olt.icon+' '+olt.text+'</span><span class="score-detail">'+detail+'</span></div>';
}

function renderReference(label, content, isProof) {
  if (!content) return '';
  var html = '<div class="reference-answer zk-show"><div class="reference-label">'+label+'</div>';
  if (isProof && Array.isArray(content)) {
    html += content.map(function(line) {
      if (line === '') return '<br>';
      if (line.indexOf('步骤') >= 0 || line.indexOf('结论') >= 0) return '<div class="proof-step">'+esc(line)+'</div>';
      return '<div>'+esc(line)+'</div>';
    }).join('');
  } else {
    html += esc(content);
  }
  html += '</div>';
  return html;
}

function renderUserAnswer(qId) {
  var r = results[qId];
  if (!r || !r.details) return '';
  var ua = r.details.userAnswer || '';
  if (!ua || ua === '📷 照片提交') return '';
  return '<div class="user-answer zk-show"><div class="user-answer-label">✍️ 我的答案</div><div class="user-answer-text">'+esc(ua)+'</div></div>';
}

function renderWrongReason(qId) {
  var r = results[qId];
  if (!r) return '';
  if (r.score >= r.total) return '';
  var existing = r.wrongReason || '';
  var html = '<div class="wrong-reason" id="wr-'+qId+'">';
  if (existing) {
    html += '<div class="wrong-reason-label">📝 错因记录</div>';
    html += '<div class="wrong-reason-text">'+esc(existing)+'</div>';
    html += '<button class="wrong-reason-edit-btn zk-btn-outline" onclick="toggleWrongReasonEdit(\''+qId+'\')">编辑</button>';
  } else {
    html += '<button class="wrong-reason-btn zk-btn-outline" onclick="toggleWrongReasonEdit(\''+qId+'\')">📝 写错因</button>';
  }
  html += '<div class="wrong-reason-editor" id="wr-edit-'+qId+'" style="display:none">';
  html += '<textarea class="wrong-reason-textarea" id="wr-input-'+qId+'" placeholder="记录错因：概念混淆？公式没记住？计算失误？" rows="3">'+esc(existing)+'</textarea>';
  html += '<div class="wrong-reason-actions">';
  html += '<button class="zk-btn-primary" onclick="saveWrongReason(\''+qId+'\')">保存</button>';
  html += '<button class="zk-btn-outline" onclick="cancelWrongReason(\''+qId+'\')">取消</button>';
  html += '</div></div></div>';
  return html;
}

function renderChoiceCard(q) {
  var r = results[q.id];
  var letters = 'ABCDEFGH';
  var subLabel = q.subType==='multi'?'（多选）':q.subType==='judge'?'（判断）':'';
  var optionsHTML = q.options.map(function(opt, i) {
    var letter = letters[i];
    var cls = '';
    if (r) {
      cls += ' disabled';
      var userSel = (r.details && r.details.userAnswer) || '';
      var correctAns = (r.details && r.details.correctAnswer) || '';
      if (correctAns.indexOf(letter) >= 0) cls += ' correct';
      else if (userSel.indexOf(letter) >= 0) cls += ' wrong';
      else if (userSel.indexOf(letter) >= 0 && correctAns.indexOf(letter) < 0) cls += ' wrong';
    }
    return '<div class="choice-option'+cls+'" data-letter="'+letter+'" data-qid="'+q.id+'">' +
      '<span class="choice-letter">'+letter+'</span><span class="choice-content">'+renderContent(opt)+'</span></div>';
  }).join('');

  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.choice.badge+'">'+TYPE_META.choice.icon+' 选择题'+subLabel+'</span></div>' +
    '<div class="quiz-question">'+renderContent(q.question)+'</div>' +
    '<div class="choice-options">'+optionsHTML+'</div>' +
    '<div class="submit-row"><button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitChoice(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button><button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button></div>' +
    (r ? '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+(q.explanation?'<div class="reference-answer zk-show"><div class="reference-label">📖 解析</div>'+esc(q.explanation)+'</div>':'')+renderWrongReason(q.id)+'</div>' : '') +
    '</div>';
}

function renderFillCard(q) {
  var r = results[q.id];
  var hasDetails = r && r.details && r.details.hits;
  var blanksHTML = q.blanks.map(function(b, i) {
    var inputVal = hasDetails ? (r.details.hits[i].userAnswer || '') : '';
    var inputCls = '';
    var resultHTML = '';
    if (hasDetails) {
      var hit = r.details.hits[i];
      inputCls = hit.matched ? ' correct' : ' wrong';
      resultHTML = '<span class="fill-blank-result '+(hit.matched?'correct':'wrong')+'">'+(hit.matched?'✅':'❌ '+esc(b.answer))+'</span>';
    }
    return '<div class="fill-blank-row">' +
      '<span class="fill-blank-label">空'+(i+1)+'</span>' +
      '<input type="text" class="fill-blank-input'+inputCls+'" id="fill-'+q.id+'-'+i+'" placeholder="'+(b.hint||'')+'" value="'+esc(inputVal)+'" '+(r?'disabled':'')+'>' +
      resultHTML + '</div>';
  }).join('');

  var compHTML = '';
  if (hasDetails) {
    var rows = r.details.hits.map(function(h) {
      return '<div class="fill-comp-row">' +
        '<span class="fill-comp-cell idx">空'+(h.idx+1)+'</span>' +
        '<span class="fill-comp-cell">'+esc(h.userAnswer||'(空)')+'</span>' +
        '<span class="fill-comp-cell">'+esc(h.correctAnswer)+'</span>' +
        '<span class="fill-comp-cell '+(h.matched?'correct':'wrong')+'">'+(h.matched?'✅':'❌')+'</span>' +
        '</div>';
    }).join('');
    compHTML = '<div class="fill-comparison">' +
      '<div class="fill-comp-row quiz-header"><span class="fill-comp-cell idx">空格</span><span class="fill-comp-cell">你的答案</span><span class="fill-comp-cell">正确答案</span><span class="fill-comp-cell">结果</span></div>' +
      rows + '</div>';
  }

  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.fill.badge+'">'+TYPE_META.fill.icon+' 填空题</span></div>' +
    '<div class="quiz-question">'+esc(q.text||q.question).replace(/__\d+__/g,'____')+'</div>' +
    blanksHTML +
    '<div class="submit-row"><button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitFill(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button><button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button></div>' +
    (r ? '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+compHTML+(q.explanation?'<div class="reference-answer zk-show"><div class="reference-label">📖 解析</div>'+esc(q.explanation)+'</div>':'')+renderWrongReason(q.id)+'</div>' : '') +
    '</div>';
}

function renderCalculateCard(q) {
  var r = results[q.id];
  var photo = loadPhoto(q.id);
  var calcResult = '';
  if (r) {
    var stepsHTML = (q.steps||[]).map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('');
    calcResult = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q) +
      renderQuizPhoto(q.id) +
      renderUserAnswer(q.id) +
      (q.formula?'<div class="calc-formula">📐 '+esc(q.formula)+'</div>':'') +
      (stepsHTML?'<ol class="calc-steps">'+stepsHTML+'</ol>':'') +
      (q.answer?'<span class="calc-answer">答案：'+esc(q.answer)+'</span>':'') +
      renderSelfEval(q.id, '计算题自动评分可能有误差，你觉得实际掌握了吗？') +
      renderWrongReason(q.id) +
      '</div>';
  }
  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.calculate.badge+'">'+TYPE_META.calculate.icon+' 计算题</span></div>' +
    '<div class="quiz-question">'+renderContent(q.question)+'</div>' +
    (q.hint?'<div class="quiz-hint">💡 '+esc(q.hint)+'</div>':'') +
    '<textarea class="answer-textarea" id="input-'+q.id+'" placeholder="输入计算结果..."' +(r?' disabled':'')+'></textarea>' +
    renderSymbolPalette(q.id) +
    '<div class="submit-row">' +
      '<input type="file" accept="image/*" capture="environment" id="photo-input-'+q.id+'" style="display:none" onchange="uploadQuizPhoto(\''+q.id+'\')"/>' +
      '<button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitText(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button>' +
      '<button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button>' +
      (r ? (photo ? '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 重拍</button>' : '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 补拍</button>') : '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 拍照上传</button>') +
    '</div>' +
    calcResult + '</div>';
}

function renderShortAnswerCard(q) {
  var r = results[q.id];
  var scoreHTML = '';
  if (r) {
    if (r.details && r.details.hits) {
    var pointsHTML = r.details.hits.map(function(h) {
      var synHTML = h.synonyms.length > 0
        ? '<div class="point-synonyms">同义词：'+h.synonyms.map(function(s){return '<span class="'+(h.matchedTerm===s?'match':'')+'">'+esc(s)+'</span>';}).join('、')+'</div>'
        : '';
      return '<li class="point-item '+(h.matched?'hit':'miss')+'">' +
        '<span class="point-icon">'+(h.matched?'✅':'⬜')+'</span>' +
        '<div class="point-text"><span class="point-label">'+esc(h.point)+'</span>' +
        (h.matched && h.matchedTerm && h.matchedTerm !== h.point ? ' <span class="match-hint">（命中：'+esc(h.matchedTerm)+'）</span>' : '') +
        synHTML + '</div></li>';
    }).join('');
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderUserAnswer(q.id)+'<ul class="points-list">'+pointsHTML+'</ul>'+
      renderReference('📖 参考答案', q.referenceAnswer) + renderSelfEval(q.id, '简答题评分仅供参考，你觉得实际掌握了吗？') + renderWrongReason(q.id) + '</div>';
    } else {
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderUserAnswer(q.id)+
      renderReference('📖 参考答案', q.referenceAnswer) + renderSelfEval(q.id, '简答题评分仅供参考，你觉得实际掌握了吗？') + renderWrongReason(q.id) + '</div>';
    }
  }
  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.shortAnswer.badge+'">'+TYPE_META.shortAnswer.icon+' 简答题</span></div>' +
    '<div class="quiz-question">'+renderContent(q.question)+'</div>' +
    '<textarea class="answer-textarea" id="input-'+q.id+'" placeholder="输入你的答案..."' +(r?' disabled':'')+'></textarea>' +
    renderSymbolPalette(q.id) +
    '<div class="submit-row"><button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitText(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button><button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button></div>' +
    scoreHTML + '</div>';
}

function renderEssayCard(q) {
  var r = results[q.id];
  var scoreHTML = '';
  if (r) {
    if (r.details && r.details.hits) {
    var pointsHTML = r.details.hits.map(function(h) {
      var synHTML = h.synonyms.length > 0
        ? '<div class="point-synonyms">同义词：'+h.synonyms.map(function(s){return '<span class="'+(h.matchedTerm===s?'match':'')+'">'+esc(s)+'</span>';}).join('、')+'</div>'
        : '';
      return '<li class="point-item '+(h.matched?'hit':'miss')+'">' +
        '<span class="point-icon">'+(h.matched?'✅':'⬜')+'</span>' +
        '<div class="point-text"><span class="point-label">'+esc(h.point)+'</span>' +
        (h.matched && h.matchedTerm && h.matchedTerm !== h.point ? ' <span class="match-hint">（命中：'+esc(h.matchedTerm)+'）</span>' : '') +
        synHTML + '</div></li>';
    }).join('');
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderUserAnswer(q.id)+'<ul class="points-list">'+pointsHTML+'</ul>'+
      renderReference('📖 参考答案', q.referenceAnswer) + renderSelfEval(q.id, '论述题主观性较强，系统评分仅供参考。你觉得实际掌握了吗？') + renderWrongReason(q.id) + '</div>';
    } else {
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderUserAnswer(q.id)+
      renderReference('📖 参考答案', q.referenceAnswer) + renderSelfEval(q.id, '论述题主观性较强，系统评分仅供参考。你觉得实际掌握了吗？') + renderWrongReason(q.id) + '</div>';
    }
  }
  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.essay.badge+'">'+TYPE_META.essay.icon+' 论述题</span></div>' +
    '<div class="quiz-question">'+renderContent(q.question)+'</div>' +
    (q.hint?'<div class="quiz-hint">💡 '+esc(q.hint)+'</div>':'') +
    '<textarea class="answer-textarea lg" id="input-'+q.id+'" placeholder="输入你的论述...（建议 200-400 字）"' +(r?' disabled':'')+'></textarea>' +
    renderSymbolPalette(q.id) +
    '<div class="submit-row"><button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitText(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button><button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button></div>' +
    scoreHTML + '</div>';
}

function renderProofCard(q) {
  var r = results[q.id];
  var photo = loadPhoto(q.id);
  var scoreHTML = '';
  if (r) {
    if (r.details && r.details.hits) {
    var stepsHTML = r.details.hits.map(function(h) {
      return '<li class="point-item '+(h.matched?'hit':'miss')+'">' +
        '<span class="point-icon">'+(h.matched?'✅':'⬜')+'</span>' +
        '<div class="point-text"><span class="point-label">'+esc(h.desc)+'</span>' +
        (h.matched && h.matchedTerm ? ' <span class="match-hint">（命中：'+esc(h.matchedTerm)+'）</span>' : '') +
        (!h.matched ? '<div class="point-desc">期望关键词：'+h.keywords.slice(0,3).map(esc).join('、')+'…</div>' : '') +
        '</div></li>';
    }).join('');
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderQuizPhoto(q.id)+renderUserAnswer(q.id)+'<ul class="points-list">'+stepsHTML+'</ul>'+
      renderReference('📖 参考证明（'+q.method+'）', q.referenceProof, true) + renderSelfEval(q.id, '证明题路径不唯一，系统只检查关键步骤。你觉得证明思路掌握了吗？') + renderWrongReason(q.id) + '</div>';
    } else {
    scoreHTML = '<div class="score-result zk-show">'+renderScoreHeader(q.id,q)+renderQuizPhoto(q.id)+renderUserAnswer(q.id)+
      renderReference('📖 参考证明（'+q.method+'）', q.referenceProof, true) + renderSelfEval(q.id, '证明题路径不唯一，系统只检查关键步骤。你觉得证明思路掌握了吗？') + renderWrongReason(q.id) + '</div>';
    }
  }
  return '<div class="quiz-card '+(r?getCurrentLevel(q.id):'')+'" id="card-'+q.id+'">' +
    '<div class="quiz-meta"><span class="quiz-chapter">'+q.chapter+(q.cardId?' · '+q.cardId:'')+'</span><span class="quiz-badge '+TYPE_META.proof.badge+'">'+TYPE_META.proof.icon+' 证明题</span></div>' +
    '<div class="quiz-question">'+renderContent(q.question)+'</div>' +
    '<div class="method-box"><div class="method-label">📐 规定证明方法：'+esc(q.method)+'</div><div class="method-hint">'+esc(q.methodHint||'')+'</div></div>' +
    '<textarea class="answer-textarea xl" id="input-'+q.id+'" placeholder="按上述方法写出证明过程..."' +(r?' disabled':'')+'></textarea>' +
    renderSymbolPalette(q.id) +
    '<div class="submit-row">' +
      '<input type="file" accept="image/*" capture="environment" id="photo-input-'+q.id+'" style="display:none" onchange="uploadQuizPhoto(\''+q.id+'\')"/>' +
      '<button class="submit-btn '+(r?'done':'')+' zk-btn-primary" onclick="submitText(\''+q.id+'\')" '+(r?'disabled':'')+'>'+(r?'已完成':'提交')+'</button>' +
      '<button class="ai-help-btn zk-btn-outline" onclick="toggleAIHelp(\''+q.id+'\')">🤖 AI解答</button>' +
      (r ? (photo ? '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 重拍</button>' : '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 补拍</button>') : '<button class="photo-upload-btn zk-btn-outline" onclick="document.getElementById(\'photo-input-'+q.id+'\').click()">📷 拍照上传</button>') +
    '</div>' +
    scoreHTML + '</div>';
}

function renderCard(q) {
  switch(q.type) {
    case 'choice': return renderChoiceCard(q);
    case 'fill': return renderFillCard(q);
    case 'calculate': return renderCalculateCard(q);
    case 'shortAnswer': return renderShortAnswerCard(q);
    case 'essay': return renderEssayCard(q);
    case 'proof': return renderProofCard(q);
    default: return '<div class="quiz-card">未知题型: '+q.type+'</div>';
  }
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
  document.querySelectorAll('#card-'+qId+' .choice-option').forEach(function(el) {
    var l = el.dataset.letter;
    var selected = (window.choiceSelections[qId] || '').indexOf(l) >= 0;
    el.classList.toggle('quiz-selected', selected);
  });
}

function submitChoice(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var sel = window.choiceSelections[qId] || '';
  if (!sel) { alert('请先选择答案'); return; }
  var result = scoreChoice(q, sel);
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, null, sel, result);
  updateStats(); render();
}

function submitFill(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var answers = q.blanks.map(function(b, i) {
    var el = document.getElementById('fill-'+qId+'-'+i);
    return el ? el.value.trim() : '';
  });
  if (answers.every(function(a){return !a;})) { alert('请先填写答案'); return; }
  var result = scoreFill(q, answers);
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, answers.join(' | '), null, result);
  updateStats(); render();
}

function submitText(qId) {
  if (results[qId]) return;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (!q) return;
  var ta = document.getElementById('input-'+qId);
  if (!ta) return;
  var ans = ta.value.trim();
  if (!ans) { alert('请先输入答案'); return; }
  var result = scoreQuestion(q, ans, null);
  if (!result.details) result.details = {};
  result.details.userAnswer = ans;
  results[qId] = { score: result.score, total: result.total, level: result.level, details: result.details, selfOverride: null, wrongReason: '' };
  updateMastery(q.chapter, result.level);
  saveQuizRecord(q, ans, null, result);
  updateStats(); render();
}

function selfEval(qId, level) {
  if (!results[qId]) return;
  results[qId].selfOverride = level;
  var q = quizData.find(function(x){return x.id===qId;}) || aiQuizData.find(function(x){return x.id===qId;});
  if (q) updateMastery(q.chapter, level);
  updateStats(); render();
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
  var ta = document.getElementById('input-'+qId);
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

function switchChapter(val) { currentChapterFilter = val; saveFilterState(); renderChapterFilter(); updateFilterCount(); render(); }
function switchStatus(val) { currentStatusFilter = val; saveFilterState(); renderStatusFilter(); updateFilterCount(); render(); }

/* 更新筛选计数 */
function updateFilterCount() {
  var filtered = getFilteredQuiz();
  var el = document.getElementById('filterCount');
  if (el) el.textContent = '显示 ' + filtered.length + ' 题';
}

/* 三层筛选：知识点 + 题型 + 状态 */
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
  saveFilterState(); renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); updateFilterCount(); render();
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
    panel.innerHTML = renderAIHelpPanel(qId);
    card.appendChild(panel);
    /* 聚焦输入框 */
    var input = panel.querySelector('.ai-help-input');
    if (input) input.focus();
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
    '<input type="text" class="ai-help-input" id="ai-input-'+qId+'" placeholder="输入你的问题..." onkeydown="if(event.key===\'Enter\')sendAIHelp(\''+qId+'\')">' +
    '<button class="ai-help-send zk-btn-primary" id="ai-send-'+qId+'" onclick="sendAIHelp(\''+qId+'\')">发送</button>' +
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
    if (q.blanks) questionContext += '填空答案：' + q.blanks.map(function(b){return b.answer;}).join('、') + '\n';
    if (q.referenceAnswer) questionContext += '参考答案：' + q.referenceAnswer + '\n';
    if (q.explanation) questionContext += '解析：' + q.explanation + '\n';
  }

  /* 构造消息列表 */
  var messages = [{ role: 'system', content: '你是一个专业的学习助手。用户正在做练习题，请基于题目内容回答用户的疑问。要求：1.解答清晰易懂 2.给出涉及的知识点 3.不要直接给出答案，引导用户思考（除非用户明确要求看答案）\n\n' + questionContext }];
  aiHelpHistory[qId].forEach(function(m) {
    messages.push({ role: m.role, content: m.content });
  });

  /* 调用AI */
  fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages,
      stream: false,
      max_tokens: 1500
    })
  })
  .then(function(r) {
    if (!r.ok) {
      // HTTP 错误状态，先解析响应体获取错误信息
      return r.json().then(function(errData) {
        var errMsg = (errData && errData.error) ? errData.error : ('HTTP ' + r.status);
        throw new Error(errMsg);
      }).catch(function(parseErr) {
        // 连错误响应都解析失败，直接抛状态码
        throw new Error('HTTP ' + r.status);
      });
    }
    return r.json();
  })
  .then(function(data) {
    var content = '';
    if (data.choices && data.choices[0]) {
      content = data.choices[0].message.content;
    } else if (data.content) {
      content = data.content;
    } else if (typeof data === 'string') {
      content = data;
    }
    if (!content || !content.trim()) {
      throw new Error('AI 返回了空内容');
    }
    /* 移除loading */
    var loading = document.getElementById('ai-loading-' + qId);
    if (loading) loading.remove();
    /* 添加AI回复 */
    aiHelpHistory[qId].push({ role: 'assistant', content: content });
    if (msgs) {
      msgs.innerHTML += '<div class="ai-msg assistant">'+esc(content)+'</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }
    input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  })
  .catch(function(err) {
    var loading = document.getElementById('ai-loading-' + qId);
    if (loading) loading.remove();
    if (msgs) {
      msgs.innerHTML += '<div class="ai-msg assistant error">⚠️ 请求失败：'+esc(err.message||'网络错误')+'，请重试</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }
    input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
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
      '<button class="ai-action-btn ai-action-bookmark' + bookmarked + ' zk-btn-ghost" onclick="bookmarkAIQuestion(\'' + q.id + '\')"' + (q._bookmarked ? ' disabled' : '') + '>' + bookmarkText + '</button>' +
      '<button class="ai-action-btn ai-action-delete zk-btn-ghost" onclick="deleteAIQuestion(\'' + q.id + '\')">🗑️ 删除</button>' +
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
        '<button onclick="generateAIQuestions()" class="ai-gen-btn zk-btn-primary">🤖 生成5道题</button>' +
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
    list.innerHTML = filtered.map(renderCardWithAIActions).join('');
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
  list.innerHTML = filtered.map(renderCard).join('');
  updateSessionAndStats(filtered);
  renderQuizNav();
  if (Object.keys(window.choiceSelections).length > 0) {
    Object.keys(window.choiceSelections).forEach(function(qId) {
      var sel = window.choiceSelections[qId] || '';
      document.querySelectorAll('#card-'+qId+' .choice-option').forEach(function(el) {
        var l = el.dataset.letter;
        if (sel.indexOf(l) >= 0) el.classList.add('quiz-selected');
      });
    });
  }
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
  var todayBtn = document.getElementById('todayBtn');
  var aiBtn = document.getElementById('aiBtn');
  if (todayBtn) todayBtn.classList.remove('zk-active');
  if (aiBtn) aiBtn.classList.add('zk-active');
  saveFilterState(); renderChapterFilter(); renderTypeFilter(); renderStatusFilter(); updateFilterCount();
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
      return fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          max_tokens: 3000
        })
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      /* 4. 解析 AI 返回 */
      var content = '';
      if (data.choices && data.choices[0]) {
        content = data.choices[0].message.content;
      } else if (data.content) {
        content = data.content;
      } else if (typeof data === 'string') {
        content = data;
      }

      var questions = parseAIQuestions(content);
      if (questions.length === 0) {
        throw new Error('AI返回格式解析失败，请重试');
      }

      /* 5. 标准化 type 字段 + 给每题加 id 和来源标签 */
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
        list.innerHTML = '<div class="empty-state">⚠️ AI出题失败：' + (err.message || '网络错误') + '<br><button onclick="generateAIQuestions()" class="ai-retry-btn zk-btn-outline">重试</button></div>';
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
            return { idx: i, userAnswer: userArr[i] || '', correctAnswer: b.answer, matched: (userArr[i] || '').indexOf(b.answer) >= 0 };
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
    /* 第一步：应用服务端记录（只填充不存在的） */
    pendingRecords.forEach(function(rec) {
      if (!rec.questionId || results[rec.questionId]) return;
      results[rec.questionId] = buildResultFromRecord(rec);
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
    renderChapterFilter(); renderTypeFilter(); renderStatusFilter();
    if (currentMode !== 'free') {
      /* 尝试恢复保存的筛选状态 */
      var saved = loadFilterState();
      if (saved && saved.mode) {
        currentMode = saved.mode;
        currentChapterFilter = saved.chapter || 'all';
        currentTypeFilter = saved.type || 'all';
        currentStatusFilter = saved.status || 'all';
        /* 验证保存的章节/题型在当前题库中仍存在 */
        if (currentChapterFilter !== 'all') {
          var chExists = quizData.some(function(q) { return (q.chapter || '') === currentChapterFilter; });
          if (!chExists) currentChapterFilter = 'all';
        }
        if (currentTypeFilter !== 'all') {
          var tpExists = quizData.some(function(q) { return q.type === currentTypeFilter; });
          if (!tpExists) currentTypeFilter = 'all';
        }
        applyModeUI();
        renderChapterFilter(); renderTypeFilter(); renderStatusFilter();
        updateFilterCount();
        render();
      } else {
        activateToday();
      }
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
}

document.addEventListener('click', function(e) {
  var el = e.target.closest('.choice-option');
  if (el && el.dataset.qid) {
    toggleChoiceOption(el.dataset.qid, el.dataset.letter);
  }
});

init();


/* ====== 浮动题号导航面板 ====== */
function renderQuizNav() {
  var panel = document.getElementById('quizNavPanel');
  if (!panel || panel.classList.contains('collapsed')) return;

  var filtered = getFilteredQuiz();
  if (chapterParam) filtered = filtered.filter(function(q) { return q.chapter === chapterParam; });
  if (questionIdParam) filtered = filtered.filter(function(q) { return q.id === questionIdParam; });

  if (filtered.length === 0) {
    panel.innerHTML = '<div class="quiz-nav-header"><span class="quiz-nav-count">无题目</span>' +
      '<button class="quiz-nav-toggle" onclick="toggleQuizNav()">▾</button></div>';
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
    return '<div class="quiz-nav-item ' + cls + '" onclick="quizNavJump(\'' + q.id + '\')" title="' + title + '">' + (i + 1) + '</div>';
  }).join('');

  panel.innerHTML =
    '<div class="quiz-nav-header">' +
      '<span class="quiz-nav-count">已答 ' + answered + '/' + filtered.length + '</span>' +
      '<button class="quiz-nav-toggle" onclick="toggleQuizNav()">▾</button>' +
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
    panel.innerHTML = '<button class="quiz-nav-collapsed-btn" onclick="toggleQuizNav()">📋</button>';
  }
}
