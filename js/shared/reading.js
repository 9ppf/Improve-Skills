/**
 * reading.js — 范文阅读模块的渲染与交互逻辑
 *
 * 数据来源：data/reading/{year}.json，由 build.py 注入为 window.readingData{year}
 * 本文件被 templates/workbench.html 引用，不在页面中内联。
 */

function isReadingItem(item) {
  return item && item.type === 'reading';
}

function hasContentUrl(item) {
  return item && typeof item.contentUrl === 'string' && item.contentUrl.trim() !== '';
}

function renderContentFrame(item) {
  var url = item.contentUrl || '';
  var bareCls = item.renderMode === 'bare' ? ' content-frame-bare' : '';
  return '<div class="content-frame-wrap' + bareCls + '">' +
    '<iframe class="content-frame" src="' + url + '" title="' + item.name + '" loading="lazy"></iframe>' +
    '</div>';
}

function renderReadingContent(item) {
  var data = item.readingData && window[item.readingData];
  if (!data) return '<div class="reading-content"><p>加载中...</p></div>';
  return renderReadingFromJson(data);
}

/**
 * 确保范文数据已加载（按需加载，兼容 file:// 协议）
 * 返回 Promise，加载完成后 resolve（数据挂载到 window[item.readingData]）
 * 已加载过的直接 resolve
 */
var _readingDataCache = {};
function ensureReadingData(item) {
  if (!item || !item.readingData) return Promise.resolve();
  if (window[item.readingData]) return Promise.resolve();
  if (_readingDataCache[item.readingData]) return _readingDataCache[item.readingData];

  var dataUrl = item.dataUrl;
  if (!dataUrl) {
    // 兼容旧格式：没有 dataUrl 时直接 resolve（数据可能已内联）
    return Promise.resolve();
  }

  _readingDataCache[item.readingData] = new Promise(function(resolve) {
    var script = document.createElement('script');
    script.src = dataUrl;
    script.onload = resolve;
    script.onerror = resolve; // 失败也继续，避免卡住
    document.head.appendChild(script);
  });
  return _readingDataCache[item.readingData];
}

function renderReadingFromJson(data) {
  var html = '<div class="reading-content">\n';
  html += '<span id="top"></span>\n';

  if (data.notice) {
    html += '<div class="notice"><strong>说明：</strong>' + data.notice + '</div>\n';
  }

  (data.sections || []).forEach(function(section) {
    html += renderSection(section);
  });

  if (data.sources && data.sources.length) {
    html += renderSources(data.sources);
  }

  html += '</div>';
  return html;
}

function renderSection(section) {
  var titleText = section.badge ? section.badge + ' · ' + section.title : section.title;
  var html = '';
  html += '<div class="reading-section collapsed" data-section="' + section.id + '">\n';
  html += '  <div class="reading-section-header" onclick="toggleReadingSection(\'' + section.id + '\')">\n';
  html += '    <span class="reading-section-chevron">▾</span>\n';
  html += '    <span class="reading-section-title">' + titleText + '</span>\n';
  html += '  </div>\n';
  html += '  <div class="reading-section-body">\n';
  html += renderCard(section);
  html += '  </div>\n';
  html += '</div>\n';
  return html;
}

function renderCard(section) {
  var html = '';
  html += '<div class="reading-card">\n';
  html += '<h3>作文题目</h3>\n';
  html += renderTopic(section.topic);
  (section.essays || []).forEach(function(essay) {
    html += renderEssay(essay);
  });
  html += '</div>\n';
  return html;
}

function renderTopic(topic) {
  if (!topic || !topic.paragraphs) return '<div class="reading-topic"></div>\n';
  var html = '<div class="reading-topic">\n';
  topic.paragraphs.forEach(function(p) {
    if (p.type === 'req') {
      html += '<p class="req">' + p.text + '</p>\n';
    } else if (p.type === 'strong') {
      html += '<p><strong>' + p.text + '</strong></p>\n';
    } else {
      html += '<p>' + p.text + '</p>\n';
    }
  });
  html += '</div>\n';
  return html;
}

function renderEssay(essay) {
  var html = '<div class="reading-essay">\n';
  html += '<div class="reading-essay-title">' + essay.title + '</div>\n';
  html += '<div class="reading-essay-body">\n';
  (essay.paragraphs || []).forEach(function(p) {
    html += '<p>' + p + '</p>\n';
  });
  html += '</div>\n';
  if (essay.meta) {
    html += '<div class="reading-essay-meta">' + essay.meta + '</div>\n';
  }
  html += '</div>\n';
  return html;
}

function renderSources(sources) {
  var html = '<div class="reading-sources">\n';
  html += '<h2>资料来源</h2>\n';
  html += '<ol>\n';
  sources.forEach(function(src) {
    html += '<li id="' + src.id + '">';
    html += '<span class="src-title">' + src.title + '</span> ';
    html += '<a class="src-url" href="' + src.url + '" target="_blank" rel="noopener">' + src.url + '</a>';
    html += '</li>\n';
  });
  html += '</ol>\n';
  html += '</div>\n';
  return html;
}

function toggleReadingSection(id) {
  var section = document.querySelector('.reading-section[data-section="' + id + '"]');
  if (section) section.classList.toggle('collapsed');
}
