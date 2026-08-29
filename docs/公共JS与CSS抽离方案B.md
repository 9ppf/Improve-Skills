# 公共 JS 与 CSS 抽离方案 B：构建化改造

> 生成时间：2026-08-26
> 状态：方案已确认，待执行
> 优先级：BACKLOG_TODO 中优先级第 1-2 位

---

## 一、核心思路

子页面接入 `build.py` 构建流程，SASS 编译出 CSS，JS 合并打包。页面 HTML 保持不变，只是引用编译后的产物。

---

## 二、目录结构

```
styles/
├── _variables.scss        # SASS 变量（主题色、间距、圆角）
├── _mixins.scss           # 混入（按钮、卡片、flex布局等）
├── _components.scss       # 公共组件样式
├── themes/
│   ├── _light.scss        # 亮色主题变量
│   └── _dark.scss         # 暗色主题变量
├── kf-framework.scss      # 知识框架页专用
├── quiz.scss              # 练习测验页专用
└── ...

js-src/
├── utils/
│   ├── api.js             # API 请求封装（apiUrl/fetch/postData）
│   ├── dom.js             # DOM 工具（esc/qs/createEl/debounce）
│   └── storage.js         # localStorage 封装
├── ai/
│   └── chat-sdk.js        # AI对话SDK（SSE + Markdown渲染）
├── ui/
│   └── symbol-panel.js    # 特殊符号面板
└── pages/
    ├── knowledge-framework.js
    ├── quiz.js
    └── ...

Workbench/shared/
├── css/                   # build.py 编译输出
│   ├── base.css           # 公共样式（编译自 _components.scss）
│   ├── theme-light.css    # 亮色主题
│   ├── theme-dark.css     # 暗色主题
│   └── kf-framework.css   # 页面专用
└── js/                    # build.py 合并输出
    ├── utils.js           # 公共工具函数
    ├── ai-chat.js          # AI对话SDK
    ├── symbol-panel.js    # 特殊符号面板
    └── data-access.js     # 统一数据访问层
```

---

## 三、CSS 主题系统

### SASS 变量 + CSS 变量双层方案

```scss
// _variables.scss - SASS 编译时确定
$primary: #2563eb;
$radius: 8px;
$spacing: 16px;

// 编译后输出 CSS 变量供运行时切换
:root {
  --bg: #f8fafc;
  --ink: #1e293b;
  --primary: #{$primary};
  --radius: #{$radius};
}

[data-theme="dark"] {
  --bg: #0f172a;
  --ink: #e2e8f0;
}
```

### 主题切换实现

```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark');
// 读取偏好
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
```

### 页面引用

```html
<!-- 公共样式 -->
<link rel="stylesheet" href="shared/css/base.css">
<!-- 主题 -->
<link rel="stylesheet" href="shared/css/theme-light.css" id="theme-style">
<!-- 页面专用 -->
<link rel="stylesheet" href="shared/css/kf-framework.css">
```

---

## 四、JS 公共模块

### 4.1 重复函数清单（13个，需抽离）

| 函数 | 出现页数 | 漂移情况 |
|---|---|---|
| `apiUrl` | 4页 | 知识框架还是旧版（file协议检查），其他3页是新版 |
| `esc` | 3页 | 知识框架/复盘总结转义4个字符，练习测验只转义3个 |
| `transformKfToCards` | 2页 | 背诵卡版本有 exImage、mastery，练习测验版本没有 |
| `setMastery` | 2页 | 知识框架操作章节掌握度，背诵卡操作卡片掌握度 |
| `renderChapters` | 2页 | 知识框架1685字符，复盘总结2567字符 |
| `switchSubject` | 3页 | 每个页面各写各的 |
| `saveData` | 3页 | 每个页面各写各的 |
| `loadData` | 3页 | 每个页面各写各的 |
| `formatDate` | 2页 | 日期格式化 |
| `debounce` | 2页 | 防抖函数 |
| `qs` / `qsa` | 3页 | querySelector 简写 |
| `copyToClipboard` | 2页 | 复制到剪贴板 |
| `getSubjectFromUrl` | 3页 | 从URL参数获取科目 |

### 4.2 AI 对话 SDK（14+页面重复）

统一封装为一个模块：

```javascript
// ai/chat-sdk.js
const AIChat = {
  // 发起SSE流式对话
  async stream(prompt, onChunk, onDone) { ... },
  // Markdown渲染
  renderMarkdown(text) { ... },
  // 对话历史管理（只保留最近20条）
  history: { save, load, clear },
  // 持久化
  persist: { save, load }
};
```

### 4.3 数据访问层

统一 API + localStorage 双写：

```javascript
// utils/data-access.js
const DataAccess = {
  // 读取（优先API，降级localStorage）
  async get(key) { ... },
  // 写入（API + localStorage双写）
  async set(key, value) { ... },
  // 批量读取
  async batchGet(keys) { ... }
};
```

### 4.4 特殊符号面板

```javascript
// ui/symbol-panel.js
const SymbolPanel = {
  // 初始化面板
  init(textareaSelector) { ... },
  // 插入符号
  insert(symbol) { ... },
  // 在光标位置插入
  insertAtCursor(textarea, text) { ... }
};
```

---

## 五、build.py 扩展

### 新增构建步骤

```python
def build_shared_assets():
    """编译公共样式和JS"""
    # 1. SASS → CSS
    compile_sass('styles/_components.scss', 'Workbench/shared/css/base.css')
    compile_sass('styles/themes/_light.scss', 'Workbench/shared/css/theme-light.css')
    compile_sass('styles/themes/_dark.scss', 'Workbench/shared/css/theme-dark.css')
    
    # 2. 页面专用样式
    for page_scss in glob('styles/pages/*.scss'):
        out = f'Workbench/shared/css/{basename_without_ext}.css'
        compile_sass(page_scss, out)
    
    # 3. JS 合并
    concat_js('js-src/utils/*.js', 'Workbench/shared/js/utils.js')
    concat_js('js-src/ai/*.js', 'Workbench/shared/js/ai-chat.js')
    concat_js('js-src/ui/*.js', 'Workbench/shared/js/symbol-panel.js')
```

### 构建顺序

```
1. 清理旧产物
2. 编译 SASS → CSS
3. 合并 JS
4. 注入页面（现有逻辑）
5. 校验
```

---

## 六、迁移策略

### 分阶段执行（降低风险）

| 阶段 | 内容 | 影响 |
|---|---|---|
| 第1步 | 创建 styles/ 和 js-src/ 目录结构 | 无影响 |
| 第2步 | 抽离 CSS 公共样式到 _components.scss | 先不删页面内样式，双跑 |
| 第3步 | 抽离 JS 公共函数到 utils.js | 先不删页面内函数，双跑 |
| 第4步 | 抽离 AI 对话 SDK | 逐页迁移 |
| 第5步 | 删除页面内重复代码 | 逐页删除，逐页验证 |
| 第6步 | 接入 build.py 自动构建 | 自动化 |

### 双跑策略

迁移期间，页面同时引用公共文件和保留内联代码，确保功能不中断。确认公共文件生效后再删除内联代码。

---

## 七、预期收益

| 指标 | 现状 | 改造后 |
|---|---|---|
| 公共 JS 文件 | 0 个 | 4-5 个 |
| 公共 CSS 文件 | 1 个（base-vars.css） | 5-6 个（含主题） |
| 重复函数 | 13 个 × 2-4 页 | 0（统一引用） |
| AI 对话实现 | 14+ 套 | 1 套 |
| 主题切换 | 不支持 | 运行时切换 |
| 改一个 bug 要改几处 | 2-4 处 | 1 处 |

---

## 八、风险与注意事项

| 风险 | 缓解措施 |
|---|---|
| 删除内联代码后页面白屏 | 双跑策略，先引用后删除 |
| SASS 编译报错 | build.py 已有 libsass，扩展即可 |
| 主题切换闪烁 | CSS 变量 + transition: background-color 0.3s |
| JS 加载顺序 | 公共 JS 放 `<head>` 或 `defer`，页面 JS 放 `</body>` 前 |
| 缓存问题 | 文件名加版本号 hash 或 ?v= 参数 |
