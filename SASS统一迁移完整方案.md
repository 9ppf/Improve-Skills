# SASS 统一迁移完整方案

> **色系**：浅蓝/天蓝/浅紫（以现有 SASS 文件色系为基础）
> **原则**：工作台外壳零变化，内容页面从灰/深色刷新为浅蓝色调
> **文件数量**：不新增不删除，仅改变 shared/ 下 3 个文件从"手写"变为"SASS 编译产物"
> **总工时**：约 5 小时，可分 3 次完成

---

## 一、文件结构

### 当前结构

```
styles/
├── main.scss                  # SASS 入口，@import 7 个 partials
├── _variables.scss             # SASS 变量（浅蓝色系）          ← 步骤1更新
├── _root.scss                  # SASS 变量 → CSS 自定义属性      ← 步骤2更新
├── _base.scss                  # reset + body                    ← 步骤3更新
├── _components.scss            # 工作台组件 + 页面公共组件         ← 步骤4更新
├── _layout.scss                # 工作台布局（topbar/sidebar/main）← 步骤9清理
├── _tree.scss                  # 树形导航                         ← 步骤9清理
├── _reading.scss               # 阅读模块（不动）
├── _responsive.scss            # 响应式（不动）
│
├── shared/                     # 手写 CSS → SASS 编译产物
│   ├── base-vars.css           # ← _root.scss 编译生成（步骤5后自动）
│   ├── base.css                # ← _base.scss 编译生成（步骤5后自动）
│   └── components.css          # ← _components.scss 编译生成（步骤5后自动）
│
├── 自考学习/                    # 页面专属样式
│   ├── 知识框架.css             # ← 步骤8g 替换硬编码
│   ├── 背诵与简答.css           # ← 步骤8d 替换硬编码
│   ├── 复盘总结.css             # ← 步骤8c 替换硬编码
│   └── 练习测验.css             # ← 步骤8e 替换硬编码
├── 今日学习/
│   └── 今日学习流.css           # ← 步骤8f 替换硬编码
└── 能力提升/
    ├── 能力提升驾驶舱.css        # ← 步骤8b 替换硬编码
    └── 学习路线图.css           # ← 步骤8a 替换硬编码
```

### 迁移前后对比

| 文件 | 迁移前 | 迁移后 | 步骤 |
|---|---|---|---|
| `_variables.scss` | 72 行，浅蓝色系变量 | 新增 ~30 行别名+新变量 | 1 |
| `_root.scss` | 54 行，输出 CSS 变量 | 新增 ~25 行变量输出 | 2 |
| `_base.scss` | 28 行，reset | 合并 base.css 的 reset，~35 行 | 3 |
| `_components.scss` | 349 行，工作台组件 | 末尾新增 ~80 行页面公共组件 | 4 |
| `shared/base-vars.css` | 41 行，**手写** | 编译产物，**自动生成** | 5 |
| `shared/base.css` | 28 行，**手写** | 编译产物，**自动生成** | 5 |
| `shared/components.css` | 87 行，**手写** | 编译产物，**自动生成** | 5 |
| 8 个页面 CSS | 有硬编码渐变/颜色/阴影 | 引用变量，删除硬编码 | 8a-8g |

---

## 二、颜色映射

### 统一后色系（SASS 现有值，内容页面刷新为此色系）

| 变量 | 统一值 | CSS 旧值（被替换） | 视觉变化 |
|---|---|---|---|
| `--bg` | `#F0F9FF` 浅蓝 | `#f8fafc` 灰 | 页面底色变浅蓝 |
| `--ink` | `#2D2A32` | `#1e293b` | 略变暖 |
| `--muted` | `#64748B` | `#64748b` | 不变 |
| `--rule` | `#E0F2FE` 浅蓝 | `#e2e8f0` 灰 | 分割线变浅蓝 |
| `--accent` | `#38BDF8` 天蓝 | `#2563eb` 深蓝 | 主色变亮 |
| `--accent2` | `#A78BFA` 浅紫 | `#8b5cf6` 深紫 | 副色变浅紫 |
| `--accent-soft` | `#E0F2FE` | `#eff6ff` | 变浅蓝 |
| `--coral` | `#F472B6` 粉 | `#e11d48` 暗红 | 变粉 |
| `--green` | `#34D399` 亮绿 | `#059669` 深绿 | 变亮 |
| `--orange` | `#FB923C` 亮橙 | `#ea580c` 深橙 | 变亮 |

### 功能色（保持不变）

| 变量 | 值 | 用途 |
|---|---|---|
| `--mastery-0` | `#94A3B8` | 灰：未开始 |
| `--mastery-1` | `#3B82F6` | 蓝：学习中 |
| `--mastery-2` | `#EF4444` | 红：薄弱 |
| `--mastery-3` | `#F59E0B` | 橙：待复习 |
| `--mastery-4` | `#10B981` | 绿：已掌握 |
| `--pri-key` | `#DC2626` | 红：重点 |
| `--pri-normal` | `#D97706` | 橙：一般 |
| `--pri-survey` | `#64748B` | 灰：了解 |

---

## 三、执行步骤

### 阶段一：更新 SASS 源文件 + 搭建编译流水线

#### 步骤 1：更新 `_variables.scss` — 新增别名和新变量

**文件**：`styles/_variables.scss`
**预估**：30 分钟
**风险**：零（仅新增，不改现有值）

**操作**：在文件末尾新增以下内容，不动任何现有变量。

```scss
// ============================================================
// 统一新增：别名 + 页面用变量
// ============================================================

// 别名：内容页面 CSS 使用的变量名
$accent: $accent-blue;        // #38BDF8 天蓝
$accent2: $accent-purple;     // #A78BFA 浅紫
$coral: $accent-coral;        // #F472B6
$green: $accent-green;        // #34D399
$orange: $accent-orange;      // #FB923C
$accent-soft: $blue-soft;     // #E0F2FE
$accent2-soft: $purple-soft;  // #EDE9FE
$card-bg: rgba(255, 255, 255, 0.6);
$max: 860px;

// 渐变
$grad-135: linear-gradient(135deg, $accent, $accent2);
$grad-90: linear-gradient(90deg, $accent, $accent2);

// 阴影补充
$shadow-hover: 0 8px 24px rgba(15, 23, 42, 0.08);

// 过渡
$transition-base: all 0.2s ease;

// 5 档掌握度
$mastery-0: #94A3B8;
$mastery-1: #3B82F6;
$mastery-2: #EF4444;
$mastery-3: #F59E0B;
$mastery-4: #10B981;

// 优先级
$pri-key: #DC2626;
$pri-normal: #D97706;
$pri-survey: #64748B;
```

**验收**：
- [ ] 现有变量值无改动
- [ ] 新增变量语法正确
- [ ] `sass --check styles/_variables.scss` 无报错

**状态**：✅ 已完成

---

#### 步骤 2：更新 `_root.scss` — 输出统一 CSS 变量

**文件**：`styles/_root.scss`
**预估**：20 分钟
**风险**：零（仅新增输出，不改现有）

**操作**：在现有 `:root {}` 块内末尾新增：

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

  // —— 阴影 ——
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

**关键**：保留原有 `--accent-blue`/`--accent-purple`/`--accent-coral` 等输出，工作台外壳不受影响。

**验收**：
- [ ] 原有变量输出保留不动
- [ ] 新增变量输出语法正确
- [ ] 编译后 `shared/base-vars.css` 包含 `--accent`/`--accent2`/`--grad-135` 等

**状态**：✅ 已完成

---

#### 步骤 3：更新 `_base.scss` — 合并 reset

**文件**：`styles/_base.scss`
**预估**：20 分钟
**风险**：低

**操作**：替换为以下内容（合并 `base.css` 的 reset 规则，保留工作台 `.app` 布局）：

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

.app { display: flex; height: 100vh; }
```

**验收**：
- [ ] 包含 `* { box-sizing }` reset
- [ ] 包含 `html { font-size: 16px; scroll-behavior }`
- [ ] 包含 `body { line-height: 1.6 }`
- [ ] 保留 `.app { display: flex; height: 100vh; }`
- [ ] 保留 `@media (prefers-reduced-motion)`
- [ ] 编译后 `shared/base.css` 内容正确

**状态**：✅ 已完成

---

#### 步骤 4：更新 `_components.scss` — 新增页面公共组件

**文件**：`styles/_components.scss`
**预估**：40 分钟
**风险**：低

**操作**：保留全部现有组件不动，在文件末尾新增：

```scss
// ============================================================
// 内容页面公共组件（.zk-* 命名空间）
// ============================================================

// 卡片基类
.zk-card {
  background: var(--bg2);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  padding: 0.8rem;
  margin-bottom: 0.6rem;
}

// 卡片左边框变体
.zk-card-bar { border-left: 4px solid var(--bar-color, var(--accent)); }

// pill 标签
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

// 渐变按钮
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

// 渐变圆形
.zk-grad-circle {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-135);
  color: #fff;
  font-weight: 700;
}

// h2 左竖条标题
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

// 进度条
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

// 分段按钮
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

// 空状态
.zk-empty {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}

// 5 档掌握度数据属性
@each $level, $color in (
  0: $mastery-0, 1: $mastery-1, 2: $mastery-2,
  3: $mastery-3, 4: $mastery-4
) {
  [data-mastery="#{$level}"] { --mastery-color: #{$color}; }
}
```

**验收**：
- [ ] 现有组件（.btn/.badge/.plan-card 等）无改动
- [ ] 新增 `.zk-card`/`.zk-pill`/`.zk-grad-btn`/`.zk-h2-bar` 等
- [ ] `@each` 循环语法正确
- [ ] 编译后 `shared/components.css` 包含新组件类

**状态**：⬜ 未开始

---

#### 步骤 5：安装 dart-sass + 更新 build.py

**预估**：30 分钟
**风险**：中（涉及环境安装和构建脚本）

**5a. 安装 dart-sass**

```bash
npm install -g sass
sass --version  # 验证
```

**5b. build.py 新增编译函数**

在 `build.py` 中新增：

```python
import subprocess, os

def compile_sass():
    """编译 SASS → CSS，输出到 shared/ 目录"""
    sass_path = os.path.join(PROJECT_ROOT, 'styles')
    out_dir = os.path.join(sass_path, 'shared')
    os.makedirs(out_dir, exist_ok=True)

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

在 `build.py` 主流程中最先调用 `compile_sass()`。

**5c. 手动编译验证**

```bash
cd e:\TraeWorkToDo
sass --no-source-map styles/_root.scss styles/shared/base-vars.css
sass --no-source-map styles/_base.scss styles/shared/base.css
sass --no-source-map styles/_components.scss styles/shared/components.css
```

**验收**：
- [ ] `sass --version` 正常输出
- [ ] `python build.py` 编译成功
- [ ] `shared/base-vars.css` 包含 `--accent: #38BDF8` 和 `--accent2: #A78BFA`
- [ ] `shared/base.css` 包含 reset 规则
- [ ] `shared/components.css` 包含 `.zk-card` 等新类

**状态**：✅ 已完成

---

### 阶段二：编译验证 + 视觉检查

#### 步骤 6：验证工作台外壳（零变化）

**预估**：30 分钟
**风险**：中

**操作**：编译后打开工作台，逐项检查：

| 检查项 | 预期 |
|---|---|
| 侧栏背景 | 浅蓝（不变） |
| 顶栏 | 白色（不变） |
| 分割线 | 浅蓝（不变） |
| 按钮/标签渐变 | 天蓝/浅紫（不变） |
| 树形导航 hover | 浅蓝（不变） |
| 搜索框 focus | 青色边框（不变） |

**如果外壳有变化**：检查 `_root.scss` 是否意外删除了原有变量输出。

**验收**：
- [ ] 工作台外壳视觉无变化
- [ ] 无 console 报错

**状态**：✅ 已完成

---

#### 步骤 7：验证内容页面（色系刷新）

**预估**：30 分钟
**风险**：中

**操作**：打开各内容页面，确认色系刷新：

| 页面 | 预期变化 |
|---|---|
| 知识框架 | 底色灰→浅蓝，主色深蓝→天蓝，副色深紫→浅紫 |
| 练习测验 | 同上 |
| 背诵与简答 | 同上 |
| 复盘总结 | 同上 |
| 今日学习流 | 同上 |
| 能力提升驾驶舱 | 同上 |
| 学习路线图 | 需删除 body 里的变量覆盖，让全局生效 |

**学习路线图特殊处理**：删除 body 里的 `--coral`/`--green`/`--orange`/`--max` 覆盖定义。

**验收**：
- [ ] 内容页面底色从灰变浅蓝
- [ ] 主色从深蓝变天蓝
- [ ] 副色从深紫变浅紫
- [ ] 5 档掌握度颜色不变
- [ ] 无 console 报错

**状态**：✅ 已完成

---

### 阶段三：清理页面 CSS 硬编码

#### 步骤 8：逐页面替换硬编码值

**预估**：1.5 小时
**风险**：低（值已被变量覆盖，替换为 `var(--xxx)` 不改变视觉）

**替换对照表**：

| 硬编码 | 替换为 | 涉及 |
|---|---|---|
| `linear-gradient(135deg, var(--accent), var(--accent2))` | `var(--grad-135)` | 35 处 |
| `linear-gradient(90deg, var(--accent), var(--accent2))` | `var(--grad-90)` | 16 处 |
| `box-shadow: 0 2px 6px rgba(0,0,0,0.05)` | `var(--shadow-card)` | 8 处 |
| `box-shadow: 0 8px 24px rgba(15,23,42,0.08)` | `var(--shadow-hover)` | 4 处 |
| `rgba(255,255,255,0.6)` | `var(--card-bg)` | 4 处 |
| `transition: all 0.2s ease` | `var(--transition-base)` | 25 处 |
| `#94A3B8`/`#3B82F6`/`#EF4444`/`#F59E0B`/`#10B981` | `var(--mastery-0~4)` | 62 处 |
| `#DC2626`/`#D97706`/`#64748B` | `var(--pri-key/normal/survey)` | 20 处 |

**逐页面执行**：

| 序号 | 文件 | 主要替换 | 预估 | 状态 |
|---|---|---|---|---|
| 8a | `能力提升/学习路线图.css` | 删 body 覆盖；渐变→var；阴影→var | 15min | ✅ |
| 8b | `能力提升/能力提升驾驶舱.css` | 渐变→var；阴影→var；rgba→var | 15min | ✅ |
| 8c | `自考学习/复盘总结.css` | 渐变→var；阴影→var | 15min | ✅ |
| 8d | `自考学习/背诵与简答.css` | 渐变→var | 10min | ✅ |
| 8e | `自考学习/练习测验.css` | 渐变→var；阴影→var；硬编码色→var | 10min | ✅ |
| 8f | `今日学习/今日学习流.css` | 渐变→var | 10min | ✅ |
| 8g | `自考学习/知识框架.css` | 渐变→var；5档→var；优先级→var；阴影→var | 30min | ✅ |

**每个子步骤验收**：
- [ ] 浏览器打开该页面，视觉无变化
- [ ] CSS 文件中对应硬编码已清除
- [ ] 无 console 报错

---

#### 步骤 9：清理 SASS 文件硬编码（可选）

**预估**：30 分钟
**风险**：低

**`_tree.scss`**：

```scss
// 旧
.tree-row:hover { background: rgba(56, 189, 248, 0.07); }
// 新
.tree-row:hover { background: rgba($accent-blue, 0.07); }
```

**`_layout.scss`**：

```scss
// 旧（原值有误）
.search input:focus {
  box-shadow: 0 0 0 4px rgba(56, 249, 215, 0.12);
}
// 新
.search input:focus {
  box-shadow: 0 0 0 4px rgba($accent-cyan, 0.12);
}
```

**验收**：
- [ ] `_tree.scss` 无 `rgba(56, 189, 248` 硬编码
- [ ] `_layout.scss` 无 `rgba(56, 249, 215` 硬编码
- [ ] 编译后外壳视觉无变化

**状态**：✅ 已完成

---

## 四、进度总览

| 步骤 | 内容 | 预估 | 风险 | 状态 |
|---|---|---|---|---|
| 1 | `_variables.scss` 新增变量 | 30min | 零 | ✅ |
| 2 | `_root.scss` 输出变量 | 20min | 零 | ✅ |
| 3 | `_base.scss` 合并 reset | 20min | 低 | ✅ |
| 4 | `_components.scss` 新增组件 | 40min | 低 | ✅ |
| 5 | 安装 dart-sass + build.py | 30min | 中 | ✅ |
| 6 | 验证工作台外壳 | 30min | 中 | ✅ |
| 7 | 验证内容页面 | 30min | 中 | ✅ |
| 8a-8g | 逐页替换硬编码 | 1.5h | 低 | ✅ ×7 |
| 9 | 清理 SASS 硬编码 | 30min | 低 | ✅ |
| **合计** | | **约 5h** | | **全部完成** |

**状态标记说明**：
- ⬜ 未开始
- 🔄 进行中
- ✅ 已完成

---

## 五、回滚方案

| 场景 | 回滚方式 |
|---|---|
| SASS 编译失败 | 保留 `shared/*.css` 旧文件，build.py 检测失败时跳过覆盖 |
| 内容页面颜色不协调 | 在 `_variables.scss` 调整变量值，重新编译 |
| 工作台外壳视觉异常 | 检查 `_root.scss` 是否保留了原有变量输出 |
| 完全回滚 | `git checkout` 恢复 `styles/` 目录 |

---

## 六、已完成的后续工作（SASS 化之后）

### 6.1 按钮样式统一（四级按钮体系）

**完成时间**：v2.31.52

采用四级按钮体系，统一所有页面按钮风格：
- **T1 主操作** `.zk-btn-primary` — 渐变 `var(--grad-135)` 背景，白色文字
- **T2 常规操作** `.zk-btn-solid` — 纯色 `var(--accent)` 背景，白色文字
- **T3 次要操作** `.zk-btn-outline` — 白底 + `var(--rule)` 边框
- **T4 文字按钮** `.zk-btn-ghost` — 透明背景，文字按钮

按钮规范：`padding: 0.4rem 0.8rem`，`border-radius: 6px`，`font-size: 0.85rem`，`width: auto`，`min-width: 80px`。

HTML 元素添加共享类，页面 CSS 仅保留布局属性，删除冗余视觉属性。

### 6.2 主题切换功能（5 套主题）

**完成时间**：v2.31.52

采用 3 层架构实现多主题切换：
1. **CSS 变量层**：`_root.scss` 定义 5 套主题 `[data-theme="light|dark|warm|nature|rose"]`
2. **工作台外壳 JS**：`toggleWorkbenchTheme()` 循环切换 5 主题，设置 `data-theme` + `postMessage` 通知 iframe
3. **内容页面 JS**：`theme-sync.js` 监听 `postMessage` 同步 `data-theme`

统一用工作台右上角一个按钮控制，`localStorage` 键名 `workbench-theme`。

### 6.3 侧边栏渐变融合

**完成时间**：v2.31.53

消除侧边栏色块割裂感，将侧边栏与主内容区自然过渡：
- **顶部栏 + 侧边栏**：`background: linear-gradient(180deg, var(--sidebar), var(--bg))`
- **搜索框**：`background: rgba(255, 255, 255, 0.4)` 半透明融入侧边栏
- **侧边栏底部**：`background: transparent` 去除纯色背景

渐变使用 CSS 变量，所有主题自动生效。

### 6.4 练习测验页面主题适配

**完成时间**：v2.31.53

修复练习测验页面不随主题切换变化的问题：
- `body` 背景：三色硬编码渐变 → `var(--bg)` 纯色（与知识框架一致）
- `--bg-soft: #f9fafb` 覆盖：删除，继承 `base-vars.css` 默认值
- `--session-track: #ddd6fe`：→ `var(--accent2-soft)`
- `.ai-loading-sub color: #a78bfa`：→ `var(--accent2)`

---

## 七、后续规划（尚未完成）

| 后续任务 | 说明 | 依赖 |
|---|---|---|
| 页面 CSS → SCSS | 各页面 .css 转 .scss，用 mixin/@include 替代手写 | 步骤 1-9 完成 |
| 主题切换 | `data-theme` 属性 + `_root.scss` 多套变量 | SASS 化完成 |
| SASS map + @each 重构 | 5档颜色/优先级标签用循环生成 | 页面转 .scss 后 |
