/**
 * 真题练习 — 页面逻辑
 * 专项训练：按年份/题型/知识点筛选做题，交互答题 + 自动判分 + 写入 quiz-records
 */
(function() {

  var SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
  };

  var TYPE_LABEL = {
    choice: '选择题', fill: '填空题', calculate: '计算题',
    shortAnswer: '简答题', essay: '论述题', proof: '证明题'
  };

  var apiUrl = QuizUtils.apiUrl;
  var currentSubject = QuizUtils.getSubjectFromUrl();
  var H = QuizHelpers;
  var allQuestions = [];
  var recordMap = {};          /* questionId → 最新答题记录 */
  var allRecords = [];         /* 全部答题记录（用于往期答案） */
  var selectedOption = {};     /* questionId → 选中字母（选择题型，提交前） */
  var pendingText = {};        /* questionId → 输入文本（非选择题型，提交前） */
  var pendingAssess = {};      /* questionId → true（已提交文本但未自评） */
  var expandedSet = {};        /* questionId → true（展开答案） */
  var markedMap = {};          /* questionId → true（手动加入错题库） */

  /* 同类题专项练习状态 */
  var aiPracticeBatches = [];
  var aiPracticeLoading = {};
  var aiPracticeError = {};
  var aiPracticeCollapsed = {};

  function qkey(id) { return String(id); }

  /* ====== 待重传记录队列（localStorage 兜底，断网不丢） ====== */
  function getPendingRecords() {
    try {
      var raw = localStorage.getItem('exam-pending-records-' + currentSubject);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }
  function setPendingRecords(arr) {
    try { localStorage.setItem('exam-pending-records-' + currentSubject, JSON.stringify(arr)); } catch(e) {}
  }
  function flushPendingRecords() {
    var pending = getPendingRecords();
    if (!pending.length) return Promise.resolve();
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

  /* ====== 错因待重传队列 ====== */
  function getPendingWrongReasons() {
    try {
      var raw = localStorage.getItem('exam-pending-wrong-reasons-' + currentSubject);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }
  function setPendingWrongReasons(arr) {
    try { localStorage.setItem('exam-pending-wrong-reasons-' + currentSubject, JSON.stringify(arr)); } catch(e) {}
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
          if (recordMap[payload.questionId]) {
            recordMap[payload.questionId].wrongReason = payload.wrongReason;
          }
          return true;
        }
        return false;
      }).catch(function() { return false; });
    });
    return Promise.all(promises);
  }

  /* ====== 后台自动同步 ====== */
  var _syncTimer = null;
  var _syncing = false;
  function syncNow() {
    if (_syncing) return;
    _syncing = true;
    flushPendingRecords().then(function() {
      return flushPendingWrongReasons();
    }).then(function() {
      _syncing = false;
    }).catch(function() {
      _syncing = false;
    });
  }
  function startAutoSync() {
    if (_syncTimer) return;
    _syncTimer = setInterval(syncNow, 15000);
    /* 页面重新可见时立即同步 */
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) syncNow();
    });
  }

  function loadData() {
    var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
    var raw = (examData && examData.questions) || [];
    allQuestions = raw.map(function(q) {
      return JSON.parse(JSON.stringify(q));
    });
    return fetch(apiUrl('/api/quiz-records?subject=' + currentSubject), { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(records) {
        recordMap = {};
        allRecords = Array.isArray(records) ? records.filter(function(r) { return r && r.questionId; }) : [];
        allRecords.forEach(function(r) {
          var prev = recordMap[r.questionId];
          if (!prev || (r.timestamp && prev.timestamp && r.timestamp > prev.timestamp)) {
            recordMap[r.questionId] = r;
          }
        });
        /* 用 localStorage 待重传记录覆盖（本地记录更新，优先级更高） */
        var localPending = getPendingRecords();
        localPending.forEach(function(p) {
          if (!p.record || !p.record.questionId) return;
          recordMap[p.record.questionId] = p.record;
          allRecords.push(p.record);
        });
      })
      .catch(function() { recordMap = {}; })
      .then(function() {
        return fetch(apiUrl('/api/wrong-marked?subject=' + currentSubject), { cache: 'no-cache' });
      })
      .then(function(r) { return r.json(); })
      .then(function(data) { markedMap = data || {}; })
      .catch(function() { markedMap = {}; });
  }

  function saveExamRecord(q, userAnswer, isCorrect, level, result) {
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
      details: result ? result.details : null,
      source: q.src === 'ai' ? 'ai' : 'exam',
      session: q.src === 'ai' ? 'ai-practice' : 'exam-training'
    };
    recordMap[q.id] = record;
    allRecords.push(record);
    /* 先写本地 localStorage 兜底 */
    var payload = { subject: currentSubject, record: record };
    var pending = getPendingRecords();
    pending.push(payload);
    setPendingRecords(pending);
    /* 异步上传，成功则从待重传队列移除 */
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
      console.warn('记录保存失败，已存本地待同步:', e);
    });
    updateExamMastery(q.chapter, isCorrect);
  }

  function saveWrongReason(qid, reason) {
    var rec = recordMap[qid];
    if (rec) rec.wrongReason = reason;
    /* 先写本地 localStorage 兜底 */
    var payload = { subject: currentSubject, questionId: qid, wrongReason: reason };
    var pending = getPendingWrongReasons();
    /* 同一题只保留最新一条 */
    pending = pending.filter(function(p) { return p.questionId !== qid; });
    pending.push(payload);
    setPendingWrongReasons(pending);
    /* 异步上传，成功则从待重传队列移除 */
    fetch(apiUrl('/api/quiz-wrong-reason'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var cur = getPendingWrongReasons();
      cur = cur.filter(function(p) { return p.questionId !== qid; });
      setPendingWrongReasons(cur);
    }).catch(function() {});
  }

  function loadPhoto(qId) {
    var key = 'quiz_photo_' + currentSubject + '_' + qId;
    try { return localStorage.getItem(key) || null; } catch (e) { return null; }
  }

  function parseChapterNum(chapter) {
    if (!chapter) return null;
    var m = chapter.match(/第\s*(\d+)\s*章/);
    if (m) return parseInt(m[1]);
    var m2 = chapter.match(/第([一二三四五六七八九十]+)章/);
    if (m2) {
      var numMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
      return numMap[m2[1]] || null;
    }
    return null;
  }

  function updateExamMastery(chapter, isCorrect) {
    var chNum = parseChapterNum(chapter);
    if (chNum == null) return;
    var key = 'ss_mastery_' + currentSubject;
    var state;
    try {
      var raw = localStorage.getItem(key);
      state = raw ? JSON.parse(raw) : { mastery: {}, kp: {}, toc: {} };
    } catch (e) {
      state = { mastery: {}, kp: {}, toc: {} };
    }
    if (!state.mastery) state.mastery = {};
    var current = state.mastery[chNum] || 0;
    if (isCorrect) {
      if (current < 4) state.mastery[chNum] = 4;
    } else {
      if (current > 1) state.mastery[chNum] = 1;
    }
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
    try {
      fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, chapter: chNum, level: state.mastery[chNum] })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ====== 统计 ====== */
  function renderStats() {
    var total = allQuestions.length;
    var done = 0, correct = 0;
    allQuestions.forEach(function(q) {
      var rec = recordMap[q.id];
      if (rec) { done++; if (rec.isCorrect) correct++; }
    });
    var rate = done > 0 ? Math.round(correct / done * 100) : 0;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statRate').textContent = rate + '%';
  }

  /* ====== 筛选 ====== */
  function fillFilters() {
    var years = {}, types = {}, chapters = {};
    allQuestions.forEach(function(q) {
      years[q.year] = 1;
      types[q.type] = 1;
      chapters[q.chapter] = 1;
    });
    fillSelect('filterYear', Object.keys(years).sort().reverse());
    fillSelect('filterType', Object.keys(types).map(function(t) { return {v: t, label: TYPE_LABEL[t] || t}; }));
    fillSelect('filterChapter', Object.keys(chapters));

    var pending = 0, correct = 0, wrong = 0;
    allQuestions.forEach(function(q) {
      var rec = recordMap[q.id];
      if (rec && rec.isCorrect) correct++;
      else if (rec && !rec.isCorrect) wrong++;
      else pending++;
    });
    var fs = document.getElementById('filterStatus');
    fs.innerHTML = '<option value="">全部状态 (' + allQuestions.length + ')</option>' +
      '<option value="pending">待做 (' + pending + ')</option>' +
      '<option value="correct">已掌握 (' + correct + ')</option>' +
      '<option value="wrong">错题 (' + wrong + ')</option>';
  }

  function fillSelect(id, values) {
    var sel = document.getElementById(id);
    var current = sel.value;
    /* 保留第一个option（"全部xxx"），清除其余 */
    var firstOpt = sel.querySelector('option');
    var firstText = firstOpt ? firstOpt.textContent : '全部';
    sel.innerHTML = '<option value="">' + firstText + '</option>';
    values.forEach(function(v) {
      var opt = document.createElement('option');
      if (typeof v === 'object') { opt.value = v.v; opt.textContent = v.label; }
      else { opt.value = v; opt.textContent = v; }
      sel.appendChild(opt);
    });
    sel.value = current;
  }

  function getFiltered() {
    var fy = document.getElementById('filterYear').value;
    var ft = document.getElementById('filterType').value;
    var fc = document.getElementById('filterChapter').value;
    var fs = document.getElementById('filterStatus').value;
    return allQuestions.filter(function(q) {
      if (fy && q.year !== fy) return false;
      if (ft && q.type !== ft) return false;
      if (fc && q.chapter !== fc) return false;
      if (fs) {
        var rec = recordMap[q.id];
        if (fs === 'pending' && rec) return false;
        if (fs === 'correct' && !(rec && rec.isCorrect)) return false;
        if (fs === 'wrong' && !(rec && !rec.isCorrect)) return false;
      }
      return true;
    });
  }

  function getStatus(q) {
    var rec = recordMap[q.id];
    if (!rec) return 'pending';
    return rec.isCorrect ? 'correct' : 'wrong';
  }

  function statusLabel(s) {
    if (s === 'correct') return '已掌握';
    if (s === 'wrong') return '错题';
    return '待做';
  }

  /* ====== 题目渲染 — 委托共享函数 ====== */
  function renderQuestion(q, showAnswer, showAiPractice) {
    var rec = recordMap[q.id];
    var isPending = !!pendingAssess[q.id];

    var r = rec;
    if (!r && isPending) {
      r = {
        details: { userAnswer: pendingText[q.id] },
        isCorrect: false,
        score: 0,
        total: 1,
        level: null,
        selfOverride: null,
        wrongReason: ''
      };
    }

    var html = H.renderCard(q, r, {
      selected: selectedOption[q.id] || '',
      showYear: true,
      showAIGen: true,
      expanded: showAnswer === true,
      showSymbol: true,
      getPhoto: loadPhoto,
      /* 已加入错题库：手动标记 或 答错自动进入 */
      marked: !!markedMap[q.id] || (r && r.isCorrect === false),
      history: allRecords.filter(function(rec) { return rec.questionId === q.id; })
    });

    if (showAiPractice) {
      html += renderAiPracticeArea(q, showAiPractice);
    }
    return html;
  }

  function answerRow(label, labelClass, content) {
    return H.answerRow(label, labelClass, content);
  }

  function renderTrainingList() {
    var filtered = getFiltered();
    document.getElementById('filterCount').textContent = filtered.length + ' 题';
    var list = document.getElementById('trainingList');
    if (filtered.length === 0) {
      list.innerHTML = '<div class="exam-empty">暂无符合条件的题目</div>';
      return;
    }
    list.innerHTML = filtered.map(function(q) {
      return renderQuestion(q, expandedSet[qkey(q.id)], true);
    }).join('');
  }

  function renderWrongList() {
    var wrongs = allQuestions.filter(function(q) {
      var rec = recordMap[q.id];
      return rec && !rec.isCorrect;
    });
    var list = document.getElementById('wrongList');
    if (wrongs.length === 0) {
      list.innerHTML = '<div class="exam-empty">暂无错题，继续加油！</div>';
      return;
    }
    list.innerHTML = wrongs.map(function(q) {
      return renderQuestion(q, true, true);
    }).join('');
  }

  function renderAll() {
    renderStats();
    renderTrainingList();
    renderWrongList();
    renderExamNav();
  }

  /* ====== 题目导航面板 ====== */
  function renderExamNav() {
    var panel = document.getElementById('examNavPanel');
    if (!panel || panel.classList.contains('collapsed')) return;

    var filtered = getFiltered();
    if (filtered.length === 0) {
      panel.innerHTML = '<div class="exam-nav-header"><span class="exam-nav-count">无题目</span>' +
        '<button class="exam-nav-toggle" data-action="toggle-exam-nav">▾</button></div>';
      return;
    }

    var answered = 0;
    var items = filtered.map(function(q, i) {
      var s = getStatus(q);
      var cls = 'pending';
      if (s === 'correct') { cls = 'correct'; answered++; }
      else if (s === 'wrong') { cls = 'wrong'; answered++; }
      var title = (q.year || '') + ' · ' + (TYPE_LABEL[q.type] || q.type || '') + ' · ' + (q.chapter || '');
      return '<div class="exam-nav-item ' + cls + '" data-action="exam-nav-jump" data-id="' + q.id + '" title="' + title + '">' + (i + 1) + '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="exam-nav-header">' +
        '<span class="exam-nav-count">已答 ' + answered + '/' + filtered.length + '</span>' +
        '<button class="exam-nav-toggle" data-action="toggle-exam-nav">▾</button>' +
      '</div>' +
      '<div class="exam-nav-grid">' + items + '</div>';
  }

  function examNavJump(qId) {
    var card = document.querySelector('[data-qid="' + qId + '"]');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = 'box-shadow 0.3s';
      card.style.boxShadow = '0 0 0 3px var(--accent)';
      setTimeout(function() { card.style.boxShadow = ''; }, 1000);
    }
  }

  function toggleExamNav() {
    var panel = document.getElementById('examNavPanel');
    if (!panel) return;
    panel.classList.toggle('collapsed');
    if (!panel.classList.contains('collapsed')) {
      renderExamNav();
    } else {
      panel.innerHTML = '<button class="exam-nav-collapsed-btn" data-action="toggle-exam-nav">📋</button>';
    }
  }

  /* ====== 事件代理 ====== */
  function handleQuestionClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var qid = el.dataset.id || el.dataset.qid;
    var action = el.dataset.action;

    if (action === 'select-option') {
      selectedOption[qid] = el.dataset.letter;
      renderTrainingList();
      renderAIExamList();
    } else if (action === 'submit-choice') {
      var q = findQuestionById(qid);
      if (!q) return;
      var letter = selectedOption[qid];
      if (!letter) { alert('请先选择一个选项'); return; }
      var result = H.scoreChoice(q, letter);
      delete selectedOption[qid];
      saveExamRecord(q, letter, result.level === 'mastered', result.level, result);
      expandedSet[qkey(qid)] = true;
      renderAll();
      renderAIExamList();
    } else if (action === 'submit-fill') {
      var qf = findQuestionById(qid);
      if (!qf || !qf.blanks) return;
      var inputs = document.querySelectorAll('[data-blank-id="' + qid + '"]');
      if (!inputs.length) return;
      var userAnswers = [];
      var allFilled = true;
      inputs.forEach(function(inp) { var v = inp.value.trim(); if (!v) allFilled = false; userAnswers.push(v); });
      if (!allFilled) { alert('请填写所有空'); return; }
      var result = H.scoreFill(qf, userAnswers);
      var userAnsStr = userAnswers.join(' | ');
      saveExamRecord(qf, userAnsStr, result.level === 'mastered', result.level, result);
      expandedSet[qkey(qid)] = true;
      renderAll();
      renderAIExamList();
    } else if (action === 'submit-text') {
      var inputEl = document.querySelector('[data-input-id="' + qid + '"]');
      if (!inputEl) return;
      var text = inputEl.value.trim();
      if (!text) { alert('请先输入答案'); return; }
      var qt = findQuestionById(qid);
      if (!qt) return;
      var result = H.scoreQuestion(qt, text, null);
      if (result) {
        saveExamRecord(qt, text, result.level === 'mastered', result.level, result);
        expandedSet[qkey(qid)] = true;
        renderAll();
        renderAIExamList();
      } else {
        pendingText[qid] = text;
        pendingAssess[qid] = true;
        renderTrainingList();
        renderAIExamList();
        renderWrongList();
      }
    } else if (action === 'self-assess') {
      var q2 = findQuestionById(qid);
      if (!q2) return;
      var level = el.dataset.level;
      var isCorrect2 = level === 'mastered';
      var text2 = pendingText[qid] || (recordMap[qid] && recordMap[qid].userAnswer) || '';
      delete pendingText[qid];
      delete pendingAssess[qid];
      saveExamRecord(q2, text2, isCorrect2, level);
      expandedSet[qkey(qid)] = true;
      renderAll();
      renderAIExamList();
    } else if (action === 'toggle-ref') {
      expandedSet[qid] = !expandedSet[qid];
      renderTrainingList();
      renderWrongList();
    } else if (action === 'toggle-marked') {
      markedMap[qid] = !markedMap[qid];
      fetch(apiUrl('/api/wrong-marked'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, questionId: qid, marked: markedMap[qid] })
      }).catch(function() {});
      renderAll();
      renderTrainingList();
      renderWrongList();
      renderAIExamList();
    } else if (action === 'toggle-history') {
      var histPanel = document.getElementById('hist-' + qid);
      if (histPanel) histPanel.style.display = histPanel.style.display === 'none' ? '' : 'none';
    } else if (action === 'redo') {
      delete recordMap[qid];
      delete selectedOption[qid];
      delete pendingText[qid];
      delete pendingAssess[qid];
      renderAll();
      renderAIExamList();
    } else if (action === 'ai-help') {
      toggleAIHelp(qid, el);
    } else if (action === 'ai-gen') {
      generateSimilarQuestions(qid);
    } else if (action === 'ai-practice-toggle') {
      aiPracticeCollapsed[qid] = (aiPracticeCollapsed[qid] === false);
      renderTrainingList();
      renderWrongList();
      renderAIExamList();
    } else if (action === 'toggle-symbols') {
      var sym = document.getElementById('sym-' + qid);
      if (sym) sym.style.display = sym.style.display === 'none' ? '' : 'none';
    } else if (action === 'insert-symbol') {
      var symInput = document.querySelector('[data-input-id="' + qid + '"]') || document.querySelector('#input-' + qid);
      if (symInput) {
        var symStart = symInput.selectionStart || 0;
        var symEnd = symInput.selectionEnd || 0;
        symInput.value = symInput.value.substring(0, symStart) + el.dataset.symbol + symInput.value.substring(symEnd);
        symInput.focus();
        symInput.selectionStart = symInput.selectionEnd = symStart + el.dataset.symbol.length;
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
      renderAll();
    } else if (action === 'cancel-wr') {
      var wrEditor2 = document.getElementById('wr-edit-' + qid);
      if (wrEditor2) wrEditor2.style.display = 'none';
    }
  }

  ['trainingList', 'wrongList', 'aiExamList'].forEach(function(id) {
    var box = document.getElementById(id);
    if (box) box.addEventListener('click', handleQuestionClick);
  });

  /* 导航面板及其他全局事件委托 */
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    if (action === 'toggle-exam-nav') {
      toggleExamNav();
    } else if (action === 'exam-nav-jump') {
      examNavJump(el.dataset.id);
    } else if (action === 'exam-ai-send') {
      sendAIHelp(el.dataset.key, el.dataset.id);
    } else if (action === 'exam-gen-retry') {
      generateAIExamQuestions();
    }
  });

  /* AI输入框回车发送 */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    var el = e.target.closest('[data-action="exam-ai-input"]');
    if (el) sendAIHelp(el.dataset.key, el.dataset.id);
  });

  /* 错因输入（旧版内联输入框自动保存） */
  document.addEventListener('input', function(e) {
    var el = e.target;
    if (!el.classList || !el.classList.contains('exam-wr-input')) return;
    var qid = el.dataset.wrId;
    if (!qid) return;
    var timer = el._wrTimer;
    if (timer) clearTimeout(timer);
    el._wrTimer = setTimeout(function() {
      saveWrongReason(qid, el.value);
    }, 500);
  });

  /* 拍照上传（change 事件） */
  document.addEventListener('change', function(e) {
    var el = e.target;
    if (!el.dataset || el.dataset.action !== 'upload-photo') return;
    var qid = el.dataset.id;
    var file = el.files && el.files[0];
    if (!file || !qid) return;
    var reader = new FileReader();
    reader.onload = function() {
      var key = 'quiz_photo_' + currentSubject + '_' + qid;
      try { localStorage.setItem(key, reader.result); } catch (e) { console.warn('照片保存失败', e); }
      renderAll();
    };
    reader.readAsDataURL(file);
  });

  /* ====== 筛选持久化 ====== */
  var FILTER_STORAGE_KEY = 'exam-filters';

  function saveFilters() {
    var data = QuizUtils.storageGet(FILTER_STORAGE_KEY, {});
    data[currentSubject] = {
      year: document.getElementById('filterYear').value,
      type: document.getElementById('filterType').value,
      chapter: document.getElementById('filterChapter').value,
      status: document.getElementById('filterStatus').value
    };
    QuizUtils.storageSet(FILTER_STORAGE_KEY, data);
  }

  function restoreFilters() {
    var data = QuizUtils.storageGet(FILTER_STORAGE_KEY, {});
    var saved = data[currentSubject];
    if (!saved) return;
    if (saved.year) document.getElementById('filterYear').value = saved.year;
    if (saved.type) document.getElementById('filterType').value = saved.type;
    if (saved.chapter) document.getElementById('filterChapter').value = saved.chapter;
    if (saved.status) document.getElementById('filterStatus').value = saved.status;
  }

  ['filterYear', 'filterType', 'filterChapter', 'filterStatus'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', function() { saveFilters(); renderTrainingList(); renderExamNav(); });
  });

  /* ====== AI 解答 ====== */
  var aiHelpHistory = {};
  var aiHelpLoading = {};

  function loadAIHelpConversation(qId) {
    return fetch(apiUrl('/api/exam-ai-help?subject=' + currentSubject + '&questionId=' + qId), { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (Array.isArray(data)) aiHelpHistory[qId] = data;
        return aiHelpHistory[qId] || [];
      })
      .catch(function() {
        aiHelpHistory[qId] = aiHelpHistory[qId] || [];
        return aiHelpHistory[qId];
      });
  }

  function saveAIHelpConversation(qId) {
    var conversation = aiHelpHistory[qId] || [];
    return fetch(apiUrl('/api/exam-ai-help'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, questionId: qId, conversation: conversation })
    }).catch(function() {});
  }

  var aiHelpSeq = 0;

  function toggleAIHelp(qId, trigger) {
    var card = (trigger && trigger.closest) ? trigger.closest('.exam-question') : null;
    if (!card) card = document.querySelector('[data-qid="' + qId + '"]');
    if (!card) return;
    var panel = card.querySelector('.ai-help-panel');
    if (panel) {
      panel.classList.toggle('zk-show');
      return;
    }
    var key = 'aih' + (++aiHelpSeq);
    panel = document.createElement('div');
    panel.className = 'ai-help-panel zk-show';
    panel.innerHTML = '<div class="ai-help-messages"><div class="ai-msg loading">正在加载历史对话...</div></div>';
    card.appendChild(panel);
    loadAIHelpConversation(qId).then(function() {
      panel.innerHTML = renderAIHelpPanel(key, qId);
      var input = panel.querySelector('.ai-help-input');
      if (input) input.focus();
      var msgs = panel.querySelector('.ai-help-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }

  function renderAIHelpPanel(key, qId) {
    var history = aiHelpHistory[qId] || [];
    var msgsHTML = history.map(function(m) {
      return '<div class="ai-msg ' + m.role + '">' + AIChat.formatText(m.content) + '</div>';
    }).join('');
    if (msgsHTML === '') {
      msgsHTML = '<div class="ai-msg assistant">你好！我是AI学习助手，关于这道题有什么疑问尽管问我。可以问"这道题考什么知识点"、"这道题怎么解"等。</div>';
    }
    return '<div class="ai-help-messages" id="ai-msgs-' + key + '">' + msgsHTML + '</div>' +
      '<div class="ai-help-input-row">' +
      '<input type="text" class="ai-help-input" id="ai-input-' + key + '" placeholder="输入你的问题..." data-action="exam-ai-input" data-key="' + key + '" data-id="' + qId + '">' +
      '<button class="ai-help-send zk-btn-primary" id="ai-send-' + key + '" data-action="exam-ai-send" data-key="' + key + '" data-id="' + qId + '">发送</button>' +
      '</div>';
  }

  function sendAIHelp(key, qId) {
    var input = document.getElementById('ai-input-' + key);
    if (!input) return;
    var question = input.value.trim();
    if (!question) return;
    if (!aiHelpHistory[qId]) aiHelpHistory[qId] = [];
    aiHelpHistory[qId].push({ role: 'user', content: question });
    input.value = '';
    input.disabled = true;
    var sendBtn = document.getElementById('ai-send-' + key);
    if (sendBtn) sendBtn.disabled = true;
    saveAIHelpConversation(qId);

    var msgs = document.getElementById('ai-msgs-' + key);
    if (msgs) {
      msgs.innerHTML += '<div class="ai-msg user">' + AIChat.formatText(question) + '</div>';
      msgs.innerHTML += '<div class="ai-msg loading" id="ai-loading-' + key + '">AI正在思考...</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }

    var q = findQuestionById(qId);
    var questionContext = '';
    if (q) {
      questionContext = '当前题目信息：\n';
      questionContext += '科目：' + (SUBJECT_NAMES[currentSubject] || '') + '\n';
      questionContext += '年份：' + (q.year || '') + '\n';
      questionContext += '章节：' + (q.chapter || '') + '\n';
      questionContext += '题型：' + (TYPE_LABEL[q.type] || q.type || '') + '\n';
      questionContext += '题目：' + (q.question || '') + '\n';
      if (q.options) questionContext += '选项：' + q.options.join('  ') + '\n';
      if (q.answer) questionContext += '正确答案：' + q.answer + '\n';
      if (q.explanation) questionContext += '解析：' + q.explanation + '\n';
    }

    var messages = [{ role: 'system', content: '你是一个专业的自考学习助手。用户正在做真题练习，请基于题目内容回答用户的疑问。要求：1.解答清晰易懂 2.给出涉及的知识点 3.引导用户思考\n\n' + questionContext }];
    aiHelpHistory[qId].forEach(function(m) {
      messages.push({ role: m.role, content: m.content });
    });

    AIChat.chat({
      messages: messages,
      maxTokens: 1500,
      onDone: function(content) {
        if (!content || !content.trim()) content = 'AI 返回了空内容';
        var loading = document.getElementById('ai-loading-' + key);
        if (loading) loading.remove();
        aiHelpHistory[qId].push({ role: 'assistant', content: content });
        if (msgs) {
          msgs.innerHTML += '<div class="ai-msg assistant">' + AIChat.formatText(content) + '</div>';
          msgs.scrollTop = msgs.scrollHeight;
        }
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
        saveAIHelpConversation(qId);
      },
      onError: function(err) {
        var loading = document.getElementById('ai-loading-' + key);
        if (loading) loading.remove();
        if (msgs) {
          msgs.innerHTML += '<div class="ai-msg assistant error">⚠️ ' + AIChat.formatError(err) + '，请重试</div>';
          msgs.scrollTop = msgs.scrollHeight;
        }
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      }
    }).catch(function() {});
  }

  /* ====== AI 出题（专项练习）====== */
  var aiExamLoading = false;
  var aiExamQuestions = [];

  function jumpToAIExam() {
    var sec = document.querySelector('.exam-ai-section');
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    generateAIExamQuestions();
  }

  function setAIExamLoadingUI(loading) {
    var genBtn = document.getElementById('aiGenBtn');
    var quickBtn = document.getElementById('aiQuickBtn');
    if (genBtn) {
      genBtn.disabled = loading;
      genBtn.textContent = loading ? '正在生成...' : '🤖 AI出题';
    }
    if (quickBtn) quickBtn.disabled = loading;
  }

  function generateAIExamQuestions() {
    if (aiExamLoading) return;
    aiExamLoading = true;
    setAIExamLoadingUI(true);

    var subjectName = SUBJECT_NAMES[currentSubject] || '';
    var yearFilter = document.getElementById('filterYear').value || '';
    var typeFilter = document.getElementById('filterType').value || '';
    var chapterFilter = document.getElementById('filterChapter').value || '';

    var sampleQuestions = allQuestions.filter(function(q) {
      if (yearFilter && q.year !== yearFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (chapterFilter && q.chapter !== chapterFilter) return false;
      return true;
    }).slice(0, 5);

    var sampleText = sampleQuestions.map(function(q, i) {
      var parts = ['例题' + (i+1) + '（' + (TYPE_LABEL[q.type] || q.type) + '）：' + (q.question || '')];
      if (q.options) parts.push('选项：' + q.options.join('  '));
      if (q.answer) parts.push('答案：' + q.answer);
      if (q.explanation) parts.push('解析：' + q.explanation);
      return parts.join('\n');
    }).join('\n\n');

    var chapterList = '';
    var chSet = {};
    allQuestions.forEach(function(q) { chSet[q.chapter] = true; });
    chapterList = Object.keys(chSet).join('、');

    var prompt = '你是自考出题专家。根据以下真题风格和知识点，生成5道类似的新题目用于专项练习。\n\n' +
      '科目：' + subjectName + '\n' +
      '章节范围：' + (chapterFilter || chapterList) + '\n' +
      '题型要求：' + (TYPE_LABEL[typeFilter] || '不限题型，覆盖选择题、填空题、简答题、计算题') + '\n\n' +
      '参考真题风格：\n' + sampleText + '\n\n' +
      '要求：\n' +
      '1. 生成5道题，难度和风格接近真题\n' +
      '2. 每题返回字段：question（题干）、type（choice/fill/shortAnswer/calculate）、chapter、answer、explanation\n' +
      '3. 选择题包含options数组（4个选项，形如"A. xxx"）\n' +
      '4. 严格返回JSON数组格式，不要有其他文字\n' +
      '5. 题目内容不要和参考真题重复';

    AIChat.ask({
      prompt: prompt,
      maxTokens: 3000
    }).then(function(content) {
      var questions = parseAIExamQuestions(content);
      if (questions.length === 0) throw new Error('AI返回格式解析失败');
      questions.forEach(function(q, i) {
        q.id = 'ai-exam-' + Date.now() + '-' + i;
        q.year = q.year || 'AI生成';
        q.src = 'ai';
      });
      aiExamQuestions = questions;
      aiExamLoading = false;
      setAIExamLoadingUI(false);
      renderAIExamList();
    }).catch(function(err) {
      aiExamLoading = false;
      setAIExamLoadingUI(false);
      var list = document.getElementById('aiExamList');
      if (list) {
        list.innerHTML = '<div class="exam-empty">⚠️ AI出题失败：' + AIChat.formatError(err) + '<br><button data-action="exam-gen-retry" class="exam-link-btn">重试</button></div>';
      }
    });
  }

  function parseAIExamQuestions(content) {
    if (!content) return [];
    var jsonStr = content.trim();
    var start = jsonStr.indexOf('[');
    var end = jsonStr.lastIndexOf(']');
    if (start >= 0 && end > start) {
      jsonStr = jsonStr.substring(start, end + 1);
    }
    try {
      var arr = JSON.parse(jsonStr);
      return Array.isArray(arr) ? arr : [];
    } catch(e) {
      return [];
    }
  }

  function renderAIExamList() {
    var list = document.getElementById('aiExamList');
    if (!list) return;
    if (aiExamQuestions.length === 0) {
      list.innerHTML = '<div class="exam-empty">点击"AI出题"按钮，根据真题风格生成5道新题目</div>';
      return;
    }
    list.innerHTML = aiExamQuestions.map(function(q) {
      return renderQuestion(q, expandedSet[qkey(q.id)], false);
    }).join('');
  }

  /* ====== 同类题专项练习 ====== */
  var AI_PRACTICE_PER_BATCH = 5;

  function formatNow() {
    var d = new Date();
    var p = function(n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function findQuestionById(qid) {
    var q = allQuestions.find(function(x) { return x.id == qid; });
    if (q) return q;
    q = aiExamQuestions.find(function(x) { return x.id === qid; });
    if (q) return q;
    for (var i = 0; i < aiPracticeBatches.length; i++) {
      var items = aiPracticeBatches[i].items || [];
      for (var j = 0; j < items.length; j++) {
        if (items[j].id === qid) return items[j];
      }
    }
    return null;
  }

  function loadAiPractice() {
    return fetch(apiUrl('/api/ai-practice?subject=' + currentSubject), { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        aiPracticeBatches = Array.isArray(data) ? data : [];
        return aiPracticeBatches;
      })
      .catch(function() {
        aiPracticeBatches = [];
        return aiPracticeBatches;
      });
  }

  function saveAiPracticeBatch(batch) {
    return fetch(apiUrl('/api/ai-practice'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, batch: batch })
    }).catch(function() {});
  }

  function batchesForQuestion(qid) {
    return aiPracticeBatches.filter(function(b) {
      return b && b.source && String(b.source.questionId) === String(qid);
    });
  }

  function renderAiPracticeArea(q, showAiPractice) {
    if (!showAiPractice) return '';
    var batches = batchesForQuestion(q.id);
    var loading = !!aiPracticeLoading[qkey(q.id)];
    var errMsg = aiPracticeError[qkey(q.id)];
    if (!batches.length && !loading && !errMsg) return '';

    var items = [];
    batches.forEach(function(b) {
      (b.items || []).forEach(function(it) { items.push(it); });
    });

    var collapsed = aiPracticeCollapsed[qkey(q.id)] !== false;
    var toggleHtml = items.length
      ? '<span class="exam-link-btn exam-link-gen" data-action="ai-practice-toggle" data-id="' +
        qkey(q.id) + '">' + (collapsed ? '展开 ▸' : '收起 ▾') + '</span>'
      : '';
    var countText = items.length ? ('共 ' + items.length + ' 题') : (loading ? '生成中…' : '');

    var inner = '';
    if (loading) {
      inner += '<div class="exam-ai-practice-status">⏳ AI 正在出同类型题目…</div>';
    }
    if (errMsg) {
      inner += '<div class="exam-ai-practice-status exam-ai-practice-error">⚠️ ' +
        QuizUtils.esc(errMsg) + '</div>';
    }
    if (items.length) {
      inner += '<div class="exam-ai-practice-body' + (collapsed ? ' exam-hidden' : '') + '">' +
        items.map(function(it) { return renderAiItemCard(it); }).join('') +
        '</div>';
    }

    return '<div class="exam-ai-practice" data-aipractice="' + q.id + '">' +
      '<div class="exam-ai-practice-head">' +
        '<span class="exam-ai-practice-title">🧩 同类题专项练习</span>' +
        toggleHtml +
        '<span class="exam-ai-practice-count">' + countText + '</span>' +
      '</div>' +
      inner +
      '</div>';
  }

  function renderAiItemCard(item) {
    return renderQuestion(item, expandedSet[qkey(item.id)], false);
  }

  function generateSimilarQuestions(qid) {
    if (aiPracticeLoading[qid]) return;
    var q = allQuestions.find(function(x) { return x.id == qid; });
    if (!q) return;
    delete aiPracticeError[qid];
    aiPracticeLoading[qid] = true;
    renderTrainingList();
    renderWrongList();

    var typeToken = q.type || 'choice';
    var prompt = '你是自考出题专家。请根据下面这道真题，出 ' + AI_PRACTICE_PER_BATCH +
      ' 道同类型的题目，用于专项练习。\n\n' +
      '科目：' + (SUBJECT_NAMES[currentSubject] || '') + '\n' +
      '原题年份：' + (q.year || '未知') + '\n' +
      '原题题型：' + (TYPE_LABEL[q.type] || q.type) + '（type 字段固定填 "' + typeToken + '"）\n' +
      '原题章节：' + (q.chapter || '') + '\n' +
      '原题题干：' + (q.question || '') + '\n' +
      (q.options ? '原题选项：' + q.options.join('  ') + '\n' : '') +
      (q.answer ? '原题答案：' + q.answer + '\n' : '') +
      (q.explanation ? '原题解析：' + q.explanation + '\n' : '') +
      '\n要求：\n' +
      '1. 共 ' + AI_PRACTICE_PER_BATCH + ' 道，题型、章节、难度必须与原题保持一致\n' +
      '2. 考察的知识点要与原题相同或高度相关，但题干内容不得与原题重复\n' +
      '3. 每道题返回字段：question（题干）、type（固定 "' + typeToken + '"）、options（选择题必填，4个选项，形如"A. xxx"）、answer（答案）、explanation（解析）\n' +
      '4. 严格返回 JSON 数组，数组元素为题目对象，不要输出任何其他文字或 Markdown 代码块标记';

    AIChat.ask({ prompt: prompt, maxTokens: 3000 }).then(function(content) {
      var items = parseAIExamQuestions(content);
      if (!items.length) throw new Error('AI 返回格式解析失败，请重试');
      var stamp = Date.now();
      var normalized = items.map(function(it, i) {
        return {
          id: 'ai-' + currentSubject + '-' + stamp + '-' + (i + 1),
          question: it.question || '',
          type: typeToken,
          options: (it.options && it.options.length) ? it.options : null,
          answer: it.answer || '',
          explanation: it.explanation || '',
          chapter: q.chapter || '',
          cardId: null,
          src: 'ai'
        };
      });
      var batch = {
        batchId: 'b-' + currentSubject + '-' + stamp,
        subject: currentSubject,
        source: {
          questionId: q.id,
          year: q.year || '',
          type: q.type || '',
          chapter: q.chapter || '',
          question: q.question || ''
        },
        generatedAt: formatNow(),
        items: normalized
      };
      aiPracticeBatches.push(batch);
      aiPracticeCollapsed[qkey(q.id)] = false;
      aiPracticeLoading[qid] = false;
      renderTrainingList();
      renderWrongList();
      saveAiPracticeBatch(batch);
    }).catch(function(err) {
      aiPracticeLoading[qid] = false;
      aiPracticeError[qid] = AIChat.formatError(err);
      renderTrainingList();
      renderWrongList();
    });
  }

  /* ====== 初始化 ====== */
  document.getElementById('subjectTag').textContent = SUBJECT_NAMES[currentSubject] || currentSubject;
  var wbLink = document.getElementById('wrongBookLink');
  if (wbLink) wbLink.href = '错题本.html?subject=' + currentSubject;
  (window.examDataReady || Promise.resolve()).then(function() {
    loadData().then(function() {
      fillFilters();
      restoreFilters();
      renderAll();
      loadAiPractice().then(function() {
        if (aiPracticeBatches.length) {
          renderTrainingList();
          renderWrongList();
        }
      });
      /* 启动自动同步（每15秒 + 页面可见时重试） */
      startAutoSync();
      /* 首次重传本地待同步数据 */
      syncNow();
    });
  });

  window.generateSimilarQuestions = generateSimilarQuestions;
  window.loadAiPractice = loadAiPractice;
  window.toggleAIHelp = toggleAIHelp;
  window.sendAIHelp = sendAIHelp;
  window.generateAIExamQuestions = generateAIExamQuestions;
  window.jumpToAIExam = jumpToAIExam;
  window.toggleExamNav = toggleExamNav;
  window.examNavJump = examNavJump;

})();
