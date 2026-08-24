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

# 从 .trae/skills/reading_integration.py 向上回退两级得到项目根目录
ROOT = Path(__file__).resolve().parents[2]
WORKBENCH = ROOT / 'Workbench' / '此刻便是春天.html'
READ_DIR = ROOT / 'Workbench' / 'read'

# 独立页面 class 名到 workbench 作用域 class 名的映射
CLASS_REPLACEMENTS = {
    'class="topic"': 'class="reading-topic"',
    'class="essay"': 'class="reading-essay"',
    'class="essay-title"': 'class="reading-essay-title"',
    'class="essay-body"': 'class="reading-essay-body"',
    'class="essay-meta"': 'class="reading-essay-meta"',
    'class="card"': 'class="reading-card"',
    'class="sources"': 'class="reading-sources"',
}

# 集成后不允许再出现的旧 class 名集合
OLD_CLASSES = {'topic', 'essay', 'essay-title', 'essay-body', 'essay-meta',
               'card', 'sources'}


def js_escape_for_template(s: str) -> str:
    """Escape a string so it can be safely embedded in a JS template literal."""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


def extract_article(html: str) -> str:
    """Extract inner HTML of <article class="page">."""
    # 提取 <article class="page"> 与 </article> 之间的内容（支持换行）
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
    # 匹配 <section id="..."><h2>...<span class="badge">...</span>标题名</h2>正文</section>
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
    # 移除目录导航
    html = re.sub(r'<nav class="toc">.*?</nav>', '', html, flags=re.S)
    # 移除返回顶部按钮
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
    # 最后再处理一次 class 作用域，捕获章节外部残留的旧 class
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


# 由 templates/workbench.html 注入的标记；手动集成脚本通过它们定位内容，
# 避免对 JS 函数签名做脆弱的正则匹配。
CONSTANTS_BEGIN = '// <!-- reading-constants-begin -->'
CONSTANTS_END = '// <!-- reading-constants-end -->'
WORKSPACES_BEGIN = '// <!-- workspaces-array-begin -->'
WORKSPACES_END = '// <!-- workspaces-array-end -->'


def has_reading_workspace(html: str) -> bool:
    """Return True if the workbench already contains the 'read' workspace."""
    return "id: 'read'" in html


def bootstrap_workbench(html: str) -> str:
    """Ensure the workbench contains a 'read' workspace.

    The workbench template now ships with all reading-related JS helpers
    (isReadingItem, renderReadingContent, toggleReadingSection, etc.), so this
    function only needs to add the workspace data when it is missing.
    """
    if has_reading_workspace(html):
        return html

    # 确保 workspaces-array 标记存在，否则无法安全插入
    if WORKSPACES_BEGIN not in html or WORKSPACES_END not in html:
        raise ValueError(
            'Workbench template is missing workspaces-array markers; '
            'please regenerate it from templates/workbench.html.'
        )

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

    end_idx = html.index(WORKSPACES_END)
    # 在结束标记前插入新 workspace，并补充逗号以维持 JS 数组语法
    html = html[:end_idx] + new_workspace + ',\n' + html[end_idx:]
    return html


def _replace_between(html: str, begin_marker: str, end_marker: str,
                      new_content: str) -> str:
    """Replace the content between two markers, keeping the markers intact."""
    begin_idx = html.find(begin_marker)
    end_idx = html.find(end_marker)
    if begin_idx == -1 or end_idx == -1 or end_idx <= begin_idx:
        raise ValueError(f'Markers {begin_marker!r} / {end_marker!r} not found or malformed')
    after_begin = begin_idx + len(begin_marker)
    return html[:after_begin] + '\n' + new_content + html[end_idx:]


def remove_existing_year(html: str, year: int) -> str:
    """Remove a previously integrated year (constant + item) from the workbench.

    Removal uses the marker-delimited regions injected by the template, so it
    no longer relies on fragile regex matches against JS function signatures.
    """
    # 删除 reading-constants 区域内的对应年份常量
    constants_begin = html.find(CONSTANTS_BEGIN)
    constants_end = html.find(CONSTANTS_END)
    if constants_begin != -1 and constants_end != -1:
        region = html[constants_begin:constants_end]
        pattern = re.compile(
            rf"\s*const readingHtml{year} = `[^`]*`;\s*",
            re.S,
        )
        region = pattern.sub('\n', region)
        html = html[:constants_begin] + region + html[constants_end:]

    # 删除 workspaces-array 区域内的对应年份条目
    workspaces_begin = html.find(WORKSPACES_BEGIN)
    workspaces_end = html.find(WORKSPACES_END)
    if workspaces_begin != -1 and workspaces_end != -1:
        region = html[workspaces_begin:workspaces_end]
        pattern = re.compile(
            rf"\s*\{{\s*code: '', name: '{year}年高考语文作文题目与优秀范文汇编'.*?readingHtml: readingHtml{year}\s*\}},?",
            re.S,
        )
        region = pattern.sub('\n', region)
        html = html[:workspaces_begin] + region + html[workspaces_end:]

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
    """Insert readingHtml<year> constants into the marked region."""
    constants_js = ''.join(
        f'    const readingHtml{year} = `{reading_html}`;\n\n'
        for year, reading_html, _ in year_data
    )
    return _replace_between(html, CONSTANTS_BEGIN, CONSTANTS_END, constants_js)


def _build_reading_workspace(year_data: list[tuple[int, str, int]]) -> str:
    """Build the full JS object literal for the read workspace."""
    items_js = ',\n'.join(
        _reading_item_js(year, sections_count)
        for year, _, sections_count in year_data
    )
    return f'''      {{
        id: 'read', name: '阅读资料', icon: '📚', iconBg: '#FEF3C7',
        categories: [
          {{
            name: '高考语文', icon: '📝', iconBg: '#E0F2FE',
            items: [
{items_js}
            ]
          }}
        ]
      }}'''


def _rebuild_reading_items(html: str, year_data: list[tuple[int, str, int]]) -> str:
    """Replace the entire workspaces array region with the reading workspace."""
    workspace_js = _build_reading_workspace(year_data)
    return _replace_between(html, WORKSPACES_BEGIN, WORKSPACES_END, workspace_js)


def _all_reading_years(html: str) -> set[int]:
    """Return all reading years currently present in the workbench items."""
    return set(int(y) for y in re.findall(
        r"name: '(\d{4})年高考语文作文题目与优秀范文汇编'", html
    ))


def inject_year(html: str, year: int, source_html: str,
                read_dir: Path = READ_DIR) -> str:
    """Build and insert (or replace) a single year's reading content."""
    html = bootstrap_workbench(html)

    # 计算本次插入后应包含的全部年份集合
    target_years = _all_reading_years(html) | {year}

    # 先移除所有目标年份，避免重复或顺序错乱
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

    # 移除所有目标年份后重新构建，确保顺序与唯一性
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
    import tempfile
    # 提取所有 <script> 标签内的 JS 代码
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
    js = '\n'.join(scripts)
    # 使用独立临时文件，避免 Windows 下共享文件（workbench_check.js）被并发进程删除
    # 或句柄占用导致 node --check 找不到文件（与 check_js_syntax_global 一致）
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.js', encoding='utf-8', delete=False
    ) as tmp:
        tmp.write(js)
        tmp_path = tmp.name
    try:
        # 调用 node --check 做 JS 语法校验
        result = subprocess.run(['node', '--check', tmp_path], capture_output=True, text=True)
    finally:
        Path(tmp_path).unlink(missing_ok=True)
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
