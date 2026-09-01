// ============================================================
// ai-code-review 页面 JS
// 抽离自 ai-code-review.html
// ============================================================

(function() {
  "use strict";

  var STORAGE_KEY = "ai-code-review-data";

  var presetPrompt = document.getElementById("aiCodePresetPrompt").textContent;

  var checklistDefs = [
    { id: "naming",      label: "变量命名是否规范" },
    { id: "exceptions",  label: "是否有未处理的异常" },
    { id: "hardcode",    label: "是否有硬编码的值" },
    { id: "longfunc",    label: "函数是否过长（>50行）" },
    { id: "duplicate",   label: "是否有重复代码" },
    { id: "complexity",  label: "时间/空间复杂度分析" },
    { id: "security",    label: "是否有安全隐患（如eval、exec）" },
    { id: "pep8",        label: "是否符合PEP 8" }
  ];

  var codeInput      = document.getElementById("aiCodeInput");
  var generateBtn    = document.getElementById("aiCodeGenerate");
  var clearBtn       = document.getElementById("aiCodeClear");
  var copyPromptBtn  = document.getElementById("aiCodeCopyPrompt");
  var reportSection  = document.getElementById("aiCodeReport");
  var statsContainer = document.getElementById("aiCodeStats");
  var checklistContainer = document.getElementById("aiCodeChecklist");
  var suggestionsEl  = document.getElementById("aiCodeSuggestions");
  var timeCompEl     = document.getElementById("aiCodeTimeComplexity");
  var spaceCompEl    = document.getElementById("aiCodeSpaceComplexity");
  var summaryEl      = document.getElementById("aiCodeSummary");
  var toastEl        = document.getElementById("aiCodeToast");

  /* ---------- 提示弹窗 ---------- */
  var toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("ai-code-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toastEl.classList.remove("ai-code-show");
    }, 2000);
  }

  /* ---------- 剪贴板 ---------- */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast("已复制到剪贴板");
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("已复制到剪贴板");
    } catch (e) {
      showToast("复制失败，请手动复制");
    }
    document.body.removeChild(ta);
  }

  /* ---------- 代码分析 ---------- */
  function analyzeCode(code) {
    var lines = code.split("\n");
    var stats = {
      lines: lines.length,
      functions: 0,
      classes: 0,
      imports: 0,
      comments: 0,
      longFunctions: [],
      securityIssues: [],
      longLines: 0,
      hardcodedHints: []
    };

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      if (/^\s*def\s+/.test(line)) {
        stats.functions++;
        var indent = line.length - line.replace(/^\s+/, "").length;
        var match = line.match(/def\s+(\w+)/);
        var name = match ? match[1] : "unknown";

        var endLine = lines.length;
        for (var j = i + 1; j < lines.length; j++) {
          var l = lines[j];
          if (l.trim() === "") continue;
          var li = l.length - l.replace(/^\s+/, "").length;
          if (li <= indent) {
            endLine = j;
            break;
          }
        }
        var funcLen = endLine - i;
        if (funcLen > 50) {
          stats.longFunctions.push({ name: name, length: funcLen });
        }
      }

      if (/^\s*class\s+/.test(line)) stats.classes++;

      if (/^\s*(import\s+|from\s+[\w.]+\s+import\s+)/.test(line)) stats.imports++;

      if (/^\s*#/.test(line)) stats.comments++;

      if (line.length > 79) stats.longLines++;

      var secMatch = line.match(/\b(eval|exec|os\.system|subprocess\.call|pickle\.loads|__import__)\s*\(/);
      if (secMatch) {
        stats.securityIssues.push({ line: i + 1, name: secMatch[1] });
      }

      if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(line) ||
          /(["'])[A-Z]:\\[^"']*/.test(line) ||
          /(["'])\/(?:home|usr|var|opt|etc)\//.test(line) ||
          /(["'])(?:sk-|pk-|AKIA)[a-zA-Z0-9]{10,}/.test(line)) {
        stats.hardcodedHints.push(i + 1);
      }
    }

    return stats;
  }

  /* ---------- 渲染统计 ---------- */
  function renderStats(stats) {
    var items = [
      { value: stats.lines,     label: "总行数" },
      { value: stats.functions, label: "函数" },
      { value: stats.classes,   label: "类" },
      { value: stats.imports,   label: "导入" },
      { value: stats.comments,  label: "注释行" }
    ];

    statsContainer.innerHTML = "";
    items.forEach(function(item) {
      var div = document.createElement("div");
      div.className = "ai-code-stat-item";
      div.innerHTML =
        '<span class="ai-code-stat-value">' + item.value + "</span>" +
        '<span class="ai-code-stat-label">' + item.label + "</span>";
      statsContainer.appendChild(div);
    });
  }

  /* ---------- 渲染检查清单 ---------- */
  function renderChecklist(stats) {
    checklistContainer.innerHTML = "";

    checklistDefs.forEach(function(item) {
      var note = "";
      var autoStatus = "";

      if (item.id === "longfunc" && stats.longFunctions.length > 0) {
        autoStatus = "warning";
        var names = stats.longFunctions.map(function(f) {
          return f.name + "(" + f.length + "行)";
        }).join("、");
        note = "自动检测：发现 " + stats.longFunctions.length + " 个超长函数 — " + names;
      }

      if (item.id === "security" && stats.securityIssues.length > 0) {
        autoStatus = "error";
        var secNames = stats.securityIssues.map(function(s) {
          return "第" + s.line + "行 " + s.name + "()";
        }).join("、");
        note = "自动检测：发现安全隐患 — " + secNames;
      }

      if (item.id === "pep8" && stats.longLines > 0) {
        autoStatus = "warning";
        note = "自动检测：发现 " + stats.longLines + " 行超过 79 字符";
      }

      if (item.id === "hardcode" && stats.hardcodedHints.length > 0) {
        autoStatus = "warning";
        note = "自动检测：第 " + stats.hardcodedHints.join("、") + " 行疑似硬编码值";
      }

      var row = document.createElement("div");
      row.className = "ai-code-checklist-item";
      row.setAttribute("data-status", autoStatus || "pending");
      row.setAttribute("data-id", item.id);

      var noteHtml = note
        ? '<div class="ai-code-checklist-note ' +
          (autoStatus === "error" ? "ai-code-auto-fail" : "ai-code-auto-warn") +
          '">' + note + "</div>"
        : "";

      row.innerHTML =
        '<div class="ai-code-checklist-left">' +
          '<div class="ai-code-checklist-label">' + item.label + "</div>" +
          noteHtml +
        "</div>" +
        '<select class="ai-code-checklist-select">' +
          '<option value="pending"' + (autoStatus === "" ? " selected" : "") + ">-- 请选择 --</option>" +
          '<option value="pass"' + (autoStatus === "pass" ? " selected" : "") + ">✓ 通过</option>" +
          '<option value="warning"' + (autoStatus === "warning" ? " selected" : "") + ">⚠ 待改进</option>" +
          '<option value="error"' + (autoStatus === "error" ? " selected" : "") + ">✗ 问题</option>" +
        "</select>";

      var select = row.querySelector(".ai-code-checklist-select");
      select.addEventListener("change", function() {
        row.setAttribute("data-status", select.value);
        saveState();
      });

      checklistContainer.appendChild(row);
    });
  }

  /* ---------- 生成报告 ---------- */
  function generateReport() {
    var code = codeInput.value.trim();
    if (!code) {
      showToast("请先粘贴代码");
      codeInput.focus();
      return;
    }

    var stats = analyzeCode(code);
    renderStats(stats);
    renderChecklist(stats);

    reportSection.classList.add("ai-code-visible");
    saveState();
    showToast("复盘报告已生成");

    setTimeout(function() {
      reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  /* ---------- 清空 ---------- */
  function clearAll() {
    codeInput.value = "";
    suggestionsEl.value = "";
    timeCompEl.value = "";
    spaceCompEl.value = "";
    summaryEl.value = "";
    statsContainer.innerHTML = "";
    checklistContainer.innerHTML = "";
    reportSection.classList.remove("ai-code-visible");
    localStorage.removeItem(STORAGE_KEY);
    showToast("已清空");
    codeInput.focus();
  }

  /* ---------- 复制提示词 ---------- */
  function copyPrompt() {
    var code = codeInput.value.trim();
    var text = presetPrompt;
    if (code) {
      text += "\n" + code;
    }
    copyToClipboard(text);
  }

  /* ---------- 本地存储 ---------- */
  function saveState() {
    var checklistStates = {};
    var selects = checklistContainer.querySelectorAll(".ai-code-checklist-item");
    selects.forEach(function(item) {
      var id = item.getAttribute("data-id");
      var sel = item.querySelector(".ai-code-checklist-select");
      if (sel) checklistStates[id] = sel.value;
    });

    var data = {
      code: codeInput.value,
      reportVisible: reportSection.classList.contains("ai-code-visible"),
      checklist: checklistStates,
      suggestions: suggestionsEl.value,
      timeComplexity: timeCompEl.value,
      spaceComplexity: spaceCompEl.value,
      summary: summaryEl.value
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadState() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;

    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (data.code) {
      codeInput.value = data.code;
    }

    if (data.reportVisible && data.code && data.code.trim()) {
      var stats = analyzeCode(data.code);
      renderStats(stats);
      renderChecklist(stats);

      if (data.checklist) {
        Object.keys(data.checklist).forEach(function(id) {
          var item = checklistContainer.querySelector(
            '.ai-code-checklist-item[data-id="' + id + '"]'
          );
          if (item) {
            var sel = item.querySelector(".ai-code-checklist-select");
            if (sel) {
              sel.value = data.checklist[id];
              item.setAttribute("data-status", data.checklist[id]);
            }
          }
        });
      }

      if (data.suggestions) suggestionsEl.value = data.suggestions;
      if (data.timeComplexity) timeCompEl.value = data.timeComplexity;
      if (data.spaceComplexity) spaceCompEl.value = data.spaceComplexity;
      if (data.summary) summaryEl.value = data.summary;

      reportSection.classList.add("ai-code-visible");
    }
  }

  /* ---------- 输入时自动保存 ---------- */
  [codeInput, suggestionsEl, timeCompEl, spaceCompEl, summaryEl].forEach(function(el) {
    el.addEventListener("input", function() {
      if (reportSection.classList.contains("ai-code-visible")) {
        saveState();
      }
    });
  });

  /* ---------- 事件绑定 ---------- */
  generateBtn.addEventListener("click", generateReport);
  clearBtn.addEventListener("click", clearAll);
  copyPromptBtn.addEventListener("click", copyPrompt);

  /* ---------- 初始化 ---------- */
  loadState();
})();
