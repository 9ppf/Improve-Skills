// ============================================================
// 题库管理 — 独立页面 JS
// 支持查看/筛选/删除题目 + 交互答题（委托 H.renderCard 渲染）
// ============================================================

(function() {
  var SUBJECTS = {
    "13003": {
      name: "13003 数据结构与算法",
      chapters: ["绪论","线性表","栈和队列","数组、广义表和串","树与二叉树","图结构","内部排序","查找"]
    },
    "13015": {
      name: "13015 计算机系统原理",
      chapters: ["计算机系统概述","数据的表示和运算","程序的转换及机器级表示","可执行文件的生成与加载执行","程序的存储访问","程序中I/O操作的实现"]
    },
    "02324": {
      name: "02324 离散数学",
      chapters: ["命题与命题公式","命题逻辑的推理理论","谓词逻辑","集合","关系与函数","代数系统的一般概念","格与布尔代数","图","图的应用"]
    }
  };

  var TYPE_META = {
    choice:      { label: '选择题',   icon: '🔘' },
    fill:        { label: '填空题',   icon: '✏️' },
    calculate:   { label: '计算题',   icon: '🧮' },
    shortAnswer: { label: '简答题',   icon: '✍️' },
    essay:       { label: '论述题',   icon: '📄' },
    proof:       { label: '证明题',   icon: '📐' }
  };
  var SOURCE_LABEL = {
    practice: '练习',
    exam: '真题',
    ai: '专项'
  };

  function getSubjectFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var s = params.get("subject");
    if (s && SUBJECTS[s]) return s;
    return "13003";
  }

  function updateUrl(subject) {
    var url = new URL(window.location.href);
    url.searchParams.set("subject", subject);
    window.history.replaceState({}, "", url.toString());
  }

  var currentSubject = getSubjectFromUrl();
  var apiUrl = QuizUtils.apiUrl;
  var esc = QuizUtils.esc;
  var H = (typeof QuizHelpers !== 'undefined') ? QuizHelpers : null;

  var bankCache = {
    subject: null,
    data: [],
    recordMap: {},      /* questionId → 最新答题记录 */
    allRecords: [],     /* 全部答题记录（用于往期答案） */
    filterChapter: '',
    filterType: '',
    filterStatus: '',
    filterSource: ''
  };

  /* 交互答题状态 */
  var selectedOption = {};
  var pendingText = {};
  var pendingAssess = {};
  var expandedSet = {};
  var markedMap = {};   /* questionId → true（手动加入错题库） */

  function showToast(msg, kind) {
    var t = document.createElement('div');
    t.className = 'ss-toast' + (kind === 'error' ? ' ss-toast-error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() { t.classList.add('ss-toast-show'); });
    setTimeout(function() {
      t.classList.remove('ss-toast-show');
      setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 2400);
  }

  function getSourceLabel(q) {
    var src = q.src || '';
    if (src === 'practice' || src === 'textbook' || src === 'review') return 'practice';
    if (src === 'exam') return 'exam';
    if (src === 'ai') return 'ai';
    if (q.id && q.id.indexOf('exam-') === 0) return 'exam';
    if (q.id && q.id.indexOf('ai-') === 0) return 'ai';
    return 'practice';
  }

  function loadPhoto(qId) {
    var key = 'quiz_photo_' + currentSubject + '_' + qId;
    try { return localStorage.getItem(key) || null; } catch (e) { return null; }
  }

  function findQuestion(qid) {
    return bankCache.data.find(function(q) { return q.id === qid; }) || null;
  }

  /* ====== 加载题库 + 答题记录 ====== */
  function loadQuizBank() {
    var container = document.getElementById('bankContainer');
    var subject = currentSubject;
    if (bankCache.subject !== subject) {
      bankCache.filterChapter = ''; bankCache.filterType = ''; bankCache.filterStatus = ''; bankCache.filterSource = '';
    }
    container.innerHTML = '<div class="ss-loading">加载中…</div>';

    Promise.all([
      fetch(apiUrl('/api/quiz-bank?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
      fetch(apiUrl('/api/quiz-records?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
      fetch(apiUrl('/api/ai-practice?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }).catch(function() { return []; }),
      fetch(apiUrl('/api/wrong-marked?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }).catch(function() { return {}; }),
      (window.examDataReady || Promise.resolve()).then(function() {
        var examData = window.EXAM_DATA && window.EXAM_DATA[subject];
        return (examData && examData.questions) || [];
      })
    ]).then(function(res) {
      var bankData = Array.isArray(res[0]) ? res[0] : [];
      var records = Array.isArray(res[1]) ? res[1] : [];
      var aiBatches = Array.isArray(res[2]) ? res[2] : [];
      markedMap = res[3] || {};
      var examQs = Array.isArray(res[4]) ? res[4] : [];

      aiBatches.forEach(function(batch) {
        var qs = (batch && (batch.items || batch.questions)) || [];
        qs.forEach(function(q) { bankData.push(q); });
      });
      examQs.forEach(function(q) { bankData.push(q); });

      /* 构建记录映射：取每题最新记录 */
      var recordMap = {};
      records.forEach(function(r) {
        if (!r || !r.questionId) return;
        var prev = recordMap[r.questionId];
        if (!prev || (r.timestamp && prev.timestamp && r.timestamp > prev.timestamp)) {
          recordMap[r.questionId] = r;
        }
      });

      bankCache.subject = subject;
      bankCache.data = bankData;
      bankCache.recordMap = recordMap;
      bankCache.allRecords = records.filter(function(r) { return r && r.questionId; });
      renderBank();
    }).catch(function(err) {
      container.innerHTML = '<div class="ss-error-box">⚠️ 无法加载题库：' +
        esc(err.message || '网络请求失败') + '。请确认本地服务（http://localhost:8000）已启动。</div>';
    });
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
      details: result ? result.details : null,
      source: q.src === 'ai' ? 'ai' : (q.src === 'exam' ? 'exam' : 'practice'),
      session: 'bank-practice'
    };
    bankCache.recordMap[q.id] = record;
    bankCache.allRecords.push(record);
    fetch(apiUrl('/api/quiz-records'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, record: record })
    }).catch(function (e) { console.warn('记录保存失败:', e); });
  }

  function saveWrongReason(qid, reason) {
    var rec = bankCache.recordMap[qid];
    if (rec) rec.wrongReason = reason;
    fetch(apiUrl('/api/quiz-wrong-reason'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, questionId: qid, wrongReason: reason })
    }).catch(function() {});
  }

  /* ====== 渲染 ====== */
  function renderBank() {
    var container = document.getElementById('bankContainer');
    var data = bankCache.data;
    var recordMap = bankCache.recordMap || {};

    var typeCounts = {}, chapterCounts = {}, sourceCounts = {};
    var statusCounts = { unanswered: 0, correct: 0, wrong: 0 };
    data.forEach(function(q) {
      var t = q.type || 'other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      var c = q.chapter || '未分类';
      chapterCounts[c] = (chapterCounts[c] || 0) + 1;
      var src = getSourceLabel(q);
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      var rec = recordMap[q.id];
      if (!rec) statusCounts.unanswered++;
      else if (rec.isCorrect) statusCounts.correct++;
      else statusCounts.wrong++;
    });

    var chapters = Object.keys(chapterCounts);
    var types = Object.keys(typeCounts);

    var typeChips = types.map(function(t) {
      var m = TYPE_META[t] || { label: t, icon: '' };
      return '<span class="ss-bank-stat-chip">' + m.icon + ' ' + esc(m.label) + ' ' + typeCounts[t] + '</span>';
    }).join('');

    var statusChips =
      '<span class="ss-bank-stat-chip unanswered">未答 ' + statusCounts.unanswered + '</span>' +
      '<span class="ss-bank-stat-chip correct">答对 ' + statusCounts.correct + '</span>' +
      '<span class="ss-bank-stat-chip wrong">答错 ' + statusCounts.wrong + '</span>';

    var sourceChips =
      '<span class="ss-bank-stat-chip practice">练习 ' + (sourceCounts.practice || 0) + '</span>' +
      '<span class="ss-bank-stat-chip" style="background:var(--green-soft);color:var(--green-text)">真题 ' + (sourceCounts.exam || 0) + '</span>' +
      '<span class="ss-bank-stat-chip" style="background:var(--purple-soft);color:var(--accent2)">专项 ' + (sourceCounts.ai || 0) + '</span>';

    var statsHtml =
      '<div class="ss-bank-stats">' +
        '<div class="ss-bank-stat-chips">' +
          '<span class="ss-bank-stat-chip total">总题数 ' + data.length + '</span>' +
          sourceChips +
          statusChips +
          (typeChips || '<span class="ss-bank-stat-chip">暂无</span>') +
        '</div>' +
      '</div>';

    var fc = bankCache.filterChapter, ft = bankCache.filterType, fs = bankCache.filterStatus, fsrc = bankCache.filterSource;

    var chapterOpts = '<option value="">全部章节</option>' +
      chapters.map(function(c) { return '<option value="' + esc(c) + '"' + (c === fc ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
    var typeOpts = '<option value="">全部题型</option>' +
      types.map(function(t) { var m = TYPE_META[t] || { label: t }; return '<option value="' + esc(t) + '"' + (t === ft ? ' selected' : '') + '>' + esc(m.label) + '</option>'; }).join('');
    var statusOpts = '<option value="">全部状态</option>' +
      '<option value="unanswered"' + (fs === 'unanswered' ? ' selected' : '') + '>未答（' + statusCounts.unanswered + '）</option>' +
      '<option value="correct"' + (fs === 'correct' ? ' selected' : '') + '>答对（' + statusCounts.correct + '）</option>' +
      '<option value="wrong"' + (fs === 'wrong' ? ' selected' : '') + '>答错（' + statusCounts.wrong + '）</option>';
    var sourceOpts = '<option value="">全部来源</option>' +
      '<option value="practice"' + (fsrc === 'practice' ? ' selected' : '') + '>练习（' + (sourceCounts.practice || 0) + '）</option>' +
      '<option value="exam"' + (fsrc === 'exam' ? ' selected' : '') + '>真题（' + (sourceCounts.exam || 0) + '）</option>' +
      '<option value="ai"' + (fsrc === 'ai' ? ' selected' : '') + '>专项（' + (sourceCounts.ai || 0) + '）</option>';

    var toolbarHtml =
      '<div class="ss-bank-toolbar">' +
        '<select id="bankFilterChapter" class="ss-bank-select ss-bank-select-chapter">' + chapterOpts + '</select>' +
        '<select id="bankFilterType" class="ss-bank-select ss-bank-select-type">' + typeOpts + '</select>' +
        '<select id="bankFilterSource" class="ss-bank-select ss-bank-select-source">' + sourceOpts + '</select>' +
        '<select id="bankFilterStatus" class="ss-bank-select ss-bank-select-status">' + statusOpts + '</select>' +
        '<span class="ss-bank-toolbar-spacer"></span>' +
      '</div>';

    var filtered = data.filter(function(q) {
      if (fc && (q.chapter || '') !== fc) return false;
      if (ft && (q.type || '') !== ft) return false;
      if (fsrc && getSourceLabel(q) !== fsrc) return false;
      if (fs) {
        var rec = recordMap[q.id];
        if (fs === 'unanswered' && rec) return false;
        if (fs === 'correct' && (!rec || !rec.isCorrect)) return false;
        if (fs === 'wrong' && (!rec || rec.isCorrect)) return false;
      }
      return true;
    });

    var listHtml;
    if (!filtered.length) {
      listHtml = '<div class="ss-empty">' + (data.length ? '当前筛选无匹配题目' : '题库为空') + '</div>';
    } else {
      var groups = {};
      filtered.forEach(function(q) { var c = q.chapter || '未分类'; if (!groups[c]) groups[c] = []; groups[c].push(q); });
      listHtml = Object.keys(groups).map(function(c) {
        var cards = groups[c].map(function(q) { return renderBankCard(q); }).join('');
        return '<div class="ss-bank-group"><div class="ss-bank-group-head"><span>' + esc(c) + '</span><span class="ss-bank-group-count">' + groups[c].length + ' 题</span></div>' + cards + '</div>';
      }).join('');
    }

    container.innerHTML = statsHtml + toolbarHtml + listHtml;

    var fcEl = document.getElementById('bankFilterChapter');
    var ftEl = document.getElementById('bankFilterType');
    var fsEl = document.getElementById('bankFilterStatus');
    var fsrcEl = document.getElementById('bankFilterSource');
    if (fcEl) fcEl.addEventListener('change', function() { bankCache.filterChapter = fcEl.value; renderBank(); });
    if (ftEl) ftEl.addEventListener('change', function() { bankCache.filterType = ftEl.value; renderBank(); });
    if (fsEl) fsEl.addEventListener('change', function() { bankCache.filterStatus = fsEl.value; renderBank(); });
    if (fsrcEl) fsrcEl.addEventListener('change', function() { bankCache.filterSource = fsrcEl.value; renderBank(); });
  }

  /* ====== 题目卡片渲染 — 委托 H.renderCard ====== */
  function renderBankCard(q) {
    var rec = bankCache.recordMap[q.id] || null;
    var isPending = !!pendingAssess[q.id];

    var r = rec;
    if (!r && isPending) {
      r = {
        details: { userAnswer: pendingText[q.id] },
        isCorrect: false, score: 0, total: 1,
        level: null, selfOverride: null, wrongReason: ''
      };
    }

    var typeMeta = TYPE_META[q.type] || { label: q.type || '其他', icon: '' };
    var src = getSourceLabel(q);
    var srcLabel = SOURCE_LABEL[src] || '练习';
    var diff = q.difficulty || 0;
    var diffLabel = diff === 1 ? '简单' : diff === 2 ? '中等' : diff === 3 ? '困难' : '未设';

    /* 题目头部信息（来源/ID/题型/难度 + 删除按钮） */
    var headHtml = '<div class="ss-bank-card-head">' +
      '<span class="ss-bank-source ss-bank-source-' + src + '">' + esc(srcLabel) + '</span>' +
      '<span class="ss-bank-qid">' + esc(q.id || '') + '</span>' +
      '<span class="ss-bank-type">' + typeMeta.icon + ' ' + esc(typeMeta.label) + '</span>' +
      '<span class="ss-bank-diff">' + esc(diffLabel) + '</span>' +
      '<button class="ss-bank-del zk-btn-outline" data-action="bank-delete" data-id="' + esc(q.id || '') + '">删除</button>' +
    '</div>';

    var cardHtml = '';
    if (H && H.renderCard) {
      cardHtml = H.renderCard(q, r, {
        selected: selectedOption[q.id] || '',
        expanded: expandedSet[q.id] === true,
        showSymbol: true,
        showPhoto: true,
        getPhoto: loadPhoto,
        /* 已加入错题库：手动标记 或 答错自动进入 */
        marked: !!markedMap[q.id] || (r && r.isCorrect === false),
        history: bankCache.allRecords.filter(function(rec) { return rec.questionId === q.id; })
      });
    } else {
      cardHtml = '<div class="exam-question"><div class="exam-q-body"><div class="exam-q-text">' + esc(q.question || q.text || '(无题目)') + '</div></div></div>';
    }

    return '<div class="ss-bank-card" data-qid="' + esc(q.id || '') + '">' + headHtml + cardHtml + '</div>';
  }

  /* ====== 事件处理 ====== */
  function handleBankClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;
    var qid = el.dataset.id || el.dataset.qid;
    if (!qid) return;

    if (action === 'bank-delete') {
      var q = findQuestion(qid);
      if (!q) return;
      if (!confirm('确定删除题目「' + (q.id || '') + '」吗？此操作不可恢复。')) return;
      bankCache.data = bankCache.data.filter(function(x) { return x.id !== qid; });
      saveBank();
      return;
    }

    if (action === 'select-option') {
      selectedOption[qid] = el.dataset.letter;
      renderBank();
    } else if (action === 'submit-choice') {
      var qc = findQuestion(qid);
      if (!qc) return;
      var letter = selectedOption[qid];
      if (!letter) { alert('请先选择一个选项'); return; }
      var result = H.scoreChoice(qc, letter);
      delete selectedOption[qid];
      saveRecord(qc, letter, result.level === 'mastered', result.level, result);
      expandedSet[qid] = true;
      renderBank();
    } else if (action === 'submit-fill') {
      var qf = findQuestion(qid);
      if (!qf || !qf.blanks) return;
      var inputs = document.querySelectorAll('[data-blank-id="' + qid + '"]');
      if (!inputs.length) return;
      var userAnswers = [];
      var allFilled = true;
      inputs.forEach(function(inp) { var v = inp.value.trim(); if (!v) allFilled = false; userAnswers.push(v); });
      if (!allFilled) { alert('请填写所有空'); return; }
      var result = H.scoreFill(qf, userAnswers);
      saveRecord(qf, userAnswers.join(' | '), result.level === 'mastered', result.level, result);
      expandedSet[qid] = true;
      renderBank();
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
        expandedSet[qid] = true;
        renderBank();
      } else {
        pendingText[qid] = text;
        pendingAssess[qid] = true;
        renderBank();
      }
    } else if (action === 'self-assess') {
      var q2 = findQuestion(qid);
      if (!q2) return;
      var level = el.dataset.level;
      var isCorrect2 = level === 'mastered';
      var text2 = pendingText[qid] || (bankCache.recordMap[qid] && bankCache.recordMap[qid].userAnswer) || '';
      delete pendingText[qid];
      delete pendingAssess[qid];
      saveRecord(q2, text2, isCorrect2, level);
      expandedSet[qid] = true;
      renderBank();
    } else if (action === 'toggle-ref') {
      expandedSet[qid] = !expandedSet[qid];
      renderBank();
    } else if (action === 'toggle-marked') {
      markedMap[qid] = !markedMap[qid];
      fetch(apiUrl('/api/wrong-marked'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, questionId: qid, marked: markedMap[qid] })
      }).catch(function() {});
      renderBank();
    } else if (action === 'toggle-history') {
      var histPanel = document.getElementById('hist-' + qid);
      if (histPanel) histPanel.style.display = histPanel.style.display === 'none' ? '' : 'none';
    } else if (action === 'redo') {
      delete pendingText[qid];
      delete pendingAssess[qid];
      delete selectedOption[qid];
      delete bankCache.recordMap[qid];
      renderBank();
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
      renderBank();
    } else if (action === 'cancel-wr') {
      var wrEditor2 = document.getElementById('wr-edit-' + qid);
      if (wrEditor2) wrEditor2.style.display = 'none';
    }
  }

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
      renderBank();
    };
    reader.readAsDataURL(file);
  });

  /* 错因输入自动保存 */
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

  function saveBank() {
    renderBank();
    fetch(apiUrl('/api/quiz-bank'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: bankCache.subject, data: bankCache.data.filter(function(q) { return q.src === 'practice' || !q.src; }) })
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res && res.error) { showToast('保存失败：' + res.error, 'error'); loadQuizBank(); }
        else { showToast('已保存', 'success'); }
      })
      .catch(function(err) {
        showToast('保存失败：' + (err.message || '网络错误') + '，请重试', 'error');
        loadQuizBank();
      });
  }

  function switchSubject(subject) {
    if (!SUBJECTS[subject]) subject = "13003";
    currentSubject = subject;
    updateUrl(subject);
    var nameEl = document.getElementById('subjectName');
    if (nameEl) nameEl.textContent = SUBJECTS[subject].name;
    document.title = SUBJECTS[subject].name + ' · 题库管理';
    loadQuizBank();
  }

  /* 全局事件委托 */
  document.addEventListener('click', handleBankClick);

  switchSubject(currentSubject);
})();
