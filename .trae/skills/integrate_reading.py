#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI entry point for integrating reading content into the workbench.

Examples:
    # Rebuild all years found in read/
    python integrate_reading.py --rebuild

    # Integrate or refresh specific years
    python integrate_reading.py 2026 2025

    # Rebuild and validate
    python integrate_reading.py --rebuild --validate
"""

import argparse
import sys
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    WORKBENCH,
    READ_DIR,
    integrate_years,
    backup_workbench,
    validate_js,
)


def _all_years() -> list[int]:
    return sorted(
        (int(p.stem) for p in READ_DIR.glob('2*.html') if p.stem.isdigit()),
        reverse=True,
    )


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
    args = parser.parse_args()

    if args.rebuild:
        years = _all_years()
    else:
        years = args.years

    if not years:
        print('No years specified. Use --rebuild or pass one or more years.')
        return 1

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

    return 0


if __name__ == '__main__':
    sys.exit(main())
