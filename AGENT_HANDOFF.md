# 此刻便是春天工作台 —— Agent 交接文档（重组版）

> 把本文档直接交给新 Agent，并告诉他当前任务即可开始工作。
> 重组原则：保留原版全部条款，按板块重组，按对项目的帮助程度排序，只删重复。

> **⚠ 禁止执行 `git reset --hard`、`git checkout .`、`git clean -f` 等破坏性操作**。

> **文档阅读顺序**：`用户偏好与AI协作建议_合并版.md`（理解用户）→ `AGENT_HANDOFF_reorganized.md`（本文档，理解项目）→ `项目约束总览.md`（理解规范）。按顺序读完再动手。

---

## 第一部分：新 Agent 必读（读完第6节「当前待办」即可开工）

### 1. 1 分钟理解项目

这是一个**个人私教工作台**——像教练/家教/项目经理一样主动引导用户学习备考和转型 AI 岗位，不是被动展示信息的面板。

- **用户**：自考本科生（武汉理工·计算机），上海嘉定
- **目标**：2026 年 10 月自考三科（系统原理/离散数学/数据结构），考后转型 AI 岗位
- **技术栈**：Python（build.py 从模板 + JSON 生成 HTML），dev_server.py 提供 API 代理与数据持久化
- **当前版本**：v2.27.0（2026-08-23）
- **模块数**：7 个（今日学习、能力提升、自考学习、Python基础、AI学习、AI助手角色、阅读资料）
- **自考科目**：3 科已建知识框架 + 背诵卡（187张） + 练习测验（6题型/4模式） + 复盘总结（错题/题库管理） + AI答疑
- **数据持久化**：掌握状态/AI对话/题库 已通过 API 持久化到 JSON 文件，跨浏览器不丢
- **约束体系**：3个Skill（结构性变更/文档版本/设计稿还原）+ 配套校验脚本

**做任何结构性变更前，必须先讨论确认方案再编码。** 只有"往已有结构里填数据"可以直接执行。

### 2. 核心原则（必须遵守，共 14 条）

1. **`Workbench/此刻便是春天.html` 由 `build.py` 从模板生成，禁止手动编辑产物文件**；提交 Git 时需随源码一同提交，方便对比各版本差异。
2. **所有结构性改动应通过修改 `data/modules/*.json` + `templates/workbench.html` + `build.py` 并运行 `python build.py` 来落地**。
3. **Python 环境已确认可用**（`E:\Python\python.exe`，版本 3.9.7）；Node.js 通过 NVM 安装（v14.19.0，路径 `C:\nvm-nodejs\nodejs\`）。用户终端可直接使用 `node --check`；**TRAE Shell 工具的 PATH 不含 NVM 路径**，需先执行 `$env:PATH += ';C:\nvm-nodejs\nodejs'` 才能运行 JS 语法校验。若未添加 PATH，`build.py` 与 `validate_workbench.py` 会跳过 JS 校验并打印警告，不报错退出。
4. **结构性变更必须先讨论**：涉及增删分类、重组导航、改变信息架构前，必须先触发 `plan-before-create` skill 讨论确认；只有"往已有结构里填数据"的内容填充可以直接执行。
5. **新增最终交付物必须同步更新 `文件说明.md`**；**中间产物**（脚本、OCR 文本、调试输出）只能放在 `temp/` 下，不能进入 `Workbench/`。
6. **类名必须带模块前缀**，例如 `reading-card`、`exam-item`，禁止裸用 `card`、`item`、`title` 等通类；新增/修改文件前，先查 `项目约束总览.md` 中的「新增/修改文件流程」。
7. **实现功能后必须在浏览器中实际测试**。代码审查可以发现逻辑错误，但无法替代运行时测试——语法错误、事件绑定失效、样式丢失等问题只有在浏览器中执行才会暴露。不能仅凭代码推断功能正常。
8. **内嵌大段数据到 JS 字符串时，必须检查所有引号转义**。数学符号（如补元 `a'`、导数 `f'`）中的撇号与 JS 字符串界定符冲突，未转义会导致整个 `<script>` 块静默崩溃。详见 `文件约束隐患与规避方案.md` 第 13 条。
9. **提交前校验已自动化**。`.git/hooks/pre-commit` 会在 `git commit` 时自动运行 `validate_workbench.py`，校验失败则阻止提交。若 hook 不存在（如新克隆的仓库），需手动创建：将 `.git/hooks/pre-commit.sample` 复制为 `.git/hooks/pre-commit`，写入 `python .trae/skills/validate_workbench.py` 并确保可执行。可用 `git commit --no-verify` 跳过（不推荐）。
10. **修改文件后必须同步更新 `CHANGELOG.md`**。`validate_workbench.py` 的 `check_changelog_coverage()` 会对比 `git diff HEAD --name-only` 与 CHANGELOG 最新版本表格，未记录的修改文件会触发警告。
11. **`.env` 文件不在版本控制中**（`.gitignore` 排除）。测试 AI 功能需要 DeepSeek API Key，若 `.env` 不存在需向用户索取，不可自行创建或硬编码 Key。
12. **代码必须包含中文注释** — Python / JS / SASS 代码必须包含中文注释，用户 Python 零基础，注释是用户理解代码逻辑的唯一途径。
13. **小步提交** — 每完成一个小功能就提交一次 Git，别攒一堆才 commit。方便回溯和审查。
14. **⚠ 数据与模板分离（架构红线）** — 新增模块的内容数据（章节数据、题库、卡片内容等）必须使用外部 JSON 文件存储，禁止写死在 HTML 结构中。同一类页面共用一个模板 + 多份数据，不复制 HTML 改内容。违反此约束会导致：div 结构不匹配、localStorage 键名串科目、样式改一个忘两个——这正是三科知识框架页面反复出 bug 的根因。三科已有页面的 JSON 化改造已记入 `BACKLOG_TODO.md`，新增模块必须从第一天就遵守。

### 3. 技术规范（共 18 条）

新 Agent 在写代码和做技术决策时，必须遵守以下规范。

#### 交互技术

1. **按钮切换优于 Tab 切换** — 内容视图切换优先使用按钮（与 AI 规划助手风格一致），而非 Tab 条。
2. **编辑/删除按钮默认隐藏** — 桌面端 hover/focus 时显示，移动端永久显示。
3. **AI 对话历史只保留最近 20 条** — 超过自动截断，避免 localStorage 膨胀。
4. **对话消息折叠** — 默认显示 2-3 行，超出用渐变遮罩收起，底部"展开 ▼"按钮。

#### 视觉技术

5. **重点内容必须醒目** — 知识点优先级必须用背景色区分（重点=红色背景、一般=黄色背景、了解=灰色背景）。背景色区分 > 字体颜色区分 > 纯标签。
6. **图标风格** — 使用 🏮📚🎋🍑🍵🌸🎐 等 emoji 作为模块/分类图标，图标应可修改。
7. **渐变按钮仅用于"添加"操作** — 只有"添加"类按钮保留渐变色，编辑/删除等操作按钮使用纯色。
8. **主色调蓝色系** — 主色 `#3b82f6`，section 标题加左竖条，标题左对齐 + emoji 前缀。页面风格简洁，去掉径向渐变背景和毛玻璃效果。

#### CSS 规范

9. **CSS 不用 `!important`** — 用选择器优先级解决，不依赖 `!important` 强制覆盖。
10. **不用全局标签选择器** — 别直接写 `div {}` `p {}`，必须加类名或父级作用域。
11. **颜色用 CSS 变量或设计稿精确值** — 禁止硬编码猜颜色，用 `var(--accent)` 或取色器精确值。
12. **全局样式先问后改** — 改 body / 全局字体 / 通用组件样式前必须确认。

#### 设计稿还原技术

13. **改之前先列差异清单** — 涉及设计稿还原/多处样式改动，先列表格（位置/当前值/目标值/改/不改），用户确认后再动手。
14. **验证必须走工作台路径** — 必须从侧边栏点击对应模块，通过iframe查看效果。直接打开HTML文件 = 没验证。
15. **设计稿还原时确认范围** — 明确哪些改、哪些不改。用户说"核心概念不动"就绝对不动。

#### UI 问题排查技术

16. **UI 问题先看再修** — 必须按"3-2-1 法则"：① 先观察现象（截图/DOM/对比正常页面）→ ② 定位根因（精确到具体行/元素/规则）→ ③ 修复并验证。没看清问题之前，一个字符都不改。
17. **"多了一个元素"优先查结构溢出** — 查可见元素数量（不是总数量），用 `element.closest('.chapter-tab-pane')` 或检查 offsetTop 判断元素是否在正确的 pane 内。
18. **浏览器缓存控制** — 任何涉及前端页面的变更，必须同时给出缓存控制方案（版本参数 + HTTP 头），不能只改内容不管缓存。

### 4. 踩坑清单（血泪教训汇总）

> 从 v1.0 到 v2.27 反复踩过的坑。新 Agent 必读，别再踩一遍。

| # | 教训 | 来源 | 详细说明 |
|---|------|------|----------|
| 1 | **脚本批量改造 HTML 时必须同步校验 CSS/JS 完整性** | v1.0.0 | 13003 数据结构与算法 Tab 改造曾出现 `.chapter-tab-btn` 等 CSS 未注入的情况，导致按钮丢失样式。修复后 `validate_workbench.py` 增加了全局 Tab 完整性校验。 |
| 2 | **内容页若自带 Tab 导航，需声明 `renderMode: "content"`** | v1.0.0 | 知识框架页内部已有「学习计划 / 知识总览 / 第 N 章」Tab，若工作台再显示「计划 / 内容」切换按钮，会造成两层 Tab 叠加。在 `data/modules/self-study.json` 添加 `"renderMode": "content"` 解决。 |
| 3 | **构建后应立即预览** | v1.0.0 | `build.py` 默认不打开浏览器，容易忽略 UI 层面的问题。通过 `--open` 参数和约束文档强制要求构建校验后在浏览器确认效果。 |
| 4 | **「实现即测试」必须成为硬性约定** | v2.0.0 | 背诵卡语法错误存在多个版本未被发现，根本原因是修改后从未在浏览器中实际验证。代码审查可以发现逻辑错误，但无法替代运行时测试——语法错误只有在执行时才会暴露。 |
| 5 | **大段数据内嵌在 JS 中是脆弱的** | v2.0.0 | 90+ 张卡片的 question/answer/hint 硬编码在 JavaScript 字符串中，任何一个转义遗漏都会导致整个脚本崩溃。建议后续将预置卡片数据迁移为外部 JSON 文件。 |
| 6 | **数学符号与编程语法的冲突** | v2.0.0 | 离散数学卡片中补元符号 `a'` 的单引号未转义，导致 JavaScript 字符串提前终止，触发 `SyntaxError`，整个 `<script>` 块执行失败，页面所有交互功能静默失效。这类冲突在离散数学、线性代数等科目中会反复出现。 |
| 7 | **约束文档化 ≠ 约束生效** | v2.0.0 | 手动勾选清单项会被遗漏，必须配套自动化校验才能有效执行。v2.0.0 已将大部分手动约束升级为 `validate_workbench.py` 自动检查。 |
| 8 | **AI 接口请求格式必须与现有调用一致** | v2.1.0 | 测验模式最初发送 `{ message: prompt }`，但 `dev_server.py` 的 `/api/chat` 端点期望 `{ messages: [{role, content}], stream: false }`。新功能调用 AI 前应先查看 `ai-roles-hub.html` 等现有页面的调用方式。 |
| 9 | **iframe 缓存问题** | v2.1.0 | 修改内容页后，工作台 iframe 可能加载旧缓存。需要在 `contentUrl` 中加版本参数（如 `&v=2.1.1`）并重建。 |
| 10 | **renderQuiz 索引一致性** | v2.2.0 | 过滤已答题目后，显示顺序与数组索引不一致。必须使用 `{ q, idx }` 映射保留原始索引，传递给 `checkQuizAnswer` 和 DOM 元素 ID，否则答题会操作错误的题目。 |
| 11 | **IIFE 作用域陷阱** | v2.4.0 | `onclick="fn()"` 内联事件处理器无法访问 IIFE `(function(){...})()` 内定义的函数，浏览器报 `ReferenceError: fn is not defined`。解决方案：改用 `addEventListener` 在 IIFE 内部绑定事件，不依赖全局作用域。 |
| 12 | **浏览器验证不可省略** | v2.4.0 | 答案折叠功能代码层面正确，但 IIFE 作用域 bug 只有在浏览器中点击按钮才能发现（控制台报错）。仅凭代码审查无法发现此类运行时问题。 |
| 13 | **HTML 文件保留策略** | v2.5.0 | 用户明确说"取消引用"而非"删除"，被移除引用的 HTML 文件保留在磁盘上但不被工作台加载。这避免了误删用户可能后续需要的内容。 |
| 14 | **数据缓存版本控制** | v2.6.0 | 周任务数据缓存在浏览器 `localStorage['schedule_data']`，修改 WEEK_DATA 后旧缓存会导致用户看到旧计划。通过 `SCHEDULE_VERSION` 版本检查机制解决——版本不匹配时自动清除缓存。 |
| 15 | **HTML 结构改动后必须检查残留** | v2.7.0 | 标题隐藏后残留 `margin-top: 1rem` 造成空白，移除包裹层时遗留多余 `</div>` 标签。这类问题需在浏览器中实际查看才能发现。 |
| 16 | **contentUrl 版本号需同步更新** | v2.7.0 | 修改内容页后工作台加载 URL 仍为旧版本号，浏览器直接使用缓存。需在 `contentUrl` 中更新版本参数。 |
| 17 | **AI 答疑对话上下文设计** | v2.9.0 | 每题独立对话上下文，避免不同题目的讨论互相干扰。对话按 qid 存储，切换科目时同步更新 key。 |
| 18 | **题库跨科目隔离** | v2.9.0 | v2.1.0 的 `recite-quiz-bank` 是全局 key，导致切换科目后题目混淆。v2.8.2 修复为按科目隔离（`recite-quiz-bank-{subject}`），但需注意旧数据迁移。 |
| 19 | **Markdown 渲染安全性** | v2.9.0 | AI 回复内容直接插入 DOM 时需注意 XSS 风险，使用正则转换而非 innerHTML 直接赋值。 |
| 20 | **JS 中 `</script>` 标签需转义** | v2.10.0 | 岗位技能图谱页面中 Vue 代码示例包含 `</script>` 标签，HTML 解析器误认为当前 script 块结束，导致后续代码丢失。需将 `</script>` 转义为 `<\/script>` 或拆分字符串。 |
| 21 | **跨 iframe 通信需双向验证** | v2.10.0 | 工作台发送 `highlightKp` 消息后，子 iframe 需有对应的 `message` 事件监听器才能响应。v2.10.1 修复了 job-skill-tree.html 缺少监听器的问题。 |
| 22 | **CSS 类名避免嵌套重复** | v2.10.1 | `renderTodayGuide` 中外层和内层都使用 `.guide-section` 类名，导致 CSS margin 叠加导致间距过大。v2.10.1 修复为外层改用 `.guide-kp-wrap`。 |
| 23 | **localStorage 不适合存储关键用户数据** | v2.17.0 | 浏览器清缓存、换端口、换协议、换浏览器都会丢失。项目已将周计划、掌握进度、题库、AI答疑全部迁移到JSON文件持久化。 |
| 24 | **版本变化时需保护用户进度** | v2.17.0 | `DATA_VERSION` 升级会清除localStorage，必须在清除前备份掌握进度，加载新数据后按问题文本恢复。 |
| 25 | **浏览器缓存导致数据不更新** | v2.17.0 | fetch JSON 时需加 `?v=版本号` 参数和 `cache: 'no-cache'` 策略，否则浏览器返回旧缓存。 |
| 26 | **API 双写策略** | v2.17.0 | 写入时同时写localStorage和API文件（fire-and-forget），读取时优先API、失败回退localStorage。dev_server.py未运行时自动降级为纯localStorage模式。 |
| 27 | **规则引擎分类不可靠** | v2.18.0 | 最初用基于关键词的规则引擎给知识点分类，导致重点占比 65% 或 17%，不合理。改用 AI 批量分类后才得到合理分布（重点 50%）。 |
| 28 | **浏览器缓存必须从服务器端解决** | v2.18.0 | 仅靠 URL 版本参数不够，必须从 HTTP 响应头层面强制 `no-store` + 拦截 `If-Modified-Since`/`If-None-Match` 防 304。 |
| 29 | **每次文档变更后给"改动清单"** | v2.18.1 | 不要只说"已更新文档"。必须列出：文件名、章节名、行号范围、具体改了什么（新增/修改/删除）。用户打开文件时能直接定位到改动，不用自己找。 |
| 30 | **不主动做关联检查是最大的浪费** | v2.18.1 | 用户曾多次连续追问"还有什么问题"，每轮都发现新问题——说明第一次就应该做完整审计，而非逐轮挤牙膏。规则：任何文档类任务，交付前至少跑一遍交叉检查（版本号一致性、引用时效性、相邻章节是否过时）。 |
| 31 | **宣布"完成"前对照验收标准** | v2.18.1 | 用户偏好先讨论方案再执行，方案应包含可验证的"完成标准"。如果用户没给，主动提一句"完成标准：XXX，你看对不对？"。功能能跑 ≠ 任务完成。 |
| 32 | **文档一致性是硬约束不是软建议** | v2.18.1 | CHANGELOG.md、AGENT_HANDOFF.md、工作台搭建总结.md 三份文档的版本号必须同步，后续建议必须反映最新状态。`validate_workbench.py` 的 `check_summary_version_sync()` 已自动校验版本号，但内容时效性需要 Agent 人工保证。 |
| 33 | **验证必须走工作台路径** | v2.20.0 | 必须从侧边栏点击对应模块，通过iframe查看效果。直接打开HTML文件 = 没验证，因为可能有缓存、样式冲突、路径问题。 |
| 34 | **改之前先列差异清单** | v2.20.0 | 涉及设计稿还原/多处样式改动，先列表格（位置/当前值/目标值/改/不改），用户确认后再动手。边想边改=反复返工。 |
| 35 | **同一个问题改2次还不对，立即求助** | v2.20.0 | 说明理解有偏差，再试也是浪费时间。停下来说清：我理解的需求、我做了什么、结果是什么、我卡在哪。 |
| 36 | **用户没说改的一律不动** | v2.20.0 | "顺手优化"、"这样更好看"是大忌。说改A就只改A，B、C、D哪怕有问题也先不说，除非用户问。 |
| 37 | **交付必须问"可以提交吗？"** | v2.20.0 | 不能只说"做完了"，必须明确征求验收同意，等用户确认后再提交Git。 |
| 38 | **UI 问题先看再修，不许猜** | v2.27.0 | 用户反馈"显示不对""多了一个""不显示"等 UI 问题时，**严禁**直接改代码。必须按"3-2-1 法则"执行：① 先观察现象（截图/DOM/对比正常页面）→ ② 定位根因（精确到具体行/元素/规则）→ ③ 修复并验证。没看清问题之前，一个字符都不改。 |
| 39 | **"多了一个元素"优先查结构溢出** | v2.27.0 | 用户说"多了一个 X"时，不要只查"有几个 X 元素"，要查**有几个 X 是可见的**。如果数量 > 1，说明有元素从 pane 里跑出来了（div 结构不匹配）。用 `element.closest('.chapter-tab-pane')` 或检查 offsetTop 判断元素是否在正确的 pane 内。 |

### 5. 快速上手（3 步启动）

```bash
# 1. 确认 Python（E:\Python\python.exe，3.9.7）
python --version

# 2. 安装依赖（如果 requirements.txt 有变更）
pip install -r requirements.txt

# 3. 构建 + 校验
python build.py

# 4. 启动本地服务器（含 AI 代理 + 数据持久化 API）
python dev_server.py
# 浏览器打开 http://localhost:8000/Workbench/此刻便是春天.html
```

> **TRAE Shell 工具注意**：Shell 环境的 PATH 不含 NVM 路径，运行涉及 `node --check` 的校验前需先执行：
> `$env:PATH += ';C:\nvm-nodejs\nodejs'`
> 用户终端无需此操作。

> **AI 功能需要 API Key**：检查 `.env` 文件是否存在、是否包含 `DEEPSEEK_API_KEY=`。不存在则向用户索取，不可自行创建。

### 6. 当前待办

所有待办任务统一记录在 `BACKLOG_TODO.md`，不再在此文档维护，避免一处功能多处记录导致凌乱。

---

## 第二部分：产品与设计（做新页面/改样式/调交互前必读）

> 触发场景：用户要求做新页面、改样式、调整交互、做产品设计决策时，先读这部分确认方向一致。

### 7. 产品愿景：个人私教工作台

这个工作台不是一个被动展示信息的面板，而是一个**像个人私教一样主动引导用户学习和完成项目**的智能工作台。新 Agent 在做任何功能决策时，都应以此为最高准则：

#### 核心理念

1. **主动引导，而非被动展示** — 工作台应该告诉用户"今天学什么、怎么学、学多久"，而不是让用户自己去找内容。AI 统筹规划师、今日学习流、番茄钟任务闹钟都是这一理念的体现。
2. **重点醒目，减轻焦虑** — 知识点必须有优先级标注（重点/一般/了解）和学习方式指导（计算/背诵/理解/应用），用背景色、图标等视觉手段让用户一眼抓住重点，消除"遗漏关键内容"的焦虑。
3. **学习闭环** — 知识框架 → 背诵卡片 → 测验题库 → 真题练习 → 复盘总结，每个环节的数据要打通，掌握状态联动更新。
4. **AI 直接生成计划** — 用户期望 AI 能直接调用工具生成学习计划，而不是只给提示词让用户自己去问。AI 统筹规划师（对话式生成每日计划）和岗位技能图谱的教学指引（tutorial+practice+completion）都是这一理念的体现。
5. **数据不丢失** — 掌握状态、AI对话历史、题库等关键数据通过 API 持久化到 JSON 文件，换浏览器、换 Agent 都不丢。

### 8. renderMode 三种渲染模式

`templates/workbench.html` 的 `renderItemView` 函数支持三种渲染模式：

| 模式 | 效果 | 适用场景 |
|------|------|----------|
| `bare` | 直接显示 iframe，无 plan-card/plan-header/tabs 包装 | 需要全屏展示的页面（Python 三页面等） |
| `content` | 保留 plan-header 标题，去除「计划/内容」切换条 | 内部已具备完整导航的内容页（知识框架、真题、复盘等） |
| 默认 | 显示完整 plan-card + 计划/内容切换条 | 有 tasks 列表的科目页 |

设置方式：在 `data/modules/{module}.json` 中给 item 添加 `"renderMode": "content"`。

### 9. 知识框架页模板规范

> 三科知识框架页（13015/02324/13003）共享同一套结构规范。

#### Tab 结构

| 可见 Tab | data-tab | 包含内容 |
|---|---|---|
| 学习计划 | `study-plan` | 掌握进度 + 周学习建议 + 学习提示 |
| 知识总览 | `knowledge-overview` | 整体定位 + 完整目录 + 总览 |

第 1-N 章的内容 pane 保留，但 Tab 按钮隐藏，入口改为「完整目录」中的章节标题点击跳转。

#### Pane 内容规范

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
  <div class="framework-chapter" data-chapter="1">
    <!-- section-card 折叠卡片：核心概念/必会公式/常见题型/典型例题/同步练习/易错点 -->
    <div class="section-card collapse-card">
      <div class="section-card-header" onclick="toggleCollapse(this)">
        <span class="section-card-title">标题</span>
        <span class="section-card-count">(N)</span>
        <span class="chevron">▶</span>
      </div>
      <div class="section-card-body collapse-body">
        <!-- 内容 -->
      </div>
    </div>
    <!-- 去练习测验按钮（必须在 framework-chapter 内部） -->
    <a class="lg-quiz-btn" href="../../练习测验.html?subject=XXX&chapter=N">📝 去练习测验 →</a>
  </div>
</div>
```

**⚠ 注意**：按钮必须在 `framework-chapter` 内部（pane 内部），否则会跑到 pane 外面导致所有章节都能看到。

#### 关键 CSS

```css
.chapter-tab-pane { display: none; }
.chapter-tab-pane.active { display: block; }
.chapter-tab-pane.zk-active { display: block !important; opacity: 1 !important; }
.chapter-tab-pane > section { margin-bottom: 1.5rem; }
.chapter-tab-pane > section:last-of-type { margin-bottom: 0; }
.hidden-chapter-tab { display: none; }
.toc-title-link { cursor: pointer; transition: color 0.2s, background 0.2s; }
.toc-title-link:hover { color: var(--accent); background: rgba(37, 99, 235, 0.06); border-radius: 6px; }
```

#### 核心 JS

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

#### 目录标题跳转约定

完整目录中匹配 `第 N 章` 的 `.toc-title` 元素，添加：
```html
<div class="toc-title" onclick="switchChapterTab('chapter-1')">第 1 章 ...</div>
```

#### localStorage Key 命名

| 科目 | 当前 Tab Key | 掌握进度 Key |
|---|---|---|
| 13003 | `ss_active_tab_13003` | `ss_mastery_13003` |
| 02324 | `ss_active_tab_02324` | `ss_mastery_02324` |
| 13015 | `ss_active_tab_13015` | `ss_mastery_13015` |
| 00023 | `ss_active_tab_00023` | `ss_mastery_00023` |

#### 工作台注册约定

知识框架页在 `data/modules/self-study.json` 中注册时，必须设置 `"renderMode": "content"`：

```json
{
  "code": "13003",
  "name": "知识框架",
  "type": "self-study",
  "renderMode": "content",
  "contentUrl": "自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html"
}
```

### 10. 主题系统说明

- **基础 token** 定义在 `styles/_variables.scss`（浅色主题的唯一数据源）。
- `data/workbench.json` 中：`light.tokens` 保持为空；`dark.tokens` 只写与浅色主题不同的覆盖项。
- 构建时 `build.py` 从 SCSS 解析基础 token，再与主题覆盖合并，最终生成内联 JS。
- 允许使用的 token 名由 `build.py` 中的 `THEME_TOKEN_NAMES` 白名单控制。

### 11. 模块扩展方式

1. 在 `data/workbench.json` 的 `modules` 数组中注册新模块。
2. 在 `data/modules/` 下创建 `{module_id}.json`。
3. 如需动态转换，在 `transformers/` 下创建 `{module_id}.py` 并实现 `enrich_module(data)`。
4. 如需渲染到模板，在 `templates/workbench.html` 中预留占位符，并在 `build.py` 中填充。
5. 运行 `python build.py` 验证。

---

## 第三部分：技术参考（写代码/改结构/排查问题时查阅）

> 触发场景：需要改代码、加模块、查目录结构、排查 localStorage/API/构建问题时，来这部分找答案。

### 12. 目录结构

```
e:\TraeWorkToDo\
├── build.py                          # 核心构建脚本
├── dev_server.py                     # 本地预览 + 热重载 + AI API 代理 + 数据持久化API
│                                     #   /api/chat — AI对话代理（流式SSE）
│                                     #   /api/update-plan — 周计划写回study-plan.json
│                                     #   GET/POST /api/mastery — 掌握进度读写data/mastery-progress.json（按科目）
│                                     #   GET/POST /api/quiz-bank?subject=xxx — 题库读写data/quiz-bank-{subject}.json
│                                     #   GET/POST /api/quiz-ai?subject=xxx — AI答疑读写data/quiz-ai-{subject}.json
│                                     #   GET/POST /api/ai-conv — AI对话历史读写data/ai-conversation.json
│                                     #   GET/POST /api/ai-plan — AI每日计划读写data/ai-daily-plan.json
├── requirements.txt                  # Python 依赖：libsass, watchdog
├── .env                              # API Key 存储（已加入 .gitignore，不入版本控制）
├── .gitignore                        # Git 忽略规则
├── .gitattributes                    # Git LFS 与属性配置
├── AGENT_HANDOFF.md                  # 本文档
├── CHANGELOG.md                      # 变更日志
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
│   ├── study-plan.json                 # 周计划+日计划数据源（10周，含subject/chapter/topic/done字段）
│   ├── mastery-progress.json           # 掌握状态持久化（三科，按科目读写）
│   ├── quiz-bank-13015.json            # 系统原理测验题库持久化
│   ├── quiz-bank-02324.json            # 离散数学测验题库持久化
│   ├── quiz-bank-13003.json            # 数据结构测验题库持久化
│   ├── quiz-ai-13015.json              # 系统原理AI答疑对话持久化
│   ├── quiz-ai-02324.json              # 离散数学AI答疑对话持久化
│   ├── quiz-ai-13003.json              # 数据结构AI答疑对话持久化
│   ├── recite-cards-02324.json         # 离散数学57张概念背诵卡（def/ex/exam三字段）
│   ├── recite-cards-13015.json         # 系统原理82张概念背诵卡
│   ├── recite-cards-13003.json         # 数据结构48张概念背诵卡
│   ├── learning-guide.json             # 三科187个知识点学习指南（优先级+类型+学习建议）
│   ├── ai-conversation.json            # AI对话历史持久化（最近20条）
│   ├── ai-daily-plan.json              # AI每日计划持久化
│   └── modules/
│       ├── ability.json                # 能力提升
│       ├── self-study.json             # 自考学习
│       ├── python.json                 # Python 基础
│       ├── ai-learning.json            # AI 学习
│       ├── ai-roles.json                # AI 助手角色
│       ├── reading.json                # 阅读资料
│       ├── today.json                  # 今日学习
│       └── tasks.json                  # 任务模块（番茄钟任务闹钟）
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
│   ├── today/                         # 今日学习模块页面
│   │   └── today-flow.html               # 今日学习流（线性任务流+AI伴读+自适应进度）
│   ├── ai-learning/                  # AI 学习相关页面
│   │   ├── ai-knowledge-tree.html          # AI 知识图谱（四阶段29个知识点）
│   │   ├── ai-demos.html                   # AI 实战 Demo（四阶段4个Demo）
│   │   ├── job-skill-tree.html             # 岗位技能图谱（四阶段25个知识点）
│   │   ├── job-learning-loop.html          # 岗位学习闭环
│   │   ├── ai-news-digest.html             # AI 资讯周报展示页
│   │   ├── ai-news-data.json               # 资讯周报数据（定时任务更新）
│   │   ├── ai-code-review.html             # AI 帮我复盘代码（已迁移至能力提升模块，文件保留）
│   │   ├── ai-learning-plan.html           # 已取消引用（文件保留）
│   │   ├── ai-roles-hub.html               # 已取消引用（文件保留）
│   │   └── daily-plan.html                 # 已取消引用（文件保留）
│   ├── Python基础/                   # Python 基础模块页面
│   │   ├── python-knowledge-tree.html      # 知识点详解（四阶段29个知识点）
│   │   ├── python-demos.html               # Demo实战（四阶段4个Demo）
│   │   └── python-learning-loop.html       # 学习闭环
│   ├── 能力提升/                     # 能力提升模块页面
│   │   ├── 能力提升-学习驾驶舱.html         # 进度驾驶舱
│   │   └── full-learning-roadmap.html      # 学习路线图
│   ├── 自考学习/                     # 自考科目页面
│   │   ├── 备考科目/
│   │   │   ├── 13015计算机系统原理/         # 知识框架 + 真题与错题 + 背诵与简答
│   │   │   ├── 02324离散数学/               # 知识框架 + 真题与错题 + 背诵与简答
│   │   │   └── 13003数据结构与算法/         # 知识框架 + 真题与错题 + 背诵与简答
│   │   ├── 真题练习/
│   │   │   └── 真题练习-真题与错题本.html   # 交互式真题与错题管理（URL 参数 ?subject=XXX）
│   │   ├── 背诵与简答/
│   │   │   └── 背诵与简答-核心概念背诵卡.html # 翻转卡片背诵系统（URL 参数 ?subject=XXX）
│   │   ├── 复盘总结/
│   │   │   └── 复盘总结-章节复盘.html       # 章节复盘总结（URL 参数 ?subject=XXX）
│   │   └── 未考科目/
│   │       ├── 00015英语（二）/             # 6个子页面：备考指南/词汇/题型/真题/作文/AI助手
│   │       └── 00023高等数学（工本）/
│   ├── read/                         # 阅读原始 HTML（2019 ~ 2026）
│   └── 工作台迁移方案/               # 历史说明文档
│
├── transformers/
│   └── read.py                       # 阅读模块数据转换器
│
└── .trae/skills/
    ├── reading_integration.py        # 阅读内容转换与注入核心
    ├── validate_workbench.py         # 校验脚本（可独立运行或被 build.py 调用）
    ├── integrate_reading.py          # 手动批量集成入口（已统一走 build.py）
    ├── zujian-file-router/           # 文件路由 skill
    └── integrate_reading_year/
        └── integrate_reading_year.py # 单年份手动集成入口
```

### 13. 常用命令

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

### 14. 常见问题（FAQ）

**Q: `python build.py` 报 `Cannot find module workbench_check.js`？**

A: 这是已知假失败。pre-build 清理 `__pycache__` 时连带删除了验证脚本临时生成的 `workbench_check.js`。**再跑一次 `python build.py` 即可正常通过**。

**Q: 切换浏览器/刷新后 iframe 页面不更新？**

A: v2.18.0 已从服务器端彻底修复：`dev_server.py` 强制 `Cache-Control: no-store` + 拦截 `If-Modified-Since`/`If-None-Match` 防 304。确认访问的是 `http://localhost:8000/` 而非 `file://`。

**Q: 换浏览器后掌握状态/AI 对话历史丢失？**

A: v2.18.0 已通过 API 持久化修复。掌握状态存 `data/mastery-progress.json`，AI 对话存 `data/ai-conversation.json`。前提是 `dev_server.py` 在运行——纯 `file://` 打开时降级为 localStorage。

**Q: AI 功能报错或无响应？**

A: 检查 `.env` 文件是否存在且包含 `DEEPSEEK_API_KEY=`。`dev_server.py` 必须在运行，AI 请求通过 `/api/chat` 代理而非直连。

### 15. localStorage Key 一览

新 Agent 添加功能时需避免与已有 Key 冲突：

| Key | 用途 | 写入文件 | 文件持久化 |
|---|---|---|---|
| `ai_daily_plan` | AI 统筹规划师生成的每日计划 | 能力提升-学习驾驶舱.html | data/ai-daily-plan.json (通过/api/ai-plan) |
| `ai_conversation` | AI 统筹规划师对话历史（20 条截断） | 能力提升-学习驾驶舱.html | data/ai-conversation.json (通过/api/ai-conv) |
| `self_study_weeks` | 统筹计划（按周×科目） | 能力提升-学习驾驶舱.html | — |
| `schedule_data` | 周任务数据缓存（含版本检查 SCHEDULE_VERSION） | 能力提升-学习驾驶舱.html | study-plan.json (通过/api/update-plan) |
| `recite-cards-data` | 背诵卡数据（按科目） | 背诵与简答-核心概念背诵卡.html | data/recite-cards-*.json |
| `recite-cards-version` | 背诵卡数据版本（当前 = 7） | 背诵与简答-核心概念背诵卡.html | — |
| `recite-cards-mastery` | 掌握进度（按问题文本映射，独立于卡片数据） | 背诵与简答-核心概念背诵卡.html | data/mastery-progress.json (通过/api/mastery) |
| `recite-quiz-bank-{subject}` | 测验题库（按科目隔离） | 背诵与简答-核心概念背诵卡.html | data/quiz-bank-{subject}.json (通过/api/quiz-bank) |
| `recite-quiz-ai-{subject}` | 测验AI答疑对话（按科目+题目隔离） | 背诵与简答-核心概念背诵卡.html | data/quiz-ai-{subject}.json (通过/api/quiz-ai) |
| `exam-questions-data` | 真题与错题数据（按科目） | 真题练习-真题与错题本.html | — |
| `py_knowledge_tree_v1` | Python 知识树勾选状态 | python-knowledge-tree.html | — |
| `py_kp_progress` | Python 知识点进度摘要（总数/已掌握） | python-knowledge-tree.html | — |
| `py_kp_detail_v1` | Python 知识点详细掌握状态（逐个） | python-knowledge-tree.html | — |
| `py_learning_loops_v1` | Python 闭环学习记录 | python-learning-loop.html | — |
| `ai_kp_detail_v1` | AI 知识图谱知识点掌握状态 | ai-knowledge-tree.html | — |
| `ai_kp_progress` | AI 知识点进度摘要 | ai-knowledge-tree.html | — |
| `job_kp_detail_v1` | 岗位技能图谱知识点掌握状态 | job-skill-tree.html | — |
| `ai_kp_guide_progress` | 岗位技能guide完成验证（KP1-4） | job-skill-tree.html | — |
| `job_project_detail_v1` | 岗位3个简历项目追踪 | job-learning-loop.html | — |
| `en_vocab_progress` | 英语词汇掌握度追踪 | 英语（二）-词汇系统.html | — |
| `en_qtype_errors` | 英语题型错题记录 | 英语（二）-题型专项.html | — |
| `en_exam_scores` | 英语真题成绩记录 | 英语（二）-真题模拟.html | — |
| `en_writing_practice` | 英语作文练习记录 | 英语（二）-作文模板.html | — |
| `ss_mastery_{科目代码}` | 科目掌握进度（如 ss_mastery_13015） | 各科目知识框架页 | — |
| `ss_active_tab_{科目代码}` | 科目当前 Tab（如 ss_active_tab_13003） | 各科目知识框架页 | — |

### 16. AI API 代理架构与数据持久化

浏览器中的 AI 功能**不直接调用 AI API**，而是通过本地 `dev_server.py` 的 `/api/chat` 端点代理：

```
浏览器 (fetch /api/chat)  →  dev_server.py  →  AI API (流式响应)  →  浏览器
```

- **API Key 存储**：`.env` 文件（已加入 `.gitignore`）。
- **流式输出**：`dev_server.py` 支持 SSE 流式响应，浏览器端通过 `fetch` + `ReadableStream` 接收。
- **关键文件**：
  - `dev_server.py` — `/api/chat` 端点，处理 AI API 调用、流式输出、错误处理。
  - `Workbench/能力提升/能力提升-学习驾驶舱.html` — AI 统筹规划师。
  - `Workbench/ai-learning/ai-roles-hub.html` — AI 学习规划师。

#### 数据持久化 API（v2.17.0 新增，v2.18.0 扩展）

| 端点 | 方法 | 用途 | 持久化文件 |
|---|---|---|---|
| `/api/mastery?subject=xxx` | GET | 读取掌握进度（按科目） | `data/mastery-progress.json` |
| `/api/mastery` | POST | 写入掌握进度（body = {subject, data}） | `data/mastery-progress.json` |
| `/api/quiz-bank?subject=xxx` | GET | 读取题库 | `data/quiz-bank-{subject}.json` |
| `/api/quiz-bank` | POST | 写入题库（body = {subject, data}） | `data/quiz-bank-{subject}.json` |
| `/api/quiz-ai?subject=xxx` | GET | 读取AI答疑对话 | `data/quiz-ai-{subject}.json` |
| `/api/quiz-ai` | POST | 写入AI答疑（body = {subject, data}） | `data/quiz-ai-{subject}.json` |
| `/api/ai-conv` | GET/POST | AI统筹规划师对话历史读写 | `data/ai-conversation.json` |
| `/api/ai-plan` | GET/POST | AI每日计划读写 | `data/ai-daily-plan.json` |

**读写策略**：
- **写入**：localStorage + API 双写（API fire-and-forget 不阻塞用户操作）
- **读取**：优先 API，API 失败回退 localStorage
- **dev_server.py 未运行时**：自动降级为纯 localStorage 模式
- **启动命令**：`python dev_server.py`（默认端口 8000，`--host 0.0.0.0` 支持局域网访问）

### 17. 校验规则摘要

`validate_workbench.py` 会检查以下内容：

- 嵌入 JS 语法（通过 `node --check`）。
- **全局 JS 语法校验**：扫描 `Workbench/` 下所有 HTML 文件的内嵌 JS。
- 旧独立页面类名（如 `class="essay"`）是否泄漏。
- 通用类名（如 `card`、`title`、`section`）是否未加前缀出现在模块内容中。
- **Tab 交互完整性**：若页面使用 `chapter-tab-btn`/`chapter-tab-pane`，必须同步包含对应 CSS 与切换 JS。
- 阅读模块内容完整性（section / essay 数量匹配）。
- 文件命名是否符合 `{子模块}-{任务}.html`。
- `文件说明.md` 是否覆盖了根目录与 Workbench 顶层项。
- `Workbench/` 内是否混入了 `.py` / `.log` 等临时文件。
- `.gitignore` / `.gitattributes` 是否包含必要规则。
- **目录结构同步**：扫描根目录、styles/、Workbench 各模块、data/modules/、templates/、.trae/skills/、transformers/，对比 AGENT_HANDOFF.md 是否已列出。
- **CHANGELOG 变更覆盖**：通过 `git diff HEAD --name-only` 获取已修改文件，对比 CHANGELOG.md 最新版本表格。
- **版本一致性校验**：`check_summary_version_sync()` 比较 `工作台搭建总结.md` 与 CHANGELOG.md 版本号。
- **Git pre-commit hook**：`.git/hooks/pre-commit` 在提交前自动运行 `validate_workbench.py`。

---

## 第四部分：版本历史（出问题溯源/写CHANGELOG时查）

> 触发场景：需要了解某个功能什么时候加的、为什么这么设计、查历史决策背景时，翻这部分。日常工作不需要读。

### 版本更新记录总览

| 版本 | 日期 | 摘要 |
|---|---|---|
| v1.0.0 | 2026-08-12 ~ 2026-08-13 | 工作台从单一阅读模块扩展为 6 大模块，全部线框占位替换为真实内容页；AI 学习规划师重构、统筹计划面板升级、科目 AI 助手入口 |
| v2.0.0 | 2026-08-14 | AI 统筹规划师功能增强；背诵卡页面重构；背诵卡语法错误修复（JS 字符串转义）；新增「实现即测试」硬性约束；约束文档与隐患规避方案更新；validate_workbench.py 扩展至 21 个检查函数；新增 Git pre-commit hook |
| v2.1.0 | 2026-08-15 | 背诵卡新增「测验模式」（AI 出题 + 本地降级 + 答题反馈 + 掌握度联动）；dev_server.py 支持手机访问（`--host 0.0.0.0`） |
| v2.2.0 | 2026-08-15 | 背诵卡测验模式增强：新增3种题型（计算题/名词解释题/综合应用题，共6种）；出题改为累计+持久化；已答题目测验模式自动隐藏；新增「📚 题库」模式 |
| v2.3.0 | 2026-08-15 | Python 学习内容重组为2页面+阶段按钮切换：知识点详解（29个知识点四层内容）、Demo实战（4个Demo完整设计）、学习闭环 |
| v2.4.0 | 2026-08-15 | 工作台风格统一（蓝色主题+renderMode 三种渲染模式）；Python 模块功能优化（手写练习答案折叠+代码一键复制+学习闭环接入真实数据+知识点↔Demo 双向联动） |
| v2.5.0 | 2026-08-16 | AI 学习模块重设计：移除 4 项引用、保留资讯周报、新增 AI 知识图谱（29 知识点×4 阶段）和 AI 实战 Demo（4 个 Demo） |
| v2.6.0 | 2026-08-16 | AI 学习新增「岗位突击」分类：岗位技能图谱（25 知识点）+ 学习驾驶舱 WEEK_DATA 重设计（间隔重复+交错学习） |
| v2.7.0 | 2026-08-17 | 学习驾驶舱按钮样式统一 + 学习计划时间调整（数据结构提前到Week 2） |
| v2.8.0 | 2026-08-17 | 英语（二）模块全面重设计：备考指南+词汇系统(SM-2算法)+题型专项(7种)+真题模拟(计时评分)+作文模板(5类) |
| v2.9.0 | 2026-08-18 | 背诵卡测验题库多项功能增强：AI答疑(流式对话)+markdown渲染+对话持久化+复制按钮+重做功能+题库跨科目隔离修复 |
| v2.10.0 | 2026-08-18 | 岗位技能图谱教学指引扩展：KP1-4新增guide字段+今日任务版块+Python/Demo双向关联+跨iframe导航(postMessage) |
| v2.10.1 | 2026-08-18 | highlightKp消息监听器修复+guide-section CSS修复+今日任务响应式 |
| v2.10.2 | 2026-08-19 | 前置学习关卡系统+统筹计划重设计+JSON持久化 |
| v2.11.0 | 2026-08-19 | 番茄任务闹钟+离散数学概念背诵卡重构(57张)+真题错题模块隐藏 |
| v2.12.0 | 2026-08-19 | 计算机系统原理(39→82张)+数据结构(48张)概念卡片补全+DATA_VERSION升级 |
| v2.13.0 | 2026-08-19 | 周计划结构化+日计划分科目拆分+联动标记 |
| v2.14.0 | 2026-08-19 | 周计划章节对齐教材：离散数学9章拆分+系统原理Ch5拆分+数据结构重编号 |
| v2.15.0 | 2026-08-19 | 周计划topic补全背诵卡知识点(覆盖率100%)+日计划138个练习任务补全 |
| v2.16.0 | 2026-08-19 | 系统原理卡片扩充39→82张(补全43个遗漏知识点)+MASTERY_KEY独立存储 |
| v2.17.0 | 2026-08-19 | 掌握进度+题库+AI答疑持久化到JSON文件：dev_server.py新增6个API端点 |
| v2.18.0 | 2026-08-20 | 学习指南标注+掌握状态/AI对话跨浏览器持久化+浏览器缓存彻底修复+今日学习流模块 |
| v2.18.1 | 2026-08-20 | 工作台搭建总结补全8个版本+版本一致性校验+侧边栏添加按钮隐藏 |
| v2.18.2 | 2026-08-20 | 私教功能Bug修复+番茄钟接入今日学习流+AI伴读接入掌握状态 |
| v2.18.3 | 2026-08-20 | 背诵卡计算卡优化（公式/步骤/答案三段式）+三科各新增3张计算卡 |
| v2.18.4 | 2026-08-21 | 练习测验模块开发(独立页面/按科目分离/6种题型/4种出题模式)+三科独立题库 |
| v2.19.0 | 2026-08-21 | 学习闭环整合+引导流+AI批量出题+弱点优先+错题归集+排版优化 |
| v2.19.1 | 2026-08-21 | 侧边栏排版优化（字号+字重分层，flat分类跳过冗余中间层） |
| v2.19.2 | 2026-08-21 | 知识框架样式1:1还原设计稿 |
| v2.19.3 | 2026-08-21 | 知识框架结构级1:1还原（整体定位卡片+章节彩色边框+可折叠目录+步骤旅程） |
| v2.20.0 | 2026-08-22 | 章节精讲样式1:1还原+三科统一 + 约束体系Skill化（3个Skill+5个校验脚本） |
| v2.21.0 ~ v2.27.0 | 2026-08-22 ~ 2026-08-23 | 页面合并与Bug修复：三科统一布局、div结构修复、按钮重复修复（详见 CHANGELOG.md） |

> **完整版本历史细节**（含每个版本的功能上下文、经验教训、后续建议）见原版 `AGENT_HANDOFF.md` 或 `CHANGELOG.md`。本重组版将历史教训已提炼到第一部分第6节「踩坑清单」中，不再按版本重复展开。

---

> **原版文档**：`AGENT_HANDOFF.md`（包含完整版本历史细节）
> **对比说明**：本重组版保留了原版全部条款，按板块重组并按帮助程度排序。只删除了各版本中重复出现的后续建议（如"落地学习方案优化"连续 5 个版本重复）和已标记 ✅ 完成的建议。
