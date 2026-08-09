#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Core functions for integrating reading content into the 此刻便是春天 workbench.

This module is the single source of truth for:
  - standalone HTML → workbench-ready markup transformation
  - workbench injection / replacement of reading items
  - JS syntax validation

All reading-related integration scripts should import from here instead of
duplicating transformation rules.
"""

import re
import subprocess
import sys
from pathlib import Path

WORKBENCH = Path(r'E:\TraeWorkToDo\Workbench\此刻便是春天.html')
READ_DIR = Path(r'E:\TraeWorkToDo\Workbench\read')

# Maps old standalone-page class names to workbench-scoped class names.
CLASS_REPLACEMENTS = {
    'class="topic"': 'class="reading-topic"',
    'class="essay"': 'class="reading-essay"',
    'class="essay-title"': 'class="reading-essay-title"',
    'class="essay-body"': 'class="reading-essay-body"',
    'class="essay-meta"': 'class="reading-essay-meta"',
    'class="card"': 'class="reading-card"',
    'class="sources"': 'class="reading-sources"',
}

# Old class names that must not appear inside reading content after integration.
OLD_CLASSES = {'topic', 'essay', 'essay-title', 'essay-body', 'essay-meta',
               'card', 'sources'}


def js_escape_for_template(s: str) -> str:
    """Escape a string so it can be safely embedded in a JS template literal."""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


def extract_article(html: str) -> str:
    """Extract inner HTML of <article class="page">."""
    m = re.search(r'<article class="page">(.*?)</article>', html, re.S)
    if not m:
        raise ValueError('Could not find <article class="page">')
    return m.group(1).strip()


def transform_body_classes(html: str) -> str:
    """Scope class names inside the reading body to avoid workbench conflicts."""
    for old, new in CLASS_REPLACEMENTS.items():
        html = html.replace(old, new)
    return html


def transform_sections(html: str) -> str:
    """Wrap each <section> into a collapsible reading-section."""
    pattern = re.compile(
        r'<section id="([^"]+)">\s*<h2>.*?<span class="badge">([^<]+)</span>([^<]+)</h2>(.*?)</section>',
        re.S,
    )

    def repl(m):
        section_id = m.group(1)
        badge = m.group(2).strip()
        name = m.group(3).strip()
        body = m.group(4).strip()
        title_text = f"{badge} · {name}" if badge else name
        body = transform_body_classes(body)
        return (
            f'<div class="reading-section collapsed" data-section="{section_id}">\n'
            f'  <div class="reading-section-header" onclick="toggleReadingSection(\'{section_id}\')">\n'
            f'    <span class="reading-section-chevron">▾</span>\n'
            f'    <span class="reading-section-title">{title_text}</span>\n'
            f'  </div>\n'
            f'  <div class="reading-section-body">\n'
            f'    {body}\n'
            f'  </div>\n'
            f'</div>'
        )

    return pattern.sub(repl, html)


def transform_hero(html: str) -> str:
    """Convert the hero header into a scoped reading hero block."""
    pattern = re.compile(r'<header class="hero" id="top">(.*?)</header>', re.S)

    def repl(m):
        inner = m.group(1)
        inner = inner.replace('header.hero', 'reading-hero')
        inner = inner.replace('class="hero"', 'class="reading-hero"')
        inner = inner.replace('class="subtitle"', 'class="reading-hero-subtitle"')
        inner = inner.replace('class="meta"', 'class="reading-hero-meta"')
        return f'<div class="reading-hero">{inner}</div>'

    return pattern.sub(repl, html)


def remove_toc_and_back_to_top(html: str) -> str:
    """Remove TOC and back-to-top anchor; they are redundant in the workbench view."""
    html = re.sub(r'<nav class="toc">.*?</nav>', '', html, flags=re.S)
    html = re.sub(r'<a href="#top" class="back-to-top"[^>]*>.*?</a>', '', html, flags=re.S)
    return html


def transform_footer(html: str) -> str:
    """Strip <footer> tags but keep inner sources markup."""
    html = html.replace('<footer>', '')
    html = html.replace('</footer>', '')
    return html


def build_reading_html(source_html: str) -> str:
    """Build the escaped HTML string for embedding into the workbench."""
    article = extract_article(source_html)
    article = transform_hero(article)
    article = remove_toc_and_back_to_top(article)
    article = transform_sections(article)
    article = transform_footer(article)
    # Catch any remaining old classes (e.g. footer sources outside sections).
    article = transform_body_classes(article)
    wrapped = f'<div class="reading-content">\n{article}\n</div>'
    return js_escape_for_template(wrapped)


def count_sections(source_html: str) -> int:
    """Count the number of <section id="..."> elements in the source."""
    return len(re.findall(r'<section\s+id="[^"]+">', source_html))


def count_essays(source_html: str) -> int:
    """Count the number of <div class="essay"> elements in the source."""
    return len(re.findall(r'<div class="essay">', source_html))


def _reading_item_js(year: int, sections_count: int) -> str:
    """Return the JS object literal for a single reading item."""
    return f'''              {{
                code: '', name: '{year}年高考语文作文题目与优秀范文汇编', credits: 0,
                type: 'reading', exam: '', stage: '阅读中', chapters: {sections_count}, done: 0,
                current: '可展开阅读', tasks: [], review: '网络流传范文，仅供参考学习。',
                readingHtml: readingHtml{year}
              }}'''


def has_reading_workspace(html: str) -> bool:
    """Return True if the workbench already contains the 'read' workspace."""
    return "id: 'read'" in html


def bootstrap_workbench(html: str) -> str:
    """Add the reading workspace and required JS functions if they are missing.

    This is idempotent: calling it on an already-bootstrapped workbench is safe.
    """
    # Add reading type label
    if "type === 'reading'" not in html:
        html = re.sub(
            r"(function getTypeLabel\(type\) \{\n)(\s*if \(type === 'public'\) return)",
            r"\1      if (type === 'reading') return '<span class=\"badge badge-public\">阅读资料</span>';\n\2",
            html,
            count=1,
        )

    # Add reading content tab
    if "isReadingItem(item)) tabs.push" not in html:
        html = re.sub(
            r"(function renderTabs\(item\) \{\n\s*)if \(!isExamItem\(item\)\) return '';\n\s*const tabs = \[\n\s*\{ key: 'plan', label: '计划' \},\n\s*\{ key: 'questionTypes', label: '题型分析' \}\n\s*\];",
            r"\1if (!isExamItem(item) && !isReadingItem(item)) return '';\n      const tabs = [{ key: 'plan', label: '计划' }];\n      if (isExamItem(item)) tabs.push({ key: 'questionTypes', label: '题型分析' });\n      if (isReadingItem(item)) tabs.push({ key: 'content', label: '内容' });",
            html,
            count=1,
        )

    # Add isReadingItem helper
    if "function isReadingItem" not in html:
        html = re.sub(
            r"(function isExamItem\(item\) \{\n\s*return item && \(item.type === 'core' \|\| item.type === 'public' \|\| item.type === 'practice'\);\n\}\n)",
            r"\1\n    function isReadingItem(item) {\n      return item && item.type === 'reading';\n    }\n",
            html,
            count=1,
        )

    # Add reading content branch in renderItemView
    if "activeTab === 'content' && isReadingItem(item)" not in html:
        html = re.sub(
            r"(if \(activeTab === 'plan' \|\| !isExamItem\(item\)\) \{\n\s*contentHtml = renderPlanTab\(item\);\n\s*\} else if \(activeTab === 'questionTypes'\) \{\n\s*contentHtml = renderQuestionTypes\(item\);\n\s*\})(\n\s*document\.getElementById\('main'\)",
            r"\1\n      } else if (activeTab === 'content' && isReadingItem(item)) {\n        contentHtml = renderReadingContent(item);\n      }\2",
            html,
            count=1,
        )
    # Guard the plan branch so reading items don't fall through to plan
    html = re.sub(
        r"if \(activeTab === 'plan' \|\| !isExamItem\(item\)\) \{\n\s*contentHtml = renderPlanTab\(item\);",
        r"if (activeTab === 'plan' || (!isExamItem(item) && !isReadingItem(item))) {\n        contentHtml = renderPlanTab(item);",
        html,
        count=1,
    )

    # Update selectItem to default reading items to content tab
    if "isReadingItem(result.item) ? 'content'" not in html:
        html = re.sub(
            r"(activeItemId = id;\n\s*activeTab =) isReadingItem\(item\) \? 'content' : 'plan';",
            r"\1 isReadingItem(result.item) ? 'content' : 'plan';",
            html,
            count=1,
        )
    if "isReadingItem(result.item) ? 'content'" not in html:
        html = re.sub(
            r"(activeItemId = id;\n\s*activeTab = 'plan';)",
            r"activeItemId = id;\n      activeTab = isReadingItem(result.item) ? 'content' : 'plan';",
            html,
            count=1,
        )

    # Add renderReadingContent and toggleReadingSection
    if "function renderReadingContent" not in html:
        reading_functions = '''
    function renderReadingContent(item) {
      const html = item.readingHtml || '<div class="reading-content"><p>暂无内容</p></div>';
      return html;
    }

    function toggleReadingSection(id) {
      const section = document.querySelector('.reading-section[data-section="' + id + '"]');
      if (section) section.classList.toggle('collapsed');
    }

'''
        html = re.sub(
            r'(function renderTree\(\) \{)',
            reading_functions + r'\1',
            html,
            count=1,
        )

    # Add reading workspace if missing
    if not has_reading_workspace(html):
        new_workspace = '''      {
        id: 'read', name: '阅读资料', icon: '📚', iconBg: '#FEF3C7',
        categories: [
          {
            name: '高考语文', icon: '📝', iconBg: '#E0F2FE',
            items: [
            ]
          }
        ]
      }'''
        marker = "    let currentWorkspaceId = 'zk';"
        if marker not in html:
            raise ValueError('Could not find marker for workspaces array end')
        idx = html.index(marker)
        brace_idx = html.rfind('];', 0, idx)
        if brace_idx == -1:
            raise ValueError('Could not find ]; before marker')
        line_start = html.rfind('\n', 0, brace_idx) + 1
        prev_newline = html.rfind('\n', 0, line_start - 1)
        prev_line = html[prev_newline + 1:line_start].rstrip()
        if not prev_line.endswith(','):
            html = (
                html[:prev_newline + 1]
                + prev_line + ',\n'
                + html[line_start:]
            )
            idx = html.index(marker)
            line_start = html.rfind('];', 0, idx) + 1
            line_start = html.rfind('\n', 0, line_start) + 1
        html = (
            html[:line_start]
            + new_workspace
            + ',\n'
            + html[line_start:]
        )

    return html


def remove_existing_year(html: str, year: int) -> str:
    """Remove a previously integrated year (constant + item) from the workbench."""
    # Remove constant
    start = html.find(f'    const readingHtml{year} = `')
    if start != -1:
        close = html.find('`;', start + len(f'    const readingHtml{year} = `'))
        if close != -1:
            html = html[:start] + html[close + 2:]

    # Remove item block
    html = re.sub(
        rf"\n\s*\{{\s*code: '', name: '{year}年高考语文作文题目与优秀范文汇编'.*?readingHtml: readingHtml{year}\s*\}}",
        '',
        html,
        flags=re.S,
    )
    return html


def _collect_year_data(years: list[int], read_dir: Path) -> list[tuple[int, str, int]]:
    """Build (year, reading_html, sections_count) tuples in descending year order."""
    data = []
    for year in sorted(years, reverse=True):
        source_path = read_dir / f'{year}.html'
        if not source_path.exists():
            raise FileNotFoundError(f'Source file not found: {source_path}')
        source_html = source_path.read_text(encoding='utf-8')
        data.append((
            year,
            build_reading_html(source_html),
            count_sections(source_html),
        ))
    return data


def _inject_constants(html: str, year_data: list[tuple[int, str, int]]) -> str:
    """Insert readingHtml<year> constants before `const workspaces = [`."""
    constants_js = ''.join(
        f'    const readingHtml{year} = `{reading_html}`;\n\n'
        for year, reading_html, _ in year_data
    )
    return re.sub(
        r'\b(const workspaces = \[)',
        constants_js + r'\1',
        html,
        count=1,
    )


def _rebuild_reading_items(html: str, year_data: list[tuple[int, str, int]]) -> str:
    """Replace the items array of the 高考语文 reading category."""
    items_js = ',\n'.join(
        _reading_item_js(year, sections_count)
        for year, _, sections_count in year_data
    )
    pattern = re.compile(
        r"(name: '高考语文', icon: '📝', iconBg: '#E0F2FE',\n\s*items: \[)(.*?)(\])",
        re.S,
    )

    def repl(m):
        if items_js:
            return m.group(1) + '\n' + items_js + '\n' + m.group(2).rstrip() + m.group(3)
        return m.group(1) + m.group(3)

    return pattern.sub(repl, html, count=1)


def _all_reading_years(html: str) -> set[int]:
    """Return all reading years currently present in the workbench items."""
    return set(int(y) for y in re.findall(
        r"name: '(\d{4})年高考语文作文题目与优秀范文汇编'", html
    ))


def inject_year(html: str, year: int, source_html: str,
                read_dir: Path = READ_DIR) -> str:
    """Build and insert (or replace) a single year's reading content."""
    html = bootstrap_workbench(html)

    # Determine the final year list after this insertion.
    target_years = _all_reading_years(html) | {year}

    # Remove all years so we can rebuild cleanly without ordering issues.
    for y in target_years:
        html = remove_existing_year(html, y)

    year_data = _collect_year_data(sorted(target_years, reverse=True), read_dir)
    html = _inject_constants(html, year_data)
    html = _rebuild_reading_items(html, year_data)
    return html


def integrate_years(html: str, years: list[int], read_dir: Path = READ_DIR) -> str:
    """Integrate multiple years into the workbench.

    Existing content for each year is replaced; other years are preserved.
    The workbench is bootstrapped if needed.
    """
    html = bootstrap_workbench(html)

    target_years = (_all_reading_years(html) | set(years))

    # Remove all target years so we can rebuild cleanly.
    for y in target_years:
        html = remove_existing_year(html, y)

    year_data = _collect_year_data(sorted(target_years, reverse=True), read_dir)
    html = _inject_constants(html, year_data)
    html = _rebuild_reading_items(html, year_data)
    return html


def backup_workbench(path: Path = WORKBENCH) -> Path:
    """Create a timestamped backup of the workbench next to the original file."""
    from datetime import datetime
    suffix = f'.html.bak-{datetime.now():%Y%m%d_%H%M%S}'
    backup = path.with_suffix(suffix)
    backup.write_text(path.read_text(encoding='utf-8'), encoding='utf-8')
    return backup


def validate_js(html: str) -> None:
    """Run node --check on the embedded JS. Raise on syntax errors."""
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    js = '\n'.join(scripts)
    tmp = Path(__file__).with_name('workbench_check.js')
    tmp.write_text(js, encoding='utf-8')
    try:
        result = subprocess.run(['node', '--check', str(tmp)], capture_output=True, text=True)
    finally:
        tmp.unlink(missing_ok=True)
    if result.returncode != 0:
        raise SyntaxError(result.stderr)


if __name__ == '__main__':
    # Simple self-test: rebuild all years found in READ_DIR
    years = sorted(
        (int(p.stem) for p in READ_DIR.glob('2*.html') if p.stem.isdigit()),
        reverse=True,
    )
    print('Years to integrate:', years)
    html = WORKBENCH.read_text(encoding='utf-8')
    html = integrate_years(html, years)
    validate_js(html)
    WORKBENCH.write_text(html, encoding='utf-8')
    print('Workbench rebuilt and JS check passed.')
