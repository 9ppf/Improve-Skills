# -*- coding: utf-8 -*-
"""
题库题型扫描工具
扫描所有题库中题型标注可能不准确的题目，生成待修正清单供人工确认。
"""
import json
import os
import re
from collections import defaultdict

# ====== 科目配置 ======
SUBJECTS = ['13015', '02324', '13003']
SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
}

# 题库文件映射
BANK_FILES = {
    '练习测验': 'data/quiz-bank-{subject}.json',
    '真题': 'data/exam-data-{subject}.json',
    'AI专项': 'data/ai-practice-{subject}.json',
}

# ====== 关键词规则 ======

# 计算类动词（题干中出现说明需要计算）
CALC_VERBS = ['计算', '求解', '求', '算出', '推导', '等于多少', '值为', '求值', '化为', '转换为']

# 计算类名词（题干中出现说明是计算型题目）
CALC_NOUNS = [
    '补码', '原码', '反码', '移码',
    '进制', '二进制', '十进制', '十六进制', '八进制',
    '地址格式', 'Cache', 'cache', '主存容量', '主存块',
    'CPI', 'MIPS', '吞吐率', '传输率', '命中率', '加速比',
    '效率', '利用率', '开销', '周期数', '时钟周期',
    '公式', '运算', '位数', '字节', 'KB', 'MB', 'GB', 'TB',
    '复杂度', '时间复杂度', '空间复杂度',
    '真值', '溢出', '进位', '余数', '商',
    '矩阵', '行列式', '方程', '不等式',
    '概率', '期望', '方差', '标准差',
    '容量', '大小', '长度', '宽度', '高度',
    '增长率', '衰减率', '误差',
]

# 简答题特征词（出现则优先归为简答，不改为计算）
SHORT_ANSWER_KEYWORDS = [
    '简述', '说明', '什么是', '有哪些', '分别是', '包括', '包含',
    '概念', '定义', '原理', '思想', '特点', '特征', '区别', '联系',
    '优缺点', '作用', '功能', '分类', '类型', '方法', '方式',
    '过程', '步骤', '流程', '层次', '结构', '组成',
    '比较', '对比', '分析', '阐述', '论述',
    '为什么', '原因', '意义', '影响',
    '基本思想', '基本原理', '基本原则', '基本方法',
]

# 论述题特征词
ESSAY_KEYWORDS = [
    '论述', '阐述', '分析', '评价', '比较', '综合',
    '结合实际', '联系实际', '举例说明',
    '影响因素', '重要性', '意义', '对策', '建议',
]

# 证明题特征词
PROOF_KEYWORDS = [
    '证明', '证', '求证', '推导', '推出',
    '充分条件', '必要条件', '充要条件',
    '当且仅当',
]


def get_questions_from_bank(bank_name, subject):
    """从指定题库中提取所有题目列表"""
    filepath = BANK_FILES[bank_name].format(subject=subject)
    if not os.path.exists(filepath):
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    questions = []
    
    if bank_name == '练习测验':
        # 练习题库可能是 list 或 dict
        if isinstance(data, list):
            questions = data
        elif isinstance(data, dict):
            questions = data.get('questions', data.get('items', []))
    
    elif bank_name == '真题':
        # 真题库
        if isinstance(data, dict):
            questions = data.get('questions', [])
    
    elif bank_name == 'AI专项':
        # AI专项是batch列表，每个batch有items
        if isinstance(data, list):
            for batch in data:
                items = batch.get('items', [])
                for q in items:
                    q = dict(q)
                    if 'batch_id' not in q:
                        q['batch_id'] = batch.get('id', '')
                    questions.append(q)
    
    return questions


def get_answer_text(q):
    """获取题目的答案文本（用于判断）"""
    ans = q.get('answer', '')
    if isinstance(ans, str):
        return ans
    elif isinstance(ans, dict):
        # 可能是结构化答案，拼接起来
        parts = []
        for key in ['text', 'steps', 'formula', 'result', 'blanks', 'points']:
            val = ans.get(key, '')
            if val:
                if isinstance(val, list):
                    parts.append(' '.join(str(v) for v in val))
                else:
                    parts.append(str(val))
        return ' '.join(parts)
    elif isinstance(ans, list):
        return ' '.join(str(a) for a in ans)
    return str(ans)


def has_numbers(text):
    """判断文本中是否含有数字（含单位）"""
    # 匹配数字（含小数、分数、二进制数等）
    pattern = r'\d+\.?\d*'
    return bool(re.search(pattern, text))


def count_calc_verbs(text):
    """计算文本中包含多少个计算类动词"""
    count = 0
    for kw in CALC_VERBS:
        count += text.count(kw)
    return count


def count_calc_nouns(text):
    """计算文本中包含多少个计算类名词"""
    count = 0
    for kw in CALC_NOUNS:
        if kw.lower() in text.lower():
            count += 1
    return count


def count_short_answer_keywords(text):
    """计算文本中包含多少个简答题特征词"""
    count = 0
    for kw in SHORT_ANSWER_KEYWORDS:
        count += text.count(kw)
    return count


def count_essay_keywords(text):
    """计算文本中包含多少个论述题特征词"""
    count = 0
    for kw in ESSAY_KEYWORDS:
        count += text.count(kw)
    return count


def count_proof_keywords(text):
    """计算文本中包含多少个证明题特征词"""
    count = 0
    for kw in PROOF_KEYWORDS:
        count += text.count(kw)
    return count


def has_calc_steps(answer_text):
    """判断答案中是否包含计算步骤/公式推导"""
    # 含有等号和数字的连续行
    calc_patterns = [
        r'=.+[\d＋＋－－××÷÷]',  # 等号后有数字或运算符
        r'[\d]+\s*[+\-×÷*/^]\s*[\d]+',  # 数字间有运算符
        r'步骤[一二三四五六七八九十\d]+',  # 明确标注步骤
        r'第[一二三四五六七八九十\d]+步',  # 第N步
        r'\d+\s*[=＝]\s*\d+',  # 数字=数字
        r'2\^[-\d]+',  # 2的N次方
        r'\d+\s*[\/／]\s*\d+',  # 分数/除法
    ]
    for pat in calc_patterns:
        if re.search(pat, answer_text):
            return True
    return False


def has_sub_questions(text):
    """判断题目是否有(1)(2)(3)等小问"""
    return bool(re.search(r'[（(]\s*\d+\s*[)）]', text))


def answer_is_long(answer_text, threshold=200):
    """判断答案是否较长（论述题特征）"""
    return len(answer_text) > threshold


def analyze_question(q, current_type):
    """
    分析单道题的题型是否可能标错。
    返回：(suggested_type, reason, confidence)
    suggested_type: 建议的题型（None 表示不需要改）
    reason: 判断理由
    confidence: 置信度 high/medium/low
    """
    q_text = q.get('question', '')
    ans_text = get_answer_text(q)
    qid = q.get('id', 'unknown')
    
    # 统计各特征
    has_nums = has_numbers(q_text)
    calc_verb_count = count_calc_verbs(q_text)
    calc_noun_count = count_calc_nouns(q_text)
    short_kw_count = count_short_answer_keywords(q_text)
    essay_kw_count = count_essay_keywords(q_text)
    proof_kw_count = count_proof_keywords(q_text)
    has_steps = has_calc_steps(ans_text)
    has_subs = has_sub_questions(q_text)
    ans_long = answer_is_long(ans_text, 250)
    
    # ===== 简答题 → 计算题 =====
    if current_type == 'shortAnswer':
        # 计算类得分
        calc_score = 0
        if has_nums:
            calc_score += 1
        if calc_verb_count >= 1:
            calc_score += 2
        if calc_noun_count >= 2:
            calc_score += 2
        elif calc_noun_count >= 1:
            calc_score += 1
        if has_steps:
            calc_score += 3
        if has_subs:
            calc_score += 1
        
        # 简答题特征得分
        short_score = short_kw_count * 2
        
        # 判定：计算得分 >= 4 且 大于简答得分
        if calc_score >= 4 and calc_score > short_score:
            confidence = 'high' if calc_score >= 6 else 'medium'
            reason = f'计算特征得分={calc_score}（数字={has_nums}, 计算动词={calc_verb_count}, 计算名词={calc_noun_count}, 有步骤={has_steps}, 有小问={has_subs}），简答特征得分={short_score}'
            return ('calculate', reason, confidence)
    
    # ===== 简答题 → 论述题 =====
    if current_type == 'shortAnswer':
        essay_score = 0
        if essay_kw_count >= 2:
            essay_score += 2
        elif essay_kw_count >= 1:
            essay_score += 1
        if ans_long:
            essay_score += 2
        
        if essay_score >= 3 and ans_long:
            reason = f'论述特征得分={essay_score}（论述关键词={essay_kw_count}, 答案长度={len(ans_text)}字）'
            return ('essay', reason, 'medium')
    
    # ===== 计算题 → 简答题 =====
    if current_type == 'calculate':
        short_score = short_kw_count * 2
        calc_score = (2 if has_nums else 0) + calc_verb_count + calc_noun_count + (3 if has_steps else 0)
        
        if short_score > calc_score and not has_steps:
            reason = f'简答特征得分={short_score} > 计算得分={calc_score}，且无计算步骤'
            return ('shortAnswer', reason, 'low')
    
    # ===== 简答题 → 证明题 =====
    if current_type == 'shortAnswer':
        if proof_kw_count >= 2 or (proof_kw_count >= 1 and '证明' in q_text):
            reason = f'证明特征词数量={proof_kw_count}'
            return ('proof', reason, 'medium')
    
    return (None, '', '')


def scan_all():
    """扫描所有题库，生成待修正清单"""
    results = defaultdict(lambda: defaultdict(list))
    stats = defaultdict(lambda: defaultdict(lambda: {'total': 0, 'changed': 0}))
    
    for subject in SUBJECTS:
        for bank_name in BANK_FILES:
            questions = get_questions_from_bank(bank_name, subject)
            if not questions:
                continue
            
            stats[subject][bank_name]['total'] = len(questions)
            
            for q in questions:
                current_type = q.get('type', 'unknown')
                suggested, reason, confidence = analyze_question(q, current_type)
                
                if suggested:
                    stats[subject][bank_name]['changed'] += 1
                    results[subject][bank_name].append({
                        'id': q.get('id', '?'),
                        'current_type': current_type,
                        'suggested_type': suggested,
                        'confidence': confidence,
                        'reason': reason,
                        'question': q.get('question', '')[:80],
                        'year': q.get('year', ''),
                        'chapter': q.get('chapter', ''),
                    })
    
    return results, stats


def print_report(results, stats):
    """打印扫描报告"""
    print('=' * 80)
    print('题库题型扫描报告')
    print('=' * 80)
    
    # 统计总览
    total_questions = 0
    total_changed = 0
    for subject in SUBJECTS:
        for bank in BANK_FILES:
            total_questions += stats[subject][bank]['total']
            total_changed += stats[subject][bank]['changed']
    
    print(f'\n总扫描题目数：{total_questions}')
    print(f'疑似标注错误：{total_changed} 题')
    print()
    
    # 按科目统计
    print('--- 按科目统计 ---')
    for subject in SUBJECTS:
        name = SUBJECT_NAMES.get(subject, subject)
        sub_total = sum(stats[subject][b]['total'] for b in BANK_FILES)
        sub_changed = sum(stats[subject][b]['changed'] for b in BANK_FILES)
        if sub_total > 0:
            print(f'  {name}（{subject}）：{sub_changed}/{sub_total} 题 ({sub_changed*100//max(sub_total,1)}%)')
    
    print()
    print('--- 按题库统计 ---')
    for bank in BANK_FILES:
        bank_total = sum(stats[s][bank]['total'] for s in SUBJECTS)
        bank_changed = sum(stats[s][bank]['changed'] for s in SUBJECTS)
        if bank_total > 0:
            print(f'  {bank}：{bank_changed}/{bank_total} 题 ({bank_changed*100//max(bank_total,1)}%)')
    
    print()
    print('--- 按建议题型统计 ---')
    type_counter = defaultdict(int)
    for subject in SUBJECTS:
        for bank in BANK_FILES:
            for item in results[subject][bank]:
                type_counter[item['suggested_type']] += 1
    for t, c in type_counter.items():
        print(f'  → {t}：{c} 题')
    
    # 详细清单
    print()
    print('=' * 80)
    print('详细待修正清单')
    print('=' * 80)
    
    for subject in SUBJECTS:
        name = SUBJECT_NAMES.get(subject, subject)
        has_content = any(results[subject][b] for b in BANK_FILES)
        if not has_content:
            continue
        
        print(f'\n【{name}】')
        
        for bank in BANK_FILES:
            items = results[subject][bank]
            if not items:
                continue
            
            print(f'\n  ── {bank}（{len(items)} 题）──')
            
            # 按置信度排序
            items_sorted = sorted(items, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x['confidence']])
            
            for item in items_sorted:
                conf_mark = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}[item['confidence']]
                type_map = {
                    'choice': '选择题', 'fill': '填空题',
                    'shortAnswer': '简答题', 'calculate': '计算题',
                    'essay': '论述题', 'proof': '证明题'
                }
                cur = type_map.get(item['current_type'], item['current_type'])
                sug = type_map.get(item['suggested_type'], item['suggested_type'])
                
                extra = ''
                if item.get('year'):
                    extra += f' [{item["year"]}]'
                if item.get('chapter'):
                    extra += f' [{item["chapter"][:15]}]'
                
                print(f'  {conf_mark} [{item["id"]}] {cur} → {sug}{extra}')
                print(f'      {item["question"]}...')
                print(f'      理由：{item["reason"]}')
    
    print()
    print('=' * 80)
    print('图例：🔴 高置信度  🟡 中置信度  🟢 低置信度')
    print('=' * 80)


def save_report_json(results, stats, filepath):
    """保存报告为 JSON 格式（方便后续批量修正时使用）"""
    output = {
        'stats': {},
        'items': []
    }
    
    for subject in SUBJECTS:
        output['stats'][subject] = {}
        for bank in BANK_FILES:
            output['stats'][subject][bank] = stats[subject][bank]
            for item in results[subject][bank]:
                item = dict(item)
                item['subject'] = subject
                item['bank'] = bank
                output['items'].append(item)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f'\n报告已保存：{filepath}')


if __name__ == '__main__':
    results, stats = scan_all()
    print_report(results, stats)
    
    # 保存 JSON 报告（供后续批量修正使用）
    report_path = 'tools/question-type-scan-report.json'
    save_report_json(results, stats, report_path)
