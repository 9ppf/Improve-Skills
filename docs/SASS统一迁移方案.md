# SASS 统一迁移方案（浅蓝色系）

> 目标：将工作台外壳 SASS 和内容页面 CSS 统一为一套 SASS 系统。
> 色系：以 SASS 现有浅蓝/天蓝/浅紫为基础，内容页面从深色调刷新为浅蓝色调。
> 工作台外壳视觉不变，内容页面视觉刷新。

---

## 一、当前状态

### SASS 文件（工作台外壳）
```
styles/
├── main.scss          # 入口，7 个 @import
├── _variables.scss     # SASS 变量（浅蓝色系）
├── _root.scss          # SASS 变量 → CSS 自定义属性
├── _base.scss           # reset + body
├── _components.scss     # .btn / .badge / .plan-card / .plan-tab / .qt-tag
├── _layout.scss         # topbar / sidebar / main
├── _tree.scss           # 树形导航
├── _reading.scss        # 阅读模块
└── _responsive.scss     # 响应式
```

### CSS 文件（内容页面）
```
styles/shared/
├── base-vars.css        # 41 行，深蓝色系变量
├── base.css             # 28 行，reset
└── components.css        # 87 行，.zk-card / .zk-pill / .zk-seg / .zk-track

styles/自考学习/          # 各页面专属 CSS
styles/今日学习/
styles/能力提升/
```

### 两套色系对比

| 变量 | SASS（保留） | CSS（被替换） | 视觉变化 |
|---|---|---|---|
| 底色 --bg | `#F0F9FF` 浅蓝 | `#f8fafc` 灰 | 页面底色变浅蓝 |
| 正文 --ink | `#2D2A32` | `#1e293b` | 略变暖 |
| 边框 --rule | `#E0F2FE` 浅蓝 | `#e2e8f0` 灰 | 分割线变浅蓝 |
| 主色 --accent | `#38BDF8` 天蓝 | `#2563eb` 深蓝 | 变亮 |
| 副色 --accent2 | `#A78BFA` 浅紫 | `#8b5cf6` 深紫 | 变浅紫 |
| 粉 --coral | `#F472B6` | `#e11d48` 暗红 | 变粉 |
| 绿 --green | `#34D399` | `#059669` | 变亮 |
| 橙 --orange | `#FB923C` | `#ea580c` | 变亮 |
| 浅底 --accent-soft | `#E0F2FE` | `#eff6ff` | 变浅蓝 |

---

## 二、执行步骤

### 步骤 1：更新 _variables.scss（30 分钟）

**文件**：`styles/_variables.scss`

**改动**：保留全部现有变量不动，在文件末尾新增别名和新变量。

```scss
// ============================================================
// 以下为统一新增：别名 + 页面用变量
// ============================================================

// 别名：内容页面 CSS 使用的变量名，指向已有 SASS 变量
$accent: $accent-blue;        // #38BDF8 天蓝
$accent2: $accent-purple;     // #A78BFA 浅紫
$coral: $accent-coral;        // #F472B6
$green: $accent-green;        // #34D399
$orange: $accent-orange;      // #FB923C
$accent-soft: $blue-soft;     // #E0F2FE
$accent2-soft: $purple-soft;  // #EDE9FE
$card-bg: rgba(255, 255, 255, 0.6);

// 渐变
$grad-135: linear-gradient(135deg, $accent, $accent2);
$grad-90: linear-gradient(90deg, $accent, $accent2);

// 阴影（已有 $shadow-sm / $shadow，补充 hover 变体）
$shadow-hover: 0 8px 24px rgba(15, 23, 42, 0.08);

// 过渡
$transition-base: all 0.2s ease;

// 5 档掌握度（功能色，保持不变）
$mastery-0: #94A3B8;  // 灰：未开始
$mastery-1: #3B82F6;  // 蓝：学习中
$mastery-2: #EF4444;  // 红：薄弱
$mastery-3: #F59E0B;  // 橙：待复习
$mastery-4: #10B981;  // 绿：已掌握

// 优先级标签
$pri-key: #DC2626;     // 红：重点
$pri-normal: #D97706;   // 橙：一般
$pri-survey: #64748B;   // 灰：了解

// 最大宽度
$max: 860px;
```

**验证**：SASS 语法检查 `sass --check styles/_variables.scss`

---

### 步骤 2：更新 _root.scss（20 分钟）

**文件**：`styles/_root.scss`

**改动**：保留所有现有输出，新增别名和新增变量的 CSS 自定义属性输出。

在现有 `:root {}` 块内末尾新增：

```scss
  // —— 内容页面变量别名 ——
  --accent: #{$accent};
  --accent2: #{$accent2};
  --coral: #{$coral};
  --green: #{$green};
  --orange: #{$orange};
  --accent-soft: #{$accent-soft};
  --accent2-soft: #{$accent2-soft};
  --card-bg: #{$card-bg};
  --max: #{$max};

  // —— 渐变 ——
  --grad-135: #{$grad-135};
  --grad-90: #{$grad-90};

  // —— 阴影补充 ——
  --shadow-card: #{$shadow-sm};
  --shadow-hover: #{$shadow-hover};

  // —— 过渡 ——
  --transition-base: #{$transition-base};

  // —— 5 档掌握度 ——
  --mastery-0: #{$mastery-0};
  --mastery-1: #{$mastery-1};
  --mastery-2: #{$mastery-2};
  --mastery-3: #{$mastery-3};
  --mastery-4: #{$mastery-4};

  // —— 优先级 ——
  --pri-key: #{$pri-key};
  --pri-normal: #{$pri-normal};
  --pri-survey: #{$pri-survey};
```

**关键**：保留原有的 `--accent-blue`/`--accent-purple`/`--accent-coral` 等输出，工作台外壳引用这些变量不受影响。新增的 `--accent`/`--accent2` 等供内容页面使用。

**编译产物**：`_root.scss` 编译后替换 `shared/base-vars.css`。

---

### 步骤 3：更新 _base.scss（20 分钟）

**文件**：`styles/_base.scss`

**改动**：合并 `base.css` 的 reset 规则，保留工作台外壳的 `.app` 布局。

```scss
@import "variables";

* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--bg);
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// 工作台外壳布局（保留）
.app { display: flex; height: 100vh; }
```

**编译产物**：`_base.scss` 编译后替换 `shared/base.css`。

---

### 步骤 4：更新 _components.scss（40 分钟）

**文件**：`styles/_components.scss`

**改动**：保留全部现有组件不动，在文件末尾新增内容页面的公共组件。

```scss
// ============================================================
// 以下为内容页面公共组件（.zk-* 命名空间）
// ============================================================

// —— 卡片基类 ——
.zk-card {
  background: var(--bg2);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  padding: 0.8rem;
  margin-bottom: 0.6rem;
}

// —— 卡片左边框变体 ——
.zk-card-bar { border-left: 4px solid var(--bar-color, var(--accent)); }
.zk-card-bar-accent { border-left: 4px solid var(--accent); }
.zk-card-bar-accent2 { border-left: 4px solid var(--accent2); }
.zk-card-bar-green { border-left: 4px solid var(--green); }
.zk-card-bar-orange { border-left: 4px solid var(--orange); }
.zk-card-bar-coral { border-left: 4px solid var(--coral); }

// —— pill 标签 ——
.zk-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

@each $name, $color in (
  "blue": #3B82F6, "red": #DC2626, "amber": #D97706,
  "green": #059669, "purple": #7C3AED, "gray": #64748B
) {
  .zk-pill-#{$name} {
    background: rgba($color, 0.10);
    color: $color;
  }
}

// —— 渐变按钮 ——
.zk-grad-btn {
  background: var(--grad-135);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  transition: var(--transition-base);
}
.zk-grad-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

// —— 渐变圆形（数字/图标） ——
.zk-grad-circle {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-135);
  color: #fff;
  font-weight: 700;
}

// —— h2 左竖条标题 ——
.zk-h2-bar {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.zk-h2-bar::before {
  content: '';
  width: 4px;
  height: 18px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}

// —— 进度条 ——
.zk-track {
  height: 8px;
  background: var(--rule);
  border-radius: 999px;
  overflow: hidden;
}
.zk-fill {
  height: 100%;
  background: var(--grad-90);
  border-radius: 999px;
  transition: width 0.4s var(--ease);
}

// —— 分段按钮 ——
.zk-seg {
  flex: 1;
  border: 1px solid var(--rule);
  background: var(--surface);
  padding: 0.4rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
}
.zk-seg.zk-active {
  background: var(--grad-135);
  color: #fff;
  border-color: transparent;
}

// —— 空状态 ——
.zk-empty {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}

// —— 5 档掌握度数据属性 ——
@each $level, $color in (
  0: $mastery-0, 1: $mastery-1, 2: $mastery-2,
  3: $mastery-3, 4: $mastery-4
) {
  [data-mastery="#{$level}"] { --mastery-color: #{$color}; }
}
```

**编译产物**：`_components.scss` 编译后替换 `shared/components.css`。

---

### 步骤 5：安装 dart-sass 并更新 build.py（30 分钟）

**5a. 安装 dart-sass**

```bash
npm install -g sass
```

验证：`sass --version`

**5b. build.py 新增编译函数**

在 `build.py` 中新增：

```python
import subprocess, os

def compile_sass():
    """编译 SASS → CSS，输出到 shared/ 目录"""
    sass_path = os.path.join(PROJECT_ROOT, 'styles')
    out_dir = os.path.join(sass_path, 'shared')
    os.makedirs(out_dir, exist_ok=True)

    # 分别编译各 partial 为独立 CSS 文件
    targets = [
        ('_root.scss', 'base-vars.css'),
        ('_base.scss', 'base.css'),
        ('_components.scss', 'components.css'),
    ]
    for src, dst in targets:
        src_path = os.path.join(sass_path, src)
        dst_path = os.path.join(out_dir, dst)
        result = subprocess.run(
            ['sass', '--no-source-map', src_path, dst_path],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f'SASS 编译失败 {src}: {result.stderr}')
            return False
    print('SASS 编译完成 → shared/base-vars.css / base.css / components.css')
    return True
```

在 `build.py` 主流程中，在其他构建步骤之前调用 `compile_sass()`。

**验证**：运行 `python build.py`，检查 `shared/` 下三个 CSS 文件已更新。

---

### 步骤 6：编译并验证工作台外壳（30 分钟）

**6a. 编译**

```bash
cd e:\TraeWorkToDo
sass --no-source-map styles/_root.scss styles/shared/base-vars.css
sass --no-source-map styles/_base.scss styles/shared/base.css
sass --no-source-map styles/_components.scss styles/shared/components.css
```

**6b. 验证工作台外壳**

打开工作台，检查：

| 检查项 | 预期 |
|---|---|
| 侧栏背景 | 浅蓝（不变） |
| 顶栏 | 白色（不变） |
| 分割线 | 浅蓝（不变） |
| 按钮/标签 | 天蓝/浅紫渐变（不变） |
| 树形导航 hover | 浅蓝（不变） |
| 搜索框 focus | 青色边框（不变） |

**如果外壳视觉有变化**：说明 `_root.scss` 输出的变量名和值与原来不一致，检查是否有变量被意外删除或重命名。

---

### 步骤 7：验证内容页面（30 分钟）

打开各内容页面，检查视觉变化：

| 页面 | 预期变化 |
|---|---|
| 知识框架 | 底色从灰变浅蓝，主色从深蓝变天蓝，副色从深紫变浅紫 |
| 练习测验 | 同上 |
| 背诵与简答 | 同上 |
| 复盘总结 | 同上 |
| 今日学习流 | 同上 |
| 能力提升驾驶舱 | 同上 |
| 学习路线图 | 已经用 body 作用域覆盖了部分变量，需要移除覆盖让全局变量生效 |

**学习路线图特殊处理**：
该文件 body 里有 `--coral`/`--green`/`--orange`/`--max` 的覆盖定义。统一后这些值和全局一致（或用户想要的全局值），删除 body 里的覆盖，让全局变量生效。

**5 档掌握度颜色不变**：灰/蓝/红/橙/绿是功能色，`_variables.scss` 里的值和页面原来硬编码的值一致。

---

### 步骤 8：替换页面 CSS 中的硬编码值（1.5 小时）

编译完成后，`shared/base-vars.css` 已输出 `--grad-135`/`--grad-90`/`--shadow-card`/`--transition-base`/`--mastery-0~4` 等变量。现在逐页面替换硬编码值：

**按以下顺序处理**（每改一个文件验证一次）：

| 序号 | 文件 | 替换内容 | 预估 |
|---|---|---|---|
| 8a | 学习路线图.css | 删除 body 覆盖变量；渐变→var(--grad-*)；阴影→var(--shadow-*) | 15min |
| 8b | 能力提升驾驶舱.css | 渐变→var(--grad-*)；阴影→var(--shadow-*)；rgba(255,255,255,0.6)→var(--card-bg) | 15min |
| 8c | 复盘总结.css | 渐变→var(--grad-*)；pill→var(--shadow-card) | 15min |
| 8d | 背诵与简答.css | 渐变→var(--grad-*) | 10min |
| 8e | 练习测验.css | 渐变→var(--grad-*)；阴影→var(--shadow-card) | 10min |
| 8f | 今日学习流.css | 渐变→var(--grad-*) | 10min |
| 8g | 知识框架.css | 渐变→var(--grad-*)；5档颜色→var(--mastery-*)；优先级→var(--pri-*)；阴影→var(--shadow-card) | 30min |

**每个子步骤验收**：
- [ ] 浏览器打开该页面，视觉无变化（颜色已由编译后的 base-vars.css 统一输出）
- [ ] CSS 文件中无 `linear-gradient(135deg, var(--accent)` 硬编码
- [ ] CSS 文件中无 `#94a3b8`/`#3b82f6`/`#ef4444`/`#f59e0b`/`#10b981` 硬编码（仅知识框架）

---

### 步骤 9：清理 _tree.scss 和 _layout.scss 中的硬编码 rgba（可选，30 分钟）

这两个文件有硬编码的 `rgba(56, 189, 248, 0.07)`（accent-blue 的 rgba 形式）。

**_tree.scss** 替换：
```scss
// 旧
.tree-row:hover { background: rgba(56, 189, 248, 0.07); }
// 新
.tree-row:hover { background: rgba($accent-blue, 0.07); }
```

**_layout.scss** 替换：
```scss
// 旧
.search input:focus {
  box-shadow: 0 0 0 4px rgba(56, 249, 215, 0.12);
}
// 新（修正颜色值，原值有误）
.search input:focus {
  box-shadow: 0 0 0 4px rgba($accent-cyan, 0.12);
}
```

---

## 三、验收清单

### 步骤 1-5 完成后（SASS 编译流水线就绪）

- [ ] `_variables.scss` 新增别名 + 渐变 + 阴影 + 5档 + 优先级变量
- [ ] `_root.scss` 输出 `--accent`/`--accent2`/`--grad-135`/`--grad-90`/`--shadow-card`/`--mastery-0~4` 等
- [ ] `_base.scss` 合并 reset，保留 `.app` 布局
- [ ] `_components.scss` 新增 `.zk-card`/`.zk-pill`/`.zk-grad-btn`/`.zk-h2-bar` 等
- [ ] dart-sass 已安装，`sass --version` 正常
- [ ] `build.py` 新增 `compile_sass()` 函数
- [ ] `python build.py` 编译成功，`shared/` 下 3 个 CSS 文件已更新

### 步骤 6-7 完成后（视觉验证）

- [ ] 工作台外壳视觉无变化
- [ ] 内容页面底色从灰变浅蓝
- [ ] 内容页面主色从深蓝变天蓝
- [ ] 内容页面副色从深紫变浅紫
- [ ] 5 档掌握度颜色不变
- [ ] 无 console 报错

### 步骤 8-9 完成后（硬编码清理）

- [ ] 7 个页面 CSS 中无 `linear-gradient(135deg, var(--accent)` 硬编码
- [ ] 7 个页面 CSS 中无 `linear-gradient(90deg, var(--accent)` 硬编码
- [ ] 知识框架.css 中无 5 档颜色硬编码
- [ ] 知识框架.css 中无优先级颜色硬编码
- [ ] 各页面 CSS 行数减少

---

## 四、时间估算

| 步骤 | 内容 | 时间 | 风险 |
|---|---|---|---|
| 1 | _variables.scss 新增变量 | 30min | 零 |
| 2 | _root.scss 输出变量 | 20min | 零 |
| 3 | _base.scss 合并 reset | 20min | 低 |
| 4 | _components.scss 新增组件 | 40min | 低 |
| 5 | 安装 dart-sass + build.py | 30min | 中 |
| 6 | 编译 + 验证外壳 | 30min | 中 |
| 7 | 验证内容页面 | 30min | 中 |
| 8 | 逐页替换硬编码 | 1.5h | 低 |
| 9 | 清理 SASS 硬编码 | 30min | 低 |
| **合计** | | **约 5 小时** | |

---

## 五、回滚方案

| 场景 | 回滚方式 |
|---|---|
| SASS 编译失败 | 保留 `shared/*.css` 旧文件，build.py 检测编译失败时跳过覆盖 |
| 内容页面颜色不协调 | 在 `_variables.scss` 调整对应变量值，重新编译即可 |
| 工作台外壳视觉异常 | 检查 `_root.scss` 是否意外删除了原有变量输出 |
| 完全回滚 | `git checkout` 恢复 `styles/` 目录到迁移前状态 |
