// ============================================================
// 题库管理 — 独立页面 JS
// 从 复盘总结-章节复盘.js 中抽离，新增题目来源筛选
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

  var bankCache = {
    subject: null,
    data: [],
    statusMap: {},
    filterChapter: '',
    filterType: '',
    filterStatus: '',
    filterSource: ''
  };

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
      (window.examDataReady || Promise.resolve()).then(function() {
        var examData = window.EXAM_DATA && window.EXAM_DATA[subject];
        return (examData && examData.questions) || [];
      })
    ]).then(function(res) {
      var bankData = Array.isArray(res[0]) ? res[0] : [];
      var records = Array.isArray(res[1]) ? res[1] : [];
      var aiBatches = Array.isArray(res[2]) ? res[2] : [];
      var examQs = Array.isArray(res[3]) ? res[3] : [];

      aiBatches.forEach(function(batch) {
        var qs = (batch && (batch.items || batch.questions)) || [];
        qs.forEach(function(q) { bankData.push(q); });
      });
      examQs.forEach(function(q) { bankData.push(q); });

      var statusMap = {};
      records.forEach(function(r) {
        if (r && r.questionId) {
          statusMap[r.questionId] = { isCorrect: r.isCorrect, level: r.level };
        }
      });

      bankCache.subject = subject;
      bankCache.data = bankData;
      bankCache.statusMap = statusMap;
      renderBank();
    }).catch(function(err) {
      container.innerHTML = '<div class="ss-error-box">⚠️ 无法加载题库：' +
        esc(err.message || '网络请求失败') + '。请确认本地服务（http://localhost:8000）已启动。</div>';
    });
  }

  function renderBank() {
    var container = document.getElementById('bankContainer');
    var data = bankCache.data;
    var statusMap = bankCache.statusMap || {};

    var typeCounts = {}, chapterCounts = {}, sourceCounts = {};
    var statusCounts = { unanswered: 0, correct: 0, wrong: 0 };
    data.forEach(function(q) {
      var t = q.type || 'other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      var c = q.chapter || '未分类';
      chapterCounts[c] = (chapterCounts[c] || 0) + 1;
      var src = getSourceLabel(q);
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      var st = statusMap[q.id];
      if (!st) statusCounts.unanswered++;
      else if (st.isCorrect) statusCounts.correct++;
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
        var st = statusMap[q.id];
        if (fs === 'unanswered' && st) return false;
        if (fs === 'correct' && (!st || !st.isCorrect)) return false;
        if (fs === 'wrong' && (!st || st.isCorrect)) return false;
      }
      return true;
    });

    var listHtml;
    if (!filtered.length) {
      listHtml = '<div class="ss-empty">' + (data.length ? '当前筛选无匹配题目' : '题库为空，点击「新增题目」添加第一道题') + '</div>';
    } else {
      var groups = {};
      filtered.forEach(function(q) { var c = q.chapter || '未分类'; if (!groups[c]) groups[c] = []; groups[c].push(q); });
      listHtml = Object.keys(groups).map(function(c) {
        var cards = groups[c].map(function(q) { return renderBankCard(q, data.indexOf(q)); }).join('');
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

    container.removeEventListener('click', bankClickHandler);
    container.addEventListener('click', bankClickHandler);
  }

  function bankClickHandler(e) {
    var delBtn = e.target.closest('.ss-bank-del');
    if (delBtn) {
      var idx = parseInt(delBtn.dataset.idx, 10);
      var q = bankCache.data[idx];
      if (!q) return;
      if (!confirm('确定删除题目「' + (q.id || '') + '」吗？此操作不可恢复。')) return;
      bankCache.data.splice(idx, 1);
      saveBank();
    }
  }

  function renderBankCard(q, idx) {
    var typeMeta = TYPE_META[q.type] || { label: q.type || '其他', icon: '' };
    var diff = q.difficulty || 0;
    var diffLabel = diff === 1 ? '简单' : diff === 2 ? '中等' : diff === 3 ? '困难' : '未设';
    var diffStars = diff ? '⭐'.repeat(diff) : '';
    var tags = (Array.isArray(q.tags) && q.tags.length) ? q.tags.map(function(t) { return '<span class="ss-bank-tag">' + esc(t) + '</span>'; }).join('') : '';
    var qText = q.question || q.text || '(无题目)';
    var ansHtml = renderBankAnswer(q);
    var st = (bankCache.statusMap || {})[q.id];
    var statusBadge = !st ? '<span class="ss-bank-status ss-bank-status-unanswered">未答</span>' :
      st.isCorrect ? '<span class="ss-bank-status ss-bank-status-correct">✓ 答对</span>' :
      '<span class="ss-bank-status ss-bank-status-wrong">✗ 答错</span>';
    var src = getSourceLabel(q);
    var srcLabel = SOURCE_LABEL[src] || '练习';
    var srcBadge = '<span class="ss-bank-source ss-bank-source-' + src + '">' + esc(srcLabel) + '</span>';

    return '<div class="ss-bank-card" data-idx="' + idx + '">' +
      '<div class="ss-bank-card-head">' +
        srcBadge +
        '<span class="ss-bank-qid">' + esc(q.id || '') + '</span>' +
        '<span class="ss-bank-type">' + typeMeta.icon + ' ' + esc(typeMeta.label) + '</span>' +
        statusBadge +
        '<span class="ss-bank-diff">' + diffStars + ' ' + esc(diffLabel) + '</span>' +
        '<div class="ss-bank-card-actions">' +
          '<button class="ss-bank-del zk-btn-outline" data-idx="' + idx + '">删除</button>' +
        '</div>' +
      '</div>' +
      '<div class="ss-bank-question">' + esc(qText) + '</div>' +
      ansHtml +
      (q.explanation ? '<div class="ss-bank-explanation">📖 ' + esc(q.explanation) + '</div>' : '') +
      (tags ? '<div class="ss-bank-tags">' + tags + '</div>' : '') +
    '</div>';
  }

  function renderBankAnswer(q) {
    var parts = [];
    if (q.type === 'choice') {
      if (Array.isArray(q.options)) {
        var letters = 'ABCDEFGH';
        parts.push('<div class="ss-bank-options">' + q.options.map(function(o, i) {
          return '<div class="ss-bank-opt">' + (letters[i] || '?') + '. ' + esc(o.replace(/^[A-H]\.\s*/, '')) + '</div>';
        }).join('') + '</div>');
      }
      if (q.answer) parts.push('<div class="ss-bank-answer">答案：<b>' + esc(q.answer) + '</b></div>');
    } else if (q.type === 'fill') {
      if (Array.isArray(q.blanks)) parts.push('<div class="ss-bank-answer">答案：' + q.blanks.map(function(b, i) { return '<b>' + (i + 1) + '.</b> ' + esc((typeof b === 'string' ? b : b.answer) || ''); }).join('　') + '</div>');
    } else if (q.type === 'calculate') {
      if (q.formula) parts.push('<div class="ss-bank-formula">公式：' + esc(q.formula) + '</div>');
      if (q.answer) parts.push('<div class="ss-bank-answer">答案：<b>' + esc(q.answer) + '</b></div>');
    } else if (q.type === 'shortAnswer' || q.type === 'essay' || q.type === 'proof') {
      if (q.referenceAnswer) parts.push('<div class="ss-bank-answer">参考答案：' + esc(q.referenceAnswer) + '</div>');
      if (q.passThreshold) parts.push('<div class="ss-bank-threshold">通过线：' + q.passThreshold + '</div>');
    }
    if (Array.isArray(q.steps) && q.steps.length) parts.push('<div class="ss-bank-steps">步骤：' + q.steps.map(esc).join(' → ') + '</div>');
    return parts.length ? '<div class="ss-bank-ans-block">' + parts.join('') + '</div>' : '';
  }

  function saveBank() {
    renderBank();
    fetch(apiUrl('/api/quiz-bank'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: bankCache.subject, data: bankCache.data })
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

  switchSubject(currentSubject);
})();
