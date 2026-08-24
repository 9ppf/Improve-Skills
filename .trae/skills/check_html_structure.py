#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML 结构完整性检查（知识框架页面 pane 深度一致性）

检查项：
1. chapter-tab-content 容器内所有 chapter-tab-pane 的深度是否一致（正常应为 depth=2）
2. 每个 pane 是否正确闭合（开/闭 div 数量平衡）
3. pane 外是否有游离的章节内容（按钮、卡片等元素跑到 pane 外面）

触发场景：修改知识框架页面 HTML 结构后运行此脚本
严重程度：warning（不阻止提交，但会提示潜在结构问题）

使用方法：
    python .trae/skills/check_html_structure.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORKBENCH = os.path.join(ROOT, "Workbench")

# 知识框架页面的匹配模式
KNOWLEDGE_FRAMEWORK_PATTERN = "*目录与知识框架*.html"


def find_knowledge_framework_files():
    """查找所有知识框架页面"""
    results = []
    for dirpath, dirnames, filenames in os.walk(WORKBENCH):
        for f in filenames:
            if "目录与知识框架" in f and f.endswith(".html"):
                results.append(os.path.join(dirpath, f))
    return results


def check_pane_depth(html, filepath):
    """检查 chapter-tab-content 内所有 pane 的深度一致性

    正常结构：
    <div class="chapter-tab-content">     depth=1
      <div class="chapter-tab-pane" ...>   depth=2
        ...
      </div>
      <div class="chapter-tab-pane" ...>   depth=2
        ...
      </div>
    </div>

    异常结构（pane 嵌套）：
    <div class="chapter-tab-content">     depth=1
      <div class="chapter-tab-pane" ...>   depth=2
        ...（缺少 </div>）
        <div class="chapter-tab-pane" ...> depth=3 ← 嵌套了！
          ...
        </div>
      </div>
    </div>
    """
    errors = []
    warnings = []

    # 找到 chapter-tab-content 容器
    container_match = re.search(r'<div[^>]*class="[^"]*chapter-tab-content[^"]*"[^>]*>', html)
    if not container_match:
        return warnings, errors, "无 chapter-tab-content 容器"

    container_start = container_match.start()
    container_tag = container_match.group(0)

    # 追踪 div 深度
    depth = 1
    i = container_match.end()
    panes = []
    opens = 0
    closes = 0

    while i < len(html) and depth > 0:
        # 检测 <div 开头
        if html[i:i+5] == '<div ' or html[i:i+4] == '<div>':
            depth += 1
            opens += 1

            # 提取完整 div 标签
            tag_end = html.find('>', i)
            if tag_end < 0 or tag_end > i + 500:
                i += 1
                continue

            div_tag = html[i:tag_end+1]

            # 检查是否是 chapter-tab-pane
            if 'chapter-tab-pane' in div_tag:
                tab_match = re.search(r'data-tab="([^"]+)"', div_tag)
                tab_name = tab_match.group(1) if tab_match else 'unknown'
                chapter_match = re.search(r'data-chapter="([^"]+)"', div_tag)
                chapter_name = chapter_match.group(1) if chapter_match else ''
                label = f"tab={tab_name}" + (f", chapter={chapter_name}" if chapter_name else "")
                panes.append({
                    'label': label,
                    'depth': depth,
                    'position': i,
                    'opens_in_pane': 0,
                    'closes_in_pane': 0,
                })

            # 如果在某个 pane 内部，计数
            if panes:
                panes[-1]['opens_in_pane'] += 1

            i = tag_end + 1

        elif html[i:i+6] == '</div>':
            depth -= 1
            closes += 1

            if depth == 0:
                # 容器闭合，此 </div> 属于容器而非任何 pane
                container_end = i + 6
                break

            # 仅在仍处于 pane 内部时计数
            if panes:
                panes[-1]['closes_in_pane'] += 1

            i += 6
        else:
            i += 1
    else:
        # 循环结束但 depth != 0，说明容器未闭合
        errors.append(f"  ✗ chapter-tab-content 容器未正确闭合（最终 depth={depth}）")
        return warnings, errors, "容器未闭合"

    # 分析结果
    fname = os.path.basename(filepath)

    # 1. 检查所有 pane 深度是否一致
    expected_depth = 2
    depth_issues = []
    for p in panes:
        if p['depth'] != expected_depth:
            depth_issues.append(f"    pane[{p['label']}] depth={p['depth']}（期望 {expected_depth}）")

    if depth_issues:
        errors.append(f"  ✗ pane 深度不一致（嵌套问题）：")
        for issue in depth_issues:
            errors.append(issue)

    # 2. 检查每个 pane 内部 div 是否平衡
    balance_issues = []
    for p in panes:
        diff = p['opens_in_pane'] - p['closes_in_pane']
        if diff != 0:
            balance_issues.append(
                f"    pane[{p['label']}] 内部 div 开/闭不平衡：开 {p['opens_in_pane']} / 闭 {p['closes_in_pane']}（差 {diff}）"
            )

    if balance_issues:
        errors.append(f"  ✗ pane 内部 div 不平衡：")
        for issue in balance_issues:
            errors.append(issue)

    # 3. 检查容器内 div 总体平衡
    if opens != closes - 1:
        # closes - 1 因为容器本身的闭合 div 也被计入了 closes
        errors.append(f"  ✗ 容器内 div 不平衡：内部开 {opens} / 闭 {closes - 1}")

    # 4. 统计信息
    info = f"  容器大小: {container_end - container_start} 字符, pane 数: {len(panes)}, 内部 div: 开{opens}/闭{closes-1}"

    if not errors:
        warnings.append(f"  ✓ {fname} 结构正常（{len(panes)} 个 pane，深度均为 {expected_depth}）")

    return warnings, errors, info


def check_stray_elements(html, filepath):
    """检查是否有元素游离在 pane 外面

    检查 chapter-tab-content 容器闭合后，是否还有章节内容（按钮、卡片等）
    """
    errors = []
    fname = os.path.basename(filepath)

    # 找到 chapter-tab-content 容器的结束位置
    container_match = re.search(r'<div[^>]*class="[^"]*chapter-tab-content[^"]*"[^>]*>', html)
    if not container_match:
        return errors

    # 追踪到容器闭合
    depth = 1
    i = container_match.end()
    while i < len(html) and depth > 0:
        if html[i:i+5] == '<div ' or html[i:i+4] == '<div>':
            depth += 1
            tag_end = html.find('>', i)
            i = tag_end + 1 if tag_end > 0 else i + 1
        elif html[i:i+6] == '</div>':
            depth -= 1
            i += 6
        else:
            i += 1

    if depth != 0:
        return errors  # 容器未闭合，上面已报

    # 检查容器闭合后到下一个主要 section 之间是否有游离的章节内容
    after_container = html[i:i+2000]

    # 检查是否有"去练习测验"按钮、章节卡片等游离内容
    stray_patterns = [
        (r'去练习测验', "去练习测验按钮"),
        (r'class="[^"]*chapter-card', "章节卡片"),
        (r'class="[^"]*section-card', "折叠卡片"),
        (r'class="[^"]*quiz-link', "测验链接"),
    ]

    for pattern, desc in stray_patterns:
        matches = re.findall(pattern, after_container)
        if matches:
            # 检查是否在某个其他容器内（如 <script> 或注释中）
            # 简单检查：是否在 <script 标签内
            script_check = re.search(r'<script', after_container)
            if script_check:
                # 如果在 script 标签后，可能是 JS 代码中的字符串，跳过
                script_pos = script_check.start()
                content_before_script = after_container[:script_pos]
                matches_before = re.findall(pattern, content_before_script)
                if matches_before:
                    errors.append(f"  ✗ 容器外发现游离的{desc}（{len(matches_before)} 处）")
            else:
                errors.append(f"  ✗ 容器外发现游离的{desc}（{len(matches)} 处）")

    return errors


def main():
    print("=" * 60)
    print("HTML 结构完整性检查（知识框架页面）")
    print("=" * 60)

    files = find_knowledge_framework_files()

    if not files:
        print("\n未找到知识框架页面，跳过检查。")
        return 0

    all_errors = []
    all_warnings = []

    for filepath in files:
        fname = os.path.relpath(filepath, ROOT)
        print(f"\n--- {fname} ---")

        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()

        warnings, errors, info = check_pane_depth(html, filepath)
        stray_errors = check_stray_elements(html, filepath)

        if info:
            print(f"  {info}")
        for w in warnings:
            print(w)
        for e in errors:
            print(e)
        for e in stray_errors:
            print(e)

        all_errors.extend(errors)
        all_errors.extend(stray_errors)
        all_warnings.extend(warnings)

    print("\n" + "=" * 60)
    if all_errors:
        print(f"✗ 发现 {len(all_errors)} 个结构问题")
        return 1
    else:
        print(f"✓ 全部通过（{len(all_warnings)} 个文件结构正常）")
        return 0


if __name__ == '__main__':
    sys.exit(main())
