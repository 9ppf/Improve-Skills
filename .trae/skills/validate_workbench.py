#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate the 此刻便是春天 workbench for style consistency.

This script is the implementation of方案 B: after any integration or manual
edit, run it to catch regressions such as:
  - old standalone class names leaking into reading content
  - JS syntax errors
  - missing or mismatched reading content
"""

import re
import sys
from pathlib import Path

# 通用 class 黑名单：模块内容中不应直接使用这些过于宽泛的类名
GENERIC_CLASS_BLACKLIST = {
    'card', 'essay', 'container', 'wrapper', 'box', 'list', 'item', 'title',
    'text', 'button', 'header', 'footer', 'section', 'nav', 'main', 'content',
}

# 框架自身使用的 class 白名单：即使命中黑名单也允许存在
FRAMEWORK_CLASS_WHITELIST = {
    'topbar', 'brand', 'brand-icon', 'topbar-actions', 'theme-toggle', 'menu-toggle',
    'app', 'sidebar', 'sidebar-scroll', 'search', 'search-icon', 'tree',
    'sidebar-footer', 'btn', 'btn-subtle', 'btn-ghost', 'btn-primary', 'btn-icon',
    'btn-edit', 'btn-delete', 'main', 'empty-state', 'content', 'header',
}

# 不参与全局扫描的独立 HTML 文件白名单
GENERIC_CLASS_GLOBAL_WHITELIST = {
    'Workbench/工作台迁移方案/工作台迁移方案-说明.html',
}

# 确保 skills 目录自身在 sys.path 中，方便导入核心模块
SKILLS_DIR = Path(__file__).resolve().parent
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    WORKBENCH,
    READ_DIR,
    OLD_CLASSES,
    build_reading_html,
    count_sections,
    count_essays,
    validate_js,
)


def check_js_syntax(html: str) -> list[str]:
    """Validate embedded JavaScript syntax."""
    errors = []
    try:
        validate_js(html)
    except SyntaxError as exc:
        errors.append(f'JS syntax error: {exc}')
    except FileNotFoundError:
        print('  [warn] node is not available; skipping JS syntax validation')
    return errors


def check_no_old_classes(html: str) -> list[str]:
    """Ensure old standalone class names do not appear in the workbench."""
    errors = []
    for old_class in OLD_CLASSES:
        pattern = re.compile(rf'class="{re.escape(old_class)}"')
        matches = list(pattern.finditer(html))
        if matches:
            for m in matches[:3]:
                snippet = html[max(0, m.start() - 40):m.end() + 40].replace('\n', ' ')
                errors.append(f'Old class found: ...{snippet}...')
            if len(matches) > 3:
                errors.append(f'  ({len(matches) - 3} more occurrences of class="{old_class}")')
    return errors


def check_generic_class_prefixes(html: str) -> list[str]:
    """Ensure dangerous generic class names do not leak into module content.

    Module content classes should carry a module prefix (e.g. reading-*).
    Generic names like 'card' or 'essay' are reserved for the workbench
    framework or must be prefixed to avoid CSS collisions.
    """
    errors = []
    for match in re.finditer(r'class="([^"]+)"', html):
        for cls in match.group(1).split():
            if cls in GENERIC_CLASS_BLACKLIST and cls not in FRAMEWORK_CLASS_WHITELIST:
                snippet = html[max(0, match.start() - 30):match.end() + 30].replace('\n', ' ')
                errors.append(f'Generic class found: .{cls} in ...{snippet}...')
    return errors


def check_dynamic_classes_in_js(html: str) -> list[str]:
    """Scan embedded JS for string literals that contain blacklisted class names.

    This catches dynamically generated class names such as those in template
    literals or className assignments, which static HTML scans miss.
    """
    errors = []
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    js = '\n'.join(scripts)

    # 扫描可能包含 HTML 标记的字符串字面量，只检查其中的 class 属性值
    html_literal_pattern = re.compile(r"['\"`]([^'\"`\n]{0,500})['\"`]")
    class_attr_pattern = re.compile(r'class\s*=\s*["\']([^"\']+)["\']')
    for match in html_literal_pattern.finditer(js):
        text = match.group(1)
        if '<' not in text and 'class' not in text:
            continue
        for cls_attr in class_attr_pattern.findall(text):
            for cls in cls_attr.split():
                if cls in GENERIC_CLASS_BLACKLIST and cls not in FRAMEWORK_CLASS_WHITELIST:
                    snippet = js[max(0, match.start() - 40):match.end() + 40].replace('\n', ' ')
                    errors.append(f'Generic class found in JS: .{cls} in ...{snippet}...')
    return errors


def check_generic_class_prefixes_global() -> list[str]:
    """Scan all Workbench HTML sources for generic class names.

    The built workbench entry is checked separately by check_generic_class_prefixes.
    Raw reading sources are transformed by reading_integration and are also excluded
    here. This function catches generic classes in module output files before they
    are integrated into the workbench.
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    for item in workbench.rglob('*.html'):
        rel = str(item.relative_to(root)).replace('\\', '/')
        # 跳过已构建入口与阅读源文件
        if rel == 'Workbench/此刻便是春天.html':
            continue
        if rel.startswith('Workbench/read/'):
            continue
        if rel in GENERIC_CLASS_GLOBAL_WHITELIST:
            continue

        try:
            content = item.read_text(encoding='utf-8')
        except OSError as exc:
            warnings.append(f'Could not read {rel}: {exc}')
            continue

        found: set[str] = set()
        for match in re.finditer(r'class="([^"]+)"', content):
            for cls in match.group(1).split():
                if cls in GENERIC_CLASS_BLACKLIST and cls not in FRAMEWORK_CLASS_WHITELIST:
                    found.add(cls)
        if found:
            warnings.append(
                f'{rel} uses generic classes: {", ".join(sorted(found))}'
            )

    return warnings


def check_tab_integrity_global() -> list[str]:
    """Scan all Workbench HTML sources for incomplete Tab implementations.

    If a page uses chapter-tab-btn/chapter-tab-pane, it must also define the
    corresponding CSS selectors and include the switching JavaScript. This
    catches regressions where the DOM is transformed but the styles or JS are
    accidentally dropped by an automation script.
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    errors = []
    if not workbench.exists():
        return errors

    required_css = {
        '.chapter-tabs {': 'chapter-tabs container CSS',
        '.chapter-tab-btn {': 'chapter-tab-btn CSS',
        '.chapter-tab-pane {': 'chapter-tab-pane CSS',
    }

    for item in workbench.rglob('*.html'):
        rel = str(item.relative_to(root)).replace('\\', '/')
        if rel == 'Workbench/此刻便是春天.html':
            continue
        if rel.startswith('Workbench/read/'):
            continue
        if rel in GENERIC_CLASS_GLOBAL_WHITELIST:
            continue

        try:
            content = item.read_text(encoding='utf-8')
        except OSError as exc:
            errors.append(f'Could not read {rel}: {exc}')
            continue

        has_btns = 'class="chapter-tab-btn"' in content
        has_panes = 'class="chapter-tab-pane' in content
        if not (has_btns or has_panes):
            continue

        missing = []
        for marker, name in required_css.items():
            if marker not in content:
                missing.append(name)
        if has_btns and 'switchTab' not in content and 'tabBtns' not in content:
            missing.append('Tab switching JS')

        if missing:
            errors.append(f'{rel}: incomplete Tab implementation (missing {", ".join(missing)})')

    return errors


def check_reading_content(html: str) -> list[str]:
    """Verify every read/YYYY.html source is present and correctly transformed."""
    errors = []
    source_files = sorted(
        (p for p in READ_DIR.glob('2*.html') if p.stem.isdigit()),
        reverse=True,
    )

    for source_path in source_files:
        year = int(source_path.stem)
        source_html = source_path.read_text(encoding='utf-8')
        expected_sections = count_sections(source_html)
        expected_essays = count_essays(source_html)

        transformed = build_reading_html(source_html)
        # 转换后统计 reading-section 与 reading-essay 数量，与源文件对比
        actual_sections = len(re.findall(r'<div class="reading-section(?:\s+[^"]+)?"', transformed))
        actual_essays = len(re.findall(r'<div class="reading-essay">', transformed))

        if actual_sections != expected_sections:
            errors.append(
                f'{year}: transformed section count mismatch '
                f'(source {expected_sections}, transformed {actual_sections})'
            )
        if actual_essays != expected_essays:
            errors.append(
                f'{year}: transformed essay count mismatch '
                f'(source {expected_essays}, transformed {actual_essays})'
            )

        if f'const readingHtml{year} = `' not in html:
            errors.append(f'{year}: readingHtml{year} constant not found in workbench')
            continue

        if transformed not in html:
            errors.append(
                f'{year}: transformed content does not match the workbench entry '
                f'(expected {len(transformed)} chars)'
            )

    return errors


def check_workspace_integrity(html: str) -> list[str]:
    """Verify that the reading workspace and helper functions exist."""
    errors = []
    required = {
        "id: 'read'": 'reading workspace',
        "function isReadingItem": 'isReadingItem helper',
        "function renderReadingContent": 'renderReadingContent helper',
        "function toggleReadingSection": 'toggleReadingSection helper',
        "key: 'content', label: '内容'": 'reading content tab',
    }
    for marker, name in required.items():
        if marker not in html:
            errors.append(f'Missing {name}: {marker}')
    return errors


def check_file_documentation() -> list[str]:
    """Warn if root-level files or top-level Workbench modules are missing from 文件说明.md.

    Deeply nested materials (e.g. individual PDFs inside a subject folder) are
    documented as a group rather than checked one by one, keeping the scan fast
    and stable as the project grows.
    """
    root = SKILLS_DIR.parent.parent
    doc_path = root / '文件说明.md'
    if not doc_path.exists():
        return ['文件说明.md not found']

    doc_content = doc_path.read_text(encoding='utf-8')
    ignored_root = {'.git', '__pycache__', '.trae-html-share-packages'}
    warnings = []

    # 检查根级条目是否被文档提及
    for item in root.iterdir():
        if item.name in ignored_root:
            continue
        if item.name not in doc_content:
            warnings.append(f'{item.name} is not documented in 文件说明.md')

    # 仅检查 Workbench 顶层模块与文件
    workbench = root / 'Workbench'
    if workbench.exists():
        ignored_wb = {'此刻便是春天.html'}
        ignored_dirs = {'data', 'read'}
        for item in workbench.iterdir():
            rel = item.relative_to(root)
            # 跳过主入口、生成输出与原始源文件分组
            if item.name in ignored_wb or item.name in ignored_dirs:
                continue
            # 顶层模块按文件夹名检查文档
            if item.is_dir():
                if item.name not in doc_content:
                    warnings.append(f'{rel} is not documented in 文件说明.md')
                continue
            # 顶层文件需要单独在文档中说明
            if item.suffix.lower() in {'.html', '.json', '.pdf', '.doc', '.docx'}:
                if str(rel) not in doc_content and item.name not in doc_content:
                    warnings.append(f'{rel} is not documented in 文件说明.md')

    return warnings


def check_naming_conventions() -> list[str]:
    """Warn if Workbench HTML files do not follow the {子模块}-{任务}.html rule.

    The main entry page and historical files are exempt. New module output
    files should follow the convention.
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    exempt = {'此刻便是春天.html'}


    for item in workbench.rglob('*.html'):
        if item.name in exempt:
            continue
        # 阅读源文件按年份命名，属于设计例外
        rel_parts = item.relative_to(workbench).parts
        if rel_parts and rel_parts[0] == 'read':
            continue
        # 文件名中应包含“-”以符合 {子模块}-{任务}.html 约定
        if '-' not in item.stem:
            warnings.append(
                f'{item.relative_to(root)} does not follow naming convention '
                f'{{子模块}}-{{任务}}.html'
            )

    return warnings


def check_workbench_structure() -> list[str]:
    """Ensure Workbench/ does not contain temporary scripts or debug outputs."""
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    errors = []
    if not workbench.exists():
        return ['Workbench directory not found']

    for ext in ('.py', '.ps1', '.sh', '.log'):
        matches = [p for p in workbench.rglob(f'*{ext}') if p.is_file()]
        if matches:
            for p in matches[:3]:
                errors.append(f'Workbench contains temporary file: {p.relative_to(root)}')
            if len(matches) > 3:
                errors.append(f'  ({len(matches) - 3} more temporary files with {ext})')
    return errors


def check_git_config() -> list[str]:
    """Ensure .gitignore and .gitattributes cover required patterns."""
    root = SKILLS_DIR.parent.parent
    errors = []

    gitignore = root / '.gitignore'
    if not gitignore.exists():
        errors.append('.gitignore not found')
    else:
        content = gitignore.read_text(encoding='utf-8')
        required_patterns = [
            'Workbench/此刻便是春天.html',
            '__pycache__/',
            'temp/',
            '.trae-html-share-packages/',
        ]
        for pattern in required_patterns:
            if pattern not in content:
                errors.append(f'.gitignore missing required pattern: {pattern}')

    gitattributes = root / '.gitattributes'
    if not gitattributes.exists():
        errors.append('.gitattributes not found')
    else:
        content = gitattributes.read_text(encoding='utf-8')
        required_patterns = ['*.pdf', '*.doc', '*.docx', '*.png']
        for pattern in required_patterns:
            if pattern not in content:
                errors.append(f'.gitattributes missing required pattern: {pattern}')

    return errors


def check_temp_directory_exists() -> list[str]:
    """Warn if the temp/ directory is missing."""
    root = SKILLS_DIR.parent.parent
    temp_dir = root / 'temp'
    if not temp_dir.exists():
        return ['temp/ directory not found; create it for intermediate files']
    return []


def validate(html: str) -> list[str]:
    """Run all validation checks and return a list of errors."""
    errors = []
    errors.extend(check_js_syntax(html))
    errors.extend(check_no_old_classes(html))
    errors.extend(check_generic_class_prefixes(html))
    errors.extend(check_dynamic_classes_in_js(html))
    errors.extend(check_reading_content(html))
    errors.extend(check_workspace_integrity(html))
    errors.extend(check_workbench_structure())
    errors.extend(check_git_config())
    errors.extend(check_temp_directory_exists())
    return errors


def main() -> int:
    if not WORKBENCH.exists():
        print(f'Workbench not found: {WORKBENCH}', file=sys.stderr)
        return 1

    html = WORKBENCH.read_text(encoding='utf-8')
    errors = validate(html)

    # 全局 Tab 完整性检查：针对所有 Workbench HTML 源文件
    errors.extend(check_tab_integrity_global())

    # 文档、命名与全局 class 检查作为警告而非致命错误
    doc_warnings = check_file_documentation()
    naming_warnings = check_naming_conventions()
    generic_global_warnings = check_generic_class_prefixes_global()
    all_warnings = doc_warnings + naming_warnings + generic_global_warnings
    if all_warnings:
        print('Warnings:')
        for warn in all_warnings:
            print(f'  - {warn}')

    if errors:
        print('Validation failed:')
        for err in errors:
            print(f'  - {err}')
        return 1

    print('Validation passed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
