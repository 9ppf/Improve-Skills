#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI entry point for integrating reading content into the workbench.

Note:
    This script is kept for quick manual updates. The canonical build path is
    `python build.py`, which reads `data/modules/reading.json` and
    regenerates the workbench from the template. After this script updates the
    HTML, it reruns `build.py` so the final output always matches the standard
    build pipeline.

Examples:
    # Rebuild all years found in read/
    python integrate_reading.py --rebuild

    # Integrate or refresh specific years
    python integrate_reading.py 2026 2025

    # Rebuild and validate
    python integrate_reading.py --rebuild --validate
"""

import argparse
import subprocess
import sys
from pathlib import Path

# 确保当前脚本所在目录可作为 import 路径
SKILLS_DIR = Path(__file__).resolve().parent
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    ROOT,
    WORKBENCH,
    READ_DIR,
    integrate_years,
    backup_workbench,
    validate_js,
)


def _all_years() -> list[int]:
    """返回 read/ 目录下所有 2xxx 年份文件，按降序排列。"""
    return sorted(
        (int(p.stem) for p in READ_DIR.glob('2*.html') if p.stem.isdigit()),
        reverse=True,
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
    parser = argparse.ArgumentParser(
        description='Integrate read/YYYY.html files into the workbench.'
    )
    parser.add_argument('years', nargs='*', type=int, help='Years to integrate')
    parser.add_argument(
        '--all', '--rebuild', action='store_true',
        dest='rebuild',
        help='Rebuild all years found in read/',
    )
    parser.add_argument(
        '--validate', action='store_true',
        help='Run JS syntax check after integration',
    )
    parser.add_argument(
        '--no-rebuild', action='store_true',
        help='Skip the final canonical build (not recommended)',
    )
    args = parser.parse_args()

    # 根据参数决定集成全部年份还是指定年份
    if args.rebuild:
        years = _all_years()
    else:
        years = args.years

    if not years:
        print('No years specified. Use --rebuild or pass one or more years.')
        return 1

    # 检查所有请求的源文件是否都存在
    missing = [y for y in years if not (READ_DIR / f'{y}.html').exists()]
    if missing:
        print(f'Source files not found for years: {missing}')
        return 1

    backup = backup_workbench()
    print(f'Backup created: {backup}')

    html = WORKBENCH.read_text(encoding='utf-8')
    html = integrate_years(html, years)
    WORKBENCH.write_text(html, encoding='utf-8')
    print(f'Integrated years: {years}')

    if args.validate:
        validate_js(html)
        print('JS syntax check passed.')

    if not args.no_rebuild:
        return _run_build()

    return 0


if __name__ == '__main__':
    sys.exit(main())
