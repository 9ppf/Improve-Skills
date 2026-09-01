// ============================================================
// 00023高等数学（工本）-知识框架与学习计划 页面 JS
// 抽离自 00023高等数学（工本）-知识框架与学习计划.html
// ============================================================

(function() {
      var STORAGE_KEY = "ss_mastery_00023";
      var MASTERY_LABELS = ["未开始", "学习中", "已掌握", "需复习"];
      var DIFFICULTY_LABELS = { 1: "基础", 2: "中等", 3: "难点" };
      var CN_NUM = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10 };

      var CHAPTER_DATA = {
        1: { difficulty: 2, keypoints: "向量代数、平面/直线方程、二次曲面标准形" },
        2: { difficulty: 3, keypoints: "偏导数与全微分、复合函数链式法则、隐函数求导、极值与条件极值" },
        3: { difficulty: 3, keypoints: "直角/极坐标二重积分、柱面/球面坐标三重积分、重积分应用" },
        4: { difficulty: 3, keypoints: "两类曲线/曲面积分、格林公式、高斯公式、积分与路径无关" },
        5: { difficulty: 2, keypoints: "一阶线性方程、可降阶方程、二阶常系数线性方程" },
        6: { difficulty: 2, keypoints: "正项级数审敛法、幂级数收敛半径、函数展开为幂级数" }
      };

      function loadState() {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : { mastery: {}, kp: {} };
        } catch(e) { return { mastery: {}, kp: {} }; }
      }
      function saveState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
      }

      function extractChapterNum(h3) {
        var text = h3.textContent;
        var m = text.match(/第\s*(\d+)\s*章/);
        if (m) return parseInt(m[1]);
        var cm = text.match(/第([一二三四五六七八九十]+)章/);
        if (cm) return CN_NUM[cm[1]] || null;
        return null;
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

        var mLabel = document.createElement("span");
        mLabel.className = "ss-mastery-label";
        mLabel.textContent = "掌握度：";
        controls.appendChild(mLabel);

        var btns = document.createElement("div");
        btns.className = "ss-mastery-btns";
        MASTERY_LABELS.forEach(function(lbl, level) {
          var btn = document.createElement("button");
          btn.className = "ss-mastery-btn";
          btn.dataset.level = level;
          btn.textContent = lbl;
          btn.addEventListener("click", function() {
            setMastery(chapterNum, level);
          });
          btns.appendChild(btn);
        });
        controls.appendChild(btns);

        var count = document.createElement("span");
        count.className = "ss-chapter-count";
        count.id = "ss-count-" + chapterNum;
        controls.appendChild(count);

        h3.insertAdjacentElement("afterend", controls);

        var kpIdx = 0;
        chapterEl.querySelectorAll("ul").forEach(function(ul) {
          ul.querySelectorAll("li").forEach(function(li) {
            if (li.querySelector(".ss-kp-check")) return;
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
        var chapters = document.querySelectorAll(".framework-block");
        var totalChapters = chapters.length;
        var masteredCount = 0;
        var stats = [0, 0, 0, 0];

        chapters.forEach(function(ch) {
          var num = parseInt(ch.dataset.chapter);
          if (!num) return;
          var mastery = state.mastery[num] || 0;
          stats[mastery]++;
          if (mastery === 2) masteredCount++;

          ch.querySelectorAll(".ss-mastery-btn").forEach(function(btn) {
            btn.classList.toggle("active", parseInt(btn.dataset.level) === mastery);
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
        document.getElementById("ss-dashboard-fill").style.width = pct + "%";

        var statsEl = document.getElementById("ss-dashboard-stats");
        statsEl.innerHTML = "";
        MASTERY_LABELS.forEach(function(lbl, i) {
          var stat = document.createElement("span");
          stat.className = "ss-stat ss-stat-" + i;
          stat.innerHTML = '<span class="ss-stat-dot"></span>' + lbl + ": " + stats[i];
          statsEl.appendChild(stat);
        });
      }

      document.querySelectorAll(".framework-block").forEach(initChapter);

      document.getElementById("ss-reset-btn").addEventListener("click", function() {
        if (confirm("确定要重置全部掌握度进度吗？")) {
          localStorage.removeItem(STORAGE_KEY);
          syncUI();
        }
      });

      syncUI();
    })();

    // 统一章节 Tab 切换
    (function() {
      var tabBtns = document.querySelectorAll(".chapter-tab-btn");
      var tabPanes = document.querySelectorAll(".chapter-tab-pane");
      var STORAGE_TAB_KEY = "ss_active_tab_00023";

      function switchTab(tabId) {
        tabBtns.forEach(function(btn) {
          btn.classList.toggle("active", btn.dataset.tab === tabId);
        });
        tabPanes.forEach(function(pane) {
          pane.classList.toggle("active", pane.dataset.tab === tabId);
        });
        try { localStorage.setItem(STORAGE_TAB_KEY, tabId); } catch(e) {}
        var tabsEl = document.querySelector('.chapter-tabs');
        if (tabsEl) tabsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      tabBtns.forEach(function(btn) {
        btn.addEventListener("click", function() {
          switchTab(btn.dataset.tab);
        });
      });

      var saved = null;
      try { saved = localStorage.getItem(STORAGE_TAB_KEY); } catch(e) {}
      var legacyMap = { progress: 'study-plan', schedule: 'study-plan', tips: 'study-plan',
                        position: 'knowledge-overview', toc: 'knowledge-overview', overview: 'knowledge-overview' };
      if (saved && legacyMap[saved]) saved = legacyMap[saved];
      if (saved && document.querySelector('.chapter-tab-btn[data-tab="' + saved + '"]')) {
        switchTab(saved);
      }

      function updateTabDots() {
        try {
          var stateRaw = localStorage.getItem("ss_mastery_00023");
          var state = stateRaw ? JSON.parse(stateRaw) : { mastery: {} };
          document.querySelectorAll(".chapter-tab-btn[data-chapter]").forEach(function(btn) {
            var ch = btn.dataset.chapter;
            var lvl = state.mastery[ch] || 0;
            btn.dataset.status = lvl;
          });
        } catch(e) {}
      }
      updateTabDots();
      window.addEventListener("storage", updateTabDots);
      setInterval(updateTabDots, 1000);
      window.switchChapterTab = switchTab;
    })();
