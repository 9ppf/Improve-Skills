/* 知识框架-三科共用 页面逻辑
 * 包含：掌握度系统、章节Tab切换、Learning Guide注释（v2遗留）、JSON数据驱动渲染
 */

// ===== 模块一：掌握度系统 + 目录状态 =====
(function() {

  // 科目参数化（方案A-1）：单页面通过 ?subject= 支持三科
  // display=页面标题名 | plan=study-plan.json/learning-guide.json 科目键名
  var SUBJECT_META = {
    '13015': { display: '计算机系统原理', plan: '系统原理' },
    '02324': { display: '离散数学', plan: '离散数学' },
    '13003': { display: '数据结构与算法', plan: '数据结构' }
  };
  var SS_SUBJECT = '02324';
  (function() {
    try {
      var m = (location.search.match(/[?&]subject=([^&]+)/) || [])[1];
      if (m && SUBJECT_META[m]) SS_SUBJECT = m;
    } catch(e) {}
  })();
  var SUBJECT_NAME = SUBJECT_META[SS_SUBJECT] ? SUBJECT_META[SS_SUBJECT].display : '离散数学';
  var PLAN_SUBJECT = SUBJECT_META[SS_SUBJECT] ? SUBJECT_META[SS_SUBJECT].plan : '离散数学';

  // 动态设置页面标题与科目标签
  try {
    document.title = SS_SUBJECT + ' ' + SUBJECT_NAME + ' · 目录与知识框架';
    var kfTag = document.querySelector('.kf-subject-tag');
    if (kfTag) kfTag.textContent = SS_SUBJECT + ' ' + SUBJECT_NAME;
  } catch(e) {}

  // 暴露给后续脚本模块（学习指南/JSON 驱动）使用
  window.SS_SUBJECT = SS_SUBJECT;
  window.SUBJECT_NAME = SUBJECT_NAME;
  window.PLAN_SUBJECT = PLAN_SUBJECT;

  // 修正兜底内容中练习测验链接的科目参数（默认写死 02324）
  try {
    var quizLinks = document.querySelectorAll('a[href*="练习测验.html?subject=02324"]');
    for (var qi = 0; qi < quizLinks.length; qi++) {
      quizLinks[qi].href = quizLinks[qi].href.replace('subject=02324', 'subject=' + SS_SUBJECT);
    }
  } catch(e) {}

  var STORAGE_KEY = "ss_mastery_" + SS_SUBJECT;

  // ===== API Sync: localStorage + JSON dual write =====

  var _saveTimer = null;

  // 防止 API 数据加载完成前用户操作覆盖服务器数据
  var _apiLoaded = false;



  function saveStateToAPI(state) {

    if (_saveTimer) clearTimeout(_saveTimer);

    _saveTimer = setTimeout(function() {

      try {

        fetch('/api/mastery', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ subject: SS_SUBJECT, data: state })

        }).catch(function(e) {});

      } catch(e) {}

    }, 500);

  }



  function syncFromAPI() {

    try {

      fetch('/api/mastery?subject=' + SS_SUBJECT)

        .then(function(r) { return r.json(); })

        .then(function(apiState) {

          _apiLoaded = true;

          if (apiState && apiState.mastery && Object.keys(apiState.mastery).length > 0) {

            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apiState)); } catch(e) {}

            syncUI();

          }

        })

        .catch(function(e) { _apiLoaded = true; });

    } catch(e) { _apiLoaded = true; }

  }



  // 5 档掌握度：0待学习(灰) 1学习中(蓝) 2不会(红) 3不熟(橙) 4掌握(绿)
  // 旧 4 档迁移：0→0 1→1 2(已掌握)→4(掌握) 3(需复习)→3(不熟)
  var MASTERY_LABELS = ["待学习", "学习中", "不会", "不熟", "掌握"];
  var LEGACY_MASTERY_MAP = { 0: 0, 1: 1, 2: 4, 3: 3 };

  var DIFFICULTY_LABELS = { 1: "基础", 2: "中等", 3: "难点" };



  var CHAPTER_DATA = {
    1: { difficulty: 2, keypoints: "命题与联结词、真值表、等值演算、联结词完备集" },
    2: { difficulty: 3, keypoints: "主析取/合取范式、推理规则(P/T/CP)、自然推理系统" },
    3: { difficulty: 3, keypoints: "量词∀/∃、前束范式、谓词演算等值式、谓词推理" },
    4: { difficulty: 2, keypoints: "集合运算与恒等式、幂集、笛卡尔积" },
    5: { difficulty: 3, keypoints: "关系性质、闭包、等价/偏序关系、函数性质" },
    6: { difficulty: 2, keypoints: "代数系统、半群/独异点/群、子群与同态" },
    7: { difficulty: 2, keypoints: "格的定义与性质、分配格/有补格、布尔代数" },
    8: { difficulty: 2, keypoints: "图的基本概念、连通性、邻接矩阵与可达性矩阵" },
    9: { difficulty: 2, keypoints: "欧拉图/哈密顿图、平面图、树与二叉树遍历" }
  };



  function loadState() {

    try {

      var raw = localStorage.getItem(STORAGE_KEY);

      var state = raw ? JSON.parse(raw) : { mastery: {}, kp: {}, toc: {} };

      // 旧 4 档数据一次性迁移到 5 档（仅当未标记 _migrated 时执行）
      if (!state._migrated && state.mastery) {
        var needSave = false;
        for (var k in state.mastery) {
          var v = state.mastery[k];
          if (typeof v === 'number' && v in LEGACY_MASTERY_MAP && LEGACY_MASTERY_MAP[v] !== v) {
            state.mastery[k] = LEGACY_MASTERY_MAP[v];
            needSave = true;
          }
        }
        state._migrated = true;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
        // 迁移后同步一次 API（若已加载完成）
        if (_apiLoaded) saveStateToAPI(state);
      }
      if (!state.toc) state.toc = {};
      return state;

    } catch(e) { return { mastery: {}, kp: {}, toc: {} }; }

  }

  function saveState(state) {

    // API 数据未加载完成时跳过保存，防止空状态覆盖服务器数据
    if (!_apiLoaded) return;

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}

    saveStateToAPI(state);

  }



  function extractChapterNum(h3) {

    var m = h3.textContent.match(/第\s*(\d+)\s*章/);

    return m ? parseInt(m[1]) : null;

  }



  function initChapter(chapterEl) {

    var h3 = chapterEl.querySelector("h3");

    if (!h3) return;

    var chapterNum = extractChapterNum(h3);

    if (!chapterNum) return;



    var data = CHAPTER_DATA[chapterNum] || { difficulty: 1, keypoints: "" };

    chapterEl.dataset.chapter = chapterNum;



    var controls = document.createElement("div");

    controls.className = "ss-chapter-controls";



    var diff = document.createElement("span");

    diff.className = "ss-difficulty ss-difficulty-" + data.difficulty;

    diff.textContent = DIFFICULTY_LABELS[data.difficulty];

    controls.appendChild(diff);



    // 掌握度标签已精简



    var btns = document.createElement("div");

    btns.className = "ss-mastery-btns";

    MASTERY_LABELS.forEach(function(lbl, level) {

      var btn = document.createElement("button");

      btn.className = "ss-mastery-btn";

      btn.dataset.level = level;

      btn.textContent = lbl;

      btn.addEventListener("click", function() {
        // 全自动判定模式：章节状态由知识点完成度自动计算，无需手动设置
        var tip = document.createElement("div");
        tip.className = "ss-mastery-tip";
        tip.textContent = "章节状态由知识点完成度自动判定：≥50%掌握 · 40-49%不熟 · 20-39%学习中 · <20%待学习";
        /* tooltip样式由CSS类 .ss-mastery-tip 提供 */
        var rect = btn.getBoundingClientRect();
        tip.style.top = (rect.top - 8) + "px";
        tip.style.left = rect.left + "px";
        var oldTip = btn.closest(".framework-chapter").querySelector(".ss-mastery-tip");
        if (oldTip) oldTip.remove();
        document.body.appendChild(tip);
        setTimeout(function() { tip.remove(); }, 2600);
      });

      btns.appendChild(btn);

    });

    controls.appendChild(btns);



    var count = document.createElement("span");

    count.className = "ss-chapter-count";

    count.id = "ss-count-" + chapterNum;

    count.classList.add("zk-hidden");

    controls.appendChild(count);



    h3.insertAdjacentElement("afterend", controls);




    var kpIdx = 0;

    chapterEl.querySelectorAll("ul").forEach(function(ul) {
      if (ul.classList.contains('kf-points')) return;
      ul.querySelectorAll(":scope > li").forEach(function(li) {
        if (li.querySelector(".ss-kp-check")) return;
        if (li.classList.contains('lg-kp-item')) return;
        kpIdx++;

        var kpId = chapterNum + "-" + kpIdx;



        var lbl = document.createElement("label");

        lbl.className = "ss-kp-label";

        lbl.dataset.kp = kpId;




        var cb = document.createElement("input");

        cb.type = "checkbox";

        cb.className = "ss-kp-check";

        cb.dataset.kp = kpId;



        while (li.firstChild) lbl.appendChild(li.firstChild);

        lbl.insertBefore(cb, lbl.firstChild);

        li.appendChild(lbl);



        cb.addEventListener("change", function() {

          setKP(kpId, cb.checked);

        });

      });

    });

    chapterEl.dataset.totalKp = kpIdx;

  }



  function setMastery(chapterNum, level) {

    var state = loadState();

    state.mastery[chapterNum] = level;

    saveState(state);

    syncUI();

  }



  function setKP(kpId, checked) {

    var state = loadState();

    state.kp[kpId] = checked;

    saveState(state);

    syncUI();

  }



  function syncUI() {

    var state = loadState();

    var chapters = document.querySelectorAll(".framework-chapter");

    var totalChapters = chapters.length;

    var masteredCount = 0;

    var stats = [0, 0, 0, 0, 0];



    chapters.forEach(function(ch) {

      var num = parseInt(ch.dataset.chapter);

      if (!num) return;

      // 全自动判定章节状态（与 ch-card 一致）
      var totalKp = parseInt(ch.dataset.totalKp) || 0;
      var doneKp = 0;
      ch.querySelectorAll(".ss-kp-check").forEach(function(cb) {
        if (state.kp[cb.dataset.kp]) doneKp++;
      });
      var ratio = totalKp > 0 ? (doneKp / totalKp) : 0;
      var mastery;
      if (ratio >= 0.5) mastery = 4;
      else if (ratio >= 0.4) mastery = 3;
      else if (ratio >= 0.2) mastery = 1;
      else mastery = 0;

      stats[mastery] = (stats[mastery] || 0) + 1;

      if (mastery === 4) masteredCount++;



      ch.querySelectorAll(".ss-mastery-btn").forEach(function(btn) {

        btn.classList.toggle('zk-active', parseInt(btn.dataset.level) === mastery);

      });

      ch.dataset.mastery = mastery;



      ch.querySelectorAll(".ss-kp-label").forEach(function(lbl) {

        var kpId = lbl.dataset.kp;

        var checked = !!state.kp[kpId];

        var cb = lbl.querySelector(".ss-kp-check");

        if (cb) cb.checked = checked;

        lbl.classList.toggle("ss-checked", checked);

      });



      var totalKp = parseInt(ch.dataset.totalKp) || 0;

      var doneKp = 0;

      ch.querySelectorAll(".ss-kp-check").forEach(function(cb) {

        if (state.kp[cb.dataset.kp]) doneKp++;

      });

      var countEl = document.getElementById("ss-count-" + num);

      if (countEl) countEl.textContent = doneKp + "/" + totalKp + " 知识点";

    });



    document.getElementById("ss-mastered-count").textContent = masteredCount;

    document.getElementById("ss-total-count").textContent = totalChapters;

    var pct = totalChapters ? Math.round((masteredCount / totalChapters) * 100) : 0;

    document.getElementById("ss-dashboard-fill").style.setProperty("--fill-pct", pct + "%");



    var statsEl = document.getElementById("ss-dashboard-stats");

    statsEl.innerHTML = "";

    MASTERY_LABELS.forEach(function(lbl, i) {

      var stat = document.createElement("span");

      stat.className = "ss-stat ss-stat-" + i;

      stat.innerHTML = '<span class="ss-stat-dot"></span>' + lbl + ": " + stats[i];

      statsEl.appendChild(stat);

    });



    // 同步章节掌握度网格（5 档）
    var GRID_ICONS = { 0: "○", 1: "○", 2: "✗", 3: "△", 4: "✓" };
    var GRID_LABELS = { 0: "待学习", 1: "学习中", 2: "不会", 3: "不熟", 4: "掌握" };

    document.querySelectorAll(".ch-card").forEach(function(card) {

      var chNum = parseInt(card.dataset.chapter);

      if (!chNum) return;

      // 全自动判定：由知识点完成比例决定章节状态
      // ≥50% 掌握(4绿) | 40-49% 不熟(3橙) | 20-39% 学习中(1蓝) | <20% 待学习(0灰)
      var chEl = document.querySelector('.framework-chapter[data-chapter="' + chNum + '"]');
      var totalKp = chEl ? (parseInt(chEl.dataset.totalKp) || 0) : 0;
      var doneKp = 0;
      if (chEl) {
        chEl.querySelectorAll(".ss-kp-check").forEach(function(cb) {
          if (state.kp[cb.dataset.kp]) doneKp++;
        });
      }
      var ratio = totalKp > 0 ? (doneKp / totalKp) : 0;
      var lvl;
      if (ratio >= 0.5) lvl = 4;
      else if (ratio >= 0.4) lvl = 3;
      else if (ratio >= 0.2) lvl = 1;
      else lvl = 0;

      card.dataset.mastery = lvl;

      var iconEl = card.querySelector(".ch-icon");

      var textEl = card.querySelector(".ch-status-text");

      if (iconEl) iconEl.textContent = GRID_ICONS[lvl];

      if (totalKp > 0) {

        if (textEl) textEl.textContent = GRID_LABELS[lvl] + " " + doneKp + "/" + totalKp;

      } else {

        if (textEl) textEl.textContent = GRID_LABELS[lvl];

      }

    });



    // 同步顶部状态药丸

    var elM = document.getElementById("kf-c-mastered");

    var elP = document.getElementById("kf-c-progress");

    var elR = document.getElementById("kf-c-review");

    if (elM) elM.textContent = stats[2];

    if (elP) elP.textContent = stats[1];

    if (elR) elR.textContent = stats[3];

  }



  document.querySelectorAll(".framework-chapter").forEach(initChapter);

  syncFromAPI();



  // 供 JSON 数据驱动模块在重新渲染章节后调用：重挂掌握度 checkbox + 同步 UI
  window.__reinitChapters = function() {
    document.querySelectorAll(".framework-chapter").forEach(initChapter);
    // 重新绑定章节按钮点击事件（renderChapters 重建了 innerHTML，旧绑定失效）
    var freshBtns = document.querySelectorAll("#secondaryTabs .chapter-tab-btn");
    freshBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        if (window.switchChapterTab) window.switchChapterTab(btn.dataset.tab);
      });
    });
    syncUI();
  };

  // ===== 目录小节级掌握状态（5 档，存 state.toc） =====
  var TOC_DOT_ICONS = { 0: "○", 1: "◐", 2: "✗", 3: "△", 4: "●" };

  function tocKey(chapterNum, title) {
    return chapterNum + '::' + title;
  }

  window.__setTocMastery = function(chapterNum, title) {
    var state = loadState();
    if (!state.toc) state.toc = {};
    var key = tocKey(chapterNum, title);
    var cur = state.toc[key] || 0;
    state.toc[key] = (cur + 1) % 5;
    saveState(state);
    window.__syncTocUI && window.__syncTocUI();
    syncUI();
  };

  window.__syncTocUI = function() {
    var state = loadState();
    var dots = document.querySelectorAll('.toc-dot');
    dots.forEach(function(dot) {
      var ch = parseInt(dot.dataset.ch);
      var title = dot.dataset.title || '';
      var lvl = (state.toc && state.toc[tocKey(ch, title)]) || 0;
      dot.dataset.mastery = lvl;
      dot.textContent = TOC_DOT_ICONS[lvl] || '○';
      dot.title = MASTERY_LABELS[lvl] || '';
    });
  };

  // 为目录状态点绑定点击事件（事件委托，兼容 JSON 动态渲染）
  document.addEventListener('click', function(e) {
    var dot = e.target.closest('.toc-dot');
    if (dot) {
      window.__setTocMastery(parseInt(dot.dataset.ch), dot.dataset.title || '');
    }
  });



  document.getElementById("ss-reset-btn").addEventListener("click", function() {

    if (confirm("确定要重置全部掌握度进度吗？")) {

      localStorage.removeItem(STORAGE_KEY);

    try { fetch("/api/mastery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: SS_SUBJECT, data: { mastery: {}, kp: {}, toc: {} } }) }).catch(function(e) {}); } catch(e) {}

      syncUI();

      window.__syncTocUI && window.__syncTocUI();

    }

  });



  syncUI();

})();


// ===== 模块二：统一章节 Tab 切换（两级导航） =====

(function() {

  var primaryBtns = document.querySelectorAll("#primaryTabs .chapter-tab-btn");

  var secondaryBtns = document.querySelectorAll("#secondaryTabs .chapter-tab-btn");

  var tabPanes = document.querySelectorAll(".chapter-tab-pane");

  var secondaryBar = document.getElementById("secondaryTabs");

  var STORAGE_TAB_KEY = "ss_active_tab_" + SS_SUBJECT;

  var STORAGE_CH_KEY = "ss_active_chapter_" + SS_SUBJECT;



  function switchTab(tabId) {

    if (tabId === "chapter-detail") {

      // 章节精讲模式：显示二级导航，切换到上次或第一个章节

      primaryBtns.forEach(function(btn) {

        btn.classList.toggle('zk-active', btn.dataset.tab === tabId);

      });

      tabPanes.forEach(function(pane) { pane.classList.remove('zk-active'); });

      secondaryBar.classList.add("zk-show");

      var savedCh = null;

      try { savedCh = localStorage.getItem(STORAGE_CH_KEY); } catch(e) {}

      if (!savedCh || !document.querySelector('#secondaryTabs .chapter-tab-btn[data-tab="' + savedCh + '"]')) {

        savedCh = "chapter-1";

      }

      switchChapter(savedCh);

      try { localStorage.setItem(STORAGE_TAB_KEY, tabId); } catch(e) {}

    } else {

      // 学习计划 / 知识总览：隐藏二级导航

      primaryBtns.forEach(function(btn) {

        btn.classList.toggle('zk-active', btn.dataset.tab === tabId);

      });

      secondaryBar.classList.remove("zk-show");

      secondaryBtns.forEach(function(btn) { btn.classList.remove('zk-active'); });

      tabPanes.forEach(function(pane) {

        pane.classList.toggle('zk-active', pane.dataset.tab === tabId);

      });

      try { localStorage.setItem(STORAGE_TAB_KEY, tabId); } catch(e) {}

    }

    var tabsEl = document.querySelector('.chapter-tabs');

    if (tabsEl) tabsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  }



  function switchChapter(tabId) {
    document.querySelectorAll("#secondaryTabs .chapter-tab-btn").forEach(function(btn) {
      btn.classList.toggle('zk-active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".chapter-tab-pane").forEach(function(pane) {
      pane.classList.toggle('zk-active', pane.dataset.tab === tabId);
    });
    try { localStorage.setItem(STORAGE_CH_KEY, tabId); } catch(e) {}
  }



  primaryBtns.forEach(function(btn) {

    btn.addEventListener("click", function() {

      switchTab(btn.dataset.tab);

    });

  });

  // 二级导航用事件委托（按钮会被 renderChapters 重建）
  var secondaryBar = document.getElementById("secondaryTabs");
  if (secondaryBar) {
    secondaryBar.addEventListener("click", function(e) {
      var btn = e.target.closest('.chapter-tab-btn');
      if (btn) switchChapter(btn.dataset.tab);
    });
  }



  var saved = null;

  try { saved = localStorage.getItem(STORAGE_TAB_KEY); } catch(e) {}

  var legacyMap = { progress: 'study-plan', schedule: 'study-plan', tips: 'study-plan',

                    position: 'knowledge-overview', toc: 'knowledge-overview', overview: 'knowledge-overview',

                    'chapter-1': 'chapter-detail', 'chapter-2': 'chapter-detail', 'chapter-3': 'chapter-detail',

                    'chapter-4': 'chapter-detail', 'chapter-5': 'chapter-detail', 'chapter-6': 'chapter-detail' };

  if (saved && legacyMap[saved]) {

    var ch = saved;

    saved = legacyMap[saved];

    if (saved === "chapter-detail") {

      try { localStorage.setItem(STORAGE_CH_KEY, ch); } catch(e) {}

    }

  }

  if (saved && (document.querySelector('#primaryTabs .chapter-tab-btn[data-tab="' + saved + '"]'))) {

    switchTab(saved);

  }



  function updateTabDots() {

    try {

      var stateRaw = localStorage.getItem("ss_mastery_" + SS_SUBJECT);

      var state = stateRaw ? JSON.parse(stateRaw) : { mastery: {} };

      secondaryBtns.forEach(function(btn) {

        var ch = btn.dataset.chapter;

        var lvl = state.mastery[ch] || 0;

        btn.dataset.status = lvl;

      });

    } catch(e) {}

  }

  updateTabDots();

  window.addEventListener("storage", updateTabDots);

  setInterval(updateTabDots, 1000);

  window.switchChapterTab = function(tabId) {

    if (!document.getElementById("secondaryTabs")) return;

    if (!secondaryBar.classList.contains("zk-show")) {

      switchTab("chapter-detail");

    }

    switchChapter(tabId);

  };

})();


// ===== 模块三：Learning Guide Annotations v2（遗留代码） =====

(function() {

    var LG_SUBJECT = PLAN_SUBJECT;
var LG_SUBJECT_CODE = SS_SUBJECT;

    var LG_DATA = null;



    function fetchGuide() {

        var url = (location.protocol === 'file:') ? 'http://localhost:8000/data/learning-guide.json' : '/data/learning-guide.json';

        fetch(url)

            .then(function(r) { return r.json(); })

            .then(function(data) { LG_DATA = data; annotate(); })

            .catch(function(e) { console.log('[LG] Failed to load guide:', e); });

    }



    function normalizeChName(name) {

        return name.replace(/\s+/g, '').replace(/第(\d+)章/g, '第$1章');

    }



    function getChNum(name) {

        var m = name.match(/第\s*(\d+)\s*章/);

        return m ? parseInt(m[1]) : -1;

    }



    function matchChapter(htmlName, guideKey) {

        var h = normalizeChName(htmlName);

        var g = normalizeChName(guideKey);

        if (h === g || h.indexOf(g) >= 0 || g.indexOf(h) >= 0) return true;

        var hn = getChNum(htmlName);

        var gn = getChNum(guideKey);

        return hn > 0 && hn === gn;

    }



    function extractBigrams(text) {

        var clean = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

        var bigrams = [];

        for (var i = 0; i < clean.length - 1; i++) {

            bigrams.push(clean.substring(i, i + 2));

        }

        return bigrams;

    }



    function matchScore(keyTerm, question) {

        if (!keyTerm || !question) return 0;

        var kt = keyTerm.trim();

        var q = question.replace(/\?|？/g, '');



        if (q.indexOf(kt) >= 0) return 100;

        if (kt.indexOf(q) >= 0) return 80;



        var ktParts = kt.replace(/[（）()，,、：:·\-]/g, ' ').split(/\s+/).filter(function(s) { return s.length >= 2; });

        var maxPartScore = 0;

        for (var i = 0; i < ktParts.length; i++) {

            if (q.indexOf(ktParts[i]) >= 0) {

                maxPartScore = Math.max(maxPartScore, 50 + ktParts[i].length * 5);

            }

        }

        if (maxPartScore > 0) return maxPartScore;



        var ktBi = extractBigrams(kt);

        var qBi = extractBigrams(q);

        var ktSet = {};

        ktBi.forEach(function(b) { ktSet[b] = true; });

        var overlap = 0;

        for (var i = 0; i < qBi.length; i++) {

            if (ktSet[qBi[i]]) overlap++;

        }



        if (ktBi.length === 0) return 0;

        var ratio = overlap / ktBi.length;

        if (ratio >= 0.4) return Math.round(30 + ratio * 30);

        if (overlap >= 2) return 20;



        return 0;

    }



    function findBestMatch(keyTermText, topics) {

        var bestScore = 0;

        var bestMatch = null;

        for (var i = 0; i < topics.length; i++) {

            var score = matchScore(keyTermText, topics[i].question);

            if (score > bestScore) {

                bestScore = score;

                bestMatch = topics[i];

            }

        }

        return bestScore >= 20 ? bestMatch : null;

    }



    function inferPriority(keyTermText, liText) {

        var text = keyTermText + ' ' + liText;

        if (/发展|历程|历史|分类|概述|简介|产生|演变|现状|趋势|特点|优缺点/.test(text)) return '了解';

        if (/核心|基本|原理|结构|地址|编码|映射|转换|算法|复杂度|排序|查找|遍历|定义|性质|关系/.test(text)) return '重点';

        return '一般';

    }



    function inferType(keyTermText, liText) {

        var text = keyTermText + ' ' + liText;

        if (/计算|公式|地址|复杂度|代价|推导|证明|求解|转换|映射/.test(text)) return '计算';

        if (/定义|概念|性质|特征|特点|分类|区别|联系|组成|结构/.test(text)) return '背诵';

        if (/设计|实现|构造|编写|画|描述过程/.test(text)) return '应用';

        return '理解';

    }



    function getPriorityClass(priority) {

        if (priority === '重点') return 'lg-priority-key';

        if (priority === '了解') return 'lg-priority-survey';

        return 'lg-priority-normal';

    }



    function getTypeIcon(type) {

        var icons = { '计算': '🧮', '背诵': '📖', '理解': '💡', '应用': '🔧' };

        return icons[type] || '💡';

    }



    function getPriorityIcon(priority) {

        if (priority === '重点') return '🔴';

        if (priority === '了解') return '🟢';

        return '🟡';

    }

})();


// ===== 模块四：折叠卡片切换 =====

function toggleCollapse(header) {
  const card = header.closest('.collapse-card');
  card.classList.toggle('open');
}


// ===== 模块五：知识框架 JSON 数据驱动（三科共用，方案A'） =====
// 数据源：/data/knowledge-framework-{subject}.json + /data/study-plan.json
// 策略：纯动态渲染，JSON 加载成功后渲染三个 tab；加载失败显示错误提示
(function() {
  // 科目参数化（方案A-1）：与掌握度脚本同源，读 ?subject= 参数
  var SUBJECT_META = {
    '13015': { display: '计算机系统原理', plan: '系统原理' },
    '02324': { display: '离散数学', plan: '离散数学' },
    '13003': { display: '数据结构与算法', plan: '数据结构' }
  };
  var SUBJECT_CODE = '02324';
  try {
    var sm = (location.search.match(/[?&]subject=([^&]+)/) || [])[1];
    if (sm && SUBJECT_META[sm]) SUBJECT_CODE = sm;
  } catch(e) {}
  var SUBJECT_NAME = SUBJECT_META[SUBJECT_CODE] ? SUBJECT_META[SUBJECT_CODE].display : '离散数学';
  var PLAN_SUBJECT = SUBJECT_META[SUBJECT_CODE] ? SUBJECT_META[SUBJECT_CODE].plan : '离散数学';
  var SUBJECT_FRAME = '/data/knowledge-framework-' + SUBJECT_CODE + '.json';

  function apiUrl(p) {
    return (location.protocol === 'file:') ? 'http://localhost:8000' + p : p;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- 工具：掌握度 badge 渲染 ----
  var PRI_CLS = { '重点': 'key', '一般': 'normal', '了解': 'survey' };
  var PRI_ICON = { '重点': '🔴', '一般': '🟡', '了解': '⚪' };
  var LVL_ICON = { '理解': '💡', '背诵': '🧠', '计算': '📐', '应用': '🔧' };

  function badgeHtml(pri, lvl) {
    var cls = PRI_CLS[pri] || 'normal';
    var icon = PRI_ICON[pri] || '🟡';
    var lic = LVL_ICON[lvl] || '💡';
    return '<span class="lg-badge lg-priority-' + cls + '">' + icon + ' <span>' + lic + '</span> ' +
      esc(pri) + '·' + esc(lvl) + '</span>';
  }

  // ---- 渲染章节精讲卡片（section-card） ----
  function renderSectionCard(sec) {
    var type = sec.type;
    var items = sec.items || [];
    var color = '#3b82f6';
    var cls = 'pri-survey';
    var open = (type === '核心概念' || type === '考核知识点与考核要求') ? ' open' : '';
    if (type === '核心概念') { color = '#ef4444'; cls = 'pri-key'; }
    if (type === '常见题型') { color = '#f59e0b'; cls = 'pri-normal'; }
    if (type === '考核知识点与考核要求') { color = '#8b5cf6'; cls = 'pri-accent2'; }

    var body = '';
    if (type === '核心概念') {
      var lis = items.map(function(it) {
        var cls = PRI_CLS[it.priority] || 'normal';
        var pts = '';
        if (it.points && it.points.length) {
          pts = '<ul class="kf-points kf-points-' + cls + '">' + it.points.map(function(p) {
            return '<li>' + esc(p) + '</li>';
          }).join('') + '</ul>';
        }
        var kt = '<li class="lg-kp-item">' +
          '<div class="kp-header kp-priority-' + cls + '">' +
          '<span class="key-term">' + esc(it.term) + badgeHtml(it.priority, it.level) + '</span>' +
          '</div>' +
          '<div class="kp-body">' +
          (it.summary ? '<span class="kf-summary">' + esc(it.summary) + '</span>' : '') + pts +
          '</div></li>';
        return kt;
      }).join('\n');
      body = '<ul>\n' + lis + '\n</ul>';
    } else if (type === '典型例题' || type === '同步练习') {
      body = items.map(function(it) {
        var sol = it.solution ? '\n<div class="example-solution"><p>' + esc(it.solution) + '</p></div>' : '';
        return '<div class="example-block">\n' +
          '<div class="example-title"><strong>' + esc(it.title) + '</strong></div>\n' +
          '<div class="example-statement"><p>' + esc(it.statement) + '</p></div>' + sol + '\n</div>';
      }).join('\n');
    } else if (type === '考核知识点与考核要求') {
      var lvCls = {'识记': 'lv-recall', '领会': 'lv-comprehend', '简单应用': 'lv-apply'};
      body = items.map(function(it) {
        var lvls = (it.levels || []).map(function(r) {
          var cls = lvCls[r.level] || '';
          return '<div class="req-line"><span class="req-badge ' + cls + '">' + esc(r.level) + '</span><span class="req-content">' + esc(r.content) + '</span></div>';
        }).join('');
        return '<div class="req-group"><div class="req-topic-title">' + esc(it.topic) + '</div>' + lvls + '</div>';
      }).join('');
    } else {
      // 必会公式 / 常见题型 / 易错点 / 必会操作与复杂度 / 必会对比表：普通 li
      body = '<ul>\n' + items.map(function(it) {
        return '<li>' + (typeof it === 'string' ? esc(it) : esc(it.text != null ? it.text : it.content)) + '</li>';
      }).join('\n') + '\n</ul>';
    }

    // 核心概念区块：标题旁显示重点/一般/了解统计
    var countHtml = '';
    if (type === '核心概念') {
      var priCount = { '重点': 0, '一般': 0, '了解': 0 };
      items.forEach(function(it) {
        var p = it.priority || '一般';
        priCount[p] = (priCount[p] || 0) + 1;
      });
      countHtml = '<span class="section-card-pri-stats">' +
        '<span class="pri-stat pri-stat-key">🔴 ' + priCount['重点'] + '</span>' +
        '<span class="pri-stat pri-stat-normal">🟡 ' + priCount['一般'] + '</span>' +
        '<span class="pri-stat pri-stat-survey">⚪ ' + priCount['了解'] + '</span>' +
        '</span>';
    } else {
      countHtml = '<span class="section-card-count">(' + items.length + ')</span>';
    }
    return '<div class="section-card collapse-card' + open + ' ' + cls + '">\n' +
      '  <div class="section-card-header" onclick="toggleCollapse(this)">\n' +
      '    <span class="section-card-title">' + esc(type) + '</span>\n' +
      countHtml +
      '    <span class="chevron">▶</span>\n  </div>\n' +
      '  <div class="section-card-body collapse-body">\n' + body + '\n  </div>\n</div>';
  }

  // ---- 渲染章节精讲 tab ----
  function renderChapters(fw) {
    // 重建章节精讲 tab 顶部的章节导航按钮
    var secTabs = document.getElementById('secondaryTabs');
    if (secTabs && fw.chapters && fw.chapters.length) {
      secTabs.innerHTML = fw.chapters.map(function(ch) {
        return '<button class="chapter-tab-btn zk-seg" data-chapter="' + ch.id + '" data-tab="chapter-' + ch.id + '">第 ' + ch.id + ' 章</button>';
      }).join('\n');
    }
    // 清空并重建所有章节 pane（不再依赖静态HTML兜底）
    var tabContent = document.querySelector('.chapter-tab-content');
    if (!tabContent) return;
    // 移除旧的章节 pane
    tabContent.querySelectorAll('.chapter-tab-pane[data-tab^="chapter-"]').forEach(function(p) { p.remove(); });
    // 创建新的章节 pane
    (fw.chapters || []).forEach(function(ch, idx) {
      var pane = document.createElement('div');
      pane.className = 'chapter-tab-pane';
      pane.dataset.chapter = ch.id;
      pane.dataset.tab = 'chapter-' + ch.id;
      var html = '<div class="framework-chapter" data-chapter="' + ch.id + '">\n' +
        '<h3>' + esc(ch.name) + ' <span class="ch-difficulty">' + esc(ch.difficulty) + '</span> <span class="ch-pages">' + esc(ch.pages) + '</span></h3>\n' +
        (ch.sections || []).map(renderSectionCard).join('\n') +
        '\n</div>';
      pane.innerHTML = html;
      tabContent.appendChild(pane);
    });
    // 默认激活第1章（如果当前就在章节精讲tab）
    var detailBtn = document.querySelector('#primaryTabs .chapter-tab-btn[data-tab="chapter-detail"]');
    if (detailBtn && detailBtn.classList.contains('zk-active')) {
      if (window.switchChapterTab && fw.chapters && fw.chapters.length) {
        window.switchChapterTab('chapter-' + fw.chapters[0].id);
      }
    }
  }

  // ---- 渲染知识总览 tab ----
  function renderOverview(fw) {
    // 整体定位
    var body = document.querySelector('[data-tab="knowledge-overview"] .kf-card .card-body');
    if (body && fw.meta && fw.meta.overview) body.textContent = fw.meta.overview;

    // 章节掌握度网格（初始待学习，syncUI 会按 data-mastery 更新颜色）
    var grid = document.getElementById('chapterGrid');
    if (grid && fw.chapters && fw.chapters.length) {
      grid.innerHTML = fw.chapters.map(function(ch) {
        return '<div class="ch-card" data-chapter="' + ch.id + '" data-mastery="0" onclick="switchChapterTab(\'chapter-' + ch.id + '\')">\n' +
          '<div class="ch-name">' + esc(ch.name) + '</div>\n' +
          '<div class="ch-meta">' + esc(ch.difficulty) + ' · ' + esc(ch.pages) + '</div>\n' +
          '<div class="ch-status"><span class="ch-icon">○</span><span class="ch-status-text">待学习</span></div>\n</div>';
      }).join('\n');
    }

    // 完整目录：从 JSON 的 meta.extraToc 渲染非章节条目（大纲/编者的话等），再渲染章节目录
    var tocWrap = document.querySelector('[data-tab="knowledge-overview"] .collapse-body');
    if (tocWrap && fw.chapters && fw.chapters.length) {
      // 渲染非章节条目（来自 JSON meta.extraToc）
      var extraTocHtml = '';
      var extraToc = (fw.meta && fw.meta.extraToc) || [];
      extraToc.forEach(function(t) {
        extraTocHtml += '<div class="toc-chapter">\n' +
          '<div class="toc-title">' + esc(t.title) +
          (t.pages ? ' <span class="page">' + esc(t.pages) + '</span>' : '') + '</div>\n</div>\n';
      });
      var chapterToc = fw.chapters.map(function(ch) {
        var tagMap = { '核心': 'tag-core', '重点': 'tag-key', '常规': 'tag-regular' };
        var tagCls = tagMap[ch.priority] || 'tag-key';
        var secs = (ch.toc || []).map(function(s) {
          // 节级状态点 + 标题
          var secHtml = '<div class="toc-section">' +
            '<span class="toc-dot" data-ch="' + ch.id + '" data-title="' + esc(s.title) + '"></span>' +
            '<span class="toc-section-text">' + esc(s.title) + '</span></div>';
          var subs = (s.subsections || []).map(function(ss) {
            return '<div class="toc-subsection">' +
              '<span class="toc-dot" data-ch="' + ch.id + '" data-title="' + esc(ss) + '"></span>' +
              '<span class="toc-subsection-text">' + esc(ss) + '</span></div>';
          }).join('\n');
          return secHtml + '\n' + subs;
        }).join('\n');
        return '<div class="toc-chapter">\n' +
          '<div class="toc-title toc-title-link" onclick="switchChapterTab(\'chapter-' + ch.id + '\')">' +
          esc(ch.name) + ' <span class="tag ' + tagCls + '">' + esc(ch.priority || '重点') + '</span> ' +
          '<span class="page">' + esc(ch.pages) + '</span></div>\n' +
          '<div class="toc-sections">\n' + secs + '\n</div>\n</div>';
      }).join('\n');
      tocWrap.innerHTML = '';
      if (extraTocHtml) {
        var extraTmp = document.createElement('div');
        extraTmp.innerHTML = extraTocHtml;
        while (extraTmp.firstChild) tocWrap.appendChild(extraTmp.firstChild);
      }
      var tmp = document.createElement('div');
      tmp.innerHTML = chapterToc;
      while (tmp.firstChild) tocWrap.appendChild(tmp.firstChild);
      // 渲染目录状态点
      if (window.__syncTocUI) window.__syncTocUI();
    }

    // 学习提示：展示在知识总览、整体定位之前（数据用 meta.tips）
    var tips = (fw.meta && fw.meta.tips) || [];
    if (tips.length) {
      // 必须限定 .chapter-tab-pane，避免误匹配到 data-tab="knowledge-overview" 的顶部 tab 按钮
      var overviewPane = document.querySelector('.chapter-tab-pane[data-tab="knowledge-overview"]');
      if (!overviewPane) return;
      var tipsCard = overviewPane.querySelector('.kf-tips-card');
      if (!tipsCard) {
        tipsCard = document.createElement('div');
        tipsCard.className = 'kf-tips-card';
        var h2 = document.createElement('h2');
        h2.textContent = '学习提示';
        tipsCard.appendChild(h2);
        // 插入到整体定位（第一个 .kf-card）之前
        var firstCard = overviewPane.querySelector('.kf-card');
        overviewPane.insertBefore(tipsCard, firstCard);
      }
      tipsCard.querySelectorAll('.kf-tip').forEach(function(el) { el.remove(); });
      tips.forEach(function(t) {
        var tip = document.createElement('div');
        tip.className = 'kf-tip';
        var tagCls = { '计算': 'kf-tag-calc', '概念': 'kf-tag-concept', '综合': 'kf-tag-combo', '实例': 'kf-tag-example' }[t.tag] || 'kf-tag-concept';
        tip.innerHTML = '<span class="kf-tag ' + tagCls + '">' + esc(t.tag) + '</span>' + esc(t.text);
        tipsCard.appendChild(tip);
      });

    }
  }

  // ---- 渲染学习计划 tab（study-plan.json 按 subject 过滤，三阶段） ----
  function extractWeekRange(weeks) {
    if (!weeks.length) return '';
    var first = weeks[0], last = weeks[weeks.length - 1];
    return first.week + '~' + last.week;
  }

  function renderStudyPlan(plan) {
    var accordion = document.querySelector('[data-tab="study-plan"] .kf-accordion');
    if (!accordion || !plan || !plan.weeks) return;
    var weeks = plan.weeks.filter(function(w) {
      return w.goals && w.goals.some(function(g) { return g.subject === PLAN_SUBJECT; });
    });
    if (!weeks.length) return;
    var phases = [
      { phase: 0, name: '初级阶段：各章梳理+练习' },
      { phase: 1, name: '中间阶段：重点难点突破' },
      { phase: 2, name: '冲刺阶段：模拟考+题海' }
    ];
    var html = '';
    phases.forEach(function(ph) {
      var pWeeks = weeks.filter(function(w) { return (w.phase || 0) === ph.phase; });
      if (!pWeeks.length) return;
      html += '<details class="kf-week-card"' + (ph.phase === 0 ? ' open' : '') + '>';
      html += '<summary>' + esc(ph.name) + ' <span class="kf-week-meta">' + esc(extractWeekRange(pWeeks)) + '</span></summary><ul>';
      pWeeks.forEach(function(w) {
        var subs = w.goals.filter(function(g) { return g.subject === PLAN_SUBJECT; });
        subs.forEach(function(g) {
          html += '<li><strong>' + esc(w.week) + '（' + esc(w.dates) + '）</strong>：' +
            esc(g.chapter ? g.chapter + ' ' : '') + esc(g.topic) + (g.done ? ' ✓' : '') + '</li>';
        });
      });
      html += '</ul></details>';
    });
    accordion.innerHTML = html;
  }

  // ---- 初始化：并行加载两个 JSON，成功后渲染 ----
  Promise.all([
    fetch(apiUrl(SUBJECT_FRAME) + '?t=' + Date.now()).then(function(r) { return r.json(); }),
    fetch(apiUrl('/data/study-plan.json') + '?t=' + Date.now()).then(function(r) { return r.json(); })
  ]).then(function(results) {
    var fw = results[0];
    renderStudyPlan(results[1]);
    renderOverview(fw);
    renderChapters(fw);
    document.querySelector('.chapter-tab-content').classList.remove('kf-loading');
    console.log('[KF-JSON] 知识框架 JSON 数据渲染完成');
  }).catch(function(e) {
    var content = document.querySelector('.chapter-tab-content');
    if (content) {
      content.classList.remove('kf-loading');
      content.innerHTML = '<div class="kf-error-state">' +
        '<p>\u26a0\ufe0f 知识框架数据加载失败</p>' +
        '<p class="kf-error-detail">请确认本地服务器已启动（python dev_server.py）</p>' +
        '<button class="kf-retry-btn" onclick="location.reload()">重新加载</button>' +
        '</div>';
    }
    console.warn('[KF-JSON] 数据加载失败', e);
  });
})();
