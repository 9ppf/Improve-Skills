#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Integrate a single read/YYYY.html into 此刻便是春天.html as a reading item.

Usage:
    python integrate_reading_year.py 2018

Note:
    This script performs a quick manual injection and then reruns `build.py` so
    the final workbench matches the canonical build pipeline. For normal
    updates, prefer `python build.py` directly.
"""

import subprocess
import sys
from pathlib import Path

# 确保上层 .trae/skills 目录可作为 import 路径
SKILLS_DIR = Path(__file__).resolve().parent.parent
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    ROOT,
    WORKBENCH,
    READ_DIR,
    inject_year,
    backup_workbench,
    validate_js,
)


def _run_build() -> int:
    """Run the canonical build so the final HTML matches the standard pipeline."""
    print('\n[integrate] running canonical build.py...')
    # 调用标准构建脚本 build.py，确保输出与正式构建流程一致
    result = subprocess.run(
        [sys.executable, str(ROOT / 'build.py')],
        cwd=ROOT,
    )
    if result.returncode != 0:
        print('[integrate] build.py failed', file=sys.stderr)
    return result.returncode


def main() -> int:
    if len(sys.argv) != 2:
        print(f'Usage: python {Path(__file__).name} <year>')
        return 1

    year = int(sys.argv[1])
    source_path = READ_DIR / f'{year}.html'
    if not source_path.exists():
        print(f'Source file not found: {source_path}')
        return 1

    backup = backup_workbench()
    print(f'Backup created: {backup}')

    html = WORKBENCH.read_text(encoding='utf-8')
    source_html = source_path.read_text(encoding='utf-8')
    # 将单一年份的阅读内容注入 workbench
    html = inject_year(html, year, source_html)
    WORKBENCH.write_text(html, encoding='utf-8')
    print(f'Integrated {year} into {WORKBENCH}')

    validate_js(html)
    print('JS syntax check passed.')

    return _run_build()


if __name__ == '__main__':
    sys.exit(main())
