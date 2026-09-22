/**
 * 错题本 — 跨来源错题汇总，支持直接答题
 * 数据源：quiz-bank + exam-data + ai-practice 合并 + quiz-records 筛选 isCorrect=false
 * v2: fix localeCompare on mixed timestamp types + correct API response parsing
 */
(function () {
  'use strict';

  var SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
  };

  var apiUrl = (typeof QuizUtils !== 'undefined') ? QuizUtils.apiUrl : function (p) { return p; };
  var currentSubject = (typeof QuizUtils !== 'undefined') ? QuizUtils.getSubjectFromUrl() : '13015';
  var H = (typeof QuizHelpers !== 'undefined') ? QuizHelpers : null;

  var allQuestions = {};       /* id → 题目对象 */
  var allRecords = [];         /* 全部答题记录 */
  var recordMap = {};          /* questionId → 最新答题记录 */
  var wrongRecords = [];       /* isCorrect=false 的记录 */
  var solvedMap = {};          /* questionId → true（已解决） */

  var selectedOption = {};     /* questionId → 选中字母 */
  var pendingText = {};        /* questionId → 输入文本 */
  var pendingAssess = {};      /* questionId → true（待自评） */
  var expandedSet = {};        /* questionId → true（展开答案） */

  var filters = { source: '', chapter: '', type: '', status: '' };

  /* ====== 数据加载 ====== */
  function loadAllData() {
    var promises = [];

    /* 真题 */
    promises.push(
      window.examDataReady.then(function () {
        var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
        var questions = (examData && examData.questions) || [];
        questions.forEach(function (q) { allQuestions[q.id] = q; });
      })
    );

    /* 练习题库 — API 返回题目数组 */
    promises.push(
      fetch(apiUrl('/api/quiz-bank?subject=' + currentSubject), { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var questions = Array.isArray(data) ? data : (data && data.questions) || [];
          questions.forEach(function (q) { allQuestions[q.id] = q; });
        })
        .catch(function () {})
    );

    /* AI专项题库 — API 返回 batch 数组，每个 batch 有 items */
    promises.push(
      fetch(apiUrl('/api/ai-practice?subject=' + currentSubject), { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var batches = Array.isArray(data) ? data : (data && data.batches) || [];
          batches.forEach(function (batch) {
            var qs = (batch && batch.items) || (batch && batch.questions) || [];
            qs.forEach(function (q) { allQuestions[q.id] = q; });
          });
        })
        .catch(function () {})
    );

    /* 答题记录 */
    promises.push(
      fetch(apiUrl('/api/quiz-records?subject=' + currentSubject), { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (records) {
          allRecords = Array.isArray(records) ? records : [];
        })
        .catch(function () { allRecords = []; })
    );

    /* 已解决标记 */
    promises.push(
      fetch(apiUrl('/api/wrong-solved?subject=' + currentSubject), { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (data) { solvedMap = data || {}; })
        .catch(function () { solvedMap = {}; })
    );

    return Promise.all(promises).then(buildWrongList);
  }

  /* ====== 构建错题列表 ====== */
  function buildWrongList() {
    recordMap = {};
    allRecords.forEach(function (r) {
      if (!r || !r.questionId) return;
      var prev = recordMap[r.questionId];
      if (!prev || (r.timestamp && prev.timestamp && r.timestamp > prev.timestamp)) {
        recordMap[r.questionId] = r;
      }
    });

    wrongRecords = [];
    Object.keys(recordMap).forEach(function (qid) {
      var r = recordMap[qid];
      if (r && r.isCorrect === false && !solvedMap[qid]) {
        var q = allQuestions[qid];
        if (q) wrongRecords.push({ q: q, r: r });
      }
    });

    wrongRecords.sort(function (a, b) {
      var ta = String((a.r && a.r.timestamp) || '');
      var tb = String((b.r && b.r.timestamp) || '');
      return tb.localeCompare(ta);
    });

    fillChapterFilter();
    renderStats();
    renderList();
  }

  /* ====== 填充章节筛选 ====== */
  function fillChapterFilter() {
    var chapters = {};
    wrongRecords.forEach(function (item) {
      var ch = item.q.chapter || '未分类';
      chapters[ch] = true;
    });
    var sel = document.getElementById('filterChapter');
    if (!sel) return;
    var current = sel.value;
    var html = '<option value="">全部章节</option>';
    Object.keys(chapters).sort().forEach(function (ch) {
      html += '<option value="' + ch + '"' + (ch === current ? ' selected' : '') + '>' + ch + '</option>';
    });
    sel.innerHTML = html;
  }

  /* ====== 统计 ====== */
  function renderStats() {
    var totalWrong = wrongRecords.length;
    var solvedCount = 0;
    Object.keys(recordMap).forEach(function (qid) {
      var r = recordMap[qid];
      if (r && r.isCorrect === false && solvedMap[qid]) solvedCount++;
    });
    document.getElementById('statWrong').textContent = totalWrong + solvedCount;
    document.getElementById('statSolved').textContent = solvedCount;
    document.getElementById('statPending').textContent = totalWrong;
  }

  /* ====== 筛选 ====== */
  function getFilteredList() {
    return wrongRecords.filter(function (item) {
      var q = item.q;
      var r = item.r;
      if (filters.source) {
        var src = r.source || '';
        if (!src) {
          if (r.session === 'exam-training' || r.session === 'exam') src = 'exam';
          else if (r.session === 'ai-practice' || r.session === 'ai') src = 'ai';
          else src = 'practice';
        }
        if (src !== filters.source) return false;
      }
      if (filters.chapter && (q.chapter || '未分类') !== filters.chapter) return false;
      if (filters.type && q.type !== filters.type) return false;
      if (filters.status === 'solved' && !solvedMap[q.id]) return false;
      if (filters.status === 'pending' && solvedMap[q.id]) return false;
      return true;
    });
  }

  /* ====== 渲染列表 ====== */
  function renderList() {
    var list = document.getElementById('wrongList');
    if (!list) return;

    var filtered = getFilteredList();
    document.getElementById('filterCount').textContent = filtered.length + ' 题';

    if (filtered.length === 0) {
      list.innerHTML = '<div class="exam-empty">暂无错题，继续加油！</div>';
      return;
    }

    list.innerHTML = filtered.map(function (item) {
      var q = item.q;
      var r = item.r;
      var isPending = !!pendingAssess[q.id];

      var renderRecord = r;
      if (!renderRecord && isPending) {
        renderRecord = {
          details: { userAnswer: pendingText[q.id] },
          isCorrect: false, score: 0, total: 1,
          level: null, selfOverride: null, wrongReason: ''
        };
      }

      var isSolved = !!solvedMap[q.id];
      var html = '<div class="wrong-card-wrapper' + (isSolved ? ' is-solved' : '') + '">';
      html += H.renderCard(q, renderRecord, {
        selected: selectedOption[q.id] || '',
        showYear: !!q.year,
        showAIGen: false,
        expanded: expandedSet[q.id] !== false,
        showSymbol: true,
        getPhoto: loadPhoto
      });

      /* 已解决按钮 */
      html += '<div class="exam-q-actions wrong-solve-row">' +
        '<span class="exam-link-btn exam-link-solved" data-action="toggle-solved" data-id="' + q.id + '">' +
        (isSolved ? '取消标记' : '标记已解决') + '</span>' +
        '</div>';

      html += '</div>';
      return html;
    }).join('');
  }

  /* ====== 拍照加载 ====== */
  function loadPhoto(qId) {
    var key = 'quiz_photo_' + currentSubject + '_' + qId;
    try { return localStorage.getItem(key) || null; } catch (e) { return null; }
  }

  /* ====== 保存答题记录 ====== */
  function saveRecord(q, userAnswer, isCorrect, level, result) {
    var lv = level || (isCorrect ? 'mastered' : 'unknown');
    var score = isCorrect ? 1 : 0;
    var total = 1;
    if (result) {
      score = result.score;
      total = result.total;
      lv = result.level;
      isCorrect = lv === 'mastered';
    }
    var record = {
      questionId: q.id,
      timestamp: new Date().toISOString(),
      type: q.type,
      chapter: q.chapter,
      userAnswer: userAnswer || '',
      isCorrect: !!isCorrect,
      score: score,
      total: total,
      level: lv,
      source: q.src === 'ai' ? 'ai' : (q.src === 'exam' ? 'exam' : 'practice'),
      session: q.src === 'ai' ? 'ai-practice' : (q.src === 'exam' ? 'exam-training' : 'practice')
    };
    recordMap[q.id] = record;
    fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, record: record })
    }).catch(function (e) { console.warn('记录保存失败:', e); });
  }

  /* ====== 切换已解决 ====== */
  function toggleSolved(qid) {
    var newState = !solvedMap[qid];
    solvedMap[qid] = newState;
    fetch(apiUrl('/api/wrong-solved'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, questionId: qid, solved: newState })
    }).catch(function () {});
    buildWrongList();
  }

  /* ====== 查找题目 ====== */
  function findQuestion(qid) {
    return allQuestions[qid];
  }

  /* ====== 事件处理 ====== */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var qid = el.dataset.id;
    if (!qid) return;

    if (action === 'select-option') {
      selectedOption[qid] = el.dataset.letter;
      renderList();
    } else if (action === 'submit-choice') {
      var q = findQuestion(qid);
      if (!q) return;
      var letter = selectedOption[qid];
      if (!letter) { alert('请先选择一个选项'); return; }
      var result = H.scoreChoice(q, letter);
      delete selectedOption[qid];
      saveRecord(q, letter, result.level === 'mastered', result.level, result);
      buildWrongList();
    } else if (action === 'submit-fill') {
      var qf = findQuestion(qid);
      if (!qf || !qf.blanks) return;
      var inputs = document.querySelectorAll('[data-blank-id="' + qid + '"]');
      if (!inputs.length) return;
      var userAnswers = [];
      var allFilled = true;
      inputs.forEach(function (inp) { var v = inp.value.trim(); if (!v) allFilled = false; userAnswers.push(v); });
      if (!allFilled) { alert('请填写所有空'); return; }
      var result = H.scoreFill(qf, userAnswers);
      saveRecord(qf, userAnswers.join(' | '), result.level === 'mastered', result.level, result);
      buildWrongList();
    } else if (action === 'submit-text') {
      var inputEl = document.querySelector('[data-input-id="' + qid + '"]');
      if (!inputEl) return;
      var text = inputEl.value.trim();
      if (!text) { alert('请先输入答案'); return; }
      var qt = findQuestion(qid);
      if (!qt) return;
      var result = H.scoreQuestion(qt, text, null);
      if (result) {
        saveRecord(qt, text, result.level === 'mastered', result.level, result);
        buildWrongList();
      } else {
        pendingText[qid] = text;
        pendingAssess[qid] = true;
        renderList();
      }
    } else if (action === 'self-assess') {
      var q2 = findQuestion(qid);
      if (!q2) return;
      var level = el.dataset.level;
      var isCorrect2 = level === 'mastered';
      var text2 = pendingText[qid] || (recordMap[qid] && recordMap[qid].userAnswer) || '';
      delete pendingText[qid];
      delete pendingAssess[qid];
      saveRecord(q2, text2, isCorrect2, level);
      buildWrongList();
    } else if (action === 'toggle-ref') {
      expandedSet[qid] = !expandedSet[qid];
      renderList();
    } else if (action === 'redo') {
      delete pendingText[qid];
      delete pendingAssess[qid];
      delete selectedOption[qid];
      delete recordMap[qid];
      renderList();
    } else if (action === 'toggle-solved') {
      toggleSolved(qid);
    } else if (action === 'toggle-symbols') {
      var sym = document.getElementById('sym-' + qid);
      if (sym) sym.style.display = sym.style.display === 'none' ? '' : 'none';
    } else if (action === 'insert-symbol') {
      var symInput = document.querySelector('[data-input-id="' + qid + '"]');
      if (symInput) {
        var start = symInput.selectionStart || 0;
        var end = symInput.selectionEnd || 0;
        symInput.value = symInput.value.substring(0, start) + el.dataset.symbol + symInput.value.substring(end);
        symInput.focus();
        symInput.selectionStart = symInput.selectionEnd = start + el.dataset.symbol.length;
      }
    } else if (action === 'take-photo') {
      var photoInput = document.getElementById('photo-input-' + qid);
      if (photoInput) photoInput.click();
    } else if (action === 'open-photo') {
      var photoSrc = el.src || (el.querySelector('img') && el.querySelector('img').src);
      if (photoSrc) window.open(photoSrc, '_blank');
    } else if (action === 'toggle-wr-edit') {
      var wrEditor = document.getElementById('wr-edit-' + qid);
      if (wrEditor) wrEditor.style.display = wrEditor.style.display === 'none' ? '' : 'none';
    } else if (action === 'save-wr') {
      var wrInput = document.getElementById('wr-input-' + qid);
      var reason = wrInput ? wrInput.value.trim() : '';
      saveWrongReason(qid, reason);
    } else if (action === 'cancel-wr') {
      var wrEditor2 = document.getElementById('wr-edit-' + qid);
      if (wrEditor2) wrEditor2.style.display = 'none';
    } else if (action === 'ai-help') {
      if (typeof AIChat !== 'undefined' && AIChat.toggle) AIChat.toggle(qid);
    }
  });

  /* ====== 保存错因 ====== */
  function saveWrongReason(qid, reason) {
    var rec = recordMap[qid];
    if (rec) rec.wrongReason = reason;
    fetch(apiUrl('/api/quiz-wrong-reason'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, questionId: qid, wrongReason: reason })
    }).catch(function () {});
    renderList();
  }

  /* ====== 拍照上传（change 事件） ====== */
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.dataset || el.dataset.action !== 'upload-photo') return;
    var qid = el.dataset.id;
    var file = el.files && el.files[0];
    if (!file || !qid) return;
    var reader = new FileReader();
    reader.onload = function () {
      var key = 'quiz_photo_' + currentSubject + '_' + qid;
      try { localStorage.setItem(key, reader.result); } catch (e) {}
      renderList();
    };
    reader.readAsDataURL(file);
  });

  /* ====== 筛选事件 ====== */
  ['filterSource', 'filterChapter', 'filterType', 'filterStatus'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () {
      filters.source = document.getElementById('filterSource').value;
      filters.chapter = document.getElementById('filterChapter').value;
      filters.type = document.getElementById('filterType').value;
      filters.status = document.getElementById('filterStatus').value;
      renderList();
    });
  });

  /* ====== 初始化 ====== */
  var subjectName = SUBJECT_NAMES[currentSubject] || '';
  document.title = subjectName + ' · 错题本';
  var titleEl = document.getElementById('pageTitle');
  if (titleEl && subjectName) titleEl.textContent = subjectName + ' · 错题本';

  loadAllData().catch(function (e) {
    console.error('错题本加载失败:', e);
    var list = document.getElementById('wrongList');
    if (list) list.innerHTML = '<div class="exam-empty">加载失败，请刷新重试</div>';
  });
})();
