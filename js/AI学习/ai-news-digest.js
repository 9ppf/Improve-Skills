// ============================================================
// ai-news-digest 页面 JS
// 抽离自 ai-news-digest.html
// ============================================================

/**
 * AI 资讯周报展示页
 *
 * 数据来源：
 * 1. 优先尝试 fetch ai-news-data.json（由定时任务更新）
 * 2. 如果 fetch 失败（file:// 协议或文件不存在），使用内嵌示例数据
 *
 * 定时任务每周六 10:00 生成周报后，更新 ai-news-data.json 即可自动刷新页面内容。
 */

var EMBEDDED_DATA = {
  "current": {
    "weekLabel": "2026 年第 32 周",
    "dateRange": "2026-08-04 ~ 2026-08-10",
    "items": [
      {
        "date": "2026-08-10",
        "category": "policy",
        "title": "上海发布 AI 训练师补贴目录",
        "summary": "符合条件者可申请职业技能提升补贴。建议 Demo：整理个人技能匹配清单。"
      },
      {
        "date": "2026-08-08",
        "category": "product",
        "title": "OpenAI 开放新模型微调 API",
        "summary": "支持更低成本微调。建议 Demo：考后用个人笔记数据做小模型微调实验。"
      },
      {
        "date": "2026-08-05",
        "category": "policy",
        "title": "嘉定区数字经济人才政策更新",
        "summary": "新增 AI 应用岗位租房补贴。建议 Demo：岗位补贴匹配计算器。"
      },
      {
        "date": "2026-08-02",
        "category": "product",
        "title": "某国产 Agent 平台开放插件市场",
        "summary": "插件化 Agent 成为新趋势。建议 Demo：考前体验一个插件工作流。"
      }
    ]
  },
  "archive": []
};

var CATEGORY_META = {
  policy:   { icon: "📋", name: "政策补贴", tagClass: "policy" },
  product:  { icon: "🚀", name: "产品动态", tagClass: "product" },
  research: { icon: "🔬", name: "研究进展", tagClass: "research" },
  tutorial: { icon: "📚", name: "教程资源", tagClass: "tutorial" }
};

var currentFilter = "all";
var pageData = null;

function loadData() {
  fetch("ai-news-data.json")
    .then(function(r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function(d) { pageData = d; render(); })
    .catch(function() {
      pageData = EMBEDDED_DATA;
      render();
    });
}

function render() {
  renderStats();
  renderDigest();
  renderArchive();
}

function renderStats() {
  var items = pageData.current.items || [];
  var policyCount = items.filter(function(i) { return i.category === "policy"; }).length;
  var productCount = items.filter(function(i) { return i.category === "product"; }).length;
  var archiveCount = (pageData.archive || []).length;

  document.getElementById("statTotal").textContent = items.length;
  document.getElementById("statPolicy").textContent = policyCount;
  document.getElementById("statProduct").textContent = productCount;
  document.getElementById("statWeek").textContent = archiveCount + 1;
}

function renderDigest() {
  var container = document.getElementById("digestContainer");
  var items = pageData.current.items || [];

  var filtered = currentFilter === "all"
    ? items
    : items.filter(function(i) { return i.category === currentFilter; });

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="ainews-empty">' +
      '<div class="ainews-empty-icon">📭</div>' +
      '<div class="ainews-empty-text">该分类暂无资讯</div>' +
      '<div class="ainews-empty-hint">每周六 10:00 自动更新</div>' +
      '</div>';
    return;
  }

  var grouped = {};
  filtered.forEach(function(item) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  var html = '<div class="ainews-week">';
  html += '<div class="ainews-week-title">' + escapeHtml(pageData.current.weekLabel) +
          ' <span class="ainews-badge">最新</span></div>';
  html += '<div class="ainews-week-date">' + escapeHtml(pageData.current.dateRange) + '</div>';

  for (var cat in grouped) {
    if (!grouped.hasOwnProperty(cat)) continue;
    var meta = CATEGORY_META[cat] || { icon: "📌", name: cat };
    var catItems = grouped[cat];

    html += '<div class="ainews-category">';
    html += '<div class="ainews-category-header">';
    html += '<span class="ainews-category-icon">' + meta.icon + '</span>';
    html += '<span class="ainews-category-name">' + escapeHtml(meta.name) + '</span>';
    html += '<span class="ainews-category-count">' + catItems.length + ' 条</span>';
    html += '</div>';

    catItems.forEach(function(item) {
      var tagCls = (CATEGORY_META[item.category] || {}).tagClass || "";
      html += '<div class="ainews-item">';
      html += '<div class="ainews-item-date">' + escapeHtml(item.date) + '</div>';
      html += '<div class="ainews-item-body">';
      html += '<div class="ainews-item-title">' + escapeHtml(item.title);
      if (tagCls) {
        html += '<span class="ainews-item-tag ' + tagCls + '">' + escapeHtml(meta.name) + '</span>';
      }
      html += '</div>';
      html += '<div class="ainews-item-summary">' + escapeHtml(item.summary) + '</div>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function renderArchive() {
  var archive = pageData.archive || [];
  if (archive.length === 0) {
    document.getElementById("archiveSection").style.display = "none";
    return;
  }

  document.getElementById("archiveSection").style.display = "block";
  var listEl = document.getElementById("archiveList");
  var html = "";

  archive.forEach(function(entry) {
    var count = (entry.items || []).length;
    html += '<div class="ainews-archive-item">';
    html += '<span class="ainews-archive-date">' + escapeHtml(entry.dateRange || "") + '</span>';
    html += '<span class="ainews-archive-label">' + escapeHtml(entry.weekLabel || "周报") + '</span>';
    html += '<span class="ainews-archive-count">' + count + ' 条</span>';
    html += '</div>';
  });

  listEl.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.getElementById("filterBar").addEventListener("click", function(e) {
  var btn = e.target.closest(".ainews-filter-btn");
  if (!btn) return;

  document.querySelectorAll(".ainews-filter-btn").forEach(function(b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");
  currentFilter = btn.dataset.cat;
  renderDigest();
});

loadData();
