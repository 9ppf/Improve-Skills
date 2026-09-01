# JS 代码重构报告

## 一、目录结构调整

所有 JS 文件已统一迁移到项目根目录的 `js/` 文件夹（与 `styles/` 同级），按模块组织：

```
js/
├── shared/              # 公共共享 JS
│   ├── utils.js         # 通用工具函数
│   └── theme-sync.js    # 主题同步
├── 主工作台/
│   └── workbench.js     # 此刻便是春天主工作台
├── AI学习/
├── Python基础/
├── 今日学习/
├── 番茄钟/
├── 能力提升/
└── 自考学习/
    ├── 英语（二）/
    └── 高等数学（工本）/
```

## 二、重复代码分析

共扫描 28 个 JS 文件，发现 281 个函数定义，其中 26 个函数重复。

### 重复函数清单

- **`aiCall()`** — 出现在 2 个文件中：
  - today-flow.js
  - 能力提升-学习驾驶舱.js

- **`apiPost()`** — 出现在 2 个文件中：
  - 能力提升-学习驾驶舱.js
  - 背诵与简答.js

- **`apiUrl()`** — 出现在 4 个文件中：
  - today-flow.js
  - 能力提升-学习驾驶舱.js
  - 练习测验.js
  - 背诵与简答.js

- **`escapeHtml()`** — 出现在 4 个文件中：
  - ai-news-digest.js
  - today-flow.js
  - 番茄钟-计时器.js
  - 能力提升-学习驾驶舱.js

- **`hasContentUrl()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`init()`** — 出现在 2 个文件中：
  - 番茄钟-计时器.js
  - 练习测验.js

- **`isReadingItem()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`loadData()`** — 出现在 3 个文件中：
  - ai-news-digest.js
  - 真题练习.js
  - 背诵与简答.js

- **`render()`** — 出现在 2 个文件中：
  - ai-news-digest.js
  - 练习测验.js

- **`renderAll()`** — 出现在 2 个文件中：
  - 真题练习.js
  - 背诵与简答.js

- **`renderCard()`** — 出现在 3 个文件中：
  - reading.js
  - 此刻便是春天.js
  - 练习测验.js

- **`renderCards()`** — 出现在 2 个文件中：
  - 能力提升-学习驾驶舱.js
  - 背诵与简答.js

- **`renderContentFrame()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderEssay()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderReadingContent()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderReadingFromJson()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderSection()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderSources()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`renderStats()`** — 出现在 3 个文件中：
  - ai-news-digest.js
  - 真题练习.js
  - 背诵与简答.js

- **`renderTopic()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`saveData()`** — 出现在 2 个文件中：
  - 真题练习.js
  - 背诵与简答.js

- **`switchSubject()`** — 出现在 2 个文件中：
  - 真题练习.js
  - 背诵与简答.js

- **`toggleReadingSection()`** — 出现在 2 个文件中：
  - reading.js
  - 此刻便是春天.js

- **`transformKfToCards()`** — 出现在 3 个文件中：
  - today-flow.js
  - 练习测验.js
  - 背诵与简答.js

- **`updateGuideFlow()`** — 出现在 2 个文件中：
  - 练习测验.js
  - 背诵与简答.js

- **`updateMastery()`** — 出现在 2 个文件中：
  - today-flow.js
  - 练习测验.js

## 三、建议提取的公共函数

以下重复度高的函数建议提取到 `js/shared/` 下的公共模块中：

- `escapeHtml()` — 4 个文件重复
- `apiUrl()` — 4 个文件重复
- `renderCard()` — 3 个文件重复
- `loadData()` — 3 个文件重复
- `renderStats()` — 3 个文件重复
- `transformKfToCards()` — 3 个文件重复
- `renderEssay()` — 2 个文件重复
- `renderContentFrame()` — 2 个文件重复
- `isReadingItem()` — 2 个文件重复
- `renderReadingFromJson()` — 2 个文件重复
- `renderReadingContent()` — 2 个文件重复
- `renderSources()` — 2 个文件重复
- `toggleReadingSection()` — 2 个文件重复
- `renderSection()` — 2 个文件重复
- `hasContentUrl()` — 2 个文件重复
- `renderTopic()` — 2 个文件重复
- `render()` — 2 个文件重复
- `aiCall()` — 2 个文件重复
- `updateMastery()` — 2 个文件重复
- `init()` — 2 个文件重复
- `apiPost()` — 2 个文件重复
- `renderCards()` — 2 个文件重复
- `renderAll()` — 2 个文件重复
- `saveData()` — 2 个文件重复
- `switchSubject()` — 2 个文件重复
- `updateGuideFlow()` — 2 个文件重复

## 四、迁移文件清单

| 原位置 | 新位置 |
|--------|--------|
| Workbench/ai-learning/ai-code-review.js | js/AI学习/ai-code-review.js |
| Workbench/ai-learning/ai-demos.js | js/AI学习/ai-demos.js |
| Workbench/ai-learning/ai-knowledge-tree.js | js/AI学习/ai-knowledge-tree.js |
| Workbench/ai-learning/ai-news-digest.js | js/AI学习/ai-news-digest.js |
| Workbench/ai-learning/ai-roles-hub.js | js/AI学习/ai-roles-hub.js |
| Workbench/ai-learning/job-learning-loop.js | js/AI学习/job-learning-loop.js |
| Workbench/ai-learning/job-skill-tree.js | js/AI学习/job-skill-tree.js |
| Workbench/Python基础/python-demos.js | js/Python基础/python-demos.js |
| Workbench/Python基础/python-knowledge-tree.js | js/Python基础/python-knowledge-tree.js |
| Workbench/Python基础/python-learning-loop.js | js/Python基础/python-learning-loop.js |
| styles/shared/reading.js | js/shared/reading.js |
| styles/shared/theme-sync.js | js/shared/theme-sync.js |
| styles/shared/utils.js | js/shared/utils.js |
| Workbench/此刻便是春天.js | js/主工作台/此刻便是春天.js |
| Workbench/今日学习/today-flow.js | js/今日学习/today-flow.js |
| Workbench/番茄钟/番茄钟-计时器.js | js/番茄钟/番茄钟-计时器.js |
| Workbench/能力提升/full-learning-roadmap.js | js/能力提升/full-learning-roadmap.js |
| Workbench/能力提升/能力提升-学习驾驶舱.js | js/能力提升/能力提升-学习驾驶舱.js |
| Workbench/自考学习/复盘总结-章节复盘.js | js/自考学习/复盘总结-章节复盘.js |
| Workbench/自考学习/真题练习.js | js/自考学习/真题练习.js |
| Workbench/自考学习/知识框架.js | js/自考学习/知识框架.js |
| Workbench/自考学习/练习测验.js | js/自考学习/练习测验.js |
| Workbench/自考学习/背诵与简答.js | js/自考学习/背诵与简答.js |
| Workbench/自考学习/未考科目/00015英语（二）/英语（二）-作文模板.js | js/自考学习/英语（二）/英语（二）-作文模板.js |
| Workbench/自考学习/未考科目/00015英语（二）/英语（二）-真题模拟.js | js/自考学习/英语（二）/英语（二）-真题模拟.js |
| Workbench/自考学习/未考科目/00015英语（二）/英语（二）-词汇系统.js | js/自考学习/英语（二）/英语（二）-词汇系统.js |
| Workbench/自考学习/未考科目/00015英语（二）/英语（二）-题型专项.js | js/自考学习/英语（二）/英语（二）-题型专项.js |
| Workbench/自考学习/未考科目/00023高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.js | js/自考学习/高等数学（工本）/00023高等数学（工本）-知识框架与学习计划.js |