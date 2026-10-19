# -*- coding: utf-8 -*-
"""
批量修正真题题库的题型标注
只修改 type 字段，答案格式保持不变
"""
import json
import os
import shutil

SUBJECTS = ['13015', '02324', '13003']
SUBJECT_NAMES = {
    '13015': '计算机系统原理',
    '02324': '离散数学',
    '13003': '数据结构与算法'
}

def fix_exam_types():
    # 读取扫描报告
    with open('tools/question-type-scan-report.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    # 筛选真题部分的修正项
    exam_items = [item for item in report['items'] if item['bank'] == '真题']
    
    print(f'共 {len(exam_items)} 道真题待修正')
    print()
    
    # 按科目分组
    by_subject = {}
    for item in exam_items:
        sub = item['subject']
        if sub not in by_subject:
            by_subject[sub] = []
        by_subject[sub].append(item)
    
    total_changed = 0
    
    for subject in SUBJECTS:
        if subject not in by_subject:
            continue
        
        items = by_subject[subject]
        name = SUBJECT_NAMES.get(subject, subject)
        filepath = f'data/exam-data-{subject}.json'
        
        if not os.path.exists(filepath):
            print(f'[跳过] {name}: 文件不存在')
            continue
        
        # 备份原文件
        backup_path = filepath + '.bak'
        if not os.path.exists(backup_path):
            shutil.copy2(filepath, backup_path)
            print(f'[备份] {name}: 已备份到 {backup_path}')
        
        # 读取文件
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        questions = data.get('questions', [])
        if not questions:
            print(f'[跳过] {name}: 没有题目数据')
            continue
        
        # 构建ID映射
        qid_map = {str(q.get('id', '')): q for q in questions}
        
        # 应用修正
        changed = 0
        for item in items:
            qid = str(item['id'])
            if qid in qid_map:
                q = qid_map[qid]
                old_type = q.get('type', '')
                new_type = item['suggested_type']
                if old_type != new_type:
                    q['type'] = new_type
                    changed += 1
                    print(f'  [{qid}] {old_type} → {new_type}')
            else:
                print(f'  [警告] 未找到题目: {qid}')
        
        # 保存文件
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'[完成] {name}: 修正 {changed} 题')
        print()
        total_changed += changed
    
    print(f'全部完成！共修正 {total_changed} 道真题')
    print(f'原始文件已备份为 .bak，确认无误后可删除备份')

if __name__ == '__main__':
    fix_exam_types()
