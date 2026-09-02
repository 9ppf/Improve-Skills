// ============================================================
// 复盘总结-章节复盘 JS v2.1
// 数据驱动结构化复盘卡 — 迭代版
// 改进点：合并错题反思Tab、自由笔记、mastery共享、多章展开、复习调度、每章重置
// ============================================================

(function() {
  // ============ 科目与章节数据 ============
  var SUBJECTS = {
    "13003": {
      name: "13003 数据结构与算法",
      reviewKey: "ss_review_13003",
      masteryKey: "ss_mastery_13003",
      kfFile: "knowledge-framework-13003.json",
      chapters: [
        "绪论", "线性表", "栈和队列", "数组、广义表和串",
        "树与二叉树", "图结构", "内部排序", "查找"
      ]
    },
    "13015": {
      name: "13015 计算机系统原理",
      reviewKey: "ss_review_13015",
      masteryKey: "ss_mastery_13015",
      kfFile: "knowledge-framework-13015.json",
      chapters: [
        "计算机系统概述", "数据的表示和运算", "程序的转换及机器级表示",
        "可执行文件的生成与加载执行", "程序的存储访问", "程序中I/O操作的实现"
      ]
    },
    "02324": {
      name: "02324 离散数学",
      reviewKey: "ss_review_02324",
      masteryKey: "ss_mastery_02324",
      kfFile: "knowledge-framework-02324.json",
      chapters: [
        "命题与命题公式", "命题逻辑的推理理论", "谓词逻辑", "集合",
        "关系与函数", "代数系统的一般概念", "格与布尔代数", "图", "图的应用"
      ]
    }
  };

  // 与知识框架页共享的掌握度标签（0-4级）
  var MASTERY_LABELS = ["待学习", "学习中", "不会", "不熟", "掌握"];
  var MASTERY_COLORS = ["gray", "yellow", "red", "orange", "green"];
  var MASTERY_DOT_CLASS = {
    gray: "ss-dot-gray", yellow: "ss-dot-yellow", red: "ss-dot-red",
    orange: "ss-dot-orange", green: "ss-dot-green"
  };

  function getSubjectFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var s = params.get("subject");
    if (s && SUBJECTS[s]) return s;
    return "13003";
  }

  var currentSubject = getSubjectFromUrl();
  var kfData = null;
  var quizRecords = null;
  var quizBank = null;
  var expandedChapters = {}; // 多章展开：chKey -> true

  // ============ localStorage 读写 ============

  // 复盘数据（笔记、计划等用户手动输入）
  function loadReviewData(subject) {
    var key = SUBJECTS[subject].reviewKey;
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function saveReviewData(subject, data) {
    var key = SUBJECTS[subject].reviewKey;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  // 掌握度数据 — 与知识框架页共享同一key
  function loadMastery(subject) {
    var key = SUBJECTS[subject].masteryKey;
    try {
      var raw = localStorage.getItem(key);
      var state = raw ? JSON.parse(raw) : { mastery: {}, kp: {}, toc: {} };
      if (!state.toc) state.toc = {};
      if (!state.mastery) state.mastery = {};
      return state;
    } catch (e) { return { mastery: {}, kp: {}, toc: {} }; }
  }
  function saveMastery(subject, state) {
    var key = SUBJECTS[subject].masteryKey;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
    // 同步到API（与知识框架页一致）
    try {
      fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject, mastery: state })
      });
    } catch (e) {}
  }

  // ============ API 基址 ============
  var API_BASE = (location.protocol === 'file:') ? 'http://localhost:8000' : '';
  function apiUrl(path) { return API_BASE + path; }

  // ============ 工具函数 ============
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function tsToMs(ts) { ts = ts || 0; return ts > 1e12 ? ts : ts * 1000; }
  function relTime(ts) {
    if (!ts) return '—';
    var diff = Math.max(0, Math.floor((Date.now() - tsToMs(ts)) / 1000));
    if (diff < 5) return "刚刚";
    if (diff < 60) return diff + " 秒前";
    if (diff < 3600) return Math.floor(diff / 60) + " 分钟前";
    if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
    return Math.floor(diff / 86400) + " 天前";
  }

  // ============ 遗忘曲线复习调度 ============
  // 基于艾宾浩斯：1天、2天、4天、7天、15天
  var REVIEW_INTERVALS = [1, 2, 4, 7, 15];
  function suggestNextReview(chKey, reviewData) {
    var ch = reviewData[chKey];
    if (!ch || !ch._ts) return null;
    var lastReview = ch._ts;
    var elapsed = Math.floor((Date.now() - lastReview) / 86400000); // 天
    // 找到当前应该的间隔
    var stage = 0;
    var prevReviews = ch._reviewCount || 0;
    stage = Math.min(prevReviews, REVIEW_INTERVALS.length - 1);
    var interval = REVIEW_INTERVALS[stage];
    var nextDate = new Date(lastReview + interval * 86400000);
    var daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
    return {
      nextDate: nextDate,
      daysUntil: daysUntil,
      stage: stage,
      interval: interval,
      elapsed: elapsed
    };
  }

  // ============ 获取知识框架中的章节数据 ============
  function getKfChapter(chIdx) {
    if (!kfData || !kfData.chapters) return null;
    for (var i = 0; i < kfData.chapters.length; i++) {
      if (kfData.chapters[i].id === chIdx) return kfData.chapters[i];
    }
    return null;
  }

  function getKfSections(chIdx) {
    var ch = getKfChapter(chIdx);
    if (!ch) return { concepts: [], pitfalls: [], examReqs: [] };
    var concepts = [], pitfalls = [], examReqs = [];
    (ch.sections || []).forEach(function(s) {
      if (s.type === '核心概念') concepts = s.items || [];
      else if (s.type === '易错点') pitfalls = s.items || [];
      else if (s.type === '考核知识点与考核要求') examReqs = s.items || [];
    });
    return { concepts: concepts, pitfalls: pitfalls, examReqs: examReqs };
  }

  // ============ 获取每章的答题统计 ============
  function getChapterQuizStats(chName, chNum) {
    if (!quizRecords) return { total: 0, correct: 0, wrong: 0, wrongList: [] };
    var stats = { total: 0, correct: 0, wrong: 0, wrongList: [] };
    var seen = {};
    quizRecords.forEach(function(r) {
      if (!r) return;
      // 模糊匹配：chapterName可能包含"第N章"前缀
      var rch = r.chapter || '';
      var match = rch === chName || rch.indexOf(chName) >= 0 || rch.indexOf('第' + chNum + '章') >= 0;
      if (!match) return;
      var qid = r.questionId || '';
      if (qid && seen[qid]) {
        if (tsToMs(r.timestamp) > tsToMs(seen[qid].timestamp)) seen[qid] = r;
      } else { seen[qid] = r; }
    });
    Object.keys(seen).forEach(function(qid) {
      var r = seen[qid];
      if (!qid) return;
      stats.total++;
      if (r.isCorrect) stats.correct++;
      else { stats.wrong++; stats.wrongList.push(r); }
    });
    // 按时间倒序
    stats.wrongList.sort(function(a, b) { return tsToMs(b.timestamp) - tsToMs(a.timestamp); });
    return stats;
  }

  // ============ 按概念聚合答题统计 ============
  function buildConceptStats() {
    var stats = {};
    if (!quizRecords || !quizBank) return stats;
    var qMap = {};
    quizBank.forEach(function(q) { if (q.id && q.cardId) qMap[q.id] = q.cardId; });
    var seen = {};
    quizRecords.forEach(function(r) {
      if (!r) return;
      var qid = r.questionId || '';
      if (!qid) return;
      if (seen[qid]) {
        if (tsToMs(r.timestamp) > tsToMs(seen[qid].timestamp)) seen[qid] = r;
      } else { seen[qid] = r; }
    });
    Object.keys(seen).forEach(function(qid) {
      var cardId = qMap[qid];
      if (!cardId) return;
      if (!stats[cardId]) stats[cardId] = { total: 0, correct: 0, wrong: 0 };
      stats[cardId].total++;
      if (seen[qid].isCorrect) stats[cardId].correct++;
      else stats[cardId].wrong++;
    });
    return stats;
  }

  // ============ 获取概念掌握状态 ============
  function getConceptMastery(masteryState, term) {
    var level = masteryState.toc[term];
    if (level == null) level = 0;
    return { level: level, label: MASTERY_LABELS[level] || MASTERY_LABELS[0] };
  }

  // ============ 渲染章节卡片 ============
  function renderChapters() {
    var conf = SUBJECTS[currentSubject];
    var reviewData = loadReviewData(currentSubject);
    var masteryState = loadMastery(currentSubject);
    var list = document.getElementById("chapterList");
    var conceptStats = buildConceptStats();
    list.innerHTML = "";

    conf.chapters.forEach(function(chName, idx) {
      var chNum = idx + 1;
      var chKey = "ch" + chNum;
      var chData = reviewData[chKey] || { notes: "", plan: "", wrongReflection: "" };
      var reviewed = !!(chData.notes || chData.plan || chData.wrongReflection);

      // 知识框架数据
      var kf = getKfSections(chNum);
      // 答题统计
      var qStats = getChapterQuizStats(conf.chapters[idx], chNum);
      // 复习调度
      var schedule = suggestNextReview(chKey, reviewData);

      // 概念色点
      var conceptDots = kf.concepts.map(function(c) {
        var term = c.term || '';
        var m = getConceptMastery(masteryState, term);
        var dotClass = MASTERY_DOT_CLASS[MASTERY_COLORS[m.level]] || 'ss-dot-gray';
        return '<span class="ss-concept-dot ' + dotClass + '" title="' + esc(term) + ': ' + esc(m.label) + '"></span>';
      }).join('');

      // 正确率
      var rate = qStats.total > 0 ? Math.round(qStats.correct / qStats.total * 100) : null;
      var rateStr = rate !== null ? rate + '%' : '—';
      var rateClass = rate === null ? '' : rate >= 80 ? 'ss-rate-good' : rate >= 60 ? 'ss-rate-mid' : 'ss-rate-bad';

      // 易错点提醒
      var pitfallHtml = '';
      if (kf.pitfalls.length > 0) {
        pitfallHtml = '<div class="ss-pitfall-box">' +
          '<div class="ss-pitfall-title">❌ 本章易错点提醒</div>' +
          '<ul class="ss-pitfall-list">' +
            kf.pitfalls.map(function(p) {
              var text = typeof p === 'string' ? p : (p.point || p.title || '');
              return '<li>' + esc(text) + '</li>';
            }).join('') +
          '</ul>' +
        '</div>';
      }

      // 概念清单（三指标卡片 + 错题跳转）
      var conceptHtml = '';
      if (kf.concepts.length > 0) {
        conceptHtml = '<div class="ss-concept-box">' +
          '<div class="ss-concept-title">📝 知识点清单（共' + kf.concepts.length + '个）</div>' +
          '<div class="ss-concept-list">' +
            kf.concepts.map(function(c) {
              var term = c.term || '';
              var m = getConceptMastery(masteryState, term);
              var colorClass = 'ss-concept-' + MASTERY_COLORS[m.level];
              var cs = conceptStats[term] || { total: 0, correct: 0, wrong: 0 };
              var csRate = cs.total > 0 ? Math.round(cs.correct / cs.total * 100) : null;
              var csRateStr = csRate !== null ? csRate + '%' : '—';
              var csRateClass = csRate === null ? 'ss-metric-none' : csRate >= 80 ? 'ss-cs-good' : csRate >= 60 ? 'ss-cs-mid' : 'ss-cs-bad';
              var masteryPct = Math.round(m.level / 4 * 100);
              var masteryClass = m.level >= 4 ? 'ss-cs-good' : m.level >= 3 ? 'ss-cs-mid' : 'ss-cs-bad';
              var overall = (cs.total > 0 && csRate !== null)
                ? Math.round(masteryPct * 0.4 + csRate * 0.6)
                : masteryPct;
              var overallClass = overall >= 80 ? 'ss-cs-good' : overall >= 60 ? 'ss-cs-mid' : 'ss-cs-bad';
              return '<div class="ss-concept-card ' + colorClass + '" data-term="' + esc(term) + '">' +
                '<div class="ss-concept-card-head">' +
                  '<span class="ss-concept-card-term">' + esc(term) + '</span>' +
                '</div>' +
                '<div class="ss-concept-metrics">' +
                  '<div class="ss-metric">' +
                    '<div class="ss-metric-label">📖 定义掌握</div>' +
                    '<div class="ss-metric-value ' + masteryClass + '">' + masteryPct + '%</div>' +
                  '</div>' +
                  '<div class="ss-metric">' +
                    '<div class="ss-metric-label">📊 正确率</div>' +
                    '<div class="ss-metric-value ' + csRateClass + '">' + csRateStr + '</div>' +
                  '</div>' +
                  '<div class="ss-metric">' +
                    '<div class="ss-metric-label">🎯 综合掌握</div>' +
                    '<div class="ss-metric-value ' + overallClass + '">' + overall + '%</div>' +
                  '</div>' +
                '</div>' +
                (cs.wrong > 0
                  ? '<div class="ss-concept-wrong">' +
                      '<span class="ss-wrong-count">❌ ' + cs.wrong + '道错题</span>' +
                      '<span class="ss-wrong-goto" data-cardid="' + esc(term) + '">查看错题 →</span>' +
                    '</div>'
                  : '<div class="ss-concept-wrong ss-concept-wrong-ok">✓ 全部正确</div>'
                ) +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }

      // 薄弱点总结 + 改进计划（根据掌握度自动生成）
      var weakItems = [], noPracticeItems = [];
      var totalWrong = 0, needMemorize = [], calcConcepts = [], weakest = null;
      var totalOverall = 0;
      kf.concepts.forEach(function(c) {
        var term = c.term || '';
        var m = getConceptMastery(masteryState, term);
        var cs = conceptStats[term] || { total: 0, correct: 0, wrong: 0 };
        var masteryPct = Math.round(m.level / 4 * 100);
        var csRate = cs.total > 0 ? Math.round(cs.correct / cs.total * 100) : 0;
        var overall = cs.total > 0 ? Math.round(masteryPct * 0.4 + csRate * 0.6) : masteryPct;
        totalOverall += overall;
        totalWrong += cs.wrong;
        if (masteryPct < 50) needMemorize.push(term);
        if (cs.total === 0) noPracticeItems.push(term);
        if (overall < 80) weakItems.push({ term: term, overall: overall, wrong: cs.wrong });
        if (!weakest || overall < weakest.overall) weakest = { term: term, overall: overall };
        // 题型偏向分析
        if (quizBank) {
          var types = {}, qcount = 0;
          for (var i = 0; i < quizBank.length; i++) {
            if ((quizBank[i].cardId || quizBank[i].concept || '') === term) {
              var qt = quizBank[i].type || '其他';
              types[qt] = (types[qt] || 0) + 1;
              qcount++;
            }
          }
          if (qcount >= 2) {
            var domType = null, maxC = 0;
            for (var t in types) { if (types[t] > maxC) { maxC = types[t]; domType = t; } }
            if (domType && maxC / qcount > 0.5 && (domType === '计算题' || domType === '简答题')) {
              calcConcepts.push({ term: term, type: domType });
            }
          }
        }
      });
      var avgOverall = kf.concepts.length > 0 ? Math.round(totalOverall / kf.concepts.length) : 0;
      var masteredCount = kf.concepts.length - weakItems.length;
      var overallBarClass = avgOverall >= 80 ? 'ss-cs-good' : avgOverall >= 60 ? 'ss-cs-mid' : 'ss-cs-bad';
      var weakHtml = '<div class="ss-section-title">⚠️ 薄弱点总结</div>' +
        '<div class="ss-weak-summary">' +
          '<div class="ss-weak-bar-row">' +
            '<span class="ss-weak-bar-label">综合掌握</span>' +
            '<div class="ss-weak-bar"><div class="ss-weak-bar-fill ' + overallBarClass + '" style="width:' + avgOverall + '%"></div></div>' +
            '<span class="ss-weak-bar-pct ' + overallBarClass + '">' + avgOverall + '%</span>' +
            '<span class="ss-weak-bar-count">' + masteredCount + '/' + kf.concepts.length + '</span>' +
          '</div>' +
          (weakItems.length > 0
            ? '<div class="ss-weak-row">薄弱：' + weakItems.map(function(w) { return '<span class="ss-weak-tag">' + esc(w.term) + ' ' + w.overall + '%</span>'; }).join('') + '</div>'
            : '<div class="ss-weak-row ss-weak-ok">✓ 全部掌握</div>'
          ) +
          (noPracticeItems.length > 0
            ? '<div class="ss-weak-row ss-weak-nopractice">未练习：' + noPracticeItems.map(function(t) { return '<span class="ss-weak-tag">' + esc(t) + '</span>'; }).join('') + '</div>'
            : ''
          ) +
        '</div>';
      // 改进计划 — 整体建议
      var planSuggestions = [];
      if (weakest && weakest.overall < 80) {
        planSuggestions.push('重点掌握「' + weakest.term + '」（' + weakest.overall + '%）');
      }
      if (totalWrong > 0) {
        planSuggestions.push('整体错题' + totalWrong + '道待重做');
      }
      if (needMemorize.length > 0) {
        planSuggestions.push('背诵「' + needMemorize.slice(0, 3).join('、') + '」定义');
      }
      calcConcepts.slice(0, 2).forEach(function(cc) {
        planSuggestions.push('「' + cc.term + '」偏向' + cc.type + '，需多练');
      });
      if (planSuggestions.length === 0) {
        planSuggestions.push('本章掌握良好，保持');
      }
      var planHtml = '<div class="ss-section-title">🎯 改进计划</div>' +
        '<div class="ss-plan-auto">' +
          planSuggestions.map(function(s) { return '<div class="ss-plan-item">' + s + '</div>'; }).join('') +
        '</div>';

      // 考核要求
      var examReqHtml = '';
      if (kf.examReqs.length > 0) {
        examReqHtml = '<div class="ss-examreq-box">' +
          '<div class="ss-examreq-title">📋 考核知识点与要求 (' + kf.examReqs.length + ')</div>' +
          '<div class="ss-examreq-list">' +
            kf.examReqs.map(function(e) {
              var topic = e.topic || '';
              var levels = (e.levels || []).map(function(l) {
                return '<span class="ss-examreq-level ss-level-' + l.level + '">' + esc(l.level) + '</span>';
              }).join('');
              return '<div class="ss-examreq-item">' +
                '<span class="ss-examreq-topic">' + esc(topic) + '</span>' +
                '<span class="ss-examreq-levels">' + levels + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }

      // 复习调度
      var scheduleHtml = '';
      if (schedule) {
        var dueText = schedule.daysUntil <= 0 ? '该复盘了' : schedule.daysUntil + '天后';
        var dueClass = schedule.daysUntil <= 0 ? 'ss-schedule-due' : '';
        scheduleHtml = '<div class="ss-schedule-box ' + dueClass + '">' +
          '<span class="ss-schedule-label">🔁 复习调度</span>' +
          '<span class="ss-schedule-text">上次复盘 ' + relTime(chData._ts) + ' · 建议间隔 ' + schedule.interval + '天 · ' +
          '<b>' + dueText + '</b></span>' +
        '</div>';
      }

      // 智能建议
      var suggestion = '';
      var weakConcepts = kf.concepts.filter(function(c) {
        return getConceptMastery(masteryState, c.term || '').level < 3;
      }).map(function(c) { return c.term; });

      if (qStats.wrong > 0 && weakConcepts.length > 0) {
        suggestion = '💡 本章有 ' + qStats.wrong + ' 道错题，薄弱概念：' + weakConcepts.slice(0, 3).join('、') + '，建议重点复习';
      } else if (qStats.wrong > 0) {
        suggestion = '💡 本章有 ' + qStats.wrong + ' 道错题，建议重做并总结易错原因';
      } else if (qStats.total === 0) {
        suggestion = '💡 本章还未练习，建议先完成练习再复盘';
      } else if (rate !== null && rate >= 80) {
        suggestion = '✅ 本章正确率 ' + rate + '%，掌握良好，可进入下一章或挑战更高难度';
      } else if (rate !== null && rate < 60) {
        suggestion = '⚠️ 本章正确率仅 ' + rate + '%，建议重新学习核心概念后再练习';
      } else {
        suggestion = '📖 本章正确率 ' + rate + '%，仍有提升空间，重点复习薄弱概念';
      }

      // 章节卡片
      var isExpanded = !!expandedChapters[chKey];
      var card = document.createElement("section");
      card.className = "ss-review-card ss-review-card-v2" + (reviewed ? " ss-reviewed" : "") + (isExpanded ? " ss-expanded" : "");
      card.dataset.chapter = chKey;
      card.dataset.chapterName = chName;

      // 收起状态头部
      var head = document.createElement("div");
      head.className = "ss-card-head-v2";
      head.innerHTML =
        '<span class="ss-card-index">' + chNum + '</span>' +
        '<span class="ss-card-title">第 ' + chNum + ' 章 · ' + esc(chName) + '</span>' +
        '<span class="ss-card-stats">' +
          (qStats.total > 0
            ? '<span class="ss-card-stat">📊 ' + qStats.total + '题</span>' +
              '<span class="ss-card-stat ' + rateClass + '">✓ ' + rateStr + '</span>' +
              '<span class="ss-card-stat ss-stat-wrong">❌ ' + qStats.wrong + '错</span>'
            : '<span class="ss-card-stat ss-stat-empty">未答题</span>'
          ) +
        '</span>' +
        '<span class="ss-card-dots">' + conceptDots + '</span>' +
        (reviewed ? '<span class="ss-card-badge">已复盘</span>' : '<span class="ss-card-badge ss-badge-pending">待复盘</span>') +
        '<span class="ss-card-expand">' + (isExpanded ? '▼' : '▶') + '</span>';
      head.addEventListener('click', function() { toggleChapter(chKey); });
      card.appendChild(head);

      // 展开内容
      if (isExpanded) {
        var body = document.createElement("div");
        body.className = "ss-card-body-v2";

        // 1. 本章数据（含错题 — 合并原"错题反思"Tab）
        var dataSection = document.createElement("div");
        dataSection.className = "ss-review-section ss-section-data";
        dataSection.innerHTML =
          '<div class="ss-section-title">📊 本章数据</div>' +
          '<div class="ss-quiz-stats">' +
            '<span class="ss-quiz-stat">答题 <b>' + qStats.total + '</b></span>' +
            '<span class="ss-quiz-stat">正确 <b class="ss-text-green">' + qStats.correct + '</b></span>' +
            '<span class="ss-quiz-stat">错误 <b class="ss-text-coral">' + qStats.wrong + '</b></span>' +
            '<span class="ss-quiz-stat ' + rateClass + '">正确率 <b>' + rateStr + '</b></span>' +
          '</div>';

        // 2. 复习调度
        if (scheduleHtml) {
          var schedSection = document.createElement("div");
          schedSection.className = "ss-review-section ss-section-schedule";
          schedSection.innerHTML = scheduleHtml;
          body.appendChild(schedSection);
        }

        // 3. 考核要求
        if (examReqHtml) {
          var examSection = document.createElement("div");
          examSection.className = "ss-review-section ss-section-examreq";
          examSection.innerHTML = examReqHtml;
          body.appendChild(examSection);
        }

        // 4. 概念清单
        if (conceptHtml) {
          var conceptSection = document.createElement("div");
          conceptSection.className = "ss-review-section ss-section-concepts";
          conceptSection.innerHTML = conceptHtml;
          body.appendChild(conceptSection);
      }

        // 5.5 薄弱点总结
        var weakSection = document.createElement("div");
        weakSection.className = "ss-review-section ss-section-weak";
        weakSection.innerHTML = weakHtml;
        body.appendChild(weakSection);

        // 6. 易错点提醒
        if (pitfallHtml) {
          var pitfallSection = document.createElement("div");
          pitfallSection.className = "ss-review-section ss-section-pitfalls";
          pitfallSection.innerHTML = pitfallHtml;
          body.appendChild(pitfallSection);
        }

        // 6. 自由笔记（新增 — 替代原"本章总结"空白框）
        var notesSection = document.createElement("div");
        notesSection.className = "ss-review-section ss-section-notes";
        notesSection.innerHTML =
          '<div class="ss-section-title">📝 自由笔记</div>' +
          '<textarea class="ss-review-textarea ss-notes-textarea" data-chapter="' + chKey + '" data-field="notes" ' +
          'placeholder="本章核心概念、公式、题型的自由总结…">' + esc(chData.notes || "") + '</textarea>';
        body.appendChild(notesSection);

        // 7. 改进计划（自动生成）
        var planSection = document.createElement("div");
        planSection.className = "ss-review-section ss-section-plan";
        planSection.innerHTML = planHtml;
        body.appendChild(planSection);

        // 8. 每章重置
        var resetSection = document.createElement("div");
        resetSection.className = "ss-review-section ss-section-chapter-reset";
        resetSection.innerHTML =
          '<button class="ss-chapter-reset-btn" data-chapter="' + chKey + '">🗑 重置本章复盘</button>';
        body.appendChild(resetSection);

        // 先加数据区，再依次加其他
        body.insertBefore(dataSection, body.firstChild);

        // 错题反思（存在错题时，置于概念清单之后、自由笔记之前）
        if (qStats.wrong > 0) {
          var reflectSection = document.createElement("div");
          reflectSection.className = "ss-review-section ss-section-reflection";
          reflectSection.innerHTML =
            '<div class="ss-section-title">❌ 错题反思</div>' +
            '<div class="ss-reflection-hint">参考上方概念统计中的错误数据，写下错误原因和纠正方法（如：概念混淆/公式记错/审题失误…）</div>' +
            '<textarea class="ss-review-textarea ss-reflection-textarea" data-chapter="' + chKey + '" data-field="wrongReflection" ' +
            'placeholder="如：把行主序和列主序搞混了，A[3][5]地址应该用行主序公式 loc + (3*8+5)*4…">' +
            esc(chData.wrongReflection || "") + '</textarea>';
          body.insertBefore(reflectSection, notesSection);
        }

        card.appendChild(body);
      }

      list.appendChild(card);
    });

    // 掌握度仅显示，修改请到知识框架页

    // 绑定文本框
    document.querySelectorAll('.ss-notes-textarea, .ss-reflection-textarea').forEach(function(ta) {
      var timer = null;
      ta.addEventListener('input', function() {
        var chKey = ta.dataset.chapter;
        var field = ta.dataset.field;
        var data = loadReviewData(currentSubject);
        if (!data[chKey]) data[chKey] = { notes: "", plan: "" };
        data[chKey][field] = ta.value;
        data[chKey]._ts = Date.now();
        if (field === 'notes' && !data[chKey]._reviewCount) data[chKey]._reviewCount = 0;
        // 首次写笔记时初始化复习计数
        saveReviewData(currentSubject, data);
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
          updateCardState(chKey);
          updateDashboard();
        }, 500);
      });
    });

    // 查看错题 → 切换到题库管理Tab并渲染错题
    document.querySelectorAll('.ss-wrong-goto').forEach(function(el) {
      el.addEventListener('click', function() {
        showWrongQuestions(el.dataset.cardid);
      });
    });

    // 绑定每章重置
    document.querySelectorAll('.ss-chapter-reset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var chKey = btn.dataset.chapter;
        if (!confirm('确定要清空本章的复盘内容吗？（概念掌握状态不受影响）')) return;
        var data = loadReviewData(currentSubject);
        delete data[chKey];
        // 清除本章相关的错题解决标记
        Object.keys(data).forEach(function(k) {
          if (k.indexOf('solved_') === 0) delete data[k];
        });
        saveReviewData(currentSubject, data);
        expandedChapters[chKey] = false;
        renderChapters();
      });
    });

    updateDashboard();
  }

  // 多章展开/收起
  function toggleChapter(chKey) {
    if (expandedChapters[chKey]) {
      delete expandedChapters[chKey];
    } else {
      expandedChapters[chKey] = true;
    }
    renderChapters();
  }

  function updateConceptDots() {
    var masteryState = loadMastery(currentSubject);
    var conf = SUBJECTS[currentSubject];
    conf.chapters.forEach(function(chName, idx) {
      var chNum = idx + 1;
      var chKey = "ch" + chNum;
      var kf = getKfSections(chNum);
      var card = document.querySelector('.ss-review-card[data-chapter="' + chKey + '"]');
      if (!card) return;
      var dotsContainer = card.querySelector('.ss-card-dots');
      if (!dotsContainer) return;
      var dotsHtml = kf.concepts.map(function(c) {
        var term = c.term || '';
        var m = getConceptMastery(masteryState, term);
        var dotClass = MASTERY_DOT_CLASS[MASTERY_COLORS[m.level]] || 'ss-dot-gray';
        return '<span class="ss-concept-dot ' + dotClass + '" title="' + esc(term) + ': ' + esc(m.label) + '"></span>';
      }).join('');
      dotsContainer.innerHTML = dotsHtml;
    });
  }

  function updateCardState(chKey) {
    var card = document.querySelector('.ss-review-card[data-chapter="' + chKey + '"]');
    if (!card) return;
    var data = loadReviewData(currentSubject);
    var ch = data[chKey] || {};
    var reviewed = !!(ch.notes || ch.wrongReflection);
    card.classList.toggle("ss-reviewed", reviewed);
    var badge = card.querySelector(".ss-card-badge");
    if (badge) {
      if (reviewed) { badge.className = "ss-card-badge"; badge.textContent = "已复盘"; }
      else { badge.className = "ss-card-badge ss-badge-pending"; badge.textContent = "待复盘"; }
    }
  }

  function updateDashboard() {
    var conf = SUBJECTS[currentSubject];
    var data = loadReviewData(currentSubject);
    var total = conf.chapters.length;
    var reviewed = 0;
    conf.chapters.forEach(function(_, idx) {
      var chKey = "ch" + (idx + 1);
      var ch = data[chKey] || {};
      if (ch.notes || ch.wrongReflection) reviewed++;
    });
    var reviewedEl = document.getElementById("reviewedCount");
    var totalEl = document.getElementById("totalCount");
    var statReviewed = document.getElementById("statReviewed");
    var statPending = document.getElementById("statPending");
    var fillEl = document.getElementById("dashboardFill");
    var pctEl = document.getElementById("dashboardPct");
    if (reviewedEl) reviewedEl.textContent = reviewed;
    if (totalEl) totalEl.textContent = total;
    if (statReviewed) statReviewed.textContent = reviewed;
    if (statPending) statPending.textContent = total - reviewed;
    var pct = total ? Math.round((reviewed / total) * 100) : 0;
    if (fillEl) fillEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }

  // ============ 题库管理 ============
  var bankFilters = { chapter: '', cardId: '', type: '', status: 'wrong', search: '' };

  // 已掌握题目集合（localStorage）
  function loadSolvedSet(subject) {
    var key = 'ss_bank_solved_' + subject;
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function saveSolvedSet(subject, set) {
    try { localStorage.setItem('ss_bank_solved_' + subject, JSON.stringify(set)); } catch (e) {}
  }

  function getRecordForQuestion(qid) {
    if (!quizRecords) return null;
    var latest = null;
    quizRecords.forEach(function(r) {
      if (r && r.questionId === qid) {
        if (!latest || tsToMs(r.timestamp) > tsToMs(latest.timestamp)) latest = r;
      }
    });
    return latest;
  }

  function getBankFilteredQuestions() {
    if (!quizBank) return [];
    return quizBank.filter(function(q) {
      if (bankFilters.chapter && (q.chapter || '') !== bankFilters.chapter) return false;
      if (bankFilters.cardId && (q.cardId || '') !== bankFilters.cardId) return false;
      if (bankFilters.type && (q.type || '') !== bankFilters.type) return false;
      if (bankFilters.search) {
        var text = (q.question || '') + ' ' + (q.explanation || '');
        if (text.indexOf(bankFilters.search) === -1) return false;
      }
      if (bankFilters.status) {
        var rec = getRecordForQuestion(q.id);
        if (bankFilters.status === 'correct' && !(rec && rec.isCorrect)) return false;
        if (bankFilters.status === 'wrong' && !(rec && !rec.isCorrect)) return false;
        if (bankFilters.status === 'unanswered' && rec) return false;
      }
      return true;
    });
  }

  function renderBankDefault(fromCardId) {
    var bankContainer = document.getElementById('bankContainer');
    if (!bankContainer) return;

    if (fromCardId) {
      bankFilters = { chapter: '', cardId: fromCardId, type: '', status: 'wrong', search: '' };
    }

    var conf = SUBJECTS[currentSubject];
    var typeNames = { choice: '选择题', fill: '填空题', calculate: '计算题', shortAnswer: '简答题' };
    var typeFilters = [
      { v: '', l: '📝 题型：全部' }, { v: 'choice', l: '🔘 选择题' },
      { v: 'fill', l: '✏️ 填空题' }, { v: 'calculate', l: '🧮 计算题' },
      { v: 'shortAnswer', l: '📝 简答题' }
    ];
    var statusFilters = [
      { v: '', l: '全部' }, { v: 'correct', l: '正确' },
      { v: 'wrong', l: '错题' }, { v: 'unanswered', l: '未做' }
    ];

    var cardIds = [], seen = {};
    if (quizBank) {
      quizBank.forEach(function(q) {
        var cid = q.cardId || '';
        if (cid && !seen[cid]) { seen[cid] = true; cardIds.push(cid); }
      });
    }

    var filtered = getBankFilteredQuestions();
    var solvedSet = loadSolvedSet(currentSubject);

    // 错题统计
    var totalWrong = 0, totalSolved = 0;
    filtered.forEach(function(q) {
      var rec = getRecordForQuestion(q.id);
      if (rec && !rec.isCorrect) {
        totalWrong++;
        if (solvedSet[q.id]) totalSolved++;
      }
    });

    var html = '<div class="ss-bank-toolbar">' +
      (fromCardId ? '<button class="ss-bank-back">← 返回复盘</button>' : '') +
      '<select class="ss-bank-filter ss-bf-chapter" data-filter="chapter">' +
        '<option value="">📖 全部章节</option>' +
        conf.chapters.map(function(ch, i) {
          var val = '第' + (i + 1) + '章 ' + ch;
          return '<option value="' + esc(val) + '"' + (bankFilters.chapter === val ? ' selected' : '') + '>第' + (i + 1) + '章 ' + esc(ch) + '</option>';
        }).join('') +
      '</select>' +
      '<select class="ss-bank-filter ss-bf-kp" data-filter="cardId">' +
        '<option value="">📌 全部知识点</option>' +
        cardIds.map(function(cid) {
          return '<option value="' + esc(cid) + '"' + (bankFilters.cardId === cid ? ' selected' : '') + '>' + esc(cid) + '</option>';
        }).join('') +
      '</select>' +
      '<select class="ss-bank-filter ss-bf-type" data-filter="type">' +
        typeFilters.map(function(t) {
          return '<option value="' + t.v + '"' + (bankFilters.type === t.v ? ' selected' : '') + '>' + t.l + '</option>';
        }).join('') +
      '</select>' +
      '<select class="ss-bank-filter ss-bf-status" data-filter="status">' +
        statusFilters.map(function(s) {
          return '<option value="' + s.v + '"' + (bankFilters.status === s.v ? ' selected' : '') + '>📊 ' + s.l + '</option>';
        }).join('') +
      '</select>' +
      '<button class="ss-bank-search-btn' + (bankFilters.search ? ' ss-active' : '') + '" id="bankSearchBtn" title="搜索">🔍</button>' +
    '</div>' +
    '<div class="ss-bank-search-row' + (bankFilters.search ? ' ss-open' : '') + '" id="bankSearchRow">' +
      '<input class="ss-bank-search-input" type="text" placeholder="输入关键词搜索题干…" value="' + esc(bankFilters.search) + '" id="bankSearchInput">' +
      '<button class="ss-bank-search-close" id="bankSearchClose">✕</button>' +
    '</div>';

    html += '<div class="ss-bank-stats">' +
      '<span>共<b>' + filtered.length + '</b>题</span>' +
      '<span>错题<b>' + totalWrong + '</b></span>' +
      '<span>已解决<span class="ss-bank-stat-correct">' + totalSolved + '</span></span>' +
      '<span>待解决<span class="ss-bank-stat-wrong">' + (totalWrong - totalSolved) + '</span></span>' +
    '</div>';

    if (filtered.length === 0) {
      html += '<div class="ss-bank-empty">暂无符合条件的题目</div>';
    } else {
      // 全局题号导航
      var navHtml = '<div class="ss-bank-qnav">';
      filtered.forEach(function(q, qi) {
        var rec = getRecordForQuestion(q.id);
        var isWrong = rec && !rec.isCorrect;
        var isSolved = solvedSet[q.id];
        var navCls = isSolved ? 'ss-nav-btn ss-nav-solved' :
          isWrong ? 'ss-nav-btn ss-nav-wrong' :
          'ss-nav-btn';
        navHtml += '<button class="' + navCls + '" data-qid="' + esc(q.id) + '">' + (qi + 1) + '</button>';
      });
      navHtml += '</div>';
      html += navHtml;

      // 按知识点分组
      var groups = {};
      filtered.forEach(function(q) {
        var cid = q.cardId || '未分类';
        if (!groups[cid]) groups[cid] = [];
        groups[cid].push(q);
      });

      html += '<div class="ss-bank-groups">';
      Object.keys(groups).forEach(function(cid) {
        var qs = groups[cid];
        var gWrong = 0, gSolved = 0;
        qs.forEach(function(q) {
          var rec = getRecordForQuestion(q.id);
          if (rec && !rec.isCorrect) {
            gWrong++;
            if (solvedSet[q.id]) gSolved++;
          }
        });
        var isWeak = gWrong > 2 && gSolved < gWrong / 2;
        var isDone = gWrong > 0 && gSolved >= gWrong;

        html += '<div class="ss-bank-group' + (isWeak ? ' ss-bank-group-weak' : '') + (isDone ? ' ss-bank-group-done' : '') + '">' +
          '<div class="ss-bank-group-head">' +
            '<span class="ss-bank-group-name">' + (isWeak ? '⚠ ' : '') + esc(cid) + '</span>' +
            '<span class="ss-bank-group-stat">' +
              (gWrong > 0
                ? (isDone ? '✓' : gSolved + '/' + gWrong)
                : qs.length + '题') +
            '</span>' +
          '</div>' +
          '<div class="ss-bank-group-list">';

        qs.forEach(function(q, qi) {
          var rec = getRecordForQuestion(q.id);
          var isWrong = rec && !rec.isCorrect;
          var isCorrect = rec && rec.isCorrect;
          var isSolved = solvedSet[q.id];
          var statusBadge = isSolved ? '<span class="ss-q-status ss-q-solved">✓</span>' :
            isWrong ? '<span class="ss-q-status ss-q-wrong">✗</span>' :
            isCorrect ? '<span class="ss-q-status ss-q-correct">✓</span>' :
            '<span class="ss-q-status ss-q-unanswered">○</span>';
          var qType = typeNames[q.type] || '题目';

          html += '<div class="ss-q-card' + (isWrong ? ' ss-q-card-wrong' : '') + (isSolved ? ' ss-q-card-solved' : '') + '" data-qid="' + esc(q.id) + '">' +
            '<div class="ss-q-row">' +
              '<span class="ss-q-num">' + (qi + 1) + '</span>' +
              '<span class="ss-q-text">' + esc(q.question || '') +
                ' <span class="ss-q-type-inline">(' + qType + ')</span>' +
              '</span>' +
              '<span class="ss-q-right">' +
                statusBadge +
                (isSolved ? '' : '<button class="ss-q-reveal-btn" data-qid="' + esc(q.id) + '">显示答案</button>') +
              '</span>' +
            '</div>';

          if (q.options && q.options.length > 0) {
            html += '<div class="ss-q-options">';
            q.options.forEach(function(opt) {
              var letter = opt.charAt(0);
              html += '<div class="ss-q-option" data-opt="' + esc(letter) + '">' + esc(opt) + '</div>';
            });
            html += '</div>';
          }

          // 答案详情（默认隐藏）
          if (!isSolved) {
            var userAns = rec ? esc(rec.userAnswer || '(未作答)') : '(未作答)';
            var reasonVal = (rec && rec.wrongReason) ? rec.wrongReason : '';

            html += '<div class="ss-q-detail" id="detail-' + esc(q.id) + '" style="display:none;">' +
              '<div class="ss-q-dl"><span class="ss-q-dl-label">答案</span><span class="ss-q-ans-c">' + esc(q.answer || '') + '</span></div>' +
              (q.explanation ? '<div class="ss-q-dl"><span class="ss-q-dl-label">解析</span><span class="ss-q-expl-inline">' + esc(q.explanation) + '</span></div>' : '') +
              '<div class="ss-q-dl"><span class="ss-q-dl-label">我的答案</span><span class="ss-q-ans-u' + (isWrong ? ' wrong' : '') + '">' + userAns + '</span></div>' +
              (isWrong ?
                '<div class="ss-q-dl"><span class="ss-q-wr-label">答错原因</span>' +
                '<input class="ss-q-wr-input" type="text" data-qid="' + esc(q.id) + '" placeholder="…" value="' + esc(reasonVal) + '">' +
                '<button class="ss-q-solve-btn" data-qid="' + esc(q.id) + '">✓已掌握</button></div>' : '') +
            '</div>';
          }

          html += '</div>';
        });

        html += '</div></div>';
      });
      html += '</div>';
    }

    bankContainer.innerHTML = html;
    bindBankEvents();
  }

  function bindBankEvents() {
    document.querySelectorAll('.ss-bank-filter').forEach(function(sel) {
      sel.addEventListener('change', function() {
        bankFilters[this.dataset.filter] = this.value;
        renderBankDefault();
      });
    });
    // 搜索按钮：点击展开/收起
    var searchBtn = document.getElementById('bankSearchBtn');
    var searchRow = document.getElementById('bankSearchRow');
    var searchInput = document.getElementById('bankSearchInput');
    if (searchBtn && searchRow) {
      searchBtn.addEventListener('click', function() {
        var isOpen = searchRow.classList.toggle('ss-open');
        searchBtn.classList.toggle('ss-active', isOpen);
        if (isOpen && searchInput) searchInput.focus();
      });
    }
    if (searchInput) {
      var stimer = null;
      searchInput.addEventListener('input', function() {
        bankFilters.search = this.value;
        if (stimer) clearTimeout(stimer);
        stimer = setTimeout(function() { renderBankDefault(); }, 300);
      });
    }
    var searchClose = document.getElementById('bankSearchClose');
    if (searchClose && searchInput) {
      searchClose.addEventListener('click', function() {
        bankFilters.search = '';
        renderBankDefault();
      });
    }
    // 显示/隐藏答案
    document.querySelectorAll('.ss-q-reveal-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var qid = this.dataset.qid;
        var detail = document.getElementById('detail-' + qid);
        if (!detail) return;
        var card = this.closest('.ss-q-card');
        if (detail.style.display === 'none') {
          detail.style.display = 'block';
          this.textContent = '收起';
          var q = quizBank.find(function(x) { return x.id === qid; });
          var rec = getRecordForQuestion(qid);
          if (q && q.answer && card) {
            var c = card.querySelector('[data-opt="' + q.answer.charAt(0) + '"]');
            if (c) c.classList.add('ss-q-opt-correct');
          }
          if (rec && rec.userAnswer && card) {
            var u = card.querySelector('[data-opt="' + rec.userAnswer.charAt(0) + '"]');
            if (u) u.classList.add(rec.isCorrect ? 'ss-q-opt-correct' : 'ss-q-opt-wrong');
          }
        } else {
          detail.style.display = 'none';
          this.textContent = '显示答案';
          if (card) {
            card.querySelectorAll('.ss-q-opt-correct, .ss-q-opt-wrong').forEach(function(el) {
              el.classList.remove('ss-q-opt-correct', 'ss-q-opt-wrong');
            });
          }
        }
      });
    });
    // 标记已掌握
    document.querySelectorAll('.ss-q-solve-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var qid = this.dataset.qid;
        var solvedSet = loadSolvedSet(currentSubject);
        solvedSet[qid] = true;
        saveSolvedSet(currentSubject, solvedSet);
        renderBankDefault();
      });
    });
    // 题号导航
    document.querySelectorAll('.ss-nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var qid = this.dataset.qid;
        var card = document.querySelector('.ss-q-card[data-qid="' + qid.replace(/"/g, '\\"') + '"]');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('ss-q-card-flash');
          setTimeout(function() { card.classList.remove('ss-q-card-flash'); }, 1500);
        }
      });
    });
    // 错因输入
    document.querySelectorAll('.ss-q-wr-input').forEach(function(inp) {
      var wrTimer = null;
      inp.addEventListener('input', function() {
        var qid = this.dataset.qid;
        var reason = this.value;
        if (wrTimer) clearTimeout(wrTimer);
        wrTimer = setTimeout(function() {
          fetch(apiUrl('/api/quiz-wrong-reason'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: currentSubject, questionId: qid, wrongReason: reason })
          });
          if (quizRecords) {
            for (var i = quizRecords.length - 1; i >= 0; i--) {
              if (quizRecords[i].questionId === qid) { quizRecords[i].wrongReason = reason; break; }
            }
          }
        }, 500);
      });
    });
  }

  function showWrongQuestions(cardId) {
    renderBankDefault(cardId);
    switchFeature('bank', true);
  }

  // ============ 加载所有数据并渲染 ============
  function loadAllAndRender() {
    var conf = SUBJECTS[currentSubject];
    var nameEl = document.getElementById('subjectName');
    if (nameEl) nameEl.textContent = conf.name;
    document.title = conf.name + ' · 章节复盘';

    Promise.all([
      fetch(apiUrl('/data/' + conf.kfFile), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
      fetch(apiUrl('/api/quiz-records?subject=' + currentSubject), { cache: 'no-cache' }).then(function(r) { return r.json(); }),
      fetch(apiUrl('/api/quiz-bank?subject=' + currentSubject), { cache: 'no-cache' }).then(function(r) { return r.json(); })
    ]).then(function(res) {
      kfData = res[0];
      quizRecords = Array.isArray(res[1]) ? res[1] : [];
      quizBank = Array.isArray(res[2]) ? res[2] : [];
      renderChapters();
      loadReviewInsight();
    }).catch(function(err) {
      document.getElementById("chapterList").innerHTML =
        '<div class="ss-error-box">⚠️ 数据加载失败：' + esc(err.message || '') + '</div>';
    });
  }

  function loadReviewInsight() {
    var container = document.getElementById("reviewInsight");
    if (!container) return;
    var total = quizRecords ? quizRecords.length : 0;
    var wrong = quizRecords ? quizRecords.filter(function(r) { return r && r.isCorrect === false; }).length : 0;
    var correctRate = total > 0 ? Math.round((total - wrong) / total * 100) : 0;

    if (total === 0) {
      container.innerHTML = '<div class="ss-insight-bar">' +
        '<div class="ss-insight-stats">' +
          '<span class="ss-insight-stat"><span class="ss-insight-num accent">' + total + '</span> <span class="ss-insight-label">总答题</span></span>' +
          '<span class="ss-insight-divider"></span>' +
          '<span class="ss-insight-stat"><span class="ss-insight-num green">—</span> <span class="ss-insight-label">正确率</span></span>' +
          '<span class="ss-insight-divider"></span>' +
          '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + wrong + '</span> <span class="ss-insight-label">错题</span></span>' +
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
        '<span class="ss-insight-stat"><span class="ss-insight-num coral">' + wrong + '</span> <span class="ss-insight-label">错题</span></span>' +
      '</div>' +
    '</div>';
  }

  // ============ Tab 切换（两个Tab：章节复盘 + 题库管理） ============
  var currentFeature = 'review';
  function switchFeature(feature, skipBankRender) {
    currentFeature = feature;
    document.querySelectorAll('.ss-feature-tab').forEach(function(t) {
      t.classList.toggle('zk-active', t.dataset.feature === feature);
    });
    document.querySelectorAll('.ss-feature-panel').forEach(function(p) {
      p.classList.toggle('zk-active', p.dataset.feature === feature);
    });
    if (feature === 'bank' && !skipBankRender) renderBankDefault();
  }

  // ============ 全局重置 ============
  function resetCurrent() {
    var conf = SUBJECTS[currentSubject];
    if (!confirm("确定要清空「" + conf.name + "」的全部复盘内容和错题解决标记吗？\n（概念掌握状态不受影响，由知识框架页管理）")) return;
    try { localStorage.removeItem(conf.reviewKey); } catch (e) {}
    expandedChapters = {};
    renderChapters();
  }

  // ============ 初始化 ============
  function init() {
    // Tab切换
    document.querySelectorAll('.ss-feature-tab').forEach(function(t) {
      t.addEventListener('click', function() { switchFeature(t.dataset.feature); });
    });
    // 重置按钮
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetCurrent);
    // 题库管理Tab返回按钮（事件委托）
    var bankContainer = document.getElementById('bankContainer');
    if (bankContainer) {
      bankContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('ss-bank-back')) switchFeature('review');
      });
    }

    loadAllAndRender();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
