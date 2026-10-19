# -*- coding: utf-8 -*-
"""检查真题题库中题型分类是否合理"""
import json

with open('data/exam-data-13015.json', 'r', encoding='utf-8') as f:
    exam = json.load(f)

qs = exam.get('questions', [])

# 看看被标记为计算题的2道题
print('=== 被标记为计算题的题目 ===')
for q in qs:
    if q.get('type') == 'calculate':
        print(f"  [{q['id']}] {q['question'][:80]}")
        ans = q.get('answer', '')
        if isinstance(ans, dict):
            print(f"    答案类型: dict, keys: {list(ans.keys())}")
        else:
            print(f"    答案: {str(ans)[:80]}")
        print()

# 看看简答题中看起来像计算题的
calc_keywords = ['计算', '求', '等于', '多少', '值为', '补码', '地址', '容量', 'Cache', '主存', '运算', '进制', '转换', '位', 'MB', 'KB', '字节']
print('=== 简答题中疑似计算题（题目含数字+计算关键词）===')
count = 0
suspect_list = []
for q in qs:
    if q.get('type') == 'shortAnswer':
        title = q.get('question', '')
        has_numbers = any(c.isdigit() for c in title)
        has_calc_word = any(kw in title for kw in calc_keywords)
        if has_numbers and has_calc_word:
            count += 1
            suspect_list.append(q)
            if count <= 15:
                print(f"  [{q['id']}] {title[:80]}")

print(f'\n共发现 {count} 道疑似计算题被标记为简答题')

# 再对比下练习题库的题型分布
print()
print('=== 练习题库题型分布 ===')
with open('data/quiz-bank-13015.json', 'r', encoding='utf-8') as f:
    quiz = json.load(f)

from collections import Counter
quiz_types = Counter(q.get('type', 'unknown') for q in quiz)
for t, c in quiz_types.items():
    print(f'  {t}: {c} 题')
