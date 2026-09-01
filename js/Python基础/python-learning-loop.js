// ============================================================
// python-learning-loop 页面 JS
// 抽离自 python-learning-loop.html
// ============================================================

(function () {
      var STAGES = [
        { id: 1, name: "语法基础", weeks: "第1-2周", kp: "9个知识点", demo: "Prompt 模板引擎" },
        { id: 2, name: "数据结构", weeks: "第3-5周", kp: "8个知识点", demo: "LLM 上下文管理器" },
        { id: 3, name: "常用库", weeks: "第6-7周", kp: "7个知识点", demo: "LLM API 客户端" },
        { id: 4, name: "AI Python", weeks: "第8-10周", kp: "5个知识点", demo: "真题数据分析仪表盘" }
      ];
      var STAGE_NAMES = { "1": "语法基础", "2": "数据结构", "3": "常用库", "4": "AI Python" };
      var STEP_NAMES = ["学习目标", "代码练习", "Demo 项目", "GitHub 提交", "复盘总结"];
      var STORAGE_KEY = "py_learning_loops_v2";
      var FILTER_KEY = "py_loop_filter";

      var form = document.getElementById("python-loop-form");
      var nameInput = document.getElementById("py-name");
      var stageSelect = document.getElementById("py-stage");
      var dateInput = document.getElementById("py-date");
      var noteInput = document.getElementById("py-note");
      var stepChecks = document.querySelectorAll("#python-step-checks input");
      var listEl = document.getElementById("python-entry-list");
      var emptyEl = document.getElementById("python-empty");
      var summaryEl = document.getElementById("python-summary");
      var tagEl = document.getElementById("python-record-tag");
      var filterBar = document.getElementById("filterBar");

      function renderRoadmap() {
        var el = document.getElementById("stageRoadmap");
        var progress = loadKpProgress();
        el.innerHTML = STAGES.map(function (s) {
          var p = progress.stages[s.id] || { total: 0, done: 0 };
          var pct = p.total ? Math.round(p.done / p.total * 100) : 0;
          return '<div class="stage-row">' +
            '<div class="stage-badge"><span class="stage-num">' + s.id + '</span><span class="stage-label">阶段</span></div>' +
            '<div class="stage-body">' +
              '<span class="stage-name">' + s.name + '</span>' +
              '<div class="stage-meta"><span>' + s.weeks + '</span><span>' + p.done + '/' + p.total + ' 知识点</span></div>' +
              '<span class="stage-demo">Demo: ' + s.demo + '</span>' +
              '<div class="stage-progress">' +
                '<div class="stage-progress-bar"><div class="stage-progress-fill" style="width:' + pct + '%"></div></div>' +
                '<div class="stage-progress-text">已掌握 <b>' + pct + '%</b>（' + p.done + '/' + p.total + '）</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join("");
      }

      function loadKpProgress() {
        try {
          var raw = localStorage.getItem("py_kp_progress");
          if (raw) return JSON.parse(raw);
        } catch (e) {}
        var fallback = { total: 29, done: 0, stages: {} };
        STAGES.forEach(function (s) {
          var m = s.kp.match(/(\d+)/);
          var total = m ? parseInt(m[1]) : 0;
          fallback.stages[s.id] = { total: total, done: 0 };
        });
        return fallback;
      }

      function renderOverall() {
        var el = document.getElementById("stageOverall");
        var p = loadKpProgress();
        var pct = p.total ? Math.round(p.done / p.total * 100) : 0;
        el.innerHTML =
          '<span class="stage-overall-num">' + pct + '%</span>' +
          '<div class="stage-overall-body">' +
            '<div class="stage-overall-label">知识点总掌握：<b>' + p.done + '/' + p.total + '</b> 个' +
              (p.done === 0 ? '（去「知识点详解」勾选已掌握的内容）' : '') + '</div>' +
            '<div class="stage-overall-bar"><div class="stage-overall-fill" style="width:' + pct + '%"></div></div>' +
          '</div>';
      }

      function getFilter() {
        try { return localStorage.getItem(FILTER_KEY) || "all"; } catch (e) { return "all"; }
      }
      function setFilter(f) {
        try { localStorage.setItem(FILTER_KEY, f); } catch (e) {}
      }

      function todayStr() {
        var d = new Date();
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + m + "-" + day;
      }

      function load() {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          if (raw) return JSON.parse(raw);
          var old = localStorage.getItem("py_learning_loops_v1");
          if (old) {
            var oldEntries = JSON.parse(old);
            return oldEntries.map(function (e) {
              e.stage = e.stage || "1";
              return e;
            });
          }
          return [];
        } catch (e) { return []; }
      }
      function save(entries) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (e) {}
      }

      function render() {
        var entries = load();
        var filter = getFilter();
        var filtered = filter === "all" ? entries : entries.filter(function (e) {
          return String(e.stage || "1") === filter;
        });

        listEl.innerHTML = "";
        if (filtered.length === 0) {
          emptyEl.style.display = "block";
          emptyEl.textContent = filter === "all"
            ? "暂无闭环记录，先在上方新增一条吧。"
            : "该阶段暂无记录，切换到「全部」查看所有记录。";
          summaryEl.innerHTML = filter === "all"
            ? "还没有记录任何闭环。在下方表单填入知识点信息，点击「新增闭环」开始你的第一条记录。"
            : "当前筛选：" + (STAGE_NAMES[filter] || "") + "，共 " + entries.length + " 条记录（全部阶段）。";
          tagEl.textContent = entries.length + " 条";
          return;
        }
        emptyEl.style.display = "none";
        tagEl.textContent = entries.length + " 条";

        var totalSteps = 0, doneSteps = 0, fullLoops = 0;
        filtered.forEach(function (entry, idx) {
          var steps = entry.steps || [];
          var done = steps.filter(function (s) { return s; }).length;
          totalSteps += 5;
          doneSteps += done;
          if (done === 5) fullLoops++;

          var card = document.createElement("div");
          card.className = "python-entry";

          var pills = STEP_NAMES.map(function (n, i) {
            var cls = steps[i] ? "python-step-pill python-done" : "python-step-pill";
            return '<span class="' + cls + '">' + (steps[i] ? "✔ " : "") + n + "</span>";
          }).join("");

          var progCls = done === 5 ? "python-entry-progress python-full" : "python-entry-progress";
          var stageName = STAGE_NAMES[String(entry.stage || "1")] || "";

          card.innerHTML =
            '<div class="python-entry-head">' +
              '<span class="python-entry-name"></span>' +
              '<span class="python-entry-stage">' + stageName + '</span>' +
              '<span class="python-entry-date">' + escapeHtml(entry.date || "") + "</span>" +
              '<span class="' + progCls + '">' + done + "/5</span>" +
              '<button class="python-entry-del" type="button" data-idx="' + idx + '">删除</button>' +
            "</div>" +
            '<div class="python-entry-steps">' + pills + "</div>" +
            '<div class="python-entry-note"></div>';

          card.querySelector(".python-entry-name").textContent = entry.name || "(未命名知识点)";
          card.querySelector(".python-entry-note").textContent = entry.note || "";
          listEl.appendChild(card);
        });

        var filterLabel = filter === "all" ? "" : "（筛选：" + (STAGE_NAMES[filter] || "") + "）";
        summaryEl.innerHTML =
          "共 <b>" + filtered.length + "</b> 个闭环" + filterLabel + "，步骤完成 " +
          "<b>" + doneSteps + "/" + totalSteps + "</b>" +
          (fullLoops ? "，其中 <b>" + fullLoops + "</b> 个已走完全部 5 步。" : "。");
      }

      function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }

      function updateFilterUI() {
        var filter = getFilter();
        filterBar.querySelectorAll(".python-filter-btn").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-filter") === filter);
        });
      }

      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".python-filter-btn");
        if (!btn) return;
        setFilter(btn.getAttribute("data-filter"));
        updateFilterUI();
        render();
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = nameInput.value.trim();
        var date = dateInput.value || todayStr();
        if (!name) { nameInput.focus(); return; }
        var steps = Array.prototype.slice.call(stepChecks).map(function (cb) { return cb.checked; });

        var entries = load();
        entries.push({
          name: name,
          stage: stageSelect.value,
          date: date,
          steps: steps,
          note: noteInput.value.trim()
        });
        save(entries);

        setFilter(stageSelect.value);
        updateFilterUI();
        form.reset();
        dateInput.value = todayStr();
        render();
      });

      listEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".python-entry-del");
        if (!btn) return;
        var idx = parseInt(btn.getAttribute("data-idx"), 10);
        if (isNaN(idx)) return;
        if (!confirm("确定删除这条闭环记录吗？")) return;
        var entries = load();
        entries.splice(idx, 1);
        save(entries);
        render();
      });

      renderRoadmap();
      renderOverall();
      updateFilterUI();
      dateInput.value = todayStr();
      render();
    })();
