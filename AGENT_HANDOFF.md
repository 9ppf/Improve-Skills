# 此刻便是春天工作台 —— Agent 交接文档

> 把本文档直接交给新 Agent，并告诉他当前任务即可开始工作。文档末尾「当前后续建议」列出待办优先级。

> **⚠ 禁止执行 `git reset --hard`、`git checkout .`、`git clean -f` 等破坏性操作**，以免丢失未提交的工作。当前有未提交变更（v2.18.2 Bug修复+增强功能）。

---

## 新 Agent 快速入口（3 步上手）

### 第 1 步：理解你要做什么

这是一个**个人私教工作台**——像教练/家教/项目经理一样引导用户学习备考和转型 AI 岗位，不是被动展示信息的面板。用户是自考本科生（武汉理工·计算机），2026年10月考试，考前学三科（系统原理/离散数学/数据结构），考后转型 AI 岗位。

**必读**（按顺序）：
1. 本文档「产品愿景：个人私教工作台」章节（→ 下滑至第47行）— 理解核心理念和用户画像
2. 本文档「设计原则」章节（→ 第80行）— 12 条用户偏好，违反会导致返工
3. 本文档「当前后续建议」章节（→ 文末）— 知道下一步该做什么

### 第 2 步：准备环境并启动

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

> **AI 功能需要 API Key**：检查 `.env` 文件是否存在、是否包含 `DEEPSEEK_API_KEY=`。不存在则向用户索取，不可自行创建。

### 第 3 步：了解当前项目状态

| 维度 | 当前状态 |
|---|---|
| 版本 | v2.18.2（2026-08-20） |
| 模块数 | 7 个（今日学习、能力提升、自考学习、Python基础、AI学习、AI助手角色、阅读资料） |
| 自考科目 | 3 科已建知识框架 + 背诵卡（187张） + 测验题库 + AI答疑 |
| 数据持久化 | 掌握状态/AI对话/题库 已通过 API 持久化到 JSON 文件，跨浏览器不丢 |
| 待办优先级 | 见文末「当前后续建议（v2.18.2 状态）」 |

> **做任何结构性变更前，必须先讨论确认方案再编码**（设计原则第1条）。只有"往已有结构里填数据"可以直接执行。

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
| v2.6.0 | 2026-08-16 | AI 学习新增「岗位突击」分类：岗位技能图谱（25 知识点 17 入门+8 精进，含项目产出和简历写法）+ 学习闭环（倒计时+四阶段路线图+五步闭环+3 项目追踪） |
| v2.7.0 | 2026-08-17 | 学习驾驶舱按钮样式统一 + 学习计划时间调整（数据结构提前到Week 2、离散数学匀到Week 1-5、AI项目3提前到Week 5启动） |
| v2.8.0 | 2026-08-17 | 英语（二）模块全面重设计：备考指南+词汇系统(SM-2算法)+题型专项(7种)+真题模拟(计时评分)+作文模板(5类) |
| v2.9.0 | 2026-08-18 | 背诵卡测验题库多项功能增强：AI答疑(流式对话)+markdown渲染+对话持久化(测验↔题库共享)+复制按钮+重做功能+题库跨科目隔离修复 |
| v2.10.0 | 2026-08-18 | 岗位技能图谱教学指引扩展：KP1-4新增guide字段(tutorial+practice+completion)+今日任务版块(自动匹配周次)+Python/Demo双向关联+跨iframe导航(postMessage) |
| v2.10.1 | 2026-08-18 | 方案A落地后改进修复：highlightKp消息监听器(跨iframe跳转后自动定位高亮)+guide-section嵌套CSS修复+今日任务版块响应式设计 |
| v2.10.2 | 2026-08-19 | 前置学习关卡系统+统筹计划重设计+JSON持久化：study-plan.json新建(10周计划数据源)、岗位技能图谱KP1-4前置关卡结构化、学习驾驶舱7时段扩展 |
| v2.11.0 | 2026-08-19 | 番茄任务闹钟+离散数学概念背诵卡重构(def/ex/exam三字段+57张卡片+JSON持久化)+真题错题模块hidden隐藏 |
| v2.12.0 | 2026-08-19 | 计算机系统原理(39张)+数据结构(48张)概念卡片补全+卡片正面间隔修复+DATA_VERSION升级清除旧缓存 |
| v2.13.0 | 2026-08-19 | 周计划结构化(subject+chapter+topic)+日计划分科目拆分+联动标记(日任务完成→周计划自动标记)+完成状态写回JSON(/api/update-plan) |
| v2.14.0 | 2026-08-19 | 周计划章节对齐教材：离散数学9章拆分(Ch3/5/7独立)+系统原理Ch5拆分+数据结构重编号(Ch6/7/8正确)+新增Ch4数组广义表 |
| v2.15.0 | 2026-08-19 | 周计划topic补全背诵卡知识点(覆盖率100%)+日计划chapter补全(138个练习任务)+日计划topic同步周计划 |
| v2.16.0 | 2026-08-19 | 系统原理卡片扩充39→82张(补全43个遗漏知识点)+DATA_VERSION升至7+fetch加cache:no-cache+MASTERY_KEY独立存储(版本变化保留掌握进度) |
| v2.17.0 | 2026-08-19 | 掌握进度+题库+AI答疑持久化到JSON文件：dev_server.py新增6个API端点(mastery/quiz-bank/quiz-ai)、data/下新增持久化文件、localStorage降级为缓存(API失败回退) |
| v2.18.0 | 2026-08-20 | 学习指南标注(learning-guide.json+三科知识框架页CSS/JS改造) + 掌握状态/AI对话跨浏览器持久化(mastery API按科目读写+ai-conv/ai-plan API) + 浏览器缓存彻底修复(no-store+拦截304) + 今日学习流模块(today-flow.html) |
| v2.18.1 | 2026-08-20 | 工作台搭建总结补全8个版本(v2.10.1-v2.18.0) + 新增check_summary_version_sync()校验(工作台搭建总结vs CHANGELOG版本一致性) + 版本控制规范pre-commit清单补充三文档同步要求 |
| v2.18.2 | 2026-08-20 | 私教功能Bug3修复(postMessage状态同步链路+dailyPlans同步写回) + 增强6弱点优先本地降级排序 + 增强7番茄钟接入今日学习流(25分钟专注+5分钟休息循环) + 增强8 AI伴读接入掌握状态(四个AI函数注入掌握上下文) |

> **当前版本：v2.18.2** — 详见 `CHANGELOG.md` v2.18.2 章节。

---

## 项目一句话描述

一个 Python 构建的静态 HTML 个人工作台，聚合「今日学习」「能力提升」「自考学习」「Python 基础」「AI 学习」「AI 助手角色」与「阅读资料」七大模块，主题可切换，支持本地热重载预览。v2.18.1 当前状态：三科知识框架页已接入学习指南标注（优先级+类型+学习建议可视化）、掌握状态和AI对话通过API实现跨浏览器持久化（localStorage+JSON双写）、浏览器缓存彻底修复（no-store+拦截304）、新增今日学习流模块、工作台搭建总结版本一致性校验。

---

## 产品愿景：个人私教工作台

这个工作台不是一个被动展示信息的面板，而是一个**像个人私教一样主动引导用户学习和完成项目**的智能工作台。新 Agent 在做任何功能决策时，都应以此为最高准则：

### 核心理念

1. **主动引导，而非被动展示** — 工作台应该告诉用户"今天学什么、怎么学、学多久"，而不是让用户自己去找内容。AI 统筹规划师、今日学习流、番茄钟任务闹钟都是这一理念的体现。
2. **重点醒目，减轻焦虑** — 知识点必须有优先级标注（重点/一般/了解）和学习方式指导（计算/背诵/理解/应用），用背景色、图标等视觉手段让用户一眼抓住重点，消除"遗漏关键内容"的焦虑。
3. **学习闭环** — 知识框架 → 背诵卡片 → 测验题库 → 真题练习 → 复盘总结，每个环节的数据要打通，掌握状态联动更新。
4. **AI 直接生成计划** — 用户期望 AI 能直接调用工具生成学习计划，而不是只给提示词让用户自己去问。AI 统筹规划师（对话式生成每日计划）和岗位技能图谱的教学指引（tutorial+practice+completion）都是这一理念的体现。
5. **数据不丢失** — 掌握状态、AI对话历史、题库等关键数据通过 API 持久化到 JSON 文件，换浏览器、换 Agent 都不丢。

### 用户画像

| 维度 | 内容 |
|---|---|
| 身份 | 自考本科生（武汉理工大学·计算机科学与技术），前端开发背景，目前在上海嘉定 |
| 考试目标 | 2026年10月自考（计算机系统原理、离散数学、数据结构与算法三科） |
| 职业目标 | 考后立即转型 AI 岗位，需在学习阶段同步准备岗位技能和简历级项目 |
| 技术水平 | 前端熟练；Python 零基础；AI 初学者 |
| 时间分配 | 自考 60%、AI 学习 25%、英语 5%、休息 10% |
| 学习周期 | 10 周冲刺备考 → 考后 12 周岗位转型 |
| 备考工具 | 飞书文档（笔记）、本工作台（学习引导+进度追踪） |

### 工作台与用户的关系

工作台扮演三个角色：
- **教练**：制定计划、分配任务、追踪进度、提醒复盘（学习驾驶舱、今日学习流、番茄钟）
- **家教**：讲解知识点、出题测验、答疑解惑（知识框架页、背诵卡测验、AI答疑）
- **项目经理**：管理岗位技能图谱、简历项目追踪、学习闭环（岗位技能图谱、岗位学习闭环）

---

## 设计原则（用户偏好提炼）

新 Agent 在做功能设计和交互决策时，必须遵守以下原则。这些原则来自用户在 v1.0.0-v2.18.1 期间反复强调的偏好，违反任何一条都可能导致返工。

### 交互设计

1. **方案先行再编码** — 涉及结构性变更（增删分类、重组导航、改变信息架构）前，必须先讨论确认方案再落地。只有"往已有结构里填数据"的内容填充可以直接执行。（核心原则第4条）
2. **按钮切换优于 Tab 切换** — 内容视图切换优先使用按钮（与 AI 规划助手风格一致），而非 Tab 条。知识框架页的「学习计划 / 知识总览」就是按钮切换。
3. **编辑/删除按钮默认隐藏** — 桌面端 hover/focus 时显示，移动端永久显示。避免界面杂乱。（侧边栏添加按钮已隐藏，因为当前不需要手动添加）
4. **AI 对话历史只保留最近 20 条** — 超过自动截断，避免 localStorage 膨胀。
5. **AI 对话入口直接可见** — 用户期望 AI 对话入口直接可见，而非藏在菜单里。一次性问题用提示词，后续追问用直接 AI 对话。

### 视觉设计

6. **重点内容必须醒目** — 知识点优先级不能只用标签，必须用背景色区分（重点=红色背景、一般=黄色背景、了解=灰色背景），配合图标和排序，让用户一眼抓住重点。
7. **中文风可爱图标** — 使用 🏮📚🎋🍑🍵🌸🎐 等 emoji 作为模块/分类图标，图标应可修改。
8. **渐变按钮仅用于"添加"操作** — 只有"添加"类按钮保留渐变色，编辑/删除等操作按钮使用纯色。
9. **最小化过度工程** — 用户对细节敏感，偏好简洁直接的方案，反对不必要的抽象和过度设计。

### 内容设计

10. **知识点必须有优先级和学习方式标注** — 每个知识点标注优先级（重点/一般/了解）和学习方式（计算/背诵/理解/应用），减少"该重点学的内容被遗漏"的焦虑。
11. **不修改已完成框架的现有面板** — 用户偏好保持已有框架的完整性，新增功能尽量以独立面板/模块方式添加，而非改动现有面板。
12. **数据版本控制偏好** — 修改方案前先做版本记录并提交 Git，方便后续回溯。

### AI 协作建议

以下建议来自用户在 v1.0.0-v2.18.1 期间的协作模式总结，帮助新 Agent 快速建立正确的沟通节奏。

**沟通方式**：

13. **先讨论再动手** — 用户明确要求"先讨论可行方案再生成产品"。提出方案时给出推荐选项和主要取舍（2-3 句），让用户可以重定向，而不是直接开干。但"往已有结构里填数据"可以直接执行，不需要讨论。
14. **用方案对比代替开放式提问** — 不要问"你觉得怎么做？"，而是问"A 方案更简洁但 B 方案更完整，推荐 A，你选哪个？"。用户对细节敏感但不想做开放式决策，偏好在有选项的情况下做选择。
15. **响应要简短直接** — 用户偏好简洁的沟通，不需要冗长的解释。状态更新一句话足够，技术细节在代码和文档里说。

**自主度边界**：

16. **可以直接做的**：往已有结构填数据、修复 bug、调整样式、更新文档、运行构建校验。
17. **必须先确认的**：增删模块/分类、重组导航、改变信息架构、删除文件或分支、Git push、修改约束规范。
18. **绝不做的**：`git reset --hard`、`git checkout .`、`git clean -f`、硬编码 API Key、跳过 pre-commit hook（除非用户明确要求）。

**技术盲区**：

19. **Python 代码用户无法审查** — 用户 Python 零基础，生成 Python 代码后必须自行校验逻辑合理性，不能依赖用户发现错误。涉及 Python 的变更需额外说明做了什么、为什么。
20. **浏览器缓存问题是高频痛点** — 用户多次因缓存导致看不到更新而困惑。任何涉及前端页面的变更，必须同时给出缓存控制方案（版本参数 + HTTP 头），不能只改内容不管缓存。

**情绪管理**：

21. **"遗漏重点"是核心焦虑源** — 用户反复表达"怕漏掉关键内容"。新增学习内容时必须标注优先级，改知识框架时必须检查是否有章节被遗漏，校验时增加覆盖率检查。
22. **出错时给根因不只给补丁** — 用户偏好系统性解决方案。出 bug 时先解释根因（为什么会发生），再给修复方案（怎么防止再发生），不要只修表面症状。

### 协作改进（v2.18.1 反思总结）

> 以下来自 v1.0.0-v2.18.1 期间用户与 AI 的协作复盘，针对反复出现的沟通问题制定。

23. **每次文档变更后给"改动清单"** — 不要只说"已更新文档"。必须列出：文件名、章节名、行号范围、具体改了什么（新增/修改/删除）。用户打开文件时能直接定位到改动，不用自己找。
24. **不主动做关联检查是最大的浪费** — 修了一个问题后必须主动查相邻问题。用户曾多次连续追问"还有什么问题"，每轮都发现新问题——说明第一次就应该做完整审计，而非逐轮挤牙膏。规则：任何文档类任务，交付前至少跑一遍交叉检查（版本号一致性、引用时效性、相邻章节是否过时）。
25. **宣布"完成"前对照验收标准** — 用户偏好先讨论方案再执行，方案应包含可验证的"完成标准"。如果用户没给，主动提一句"完成标准：XXX，你看对不对？"。功能能跑 ≠ 任务完成，文档准确性和时效性是完成标准的一部分。
26. **文档一致性是硬约束不是软建议** — CHANGELOG.md、AGENT_HANDOFF.md、工作台搭建总结.md 三份文档的版本号必须同步，后续建议必须反映最新状态，FAQ 必须覆盖已知问题。`validate_workbench.py` 的 `check_summary_version_sync()` 已自动校验版本号，但内容时效性需要 Agent 人工保证。

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
├── CHANGELOG.md                      # 变更日志（当前版本 v2.18.1）
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
│   │   ├── ai-knowledge-tree.html          # AI 知识图谱（四阶段29个知识点：概念/代码/练习/AI场景）
│   │   ├── ai-demos.html                   # AI 实战 Demo（四阶段4个Demo：目标/功能/代码/测试/知识点映射）
│   │   ├── job-skill-tree.html             # 岗位技能图谱（四阶段25个知识点：17入门+8精进，含guide教学指引+今日任务版块）
│   │   ├── job-learning-loop.html          # 岗位学习闭环（四阶段路线图+五步闭环+3简历项目追踪）
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
│   │       │   ├── 00015英语（二）-备考指南.html    # 七种题型分析+分值分布+10周学习路线+备考策略
│   │       │   ├── 英语（二）-词汇系统.html         # 高频词表+SM-2间隔重复+闪卡+测验+掌握度追踪
│   │       │   ├── 英语（二）-题型专项.html          # 7种题型分Tab：解题技巧+练习题+错题记录+正确率
│   │       │   ├── 英语（二）-真题模拟.html          # 按年份真题套卷+150分钟计时+交卷评分+成绩记录
│   │       │   ├── 英语（二）-作文模板.html          # 5类作文模板+高分句型+范文+万能句型库+练习区
│   │       │   └── 00015英语（二）-知识框架与学习计划.html  # 旧版知识框架页（已被备考指南替代）
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

## 常见问题（FAQ）

### Q: `python build.py` 报 `Cannot find module workbench_check.js`？

A: 这是已知假失败。pre-build 清理 `__pycache__` 时连带删除了验证脚本临时生成的 `workbench_check.js`，导致第一次构建的 JS 语法校验报 `MODULE_NOT_FOUND`。**再跑一次 `python build.py` 即可正常通过**，不需要修任何代码。

### Q: 切换浏览器/刷新后 iframe 页面不更新？

A: v2.18.0 已从服务器端彻底修复：`dev_server.py` 强制 `Cache-Control: no-store` + 拦截 `If-Modified-Since`/`If-None-Match` 防 304。如果仍出现，确认你访问的是 `http://localhost:8000/` 而非 `file://` 直接打开——缓存控制只在 HTTP 服务下生效。

### Q: 换浏览器后掌握状态/AI 对话历史丢失？

A: v2.18.0 已通过 API 持久化修复。掌握状态存 `data/mastery-progress.json`，AI 对话存 `data/ai-conversation.json`。前提是 `dev_server.py` 在运行——纯 `file://` 打开时降级为 localStorage，换浏览器会丢。

### Q: AI 功能报错或无响应？

A: 检查 `.env` 文件是否存在且包含 `DEEPSEEK_API_KEY=`。不存在则向用户索取，不可自行创建或硬编码。`dev_server.py` 必须在运行，AI 请求通过 `/api/chat` 代理而非直连。

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

## AI API 代理架构与数据持久化

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

### 数据持久化 API（v2.17.0 新增，v2.18.0 扩展）

除 AI 对话代理外，`dev_server.py` 还提供数据持久化端点，将用户学习进度从 localStorage 迁移到 JSON 文件，**跨浏览器、跨 Agent 不丢失**：

| 端点 | 方法 | 用途 | 持久化文件 |
|---|---|---|---|
| `/api/mastery?subject=xxx` | GET | 读取掌握进度（按科目） | `data/mastery-progress.json` |
| `/api/mastery` | POST | 写入掌握进度（body = {subject, data}） | `data/mastery-progress.json` |
| `/api/quiz-bank?subject=xxx` | GET | 读取题库 | `data/quiz-bank-{subject}.json` |
| `/api/quiz-bank` | POST | 写入题库（body = {subject, data}） | `data/quiz-bank-{subject}.json` |
| `/api/quiz-ai?subject=xxx` | GET | 读取AI答疑对话 | `data/quiz-ai-{subject}.json` |
| `/api/quiz-ai` | POST | 写入AI答疑（body = {subject, data}） | `data/quiz-ai-{subject}.json` |
| `/api/ai-conv` | GET | 读取AI统筹规划师对话历史 | `data/ai-conversation.json` |
| `/api/ai-conv` | POST | 写入AI统筹规划师对话历史 | `data/ai-conversation.json` |
| `/api/ai-plan` | GET | 读取AI每日计划 | `data/ai-daily-plan.json` |
| `/api/ai-plan` | POST | 写入AI每日计划 | `data/ai-daily-plan.json` |

**读写策略**：
- **写入**：localStorage + API 双写（API fire-and-forget 不阻塞用户操作）
- **读取**：优先 API，API 失败回退 localStorage
- **dev_server.py 未运行时**：自动降级为纯 localStorage 模式，功能正常但跨浏览器不保留
- **启动命令**：`python dev_server.py`（默认端口 8000，`--host 0.0.0.0` 支持局域网访问）

---

## localStorage Key 一览

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
| `recite-quiz-bank-{subject}` | 测验题库（按科目隔离，如 recite-quiz-bank-13015） | 背诵与简答-核心概念背诵卡.html | data/quiz-bank-{subject}.json (通过/api/quiz-bank) |
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

## v1.0.0 状态（2026-08-12 ~ 2026-08-13，归档）

> ⚠ 本节为 v1.0.0 历史快照，模块数量等信息已过时。当前模块数见「项目一句话描述」。

- 工作台已从单一「阅读资料」模块扩展为 6 大模块：能力提升、自考学习、Python 基础、AI 学习、AI 助手角色、阅读资料。（v2.18.0 新增「今日学习」后为 7 大模块）
- `data/workbench.json` 已注册全部 6 个模块；`tasks` 模块已禁用。（当前为 7 个模块）
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
- **版本一致性校验（v2.18.1 新增）**：`check_summary_version_sync()` 比较 `工作台搭建总结.md` 的「当前文档版本」与 CHANGELOG.md 最新版本号，不一致时警告。
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
2. **填充真题与背诵内容** — ~~背诵卡目前是空框架~~ v2.0.0 已内置 13015（86 张）和 en（6 张）预置卡片；~~02324 和 13003 仍需补充~~ ✅ v2.11.0-v2.12.0 已补齐（离散数学 57 张、数据结构 48 张、系统原理扩充至 82 张，共 187 张）。真题与错题本仍为空框架，需用户逐步添加。
3. **AI 资讯周报数据更新** — 定时任务每周六生成周报后，需更新 `Workbench/ai-learning/ai-news-data.json`。
4. **结构性变更约束** — 已写入核心原则第 4 条，不再作为建议。

> 以上为 v1.0.0 归档内容。新 Agent 请直接跳转至文末「当前后续建议（v2.18.2 状态）」查看最新待办。

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

---

## v2.6.0 更新内容（2026-08-16）

> 文件级变更明细详见 `CHANGELOG.md` v2.6.0 章节。本节记录功能级上下文与后续建议。

### 1. AI 学习新增「岗位突击」模块

**背景**：用户的目标是自考后立即转型 AI 岗位，需要在学习阶段就同步准备岗位技能和简历级项目。因此在 AI 学习模块新增「岗位突击」分类，将岗位技能与学习路径结构化关联。

**岗位技能图谱**（`job-skill-tree.html`）：
- 四阶段 25 个知识点：Stage 1 基础工程（4 个）、Stage 2 AI 服务开发（6 个）、Stage 3 模型应用（7 个）、Stage 4 部署运维（4 个）+ 面试精进（4 个，Stage 4 合并）
- 入门级知识点（17 个）标注项目产出和简历写法；精进级（8 个）标注面试突击要点
- 每知识点含概念、代码示例、手写练习（含答案折叠）、项目场景
- 阶段按钮切换、搜索、进度跟踪（localStorage `job_kp_detail_v1`）、代码一键复制

**岗位学习闭环**（`job-learning-loop.html`）：
- 考试倒计时（与学习驾驶舱共用考试日期 2026.10）
- 总进度：入门 17 知识点 + 3 个简历项目
- 四阶段路线图（进度条联动 `job_kp_detail_v1`）
- 五步闭环：学→练→复→测→迭
- 3 个简历项目追踪（任务清单+进度条，localStorage `job_project_detail_v1`）

### 2. 学习驾驶舱 WEEK_DATA 重设计

应用科学学习方案重新设计周任务数据：
- **AI 学习时间提至 20%**（Python 并入 AI），时间分配：自考 60% + AI 20% + 英语 10% + 复盘 10%
- **间隔重复**：后续章节穿插"间隔复习"周
- **交错学习**：同周混合多科目，避免连续只学一科
- **数据结构第 2 周提前启动**（学位课重点）
- 标签更新：py →"AI工程"，ai →"AI学习"
- `SCHEDULE_VERSION = 'v2.6.2'`，版本不匹配时清除 localStorage `schedule_data` 旧缓存

### 3. v2.6.0 经验教训

- **数据缓存版本控制**：周任务数据缓存在浏览器 `localStorage['schedule_data']`，修改 WEEK_DATA 后旧缓存会导致用户看到旧计划。通过 `SCHEDULE_VERSION` 版本检查机制解决——版本不匹配时自动清除缓存。
- **localStorage Key 独立**：岗位技能图谱的 `job_kp_detail_v1` 与 Python 模块的 `py_kp_detail_v1` 独立，避免不同模块进度数据混淆。

### 4. v2.6.0 后续建议

1. ~~**岗位技能图谱 guide 字段**~~ — ✅ 已在 v2.10.0 实现（KP1-4 先做样板）。
2. **岗位技能图谱 KP5-25 内容补充** — Stage 2-4 的知识点内容可根据学习进度逐步深化。
3. **简历项目实际开发** — 3 个简历项目目前为任务清单设计，尚未实际创建项目并编码。

---

## v2.7.0 更新内容（2026-08-17）

> 文件级变更明细详见 `CHANGELOG.md` v2.7.0 章节。本节记录功能级上下文与后续建议。

### 1. 学习驾驶舱按钮样式统一

- 顶部按钮和阶段按钮统一尺寸（padding/圆角/字号）和 hover 上浮效果
- AI 场景按钮间距增大（gap 0.5→0.75rem）
- 修复隐藏标题残留 `margin-top: 1rem`（标题移除后外边距未清理留下空白）
- 清理废弃 `.dash-header` 相关 CSS
- 修复多余 `</div>` 标签

### 2. 学习计划时间调整

| 调整项 | 原方案 | 新方案 | 理由 |
|---|---|---|---|
| 数据结构 | Week 3 启动，4 周完成 | Week 2 启动，5 周完成 | 学位课，分数需 ≥70，需更多时间 |
| 离散数学 | Week 1-4，Week 5 只做 3 章 | 匀到 Week 1-5，Week 5 减到 2 章（Ch7 图论提前到 Week 4） | 避免后期负担过重 |
| AI 项目 3 | Week 6 启动 | Week 5 启动，Week 6 只做完善 | 提前启动留出冲刺期缓冲 |

阶段日期同步调整：初级 8/18-9/21、中间 9/22-10/5、冲刺 10/6-10/24。`SCHEDULE_VERSION` 升至 v2.6.3。

### 3. v2.7.0 经验教训

- **HTML 结构改动后必须检查残留**：标题隐藏后残留 `margin-top` 造成空白，移除包裹层时遗留多余 `</div>` 标签。这类问题需在浏览器中实际查看才能发现。
- **contentUrl 版本号需同步更新**：修改内容页后工作台加载 URL 仍为旧版本号，浏览器直接使用缓存。需在 `contentUrl` 中更新版本参数。

---

## v2.8.0 更新内容（2026-08-17）

> 文件级变更明细详见 `CHANGELOG.md` v2.8.0 章节。本节记录功能级上下文与后续建议。

### 1. 英语（二）模块全面重设计

**背景**：英语（二）原模块只有 3 个子项（知识框架、背诵卡、AI助手），内容过于简略且不适合语言学习。用户决定按题型组织结构，从 3 项扩展为 6 项。

**新模块结构**：

| 子项 | 文件 | 核心功能 | localStorage |
|---|---|---|---|
| 备考指南 | 00015英语（二）-备考指南.html | 七种题型分析（卡片+分值+难度+策略）、分值分布图（阅读40/完形30/写作30）、10周学习路线、备考策略 | — |
| 词汇系统 | 英语（二）-词汇系统.html | 高频词表（核心+重点+拓展）、SM-2 间隔重复算法、闪卡学习模式（4级评分）、中英互译选择测验、词表搜索 | `en_vocab_progress` |
| 题型专项 | 英语（二）-题型专项.html | 7种题型 Tab 切换（阅读判断/阅读选择/概括补全/填句补文/填词补文/完形补文/短文写作），每题型含解题技巧+练习题+错题记录+正确率统计 | `en_qtype_errors` |
| 真题模拟 | 英语（二）-真题模拟.html | 按年份真题套卷列表、150分钟计时器、选择题答题+交卷评分、分题型得分统计 | `en_exam_scores` |
| 作文模板 | 英语（二）-作文模板.html | 5类 Tab（观点论述/问题解决/现象分析/书信应用/万能句型），每类含结构框架+高分句型+范文+练习区（词数统计），万能句型库20句 | `en_writing_practice` |
| AI助手 | （复用 ai-roles-hub.html?subject=00015） | 针对英语科目生成学习计划、出题、讲错题 | — |

### 2. 设计决策

- **按题型组织而非理科科目模板**：英语学习不适合"知识框架→真题→背诵"的自考理科模板，改为按题型专项训练+词汇+作文的结构。
- **SM-2 间隔重复算法**：词汇系统采用 SuperMemo-2 算法实现科学的间隔重复记忆，而非简单的翻卡背诵。
- **旧版知识框架页保留**：`00015英语（二）-知识框架与学习计划.html` 保留在磁盘但被备考指南替代。

### 3. v2.8.0 后续建议

1. **词汇数据扩充** — 高频词表目前为核心+重点+拓展词，可根据实际考试大纲继续补充。
2. **真题模拟套卷补充** — 目前真题套卷数量有限，需逐步添加历年真题。
3. **作文练习 AI 评分** — 目前作文练习区只有词数统计，可考虑接入 AI 评分。

---

## v2.9.0 更新内容（2026-08-18）

> 文件级变更明细详见 `CHANGELOG.md` v2.9.0 章节。本节记录功能级上下文与后续建议。

### 1. 背诵卡测验题库多项功能增强

本版本是对 v2.1.0-v2.2.0 背诵卡测验模式的重大增强，涉及多个子版本迭代（v2.8.1 → v2.9.0）。

**AI 答疑功能**（v2.8.1/v2.8.3）：
- 测验模式答题反馈区新增「🤖 问 AI」按钮，点击展开迷你对话区
- 自动将题目+用户答案+参考答案作为上下文发送给 AI，流式输出详细讲解
- 支持追问对话（Enter 发送/Shift+Enter 换行），每题独立对话上下文
- 题库模式也支持「问 AI」，测验↔题库共享对话记录

**对话持久化**（v2.8.6/v2.9.0）：
- AI 答疑对话持久化到 `localStorage['recite-quiz-ai-{subject}']`（按科目+题目 qid 存储）
- 页面刷新后自动恢复历史对话
- 有答疑的题目显示「💬 有答疑」绿色徽章
- 按钮文字动态切换：有记录显示「💬 查看答疑」、无记录显示「🤖 问 AI」

**Markdown 渲染**（v2.8.7）：
- AI 回复支持 markdown 渲染：加粗/标题/列表/代码块/数学公式

**复制功能**（v2.8.8/v2.9.0）：
- AI 答疑 header 新增「复制」按钮，复制完整对话记录（含【我的问题】【AI 解答】标记）
- 复制按钮移入 header 两端对齐，移除每条消息上的复制按钮

**重做功能**（v2.8.4/v2.8.5）：
- 题库每道已答题目新增「🔄 重做」按钮
- 点击后保存当前答题记录到 `attempts` 数组，重置题目状态
- 题库元数据区显示「已重做 X 次」徽章
- 所有题目均显示按钮：已答显示「重做」、未答显示「练习」，点击自动切换测验模式并高亮定位

**跨科目隔离修复**（v2.8.2）：
- 修复 `QUIZ_BANK_KEY` 未按科目隔离的 bug：从固定值 `recite-quiz-bank` 改为 `recite-quiz-bank-{subject}`

### 2. v2.9.0 经验教训

- **AI 答疑对话上下文设计**：每题独立对话上下文，避免不同题目的讨论互相干扰。对话按 qid 存储，切换科目时同步更新 key。
- **题库跨科目隔离**：v2.1.0 的 `recite-quiz-bank` 是全局 key，导致切换科目后题目混淆。v2.8.2 修复为按科目隔离，但需注意旧数据迁移。
- **Markdown 渲染安全性**：AI 回复内容直接插入 DOM 时需注意 XSS 风险，使用正则转换而非 innerHTML 直接赋值。

---

## v2.10.0 更新内容（2026-08-18）

> 文件级变更明细详见 `CHANGELOG.md` v2.10.0 章节。本节记录功能级上下文与后续建议。

### 1. 岗位技能图谱教学指引扩展（方案A）

**背景**：用户发现每日学习计划（如创建 venv、pip 安装依赖、标准项目结构）与岗位技能图谱内容脱节——计划是具体步骤但缺少教学指导，用户作为 Python 初学者不知道"怎么学"。用户选择扩展岗位技能图谱的 guide 字段（方案A），为每个知识点添加教学指引，并在页面顶部新增「今日任务」版块，自动匹配当前周次的学习计划并展示对应 KP 的教学指引。

**guide 字段结构**（KP1-4 已完成，作为样板）：

```
guide: {
  prereq: "前置条件",
  tutorial: "教程跟学（步骤化指引）",
  practice: "渐进练习（从易到难）",
  completion: "完成验证（自动检测条件）",
  relatedKp: "关联 Python 知识点 / Demo",
  estimated: "预估时间"
}
```

**今日任务版块**：
- 页面顶部新增「今日任务」区域
- `getCurrentWeek()` 解析 `WEEK_DATA` 的 `dates` 字段（如 '8/18 — 8/24'），用 `new Date()` 判断当前周次
- `renderTodayPanel()` 匹配当前周次任务到对应 KP
- `renderTodayGuide()` 渲染每个 KP 的教学指引卡片
- 支持点击 KP 卡片切换教学指引详情

**Python/Demo 双向关联**：
- `python-knowledge-tree.html` 新增 `JOB_KP_MAP`（5 个 Python 知识点关联岗位技能 KP），卡片底部新增「关联岗位技能」标签
- `python-demos.html` 新增 `JOB_DEMO_MAP`（4 个 Demo 关联岗位技能 KP）
- `ai-demos.html` 新增 `JOB_AI_DEMO_MAP`（2 个 AI Demo 关联岗位技能 KP）
- 点击关联标签触发跨 iframe 导航

**跨 iframe 导航**：
- `templates/workbench.html` 新增 `postMessage` 监听器
- 子 iframe 发送 `{ action: 'navigate', module, item, kpId }` → 工作台查找目标项 → `selectItem` 切换 → 发送 `highlightKp` 消息
- 目标页面收到 `highlightKp` 消息后自动切换 Stage + 展开 KP + 滚动定位 + 高亮闪烁

### 2. v2.10.0 经验教训

- **JS 中 `</script>` 标签未转义**：岗位技能图谱页面中 Vue 代码示例包含 `</script>` 标签，HTML 解析器误认为当前 script 块结束，导致后续代码丢失。需将 `</script>` 转义为 `<\/script>` 或拆分字符串。
- **跨 iframe 通信需双向监听**：工作台向子 iframe 发送 `highlightKp` 消息后，子 iframe 需有对应的 `message` 事件监听器才能响应。v2.10.1 修复了 job-skill-tree.html 缺少监听器的问题。
- **guide-section 类名嵌套**：`renderTodayGuide` 中外层和内层都使用 `.guide-section` 类名，导致 CSS 规则叠加，间距翻倍。v2.10.1 修复为外层改用 `.guide-kp-wrap`。

### 3. v2.10.0 后续建议

1. **KP5-25 guide 字段** — 目前仅 KP1-4 有教学指引，KP5-25 需按学习进度逐步编写。Stage 1 样板制作流程已记录，可复用。
2. **今日任务按时段分组** — 当前所有 KP 任务混在一起显示，用户希望按课程表时段分组（AI工程 16:30-17:30、AI学习 19:30-20:30），让任务和课表直接对应。
3. **AI_WEEKLY_TASKS 与 WEEK_DATA 数据重复** — `job-skill-tree.html` 有一份 `AI_WEEKLY_TASKS` 数据与学习驾驶舱的 `WEEK_DATA` 重复，需统一为引用同一数据源。

---

## v2.10.1 更新内容（2026-08-18）

> 文件级变更明细详见 `CHANGELOG.md` v2.10.1 章节。本版本为 v2.10.0 落地后的改进修复。

### 1. 改进修复内容

| 修复项 | 问题描述 | 修复方式 |
|---|---|---|
| highlightKp 消息监听 | `job-skill-tree.html` 缺少 `highlightKp` 消息监听器，从 Python/Demo 页面反向跳转后无法自动定位/高亮 KP | 新增 `message` 事件监听器，收到 `highlightKp` 后自动切换 Stage + 展开 KP + 滚动定位 + 高亮闪烁 |
| guide-section CSS 嵌套 | `renderTodayGuide` 中外层和内层都使用 `.guide-section` 类名，CSS margin 叠加导致间距过大 | 外层改为 `.guide-kp-wrap`，避免类名冲突 |
| 今日任务响应式 | `.today-panel` 在窄屏设备上布局错乱 | 新增 `@media` 响应式样式，窄屏下垂直堆叠 |
| AI_WEEKLY_TASKS 注释 | `AI_WEEKLY_TASKS` 数据与 `WEEK_DATA` 重复，缺少同步提醒 | 添加注释提醒两处数据需同步更新 |

### 2. v2.10.1 经验教训

- **跨 iframe 通信需双向验证**：工作台发送消息后，必须确认目标 iframe 有对应的监听器。仅在工作台端发送消息而不在目标页面接收，会导致导航后无响应。
- **CSS 类名避免嵌套重复**：同一函数渲染的 HTML 中外层和内层容器不应使用相同类名，否则 CSS 规则会叠加导致样式异常。

---

## v2.15.0 ~ v2.17.0 更新内容（2026-08-19）

> 文件级变更明细详见 `CHANGELOG.md` 对应版本章节。

### 功能摘要

| 版本 | 核心变更 |
|---|---|
| v2.15.0 | 周计划topic补全背诵卡全部知识点（覆盖率100%）；日计划138个练习任务补全chapter字段；日计划topic同步周计划 |
| v2.16.0 | 系统原理卡片扩充39→82张（补全43个遗漏知识点：运算方法、指令详解、cache替换算法、多级页表、总线结构等）；DATA_VERSION升至7；fetch加cache:no-cache和?v=参数绕过浏览器缓存；新增MASTERY_KEY独立存储掌握进度（版本变化时先备份再清除卡片数据，加载后按问题文本恢复） |
| v2.17.0 | 掌握进度+题库+AI答疑持久化到JSON文件：dev_server.py新增6个API端点（GET/POST /api/mastery、GET/POST /api/quiz-bank、GET/POST /api/quiz-ai）；data/下新增mastery-progress.json、quiz-bank-{subject}.json、quiz-ai-{subject}.json；localStorage降级为缓存（API失败自动回退）；初始化流程并行fetch三个API与三个JSON文件 |

### v2.17.0 经验教训

- **localStorage 不适合存储关键用户数据**：浏览器清缓存、换端口、换协议、换浏览器都会丢失。项目已将周计划、掌握进度、题库、AI答疑全部迁移到JSON文件持久化。
- **版本变化时需保护用户进度**：DATA_VERSION升级会清除localStorage，必须在清除前备份掌握进度，加载新数据后按问题文本恢复。
- **浏览器缓存导致数据不更新**：fetch JSON时需加`?v=版本号`参数和`cache: 'no-cache'`策略，否则浏览器返回旧缓存。
- **API 双写策略**：写入时同时写localStorage和API文件（fire-and-forget），读取时优先API、失败回退localStorage。dev_server.py未运行时自动降级为纯localStorage模式。

---

## v2.18.0 更新内容（2026-08-20）

> 文件级变更明细详见 `CHANGELOG.md` v2.18.0 章节。本节记录功能级上下文与后续建议。

### 1. 学习指南标注系统

**背景**：用户反馈学习方案枯燥、重点不明确，不知道哪些是重点、哪些只需了解、哪些偏计算、哪些偏背诵。

**实现**：
- 新建 `data/learning-guide.json`：通过 AI 批量分类三科 187 个知识点，每个知识点标注优先级（重点 50%/一般 42%/了解 8%）、类型（计算/背诵/理解/应用）、学习建议。
- 三个知识框架页（13015/02324/13003）通过 CSS+JS 改造，添加视觉标注：
  - 背景色区分优先级（重点=红色、一般=黄色、了解=灰色）
  - 标签显示类型（🔢计算/📖背诵/💡理解/🔧应用）
  - 章节概览显示重点数量统计
  - 筛选功能（按优先级/类型过滤知识点）
  - 学习建议 tooltip

### 2. 掌握状态跨浏览器持久化

**背景**：用户发现换浏览器后掌握状态全部丢失，因为数据只存在 localStorage。

**实现**：
- `dev_server.py` 的 `/api/mastery` 端点升级为按科目读写（`GET /api/mastery?subject=13015`）
- 三个知识框架页添加 `saveStateToAPI()` 和 `syncFromAPI()`：
  - 勾选掌握状态时延迟 500ms 自动同步到 `data/mastery-progress.json`
  - 页面加载时从 API 拉取数据，localStorage 为空时自动恢复
  - 重置按钮同步清空 JSON 数据

### 3. AI 对话跨浏览器持久化

**实现**：
- `dev_server.py` 新增 `/api/ai-conv`（读写 `data/ai-conversation.json`）和 `/api/ai-plan`（读写 `data/ai-daily-plan.json`）
- 学习驾驶舱页 `restoreConvHistory()` 增强：localStorage 为空时从 API 加载历史对话和每日计划
- 对话保存时同时写 localStorage 和 API，清空对话时同步清 API

### 4. 浏览器缓存彻底修复

**背景**：iframe 加载缓存问题反复出现（切换浏览器/刷新后页面不更新），之前的 `?v=` 版本参数方案不够彻底。

**实现**：
- `dev_server.py` 增强缓存控制头：`Cache-Control: no-store, no-cache, must-revalidate, max-age=0` + `Pragma: no-cache` + `Expires: 0`
- 拦截条件请求头：删除 `If-Modified-Since` 和 `If-None-Match`，防止 304 响应
- 知识框架页 URL 版本参数更新至 `?v=2.3.5`

### 5. 今日学习流模块

**实现**：
- 新建 `Workbench/today/today-flow.html`：线性任务流 + AI 伴读 + 自适应进度
- 新建 `data/modules/today.json`：今日学习模块注册
- 工作台新增「今日学习」一级模块

### 6. v2.18.0 经验教训

- **规则引擎分类不可靠**：最初用基于关键词的规则引擎给知识点分类，导致重点占比 65% 或 17%，不合理。改用 AI 批量分类后才得到合理分布（重点 50%）。
- **浏览器缓存必须从服务器端解决**：仅靠 URL 版本参数不够，必须从 HTTP 响应头层面强制 no-store + 拦截 304。
- **localStorage + JSON 双写是最佳实践**：API 请求失败时自动降级为纯 localStorage，不影响功能正常使用。

---

## v2.18.1 更新内容（2026-08-20）

> 文件级变更明细详见 `CHANGELOG.md` v2.18.1 章节。

### 1. 工作台搭建总结版本补全

- `工作台搭建总结.md` 此前停留在 v2.10.0，落后 8 个版本。补全 v2.10.1-v2.18.0 共 11 个版本条目。
- 更新「当前状态」章节的 5.1 基础能力、5.3 自考学习、5.4 AI 与辅助能力。

### 2. 版本一致性校验

- `validate_workbench.py` 新增 `check_summary_version_sync()`：比较 `工作台搭建总结.md` 的「当前文档版本」与 `CHANGELOG.md` 最新版本号，不一致时警告。
- `版本控制规范.md` pre-commit 清单新增第 6 条：版本号变更时同步更新 CHANGELOG.md、AGENT_HANDOFF.md、工作台搭建总结.md 三份文档。

### 3. 侧边栏添加按钮隐藏

- `templates/workbench.html` 的 `sidebar-footer` 设为 `display:none`，隐藏「+ 工作区」「+ 分类」「+ 任务」三个按钮（当前不需要手动添加）。

---

## 当前后续建议（v2.18.2 状态）

> 以下为截至 v2.18.2 的待办优先级，供新 Agent 参考。

### 高优先级

1. **AI_WEEKLY_TASKS 与 WEEK_DATA 统一** — `job-skill-tree.html` 的 `AI_WEEKLY_TASKS` 数据与学习驾驶舱的 `WEEK_DATA` 重复，需统一数据源避免不一致。
2. **KP5-25 guide 字段编写** — 目前仅 Stage 1 的 KP1-4 有教学指引，KP5-25 待编写。Stage 1 样板制作流程已记录，后续可复用模板。

### 私教功能优化（v2.18.2 已完成 Bug 修复 + 3 项增强）

> v2.18.1 新增分析，v2.18.2 已修复全部 3 个 bug 并实现增强 6/7/8。剩余增强 9/10 为低优先级。

**已完成（v2.18.2）**：

3. ✅ **Bug1: 今日学习流 week 字段** — `currentWeekLabel` 已在 `loadTodayPlan()` 中赋值，`writeTaskDone` 正确传递。
4. ✅ **Bug2: 学习指南接入今日学习流** — `loadLearningGuide()` + `getTopicPriority()` 已在卡片上显示优先级标签。
5. ✅ **Bug3: 驾驶舱与今日学习流状态同步** — postMessage 链路（today-flow → workbench → 驾驶舱）+ 服务端 dailyPlans 同步写回。
6. ✅ **增强6: 弱点优先算法** — `localSortByMastery()` 本地降级排序，AI 离线时按掌握状态弱点优先排列。
7. ✅ **增强7: 番茄钟接入今日学习流** — 25分钟专注+5分钟休息循环，任务卡片内建倒计时和开始/暂停按钮。
8. ✅ **增强8: AI 伴读接入掌握状态** — `getChapterMastery()` 注入 aiGreeting/aiTaskContext/aiOnComplete/aiSend 四个函数。

**剩余增强（低优先级）**：

9. **间隔重复调度** — 英语词汇已有 SM-2 算法，自考三科背诵卡可复用同一算法安排复习频率，让"不会"的卡片间隔重现。
10. **自适应难度** — 根据连续答对/答错动态调整出题难度，模拟真人私教的节奏感。

### 中优先级

11. **清理临时脚本** — `tmp/` 下有 check_sections.py、fix_topics.py 等临时脚本，已加入 .gitignore，但可考虑整理或删除。
12. **清理备份文件** — Workbench 根目录有备份文件，自考学习目录有 `_备份_` 目录，应清理。
13. **移动端响应式适配** — 已支持手机访问但大部分页面无响应式适配，侧边栏/卡片在手机上体验不佳。
14. **其他localStorage数据迁移** — Python/AI知识点掌握状态、英语进度等仍在localStorage，如需跨浏览器保留可参照v2.17.0方案迁移。

### 低优先级

15. **Python 知识点手写练习验证** — 29 个知识点的手写练习代码尚未在 Python 环境中实际运行验证。
16. **Demo 代码实测** — Python 4 个 Demo 和 AI 4 个 Demo 的完整代码已内嵌页面，但尚未在实际环境中创建项目并运行测试。
17. **AI 知识图谱内容补充** — 29 个知识点的代码示例和手写练习答案可根据实际学习进度逐步补充和修正。
18. **AI Demo 代码实现** — 4 个 Demo 目前为设计文档+伪代码，后续可在实际 Python 环境中创建项目并实现。
19. **简历项目实际开发** — 岗位技能图谱的 3 个简历项目目前为任务清单设计，尚未实际创建项目并编码。
