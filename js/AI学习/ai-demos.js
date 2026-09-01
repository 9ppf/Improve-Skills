// ============================================================
// ai-demos 页面 JS
// 抽离自 ai-demos.html
// ============================================================

(function () {
  var STAGES = [
    { id: 1, name: "基础概念", weeks: "Stage 1" },
    { id: 2, name: "机器学习", weeks: "Stage 2" },
    { id: 3, name: "深度学习与NLP", weeks: "Stage 3" },
    { id: 4, name: "LLM与应用", weeks: "Stage 4" }
  ];

  var DEMOS = [
    {
      id: 1, s: 1, icon: "📊", title: "数据可视化与评估工具",
      goal: "构建一个交互式工具，演示 AI/ML 基础概念：数据集划分、特征工程、模型评估指标、过拟合可视化、梯度下降过程。",
      features: [
        "数据集加载与划分（train/test split 可视化）",
        "特征工程演示：归一化前后对比、One-Hot 编码效果",
        "模型评估仪表盘：准确率/精确率/召回率/F1 + 混淆矩阵热力图",
        "正则化对比：L1 vs L2 权重分布可视化",
        "梯度下降动画：不同学习率下的损失曲线",
        "偏见检测：分组评估不同群体的模型表现"
      ],
      structure: [
        "data_eval_tool/",
        "├── main.py            # 入口：加载数据、运行评估",
        "├── data_loader.py     # 数据加载与划分",
        "├── feature_engine.py  # 特征工程：归一化/编码/选择",
        "├── evaluator.py       # 评估指标计算与可视化",
        "├── visualizer.py      # matplotlib 图表生成",
        "└── tests/",
        "    └── test_evaluator.py  # 评估逻辑测试"
      ],
      code: "# evaluator.py - 核心评估逻辑\nfrom sklearn.metrics import (\n    accuracy_score, precision_score, recall_score,\n    f1_score, confusion_matrix\n)\nimport numpy as np\n\nclass ModelEvaluator:\n    def __init__(self, y_true, y_pred):\n        self.y_true = y_true\n        self.y_pred = y_pred\n    \n    def metrics(self):\n        return {\n            'accuracy': accuracy_score(self.y_true, self.y_pred),\n            'precision': precision_score(self.y_true, self.y_pred, average='weighted'),\n            'recall': recall_score(self.y_true, self.y_pred, average='weighted'),\n            'f1': f1_score(self.y_true, self.y_pred, average='weighted')\n        }\n    \n    def confusion(self):\n        return confusion_matrix(self.y_true, self.y_pred)\n    \n    def group_fairness(self, groups):\n        \"\"\"分组评估公平性\"\"\"\n        results = {}\n        for g in set(groups):\n            mask = [i for i, x in enumerate(groups) if x == g]\n            y_t = [self.y_true[i] for i in mask]\n            y_p = [self.y_pred[i] for i in mask]\n            results[g] = accuracy_score(y_t, y_p)\n        return results\n\n# 使用\nevaluator = ModelEvaluator(y_true, y_pred)\nprint(evaluator.metrics())\nprint('混淆矩阵:\\n', evaluator.confusion())",
      tests: [
        "test_accuracy: 验证准确率计算正确",
        "test_confusion_matrix: 混淆矩阵形状和值正确",
        "test_group_fairness: 分组评估各群体指标合理",
        "test_edge_case: 空输入、单类别输入的容错处理"
      ],
      kpIds: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      id: 2, s: 2, icon: "🔢", title: "MNIST 分类器",
      goal: "用 scikit-learn 实现手写数字识别，对比多种 ML 算法（逻辑回归/决策树/随机森林/SVM/朴素贝叶斯），分析各自优劣。",
      features: [
        "MNIST 数据集加载与预处理",
        "多算法对比：逻辑回归、决策树、随机森林、SVM、朴素贝叶斯",
        "K-Means 无监督聚类可视化",
        "交叉验证 + 评估指标对比表",
        "特征工程 Pipeline（归一化 + PCA 降维 + 分类）",
        "错误样本分析：哪些数字最容易混淆"
      ],
      structure: [
        "mnist_classifier/",
        "├── main.py            # 入口：训练+评估+对比",
        "├── classifiers.py     # 多算法封装",
        "├── pipeline.py        # 特征工程Pipeline",
        "├── analysis.py        # 错误分析与可视化",
        "└── tests/",
        "    └── test_classifiers.py"
      ],
      code: "# classifiers.py - 多算法对比\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.svm import SVC\nfrom sklearn.naive_bayes import GaussianNB\nfrom sklearn.model_selection import cross_val_score\n\nclass MultiClassifier:\n    def __init__(self):\n        self.models = {\n            'Logistic Regression': LogisticRegression(max_iter=1000),\n            'Decision Tree': DecisionTreeClassifier(max_depth=10),\n            'Random Forest': RandomForestClassifier(n_estimators=50),\n            'SVM (RBF)': SVC(kernel='rbf'),\n            'Naive Bayes': GaussianNB()\n        }\n    \n    def compare(self, X, y, cv=5):\n        results = {}\n        for name, model in self.models.items():\n            scores = cross_val_score(model, X, y, cv=cv)\n            results[name] = {\n                'mean': scores.mean(),\n                'std': scores.std(),\n                'scores': scores\n            }\n            print(f'{name}: {scores.mean():.3f} ± {scores.std():.3f}')\n        return results\n    \n    def train_best(self, X, y, results):\n        best_name = max(results, key=lambda k: results[k]['mean'])\n        print(f'最佳模型: {best_name}')\n        self.models[best_name].fit(X, y)\n        return self.models[best_name]\n\n# 使用\nfrom sklearn.datasets import load_digits\nX, y = load_digits(return_X_y=True)\nclf = MultiClassifier()\nresults = clf.compare(X, y)",
      tests: [
        "test_each_model_trains: 每个模型都能正常训练",
        "test_cv_scores: 交叉验证分数在合理范围 [0, 1]",
        "test_best_model: best_model 准确率 > 0.9",
        "test_pipeline: Pipeline 预处理 + 分类流程正确"
      ],
      kpIds: [9, 10, 11, 12, 13, 14, 15, 16]
    },
    {
      id: 3, s: 3, icon: "🔍", title: "文本向量化与语义搜索",
      goal: "理解 Embedding 原理，实现一个基于词向量的语义搜索引擎：输入查询文本，返回语义最相似的文档。",
      features: [
        "文本预处理：分词、去停用词、词干化",
        "Word2Vec 模型训练（Skip-gram）",
        "文档向量化：平均词向量 / TF-IDF 加权",
        "余弦相似度检索：query → top-k 文档",
        "Attention 简化版：计算词级注意力权重",
        "可视化：t-SNE 降维展示词向量空间"
      ],
      structure: [
        "semantic_search/",
        "├── main.py            # 入口：搜索演示",
        "├── preprocessor.py    # 文本预处理",
        "├── embedder.py        # Word2Vec训练与向量化",
        "├── searcher.py        # 相似度检索引擎",
        "├── attention.py       # 简化版Attention权重",
        "└── tests/",
        "    └── test_searcher.py"
      ],
      code: "# searcher.py - 语义搜索引擎\nimport numpy as np\nfrom sklearn.metrics.pairwise import cosine_similarity\n\nclass SemanticSearcher:\n    def __init__(self, embeddings_model):\n        self.model = embeddings_model\n        self.doc_vectors = []\n        self.documents = []\n    \n    def add_documents(self, docs):\n        for doc in docs:\n            vec = self._embed(doc)\n            if vec is not None:\n                self.doc_vectors.append(vec)\n                self.documents.append(doc)\n        self.doc_vectors = np.array(self.doc_vectors)\n    \n    def search(self, query, top_k=5):\n        query_vec = self._embed(query)\n        if query_vec is None:\n            return []\n        \n        # 余弦相似度\n        sims = cosine_similarity([query_vec], self.doc_vectors)[0]\n        ranked = np.argsort(-sims)[:top_k]\n        \n        results = []\n        for idx in ranked:\n            results.append({\n                'doc': self.documents[idx],\n                'score': float(sims[idx])\n            })\n        return results\n    \n    def _embed(self, text):\n        words = text.lower().split()\n        vectors = [self.model[w] for w in words if w in self.model]\n        if not vectors:\n            return None\n        return np.mean(vectors, axis=0)\n\n# 使用 (需要gensim训练Word2Vec)\n# from gensim.models import Word2Vec\n# model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)\n# searcher = SemanticSearcher(model.wv)\n# searcher.add_documents(documents)\n# results = searcher.search('Python 性能 优化')",
      tests: [
        "test_embedding: 文本向量化结果维度正确",
        "test_search: 搜索结果按相似度降序排列",
        "test_empty_query: 空查询返回空列表",
        "test_unknown_word: 包含未知词的查询不崩溃",
        "test_top_k: top_k 参数正确限制返回数量"
      ],
      kpIds: [17, 18, 19, 20, 21, 22, 23]
    },
    {
      id: 4, s: 4, icon: "🤖", title: "AI 知识助手 (RAG)",
      goal: "搭建一个基于 RAG 的 AI 问答助手：将自考知识点文档向量化存储，用户提问后检索相关知识，调用 LLM 生成带引用的回答。",
      features: [
        "文档分块：自动将长文档切分为合适大小的 chunk",
        "向量存储：用 embedding 模型将 chunk 向量化存入数据库",
        "语义检索：用户提问 → 向量相似度检索 top-k 相关 chunk",
        "Prompt 工程：将检索结果拼入上下文，引导 LLM 生成准确回答",
        "Agent 工具调用：LLM 可调用搜索/计算/文件读写工具",
        "流式输出：SSE 流式返回生成结果",
        "引用追溯：标注回答来源的文档段落"
      ],
      structure: [
        "ai_knowledge_assistant/",
        "├── main.py            # 入口：启动API服务",
        "├── chunker.py         # 文档分块",
        "├── vector_store.py    # 向量数据库封装",
        "├── retriever.py       # 检索引擎",
        "├── generator.py       # LLM调用与Prompt工程",
        "├── agent.py           # Agent工具调用循环",
        "├── config.py          # 配置：API Key/模型参数",
        "└── tests/",
        "    └── test_rag.py"
      ],
      code: "# generator.py - LLM 生成 + Prompt 工程\nimport requests\nimport json\n\nclass RAGGenerator:\n    def __init__(self, api_key, model=\"deepseek-chat\"):\n        self.api_key = api_key\n        self.model = model\n        self.system_prompt = \"\"\"你是AI学习助手。根据以下参考资料回答问题。\n如果参考资料中没有相关信息，请明确说明\"未找到相关资料\"。\n回答时标注引用来源。\n\n参考资料:\n{context}\n\"\"\"\n    \n    def generate(self, query, retrieved_docs, stream=True):\n        context = \"\\n\\n\".join([\n            f\"[{i+1}] {doc['text']}\" \n            for i, doc in enumerate(retrieved_docs)\n        ])\n        \n        messages = [\n            {\"role\": \"system\", \"content\": self.system_prompt.format(context=context)},\n            {\"role\": \"user\", \"content\": query}\n        ]\n        \n        if stream:\n            return self._stream_chat(messages)\n        return self._chat(messages)\n    \n    def _chat(self, messages):\n        resp = requests.post(\n            \"https://api.deepseek.com/v1/chat/completions\",\n            headers={\"Authorization\": f\"Bearer {self.api_key}\"},\n            json={\"model\": self.model, \"messages\": messages, \"temperature\": 0.3}\n        )\n        return resp.json()[\"choices\"][0][\"message\"][\"content\"]\n    \n    def _stream_chat(self, messages):\n        resp = requests.post(\n            \"https://api.deepseek.com/v1/chat/completions\",\n            headers={\"Authorization\": f\"Bearer {self.api_key}\"},\n            json={\"model\": self.model, \"messages\": messages, \"stream\": True},\n            stream=True\n        )\n        for line in resp.iter_lines():\n            if line:\n                chunk = json.loads(line[6:])\n                content = chunk[\"choices\"][0][\"delta\"].get(\"content\", \"\")\n                if content:\n                    yield content\n\n# 使用\n# gen = RAGGenerator(api_key=\"your-key\")\n# docs = retriever.search(\"什么是梯度下降\", top_k=3)\n# for chunk in gen.generate(\"解释梯度下降\", docs, stream=True):\n#     print(chunk, end=\"\")",
      tests: [
        "test_chunking: 文档分块大小在合理范围(200-500 tokens)",
        "test_retrieval: 检索结果与查询语义相关",
        "test_generation: LLM 输出包含引用标注",
        "test_stream: 流式输出逐字返回",
        "test_fallback: API 不可用时降级返回提示",
        "test_no_relevant: 无相关文档时返回\"未找到\""
      ],
      kpIds: [24, 25, 26, 27, 28, 29]
    }
  ];

  var STORAGE_KEY = "ai_kp_detail_v1";
  var currentStage = 1;
  var stageTabsEl = document.getElementById("stageTabs");
  var demoListEl = document.getElementById("demoList");

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; }
  }

  function hl(code) {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderStageTabs() {
    stageTabsEl.innerHTML = STAGES.map(function(st) {
      var cls = st.id === currentStage ? "active" : "";
      return '<button class="stage-tab ' + cls + '" onclick="switchStage(' + st.id + ')">' + st.name + '</button>';
    }).join("");
  }

  function renderDemos() {
    var state = loadState();
    var filtered = DEMOS.filter(function(d) { return d.s === currentStage; });

    demoListEl.innerHTML = filtered.map(function(d) {
      var kpChips = d.kpIds.map(function(kid) {
        var done = state[kid] ? "done" : "";
        var status = state[kid] ? "✓" : "—";
        return '<span class="demo-kp-chip ' + done + '">KP' + String(kid).padStart(2,"0") + ' <span class="kp-status">' + status + '</span></span>';
      }).join("");

      var structureHtml = d.structure.map(function(line) { return hl(line); }).join("<br>");

      return '<div class="demo-card">' +
        '<div class="demo-header" onclick="toggleDemo(this)">' +
          '<span class="demo-badge">' + d.icon + '</span>' +
          '<div class="demo-title"><h2>' + d.title + '</h2><p>' + d.goal + '</p></div>' +
          '<span class="demo-toggle">展开 ▼</span>' +
        '</div>' +
        '<div class="demo-body">' +
          '<div class="demo-section"><h3>🎯 目标</h3><p>' + d.goal + '</p></div>' +
          '<div class="demo-section"><h3>📋 功能列表</h3><ul>' + d.features.map(function(f) { return "<li>" + f + "</li>"; }).join("") + '</ul></div>' +
          '<div class="demo-section"><h3>📁 文件结构</h3><pre class="demo-code">' + structureHtml + '</pre></div>' +
          '<div class="demo-section"><h3>💻 核心代码</h3><div class="demo-code-block"><button class="demo-copy-btn">复制</button><pre class="demo-code">' + hl(d.code) + '</pre></div></div>' +
          '<div class="demo-section"><h3>🧪 测试用例</h3><div class="demo-test"><p>需要通过的测试：</p><ul>' + d.tests.map(function(t) { return "<li>" + t + "</li>"; }).join("") + '</ul></div></div>' +
          '<div class="demo-section"><h3>🔗 知识点映射</h3><div class="demo-kp-map">' + kpChips + '</div></div>' +
          (JOB_AI_DEMO_MAP[d.s] ? '<div class="demo-section"><h3 style="color:#8b5cf6">🎯 关联岗位技能</h3><div style="display:flex;gap:0.3rem;flex-wrap:wrap">' + JOB_AI_DEMO_MAP[d.s].map(function(j){return '<span style="padding:2px 8px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:4px;font-size:0.75rem;color:#8b5cf6;cursor:pointer" onclick="navigateToJobTree('+j.id+')">KP'+j.id+': '+j.t+'</span>'}).join('') + '</div></div>' : '') +
        '</div>' +
      '</div>';
    }).join("");

    demoListEl.querySelectorAll(".demo-copy-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var code = this.nextElementSibling.textContent;
        navigator.clipboard.writeText(code).then(function() {
          btn.textContent = "已复制";
          btn.classList.add("copied");
          setTimeout(function() { btn.textContent = "复制"; btn.classList.remove("copied"); }, 1500);
        }).catch(function() {
          var ta = document.createElement("textarea");
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          btn.textContent = "已复制";
          btn.classList.add("copied");
          setTimeout(function() { btn.textContent = "复制"; btn.classList.remove("copied"); }, 1500);
        });
      });
    });
  }

  window.switchStage = function(id) {
    currentStage = id;
    renderStageTabs();
    renderDemos();
  };

  window.toggleDemo = function(header) {
    var card = header.closest(".demo-card");
    card.classList.toggle("open");
    var toggle = header.querySelector(".demo-toggle");
    if (card.classList.contains("open")) {
      toggle.textContent = "收起 ▲";
    } else {
      toggle.textContent = "展开 ▼";
    }
  };

  var JOB_AI_DEMO_MAP = {
    3: [{id:8, t:"RAG Pipeline构建"}],
    4: [{id:10, t:"LangChain框架"}, {id:12, t:"Agent架构(ReAct)"}]
  };

  function navigateToJobTree(kpId) {
    try {
      window.parent.postMessage({ action: 'navigate', module: 'ai-learning', page: 'job-skill-tree.html', kpId: kpId }, '*');
    } catch(e) { console.log('navigate failed:', e); }
  }

  renderStageTabs();
  renderDemos();
})();
