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
import json
import os
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
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
    'temp', '*.tmp', '*.bak-*', '*.log', '.env',
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


# ---------- DeepSeek API Proxy ----------

DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'


def _load_api_key():
    """Load DeepSeek API key from .env file or environment variable."""
    key = os.environ.get('DEEPSEEK_API_KEY')
    if key:
        return key.strip()
    env_file = ROOT / '.env'
    if env_file.exists():
        for line in env_file.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line.startswith('DEEPSEEK_API_KEY=') and not line.startswith('#'):
                return line.split('=', 1)[1].strip()
    return None


class WorkbenchHandler(SimpleHTTPRequestHandler):
    """HTTP handler: serves static files + proxies /api/chat to DeepSeek."""

    protocol_version = 'HTTP/1.1'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            self._handle_chat()
        elif self.path == '/api/update-plan':
            self._handle_update_plan()
        elif self.path == '/api/mastery':
            self._handle_save_mastery()
        elif self.path == '/api/recite-mastery':
            self._handle_save_recite_mastery()
        elif self.path == '/api/quiz-bank':
            self._handle_save_quiz('bank')
        elif self.path == '/api/quiz-records':
            self._handle_append_quiz_record()
        elif self.path == '/api/quiz-wrong-reason':
            self._handle_update_wrong_reason()
        elif self.path == '/api/quiz-ai':
            self._handle_save_quiz('ai')
        elif self.path == '/api/ai-plan':
            self._handle_save_ai_plan()
        elif self.path == '/api/ai-conv':
            self._handle_save_ai_conv()
        else:
            self.send_error(404, 'Not Found')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        for h in ('If-Modified-Since', 'If-None-Match'):
            if h in self.headers:
                del self.headers[h]
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.send_header('Content-Length', '0')
            self.end_headers()
        elif self.path == '/api/health':
            self._handle_health()
        elif self.path.startswith('/api/mastery'):
            self._handle_load_mastery()
        elif self.path.startswith('/api/recite-mastery'):
            self._handle_load_recite_mastery()
        elif self.path.startswith('/api/quiz-bank'):
            self._handle_load_quiz('bank')
        elif self.path.startswith('/api/quiz-records'):
            self._handle_load_quiz('records')
        elif self.path.startswith('/api/quiz-ai'):
            self._handle_load_quiz('ai')
        elif self.path.startswith('/api/ai-plan'):
            self._handle_load_ai_plan()
        elif self.path.startswith('/api/ai-conv'):
            self._handle_load_ai_conv()
        elif self.path.startswith('/api/study-plan'):
            self._handle_load_study_plan()
        else:
            super().do_GET()

    def _handle_health(self):
        api_key = _load_api_key()
        body = json.dumps({
            'status': 'ok',
            'api_key_configured': bool(api_key),
        }, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle_update_plan(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return

        plan_path = ROOT / 'data' / 'study-plan.json'
        try:
            with open(plan_path, 'r', encoding='utf-8') as f:
                plan = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self._send_json(500, {'error': f'Cannot read study-plan.json: {e}'})
            return

        week_label = data.get('week', '')
        subject = data.get('subject', '')
        chapter = data.get('chapter', '')
        done = data.get('done', False)

        updated = False
        for week in plan.get('weeks', []):
            if week.get('week') != week_label:
                continue
            for goal in week.get('goals', []):
                if goal.get('subject') == subject and goal.get('chapter') == chapter:
                    goal['done'] = done
                    updated = True
                    break
            if updated:
                break

        dp_updated = False
        for dp in plan.get('dailyPlans', []):
            if dp.get('week') != week_label:
                continue
            for day in dp.get('days', []):
                for task in day.get('tasks', []):
                    if task.get('subject') == subject and task.get('chapter') == chapter:
                        task['done'] = done
                        dp_updated = True

        if not updated and not dp_updated:
            self._send_json(404, {'error': f'Goal not found: {week_label} / {subject} / {chapter}'})
            return

        try:
            with open(plan_path, 'w', encoding='utf-8') as f:
                json.dump(plan, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write study-plan.json: {e}'})
            return

        self._send_json(200, {'status': 'ok', 'updated': True, 'dp_updated': dp_updated})

    def _handle_load_mastery(self):
        from urllib.parse import urlparse, parse_qs
        qs = parse_qs(urlparse(self.path).query)
        subject = qs.get('subject', [''])[0]
        path = ROOT / 'data' / 'mastery-progress.json'
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        if subject:
            result = data.get(subject, {'mastery': {}, 'kp': {}})
        else:
            result = data
        self._send_json(200, result)

    def _handle_save_mastery(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        subject = data.get('subject', '')
        payload = data.get('data', data)
        if not subject:
            self._send_json(400, {'error': 'Missing subject field'})
            return
        path = ROOT / 'data' / 'mastery-progress.json'
        existing = {}
        try:
            with open(path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        existing[subject] = payload
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_load_recite_mastery(self):
        """加载背诵卡掌握程度（{question: mastery} 扁平结构）"""
        path = ROOT / 'data' / 'recite-mastery.json'
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        self._send_json(200, data)

    def _handle_save_recite_mastery(self):
        """保存背诵卡掌握程度（{question: mastery} 扁平结构）"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        path = ROOT / 'data' / 'recite-mastery.json'
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_load_quiz(self, kind):
        from urllib.parse import urlparse, parse_qs
        qs = parse_qs(urlparse(self.path).query)
        subject = qs.get('subject', [''])[0]
        if not subject:
            self._send_json(400, {'error': 'Missing subject parameter'})
            return
        filename = f'quiz-{kind}-{subject}.json'
        path = ROOT / 'data' / filename
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = [] if kind == 'bank' else {}
        self._send_json(200, data)

    def _handle_save_quiz(self, kind):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        subject = data.get('subject', '')
        if not subject:
            self._send_json(400, {'error': 'Missing subject field'})
            return
        content = data.get('data')
        filename = f'quiz-{kind}-{subject}.json'
        path = ROOT / 'data' / filename
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(content, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_append_quiz_record(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        subject = data.get('subject', '')
        if not subject:
            self._send_json(400, {'error': 'Missing subject field'})
            return
        record = data.get('record')
        if not record:
            self._send_json(400, {'error': 'Missing record field'})
            return
        filename = f'quiz-records-{subject}.json'
        path = ROOT / 'data' / filename
        try:
            with open(path, 'r', encoding='utf-8') as f:
                records = json.load(f)
            if not isinstance(records, list):
                records = []
        except (FileNotFoundError, json.JSONDecodeError):
            records = []
        records.append(record)
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok', 'total': len(records)})

    def _handle_update_wrong_reason(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        subject = data.get('subject', '')
        question_id = data.get('questionId', '')
        wrong_reason = data.get('wrongReason', '')
        if not subject or not question_id:
            self._send_json(400, {'error': 'Missing subject or questionId'})
            return
        filename = f'quiz-records-{subject}.json'
        path = ROOT / 'data' / filename
        try:
            with open(path, 'r', encoding='utf-8') as f:
                records = json.load(f)
            if not isinstance(records, list):
                records = []
        except (FileNotFoundError, json.JSONDecodeError):
            records = []
        updated = False
        for i in range(len(records) - 1, -1, -1):
            if records[i].get('questionId') == question_id:
                records[i]['wrongReason'] = wrong_reason
                updated = True
                break
        if not updated:
            self._send_json(404, {'error': 'Record not found'})
            return
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_load_ai_plan(self):
        path = ROOT / 'data' / 'ai-daily-plan.json'
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        self._send_json(200, data)

    def _handle_save_ai_plan(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        path = ROOT / 'data' / 'ai-daily-plan.json'
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_load_study_plan(self):
        path = ROOT / 'data' / 'study-plan.json'
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        self._send_json(200, data)

    def _handle_load_ai_conv(self):
        path = ROOT / 'data' / 'ai-conversation.json'

        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = []
        self._send_json(200, data)

    def _handle_save_ai_conv(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return
        path = ROOT / 'data' / 'ai-conversation.json'
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self._send_json(500, {'error': f'Cannot write: {e}'})
            return
        self._send_json(200, {'status': 'ok'})

    def _handle_chat(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'Invalid JSON body'})
            return

        api_key = _load_api_key()
        if not api_key:
            self._send_json(503, {
                'error': 'API Key 未配置。请在项目根目录创建 .env 文件，'
                         '写入 DEEPSEEK_API_KEY=sk-xxxx'
            })
            return

        messages = data.get('messages', [])
        model = data.get('model', 'deepseek-v4-flash')
        use_stream = data.get('stream', True)
        thinking = data.get('thinking', {'type': 'disabled'})
        max_tokens = data.get('max_tokens', 2000)

        payload_dict = {
            'model': model,
            'messages': messages,
            'stream': use_stream,
            'thinking': thinking,
            'max_tokens': max_tokens,
        }
        payload = json.dumps(payload_dict).encode('utf-8')

        req = urllib.request.Request(DEEPSEEK_URL, data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {api_key}')

        try:
            resp = urllib.request.urlopen(req, timeout=300)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                error_msg = error_data.get('error', {}).get('message', error_body) if isinstance(error_data.get('error'), dict) else error_body
            except (json.JSONDecodeError, AttributeError):
                error_msg = error_body
            self._send_json(e.code, {'error': error_msg, 'http_status': e.code})
            return
        except Exception as e:
            self._send_json(502, {'error': f'无法连接 DeepSeek API: {e}'})
            return

        if use_stream:
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Transfer-Encoding', 'chunked')
            self.end_headers()
            try:
                done = False
                for line in resp:
                    if line.strip():
                        chunk = f'{len(line):x}\r\n'.encode() + line + b'\r\n'
                        self.wfile.write(chunk)
                        self.wfile.flush()
                        if b'[DONE]' in line:
                            done = True
                            break
                if not done:
                    end_data = b'data: [DONE]\n\n'
                    self.wfile.write(f'{len(end_data):x}\r\n'.encode() + end_data + b'\r\n')
                    self.wfile.flush()
                self.wfile.write(b'0\r\n\r\n')
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, socket.timeout, OSError):
                pass
            finally:
                resp.close()
        else:
            result = resp.read().decode('utf-8')
            resp.close()
            self._send_json(200, json.loads(result))

    def _send_json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        try:
            msg = format % args
        except Exception:
            return
        if isinstance(args[0] if args else '', str) and '/api/' in args[0]:
            print(f'[api] {msg}')


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


def _get_lan_ip() -> str:
    """Return the LAN IP address of this machine, or empty string if unavailable."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('8.8.8.8', 80))
            return s.getsockname()[0]
    except Exception:
        return ''


def _start_http_server(host: str, port: int) -> ThreadingHTTPServer:
    """Start a custom HTTP server that serves static files and proxies AI API calls."""
    server = ThreadingHTTPServer((host, port), WorkbenchHandler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def main() -> int:
    parser = argparse.ArgumentParser(description='Workbench development server with hot reload.')
    parser.add_argument('--host', default='0.0.0.0', help='Bind host (default: 0.0.0.0 for LAN access)')
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

    server = _start_http_server(args.host, args.port)

    encoded_name = '%E6%AD%A4%E5%88%BB%E4%BE%BF%E6%98%AF%E6%98%A5%E5%A4%A9.html'
    lan_ip = _get_lan_ip()
    print(f'[dev] serving at http://localhost:{args.port}/Workbench/{encoded_name}')
    if args.host == '0.0.0.0' and lan_ip:
        print(f'[dev] LAN access: http://{lan_ip}:{args.port}/Workbench/{encoded_name}')
    print('[dev] press Ctrl+C to stop')

    try:
        # 主循环：等待用户按下 Ctrl+C
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print('\n[dev] stopping...')
    finally:
        observer.stop()
        observer.join()
        server.shutdown()
        server.server_close()

    return 0


if __name__ == '__main__':
    sys.exit(main())
