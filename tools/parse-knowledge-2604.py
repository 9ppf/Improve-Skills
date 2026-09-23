# -*- coding: utf-8 -*-
"""
解析 2604.docx 知识点文档，提取所有知识点并保存为 JSON 格式
"""
import json
import os
import re
from datetime import datetime

# ====== 配置 ======
INPUT_FILE = 'Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-2604.docx'
OUTPUT_FILE = 'data/knowledge/knowledge-bank-13015.json'
SUBJECT = '13015'
SUBJECT_NAME = '计算机系统原理'
SOURCE = '2604总结'  # 来源标识
DEFAULT_WEIGHT = 3  # 默认3星


def extract_knowledge_from_docx(filepath):
    """从 docx 文件中提取知识点"""
    import docx
    doc = docx.Document(filepath)
    
    knowledge_items = []
    current_item = None
    in_knowledge_section = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        
        # 跳过空行
        if not text:
            continue
        
        # 检测是否进入知识点部分
        if text == '二、知识点':
            in_knowledge_section = True
            continue
        
        # 还没到知识点部分，跳过
        if not in_knowledge_section:
            continue
        
        # 检测新的知识点开始："知识点N" 格式
        match = re.match(r'^知识点(\d+)$', text)
        if match:
            # 保存上一个知识点
            if current_item:
                knowledge_items.append(current_item)
            
            # 开始新知识点
            idx = int(match.group(1))
            current_item = {
                'idx': idx,
                'paragraphs': [],
            }
            continue
        
        # 如果当前在知识点中，添加内容段落
        if current_item is not None:
            current_item['paragraphs'].append(text)
    
    # 保存最后一个知识点
    if current_item:
        knowledge_items.append(current_item)
    
    return knowledge_items


def generate_title(paragraphs):
    """从内容段落中生成知识点标题"""
    if not paragraphs:
        return '未命名知识点'
    
    first = paragraphs[0]
    
    # 情况1："术语：定义" 格式，取冒号前的部分作为标题
    if '：' in first and len(first.split('：')[0]) < 30:
        title = first.split('：')[0].strip()
        # 清理一下标题
        title = re.sub(r'[（(].*?[)）]', '', title).strip()  # 去掉括号里的内容
        if title and len(title) <= 30:
            return title
    
    # 情况2：第一行本身就是术语（短，没有冒号）
    if len(first) <= 20 and not first.endswith('。') and not first.endswith('，'):
        return first
    
    # 情况3：取第一句话（到句号为止）
    period_pos = first.find('。')
    if period_pos > 0 and period_pos <= 30:
        return first[:period_pos]
    
    # 情况4：截取前25个字
    return first[:25] + ('...' if len(first) > 25 else '')


def build_knowledge_json(items, subject, source):
    """构建知识库 JSON 结构"""
    knowledge_list = []
    
    for item in items:
        idx = item['idx']
        paragraphs = item['paragraphs']
        
        if not paragraphs:
            continue
        
        title = generate_title(paragraphs)
        
        # 生成内容（保留段落结构，用 \n\n 分隔）
        content = '\n\n'.join(paragraphs)
        
        # 生成唯一ID
        kid = f'k-{subject}-{source}-{idx}'
        
        knowledge_list.append({
            'id': kid,
            'title': title,
            'content': content,
            'chapter': '未分类',  # 待用户手动调整
            'weight': DEFAULT_WEIGHT,  # 默认3星
            'source': source,
            'tags': [],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'reviewCount': 0,
            'lastReviewAt': None,
        })
    
    return knowledge_list


def main():
    print(f'正在解析: {INPUT_FILE}')
    
    # 提取知识点
    items = extract_knowledge_from_docx(INPUT_FILE)
    print(f'提取到 {len(items)} 个知识点')
    
    # 构建 JSON
    knowledge_list = build_knowledge_json(items, SUBJECT, SOURCE)
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # 保存
    output_data = {
        'subject': SUBJECT,
        'subjectName': SUBJECT_NAME,
        'total': len(knowledge_list),
        'sources': [SOURCE],
        'items': knowledge_list,
        'updatedAt': datetime.now().isoformat(),
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f'已保存到: {OUTPUT_FILE}')
    print()
    
    # 打印前10个，看看效果
    print('=== 前10个知识点预览 ===')
    for i, item in enumerate(knowledge_list[:10]):
        print(f'{i+1}. [{item["id"]}] {item["title"]}')
        print(f'   内容预览: {item["content"][:60]}...')
        print()
    
    # 标题统计
    print('=== 统计 ===')
    chapter_count = len(set(item['chapter'] for item in knowledge_list))
    print(f'总知识点数: {len(knowledge_list)}')
    print(f'章节数: {chapter_count}')
    print(f'默认权重: {DEFAULT_WEIGHT}星')


if __name__ == '__main__':
    main()
