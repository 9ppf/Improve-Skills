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

# Generic class names that should never appear in module content unless they
# belong to the workbench framework itself. See FRAMEWORK_CLASS_WHITELIST.
GENERIC_CLASS_BLACKLIST = {
    'card', 'essay', 'container', 'wrapper', 'box', 'list', 'item', 'title',
    'text', 'button', 'header', 'footer', 'section', 'nav', 'main', 'content',
}

# Class names used by the workbench framework itself. These are allowed even
# if they look generic.
FRAMEWORK_CLASS_WHITELIST = {
    'topbar', 'brand', 'brand-icon', 'topbar-actions', 'theme-toggle', 'menu-toggle',
    'app', 'sidebar', 'sidebar-scroll', 'search', 'search-icon', 'tree',
    'sidebar-footer', 'btn', 'btn-subtle', 'btn-ghost', 'btn-primary', 'btn-icon',
    'btn-edit', 'btn-delete', 'main', 'empty-state', 'content', 'header',
}

# Standalone HTML files that are not integrated into the workbench framework.
# They may use generic class names safely and are excluded from the global scan.
GENERIC_CLASS_GLOBAL_WHITELIST = {
    'Workbench/工作台迁移方案/工作台迁移方案.html',
    'Workbench/自考学习/2025年10月真题字符校准报告.html',
    'Workbench/自考学习/离散数学符号表.html',
    'Workbench/自考学习/备考科目/02324离散数学/真题输出/02324-离散数学-真题题型归类.html',
}

# Ensure the skills directory is on the path so we can import the core module.
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

    Module content classes should carry a module prefix (e.g. reading-*, zk-*).
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
    """Warn if root-level files or Workbench deliverables are missing from 文件说明.md."""
    root = SKILLS_DIR.parent.parent
    doc_path = root / '文件说明.md'
    if not doc_path.exists():
        return ['文件说明.md not found']

    doc_content = doc_path.read_text(encoding='utf-8')
    ignored_root = {'.git', '__pycache__', '.trae-html-share-packages'}
    warnings = []

    # Root-level items
    for item in root.iterdir():
        if item.name in ignored_root:
            continue
        if item.name not in doc_content:
            warnings.append(f'{item.name} is not documented in 文件说明.md')

    # Workbench deliverables (HTML/JSON/PDF/DOC/DOCX) - shallow scan of
    # top-level subject folders is usually enough for documentation purposes.
    workbench = root / 'Workbench'
    if workbench.exists():
        ignored_wb = {'此刻便是春天.html'}
        ignored_dirs = {'data', 'read'}
        # Directories that hold bulk materials documented as a group
        # (e.g. "13000 英语（专升本）历年真题/*.pdf").
        bulk_dirs = {'历年真题'}
        for item in workbench.rglob('*'):
            if item.is_dir():
                continue
            if item.suffix.lower() not in {'.html', '.json', '.pdf', '.doc', '.docx'}:
                continue
            rel = item.relative_to(root)
            rel_parts = item.relative_to(workbench).parts
            # Skip the main entry and raw reading sources which are documented as groups.
            if item.name in ignored_wb or rel_parts[0] in ignored_dirs:
                continue
            # Skip bulk material folders documented as a group.
            if any(bd in part for part in rel_parts for bd in bulk_dirs):
                if '历年真题/*.pdf' in doc_content or '历年真题/*' in doc_content:
                    continue
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
    # Historical files that predate this convention.
    historical = {
        '2025年10月真题字符校准报告.html',
        '离散数学符号表.html',
        '工作台迁移方案.html',
    }

    for item in workbench.rglob('*.html'):
        if item.name in exempt:
            continue
        # Raw reading sources are named by year by design.
        rel_parts = item.relative_to(workbench).parts
        if rel_parts and rel_parts[0] == 'read':
            continue
        if item.name in historical:
            warnings.append(
                f'{item.relative_to(root)} does not follow naming convention '
                f'(historical file, consider renaming)'
            )
            continue
        # Allow names like 02324-离散数学-真题题型归类.html
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
