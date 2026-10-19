# -*- coding: utf-8 -*-
"""打印真题部分的待修正清单"""
import json

with open('tools/question-type-scan-report.json', 'r', encoding='utf-8') as f:
    report = json.load(f)

type_map = {
    'choice': '选择', 'fill': '填空',
    'shortAnswer': '简答', 'calculate': '计算',
    'essay': '论述', 'proof': '证明'
}

subject_names = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
}

# 筛选真题部分
exam_items = [item for item in report['items'] if item['bank'] == '真题']

print('=' * 70)
print(f'真题题库待修正清单（共 {len(exam_items)} 题）')
print('=' * 70)

# 按科目分组
by_subject = {}
for item in exam_items:
    sub = item['subject']
    if sub not in by_subject:
        by_subject[sub] = []
    by_subject[sub].append(item)

for sub, items in by_subject.items():
    name = subject_names.get(sub, sub)
    print(f'\n【{name}】（{len(items)} 题）')
    
    # 按置信度排序
    items_sorted = sorted(items, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x['confidence']])
    
    for item in items_sorted:
        conf_mark = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}[item['confidence']]
        cur = type_map.get(item['current_type'], item['current_type'])
        sug = type_map.get(item['suggested_type'], item['suggested_type'])
        
        extra = ''
        if item.get('year'):
            extra += f' [{item["year"]}]'
        if item.get('chapter'):
            extra += f' [{item["chapter"]}]'
        
        print(f'  {conf_mark} [{item["id"]}] {cur} → {sug}{extra}')
        print(f'      {item["question"]}...')

print()
print('=' * 70)
print('图例：🔴 高置信度  🟡 中置信度  🟢 低置信度')
print('=' * 70)

# 统计
print(f'\n修正方向统计：')
from collections import Counter
direction = Counter()
for item in exam_items:
    cur = type_map.get(item['current_type'], item['current_type'])
    sug = type_map.get(item['suggested_type'], item['suggested_type'])
    direction[f'{cur} → {sug}'] += 1
for k, v in sorted(direction.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v} 题')

print(f'\n置信度统计：')
conf = Counter(item['confidence'] for item in exam_items)
for c, mark in [('high', '🔴 高'), ('medium', '🟡 中'), ('low', '🟢 低')]:
    print(f'  {mark}: {conf.get(c, 0)} 题')
