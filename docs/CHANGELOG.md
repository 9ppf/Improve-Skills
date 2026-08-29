# 更新日志

本文件记录 `E:\TraeWorkToDo` 项目的版本变更历史。版本号采用语义化版本规范（MAJOR.MINOR.PATCH）。

---

## v2.33.5

**发布时间**：2026-08-29（北京时间）

### 删除public-js-css-refactor-plan可视化页面

**核心变更**：删除 public-js-css-refactor-plan/ 目录（含 HTML 展示页 + mermaid.min.js 2.5MB），方案内容已在 docs/公共JS与CSS抽离方案B.md 中保留。

| 文件 | 更新内容 |
|---|---|
| `public-js-css-refactor-plan/` | 删除：可视化展示页面（方案已在md中保留） |
| `docs/文件说明.md` | 更新：移除 public-js-css-refactor-plan 条目，版本号同步 |
| `docs/AGENT_HANDOFF.md` | 更新：版本号同步至 v2.33.5 |
| `docs/工作台搭建总结.md` | 更新：版本号同步至 v2.33.5 |

---

## v2.33.4

**发布时间**：2026-08-29（北京时间）

### 三科卡片与题目设计规范合并+待办更新+路径引用修复

**核心变更**：将离散数学/数据结构与算法/计算机系统原理三份独立的设计规范文档合并为一份统一的「卡片与题目设计规范.md」，统一核心原则、卡片设计、题目设计规范，以科目差异对照表呈现各科差异；更新 BACKLOG_TODO.md 标记已完成项（公共样式抽离、CSS硬编码清零）；修复 zujian-file-router SKILL.md 中 docs/ 迁移后断裂的路径引用。

| 文件 | 更新内容 |
|---|---|
| `docs/卡片与题目设计规范.md` | 新增：三科统一设计规范（核心原则+卡片设计+题目设计+科目差异对照+样板数据+后续预估） |
| `docs/离散数学-卡片与题目设计规范.md` | 删除：已合并至统一文档 |
| `docs/数据结构与算法-卡片与题目设计规范.md` | 删除：已合并至统一文档 |
| `docs/计算机系统原理-卡片与题目设计规范.md` | 删除：已合并至统一文档 |
| `docs/BACKLOG_TODO.md` | 已解决+2条（公共样式抽离、CSS硬编码清零），中优先级更新进度 |
| `.trae/skills/zujian-file-router/SKILL.md` | 修复：文件说明.md 路径引用更新为 docs/ 前缀 |
| `docs/文件说明.md` | 更新：3条旧文档替换为1条统一文档 |
| `docs/AGENT_HANDOFF.md` | 更新：目录树中3条旧文档替换为1条统一文档 |

---

## v2.33.3

**发布时间**：2026-08-29（北京时间）

### 删除3份冗余CSS/SASS文档，保留2份作为后续优化标准

**核心变更**：CSS/SASS迁移已全部完成，删除3个已过度的方案文档（SASS统一迁移方案.md、CSS抽离专项方案.md、CSS重复样式重构步骤清单.md），保留 SASS统一迁移完整方案.md（后续优化标准）和 公共JS与CSS抽离方案B.md（JS抽离参考）。

| 文件 | 更新内容 |
|---|---|
| `docs/SASS统一迁移方案.md` | 删除（早期版本，已被完整方案替代） |
| `docs/CSS抽离专项方案.md` | 删除（CSS抽离已完成） |
| `docs/CSS重复样式重构步骤清单.md` | 删除（重构步骤已完成） |
| `docs/文件说明.md` | 移除3个已删除文档条目，保留2个文档条目并更新描述 |
| `docs/AGENT_HANDOFF.md` | 目录结构移除3个已删除文档，版本号同步至 v2.33.3 |
| `docs/工作台搭建总结.md` | 版本号同步至 v2.33.3 |
| `docs/CHANGELOG.md` | v2.33.3 版本记录 |

---

## v2.33.2

**发布时间**：2026-08-29（北京时间）

### 全部根目录文档统一归档至 docs/ 文件夹

**核心变更**：将23个根目录 .md 文件统一移入 `docs/` 文件夹，便于团队协作；同步更新 validate_workbench.py、build.py、check_file_doc_coverage.py 中的路径引用；更新 AGENT_HANDOFF.md 目录结构、文件说明.md 归档分类、版本控制规范.md 提交范围。

| 文件 | 更新内容 |
|---|---|
| `docs/*.md` | 23个根目录 .md 文件移入 docs/ 文件夹（git rename） |
| `.trae/skills/validate_workbench.py` | AGENT_HANDOFF.md/CHANGELOG.md/文件说明.md/工作台搭建总结.md 路径加 docs/ 前缀 |
| `build.py` | 文件说明.md/项目约束总览.md 路径加 docs/ 前缀+empty_root_keep 更新 |
| `.trae/skills/check_file_doc_coverage.py` | DOC_PATH 路径加 docs/ 前缀 |
| `docs/AGENT_HANDOFF.md` | 目录结构更新：根目录 .md 项替换为 docs/ 目录树 |
| `docs/文件说明.md` | 根目录 .md 条目移至新建 docs/ 章节 |
| `docs/版本控制规范.md` | 根目录文档列表替换为 docs/ 目录说明 |
| `docs/工作台搭建总结.md` | 版本号同步至 v2.33.2 |
| `docs/CHANGELOG.md` | v2.33.2 版本记录 |

---

## v2.33.1

**发布时间**：2026-08-29（北京时间）

### 练习测验页面新增浮动题号导航面板

**核心变更**：在练习测验页面右侧新增可折叠的浮动题号导航面板，通过颜色区分题目状态（已答/未答/做错/不确定），支持点击题号快速跳转，面板状态随筛选条件联动更新。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/练习测验.html` | 新增浮动题号导航面板HTML结构+renderQuizNav/quizNavJump/toggleQuizNav函数 |
| `styles/自考学习/练习测验.css` | 新增.quiz-nav-panel/.quiz-nav-grid/.quiz-nav-item等样式类 |
| `CHANGELOG.md` | v2.33.1版本记录+v2.33.0文件名通配符优化 |

---

## v2.33.0

**发布时间**：2026-08-28（北京时间）

### CSS守门三层防线+范文数据JSON化+3页CSS抽离+硬编码颜色清零

**核心变更**：创建css-gate skill强制7条CSS硬规则（写入时拦截）；build.py新增CSS标准硬性检查（构建时阻断，不可跳过）；范文内容从静态HTML迁移为JSON数据+外部JS动态渲染；3个知识图谱页面CSS抽离完成；Sass和CSS中全部硬编码颜色替换为CSS变量。

| 文件 | 更新内容 |
|---|---|
| `.trae/skills/css-gate/SKILL.md` | 新增：CSS规范守门skill，7条硬规则+正确head模板+白名单 |
| `.trae/skills/check_css_standards.py` | 新增check_shared_css_references()全量扫描+--full模式+白名单（备份目录匹配） |
| `.trae/skills/validate_workbench.py` | 范文变量检查从const改为var |
| `build.py` | 新增CSS硬性检查（不可跳过）+范文从JSON读取注入为JS对象+{{reading_js}}占位符 |
| `data/modules/reading.json` | contentSource从read/{year}.html改为reading/{year}.json |
| `data/reading/*.json` | 新增：8个年份范文结构化JSON数据（2019-2026） |
| `styles/shared/reading.js` | 新增：范文外部JS渲染函数（renderReadingFromJson等） |
| `templates/workbench.html` | 删除5个内联reading函数+新增{{reading_js}}注入点 |
| `transformers/read.py` | 从JSON文件读取范文数据，设置readingData字段 |
| `styles/_root.scss` | 新增--font-serif变量 |
| `styles/_components.scss` | 8处color:#fff替换为var(--surface)+阴影变量化 |
| `styles/_reading.scss` | 徽章硬编码颜色替换为var(--accent)/var(--accent2) |
| `styles/_responsive.scss` | 移动端阴影替换为var(--shadow) |
| `styles/shared/base-vars.css` | SASS编译产物，新增--font-serif |
| `styles/shared/components.css` | SASS编译产物，按钮/徽章颜色变量化 |
| `styles/阅读/*.css` | 8个阅读CSS（2019-2026）修复.essay-body规则断裂+硬编码颜色 |
| `styles/AI学习/ai-knowledge-tree.css` | 新增：从HTML抽离的CSS |
| `styles/AI学习/job-skill-tree.css` | 新增：从HTML抽离的CSS |
| `styles/Python基础/python-knowledge-tree.css` | 新增：从HTML抽离的CSS |
| `Workbench/此刻便是春天.html` | 范文变量const→var+渲染函数改用window[]+CSS编译注入 |
| `Workbench/ai-learning/ai-knowledge-tree.html` | CSS抽离+引用共享CSS+theme-sync.js |
| `Workbench/ai-learning/job-skill-tree.html` | CSS抽离+引用共享CSS+theme-sync.js |
| `Workbench/Python基础/python-knowledge-tree.html` | CSS抽离+引用共享CSS+theme-sync.js |
| `CHANGELOG.md` | v2.33.0版本记录 |
| `文件说明.md` | 最后更新版本同步至v2.33.0 |
| `工作台搭建总结.md` | 文档版本同步至v2.33.0 |
| `AGENT_HANDOFF.md` | 当前版本同步至v2.33.0 |

---

## v2.32.0

**发布时间**：2026-08-28（北京时间）

### 33页面CSS批量抽离+去重+颜色变量化+滚动条全局隐藏+今日学习流随机抽取

**核心变更**：33个页面的内联CSS批量抽离为外部文件，引用共享CSS（base-vars/base/components）；去重删除:root/reset/body重复块；80+种硬编码颜色全部替换为CSS变量（0残留）；全局隐藏滚动条；今日学习流知识点卡片和快速练习改为随机抽取；新增PWA改造方案文档；dev_server.py新增错因更新API。

| 文件 | 更新内容 |
|---|---|
| `.gitignore` | 新增*.log规则，防止系统日志误提交 |
| `AGENT_HANDOFF.md` | 新增CSS/SASS两层分离架构规则(4.1节)+4条构建踩坑记录(43-46条) |
| `BACKLOG_TODO.md` | 新增移动端PWA改造方案待办（优先级6） |
| `CHANGELOG.md` | v2.32.0版本记录 |
| `dev_server.py` | 新增POST /api/quiz-wrong-reason端点处理错题原因保存 |
| `工作台搭建总结.md` | 文档版本同步至v2.32.0 |
| `文件说明.md` | 最后更新版本同步至v2.32.0 |
| `styles/_root.scss` | 新增--font/--font-mono/--red/--amber/--pass/--warn/--fail变量别名 |
| `styles/_base.scss` | 新增全局滚动条隐藏规则（scrollbar-width:none + ::-webkit-scrollbar） |
| `styles/_variables.scss` | 新增别名变量定义 |
| `styles/shared/base-vars.css` | SASS编译产物，新增变量别名 |
| `styles/shared/base.css` | SASS编译产物，包含全局滚动条隐藏 |
| `styles/AI学习/ai-code-review.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/ai-demos.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/ai-learning-plan.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/ai-news-digest.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/ai-roles-hub.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/daily-plan.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/AI学习/job-learning-loop.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/Python基础/python-demos.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/Python基础/python-learning-loop.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2019.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2020.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2021.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2022.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2023.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2024.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2025.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/阅读/2026.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/复盘总结.css` | 去重+颜色变量化 |
| `styles/自考学习/真题练习-真题与错题本.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/知识框架.css` | 去重+颜色变量化 |
| `styles/自考学习/练习测验.css` | 去重+颜色变量化 |
| `styles/自考学习/背诵与简答.css` | 去重+颜色变量化 |
| `styles/自考学习/英语（二）/00015英语（二）-备考指南.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/英语（二）/00015英语（二）-知识框架与学习计划.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/英语（二）/英语（二）-作文模板.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/英语（二）/英语（二）-真题模拟.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/英语（二）/英语（二）-词汇系统.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/英语（二）/英语（二）-题型专项.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/自考学习/高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/今日学习/今日学习流.css` | 去重+颜色变量化 |
| `styles/番茄钟/番茄钟.css` | 新增：从HTML抽离的CSS，去重+颜色变量化 |
| `styles/能力提升/学习路线图.css` | 去重+颜色变量化 |
| `styles/能力提升/能力提升驾驶舱.css` | 去重+颜色变量化 |
| `Workbench/Python基础/python-demos.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/Python基础/python-learning-loop.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/ai-code-review.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/ai-demos.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/ai-learning-plan.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/ai-news-digest.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/ai-roles-hub.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/daily-plan.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/ai-learning/job-learning-loop.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2019.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2020.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2021.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2022.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2023.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2024.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2025.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/read/2026.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/today/today-flow.html` | CSS抽离+知识点卡片和快速练习改为随机抽取 |
| `Workbench/此刻便是春天.html` | 工作台主页CSS更新 |
| `Workbench/番茄钟/番茄钟.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/00015英语（二）-备考指南.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/00015英语（二）-知识框架与学习计划.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-作文模板.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-真题模拟.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-词汇系统.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00015英语（二）/英语（二）-题型专项.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/未考科目/00023高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/真题练习-真题与错题本.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/自考学习/练习测验.html` | 内联CSS抽离为外部文件，引用shared CSS |
| `Workbench/工作台迁移方案/_shared/js/mermaid.min.js` | 删除（清理旧迁移方案文件） |
| `Workbench/工作台迁移方案/工作台迁移方案-说明.html` | 删除（清理旧迁移方案文件） |
| `Workbench/设计规范-春天活力主题.html` | 删除（已迁移到styles/目录） |
| `Workbench/设计规范-样式指南.html` | 删除（已迁移到styles/目录） |
| `data/mastery-progress.json` | 掌握度数据同步 |
| `data/modules/self-study.json` | 版本号更新至v2.32.0 |
| `data/quiz-records-13015.json` | 答题记录同步 |

## v2.31.53

**发布时间**：2026-08-27（北京时间）

### SASS统一迁移+按钮四级体系+5主题切换+侧边栏渐变融合

**核心变更**：SASS迁移9步全部完成，7个页面CSS硬编码替换为CSS变量；统一四级按钮体系（T1渐变/T2纯色/T3描边/T4文字）；实现5套主题切换（light/dark/warm/nature/rose），工作台右上角统一控制；侧边栏渐变融合消除割裂感；练习测验页面主题适配修复。

| 文件 | 更新内容 |
|---|---|
| `styles/_variables.scss` | 新增$accent/$accent2/$coral/$green等别名变量、$grad-135/$grad-90渐变、$mastery-0~4掌握度、$pri-key/normal/survey优先级 |
| `styles/_root.scss` | 输出CSS变量到:root，新增5套主题[data-theme=light/dark/warm/nature/rose]定义 |
| `styles/_base.scss` | 合并reset规则，body使用var(--bg) |
| `styles/_components.scss` | 新增.zk-btn-primary/.zk-btn-outline/.zk-seg/.zk-theme-toggle等公共组件类 |
| `styles/_layout.scss` | topbar/sidebar背景改为linear-gradient渐变，搜索框半透明，底部栏transparent |
| `styles/_tree.scss` | 清理硬编码rgba色值 |
| `styles/shared/base-vars.css` | 从手写变为SASS编译产物，包含5套主题CSS变量 |
| `styles/shared/base.css` | 从手写变为SASS编译产物，reset+body |
| `styles/shared/components.css` | 从手写变为SASS编译产物，公共组件类 |
| `styles/shared/theme-sync.js` | 新增：iframe内容页面主题同步JS |
| `styles/自考学习/练习测验.css` | body背景从硬编码渐变改var(--bg)，4处硬编码色值改CSS变量 |
| `styles/自考学习/知识框架.css` | 替换硬编码渐变/阴影/掌握度/优先级色值为CSS变量 |
| `styles/自考学习/背诵与简答.css` | 替换硬编码渐变为CSS变量 |
| `styles/自考学习/复盘总结.css` | 替换硬编码渐变/阴影为CSS变量 |
| `styles/今日学习/今日学习流.css` | 替换硬编码渐变为CSS变量 |
| `styles/能力提升/能力提升驾驶舱.css` | 替换硬编码渐变/阴影/rgba为CSS变量 |
| `styles/能力提升/学习路线图.css` | 删除body覆盖，替换硬编码为CSS变量 |
| `build.py` | 新增SASS编译函数+_compile_shared_styles()，BOM strip逻辑 |
| `templates/workbench.html` | 主题切换JS内联，postMessage通知iframe |
| `Workbench/自考学习/知识框架.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/自考学习/练习测验.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/自考学习/背诵与简答-核心概念背诵卡.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/自考学习/复盘总结-章节复盘.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/能力提升/full-learning-roadmap.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/today/today-flow.html` | 引用shared CSS/JS，添加共享按钮类 |
| `Workbench/Python基础/python-knowledge-tree.html` | 引用shared CSS |
| `Workbench/ai-learning/ai-knowledge-tree.html` | 引用shared CSS |
| `Workbench/ai-learning/job-skill-tree.html` | 引用shared CSS |
| `Workbench/此刻便是春天.html` | 工作台主页（编译产物，含主题切换JS） |
| `Workbench/shared/base-vars.css` | 删除（迁移到styles/shared/） |
| `data/modules/self-study.json` | 版本号更新至v2.31.53 |
| `data/modules/ability.json` | 版本号同步 |
| `data/modules/today.json` | 版本号同步 |
| `data/mastery-progress.json` | 掌握度数据同步 |
| `data/quiz-records-13015.json` | 答题记录同步 |
| `styles/_reading.scss` | 清理硬编码色值 |
| `tools/css-var-debug.js` | 新增：CSS变量调试脚本，检查computed style |
| `SASS统一迁移完整方案.md` | 新增：SASS迁移完整方案文档（9步全部标记完成） |
| `SASS统一迁移方案.md` | 新增：SASS迁移方案文档（早期版本） |
| `CSS重复样式重构步骤清单.md` | 新增：CSS重构步骤清单文档 |
| `.trae/skills/validate_workbench.py` | 更新：CSS增量/基线规范检查 |
| `文件说明.md` | 更新：新增文件记录，版本号更新至v2.31.53 |
| `工作台搭建总结.md` | 版本号更新至v2.31.53 |

---

## v2.31.45

**发布时间**：2026-08-26（北京时间）

### CSS抽离方案文档+githooks+用户偏好更新

**核心变更**：新增CSS抽离专项方案和公共JS/CSS抽离总方案文档；新增githooks（post-checkout/post-commit/post-merge/pre-push）；新增重构计划可视化页面；更新用户偏好（拆卡原则、题型分配、验收驱动等系统升级总结）；更新文件说明.md补充6个缺失文件记录。

| 文件 | 更新内容 |
|---|---|
| `CSS抽离专项方案.md` | 新增：CSS抽离落地执行细则（基于现有代码分析，含抽离目标/执行步骤/验收标准） |
| `公共JS与CSS抽离方案B.md` | 新增：公共JS与CSS抽离总方案（CSS+JS两阶段规划） |
| `public-js-css-refactor-plan/public-js-css-refactor-plan.html` | 新增：重构计划可视化页面 |
| `public-js-css-refactor-plan/_shared/js/mermaid.min.js` | 新增：Mermaid图表库 |
| `githooks/post-checkout` | 新增：Git post-checkout hook |
| `githooks/post-commit` | 新增：Git post-commit hook |
| `githooks/post-merge` | 新增：Git post-merge hook |
| `githooks/pre-push` | 新增：Git pre-push hook |
| `用户偏好与AI协作建议.md` | 更新：拆卡原则、题型分配规范、题目数量标准、验收驱动、设计规范对标等系统升级偏好 |
| `工作台搭建总结.md` | 更新：版本号同步至 v2.31.45 |
| `文件说明.md` | 更新：补充6个缺失文件记录（CSS抽离方案/公共JS与CSS方案B/三科设计规范/public-js-css-refactor-plan/assets）；版本号更新至 v2.31.45 |
| `CHANGELOG.md` | 新增 v2.31.41~v2.31.45 版本记录 |

---

## v2.31.41 ~ v2.31.44

**发布时间**：2026-08-26（北京时间）

### 三科1-3章闭环标准化验收

**核心变更**：三科1-3章闭环标准化修复，按拆卡原则和题型分配规范完成所有卡片拆分和题目补充。离散数学从25卡154题变为37卡232题；计算机系统原理从56卡259题变为70卡405题；数据结构与算法从12卡76题变为23卡171题。合计130卡615知识点808题，9项检查全部通过。新增三科卡片与题目设计规范文档。练习测验筛选从知识点改为章节下拉框。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-02324.json` | 离散数学第1章16→19卡74→120题，第2章8卡38→51题，第3章9→10卡42→61题 |
| `data/quiz-bank-02324.json` | 离散数学题库扩充至232题 |
| `data/knowledge-framework-13015.json` | 系统原理第1章16→23卡82→145题，第2章21→27卡91→153题，第3章19→20卡86→107题 |
| `data/quiz-bank-13015.json` | 系统原理题库扩充至405题 |
| `data/knowledge-framework-13003.json` | 数据结构第1章拆卡补题，第2章5→9卡，第3章4→5卡 |
| `data/quiz-bank-13003.json` | 数据结构题库扩充至171题 |
| `Workbench/自考学习/练习测验.html` | 筛选下拉框从知识点改为章节，卡片标题改为章节·知识点紫色加粗 |
| `离散数学-卡片与题目设计规范.md` | 新增：离散数学卡片与题目设计规范文档 |
| `数据结构与算法-卡片与题目设计规范.md` | 新增：数据结构与算法卡片与题目设计规范文档 |
| `计算机系统原理-卡片与题目设计规范.md` | 新增：计算机系统原理卡片与题目设计规范文档 |
| `data/modules/self-study.json` | 三科知识框架 contentUrl 版本号更新 |
| `BACKLOG_TODO.md` | 新增公共JS抽离、pre-commit退出码、公共样式抽离等项 |

---

## v2.31.40

**发布时间**：2026-08-26（北京时间）

### 三科前三章知识点补充+题库扩充+练习测验筛选改造+设计规范文档

**核心变更**：计算机系统原理第2-3章补充14个考核要求缺失项，新增7概念卡+29题/章，第2章补14概念62题；离散数学第2-3章新增考核要求section，补4概念卡+19题；数据结构与算法第2-3章新增考核要求section，拆卡(5→9卡)按新规范验收，补题型+覆盖率；练习测验筛选从知识点下拉框改为章节下拉框，题目卡片标题改为章节·知识点紫色加粗；新增数据结构与算法-卡片与题目设计规范.md。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-13015.json` | 系统原理第2章新增7概念卡+更新4卡，第3章新增7概念卡+更新5卡 |
| `data/quiz-bank-13015.json` | 系统原理第2章补62题(29→91)，第3章补29题(0→29)，题库136→256 |
| `data/knowledge-framework-02324.json` | 离散数学第2-3章新增考核要求section，补4概念卡 |
| `data/quiz-bank-02324.json` | 离散数学补19题(135→154) |
| `data/knowledge-framework-13003.json` | 数据结构第2-3章新增考核要求section，第2章拆卡(5→9卡)，第3章拆卡(4→5卡) |
| `data/quiz-bank-13003.json` | 数据结构补95题(76→171) |
| `Workbench/自考学习/练习测验.html` | 筛选下拉框从知识点改为章节，卡片标题改为章节·知识点紫色加粗 |
| `数据结构与算法-卡片与题目设计规范.md` | 新增文档：卡片设计规范+题目设计规范+执行流程+验收检查清单 |
| `BACKLOG_TODO.md` | 新增公共JS抽离、pre-commit退出码、公共样式抽离等项 |
| `工作台搭建总结.md` | 补充9条已解决问题记录(第34-42条) |
| `data/modules/self-study.json` | 三科知识框架 contentUrl 版本号更新至 v2.31.40 |
| `data/mastery-progress.json` | 三科掌握进度数据更新 |
| `data/quiz-records-02324.json` | 离散数学答题记录更新 |
| `data/quiz-records-13015.json` | 系统原理答题记录更新 |
| `data/recite-mastery.json` | 背诵卡掌握进度数据更新 |
| `文件说明.md` | 版本号更新至 v2.31.40；新增数据结构与算法-卡片与题目设计规范.md记录 |
| `工作台搭建总结.md` | 版本号更新至 v2.31.40 |
| `CHANGELOG.md` | 新增 v2.31.40 版本记录 |

---

## v2.31.15

**发布时间**：2026-08-26（北京时间）

### 系统原理第1章知识点扩充+知识框架纯动态渲染+优先级统计

**核心变更**：系统原理第1章新增4个核心概念，题库扩充至136道；知识框架章节精讲改为纯动态渲染，移除静态HTML兜底；核心概念标题旁新增重点/一般/了解数量统计；背诵卡DATA_VERSION改为从URL v参数读取；修复特殊符号面板disabled属性判断错误；移除旧lgAnnotate注解层。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-13015.json` | 系统原理第1章新增4个核心概念（计算机系统层次结构、系统软件与应用软件、用户视角与课程定位、性能影响因素） |
| `data/quiz-bank-13015.json` | 系统原理题库新增14道题，总题数136道 |
| `Workbench/自考学习/知识框架.html` | 章节精讲改为纯动态渲染，移除静态HTML兜底；核心概念标题旁新增重点/一般/了解数量统计；移除旧lgAnnotate注解层（难度标签、筛选按钮栏） |
| `Workbench/自考学习/背诵与简答-核心概念背诵卡.html` | DATA_VERSION改为从URL v参数读取，避免缓存不同步 |
| `Workbench/自考学习/练习测验.html` | 修复特殊符号面板disabled属性判断错误 |
| `Workbench/此刻便是春天.html` | 版本号同步更新 |
| `data/modules/self-study.json` | 知识框架/背诵卡/练习测验 contentUrl 版本号更新 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.14 → v2.31.15 |
| `工作台搭建总结.md` | 版本号 v2.31.14 → v2.31.15；新增 v2.31.15 版本记录 |
| `文件说明.md` | 版本号 v2.31.14 → v2.31.15 |

---

## v2.31.14

**发布时间**：2026-08-25（北京时间）

### 三科前三章学习闭环完成+复盘状态筛选+闭环模板文档

**核心变更**：系统原理和数据结构与算法前三章题库按知识点扩充至100/76题，复盘总结新增答题状态筛选，修复特殊符号面板点击无效，新增学习闭环标准模板文档。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/练习测验.html` | 修复特殊符号面板点击无效（ta.quiz-disabled语法错误→ta.disabled）；版本号 v2.31.23 |
| `Workbench/自考学习/复盘总结-章节复盘.html` | 新增答题状态筛选下拉框（未答/答对/答错）；统计区chip化；选项字母去重修复 |
| `data/quiz-bank-13015.json` | 系统原理题库替换扩充至100题，22个知识点全覆盖，每题带id和cardId |
| `data/quiz-bank-13003.json` | 数据结构题库替换扩充至76题，18个知识点全覆盖，每题带id和cardId |
| `data/quiz-records-02324.json` | 答题记录更新 |
| `data/mastery-progress.json` | 掌握进度数据更新 |
| `data/modules/self-study.json` | 练习测验版本号更新（13003/13015 → v2.31.23） |
| `Workbench/此刻便是春天.html` | 版本号同步更新 |
| `离散数学学习闭环标准模板.md` | 新增：学习闭环完整描述，作为后续章节补充的标准模板 |

---

## v2.31.13

**发布时间**：2026-08-25（北京时间）

### 练习测验三层筛选+题库扩充+判分修复

**核心变更**：练习测验页面改造为三层筛选（知识点+题型+掌握程度），三科题库大幅扩充，修复选择题判分逻辑和复盘总结选项字母重复问题。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/练习测验.html` | 三层筛选改造（知识点/题型/掌握程度下拉框配色）；移除自由选择和弱点优先模式按钮；题目渲染去除选项字母前缀；修复 scoreChoice 函数 subType 未定义时默认按单选处理；版本号 v2.31.21 |
| `Workbench/自考学习/复盘总结-章节复盘.html` | 三处选项渲染添加正则去除数据中自带字母前缀；版本号 v2.3.5 |
| `data/quiz-bank-02324.json` | 离散数学题库扩充至 135 道题，所有题目添加 id 字段（q-02324-XXX） |
| `data/quiz-bank-13003.json` | 数据结构与算法题库扩充，添加 id 字段 |
| `data/quiz-bank-13015.json` | 系统原理题库扩充，添加 id 字段 |
| `data/quiz-records-02324.json` | 答题记录更新 |
| `data/mastery-progress.json` | 掌握进度数据更新 |
| `Workbench/此刻便是春天.html` | 练习测验/复盘总结 contentUrl 版本号更新 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.13 |
| `工作台搭建总结.md` | 版本号 v2.31.13 |
| `文件说明.md` | 删除 recite-cards 旧文件记录，新增 recite-mastery.json 记录 |

---

## v2.31.12

**发布时间**：2026-08-25（北京时间）

### 背诵卡数据源统一+三科全章节卡片补全+旧文件清理

**核心变更**：背诵卡数据源从独立 JSON 文件迁移至知识框架 JSON，三科全章节卡片补全，统一数据源后删除 recite-cards 旧文件，today-flow 和练习测验页面数据源迁移。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答-核心概念背诵卡.html` | 数据源从 recite-cards JSON 改为知识框架 JSON |
| `Workbench/today/today-flow.html` | 数据源从 recite-cards JSON 改为知识框架 JSON |
| `Workbench/自考学习/练习测验.html` | 数据源从 recite-cards JSON 改为知识框架 JSON |
| `data/knowledge-framework-02324.json` | 离散数学全章节卡片补全（记忆卡+计算卡） |
| `data/knowledge-framework-13003.json` | 数据结构与算法全章节卡片补全 |
| `data/knowledge-framework-13015.json` | 系统原理全章节卡片补全 |
| `data/recite-cards-02324.json` | 【删除】旧背诵卡数据已迁移至知识框架 JSON |
| `data/recite-cards-13003.json` | 【删除】旧背诵卡数据已迁移至知识框架 JSON |
| `data/recite-cards-13015.json` | 【删除】旧背诵卡数据已迁移至知识框架 JSON |
| `data/recite-mastery.json` | 新增：背诵卡掌握度独立存储 |
| `data/modules/self-study.json` | 三科背诵卡/练习测验 contentUrl 版本号更新 |

---

## v2.31.11

**发布时间**：2026-08-25（北京时间）

### 离散数学第一章数据纠正

**核心变更**：纠正离散数学第一章核心概念数据归属错误，补充推理定律和常用命题定律，页码改为教材页码+PDF页码双标注，收录考核内容与要求。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-02324.json` | 第一章补充推理定律（教材P40）、常用命题定律（教材P36-37）、考核内容与要求（教材P13）；页码改为双标注格式 |
| `data/learning-guide.json` | 学习指南同步更新 |

---

## v2.31.10

**发布时间**：2026-08-25（北京时间）

### 今日学习流快速练习修复

**核心变更**：修复离散数学快速练习"看答案"点击无效和切换任务后答案丢失两个问题。

| 文件 | 更新内容 |
|---|---|
| `Workbench/today/today-flow.html` | 修复 checkPractice/showPractice 的 onclick 字符串中 `\n`/`\r` 未转义导致点击无效；新增 savePracticeState() 用 sessionStorage 按任务索引保存用户输入、反馈和掌握状态，renderPractice 渲染后自动恢复 |
| `Workbench/此刻便是春天.html` | today-flow contentUrl 版本号 v1.3.2 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.10 |
| `工作台搭建总结.md` | 版本号 v2.31.10 |
| `data/mastery-progress.json` | 掌握进度数据更新 |
| `data/study-plan.json` | 学习计划数据更新 |

---

## v2.31.9

**发布时间**：2026-08-25（北京时间）

### 三科知识框架核心概念改为"概述+分条"卡片样式（方案B）

**核心变更**：三科共190个核心概念从一整段长文本拆分为一句话概述 + 分条要点列表；页面渲染改为方案B淡色标题栏卡片样式；修复章节切换失效和页面加载闪烁问题。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-13003.json` | 第1章新增"考核知识点与考核要求"板块（前置概览）；9个核心概念补充 points 字段；补充逻辑结构分类、存储结构定义（PDF P41-42） |
| `data/knowledge-framework-13015.json` | 6章82个核心概念全部拆分为 summary + points 结构 |
| `data/knowledge-framework-02324.json` | 9章57个核心概念全部拆分为 summary + points 结构 |
| `Workbench/自考学习/知识框架.html` | 新增 kp-header/kp-body/kf-points 渲染和 CSS；修复 checkbox 注入破坏卡片布局（跳过 .lg-kp-item）；修复章节按钮重建后点击失效（改用 window.switchChapterTab）；了解色从灰改绿；加载闪烁优化（kf-loading 淡入） |
| `data/modules/self-study.json` | 知识框架 contentUrl 版本号 v2.31.9 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.9 |
| `工作台搭建总结.md` | 版本号 v2.31.9 |
| `Workbench/此刻便是春天.html` | 构建产物（版本号更新） |

---

## v2.31.1

**发布时间**：2026-08-25（北京时间）

### 2026-08-25 — 三科知识框架核心概念与学习指南数据对齐

**核心变更**：修复章节筛选按钮数字与核心概念数量不一致的问题。三科 23 章的核心概念 items 以 `learning-guide.json` 为准重建，数量与优先级分布（重点/一般/了解）逐一对齐；原有但学习指南未收录的知识点并入相关项，内容无丢失。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-13015.json` | 6 章核心概念对齐学习指南：10/14/12/15/17/14 项（重点/一般/了解分布一致）；原"程序开发与执行/用户分类/进位计数制/整数表示/中断系统"等并入相关项 |
| `data/knowledge-framework-02324.json` | 9 章核心概念对齐学习指南：13/7/7/5/7/4/3/6/5 项；第2章"范式/主范式"并入第1章、第9章"欧拉/哈密顿图"并入第8章等 |
| `data/knowledge-framework-13003.json` | 8 章核心概念对齐学习指南：6/5/4/5/8/7/7/6 项；"B树/B+树""顺序查找""装填因子"等并入相关项；第8章 BST summary 补全 |
| `data/modules/self-study.json` | 知识框架 contentUrl 版本号 v2.31.1 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.1 |
| `工作台搭建总结.md` | 版本号 v2.31.1；版本记录追加 v2.31.1 |
| `文件说明.md` | 最后更新 v2.31.1 |
| `Workbench/此刻便是春天.html` | 构建产物（版本号更新） |

---

## v2.31.0

**发布时间**：2026-08-25（北京时间）

### 2026-08-25 — 自考公用页面迁移至 自考学习/ 根目录 + 知识框架 CSS 路径修复

**核心变更**：知识框架与 4 个公用页面（背诵与简答、练习测验、复盘总结、真题与错题本）全部平铺到 `Workbench/自考学习/` 根目录，删除原子目录（背诵与简答/、复盘总结/、真题练习/）；修复知识框架迁移后 base-vars.css 相对路径错误导致的标题白字问题；页面间链接统一为同目录引用。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/知识框架.html` | 新增（迁移自 `备考科目/02324离散数学/02324离散数学-目录与知识框架.html`）；base-vars.css 引用修正为 `../shared/`（修复白字 bug）；9 处练习测验链接改为同目录 `练习测验.html` |
| `Workbench/自考学习/背诵与简答-核心概念背诵卡.html` | 新增（迁移自 `背诵与简答/`）：base-vars `../shared/`；练习测验链接改同目录；file: 协议 data 路径 `../../data` |
| `Workbench/自考学习/练习测验.html` | 新增（迁移自 `背诵与简答/`）：base-vars `../shared/`；复盘总结链接改同目录 |
| `Workbench/自考学习/复盘总结-章节复盘.html` | 新增（迁移自 `复盘总结/`）：base-vars `../shared/`；练习测验/背诵卡链接 6 处改同目录 |
| `Workbench/自考学习/真题练习-真题与错题本.html` | 新增（迁移自 `真题练习/`，无内部相对引用） |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 删除（已迁移至根目录知识框架.html） |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html`、`练习测验.html`、`复盘总结/复盘总结-章节复盘.html`、`真题练习/真题练习-真题与错题本.html` | 删除（已迁移至根目录） |
| `data/modules/self-study.json` | 三科知识框架/背诵卡/练习测验/复盘总结/真题与错题本 contentUrl 更新为根目录路径（12 处）；知识框架版本号 v2.31.0 |
| `data/knowledge-framework-13015.json` | meta.sourceFile 更新为 `自考学习/知识框架.html?subject=13015` |
| `data/knowledge-framework-13003.json` | meta.sourceFile 更新为 `自考学习/知识框架.html?subject=13003` |
| `data/knowledge-framework-02324.json` | meta.sourceFile 更新为 `自考学习/知识框架.html?subject=02324` |
| `.trae/skills/validate_workbench.py` | localStorage 键名检查重写为扫描统一页面（键名出现任意科目代码即告警）；JS 一致性检查/版本号检查路径更新为根目录知识框架.html |
| `.trae/skills/check_priority_labels.py` | 检查页面路径更新为根目录知识框架.html |
| `.trae/skills/check_css_standards.py` | CSS 基线列表更新为根目录 4 个公用页面路径 |
| `AGENT_HANDOFF.md` | 版本号 v2.31.0；目录结构更新（公用页面平铺根目录）；contentUrl/按钮示例更新为根目录引用 |
| `工作台搭建总结.md` | 版本号 v2.31.0；版本记录追加 v2.31.0 |
| `文件说明.md` | 版本号 v2.31.0；公用页面集中记录（知识框架/背诵卡/练习测验/复盘总结/真题与错题本） |
| `Workbench/ai-learning/ai-learning-plan.html` | 三科知识框架路径引用更新为根目录 |
| `Workbench/此刻便是春天.html` | 构建产物：5 个公用页面导航指向根目录新路径 |

---

## v2.30.0

**发布时间**：2026-08-24（北京时间）

### 2026-08-24 — 知识框架单页参数化（方案A-1）：三科共用 02324 页面，?subject= 区分

**核心变更**：知识框架三科页面合并为单一页面（`02324离散数学-目录与知识框架.html`），通过 URL 参数 `?subject=13015|02324|13003` 区分科目；删除 13015/13003 原 HTML 文件；localStorage 掌握度键按科目隔离（`ss_mastery_{科目代码}`）；数据源过滤改为 plan 键名（系统原理/离散数学/数据结构）。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 参数化改造（方案A-1）：SUBJECT_META 三科映射（display显示名/plan数据源键名双字段）；SS_SUBJECT/SUBJECT_CODE 从 `?subject=` 读取；localStorage 键（ss_mastery/ss_active_tab/ss_active_chapter）按科目动态化；页面标题/科目标签/练习测验链接按科目动态设置；学习计划与学习指南过滤改用 PLAN_SUBJECT（适配 study-plan.json/learning-guide.json 的科目键名）；完整目录在非02324科目时移除静态考试大纲/编者话等front matter；章节精讲tab按科目重建章节导航按钮并清理多余pane；变量经 window 暴露供学习指南/JSON驱动模块复用 |
| `data/modules/self-study.json` | 三科知识框架 contentUrl 统一指向 02324 单页 + `?subject=` 参数（13015/02324/13003），版本号 v2.30.0 |
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 删除：原独立页面（导航已指向统一页面） |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 删除：原独立页面（导航已指向统一页面） |
| `.trae/skills/validate_workbench.py` | 知识框架JS一致性检查改为验证统一页面（02324）的参数化标记（SUBJECT_META/URL参数读取/window暴露/动态键名） |
| `.trae/skills/check_priority_labels.py` | 检查范围收敛为统一页面（02324），知识点优先级数据以JSON为准 |
| `.trae/skills/check_css_standards.py` | CSS基线扫描列表移除已删除的 13015/13003 页面 |
| `build.py` | 修复清理阶段遍历目录时路径已消失的 FileNotFoundError（_remove_path 增加存在性容错） |
| `data/knowledge-framework-13015.json` | meta.sourceFile 更新为统一页面路径（?subject=13015） |
| `data/knowledge-framework-13003.json` | meta.sourceFile 更新为统一页面路径（?subject=13003） |
| `data/mastery-progress.json` | 掌握度数据迁移标记（_migrated/toc 字段，5档体系数据演进） |
| `AGENT_HANDOFF.md` | 版本号 v2.30.0；知识框架注册示例更新为统一页面 + subject 参数 |
| `工作台搭建总结.md` | 版本号 v2.30.0；版本更新记录追加 v2.30.0 条目 |
| `文件说明.md` | 版本号 v2.30.0；科目目录说明更新（13015/13003 无独立知识框架页，共用 02324 统一页面） |
| `Workbench/ai-learning/ai-learning-plan.html` | 三科知识框架路径引用更新为统一页面 + subject 参数 |
| `Workbench/此刻便是春天.html` | 构建产物：三科知识框架导航指向统一页面 |

---

## v2.29.0

**发布时间**：2026-08-24（北京时间）

### 2026-08-24 — 三科知识框架JSON化 + 掌握度5档体系 + 章节状态全自动判定

**核心变更**：三科知识框架从写死HTML提取为统一JSON数据源（含整体定位/学习提示/优先级标注），02324页面三tab全部JSON驱动；掌握度从4档扩展为5档（新增"不会"红色）；章节状态改为由知识点完成度全自动判定（≥50%掌握）。

| 文件 | 更新内容 |
|---|---|
| `data/knowledge-framework-13015.json` | 新增：知识框架单一数据源（6章41核心概念，含meta.overview/tips，schemaVersion 1.1.0） |
| `data/knowledge-framework-02324.json` | 新增：知识框架单一数据源（9章87核心概念，含meta.overview/tips，schemaVersion 1.1.0） |
| `data/knowledge-framework-13003.json` | 新增：知识框架单一数据源（8章62核心概念，含meta.overview/tips，schemaVersion 1.1.0） |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 三tab全部JSON驱动：学习计划（study-plan.json按科目过滤，初级/中间/冲刺三阶段卡片）、知识总览（overview/tips/章节网格/完整目录）、章节精讲（knowledge-framework渲染）；掌握度4档扩展为5档（待学习/学习中/不会/不熟/掌握），旧数据一次性迁移（_migrated标记防重复迁移）；完整目录每节/小节新增5档状态点toc-dot（点击循环切换，存state.toc经/api/mastery同步）；章节状态改为知识点完成度全自动判定（≥50%掌握/40-49%不熟/20-39%学习中/<20%待学习），掌握度按钮降级为只读规则提示；ch-card/ch-icon/掌握度按钮CSS同步5档颜色 |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 旧版章节（第2-8章）知识点升级为新版带优先级badge格式，与第1章及JSON数据对齐 |
| `data/mastery-progress.json` | 掌握度数据结构更新（toc字段支持目录小节状态） |

---

## v2.28.0

**发布时间**：2026-08-24（北京时间）

### 2026-08-24 — 计划9周方案 + 驾驶舱数据JSON化 + 练习测验多项修复

**核心变更**：学习计划从10周压缩为9周（方案A），驾驶舱统筹计划彻底去除写死数据改为JSON驱动，练习测验新增AI单题解答并修复多项数据问题。

| 文件 | 更新内容 |
|---|---|
| `data/study-plan.json` | 方案A：删除原第1周（8/18-8/24），周次重编号为9周，新第1周（8/25-8/31）isCurrent=true并合并三科第1章内容；修复第6周日期错乱（9/31/11/2等）和第9周多余两天；版本号v3.4.0 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | 删除写死的10周WEEK_DATA，统筹计划完全依赖study-plan.json；loadWeekData改为纯缓存读取，空数据显示"请启动本地服务器"提示；SCHEDULE_VERSION v3.4.1 |
| `data/modules/ability.json` | 驾驶舱contentUrl版本号更新 |
| `data/modules/self-study.json` | 三科知识框架页面版本号 v2.27.0→v2.28.0，练习测验版本号 v2.18.4→v2.18.10 |
| `AGENT_HANDOFF.md` | 版本号同步至 v2.28.0 |
| `工作台搭建总结.md` | 版本号同步至 v2.28.0，版本更新记录表新增 v2.27.0/v2.28.0 条目 |
| `文件说明.md` | 版本号同步至 v2.28.0 |
| `.gitignore` | 新增 `data/*.bak-*` 备份忽略规则 |
| `Workbench/自考学习/背诵与简答/练习测验.html` | 修复AI出题"未知题型"显示bug（中文题型映射英文key）；今日任务章节前缀匹配修复；新增单题AI解答按钮（上下文感知+多轮对话）；刷新后恢复已答题记录（答题状态/得分/用户答案） |
| `Workbench/此刻便是春天.html` | 构建产物更新 |
| `data/ai-daily-plan.json` | 每日计划数据同步至8/25-8/31 |
| `data/quiz-records-13015.json` | 答题记录数据更新 |
| `data/mastery-progress.json` | 掌握度数据更新 |
| `.trae/skills/reading_integration.py` | 修复 validate_js 使用共享文件 workbench_check.js 被并发进程删除导致构建失败，改用独立临时文件（与 check_js_syntax_global 一致） |

---

## v2.27.0

**发布时间**：2026-08-23（北京时间）

### 2026-08-23 — 文档体系重组 + 三科页面修复

**核心变更**：交接文档瘦身重组、用户偏好合并去重、三科知识框架页面修复。

| 文件 | 更新内容 |
|---|---|
| `AGENT_HANDOFF.md` | 重组：删除用户画像/雷区（迁移到用户偏好），设计原则44条精简为18条技术规范，章节重新编号，版本历史压缩为总览表 |
| `用户偏好与AI协作建议.md` | 合并版：红线+沟通姿势+忠告统一迁移到雷区按愤怒程度排序，去重7组交叉引用，时间分配统一70% |
| `NEW_AGENT_START_HERE.md` | 更新重点看章节名称（红线→雷区、忠告→已合并、设计原则→技术规范） |
| `文件说明.md` | 版本号更新v2.27.0，删除Workbench UI交互规范条目，更新文档描述 |
| `文件约束隐患与规避方案.md` | 新增第14条：HTML结构不匹配隐患 + 13003按钮案例 |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | div结构修复、按钮重复修复、版本号升级 |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | div结构修复、按钮重复修复、localStorage键名修正、版本号升级 |
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 按钮宽度修复、版本号升级 |
| `Workbench/此刻便是春天.html` | 构建产物更新 |
| `data/modules/self-study.json` | 三科版本号同步升级 |
| `data/mastery-progress.json` | 数据更新 |
| `Workbench UI 交互规范.md` | 已删除（内容已覆盖到其他文档） |
| `工作台搭建总结.md` | 版本号同步至 v2.27.0 |

---

## v2.20.0

**发布时间**：2026-08-22 02:30（北京时间）

### 2026-08-22 — 章节精讲样式1:1还原 + 三科统一

**核心变更**：章节精讲板块全面重构，与设计稿1:1对齐，并将样式从计算机系统原理同步到离散数学和数据结构与算法。

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 章节精讲样式迭代：移除"本章概览"统计条和重难点提示；信息条改为 `基础 P26-44 N/18 知识点` + 右侧重点/一般计数；筛选药丸添加数量（全部N·重点N·一般N·了解N），选中态改为蓝紫渐变；知识点颜色区分（字体颜色+浅色背景）；底部添加"去练习测验"渐变按钮；分类卡片可折叠（核心概念默认展开）；版本号 v2.5.6 |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 章节精讲样式全面升级（与系统原理对齐）：信息条新样式、筛选带计数、渐变选中态、分类卡片化、知识点颜色标签+背景色、测验按钮、折叠功能；版本号 v2.4.4 |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 章节精讲样式全面升级（与系统原理对齐）：同上；版本号 v2.4.4 |
| `data/modules/self-study.json` | 三科知识框架版本号更新 |
| `AGENT_HANDOFF.md` | 版本号更新为 v2.20.0，版本记录表新增 v2.20.0 条目 |
| `用户偏好与AI协作建议.md` | v2.20 更新：用户性格速写、工作模式三档位、设计稿还原规范、新Agent忠告 |
| `工作台搭建总结.md` | 版本号同步至 v2.20.0 |
| `文件约束隐患与规避方案.md` | v2.20.x Skill 化建设进度更新 |
| `.trae/skills/ui-design-restoration/SKILL.md` | 设计稿还原 Skill 文档更新 |
| `.trae/skills/check_structural_change.py` | 修复中文文件名 bug：run_git() 加 -c core.quotepath=false |
| `.trae/skills/check_css_standards.py` | 修复中文文件名 bug：get_git_changed_html_files() 加 -c core.quotepath=false |
| `.trae/skills/validate_workbench.py` | 修复中文文件名 bug：check_commit_acceptance_tag() 的 git diff 加 -c core.quotepath=false |
| `文件说明.md` | 补全 11 个缺失文件记录 + 添加「最后更新」版本标记 |
| `githooks/commit-msg` | 新增 commit-msg hook：检查提交信息含 [验收通过]，兼容 BOM 和 Windows 换行符，豁免 merge/revert |
| `.trae/skills/validate_workbench.py` | 结构性变更+验收标记从 advisory 升级为 critical（strict 模式阻止提交） |
| `.trae/skills/check_structural_change.py` | 废弃 .structural-change-approved 文件机制，改为检查 commit message 中 [方案已确认] 标记 |
| `.trae/skills/structural-change-workflow/SKILL.md` | 新增第5步提交规范：结构性变更需 [方案已确认] [验收通过] 双标记 |
| `githooks/commit-msg` | 升级：调用 Python 检测结构性变更（staged_only），结构性变更提交缺 [方案已确认] 时拦截 |
| `.trae/skills/check_css_standards.py` | 新增 check_css_baseline() 全量基线扫描（11个核心页面），支持 --baseline 参数 |
| `.trae/skills/check_priority_labels.py` | 扩展为全章节扫描（find_all_core_concepts_sections），不再只查第一个核心概念板块 |
| `.trae/skills/validate_workbench.py` | CSS 检查增加基线扫描调用 |
| `项目约束总览.md` | 更新校验脚本索引：补充 critical 标记、CSS 基线扫描、全章节优先级检查、githooks 路径 |
| `Workbench/shared/base-vars.css` | 新增：全局设计变量共享文件（17 个标准变量） |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | P0 删除 :root 块引入 base-vars.css + P1 .active→.zk-active + li{}→ul li{} |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 同上 |
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 同上 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | P0 + P1 .active→.zk-active .show→.zk-show |
| `Workbench/自考学习/背诵与简答/练习测验.html` | P0 --text→--ink --border→--rule + P1 .active/.show/.selected/.disabled/.header/.container 全部加前缀 |
| `Workbench/自考学习/复盘总结/复盘总结-章节复盘.html` | P0 + P1 .active→.zk-active |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | P0 + P1 .active→.zk-active |
| `Workbench/Python基础/python-knowledge-tree.html` | P0 + P1 .show→.zk-show |
| `Workbench/ai-learning/ai-knowledge-tree.html` | P0 + P1 .show→.zk-show |
| `Workbench/ai-learning/job-skill-tree.html` | P0 + P1 .active→.zk-active .show→.zk-show |

---

## v2.19.3

**发布时间**：2026-08-21 23:30（北京时间）

### 2026-08-21 — 知识框架结构级差异修复（1:1还原设计稿）

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | **整体定位**：长文本+编号列表→简洁卡片（紫色边框，card-label标签，一句话总结）；**章节卡片**：class状态（mastered/progress/review/idle）+彩色边框+状态图标（✓/○/⚠/○）；**完整目录**：展开列表→可折叠卡片（紫色边框，chevron箭头，toggleCollapse JS）；**C程序完整旅程**：普通文本列表→步骤卡片（journey-step，蓝紫渐变圆圈数字，step-ch章节链接）；新增CSS：`.kf-card` `.card-label` `.card-body` `.journey-step` `.collapse-card` `.chevron` `.collapse-body`；版本号 v2.4.5→v2.4.6 |
| `data/modules/self-study.json` | 版本号 v2.4.5→v2.4.6 |

---

## v2.19.2

**发布时间**：2026-08-21 23:25（北京时间）

### 2026-08-21 — 知识框架样式1:1还原设计稿

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 样式1:1对齐设计稿：header margin-bottom 1rem→0.8rem；section去除border；chapter-grid margin改为0.6rem bottom；ch-card hover阴影0.08→0.1；accent主色#2563eb→#3b82f6（12处）；progress/review/mastered边框色统一为设计稿值；kf-stats-mini/kf-pill/ss-stat gap 3px→4px；kf-subject-tag添加margin-left:6px |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | accent主色#2563eb→#3b82f6（11处） |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | accent主色#2563eb→#3b82f6（11处） |
| `data/modules/self-study.json` | 知识框架contentUrl版本号 v2.4.4→v2.4.5 |
| `AGENT_HANDOFF.md` | 版本号更新至 v2.19.2，版本历史表新增 v2.19.2 条目，项目描述更新 |
| `工作台搭建总结.md` | 版本号同步至 v2.19.2，新增 v2.19.2 版本记录 |
| `文件说明.md` | 版本号同步至 v2.19.2 |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |

---

## v2.19.1

**发布时间**：2026-08-21 18:43（北京时间）

### 2026-08-21 — 侧边栏排版优化

| 文件 | 更新内容 |
|---|---|
| `styles/_tree.scss` | 侧边栏CSS重构：隐藏图标/圆点/进度条/课程代码，改为字号+字重分层（L1: 0.84rem 700粗体深色，L2: 0.76rem 500中等灰色，L3: 0.72rem 400常规浅色），缩小chevron和badge尺寸 |
| `templates/workbench.html` | renderTree()支持 `flat: true` 分类：跳过分类头部直接渲染子项，消除冗余中间层 |
| `data/modules/today.json` | 分类添加 `flat: true`，今日学习从3层降为2层（去掉「今日任务」中间层） |
| `data/modules/self-study.json` | 两个分类添加 `flat: true`，自考学习从4层降为3层（去掉「备考科目」「未考科目」容器层） |
| `data/modules/ability.json` | 分类添加 `flat: true`，能力提升从3层降为2层（去掉「总览」中间层） |
| `data/modules/reading.json` | 分类添加 `flat: true`，阅读资料从3层降为2层（去掉「高考语文」中间层） |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |
| `AGENT_HANDOFF.md` | 版本号更新至 v2.19.1，版本历史表新增 v2.19.1 条目，项目一句话描述更新 |
| `工作台搭建总结.md` | 版本号同步至 v2.19.1，新增 v2.19.1 版本记录 |
| `文件说明.md` | 版本号同步至 v2.19.1 |

---

## v2.19.0

**发布时间**：2026-08-21 18:00（北京时间）

### 2026-08-21 — 学习闭环整合 + 排版优化

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/练习测验.html` | 排版重构：标题+科目+统计合并为一行（统计改为小药丸标签），模式按钮+题型筛选合并为一条控制栏（删除「筛选题型▾」切换按钮，题型直接内联），垂直层级从5层压缩到3层；P0引导流按钮+URL参数传递（subject/chapter/questionId/mode/from）；P1 AI批量出题模式（5题+loading动画+容错JSON解析+重试）；P1 AI题目质量评价（收藏/删除，收藏题保存到题库）；P1 背诵卡与练习题关联（cardId字段+背面「练习」按钮跳转）；P2 弱点优先出题模式（分析练习记录+优先展示错误率高的题目）；题型筛选改为内联展示 |
| `Workbench/自考学习/复盘总结/复盘总结-章节复盘.html` | 排版重构：删除冗余蓝色大标题卡片→紧凑一行头部（标题+科目标签），功能标签改分段式（segmented control），仪表盘从大卡片→紧凑一行进度条（标签+进度条+统计+重置），洞察条从独立块→内联flex布局（统计+分隔线+建议+小蓝色引导按钮），章节卡片缩小尺寸，引导按钮从红色→蓝色渐变小药丸；删除科目下拉选择器（CSS+JS事件监听），纯靠URL参数控制科目，添加只读科目名展示+动态document.title；新增错题反思Tab+题库管理Tab；洞察条精简版（共答/正确率/错题/薄弱章节+智能复习建议+引导按钮）；错题重做功能（URL参数?mode=weak自动切换模式+定位题目） |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 背诵卡纯粹化：移除题库管理Tab；「练习」按钮位置调整（移到「不会」之后、「删」之前）；移动端操作区两行布局+缩小按钮字号 |
| `dev_server.py` | 新增 quiz-records API路由（GET/POST /api/quiz-records?subject=xxx，支持答题记录读写） |
| `data/quiz-records-13015.json` | 新建：系统原理答题记录持久化文件 |
| `data/quiz-records-02324.json` | 新建：离散数学答题记录持久化文件 |
| `data/quiz-records-13003.json` | 新建：数据结构答题记录持久化文件 |
| `data/quiz-bank-13015.json` | 题库数据更新（追加题目） |
| `data/modules/self-study.json` | 背诵与简答模块下添加练习测验入口（v2.18.4延续） |
| `data/study-plan.json` | 学习计划数据同步 |
| `data/mastery-progress.json` | 掌握度数据同步 |
| `AGENT_HANDOFF.md` | 版本号更新至 v2.19.0，版本历史表新增 v2.18.4/v2.19.0 条目，项目状态描述更新 |
| `工作台搭建总结.md` | 版本号同步至 v2.19.0，新增 v2.18.4/v2.19.0 版本记录，5.3自考学习模块更新 |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |

---

## v2.18.4

**发布时间**：2026-08-21 14:00（北京时间）

### 2026-08-21 — 练习测验模块开发

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/练习测验.html` | 新建：独立练习测验页面，按科目分离（?subject=参数），页面内仅保留题型筛选无科目切换Tab；支持6种题型差异化显示（选择/填空/计算/简答/论述/证明）；统一评分调度（选择精确匹配、填空关键词+同义词、计算answerAliases、简答/论述要点匹配+分级、证明规定方法+关键步骤检查）；支持自评覆盖和掌握度联动；4种出题模式（今日任务/自由选择/弱点优先/AI出题） |
| `data/quiz-bank-13015.json` | 新建：系统原理题库（16题，5种题型） |
| `data/quiz-bank-02324.json` | 新建：离散数学题库（16题，4种题型含证明题） |
| `data/quiz-bank-13003.json` | 新建：数据结构题库（16题，5种题型） |
| `data/modules/self-study.json` | 背诵与简答模块下添加练习测验入口 |
| `dev_server.py` | 新增 quiz-bank API路由（GET /api/quiz-bank?subject=xxx） |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |

---

## v2.18.3

**发布时间**：2026-08-20 22:00（北京时间）

### 2026-08-20 — 背诵与简答模块计算卡优化

| 文件 | 更新内容 |
|---|---|
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 新增 `cardType: "calculation"` 计算卡类型；正面带输入框+提交按钮+特殊符号面板，背面为公式→解题步骤→最终答案的三段式解析；评分支持 `answerAliases` 等价答案匹配（去空格+小写归一化+双向包含）；答对自动升级掌握度（unknown→unsure→known），答错自动降为 unknown；符号面板复用 QUIZ_SYMBOLS，支持一键插入数学符号 |
| `data/recite-cards-13015.json` | +3 张计算卡：CPU执行时间、MIPS计算、Cache平均访问时间 |
| `data/recite-cards-02324.json` | +3 张计算卡：命题公式真值、集合对称差基数、握手定理求顶点数 |
| `data/recite-cards-13003.json` | +3 张计算卡：时间复杂度大O、完全二叉树叶子数、折半查找最大比较次数 |
| `AGENT_HANDOFF.md` | 版本号更新至 v2.18.3，版本历史表新增 v2.18.3 条目，待办优先级章节标题同步 |
| `工作台搭建总结.md` | 版本号同步至 v2.18.3，新增 v2.18.3 版本记录 |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |

---

## v2.18.2

**发布时间**：2026-08-20 20:00（北京时间）

### 2026-08-20 — 私教功能 Bug 修复 + 弱点优先 + AI 伴读接入掌握状态 + 番茄钟接入今日学习流

| 文件 | 更新内容 |
|---|---|
| `dev_server.py` | Bug3 修复：`_handle_update_plan()` 新增 dailyPlans 同步逻辑：更新 weeks.goals 时同步更新 dailyPlans[].days[].tasks[] 中匹配 subject+chapter 的任务 done 状态；响应新增 dp_updated 字段 |
| `Workbench/today/today-flow.html` | Bug3 修复：completeTask() 完成任务后 postMessage 通知父窗口（工作台）计划已更新；增强8：新增 getChapterMastery 辅助函数，aiGreeting/aiTaskContext/aiOnComplete/aiSend 四个函数均注入掌握状态上下文，AI 可针对薄弱点讲解；增强6：新增 localSortByMastery 本地排序函数，loadMasteryState 改为返回 Promise，AI 离线时降级使用本地弱点优先排序；增强7：内建番茄钟（25分钟专注+5分钟休息循环），任务卡片显示倒计时、开始/暂停按钮，完成后自动切换休息模式并AI鼓励，renderTask切换任务时自动重置 |
| `templates/workbench.html` | Bug3 修复：message 监听器新增 plan-updated 处理分支，收到通知后向当前 content-frame iframe 转发 refresh-plan 消息，并设置 _planUpdated 标志 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | Bug3 修复：新增 refresh-plan postMessage 监听器，收到通知后调用 loadPlanFromJSON() 重新加载 study-plan.json 并触发 renderWeeks/renderPlanning/renderDailyExecPlan 刷新完成率 |
| `工作台搭建总结.md` | 版本号同步至 v2.18.2，新增 v2.18.2 版本记录 |
| `AGENT_HANDOFF.md` | 版本号更新至 v2.18.2，版本历史表新增 v2.18.2 条目，待办优先级章节标注 Bug1-3 和增强6/7/8 已完成 |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |

---

## v2.18.1

**发布时间**：2026-08-20 18:15（北京时间）

### 2026-08-20 — 工作台搭建总结版本补全 + 版本一致性校验 + 提交规范补充 + 交接文档重构

| 文件 | 更新内容 |
|---|---|
| `工作台搭建总结.md` | 补全 v2.10.1-v2.18.0 共11个版本条目（此前停留在 v2.10.0，落后8个版本）；更新当前文档版本标记至 v2.18.1；更新「当前状态」5.1 基础能力（7大模块、缓存修复）、5.3 自考学习（187张卡片、周计划结构化、API持久化、学习指南标注）、5.4 AI与辅助能力（数据驱动计划、番茄钟、今日学习流） |
| `.trae/skills/validate_workbench.py` | 新增 `check_summary_version_sync()` 校验函数：比较工作台搭建总结.md 的「当前文档版本」与 CHANGELOG.md 最新版本号，不一致时警告；已注册到 main() 警告列表 |
| `版本控制规范.md` | 提交前检查清单新增第6条：版本号变更时同步更新 CHANGELOG.md、AGENT_HANDOFF.md、工作台搭建总结.md 三份文档（校验脚本会检查版本号一致性） |
| `AGENT_HANDOFF.md` | 新增「产品愿景：个人私教工作台」章节（核心理念5条+用户画像表+工作台三角色定位）；新增「设计原则」章节（12条用户偏好，分交互/视觉/内容三组）；新增 v2.18.0/v2.18.1 功能级说明章节；更新「当前后续建议」从 v2.17.0 到 v2.18.1；清理过时 Git 警告和版本引用；更新数据持久化 API 表（新增 ai-conv/ai-plan 端点）；更新 localStorage Key 表（ai_daily_plan/ai_conversation 增加文件持久化标记） |
| `templates/workbench.html` | sidebar-footer 设为 display:none，隐藏三个添加按钮 |
| `CHANGELOG.md` | 新增 v2.18.1 版本记录 |
| `AGENT_HANDOFF.md` | 版本表新增 v2.18.1，更新当前版本标记 |

---

## v2.18.0

**发布时间**：2026-08-20 18:00（北京时间）

### 2026-08-20 — 学习指南标注 + 掌握状态/AI对话跨浏览器持久化 + 浏览器缓存彻底修复 + 今日学习流模块

| 文件 | 更新内容 |
|---|---|
| `data/learning-guide.json` | 新建：三科187个知识点的学习指南数据，通过AI批量分类生成。每条含priority（重点/一般/了解）、type（计算/背诵/理解/应用）、advice（学习建议），覆盖13015(72条)、02324(67条)、13003(48条) |
| `Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html` | 学习指南标注改造：CSS背景色区分重点(红)/一般(蓝)/了解(灰)，知识点标签显示类型与优先级，章节概览统计分布，筛选按钮(全部/重点/一般/了解)，学习建议悬浮提示；掌握状态API同步：saveStateToAPI延迟500ms写JSON、syncFromAPI页面加载时拉取、重置按钮同步清空API；contentUrl版本号升至v=2.3.5 |
| `Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html` | 同上：学习指南标注改造 + 掌握状态API同步；contentUrl版本号升至v=2.3.5 |
| `Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html` | 同上：学习指南标注改造 + 掌握状态API同步；contentUrl版本号升至v=2.3.5 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | AI对话历史API同步：saveAIConv同时写localStorage和POST /api/ai-conv；saveAIPlan同时写localStorage和POST /api/ai-plan；restoreConvHistory优先读localStorage，为空时从/api/ai-conv和/api/ai-plan拉取并回填localStorage；aiClearChat同步清空API数据 |
| `dev_server.py` | 浏览器缓存彻底修复：end_headers增加Cache-Control: no-store/no-cache/must-revalidate/max-age=0 + Pragma: no-cache + Expires: 0；do_GET拦截If-Modified-Since和If-None-Match头防止304响应；_handle_load_mastery支持按科目查询(GET /api/mastery?subject=xxx)；新增_handle_load_ai_conv(GET /api/ai-conv)、_handle_save_ai_conv(POST /api/ai-conv)、_handle_load_ai_plan(GET /api/ai-plan)、_handle_save_ai_plan(POST /api/ai-plan)四个端点 |
| `data/mastery-progress.json` | 三科掌握状态数据：13015(kp+掌握度)、02324(kp+掌握度)、13003(kp+掌握度) |
| `data/ai-conversation.json` | 新建：AI对话历史持久化文件，存储最近20条对话 |
| `data/ai-daily-plan.json` | 新建：AI每日计划持久化文件 |
| `data/modules/self-study.json` | 三个知识框架页contentUrl版本号从v=2.3.4升至v=2.3.5（绕过浏览器缓存） |
| `data/modules/ability.json` | 学习驾驶舱配置更新 |
| `data/modules/ai-learning.json` | AI学习模块配置更新 |
| `data/workbench.json` | 新增today今日学习模块注册 |
| `data/modules/today.json` | 新建：今日学习模块数据，含今日学习流页面(today-flow.html) |
| `Workbench/today/today-flow.html` | 新建：今日学习流页面，线性任务流+AI伴读+自适应进度 |
| `templates/workbench.html` | 模板更新：适配今日学习模块 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | contentUrl版本号更新 |
| `Workbench/此刻便是春天.html` | 构建产物同步更新 |
| `CHANGELOG.md` | 新增v2.18.0版本记录 |
| `AGENT_HANDOFF.md` | 版本表新增v2.18.0，更新当前版本标记与项目一句话描述 |
| `文件说明.md` | 新增learning-guide.json、ai-conversation.json、ai-daily-plan.json、today.json、today-flow.html说明；更新dev_server.py端点列表 |

---

## v2.17.0

**发布时间**：2026-08-19 20:30（北京时间）

### 2026-08-19 — 背诵卡掌握进度+题库+AI答疑持久化到JSON文件

| 文件 | 更新内容 |
|---|---|
| `dev_server.py` | 新增6个API端点：GET/POST `/api/mastery`（掌握进度，读写data/mastery-progress.json）；GET `/api/quiz-bank?subject=xxx` 和 POST `/api/quiz-bank`（题库，读写data/quiz-bank-{subject}.json）；GET `/api/quiz-ai?subject=xxx` 和 POST `/api/quiz-ai`（AI答疑对话，读写data/quiz-ai-{subject}.json）；POST端点接收{subject,data}格式 |
| `data/mastery-progress.json` | 新建：掌握进度持久化文件，结构为{问题文本: 掌握状态}，初始为空{} |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | 掌握进度迁移到API读写：saveMastery同时写localStorage和POST /api/mastery；restoreMastery优先读window.__apiMastery（API加载），无则回退localStorage；题库迁移到API读写：loadQuizBank优先读window.__apiQuizBank，saveQuizBank同时写localStorage和POST /api/quiz-bank；测验AI对话迁移到API读写：loadQuizAI优先读window.__apiQuizAI，saveQuizAI同时写localStorage和POST /api/quiz-ai，hasQuizAI也优先查API数据；初始化流程并行fetch三个API（mastery/quiz-bank/quiz-ai）与三个JSON文件，API失败自动回退localStorage缓存 |
| `data/modules/self-study.json` | 计算机系统原理背诵卡contentUrl版本号从v=2.14.0更新至v=2.15.0（绕过浏览器缓存） |

---

## v2.16.0

**发布时间**：2026-08-19 19:30（北京时间）

### 2026-08-19 — 计算机系统原理卡片补全43个遗漏知识点（39张→82张）

| 文件 | 更新内容 |
|---|---|
| `data/recite-cards-13015.json` | 新增43张概念背诵卡（def/ex/exam三字段），覆盖教材全部小节知识点：第1章+5张（发展历程、SISD/SIMD/MISD/MIMD分类、存储程序概念、软件系统层次、性能指标补充）；第2章+8张（定点数、补码加减与溢出、Booth算法、除法恢复/不恢复余数法、ALU与先行进位、浮点乘除、BCD编码、字符编码）；第3章+6张（指令格式、常用指令、条件转移指令、选择/循环机器级表示、数组机器级表示、有效地址计算）；第4章+8张（预处理、编译六阶段、汇编过程、程序头表PT_LOAD、ELF节详解、加载器工作过程、异常分类故障/陷阱/终止、中断向量表与处理过程）；第5章+9张（cache行/块/组、tag/index/offset划分、替换算法LRU/FIFO/随机/LFU、多级cache L1/L2/L3、写分配/写不分配、虚拟地址转换全过程、多级页表、页面替换算法OPT/LRU/FIFO/Clock、cache性能优化分裂cache/预取）；第6章+7张（I/O软件四层、块设备vs字符设备、总线结构单/双/三总线、总线仲裁链式/计数器/独立请求、通道控制方式、设备驱动程序、磁盘调度FCFS/SSTF/SCAN/C-SCAN）；总卡片数从39张增至82张 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | DATA_VERSION从6升至7，检测到版本变化自动清除旧localStorage重新加载新JSON；新增MASTERY_KEY独立存储掌握进度（按问题文本映射），版本变化时先备份mastery再清除卡片数据，loadPresetCards加载新卡片后restoreMastery按问题文本恢复掌握状态，setMastery和测验评分函数均同步saveMastery——修复版本升级导致掌握进度丢失问题；fetch JSON添加?v=DATA_VERSION参数和cache:no-cache策略绕过浏览器缓存 |
| `data/modules/self-study.json` | 计算机系统原理背诵卡contentUrl版本号从v=2.12.1更新至v=2.14.0（绕过浏览器缓存） |

---

## v2.15.0

**发布时间**：2026-08-19 18:30（北京时间）

### 2026-08-19 — 周计划topic字段补全背诵卡全部小节知识点

| 文件 | 更新内容 |
|---|---|
| `data/study-plan.json` | 周计划topic字段从简略概述（如"命题逻辑基本概念、命题公式、等值演算"）补全为覆盖背诵卡全部小节知识点的完整列表（如"命题、命题变元、五种基本逻辑联结词、蕴含、命题公式、重言式、等值式、基本的等值式、德摩根律、蕴含等值式、等值演算、对偶式、范式"）；三科共23个章节goal的topic字段全部更新，覆盖率从约30%提升至100%（144张背诵卡知识点全覆盖）；日计划dailyPlans中153个任务的topic字段同步更新，与周计划完全一致；日计划中138个练习任务（课后练习/半休间隔复习）从无章节补上对应章节（如系统原理第1周练习任务补上"第1章"），使日计划每行都显示章节标签；version升至v3.3.1 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | SCHEDULE_VERSION从v3.2.0升至v3.3.1（自动清除旧localStorage）；WEEK_DATA内联数据23个topic字段同步更新 |
| `data/modules/ability.json` | 学习驾驶舱contentUrl版本号从v=3.2.0更新至v=3.3.1 |

---

## v2.14.0

**发布时间**：2026-08-19 17:00（北京时间）

### 2026-08-19 — 周计划章节对齐教材 + 合并goal拆分

| 文件 | 更新内容 |
|---|---|
| `data/study-plan.json` | 周计划章节编号全面对齐教材：离散数学9章拆分（原Ch2谓词逻辑+Ch3集合论→Ch2推理理论+Ch3谓词逻辑+Ch4集合+Ch5关系与函数+Ch6代数系统+Ch7格与布尔代数+Ch8图论+Ch9图的应用，每章独立goal）；系统原理Ch5从W4 Ch4中拆分为独立goal；数据结构章节重编号（原Ch3树→Ch5树与二叉树、Ch4图→Ch6图结构、Ch5查找→Ch8查找、Ch6排序→Ch7内部排序），新增Ch4数组广义表和串，排序与查找调换至W5同年完成；dailyPlans周任务chapter字段同步修正；version升至v3.2.0 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | SCHEDULE_VERSION从v3.1.0升至v3.2.0（自动清除旧localStorage）；WEEK_DATA内联数据同步更新为对齐后的章节 |
| `data/modules/ability.json` | 学习驾驶舱contentUrl版本号从v=3.1.0更新至v=3.2.0 |

---

## v2.13.0

**发布时间**：2026-08-19 16:00（北京时间）

### 2026-08-19 — 周计划结构化 + 日计划分科目拆分 + 联动标记 + 完成状态写回JSON

| 文件 | 更新内容 |
|---|---|
| `data/study-plan.json` | 周计划goals从{tag,tagText,text,done}重构为{tag,subject,chapter,topic,done}：解析text提取章节(第X章/KPX/重难点突破/模拟考/考前冲刺)和知识点；dailyPlans任务从捆绑式"上午主科"拆分为每科目独立任务(3个概念+3个练习)，每个任务含subject+chapter+topic+done字段；补全被过滤的间隔复习和当日复盘任务；清理topic尾部冗余文字；version升至v3.1.0 |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | SCHEDULE_VERSION从v3.0.0升至v3.1.0（自动清除旧localStorage含ai_daily_plan）；WEEK_DATA内联数据同步重构为新格式；renderWeeks显示科目+章节(蓝色粗体)+知识点三列；aiGatherContext格式化输出使用subject/chapter/topic；三处AI提示词(generate/adjust/chat follow-up)全部更新：要求{tag,subject,chapter,topic,hours,done}格式、禁止"主科"模糊描述、每天11个任务(3概念+3练习+复习+py+ai+en+复盘)；renderDailyExecPlan显示科目+章节+知识点，新增done勾选框(.dp-exec-check)；distributeTasksToSlots按chapter非空区分概念(上午)vs练习(下午)；新增toggleTaskDone/checkLinkage/writeGoalToJSON三个函数实现联动标记：日任务全部完成→自动标记周计划对应goal完成→调用API写回JSON；toggleGoal也写回JSON；addGoal/saveGoal更新为新字段名；CSS新增.dp-exec-check/.dp-exec-chapter/.dp-exec-topic/.dp-task-chapter/.wk-goal-chapter样式；grid布局扩展为5列(时间+勾选+科目+章节+知识点) |
| `dev_server.py` | 新增POST /api/update-plan端点：接收{week,subject,chapter,done}，在study-plan.json中匹配对应goal更新done字段并写回文件 |
| `data/modules/ability.json` | 学习驾驶舱contentUrl版本号从v=3.0.0更新至v=3.1.0 |

---

## v2.12.0

**发布时间**：2026-08-19 11:00（北京时间）

### 2026-08-19 — 计算机系统原理+数据结构概念卡片补全 + 卡片正面间隔修复

| 文件 | 更新内容 |
|---|---|
| `data/recite-cards-13015.json` | 新建：计算机系统原理39张概念背诵卡JSON数据（def/ex/exam三字段），覆盖第1-6章（计算机系统概述/数据表示与运算/程序转换及机器级表示/可执行文件生成与加载/程序存储访问/I/O操作实现），作为PRESET_CARDS['13015']数据源 |
| `data/recite-cards-13003.json` | 新建：数据结构48张概念背诵卡JSON数据（def/ex/exam三字段），覆盖第1-8章（绪论/线性表/栈和队列/数组广义表和串/树与二叉树/图结构/内部排序/查找），作为PRESET_CARDS['13003']数据源 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | fetch加载逻辑重构：从单文件fetch改为Promise.all并行加载02324/13015/13003三个科目JSON，任一失败不影响其他科目加载；adjustCardHeights改为按当前可见面（正面/反面）动态设置min-height，不再取正反面最大值；flipCard翻转时动态切换inner高度为目标面高度——修复卡片正面间隔过大问题（原max逻辑导致正面留白）；DATA_VERSION从5升至6，loadData检测版本变化时自动清除localStorage旧数据——修复新旧格式卡片混合问题（旧版升级def/ex/exam时未升DATA_VERSION，导致localStorage残留旧answer格式卡片与新卡片混合显示） |
| `data/modules/self-study.json` | 三个科目背诵卡contentUrl版本号从v=2.10.3→v=2.12.1（计算机系统原理/离散数学/数据结构），绕过浏览器缓存加载新HTML触发DATA_VERSION检测清除旧localStorage |

---

## v2.11.0

**发布时间**：2026-08-19 01:30（北京时间）

### 2026-08-19 — 番茄任务闹钟 + 离散数学概念背诵卡重构（def/ex/exam三字段 + JSON持久化 + 57张卡片）

| 文件 | 更新内容 |
|---|---|
| `Workbench/番茄钟/番茄钟.html` | 新建：番茄任务闹钟页面，读取study-plan.json当日计划，按7个时段生成任务卡片；支持番茄钟计时模式（关闭/标准25-5/长番茄50-5）；浏览器Notification API通知提醒+Web Audio三声beep声音提醒；自动检测当前时段、倒计时显示、完成标记、下一项预览；完成状态持久化到localStorage（按日期隔离）；基于时间戳的计时器状态持久化（saveTimerState/clearTimerState/recoverTimer），页面切换/关闭后可恢复剩余时间 |
| `templates/workbench.html` | 新增番茄钟悬浮按钮（pomo-float）：固定在右下角，在父页面运行不受iframe切换影响；每秒读取localStorage计时器状态，显示倒计时+阶段标签；计时中蓝紫渐变+脉冲动画，休息中绿色渐变；空闲态显示🍅图标；点击跳转番茄钟页面；番茄钟页面未加载时自动接管计时（阶段切换+通知+声音） |
| `data/modules/tasks.json` | tasks模块从空占位符重写为番茄钟配置（番茄钟/番茄任务闹钟页面，renderMode:bare，contentUrl版本号v=1.1.0） |
| `data/workbench.json` | tasks模块enabled从false改为true，description更新为番茄钟任务闹钟模块 |
| `Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html` | renderCards函数重构：支持def/ex/exam三字段渲染（定义/举例/考点分色标签），兼容旧answer字段回退；loadPresetCards函数增强：新增upgrade逻辑，已有卡片自动升级为def/ex/exam格式（保留mastery进度），新增卡片支持def/ex/exam字段；init改为异步fetch JSON后加载；新增CSS（recite-card-section/recite-section-label/def-label/ex-label/exam-label/recite-section-content，white-space:pre-line支持换行） |
| `data/recite-cards-02324.json` | 新建：离散数学57张概念背诵卡JSON数据（54张原有卡片重构为def/ex/exam三字段+3张新增：命题变元/对偶式/范式），覆盖第1-9章全部知识点，作为PRESET_CARDS['02324']的数据源 |
| `data/modules/self-study.json` | 三个科目背诵卡contentUrl版本号从v=2.9.0更新至v=2.10.3；4个真题/错题项（系统原理/离散数学/数据结构真题与错题+英语真题模拟）添加hidden:true字段暂时隐藏，stage改为"第二阶段"，等第二阶段再启用 |
| `templates/workbench.html` | countLeaves/hasVisibleDescendant/renderItems三处新增hidden字段过滤逻辑，items中hidden:true的项目不显示在左侧树中 |

---

## v2.10.2

**发布时间**：2026-08-19 00:30（北京时间）

### 2026-08-19 — 前置学习关卡系统 + 统筹计划重设计 + JSON持久化

| 文件 | 更新内容 |
|---|---|
| `Workbench/ai-learning/job-skill-tree.html` | KP1-4的guide.prereq从字符串数组改为结构化对象（type/title/mustLearn/estTime/concept/steps）；KP1新增终端基础/Python文件运行/pip概念3个前置关卡+2个env检查；KP2新增def函数/dict字典/class类3个前置关卡+KP1前置依赖；KP3新增import/try-except/os.getenv 3个前置关卡+KP1+KP2前置依赖；KP4新增三引号/字符串格式化/JSON 3个前置关卡+KP3前置依赖；重写renderTodayGuide函数支持前置关卡渲染（勾选框+展开内容+tutorial锁定/解锁）；新增updatePrereqProgress和updateTutorialLock函数；新增CSS样式（prereq卡片/must-learn状态/展开内容/tutorial锁定态） |
| `Workbench/能力提升/能力提升-学习驾驶舱.html` | SCHEDULE_VERSION从v2.6.3升至v3.0.0；WEEK_DATA全面重设计（英语降至5%只留单词+阅读判断，AI拆分为AI工程py标签+AI学习ai标签，数据结构第1周启动，新增Stage1阶段测试周，冲刺期AI暂停）；新增loadPlanFromJSON()函数异步从data/study-plan.json加载计划数据写入localStorage；init流程改为先渲染inline数据再异步加载JSON重新渲染；DP_EXEC_SLOTS从6个时段扩展为7个（新增15:30-16:00间隔复习）；distributeTasksToSlots适配7个时段；loadPlanFromJSON新增每日计划加载逻辑（匹配当日周次写入ai_daily_plan）；init流程新增renderDailyExecPlan()回调 |
| `data/study-plan.json` | 新建：10周计划数据持久化文件（version/examDate/timeAllocation/dailySchedule/weeklyRhythm/subjectPriority/weeks数组），作为localStorage的数据源；新增dailyPlans数组：10周每日计划数据（按天×时段组织，含date/weekday/phase/tasks） |
| `data/modules/ai-learning.json` | job-skill-tree.html contentUrl版本号更新至v=2.10.2 |
| `data/modules/ability.json` | 学习驾驶舱contentUrl版本号从v=2.6.3→v=3.0.0 |
| `AGENT_HANDOFF.md` | 补全v2.6.0-v2.10.1详细功能说明、经验教训、后续建议；更新localStorage Key表、目录结构、当前后续建议 |
| `CHANGELOG.md` | v2.10.1表补充AGENT_HANDOFF.md变更记录 |

---

## v2.10.1

**发布时间**：2026-08-18 21:00（北京时间）

### 2026-08-18 — 方案A落地后改进修复（highlightKp监听+CSS修复+响应式）

| 文件 | 更新内容 |
|---|---|
| `Workbench/ai-learning/job-skill-tree.html` | 新增highlightKp消息监听器（从Python/Demo页面反向跳转后自动切换Stage+展开KP+滚动定位+高亮闪烁）；修复renderTodayGuide中guide-section嵌套导致间距叠加（外层改为guide-kp-wrap）；新增今日任务版块响应式设计（@media窄屏垂直堆叠）；AI_WEEKLY_TASKS添加同步提醒注释 |
| `data/modules/ai-learning.json` | job-skill-tree.html contentUrl版本号更新至v=2.10.1 |
| `AGENT_HANDOFF.md` | 更新至v2.10.1状态：顶部Git状态警告更新（commit be6ea75）；版本表补充v2.10.1条目；目录结构补充6个新增文件（job-skill-tree/job-learning-loop/英语5页面）；localStorage Key表从10个扩充至24个；追加v2.6.0-v2.10.1共6个版本功能级详细章节；新增「当前后续建议」章节（14项分高中低优先级） |

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
