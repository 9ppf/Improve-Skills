---
name: "css-gate"
description: "CSS规范守门 skill：创建或修改 Workbench/ 下 HTML 页面时强制检查 CSS 规范（共享CSS引用、禁止内联样式、禁止硬编码颜色等），违规时拒绝写入并提供正确模板。Invoke when creating or modifying any HTML file under Workbench/."
---

# CSS Gate — 页面 CSS 规范守门

## 触发条件

当执行以下操作之一时，**必须先完成本 skill 的全部检查**，再写入文件：

1. 在 `Workbench/` 下创建新的 `.html` 文件
2. 修改 `Workbench/` 下已有 `.html` 文件的 `<head>` 或 CSS 引用部分
3. 修改 `Workbench/` 下已有 `.html` 文件，涉及新增 `<style>` 块或 `style=""` 属性

## 白名单（不受本 skill 约束）

| 文件/模式 | 排除原因 |
|-----------|---------|
| `Workbench/此刻便是春天.html` | 工作台主页，CSS 由 `build.py` 从 Sass 编译后 `{{ styles }}` 注入，非写死 |
| `*_备份_*.html` | 历史备份文件，不活跃使用 |
| `设计稿*.html`、`设计方案*.html` | 设计稿不引用工作台框架，不抽离 CSS |

白名单仅限以上 3 类。**新增白名单条目必须经用户确认。**

## 7 条硬规则

### 规则 1：必须引用 4 个共享文件

每个 Workbench 页面的 `<head>` 中必须包含以下 4 个引用：

```html
<link rel="stylesheet" href="{相对路径}/styles/shared/base-vars.css">
<link rel="stylesheet" href="{相对路径}/styles/shared/base.css">
<link rel="stylesheet" href="{相对路径}/styles/shared/components.css">
<link rel="stylesheet" href="{相对路径}/styles/{模块}/{页面名}.css">
<script src="{相对路径}/styles/shared/theme-sync.js"></script>
```

**相对路径计算规则**：从页面所在目录回退到项目根目录，再进入 `styles/shared/`。

- `Workbench/page.html` → `../styles/shared/`（回退 1 级）
- `Workbench/read/page.html` → `../../styles/shared/`（回退 2 级）
- `Workbench/自考学习/英语（二）/page.html` → `../../../styles/shared/`（回退 3 级）

公式：`Workbench/` 之后有几层目录，就加几个 `../`。

### 规则 2：禁止内联 `<style>` 块

页面中不得出现 `<style>...</style>` 标签。所有 CSS 必须写在外部 `.css` 文件中。

### 规则 3：禁止硬编码颜色

CSS 中不得出现以下写法：

- `#fff`、`#38BDF8`、`#A78BFA` 等 hex 色值
- `rgb(255, 255, 255)`、`rgba(0, 0, 0, 0.1)` 等 rgb/rgba 函数
- `hsl()`、`hsla()` 函数

**必须使用** `var(--xxx)` 引用 CSS 变量。常用变量见 `styles/_variables.scss`。

### 规则 4：禁止 `!important`

任何 CSS 规则中不得使用 `!important`。

### 规则 5：禁止裸标签选择器

不得使用 `p {}`、`div {}`、`h2 {}`、`ul {}` 等直接标签选择器。必须用类名限定，如 `.reading-essay-body p {}`。

### 规则 6：禁止行内 `style=""` 静态值

**允许**：`style="--fill-pct: 50%"`（动态 CSS 变量，由 JS 设置）
**禁止**：`style="color: red"`、`style="padding: 10px"`（静态值应写在 CSS 类中）

判断标准：如果属性值包含 `var(` 或 `calc(`，允许；否则禁止 `color`/`background`/`font-size`/`padding`/`margin`/`border`/`border-radius`/`width`/`height` 等静态属性。

### 规则 7：CSS 文件路径规范

页面专属 CSS 文件必须放在 `styles/{模块}/` 目录下，文件名与 HTML 页面名一致（不含扩展名）。

- 页面：`Workbench/ai-learning/ai-knowledge-tree.html`
- CSS：`styles/ai-learning/ai-knowledge-tree.css`

## 执行流程

当需要创建或修改 Workbench HTML 文件时：

### 步骤 1：判断是否在白名单中

如果文件名匹配白名单模式，跳过检查。否则继续。

### 步骤 2：生成正确的 `<head>` 模板

根据页面路径计算相对路径，生成包含 4 个共享文件引用 + 1 个页面专属 CSS 引用的 `<head>` 块。

### 步骤 3：检查 HTML 内容

对待写入的 HTML 内容执行以下检查：

1. **共享引用检查**：搜索 `base-vars.css`、`base.css`、`components.css`、`theme-sync.js` 是否都存在
2. **内联样式检查**：搜索 `<style` 标签是否存在
3. **硬编码颜色检查**：搜索 `#[0-9a-fA-F]{3,8}`、`rgb(`、`rgba(`、`hsl(` 模式
4. **`!important` 检查**：搜索 `!important` 字符串
5. **裸标签选择器检查**：搜索 `^\s*(p|div|span|a|ul|ol|li|h[1-6])\s*\{` 模式
6. **行内静态样式检查**：搜索 `style="` 属性中的静态值

### 步骤 4：违规处理

- 如果检查 1 失败（缺少共享引用）：**拒绝写入**，输出正确的 `<head>` 模板供使用
- 如果检查 2-6 任一失败：**拒绝写入**，列出所有违规项及修正建议
- 所有检查通过：允许写入

## 标准 `<head>` 模板

以 `Workbench/ai-learning/example.html` 为例：

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>

  <link rel="stylesheet" href="../../styles/shared/base-vars.css">
  <link rel="stylesheet" href="../../styles/shared/base.css">
  <link rel="stylesheet" href="../../styles/shared/components.css">
  <link rel="stylesheet" href="../../styles/ai-learning/example.css">
  <script src="../../styles/shared/theme-sync.js"></script>
</head>
```

## 与 build.py 的关系

本 skill 是**第一道防线（写入时拦截）**。即使本 skill 未被调用，`build.py` 构建后会执行 `check_css_standards.py` 作为**第二道防线（构建时硬阻断）**，扫描全部 Workbench HTML 文件，发现违规则 build 报错。

**两层防线缺一不可**：skill 提供即时反馈和正确模板，build.py 确保不遗漏。
