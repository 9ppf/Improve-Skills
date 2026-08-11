# 此刻便是春天工作台 —— Agent 交接文档

> 把本文档直接交给新 Agent，并告诉他「下一步目标」即可开始工作。

---

## 项目一句话描述

一个 Python 构建的静态 HTML 个人工作台，聚合「自考学习」与「阅读资料」两大模块，主题可切换，支持本地热重载预览。

---

## 核心原则（必须遵守）

1. **不要手动编辑** `Workbench/此刻便是春天.html`，它由 `build.py` 从模板生成。
2. **所有改动必须通过** `python build.py` **构建与校验**。
3. **新增最终交付物**必须同步更新 `文件说明.md`。
4. **中间产物**（脚本、OCR 文本、调试输出）只能放在 `temp/` 下，不能进入 `Workbench/`。
5. **类名必须带模块前缀**，例如 `reading-card`、`exam-item`，禁止裸用 `card`、`item`、`title` 等通类。

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
│   ├── 此刻便是春天.html             # 构建产物（勿手动编辑）
│   ├── data/
│   │   ├── workbench.json            # 主题与模块注册表
│   │   └── modules/
│   │       └── reading.json          # 阅读模块数据
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

- 已移除「自习」和「日常任务」模块。
- 已重构：模板渲染、SASS 编译、清理逻辑、主题 token 统一、本地热重载。
- 已优化高/中/低风险隐患，最新提交 `9e77d28`。
- `build.py` 验证通过，Git 工作区干净。

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

（待填写）例如：

- 添加「自考学习 / 02324离散数学」的真题题型归类页面。
- 为阅读模块增加按年份搜索功能。
- 优化 dark 主题下侧边栏的对比度。
- 新增一个「周计划」模块并注册到 workbench.json。

Agent 接到目标后，请先运行 `python build.py` 确认当前状态，再按上述约束实现。
