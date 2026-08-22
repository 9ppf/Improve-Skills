"""
知识点优先级标注检查脚本（设计稿还原 Skill 配套）

检查项：
1. 知识框架页面中核心概念的知识点是否都有优先级标签（重点/一般/了解）
2. 优先级是否有对应的颜色区分
3. 是否有学习方式标注

检测范围：自考学习模块的知识框架 HTML 页面
- 检测 "核心概念" 板块下的 li 元素
- 检查是否包含 🔴 🟡 🟢 优先级标记
- 检查是否包含"重点·" "一般·" "了解·" 文字

注意：advisory warning，不阻止提交
"""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 知识框架页面路径
SUBJECTS = {
    '02324离散数学': 'Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html',
    '13003数据结构与算法': 'Workbench/自考学习/备考科目/13003数据结构与算法/13003数据结构与算法-目录与知识框架.html',
    '13015计算机系统原理': 'Workbench/自考学习/备考科目/13015计算机系统原理/13015计算机系统原理-目录与知识框架.html',
}

# 优先级标记
PRIORITY_MARKERS = ['🔴', '🟡', '🟢', '重点', '一般', '了解']


def find_all_core_concepts_sections(html_content):
    """找到所有章节的核心概念板块内容（每章都有一个核心概念板块）"""
    sections = []
    # 匹配所有"核心概念"标题后面的 ul 列表
    patterns = [
        r'核心概念.*?</div>\s*<ul>(.*?)</ul>',
        r'核心概念[\s\S]*?<ul>(.*?)</ul>',
    ]
    for pat in patterns:
        matches = re.findall(pat, html_content, re.DOTALL | re.IGNORECASE)
        if matches:
            sections.extend(matches)
            break
    return sections


def extract_li_items(ul_html):
    """从 ul HTML 中提取 li 项内容"""
    items = re.findall(r'<li[^>]*>(.*?)</li>', ul_html, re.DOTALL | re.IGNORECASE)
    return items


def has_priority_marker(li_html):
    """检查 li 是否有优先级标记"""
    # 检查 emoji
    for marker in ['🔴', '🟡', '🟢']:
        if marker in li_html:
            return True
    # 检查文字标签
    for marker in ['重点', '一般', '了解']:
        if marker in li_html and ('·' in li_html or '-' in li_html or ' ' in li_html):
            # 更精确：后面跟学习方式
            if re.search(f'{marker}[·\-][理解记忆应用计算]', li_html):
                return True
    return False


def has_color_style(li_html):
    """检查 li 是否有优先级对应的颜色样式"""
    # 检查行内样式
    if 'style=' in li_html:
        style_match = re.search(r'style="([^"]+)"', li_html)
        if style_match:
            style = style_match.group(1)
            if 'color:' in style:
                return True
    # 检查类名（包含 priority- 或 key- 等）
    class_match = re.search(r'class="([^"]+)"', li_html)
    if class_match:
        classes = class_match.group(1)
        if any(c in classes for c in ['priority', 'key-term', 'mastered', 'importance']):
            return True
    return False


def check_subject(subject_name, filepath):
    """检查一个科目页面的知识点标注情况"""
    issues = []
    full_path = os.path.join(ROOT, filepath)

    if not os.path.exists(full_path):
        return [f'{subject_name}: 文件不存在 {filepath}']

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f'{subject_name}: 读取失败 {e}']

    # 找所有章节的核心概念板块
    core_sections = find_all_core_concepts_sections(content)
    if not core_sections:
        # 可能是其他结构，不报（避免误报）
        return []

    # 汇总所有章节的知识点
    missing_priority = 0
    missing_color = 0
    total = 0

    for section in core_sections:
        items = extract_li_items(section)
        for item in items:
            if not item.strip():
                continue
            total += 1
            if not has_priority_marker(item):
                missing_priority += 1
            elif not has_color_style(item):
                missing_color += 1

    if missing_priority > 0:
        issues.append(f'{subject_name}: {missing_priority}/{total} 个知识点缺少优先级标签（共{len(core_sections)}章）')
    if missing_color > 0:
        issues.append(f'{subject_name}: {missing_color}/{total} 个有标签但缺少颜色区分')

    return issues


def check_priority_labels():
    """检查所有科目的知识点优先级标注"""
    all_issues = []
    for subject, filepath in SUBJECTS.items():
        issues = check_subject(subject, filepath)
        all_issues.extend(issues)
    return all_issues


if __name__ == "__main__":
    issues = check_priority_labels()
    if issues:
        print(f"[WARN] 知识点优先级标注检查发现 {len(issues)} 个问题：")
        for i in issues:
            print(f"  - {i}")
        sys.exit(1)
    else:
        print("[OK] 知识点优先级标注检查通过")
        sys.exit(0)
