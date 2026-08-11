#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Development server with hot reload for the 此刻便是春天 workbench.

Watches the source directories and rebuilds the workbench automatically when
files change. Serves the generated HTML on a local HTTP port so you can preview
in a browser and refresh manually after each rebuild.

Usage:
    python dev_server.py
    python dev_server.py --port 8080
"""

import argparse
import subprocess
import sys
import time
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

ROOT = Path(__file__).resolve().parent
WORKBENCH = ROOT / 'Workbench' / '此刻便是春天.html'
DEFAULT_PORT = 8000

# Directories/files whose changes should trigger a rebuild.
WATCH_PATHS = [
    ROOT / 'styles',
    ROOT / 'templates',
    ROOT / 'Workbench' / 'data',
    ROOT / 'transformers',
    ROOT / '.trae' / 'skills' / 'reading_integration.py',
]

# Changes inside these patterns are ignored.
IGNORE_PATTERNS = {'__pycache__', '.git', '.trae-html-share-packages'}


class RebuildHandler(FileSystemEventHandler):
    """Rebuild the workbench when watched source files change."""

    def __init__(self, debounce_seconds: float = 1.0):
        self.debounce_seconds = debounce_seconds
        self.last_build = 0

    def on_modified(self, event):
        if self._should_ignore(event):
            return
        self._rebuild()

    def on_created(self, event):
        if self._should_ignore(event):
            return
        self._rebuild()

    def on_moved(self, event):
        if self._should_ignore(event):
            return
        self._rebuild()

    def _should_ignore(self, event) -> bool:
        if event.is_directory:
            return True
        src = Path(event.src_path)
        if any(part in IGNORE_PATTERNS for part in src.parts):
            return True
        return False

    def _rebuild(self):
        now = time.time()
        if now - self.last_build < self.debounce_seconds:
            return
        self.last_build = now

        print('\n[watch] source change detected, rebuilding...')
        result = subprocess.run(
            [sys.executable, str(ROOT / 'build.py'), '--skip-validate'],
            cwd=ROOT,
        )
        if result.returncode == 0:
            print('[watch] rebuild complete — refresh your browser to see changes')
        else:
            print('[watch] rebuild failed — fix the error above and save again')


def _start_http_server(port: int) -> subprocess.Popen:
    """Start a simple HTTP server in the project root."""
    return subprocess.Popen(
        [sys.executable, '-m', 'http.server', str(port)],
        cwd=ROOT,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description='Workbench development server with hot reload.')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT, help='HTTP server port')
    parser.add_argument('--no-build', action='store_true', help='Skip the initial build')
    args = parser.parse_args()

    if not args.no_build:
        print('[dev] running initial build...')
        result = subprocess.run([sys.executable, str(ROOT / 'build.py')], cwd=ROOT)
        if result.returncode != 0:
            print('[dev] initial build failed', file=sys.stderr)
            return result.returncode

    handler = RebuildHandler()
    observer = Observer()
    for path in WATCH_PATHS:
        if path.exists():
            observer.schedule(handler, str(path), recursive=True)
        else:
            print(f'[dev] warning: watch path does not exist: {path}')
    observer.start()

    server = _start_http_server(args.port)

    encoded_name = '%E6%AD%A4%E5%88%BB%E4%BE%BF%E6%98%AF%E6%98%A5%E5%A4%A9.html'
    print(f'[dev] serving at http://localhost:{args.port}/Workbench/{encoded_name}')
    print('[dev] press Ctrl+C to stop')

    try:
        while server.poll() is None:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print('\n[dev] stopping...')
    finally:
        observer.stop()
        observer.join()
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()

    return 0


if __name__ == '__main__':
    sys.exit(main())
