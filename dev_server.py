#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Development server with hot reload for the 此刻便是春天 workbench.

Watches the project source tree and rebuilds the workbench automatically when
source files change. Serves the generated HTML on a local HTTP port so you can
preview in a browser and refresh manually after each rebuild.

Usage:
    python dev_server.py
    python dev_server.py --port 8080
    python dev_server.py --no-build
"""

import argparse
import socket
import subprocess
import sys
import time
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

# 项目根目录与产物路径
ROOT = Path(__file__).resolve().parent
WORKBENCH = ROOT / 'Workbench' / '此刻便是春天.html'
DEFAULT_PORT = 8000

# 会触发重新构建的源文件扩展名集合
WATCH_PATTERNS = {
    '*.html', '*.scss', '*.css', '*.js', '*.json', '*.py', '*.md',
}

# 应被忽略的文件/目录模式集合
IGNORE_PATTERNS = {
    '__pycache__', '.git', '.gitignore', '.gitattributes',
    '.trae-html-share-packages', '.trae-html-share-*',
    'temp', '*.tmp', '*.bak-*', '*.log',
}


def _should_ignore(path: Path) -> bool:
    """Return True if changes to path should not trigger a rebuild."""
    # 目录变更本身不触发构建
    if path.is_dir():
        return True

    # 忽略构建产物与备份文件
    if path.name == '此刻便是春天.html' and path.parent.name == 'Workbench':
        return True
    if path.name.startswith('此刻便是春天.html.bak-'):
        return True

    # 忽略位于 IGNORE_PATTERNS 目录中的任何文件
    if any(part in IGNORE_PATTERNS for part in path.parts):
        return True

    # 仅监听已知源码扩展名
    if path.suffix.lower() not in {'.html', '.scss', '.css', '.js', '.json', '.py', '.md'}:
        return True

    return False


class RebuildHandler(FileSystemEventHandler):
    """Rebuild the workbench when watched source files change."""

    def __init__(self, debounce_seconds: float = 1.0):
        self.debounce_seconds = debounce_seconds
        self.last_build = 0

    def on_modified(self, event):
        if _should_ignore(Path(event.src_path)):
            return
        self._rebuild()

    def on_created(self, event):
        if _should_ignore(Path(event.src_path)):
            return
        self._rebuild()

    def on_moved(self, event):
        if _should_ignore(Path(event.dest_path)):
            return
        self._rebuild()

    def _rebuild(self):
        # 防抖：避免短时间多次保存触发连续构建
        now = time.time()
        if now - self.last_build < self.debounce_seconds:
            return
        self.last_build = now

        print('\n[watch] source change detected, rebuilding...')
        try:
            # 调用 build.py 重新生成 workbench，跳过完整校验以加快速度
            result = subprocess.run(
                [sys.executable, str(ROOT / 'build.py'), '--skip-validate'],
                cwd=ROOT,
            )
        except Exception as exc:
            print(f'[watch] rebuild crashed: {exc}')
            return

        if result.returncode == 0:
            print('[watch] rebuild complete — refresh your browser to see changes')
        else:
            print('[watch] rebuild failed — fix the error above and save again')


def _port_in_use(port: int) -> bool:
    """Return True if the given TCP port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(('localhost', port)) == 0


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

    # 启动时先执行一次完整构建
    if not args.no_build:
        print('[dev] running initial build...')
        result = subprocess.run([sys.executable, str(ROOT / 'build.py')], cwd=ROOT)
        if result.returncode != 0:
            print('[dev] initial build failed; server will still start, save a source file to retry', file=sys.stderr)
        else:
            print('[dev] initial build complete')

    # 检查端口占用，避免启动失败
    if _port_in_use(args.port):
        print(f'[dev] error: port {args.port} is already in use; try --port {args.port + 1}', file=sys.stderr)
        return 1

    # 启动文件观察器与 HTTP 服务
    handler = RebuildHandler()
    observer = Observer()
    observer.schedule(handler, str(ROOT), recursive=True)
    observer.start()

    server = _start_http_server(args.port)

    encoded_name = '%E6%AD%A4%E5%88%BB%E4%BE%BF%E6%98%AF%E6%98%A5%E5%A4%A9.html'
    print(f'[dev] serving at http://localhost:{args.port}/Workbench/{encoded_name}')
    print('[dev] press Ctrl+C to stop')

    try:
        # 主循环：等待 HTTP 服务进程退出或用户按下 Ctrl+C
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
