/**
 * 知识库 — 页面逻辑
 * 浏览、搜索、筛选、编辑知识点，支持5星权重调整
 */
(function() {

  var apiUrl = QuizUtils.apiUrl;
  var currentSubject = QuizUtils.getSubjectFromUrl();

  var SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
  };

  var allItems = [];        // 所有知识点
  var filteredItems = [];   // 筛选后的知识点
  var expandedMap = {};     // id → true（展开状态）
  var editingItem = null;   // 当前编辑的知识点
  var editStarValue = 3;    // 编辑弹窗中的星数

  /* ====== 初始化 ====== */
  function init() {
    // 设置页面标题
    var subjectName = SUBJECT_NAMES[currentSubject] || '知识库';
    document.getElementById('pageTitle').textContent = subjectName + ' · 知识库';

    // 绑定筛选事件
    document.getElementById('filterChapter').addEventListener('change', renderList);
    document.getElementById('filterWeight').addEventListener('change', renderList);
    document.getElementById('filterSource').addEventListener('change', renderList);
    document.getElementById('searchInput').addEventListener('input', debounce(renderList, 200));

    // 列表事件委托
    document.getElementById('knowledgeList').addEventListener('click', handleListClick);

    // 弹窗事件
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('modalSave').addEventListener('click', saveEdit);
    document.getElementById('editStars').addEventListener('click', handleStarInput);

    // 点击弹窗外部关闭
    document.getElementById('editModal').addEventListener('click', function(e) {
      if (e.target.id === 'editModal') closeModal();
    });

    // 加载数据
    loadKnowledge();
  }

  /* ====== 防抖 ====== */
  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  /* ====== 加载知识库数据 ====== */
  function loadKnowledge() {
    fetch(apiUrl('/api/knowledge?subject=' + currentSubject))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allItems = data.items || [];
        initFilters(data);
        renderList();
        updateStats();
      })
      .catch(function() {
        document.getElementById('knowledgeList').innerHTML =
          '<div class="kb-empty">加载失败，请刷新重试</div>';
      });
  }

  /* ====== 初始化筛选器 ====== */
  function initFilters(data) {
    // 章节筛选
    var chapterSet = {};
    allItems.forEach(function(item) {
      var ch = item.chapter || '未分类';
      chapterSet[ch] = (chapterSet[ch] || 0) + 1;
    });
    var chapterSelect = document.getElementById('filterChapter');
    var chapterDatalist = document.getElementById('chapterList');
    // 清空现有选项（保留第一个）
    while (chapterSelect.options.length > 1) chapterSelect.remove(1);
    chapterDatalist.innerHTML = '';
    // 按章节名称排序
    Object.keys(chapterSet).sort().forEach(function(ch) {
      var opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = ch + '（' + chapterSet[ch] + '）';
      chapterSelect.appendChild(opt);
      // 同时加到 datalist 供编辑时用
      var dlOpt = document.createElement('option');
      dlOpt.value = ch;
      chapterDatalist.appendChild(dlOpt);
    });

    // 来源筛选
    var sourceSelect = document.getElementById('filterSource');
    while (sourceSelect.options.length > 1) sourceSelect.remove(1);
    (data.sources || []).forEach(function(src) {
      var opt = document.createElement('option');
      opt.value = src;
      opt.textContent = src;
      sourceSelect.appendChild(opt);
    });
  }

  /* ====== 筛选 + 渲染列表 ====== */
  function renderList() {
    var chapter = document.getElementById('filterChapter').value;
    var weight = document.getElementById('filterWeight').value;
    var source = document.getElementById('filterSource').value;
    var keyword = document.getElementById('searchInput').value.trim().toLowerCase();

    filteredItems = allItems.filter(function(item) {
      // 章节筛选
      if (chapter && (item.chapter || '未分类') !== chapter) return false;
      // 权重筛选（>= 指定星数）
      if (weight) {
        var w = item.weight || 0;
        if (weight === '1') {
          if (w !== 1) return false;
        } else {
          if (w < parseInt(weight)) return false;
        }
      }
      // 来源筛选
      if (source && item.source !== source) return false;
      // 关键词搜索
      if (keyword) {
        var title = (item.title || '').toLowerCase();
        var content = (item.content || '').toLowerCase();
        if (title.indexOf(keyword) === -1 && content.indexOf(keyword) === -1) return false;
      }
      return true;
    });

    // 按权重降序 + 标题升序
    filteredItems.sort(function(a, b) {
      if (b.weight !== a.weight) return (b.weight || 0) - (a.weight || 0);
      return (a.title || '').localeCompare(b.title || '', 'zh-CN');
    });

    // 更新计数
    document.getElementById('filterCount').textContent = filteredItems.length + ' 条';

    // 渲染
    var list = document.getElementById('knowledgeList');
    if (filteredItems.length === 0) {
      list.innerHTML = '<div class="kb-empty">没有匹配的知识点</div>';
      return;
    }

    var html = filteredItems.map(function(item) {
      return renderCard(item);
    }).join('');
    list.innerHTML = html;
  }

  /* ====== 渲染单张知识点卡片 ====== */
  function renderCard(item) {
    var id = item.id;
    var expanded = expandedMap[id];
    var stars = renderStars(item.weight || 0);
    var chapter = item.chapter || '未分类';
    var source = item.source || '';
    var weight = item.weight || 0;
    var content = item.content || '';
    var preview = content.length > 100 ? content.substring(0, 100) + '...' : content;

    var html = '<div class="kb-card" data-id="' + id + '">';
    html += '<div class="kb-card-header">';
    html += '<div class="kb-card-title">' + escapeHtml(item.title || '未命名') + '</div>';
    html += '<div class="kb-card-stars" data-action="toggle-star">' + stars + '</div>';
    html += '</div>';

    html += '<div class="kb-card-meta">';
    html += '<span class="kb-badge kb-badge-chapter">📁 ' + escapeHtml(chapter) + '</span>';
    if (source) {
      html += '<span class="kb-badge kb-badge-source">📌 ' + escapeHtml(source) + '</span>';
    }
    html += '<span class="kb-badge kb-badge-weight">⭐ ' + weight + '星</span>';
    html += '</div>';

    if (expanded) {
      // 展开状态：显示完整内容
      html += '<div class="kb-card-content">' + formatContent(content) + '</div>';
      html += '<div class="kb-card-actions">';
      html += '<button class="kb-link-btn" data-action="collapse">收起</button>';
      html += '<button class="kb-link-btn kb-link-secondary" data-action="edit">编辑</button>';
      html += '<button class="kb-link-btn kb-link-danger" data-action="delete">删除</button>';
      html += '</div>';
    } else {
      // 收起状态：显示预览
      html += '<div class="kb-card-preview">' + escapeHtml(preview) + '</div>';
      html += '<div class="kb-card-actions">';
      html += '<button class="kb-link-btn" data-action="expand">展开查看</button>';
      html += '<button class="kb-link-btn kb-link-secondary" data-action="edit">编辑</button>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ====== 渲染星星 ====== */
  function renderStars(weight) {
    var w = Math.min(5, Math.max(0, weight));
    var html = '';
    for (var i = 1; i <= 5; i++) {
      var cls = i <= w ? 'kb-star kb-star-on' : 'kb-star kb-star-off';
      html += '<span class="' + cls + '" data-star="' + i + '">★</span>';
    }
    return html;
  }

  /* ====== 格式化内容（换行转 <br>，简单处理） ====== */
  function formatContent(text) {
    if (!text) return '';
    var escaped = escapeHtml(text);
    // 段落分隔
    escaped = escaped.replace(/\n\n/g, '</p><p>');
    // 单换行
    escaped = escaped.replace(/\n/g, '<br>');
    return '<p>' + escaped + '</p>';
  }

  /* ====== HTML 转义 ====== */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ====== 列表点击事件委托 ====== */
  function handleListClick(e) {
    var target = e.target;
    var action = target.getAttribute('data-action');

    // 找卡片
    var card = target.closest('.kb-card');
    if (!card) return;
    var id = card.getAttribute('data-id');

    if (action === 'expand' || action === 'collapse') {
      expandedMap[id] = !expandedMap[id];
      renderList();
    } else if (action === 'edit') {
      openEditModal(id);
    } else if (action === 'delete') {
      if (confirm('确定要删除这个知识点吗？')) {
        deleteItem(id);
      }
    } else if (action === 'toggle-star' || target.classList.contains('kb-star')) {
      // 点击星星调整权重
      var starEl = target.classList.contains('kb-star') ? target : target.closest('.kb-star');
      if (starEl) {
        var starVal = parseInt(starEl.getAttribute('data-star'));
        updateWeight(id, starVal);
      }
    }
  }

  /* ====== 更新权重 ====== */
  function updateWeight(id, weight) {
    var item = findItem(id);
    if (!item) return;

    // 点击当前星数时降级：点第5星变1星，点第4星变3星...
    if (item.weight === weight) {
      weight = weight === 1 ? 5 : weight - 1;
    }

    item.weight = weight;
    item.updatedAt = new Date().toISOString();

    // 保存到后端
    saveItemToServer(item);

    // 重新渲染（保持展开状态）
    renderList();
    updateStats();
  }

  /* ====== 删除知识点 ====== */
  function deleteItem(id) {
    allItems = allItems.filter(function(item) { return item.id !== id; });
    delete expandedMap[id];

    // 整体保存
    saveAllToServer();

    renderList();
    updateStats();
    initFilters({ sources: getSources() });
  }

  /* ====== 打开编辑弹窗 ====== */
  function openEditModal(id) {
    var item = findItem(id);
    if (!item) return;
    editingItem = item;

    document.getElementById('editTitle').value = item.title || '';
    document.getElementById('editChapter').value = item.chapter || '';
    document.getElementById('editTags').value = (item.tags || []).join(', ');
    document.getElementById('editContent').value = item.content || '';
    editStarValue = item.weight || 3;
    updateStarInput();

    document.getElementById('editModal').style.display = 'flex';
  }

  /* ====== 关闭弹窗 ====== */
  function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editingItem = null;
  }

  /* ====== 星星输入交互 ====== */
  function handleStarInput(e) {
    var star = e.target;
    if (!star.getAttribute('data-star')) return;
    editStarValue = parseInt(star.getAttribute('data-star'));
    updateStarInput();
  }

  function updateStarInput() {
    var stars = document.querySelectorAll('#editStars .kb-star');
    document.querySelectorAll('#editStars span').forEach(function(el, idx) {
      if (idx < editStarValue) {
        el.classList.add('kb-star-on');
        el.classList.remove('kb-star-off');
      } else {
        el.classList.add('kb-star-off');
        el.classList.remove('kb-star-on');
      }
    });
  }

  /* ====== 保存编辑 ====== */
  function saveEdit() {
    if (!editingItem) return;

    var title = document.getElementById('editTitle').value.trim();
    if (!title) {
      alert('请输入标题');
      return;
    }

    editingItem.title = title;
    editingItem.chapter = document.getElementById('editChapter').value.trim() || '未分类';
    editingItem.weight = editStarValue;
    var tagsStr = document.getElementById('editTags').value.trim();
    editingItem.tags = tagsStr ? tagsStr.split(/[,，]/).map(function(t) { return t.trim(); }).filter(Boolean) : [];
    editingItem.content = document.getElementById('editContent').value;
    editingItem.updatedAt = new Date().toISOString();

    saveItemToServer(editingItem);
    closeModal();
    renderList();
    updateStats();
    initFilters({ sources: getSources() });
  }

  /* ====== 保存单条到服务器 ====== */
  function saveItemToServer(item) {
    fetch(apiUrl('/api/knowledge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, item: item })
    }).catch(function() {});
  }

  /* ====== 整体保存到服务器 ====== */
  function saveAllToServer() {
    var sources = getSources();
    fetch(apiUrl('/api/knowledge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: currentSubject,
        subjectName: SUBJECT_NAMES[currentSubject] || '',
        items: allItems,
        sources: sources,
      })
    }).catch(function() {});
  }

  /* ====== 获取所有来源 ====== */
  function getSources() {
    var set = {};
    allItems.forEach(function(item) {
      if (item.source) set[item.source] = true;
    });
    return Object.keys(set);
  }

  /* ====== 查找知识点 ====== */
  function findItem(id) {
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].id === id) return allItems[i];
    }
    return null;
  }

  /* ====== 更新统计 ====== */
  function updateStats() {
    document.getElementById('statTotal').textContent = allItems.length;
    if (allItems.length > 0) {
      var total = 0;
      allItems.forEach(function(item) { total += (item.weight || 0); });
      var avg = (total / allItems.length).toFixed(1);
      document.getElementById('statAvgWeight').textContent = avg;
    } else {
      document.getElementById('statAvgWeight').textContent = '0';
    }
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
