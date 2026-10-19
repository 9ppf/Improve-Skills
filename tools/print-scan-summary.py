# -*- coding: utf-8 -*-
"""打印扫描报告统计汇总"""
import json
from collections import Counter

with open('tools/question-type-scan-report.json', 'r', encoding='utf-8') as f:
    report = json.load(f)

type_map = {
    'choice': '选择', 'fill': '填空',
    'shortAnswer': '简答', 'calculate': '计算',
    'essay': '论述', 'proof': '证明'
}

print('=' * 60)
print('题库题型扫描 — 统计汇总')
print('=' * 60)

total = sum(s['total'] for sub in report['stats'].values() for s in sub.values())
changed = sum(s['changed'] for sub in report['stats'].values() for s in sub.values())
print(f'\n总题目数: {total}')
print(f'疑似标错: {changed} 题 ({changed*100//max(total,1)}%)')

print('\n--- 按科目 ---')
for sub, banks in report['stats'].items():
    sub_total = sum(b['total'] for b in banks.values())
    sub_changed = sum(b['changed'] for b in banks.values())
    pct = sub_changed * 100 // max(sub_total, 1)
    print(f'  {sub}: {sub_changed}/{sub_total} ({pct}%)')

print('\n--- 按题库 ---')
bank_map = {}
for sub, banks in report['stats'].items():
    for bank, st in banks.items():
        if bank not in bank_map:
            bank_map[bank] = {'total': 0, 'changed': 0}
        bank_map[bank]['total'] += st['total']
        bank_map[bank]['changed'] += st['changed']

for bank, st in bank_map.items():
    pct = st['changed'] * 100 // max(st['total'], 1)
    print(f'  {bank}: {st["changed"]}/{st["total"]} ({pct}%)')

print('\n--- 按修正方向 ---')
direction = Counter()
for item in report['items']:
    cur = type_map.get(item['current_type'], item['current_type'])
    sug = type_map.get(item['suggested_type'], item['suggested_type'])
    direction[f'{cur} → {sug}'] += 1

for k, v in sorted(direction.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v} 题')

print('\n--- 按置信度 ---')
conf = Counter(item['confidence'] for item in report['items'])
for c, mark in [('high', '🔴 高'), ('medium', '🟡 中'), ('low', '🟢 低')]:
    print(f'  {mark}: {conf.get(c, 0)} 题')

print('\n' + '=' * 60)
print('详细清单见控制台完整输出 或 tools/question-type-scan-report.json')
print('=' * 60)
