/**
 * quiz-helpers.js — 共享渲染 helpers
 * 纯 HTML 生成函数，不依赖页面状态，不处理事件
 * 练习测验和真题练习共同引用
 * 统一使用 exam-question 样式
 */
(function (global) {
  'use strict';

  var QuizHelpers = {};

  /* HTML 转义 */
  function esc(s) {
    if (typeof QuizUtils !== 'undefined' && QuizUtils.esc) return QuizUtils.esc(s);
    s = String(s == null ? '' : s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  QuizHelpers.esc = esc;

  /* 渲染内容：支持 svg: 前缀、img: 前缀、纯文本 */
  QuizHelpers.renderContent = function (s) {
    s = String(s || '');
    s = s.replace(/^[A-H]\.\s*/, '');
    if (s.indexOf('svg:') === 0) return s.slice(4);
    if (s.indexOf('img:') === 0) return '<img src="' + s.slice(4) + '" style="max-width:100%;border-radius:6px;display:block;margin:4px 0" />';
    if (typeof AIChat !== 'undefined' && AIChat.formatText) return AIChat.formatText(s);
    return esc(s).replace(/\n/g, '<br>');
  };

  /* 掌握程度映射 */
  QuizHelpers.levelText = function (level) {
    if (level === 'mastered') return { text: '已掌握', icon: '🟢', cls: 'mastered' };
    if (level === 'unsure') return { text: '不熟练', icon: '🟡', cls: 'unsure' };
    return { text: '不会', icon: '🔴', cls: 'unknown' };
  };

  /* 来源标签 */
  var SRC_LABELS = {
    'ai': '',
    '教材例题': '教材',
    '章节练习题': '章节',
    '复习资料': '复习',
    'exam': '真题',
    'practice': ''
  };
  QuizHelpers.SRC_LABELS = SRC_LABELS;

  QuizHelpers.renderSrcTag = function (src) {
    var label = SRC_LABELS[src];
    if (!label) return '';
    return '<span class="exam-badge exam-badge-src src-' + (src || 'default') + '">' + esc(label) + '</span>';
  };

  /* 答案行（四行缩进布局） */
  QuizHelpers.answerRow = function (label, labelClass, content) {
    var formatted = content;
    if (typeof content === 'string') {
      if (typeof AIChat !== 'undefined' && AIChat.formatText) formatted = AIChat.formatText(content);
      else formatted = esc(content);
    }
    return '<div class="exam-answer-row">' +
      '<span class="exam-answer-label exam-label-' + labelClass + '">' + label + '</span>' +
      '<span class="exam-answer-text">' + formatted + '</span>' +
      '</div>';
  };

  /* 参考答案（支持证明题数组） */
  QuizHelpers.renderReference = function (label, content, isProof) {
    if (!content) return '';
    if (isProof && Array.isArray(content)) {
      var lines = content.map(function (line) {
        if (line === '') return '<br>';
        if (line.indexOf('步骤') >= 0 || line.indexOf('结论') >= 0)
          return '<div class="exam-proof-step">' + esc(line) + '</div>';
        return '<div>' + esc(line) + '</div>';
      }).join('');
      return '<div class="exam-answer-row"><span class="exam-answer-label exam-label-info">' + esc(label) + '</span><span class="exam-answer-text">' + lines + '</span></div>';
    }
    return QuizHelpers.answerRow(label, 'info', content);
  };

  /* 用户答案行 */
  QuizHelpers.renderUserAnswer = function (answer) {
    if (!answer || answer === '照片提交') return '';
    return QuizHelpers.answerRow('我的答案', 'mine', answer);
  };

  /* 分数行 */
  QuizHelpers.renderScoreHeader = function (score, total, level, passThreshold, selfOverride) {
    var olt = QuizHelpers.levelText(level);
    var detail = '得分 ' + score + '/' + total;
    if (passThreshold) detail += '（通过线 ' + passThreshold + '）';
    if (selfOverride) detail += ' · 自评覆盖';
    return '<div class="exam-answer-row">' +
      '<span class="exam-answer-label exam-label-' + olt.cls + '">' + olt.icon + ' ' + olt.text + '</span>' +
      '<span class="exam-answer-text">' + esc(detail) + '</span>' +
      '</div>';
  };

  /* 错因区域 */
  QuizHelpers.renderWrongReason = function (reason, qId) {
    var existing = reason || '';
    var html = '';
    if (existing) {
      html += '<div class="exam-answer-row">' +
        '<span class="exam-answer-label exam-label-reason">错因</span>' +
        '<span class="exam-answer-text">' + esc(existing) + '</span>' +
        '<span class="exam-link-btn" data-action="toggle-wr-edit" data-id="' + qId + '">编辑</span>' +
        '</div>';
    } else {
      html += '<div class="exam-answer-row">' +
        '<span class="exam-answer-label exam-label-reason">错因</span>' +
        '<span class="exam-link-btn" data-action="toggle-wr-edit" data-id="' + qId + '">写错因</span>' +
        '</div>';
    }
    html += '<div class="exam-wr-editor" id="wr-edit-' + qId + '" style="display:none">' +
      '<textarea class="exam-wr-textarea" id="wr-input-' + qId + '" placeholder="记录错因：概念混淆？公式没记住？计算失误？" rows="3">' + esc(existing) + '</textarea>' +
      '<span class="exam-link-btn exam-link-submit" data-action="save-wr" data-id="' + qId + '">保存</span>' +
      '<span class="exam-link-btn" data-action="cancel-wr" data-id="' + qId + '">取消</span>' +
      '</div>';
    return html;
  };

  /* 自评三档 */
  QuizHelpers.renderSelfEval = function (level, qId, label) {
    return '<div class="exam-self-eval">' +
      '<span class="exam-self-eval-label">' + esc(label) + '</span>' +
      '<span class="exam-link-btn ' + (level === 'mastered' ? 'is-selected' : '') + '" data-action="self-assess" data-id="' + qId + '" data-level="mastered">完全掌握</span>' +
      '<span class="exam-link-btn ' + (level === 'unsure' ? 'is-selected' : '') + '" data-action="self-assess" data-id="' + qId + '" data-level="unsure">部分掌握</span>' +
      '<span class="exam-link-btn ' + (level === 'unknown' ? 'is-selected' : '') + '" data-action="self-assess" data-id="' + qId + '" data-level="unknown">不会</span>' +
      '</div>';
  };

  /* 加入错题库按钮（独立于提交状态，内联） */
  QuizHelpers.renderMarkedBtn = function (qId, marked) {
    return '<span class="exam-link-btn exam-link-marked ' + (marked ? 'is-selected' : '') + '" data-action="toggle-marked" data-id="' + qId + '">' +
      (marked ? '已加入错题库' : '加入错题库') + '</span>';
  };

  /* 特殊符号面板（仅 div，按钮在 renderActions 中） */
  QuizHelpers.SYMBOLS = ['×','÷','=','≠','≈','≤','≥','<','>','±','²','³','ⁿ','√','π','Σ','∞','%','①','②','③','④','⑤','⑥','⑦','⑧','α','β','γ','δ','θ','λ','μ','σ','φ','ψ','ω','Δ','¬','∧','∨','→','↔','⊕','⊢','⇔','∀','∃','∈','∪','∩','⊆','⊇','∅','≡','P','Q','R','S','T','F','0','1'];

  QuizHelpers.renderSymbolPalette = function (qId) {
    return '<div class="exam-symbol-palette" id="sym-' + qId + '" style="display:none">' +
      QuizHelpers.SYMBOLS.map(function (s) {
        return '<button type="button" class="exam-symbol-btn" data-action="insert-symbol" data-id="' + qId + '" data-symbol="' + s + '">' + s + '</button>';
      }).join('') +
      '</div>';
  };

  /* 拍照上传（仅 input，按钮在 renderActions 中） */
  QuizHelpers.renderPhotoUpload = function (qId) {
    return '<input type="file" accept="image/*" capture="environment" id="photo-input-' + qId + '" style="display:none" data-action="upload-photo" data-id="' + qId + '"/>';
  };

  /* 拍照缩略图 */
  QuizHelpers.renderPhoto = function (photo) {
    if (!photo) return '';
    return '<div class="exam-photo"><div class="exam-photo-label">我的拍照</div>' +
      '<img src="' + photo + '" class="exam-photo-img" data-action="open-photo"/></div>';
  };

  /* ====== 共享常量 ====== */
  QuizHelpers.TYPE_LABEL = {
    choice: '选择题', fill: '填空题', calculate: '计算题',
    shortAnswer: '简答题', essay: '论述题', proof: '证明题'
  };

  QuizHelpers.STATUS_LABEL = {
    correct: '正确', wrong: '错误', pending: '待评'
  };

  /* ====== 内部辅助：徽章行 ====== */
  function renderBadges(q, r, opts) {
    var badges = '';
    if (opts.showYear && q.year) {
      badges += '<span class="exam-badge exam-badge-year">' + esc(q.year) + '</span>';
    }
    var typeLabel = QuizHelpers.TYPE_LABEL[q.type] || q.type || '';
    var subLabel = opts.subType === 'multi' ? '（多选）' : opts.subType === 'judge' ? '（判断）' : '';
    badges += '<span class="exam-badge exam-badge-type">' + typeLabel + subLabel + '</span>';
    if (q.chapter) {
      badges += '<span class="exam-badge exam-badge-chapter">' + esc(q.chapter) + '</span>';
    }
    if (q.cardId) {
      badges += '<span class="exam-badge exam-badge-card">' + esc(q.cardId) + '</span>';
    }
    badges += QuizHelpers.renderSrcTag(q.src);
    if (r) {
      var status = r.isCorrect ? 'correct' : 'wrong';
      badges += '<span class="exam-badge exam-badge-' + status + '">' + QuizHelpers.STATUS_LABEL[status] + '</span>';
    }
    return badges;
  }

  /* ====== 内部辅助：操作按钮行 ====== */
  function renderActions(q, r, opts) {
    var actions = '<div class="exam-q-actions">';
    if (!r) {
      var submitAction = q.type === 'choice' ? 'submit-choice' : q.type === 'fill' ? 'submit-fill' : 'submit-text';
      actions += '<span class="exam-link-btn exam-link-submit" data-action="' + submitAction + '" data-id="' + q.id + '">提交</span>';
    }
    actions += '<span class="exam-link-btn exam-link-ai" data-action="ai-help" data-id="' + q.id + '">AI解答</span>';
    if (opts.showAIGen && q.src !== 'ai') {
      actions += '<span class="exam-link-btn exam-link-gen" data-action="ai-gen" data-id="' + q.id + '">AI出题</span>';
    }
    if (opts.showSymbol) {
      actions += '<span class="exam-link-btn" data-action="toggle-symbols" data-id="' + q.id + '">特殊符号</span>';
    }
    if (opts.getPhoto) {
      var hasPhoto = !!opts.getPhoto(q.id);
      var btnText = r ? (hasPhoto ? '重拍' : '拍照上传') : '拍照上传';
      actions += '<input type="file" accept="image/*" capture="environment" id="photo-input-' + q.id + '" style="display:none" data-action="upload-photo" data-id="' + q.id + '"/>';
      actions += '<span class="exam-link-btn" data-action="take-photo" data-id="' + q.id + '">' + btnText + '</span>';
    }
    if (r) {
      actions += '<span class="exam-link-btn exam-link-redo" data-action="redo" data-id="' + q.id + '">重做</span>';
    }
    if (opts.marked !== undefined) {
      actions += QuizHelpers.renderMarkedBtn(q.id, opts.marked);
    }
    if (opts.history && opts.history.length > 1) {
      actions += '<span class="exam-link-btn exam-link-history" data-action="toggle-history" data-id="' + q.id + '">往期答案(' + opts.history.length + ')</span>';
    }
    var hasAnswer = r || q.referenceAnswer || q.referenceProof || q.answer || (q.steps && q.steps.length);
    if (hasAnswer) {
      actions += '<span class="exam-link-btn" data-action="toggle-ref" data-id="' + q.id + '">' + (opts.expanded !== false ? '收起' : '展开答案') + '</span>';
    }
    actions += '</div>';
    return actions;
  }

  /* ====== 内部辅助：答案区壳 ====== */
  function renderAnswerArea(q, r, opts, content) {
    if (!content) return '';
    var style = opts.expanded === false ? ' style="display:none;"' : '';
    return '<div class="exam-q-answer"' + style + '>' + content + '</div>';
  }

  /* ====== 内部辅助：外壳 ====== */
  function renderShell(q, r, opts, bodyHTML, answerHTML) {
    var historyHTML = QuizHelpers.renderHistoryPanel(opts.history, q.id);
    return '<div class="exam-question" id="card-' + q.id + '" data-qid="' + q.id + '">' +
      '<div class="exam-q-header">' + renderBadges(q, r, opts) + '</div>' +
      '<div class="exam-q-title">' + QuizHelpers.renderContent(q.question || '') + '</div>' +
      (q.image ? '<div class="exam-q-image"><img src="' + q.image + '" alt="题目图形" loading="lazy" /></div>' : '') +
      bodyHTML +
      renderActions(q, r, opts) +
      (answerHTML || '') +
      historyHTML +
      '</div>';
  }

  /* ====== 选择题 ====== */
  QuizHelpers.renderChoiceCard = function (q, r, opts) {
    opts = opts || {};
    var letters = 'ABCDEFGH';
    var selected = opts.selected || '';

    var optionsHTML = (q.options || []).map(function (opt, i) {
      var letter = letters[i];
      var cls = 'exam-q-option';
      if (r) {
        var correctAns = (r.details && r.details.correctAnswer) || q.answer || '';
        var userAns = (r.details && r.details.userAnswer) || '';
        if (correctAns.indexOf(letter) >= 0) cls += ' is-correct';
        else if (userAns.indexOf(letter) >= 0) cls += ' is-wrong';
      } else {
        cls += ' exam-option-clickable';
        if (selected.indexOf(letter) >= 0) cls += ' is-selected';
      }
      return '<div class="' + cls + '" data-letter="' + letter + '" data-qid="' + q.id + '"' +
        (r ? '' : ' data-action="select-option"') + '>' +
        '<span class="exam-option-letter">' + letter + '</span> ' +
        QuizHelpers.renderContent(opt) + '</div>';
    }).join('');

    var bodyHTML = '<div class="exam-q-options">' + optionsHTML + '</div>';

    var answerContent = '';
    if (r) {
      if (r.details && r.details.userAnswer) {
        answerContent += QuizHelpers.answerRow('我的答案', 'mine', r.details.userAnswer);
      }
      answerContent += QuizHelpers.answerRow('答案', 'correct', q.answer || '');
      if (q.explanation) answerContent += QuizHelpers.answerRow('解析', 'info', q.explanation);
      if (!r.isCorrect) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    } else if (q.src === 'textbook' && q.referenceAnswer) {
      answerContent += QuizHelpers.answerRow('参考答案', 'correct', q.referenceAnswer);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 填空题 ====== */
  QuizHelpers.renderFillCard = function (q, r, opts) {
    opts = opts || {};
    var hasDetails = r && r.details && r.details.hits;

    var blanksHTML = (q.blanks || []).map(function (b, i) {
      var bAns = (typeof b === 'string') ? b : (b.answer || '');
      var bHint = (typeof b === 'string') ? '' : (b.hint || '');
      var inputVal = '';
      var inputCls = '';
      var resultHTML = '';
      if (!r) {
        inputVal = '';
      }
      return '<div class="exam-fill-row">' +
        '<span class="exam-fill-label">空' + (i + 1) + '</span>' +
        '<input type="text" class="exam-fill-input' + inputCls + '" data-blank-id="' + q.id + '" data-blank-idx="' + i + '" placeholder="' + esc(bHint || '填入答案...') + '" value="' + esc(inputVal) + '"' + (r ? ' disabled' : '') + '>' +
        resultHTML + '</div>';
    }).join('');

    var bodyHTML = '';
    if (!r) {
      bodyHTML = '<div class="exam-fill-inputs">' + blanksHTML + '</div>';
      if (opts.showSymbol) bodyHTML += QuizHelpers.renderSymbolPalette(q.id);
    }

    var answerContent = '';
    if (r) {
      if (hasDetails) {
        answerContent += r.details.hits.map(function (h) {
          return '<div class="exam-answer-row">' +
            '<span class="exam-answer-label exam-label-mine">空' + (h.idx + 1) + '</span>' +
            '<span class="exam-answer-text">' + esc(h.userAnswer || '(空)') + ' ' + (h.matched ? '✅' : '❌') + '</span>' +
            '</div>';
        }).join('');
      }
      var blankAns = (q.blanks || []).map(function (b) { return (typeof b === 'string') ? b : (b.answer || ''); }).join(' | ');
      answerContent += QuizHelpers.answerRow('答案', 'correct', blankAns);
      if (q.explanation) answerContent += QuizHelpers.answerRow('解析', 'info', q.explanation);
      if (!r.isCorrect) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 计算题 ====== */
  QuizHelpers.renderCalculateCard = function (q, r, opts) {
    opts = opts || {};
    var photo = opts.getPhoto ? opts.getPhoto(q.id) : null;

    var bodyHTML = '';
    if (q.hint) bodyHTML += '<div class="exam-hint">提示：' + esc(q.hint) + '</div>';
    bodyHTML += '<textarea class="exam-q-input" data-input-id="' + q.id + '" placeholder="输入计算结果..."' + (r ? ' disabled' : '') + '></textarea>';
    if (opts.showSymbol) bodyHTML += QuizHelpers.renderSymbolPalette(q.id);
    bodyHTML += QuizHelpers.renderPhotoUpload(q.id);

    var answerContent = '';
    if (r) {
      answerContent += QuizHelpers.renderScoreHeader(r.score, r.total, r.selfOverride || r.level, q.passThreshold, r.selfOverride);
      if (photo) answerContent += QuizHelpers.renderPhoto(photo);
      if (r.details && r.details.userAnswer) answerContent += QuizHelpers.renderUserAnswer(r.details.userAnswer);
      if (q.formula) answerContent += QuizHelpers.answerRow('公式', 'info', q.formula);
      if (q.steps && q.steps.length) {
        answerContent += '<div class="exam-steps"><ol>' + q.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
      }
      if (q.answer) answerContent += QuizHelpers.answerRow('答案', 'correct', q.answer);
      answerContent += QuizHelpers.renderSelfEval(r.selfOverride || r.level, q.id, '计算题自动评分可能有误差，你觉得实际掌握了吗？');
      if (r.score < (r.total || 1)) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    } else if (q.answer || q.steps || q.formula) {
      if (q.formula) answerContent += QuizHelpers.answerRow('公式', 'info', q.formula);
      if (q.steps && q.steps.length) {
        answerContent += '<div class="exam-steps"><ol>' + q.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
      }
      if (q.answer) answerContent += QuizHelpers.answerRow('答案', 'correct', q.answer);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 简答题 ====== */
  QuizHelpers.renderShortAnswerCard = function (q, r, opts) {
    opts = opts || {};

    var bodyHTML = '<textarea class="exam-q-input" data-input-id="' + q.id + '" placeholder="输入你的答案..."' + (r ? ' disabled' : '') + '></textarea>';
    if (opts.showSymbol) bodyHTML += QuizHelpers.renderSymbolPalette(q.id);

    var answerContent = '';
    if (r) {
      answerContent += QuizHelpers.renderScoreHeader(r.score, r.total, r.selfOverride || r.level, q.passThreshold, r.selfOverride);
      if (r.details && r.details.userAnswer) answerContent += QuizHelpers.renderUserAnswer(r.details.userAnswer);
      if (r.details && r.details.hits) {
        answerContent += '<ul class="exam-points-list">' + renderPointsHTML(r.details.hits) + '</ul>';
      }
      answerContent += QuizHelpers.renderReference('参考答案', q.referenceAnswer || q.answer);
      answerContent += QuizHelpers.renderSelfEval(r.selfOverride || r.level, q.id, '简答题评分仅供参考，你觉得实际掌握了吗？');
      if (r.score < (r.total || 1)) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    } else if (q.referenceAnswer || q.answer) {
      answerContent += QuizHelpers.renderReference('参考答案', q.referenceAnswer || q.answer);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 论述题 ====== */
  QuizHelpers.renderEssayCard = function (q, r, opts) {
    opts = opts || {};

    var bodyHTML = '';
    if (q.hint) bodyHTML += '<div class="exam-hint">提示：' + esc(q.hint) + '</div>';
    bodyHTML += '<textarea class="exam-q-input lg" data-input-id="' + q.id + '" placeholder="输入你的论述...（建议 200-400 字）"' + (r ? ' disabled' : '') + '></textarea>';
    if (opts.showSymbol) bodyHTML += QuizHelpers.renderSymbolPalette(q.id);

    var answerContent = '';
    if (r) {
      answerContent += QuizHelpers.renderScoreHeader(r.score, r.total, r.selfOverride || r.level, q.passThreshold, r.selfOverride);
      if (r.details && r.details.userAnswer) answerContent += QuizHelpers.renderUserAnswer(r.details.userAnswer);
      if (r.details && r.details.hits) {
        answerContent += '<ul class="exam-points-list">' + renderPointsHTML(r.details.hits) + '</ul>';
      }
      answerContent += QuizHelpers.renderReference('参考答案', q.referenceAnswer || q.answer);
      answerContent += QuizHelpers.renderSelfEval(r.selfOverride || r.level, q.id, '论述题主观性较强，系统评分仅供参考。你觉得实际掌握了吗？');
      if (r.score < (r.total || 1)) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    } else if (q.referenceAnswer || q.answer) {
      answerContent += QuizHelpers.renderReference('参考答案', q.referenceAnswer || q.answer);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 证明题 ====== */
  QuizHelpers.renderProofCard = function (q, r, opts) {
    opts = opts || {};
    var photo = opts.getPhoto ? opts.getPhoto(q.id) : null;

    var bodyHTML = '';
    if (q.method) {
      bodyHTML += '<div class="exam-method-box"><div class="exam-method-label">规定证明方法：' + esc(q.method) + '</div>' +
        (q.methodHint ? '<div class="exam-method-hint">' + esc(q.methodHint) + '</div>' : '') + '</div>';
    }
    bodyHTML += '<textarea class="exam-q-input xl" data-input-id="' + q.id + '" placeholder="按上述方法写出证明过程..."' + (r ? ' disabled' : '') + '></textarea>';
    if (opts.showSymbol) bodyHTML += QuizHelpers.renderSymbolPalette(q.id);
    bodyHTML += QuizHelpers.renderPhotoUpload(q.id);

    var answerContent = '';
    if (r) {
      answerContent += QuizHelpers.renderScoreHeader(r.score, r.total, r.selfOverride || r.level, q.passThreshold, r.selfOverride);
      if (photo) answerContent += QuizHelpers.renderPhoto(photo);
      if (r.details && r.details.userAnswer) answerContent += QuizHelpers.renderUserAnswer(r.details.userAnswer);
      if (r.details && r.details.hits) {
        var stepsHTML = r.details.hits.map(function (h) {
          return '<li class="exam-point-item ' + (h.matched ? 'hit' : 'miss') + '">' +
            '<span class="exam-point-icon">' + (h.matched ? '✅' : '⬜') + '</span>' +
            '<span class="exam-point-text">' + esc(h.desc) +
            (h.matched && h.matchedTerm ? ' <span class="exam-match-hint">（命中：' + esc(h.matchedTerm) + '）</span>' : '') +
            (!h.matched ? '<div class="exam-point-desc">期望关键词：' + (h.keywords || []).slice(0, 3).map(esc).join('、') + '…</div>' : '') +
            '</span></li>';
        }).join('');
        answerContent += '<ul class="exam-points-list">' + stepsHTML + '</ul>';
      }
      answerContent += QuizHelpers.renderReference('参考证明（' + (q.method || '') + '）', q.referenceProof, true);
      answerContent += QuizHelpers.renderSelfEval(r.selfOverride || r.level, q.id, '证明题路径不唯一，系统只检查关键步骤。你觉得实际掌握了吗？');
      if (r.score < (r.total || 1)) answerContent += QuizHelpers.renderWrongReason(r.wrongReason, q.id);
    } else if (q.referenceProof) {
      answerContent += QuizHelpers.renderReference('参考证明（' + (q.method || '') + '）', q.referenceProof, true);
    }

    return renderShell(q, r, opts, bodyHTML, renderAnswerArea(q, r, opts, answerContent));
  };

  /* ====== 内部辅助：要点列表 HTML ====== */
  function renderPointsHTML(hits) {
    return hits.map(function (h) {
      var synHTML = h.synonyms && h.synonyms.length > 0
        ? '<div class="exam-synonyms">同义词：' + h.synonyms.map(function (s) {
            return '<span class="' + (h.matchedTerm === s ? 'match' : '') + '">' + esc(s) + '</span>';
          }).join('、') + '</div>'
        : '';
      return '<li class="exam-point-item ' + (h.matched ? 'hit' : 'miss') + '">' +
        '<span class="exam-point-icon">' + (h.matched ? '✅' : '⬜') + '</span>' +
        '<span class="exam-point-text">' + esc(h.point) +
        (h.matched && h.matchedTerm && h.matchedTerm !== h.point ? ' <span class="exam-match-hint">（命中：' + esc(h.matchedTerm) + '）</span>' : '') +
        synHTML + '</span></li>';
    }).join('');
  }

  /* ====== 统一分发器 ====== */
  QuizHelpers.renderCard = function (q, r, opts) {
    opts = opts || {};
    switch (q.type) {
      case 'choice':
        return QuizHelpers.renderChoiceCard(q, r, opts);
      case 'fill':
        return QuizHelpers.renderFillCard(q, r, opts);
      case 'calculate':
        return QuizHelpers.renderCalculateCard(q, r, opts);
      case 'shortAnswer':
        return QuizHelpers.renderShortAnswerCard(q, r, opts);
      case 'essay':
        return QuizHelpers.renderEssayCard(q, r, opts);
      case 'proof':
        return QuizHelpers.renderProofCard(q, r, opts);
      default:
        return '<div class="exam-question">未知题型: ' + (q.type || '') + '</div>';
    }
  };



  /* ====== 共享判分函数 ====== */

  function normalize(str) {
    if (!str) return '';
    return str.replace(/\s+/g, '').replace(/[，。、；：""''（）\(\)\[\]\{\}]/g, '').toLowerCase();
  }
  QuizHelpers.normalize = normalize;

  function getLevel(score, total, passThreshold) {
    if (score >= passThreshold) return 'mastered';
    if (score >= Math.ceil(passThreshold * 0.5)) return 'unsure';
    return 'unknown';
  }
  QuizHelpers.getLevel = getLevel;

  QuizHelpers.scoreChoice = function (q, userSelection) {
    var correct = q.answer;
    var isCorrect = false;
    if (q.subType === 'multi') {
      var userSet = (userSelection || '').split('').sort().join('');
      var correctSet = correct.split('').sort().join('');
      isCorrect = userSet === correctSet;
    } else {
      isCorrect = userSelection === correct;
    }
    return {
      score: isCorrect ? 1 : 0, total: 1,
      level: isCorrect ? 'mastered' : 'unknown',
      details: { isCorrect: isCorrect, userAnswer: userSelection, correctAnswer: correct }
    };
  };

  QuizHelpers.scoreFill = function (q, userAnswers) {
    userAnswers = userAnswers || [];
    var hits = [], hitCount = 0;
    if (q.unordered) {
      var usedUserIdx = {};
      (q.blanks || []).forEach(function (b, blankIdx) {
        var bAns = (typeof b === 'string') ? b : (b.answer || '');
        var bSyn = (typeof b === 'string') ? [] : (b.synonyms || []);
        var allTerms = [bAns].concat(bSyn);
        var matched = false;
        var matchedUserIdx = -1;
        for (var k = 0; k < userAnswers.length; k++) {
          if (usedUserIdx[k]) continue;
          var ua = normalize(userAnswers[k] || '');
          for (var j = 0; j < allTerms.length; j++) {
            if (ua.indexOf(normalize(allTerms[j])) >= 0) { matched = true; matchedUserIdx = k; break; }
          }
          if (matched) break;
        }
        if (matched) usedUserIdx[matchedUserIdx] = true;
        hits.push({ idx: blankIdx, userAnswer: userAnswers[matchedUserIdx] || '', correctAnswer: bAns, matched: matched });
        if (matched) hitCount++;
      });
    } else {
      (q.blanks || []).forEach(function (b, i) {
        var bAns = (typeof b === 'string') ? b : (b.answer || '');
        var bSyn = (typeof b === 'string') ? [] : (b.synonyms || []);
        var ua = normalize(userAnswers[i] || '');
        var allTerms = [bAns].concat(bSyn);
        var matched = false;
        for (var j = 0; j < allTerms.length; j++) {
          if (ua.indexOf(normalize(allTerms[j])) >= 0) { matched = true; break; }
        }
        hits.push({ idx: i, userAnswer: userAnswers[i] || '', correctAnswer: bAns, matched: matched });
        if (matched) hitCount++;
      });
    }
    var blanksLen = (q.blanks || []).length;
    var threshold = Math.ceil(blanksLen * 0.6);
    return {
      score: hitCount, total: blanksLen,
      level: getLevel(hitCount, blanksLen, threshold),
      details: { hits: hits }
    };
  };

  QuizHelpers.scoreCalculate = function (q, userAnswer) {
    var normUser = normalize(userAnswer);
    var allTerms = [q.answer].concat(q.answerAliases || []);
    var matched = false;
    for (var i = 0; i < allTerms.length; i++) {
      var normTerm = normalize(allTerms[i]);
      if (!normTerm) continue;
      if (normUser === normTerm || normUser.indexOf(normTerm) >= 0 || normTerm.indexOf(normUser) >= 0) { matched = true; break; }
    }
    return {
      score: matched ? 1 : 0, total: 1,
      level: matched ? 'mastered' : 'unknown',
      details: { isCorrect: matched }
    };
  };

  QuizHelpers.scorePointsBased = function (q, userAnswer) {
    var normUser = normalize(userAnswer);
    var hits = [], totalWeight = 0, hitWeight = 0;
    (q.points || []).forEach(function (p) {
      totalWeight += p.weight || 1;
      var allTerms = [p.point].concat(p.synonyms || []);
      var matched = false, matchedTerm = null;
      for (var i = 0; i < allTerms.length; i++) {
        if (normUser.indexOf(normalize(allTerms[i])) >= 0) { matched = true; matchedTerm = allTerms[i]; break; }
      }
      hits.push({ point: p.point, synonyms: p.synonyms || [], matched: matched, matchedTerm: matchedTerm, weight: p.weight || 1 });
      if (matched) hitWeight += (p.weight || 1);
    });
    return {
      score: hitWeight, total: totalWeight,
      level: getLevel(hitWeight, totalWeight, q.passThreshold || Math.ceil(totalWeight * 0.6)),
      details: { hits: hits }
    };
  };

  QuizHelpers.scoreProof = function (q, userAnswer) {
    var normUser = normalize(userAnswer);
    var hits = [], hitCount = 0;
    (q.steps || []).forEach(function (s) {
      var matched = false, matchedTerm = null;
      for (var i = 0; i < (s.keywords || []).length; i++) {
        if (normUser.indexOf(normalize(s.keywords[i])) >= 0) { matched = true; matchedTerm = s.keywords[i]; break; }
      }
      hits.push({ desc: s.desc, keywords: s.keywords || [], matched: matched, matchedTerm: matchedTerm, hint: s.hint || '' });
      if (matched) hitCount++;
    });
    var stepsLen = (q.steps || []).length;
    return {
      score: hitCount, total: stepsLen,
      level: getLevel(hitCount, stepsLen, q.passThreshold || Math.ceil(stepsLen * 0.6)),
      details: { hits: hits }
    };
  };

  /* 统一判分分发器 */
  QuizHelpers.scoreQuestion = function (q, userAnswer, userSelection) {
    switch (q.type) {
      case 'choice': return QuizHelpers.scoreChoice(q, userSelection);
      case 'fill': return QuizHelpers.scoreFill(q, userAnswer);
      case 'calculate': return QuizHelpers.scoreCalculate(q, userAnswer);
      case 'shortAnswer':
      case 'essay':
        if (q.points && q.points.length) return QuizHelpers.scorePointsBased(q, userAnswer);
        return null;
      case 'proof':
        if (q.steps && q.steps.length) return QuizHelpers.scoreProof(q, userAnswer);
        return null;
      default: return null;
    }
  };

  /* 往期答案面板 */
  QuizHelpers.renderHistoryPanel = function (history, qId) {
    if (!history || history.length <= 1) return '';
    var rows = history.map(function (r, i) {
      var cls = r.isCorrect ? 'correct' : 'wrong';
      var icon = r.isCorrect ? '✅' : '❌';
      var ts = r.timestamp ? new Date(r.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      var ans = r.userAnswer || '(空)';
      var lv = r.level || (r.isCorrect ? 'mastered' : 'unknown');
      var lvText = lv === 'mastered' ? '已掌握' : lv === 'unsure' ? '不熟练' : '不会';
      return '<div class="exam-history-row ' + cls + '">' +
        '<span class="exam-history-idx">#' + (i + 1) + '</span>' +
        '<span class="exam-history-time">' + esc(ts) + '</span>' +
        '<span class="exam-history-icon">' + icon + '</span>' +
        '<span class="exam-history-answer">' + esc(ans) + '</span>' +
        '<span class="exam-history-level">' + esc(lvText) + '</span>' +
        '</div>';
    }).join('');
    return '<div class="exam-history-panel" id="hist-' + qId + '" style="display:none">' + rows + '</div>';
  };

  global.QuizHelpers = QuizHelpers;
})(window);
