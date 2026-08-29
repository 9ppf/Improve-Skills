# 跨页面 CSS 重复样式重构步骤清单

> 基于 8 个已抽离 CSS 文件的扫描分析，共发现 17 类重复模式，合计 300+ 次硬编码。
> 本清单按「低风险 → 高风险」分三阶段，每步可独立执行、独立验证、独立提交。

---

## 阶段一：提取 CSS 变量（零风险，不改类名不改 HTML）

### 步骤 1：在 base-vars.css 新增 7 个共享变量

**文件**：`styles/shared/base-vars.css`

**在 `:root {}` 末尾新增**：

```css
  /* —— 渐变 —— */
  --grad-135: linear-gradient(135deg, var(--accent), var(--accent2));
  --grad-90: linear-gradient(90deg, var(--accent), var(--accent2));

  /* —— 阴影 —— */
  --shadow-card: 0 2px 6px rgba(0, 0, 0, 0.05);
  --shadow-hover-md: 0 6px 18px rgba(15, 23, 42, 0.06);
  --shadow-hover-lg: 0 8px 24px rgba(15, 23, 42, 0.08);

  /* —— 卡片半透底色 —— */
  --card-bg: rgba(255, 255, 255, 0.6);

  /* —— 过渡 —— */
  --transition-base: all 0.2s ease;
```

**验证**：浏览器打开任一页面，视觉无变化。

---

### 步骤 2：全局替换渐变 135°（35 处，8 个文件）

**涉及文件**（按数量排序）：
| 文件 | 次数 |
|---|---|
| 背诵与简答.css | 8 |
| 复盘总结.css | 7 |
| 练习测验.css | 6 |
| 能力提升驾驶舱.css | 6 |
| 知识框架.css | 5 |
| 学习路线图.css | 1 |
| base.css | 1 |
| components.css | 1 |

**操作**：在每个文件中，将
```css
background: linear-gradient(135deg, var(--accent), var(--accent2));
```
替换为
```css
background: var(--grad-135);
```

**注意**：base.css 的 `.gradient-title` 和 components.css 的 `.zk-seg.zk-active` 也要替换。

**验证**：浏览器打开各页面，渐变按钮/标题/数字圆视觉不变。

---

### 步骤 3：全局替换渐变 90°（16 处，8 个文件）

**涉及文件**：
| 文件 | 次数 |
|---|---|
| 能力提升驾驶舱.css | 8 |
| 知识框架.css | 2 |
| components.css | 1 |
| 今日学习流.css | 1 |
| 复盘总结.css | 1 |
| 学习路线图.css | 1 |
| 练习测验.css | 1 |
| 背诵与简答.css | 1 |

**操作**：将
```css
background: linear-gradient(90deg, var(--accent), var(--accent2));
```
替换为
```css
background: var(--grad-90);
```

**注意**：components.css 的 `.zk-fill` 用的是 `var(--accent), var(--green)` 而非 `var(--accent2)`，不要替换。只替换 `accent → accent2` 的渐变。

**验证**：进度条/渐变标题视觉不变。

---

### 步骤 4：替换卡片阴影（8 处，2 个文件）

**涉及文件**：
| 文件 | 次数 |
|---|---|
| 知识框架.css | 7 |
| 练习测验.css | 1 |

**操作**：将
```css
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
```
替换为
```css
box-shadow: var(--shadow-card);
```

---

### 步骤 5：替换 hover 阴影（9 处，3 个文件）

**涉及文件**：
| 文件 | 次数 | 阴影值 |
|---|---|---|
| 能力提升驾驶舱.css | 3 | `0 6px 18px rgba(15,23,42,0.06)` |
| 学习路线图.css | 2 | `0 8px 24px rgba(15,23,42,0.08)` |
| 复盘总结.css | 1 | `0 8px 24px rgba(15,23,42,0.08)` |

**操作**：
- `0 6px 18px rgba(15,23,42,0.06)` → `var(--shadow-hover-md)`
- `0 8px 24px rgba(15,23,42,0.08)` → `var(--shadow-hover-lg)`

---

### 步骤 6：替换卡片半透底色（4 处，2 个文件）

**涉及文件**：
| 文件 | 次数 |
|---|---|
| 学习路线图.css | 2（已用 --card-bg，删除 body 里的 --card-bg 定义） |
| 能力提升驾驶舱.css | 2 |

**操作**：
- 能力提升驾驶舱.css：将 `rgba(255, 255, 255, 0.6)` 替换为 `var(--card-bg)`
- 学习路线图.css：删除 body 里的 `--card-bg: rgba(255, 255, 255, 0.6);` 定义（已在 base-vars.css 全局定义）

---

### 步骤 7：替换 transition（25 处，8 个文件）

**操作**：将
```css
transition: all 0.2s ease;
```
替换为
```css
transition: var(--transition-base);
```

**注意**：部分文件用了 `transition: all 0.2s`（不带 ease）或 `transition: all 0.15s`，这些值不同，不替换，仅替换完全匹配 `all 0.2s ease` 的。

---

### 阶段一验收检查

- [ ] base-vars.css 新增 7 个变量
- [ ] 8 个页面 CSS 文件中无 `linear-gradient(135deg, var(--accent)` 硬编码
- [ ] 8 个页面 CSS 文件中无 `linear-gradient(90deg, var(--accent)` 硬编码（components.css .zk-fill 除外）
- [ ] 2 个文件中无 `0 2px 6px rgba(0,0,0,0.05)` 硬编码
- [ ] 3 个文件中无 hover 阴影硬编码
- [ ] 能力提升驾驶舱.css 中无 `rgba(255,255,255,0.6)` 硬编码
- [ ] 8 个文件中无 `transition: all 0.2s ease` 硬编码
- [ ] 浏览器逐页打开，视觉无变化

---

## 阶段二：提取共享组件类（中风险，需改 HTML 类名）

### 步骤 8：在 components.css 新增卡片基类变体

**文件**：`styles/shared/components.css`

**新增**：
```css
/* 卡片变体 —— 颜色左边框 */
.zk-card-accent { border-left: 4px solid var(--accent); }
.zk-card-accent2 { border-left: 4px solid var(--accent2); }
.zk-card-green { border-left: 4px solid var(--green); }
.zk-card-orange { border-left: 4px solid var(--orange); }
.zk-card-amber { border-left: 4px solid #d97706; }
.zk-card-red { border-left: 4px solid #ef4444; }

/* 卡片变体 —— 可自定义左边框颜色 */
.zk-card-bar { border-left: 4px solid var(--bar-color, var(--accent)); }
```

**目的**：统一知识框架.css 里 20 处 `border-left: 4px solid <color>` 和学习路线图/练习测验各 1 处。

---

### 步骤 9：在 components.css 新增 pill 标签颜色变体

**文件**：`styles/shared/components.css`

**新增**（扩展现有 `.zk-pill`）：
```css
/* pill 颜色变体 */
.zk-pill-blue { background: rgba(37,99,235,0.10); color: #3b82f6; }
.zk-pill-red { background: rgba(239,68,68,0.10); color: #dc2626; }
.zk-pill-amber { background: rgba(245,158,11,0.10); color: #d97706; }
.zk-pill-green { background: rgba(16,185,129,0.10); color: #059669; }
.zk-pill-purple { background: rgba(139,92,246,0.10); color: #7c3aed; }
.zk-pill-gray { background: #f3f4f6; color: var(--muted); }
```

**目的**：统一 41 处 `border-radius: 999px` 的标签写法。页面里 `.tag-core`/`.tag-key`/`.kf-pill`/`.ch-tag` 等可改为 `.zk-pill .zk-pill-red` 等。

---

### 步骤 10：在 components.css 新增渐变按钮类

**文件**：`styles/shared/components.css`

**新增**：
```css
/* 渐变按钮/圆 */
.zk-grad {
  background: var(--grad-135);
  color: #fff;
}
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
.zk-grad-circle {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-135);
  color: #fff;
  font-weight: 700;
}
```

**目的**：统一 35 处渐变按钮/数字圆的写法。

---

### 步骤 11：在 components.css 新增左竖条标题 mixin 类

**文件**：`styles/shared/components.css`

**新增**：
```css
/* h2 左竖条 */
.zk-h2-bar {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--ink);
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
```

**目的**：统一学习路线图/知识框架/练习测验的 `section h2::before` 模式。

---

### 步骤 12：逐页面替换 HTML 类名并删除页面 CSS 重复定义

**按以下顺序逐页面处理**（每改一个页面验证一次、提交一次）：

| 序号 | 页面 | HTML 改动 | CSS 删除 |
|---|---|---|---|
| 12a | 学习路线图 | `.method-num` → `.zk-grad-circle`；`section h2` → `.zk-h2-bar` | 删除 .method-num / section h2::before |
| 12b | 练习测验 | 渐变按钮 → `.zk-grad-btn`；pill 标签 → `.zk-pill`+变体 | 删除对应重复定义 |
| 12c | 背诵与简答 | 渐变按钮 → `.zk-grad-btn`；pill 标签 → `.zk-pill`+变体 | 删除对应重复定义 |
| 12d | 复盘总结 | 渐变按钮 → `.zk-grad-btn`；pill 标签 → `.zk-pill`+变体；卡片 → `.zk-card`+变体 | 删除对应重复定义 |
| 12e | 能力提升驾驶舱 | 渐变 → `.zk-grad`；pill → `.zk-pill`+变体 | 删除对应重复定义 |
| 12f | 今日学习流 | pill → `.zk-pill`+变体 | 删除对应重复定义 |
| 12g | 知识框架 | 最多改动：20处左竖条 → `.zk-card-bar`；pill → `.zk-pill`+变体；5档颜色 → 见步骤13 | 分批删除，每删一批验证 |

**每个子步骤验收**：
- [ ] 浏览器打开该页面，视觉无变化
- [ ] 页面 CSS 文件行数减少
- [ ] 无 console 报错

---

### 阶段二验收检查

- [ ] components.css 新增 4 组共享类（卡片变体/pill变体/渐变按钮/h2竖条）
- [ ] 7 个页面 HTML 已替换为共享类名
- [ ] 7 个页面 CSS 文件中重复定义已删除
- [ ] 浏览器逐页打开，视觉无变化
- [ ] 各页面 CSS 文件行数明显减少

---

## 阶段三：5 档颜色体系 + SASS 化（高风险）

### 步骤 13：提取 5 档掌握度颜色为 CSS 变量

**文件**：`styles/shared/base-vars.css`

**新增**：
```css
  /* —— 5 档掌握度 —— */
  --mastery-0: #94a3b8;  /* 灰：未开始 */
  --mastery-1: #3b82f6;  /* 蓝：学习中 */
  --mastery-2: #ef4444;  /* 红：薄弱 */
  --mastery-3: #f59e0b;  /* 橙：待复习 */
  --mastery-4: #10b981;  /* 绿：已掌握 */
```

**操作**：在知识框架.css 和能力提升驾驶舱.css 中，将 62 处硬编码的 5 档颜色替换为变量：
- `#94a3b8` → `var(--mastery-0)`
- `#3b82f6` → `var(--mastery-1)`
- `#ef4444` → `var(--mastery-2)`
- `#f59e0b` → `var(--mastery-3)`
- `#10b981` → `var(--mastery-4)`

**验证**：浏览器打开知识框架页面，5 档颜色不变。

---

### 步骤 14：提取优先级标签颜色为变量

**文件**：`styles/shared/base-vars.css`

**新增**：
```css
  /* —— 优先级标签 —— */
  --pri-key: #dc2626;     /* 红：重点 */
  --pri-normal: #d97706;  /* 橙：一般 */
  --pri-survey: #64748b;  /* 灰：了解 */
```

**操作**：在知识框架.css 中，将约 20 处优先级颜色替换为变量。

---

### 步骤 15：搭建 SASS 编译流水线

**前置条件**：阶段一、二、三(步骤13-14)全部完成并验收通过。

**操作**：
1. 安装 dart-sass：`npm install -g sass`
2. 将 `styles/shared/` 下的 .css 转为 .scss（`_variables.scss` / `_base.scss` / `_components.scss`）
3. 各页面 CSS 文件转为 .scss，`@use` 共享文件
4. 在 build.py 中集成 SASS 编译：`.scss` → `.css` 输出到对应目录
5. 验证编译产物与原 CSS 一致

---

### 步骤 16：用 SASS 特性重构 5 档颜色体系

**文件**：`styles/shared/_variables.scss`

```scss
$mastery-levels: (
  0: #94a3b8,
  1: #3b82f6,
  2: #ef4444,
  3: #f59e0b,
  4: #10b981,
);
```

**文件**：`styles/shared/_components.scss`

```scss
@mixin mastery-variants($prefix, $properties...) {
  @each $level, $color in $mastery-levels {
    .#{$prefix}-#{$level} {
      background: rgba($color, 0.10);
      color: $color;
    }
    .#{$prefix}-#{$level} .#{$prefix}-dot {
      background: $color;
    }
  }
}

// 一行生成全部 5 档 × 4 套变体
@include mastery-variants("ss-stat");
@include mastery-variants("toc-dot");
// ...
```

**效果**：60 行手写 → 10 行 SASS。

---

### 步骤 17：用 SASS mixin 重构卡片/按钮/标签

**文件**：`styles/shared/_mixins.scss`

```scss
@mixin card($radius: 10px) {
  background: var(--bg2);
  border: 1px solid var(--rule);
  border-radius: $radius;
  box-shadow: var(--shadow-card);
  padding: 0.8rem;
  margin-bottom: 0.6rem;
}

@mixin grad-btn {
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
```

**各页面 .scss 引用**：
```scss
.kf-card { @include card; }
.lg-quiz-btn { @include grad-btn; }
```

---

### 阶段三验收检查

- [ ] base-vars.css 新增 5 档掌握度 + 优先级共 8 个变量
- [ ] 知识框架/能力提升驾驶舱中 62 处 5 档颜色已替换为变量
- [ ] 知识框架中优先级颜色已替换为变量
- [ ] SASS 编译流水线搭建完成，build.py 集成
- [ ] 编译产物与原 CSS 视觉一致
- [ ] 5 档颜色用 map + @each 生成，手写行数大幅减少
- [ ] 卡片/按钮/标签用 mixin 重构

---

## 执行节奏建议

| 阶段 | 步骤 | 预估时间 | 风险 | 提交策略 |
|---|---|---|---|---|
| 一 | 步骤 1-7 | 1.5 小时 | 零 | 一次性提交 |
| 二 | 步骤 8-11 | 1 小时 | 低 | 一次提交（components.css 新增） |
| 二 | 步骤 12a-12g | 3-4 小时 | 中 | 每个页面单独提交 |
| 三 | 步骤 13-14 | 1 小时 | 低 | 一次提交 |
| 三 | 步骤 15-17 | 4-6 小时 | 高 | 分步提交（流水线→颜色体系→mixin） |

**总计**：约 11-13 小时，可分 5-7 次工作完成。

---

## 回滚方案

- 阶段一：恢复 base-vars.css 即可，页面 CSS 的 `var(--xxx)` 引用会 fallback 到原值（需保留 fallback）
- 阶段二：恢复 HTML 类名 + 页面 CSS 定义
- 阶段三：保留编译后的 .css 产物，删除 .scss 源文件即可回滚
