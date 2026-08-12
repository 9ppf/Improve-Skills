# 此刻便是春天工作台 —— Agent 交接文档

> 把本文档直接交给新 Agent，并告诉他「下一步目标」即可开始工作。

---

## 项目一句话描述

一个 Python 构建的静态 HTML 个人工作台，聚合「能力提升」「自考学习」「Python 基础」「AI 学习」「AI 助手角色」与「阅读资料」六大模块，主题可切换，支持本地热重载预览。

---

## 核心原则（必须遵守）

1. **`Workbench/此刻便是春天.html` 由 `build.py` 从模板生成，禁止手动编辑产物文件；提交 Git 时需随源码一同提交，方便对比各版本差异**。
2. **所有结构性改动应通过修改 `Workbench/data/modules/*.json` + `templates/workbench.html` + `build.py` 并运行 `python build.py` 来落地**。
3. 当前环境已确认 Python 可用（`E:\Python\python.exe`，版本 3.9.7），但缺少 Node.js；`build.py` 会在 Node 不可用时跳过 JS 语法校验并给出警告，不影响构建。
4. **新增最终交付物**必须同步更新 `文件说明.md`。
5. **中间产物**（脚本、OCR 文本、调试输出）只能放在 `temp/` 下，不能进入 `Workbench/`。
6. **类名必须带模块前缀**，例如 `reading-card`、`exam-item`，禁止裸用 `card`、`item`、`title` 等通类。
7. **结构性变更必须先讨论**：本文档的"下一步目标"仅说明工作方向，不等于已批准具体方案。如果任务涉及增删分类、重组导航、改变信息架构，必须先触发 `plan-before-create` skill 讨论确认后再动手。只有"往已有结构里填数据"的内容填充可以直接执行。

---

## 目录结构

```
e:\TraeWorkToDo\
├── build.py                          # 核心构建脚本
├── dev_server.py                     # 本地预览 + 热重载
├── requirements.txt                  # Python 依赖：libsass, watchdog
├── AGENT_HANDOFF.md                  # 本文档
├── 文件说明.md                        # 项目文件用途说明
├── 项目约束总览.md                     # 所有规范的索引入口
├── build.py 使用说明.md                # 构建流程详细说明
├── Workbench UI 交互规范.md            # UI 与交互规范
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
│   └── main.scss                     # SASS 入口
│
├── Workbench/                        # 最终交付物
│   ├── 此刻便是春天.html             # 构建产物（原则上走 build.py）
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
│   │       └── 00015英语（二）/
│   ├── data/
│   │   ├── workbench.json            # 主题与模块注册表
│   │   └── modules/
│   │       ├── ability.json          # 能力提升
│   │       ├── self-study.json       # 自考学习
│   │       ├── python.json           # Python 基础
│   │       ├── ai-learning.json      # AI 学习
│   │       ├── ai-roles.json         # AI 助手角色
│   │       └── reading.json          # 阅读资料
│   ├── read/                         # 阅读原始 HTML（2019 ~ 2026）
│   └── 工作台迁移方案/               # 历史说明文档
│
├── transformers/
│   └── read.py                       # 阅读模块数据转换器
│
└── .trae/skills/
    ├── reading_integration.py        # 阅读内容转换与注入核心
    ├── validate_workbench.py         # 校验脚本（build.py 调用）
    ├── integrate_reading.py          # 手动批量集成入口（已统一走 build.py）
    └── integrate_reading_year/
        └── integrate_reading_year.py # 单年份手动集成入口
```

---

## 常用命令

```bash
# 完整构建并校验
python build.py

# 本地预览（自动构建 + 监听文件变化）
python dev_server.py

# 仅查看会清理哪些文件，不构建也不删除
python build.py --dry-run

# 构建前确认再清理
python build.py --confirm
```

---

## 主题系统说明

- **基础 token** 定义在 `styles/_variables.scss`（浅色主题的唯一数据源）。
- `Workbench/data/workbench.json` 中：
  - `light.tokens` 保持为空；
  - `dark.tokens` 只写与浅色主题不同的覆盖项。
- 构建时 `build.py` 从 SCSS 解析基础 token，再与主题覆盖合并，最终生成内联 JS。
- 允许使用的 token 名由 `build.py` 中的 `THEME_TOKEN_NAMES` 白名单控制。

---

## 模块扩展方式

1. 在 `Workbench/data/workbench.json` 的 `modules` 数组中注册新模块。
2. 在 `Workbench/data/modules/` 下创建 `{module_id}.json`。
3. 如需动态转换，在 `transformers/` 下创建 `{module_id}.py` 并实现 `enrich_module(data)`。
4. 如需渲染到模板，在 `templates/workbench.html` 中预留占位符，并在 `build.py` 中填充。
5. 运行 `python build.py` 验证。

---

## 当前状态

- 工作台已从单一「阅读资料」模块扩展为 6 大模块：能力提升、自考学习、Python 基础、AI 学习、AI 助手角色、阅读资料。
- `Workbench/data/workbench.json` 已注册全部 6 个模块；`tasks` 模块已禁用。
- `build.py` 与 `templates/workbench.html` 已扩展为支持任意模块的 `contentUrl` iframe 加载与阅读内容内联渲染。
- 已修复 Python 3.9 兼容性（将 `int | None` 改为 `Optional[int]`）并安装 `libsass`、`watchdog`。
- 已修复 Node.js 不可用时构建中断的问题：`build.py` 与 `validate_workbench.py` 现在会跳过 JS 语法校验并打印警告，而不是报错退出。
- 已在模板中添加 `selectFirstItem()`，页面加载后自动选中第一个项目，避免右侧空白。
- 已通过 `E:\Python\python.exe build.py` 重新生成 `Workbench/此刻便是春天.html`，并在本地 HTTP 服务下验证：6 个工作区全部渲染、默认加载路线图、自考科目与 AI 助手角色的 iframe 内容加载均正常。

### 本轮新增内容页（2026-08-12）

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
- 旧独立页面类名（如 `class="essay"`）是否泄漏。
- 通用类名（如 `card`、`title`、`section`）是否未加前缀出现在模块内容中。
- 阅读模块内容完整性（section / essay 数量匹配）。
- 文件命名是否符合 `{子模块}-{任务}.html`。
- `文件说明.md` 是否覆盖了根目录与 Workbench 顶层项。
- `Workbench/` 内是否混入了 `.py` / `.log` 等临时文件。
- `.gitignore` / `.gitattributes` 是否包含必要规则。

---

## 下一步目标

<!-- 交给 Agent 时，把下面这段替换为具体任务 -->

本轮已完成事项：

1. ✅ **「数据结构与算法」知识框架页面** — 8 章完整目录 + 核心概念/公式/题型/易错点 + 2 周学习建议
2. ✅ **真题练习与错题本** — 交互式真题管理（按科目/年份/题型/状态筛选 + localStorage 持久化）
3. ✅ **核心概念背诵卡** — 翻转卡片式背诵系统（掌握度标记 + 章节筛选 + localStorage 持久化）
4. ✅ **Python 模块 3 个内容页** — 树形知识架构/小闭环 Demo/闭环学习流程
5. ✅ **AI 帮我复盘代码** — 交互式代码复盘页（自动统计 + 检查清单 + 预设提示词）
6. ✅ **AI 助手角色交互化** — 统一交互中心（6 角色 + 预设提示词 + 自定义编辑 + 一键复制）
7. ✅ **AI 资讯周报展示页** — 按分类筛选 + 统计面板 + 周报归档，数据从 ai-news-data.json 加载
8. ✅ **线框原型清理** — 删除 workbench-wireframe.html，消除 generic classes 警告
9. ✅ **进度联动** — 工作台 sidebar 进度条与计划面板实时读取 localStorage；新增学习进度驾驶舱汇总页（Python 知识树/学习闭环/真题/背诵卡），每 3 秒自动刷新
10. ✅ **结构修复** — 恢复每科目各自拥有知识框架/真题与错题/背诵与简答三个子项的结构，删除此前错误新增的共享顶级分类；真题与背诵页面通过 URL 参数 `?subject=XXX` 按科目预选
11. ✅ **plan-before-create skill 中文化** — 新增「交接文档任务」提醒和「内容填充 vs 结构变更」判断标准，收紧「修复与编辑」例外
12. ✅ **学习路线图文件迁移** — `full-learning-roadmap.html` 从 `ai-learning/` 移到 `能力提升/`，消除交叉引用
13. ✅ **知识框架掌握度追踪** — 三个科目（13003/13015/02324）知识框架页新增章节级掌握度追踪（4 级状态 + 知识点勾选 + 难度标识 + 重难点摘要 + 顶部进度看板），localStorage 持久化
14. ✅ **02324 离散数学知识框架补全** — 新增 9 章知识框架内容（核心概念/常见题型/易错点），此前仅有目录与冲刺建议
15. ✅ **复盘总结模块** — 每科目新增「复盘总结」子项（与知识框架同等级），共享页面支持 `?subject=XXX` 预选，每章含本章总结/错题反思/改进计划三个可编辑区域，localStorage 自动保存
16. ✅ **自考学习结构调整** — 新增「备考科目」与「未考科目」为同级分类；将 13015 计算机系统原理、02324 离散数学、13003 数据结构与算法归入「备考科目」；在「未考科目」下新增 00023 高等数学（工本）
17. ✅ **高等数学（工本）知识框架页** — 新增 00023 高等数学（工本）6 章知识框架与分阶段学习计划，支持章节掌握度追踪（4 级状态 + 知识点勾选 + 重难点标识），localStorage 持久化
18. ✅ **02324 离散数学教材例题补充** — 9 章知识框架均补充教材「典型例题」与「同步练习」（PDF 自动提取）
19. ✅ **13015 计算机系统原理教材例题补充** — 6 章知识框架均补充教材「典型例题」与「同步练习」（PDF 自动提取）
20. ✅ **13003 数据结构与算法教材例题补充** — 8 章知识框架均补充教材「典型例题」与「同步练习」（PDF 自动提取）
21. ✅ **00023 高等数学（工本）教材例题补充** — 6 章知识框架均补充教材「典型例题」与「同步练习」（PDF 自动提取）

> 说明：以上例题与练习从对应 PDF 教材自动提取，部分数学符号/字母可能存在 OCR 识别误差，页面已添加「例题说明」提示，实际学习请以纸质教材为准。

后续建议方向：

1. **填充真题与背诵内容**
   - 真题与错题本、背诵卡目前是空框架，需要用户在实际学习中逐步添加内容。

2. **AI 资讯周报数据更新**
   - 定时任务每周六生成周报后，需更新 `Workbench/ai-learning/ai-news-data.json` 才能在页面展示最新内容。
   - 可考虑在定时任务的 instruction 中加入「更新 ai-news-data.json」步骤。

3. **结构性变更约束**
   - 任何涉及增删分类、重组导航、改变信息架构的改动，**必须先触发 `plan-before-create` skill 讨论确认后再动手**。
   - 判断标准：如果改动只影响内容填充（往已有结构里填数据），可以直接执行；如果改动影响结构本身（增删分类、层级、导航项），必须先讨论。

Agent 接到目标后，直接运行 `E:\Python\python.exe build.py` 重新生成并校验，再按上述优先级推进。
