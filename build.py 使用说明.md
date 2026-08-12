# build.py 使用说明

生成时间：2026-08-09

## 这是做什么的

`build.py` 是「此刻便是春天」工作台的构建脚本。它读取 `Workbench/data/` 下的 JSON 配置和模块数据，编译 `styles/main.scss` 生成 CSS，再基于 `templates/workbench.html` 模板渲染生成 `Workbench/此刻便是春天.html`，同时清理临时产物并执行校验。

运行一次构建后，`此刻便是春天.html` 就是最新版本的工作台页面。

---

## 常用命令

### 正常构建

```bash
python build.py
```

执行完整流程：预清理 → 构建 → 校验 → 后清理。

### 跳过校验

```bash
python build.py --skip-validate
```

只构建不运行 `validate_workbench.py`，适合快速验证构建逻辑本身。

### 仅预览清理内容

```bash
python build.py --dry-run
```

不构建、不删除，只列出当前会被清理的文件。用于确认清理范围。

### 本地预览与热重载

```bash
python dev_server.py
```

启动本地 HTTP 服务器（默认 `http://localhost:8000`），并监听 `styles/`、`templates/`、`Workbench/data/`、`transformers/` 等源码目录。文件保存后自动重新运行 `build.py`，刷新浏览器即可看到最新效果。

常用选项：

```bash
python dev_server.py --port 8080      # 使用 8080 端口
python dev_server.py --no-build       # 跳过初始构建
```

依赖：`watchdog`。如果未安装，运行：

```bash
pip install watchdog
```

### 清理前确认

```bash
python build.py --confirm
```

每次清理前会先打印待删除的文件清单，输入 `y` 才会继续。适合手动整理或不确定清理范围时使用。默认行为仍不询问，保证自动化构建不受影响。

---

## 构建流程

`build.py` 按以下顺序执行：

1. **预清理**：删除上次残留的临时产物和旧备份
2. **加载全局配置**：读取 `Workbench/data/workbench.json`
3. **加载模块数据**：读取 `Workbench/data/modules/` 下启用的模块 JSON
4. **运行转换器**：每个模块可以对应 `transformers/{模块id}.py` 进行内容 enrich
5. **应用主题 token**：把 JSON 中的颜色 token 替换为实际色值
6. **备份旧 HTML**：生成带时间戳的 `.bak-YYYYMMDD_HHMMSS` 备份
7. **编译 SCSS 样式**：把 `styles/main.scss` 编译为 CSS 并注入模板
8. **注入主题系统**：向 HTML 注入主题切换按钮、CSS 和 JS
9. **注入阅读模块**：先移除旧阅读模块，再注入新的阅读模块数据
10. **校验 JS 语法**：检查生成后的 HTML 中 JS 是否合法
11. **完整校验**：运行 `validate_workbench.py` 做进一步检查
12. **后清理**：删除构建和校验过程中新产生的临时产物

---

## 目录约定

| 路径 | 用途 |
|---|---|
| `Workbench/data/workbench.json` | 全局配置：当前主题、主题定义、模块注册表 |
| `Workbench/data/modules/` | 各模块的 JSON 数据文件 |
| `transformers/` | 模块转换器，文件名与模块 id 对应，如 `read.py` |
| `.trae/skills/` | Skill 脚本，包含 `reading_integration.py` 和 `validate_workbench.py` |
| `styles/` | SCSS 样式源码，`main.scss` 为编译入口 |
| `templates/` | HTML 模板目录，`workbench.html` 为渲染骨架 |
| `Workbench/此刻便是春天.html` | 构建产物，工作台主入口 |
| `Workbench/此刻便是春天.html.bak-*` | 自动备份，最多保留 3 份 |

---

## 模块注册规则

`Workbench/data/workbench.json` 中的 `modules` 数组决定加载哪些模块：

```json
{
  "modules": [
    { "id": "tasks", "file": "tasks.json", "enabled": false },
    { "id": "read", "file": "reading.json", "enabled": true }
  ]
}
```

- `id`：模块标识，也是转换器文件名的依据
- `file`：模块数据文件，位于 `Workbench/data/modules/`
- `enabled`：false 时跳过该模块

新增模块时，只需要添加注册项、准备 JSON 数据、可选写转换器，不需要修改 `此刻便是春天.html`。

---

## 自定义样式（SASS）

工作台的视觉样式已从 HTML 模板迁移到 `styles/` 目录，使用 SCSS 编写。

- 入口文件：`styles/main.scss`
- 可定制变量：`styles/_variables.scss`（颜色、间距、圆角、阴影、字体等）
- 模块划分：
  - `_root.scss`：CSS 自定义属性 `:root`
  - `_base.scss`：基础 reset 与页面级样式
  - `_layout.scss`：顶部栏、侧边栏、主体布局
  - `_tree.scss`：树形目录与行内操作
  - `_components.scss`：按钮、卡片、标签页、表格等
  - `_reading.scss`：阅读资料内容样式
  - `_responsive.scss`：响应式与移动端适配

修改 SCSS 后，重新运行 `python build.py` 即可把编译后的 CSS 注入到生成的 HTML 中。

依赖：构建脚本使用 Python 的 `libsass` 包编译 SCSS。如果未安装，运行：

```bash
pip install libsass
```

---

## 主题系统规则

### 主题定义

`workbench.json` 中的 `themes` 定义多组主题。基础（明亮）主题的颜色值来自 `styles/_variables.scss`，`workbench.json` 中 `light.tokens` 保持为空即可。暗色或其他主题只需声明与基础主题有差异的 token：

```json
{
  "activeTheme": "light",
  "themes": {
    "light": { "name": "明亮春景", "tokens": {} },
    "dark": {
      "name": "暗色夜读",
      "tokens": {
        "bg": "#0f172a",
        "surface": "#1e293b",
        "ink": "#f8fafc"
      }
    }
  }
}
```

构建时，`build.py` 会自动从 `_variables.scss` 读取基础 token，再与当前主题的覆盖 token 合并，保证模块数据和运行时 JS 都能拿到完整的颜色值。

### 切换主题

构建后的 HTML 右上角有主题切换按钮，点击可在明亮/暗色主题间切换，状态保存在 `localStorage`。

### 使用 token

模块 JSON 中应使用 token 名而不是直接写死色值，例如 `"bg": "reading-warm"`，由 `apply_tokens()` 在构建时替换为实际颜色。

---

## 清理规则

清理规则集中在 `build.py` 顶部的 `CLEANUP_CONFIG` 字典中，避免硬编码路径 scattered 在代码各处：

- `protected_paths`：受保护的核心路径，清理时绝不会删除
- `temp_dir_patterns`：临时目录通配模式，例如 `__pycache__`、`.trae-html-share-*`
- `empty_root_keep`：根目录下保留的目录名，其余空目录会被清理
- `backup_rules`：备份保留规则，包括目录、通配模式、保留份数

修改这些配置后，无需改动清理函数逻辑即可生效。

### 规则一：构建前后各清理一次

每次运行 `python build.py` 会执行两次清理：

1. **构建前清理**：删除上次残留的临时产物和旧备份，确保从一个干净的状态开始构建。
2. **构建后清理**：在所有构建和校验步骤完成后，再次清理运行过程中新产生的临时产物。

### 规则二：后清理放在完整校验之后

`validate_workbench.py` 运行时会重新导入 Python 模块并生成 `__pycache__`。因此后清理安排在完整校验通过之后再执行，避免校验产物残留在目录中。

### 清理对象

- `__pycache__/` 目录：Python 运行产生的缓存
- `.trae-html-share-packages/`：Trae 自动生成的 HTML 分享包
- 根目录下来源不明的空目录
- 超出最近 3 份的旧 HTML 备份

### 关于临时产物再生

`__pycache__/` 和 `.trae-html-share-packages/` 属于持续再生产物。运行 Python 脚本或 Trae 预览 HTML 后它们可能重新出现，这是正常现象，下次运行 `build.py` 会继续清理。

---

## 备份规则

每次构建都会把当前 `此刻便是春天.html` 复制一份为：

```
Workbench/此刻便是春天.html.bak-YYYYMMDD_HHMMSS
```

旧备份按修改时间排序，只保留最新的 3 份，更早的会在后清理阶段删除。

---

## 新增模块步骤

1. 在 `Workbench/data/modules/` 创建 `{模块id}.json`
2. 在 `workbench.json` 的 `modules` 数组中注册该模块
3. 如需内容转换，在 `transformers/` 创建 `{模块id}.py`，实现 `enrich_module(data)`
4. 运行 `python build.py` 和 `python validate_workbench.py`
5. 确认 `此刻便是春天.html` 正常显示新模块

---

## 注意事项

- `build.py` 本身不纳入 Git 忽略；构建产物 `Workbench/此刻便是春天.html` 现在随源码一同提交 Git，方便对比各版本差异
- 不要直接编辑 `此刻便是春天.html`，它是构建产物；修改源文件后重新运行 `build.py`
- 如果清理后发现临时文件重新出现，那是因为 Python/Trae 在运行过程中又生成了，下次运行 `build.py` 会继续清理
- 构建失败时，检查最近的 `.bak` 备份可以回滚到上一个可用版本
