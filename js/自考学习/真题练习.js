/**
 * 真题与模拟 — 页面逻辑
 * 双模式：专项训练（按年份/题型/知识点筛选做题） + 模拟套卷（计时套卷模拟）
 * 数据为占位符，后续替换为 JSON 文件加载
 */
(function() {

  /* ====== 占位数据（后续迁移到 data/exam-papers-{科目}.json）====== */
  var PLACEHOLDER_QUESTIONS = {
    '13015': [
      {
        id: 1, year: '2024', type: '选择题',
        chapter: '第一章·数据表示与编码',
        title: '在补码表示中，-8的8位二进制表示是？',
        options: ['A. 10001000', 'B. 11111000', 'C. 00001000', 'D. 10000000'],
        answer: 'B. 11111000',
        explanation: '正数8的原码为00001000，按位取反得11110111，末位加1得11111000。',
        myAnswer: 'A. 10001000',
        wrongReason: '混淆了原码和补码的取反规则',
        status: 'wrong'
      },
      {
        id: 2, year: '2024', type: '填空题',
        chapter: '第三章·存储系统',
        title: 'Cache的映射方式有直接映射、______和组相联映射三种。',
        answer: '全相联映射',
        explanation: 'Cache映射方式分为：直接映射（简单但冲突率高）、全相联映射（灵活但硬件复杂）、组相联映射（折中方案）。',
        status: 'pending'
      },
      {
        id: 3, year: '2023', type: '简答题',
        chapter: '第四章·指令系统',
        title: '简述RISC和CISC的主要区别。',
        answer: 'RISC：精简指令集，指令长度固定，寄存器多，采用流水线；CISC：复杂指令集，指令长度可变，内存寻址模式多。RISC追求单周期执行，CISC追求指令功能强大。',
        explanation: 'RISC通过简化指令设计提高流水线效率，CISC通过丰富指令减少指令数量。',
        status: 'correct'
      },
      {
        id: 4, year: '2023', type: '计算题',
        chapter: '第三章·存储系统',
        title: '某Cache主存访问时间为100ns，Cache访问时间为10ns，命中率为95%，求平均访问时间。',
        answer: '10×0.95 + 100×0.05 = 9.5 + 5 = 14.5ns',
        explanation: '平均访问时间 = Cache访问时间 × 命中率 + 主存访问时间 × 缺失率。',
        status: 'pending'
      },
      {
        id: 5, year: '2024', type: '选择题',
        chapter: '第二章·运算方法',
        title: '浮点数的尾数规格化后，小数点后第一位应为？',
        options: ['A. 0', 'B. 1', 'C. 不确定', 'D. 取决于符号位'],
        answer: 'B. 1',
        explanation: '规格化浮点数的尾数小数点后第一位必须为1，保证精度不丢失。',
        status: 'correct'
      }
    ],
    '02324': [
      {
        id: 1, year: '2024', type: '选择题',
        chapter: '第一章·命题逻辑',
        title: '命题 P→Q 的逆否命题是？',
        options: ['A. Q→P', 'B. ¬Q→¬P', 'C. ¬P→¬Q', 'D. Q∧¬P'],
        answer: 'B. ¬Q→¬P',
        explanation: 'P→Q 的逆否命题为 ¬Q→¬P，两者等价。',
        myAnswer: 'A. Q→P',
        wrongReason: '混淆了逆命题和逆否命题',
        status: 'wrong'
      },
      {
        id: 2, year: '2024', type: '计算题',
        chapter: '第二章·集合论',
        title: '设 A={1,2,3}，B={2,3,4}，求 A△B（对称差）。',
        answer: 'A△B = (A∪B) - (A∩B) = {1,4,2,3} - {2,3} = {1,4}',
        explanation: '对称差 = 仅属于A或仅属于B的元素。',
        status: 'correct'
      },
      {
        id: 3, year: '2023', type: '证明题',
        chapter: '第五章·图论',
        title: '证明：无向连通图中必有生成树。',
        answer: '若图无回路则本身就是树。若有回路，删除回路中任一边仍连通，重复直到无回路，得到生成树。删边过程有限步终止（边数有限）。',
        explanation: '关键思路：连通图可通过不断删去回路中的边得到生成树。',
        status: 'pending'
      },
      {
        id: 4, year: '2023', type: '简答题',
        chapter: '第三章·代数系统',
        title: '什么是等价关系？举例说明。',
        answer: '等价关系是满足自反性、对称性、传递性的二元关系。如整数模n同余关系：a≡b(mod n)。',
        status: 'correct'
      }
    ],
    '13003': [
      {
        id: 1, year: '2024', type: '选择题',
        chapter: '第四章·树',
        title: '有n个结点的二叉树，深度最小为？',
        options: ['A. ⌈log₂(n+1)⌉', 'B. n', 'C. n/2', 'D. ⌈log₂n⌉'],
        answer: 'A. ⌈log₂(n+1)⌉',
        explanation: '完全二叉树深度最小，n个结点的完全二叉树深度为⌈log₂(n+1)⌉。',
        myAnswer: 'D. ⌈log₂n⌉',
        wrongReason: '记混了n和n+1',
        status: 'wrong'
      },
      {
        id: 2, year: '2024', type: '算法设计题',
        chapter: '第五章·排序',
        title: '写出快速排序的划分（Partition）算法伪代码。',
        answer: '选取基准元素pivot=A[low]，从两端向中间扫描，使pivot左侧均小、右侧均大，返回pivot最终位置。',
        explanation: 'Partition是快排核心，平均时间O(nlogn)，最坏O(n²)。',
        status: 'pending'
      },
      {
        id: 3, year: '2023', type: '填空题',
        chapter: '第六章·查找',
        title: '哈希表解决冲突的常用方法有______和______。',
        answer: '开放地址法、链地址法（拉链法）',
        explanation: '开放地址法包括线性探测、二次探测、双重散列等；链地址法将同义词存储在链表中。',
        status: 'correct'
      },
      {
        id: 4, year: '2024', type: '简答题',
        chapter: '第七章·图',
        title: '简述DFS和BFS的区别及各自的数据结构。',
        answer: 'DFS（深度优先）用栈，沿一条路径走到底再回溯；BFS（广度优先）用队列，逐层访问。DFS空间O(h)（h为深度），BFS空间O(w)（w为最大宽度）。',
        status: 'pending'
      }
    ]
  };

  /* 占位套卷数据 */
  var PLACEHOLDER_PAPERS = {
    '13015': [
      { id: 'p1', year: '2024', title: '2024年10月计算机系统原理', duration: 150, count: 25 },
      { id: 'p2', year: '2023', title: '2023年10月计算机系统原理', duration: 150, count: 25 }
    ],
    '02324': [
      { id: 'p1', year: '2024', title: '2024年10月离散数学', duration: 150, count: 20 },
      { id: 'p2', year: '2023', title: '2023年10月离散数学', duration: 150, count: 20 }
    ],
    '13003': [
      { id: 'p1', year: '2024', title: '2024年10月数据结构与算法', duration: 150, count: 25 },
      { id: 'p2', year: '2023', title: '2023年10月数据结构与算法', duration: 150, count: 25 }
    ]
  };

  var SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
  };

  /* ====== 初始化 ====== */
  var apiUrl = QuizUtils.apiUrl;
  var STORAGE_KEY = 'exam-training-data';
  var currentSubject = QuizUtils.getSubjectFromUrl();
  var allQuestions = [];
  var userStatus = {};  /* 用户状态覆盖（status 字段） */
  var mockTimer = null;

  /* 同类题专项练习状态（声明需早于 init 渲染，供 renderQuestion 读取） */
  var aiPracticeBatches = [];         /* 已持久化的批次（来自 JSON） */
  var aiPracticeLoading = {};         /* 源题 id → 正在生成 */
  var aiPracticeError = {};           /* 源题 id → 错误信息 */
  var aiPracticeCollapsed = {};       /* 源题 id → true 表示折叠（默认折叠，各批次题目平铺展示） */
  var aiPracticeItemExpanded = {};    /* 生成题 id → 展开答案 */

  /* 题目 id 在数据里是数字、在 data-id 属性里是字符串，统一转成字符串作为各类状态表的键 */
  function qkey(id) { return String(id); }

  /* 从真题数据或占位数据加载 */
  function loadData() {
    var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
    var raw = (examData && examData.questions) || PLACEHOLDER_QUESTIONS[currentSubject] || [];
    /* 深拷贝避免修改原始数据 */
    allQuestions = raw.map(function(q) {
      return JSON.parse(JSON.stringify(q));
    });
    /* 从 localStorage 恢复用户状态 */
    var saved = QuizUtils.storageGet(STORAGE_KEY, {});
    if (saved[currentSubject]) {
      userStatus = saved[currentSubject];
      /* 覆盖状态 */
      allQuestions.forEach(function(q) {
        if (userStatus[qkey(q.id)]) {
          q.status = userStatus[qkey(q.id)];
        }
      });
    }
  }

  /* 保存状态到 localStorage */
  function saveStatus() {
    var saved = QuizUtils.storageGet(STORAGE_KEY, {});
    saved[currentSubject] = userStatus;
    QuizUtils.storageSet(STORAGE_KEY, saved);
  }

  /* 解析章节编号：第一章→1, 第2章→2 */
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

  /* 真题状态变化时回写掌握度到 ss_mastery_{subject} */
  function updateExamMastery(chapter, status) {
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
    if (status === 'correct') {
      if (current < 4) state.mastery[chNum] = 4;
    } else if (status === 'wrong') {
      if (current > 1) state.mastery[chNum] = 1;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
    try {
      fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, chapter: chNum, level: state.mastery[chNum] })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ====== 模式切换 ====== */
  document.querySelectorAll('.exam-mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.exam-mode-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      var mode = btn.dataset.mode;
      document.querySelectorAll('.exam-mode-pane').forEach(function(p) {
        p.classList.toggle('active', p.id === 'pane' + (mode === 'training' ? 'Training' : 'Mock'));
      });
      if (mode === 'mock') { initMock(); }
    });
  });

  /* ====== 专项训练：统计 ====== */
  function renderStats() {
    var total = allQuestions.length;
    var done = 0, correct = 0;
    allQuestions.forEach(function(q) {
      if (q.status !== 'pending') done++;
      if (q.status === 'correct') correct++;
    });
    var rate = done > 0 ? Math.round(correct / done * 100) : 0;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statRate').textContent = rate + '%';
  }

  /* ====== 专项训练：筛选下拉填充 ====== */
  function fillFilters() {
    var years = {}, types = {}, chapters = {};
    allQuestions.forEach(function(q) {
      years[q.year] = 1;
      types[q.type] = 1;
      chapters[q.chapter] = 1;
    });
    fillSelect('filterYear', Object.keys(years).sort().reverse());
    fillSelect('filterType', Object.keys(types));
    fillSelect('filterChapter', Object.keys(chapters));

    var pending = 0, correct = 0, wrong = 0;
    allQuestions.forEach(function(q) {
      if (q.status === 'correct') correct++;
      else if (q.status === 'wrong') wrong++;
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
    values.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
    sel.value = current;
  }

  /* ====== 专项训练：题目渲染 ====== */
  function getFiltered() {
    var fy = document.getElementById('filterYear').value;
    var ft = document.getElementById('filterType').value;
    var fc = document.getElementById('filterChapter').value;
    var fs = document.getElementById('filterStatus').value;
    return allQuestions.filter(function(q) {
      return (!fy || q.year === fy) &&
             (!ft || q.type === ft) &&
             (!fc || q.chapter === fc) &&
             (!fs || q.status === fs);
    });
  }

  function statusLabel(s) {
    if (s === 'correct') return '已掌握';
    if (s === 'wrong') return '错题';
    return '待做';
  }

  function renderQuestion(q, showAnswer, showAiPractice) {
    var badges = '<span class="exam-badge exam-badge-year">' + q.year + '</span>' +
                 '<span class="exam-badge exam-badge-type">' + q.type + '</span>' +
                 '<span class="exam-badge exam-badge-chapter">' + q.chapter + '</span>' +
                 '<span class="exam-badge exam-badge-' + q.status + '">' + statusLabel(q.status) + '</span>';

    var optionsHtml = '';
    if (q.options) {
      optionsHtml = '<div class="exam-q-options">';
      q.options.forEach(function(opt) {
        /* 未展开答案时不标注正确项，避免提前泄题 */
        var isCorrect = (showAnswer && opt === q.answer) ? ' is-correct' : '';
        optionsHtml += '<div class="exam-q-option' + isCorrect + '">' + QuizUtils.esc(opt) + '</div>';
      });
      optionsHtml += '</div>';
    }

    var answerHtml = '';
    if (showAnswer) {
      answerHtml = '<div class="exam-q-answer" id="answer-' + q.id + '">';
      answerHtml += answerRow('答案', 'correct', q.answer);
      if (q.explanation) answerHtml += answerRow('解析', 'info', q.explanation);
      if (q.myAnswer) answerHtml += answerRow('我的答案', 'mine', q.myAnswer);
      if (q.wrongReason) answerHtml += answerRow('答错原因', 'reason', q.wrongReason);
      answerHtml += '</div>';
    }

    var toggleBtn = showAnswer
      ? '<span class="exam-link-btn" data-action="toggle" data-id="' + q.id + '">收起 ▲</span>'
      : '<span class="exam-link-btn" data-action="toggle" data-id="' + q.id + '">展开答案 ▼</span>';
    var aiBtn = '<span class="exam-link-btn exam-link-ai" data-action="ai-help" data-id="' + q.id + '">🤖 AI解答</span>';
    var genBtn = aiPracticeLoading[qkey(q.id)]
      ? '<span class="exam-link-btn exam-link-gen exam-link-busy">⏳ 正在生成…</span>'
      : '<span class="exam-link-btn exam-link-gen" data-action="ai-gen" data-id="' + q.id + '">🤖 AI出题</span>';

    var statusBtns = '<div class="exam-q-status-actions">' +
      '<span class="exam-link-btn exam-link-correct" data-action="status" data-id="' + q.id + '" data-status="correct">标记已掌握</span>' +
      '<span class="exam-link-btn exam-link-wrong" data-action="status" data-id="' + q.id + '" data-status="wrong">标记错题</span>' +
      '</div>';

    return '<div class="exam-question" data-qid="' + q.id + '">' +
      '<div class="exam-q-header">' + badges + '</div>' +
      '<div class="exam-q-title">' + AIChat.formatText(q.title) + '</div>' +
      (q.image ? '<div class="exam-q-image"><img src="' + q.image + '" alt="题目图形" loading="lazy" /></div>' : '') +
      optionsHtml +
      '<div class="exam-q-actions">' + toggleBtn + ' ' + aiBtn + ' ' + genBtn + '</div>' +
      answerHtml +
      statusBtns +
      renderAiPracticeArea(q, showAiPractice) +
      '</div>';
  }

  /* 答案4行缩进：标签 + 内容 */
  function answerRow(label, labelClass, content) {
    return '<div class="exam-answer-row">' +
      '<span class="exam-answer-label exam-label-' + labelClass + '">' + label + '</span>' +
      '<span class="exam-answer-text">' + AIChat.formatText(content) + '</span>' +
      '</div>';
  }

  /* 记录哪些题目展开答案 */
  var expandedSet = {};

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
    var wrongs = allQuestions.filter(function(q) { return q.status === 'wrong'; });
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
        '<button class="exam-nav-toggle" onclick="toggleExamNav()">▾</button></div>';
      return;
    }

    var answered = 0;
    var items = filtered.map(function(q, i) {
      var cls = 'pending';
      if (q.status === 'correct') { cls = 'correct'; answered++; }
      else if (q.status === 'wrong') { cls = 'wrong'; answered++; }
      var title = (q.year || '') + ' · ' + (q.type || '') + ' · ' + (q.chapter || '');
      return '<div class="exam-nav-item ' + cls + '" onclick="examNavJump(' + q.id + ')" title="' + title + '">' + (i + 1) + '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="exam-nav-header">' +
        '<span class="exam-nav-count">已答 ' + answered + '/' + filtered.length + '</span>' +
        '<button class="exam-nav-toggle" onclick="toggleExamNav()">▾</button>' +
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
      panel.innerHTML = '<button class="exam-nav-collapsed-btn" onclick="toggleExamNav()">📋</button>';
    }
  }

  /* ====== 事件代理：展开/收起答案 + 状态标记 + AI解答 ====== */
  function handleQuestionClick(e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.action) return;
    var qid = el.dataset.id;
    if (el.dataset.action === 'toggle') {
      expandedSet[qid] = !expandedSet[qid];
      renderTrainingList();
      renderWrongList();
    } else if (el.dataset.action === 'ai-help') {
      toggleAIHelp(qid, el);
    } else if (el.dataset.action === 'ai-gen') {
      generateSimilarQuestions(qid);
    } else if (el.dataset.action === 'ai-practice-toggle') {
      aiPracticeCollapsed[qid] = (aiPracticeCollapsed[qid] === false);
      renderTrainingList();
      renderWrongList();
    } else if (el.dataset.action === 'ai-item-toggle') {
      aiPracticeItemExpanded[qid] = !aiPracticeItemExpanded[qid];
      renderTrainingList();
      renderWrongList();
    } else if (el.dataset.action === 'ai-toggle') {
      var aiQ = aiExamQuestions.find(function(x) { return x.id === qid; });
      if (aiQ) {
        aiQ._expanded = !aiQ._expanded;
        renderAIExamList();
      }
    } else if (el.dataset.action === 'status') {
      var newStatus = el.dataset.status;
      var q = allQuestions.find(function(x) { return x.id == qid; });
      if (q) {
        q.status = newStatus;
        userStatus[qid] = newStatus;
        saveStatus();
        updateExamMastery(q.chapter, newStatus);
        renderAll();
      }
    }
  }

  /* 三个题目容器（专项训练 / 错题回顾 / AI出题）共用同一套事件代理 */
  ['trainingList', 'wrongList', 'aiExamList'].forEach(function(id) {
    var box = document.getElementById(id);
    if (box) box.addEventListener('click', handleQuestionClick);
  });

  /* 筛选变化 */
  ['filterYear', 'filterType', 'filterChapter', 'filterStatus'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', function() { renderTrainingList(); renderExamNav(); });
  });

  /* ====== 模拟套卷 ====== */
  function initMock() {
    var examData = window.EXAM_DATA && window.EXAM_DATA[currentSubject];
    var papers = (examData && examData.papers) || PLACEHOLDER_PAPERS[currentSubject] || [];
    var sel = document.getElementById('mockPaper');
    sel.innerHTML = '<option value="">选择套卷</option>';
    papers.forEach(function(p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title + '（' + p.count + '题 / ' + p.duration + '分钟）';
      sel.appendChild(opt);
    });
    renderMockHistory();
  }

  function renderMockHistory() {
    var key = 'exam-mock-scores-' + currentSubject;
    var scores = QuizUtils.storageGet(key, []);
    var html = '<div class="exam-mock-history-title">历史成绩</div>';
    if (scores.length === 0) {
      html += '<div>暂无模拟记录</div>';
    } else {
      scores.slice(-5).forEach(function(s) {
        html += '<div class="exam-mock-history-item">' +
          '<span>' + s.title + '</span>' +
          '<span>得分 <b>' + s.score + '</b>/' + s.total + '</span>' +
          '<span>用时 ' + s.usedTime + '分钟</span>' +
          '<span>' + s.date + '</span>' +
          '</div>';
      });
    }
    document.getElementById('mockHistory').innerHTML = html;
  }

  /* 开始模拟 */
  document.getElementById('mockStart').addEventListener('click', function() {
    var paperId = document.getElementById('mockPaper').value;
    if (!paperId) { alert('请先选择套卷'); return; }
    var papers = PLACEHOLDER_PAPERS[currentSubject] || [];
    var paper = papers.find(function(p) { return p.id === paperId; });
    if (!paper) return;

    document.getElementById('mockSetup').style.display = 'none';
    document.getElementById('mockResult').style.display = 'none';
    document.getElementById('mockExam').style.display = 'block';

    /* 用占位题目渲染套卷 */
    var questions = allQuestions.slice();
    document.getElementById('mockProgress').textContent = '共 ' + questions.length + ' 题';
    document.getElementById('mockList').innerHTML = questions.map(function(q, i) {
      return renderMockQuestion(q, i);
    }).join('');

    /* 启动计时器 */
    startMockTimer(paper.duration, paper);
  });

  function renderMockQuestion(q, idx) {
    var optionsHtml = '';
    if (q.options) {
      optionsHtml = '<div class="exam-q-options">';
      q.options.forEach(function(opt) {
        var letter = opt.charAt(0);
        optionsHtml += '<div class="exam-q-option exam-mock-option" data-qid="' + q.id + '" data-letter="' + letter + '" style="cursor:pointer">' + QuizUtils.esc(opt) + '</div>';
      });
      optionsHtml += '</div>';
    }
    return '<div class="exam-question" data-qid="' + q.id + '">' +
      '<div class="exam-q-header">' +
      '<span class="exam-badge exam-badge-type">第' + (idx + 1) + '题</span>' +
      '<span class="exam-badge exam-badge-year">' + q.year + '</span>' +
      '<span class="exam-badge exam-badge-chapter">' + q.chapter + '</span>' +
      '</div>' +
      '<div class="exam-q-title">' + AIChat.formatText(q.title) + '</div>' +
      (q.image ? '<div class="exam-q-image"><img src="' + q.image + '" alt="题目图形" loading="lazy" /></div>' : '') +
      optionsHtml +
      '</div>';
  }

  /* 计时器 */
  function startMockTimer(duration, paper) {
    var remain = duration * 60;
    var startTime = Date.now();
    if (mockTimer) clearInterval(mockTimer);
    updateTimer(remain);
    mockTimer = setInterval(function() {
      remain--;
      if (remain <= 0) {
        clearInterval(mockTimer);
        mockTimer = null;
        submitMock(paper, startTime);
      } else {
        updateTimer(remain);
      }
    }, 1000);
  }

  function updateTimer(remain) {
    var m = Math.floor(remain / 60);
    var s = remain % 60;
    document.getElementById('mockTimer').textContent = '⏱ ' +
      String(m).padStart(3, '0') + ':' + String(s).padStart(2, '0');
  }

  /* 模拟答题：记录用户选择 */
  var mockAnswers = {};
  document.getElementById('mockList').addEventListener('click', function(e) {
    var el = e.target;
    if (!el.classList.contains('exam-mock-option')) return;
    var qid = parseInt(el.dataset.qid);
    var letter = el.dataset.letter;
    /* 清除同题其他选项的高亮 */
    document.querySelectorAll('.exam-mock-option[data-qid="' + qid + '"]').forEach(function(o) {
      o.style.borderColor = 'transparent';
      o.style.fontWeight = 'normal';
    });
    el.style.borderColor = 'var(--accent)';
    el.style.fontWeight = '600';
    mockAnswers[qid] = letter;
  });

  /* 交卷 */
  document.getElementById('mockSubmit').addEventListener('click', function() {
    var paperId = document.getElementById('mockPaper').value;
    var papers = PLACEHOLDER_PAPERS[currentSubject] || [];
    var paper = papers.find(function(p) { return p.id === paperId; });
    if (!paper) return;
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    /* 估算开始时间（从计时器剩余推算） */
    var usedTime = paper.duration - Math.floor((parseInt(document.getElementById('mockTimer').textContent.replace(/\D/g, '')) || 0) / 60);
    submitMock(paper, Date.now() - (paper.duration * 60 - (paper.duration * 60 - (paper.duration * 60))) * 1000);
  });

  function submitMock(paper, startTime) {
    var questions = allQuestions.slice();
    var correct = 0, answered = 0;
    questions.forEach(function(q) {
      if (mockAnswers[q.id]) {
        answered++;
        /* 比较首字母 */
        var correctLetter = q.answer.charAt(0);
        if (mockAnswers[q.id] === correctLetter) correct++;
      }
    });
    var total = questions.length;
    var score = Math.round(correct / total * 100);

    /* 显示成绩 */
    document.getElementById('mockExam').style.display = 'none';
    document.getElementById('mockSetup').style.display = 'block';
    document.getElementById('mockResult').style.display = 'block';
    document.getElementById('mockScore').innerHTML =
      '<div class="exam-mock-score-num">' + score + ' 分</div>' +
      '<div class="exam-mock-score-detail">' +
      '<span>答对 <b>' + correct + '</b> 题</span>' +
      '<span>答错 <b>' + (answered - correct) + '</b> 题</span>' +
      '<span>未答 <b>' + (total - answered) + '</b> 题</span>' +
      '</div>';

    /* 保存成绩 */
    var key = 'exam-mock-scores-' + currentSubject;
    var scores = QuizUtils.storageGet(key, []);
    scores.push({
      title: paper.title,
      score: score, total: 100,
      usedTime: paper.duration,
      date: new Date().toLocaleDateString('zh-CN')
    });
    QuizUtils.storageSet(key, scores);
    renderMockHistory();

    /* 重置 */
    mockAnswers = {};
  }

  /* 重新模拟 */
  document.getElementById('mockRetry').addEventListener('click', function() {
    document.getElementById('mockResult').style.display = 'none';
    document.getElementById('mockPaper').value = '';
  });

  /* ====== 初始化 ====== */
  document.getElementById('subjectTag').textContent = SUBJECT_NAMES[currentSubject] || currentSubject;
  loadData();
  fillFilters();
  renderAll();
  /* 回显已持久化的同类题专项练习（AI出题生成的结果） */
  loadAiPractice().then(function() {
    if (aiPracticeBatches.length) {
      renderTrainingList();
      renderWrongList();
    }
  });

  /* 暴露导航函数到全局作用域（IIFE 内部函数需挂载到 window 才能被 HTML onclick 调用） */
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

  /* 每个卡片独立的 AI 面板实例 key（避免专项训练区/错题回顾区同题 id 冲突） */
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
      '<input type="text" class="ai-help-input" id="ai-input-' + key + '" placeholder="输入你的问题..." onkeydown="if(event.key===\'Enter\')sendAIHelp(\'' + key + '\',\'' + qId + '\')">' +
      '<button class="ai-help-send zk-btn-primary" id="ai-send-' + key + '" onclick="sendAIHelp(\'' + key + '\',\'' + qId + '\')">发送</button>' +
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
      questionContext += '题型：' + (q.typeLabel || q.type || '') + '\n';
      questionContext += '题目：' + (q.title || q.question || '') + '\n';
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
    }).catch(function() {
      /* 错误提示已在 onError 中处理，此处仅避免未捕获的 Promise rejection */
    });
  }

  /* ====== AI 出题（专项练习）====== */
  var aiExamLoading = false;
  var aiExamQuestions = [];

  /* 顶部快捷入口：切到专项训练 → 滚动到出题区 → 触发生成 */
  function jumpToAIExam() {
    var pane = document.getElementById('paneTraining');
    if (pane && !pane.classList.contains('active')) {
      var trainBtn = document.querySelector('.exam-mode-btn[data-mode="training"]');
      if (trainBtn) trainBtn.click();
    }
    var sec = document.querySelector('.exam-ai-section');
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    generateAIExamQuestions();
  }

  /* 统一管理出题按钮的加载态（顶部快捷入口 + 区块内按钮） */
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
      var parts = ['例题' + (i+1) + '（' + q.type + '）：' + (q.title || '')];
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
      '题型要求：' + (typeFilter || '不限题型，覆盖选择题、填空题、简答题、计算题') + '\n\n' +
      '参考真题风格：\n' + sampleText + '\n\n' +
      '要求：\n' +
      '1. 生成5道题，难度和风格接近真题\n' +
      '2. 每题包含id、year(设为"AI生成")、type、chapter、title、answer、explanation、status(设为"pending")字段\n' +
      '3. 选择题包含options数组（4个选项）\n' +
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
        q.status = q.status || 'pending';
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
        list.innerHTML = '<div class="exam-empty">⚠️ AI出题失败：' + AIChat.formatError(err) + '<br><button onclick="generateAIExamQuestions()" class="exam-link-btn">重试</button></div>';
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
      var expanded = q._expanded;
      var toggleLabel = expanded ? '收起 ▲' : '展开答案 ▼';
      var answerHtml = '';
      if (expanded) {
        answerHtml = '<div class="exam-q-answer">' +
          answerRow('答案', 'correct', q.answer || '') +
          (q.explanation ? answerRow('解析', 'info', q.explanation) : '') +
          '</div>';
      }
      return '<div class="exam-question exam-ai-question" data-qid="' + q.id + '">' +
        '<div class="exam-q-header">' +
        '<span class="exam-badge exam-badge-ai">AI生成</span>' +
        '<span class="exam-badge exam-badge-type">' + (q.type || '') + '</span>' +
        '<span class="exam-badge exam-badge-chapter">' + (q.chapter || '') + '</span>' +
        '</div>' +
        '<div class="exam-q-title">' + AIChat.formatText(q.title) + '</div>' +
        (q.options ? '<div class="exam-q-options">' + q.options.map(function(opt) {
          return '<div class="exam-q-option">' + QuizUtils.esc(opt) + '</div>';
        }).join('') + '</div>' : '') +
        '<div class="exam-q-actions">' +
        '<span class="exam-link-btn" data-action="ai-toggle" data-id="' + q.id + '">' + toggleLabel + '</span>' +
        ' <span class="exam-link-btn exam-link-ai" data-action="ai-help" data-id="' + q.id + '">🤖 AI解答</span>' +
        '</div>' +
        answerHtml +
        '</div>';
    }).join('');
  }

  /* ====== 同类题专项练习（每道题下方 AI出题 → 生成同类型题 → 持久化） ====== */
  /* 题型中文名 ↔ 题库（quiz-bank）英文 token 映射 */
  var TYPE_TOKEN = {
    '选择题': 'choice', '填空题': 'fill', '计算题': 'calculate',
    '简答题': 'shortAnswer', '论述题': 'essay', '证明题': 'proof'
  };
  var TYPE_LABEL = {
    choice: '选择题', fill: '填空题', calculate: '计算题',
    shortAnswer: '简答题', essay: '论述题', proof: '证明题'
  };
  var AI_PRACTICE_PER_BATCH = 5;      /* 每批生成题数 */

  function formatNow() {
    var d = new Date();
    var p = function(n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* 统一按 id 查题：真题 → 底部AI出题 → 同类题生成题 */
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
    }).catch(function() {
      /* 写入失败不阻断界面，数据仍在内存中 */
    });
  }

  function batchesForQuestion(qid) {
    return aiPracticeBatches.filter(function(b) {
      return b && b.source && String(b.source.questionId) === String(qid);
    });
  }

  /* 题目卡片下方的同类题区域：各批次的题按生成顺序平铺，不再分批显示 */
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

  /* 单道生成题：样式与真题一致（展开答案 + AI解答） */
  function renderAiItemCard(item) {
    var expanded = !!aiPracticeItemExpanded[qkey(item.id)];
    var optionsHtml = '';
    if (item.options && item.options.length) {
      optionsHtml = '<div class="exam-q-options">' +
        item.options.map(function(opt) {
          /* 未展开答案时不标注正确项，避免提前泄题 */
          var isCorrect = (expanded && opt === item.answer) ? ' is-correct' : '';
          return '<div class="exam-q-option' + isCorrect + '">' + QuizUtils.esc(opt) + '</div>';
        }).join('') + '</div>';
    }
    var answerHtml = '';
    if (expanded) {
      answerHtml = '<div class="exam-q-answer">' +
        answerRow('答案', 'correct', item.answer || '') +
        (item.explanation ? answerRow('解析', 'info', item.explanation) : '') +
        '</div>';
    }
    return '<div class="exam-question exam-ai-question" data-qid="' + QuizUtils.esc(item.id) + '">' +
      '<div class="exam-q-header">' +
        '<span class="exam-badge exam-badge-ai">AI生成</span>' +
        '<span class="exam-badge exam-badge-type">' +
          QuizUtils.esc(item.typeLabel || TYPE_LABEL[item.type] || '题目') + '</span>' +
        '<span class="exam-badge exam-badge-chapter">' + QuizUtils.esc(item.chapter || '') + '</span>' +
      '</div>' +
      '<div class="exam-q-title">' + AIChat.formatText(item.question || '') + '</div>' +
      optionsHtml +
      '<div class="exam-q-actions">' +
        '<span class="exam-link-btn" data-action="ai-item-toggle" data-id="' +
          QuizUtils.esc(item.id) + '">' + (expanded ? '收起 ▲' : '展开答案 ▼') + '</span>' +
        ' <span class="exam-link-btn exam-link-ai" data-action="ai-help" data-id="' +
          QuizUtils.esc(item.id) + '">🤖 AI解答</span>' +
      '</div>' +
      answerHtml +
      '</div>';
  }

  /* 以某道真题为模板生成同类型题 */
  function generateSimilarQuestions(qid) {
    if (aiPracticeLoading[qid]) return;
    var q = allQuestions.find(function(x) { return x.id == qid; });
    if (!q) return;
    delete aiPracticeError[qid];
    aiPracticeLoading[qid] = true;
    renderTrainingList();
    renderWrongList();

    var typeToken = TYPE_TOKEN[q.type] || 'choice';
    var prompt = '你是自考出题专家。请根据下面这道真题，出 ' + AI_PRACTICE_PER_BATCH +
      ' 道同类型的题目，用于专项练习。\n\n' +
      '科目：' + (SUBJECT_NAMES[currentSubject] || '') + '\n' +
      '原题年份：' + (q.year || '未知') + '\n' +
      '原题题型：' + (q.type || '') + '（type 字段固定填 "' + typeToken + '"）\n' +
      '原题章节：' + (q.chapter || '') + '\n' +
      '原题题干：' + (q.title || '') + '\n' +
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
      var batchId = 'b-' + currentSubject + '-' + stamp;
      var normalized = items.map(function(it, i) {
        return {
          id: 'ai-' + currentSubject + '-' + stamp + '-' + (i + 1),
          question: it.question || it.title || '',
          type: TYPE_TOKEN[q.type] || it.type || 'choice',
          typeLabel: q.type || TYPE_LABEL[it.type] || '题目',
          options: (it.options && it.options.length) ? it.options : null,
          answer: it.answer || '',
          explanation: it.explanation || '',
          chapter: q.chapter || '',
          cardId: null,
          src: 'ai'
        };
      });
      var batch = {
        batchId: batchId,
        subject: currentSubject,
        source: {
          questionId: q.id,
          year: q.year || '',
          type: q.type || '',
          typeToken: TYPE_TOKEN[q.type] || '',
          chapter: q.chapter || '',
          title: q.title || ''
        },
        generatedAt: formatNow(),
        items: normalized
      };
      aiPracticeBatches.push(batch);
      aiPracticeCollapsed[qkey(q.id)] = false;   /* 新生成后默认展开该题的同类型题 */
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

  window.generateSimilarQuestions = generateSimilarQuestions;
  window.loadAiPractice = loadAiPractice;

  window.toggleAIHelp = toggleAIHelp;
  window.sendAIHelp = sendAIHelp;
  window.generateAIExamQuestions = generateAIExamQuestions;
  window.jumpToAIExam = jumpToAIExam;
  window.toggleExamNav = toggleExamNav;
  window.examNavJump = examNavJump;

})();
