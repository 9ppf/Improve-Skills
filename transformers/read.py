#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transformer for the reading module.

Enriches the raw reading module JSON with structured data loaded from
JSON data files in data/reading/.
"""

import json
import re
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'data'


def _year_from_name(name: str) -> Optional[int]:
    m = re.search(r'(\d{4})年', name)
    return int(m.group(1)) if m else None


def _load_reading_data(content_source: str) -> tuple[dict, int]:
    """Load reading JSON data file, return (data, section_count)."""
    source_path = DATA_DIR / content_source
    if not source_path.exists():
        raise FileNotFoundError(f'Reading data source not found: {source_path}')
    data = json.loads(source_path.read_text(encoding='utf-8'))
    section_count = len(data.get('sections', []))
    print(f'  [reading] loaded {content_source} -> {section_count} sections')
    return data, section_count


def enrich_item(item: dict) -> dict:
    """Return a copy of the item with runtime fields added."""
    enriched = dict(item)
    content_source = enriched.pop('contentSource')
    data, section_count = _load_reading_data(content_source)
    enriched['readingData'] = data
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
                        'contentSource': 'reading/2026.json',
                    }
                ]
            }
        ]
    }
    result = enrich_module(sample)
    print(json.dumps(result, ensure_ascii=False, indent=2))
