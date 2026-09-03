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
  var STORAGE_KEY = 'exam-training-data';
  var currentSubject = QuizUtils.getSubjectFromUrl();
  var allQuestions = [];
  var userStatus = {};  /* 用户状态覆盖（status 字段） */
  var mockTimer = null;

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
        if (userStatus[q.id]) {
          q.status = userStatus[q.id];
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

  function renderQuestion(q, showAnswer) {
    var badges = '<span class="exam-badge exam-badge-year">' + q.year + '</span>' +
                 '<span class="exam-badge exam-badge-type">' + q.type + '</span>' +
                 '<span class="exam-badge exam-badge-chapter">' + q.chapter + '</span>' +
                 '<span class="exam-badge exam-badge-' + q.status + '">' + statusLabel(q.status) + '</span>';

    var optionsHtml = '';
    if (q.options) {
      optionsHtml = '<div class="exam-q-options">';
      q.options.forEach(function(opt) {
        var isCorrect = (opt === q.answer) ? ' is-correct' : '';
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

    var statusBtns = '<div class="exam-q-status-actions">' +
      '<span class="exam-link-btn exam-link-correct" data-action="status" data-id="' + q.id + '" data-status="correct">标记已掌握</span>' +
      '<span class="exam-link-btn exam-link-wrong" data-action="status" data-id="' + q.id + '" data-status="wrong">标记错题</span>' +
      '<span class="exam-link-btn exam-link-muted" data-action="status" data-id="' + q.id + '" data-status="pending">标记待做</span>' +
      '</div>';

    return '<div class="exam-question" data-qid="' + q.id + '">' +
      '<div class="exam-q-header">' + badges + '</div>' +
      '<div class="exam-q-title">' + QuizUtils.esc(q.title) + '</div>' +
      (q.image ? '<div class="exam-q-image"><img src="' + q.image + '" alt="题目图形" loading="lazy" /></div>' : '') +
      optionsHtml +
      '<div class="exam-q-actions">' + toggleBtn + '</div>' +
      answerHtml +
      statusBtns +
      '</div>';
  }

  /* 答案4行缩进：标签 + 内容 */
  function answerRow(label, labelClass, content) {
    return '<div class="exam-answer-row">' +
      '<span class="exam-answer-label exam-label-' + labelClass + '">' + label + '</span>' +
      '<span class="exam-answer-text">' + QuizUtils.esc(content) + '</span>' +
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
      return renderQuestion(q, expandedSet[q.id]);
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
      return renderQuestion(q, true);
    }).join('');
  }

  function renderAll() {
    renderStats();
    renderTrainingList();
    renderWrongList();
  }

  /* ====== 事件代理：展开/收起答案 + 状态标记 ====== */
  document.getElementById('trainingList').addEventListener('click', function(e) {
    var el = e.target;
    if (!el.dataset.action) return;
    var qid = parseInt(el.dataset.id);
    if (el.dataset.action === 'toggle') {
      expandedSet[qid] = !expandedSet[qid];
      renderTrainingList();
    } else if (el.dataset.action === 'status') {
      var newStatus = el.dataset.status;
      var q = allQuestions.find(function(x) { return x.id === qid; });
      if (q) {
        q.status = newStatus;
        userStatus[qid] = newStatus;
        saveStatus();
        renderAll();
      }
    }
  });

  /* 筛选变化 */
  ['filterYear', 'filterType', 'filterChapter', 'filterStatus'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', renderTrainingList);
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
      '<div class="exam-q-title">' + QuizUtils.esc(q.title) + '</div>' +
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

})();
