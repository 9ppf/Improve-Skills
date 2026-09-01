/* 真题练习-真题与错题本 页面逻辑 */
var STORAGE_KEY = 'exam-questions-data';
var currentSubject = QuizUtils.getSubjectFromUrl();
var allData = {};

function loadData() {
  allData = QuizUtils.storageGet(STORAGE_KEY, {});
}

function saveData() {
  QuizUtils.storageSet(STORAGE_KEY, allData);
}

function getQuestions(subject) {
  if (!allData[subject]) allData[subject] = [];
  return allData[subject];
}

function statusLabel(s) {
  if (s === 'correct') return '已掌握';
  if (s === 'wrong') return '错题';
  return '待做';
}

function renderStats() {
  var qs = getQuestions(currentSubject);
  var correct = 0, wrong = 0, pending = 0;
  qs.forEach(function(q) {
    if (q.status === 'correct') correct++;
    else if (q.status === 'wrong') wrong++;
    else pending++;
  });
  document.getElementById('statTotal').textContent = qs.length;
  document.getElementById('statCorrect').textContent = correct;
  document.getElementById('statWrong').textContent = wrong;
  document.getElementById('statPending').textContent = pending;
}

function renderQuestions() {
  var qs = getQuestions(currentSubject);
  var fy = document.getElementById('filterYear').value;
  var ft = document.getElementById('filterType').value;
  var fs = document.getElementById('filterStatus').value;

  var filtered = qs.filter(function(q) {
    return (!fy || q.year === fy) && (!ft || q.type === ft) && (!fs || q.status === fs);
  });

  var list = document.getElementById('questionList');
  if (filtered.length === 0) {
    list.innerHTML = '<div class="exam-empty">暂无题目，点击上方「添加到题库」开始记录真题</div>';
    return;
  }

  list.innerHTML = filtered.map(function(q, i) {
    return '<div class="exam-question">' +
      '<div class="exam-question-header">' +
      '<span class="exam-badge exam-badge-year">' + q.year + '</span>' +
      '<span class="exam-badge exam-badge-type">' + q.type + '</span>' +
      '<span class="exam-badge exam-badge-status-' + q.status + '">' + statusLabel(q.status) + '</span>' +
      '</div>' +
      '<div class="exam-question-title">' + q.title + '</div>' +
      (q.body ? '<div class="exam-question-body">' + q.body.replace(/</g, '&lt;') + '</div>' : '') +
      '<div class="exam-question-actions">' +
      '<button class="exam-btn" onclick="setStatus(\'' + currentSubject + '\',' + q.id + ',\'correct\')">✓ 标记掌握</button>' +
      '<button class="exam-btn exam-btn-wrong" onclick="setStatus(\'' + currentSubject + '\',' + q.id + ',\'wrong\')">✗ 标记错题</button>' +
      '<button class="exam-btn" onclick="setStatus(\'' + currentSubject + '\',' + q.id + ',\'pending\')">○ 标记待做</button>' +
      '<button class="exam-btn exam-btn-wrong" onclick="deleteQuestion(\'' + currentSubject + '\',' + q.id + ')">删除</button>' +
      '</div></div>';
  }).join('');
}

function renderWrong() {
  var qs = getQuestions(currentSubject);
  var wrongs = qs.filter(function(q) { return q.status === 'wrong'; });
  var list = document.getElementById('wrongList');
  if (wrongs.length === 0) {
    list.innerHTML = '<div class="exam-empty">暂无错题，继续加油！</div>';
    return;
  }
  list.innerHTML = wrongs.map(function(q) {
    return '<div class="exam-question">' +
      '<div class="exam-question-header">' +
      '<span class="exam-badge exam-badge-year">' + q.year + '</span>' +
      '<span class="exam-badge exam-badge-type">' + q.type + '</span>' +
      '<span class="exam-badge exam-badge-status-wrong">错题</span>' +
      '</div>' +
      '<div class="exam-question-title">' + q.title + '</div>' +
      (q.body ? '<div class="exam-question-body">' + q.body.replace(/</g, '&lt;') + '</div>' : '') +
      '<div class="exam-question-actions">' +
      '<button class="exam-btn" onclick="setStatus(\'' + currentSubject + '\',' + q.id + ',\'correct\')">✓ 已攻克</button>' +
      '</div></div>';
  }).join('');
}

function setStatus(subject, id, status) {
  var qs = getQuestions(subject);
  var q = qs.find(function(x) { return x.id === id; });
  if (q) { q.status = status; saveData(); renderAll(); }
}

function deleteQuestion(subject, id) {
  var qs = getQuestions(subject);
  var idx = qs.findIndex(function(x) { return x.id === id; });
  if (idx >= 0) { qs.splice(idx, 1); saveData(); renderAll(); }
}

function addQuestion() {
  var year = document.getElementById('qYear').value;
  var type = document.getElementById('qType').value;
  var title = document.getElementById('qTitle').value.trim();
  var status = document.getElementById('qStatus').value;
  var body = document.getElementById('qBody').value.trim();

  if (!year || !type || !title) {
    alert('请填写年份、题型和标题');
    return;
  }

  var qs = getQuestions(currentSubject);
  var id = Date.now();
  qs.push({ id: id, year: year, type: type, title: title, status: status, body: body });
  saveData();

  document.getElementById('qYear').value = '';
  document.getElementById('qType').value = '';
  document.getElementById('qTitle').value = '';
  document.getElementById('qBody').value = '';
  document.getElementById('qStatus').value = 'pending';
  renderAll();
}

function renderAll() {
  renderStats();
  renderQuestions();
  renderWrong();
}

function switchSubject(subject) {
  currentSubject = subject;
  document.querySelectorAll('.exam-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.subject === subject);
  });
  renderAll();
}

document.querySelectorAll('.exam-tab').forEach(function(t) {
  t.addEventListener('click', function() { switchSubject(t.dataset.subject); });
});
document.getElementById('filterYear').addEventListener('change', renderQuestions);
document.getElementById('filterType').addEventListener('change', renderQuestions);
document.getElementById('filterStatus').addEventListener('change', renderQuestions);
document.getElementById('addBtn').addEventListener('click', addQuestion);

loadData();
switchSubject(currentSubject);
