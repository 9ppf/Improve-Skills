#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Integrate a single read/YYYY.html into 此刻便是春天.html as a reading item.

Usage:
    python integrate_reading_year.py 2018

This script is a thin wrapper around the shared `reading_integration` module,
which is the single source of truth for transformation rules and workbench
injection logic.
"""

import sys
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent.parent
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    WORKBENCH,
    READ_DIR,
    inject_year,
    backup_workbench,
    validate_js,
)


def main():
    if len(sys.argv) != 2:
        print(f'Usage: python {Path(__file__).name} <year>')
        sys.exit(1)

    year = int(sys.argv[1])
    source_path = READ_DIR / f'{year}.html'
    if not source_path.exists():
        print(f'Source file not found: {source_path}')
        sys.exit(1)

    backup = backup_workbench()
    print(f'Backup created: {backup}')

    html = WORKBENCH.read_text(encoding='utf-8')
    source_html = source_path.read_text(encoding='utf-8')
    html = inject_year(html, year, source_html)
    WORKBENCH.write_text(html, encoding='utf-8')
    print(f'Integrated {year} into {WORKBENCH}')

    validate_js(html)
    print('JS syntax check passed.')


if __name__ == '__main__':
    main()
