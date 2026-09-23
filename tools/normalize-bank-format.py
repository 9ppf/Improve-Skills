#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题库格式统一转换脚本 + 抽查报告生成
=====================================
统一 6 个题库文件的字段格式，使其符合同一标准。

用法：
    python tools/normalize-bank-format.py          # 生成抽查报告（不修改文件）
    python tools/normalize-bank-format.py --apply  # 执行转换，覆盖原文件
"""

import argparse
import copy
import json
import os
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'data'

# 6 个题库文件
BANK_FILES = [
    ('quiz-bank-02324.json', '离散数学-练习', 'quiz'),
    ('quiz-bank-13003.json', '数据结构-练习', 'quiz'),
    ('quiz-bank-13015.json', '计算机系统原理-练习', 'quiz'),
    ('exam-data-02324.json', '离散数学-真题', 'exam'),
    ('exam-data-13003.json', '数据结构-真题', 'exam'),
    ('exam-data-13015.json', '计算机系统原理-真题', 'exam'),
]

SAMPLE_PER_TYPE = 3  # 每个题型抽几道题做抽查报告


# ============================================================
# 标准字段定义
# ============================================================

# 通用必选字段（所有题型都有）
COMMON_FIELDS = {
    'id': '',
    'type': '',
    'question': '',
    'answer': '',
    'chapter': '',
    'src': '',
    'explanation': '',
}

# 通用可选字段（有就保留，没有不补）
COMMON_OPTIONAL = ['referenceAnswer', 'image', 'hint', 'cardId', 'year']


def normalize_choice(q):
    """选择题标准化"""
    # options 去掉 "A." 前缀（如果有的话）
    options = q.get('options', [])
    new_options = []
    for opt in options:
        if isinstance(opt, str):
            # 去掉 "A. " / "A." / "A、" 等前缀
            import re
            opt = re.sub(r'^[A-H][\.、．]\s*', '', opt)
        new_options.append(opt)
    q['options'] = new_options

    # subType 默认 single
    if 'subType' not in q:
        q['subType'] = 'single'

    return q


def normalize_fill(q):
    """填空题标准化"""
    blanks = q.get('blanks') or []
    new_blanks = []
    for b in blanks:
        if isinstance(b, str):
            # 字符串 → 对象
            new_blanks.append({'answer': b, 'synonyms': []})
        elif isinstance(b, dict):
            # 对象：确保有 answer 和 synonyms
            nb = {
                'answer': b.get('answer', ''),
                'synonyms': b.get('synonyms', []) or []
            }
            new_blanks.append(nb)
    q['blanks'] = new_blanks

    # unordered 默认 false
    if 'unordered' not in q:
        q['unordered'] = False

    # text 字段重命名为 template（如果有）
    if 'text' in q and 'template' not in q:
        q['template'] = q.pop('text')

    return q


def normalize_short_answer(q):
    """简答题标准化"""
    points = q.get('points', [])
    new_points = []
    for p in points:
        if isinstance(p, str):
            new_points.append({
                'point': p,
                'synonyms': [],
                'weight': 1
            })
        elif isinstance(p, dict):
            np = {
                'point': p.get('point', ''),
                'synonyms': p.get('synonyms', []) or [],
                'weight': p.get('weight', 1)
            }
            new_points.append(np)
    q['points'] = new_points

    # passThreshold 默认 60
    if 'passThreshold' not in q:
        q['passThreshold'] = 60

    return q


def normalize_essay(q):
    """论述题标准化（同简答题）"""
    return normalize_short_answer(q)


def normalize_calculate(q):
    """计算题标准化"""
    # formula 默认为空
    if 'formula' not in q:
        q['formula'] = ''

    # steps 默认为空数组
    if 'steps' not in q:
        q['steps'] = []

    # answerAliases 默认为空数组
    if 'answerAliases' not in q:
        q['answerAliases'] = []

    return q


def normalize_proof(q):
    """证明题标准化"""
    # method / methodHint 可选，没有不补
    if 'method' not in q:
        q['method'] = ''
    if 'methodHint' not in q:
        q['methodHint'] = ''

    # referenceProof 优先，没有则用 referenceAnswer，再没有用 answer 拆成数组
    if 'referenceProof' not in q:
        ref = q.get('referenceAnswer') or q.get('answer', '')
        if isinstance(ref, str):
            # 按换行拆成步骤
            lines = [l.strip() for l in ref.split('\n') if l.strip()]
            q['referenceProof'] = lines
        elif isinstance(ref, list):
            q['referenceProof'] = ref
        else:
            q['referenceProof'] = []

    # points 标准化
    points = q.get('points', [])
    new_points = []
    for p in points:
        if isinstance(p, str):
            new_points.append({
                'point': p,
                'synonyms': [],
                'weight': 1
            })
        elif isinstance(p, dict):
            np = {
                'point': p.get('point', ''),
                'synonyms': p.get('synonyms', []) or [],
                'weight': p.get('weight', 1)
            }
            new_points.append(np)
    q['points'] = new_points

    # passThreshold 默认 60
    if 'passThreshold' not in q:
        q['passThreshold'] = 60

    return q


NORMALIZERS = {
    'choice': normalize_choice,
    'fill': normalize_fill,
    'calculate': normalize_calculate,
    'shortAnswer': normalize_short_answer,
    'essay': normalize_essay,
    'proof': normalize_proof,
}


def normalize_question(q):
    """标准化单道题"""
    q = copy.deepcopy(q)

    # 确保通用字段存在（没有就设空值）
    for field, default in COMMON_FIELDS.items():
        if field not in q:
            q[field] = default

    # 按题型标准化
    qtype = q.get('type', '')
    normalizer = NORMALIZERS.get(qtype)
    if normalizer:
        q = normalizer(q)

    return q


def load_questions(filepath, filetype):
    """加载题目列表"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if filetype == 'exam':
        return data.get('questions', [])
    else:
        return data if isinstance(data, list) else []


def save_questions(filepath, filetype, questions):
    """保存题目列表"""
    if filetype == 'exam':
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data['questions'] = questions
    else:
        data = questions

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def count_by_type(questions):
    """按题型统计数量"""
    counts = {}
    for q in questions:
        t = q.get('type', 'unknown')
        counts[t] = counts.get(t, 0) + 1
    return counts


def generate_diff_report(before, after, label):
    """生成单道题的转换前后差异报告"""
    lines = []
    lines.append(f'  【{label}】{before.get("question", "")[:40]}...')
    lines.append(f'    转换前字段：{sorted(before.keys())}')
    lines.append(f'    转换后字段：{sorted(after.keys())}')

    added = set(after.keys()) - set(before.keys())
    removed = set(before.keys()) - set(after.keys())
    changed = []

    for k in before.keys():
        if k in after and before[k] != after[k]:
            # 只记录结构变化，值变化不一一列（太多了）
            if type(before[k]) != type(after[k]):
                changed.append(f'{k}: {type(before[k]).__name__} → {type(after[k]).__name__}')

    if added:
        lines.append(f'    ➕ 新增字段：{sorted(added)}')
    if removed:
        lines.append(f'    ➖ 删除字段：{sorted(removed)}')
    if changed:
        for c in changed:
            lines.append(f'    🔄 {c}')

    # 特殊检查
    if before.get('type') == 'fill':
        before_blanks = before.get('blanks', [])
        after_blanks = after.get('blanks', [])
        if before_blanks and after_blanks:
            b0 = before_blanks[0]
            a0 = after_blanks[0]
            if isinstance(b0, str):
                lines.append(f'    ⚠️  blanks[0] 从字符串转为对象')
            elif isinstance(b0, dict):
                if 'synonyms' not in b0:
                    lines.append(f'    ⚠️  blanks[0] 补 synonyms 字段')

    if before.get('type') in ('shortAnswer', 'essay', 'proof'):
        before_points = before.get('points', [])
        after_points = after.get('points', [])
        if not before_points:
            lines.append(f'    ⚠️  points 为空（无评分点，将走自评模式）')
        elif before_points and after_points:
            p0 = before_points[0]
            if isinstance(p0, dict) and 'weight' not in p0:
                lines.append(f'    ⚠️  points[0] 补 weight 字段（默认 1）')
            if isinstance(p0, dict) and 'synonyms' not in p0:
                lines.append(f'    ⚠️  points[0] 补 synonyms 字段（默认 []）')

    lines.append('')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='题库格式统一转换')
    parser.add_argument('--apply', action='store_true', help='执行转换并覆盖原文件（默认只生成报告）')
    parser.add_argument('--seed', type=int, default=42, help='随机种子，用于抽查抽样')
    args = parser.parse_args()

    random.seed(args.seed)

    report_lines = []
    report_lines.append('# 题库格式统一 — 抽查报告')
    report_lines.append('')
    report_lines.append(f'模式：{"执行转换" if args.apply else "仅生成报告（不修改文件）"}')
    report_lines.append('')

    # 统计总览
    report_lines.append('## 一、文件总览')
    report_lines.append('')
    report_lines.append('| 文件 | 科目 | 类型 | 总题数 | 题型分布 |')
    report_lines.append('|------|------|------|--------|----------|')

    file_summaries = []

    for filename, label, ftype in BANK_FILES:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            report_lines.append(f'| {filename} | {label} | - | ❌ 文件不存在 | - |')
            continue

        questions = load_questions(filepath, ftype)
        type_counts = count_by_type(questions)
        type_str = '、'.join(f'{t}({c})' for t, c in sorted(type_counts.items()))
        report_lines.append(f'| {filename} | {label} | {ftype} | {len(questions)} | {type_str} |')
        file_summaries.append((filename, label, ftype, filepath, questions, type_counts))

    report_lines.append('')

    # 各文件详细抽查
    report_lines.append('## 二、各文件抽查详情')
    report_lines.append('')

    all_before = {}
    all_after = {}

    for filename, label, ftype, filepath, questions, type_counts in file_summaries:
        report_lines.append(f'### {filename}（{label}）')
        report_lines.append('')

        # 按题型分组
        by_type = {}
        for q in questions:
            t = q.get('type', 'unknown')
            by_type.setdefault(t, []).append(q)

        # 保存转换前
        all_before[filename] = copy.deepcopy(questions)

        # 执行转换
        normalized = [normalize_question(q) for q in questions]
        all_after[filename] = normalized

        # 每个题型抽样
        for qtype in sorted(by_type.keys()):
            qlist = by_type[qtype]
            sample = random.sample(qlist, min(SAMPLE_PER_TYPE, len(qlist)))

            report_lines.append(f'**题型：{qtype}（共 {len(qlist)} 题，抽 {len(sample)} 题）**')
            report_lines.append('')

            for i, q_before in enumerate(sample):
                qid = q_before.get('id', '?')
                q_after = None
                for nq in normalized:
                    if nq.get('id') == qid:
                        q_after = nq
                        break
                if q_after is None:
                    continue
                report_lines.append(generate_diff_report(q_before, q_after, f'第{i+1}题 id={qid}'))

            report_lines.append('')

    # 字段一致性统计
    report_lines.append('## 三、字段一致性统计（转换后）')
    report_lines.append('')
    report_lines.append('统计每个题型在6个文件中是否字段完全一致。')
    report_lines.append('')

    # 收集每个题型在每个文件中的字段集合
    type_fields = {}  # type -> {filename: set(fields)}
    for filename, label, ftype, filepath, questions, type_counts in file_summaries:
        for q in all_after[filename]:
            t = q.get('type', 'unknown')
            if t not in type_fields:
                type_fields[t] = {}
            if filename not in type_fields[t]:
                type_fields[t][filename] = set()
            type_fields[t][filename].update(q.keys())

    for qtype in sorted(type_fields.keys()):
        report_lines.append(f'### {qtype} 题型')
        report_lines.append('')
        report_lines.append('| 文件 | 字段数 | 字段列表 |')
        report_lines.append('|------|--------|----------|')

        all_fields = set()
        for fname, fields in type_fields[qtype].items():
            all_fields.update(fields)

        for fname in sorted(type_fields[qtype].keys()):
            fields = type_fields[qtype][fname]
            report_lines.append(f'| {fname} | {len(fields)} | {", ".join(sorted(fields))} |')

        # 检查是否完全一致
        field_sets = list(type_fields[qtype].values())
        if field_sets:
            common = field_sets[0]
            for fs in field_sets[1:]:
                common = common & fs
            extra = all_fields - common
            if extra:
                report_lines.append('')
                report_lines.append(f'⚠️ **存在差异字段**：{", ".join(sorted(extra))}')
            else:
                report_lines.append('')
                report_lines.append('✅ **所有文件字段完全一致**')
        report_lines.append('')

    # 输出报告
    report_text = '\n'.join(report_lines)
    report_path = ROOT / 'docs' / '题库格式统一-抽查报告.md'
    report_path.write_text(report_text, encoding='utf-8')
    print(f'✅ 抽查报告已生成：{report_path}')

    if args.apply:
        # 执行转换
        for filename, label, ftype, filepath, questions, type_counts in file_summaries:
            # 先备份
            backup_path = filepath.with_suffix('.json.bak-before-normalize')
            with open(filepath, 'r', encoding='utf-8') as f:
                backup_path.write_text(f.read(), encoding='utf-8')
            print(f'  已备份：{backup_path.name}')

            # 写入转换后的数据
            save_questions(filepath, ftype, all_after[filename])
            print(f'  ✅ 已转换：{filename}')

        print('\n🎉 全部转换完成！')
        print(f'   原始文件已备份为 *.bak-before-normalize')
    else:
        print('\nℹ️  当前为预览模式，未修改任何文件。')
        print('   确认无误后，执行：python tools/normalize-bank-format.py --apply')


if __name__ == '__main__':
    main()
