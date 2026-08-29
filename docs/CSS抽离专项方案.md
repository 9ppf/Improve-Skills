# CSS 抽离专项方案（基于现有代码实地分析）

> 生成时间：2026-08-26
> 状态：方案阶段，未开始执行
> 关联：公共JS与CSS抽离方案B.md（总方案），本文件为 CSS 部分的落地执行细则

---

## 〇、方案形成过程（决策依据链）

> 本节记录方案是怎么一步步形成的、为什么这样决策，供新会话/新账号还原推理路径，避免重复分析或推翻结论。

### 步骤1：确认问题边界（为什么只做 CSS）

- 用户最初问「公共JS抽离」，我先盘点出 JS 全部内联、13个重复函数、14套AI对话实现。用户随后问「现在开始抽离了？我只需要知道方案」——明确要求**先出方案不执行**。
- 用户最终指示「先把 CSS 抽离出来吧」——**CSS 优先，JS 留后续**。所以本方案只覆盖 CSS，JS 部分在总方案B文档中规划。

### 步骤2：摸清现状（为什么能确定重复范围）

- 用 grep 扫描 `Workbench/` 下所有 HTML 的 `<style>` 块，确认 5 个自考学习页面（知识框架/练习测验/背诵卡/复盘总结/真题练习）都有大段内联样式。
- 逐一读取练习测验（430行）、复盘总结（465行）、背诵卡（575行）、知识框架（1560行）的 style 块，找出**跨页面完全一致**的样式：reset、body 基础、渐变标题、卡片、pill、分段按钮、下拉框、进度条、空状态、响应式。
- 同时发现三个关键事实：
  1. 各页面类名完全不同（`.quiz-*`/`.recite-*`/`.ss-review-*`/`.kf-*`/`.zt-*`），无法直接合并；
  2. body 背景各不相同（渐变/径向渐变/纯色），**不能**进公共文件；
  3. 大量硬编码颜色（`#047857`等）未走 CSS 变量。

### 步骤3：定抽离策略（为什么用 `zk-` 前缀追加类）

- **选项A**：抽公共文件 + 统一所有页面类名 → 需改 HTML 结构，风险大、工作量大，违背"最小化过度工程"。
- **选项B**：抽公共文件 + 页面追加 `zk-*` 公共类 + 保留原有类名 → 只加不改，视觉零变化，可逐页推进、逐页验证。
- 选 B。`zk-` 前缀与现有所有类名无冲突，公共文件在前、页面内联在后加载，优先级不降低。

### 步骤4：定执行节奏（为什么一次只改一个页面）

- 用户偏好「一章一章推进，不一下全改」，且 UI 问题曾多次因"猜着改"出问题。所以执行顺序定为：创建公共文件（零风险）→ 练习测验做样板 → 样板确认 → 其余4页逐个推进。
- 每个页面改完必须工作台 iframe 目视 + 交互验证，无回归才动下一页。

### 步骤5：定边界（为什么有些事本期不做）

- 不做 JS：用户明说"先 CSS"。
- 不做主题切换/SASS/类名统一：本期目标是**消除重复**，不是架构升级，控制风险和改动面。
- 不清理硬编码颜色：与"消除重复"无关，留到后续统一变量。

---

## 一、现状：重复样式分布

### 1.1 核心页面样式体量

| 页面 | style 块行数 | 是否引用 base-vars.css | 特有样式占比 |
|---|---|---|---|
| 知识框架.html | ~1560 行 | ✅ | 高（章节精讲、概念卡片、优先级标注） |
| 练习测验.html | ~430 行 | ✅ | 中（选择题、填空、评分、AI助手） |
| 背诵与简答-核心概念背诵卡.html | ~575 行 | ✅ | 中（卡片翻转、掌握度按钮） |
| 复盘总结-章节复盘.html | ~465 行 | ✅ | 中（仪表盘、筛选、错题列表） |
| 真题练习-真题与错题本.html | ~250 行 | ✅ | 中（真题卡片、计时） |

### 1.2 重复出现的公共样式（5页几乎都有）

| 公共样式 | 具体内容 | 出现的页面 |
|---|---|---|
| reset | `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }` | 全部5页 |
| body 基础 | `font-family: var(--font); color: var(--ink); line-height: 1.75; padding: 1.5-2rem 1rem;` | 全部5页（背景各不相同） |
| 页面容器 | `max-width: var(--max); margin: 0 auto;` | 全部5页（类名不同） |
| 渐变标题 | `background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;` | 全部5页（h1） |
| 渐变标题专用变量 | `--green-light / --coral-light / --amber-light / --bg-soft` | 练习测验在 body 定义，其他页可能缺失 |
| 圆角卡片 | `background: var(--bg2); border-radius: 12-16px; box-shadow: 0 2-4px rgba(15,23,42,0.03-0.05);` | 全部5页 |
| pill 标签 | `padding: 2-4px 8px; border-radius: 999px; font-weight: 600;` | 全部5页（subject-tag / recite-tab / ss-review-subject / quiz-badge） |
| 分段式按钮 | `border: 1px solid var(--rule); border-radius: 8-10px; background: var(--bg2);` + `.zk-active` 态 | 全部5页（mode-btn / recite-tab / ss-filter-seg / kf-tab） |
| 筛选下拉框 | `padding: 0.3-0.4rem 0.6-0.8rem; border-radius: 8px; border: 1.5px solid;` | 练习测验、背诵卡、复盘总结 |
| 进度条 | `.track + .fill`（高度5-8px、圆角、渐变填充） | 练习测验、复盘总结、背诵卡 |
| 响应式 | `@media (max-width: 480px)` 内收紧间距 | 全部5页（内容不同但模式相同） |

### 1.3 关键结论

1. **类名完全不同**：`.quiz-*` / `.recite-*` / `.ss-review-*` / `.kf-*` / `.zt-*` 各页面自成体系，无法直接合并，需保留别名。
2. **背景各不相同**：练习测验是 `linear-gradient(135deg,...)`，复盘总结是 `radial-gradient(...)`，背诵卡是 `var(--bg)`——body 背景不能进公共文件。
3. **颜色值硬编码**：页面内大量 `#047857 / #92400e / #991b1b / #7c3aed` 等硬编码，未走 CSS 变量（复盘总结用得多）。

---

## 二、抽离目标结构

```
Workbench/shared/
├── base-vars.css          # 已有：设计变量（不动）
├── css/
│   ├── base.css           # 新建：reset + body基础 + 容器 + 渐变标题 + 滚动条
│   ├── components.css     # 新建：卡片 / pill标签 / 分段按钮 / 下拉框 / 进度条 / 空状态
│   └── theme.css          # 预留：主题切换（方案B第二步，本期不做）
```

页面引用方式：

```html
<link rel="stylesheet" href="../shared/base-vars.css">
<link rel="stylesheet" href="../shared/css/base.css">
<link rel="stylesheet" href="../shared/css/components.css">
<!-- 页面特有样式保留在 <style> 内 -->
```

---

## 三、base.css 内容（所有页面 100% 一致的部分）

```css
/* base.css — 全局基础样式，所有自考学习页面共用 */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }

body {
  font-family: var(--font);
  color: var(--ink);
  line-height: 1.75;
  padding: 1.5rem 1rem;
  min-height: 100vh;
}

/* 渐变标题（5页 h1 完全一致） */
.gradient-title {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 页面容器 */
.zk-container { max-width: var(--max); margin: 0 auto; }
```

### 各页面改动点（仅样式，不动结构）

| 页面 | 删除的内联样式 | 改用的公共类 |
|---|---|---|
| 知识框架.html | 第24-26行 reset、第28-40行 body/容器、第72行附近渐变标题 | `<style>` 开头删 reset/body，标题加 `gradient-title` |
| 练习测验.html | 第16行 reset、第17-22行 body、第30-34行 h1 渐变 | 同上 |
| 背诵卡.html | 第12行 reset、第14-20行 body、第30-37行 h1 渐变 | 同上 |
| 复盘总结.html | 第12行 reset、第14-27行 body/容器、第34-39行 h1 渐变 | 同上 |
| 真题练习.html | 第23行 reset、第28-35行 body/容器、第46行附近渐变 | 同上 |

---

## 四、components.css 内容（组件级，通过选择器分组解决类名差异）

> 思路：组件样式定义在公共文件，页面保留自己的类名。公共文件用「属性选择器 + 通用类」双轨：
> 方式A：页面 HTML 中给元素追加公共类（如 `zk-card`、`zk-pill`），删内联样式。
> 方式B：不改 HTML，公共文件只放「纯重复、无歧义」的规则。

**推荐方式A**（追加公共类，收益最大）：

```css
/* components.css — 公共组件 */

/* 卡片 */
.zk-card {
  background: var(--bg2);
  border: 1px solid rgba(37,99,235,0.10);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(15,23,42,0.03);
}

/* pill 标签 */
.zk-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.72rem;
}

/* 分段式按钮（含选中态） */
.zk-seg {
  padding: 0.35rem 0.9rem;
  border: 1.5px solid var(--rule);
  border-radius: 999px;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.zk-seg:hover { border-color: var(--accent); }
.zk-seg.zk-active {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  border-color: transparent;
  font-weight: 600;
}

/* 筛选下拉框 */
.zk-select {
  padding: 0.3rem 0.6rem;
  border: 1.5px solid;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: opacity 0.15s;
}
.zk-select:hover { opacity: 0.85; }

/* 进度条 */
.zk-track {
  flex: 1; height: 6px;
  background: rgba(37,99,235,0.08);
  border-radius: 999px;
  overflow: hidden;
}
.zk-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--accent), var(--green));
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* 空状态 */
.zk-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--muted);
  font-size: 0.85rem;
}

/* 统一响应式 */
@media (max-width: 480px) {
  body { padding: 1rem 0.75rem; }
  .zk-seg { font-size: 0.72rem; padding: 0.3rem 0.7rem; }
}
```

---

## 五、执行步骤（按页面逐个推进，双跑策略）

> 核心原则：**一次只改一个页面**，改完立即在工作台 iframe 中目视验证，无回归再改下一页。

| 步骤 | 动作 | 验证方式 |
|---|---|---|
| 1 | 创建 `Workbench/shared/css/base.css` + `components.css` | 无页面引用，零风险 |
| 2 | **样板页：练习测验.html** — 加 2 个 link，删 reset/body/渐变标题内联，顶部栏/筛选/卡片元素追加 `zk-*` 类 | 打开工作台 → 练习测验 → 目视 + 交互（筛选/答题/提交） |
| 3 | 样板确认无回归后，按「背诵卡 → 复盘总结 → 知识框架 → 真题练习」顺序推进 | 每页同上验证 |
| 4 | 检查 `--green-light` 等浅色变量：从练习测验 body 提升到 base-vars.css 的 `:root`（若其他页引用则必须提升） | 三色 pill / 答对答错背景正常 |
| 5 | 全文搜索残留重复（`box-sizing: border-box; margin: 0`、`background-clip: text`）确认清零 | grep |
| 6 | 更新版本号 `?v=` + `build.py` | 工作台重新构建验证 |
| 7 | 提交 git（单次提交，含方案文档） | `git add` + commit |

### 每个页面预期的删除行数

| 页面 | 预计删除内联样式 | 预计追加公共类 |
|---|---|---|
| 练习测验.html | ~60 行（reset/body/标题/顶栏/筛选/卡片/进度条/空状态/部分响应式） | ~20 处 |
| 背诵卡.html | ~70 行 | ~18 处 |
| 复盘总结.html | ~55 行 | ~15 处 |
| 知识框架.html | ~45 行（reset/body/标题/容器） | ~10 处（知识框架样式特化度高，抽离较少） |
| 真题练习.html | ~40 行 | ~10 处 |
| **合计** | **~270 行** | **~73 处** |

---

## 六、验收标准

| # | 检查项 | 方法 |
|---|---|---|
| 1 | 5 页全部正常渲染 | 工作台 iframe 逐页目视 |
| 2 | 练习测验筛选/答题/提交/评分无回归 | 实际交互一轮 |
| 3 | 背诵卡翻转/掌握度按钮无回归 | 实际点击 |
| 4 | 复盘总结状态筛选无回归 | 实际点击 |
| 5 | 知识框架章节切换/优先级标注无回归 | 实际点击 |
| 6 | 页面内无残留重复样式 | grep `box-sizing: border-box; margin: 0` 等 |
| 7 | 浅色变量统一 | `--green-light` 等只在 base-vars.css 定义一次 |
| 8 | 视觉无变化 | 改前截图 vs 改后截图对比（重点：间距/圆角/颜色） |

---

## 七、边界与不做的事（本期）

| 不做 | 原因 |
|---|---|
| 不改 JS 抽离 | 本期只做 CSS，JS 留到下一轮（方案B总文档已有规划） |
| 不做主题切换 | theme.css 预留，不实现 |
| 不统一类名 | 各页面类名保留，用追加公共类方式，避免大改 HTML |
| 不引入 SASS | 子页面不走 build.py（保持纯静态），用纯 CSS 文件 + link 引用 |
| 不改 body 背景 | 各页背景不同，保留在页面内联 |
| 不清理硬编码颜色 | 本期只抽结构，硬编码颜色迁移到变量留到后续 |

---

## 八、风险

| 风险 | 缓解 |
|---|---|
| 公共类与页面类样式冲突 | 公共类名用 `zk-` 前缀，不与任何现有类名冲突 |
| 追加公共类后覆盖页面样式 | 页面特有类保留在内联 `<style>`（后加载），优先级不降低 |
| 漏删某页内联样式导致重复定义 | 每页改完 grep 验证，验收清单第6项兜底 |
| 样板页未确认就推进 | 严格按步骤2→3，样板未确认不动下一页 |
