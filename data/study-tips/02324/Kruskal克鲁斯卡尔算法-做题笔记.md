---
id: tip-kruskal-02324
title: Kruskal（克鲁斯卡尔）算法·做题笔记
category: 做题技巧
chapter: 图论
importance: 5
mastery: unknown
tags: [最小生成树, Kruskal, Prim, 图论, 选边过程]
source: 自制 HTML 笔记（原版内嵌 6 张图）
summary: 一道例题吃透 Kruskal：列选边过程、画最小生成树、求权 W，再提炼四步流程、切分定理推导与 8 条易错点
---

# Kruskal（克鲁斯卡尔）算法 · 做题笔记

> 知识点：最小生成树 Minimum Spanning Tree ｜ 适用题型：列出选边过程 + 画最小生成树 + 求权
> 配套例题：带权图「题 31 图」（5 顶点 7 边）｜ 全文含 6 张图 ｜ 编排顺序：先见例题 → 再归纳步骤 → 最后追原理

本页为原版 HTML 笔记（保留完整配色、表格与 6 张示意图），可直接在下方滚动阅读。

<iframe src="/data/study-tips/02324/kruskal-note.html" style="width:100%;height:1400px;border:0;display:block;border-radius:8px;background:#fff"></iframe>

如果内嵌区域显示不全，可 <a href="/data/study-tips/02324/kruskal-note.html" target="_blank">在新标签页打开原版全文</a>。

## 一句话记忆

- 口诀 1（三步流程）：枚举边 → 按权排队 → 从头扫；不同分量就收，同分量就扔，收满 n−1 就停。
- 口诀 2（判断核心）：排序定顺序，分量定取舍，n−1 定终点；分量只看已选边，同团即成环。
- 口诀 3（性质与辨析）：每选一边，分量减一；环上最贵必被弃，切口最便宜必入选。树只管"能到"，不管"近不近"。
