// ============================================================
// 主工作台（此刻便是春天）主逻辑 JS
// 依赖：
//   - js/shared/reading.js（阅读模块渲染函数）
//   - 全局变量 workspaces（由模板内联注入）
//   - 全局变量 readingData{year}（由模板内联注入）
// ============================================================


    let currentWorkspaceId = 'read';
    let searchQuery = '';
    let activeItemId = null;
    let activeTab = 'plan';
    const collapsed = new Set();

    // ---- 递归辅助函数 ----
    function isFolder(item) {
      return Array.isArray(item.items) && item.items.length > 0;
    }

    function assignIds(node, ws, cat, prefix) {
      if (isFolder(node)) {
        node.items.forEach((child, idx) => {
          child.id = child.id || (child.code ? `code_${child.code}` : `${prefix}_${idx}_${Date.now()}`);
          assignIds(child, ws, cat, child.id);
        });
      }
    }

    workspaces.forEach(ws => {
      ws.categories.forEach(cat => {
        if (Array.isArray(cat.items)) {
          cat.items.forEach((item, idx) => {
            item.id = item.id || (item.code ? `code_${item.code}` : `${ws.id}_${cat.name}_${idx}_${Date.now()}`);
            assignIds(item, ws, cat, item.id);
          });
        }
      });
    });

    function getCurrentWorkspace() {
      return workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];
    }

    function wsKey(ws) { return `ws-${ws.id}`; }
    function catKey(ws, cat) { return `cat-${ws.id}-${cat.name}`; }
    function folderKey(ws, cat, item) { return `folder-${ws.id}-${cat.name}-${item.id}`; }

    function matchesSearch(item) {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q));
    }

    function countLeaves(items) {
      if (!Array.isArray(items)) return 0;
      return items.reduce((sum, item) => {
        if (item.hidden) return sum;
        return sum + (isFolder(item) ? countLeaves(item.items) : 1);
      }, 0);
    }

    function hasVisibleDescendant(item) {
      if (item.hidden) return false;
      if (!isFolder(item)) return matchesSearch(item);
      return item.items.some(hasVisibleDescendant);
    }

    
    // ---- 实时进度集成：从交互页面读取 localStorage ----
    var PY_KT_TOTAL = 29; // python-knowledge-tree.html 有 29 个知识点

    function getLiveProgressForItem(item) {
      if (!item.contentUrl) return null;
      var url = item.contentUrl;
      try {
        if (url.indexOf('python-knowledge-tree.html') !== -1) {
          var st = JSON.parse(localStorage.getItem('py_knowledge_tree_v1') || '{}');
          var d = Object.keys(st).length;
          return { done: d, total: PY_KT_TOTAL, percent: Math.min(100, Math.round(d / PY_KT_TOTAL * 100)) };
        }
        if (url.indexOf('python-learning-loop.html') !== -1) {
          var loops = JSON.parse(localStorage.getItem('py_learning_loops_v1') || '[]');
          var t = loops.length * 5;
          var d2 = loops.reduce(function(s, l) { return s + (l.steps || []).filter(function(x) { return x; }).length; }, 0);
          return { done: d2, total: t, percent: t ? Math.min(100, Math.round(d2 / t * 100)) : 0 };
        }
        if (url.indexOf('真题练习-真题与错题本.html') !== -1) {
          var eq = JSON.parse(localStorage.getItem('exam-questions-data') || '{}');
          var subj = (url.match(/subject=([^&]+)/) || [])[1] || '';
          var et = 0, ed = 0;
          if (subj && eq[subj]) {
            eq[subj].forEach(function(q) { et++; if (q.status === 'correct') ed++; });
          } else {
            for (var sk in eq) { if (!eq.hasOwnProperty(sk)) continue; (eq[sk] || []).forEach(function(q) { et++; if (q.status === 'correct') ed++; }); }
          }
          return { done: ed, total: et, percent: et ? Math.min(100, Math.round(ed / et * 100)) : 0 };
        }
        if (url.indexOf('背诵与简答-核心概念背诵卡.html') !== -1) {
          var rc = JSON.parse(localStorage.getItem('recite-cards-data') || '{}');
          var rsubj = (url.match(/subject=([^&]+)/) || [])[1] || '';
          var rt = 0, rd = 0;
          if (rsubj && rc[rsubj]) {
            rc[rsubj].forEach(function(c) { rt++; if (c.mastery === 'known') rd++; });
          } else {
            for (var rk in rc) { if (!rc.hasOwnProperty(rk)) continue; (rc[rk] || []).forEach(function(c) { rt++; if (c.mastery === 'known') rd++; }); }
          }
          return { done: rd, total: rt, percent: rt ? Math.min(100, Math.round(rd / rt * 100)) : 0 };
        }
      } catch(e) {}
      return null;
    }

    function getItemProgress(item) {
      var live = getLiveProgressForItem(item);
      if (live) return live;
      var total = item.total !== undefined ? item.total : (item.chapters || 1);
      var done = item.done !== undefined ? item.done : 0;
      var percent = Math.min(100, Math.round((done / total) * 100)) || 0;
      return { done: done, total: total, percent: percent };
    }

    function updateSidebarProgress() {
      workspaces.forEach(function(ws) {
        ws.categories.forEach(function(cat) {
          if (!Array.isArray(cat.items)) return;
          cat.items.forEach(function walk(item) {
            if (isFolder(item)) {
              item.items.forEach(walk);
              return;
            }
            var live = getLiveProgressForItem(item);
            if (!live) return;
            var el = document.querySelector('.tree-row.leaf .row-main[data-id="' + CSS.escape(item.id) + '"]');
            if (el) {
              var fill = el.querySelector('.leaf-progress-fill');
              if (fill) fill.style.width = live.percent + '%';
            }
          });
        });
      });
    }

function renderTree() {
      const tree = document.getElementById('tree');
      tree.innerHTML = workspaces.map(ws => {
        const wsCollapsed = collapsed.has(wsKey(ws)) && !searchQuery;
        const visibleTotal = ws.categories.reduce((sum, cat) => sum + countLeaves(cat.items), 0);
        if (searchQuery && visibleTotal === 0) return '';

        const categoriesHtml = ws.categories.map(cat => {
          const itemsHtml = renderItems(ws, cat, cat.items, 0);

          if (cat.flat) {
            return itemsHtml;
          }

          const catCollapsed = collapsed.has(catKey(ws, cat)) && !searchQuery;
          return `
            <div class="tree-node ${catCollapsed ? 'collapsed' : ''}">
              <div class="tree-row header">
                <div class="row-main" onclick="toggleCategory('${ws.id}','${escapeJs(cat.name)}')" tabindex="0">
                  <span class="tree-chevron">▾</span>
                  <span class="tree-icon" style="background:${cat.iconBg || 'var(--rule)'}" onclick="event.stopPropagation();editCategory('${ws.id}','${escapeJs(cat.name)}')" title="点击更换图标">${cat.icon}</span>
                  <span class="tree-label">${cat.name}</span>
                  <span class="tree-count">${countLeaves(cat.items)}</span>
                </div>
                <div class="row-actions">
                  <button class="btn-icon btn-edit" title="编辑分类" onclick="event.stopPropagation();editCategory('${ws.id}','${escapeJs(cat.name)}')">✏️</button>
                  <button class="btn-icon btn-delete" title="删除分类" onclick="event.stopPropagation();deleteCategory('${ws.id}','${escapeJs(cat.name)}')">🗑️</button>
                </div>
              </div>
              <div class="tree-children">${itemsHtml}</div>
            </div>
          `;
        }).join('');

        return `
          <div class="tree-node ${wsCollapsed ? 'collapsed' : ''}">
            <div class="tree-row header">
              <div class="row-main" onclick="toggleWorkspaceNode('${ws.id}')" tabindex="0">
                <span class="tree-chevron">▾</span>
                <span class="tree-icon" style="background:${ws.iconBg || 'var(--rule)'}" onclick="event.stopPropagation();editWorkspace('${ws.id}')" title="点击更换图标">${ws.icon}</span>
                <span class="tree-label">${ws.name}</span>
                <span class="tree-count">${visibleTotal}</span>
              </div>
              <div class="row-actions">
                <button class="btn-icon btn-edit" title="编辑工作区" onclick="event.stopPropagation();editWorkspace('${ws.id}')">✏️</button>
                <button class="btn-icon btn-delete" title="删除工作区" onclick="event.stopPropagation();deleteWorkspace('${ws.id}')">🗑️</button>
              </div>
            </div>
            <div class="tree-children">${categoriesHtml}</div>
          </div>
        `;
      }).join('');
    }

    function renderItems(ws, cat, items, depth) {
      if (!Array.isArray(items) || items.length === 0) {
        return '<div class="tree-empty">暂无项目</div>';
      }

      const visibleItems = items.filter(item => !item.hidden && (searchQuery ? (matchesSearch(item) || hasVisibleDescendant(item)) : true));
      if (visibleItems.length === 0) return '';

      return visibleItems.map(item => {
        if (isFolder(item)) {
          const folderCollapsed = collapsed.has(folderKey(ws, cat, item)) && !searchQuery;
          const childrenHtml = renderItems(ws, cat, item.items, depth + 1);
          return `
            <div class="tree-node ${folderCollapsed ? 'collapsed' : ''}">
              <div class="tree-row header folder-item">
                <div class="row-main" onclick="toggleFolder('${ws.id}','${escapeJs(cat.name)}','${escapeJs(item.id)}')" tabindex="0">
                  <span class="tree-chevron">▾</span>
                  <span class="tree-icon" style="background:${item.iconBg || 'var(--rule)'}" onclick="event.stopPropagation();editFolder('${ws.id}','${escapeJs(cat.name)}','${escapeJs(item.id)}')" title="点击更换图标">${item.icon || '📁'}</span>
                  <span class="tree-label">${item.name}</span>
                  <span class="tree-count">${countLeaves(item.items)}</span>
                </div>
                <div class="row-actions">
                  <button class="btn-icon btn-edit" title="编辑" onclick="event.stopPropagation();editFolder('${ws.id}','${escapeJs(cat.name)}','${escapeJs(item.id)}')">✏️</button>
                  <button class="btn-icon btn-delete" title="删除" onclick="event.stopPropagation();deleteFolder('${ws.id}','${escapeJs(cat.name)}','${escapeJs(item.id)}')">🗑️</button>
                </div>
              </div>
              <div class="tree-children">${childrenHtml}</div>
            </div>
          `;
        }

        const prog = getItemProgress(item);
        const percent = prog.percent;
        const isActive = item.id === activeItemId;
        return `
          <div class="tree-node tree-leaf">
            <div class="tree-row leaf ${isActive ? 'active' : ''}">
              <div class="row-main"
                   data-id="${item.id}" tabindex="0"
                   onclick="selectItem('${item.id}')"
                   onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectItem('${item.id}')}">
                <span class="leaf-dot ${item.type || 'task'}"></span>
                <span class="tree-label">${item.name}</span>
                <span class="leaf-meta">
                  ${item.code ? `<span class="leaf-code">${item.code}</span>` : ''}
                  <span class="leaf-progress"><span class="leaf-progress-fill" style="width:${percent}%"></span></span>
                </span>
              </div>
              <div class="row-actions">
                <button class="btn-icon btn-edit" title="编辑" onclick="event.stopPropagation();editItem('${item.id}')">✏️</button>
                <button class="btn-icon btn-delete" title="删除" onclick="event.stopPropagation();deleteItem('${item.id}')">🗑️</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function escapeJs(str) {
      return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    function toggleWorkspaceNode(id) {
      const key = `ws-${id}`;
      if (collapsed.has(key)) {
        collapsed.delete(key);
        currentWorkspaceId = id;
        activeItemId = null;
        document.getElementById('main').innerHTML = `
          <div class="empty-state"><h2>选择一个项目查看计划</h2><p>悬停或聚焦左侧行，可显示编辑/删除。</p></div>
        `;
      } else {
        collapsed.add(key);
      }
      renderTree();
    }

    function toggleCategory(wsId, catName) {
      const key = `cat-${wsId}-${catName}`;
      if (collapsed.has(key)) collapsed.delete(key);
      else collapsed.add(key);
      renderTree();
    }

    function toggleFolder(wsId, catName, itemId) {
      const ws = findWorkspace(wsId);
      const cat = ws.categories.find(c => c.name === catName);
      const key = folderKey(ws, cat, { id: itemId });
      if (collapsed.has(key)) collapsed.delete(key);
      else collapsed.add(key);
      renderTree();
    }

    function collapseAll() {
      workspaces.forEach(ws => {
        collapsed.add(wsKey(ws));
        ws.categories.forEach(cat => {
          collapsed.add(catKey(ws, cat));
          if (Array.isArray(cat.items)) cat.items.forEach(item => collapseFolder(ws, cat, item));
        });
      });
      renderTree();
    }

    function collapseFolder(ws, cat, item) {
      if (!isFolder(item)) return;
      collapsed.add(folderKey(ws, cat, item));
      item.items.forEach(child => collapseFolder(ws, cat, child));
    }

    function expandAll() {
      collapsed.clear();
      renderTree();
    }

    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      const isOpen = sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show', isOpen);
      // 抽屉打开时禁止背景滚动
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    // ESC 键关闭侧边栏
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          closeSidebar();
        }
      }
    });

    function findWorkspace(id) {
      return workspaces.find(w => w.id === id);
    }

    function findItemWithCategory(id) {
      for (const ws of workspaces) {
        for (const cat of ws.categories) {
          const found = findInItems(cat.items, id);
          if (found) return { ws, cat, ...found };
        }
      }
      return null;
    }

    function findInItems(items, id) {
      if (!Array.isArray(items)) return null;
      for (const item of items) {
        if (item.id === id) return { item };
        if (isFolder(item)) {
          const child = findInItems(item.items, id);
          if (child) return child;
        }
      }
      return null;
    }

    function findItemContainer(id) {
      for (const ws of workspaces) {
        for (const cat of ws.categories) {
          const found = findContainer(cat.items, id, ws, cat);
          if (found) return found;
        }
      }
      return null;
    }

    function findContainer(items, id, ws, cat) {
      if (!Array.isArray(items)) return null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) return { container: items, index: i, item: items[i], ws, cat };
        if (isFolder(items[i])) {
          const child = findContainer(items[i].items, id, ws, cat);
          if (child) return child;
        }
      }
      return null;
    }

    function getTypeLabel(type) {
      if (type === 'reading') return '<span class=\"badge badge-public\">阅读资料</span>';
      if (type === 'public') return '<span class="badge badge-public">公共基础课</span>';
      if (type === 'core') return '<span class="badge badge-core">专业核心课</span>';
      if (type === 'practice') return '<span class="badge badge-practice">毕业考核</span>';
      return '<span class="badge badge-task">任务</span>';
    }

    function selectItem(id) {
      const result = findItemWithCategory(id);
      if (!result) return;
      activeItemId = id;
      const item = result.item;
      if (isReadingItem(item)) activeTab = 'content';
      else if (hasContentUrl(item)) activeTab = 'content';
      else activeTab = 'plan';

      document.querySelectorAll('.tree-row.leaf').forEach(el => el.classList.remove('active'));
      const activeEl = document.querySelector(`.tree-row.leaf .row-main[data-id="${CSS.escape(id)}"]`)?.closest('.tree-row.leaf');
      if (activeEl) activeEl.classList.add('active');

      renderItemView();

      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    }

    function isExamItem(item) {
      return item && (item.type === 'core' || item.type === 'public' || item.type === 'practice');
    }

    function getItemMetaFields(item) {
      const targetDate = item.targetDate || item.exam || '待定';
      return [
        item.code ? `<span>代码：${item.code}</span>` : '',
        item.credits ? `<span>学分：${item.credits}</span>` : '',
        targetDate ? `<span>目标日期：${targetDate}</span>` : ''
      ].filter(Boolean).join('');
    }

    function renderTabs(item) {
      if (!isExamItem(item) && !isReadingItem(item) && !hasContentUrl(item)) return '';
      // 知识框架等内部自带 Tab 的内容页，不显示工作台级「计划/内容」切换条
      // bare 模式：完全无外层包装，直接显示内容
      if (item.renderMode === 'content' || item.renderMode === 'bare') return '';
      const tabs = [{ key: 'plan', label: '计划' }];
      if (isExamItem(item)) tabs.push({ key: 'questionTypes', label: '题型分析' });
      if (isReadingItem(item) || hasContentUrl(item)) tabs.push({ key: 'content', label: '内容' });
      return `
        <div class="plan-tabs">
          ${tabs.map(t => `
            <button class="plan-tab ${activeTab === t.key ? 'active' : ''}"
                    onclick="switchTab('${t.key}')">${t.label}</button>
          `).join('')}
        </div>
      `;
    }

    function switchTab(tab) {
      if (!activeItemId) return;
      activeTab = tab;
      renderItemView();
    }

    function renderItemView() {
      const result = findItemWithCategory(activeItemId);
      if (!result) return;
      const { item } = result;

      // bare 模式：直接显示内容，无 plan-card / plan-header / tabs 包装
      if (item.renderMode === 'bare' && hasContentUrl(item)) {
        document.getElementById('main').innerHTML = renderContentFrame(item);
        return;
      }

      const headerHtml = `
        <div class="plan-header">
          <div>
            <h2 class="plan-title">${item.name}</h2>
            <div class="plan-meta">${getItemMetaFields(item)}</div>
          </div>
          ${getTypeLabel(item.type)}
        </div>
      `;

      let contentHtml = '';
      if (activeTab === 'plan' || (!isExamItem(item) && !isReadingItem(item) && !hasContentUrl(item))) {
        contentHtml = renderPlanTab(item);
      } else if (activeTab === 'questionTypes') {
        contentHtml = renderQuestionTypes(item);
      } else if (activeTab === 'content' && isReadingItem(item)) {
        contentHtml = renderReadingContent(item);
        // 数据未加载时，按需加载后重新渲染
        if (item.dataUrl && !window[item.readingData]) {
          ensureReadingData(item).then(function() {
            renderItemView();
          });
        }
      } else if (activeTab === 'content' && hasContentUrl(item)) {
        contentHtml = renderContentFrame(item);
      }

      document.getElementById('main').innerHTML = `
        <div class="plan-card">
          ${headerHtml}
          ${renderTabs(item)}
          ${contentHtml}
        </div>
      `;
    }

    function renderPlanTab(item) {
      const prog = getItemProgress(item);
      const total = prog.total;
      const done = prog.done;
      const percent = prog.percent;
      const tasks = item.tasks || [];
      const tasksHtml = tasks.map((t, i) => `<li class="${i < done ? 'done' : ''}">${t}</li>`).join('');
      const targetDate = item.targetDate || item.exam || '待定';
      const status = item.status || item.stage || '未开始';
      const currentStep = item.current || '未开始';

      return `
        <div class="progress-block">
          <div class="progress-label">
            <span>当前阶段：${status}</span>
            <span>${done}/${total} 步 · ${percent}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
        </div>
        <div class="info-grid">
          <div class="info-cell"><label>当前进度</label><value>${currentStep}</value></div>
          <div class="info-cell"><label>已完成</label><value>${done}</value></div>
          <div class="info-cell"><label>剩余</label><value>${total - done}</value></div>
          <div class="info-cell"><label>目标日期</label><value>${targetDate}</value></div>
        </div>
        <h3 class="section-title">阶段任务</h3>
        <ul class="plan-list">${tasksHtml || '<li style="background:transparent;padding-left:0;">暂无任务，点击底部“+ 任务”添加</li>'}</ul>
        <h3 class="section-title">安排与策略</h3>
        <p>${item.review || item.notes || '暂无备注'}</p>
      `;
    }

    function ensureExamMeta(item) {
      if (!item.examMeta) item.examMeta = {};
      if (!item.examMeta.questionTypes) item.examMeta.questionTypes = [];
      return item.examMeta.questionTypes;
    }

    function getDifficultyLabel(difficulty) {
      const map = { low: '低', medium: '中', high: '高' };
      return map[difficulty] || '中';
    }

    function getDifficultyClass(difficulty) {
      const map = { low: 'qt-tag-low', medium: 'qt-tag-medium', high: 'qt-tag-high' };
      return map[difficulty] || 'qt-tag-medium';
    }

    function renderQuestionTypes(item) {
      const questionTypes = ensureExamMeta(item);
      const totalScore = questionTypes.reduce((sum, q) => sum + (q.count || 0) * (q.score || 0), 0);
      const totalCount = questionTypes.reduce((sum, q) => sum + (q.count || 0), 0);

      const rowsHtml = questionTypes.length === 0
        ? `<tr><td colspan="6"><div class="qt-empty">暂无题型数据，点击右上角添加。</div></td></tr>`
        : questionTypes.map((q, idx) => `
            <tr>
              <td>${q.name}</td>
              <td>${q.count}</td>
              <td>${q.score}</td>
              <td>${q.count * q.score}</td>
              <td><span class="qt-tag ${getDifficultyClass(q.difficulty)}">${getDifficultyLabel(q.difficulty)}</span></td>
              <td class="col-strategy">${q.strategy || '-'}</td>
              <td>
                <div class="qt-actions">
                  <button class="btn-icon btn-edit" title="编辑" onclick="editQuestionType('${CSS.escape(item.id)}', ${idx})">✏️</button>
                  <button class="btn-icon btn-delete" title="删除" onclick="deleteQuestionType('${CSS.escape(item.id)}', ${idx})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('');

      const summaryHtml = questionTypes.length === 0 ? '' : `
        <div class="qt-summary">
          <div class="qt-summary-item"><strong>题型数：</strong>${questionTypes.length}</div>
          <div class="qt-summary-item"><strong>总题量：</strong>${totalCount}</div>
          <div class="qt-summary-item"><strong>卷面总分：</strong>${totalScore}</div>
        </div>
      `;

      const papers = item.examMeta && item.examMeta.papers ? item.examMeta.papers : [];
      const papersHtml = papers.length === 0 ? '' : `
        <div class="papers-block">
          <h4>📚 真题来源</h4>
          <ul class="papers-list">
            ${papers.map(p => `
              <li class="paper-item">
                <span class="paper-year">${p.year}</span>
                <span class="paper-info"><code>${p.file}</code><br>${p.note}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      return `
        <div class="qt-toolbar">
          <h3 class="section-title" style="margin:0">题型列表</h3>
          <button class="btn btn-primary" style="flex:0 0 auto; padding:8px 16px;" onclick="addQuestionType('${CSS.escape(item.id)}')">+ 添加题型</button>
        </div>
        <div class="qt-table-wrap">
          <table class="qt-table">
            <thead>
              <tr>
                <th>题型</th>
                <th>题量</th>
                <th>分值</th>
                <th>小计</th>
                <th>难度</th>
                <th class="col-strategy">策略</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        ${summaryHtml}
        ${papersHtml}
      `;
    }

    function addQuestionType(itemId) {
      const result = findItemWithCategory(itemId);
      if (!result) return;
      const { item } = result;

      const name = prompt('题型名称：');
      if (!name || !name.trim()) return;
      const count = Math.max(0, parseInt(prompt('题量：', '1') || '1', 10) || 0);
      const score = parseFloat(prompt('单题分值：', '1') || '1') || 0;
      const difficultyInput = prompt('难度（low/medium/high）：', 'medium') || 'medium';
      const difficulty = ['low', 'medium', 'high'].includes(difficultyInput) ? difficultyInput : 'medium';
      const strategy = prompt('解题策略：', '') || '';

      ensureExamMeta(item).push({ name: name.trim(), count, score, difficulty, strategy });
      renderItemView();
    }

    function editQuestionType(itemId, idx) {
      const result = findItemWithCategory(itemId);
      if (!result) return;
      const { item } = result;
      const questionTypes = ensureExamMeta(item);
      const q = questionTypes[idx];
      if (!q) return;

      const name = prompt('题型名称：', q.name);
      if (!name || !name.trim()) return;
      const count = Math.max(0, parseInt(prompt('题量：', String(q.count || 0)) || '0', 10) || 0);
      const score = parseFloat(prompt('单题分值：', String(q.score || 0)) || '0') || 0;
      const difficultyInput = prompt('难度（low/medium/high）：', q.difficulty || 'medium') || 'medium';
      const difficulty = ['low', 'medium', 'high'].includes(difficultyInput) ? difficultyInput : 'medium';
      const strategy = prompt('解题策略：', q.strategy || '') || '';

      questionTypes[idx] = { name: name.trim(), count, score, difficulty, strategy };
      renderItemView();
    }

    function deleteQuestionType(itemId, idx) {
      const result = findItemWithCategory(itemId);
      if (!result) return;
      const { item } = result;
      const questionTypes = ensureExamMeta(item);
      if (!questionTypes[idx]) return;
      if (!confirm(`确定删除题型「${questionTypes[idx].name}」吗？`)) return;
      questionTypes.splice(idx, 1);
      renderItemView();
    }

    function filterItems() {
      searchQuery = document.getElementById('search-input').value.trim();
      if (searchQuery) {
        collapsed.clear();
      }
      renderTree();
    }

    // 工作区增删改查
    function addWorkspace() {
      const name = prompt('新工作区名称：');
      if (!name || !name.trim()) return;
      const id = 'ws_' + Date.now();
      const icon = prompt('工作区图标（emoji，国风可爱）：', '🏮') || '🏮';
      const iconBg = prompt('工作区图标底色（如 #FFE4EC）：', '#FFE4EC') || '#FFE4EC';
      workspaces.push({ id, name: name.trim(), icon, iconBg, categories: [] });
      collapsed.delete(wsKey(workspaces[workspaces.length - 1]));
      currentWorkspaceId = id;
      renderTree();
    }

    function editWorkspace(id) {
      const ws = findWorkspace(id);
      if (!ws) return;
      const name = prompt('工作区名称：', ws.name);
      if (!name || !name.trim()) return;
      const icon = prompt('工作区图标（emoji，国风可爱）：', ws.icon) || ws.icon;
      const iconBg = prompt('工作区图标底色：', ws.iconBg) || ws.iconBg;
      ws.name = name.trim();
      ws.icon = icon;
      ws.iconBg = iconBg;
      renderTree();
    }

    function deleteWorkspace(id) {
      const ws = findWorkspace(id);
      if (!ws) return;
      if (workspaces.length <= 1) { alert('至少保留一个工作区'); return; }
      if (!confirm(`确定删除工作区「${ws.name}」吗？`)) return;
      workspaces.splice(workspaces.indexOf(ws), 1);
      if (currentWorkspaceId === id) currentWorkspaceId = workspaces[0].id;
      if (activeItemId) {
        const stillExists = findItemWithCategory(activeItemId);
        if (!stillExists) {
          activeItemId = null;
          document.getElementById('main').innerHTML = `
            <div class="empty-state"><h2>选择一个项目查看计划</h2><p>悬停或聚焦左侧行，可显示编辑/删除。</p></div>
          `;
        }
      }
      renderTree();
    }

    // 分类增删改查
    function addCategory() {
      const ws = getCurrentWorkspace();
      if (ws.categories.length === 0) {
        alert('请先添加一个分类');
        return;
      }
      const name = prompt('新分类名称：');
      if (!name || !name.trim()) return;
      const icon = prompt('分类图标（emoji，国风可爱）：', '🌸') || '🌸';
      const iconBg = prompt('分类图标底色（如 #FCE7F3）：', '#FCE7F3') || '#FCE7F3';
      ws.categories.push({ name: name.trim(), icon, iconBg, items: [] });
      collapsed.delete(catKey(ws, ws.categories[ws.categories.length - 1]));
      renderTree();
    }

    function editCategory(wsId, oldName) {
      const ws = findWorkspace(wsId);
      const cat = ws.categories.find(c => c.name === oldName);
      if (!cat) return;
      const newName = prompt('分类名称：', cat.name);
      if (!newName || !newName.trim()) return;
      const newIcon = prompt('分类图标（emoji）：', cat.icon) || cat.icon;
      const newIconBg = prompt('分类图标底色：', cat.iconBg) || cat.iconBg;
      cat.name = newName.trim();
      cat.icon = newIcon;
      cat.iconBg = newIconBg;
      renderTree();
    }

    function deleteCategory(wsId, name) {
      const ws = findWorkspace(wsId);
      const cat = ws.categories.find(c => c.name === name);
      if (!cat) return;
      const leafCount = countLeaves(cat.items);
      if (leafCount > 0) {
        if (!confirm(`「${name}」下还有 ${leafCount} 个项目，确定删除整个分类吗？`)) return;
      } else {
        if (!confirm(`确定删除分类「${name}」吗？`)) return;
      }
      const deletedIds = collectIds(cat.items);
      ws.categories = ws.categories.filter(c => c.name !== name);
      if (activeItemId && deletedIds.has(activeItemId)) {
        activeItemId = null;
        document.getElementById('main').innerHTML = `
          <div class="empty-state"><h2>选择一个项目查看计划</h2><p>悬停或聚焦左侧行，可显示编辑/删除。</p></div>
        `;
      }
      renderTree();
    }

    function collectIds(items) {
      const ids = new Set();
      if (!Array.isArray(items)) return ids;
      items.forEach(item => {
        ids.add(item.id);
        if (isFolder(item)) {
          collectIds(item.items).forEach(id => ids.add(id));
        }
      });
      return ids;
    }

    // 文件夹增删改查（用于嵌套的科目分组）
    function findFolder(wsId, catName, itemId) {
      const ws = findWorkspace(wsId);
      if (!ws) return null;
      const cat = ws.categories.find(c => c.name === catName);
      if (!cat) return null;
      const item = findInItems(cat.items, itemId);
      return item && isFolder(item.item) ? { ws, cat, item: item.item } : null;
    }

    function editFolder(wsId, catName, itemId) {
      const found = findFolder(wsId, catName, itemId);
      if (!found) return;
      const item = found.item;
      const newName = prompt('名称：', item.name);
      if (!newName || !newName.trim()) return;
      item.name = newName.trim();
      const newIcon = prompt('图标（emoji）：', item.icon || '📁');
      if (newIcon !== null) item.icon = newIcon;
      renderTree();
    }

    function deleteFolder(wsId, catName, itemId) {
      const found = findFolder(wsId, catName, itemId);
      if (!found) return;
      const { ws, cat, item } = found;
      const leafCount = countLeaves(item.items);
      if (leafCount > 0) {
        if (!confirm(`「${item.name}」下还有 ${leafCount} 个项目，确定删除吗？`)) return;
      } else {
        if (!confirm(`确定删除「${item.name}」吗？`)) return;
      }
      const deletedIds = collectIds([item]);
      const container = findContainer(cat.items, itemId, ws, cat);
      if (container) container.container.splice(container.index, 1);
      if (activeItemId && deletedIds.has(activeItemId)) {
        activeItemId = null;
        document.getElementById('main').innerHTML = `
          <div class="empty-state"><h2>选择一个项目查看计划</h2><p>悬停或聚焦左侧行，可显示编辑/删除。</p></div>
        `;
      }
      renderTree();
    }

    // 任务项增删改查
    function addItem() {
      const ws = getCurrentWorkspace();
      if (ws.categories.length === 0) {
        alert('请先添加一个分类');
        return;
      }
      const catOptions = ws.categories.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
      const catInput = prompt('添加到哪个分类？（输入名称或编号）\n' + catOptions);
      if (!catInput || !catInput.trim()) return;
      const trimmed = catInput.trim();
      const cat = ws.categories.find(c => c.name === trimmed) || ws.categories[Number(trimmed) - 1];
      if (!cat) { alert('分类不存在'); return; }

      const name = prompt('任务 / 科目名称：');
      if (!name || !name.trim()) return;

      const isExam = confirm('这是否为自考科目？\n· 是 → 会询问课程代码、学分等字段\n· 否 → 按普通任务创建');
      const baseId = `${ws.id}_${cat.name}_${cat.items.length}_${Date.now()}`;

      if (isExam) {
        const code = prompt('课程代码：') || '';
        const credits = parseFloat(prompt('学分：', '0') || '0') || 0;
        const exam = prompt('考试时间：', '2027年4月') || '待定';
        cat.items.push({
          id: code ? `code_${code}` : baseId,
          code, name: name.trim(), credits, type: 'core',
          exam, targetDate: exam,
          status: '未开始', stage: '未开始',
          total: 10, chapters: 10, done: 0,
          current: '未开始',
          tasks: ['制定学习计划','准备教材资料','完成第1章学习'],
          review: '按阶段推进，考前集中复习',
          examMeta: { questionTypes: [] }
        });
      } else {
        const targetDate = prompt('目标日期（可选）：', '待定') || '待定';
        const total = Math.max(1, parseInt(prompt('计划拆分为几步？（默认3步）', '3') || '3', 10) || 3);
        cat.items.push({
          id: baseId, name: name.trim(), type: 'task',
          targetDate, status: '未开始', stage: '未开始',
          total, chapters: total, done: 0,
          current: '未开始',
          tasks: ['制定第一步计划'],
          notes: '按阶段推进'
        });
      }

      collapsed.delete(catKey(ws, cat));
      renderTree();
      setTimeout(() => {
        const newId = cat.items[cat.items.length - 1].id;
        const newEl = document.querySelector(`.tree-row.leaf .row-main[data-id="${CSS.escape(newId)}"]`);
        if (newEl) {
          newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          selectItem(newId);
        }
      }, 50);
    }

    function editItem(id) {
      const result = findItemWithCategory(id);
      if (!result) return;
      const { item } = result;

      const newName = prompt('名称：', item.name);
      if (!newName || !newName.trim()) return;
      item.name = newName.trim();

      if (item.code !== undefined) {
        const newCode = prompt('课程代码：', item.code || '');
        if (newCode !== null) item.code = newCode;
      }
      if (item.credits !== undefined) {
        const newCredits = prompt('学分：', item.credits || '0');
        if (newCredits !== null) item.credits = parseFloat(newCredits) || 0;
      }

      const newDate = prompt('目标日期：', item.targetDate || item.exam || '待定');
      if (newDate !== null) { item.targetDate = newDate; item.exam = newDate; }

      const newStatus = prompt('当前阶段：', item.status || item.stage || '未开始');
      if (newStatus !== null) { item.status = newStatus; item.stage = newStatus; }

      const newCurrent = prompt('当前进度：', item.current || '未开始');
      if (newCurrent !== null) item.current = newCurrent;

      const newTasks = prompt('阶段任务（用逗号分隔）：', (item.tasks || []).join('，'));
      if (newTasks !== null) item.tasks = newTasks ? newTasks.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [];

      const newReview = prompt('安排与策略：', item.review || item.notes || '');
      if (newReview !== null) { item.review = newReview; item.notes = newReview; }

      renderTree();
      if (activeItemId === id) selectItem(id);
    }

    function deleteItem(id) {
      const result = findItemContainer(id);
      if (!result) return;
      const { item, container, index } = result;
      if (!confirm(`确定删除「${item.name}」吗？`)) return;
      container.splice(index, 1);
      if (activeItemId === id) {
        activeItemId = null;
        document.getElementById('main').innerHTML = `
          <div class="empty-state"><h2>选择一个项目查看计划</h2><p>悬停或聚焦左侧行，可显示编辑/删除。</p></div>
        `;
      }
      renderTree();
    }

    function selectFirstItem() {
      for (const ws of workspaces) {
        for (const cat of ws.categories) {
          const first = firstLeaf(cat.items);
          if (first) {
            selectItem(first.id);
            return;
          }
        }
      }
    }

    function firstLeaf(items) {
      if (!Array.isArray(items)) return null;
      for (const item of items) {
        if (isFolder(item)) {
          const child = firstLeaf(item.items);
          if (child) return child;
        } else {
          return item;
        }
      }
      return null;
    }

    renderTree();
    selectFirstItem();

    // 跨 iframe 导航：子页面通过 postMessage 请求切换模块
    window.addEventListener('message', function(e) {
      if (!e.data) return;

      // Bug3 fix: 今日学习流完成任务后通知驾驶舱刷新
      if (e.data.action === 'plan-updated') {
        var frame = document.querySelector('.content-frame');
        if (frame && frame.contentWindow) {
          frame.contentWindow.postMessage({ action: 'refresh-plan', data: e.data }, '*');
        }
        window._planUpdated = true;
        return;
      }

      if (e.data.action !== 'navigate') return;
      var mod = e.data.module;
      var page = e.data.page;
      var kpId = e.data.kpId;
      // 在模块数据中查找对应页面
      var found = null;
      for (var catKey in modules) {
        var cat = modules[catKey];
        if (cat.items) {
          for (var i = 0; i < cat.items.length; i++) {
            var it = cat.items[i];
            if (it.contentUrl && it.contentUrl.indexOf(page) !== -1) {
              found = it;
              break;
            }
            if (it.subItems) {
              for (var j = 0; j < it.subItems.length; j++) {
                var sub = it.subItems[j];
                if (sub.contentUrl && sub.contentUrl.indexOf(page) !== -1) {
                  found = sub;
                  break;
                }
              }
            }
            if (found) break;
          }
        }
        if (found) break;
      }
      if (found) {
        selectItem(found.id);
        // 如果有 kpId，延迟发送给目标 iframe
        if (kpId) {
          setTimeout(function() {
            var frame = document.querySelector('.content-frame');
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage({ action: 'highlightKp', kpId: kpId }, '*');
            }
          }, 300);
        }
      }
    });

    // 实时进度：用户切换回工作台标签页或定期刷新侧边栏
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) { renderTree(); if (activeItemId) renderItemView(); }
    });
    setInterval(function() { updateSidebarProgress(); }, 3000);

    // ========== 番茄钟悬浮按钮 ==========
    // 在父页面运行，不受 iframe 切换影响，计时和通知持续工作
    var POMO_SLOTS = [
      { time: '08:00-10:50', startH: 8, startM: 0, endH: 10, endM: 50, label: '上午主科' },
      { time: '14:00-15:30', startH: 14, startM: 0, endH: 15, endM: 30, label: '下午练习' },
      { time: '15:30-16:00', startH: 15, startM: 30, endH: 16, endM: 0, label: '间隔复习' },
      { time: '16:00-17:00', startH: 16, startM: 0, endH: 17, endM: 0, label: 'AI工程' },
      { time: '19:30-20:30', startH: 19, startM: 30, endH: 20, endM: 30, label: 'AI学习' },
      { time: '20:30-21:00', startH: 20, startM: 30, endH: 21, endM: 0, label: '英语' },
      { time: '21:00-21:30', startH: 21, startM: 0, endH: 21, endM: 30, label: '复盘' }
    ];

    function isPomoPageLoaded() {
      var frame = document.querySelector('.content-frame');
      if (!frame || !frame.src) return false;
      return frame.src.indexOf('番茄钟') !== -1;
    }

    function getPomoState() {
      try {
        var raw = localStorage.getItem('pomo_timer_state');
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }

    function setPomoState(state) {
      try { localStorage.setItem('pomo_timer_state', JSON.stringify(state)); } catch(e) {}
    }

    function clearPomoState() {
      try { localStorage.removeItem('pomo_timer_state'); } catch(e) {}
    }

    function pomoNotify(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          var n = new Notification('🍅 ' + title, { body: body, tag: 'pomo-float' });
          setTimeout(function() { n.close(); }, 10000);
        } catch(e) {}
      }
    }

    function pomoPlaySound() {
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var beep = function(freq, dur, delay) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0, ctx.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur);
        };
        beep(880, 0.15, 0);
        beep(880, 0.15, 0.25);
        beep(1100, 0.3, 0.5);
      } catch(e) {}
    }

    function updatePomoFloat() {
      var state = getPomoState();
      var float = document.getElementById('pomoFloat');
      if (!float) return;

      if (!state || !state.isRunning || state.isPaused) {
        float.className = 'pomo-float idle';
        float.innerHTML = '<span class="pomo-float-icon">🍅</span>';
        float.title = '番茄钟 - 点击打开';
        return;
      }

      var now = Date.now();
      var targetEnd = state.targetEndTime || 0;
      var diffSec = Math.floor((targetEnd - now) / 1000);

      if (diffSec <= 0) {
        // 时间到
        if (!isPomoPageLoaded()) {
          // 番茄钟页面未加载，由悬浮按钮处理
          handlePomoTimeout(state);
        }
        // 如果页面已加载，由页面处理，悬浮按钮等下一 tick 更新
        return;
      }

      var min = Math.floor(diffSec / 60);
      var sec = diffSec % 60;
      var timeStr = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

      var slot = POMO_SLOTS[state.slotIdx] || {};
      var phaseLabel = state.pomoPhase === 'break' ? '休息' : '学习中';
      var cls = 'pomo-float active' + (state.pomoPhase === 'break' ? ' break' : '');

      float.className = cls;
      float.innerHTML = '<span class="pomo-float-icon">🍅</span>' +
        '<span class="pomo-float-time">' + timeStr + '</span>' +
        '<span class="pomo-float-label">' + phaseLabel + '</span>';
      float.title = (slot.label || '') + ' · ' + phaseLabel + ' · 剩余 ' + timeStr + '（点击查看详情）';
    }

    function handlePomoTimeout(state) {
      var slot = POMO_SLOTS[state.slotIdx];
      if (!slot) { clearPomoState(); return; }

      // 检查是否超出时段
      var now = new Date();
      var curMin = now.getHours() * 60 + now.getMinutes();
      var eMin = slot.endH * 60 + slot.endM;
      if (curMin >= eMin) {
        clearPomoState();
        pomoNotify('时段结束', (slot.label || '') + ' 学习完成！');
        pomoPlaySound();
        return;
      }

      // 番茄阶段切换
      if (state.pomoPhase === 'work') {
        state.pomoPhase = 'break';
        var breakMin = (state.mode === '50') ? 5 : 5;
        state.targetEndTime = Date.now() + breakMin * 60 * 1000;
        state.pomoWorkCycle = (state.pomoWorkCycle || 0) + 1;
        setPomoState(state);
        pomoNotify('番茄完成！', '休息 ' + breakMin + ' 分钟');
        pomoPlaySound();
      } else if (state.pomoPhase === 'break') {
        state.pomoPhase = 'work';
        var workMin = (state.mode === '50') ? 50 : 25;
        state.targetEndTime = Date.now() + workMin * 60 * 1000;
        setPomoState(state);
        pomoNotify('休息结束', '继续学习，保持专注！');
        pomoPlaySound();
      }
    }

    function openPomodoro() {
      for (var w = 0; w < workspaces.length; w++) {
        var ws = workspaces[w];
        if (ws.categories) {
          for (var c = 0; c < ws.categories.length; c++) {
            var cat = ws.categories[c];
            if (cat.items) {
              for (var i = 0; i < cat.items.length; i++) {
                if (cat.items[i].contentUrl && cat.items[i].contentUrl.indexOf('番茄钟') !== -1) {
                  selectItem(cat.items[i].id);
                  return;
                }
              }
            }
          }
        }
      }
    }

    // 启动悬浮按钮更新
    setInterval(updatePomoFloat, 1000);
    updatePomoFloat();

    // ---- 问AI功能 ----
    var askAiOnline = false;
    var askAiHistory = [];

    function checkAskAiOnline() {
      var apiBase = '';
      if (location.protocol === 'file:') apiBase = 'http://localhost:8000';
      fetch(apiBase + '/api/mastery', { method: 'GET' })
        .then(function() {
          if (!askAiOnline) {
            askAiOnline = true;
            var btn = document.getElementById('askAiBtn');
            var dot = document.getElementById('askAiDot');
            if (btn) { btn.classList.remove('offline'); }
            if (dot) { dot.classList.remove('offline'); }
            var send = document.getElementById('aiModalSend');
            if (send) send.disabled = false;
          }
        })
        .catch(function() {
          if (askAiOnline) {
            askAiOnline = false;
            var btn = document.getElementById('askAiBtn');
            var dot = document.getElementById('askAiDot');
            if (btn) { btn.classList.add('offline'); }
            if (dot) { dot.classList.add('offline'); }
            var send = document.getElementById('aiModalSend');
            if (send) send.disabled = true;
          }
        });
    }

    function openAskAI() {
      document.getElementById('aiModalOverlay').classList.add('show');
      var input = document.getElementById('aiModalInput');
      if (input) setTimeout(function() { input.focus(); }, 100);
    }

    function closeAskAI() {
      document.getElementById('aiModalOverlay').classList.remove('show');
    }

    function sendAskAI() {
      var input = document.getElementById('aiModalInput');
      var text = input.value.trim();
      if (!text || !askAiOnline) return;

      var body = document.getElementById('aiModalBody');
      var userMsg = document.createElement('div');
      userMsg.className = 'ai-modal-msg user';
      userMsg.textContent = text;
      body.appendChild(userMsg);
      input.value = '';

      var loadingMsg = document.createElement('div');
      loadingMsg.className = 'ai-modal-msg loading';
      loadingMsg.textContent = 'AI 思考中...';
      body.appendChild(loadingMsg);
      body.scrollTop = body.scrollHeight;

      var apiBase = '';
      if (location.protocol === 'file:') apiBase = 'http://localhost:8000';

      askAiHistory.push({ role: 'user', content: text });

      fetch(apiBase + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          model: 'deepseek-v4-flash',
          stream: false,
          max_tokens: 1000
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        loadingMsg.remove();
        var aiText = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
          aiText = data.choices[0].message.content || '';
        } else if (data.response) {
          aiText = data.response;
        } else if (data.content) {
          aiText = data.content;
        } else if (data.error) {
          aiText = '⚠️ ' + data.error;
        }
        if (!aiText) aiText = '（AI返回为空）';
        var aiMsg = document.createElement('div');
        aiMsg.className = 'ai-modal-msg ai';
        aiMsg.textContent = aiText;
        body.appendChild(aiMsg);
        body.scrollTop = body.scrollHeight;
        askAiHistory.push({ role: 'assistant', content: aiText });
        if (askAiHistory.length > 20) askAiHistory = askAiHistory.slice(-20);
      })
      .catch(function(err) {
        loadingMsg.remove();
        var errMsg = document.createElement('div');
        errMsg.className = 'ai-modal-msg ai';
        errMsg.textContent = '⚠️ 请求失败：' + (err.message || '网络错误') + '，请确保dev_server.py正在运行';
        body.appendChild(errMsg);
        body.scrollTop = body.scrollHeight;
      });
    }

    // 启动AI在线检测
    checkAskAiOnline();
    setInterval(checkAskAiOnline, 30000);

    // ---- 全局暴露（供 onclick 调用） ----
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
    window.filterItems = filterItems;
    window.openAskAI = openAskAI;
    window.closeAskAI = closeAskAI;
    window.sendAskAI = sendAskAI;
    window.addWorkspace = addWorkspace;
    window.addCategory = addCategory;
    window.addItem = addItem;
    window.selectItem = selectItem;
    window.toggleFolder = toggleFolder;
    window.switchTab = switchTab;
    window.openPomodoro = openPomodoro;
