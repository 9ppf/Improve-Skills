/**
 * AIChat SDK — 统一 AI 对话调用层
 * 依赖: QuizUtils (utils.js)
 *
 * 用法:
 *   AIChat.ask({ prompt, maxTokens, onDone, onError })           // 单轮问答
 *   AIChat.chat({ messages, maxTokens, onDone, onError })        // 多轮对话
 *   AIChat.stream({ messages, onChunk, onDone, onError })         // 流式对话
 *   AIChat.formatText(text)                                       // 文本格式化
 *   AIChat.history.create() / push(h, msg, maxLen) / toMessages(h, sys)
 *   AIChat.isOnline(callback)
 */
var AIChat = (function() {

  /* ---- 内部：构造请求体 ---- */
  function buildBody(messages, opts) {
    var body = { messages: messages, stream: false };
    if (opts.model) body.model = opts.model;
    if (opts.maxTokens) body.max_tokens = opts.max_tokens;
    if (opts.temperature != null) body.temperature = opts.temperature;
    if (opts.stream) body.stream = true;
    return body;
  }

  /* ---- 内部：解析非流式响应 ---- */
  function parseResponse(data) {
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content || '';
    }
    if (data.response) return data.response;
    if (data.content) return data.content;
    if (data.error) throw new Error(data.error);
    return '';
  }

  /* ---- ① 单轮问答 ---- */
  function ask(opts) {
    var messages = [];
    if (opts.system) messages.push({ role: 'system', content: opts.system });
    messages.push({ role: 'user', content: opts.prompt });
    return chat({ messages: messages, model: opts.model, maxTokens: opts.maxTokens, onLoading: opts.onLoading, onDone: opts.onDone, onError: opts.onError });
  }

  /* ---- ② 多轮对话（非流式） ---- */
  function chat(opts) {
    if (opts.onLoading) opts.onLoading();

    return fetch(QuizUtils.apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(opts.messages, opts))
    })
    .then(function(res) {
      if (!res.ok) {
        return res.json().then(function(err) {
          throw new Error(err.error || ('HTTP ' + res.status));
        });
      }
      return res.json();
    })
    .then(function(data) {
      var text = parseResponse(data);
      if (opts.onDone) opts.onDone(text);
      return text;
    })
    .catch(function(err) {
      if (opts.onError) opts.onError(err);
      else console.error('[AIChat] Error:', err);
      throw err;
    });
  }

  /* ---- ③ 流式对话（SSE） ---- */
  function stream(opts) {
    if (opts.onLoading) opts.onLoading();

    var body = buildBody(opts.messages, opts);
    body.stream = true;

    return fetch(QuizUtils.apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(res) {
      if (!res.ok) {
        return res.json().then(function(err) {
          throw new Error(err.error || ('HTTP ' + res.status));
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var fullText = '';

      function readChunk() {
        reader.read().then(function(result) {
          if (result.done) {
            if (opts.onDone) opts.onDone(fullText);
            return;
          }
          var chunk = decoder.decode(result.value, { stream: true });
          var lines = chunk.split('\n');
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf('data: ') === 0 && line !== 'data: [DONE]') {
              try {
                var parsed = JSON.parse(line.slice(6));
                if (parsed.error) throw new Error(parsed.error);
                var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
                if (delta && delta.content) {
                  fullText += delta.content;
                  if (opts.onChunk) opts.onChunk(delta.content, fullText);
                }
              } catch (e) { /* partial chunk, skip */ }
            }
          }
          readChunk();
        });
      }
      readChunk();
    })
    .catch(function(err) {
      if (opts.onError) opts.onError(err);
      else console.error('[AIChat] Stream Error:', err);
    });
  }

  /* ---- ④ 文本格式化（换行/加粗/代码/列表/表格） ---- */
  function formatText(text) {
    if (!text) return '';
    var lines = text.split('\n');
    var html = [];
    var tableLines = [];

    function flushTable() {
      if (tableLines.length === 0) return;
      var rows = tableLines.filter(function(l) { return l.trim() && l.indexOf('|') !== -1; });
      tableLines = [];
      if (rows.length === 0) return;

      var parsedRows = rows.map(function(row) {
        var cells = row.split('|');
        if (cells.length > 1) {
          if (cells[0].trim() === '') cells.shift();
          if (cells[cells.length - 1].trim() === '') cells.pop();
        }
        return cells.map(function(c) { return c.trim(); });
      }).filter(function(r) { return r.length > 0; });

      if (parsedRows.length === 0) return;
      var maxCells = Math.max.apply(null, parsedRows.map(function(r) { return r.length; }));

      var t = '<table class="ai-table">';
      parsedRows.forEach(function(cells, ri) {
        var isHeader = ri < 2 && cells.length < maxCells;
        var tag = (ri === 0 || isHeader) ? 'th' : 'td';
        var trClass = (ri === 0 || isHeader) ? ' class="ai-table-header"' : '';
        t += '<tr' + trClass + '>';

        if (cells.length === maxCells) {
          cells.forEach(function(c) {
            t += '<' + tag + '>' + formatInline(c) + '</' + tag + '>';
          });
        } else if (cells.length === maxCells - 1) {
          t += '<' + tag + '></' + tag + '>';
          cells.forEach(function(c) {
            t += '<' + tag + '>' + formatInline(c) + '</' + tag + '>';
          });
        } else {
          var first = 1;
          var rest = maxCells - 1;
          var restCount = cells.length - 1;
          var span = Math.floor(rest / restCount);
          var remainder = rest - restCount * span;
          t += '<' + tag + '>' + formatInline(cells[0]) + '</' + tag + '>';
          for (var ci = 1; ci < cells.length; ci++) {
            var cs = span + (ci <= remainder ? 1 : 0);
            t += '<' + tag + (cs > 1 ? ' colspan="' + cs + '"' : '') + '>' + formatInline(cells[ci]) + '</' + tag + '>';
          }
        }
        t += '</tr>';
      });
      t += '</table>';
      html.push(t);
    }

    function formatInline(s) {
      s = QuizUtils.esc(s);
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      return s;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if ((line.match(/\|/g) || []).length >= 2 && line.trim()) {
        tableLines.push(line);
      } else {
        flushTable();
        var esc = formatInline(line);
        if (esc) {
          esc = esc.replace(/^- (.+)$/, '&bull; $1');
          html.push(esc);
        } else {
          html.push('<br>');
        }
      }
    }
    flushTable();
    return html.join('<br>');
  }

  /* ---- ⑤ 对话历史管理 ---- */
  var history = {
    create: function() { return []; },
    push: function(h, msg, maxLen) {
      h.push(msg);
      if (maxLen && h.length > maxLen) h.splice(0, h.length - maxLen);
    },
    toMessages: function(h, systemPrompt) {
      var msgs = systemPrompt ? [{ role: 'system', content: systemPrompt }] : [];
      return msgs.concat(h);
    }
  };

  /* ---- ⑥ 在线检测 ---- */
  function isOnline(callback) {
    fetch(QuizUtils.apiUrl('/api/mastery'))
      .then(function() { callback(true); })
      .catch(function() { callback(false); });
  }

  /* ---- 错误格式化 ---- */
  function formatError(err) {
    var msg = err.message || '';
    if (msg.indexOf('Insufficient Balance') !== -1) {
      return 'DeepSeek 账户余额不足，请访问 platform.deepseek.com 充值';
    }
    if (msg.indexOf('401') !== -1 || msg.toLowerCase().indexOf('invalid api key') !== -1) {
      return 'API Key 无效，请检查 .env 文件中的 DEEPSEEK_API_KEY';
    }
    if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
      return '无法连接服务器，请确认 dev_server.py 正在运行';
    }
    return msg || '未知错误';
  }

  return {
    ask: ask,
    chat: chat,
    stream: stream,
    formatText: formatText,
    formatError: formatError,
    history: history,
    isOnline: isOnline,
    parse: parseResponse
  };
})();
