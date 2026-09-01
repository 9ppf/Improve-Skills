// ============================================================
// 复盘总结-章节复盘 页面 JS
// 抽离自 复盘总结-章节复盘.html
// ============================================================

(function() {
      // ============ 科目与章节数据 ============
      var SUBJECTS = {
        "13003": {
          name: "13003 数据结构与算法",
          storageKey: "ss_review_13003",
          chapters: [
            "绪论",
            "线性表",
            "栈和队列",
            "数组、广义表和串",
            "树与二叉树",
            "图结构",
            "内部排序",
            "查找"
          ]
        },
        "13015": {
          name: "13015 计算机系统原理",
          storageKey: "ss_review_13015",
          chapters: [
            "计算机系统概述",
            "数据的表示和运算",
            "程序的转换及机器级表示",
            "可执行文件的生成与加载执行",
            "程序的存储访问",
            "程序中I/O操作的实现"
          ]
        },
        "02324": {
          name: "02324 离散数学",
          storageKey: "ss_review_02324",
          chapters: [
            "命题与命题公式",
            "命题逻辑的推理理论",
            "谓词逻辑",
            "集合",
            "关系与函数",
            "代数系统的一般概念",
            "格与布尔代数",
            "图",
            "图的应用"
          ]
        }
      };

      var FIELDS = [
        { key: "summary", label: "本章总结", icon: "📝", hint: "核心知识点" },
        { key: "wrong",   label: "错题反思", icon: "❌", hint: "易错点" },
        { key: "plan",    label: "改进计划", icon: "🎯", hint: "下一步" }
      ];

      // ============ 读取 URL 参数，默认 13003 ============
      function getSubjectFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var s = params.get("subject");
        if (s && SUBJECTS[s]) return s;
        return "13003";
      }

      function updateUrl(subject) {
        var url = new URL(window.location.href);
        url.searchParams.set("subject", subject);
        window.history.replaceState({}, "", url.toString());
      }

      var currentSubject = getSubjectFromUrl();

      // ============ localStorage 读写 ============
      function loadData(subject) {
        var key = SUBJECTS[subject].storageKey;
        try {
          var raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
      }
      function saveData(subject, data) {
        var key = SUBJECTS[subject].storageKey;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
      }

      // ============ 渲染章节卡片 ============
      function renderChapters() {
        var conf = SUBJECTS[currentSubject];
        var data = loadData(currentSubject);
        var list = document.getElementById("chapterList");
        list.innerHTML = "";

        conf.chapters.forEach(function(chName, idx) {
          var chNum = idx + 1;
          var chKey = "ch" + chNum;
          var chData = data[chKey] || { summary: "", wrong: "", plan: "" };
          var reviewed = !!(chData.summary || chData.wrong || chData.plan);

          var card = document.createElement("section");
          card.className = "ss-review-card" + (reviewed ? " ss-reviewed" : "");
          card.dataset.chapter = chKey;

          var head = document.createElement("div");
          head.className = "ss-card-head";
          head.innerHTML =
            '<span class="ss-card-index">' + chNum + "</span>" +
            '<span class="ss-card-title">第 ' + chNum + " 章 · " + chName + "</span>" +
            (reviewed
              ? '<span class="ss-card-badge">已复盘</span>'
              : '<span class="ss-card-badge ss-badge-pending">待复盘</span>') +
            '<span class="ss-card-saved" data-saved="' + chKey + '"></span>';
          card.appendChild(head);

          var fields = document.createElement("div");
          fields.className = "ss-review-fields";

          FIELDS.forEach(function(f) {
            var wrap = document.createElement("div");
            wrap.className = "ss-field ss-field-" + f.key;

            var label = document.createElement("label");
            label.className = "ss-field-label";
            label.htmlFor = "ta-" + chKey + "-" + f.key;
            label.innerHTML =
              '<span class="ss-field-icon">' + f.icon + "</span>" +
              f.label +
              '<span class="ss-field-hint">' + f.hint + "</span>";
            wrap.appendChild(label);

            var ta = document.createElement("textarea");
            ta.className = "ss-review-textarea";
            ta.id = "ta-" + chKey + "-" + f.key;
            ta.dataset.chapter = chKey;
            ta.dataset.field = f.key;
            ta.placeholder = getPlaceholder(f.key, chNum, chName);
            ta.value = chData[f.key] || "";
            ta.addEventListener("input", onTextInput);
            ta.addEventListener("blur", onTextBlur);
            wrap.appendChild(ta);

            fields.appendChild(wrap);
          });

          card.appendChild(fields);
          list.appendChild(card);
        });

        updateSavedLabels();
      }

      function getPlaceholder(field, chNum, chName) {
        if (field === "summary")
          return "第 " + chNum + " 章「" + chName + "」的核心概念、公式、题型…";
        if (field === "wrong")
          return "本章做错的题目、易混淆的概念、踩过的坑…";
        return "针对本章薄弱点，下一步怎么学 / 练 / 复习…";
      }

      // ============ 输入事件：自动保存 ============
      var saveTimer = null;
      function onTextInput(e) {
        var ta = e.target;
        var chKey = ta.dataset.chapter;
        var field = ta.dataset.field;
        var data = loadData(currentSubject);
        if (!data[chKey]) data[chKey] = { summary: "", wrong: "", plan: "" };
        data[chKey][field] = ta.value;
        data[chKey]._ts = Date.now();
        saveData(currentSubject, data);

        // 防抖更新仪表盘 + 卡片状态
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
          updateCardState(chKey);
          updateDashboard();
          updateSavedLabels();
        }, 250);
      }
      function onTextBlur() {
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
        updateDashboard();
        updateSavedLabels();
      }

      function updateCardState(chKey) {
        var card = document.querySelector('.ss-review-card[data-chapter="' + chKey + '"]');
        if (!card) return;
        var data = loadData(currentSubject);
        var ch = data[chKey] || {};
        var reviewed = !!(ch.summary || ch.wrong || ch.plan);
        card.classList.toggle("ss-reviewed", reviewed);

        var badge = card.querySelector(".ss-card-badge");
        if (badge) {
          if (reviewed) {
            badge.className = "ss-card-badge";
            badge.textContent = "已复盘";
          } else {
            badge.className = "ss-card-badge ss-badge-pending";
            badge.textContent = "待复盘";
          }
        }
      }

      // ============ 仪表盘 ============
      function updateDashboard() {
        var conf = SUBJECTS[currentSubject];
        var data = loadData(currentSubject);
        var total = conf.chapters.length;
        var reviewed = 0;
        conf.chapters.forEach(function(_, idx) {
          var chKey = "ch" + (idx + 1);
          var ch = data[chKey] || {};
          if (ch.summary || ch.wrong || ch.plan) reviewed++;
        });

        document.getElementById("reviewedCount").textContent = reviewed;
        document.getElementById("totalCount").textContent = total;
        document.getElementById("statReviewed").textContent = reviewed;
        document.getElementById("statPending").textContent = total - reviewed;

        var pct = total ? Math.round((reviewed / total) * 100) : 0;
        document.getElementById("dashboardFill").style.setProperty("--fill-pct", pct + "%");
        document.getElementById("dashboardPct").textContent = pct + "%";
      }

      // ============ 「已自动保存」提示 ============
      function updateSavedLabels() {
        var data = loadData(currentSubject);
        var now = Date.now();
        document.querySelectorAll(".ss-card-saved").forEach(function(el) {
          var chKey = el.dataset.saved;
          var ch = data[chKey] || {};
          var ts = ch._ts || 0;
          if (ts) {
            var diff = Math.max(0, Math.floor((now - ts) / 1000));
            el.textContent = "已自动保存 · " + humanizeDiff(diff);
          } else {
            el.textContent = "";
          }
        });
      }
      function humanizeDiff(sec) {
        if (sec < 5) return "刚刚";
        if (sec < 60) return sec + " 秒前";
        if (sec < 3600) return Math.floor(sec / 60) + " 分钟前";
        if (sec < 86400) return Math.floor(sec / 3600) + " 小时前";
        return Math.floor(sec / 86400) + " 天前";
      }

      // ============ 科目切换 ============
      function switchSubject(subject) {
        if (!SUBJECTS[subject]) subject = "13003";
        currentSubject = subject;
        updateUrl(subject);
        var nameEl = document.getElementById('subjectName');
        if (nameEl) nameEl.textContent = SUBJECTS[subject].name;
        document.title = SUBJECTS[subject].name + ' · 章节复盘';
        loadActiveFeature();
      }

      // ============ 重置 ============
      function resetCurrent() {
        var conf = SUBJECTS[currentSubject];
        if (!confirm("确定要清空「" + conf.name + "」的全部复盘内容吗？此操作不可恢复。")) return;
        try { localStorage.removeItem(conf.storageKey); } catch (e) {}
        renderChapters();
        updateDashboard();
      }

      // ============ API 基址 ============
      var API_BASE = (location.protocol === 'file:') ? 'http://localhost:8000' : '';
      function apiUrl(path) { return API_BASE + path; }

      // ============ 题型元数据 ============
      var TYPE_META = {
        choice:      { label: '选择题',   icon: '🔘' },
        fill:        { label: '填空题',   icon: '✏️' },
        calculate:   { label: '计算题',   icon: '🧮' },
        shortAnswer: { label: '简答题',   icon: '✍️' },
        essay:       { label: '论述题',   icon: '📄' },
        proof:       { label: '证明题',   icon: '📐' }
      };
      var SUBTYPE_LABEL = { single: '单选', multi: '多选', judge: '判断' };

      // ============ 功能切换状态 ============
      var currentFeature = 'review';
      var wrongCache = { subject: null, records: [], bank: [] };
      var bankCache = { subject: null, data: [], filterChapter: '', filterType: '' };

      // ============ 工具函数 ============
      function esc(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
      // 时间戳兼容毫秒/秒
      function tsToMs(ts) { ts = ts || 0; return ts > 1e12 ? ts : ts * 1000; }
      function relTime(ts) {
        if (!ts) return '—';
        var diff = Math.max(0, Math.floor((Date.now() - tsToMs(ts)) / 1000));
        return humanizeDiff(diff);
      }
      function showToast(msg, kind) {
        var t = document.createElement('div');
        t.className = 'ss-toast' + (kind === 'error' ? ' ss-toast-error' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function() { t.classList.add('ss-toast-show'); });
        setTimeout(function() {
          t.classList.remove('ss-toast-show');
          setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
        }, 2400);
      }

      // ============ 功能 Tab 切换 ============
      function switchFeature(feature) {
        currentFeature = feature;
        document.querySelectorAll('.ss-feature-tab').forEach(function(t) {
          t.classList.toggle('zk-active', t.dataset.feature === feature);
        });
        document.querySelectorAll('.ss-feature-panel').forEach(function(p) {
          p.classList.toggle('zk-active', p.dataset.feature === feature);
        });
        if (feature !== 'bank') closeBankForm();
        loadActiveFeature();
      }
      function loadActiveFeature() {
        if (currentFeature === 'review') {
          renderChapters();
          updateDashboard();
          loadReviewInsight();
        } else if (currentFeature === 'wrong') {
          loadWrongReview();
        } else if (currentFeature === 'bank') {
          loadQuizBank();
        }
      }

      function loadReviewInsight() {
        var container = document.getElementById('reviewInsight');
        if (!container) return;
        fetch(apiUrl('/api/quiz-records?subject=' + currentSubject), { cache: 'no-cache' })
          .then(function(r) { return r.json(); })
          .then(function(records) {
            records = Array.isArray(records) ? records : [];
            var wrong = records.filter(function(r) { return r && r.isCorrect === false; });
            var total = records.length;
            var correctRate = total > 0 ? Math.round((total - wrong.length) / total * 100) : 0;
            var chStats = {};
            records.forEach(function(r) {
              var ch = r.chapter || '未分类';
              if (!chStats[ch]) chStats[ch] = { wrong: 0, total: 0 };
              chStats[ch].total++;
              if (!r.isCorrect) chStats[ch].wrong++;
            });
            var weakChs = Object.keys(chStats).filter(function(ch) { return chStats[ch].wrong > 0; })
              .sort(function(a, b) { return (chStats[b].wrong/chStats[b].total) - (chStats[a].wrong/chStats[a].total); });

            if (total === 0) {
              container.innerHTML = '<div class="ss-insight-bar">' +
                '<div class="ss-insight-stats">' +
                  '<span class="ss-insight-stat"><span class="ss-insight-num accent">' + total + '</span> <span class="ss-insight-label">总答题</span></span>' +
                  '<span class="ss-insight-divider"></span>' +
                  '<span class="ss-insight-stat"><span class="ss-insight-num green">—</span> <span class="ss-insight-label">正确率</span></span>' +
                  '<span class="ss-insight-divider"></span>' +
                  '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + wrong.length + '</span> <span class="ss-insight-label">错题</span></span>' +
                '</div>' +
                '<div class="ss-insight-suggestion">' +
                  '<span class="ss-insight-suggestion-title">💡</span>' +
                  '<span class="ss-insight-suggestion-text">还没有练习记录，先去完成今日任务</span>' +
                '</div>' +
                '<a class="ss-insight-action" href="练习测验.html?subject=' + currentSubject + '&from=review">去练习 →</a>' +
              '</div>';
              return;
            }
            container.innerHTML = '<div class="ss-insight-bar">' +
              '<div class="ss-insight-stats">' +
                '<span class="ss-insight-stat"><span class="ss-insight-num accent">' + total + '</span> <span class="ss-insight-label">总答题</span></span>' +
                '<span class="ss-insight-divider"></span>' +
                '<span class="ss-insight-stat"><span class="ss-insight-num green">' + correctRate + '%</span> <span class="ss-insight-label">正确率</span></span>' +
                '<span class="ss-insight-divider"></span>' +
                '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + wrong.length + '</span> <span class="ss-insight-label">错题</span></span>' +
              '</div>' +
            '</div>';
          })
          .catch(function() { container.innerHTML = ''; });
      }

      // ============ 错题「已解决」标记（localStorage，前端持久） ============
      function loadSolved(subject) {
        try { var raw = localStorage.getItem('ss_wrong_solved_' + subject); return raw ? JSON.parse(raw) : {}; }
        catch (e) { return {}; }
      }
      function saveSolved(subject, obj) {
        try { localStorage.setItem('ss_wrong_solved_' + subject, JSON.stringify(obj)); } catch (e) {}
      }

      // ============ 错题反思：加载 ============
      function loadWrongReview() {
        var container = document.getElementById('wrongContainer');
        var subject = currentSubject;
        container.innerHTML = '<div class="ss-loading">加载中…</div>';
        Promise.all([
          fetch(apiUrl('/api/quiz-records?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
          fetch(apiUrl('/api/quiz-bank?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); })
        ]).then(function(res) {
          var records = Array.isArray(res[0]) ? res[0] : [];
          var bank = Array.isArray(res[1]) ? res[1] : [];
          wrongCache.subject = subject; wrongCache.records = records; wrongCache.bank = bank;
          renderWrong(records, bank, subject);
        }).catch(function(err) {
          container.innerHTML = '<div class="ss-error-box">⚠️ 无法加载错题数据：' +
            esc(err.message || '网络请求失败') + '。请确认本地服务（http://localhost:8000）已启动。</div>';
        });
      }

      // ============ 错题反思：渲染 ============
      function renderWrong(records, bank, subject) {
        var container = document.getElementById('wrongContainer');
        var bankById = {};
        bank.forEach(function(q) { if (q && q.id) bankById[q.id] = q; });

        var wrong = records.filter(function(r) { return r && r.isCorrect === false; });
        var totalAnswered = records.length;
        var correctCount = totalAnswered - wrong.length;
        var correctRate = totalAnswered > 0 ? Math.round(correctCount / totalAnswered * 100) : 0;

        // 章节错误统计
        var chapterStats = {};
        records.forEach(function(r) {
          var ch = r.chapter || '未分类';
          if (!chapterStats[ch]) chapterStats[ch] = { wrong: 0, total: 0 };
          chapterStats[ch].total++;
          if (!r.isCorrect) chapterStats[ch].wrong++;
        });
        var weakChapters = Object.keys(chapterStats)
          .filter(function(ch) { return chapterStats[ch].wrong > 0; })
          .sort(function(a, b) {
            var rateA = chapterStats[a].wrong / chapterStats[a].total;
            var rateB = chapterStats[b].wrong / chapterStats[b].total;
            return rateB - rateA;
          });

        // 洞察条
        var suggestionText = '';
        if (totalAnswered === 0) {
          suggestionText = '还没有练习记录。建议先去练习测验完成今日任务，再来复盘。';
        } else if (wrong.length === 0) {
          suggestionText = '全部正确，表现优秀！可以尝试AI出题挑战更高难度。';
        } else if (weakChapters.length > 0) {
          var topWeak = weakChapters.slice(0, 3).join('、');
          suggestionText = '薄弱章节：' + topWeak + '。建议先复习对应背诵卡，再做弱点优先练习。';
        } else {
          suggestionText = '继续保持练习，定期复盘巩固知识点。';
        }

        var insightHtml = '<div class="ss-insight-bar">' +
          '<div class="ss-insight-stats">' +
            '<span class="ss-insight-stat"><span class="ss-insight-num accent">' + totalAnswered + '</span> <span class="ss-insight-label">总答题</span></span>' +
            '<span class="ss-insight-divider"></span>' +
            '<span class="ss-insight-stat"><span class="ss-insight-num green">' + correctRate + '%</span> <span class="ss-insight-label">正确率</span></span>' +
            '<span class="ss-insight-divider"></span>' +
            '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + wrong.length + '</span> <span class="ss-insight-label">错题</span></span>' +
            '<span class="ss-insight-divider"></span>' +
            '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + weakChapters.length + '</span> <span class="ss-insight-label">薄弱章节</span></span>' +
          '</div>' +
          '<div class="ss-insight-suggestion">' +
            '<span class="ss-insight-suggestion-title">💡</span>' +
            '<span class="ss-insight-suggestion-text">' + esc(suggestionText) + '</span>' +
          '</div>' +
          (totalAnswered > 0 && wrong.length > 0
            ? '<a class="ss-insight-action" href="练习测验.html?subject=' + subject + '&mode=weak">🎯 弱点练习 →</a>'
            : (totalAnswered === 0
              ? '<a class="ss-insight-action" href="练习测验.html?subject=' + subject + '&from=review">去练习 →</a>'
              : '<a class="ss-insight-action" href="练习测验.html?subject=' + subject + '&from=review">继续练习 →</a>')) +
        '</div>';

        if (!wrong.length) {
          container.innerHTML = insightHtml + '<div class="ss-empty">🎉 暂无错题，继续保持！</div>';
          return;
        }

        // 按 questionId 去重，保留最近一次，统计错误次数
        var dedup = {};
        wrong.forEach(function(r) {
          var qid = r.questionId || '';
          if (!qid) return;
          if (!dedup[qid]) dedup[qid] = { rec: r, count: 0 };
          dedup[qid].count++;
          var ts = r.timestamp || 0;
          var cur = dedup[qid].rec.timestamp || 0;
          if (tsToMs(ts) > tsToMs(cur)) dedup[qid].rec = r;
        });

        var list = [];
        Object.keys(dedup).forEach(function(qid) {
          list.push({ qid: qid, rec: dedup[qid].rec, count: dedup[qid].count });
        });
        list.sort(function(a, b) { return tsToMs(b.rec.timestamp) - tsToMs(a.rec.timestamp); });

        // 按章节分组
        var groups = {};
        list.forEach(function(d) {
          var ch = d.rec.chapter || '未分类';
          if (!groups[ch]) groups[ch] = [];
          groups[ch].push(d);
        });

        var solved = loadSolved(subject);
        var total = list.length;
        var chapterCount = Object.keys(groups).length;
        var latestTs = list.length ? tsToMs(list[0].rec.timestamp) : 0;

        var statsHtml =
          '<div class="ss-wrong-stats">' +
            '<div class="ss-wrong-stat"><span class="ss-wrong-stat-num">' + total + '</span><span class="ss-wrong-stat-label">总错题</span></div>' +
            '<div class="ss-wrong-stat"><span class="ss-wrong-stat-num">' + chapterCount + '</span><span class="ss-wrong-stat-label">涉及章节</span></div>' +
            '<div class="ss-wrong-stat"><span class="ss-wrong-stat-num">' + (latestTs ? relTime(latestTs) : '—') + '</span><span class="ss-wrong-stat-label">最近错误</span></div>' +
          '</div>';

        var bodyHtml = Object.keys(groups).map(function(ch) {
          var items = groups[ch];
          var cards = items.map(function(d) { return renderWrongCard(d, bankById, solved, subject); }).join('');
          return '<div class="ss-wrong-group">' +
            '<div class="ss-wrong-group-head"><span class="ss-wrong-group-title">' + esc(ch) + '</span>' +
            '<span class="ss-wrong-group-count">' + items.length + ' 题</span></div>' +
            cards + '</div>';
        }).join('');

        container.innerHTML = insightHtml + statsHtml + bodyHtml;
      }

      function renderWrongCard(d, bankById, solved, subject) {
        var qid = d.qid, rec = d.rec;
        var q = bankById[qid] || {};
        var isSolved = !!solved[qid];
        var typeMeta = TYPE_META[rec.type || q.type] || TYPE_META.choice;
        var questionText = q.question || q.text || '(题库中未找到该题内容)';
        var userAns = formatUserAnswer(rec, q);
        var correctAns = formatCorrectAnswer(q);
        var time = relTime(rec.timestamp);
        var redoUrl = buildRedoUrl(qid);

        return '<div class="ss-wrong-card' + (isSolved ? ' ss-solved' : '') + '" data-qid="' + esc(qid) + '">' +
          '<div class="ss-wrong-card-head">' +
            '<span class="ss-wrong-qid">' + esc(qid) + '</span>' +
            '<span class="ss-wrong-type">' + typeMeta.icon + ' ' + esc(typeMeta.label) + '</span>' +
            '<span class="ss-wrong-chapter">' + esc(rec.chapter || '') + '</span>' +
            '<span class="ss-wrong-time">' + esc(time) + '</span>' +
            '<span class="ss-wrong-count">错 ' + d.count + ' 次</span>' +
            (isSolved ? '<span class="ss-wrong-solved-badge">✓ 已解决</span>' : '') +
          '</div>' +
          '<div class="ss-wrong-question">' + esc(questionText) + '</div>' +
          '<div class="ss-wrong-answers">' +
            '<div class="ss-wrong-ans-row ss-wrong-user"><span class="ss-wrong-ans-label">你的答案</span><span class="ss-wrong-ans-val">' + esc(userAns) + '</span></div>' +
            '<div class="ss-wrong-ans-row ss-wrong-correct"><span class="ss-wrong-ans-label">正确答案</span><span class="ss-wrong-ans-val">' + esc(correctAns) + '</span></div>' +
          '</div>' +
          (q.explanation ? '<div class="ss-wrong-explanation">📖 ' + esc(q.explanation) + '</div>' : '') +
          '<div class="ss-wrong-actions">' +
            '<a class="ss-wrong-redo" href="' + redoUrl + '">重做</a>' +
            '<button class="ss-wrong-solve zk-btn-outline" data-qid="' + esc(qid) + '">' + (isSolved ? '取消标记' : '标记已解决') + '</button>' +
          '</div>' +
        '</div>';
      }

      function formatUserAnswer(rec, q) {
        var ua = rec.userAnswer;
        if (ua == null || ua === '') return '(未作答)';
        if (Array.isArray(ua)) {
          return ua.map(function(a, i) { return (i + 1) + '. ' + (a || '(空)'); }).join('；');
        }
        if (typeof ua === 'object') {
          if (ua.userAnswer != null) return String(ua.userAnswer);
          return JSON.stringify(ua);
        }
        var s = String(ua);
        if (q && q.type === 'choice' && Array.isArray(q.options)) {
          var letters = 'ABCDEFGH';
          var parts = s.split('').map(function(ch) {
            var idx = letters.indexOf(ch);
            return idx >= 0 && q.options[idx] ? (ch + '. ' + q.options[idx].replace(/^[A-H]\.\s*/, '')) : ch;
          });
          if (parts.length) return parts.join('；');
        }
        return s;
      }

      function formatCorrectAnswer(q) {
        if (!q || !q.id) return '(题库中未找到该题)';
        if (q.type === 'choice') {
          if (q.answer == null) return '(无)';
          var letters = 'ABCDEFGH';
          var parts = String(q.answer).split('').map(function(ch) {
            var idx = letters.indexOf(ch);
            return idx >= 0 && q.options && q.options[idx] ? (ch + '. ' + q.options[idx].replace(/^[A-H]\.\s*/, '')) : ch;
          });
          return parts.join('；');
        }
        if (q.type === 'fill') {
          if (Array.isArray(q.blanks)) return q.blanks.map(function(b, i) { return (i + 1) + '. ' + (b.answer || ''); }).join('；');
          return q.answer || '(无)';
        }
        if (q.type === 'calculate') return q.answer || '(无)';
        if (q.type === 'shortAnswer' || q.type === 'essay' || q.type === 'proof') {
          return q.referenceAnswer || (Array.isArray(q.points) ? q.points.map(function(p) { return p.point; }).join('；') : '(无)');
        }
        return q.answer || '(无)';
      }

      function buildRedoUrl(qid) {
        return '练习测验.html?subject=' + encodeURIComponent(currentSubject) + '&questionId=' + encodeURIComponent(qid);
      }

      // ============ 题库管理：加载 ============
      function loadQuizBank() {
        var container = document.getElementById('bankContainer');
        var subject = currentSubject;
        if (bankCache.subject !== subject) { bankCache.filterChapter = ''; bankCache.filterType = ''; bankCache.filterStatus = ''; }
        container.innerHTML = '<div class="ss-loading">加载中…</div>';
        // 同时加载题库和答题记录，用于判断每题的完成状态
        Promise.all([
          fetch(apiUrl('/api/quiz-bank?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
          fetch(apiUrl('/api/quiz-records?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); })
        ]).then(function(res) {
          var bankData = Array.isArray(res[0]) ? res[0] : [];
          var records = Array.isArray(res[1]) ? res[1] : [];
          // 构建题目状态映射：questionId → {isCorrect, level}
          var statusMap = {};
          records.forEach(function(r) {
            if (r && r.questionId) {
              // 保留最新记录（覆盖旧记录）
              statusMap[r.questionId] = { isCorrect: r.isCorrect, level: r.level };
            }
          });
          bankCache.subject = subject;
          bankCache.data = bankData;
          bankCache.statusMap = statusMap;
          renderBank();
        }).catch(function(err) {
          container.innerHTML = '<div class="ss-error-box">⚠️ 无法加载题库：' +
            esc(err.message || '网络请求失败') + '。请确认本地服务（http://localhost:8000）已启动。</div>';
        });
      }

      // ============ 题库管理：渲染 ============
      function renderBank() {
        var container = document.getElementById('bankContainer');
        var data = bankCache.data;
        var statusMap = bankCache.statusMap || {};
        var typeCounts = {}, chapterCounts = {};
        var statusCounts = { unanswered: 0, correct: 0, wrong: 0 };
        data.forEach(function(q) {
          var t = q.type || 'other';
          typeCounts[t] = (typeCounts[t] || 0) + 1;
          var c = q.chapter || '未分类';
          chapterCounts[c] = (chapterCounts[c] || 0) + 1;
          // 统计答题状态
          var st = statusMap[q.id];
          if (!st) statusCounts.unanswered++;
          else if (st.isCorrect) statusCounts.correct++;
          else statusCounts.wrong++;
        });
        var chapters = Object.keys(chapterCounts);
        var types = Object.keys(typeCounts);

        var typeChips = types.map(function(t) {
          var m = TYPE_META[t] || { label: t, icon: '' };
          return '<span class="ss-bank-stat-chip">' + m.icon + ' ' + esc(m.label) + ' ' + typeCounts[t] + '</span>';
        }).join('');

        // 状态统计 chips
        var statusChips =
          '<span class="ss-bank-stat-chip unanswered">⚪ 未答 ' + statusCounts.unanswered + '</span>' +
          '<span class="ss-bank-stat-chip correct">✓ 答对 ' + statusCounts.correct + '</span>' +
          '<span class="ss-bank-stat-chip wrong">✗ 答错 ' + statusCounts.wrong + '</span>';

        var statsHtml =
          '<div class="ss-bank-stats">' +
            '<div class="ss-bank-stat-chips">' +
              '<span class="ss-bank-stat-chip total">📊 总题数 ' + data.length + '</span>' +
              (typeChips || '<span class="ss-bank-stat-chip">暂无</span>') +
            '</div>' +
          '</div>';

        var fc = bankCache.filterChapter, ft = bankCache.filterType, fs = bankCache.filterStatus;
        var chapterOpts = '<option value="">📚 全部章节</option>' +
          chapters.map(function(c) { return '<option value="' + esc(c) + '"' + (c === fc ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
        var typeOpts = '<option value="">📝 全部题型</option>' +
          types.map(function(t) { var m = TYPE_META[t] || { label: t }; return '<option value="' + esc(t) + '"' + (t === ft ? ' selected' : '') + '>' + esc(m.label) + '</option>'; }).join('');
        var statusOpts = '<option value="">📊 全部状态</option>' +
          '<option value="unanswered"' + (fs === 'unanswered' ? ' selected' : '') + '>⚪ 未答（' + statusCounts.unanswered + '）</option>' +
          '<option value="correct"' + (fs === 'correct' ? ' selected' : '') + '>✓ 答对（' + statusCounts.correct + '）</option>' +
          '<option value="wrong"' + (fs === 'wrong' ? ' selected' : '') + '>✗ 答错（' + statusCounts.wrong + '）</option>';

        var toolbarHtml =
          '<div class="ss-bank-toolbar">' +
            '<select id="bankFilterChapter" class="ss-bank-select ss-bank-select-chapter">' + chapterOpts + '</select>' +
            '<select id="bankFilterType" class="ss-bank-select ss-bank-select-type">' + typeOpts + '</select>' +
            '<select id="bankFilterStatus" class="ss-bank-select ss-bank-select-status">' + statusOpts + '</select>' +
            '<span class="ss-bank-toolbar-spacer"></span>' +
            '<button class="ss-bank-add zk-btn-primary" id="bankAddBtn">+ 新增题目</button>' +
          '</div>';

        var formHtml = '<div class="ss-bank-form zk-hidden" id="bankForm"></div>';

        var filtered = data.filter(function(q) {
          if (fc && (q.chapter || '') !== fc) return false;
          if (ft && (q.type || '') !== ft) return false;
          // 答题状态筛选
          if (fs) {
            var st = statusMap[q.id];
            if (fs === 'unanswered' && st) return false;
            if (fs === 'correct' && (!st || !st.isCorrect)) return false;
            if (fs === 'wrong' && (!st || st.isCorrect)) return false;
          }
          return true;
        });

        var listHtml;
        if (!filtered.length) {
          listHtml = '<div class="ss-empty">' + (data.length ? '🔍 当前筛选无匹配题目' : '题库为空，点击「新增题目」添加第一道题') + '</div>';
        } else {
          var groups = {};
          filtered.forEach(function(q) { var c = q.chapter || '未分类'; if (!groups[c]) groups[c] = []; groups[c].push(q); });
          listHtml = Object.keys(groups).map(function(c) {
            var cards = groups[c].map(function(q) { return renderBankCard(q, data.indexOf(q)); }).join('');
            return '<div class="ss-bank-group"><div class="ss-bank-group-head"><span>' + esc(c) + '</span><span class="ss-bank-group-count">' + groups[c].length + ' 题</span></div>' + cards + '</div>';
          }).join('');
        }

        container.innerHTML = statsHtml + toolbarHtml + formHtml + listHtml;

        var fcEl = document.getElementById('bankFilterChapter');
        var ftEl = document.getElementById('bankFilterType');
        var fsEl = document.getElementById('bankFilterStatus');
        if (fcEl) fcEl.addEventListener('change', function() { bankCache.filterChapter = fcEl.value; renderBank(); });
        if (ftEl) ftEl.addEventListener('change', function() { bankCache.filterType = ftEl.value; renderBank(); });
        if (fsEl) fsEl.addEventListener('change', function() { bankCache.filterStatus = fsEl.value; renderBank(); });
        var addBtn = document.getElementById('bankAddBtn');
        if (addBtn) addBtn.addEventListener('click', function() { openBankForm(null); });
      }

      function renderBankCard(q, idx) {
        var typeMeta = TYPE_META[q.type] || { label: q.type || '其他', icon: '' };
        var diff = q.difficulty || 0;
        var diffLabel = diff === 1 ? '简单' : diff === 2 ? '中等' : diff === 3 ? '困难' : '未设';
        var diffStars = diff ? '⭐'.repeat(diff) : '';
        var tags = (Array.isArray(q.tags) && q.tags.length) ? q.tags.map(function(t) { return '<span class="ss-bank-tag">' + esc(t) + '</span>'; }).join('') : '';
        var qText = q.question || q.text || '(无题目)';
        var ansHtml = renderBankAnswer(q);
        var subLabel = q.subType && SUBTYPE_LABEL[q.subType] ? '（' + SUBTYPE_LABEL[q.subType] + '）' : '';
        // 答题状态标签
        var st = (bankCache.statusMap || {})[q.id];
        var statusBadge = !st ? '<span class="ss-bank-status ss-bank-status-unanswered">⚪ 未答</span>' :
          st.isCorrect ? '<span class="ss-bank-status ss-bank-status-correct">✓ 答对</span>' :
          '<span class="ss-bank-status ss-bank-status-wrong">✗ 答错</span>';

        return '<div class="ss-bank-card" data-idx="' + idx + '">' +
          '<div class="ss-bank-card-head">' +
            '<span class="ss-bank-qid">' + esc(q.id || '') + '</span>' +
            '<span class="ss-bank-type">' + typeMeta.icon + ' ' + esc(typeMeta.label) + subLabel + '</span>' +
            statusBadge +
            '<span class="ss-bank-diff">' + diffStars + ' ' + esc(diffLabel) + '</span>' +
            '<div class="ss-bank-card-actions">' +
              '<button class="ss-bank-edit zk-btn-outline" data-idx="' + idx + '">编辑</button>' +
              '<button class="ss-bank-del zk-btn-outline" data-idx="' + idx + '">删除</button>' +
            '</div>' +
          '</div>' +
          '<div class="ss-bank-question">' + esc(qText) + '</div>' +
          ansHtml +
          (q.explanation ? '<div class="ss-bank-explanation">📖 ' + esc(q.explanation) + '</div>' : '') +
          (tags ? '<div class="ss-bank-tags">' + tags + '</div>' : '') +
        '</div>';
      }

      function renderBankAnswer(q) {
        var parts = [];
        if (q.type === 'choice') {
          if (Array.isArray(q.options)) {
            var letters = 'ABCDEFGH';
            parts.push('<div class="ss-bank-options">' + q.options.map(function(o, i) {
              return '<div class="ss-bank-opt">' + (letters[i] || '?') + '. ' + esc(o.replace(/^[A-H]\.\s*/, '')) + '</div>';
            }).join('') + '</div>');
          }
          if (q.answer) parts.push('<div class="ss-bank-answer">答案：<b>' + esc(q.answer) + '</b></div>');
        } else if (q.type === 'fill') {
          if (Array.isArray(q.blanks)) parts.push('<div class="ss-bank-answer">答案：' + q.blanks.map(function(b, i) { return '<b>' + (i + 1) + '.</b> ' + esc(b.answer || ''); }).join('　') + '</div>');
        } else if (q.type === 'calculate') {
          if (q.formula) parts.push('<div class="ss-bank-formula">公式：' + esc(q.formula) + '</div>');
          if (q.answer) parts.push('<div class="ss-bank-answer">答案：<b>' + esc(q.answer) + '</b></div>');
        } else if (q.type === 'shortAnswer' || q.type === 'essay' || q.type === 'proof') {
          if (q.referenceAnswer) parts.push('<div class="ss-bank-answer">参考答案：' + esc(q.referenceAnswer) + '</div>');
          if (q.passThreshold) parts.push('<div class="ss-bank-threshold">通过线：' + q.passThreshold + '</div>');
        }
        if (Array.isArray(q.steps) && q.steps.length) parts.push('<div class="ss-bank-steps">步骤：' + q.steps.map(esc).join(' → ') + '</div>');
        return parts.length ? '<div class="ss-bank-ans-block">' + parts.join('') + '</div>' : '';
      }

      // ============ 题库管理：保存到服务器 ============
      function saveBank() {
        renderBank();
        fetch(apiUrl('/api/quiz-bank'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: bankCache.subject, data: bankCache.data })
        })
          .then(function(r) { return r.json(); })
          .then(function(res) {
            if (res && res.error) { showToast('保存失败：' + res.error, 'error'); loadQuizBank(); }
            else { showToast('已保存', 'success'); }
          })
          .catch(function(err) {
            showToast('保存失败：' + (err.message || '网络错误') + '，请重试', 'error');
            loadQuizBank();
          });
      }

      // ============ 题库管理：新增/编辑表单 ============
      function openBankForm(idx) {
        var form = document.getElementById('bankForm');
        if (!form) return;
        var isEdit = idx != null;
        var q = isEdit ? bankCache.data[idx] : null;
        var data = bankCache.data;
        var conf = SUBJECTS[currentSubject];

        var chSet = {};
        conf.chapters.forEach(function(name, i) { chSet['第' + (i + 1) + '章 ' + name] = true; });
        data.forEach(function(d) { if (d.chapter) chSet[d.chapter] = true; });
        var chapterList = Object.keys(chSet);

        var typeOpts = Object.keys(TYPE_META).map(function(t) {
          return '<option value="' + t + '"' + (q && q.type === t ? ' selected' : '') + '>' + TYPE_META[t].icon + ' ' + TYPE_META[t].label + '</option>';
        }).join('');

        var subTypeVal = (q && q.subType) || 'single';
        var subTypeOpts = Object.keys(SUBTYPE_LABEL).map(function(k) {
          return '<option value="' + k + '"' + (subTypeVal === k ? ' selected' : '') + '>' + SUBTYPE_LABEL[k] + '</option>';
        }).join('');

        var optionsVal = (q && Array.isArray(q.options)) ? q.options.join('\n') : '';
        var answerVal = '';
        if (q) {
          if (q.type === 'choice' || q.type === 'calculate') answerVal = q.answer || '';
          else if (q.type === 'fill') answerVal = (q.blanks || []).map(function(b) { return b.answer || ''; }).join(' | ');
          else if (q.type === 'shortAnswer' || q.type === 'essay' || q.type === 'proof') answerVal = q.referenceAnswer || '';
        }
        var passVal = (q && q.passThreshold) || 3;
        var diffVal = (q && q.difficulty) || 1;

        form.innerHTML =
          '<div class="ss-bank-form-head"><span>' + (isEdit ? '编辑题目' : '新增题目') + '</span><button class="ss-bank-form-close zk-btn-outline" type="button">×</button></div>' +
          '<div class="ss-bank-form-body">' +
            '<div class="ss-bank-form-row">' +
              '<label class="ss-bank-field">题型<select id="bfType" class="ss-bank-input">' + typeOpts + '</select></label>' +
              '<label class="ss-bank-field ss-field-choice-only zk-hidden">子类型<select id="bfSubType" class="ss-bank-input">' + subTypeOpts + '</select></label>' +
              '<label class="ss-bank-field">难度<select id="bfDifficulty" class="ss-bank-input"><option value="1">⭐ 简单</option><option value="2">⭐⭐ 中等</option><option value="3">⭐⭐⭐ 困难</option></select></label>' +
            '</div>' +
            '<label class="ss-bank-field">章节<input id="bfChapter" class="ss-bank-input" list="bfChapterList" placeholder="如：第1章 计算机系统概述" value="' + esc(q ? q.chapter : '') + '"/><datalist id="bfChapterList">' + chapterList.map(function(c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></label>' +
            '<label class="ss-bank-field">题目<textarea id="bfQuestion" class="ss-bank-input ss-bank-textarea" placeholder="题干文本">' + esc(q ? (q.question || q.text || '') : '') + '</textarea></label>' +
            '<label class="ss-bank-field ss-field-choice-only zk-hidden">选项（每行一个，仅选择题）<textarea id="bfOptions" class="ss-bank-input ss-bank-textarea" placeholder="A 选项&#10;B 选项">' + esc(optionsVal) + '</textarea></label>' +
            '<label class="ss-bank-field">答案<span id="bfAnswerHint">（字母，如 A）</span><input id="bfAnswer" class="ss-bank-input" value="' + esc(answerVal) + '"/></label>' +
            '<label class="ss-bank-field ss-field-points-only zk-hidden">通过阈值<input id="bfPass" class="ss-bank-input" type="number" min="1" value="' + passVal + '"/></label>' +
            '<label class="ss-bank-field">解析<textarea id="bfExplanation" class="ss-bank-input ss-bank-textarea" placeholder="解析（可选）">' + esc(q ? (q.explanation || '') : '') + '</textarea></label>' +
            '<label class="ss-bank-field">标签（逗号分隔）<input id="bfTags" class="ss-bank-input" value="' + esc(q && q.tags ? q.tags.join(', ') : '') + '"/></label>' +
            '<div class="ss-bank-form-actions"><button class="ss-bank-form-save zk-btn-primary" type="button">' + (isEdit ? '保存修改' : '添加题目') + '</button><button class="ss-bank-form-cancel zk-btn-outline" type="button">取消</button></div>' +
          '</div>';
        form.classList.remove('zk-hidden');
        form.dataset.editIdx = isEdit ? String(idx) : '';

        document.getElementById('bfDifficulty').value = String(diffVal);
        toggleFormFields();

        document.getElementById('bfType').addEventListener('change', toggleFormFields);
        form.querySelector('.ss-bank-form-close').addEventListener('click', closeBankForm);
        form.querySelector('.ss-bank-form-cancel').addEventListener('click', closeBankForm);
        form.querySelector('.ss-bank-form-save').addEventListener('click', function() { submitBankForm(isEdit ? idx : null); });

        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function toggleFormFields() {
        var typeEl = document.getElementById('bfType');
        if (!typeEl) return;
        var type = typeEl.value;
        var showChoice = (type === 'choice');
        var showPoints = (type === 'shortAnswer' || type === 'essay' || type === 'proof');
        document.querySelectorAll('.ss-field-choice-only').forEach(function(el) { el.classList.toggle('zk-hidden', !showChoice); });
        document.querySelectorAll('.ss-field-points-only').forEach(function(el) { el.classList.toggle('zk-hidden', !showPoints); });
        var hint = document.getElementById('bfAnswerHint');
        if (hint) {
          if (type === 'choice') hint.textContent = '（字母，如 A 或 ACD）';
          else if (type === 'fill') hint.textContent = '（各空答案用 | 分隔）';
          else if (type === 'calculate') hint.textContent = '（最终答案）';
          else hint.textContent = '（参考答案要点）';
        }
      }

      function submitBankForm(editIdx) {
        var type = document.getElementById('bfType').value;
        var subType = document.getElementById('bfSubType') ? document.getElementById('bfSubType').value : 'single';
        var chapter = document.getElementById('bfChapter').value.trim();
        var difficulty = parseInt(document.getElementById('bfDifficulty').value, 10) || 1;
        var question = document.getElementById('bfQuestion').value;
        var optionsRaw = document.getElementById('bfOptions').value;
        var answer = document.getElementById('bfAnswer').value;
        var passEl = document.getElementById('bfPass');
        var pass = passEl ? (parseInt(passEl.value, 10) || 3) : 3;
        var explanation = document.getElementById('bfExplanation').value;
        var tagsRaw = document.getElementById('bfTags').value;

        if (!question.trim()) { showToast('请填写题目内容', 'error'); return; }
        if (!chapter) { showToast('请填写章节', 'error'); return; }
        if (type === 'choice' && !answer.trim()) { showToast('请填写答案（字母）', 'error'); return; }

        var tags = tagsRaw ? tagsRaw.split(/[,，]/).map(function(t) { return t.trim(); }).filter(Boolean) : [];

        var obj;
        if (editIdx != null) {
          obj = bankCache.data[editIdx] || {};
        } else {
          obj = { id: 'q-new-' + Date.now() };
        }

        obj.type = type;
        obj.chapter = chapter;
        obj.difficulty = difficulty;
        if (tags.length) obj.tags = tags; else delete obj.tags;
        if (explanation) obj.explanation = explanation; else delete obj.explanation;

        // 题干：填空题用 text，其余用 question
        if (type === 'fill') { obj.text = question; delete obj.question; }
        else { obj.question = question; delete obj.text; }

        if (type === 'choice') {
          obj.subType = subType;
          obj.options = optionsRaw.split(/\n/).map(function(s) { return s.trim(); }).filter(Boolean);
          obj.answer = answer.trim().toUpperCase();
        } else {
          delete obj.subType; delete obj.options;
        }

        if (type === 'fill') {
          var blanks = answer.split('|').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
          var existing = Array.isArray(obj.blanks) ? obj.blanks : [];
          obj.blanks = blanks.map(function(ans, i) {
            var b = existing[i] || {};
            b.answer = ans;
            return b;
          });
          delete obj.answer;
        } else {
          delete obj.blanks;
        }

        if (type === 'calculate') {
          obj.answer = answer.trim();
        } else if (type === 'shortAnswer' || type === 'essay') {
          obj.referenceAnswer = answer;
          obj.passThreshold = pass || 3;
          if (!Array.isArray(obj.points)) obj.points = [];
          delete obj.answer;
        } else if (type === 'proof') {
          obj.referenceAnswer = answer;
          obj.passThreshold = pass || 3;
          if (!Array.isArray(obj.steps)) obj.steps = [];
          delete obj.answer;
        } else {
          delete obj.referenceAnswer; delete obj.passThreshold; delete obj.points; delete obj.steps;
        }

        if (editIdx == null) {
          bankCache.data.push(obj);
        } else {
          bankCache.data[editIdx] = obj;
        }

        closeBankForm();
        saveBank();
      }

      function closeBankForm() {
        var form = document.getElementById('bankForm');
        if (form) { form.classList.add('zk-hidden'); form.innerHTML = ''; }
      }

      // ============ 绑定事件 ============
      document.getElementById("resetBtn").addEventListener("click", resetCurrent);

      // 功能 Tab 切换
      document.querySelectorAll(".ss-feature-tab").forEach(function(t) {
        t.addEventListener("click", function() {
          switchFeature(t.dataset.feature);
        });
      });

      // 错题卡片：标记已解决 / 取消标记（事件委托）
      document.getElementById("wrongContainer").addEventListener("click", function(e) {
        var btn = e.target.closest(".ss-wrong-solve");
        if (!btn) return;
        var qid = btn.dataset.qid;
        var solved = loadSolved(currentSubject);
        if (solved[qid]) delete solved[qid]; else solved[qid] = true;
        saveSolved(currentSubject, solved);
        // 用缓存数据直接重渲染，避免重复请求
        renderWrong(wrongCache.records, wrongCache.bank, currentSubject);
      });

      // 题库卡片：编辑 / 删除（事件委托）
      document.getElementById("bankContainer").addEventListener("click", function(e) {
        var editBtn = e.target.closest(".ss-bank-edit");
        var delBtn = e.target.closest(".ss-bank-del");
        if (editBtn) {
          openBankForm(parseInt(editBtn.dataset.idx, 10));
        } else if (delBtn) {
          var idx = parseInt(delBtn.dataset.idx, 10);
          var q = bankCache.data[idx];
          if (!q) return;
          if (!confirm("确定删除题目「" + (q.id || "") + "」吗？此操作不可恢复。")) return;
          bankCache.data.splice(idx, 1);
          saveBank();
        }
      });

      // 每分钟刷新一次「已保存」相对时间
      setInterval(updateSavedLabels, 60000);

      // ============ 初始化 ============
      switchSubject(currentSubject);

      // 引导流：URL hash/tab 自动切换功能
      var initParams = new URLSearchParams(window.location.search);
      var tabParam = initParams.get('tab');
      var hashFeature = window.location.hash.replace('#', '');
      var targetFeature = hashFeature || tabParam || '';
      if (targetFeature && (targetFeature === 'wrong' || targetFeature === 'bank' || targetFeature === 'review')) {
        switchFeature(targetFeature);
      }

      // 引导流：设置返回背诵卡按钮
      var guideBtn = document.getElementById('guideBtn');
      if (guideBtn) {
        guideBtn.href = '背诵与简答-核心概念背诵卡.html?subject=' + currentSubject;
      }
    })();
