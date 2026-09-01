# JS 代码架构说明文档

## 一、目录结构

所有 JS 文件统一存放于项目根目录的 `js/` 文件夹下（与 `styles/` 同级），按模块组织：

```
js/
├── shared/                    # 公共共享模块（所有页面可引用）
│   ├── utils.js               # 通用工具函数（QuizUtils 命名空间）
│   ├── theme-sync.js          # 主题同步脚本
│   └── reading.js             # 范文阅读模块渲染函数
│
├── 主工作台/
│   └── workbench.js           # 此刻便是春天主工作台
│
├── AI学习/
│   ├── ai-code-review.js
│   ├── ai-demos.js
│   ├── ai-knowledge-tree.js
│   ├── ai-news-digest.js
│   ├── ai-roles-hub.js
│   ├── job-learning-loop.js
│   └── job-skill-tree.js
│
├── Python基础/
│   ├── python-demos.js
│   ├── python-knowledge-tree.js
│   └── python-learning-loop.js
│
├── 今日学习/
│   └── today-flow.js
│
├── 番茄钟/
│   └── 番茄钟-计时器.js
│
├── 能力提升/
│   ├── full-learning-roadmap.js
│   └── 能力提升-学习驾驶舱.js
│
└── 自考学习/
    ├── 练习测验.js
    ├── 知识框架.js
    ├── 背诵与简答.js
    ├── 真题练习.js
    ├── 复盘总结-章节复盘.js
    ├── 英语（二）/
    │   ├── 英语（二）-作文模板.js
    │   ├── 英语（二）-真题模拟.js
    │   ├── 英语（二）-词汇系统.js
    │   └── 英语（二）-题型专项.js
    └── 高等数学（工本）/
        └── 00023高等数学（工本）-知识框架与学习计划.js
```

## 二、公共模块详解

### 1. shared/utils.js — 通用工具函数

**命名空间**：`QuizUtils`

所有页面通过 `QuizUtils.xxx()` 调用，避免重复实现。

| 函数 | 说明 |
|------|------|
| `storageGet(key, fallback)` | localStorage 读取（JSON 自动反序列化） |
| `storageSet(key, value)` | localStorage 写入（JSON 自动序列化） |
| `storageRemove(key)` | localStorage 删除 |
| `getSubjectFromUrl(defaultSubject)` | 从 URL 获取 subject 参数 |
| `getUrlParam(name)` | 获取任意 URL 参数 |
| `esc(s)` | HTML 转义（防 XSS） |
| `apiUrl(path)` | API 地址拼接（基于当前页面路径） |
| `qs(sel)` | document.querySelector 简写 |
| `qsa(sel)` | document.querySelectorAll 简写 |
| `debounce(fn, wait)` | 防抖函数 |
| `formatDate(d)` | 日期格式化（YYYY-MM-DD） |
| `copyToClipboard(text)` | 复制到剪贴板 |

### 2. shared/theme-sync.js — 主题同步

负责同步 iframe 内外的主题切换，所有页面均需引用。

### 3. shared/reading.js — 范文阅读模块

范文阅读的渲染与交互逻辑，供主工作台和阅读页面使用。

包含函数：`isReadingItem()`, `hasContentUrl()`, `renderContentFrame()`, `renderReadingContent()`, `renderReadingFromJson()`, `renderSection()`, `renderCard()`, `renderTopic()`, `renderEssay()`, `renderSources()`, `toggleReadingSection()`

## 三、HTML 引用方式

每个页面按层级引用 JS，顺序为：**theme-sync → utils → 页面专属 JS**

### 根目录页面（此刻便是春天.html）

```html
<script src="js/shared/theme-sync.js"></script>
<script src="js/shared/utils.js"></script>
<script src="js/主工作台/workbench.js"></script>
```

### 一级子目录（如 ai-learning/、自考学习/）

```html
<script src="../js/shared/theme-sync.js"></script>
<script src="../js/shared/utils.js"></script>
<script src="../js/AI学习/ai-code-review.js"></script>
```

### 二级子目录（如 自考学习/英语（二）/）

```html
<script src="../../js/shared/theme-sync.js"></script>
<script src="../../js/shared/utils.js"></script>
<script src="../../js/自考学习/英语（二）/英语（二）-词汇系统.js"></script>
```

### 三级子目录（如 自考学习/未考科目/00015英语（二）/）

```html
<script src="../../../js/shared/theme-sync.js"></script>
<script src="../../../js/shared/utils.js"></script>
<script src="../../../js/自考学习/英语（二）/英语（二）-词汇系统.js"></script>
```

## 四、重复代码分析

共扫描 **28 个** JS 文件，发现 **26 个**同名函数，其中：

### ✅ 完全相同的重复（可直接提取）

| 函数 | 重复数 | 所在文件 | 状态 |
|------|--------|----------|------|
| 阅读模块 11 个函数 | 2 | workbench.js ↔ reading.js | 已在 shared/reading.js 中 |
| renderTree() | 2 | workbench.js 两个副本 | 已清理重复文件 |

### ⚠️ 同名不同实现（业务逻辑不同，不建议强行提取）

以下函数虽然同名，但在不同模块中处理的数据结构和业务逻辑有差异，强行提取反而增加复杂度：

| 函数 | 出现次数 | 差异说明 |
|------|----------|----------|
| escapeHtml() | 4 | 转义范围略有不同 |
| apiUrl() | 4 | 路径计算逻辑有差异 |
| transformKfToCards() | 3 | 卡片数据结构不同 |
| renderStats() | 3 | 统计维度不同 |
| loadData() | 3 | 数据格式和存储 key 不同 |
| renderCard() | 3 | 卡片渲染模板不同 |
| updateMastery() | 2 | 掌握度更新逻辑不同 |
| aiCall() | 2 | AI 调用封装不同 |
| apiPost() | 2 | POST 请求封装不同 |
| renderCards() | 2 | 卡片列表渲染不同 |
| saveData() | 2 | 数据保存逻辑不同 |
| switchSubject() | 2 | 科目切换逻辑不同 |
| renderAll() | 2 | 整体渲染逻辑不同 |
| updateGuideFlow() | 2 | 引导流程更新不同 |
| init() | 2 | 页面初始化逻辑不同 |
| render() | 2 | 主渲染函数不同 |

## 五、优化建议

### 高优先级（收益大、风险低）

1. **统一使用 `QuizUtils.esc()` 替代各页面的 `escapeHtml()`**
   - 涉及 4 个文件：ai-news-digest.js、today-flow.js、番茄钟-计时器.js、能力提升-学习驾驶舱.js
   - 需注意：utils.js 中的 `esc()` 转义 5 个字符（&、<、>、"、'），部分页面可能只转义 4 个，需确认兼容性

2. **统一使用 `QuizUtils.apiUrl()` 替代各页面的 `apiUrl()`**
   - 涉及 4 个文件：today-flow.js、能力提升-学习驾驶舱.js、练习测验.js、背诵与简答.js
   - 需确认路径计算逻辑一致

3. **主工作台移除内置 reading 函数，直接引用 shared/reading.js**
   - 可减少约 120 行重复代码
   - workbench.html 中增加 `<script src="js/shared/reading.js"></script>`

### 中优先级（需要重构）

4. **提取"知识框架卡片"公共组件**
   - `transformKfToCards()` 在 3 个文件中出现，逻辑相似但数据结构有差异
   - 可考虑抽象为通用渲染器，通过配置参数适配不同数据格式

5. **提取"答题/学习记录同步"公共模块**
   - `loadData()`、`saveData()`、`renderStats()` 等在多个页面模式相似
   - 可封装为 `SyncStore` 类，统一本地存储和服务端同步逻辑

### 低优先级（保持现状即可）

6. 各页面的 `init()`、`render()` 等主函数 — 业务差异大，不值得提取
7. `renderAll()`、`switchSubject()` 等 — 每个页面逻辑不同，强行提取反而增加理解成本

## 六、文件迁移对照表

| 原位置（Workbench/ 下） | 新位置（js/ 下） |
|--------------------------|-------------------|
| 此刻便是春天.js | 主工作台/workbench.js |
| ai-learning/*.js | AI学习/*.js |
| Python基础/*.js | Python基础/*.js |
| 今日学习/*.js | 今日学习/*.js |
| 番茄钟/*.js | 番茄钟/*.js |
| 能力提升/*.js | 能力提升/*.js |
| 自考学习/*.js（直接在自考学习下的） | 自考学习/*.js |
| 自考学习/未考科目/00015英语（二）/*.js | 自考学习/英语（二）/*.js |
| 自考学习/未考科目/00023高等数学（工本）/*.js | 自考学习/高等数学（工本）/*.js |
| styles/shared/utils.js | shared/utils.js |
| styles/shared/theme-sync.js | shared/theme-sync.js |
| styles/shared/reading.js | shared/reading.js |

---

**文档生成时间**：2026-09-01
**JS 文件总数**：28 个（含 3 个共享模块）
**总代码行数**：约 9,500 行
