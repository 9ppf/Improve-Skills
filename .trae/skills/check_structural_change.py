#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
结构性变更校验脚本

用途：检测本次 git 变更是否属于结构性变更，如果是，检查是否已按流程完成方案确认。

触发时机：pre-commit hook 中调用（如果安装了），或手动运行。

判断标准（结构性变更 = 满足以下任一条件）：
1. data/modules/*.json 中有新增/删除的模块或分类项
2. 侧边栏结构变化（模块/分类的增删或移动）
3. 新增 HTML 文件（新页面/新功能入口）
4. 删除已有 HTML 文件
5. workbench.json / self-study.json 等模块注册文件有结构变化

校验内容：
- 如果检测到结构性变更，检查提交信息中是否包含 "[方案已确认]" 标记
- 如果没有，发出警告（advisory），提醒按 structural-change-workflow skill 走流程
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT / 'data' / 'modules'
WORKBENCH_DIR = ROOT / 'Workbench'


def run_git(args):
    """运行 git 命令并返回输出（关闭 quotepath 避免中文文件名被转义）"""
    try:
        result = subprocess.run(
            ['git', '-c', 'core.quotepath=false'] + args,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        return result.stdout.strip()
    except Exception as e:
        return ''


def get_changed_files():
    """获取本次变更的文件列表（staged + unstaged）"""
    # 暂存区的变更
    staged = run_git(['diff', '--cached', '--name-only'])
    # 未暂存的变更
    unstaged = run_git(['diff', '--name-only'])
    # 未追踪的文件
    untracked = run_git(['ls-files', '--others', '--exclude-standard'])

    files = set()
    for line in staged.split('\n'):
        if line.strip():
            files.add(line.strip())
    for line in unstaged.split('\n'):
        if line.strip():
            files.add(line.strip())
    for line in untracked.split('\n'):
        if line.strip():
            files.add(line.strip())

    return files


def is_new_file(filepath):
    """判断文件是否是新增的（git 未追踪）"""
    result = run_git(['ls-files', '--error-unmatch', filepath])
    # 如果文件未追踪，ls-files --error-unmatch 会返回非零退出码
    # 但我们用 result 是否为空来判断
    return result == ''


def detect_structural_changes(changed_files):
    """检测结构性变更，返回 (is_structural, reasons)"""
    reasons = []

    # 1. 检查模块 JSON 配置文件的变更
    module_jsons = [f for f in changed_files
                    if f.startswith('data/modules/') and f.endswith('.json')]
    for mj in module_jsons:
        full_path = ROOT / mj
        if not full_path.exists():
            continue
        try:
            content = json.loads(full_path.read_text(encoding='utf-8'))
            # 检查是否包含模块/分类结构（items / children / categories 等）
            if isinstance(content, list):
                reasons.append(f'模块配置变更：{mj}（可能涉及模块/分类增删）')
            elif isinstance(content, dict):
                if any(k in content for k in ['items', 'children', 'categories', 'modules', 'tabs']):
                    reasons.append(f'模块配置结构变更：{mj}（可能涉及导航结构变化）')
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

    # 2. 新增 HTML 文件（新页面 = 新功能入口）
    html_files = [f for f in changed_files if f.endswith('.html')]
    new_html = [f for f in html_files if is_new_file(f)]
    for nh in new_html:
        if 'temp/' not in nh and '.trae/' not in nh:
            reasons.append(f'新增 HTML 页面：{nh}（新功能入口）')

    # 3. 删除 HTML 文件
    deleted_html = []
    # 用 git diff --cached --diff-filter=D 查删除的文件
    deleted_staged = run_git(['diff', '--cached', '--name-only', '--diff-filter=D'])
    for line in deleted_staged.split('\n'):
        if line.strip() and line.strip().endswith('.html'):
            deleted_html.append(line.strip())

    for dh in deleted_html:
        if 'temp/' not in dh and '.trae/' not in dh:
            reasons.append(f'删除 HTML 页面：{dh}（功能入口移除）')

    # 4. 侧边栏相关模板变更
    sidebar_files = [f for f in changed_files
                     if ('sidebar' in f.lower() or 'nav' in f.lower() or 'menu' in f.lower())
                     and f.endswith(('.html', '.py', '.js'))]
    for sf in sidebar_files:
        if 'templates/' in sf or 'transformers/' in sf:
            reasons.append(f'侧边栏/导航模板变更：{sf}（可能影响导航结构）')

    # 5. build.py 变更（可能影响整体结构）
    if 'build.py' in changed_files:
        reasons.append('build.py 变更（可能影响构建结构和页面生成方式）')

    return len(reasons) > 0, reasons


def check_commit_message_has_confirmation():
    """检查提交信息中是否有方案确认标记"""
    # 尝试从环境变量或 git 配置中获取当前提交信息
    # pre-commit 时还没有 commit message，所以检查暂存区是否有方案文档
    # 或者检查是否存在 .structural-change-approved 文件

    approved_file = ROOT / '.structural-change-approved'
    if approved_file.exists():
        return True, approved_file.read_text(encoding='utf-8').strip()

    return False, ''


def main():
    strict = '--strict' in sys.argv

    changed_files = get_changed_files()
    if not changed_files:
        return 0

    is_structural, reasons = detect_structural_changes(changed_files)

    if not is_structural:
        return 0

    # 检测到结构性变更
    has_approval, approval_info = check_commit_message_has_confirmation()

    warnings = []
    warnings.append('检测到结构性变更：')
    for reason in reasons:
        warnings.append(f'  - {reason}')

    if has_approval:
        warnings.append(f'方案确认标记：{approval_info}')
    else:
        warnings.append('⚠ 未检测到方案确认标记')
        warnings.append('  请按 structural-change-workflow skill 流程：')
        warnings.append('  1. 先列方案（含完成标准）')
        warnings.append('  2. 用户确认后再执行')
        warnings.append('  3. 确认后在项目根目录创建 .structural-change-approved 文件')
        warnings.append('     内容为用户确认的方案摘要')
        warnings.append('  4. 提交后删除该文件')

    for w in warnings:
        print(f'  - {w}' if w.startswith('  ') else w)

    # 结构性变更未确认时，strict 模式下返回非零
    if strict and not has_approval:
        print('\n❌ 结构性变更未经过方案确认流程，提交被阻止。')
        print('   请先按 structural-change-workflow skill 完成方案确认。')
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
