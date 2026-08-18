# 更新日志

本文件记录 `E:\TraeWorkToDo` 项目的版本变更历史。版本号采用语义化版本规范（MAJOR.MINOR.PATCH）。

---

## v2.10.0

**发布时间**：2026-08-18 12:50（北京时间）

### 2026-08-18 — 岗位技能图谱教学指引扩展（方案A：guide字段+今日任务版块+双向关联）

| 文件 | 更新内容 |
|---|---|
| `Workbench/ai-learning/job-skill-tree.html` | KP1-4新增guide字段（tutorial教程跟学+practice渐进练习+completion完成验证+关联跳转）；新增今日任务版块（读取WEEK_DATA判断当前周次→匹配KP→渲染教学指引）；新增AI_WEEKLY_TASKS数据+getCurrentWeek/renderTodayPanel/renderTodayGuide函数；新增renderKpGuide函数在KP卡片中渲染学习指引层；新增完成验证逻辑（localStorage `ai_kp_guide_progress`+checkbox+verify按钮）；新增navigateToModule跨iframe跳转函数 |
| `Workbench/Python基础/python-knowledge-tree.html` | 新增JOB_KP_MAP（5个Python知识点关联岗位技能KP）；卡片底部新增「关联岗位技能」标签，点击跳转到岗位技能图谱 |
| `Workbench/Python基础/python-demos.html` | 新增JOB_DEMO_MAP（4个Demo关联岗位技能KP）；Demo卡片底部新增「关联岗位技能」标签 |
| `Workbench/ai-learning/ai-demos.html` | 新增JOB_AI_DEMO_MAP（2个AI Demo关联岗位技能KP）；Demo卡片底部新增「关联岗位技能」标签 |
| `templates/workbench.html` | 新增postMessage监听器，处理子iframe跨模块导航请求（action:navigate→查找目标项→selectItem+发送highlightKp消息） |
| `data/modules/ai-learning.json` | job-skill-tree.html和ai-demos.html contentUrl版本号更新至v=2.10.0 |
| `data/modules/python.json` | python-knowledge-tree.html和python-demos.html contentUrl版本号更新至v=2.10.0 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.9.0

**发布时间**：2026-08-18 03:00（北京时间）

### 2026-08-18 — 背诵卡测验题库多项功能增强（AI答疑+markdown渲染+对话持久化+复制+重做）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | v2.8.1: 测验模式新增「问AI」按钮，支持流式追问对话（deepseek-v4-flash + SSE）；v2.8.2: 修复题库选择题选项不显示问题，题库新增「问AI」按钮；v2.8.3: 修复测验题库跨科目混淆（localStorage key 按科目隔离 `recite-quiz-bank-{subject}`）；v2.8.4: 新增「重做」功能（保存历史记录+重置题目状态+「已重做N次」徽章）；v2.8.5: 题库所有题目均显示按钮（已答「重做」/未答「练习」），点击自动切换测验模式并高亮定位；v2.8.6: AI答疑对话持久化到localStorage（`recite-quiz-ai-{subject}`），测验↔题库共享对话记录，有答疑的题目显示「💬 有答疑」徽章；v2.8.7: AI回复markdown渲染（加粗/标题/列表/代码块/数学公式）；v2.8.8: AI答疑header新增复制按钮（复制完整对话记录，含【我的问题】【AI解答】标记）；v2.8.9→v2.9.0: 复制按钮移入header两端对齐，移除每条消息上的复制按钮 |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）背诵卡 contentUrl 版本号从 v=2.8.0 逐步更新至 v=2.9.0 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.6

**发布时间**：2026-08-18 00:30（北京时间）

### 2026-08-18 — AI答疑对话持久化（测验↔题库共享对话记录）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | AI答疑对话持久化到localStorage（`recite-quiz-ai-{subject}`，按qid存储）；测验模式中AI回复完成后自动保存；题库模式打开「问AI」时自动加载已有对话记录并渲染历史消息；题库元数据区显示「💬 有答疑」绿色徽章；按钮文字动态切换：有记录显示「💬 查看答疑」、无记录显示「🤖 问 AI」；新增 `loadQuizAI`/`saveQuizAI`/`hasQuizAI`/`renderQuizAIMessages` 函数；`switchSubject` 同步更新AI对话key |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.6 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.5

**发布时间**：2026-08-18 00:20（北京时间）

### 2026-08-18 — 题库所有题目均可练习（按钮自动切换「重做/练习」）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 题库所有题目均显示按钮：已作答显示「🔄 重做」，未作答显示「✏️ 练习」；点击后自动切换到测验模式并滚动定位到目标题目（蓝色边框高亮2秒）；`redoQuizQuestion` 优化：未作答题目直接跳转不保存空记录 |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.5 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.4

**发布时间**：2026-08-18 00:15（北京时间）

### 2026-08-18 — 题库新增「重做」功能（保留答题历史）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习\背诵与简答\背诵与简答-核心概念背诵卡.html` | 题库每道已答题目新增「🔄 重做」按钮：点击后保存当前答题记录到 `attempts` 数组，重置题目状态（userAnswer/isCorrect 置 null），题目重新出现在测验模式中可再次作答；题库元数据区显示「已重做 X 次」徽章；新增 `.quiz-bank-actions` 按钮组容器和 `.quiz-redo-btn` 样式 |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.4 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.3

**发布时间**：2026-08-18 00:00（北京时间）

### 2026-08-18 — 题库选择题选项显示 + 题库「问 AI」答疑

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 题库渲染新增选择题选项展示（正确选项绿色高亮、用户错选红色标注）；题库每道题新增「🤖 问 AI」按钮和对话区（与测验模式共享对话上下文）；AI 答疑函数重构支持前缀参数（quiz/quiz-bank 两套独立 DOM ID） |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.3 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.2

**发布时间**：2026-08-17 23:40（北京时间）

### 2026-08-17 — 修复测验题目跨科目混淆问题

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 修复测验题库 localStorage key 未按科目隔离的 bug：`QUIZ_BANK_KEY` 从固定值 `recite-quiz-bank` 改为 `recite-quiz-bank-{subject}`，每个科目独立存储题库；`switchSubject` 函数同步更新 key 并重新加载题库 |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.2 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.1

**发布时间**：2026-08-17 23:20（北京时间）

### 2026-08-17 — 背诵卡测验新增「问 AI」答疑功能

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 测验答题反馈区新增「🤖 问 AI」按钮：点击后展开迷你对话区，自动将题目+用户答案+参考答案作为上下文发送给 AI，流式输出详细讲解；支持追问对话（Enter 发送/Shift+Enter 换行）；每题独立对话上下文，可关闭重开；错误处理覆盖网络断开/API 错误等场景 |
| `data/modules/self-study.json` | 三个科目（13015/02324/13003）的背诵卡 contentUrl 版本号更新至 v=2.8.1 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.8.0

**发布时间**：2026-08-17 22:30（北京时间）

### 2026-08-17 — 英语（二）模块全面重设计（5页面：备考指南+词汇系统+题型专项+真题模拟+作文模板）

| 文件 | 更新内容 |
|---|---|
| `data/modules/self-study.json` | 英语（二）模块从3项扩展为6项：备考指南(替代知识框架)、词汇系统(替代背诵卡)、题型专项(新建)、真题模拟(新建)、作文模板(新建)、AI助手(保留) |
| `Workbench/自考学习/未考科目/00015英语（二）/00015英语（二）-备考指南.html` | 新建备考指南页面：七种题型分析（卡片+分值+难度+策略）、分值分布图（阅读40/完形30/写作30）、10周学习路线表、6条备考策略 |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-词汇系统.html` | 新建词汇系统页面：高频词表(核心+重点+拓展)、SM-2间隔重复算法、闪卡学习模式(4级评分)、中英互译选择测验、词表搜索、localStorage `en_vocab_progress` 掌握度追踪 |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-题型专项.html` | 新建题型专项页面：7种题型Tab切换(阅读判断/阅读选择/概括补全/填句补文/填词补文/完形补文/短文写作)，每题型含解题技巧+练习题+错题记录+正确率统计，localStorage `en_qtype_errors` |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-真题模拟.html` | 新建真题模拟页面：按年份真题套卷列表、150分钟计时器、选择题答题+交卷评分、分题型得分统计、localStorage `en_exam_scores` 成绩记录 |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-作文模板.html` | 新建作文模板页面：5类Tab(观点论述/问题解决/现象分析/书信应用/万能句型)，每类含结构框架+高分句型+范文+练习区(词数统计)，万能句型库20句(按功能分类+一键复制)，localStorage `en_writing_practice` |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.7.0

**发布时间**：2026-08-17 20:30（北京时间）

### 2026-08-17 20:30 — 学习驾驶舱按钮优化 + 学习计划时间调整

| 文件 | 更新内容 |
|---|---|
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 按钮样式统一：顶部按钮和阶段按钮统一尺寸(padding/圆角/字号)和hover上浮效果；AI场景按钮间距增大(gap 0.5→0.75rem, padding 0.55→0.65rem 1.2rem)；修复隐藏标题残留margin-top(1rem→0)；清理废弃`.dash-header`相关CSS；修复多余`</div>`标签 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 学习计划时间调整：数据结构从Week 3提前到Week 2启动(4周→5周)；离散数学9章匀到Week 1-5(Week 5从3章减到2章，Ch7图论提前到Week 4)；AI项目3从Week 6提前到Week 5启动(Week 6只做完善)；阶段日期同步调整(初级8/18-9/21, 中间9/22-10/5, 冲刺10/6-10/24)；SCHEDULE_VERSION升至v2.6.3 |
| `data/modules/ability.json` | 学习驾驶舱contentUrl版本号更新至v=2.6.3 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |
| `AGENT_HANDOFF.md` | 版本更新至 v2.7.0；新增 v2.7.0 版本记录 |
| `工作台搭建总结.md` | 版本更新至 v2.7.0；新增 v2.7.0 版本记录 |

---

## v2.6.0

**发布时间**：2026-08-16（北京时间）

### 2026-08-16 — AI 学习新增「岗位突击」模块（岗位技能图谱 + 学习闭环）

| 文件 | 更新内容 |
|---|---|
| `data/modules/ai-learning.json` | 新增「岗位突击」分类（🎯），包含「岗位技能图谱」和「学习闭环」两个页面项 |
| `Workbench/ai-learning/job-skill-tree.html` | 新建岗位技能图谱页面：四阶段25个知识点（17入门+8精进）；入门级标注项目产出和简历写法；精进级标注面试突击；每知识点含概念、代码示例、手写练习（含答案折叠）、项目场景；阶段按钮切换、搜索、进度跟踪（localStorage `job_kp_detail_v1`）、代码一键复制 |
| `Workbench/ai-learning/job-learning-loop.html` | 新建学习闭环页面：考试倒计时、总进度（入门17知识点+3项目）、四阶段路线图（进度条）、五步闭环（学→练→复→测→迭）、3个简历项目追踪（任务清单+进度条，localStorage `job_project_detail_v1`） |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 重新设计学习计划数据：AI学习时间提至20%（Python并入AI）；WEEK_DATA 应用科学学习方案（间隔重复+交错学习+数据结构第3周提前启动）；AI提示词更新（时间分配比例+科学方法指导+py标签改为AI工程）；每日执行计划时段标签更新（Python→AI工程，AI→AI学习）；时间分配默认值调整（自考14→12h） |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |

---

## v2.5.0

**发布时间**：2026-08-16（北京时间）

### 2026-08-16 — AI 学习模块重设计（知识图谱 + 实战 Demo）

| 文件 | 更新内容 |
|---|---|
| `data/modules/ai-learning.json` | 重构 AI 学习模块：移除 4 项引用（完整学习路线图、武汉理工自考+AI转型学习方案、每日执行计划、AI学习规划师）；保留 AI 资讯周报；新增「AI 知识图谱」和「AI 实战 Demo」两项；重组为「知识体系」「资讯」两个分类 |
| `data/modules/ability.json` | 新增「工具」分类，将「AI 帮我复盘代码」从 AI 学习模块迁移至能力提升模块 |
| `Workbench/ai-learning/ai-knowledge-tree.html` | 新建 AI 知识图谱页面：四阶段 29 个知识点（基础概念 8 个 / 机器学习 8 个 / 深度学习与 NLP 7 个 / LLM 与应用 6 个）；每个知识点含概念、代码示例、手写练习、AI 场景四层内容；阶段按钮切换、搜索过滤、进度跟踪（localStorage `ai_kp_detail_v1`）、答案折叠、代码一键复制 |
| `Workbench/ai-learning/ai-demos.html` | 新建 AI 实战 Demo 页面：四阶段 4 个 Demo（数据可视化与评估工具 / MNIST 分类器 / 语义搜索引擎 / AI 知识助手）；每个 Demo 含目标、功能列表、文件结构、完整代码、测试用例、知识点映射 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |
| `AGENT_HANDOFF.md` | 版本更新至 v2.5.0；新增 v2.5.0 更新章节；更新目录结构 |
| `工作台搭建总结.md` | 版本更新至 v2.5.0；补充 v2.5.0 版本记录 |

---

## v2.4.0

**发布时间**：2026-08-15（北京时间）

### 2026-08-15 — 工作台风格统一 + Python 模块功能优化

| 文件 | 更新内容 |
|---|---|
| `templates/workbench.html` | 新增 renderMode 机制（bare/content/默认三种模式）；bare 模式直接显示 iframe 无外层包装；content 模式保留标题去除 tabs；renderItemView 函数按 renderMode 决定渲染方式 |
| `data/modules/python.json` | 三个页面设为 `renderMode: bare`；contentUrl 版本参数更新至 `v=2.4.0` |
| `data/modules/ai-learning.json` | 4个页面添加 `renderMode: content`（ai-news-digest/full-learning-roadmap/ai-learning-plan/ai-code-review） |
| `data/modules/self-study.json` | 6个页面添加 `renderMode: content`（各科目知识框架、真题与错题、复盘总结） |
| `data/modules/ability.json` | 页面 renderMode 配置更新 |
| `data/modules/ai-roles.json` | 页面 renderMode 配置更新 |
| `Workbench/Python基础/python-knowledge-tree.html` | 新增手写练习答案折叠（默认隐藏+展开/收起按钮）；新增代码一键复制（hover显示复制按钮+已复制反馈+execCommand降级）；新增 Demo 应用区域（DEMO_MAP 映射表+绿色卡片样式）；新增进度摘要写入 localStorage（`py_kp_progress`）；新增缓存控制 meta 标签；修复 IIFE 作用域导致 onclick 函数不可访问的 bug（改用 addEventListener） |
| `Workbench/Python基础/python-demos.html` | 知识点映射表新增「掌握」列（读取 `py_kp_detail_v1` localStorage 显示 ✓/—）；新增缓存控制 meta 标签 |
| `Workbench/Python基础/python-learning-loop.html` | 接入真实数据：读取 `py_kp_progress` localStorage 显示总体进度条+各阶段进度条+掌握百分比；无数据时降级显示静态数值；新增缓存控制 meta 标签 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |
| `Workbench/ai-learning/ai-news-digest.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/ai-learning/full-learning-roadmap.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/ai-learning/ai-learning-plan.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/ai-learning/ai-code-review.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/ai-learning/ai-roles-hub.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/ai-learning/daily-plan.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/能力提升/full-learning-roadmap.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/复盘总结/复盘总结-章节复盘.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/未考科目/00015英语（二）/00015英语（二）-知识框架与学习计划.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/真题练习/真题练习-真题与错题本.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 风格统一（蓝色主题、移除页面级 header） |
| `Workbench/read/2019.html` ~ `Workbench/read/2026.html` | 风格统一（蓝色主题、移除页面级 header） |
| `AGENT_HANDOFF.md` | 版本更新至 v2.4.0；新增 v2.4.0 更新章节 |
| `工作台搭建总结.md` | 版本更新至 v2.4.0；补充 v2.4.0 版本记录 |

---

## v2.3.0

**发布时间**：2026-08-15（北京时间）

### 2026-08-15 — Python 学习内容重组（2页面 + 阶段按钮切换）

| 文件 | 更新内容 |
|---|---|
| `Workbench/Python基础/python-knowledge-tree.html` | 重写为「知识点详解」页面：四阶段（语法基础/数据结构/常用库/AI Python）阶段按钮切换；29个知识点卡片（概念/代码示例/手写练习/AI场景四层内容）；搜索过滤、进度跟踪、展开折叠交互 |
| `Workbench/Python基础/python-demos.html` | 重写为「Demo实战」页面：四阶段按钮切换；4个Demo详细设计（Prompt模板引擎/LLM上下文管理器/LLM API客户端/真题数据分析仪表盘），每个含目标/功能/文件结构/完整代码/测试用例/知识点映射 |
| `Workbench/Python基础/python-learning-loop.html` | 重写为「学习闭环」页面：新增四阶段路线图（阶段/周次/知识点数/Demo名称）；保留五步闭环流程图；新增阶段选择器和阶段筛选；记录支持阶段标签；数据迁移v1→v2 |
| `data/modules/python.json` | 页面重命名：树形知识架构→知识点详解、小闭环Demo→Demo实战、闭环流程→学习闭环；更新描述匹配新内容 |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |
| `AGENT_HANDOFF.md` | 版本更新至 v2.3.0；新增 v2.3.0 更新章节；更新目录结构描述 |
| `工作台搭建总结.md` | 版本更新至 v2.3.0；补充 v2.3.0 版本记录 |

---

## v2.2.0

**发布时间**：2026-08-15（北京时间）

### 2026-08-15 — 背诵卡测验模式增强（6题型 + 累计持久化 + 题库）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 测验模式增强：新增3种题型（计算题/名词解释题/综合应用题），共支持6种题型；出题改为累计显示（不再覆盖），新题显示在上方；题目持久化到 localStorage（`recite-quiz-bank`），刷新不丢失；已答题目在测验模式自动隐藏；新增「📚 题库」模式（统计面板 + 分类筛选：全部/错题/正确/未答 + 清空功能）；取消出题数量限制（原前10张→全部今日卡片）；AI prompt 支持6种题型，max_tokens 提升至 8000；本地降级出题支持6种题型轮换 |
| `data/modules/self-study.json` | 4 个科目背诵卡 contentUrl 版本参数更新为 `&v=2.2.1` |
| `Workbench/此刻便是春天.html` | 重建产物（随源码更新） |
| `AGENT_HANDOFF.md` | 版本更新至 v2.2.0；新增「v2.2.0 更新内容」章节（题型扩展、累计持久化、测验过滤、题库模式、出题范围、经验教训、后续建议）；更新提交状态 |
| `工作台搭建总结.md` | 版本更新至 v2.2.0；补充 v2.2.0 版本记录；更新当前状态（测验模式增强、题库模式） |

---

## v2.1.0

**发布时间**：2026-08-15（北京时间）

### 2026-08-15 — 背诵卡测验模式 + 学习方案优化

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 新增「测验模式」：背诵模式/测验模式切换按钮；AI 出题（调用 `/api/chat` 根据卡片定义生成填空/选择/简答题）；AI 不可用时自动降级为本地模板出题；答题后显示对错反馈和参考答案；答对卡片升级、答错降级为"不会"，统计实时更新；修复 AI 出题请求格式（`messages` 数组 + `stream:false` + `model:deepseek-chat` + 正确解析 `choices[0].message.content`） |
| `dev_server.py` | 新增 `--host` 参数，默认 `0.0.0.0` 监听所有网络接口，启动时打印局域网访问地址，支持手机直接访问 |
| `data/modules/self-study.json` | 4 个科目背诵卡 contentUrl 增加 `&v=2.1.1` 版本参数，解决浏览器缓存导致 iframe 加载旧页面的问题 |
| `study-plan-optimization/study-plan-optimization.html` | 新增：学习方案科学性优化改进方案报告（5 项基础改进 + 3 项用户增强） |
| `study-plan-optimization/feature-demo.html` | 新增：功能 Demo 页面（背诵卡测验模式 + Python AI 场景 + AI 岗位规划），用于确认后再更新到工作台 |
| `AGENT_HANDOFF.md` | 版本更新至 v2.1.0；新增「v2.1.0 更新内容」章节（测验模式、手机访问、优化报告、经验教训、后续建议）；更新提交状态为已提交 |
| `工作台搭建总结.md` | 版本更新至 v2.1.0；补充 v1.0.0/v2.0.0/v2.1.0 版本记录；更新当前状态（背诵卡测验模式、AI 统筹规划师、手机访问）；标记已解决缺陷（背诵卡空白、AI 直连、JS 校验、JSON 版本化）；更新后续建议 |

---

## v2.0.0

**发布时间**：2026-08-14（北京时间）
**最新 commit**：`35ff961`

### 2026-08-14 — v2.0.0 功能增强与约束体系升级

| 文件 | 更新内容 |
|---|---|
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | AI 统筹规划师增强：每日执行计划新增 22:00–23:00「整理复盘」时段；AI 对话消息默认折叠 2-3 行，支持展开/收起；「详细计划」与「对话区」位置调换；AI 生成计划自动写入课程表；对话历史存 localStorage 超 20 条自动截断 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 页面重构为「今日任务」/「总任务」双板块结构，按钮切换；今日任务按周次自动匹配章节，卡片按掌握度排序；移除顶部科目分类按钮，改用 URL 参数预选科目；按钮事件从 onclick 改为 addEventListener；预置 13015 和 en 两个科目卡片；DATA_VERSION 升至 5 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 修复关键 Bug：离散数学卡片补元符号 `a'` 单引号未转义导致 JS SyntaxError，整个页面交互静默失效。修复为 `a\'`（3 处） |
| `项目约束总览.md` | 新增「功能验证」约束（修改 HTML/JS 后必须浏览器实测）；新增「JS 字符串转义」约束（内嵌数据须检查引号转义）；校验脚本条目新增 6 项自动化检查说明；修正 validate_workbench.py 路径为 `.trae/skills/validate_workbench.py` |
| `文件约束隐患与规避方案.md` | 新增第 13 条隐患「JS 内嵌数据字符串转义遗漏」，含案例记录与规避措施 |
| `.trae/skills/validate_workbench.py` | 新增 8 个检查函数：`check_chinese_comments()`（代码中文注释，覆盖 templates/）、`check_backup_count()`（备份数量）、`check_json_html_naming()`（JSON-HTML 同名）、`check_date_format()`（日期格式）、`check_folder_naming()`（文件夹中文命名）、`check_interactive_styles_global()`（交互组件样式完整性）、`check_directory_structure_sync()`（目录结构同步 + CHANGELOG 版本一致性）、`check_changelog_coverage()`（git 已修改文件 vs CHANGELOG 最新版本表格，防止变更信息散落）；`check_directory_structure_sync()` 扫描范围扩展至 Workbench 各模块、data/modules、templates、.trae/skills、transformers |
| `styles/*.scss`（9 个文件） | 全部英文注释改为中文，符合代码注释约束 |
| `templates/workbench.html` | 7 处英文 JS 注释改为中文 |
| `Workbench/ai-learning/ai-code-review.html`、`python-knowledge-tree.html`、`full-learning-roadmap.html` | 英文注释改为中文 |
| `Workbench/ai-learning/ai-roles-hub.html` | `.ai-output-section` 和 `.ai-chat-section` CSS 新增 `display:none`，消除对内联样式的依赖 |
| `Workbench/ai-learning/ai-news-digest.html` | `.ainews-archive` CSS 新增 `display:none`，消除对内联样式的依赖 |
| `build.py 使用说明.md`、`版本控制规范.md` | 修正 validate_workbench.py 路径为 `.trae/skills/validate_workbench.py` |
| `AGENT_HANDOFF.md` | 目录结构补充 7 项缺失（.gitignore/.gitattributes/temp/_responsive.scss/_tree.scss/AI统筹规划师-版本C方案.md/00023高等数学）；Node.js 描述修正；v2.0.0 章节精简为功能级摘要，文件级明细引用 CHANGELOG |
| `CHANGELOG.md` | 新增 v2.0.0 章节 |
| `项目约束总览.md` | 校验脚本条目更新；新增文档职责分工定义；新增 CHANGELOG 更新检查项与 CHANGELOG 变更覆盖自动校验 |
| `.gitignore` | v2.0.0 约束体系升级过程中同步更新忽略规则 |
| `Workbench/ai-learning/daily-plan.html` | AI 统筹规划师重构期间同步更新每日执行计划页面 |
| `data/modules/ability.json` | 能力提升模块导航数据同步更新 |
| `data/modules/ai-learning.json` | AI 学习模块导航数据同步更新 |
| `data/modules/ai-roles.json` | AI 助手角色模块导航数据同步更新 |
| `data/modules/self-study.json` | 自考学习模块导航数据同步更新（含背诵与简答子项调整） |
| `data/workbench.json` | 工作台全局配置同步更新 |
| `dev_server.py` | AI API 代理端点与错误处理同步调整 |
| `文件说明.md` | 同步更新文件用途说明；补充 `AI统筹规划师-版本C方案.md` 用途说明 |
| `.git/hooks/pre-commit` | 新增 Git pre-commit hook，提交前自动运行 `validate_workbench.py`，校验失败则阻止提交 |
| `AGENT_HANDOFF.md` | 目录结构补充 3 项缺失（tasks.json、工作台迁移方案-说明.html、zujian-file-router/）；校验规则摘要补充目录结构同步、CHANGELOG 变更覆盖与 pre-commit hook 说明；核心原则新增 pre-commit hook、CHANGELOG 同步要求与 .env 说明；文档顶部新增未提交变更警告 |
| `.trae/skills/validate_workbench.py` | `check_json_html_naming()` 新增纯数据 JSON 白名单（`ai-news-data.json`）；`check_folder_naming()` 英文目录白名单新增 `ai-learning` |

---

## v0.3.0

**发布时间**：2026-08-13 02:43:12（北京时间）  
**最新 commit**：`b6e3d68`

### 2026-08-13 02:43:12 — `b6e3d68` feat(ai): 重构 AI 学习规划师并新增统筹计划面板

| 文件 | 更新内容 |
|---|---|
| `Workbench/ai-learning/ai-roles-hub.html` | 重构为交互式 AI 学习规划师：支持全局统筹与单科专项两种模式，自动读取 localStorage 学习进度，生成场景化提示词并支持一键复制 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 升级为统筹计划面板：新增考试倒计时、每周时间分配、重点任务清单，支持跨科目（自考 / Python / AI）统一规划 |
| `data/modules/self-study.json` | 为 5 个科目的子项新增「AI助手」入口，分别带 `subject` 参数指向单科模式 |
| `data/modules/ai-roles.json` | 所有角色入口统一指向 `ai-roles-hub.html?mode=global`，进入全局统筹模式 |
| `data/modules/ai-learning.json` | 新增「AI 学习规划师」入口，指向全局统筹模式 |
| `Workbench/此刻便是春天.html` | 重新构建，应用上述导航变更 |

### 2026-08-13 12:47:58 — `aed1f2c` docs(constraint): 增加构建后浏览器模拟器预览约束

| 文件 | 更新内容 |
|---|---|
| `项目约束总览.md` | 「新增/修改文件流程」第四步新增检查项：构建校验通过后须打开 `Workbench/此刻便是春天.html` 在浏览器模拟器中预览效果 |
| `build.py 使用说明.md` | 构建流程第 13 步增加「效果预览」：明确构建校验通过后应在浏览器模拟器中确认最终效果 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

### 2026-08-13 12:49:42 — `e8c3a1d` feat(build): build.py 支持 --open 参数自动打开浏览器预览

| 文件 | 更新内容 |
|---|---|
| `build.py` | 新增 `--open` 参数；构建校验通过后自动调用系统默认浏览器打开 `Workbench/此刻便是春天.html` |
| `build.py 使用说明.md` | 新增「构建并自动打开浏览器预览」命令说明；更新构建流程第 13 步 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

### 2026-08-13 12:55:17 — `b2e5c05` docs(handoff): 更新 AGENT_HANDOFF.md 下一阶段任务

| 文件 | 更新内容 |
|---|---|
| `AGENT_HANDOFF.md` | 重写「下一步目标」：记录 AI 学习规划师重构、统筹计划面板升级、科目 AI 助手入口、`build.py --open` 参数等本阶段完成项；更新后续建议方向与 Agent 接手命令 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

### 2026-08-13 12:59:52 — `e0a23a5` docs(summary): 完善工作台搭建总结，增加版本号、功能缺陷与优化方法

| 文件 | 更新内容 |
|---|---|
| `工作台搭建总结.md` | 新增版本更新记录（v0.1.0 ~ v0.3.0）；重写「当前状态」分基础/规划/自考/AI 四类列出；新增「功能缺陷与优化方法」章节（数据/交互/工程三类）；重写「后续完善建议」并标注短中长期 |
| `Workbench/此刻便是春天.html` | 重新构建，无内容变更 |

---

## v0.2.0

**发布时间**：2026-08-13 01:36:05（北京时间）  
**最新 commit**：`3aaf946`

### 2026-08-13 01:36:05 — `3aaf946` fix(ui): 知识框架页隐藏工作台级计划/内容 Tab

| 文件 | 更新内容 |
|---|---|
| `data/modules/self-study.json` | 为 5 个知识框架项添加 `"renderMode": "content"` |
| `templates/workbench.html` | `renderTabs()` 识别 `renderMode === 'content'`，跳过「计划 / 内容」切换条，直接渲染内容 iframe |
| `AGENT_HANDOFF.md` | 知识框架模块增加工作台注册约定；经验教训补充「自带 Tab 内容页需声明 renderMode」 |
| `工作台搭建总结.md` | 新增问题 10：知识框架页内部 Tab 与工作台级 Tab 叠加；更新当前状态 |
| `Workbench/此刻便是春天.html` | 重新构建，应用上述变更 |

### 2026-08-13 01:23:32 — `e6c2152` refactor(kf): 系统原理与高等数学应用知识框架页模板

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 应用统一知识框架页模板：学习计划 / 知识总览 / 第 1-6 章 Tab；章节 Tab 默认隐藏，通过完整目录章节标题跳转 |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.html` | 应用统一模板；原页面使用 `.framework-block` 与中文章节号，已适配为 Tab 分章；生成完整目录并支持点击跳转 |

### 2026-08-13 01:17:42 — `450ed29` refactor(kf): 02324 离散数学应用知识框架页模板

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 应用统一知识框架页模板：学习计划 / 知识总览 / 第 1-9 章 Tab；章节 Tab 默认隐藏，通过完整目录章节标题跳转 |
| `.gitignore` | 新增 `*_备份_*/` 规则，忽略自动生成的备份目录 |

### 2026-08-13 00:32:10 — `8bdea36` fix: 修复扫描发现的链接断裂与损坏文件

| 文件 | 更新内容 |
|---|---|
| `Workbench/此刻便是春天.html` | 重新构建生成，同步 ai-learning.json 的 contentUrl 变更 |
| `data/modules/ai-learning.json` | 修复"完整学习路线图"的 contentUrl：`ai-learning/` → `能力提升/` |
| `工作台会话交接-20260809.md` | 删除损坏且过时的会话交接文件 |
| `文件说明.md` | 更新生成时间、移除已删除文件引用、修正黄单与清理记录 |

### 2026-08-13 00:24:59 — `197beb9` refactor: 将 data/ 移出 Workbench 并合并约束文档

| 文件 | 更新内容 |
|---|---|
| `build.py` | `DATA_DIR` 改为根目录 `data/`，清理保护路径加入 `data/` |
| `data/modules/*.json` | 从 `Workbench/data/modules/` 整体迁移到 `data/modules/` |
| `data/workbench.json` | 从 `Workbench/data/workbench.json` 迁移到 `data/workbench.json` |
| `.trae/skills/integrate_reading.py` | 注释中 `Workbench/data/` 路径改为 `data/` |
| `.trae/skills/validate_workbench.py` | 新增 Tab 结构完整性校验函数 |
| `AGENT_HANDOFF.md` | 更新目录结构、data 路径引用、核心原则 |
| `build.py 使用说明.md` | 所有 `Workbench/data/` 路径改为 `data/` |
| `版本控制规范.md` | 提交范围中 `Workbench/data/` 改为 `data/` |
| `项目约束总览.md` | 合并原 `新增文件检查清单.md` 全部内容，新增「新增/修改文件流程」章节 |
| `文件说明.md` | 更新 data 路径描述 |
| `工作台搭建总结.md` | 更新 data 路径描述 |
| `新增文件检查清单.md` | 删除（内容已并入项目约束总览.md） |
| `Workbench/自考学习/备考科目/13003数据结构与算法/...` | 应用统一 Tab 分章改造 |

### 2026-08-12 21:34:43 — `f8d100a` 补充数据结构与算法、高等数学教材例题

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13003数据结构与算法/...` | 补充 8 章教材典型例题与同步练习 |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/...` | 补充 6 章教材典型例题与同步练习 |
| `AGENT_HANDOFF.md` | 追加经验教训 |
| `文件说明.md` | 更新文件描述 |

### 2026-08-12 21:12:08 — `5b734eb` feat: 离散数学知识框架补充教材例题与同步练习

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/02324离散数学/...` | 补充 9 章教材典型例题与同步练习 |

### 2026-08-12 20:24:23 — `23aa7c6` chore: 将此刻便是春天.html 纳入 Git 管理并更新相关约束

| 文件 | 更新内容 |
|---|---|
| `.gitignore` | 移除 `Workbench/此刻便是春天.html` 忽略规则 |
| `Workbench/此刻便是春天.html` | 首次纳入版本控制 |
| `AGENT_HANDOFF.md` / `build.py 使用说明.md` / `文件说明.md` / `新增文件检查清单.md` / `版本控制规范.md` | 同步更新提交范围说明 |

---

## v0.1.x

### 2026-08-12 20:18:04 — `8c4c8e9` feat: 工作台扩展为六大模块并补充自考教材与知识结构

- 工作台从单一阅读模块扩展为：能力提升、自考学习、Python 基础、AI 学习、AI 助手角色、阅读资料 六大模块
- 新增自考教材 PDF 与各科知识框架页
- 更新 self-study.json 三级导航结构

### 2026-08-11 — `7aac155` ~ `deb145c`

| Commit | 说明 |
|---|---|
| `7aac155` | docs: add handoff doc and code comments |
| `9e77d28` | refactor: optimize medium/low-risk issues in workbench toolchain |
| `bc7538d` | refactor: 优化高风险项——阅读集成模板化与主题 token 白名单 |
| `deb145c` | feat: 增加本地预览与热重载开发服务器 |

---

## 常用命令

```bash
# 查看最近 10 条提交
E:\Git\Git\cmd\git.exe log --oneline -10

# 查看某次提交具体改了什么
E:\Git\Git\cmd\git.exe show 8bdea36 --stat

# 查看某个文件的历史
E:\Git\Git\cmd\git.exe log --oneline -- data/modules/ai-learning.json
```
