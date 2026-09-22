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
      var apiUrl = QuizUtils.apiUrl;

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

      // ============ 工具函数 ============
      var esc = QuizUtils.esc;
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
        loadActiveFeature();
      }
      function loadActiveFeature() {
        if (currentFeature === 'review') {
          renderChapters();
          updateDashboard();
          loadReviewInsight();
        } else if (currentFeature === 'wrong') {
          loadWrongReview();
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
      var solvedCache = {};
      function loadSolved(subject) {
        return fetch(apiUrl('/api/wrong-solved?subject=' + subject), { cache: 'no-cache' })
          .then(function(r) { return r.json(); })
          .then(function(data) { solvedCache = data || {}; return solvedCache; })
          .catch(function() { return {}; });
      }
      function saveSolved(subject, qid, solved) {
        fetch(apiUrl('/api/wrong-solved'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: subject, questionId: qid, solved: solved })
        }).catch(function() {});
      }

      // ============ 错题反思：加载 ============
      function loadWrongReview() {
        var container = document.getElementById('wrongContainer');
        var subject = currentSubject;
        container.innerHTML = '<div class="ss-loading">加载中…</div>';
        Promise.all([
          fetch(apiUrl('/api/quiz-records?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
          fetch(apiUrl('/api/quiz-bank?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
          fetch(apiUrl('/api/ai-practice?subject=' + subject), { cache: 'no-cache' }).then(function(r) { return r.json(); }).catch(function() { return []; }),
          (window.examDataReady || Promise.resolve()).then(function() {
            var examData = window.EXAM_DATA && window.EXAM_DATA[subject];
            return (examData && examData.questions) || [];
          }),
          loadSolved(subject)
        ]).then(function(res) {
          var records = Array.isArray(res[0]) ? res[0] : [];
          var bank = Array.isArray(res[1]) ? res[1] : [];
          var aiBatches = Array.isArray(res[2]) ? res[2] : [];
          var examQs = Array.isArray(res[3]) ? res[3] : [];
          aiBatches.forEach(function(batch) {
            var qs = (batch && (batch.items || batch.questions)) || [];
            qs.forEach(function(q) { bank.push(q); });
          });
          examQs.forEach(function(q) { bank.push(q); });
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

        var solved = solvedCache;
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
        var isSolved = !!solvedCache[qid];
        var newState = !isSolved;
        if (newState) solvedCache[qid] = true; else delete solvedCache[qid];
        saveSolved(currentSubject, qid, newState);
        renderWrong(wrongCache.records, wrongCache.bank, currentSubject);
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
      if (targetFeature && (targetFeature === 'wrong' || targetFeature === 'review')) {
        switchFeature(targetFeature);
      }

      // 引导流：设置返回背诵卡按钮
      var guideBtn = document.getElementById('guideBtn');
      if (guideBtn) {
        guideBtn.href = '背诵与简答-核心概念背诵卡.html?subject=' + currentSubject;
      }
    })();
