# 此刻便是春天工作台 —— Agent 交接文档

> 把本文档直接交给新 Agent，并告诉他当前任务即可开始工作。文档末尾「v2.0.0 后续建议」列出待办优先级。

> **⚠ 重要：v2.0.0 变更尚未提交 Git。** 当前工作区包含大量未提交的 v2.0.0 变更（详见 `CHANGELOG.md` v2.0.0 章节）。**禁止执行 `git reset --hard`、`git checkout .`、`git clean -f` 等破坏性操作**，否则会丢失未提交的工作。

---

## 版本更新记录

| 版本 | 日期 | 摘要 |
|---|---|---|
| v1.0.0 | 2026-08-12 ~ 2026-08-13 | 工作台从单一阅读模块扩展为 6 大模块，全部线框占位替换为真实内容页；AI 学习规划师重构、统筹计划面板升级、科目 AI 助手入口、构建后自动预览 |
| v2.0.0 | 2026-08-14 | AI 统筹规划师功能增强（对话折叠/复盘时段/面板调换）；背诵卡页面重构（今日任务/总任务双板块）；背诵卡语法错误修复（JS 字符串转义）；新增「实现即测试」硬性约束；约束文档与隐患规避方案更新；validate_workbench.py 扩展至 21 个检查函数（含目录结构同步、CHANGELOG 变更覆盖）；新增 Git pre-commit hook；流程清单补充 CHANGELOG 更新步骤 |

> **当前版本：v2.0.0** — 详见下方「v2.0.0 更新内容」章节。

---

## 项目一句话描述

一个 Python 构建的静态 HTML 个人工作台，聚合「能力提升」「自考学习」「Python 基础」「AI 学习」「AI 助手角色」与「阅读资料」六大模块，主题可切换，支持本地热重载预览。v2.0.0 新增：AI 统筹规划师（对话式生成每日学习计划，6 时段含复盘，对话消息可折叠）；背诵卡系统（今日任务/总任务双板块，按科目区分，翻转卡片 + 掌握度标记）；「实现即测试」硬性约束体系。

---

## 核心原则（必须遵守）

1. **`Workbench/此刻便是春天.html` 由 `build.py` 从模板生成，禁止手动编辑产物文件；提交 Git 时需随源码一同提交，方便对比各版本差异**。
2. **所有结构性改动应通过修改 `data/modules/*.json` + `templates/workbench.html` + `build.py` 并运行 `python build.py` 来落地**。
3. 当前环境已确认 Python 可用（`E:\Python\python.exe`，版本 3.9.7）；Node.js 通过 NVM 安装（v14.19.0，路径 `C:\nvm-nodejs\nodejs\`）。用户终端可直接使用 `node --check`；TRAE Shell 工具的 PATH 不含 NVM 路径，需先执行 `$env:PATH += ';C:\nvm-nodejs\nodejs'` 才能运行 JS 语法校验。若未添加 PATH，`build.py` 与 `validate_workbench.py` 会跳过 JS 校验并打印警告，不报错退出。
4. **结构性变更必须先讨论**：涉及增删分类、重组导航、改变信息架构前，必须先触发 `plan-before-create` skill 讨论确认；只有"往已有结构里填数据"的内容填充可以直接执行。
5. **新增最终交付物必须同步更新 `文件说明.md`**；**中间产物**（脚本、OCR 文本、调试输出）只能放在 `temp/` 下，不能进入 `Workbench/`。
6. **类名必须带模块前缀**，例如 `reading-card`、`exam-item`，禁止裸用 `card`、`item`、`title` 等通类；新增/修改文件前，先查 `项目约束总览.md` 中的「新增/修改文件流程」。
7. **实现功能后必须在浏览器中实际测试**（v2.0.0 新增）。代码审查可以发现逻辑错误，但无法替代运行时测试——语法错误、事件绑定失效、样式丢失等问题只有在浏览器中执行才会暴露。不能仅凭代码推断功能正常。
8. **内嵌大段数据到 JS 字符串时，必须检查所有引号转义**（v2.0.0 新增）。数学符号（如补元 `a'`、导数 `f'`）中的撇号与 JS 字符串界定符冲突，未转义会导致整个 `<script>` 块静默崩溃。详见 `文件约束隐患与规避方案.md` 第 13 条。
9. **提交前校验已自动化**（v2.0.0 新增）。`.git/hooks/pre-commit` 会在 `git commit` 时自动运行 `validate_workbench.py`，校验失败则阻止提交。若 hook 不存在（如新克隆的仓库），需手动创建：将 `.git/hooks/pre-commit.sample` 复制为 `.git/hooks/pre-commit`，写入 `python .trae/skills/validate_workbench.py` 并确保可执行。可用 `git commit --no-verify` 跳过（不推荐）。
10. **修改文件后必须同步更新 `CHANGELOG.md`**（v2.0.0 新增）。`validate_workbench.py` 的 `check_changelog_coverage()` 会对比 `git diff HEAD --name-only` 与 CHANGELOG 最新版本表格，未记录的修改文件会触发警告。
11. **`.env` 文件不在版本控制中**（`.gitignore` 排除）。测试 AI 功能（统筹规划师、学习规划师）需要 DeepSeek API Key，若 `.env` 不存在需向用户索取，不可自行创建或硬编码 Key。

---

## 目录结构

```
e:\TraeWorkToDo\
├── build.py                          # 核心构建脚本
├── dev_server.py                     # 本地预览 + 热重载 + AI API 代理（/api/chat 端点）
├── requirements.txt                  # Python 依赖：libsass, watchdog
├── .env                              # API Key 存储（已加入 .gitignore，不入版本控制）
├── .gitignore                        # Git 忽略规则
├── .gitattributes                    # Git LFS 与属性配置
├── AGENT_HANDOFF.md                  # 本文档
├── CHANGELOG.md                      # 变更日志（当前版本 v2.0.0）
├── 文件说明.md                        # 项目文件用途说明
├── 项目约束总览.md                     # 所有规范的索引入口
├── 文件约束隐患与规避方案.md             # 已知隐患与规避方案（13 条）
├── 工作台搭建总结.md                   # 工作台演进过程与已解决问题
├── 版本控制规范.md                     # Git 提交范围、LFS、提交信息格式
├── build.py 使用说明.md                # 构建流程详细说明
├── Workbench UI 交互规范.md            # UI 与交互规范
├── AI统筹规划师-版本C方案.md             # AI 统筹规划师设计方案文档
│
├── temp/                              # 临时产物（脚本、OCR 文本、调试输出，已加入 .gitignore）
│
├── data/                               # 全局配置与模块数据
│   ├── workbench.json                  # 主题与模块注册表
│   └── modules/
│       ├── ability.json                # 能力提升
│       ├── self-study.json             # 自考学习
│       ├── python.json                 # Python 基础
│       ├── ai-learning.json            # AI 学习
│       ├── ai-roles.json                # AI 助手角色
│       ├── reading.json                # 阅读资料
│       └── tasks.json                  # 任务模块（已禁用）
│
├── templates/
│   └── workbench.html                # HTML 模板（{{ placeholder }}）
│
├── styles/                           # SASS 源码
│   ├── _variables.scss               # 浅色主题基础 token（唯一数据源）
│   ├── _root.scss                    # CSS 变量注入
│   ├── _base.scss                    # 基础样式
│   ├── _layout.scss                  # 布局（sidebar / main）
│   ├── _components.scss              # 通用组件
│   ├── _reading.scss                 # 阅读模块样式
│   ├── _responsive.scss              # 响应式适配（移动端断点）
│   ├── _tree.scss                    # 侧边栏树形组件样式
│   └── main.scss                     # SASS 入口
│
├── Workbench/                        # 最终交付物
│   ├── 此刻便是春天.html             # 构建产物（由 build.py 生成，禁止手动编辑）
│   │                                  # 注意：Workbench/ 下其他 HTML 文件均为独立内容页，
│   │                                  # 不经过 build.py，可直接编辑
│   ├── ai-learning/                  # AI 学习相关页面
│   │   ├── ai-learning-plan.html           # 武汉理工自考 + AI 转型方案
│   │   ├── daily-plan.html                 # 每日执行计划
│   │   ├── ai-code-review.html             # AI 帮我复盘代码（交互页）
│   │   ├── ai-roles-hub.html               # AI 助手角色交互中心（6 角色）
│   │   ├── ai-news-digest.html             # AI 资讯周报展示页
│   │   └── ai-news-data.json               # 资讯周报数据（定时任务更新）
│   ├── Python基础/                   # Python 基础模块页面
│   │   ├── python-knowledge-tree.html      # 树形知识架构（可勾选 + 进度条）
│   │   ├── python-demos.html               # 小闭环 Demo（3 个完整项目）
│   │   └── python-learning-loop.html       # 闭环学习流程（5 步可视化）
│   ├── 能力提升/                     # 能力提升模块页面
│   │   ├── 能力提升-学习驾驶舱.html         # 进度驾驶舱（汇总各模块 localStorage 进度）
│   │   └── full-learning-roadmap.html      # 学习路线图（10 周冲刺 + 3 个月转型战略视图）
│   ├── 自考学习/                     # 自考科目页面
│   │   ├── 备考科目/
│   │   │   ├── 13015计算机系统原理/         # 知识框架 + 真题与错题 + 背诵与简答
│   │   │   ├── 02324离散数学/               # 知识框架 + 真题与错题 + 背诵与简答
│   │   │   └── 13003数据结构与算法/         # 知识框架 + 真题与错题 + 背诵与简答
│   │   ├── 真题练习/
│   │   │   └── 真题练习-真题与错题本.html   # 交互式真题与错题管理（URL 参数 ?subject=XXX 预选科目）
│   │   ├── 背诵与简答/
│   │   │   └── 背诵与简答-核心概念背诵卡.html # 翻转卡片背诵系统（URL 参数 ?subject=XXX 预选科目）
│   │   ├── 复盘总结/
│   │   │   └── 复盘总结-章节复盘.html       # 章节复盘总结（每章总结/错题反思/改进计划，URL 参数 ?subject=XXX 预选科目）
│   │   └── 未考科目/
│   │       ├── 00015英语（二）/
│   │       └── 00023高等数学（工本）/
│   ├── read/                         # 阅读原始 HTML（2019 ~ 2026）
│   └── 工作台迁移方案/               # 历史说明文档
│       └── 工作台迁移方案-说明.html   # 迁移方案详情页
│
├── transformers/
│   └── read.py                       # 阅读模块数据转换器
│
└── .trae/skills/
    ├── reading_integration.py        # 阅读内容转换与注入核心
    ├── validate_workbench.py         # 校验脚本（可独立运行或被 build.py 调用）
    ├── integrate_reading.py          # 手动批量集成入口（已统一走 build.py）
    ├── zujian-file-router/           # 文件路由 skill（决定文件创建位置）
    └── integrate_reading_year/
        └── integrate_reading_year.py # 单年份手动集成入口
```

---

## 常用命令

```bash
# 完整构建并校验
python build.py

# 构建并自动打开浏览器预览
python build.py --open

# 本地预览（自动构建 + 监听文件变化 + AI API 代理）
python dev_server.py

# 仅校验，不构建
python .trae/skills/validate_workbench.py

# 仅查看会清理哪些文件，不构建也不删除
python build.py --dry-run

# 构建前确认再清理
python build.py --confirm
```

> **TRAE Shell 工具注意**：Shell 环境的 PATH 不含 NVM 路径，运行涉及 `node --check` 的校验前需先执行：
> `$env:PATH += ';C:\nvm-nodejs\nodejs'`
> 用户终端无需此操作。

---

## 主题系统说明

- **基础 token** 定义在 `styles/_variables.scss`（浅色主题的唯一数据源）。
- `data/workbench.json` 中：
  - `light.tokens` 保持为空；
  - `dark.tokens` 只写与浅色主题不同的覆盖项。
- 构建时 `build.py` 从 SCSS 解析基础 token，再与主题覆盖合并，最终生成内联 JS。
- 允许使用的 token 名由 `build.py` 中的 `THEME_TOKEN_NAMES` 白名单控制。

---

## 模块扩展方式

1. 在 `data/workbench.json` 的 `modules` 数组中注册新模块。
2. 在 `data/modules/` 下创建 `{module_id}.json`。
3. 如需动态转换，在 `transformers/` 下创建 `{module_id}.py` 并实现 `enrich_module(data)`。
4. 如需渲染到模板，在 `templates/workbench.html` 中预留占位符，并在 `build.py` 中填充。
5. 运行 `python build.py` 验证。

---

## AI API 代理架构

浏览器中的 AI 功能（AI 统筹规划师、AI 学习规划师）**不直接调用 AI API**，而是通过本地 `dev_server.py` 的 `/api/chat` 端点代理：

```
浏览器 (fetch /api/chat)  →  dev_server.py  →  AI API (流式响应)  →  浏览器
```

- **API Key 存储**：`.env` 文件（已加入 `.gitignore`），不入版本控制。
- **流式输出**：`dev_server.py` 支持 SSE 流式响应，浏览器端通过 `fetch` + `ReadableStream` 接收。
- **关键文件**：
  - `dev_server.py` — `/api/chat` 端点，处理 AI API 调用、流式输出、错误处理。
  - `Workbench/能力提升/能力提升-学习驾驶舱.html` — AI 统筹规划师（对话式生成每日学习计划）。
  - `Workbench/ai-learning/ai-roles-hub.html` — AI 学习规划师（提示词生成 + 直接生成模式）。

---

## localStorage Key 一览

新 Agent 添加功能时需避免与已有 Key 冲突：

| Key | 用途 | 写入文件 |
|---|---|---|
| `ai_daily_plan` | AI 统筹规划师生成的每日计划 | 能力提升-学习驾驶舱.html |
| `ai_conversation` | AI 统筹规划师对话历史（20 条截断） | 能力提升-学习驾驶舱.html |
| `self_study_weeks` | 统筹计划（按周×科目） | 能力提升-学习驾驶舱.html |
| `recite-cards-data` | 背诵卡数据（按科目） | 背诵与简答-核心概念背诵卡.html |
| `recite-cards-version` | 背诵卡数据版本（当前 = 5） | 背诵与简答-核心概念背诵卡.html |
| `exam-questions-data` | 真题与错题数据（按科目） | 真题练习-真题与错题本.html |
| `py_knowledge_tree_v1` | Python 知识树勾选状态 | python-knowledge-tree.html |
| `py_learning_loops_v1` | Python 闭环学习记录 | python-learning-loop.html |
| `ss_mastery_{科目代码}` | 科目掌握进度（如 ss_mastery_13015） | 各科目知识框架页 |
| `ss_active_tab_{科目代码}` | 科目当前 Tab（如 ss_active_tab_13003） | 各科目知识框架页 |

---

## 知识框架页模板

自考科目「目录与知识框架」页面统一采用以下 Tab 结构。当前已应用于 `13003 数据结构与算法`、`02324 离散数学`、`13015 计算机系统原理`。`00023 高等数学（工本）`已在 `self-study.json` 中注册但尚未创建知识框架页面。

### Tab 结构

| 可见 Tab | data-tab | 包含内容 |
|---|---|---|
| 学习计划 | `study-plan` | 掌握进度 + 周学习建议 + 学习提示 |
| 知识总览 | `knowledge-overview` | 整体定位 + 完整目录 + 总览 |

第 1-N 章的内容 pane 保留，但 Tab 按钮隐藏，入口改为「完整目录」中的章节标题点击跳转。

### Pane 内容规范

```html
<div class="chapter-tab-pane active" data-tab="study-plan">
  <section aria-label="掌握进度" class="ss-dashboard" id="ss-dashboard">...</section>
  <section><h2>周学习建议</h2>...</section>
  <section><h2>学习提示</h2>...</section>
</div>

<div class="chapter-tab-pane" data-tab="knowledge-overview">
  <section><h2>整体定位</h2>...</section>
  <section><h2>完整目录</h2>...</section>
  <div><!-- 总览原内容 --></div>
</div>

<div class="chapter-tab-pane" data-tab="chapter-1">
  <div class="framework-chapter">...</div>
</div>
```

### 关键 CSS

```css
.chapter-tab-pane { display: none; }
.chapter-tab-pane.active { display: block; }
.chapter-tab-pane > section { margin-bottom: 1.5rem; }
.chapter-tab-pane > section:last-of-type { margin-bottom: 0; }
.hidden-chapter-tab { display: none; }
.toc-title-link { cursor: pointer; transition: color 0.2s, background 0.2s; }
.toc-title-link:hover { color: var(--accent); background: rgba(37, 99, 235, 0.06); border-radius: 6px; }
```

### 核心 JS

```javascript
(function() {
  var tabBtns = document.querySelectorAll(".chapter-tab-btn");
  var tabPanes = document.querySelectorAll(".chapter-tab-pane");
  var STORAGE_TAB_KEY = "ss_active_tab_{科目代码}";

  function switchTab(tabId) {
    tabBtns.forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
    tabPanes.forEach(p => p.classList.toggle("active", p.dataset.tab === tabId));
    try { localStorage.setItem(STORAGE_TAB_KEY, tabId); } catch(e) {}
  }

  tabBtns.forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  // 兼容旧 tab id
  var legacyMap = {
    progress: 'study-plan', schedule: 'study-plan', tips: 'study-plan',
    position: 'knowledge-overview', toc: 'knowledge-overview', overview: 'knowledge-overview'
  };
  var saved = localStorage.getItem(STORAGE_TAB_KEY);
  if (saved && legacyMap[saved]) saved = legacyMap[saved];
  if (saved && document.querySelector('.chapter-tab-btn[data-tab="' + saved + '"]')) {
    switchTab(saved);
  }

  // 暴露给目录标题点击
  window.switchChapterTab = switchTab;
})();
```

### 目录标题跳转约定

完整目录中匹配 `第 N 章` 的 `.toc-title` 元素，添加：

```html
<div class="toc-title" onclick="switchChapterTab('chapter-1')">第 1 章 ...</div>
```

### localStorage Key 命名

| 科目 | 当前 Tab Key | 掌握进度 Key |
|---|---|---|
| 13003 | `ss_active_tab_13003` | `ss_mastery_13003` |
| 02324 | `ss_active_tab_02324` | `ss_mastery_02324` |
| 13015 | `ss_active_tab_13015` | `ss_mastery_13015` |
| 00023 | `ss_active_tab_00023` | `ss_mastery_00023` |

### 工作台注册约定

知识框架页在 `data/modules/self-study.json` 中注册时，必须设置 `"renderMode": "content"`，避免工作台再显示一层「计划 / 内容」切换按钮，与页面内部的「学习计划 / 知识总览」Tab 重复。

```json
{
  "code": "13003",
  "name": "知识框架",
  "type": "self-study",
  "renderMode": "content",
  "contentUrl": "自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html"
}
```

`templates/workbench.html` 的 `renderTabs()` 会识别该字段：当 `item.renderMode === 'content'` 时，直接渲染内容 iframe，不展示 `plan-tabs`。

---

## v1.0.0 状态（2026-08-12 ~ 2026-08-13）

- 工作台已从单一「阅读资料」模块扩展为 6 大模块：能力提升、自考学习、Python 基础、AI 学习、AI 助手角色、阅读资料。
- `data/workbench.json` 已注册全部 6 个模块；`tasks` 模块已禁用。
- `build.py` 与 `templates/workbench.html` 已扩展为支持任意模块的 `contentUrl` iframe 加载与阅读内容内联渲染。
- 已修复 Python 3.9 兼容性（将 `int | None` 改为 `Optional[int]`）并安装 `libsass`、`watchdog`。
- Node.js 环境说明：Node.js 通过 NVM 安装（v14.19.0，路径 `C:\nvm-nodejs\nodejs\`），用户终端可直接使用。v1.0.0 时因 TRAE Shell 环境 PATH 不含 NVM 路径而误判为未安装，v2.0.0 已确认实际可用。`build.py` 与 `validate_workbench.py` 保留降级保护：找不到 node 时跳过 JS 语法校验并打印警告，不报错退出。
- 已在模板中添加 `selectFirstItem()`，页面加载后自动选中第一个项目，避免右侧空白。
- 已通过 `E:\Python\python.exe build.py` 重新生成 `Workbench/此刻便是春天.html`，并在本地 HTTP 服务下验证：6 个工作区全部渲染、默认加载路线图、自考科目与 AI 助手角色的 iframe 内容加载均正常。

### v1.0.0 新增内容页（2026-08-12）

- **自考学习模块**：
  - 新增「13003 数据结构与算法」知识框架页面（8 章完整目录 + 核心概念/公式/题型/易错点 + 2 周学习建议），替换线框占位。
  - 真题与错题本页面（按科目/年份/题型/状态筛选，localStorage 持久化），通过 URL 参数 `?subject=XXX` 按科目预选。
  - 背诵与简答页面（翻转卡片式，正面问题/背面答案，掌握度标记，localStorage 持久化），同样支持 `?subject=XXX` 预选。
  - **每个科目下各自有 3 个子项**：知识框架、真题与错题、背诵与简答。真题与背诵页面是共享的，但通过 URL 参数按科目预选。
- **Python 基础模块**：
  - 3 个线框占位全部替换为真实内容页：树形知识架构（可勾选 + 进度条 + 搜索）、小闭环 Demo（3 个完整 Python 项目代码）、闭环学习流程（5 步可视化 + 闭环记录管理）。
- **AI 学习模块**：
  - 「AI 帮我复盘代码」从线框占位替换为交互页：粘贴代码 → 自动统计 + 检查清单 + 预设提示词一键复制。
- **AI 助手角色模块**：
  - 6 个角色从线框占位替换为统一交互中心页面（`ai-roles-hub.html?role=xxx`）：角色卡片 + 预设提示词 + 自定义编辑 + 一键复制。
- **AI 资讯周报**：
  - 从线框占位替换为独立资讯展示页（`ai-news-digest.html`）：按分类筛选（政策补贴/产品动态/研究进展/教程资源）+ 统计面板 + 周报归档列表。
  - 数据文件 `ai-news-data.json` 支持定时任务每周六更新；页面优先 fetch JSON，失败时回退到内嵌示例数据。
- **线框原型已清理**：`workbench-wireframe.html` 已删除，构建时不再产生 generic classes 警告。
- **全部 6 大模块线框占位已替换完毕**，工作台不再包含任何线框引用。

---

## 校验规则摘要

`validate_workbench.py` 会检查：

- 嵌入 JS 语法（通过 `node --check`）。
- **全局 JS 语法校验（v2.0.0 新增）**：扫描 `Workbench/` 下所有 HTML 文件的内嵌 JS，覆盖内容页（背诵卡、真题练习等），使用独立临时文件避免 Windows 句柄冲突。
- 旧独立页面类名（如 `class="essay"`）是否泄漏。
- 通用类名（如 `card`、`title`、`section`）是否未加前缀出现在模块内容中。
- **Tab 交互完整性**：若页面使用 `chapter-tab-btn`/`chapter-tab-pane`，必须同步包含对应 CSS 与切换 JS。
- 阅读模块内容完整性（section / essay 数量匹配）。
- 文件命名是否符合 `{子模块}-{任务}.html`。
- `文件说明.md` 是否覆盖了根目录与 Workbench 顶层项。
- `Workbench/` 内是否混入了 `.py` / `.log` 等临时文件。
- `.gitignore` / `.gitattributes` 是否包含必要规则。
- **目录结构同步（v2.0.0 扩展）**：扫描根目录、styles/、Workbench 各模块（含 HTML/JSON 文件）、data/modules/、templates/、.trae/skills/、transformers/，对比 AGENT_HANDOFF.md 是否已列出。
- **CHANGELOG 变更覆盖（v2.0.0 新增）**：通过 `git diff HEAD --name-only` 获取已修改文件，对比 CHANGELOG.md 最新版本表格，报告未记录的变更。
- **Git pre-commit hook（v2.0.0 新增）**：`.git/hooks/pre-commit` 在提交前自动运行 `validate_workbench.py`，校验失败则阻止提交（可用 `--no-verify` 跳过，不推荐）。

---

## v1.0.0 已完成任务（归档）

> 以下任务在 v1.0.0（2026-08-12 ~ 08-13）已全部完成，仅作归档记录。新 Agent 不需要重复执行。

### v1.0.0 新增与改造内容

1. ✅ **AI 学习规划师重构** — `Workbench/ai-learning/ai-roles-hub.html` 从静态角色展示改造为交互式规划师：
   - 支持 `?mode=global` 全局统筹与 `?subject=XXXX` 单科专项两种模式；
   - 自动读取 localStorage 中的学习进度、掌握度、任务状态；
   - 提供「制定本周计划」「出练习题」「讲解错题」「整理资料」「复盘进度」等场景按钮；
   - 自定义需求输入框 + 一键复制生成的提示词。

2. ✅ **统筹计划面板升级** — `Workbench/能力提升/能力提升-学习驾驶舱.html` 升级为统筹计划面板：
   - 考试倒计时看板；
   - 每周时间分配（自考备考 / Python 基础 / AI 学习 / 休息缓冲），支持手动调整；
   - 本周重点任务清单，支持增删改；
   - 与 localStorage 进度联动。

3. ✅ **科目 AI 助手入口** — 在 `data/modules/self-study.json` 的 5 个科目下各自新增「AI助手」子项，指向 `ai-learning/ai-roles-hub.html?subject={code}`，实现单科一键唤起 AI 规划师。

4. ✅ **AI 导航统一** — `data/modules/ai-roles.json` 全部角色与 `data/modules/ai-learning.json` 的「AI 学习规划师」统一指向 `ai-learning/ai-roles-hub.html?mode=global`。

5. ✅ **构建后自动预览** — `build.py` 新增 `--open` 参数，构建校验通过后自动调用系统默认浏览器打开 `Workbench/此刻便是春天.html`；相关约束已写入 `项目约束总览.md` 与 `build.py 使用说明.md`。

6. ✅ **CHANGELOG 维护** — 已更新 `CHANGELOG.md` 到 v0.3.0，记录 AI 助手改造、统筹面板、`--open` 参数等变更。

---

### 经验教训

- **脚本批量改造 HTML 时必须同步校验 CSS/JS 完整性**。本次 13003 数据结构与算法 Tab 改造曾出现 `.chapter-tab-btn` 等 CSS 未注入的情况，导致按钮丢失样式。已修复并在以下位置增加约束：
  - `unify_tabs_13003.py` 写入文件后自检 DOM/CSS/JS 是否同步存在；
  - `.trae/skills/validate_workbench.py` 增加全局 Tab 完整性校验；
  - `项目约束总览.md`「新增/修改文件流程」第二步增加前端改造检查项，并在索引表中新增「前端改造完整性」条目。

- **内容页若自带 Tab 导航，需在注册数据中声明 `renderMode: "content"`**。知识框架页内部已有「学习计划 / 知识总览 / 第 N 章」Tab，若工作台再显示「计划 / 内容」切换按钮，会造成两层 Tab 叠加、界面冗余。解决方案：
  - 在 `data/modules/self-study.json` 的知识框架项上添加 `"renderMode": "content"`；
  - 在 `templates/workbench.html` 的 `renderTabs()` 中识别该字段，遇到 `renderMode === 'content'` 时跳过 `plan-tabs` 渲染，直接展示内容 iframe；
  - 复用该字段：任何内部已具备完整导航的内容页（如路线图、独立仪表盘）均可通过 `renderMode: "content"` 避免工作台级 Tab 干扰。

- **构建后应立即预览**。`build.py` 默认不打开浏览器，容易忽略 UI 层面的问题；现在通过 `--open` 参数和约束文档强制要求构建校验后在浏览器模拟器中确认效果。

---

### v1.0.0 后续建议（部分已在 v2.0.0 完成）

1. **验证 AI 助手实际效果** — 打开 `Workbench/此刻便是春天.html`，依次检查 AI 学习规划师、科目 AI 助手、学习驾驶舱。v2.0.0 已验证 AI 统筹规划师功能正常。
2. **填充真题与背诵内容** — ~~背诵卡目前是空框架~~ v2.0.0 已内置 13015（86 张）和 en（6 张）预置卡片；02324 和 13003 仍需补充。真题与错题本仍为空框架，需用户逐步添加。
3. **AI 资讯周报数据更新** — 定时任务每周六生成周报后，需更新 `Workbench/ai-learning/ai-news-data.json`。
4. **结构性变更约束** — 已写入核心原则第 4 条，不再作为建议。

> 以上为 v1.0.0 归档内容。新 Agent 请跳转至「v2.0.0 后续建议」查看当前待办。

---

## v2.0.0 更新内容（2026-08-14）

> 文件级变更明细详见 `CHANGELOG.md` v2.0.0 章节。本节记录功能级上下文、经验教训与后续建议，供新 Agent 快速理解项目当前状态。

### 1. AI 统筹规划师功能增强

- **每日执行计划新增第 6 时段**：22:00–23:00「整理复盘」，默认任务为"整理当日笔记 + 错题回顾 + 次日计划确认"；AI 提示词同步更新，要求每天必须包含 `review` 类型任务。
- **AI 对话消息折叠**：消息默认显示约 2-3 行，超出部分用渐变遮罩收起，底部显示"展开 ▼"按钮；点击展开后显示"收起 ▲"；短消息（≤3 行）不显示折叠按钮。
- **面板布局调换**：「详细计划」区域移至「对话区」上方，所有提示文案中的方位描述从"下方"更新为"上方"。
- **AI 统筹规划数据独立存储**：`localStorage['ai_daily_plan']` 独立于统筹计划的 `localStorage['self_study_weeks']`；AI 生成计划后自动写入课程表，无需手动确认；对话历史存储在 localStorage，刷新不丢失，超过 20 条自动截断。

### 2. 背诵卡页面重构

- **双板块结构**：页面分为「今日任务」和「总任务」两个板块，通过按钮切换。
  - 今日任务：显示当天学习计划对应章节的卡片（按周次自动计算，第 1 周 → 第 1 章），章节内按 不会 → 不熟练 → 已掌握 排列。
  - 总任务：显示整个科目的全部卡片。
- **顶部科目分类按钮移除**：科目通过 URL 参数 `?subject=XXX` 预选，不再在页面顶部显示科目切换按钮。
- **按钮事件修复**：从 `onclick` 属性改为 `addEventListener` 绑定，解决按钮点击无响应问题。
- **预置卡片数据**：`PRESET_CARDS` 内置 13015（计算机系统原理，~86 张）和 en（英语，6 张）两个科目。02324（离散数学）和 13003（数据结构与算法）暂无预置数据。
- **数据版本管理**：`DATA_VERSION = 5`，版本不匹配时自动清空 localStorage 并重新加载预置卡片。

### 3. 背诵卡语法错误修复（关键 Bug）

**根因**：离散数学卡片中补元符号 `a'` 的单引号未转义，导致 JavaScript 字符串提前终止，触发 `SyntaxError`，整个 `<script>` 块执行失败，页面所有交互功能静默失效。修复方式为转义撇号并升级 `DATA_VERSION`。

### 4. 约束体系升级

v2.0.0 将多条手动约束升级为 `validate_workbench.py` 自动化校验，核心变化：

- **新增硬性约束**：「实现即测试」（修改 HTML/JS 后必须浏览器实测）、「JS 字符串转义」（内嵌数据须检查引号转义）
- **自动化校验扩展**：`validate_workbench.py` 从 13 个检查函数扩展到 21 个，新增中文注释检查、备份数量、JSON-HTML 同名、日期格式、文件夹命名、交互组件样式完整性、目录结构同步（根目录 + Workbench 各模块 + data/modules + templates + .trae/skills + transformers vs AGENT_HANDOFF.md + CHANGELOG 版本一致性）、CHANGELOG 变更覆盖（`check_changelog_coverage()`，对比 `git diff HEAD --name-only` 与 CHANGELOG 最新版本表格，防止变更信息散落）
- **检查盲区消除**：`check_chinese_comments()` 现覆盖 `templates/` 目录，不再仅扫描 `Workbench/`
- **文档职责分工**：CHANGELOG.md 为变更记录唯一权威（文件级），AGENT_HANDOFF.md 记录功能级上下文与经验教训，两者不重复
- **Git pre-commit hook**：`.git/hooks/pre-commit` 在 `git commit` 时自动运行 `validate_workbench.py`，校验失败则阻止提交（见核心原则第 9 条）
- **CHANGELOG 同步约束**：修改已纳入版本控制的文件后，必须在 CHANGELOG.md 当前版本表格中补充变更记录（见核心原则第 10 条，`check_changelog_coverage()` 自动校验）

### 5. v2.0.0 经验教训

- **「实现即测试」必须成为硬性约定**：背诵卡语法错误存在多个版本未被发现，根本原因是修改后从未在浏览器中实际验证。代码审查可以发逻辑错误，但无法替代运行时测试——语法错误只有在执行时才会暴露。
- **大段数据内嵌在 JS 中是脆弱的**：90+ 张卡片的 question/answer/hint 硬编码在 JavaScript 字符串中，任何一个转义遗漏都会导致整个脚本崩溃。建议后续将预置卡片数据迁移为外部 JSON 文件。
- **数学符号与编程语法的冲突**：数学中 `a'` 表示补元/导数，编程中 `'` 是字符串界定符。这类冲突在离散数学、线性代数等科目中会反复出现，需特别注意转义。
- **约束文档化 ≠ 约束生效**：手动勾选清单项会被遗漏，必须配套自动化校验才能有效执行。v2.0.0 已将大部分手动约束升级为 `validate_workbench.py` 自动检查。

### 6. v2.0.0 后续建议

1. **补充离散数学和数据结构的预置卡片** — `PRESET_CARDS` 当前只有 13015 和 en，02324 和 13003 依赖 localStorage 残留数据，刷新后可能消失。
2. **预置数据迁移为外部 JSON** — 彻底消除 JS 字符串转义风险，便于维护和扩展。
3. ~~**构建流程加入语法预检**~~ — ✅ 已完成：`validate_workbench.py` 新增 `check_js_syntax_global()` 函数，扫描所有 HTML 文件的内嵌 JS。
4. **全局扫描 answer 字段** — 检查是否还有其他未转义的引号，特别是含 `a'`、`f'`、`G'` 等数学撇号的卡片。
