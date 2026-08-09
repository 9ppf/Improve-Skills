#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transformer for the reading module.

Enriches the raw reading module JSON with generated HTML fragments and
section counts derived from the content source files.
"""

import re
import sys
from pathlib import Path

# Ensure the shared skills module is importable.
SKILLS_DIR = Path(__file__).resolve().parent.parent / '.trae' / 'skills'
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from reading_integration import (
    WORKBENCH,
    build_reading_html,
    count_sections,
)


def _year_from_name(name: str) -> int | None:
    """Extract the 4-digit year from an item name like '2026年高考语文...'."""
    m = re.search(r'(\d{4})年', name)
    return int(m.group(1)) if m else None


def _transform_content(content_source: str, item_name: str = '') -> tuple[str, int]:
    """Return (escaped_html_fragment, section_count) for a reading item."""
    source_path = WORKBENCH.parent / content_source
    if not source_path.exists():
        raise FileNotFoundError(f'Reading content source not found: {source_path}')

    source_html = source_path.read_text(encoding='utf-8')
    section_count = count_sections(source_html)
    transformed = build_reading_html(source_html)

    print(f'  [reading] transformed {content_source} -> {section_count} sections ({len(transformed)} chars)')
    return transformed, section_count


def enrich_item(item: dict) -> dict:
    """Return a copy of the item with runtime fields added."""
    enriched = dict(item)
    content_source = enriched.pop('contentSource')
    enriched['readingHtml'], section_count = _transform_content(
        content_source, enriched.get('name', '')
    )
    enriched['chapters'] = section_count
    enriched.setdefault('done', 0)
    return enriched


def enrich_module(data: dict) -> dict:
    """Return the reading module data with all items enriched."""
    enriched = dict(data)
    enriched_categories = []

    for category in data.get('categories', []):
        enriched_category = dict(category)
        enriched_items = []
        for item in category.get('items', []):
            enriched_items.append(enrich_item(item))
        enriched_category['items'] = enriched_items
        enriched_categories.append(enriched_category)

    enriched['categories'] = enriched_categories
    return enriched


if __name__ == '__main__':
    # Simple self-test: expects a raw reading module dict on stdin or uses a sample.
    import json
    sample = {
        'id': 'read',
        'name': '阅读资料',
        'categories': [
            {
                'name': '高考语文',
                'items': [
                    {
                        'name': '2026年高考语文作文题目与优秀范文汇编',
                        'type': 'reading',
                        'contentSource': 'read/2026.html',
                    }
                ]
            }
        ]
    }
    result = enrich_module(sample)
    print(json.dumps(result, ensure_ascii=False, indent=2))
