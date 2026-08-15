# 此刻便是春天工作台 —— Agent 交接文档

> 把本文档直接交给新 Agent，并告诉他当前任务即可开始工作。文档末尾「v2.5.0 后续建议」列出待办优先级。

> **⚠ 重要：v2.0.0 至 v2.5.0 变更已提交 Git**（最新 commit `54133e8`）。工作区仅剩 AI News Digest 定时任务产物和 study-plan-optimization 临时文件未跟踪。**禁止执行 `git reset --hard`、`git checkout .`、`git clean -f` 等破坏性操作**，以免丢失未跟踪的工作。

---

## 版本更新记录

| 版本 | 日期 | 摘要 |
|---|---|---|
| v1.0.0 | 2026-08-12 ~ 2026-08-13 | 工作台从单一阅读模块扩展为 6 大模块，全部线框占位替换为真实内容页；AI 学习规划师重构、统筹计划面板升级、科目 AI 助手入口、构建后自动预览 |
| v2.0.0 | 2026-08-14 | AI 统筹规划师功能增强（对话折叠/复盘时段/面板调换）；背诵卡页面重构（今日任务/总任务双板块）；背诵卡语法错误修复（JS 字符串转义）；新增「实现即测试」硬性约束；约束文档与隐患规避方案更新；validate_workbench.py 扩展至 21 个检查函数（含目录结构同步、CHANGELOG 变更覆盖）；新增 Git pre-commit hook；流程清单补充 CHANGELOG 更新步骤 |
| v2.1.0 | 2026-08-15 | 背诵卡新增「测验模式」（AI 出题 + 本地降级 + 答题反馈 + 掌握度联动）；dev_server.py 支持手机访问（`--host 0.0.0.0`）；学习方案科学性优化报告；功能 Demo 页面 |
| v2.2.0 | 2026-08-15 | 背诵卡测验模式增强：新增3种题型（计算题/名词解释题/综合应用题，共6种）；出题改为累计+持久化（localStorage `recite-quiz-bank`）；已答题目测验模式自动隐藏；新增「📚 题库」模式（统计+分类筛选：全部/错题/正确/未答）；取消出题数量限制 |
| v2.3.0 | 2026-08-15 | Python 学习内容重组为2页面+阶段按钮切换：知识点详解（29个知识点四层内容）、Demo实战（4个Demo完整设计）、学习闭环（四阶段路线图+五步闭环+阶段筛选） |
| v2.4.0 | 2026-08-15 | 工作台风格统一（蓝色主题+移除页面级 header+renderMode 三种渲染模式）；Python 模块功能优化（手写练习答案折叠+代码一键复制+学习闭环接入真实数据+知识点↔Demo 双向联动） |
| v2.5.0 | 2026-08-16 | AI 学习模块重设计：移除 4 项引用、保留资讯周报、新增 AI 知识图谱（29 知识点×4 阶段）和 AI 实战 Demo（4 个 Demo）；AI 代码复盘迁移至能力提升模块 |

> **当前版本：v2.5.0** — 详见下方「v2.5.0 更新内容」章节。

---

## 项目一句话描述

一个 Python 构建的静态 HTML 个人工作台，聚合「能力提升」「自考学习」「Python 基础」「AI 学习」「AI 助手角色」与「阅读资料」六大模块，主题可切换，支持本地热重载预览。v2.5.0 新增：AI 学习模块重设计（知识图谱 29 知识点 + 实战 Demo 4 个）；AI 代码复盘迁移至能力提升模块。

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
├── CHANGELOG.md                      # 变更日志（当前版本 v2.5.0）
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
│   │   ├── ai-knowledge-tree.html          # AI 知识图谱（四阶段29个知识点：概念/代码/练习/AI场景）
│   │   ├── ai-demos.html                   # AI 实战 Demo（四阶段4个Demo：目标/功能/代码/测试/知识点映射）
│   │   ├── ai-news-digest.html             # AI 资讯周报展示页
│   │   ├── ai-news-data.json               # 资讯周报数据（定时任务更新）
│   │   ├── ai-code-review.html             # AI 帮我复盘代码（已迁移至能力提升模块，文件保留）
│   │   ├── ai-learning-plan.html           # 已取消引用（文件保留）
│   │   ├── ai-roles-hub.html               # 已取消引用（文件保留）
│   │   └── daily-plan.html                 # 已取消引用（文件保留）
│   ├── Python基础/                   # Python 基础模块页面
│   │   ├── python-knowledge-tree.html      # 知识点详解（四阶段29个知识点 + 阶段按钮切换）
│   │   ├── python-demos.html               # Demo实战（四阶段4个Demo + 阶段按钮切换）
│   │   └── python-learning-loop.html       # 学习闭环（四阶段路线图 + 五步闭环 + 阶段筛选）
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

> 以上为 v1.0.0 归档内容。新 Agent 请跳转至「v2.1.0 后续建议」查看当前待办。

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

---

## v2.1.0 更新内容（2026-08-15）

> 文件级变更明细详见 `CHANGELOG.md` v2.1.0 章节。本节记录功能级上下文与后续建议。

### 1. 背诵卡测验模式

- **模式切换**：在"今日任务/总任务"视图下方新增"背诵模式/测验模式"切换按钮。测验模式下隐藏卡片列表和新建表单，显示出题区和答题区。
- **AI 出题**：点击"AI 出题"按钮，将当前视图的卡片（今日任务取前 10 张）发给 `/api/chat`，AI 根据定义生成填空/选择/简答题。请求格式：`{ messages, model: "deepseek-chat", stream: false, max_tokens: 4000 }`，解析 `choices[0].message.content` 中的 JSON 数组。
- **本地降级**：AI 不可用时自动降级为本地模板出题（填空+简答），不依赖服务器。
- **答题反馈**：提交后显示对错、参考答案；选择题高亮正确/错误选项。
- **掌握度联动**：答对卡片升级（unknown→unsure→known），答错降级为 unknown，统计数字实时更新。

### 2. 手机访问支持

- `dev_server.py` 新增 `--host` 参数，默认 `0.0.0.0`，启动时打印局域网 URL。手机同一 WiFi 下可直接访问。
- `self-study.json` 4 个科目背诵卡 URL 增加 `&v=2.1.1` 版本参数，解决 iframe 浏览器缓存问题。

### 3. 学习方案优化报告

- `study-plan-optimization/` 目录新增优化方案报告和功能 Demo，含 5 项基础改进 + 3 项用户增强（AI 出题、Python AI 场景、AI 岗位规划）。尚未落地到工作台页面。

### 4. v2.1.0 经验教训

- **AI 接口请求格式必须与现有调用一致**：测验模式最初发送 `{ message: prompt }`，但 `dev_server.py` 的 `/api/chat` 端点期望 `{ messages: [{role, content}], stream: false }`。新功能调用 AI 前应先查看 `ai-roles-hub.html` 等现有页面的调用方式。
- **iframe 缓存问题**：修改内容页后，工作台 iframe 可能加载旧缓存。需要在 `contentUrl` 中加版本参数（如 `&v=2.1.1`）并重建。

### 5. v2.1.0 后续建议

1. **落地学习方案优化** — `study-plan-optimization/` 中的 5 项基础改进（间隔重复、交错学习、时长优化、提前启动数据结构、复盘闭环）尚未实施到工作台。
2. **AI 出题增强** — 目前简答题评分仅靠关键词匹配，可考虑让 AI 二次评分；选择题干扰项质量可提升。
3. **移动端适配** — 已支持手机访问但无响应式适配，侧边栏/卡片在手机上体验不佳（见方案一：渐进式响应式适配）。
4. **Python AI 场景 Demo** — 考前数据结构 demo 包装成 AI 场景（链表→对话历史管理器等），尚未实施。
5. **AI 岗位规划页面** — 考后 12 周学习路径已规划，页面尚未创建。

---

## v2.2.0 更新内容（2026-08-15）

> 文件级变更明细详见 `CHANGELOG.md` v2.2.0 章节。本节记录功能级上下文与后续建议。

### 1. 题型扩展（3 → 6 种）

在原有填空题、选择题、简答题基础上，新增：
- **计算题**（`calculate`）：文本输入，字符串匹配校验，粉色 badge
- **名词解释题**（`explain`）：文本框，关键词匹配校验，绿色 badge
- **综合应用题**（`apply`）：文本框，关键词匹配校验，橙色 badge

AI prompt 和本地降级出题均已支持全部 6 种题型。本地降级按 `i % 6` 轮换分配题型（不生成选择题，因无法构造干扰项）。

### 2. 累计出题 + 持久化

- **累计显示**：每次点击「AI 出题」新增题目追加到列表，不再覆盖。状态栏显示「已累计 N 道题（本次新增 M 道）」。
- **持久化**：题目存储在 `localStorage['recite-quiz-bank']`，每道题记录 `qid`、`createdAt`、`subject`、`userAnswer`、`isCorrect`。页面刷新后自动恢复。
- **最新在上**：测验模式和题库均按 `createdAt` 倒序排列，新生成的题目显示在最上方。

### 3. 测验模式过滤已答题目

- `renderQuiz()` 过滤 `isCorrect !== null` 的题目，只显示未答的。
- 全部答完后显示提示文字，引导用户去题库查看记录。
- 答题时使用原始数组索引（`idx`）传递给 `checkQuizAnswer`，确保数据一致性。

### 4. 题库模式

- 新增第三个模式按钮「📚 题库」，与「📖 背诵模式」「✏️ 测验模式」并列。
- **统计面板**：总题数、已答、正确、错误、正确率。
- **分类筛选**：全部 / 错题 / 正确 / 未答，4 个按钮带数量统计，点击即时切换。
- **题目卡片**：左侧色条标识状态（绿=正确、红=错误、灰=未答），显示题型 badge、章节、日期、你的答案、参考答案。
- **清空功能**：二次确认后清空所有题目和答题记录。

### 5. 出题范围取消限制

- `getQuizCards()` 移除 `.slice(0, 10)`，基于今日全部卡片出题。
- `max_tokens` 从 4000 提升至 8000，适应更多题目的生成需求。

### 6. v2.2.0 经验教训

- **renderQuiz 索引一致性**：过滤已答题目后，显示顺序与数组索引不一致。必须使用 `{ q, idx }` 映射保留原始索引，传递给 `checkQuizAnswer` 和 DOM 元素 ID，否则答题会操作错误的题目。
- **题库数据迁移**：`recite-quiz-bank` 是全新 localStorage 键，与 v2.1.0 的内存数组无冲突，无需迁移。

### 7. v2.2.0 后续建议

1. **落地学习方案优化** — `study-plan-optimization/` 中的 5 项基础改进仍待实施（同 v2.1.0）。
2. **简答题评分增强** — 目前计算题/名词解释题/综合应用题均靠关键词匹配，可考虑让 AI 二次评分。
3. **移动端适配** — 已支持手机访问但无响应式适配。
4. **题库导出** — 可考虑支持导出错题为可打印格式，方便线下复习。
5. **按科目筛选题库** — 当前题库显示所有科目的题目，可增加科目筛选。

---

## v2.3.0 更新内容（2026-08-15）

> 文件级变更明细详见 `CHANGELOG.md` v2.3.0 章节。本节记录功能级上下文与后续建议。

### 1. Python 学习内容重组（2页面 + 阶段按钮切换）

**背景**：原 Python 模块三个页面内容单薄（树形知识架构仅勾选、Demo只有3个简略项目、闭环流程仅表单）。用户确认四阶段学习设计后，选择方案B重组为2个核心页面+阶段按钮切换。

**知识点详解页面**（`python-knowledge-tree.html`）：
- 四阶段按钮切换：语法基础（第1-2周，9个知识点）、数据结构（第3-5周，8个知识点）、常用库（第6-7周，7个知识点）、AI Python（第8-10周，5个知识点）
- 每个知识点四层内容：概念解释 + 代码示例 + 手写练习 + AI应用场景
- 搜索过滤、进度跟踪（localStorage 持久化）、卡片展开/折叠交互

**Demo实战页面**（`python-demos.html`）：
- 同步四阶段按钮切换
- 4个Demo完整设计：Prompt模板引擎、LLM上下文管理器、LLM API客户端、真题数据分析仪表盘
- 每个 Demo 含：目标说明、功能列表、文件结构、完整代码、测试用例、知识点映射

**学习闭环页面**（`python-learning-loop.html`）：
- 新增四阶段路线图（阶段编号/名称/周次/知识点数/Demo名称）
- 保留五步闭环流程图
- 表单新增阶段选择器，记录列表新增阶段标签和阶段筛选按钮
- 数据迁移：自动从 v1 格式升级到 v2（补充 stage 字段）

### 2. python.json 配置更新

三个页面重命名：树形知识架构→知识点详解、小闭环Demo→Demo实战、闭环流程→学习闭环；描述更新匹配新内容。

### 3. 经验教训

- **方案先行再编码**：四阶段29个知识点+4个Demo的内容量大，先在 `study-plan-optimization/` 设计确认后再编码落地，避免返工。
- **阶段按钮统一交互**：三个页面统一使用阶段按钮切换模式，与学习驾驶舱按钮风格一致，保持模块内交互一致性。
- **数据迁移兼容**：学习闭环页面从 v1 升级到 v2 时自动迁移旧数据（补充 stage 字段），不丢失用户已有记录。

### 4. v2.3.0 后续建议

1. **落地学习方案优化** — `study-plan-optimization/` 中的 5 项基础改进仍待实施（同 v2.1.0）。
2. **Python 知识点手写练习验证** — 29个知识点的手写练习代码尚未在 Python 环境中实际运行验证，建议逐一跑通。
3. **Demo 代码实测** — 4个Demo的完整代码已内嵌页面，但尚未在实际 Python 环境中创建项目并运行测试。
4. **移动端适配** — 已支持手机访问但无响应式适配。
5. **知识点与 Demo 联动** — ✅ 已在 v2.4.0 实现（知识点页显示 Demo 应用区域+Demo 页显示掌握状态）。

---

## v2.4.0 更新内容（2026-08-15）

> 文件级变更明细详见 `CHANGELOG.md` v2.4.0 章节。本节记录功能级上下文与后续建议。

### 1. 工作台风格统一（renderMode 机制 + 蓝色主题）

**背景**：工作台各板块页面风格不统一，部分页面有冗余标题 header 与工作台标题重复，iframe 内嵌页面外层 plan-card/tabs 包装影响全屏体验。

**renderMode 三种渲染模式**（`templates/workbench.html` renderItemView 函数）：
- `bare`：直接显示 iframe，无 plan-card/plan-header/tabs 包装（Python 三页面等需要全屏展示的页面）
- `content`：保留 plan-header 标题，去除「计划/内容」切换条（知识框架、真题、复盘等内容页）
- 默认：显示完整 plan-card + 计划/内容切换条（有 tasks 列表的科目页）

**全工作台蓝色主题**：所有子页面统一主色调为蓝色（`--accent: #2563eb`），移除页面级 header。

### 2. Python 模块四项功能优化

| 功能 | 实现方式 | 交互 |
|---|---|---|
| 手写练习答案折叠 | 答案包裹在 `.kp-answer-wrap` 中，默认 `max-height:0` 隐藏 | 点击「查看参考答案」按钮展开/收起，箭头旋转 |
| 代码一键复制 | 每个代码块右上角 `.kp-copy-btn` 按钮，opacity 55% 始终可见 | 点击复制到剪贴板，按钮变绿色「已复制」1.5 秒恢复 |
| 学习闭环接入真实数据 | 知识点页面 `updateProgress()` 将摘要写入 `localStorage["py_kp_progress"]`；学习闭环页面 `loadKpProgress()` 读取 | 顶部总进度条 + 各阶段独立进度条 + 掌握百分比 |
| 知识点↔Demo 双向联动 | 知识点页面内嵌 `DEMO_MAP` 查找表显示 Demo 应用区域；Demo 页面读取 `py_kp_detail_v1` 显示掌握状态 | 知识点卡片底部绿色「Demo 应用」区；Demo 映射表「掌握」列 ✓/— |

### 3. 经验教训

- **IIFE 作用域陷阱**：`onclick="fn()"` 内联事件处理器无法访问 IIFE `(function(){...})()` 内定义的函数，浏览器报 `ReferenceError: fn is not defined`。解决方案：改用 `addEventListener` 在 IIFE 内部绑定事件，不依赖全局作用域。
- **浏览器验证不可省略**：答案折叠功能代码层面正确，但 IIFE 作用域 bug 只有在浏览器中点击按钮才能发现（控制台报错）。仅凭代码审查无法发现此类运行时问题。
- **缓存控制**：HTML 页面修改后浏览器可能加载旧缓存版本。需要在 `<head>` 添加 `Cache-Control: no-cache` meta 标签，并在 contentUrl 中更新版本参数（如 `?v=2.4.0`）强制刷新。

### 4. v2.4.0 后续建议

1. **落地学习方案优化** — `study-plan-optimization/` 中的 5 项基础改进仍待实施（同 v2.1.0）。
2. **Python 知识点手写练习验证** — 29个知识点的手写练习代码尚未在 Python 环境中实际运行验证。
3. **Demo 代码实测** — 4个Demo的完整代码已内嵌页面，但尚未在实际 Python 环境中创建项目并运行测试。
4. **移动端适配** — 已支持手机访问但无响应式适配。
5. **AI 学习板块重设计** — ✅ 已在 v2.5.0 实现。

---

## v2.5.0 更新内容（2026-08-16）

> 文件级变更明细详见 `CHANGELOG.md` v2.5.0 章节。本节记录功能级上下文与后续建议。

### 1. AI 学习模块重设计

**背景**：AI 学习模块此前包含学习路线图、自考方案、每日执行计划、AI学习规划师等与"AI 知识学习"定位不符的内容。用户决定重新设计该模块，聚焦 AI 知识学习。

**调整内容**：
- **移除 4 项引用**：完整学习路线图、武汉理工自考+AI转型学习方案、每日执行计划、AI学习规划师（HTML 文件保留，仅从 JSON 中取消引用）
- **保留**：AI 资讯周报
- **新增**：AI 知识图谱（29 知识点×4 阶段）、AI 实战 Demo（4 个 Demo）
- **迁移**：AI 帮我复盘代码 → 能力提升模块「工具」分类

**新模块结构**：
```
AI 学习
├── 知识体系
│   ├── AI 知识图谱（bare 模式，四阶段29个知识点）
│   └── AI 实战 Demo（bare 模式，四阶段4个Demo）
└── 资讯
    └── AI 资讯周报（content 模式）
```

### 2. AI 知识图谱页面

四阶段 29 个知识点，每阶段对应学习周次：

| 阶段 | 名称 | 周次 | 知识点数 | 内容 |
|---|---|---|---|---|
| 1 | 基础概念 | 第1-2周 | 8 | AI/ML/DL 关系、数据类型、特征工程、模型评估、过拟合、数据划分、交叉验证、评估指标 |
| 2 | 机器学习 | 第3-5周 | 8 | 线性回归、逻辑回归、决策树、随机森林、SVM、KNN、K-Means、PCA |
| 3 | 深度学习与NLP | 第6-8周 | 7 | 神经网络、反向传播、CNN、RNN/LSTM、Transformer、词向量、注意力机制 |
| 4 | LLM与应用 | 第9-10周 | 6 | GPT架构、预训练与微调、RLHF、Prompt工程、RAG、AI Agent |

每个知识点含四层内容：概念解释（c）、代码示例（code）、手写练习（e+ec）、AI 场景（a）。

交互功能：阶段按钮切换、搜索过滤、知识点掌握进度跟踪（localStorage `ai_kp_detail_v1`）、答案折叠展开、代码一键复制。

### 3. AI 实战 Demo 页面

四阶段 4 个 Demo，与知识图谱阶段对应：

| 阶段 | Demo 名称 | 知识点映射 |
|---|---|---|
| 1 | 数据可视化与评估工具 | KP 1-8 |
| 2 | MNIST 手写数字分类器 | KP 9-16 |
| 3 | 语义搜索引擎 | KP 17-23 |
| 4 | AI 知识助手（RAG） | KP 24-29 |

每个 Demo 含：目标说明、功能列表、文件结构、完整代码、测试用例、知识点映射表。

### 4. 经验教训

- **JS 字符串引号转义（再次）**：AI 知识图谱页面中 Python 代码示例 `print("...")` 的双引号未转义，导致 `SyntaxError: Unexpected identifier`。与 v2.0.0 背诵卡的 `a'` 撇号问题同类——内嵌代码到 JS 字符串时，所有 ASCII 双引号必须转义为 `\"`，或改用中文引号。
- **HTML 文件保留策略**：用户明确说"取消引用"而非"删除"，被移除引用的 HTML 文件（ai-learning-plan.html、ai-roles-hub.html、daily-plan.html）保留在磁盘上但不被工作台加载。这避免了误删用户可能后续需要的内容。

### 5. v2.5.0 后续建议

1. **落地学习方案优化** — `study-plan-optimization/` 中的 5 项基础改进仍待实施（同 v2.1.0）。
2. **Python 知识点手写练习验证** — 29个知识点的手写练习代码尚未在 Python 环境中实际运行验证。
3. **Demo 代码实测** — Python 4个Demo和 AI 4个Demo的完整代码已内嵌页面，但尚未在实际环境中创建项目并运行测试。
4. **移动端适配** — 已支持手机访问但无响应式适配。
5. **AI 知识图谱内容补充** — 29个知识点的代码示例和手写练习答案可根据实际学习进度逐步补充和修正。
6. **AI Demo 代码实现** — 4个Demo目前为设计文档+伪代码，后续可在实际 Python 环境中创建项目并实现。
