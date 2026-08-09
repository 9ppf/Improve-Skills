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
    """Warn if root-level files are missing from 文件说明.md."""
    root = SKILLS_DIR.parent.parent
    doc_path = root / '文件说明.md'
    if not doc_path.exists():
        return ['文件说明.md not found']

    doc_content = doc_path.read_text(encoding='utf-8')
    ignored = {'.git', '__pycache__', '.trae-html-share-packages'}
    warnings = []

    for item in root.iterdir():
        if item.name in ignored:
            continue
        if item.name not in doc_content:
            warnings.append(f'{item.name} is not documented in 文件说明.md')

    return warnings


def validate(html: str) -> list[str]:
    """Run all validation checks and return a list of errors."""
    errors = []
    errors.extend(check_js_syntax(html))
    errors.extend(check_no_old_classes(html))
    errors.extend(check_reading_content(html))
    errors.extend(check_workspace_integrity(html))
    return errors


def main() -> int:
    if not WORKBENCH.exists():
        print(f'Workbench not found: {WORKBENCH}', file=sys.stderr)
        return 1

    html = WORKBENCH.read_text(encoding='utf-8')
    errors = validate(html)

    doc_warnings = check_file_documentation()
    if doc_warnings:
        print('Documentation warnings:')
        for warn in doc_warnings:
            print(f'  - {warn}')

    if errors:
        print('Validation failed:')
        for err in errors:
            print(f'  - {err}')
        return 1

    print('Validation passed: JS syntax OK, no old classes, reading content intact.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
