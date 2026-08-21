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
import os
import subprocess
import sys
import tempfile
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


def check_js_syntax_global() -> list[str]:
    """扫描 Workbench/ 下所有 HTML 文件的内嵌 JS 语法。

    主工作台文件由 check_js_syntax 单独校验，本函数覆盖通过 iframe
    加载的内容页（如背诵卡、真题练习等），确保内嵌数据中的引号转义、
    语法错误能被构建阶段拦截。

    使用独立临时文件而非 validate_js 的共享文件，避免 Windows 下
    反复写入同一文件导致的句柄冲突。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    errors = []
    if not workbench.exists():
        return errors

    node_available = True
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

        if '<script' not in content:
            continue

        # 提取所有 script 块的 JS 代码
        scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
        js = '\n'.join(scripts)
        if not js.strip():
            continue

        # 使用独立临时文件，避免共享文件句柄冲突
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.js', encoding='utf-8', delete=False
        ) as tmp:
            tmp.write(js)
            tmp_path = tmp.name

        try:
            result = subprocess.run(
                ['node', '--check', tmp_path],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode != 0:
                first_line = result.stderr.strip().split('\n')[0] if result.stderr else 'unknown'
                errors.append(f'{rel}: JS syntax error: {first_line}')
        except FileNotFoundError:
            if node_available:
                print('  [warn] node is not available; skipping global JS syntax validation')
                node_available = False
        except subprocess.TimeoutExpired:
            errors.append(f'{rel}: JS syntax check timed out')
        finally:
            Path(tmp_path).unlink(missing_ok=True)

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


# CJK 统一汉字 Unicode 范围，用于检测注释是否包含中文
CJK_PATTERN = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf]')


def extract_comments(content: str, filetype: str) -> list[str]:
    """从代码中提取注释文本，支持 SASS / Python / JS 注释格式。"""
    comments = []

    if filetype == 'scss':
        # SASS 单行注释 //
        for line in content.split('\n'):
            stripped = line.strip()
            if stripped.startswith('//'):
                comments.append(stripped[2:].strip())
        # SASS 多行注释 /* */
        for match in re.finditer(r'/\*(.*?)\*/', content, re.DOTALL):
            comments.append(match.group(1).strip())

    elif filetype == 'py':
        # Python 单行注释 #（跳过 shebang 和编码声明）
        for line in content.split('\n'):
            stripped = line.strip()
            if stripped.startswith('#') and not stripped.startswith('#!') and 'coding' not in stripped:
                comments.append(stripped[1:].strip())
        # Python docstring
        for match in re.finditer(r'"""(.*?)"""', content, re.DOTALL):
            comments.append(match.group(1).strip())
        for match in re.finditer(r"'''(.*?)'''", content, re.DOTALL):
            comments.append(match.group(1).strip())

    elif filetype == 'js':
        # JS 单行注释 //
        for line in content.split('\n'):
            stripped = line.strip()
            if stripped.startswith('//'):
                comments.append(stripped[2:].strip())
        # JS 多行注释 /* */
        for match in re.finditer(r'/\*(.*?)\*/', content, re.DOTALL):
            comments.append(match.group(1).strip())

    return [c for c in comments if c]


def check_chinese_comments() -> list[str]:
    """检查 SASS / Python / JS 代码注释是否包含中文。

    约束要求：Python / JS / SASS 代码必须包含中文注释，
    说明复杂逻辑、正则、边界处理与外部调用用途。

    扫描所有 .scss / .py 文件、Workbench HTML 和 templates/ HTML 中的 <script> 块，
    如果文件包含注释但没有任何中文注释，则发出警告。
    """
    root = SKILLS_DIR.parent.parent
    warnings = []

    # --- 检查 SASS 文件 ---
    styles_dir = root / 'styles'
    if styles_dir.exists():
        for f in sorted(styles_dir.glob('*.scss')):
            try:
                content = f.read_text(encoding='utf-8')
            except OSError:
                continue
            comments = extract_comments(content, 'scss')
            if comments and not any(CJK_PATTERN.search(c) for c in comments):
                warnings.append(f'{f.relative_to(root)}: 注释全部为非中文，违反中文注释约束')

    # --- 检查 Python 文件（根目录 + .trae/skills/）---
    for py_dir in [root, SKILLS_DIR]:
        for f in sorted(py_dir.glob('*.py')):
            try:
                content = f.read_text(encoding='utf-8')
            except OSError:
                continue
            comments = extract_comments(content, 'py')
            if comments and not any(CJK_PATTERN.search(c) for c in comments):
                warnings.append(f'{f.relative_to(root)}: 注释全部为非中文，违反中文注释约束')

    # --- 检查 Workbench HTML 的 <script> 块 ---
    workbench = root / 'Workbench'
    if workbench.exists():
        for item in sorted(workbench.rglob('*.html')):
            rel = str(item.relative_to(root)).replace('\\', '/')
            if rel == 'Workbench/此刻便是春天.html':
                continue
            if rel.startswith('Workbench/read/'):
                continue
            if rel in GENERIC_CLASS_GLOBAL_WHITELIST:
                continue

            try:
                content = item.read_text(encoding='utf-8')
            except OSError:
                continue

            if '<script' not in content:
                continue

            scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
            js = '\n'.join(scripts)
            if not js.strip():
                continue

            comments = extract_comments(js, 'js')
            if comments and not any(CJK_PATTERN.search(c) for c in comments):
                warnings.append(f'{rel}: JS 注释全部为非中文，违反中文注释约束')

    # --- 检查 templates/ 目录 HTML 的 <script> 块 ---
    templates_dir = root / 'templates'
    if templates_dir.exists():
        for f in sorted(templates_dir.glob('*.html')):
            try:
                content = f.read_text(encoding='utf-8')
            except OSError:
                continue

            if '<script' not in content:
                continue

            scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
            js = '\n'.join(scripts)
            if not js.strip():
                continue

            comments = extract_comments(js, 'js')
            if comments and not any(CJK_PATTERN.search(c) for c in comments):
                rel = str(f.relative_to(root)).replace('\\', '/')
                warnings.append(f'{rel}: JS 注释全部为非中文，违反中文注释约束')

    return warnings


def check_backup_count() -> list[str]:
    """检查 Workbench/ 下的备份文件不超过 3 份。

    约束要求：旧备份未超过 3 份。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    backups = sorted(workbench.glob('*.bak-*'))
    if len(backups) > 3:
        warnings.append(
            f'Workbench/ 下有 {len(backups)} 份备份文件，超过 3 份限制，建议清理旧备份'
        )
    return warnings


def check_json_html_naming() -> list[str]:
    """检查 Workbench/ 下 JSON 文件与对应 HTML 文件同名。

    约束要求：JSON 文件名与对应 HTML 同名。
    如果同一目录下存在 .json 文件，检查是否有同名的 .html 文件。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    # 纯数据 JSON 文件白名单：这些文件是数据源而非页面配置，不需要同名 HTML
    data_only_json = {'ai-news-data.json'}

    for item in sorted(workbench.rglob('*.json')):
        rel = str(item.relative_to(root)).replace('\\', '/')
        # 跳过 read/ 目录
        if rel.startswith('Workbench/read/'):
            continue
        # 跳过备份目录
        if '_备份_' in rel:
            continue
        # 跳过纯数据文件
        if item.name in data_only_json:
            continue

        html_sibling = item.with_suffix('.html')
        if not html_sibling.exists():
            warnings.append(
                f'{rel}: 没有对应的 HTML 文件 {item.stem}.html，违反 JSON 与 HTML 同名约束'
            )
    return warnings


def check_date_format() -> list[str]:
    """检查文件名和文件夹名中的日期格式使用 YYYY.MM。

    约束要求：年份格式使用 YYYY.MM。
    扫描 Workbench/ 下的文件和文件夹名，检测 YYYY-MM 或 YYYY/MM 格式。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    # 匹配 YYYY-MM 或 YYYY/MM（应改为 YYYY.MM）
    bad_date_pattern = re.compile(r'(\d{4})[-/](\d{1,2})\b')

    for item in workbench.rglob('*'):
        name = item.name
        # 跳过备份文件（使用 YYYYMMDD_HHMMSS 格式，属设计例外）
        if '.bak-' in name:
            continue
        # 跳过 read/ 目录下的年份文件（如 2026.html，仅年份非日期）
        rel_parts = item.relative_to(workbench).parts
        if rel_parts and rel_parts[0] == 'read':
            continue

        match = bad_date_pattern.search(name)
        if match:
            rel = str(item.relative_to(root)).replace('\\', '/')
            warnings.append(
                f'{rel}: 日期格式应为 YYYY.MM，当前为 {match.group(0)}'
            )
    return warnings


def check_folder_naming() -> list[str]:
    """检查 Workbench/ 下的文件夹优先使用中文命名。

    约束要求：文件夹优先使用中文命名，必要时改用拼音。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    # 允许使用英文名的目录白名单（read 为批量阅读文件目录，ai-learning 为 AI 学习模块约定目录）
    english_dir_whitelist = {'read', 'ai-learning'}

    for item in sorted(workbench.iterdir()):
        if not item.is_dir():
            continue
        if item.name in english_dir_whitelist:
            continue
        if not CJK_PATTERN.search(item.name):
            warnings.append(
                f'{item.name}/: 文件夹名未使用中文，违反中文命名约束'
            )
    return warnings


def check_interactive_styles_global() -> list[str]:
    """检查交互组件的 CSS 样式完整性。

    约束要求：新增 Tab、折叠、弹窗等交互组件后，
    已检查 .active、显示/隐藏、响应式断点三类样式是否存在。

    检测页面中 JS 使用 .active 类或显示/隐藏切换时，
    验证对应的 CSS 样式是否已定义。
    """
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    warnings = []
    if not workbench.exists():
        return warnings

    for item in sorted(workbench.rglob('*.html')):
        rel = str(item.relative_to(root)).replace('\\', '/')
        if rel == 'Workbench/此刻便是春天.html':
            continue
        if rel.startswith('Workbench/read/'):
            continue
        if rel in GENERIC_CLASS_GLOBAL_WHITELIST:
            continue
        # 跳过备份目录（_备份_YYYYMMDD_HHMMSS）
        if '_备份_' in rel:
            continue

        try:
            content = item.read_text(encoding='utf-8')
        except OSError:
            continue

        # 提取 CSS 和 JS
        css_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
        css = '\n'.join(css_blocks)
        scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
        js = '\n'.join(scripts)

        if not js.strip():
            continue

        # 检测是否有交互组件
        has_interactive = (
            'classList.toggle' in js or
            'classList.add' in js or
            'classList.remove' in js or
            'style.display' in js
        )
        if not has_interactive:
            continue

        # 检查 .active 样式：JS 使用 active 类时 CSS 应定义 .active 规则
        uses_active = "'active'" in js or '"active"' in js
        if uses_active:
            has_active_css = re.search(r'\.active\s*\{', css) is not None
            if not has_active_css:
                warnings.append(f'{rel}: JS 使用 .active 类但 CSS 未定义 .active 样式')

        # 检查显示/隐藏样式：JS 切换显示状态时 CSS 应有隐藏规则
        uses_display = 'style.display' in js
        uses_hidden = "'hidden'" in js or '"hidden"' in js
        if uses_display or uses_hidden:
            has_hide_css = (
                'display: none' in css or 'display:none' in css or
                '.hidden' in css or 'visibility: hidden' in css or
                'visibility:hidden' in css
            )
            if not has_hide_css:
                warnings.append(f'{rel}: JS 使用显示/隐藏切换但 CSS 未定义隐藏样式')

    return warnings


def check_directory_structure_sync() -> list[str]:
    """检查实际文件系统与 AGENT_HANDOFF.md 目录结构是否同步。

    扫描根目录、styles/、Workbench/ 各模块、data/modules/、templates/、
    .trae/skills/、transformers/ 等关键目录，
    对比 AGENT_HANDOFF.md 中是否已列出，防止文档过时。
    同时检查 CHANGELOG.md 版本与 AGENT_HANDOFF.md 当前版本是否一致。
    """
    root = SKILLS_DIR.parent.parent
    handoff_path = root / 'AGENT_HANDOFF.md'
    if not handoff_path.exists():
        return ['AGENT_HANDOFF.md not found']

    handoff_content = handoff_path.read_text(encoding='utf-8')
    warnings = []

    # 备份文件和临时文件不检查
    def is_backup(name: str) -> bool:
        return '.bak-' in name or name.startswith('~')

    # 忽略不需要检查的根目录项
    ignored_root = {'.git', '__pycache__', '.trae-html-share-packages'}
    for item in sorted(root.iterdir()):
        if item.name in ignored_root or is_backup(item.name):
            continue
        if item.name not in handoff_content:
            warnings.append(f'根目录项 {item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 styles/ 目录
    styles_dir = root / 'styles'
    if styles_dir.exists():
        for item in sorted(styles_dir.iterdir()):
            if item.is_file() and item.suffix == '.scss':
                if item.name not in handoff_content:
                    warnings.append(f'styles/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 Workbench/ 顶层子目录和 HTML 文件
    workbench_dir = root / 'Workbench'
    if workbench_dir.exists():
        for item in sorted(workbench_dir.iterdir()):
            if is_backup(item.name):
                continue
            if item.name not in handoff_content:
                warnings.append(f'Workbench/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

        # 检查 Workbench 各模块下的内容文件（HTML / JSON）
        # read/ 目录包含按年份批量命名的阅读文件，目录已用 "2019 ~ 2026" 说明，跳过逐文件检查
        skip_content_scan = {'read'}
        for module_dir in sorted(workbench_dir.iterdir()):
            if not module_dir.is_dir() or is_backup(module_dir.name):
                continue
            if module_dir.name in skip_content_scan:
                continue
            for item in sorted(module_dir.iterdir()):
                if is_backup(item.name):
                    continue
                if item.is_file() and item.suffix in ('.html', '.json'):
                    if item.name not in handoff_content:
                        warnings.append(
                            f'Workbench/{module_dir.name}/{item.name} '
                            f'未在 AGENT_HANDOFF.md 目录结构中列出')

        # 检查 自考学习/ 子目录
        zikao_dir = workbench_dir / '自考学习'
        if zikao_dir.exists():
            for item in sorted(zikao_dir.iterdir()):
                if item.is_dir() and not is_backup(item.name):
                    if item.name not in handoff_content:
                        warnings.append(
                            f'自考学习/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

            # 检查 备考科目/ 子目录
            beikao_dir = zikao_dir / '备考科目'
            if beikao_dir.exists():
                for item in sorted(beikao_dir.iterdir()):
                    if item.is_dir() and not is_backup(item.name):
                        if item.name not in handoff_content:
                            warnings.append(
                                f'备考科目/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

            # 检查 未考科目/ 子目录
            weikao_dir = zikao_dir / '未考科目'
            if weikao_dir.exists():
                for item in sorted(weikao_dir.iterdir()):
                    if item.is_dir() and not is_backup(item.name):
                        if item.name not in handoff_content:
                            warnings.append(
                                f'未考科目/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 data/modules/ 下的 JSON 文件
    modules_dir = root / 'data' / 'modules'
    if modules_dir.exists():
        for item in sorted(modules_dir.iterdir()):
            if item.is_file() and item.suffix == '.json':
                if item.name not in handoff_content:
                    warnings.append(
                        f'data/modules/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 templates/ 下的文件
    templates_dir = root / 'templates'
    if templates_dir.exists():
        for item in sorted(templates_dir.iterdir()):
            if item.is_file() and not is_backup(item.name):
                if item.name not in handoff_content:
                    warnings.append(
                        f'templates/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 .trae/skills/ 下的 Python 文件
    for item in sorted(SKILLS_DIR.iterdir()):
        if item.is_file() and item.suffix == '.py':
            if item.name not in handoff_content:
                warnings.append(
                    f'.trae/skills/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')
        elif item.is_dir() and not is_backup(item.name):
            # 检查子目录是否在文档中列出
            if item.name not in handoff_content:
                warnings.append(
                    f'.trae/skills/{item.name}/ 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 transformers/ 下的文件
    transformers_dir = root / 'transformers'
    if transformers_dir.exists():
        for item in sorted(transformers_dir.iterdir()):
            if item.is_file() and not is_backup(item.name):
                if item.name not in handoff_content:
                    warnings.append(
                        f'transformers/{item.name} 未在 AGENT_HANDOFF.md 目录结构中列出')

    # 检查 CHANGELOG.md 版本是否与 AGENT_HANDOFF.md 一致
    changelog_path = root / 'CHANGELOG.md'
    if changelog_path.exists():
        changelog_content = changelog_path.read_text(encoding='utf-8')
        # 从 AGENT_HANDOFF.md 提取当前版本号
        version_match = re.search(r'当前版本[：:]\s*(v[\d.]+)', handoff_content)
        if version_match:
            current_version = version_match.group(1)
            # 检查 CHANGELOG.md 是否包含该版本号标题
            if f'## {current_version}' not in changelog_content:
                warnings.append(f'CHANGELOG.md 未包含当前版本 {current_version} 的变更记录')

    return warnings


def check_changelog_coverage() -> list[str]:
    """检查 git 已修改文件是否都在 CHANGELOG.md 最新版本中记录。

    通过 git diff HEAD --name-only 获取已修改的已跟踪文件，
    对比 CHANGELOG.md 最新版本章节中列出的文件路径，
    报告未在 CHANGELOG 中记录的已修改文件，防止变更信息散落。
    """
    import fnmatch

    root = SKILLS_DIR.parent.parent
    changelog_path = root / 'CHANGELOG.md'
    if not changelog_path.exists():
        return ['CHANGELOG.md not found']

    # 查找可用的 git 可执行文件：先尝试 PATH 中的 git，回退到已知安装路径
    git_candidates = ['git', r'E:\Git\Git\cmd\git.exe']
    git_exe = None
    for candidate in git_candidates:
        try:
            subprocess.run([candidate, '--version'], capture_output=True, timeout=10)
            git_exe = candidate
            break
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    if git_exe is None:
        return []  # git 不可用，跳过检查

    # 获取相对于 HEAD 的所有已修改文件（含暂存和未暂存）
    try:
        result = subprocess.run(
            [git_exe, '-C', str(root), '-c', 'core.quotepath=false',
             'diff', 'HEAD', '--name-only'],
            capture_output=True, text=True, timeout=30,
        )
    except subprocess.TimeoutExpired:
        return []

    if not result.stdout.strip():
        return []  # 无修改文件

    modified_files = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]

    # 排除不需要在 CHANGELOG 中记录的文件
    skip_files = {
        'CHANGELOG.md',                # 变更日志本身
        'Workbench/此刻便是春天.html',   # 构建产物，源码变更已记录
    }
    modified_files = [f for f in modified_files if f not in skip_files]

    if not modified_files:
        return []

    # 解析 CHANGELOG.md，提取最新版本章节内容
    # 按 ## vX.X.X 分割，第一段是文件头部，之后交替为 [版本号, 内容, ...]
    changelog_content = changelog_path.read_text(encoding='utf-8')
    version_parts = re.split(r'\n## (v[\d.]+)\b', changelog_content)
    if len(version_parts) < 3:
        return []  # 没有版本章节

    latest_version = version_parts[1]
    latest_content = version_parts[2]
    # 截取到下一个版本章节（分隔线 --- 之前的内容属于当前版本）
    if '\n---\n' in latest_content:
        latest_content = latest_content.split('\n---\n')[0]

    # 从最新版本章节中提取所有反引号包裹的文件路径
    changelog_entries = re.findall(r'`([^`]+)`', latest_content)

    # 拆分被顿号/逗号连接的多个路径，清理括号说明
    changelog_paths = []
    for entry in changelog_entries:
        parts = re.split(r'[、,]', entry)
        for part in parts:
            part = part.strip()
            # 去除尾部括号说明（如 "styles/*.scss（9 个文件）"）
            part = re.sub(r'[（(].*$', '', part).strip()
            if part:
                changelog_paths.append(part)

    # 对每个已修改文件，检查是否在 CHANGELOG 中记录
    warnings = []
    for filepath in modified_files:
        normalized = filepath.replace('\\', '/')
        filename = normalized.split('/')[-1]

        found = False
        for cl_path in changelog_paths:
            cl_normalized = cl_path.replace('\\', '/')
            cl_filename = cl_normalized.split('/')[-1]

            # 完整路径匹配（任一方包含另一方）
            if normalized in cl_normalized or cl_normalized in normalized:
                found = True
                break
            # 文件名完全匹配
            if filename and filename == cl_filename:
                found = True
                break
            # 通配符匹配（如 styles/*.scss）
            if '*' in cl_normalized and fnmatch.fnmatch(normalized, cl_normalized):
                found = True
                break

        if not found:
            warnings.append(
                f'git 已修改文件 `{normalized}` 未在 CHANGELOG.md 最新版本 {latest_version} 中记录'
            )

    return warnings


def check_summary_version_sync() -> list[str]:
    """检查工作台搭建总结.md 和 文件说明.md 的版本号是否与 CHANGELOG.md 最新版本一致。

    工作台搭建总结.md 头部声明「当前文档版本：vX.X.X」，
    文件说明.md 头部声明「最后更新：vX.X.X」，
    应与 CHANGELOG.md 的最新版本章节保持同步。
    不一致时警告，防止文档被遗漏更新。
    """
    root = SKILLS_DIR.parent.parent
    summary_path = root / '工作台搭建总结.md'
    changelog_path = root / 'CHANGELOG.md'
    filedoc_path = root / '文件说明.md'

    warnings = []

    if not summary_path.exists():
        return ['工作台搭建总结.md not found']
    if not changelog_path.exists():
        return ['CHANGELOG.md not found']

    summary_content = summary_path.read_text(encoding='utf-8')
    changelog_content = changelog_path.read_text(encoding='utf-8')

    # 从 CHANGELOG.md 提取最新版本号（第一个 ## vX.X.X）
    changelog_match = re.search(r'\n## (v[\d.]+)\b', changelog_content)
    if not changelog_match:
        return ['CHANGELOG.md 未找到版本章节']
    changelog_version = changelog_match.group(1)

    # 检查工作台搭建总结.md
    summary_match = re.search(r'当前文档版本[：:]\s*(v[\d.]+)', summary_content)
    if not summary_match:
        warnings.append('工作台搭建总结.md 未找到「当前文档版本」标记')
    else:
        summary_version = summary_match.group(1)
        if summary_version != changelog_version:
            warnings.append(
                f'工作台搭建总结.md 版本号 {summary_version} 与 CHANGELOG.md 最新版本 {changelog_version} 不一致'
            )

    # 检查文件说明.md
    if filedoc_path.exists():
        filedoc_content = filedoc_path.read_text(encoding='utf-8')
        filedoc_match = re.search(r'最后更新[：:].*?v([\d.]+)', filedoc_content)
        if not filedoc_match:
            warnings.append('文件说明.md 未找到「最后更新」版本标记')
        else:
            filedoc_version = 'v' + filedoc_match.group(1)
            if filedoc_version != changelog_version:
                warnings.append(
                    f'文件说明.md 版本号 {filedoc_version} 与 CHANGELOG.md 最新版本 {changelog_version} 不一致'
                )

    return warnings


def check_no_tmp_directory() -> list[str]:
    """Warn if tmp/ directory exists (should be temp/ only)."""
    root = SKILLS_DIR.parent.parent
    tmp_dir = root / 'tmp'
    if tmp_dir.exists():
        return ['tmp/ directory exists — use temp/ instead (per 版本控制规范.md)']
    return []


def check_commit_acceptance_tag() -> list[str]:
    """检查暂存区是否有变更，如果有，检查是否有验收通过标记。

    通过 .git/COMMIT_EDITMSG 或环境变量获取提交信息，
    如果提交信息中不包含 [验收通过] 标记，发出警告。
    在 pre-commit 阶段还没有提交信息，所以只做提醒。
    """
    import subprocess as sp

    root = SKILLS_DIR.parent.parent

    # 检查是否有暂存的变更（如果没有就不需要检查）
    git_exe = find_git_exe()
    if not git_exe:
        return []

    try:
        result = sp.run(
            [git_exe, 'diff', '--cached', '--name-only'],
            cwd=str(root), capture_output=True, text=True, encoding='utf-8', errors='replace',
            timeout=10
        )
        staged_files = [f for f in result.stdout.strip().split('\n') if f.strip()]
        if not staged_files:
            return []  # 没有暂存的变更，跳过检查
    except Exception:
        return []

    # 检查是否有提交信息文件（pre-commit 时可能有）
    commit_msg_path = root / '.git' / 'COMMIT_EDITMSG'
    has_tag = False
    if commit_msg_path.exists():
        msg = commit_msg_path.read_text(encoding='utf-8', errors='replace')
        if '[验收通过]' in msg:
            has_tag = True

    if has_tag:
        return []

    # 有暂存变更但提交信息中没有验收通过标记
    warnings = [
        '提交信息中未检测到 [验收通过] 标记',
        '  请按 documentation-versioning skill 流程：',
        '  1. 完成后先给用户验收',
        '  2. 用户回复"可以提交"后再提交',
        '  3. 提交信息格式：<type>: <描述> [验收通过]',
    ]
    return warnings


def find_git_exe():
    """查找可用的 git 可执行文件"""
    git_candidates = ['git', r'E:\Git\Git\cmd\git.exe']
    import subprocess as sp
    for candidate in git_candidates:
        try:
            sp.run([candidate, '--version'], capture_output=True, timeout=10)
            return candidate
        except (FileNotFoundError, sp.TimeoutExpired):
            continue
    return None


def check_no_workbench_intermediate() -> list[str]:
    """Warn if Workbench/ contains intermediate product subdirectories."""
    root = SKILLS_DIR.parent.parent
    workbench = root / 'Workbench'
    if not workbench.exists():
        return []
    forbidden_names = {'中间产物', 'tmp', 'temp', 'demo', 'draft'}
    warnings = []
    for item in workbench.rglob('*'):
        if item.is_dir() and item.name in forbidden_names:
            rel = item.relative_to(root)
            warnings.append(f'{rel} — Workbench 下禁止存放中间产物，应移至 temp/（per 版本控制规范.md）')
    return warnings


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
    strict = '--strict' in sys.argv

    if not WORKBENCH.exists():
        print(f'Workbench not found: {WORKBENCH}', file=sys.stderr)
        return 1

    html = WORKBENCH.read_text(encoding='utf-8')
    errors = validate(html)

    # 全局 Tab 完整性检查：针对所有 Workbench HTML 源文件
    errors.extend(check_tab_integrity_global())

    # 全局 JS 语法检查：扫描所有内容页的内联 JS
    errors.extend(check_js_syntax_global())

    # 文档、命名、全局 class、中文注释等检查作为警告而非致命错误
    doc_warnings = check_file_documentation()
    naming_warnings = check_naming_conventions()
    generic_global_warnings = check_generic_class_prefixes_global()
    comment_warnings = check_chinese_comments()
    backup_warnings = check_backup_count()
    json_naming_warnings = check_json_html_naming()
    date_format_warnings = check_date_format()
    folder_naming_warnings = check_folder_naming()
    interactive_style_warnings = check_interactive_styles_global()
    dir_sync_warnings = check_directory_structure_sync()
    changelog_coverage_warnings = check_changelog_coverage()
    summary_sync_warnings = check_summary_version_sync()
    tmp_dir_warnings = check_no_tmp_directory()
    workbench_temp_warnings = check_no_workbench_intermediate()
    acceptance_tag_warnings = check_commit_acceptance_tag()

    # 结构性变更检查：如果检测到结构性变更但未走确认流程，发出警告
    import importlib.util
    sc_spec = importlib.util.spec_from_file_location(
        "check_structural_change",
        os.path.join(SKILLS_DIR, 'check_structural_change.py')
    )
    sc_module = importlib.util.module_from_spec(sc_spec)
    structural_change_warnings = []
    try:
        sc_spec.loader.exec_module(sc_module)
        changed = sc_module.get_changed_files()
        is_structural, reasons = sc_module.detect_structural_changes(changed)
        if is_structural:
            has_approval, _ = sc_module.check_commit_message_has_confirmation()
            if not has_approval:
                structural_change_warnings.append('检测到结构性变更，但未检测到方案确认标记')
                for reason in reasons[:3]:
                    structural_change_warnings.append(f'  - {reason}')
                structural_change_warnings.append('  请按 structural-change-workflow skill 流程先确认方案再执行')
    except Exception as e:
        structural_change_warnings.append(f'结构性变更检查失败：{e}')

    # Critical warnings: block commit in --strict mode
    critical_warnings = (
        doc_warnings + summary_sync_warnings +
        tmp_dir_warnings + workbench_temp_warnings
    )
    # Advisory warnings: print but don't block
    advisory_warnings = (
        naming_warnings + generic_global_warnings +
        comment_warnings + backup_warnings + json_naming_warnings +
        date_format_warnings + folder_naming_warnings + interactive_style_warnings +
        dir_sync_warnings + changelog_coverage_warnings + structural_change_warnings + acceptance_tag_warnings
    )
    all_warnings = critical_warnings + advisory_warnings

    if all_warnings:
        print('Warnings:')
        for warn in all_warnings:
            print(f'  - {warn}')

    if errors:
        print('Validation failed:')
        for err in errors:
            print(f'  - {err}')
        return 1

    if strict and critical_warnings:
        print(f'\nPre-commit check failed: {len(critical_warnings)} critical warning(s) must be fixed before committing.')
        print('Run: python .trae/skills/validate_workbench.py')
        print('Fix the issues above, or use --no-verify to bypass (not recommended).')
        return 1

    if strict:
        print(f'Pre-commit check passed ({len(advisory_warnings)} advisory warning(s)).')

    if not strict:
        print('Validation passed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
