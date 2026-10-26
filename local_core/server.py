"""Serve built Spectra Studio and private Spectra Core API from localhost only."""
from __future__ import annotations
import json
import mimetypes
import os
import sys
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Semaphore
from urllib.parse import unquote,urlsplit
from core import AgentError,models,run_agent

ROOT=Path(getattr(sys,"_MEIPASS",Path(__file__).resolve().parent.parent))
DIST=ROOT/"dist"
PORT=int(os.environ.get("SPECTRA_CORE_PORT","8765"))
LOCK=Semaphore(1)
MAX_BODY=35_000_000

class Handler(BaseHTTPRequestHandler):
    server_version="SpectraCore/1.0"
    def _json(self,status,value):
        output=json.dumps(value,ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Cache-Control","no-store")
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Content-Length",str(len(output)))
        self.end_headers()
        self.wfile.write(output)

    def _safe_request(self):
        # Bind exclusively to loopback and reject DNS-rebinding Host headers.
        host=self.headers.get("Host","").lower()
        if host not in (f"127.0.0.1:{PORT}",f"localhost:{PORT}",f"[::1]:{PORT}"):
            self._json(403,{"error":"Spectra Core only accepts local requests"});return False
        origin=self.headers.get("Origin")
        if origin is not None and origin not in (f"http://127.0.0.1:{PORT}",f"http://localhost:{PORT}"):
            self._json(403,{"error":"Spectra Core does not accept requests from external websites"});return False
        return True

    def do_GET(self):
        if not self._safe_request():return
        parsed=urlsplit(self.path)
        if parsed.path=="/api/health":
            available=models()
            self._json(200,{"ok":True,"local":True,"ollama":bool(available),
                "models":available,"recommended":"qwen3:4b","visionRecommended":"qwen2.5vl:3b"})
            return
        if parsed.path.startswith("/api/"):
            self._json(404,{"error":"Unknown local API route"});return
        target=unquote(parsed.path).lstrip("/") or "index.html"
        if "\\" in target or "\x00" in target:
            self._json(404,{"error":"Invalid path"});return
        file=(DIST/target).resolve()
        try:file.relative_to(DIST.resolve())
        except ValueError:
            self._json(404,{"error":"Outside app directory"});return
        if not file.is_file():
            self.send_error(404,"File not found");return
        data=file.read_bytes()
        content_type=mimetypes.guess_type(file.name)[0] or "application/octet-stream"
        if file.suffix==".js":content_type="text/javascript"
        self.send_response(200)
        self.send_header("Content-Type",content_type)
        self.send_header("Content-Length",str(len(data)))
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Referrer-Policy","no-referrer")
        self.send_header("Cache-Control","no-cache" if file.name=="index.html" else "public, max-age=3600")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if not self._safe_request():return
        if urlsplit(self.path).path!="/api/chat":
            self._json(404,{"error":"Unknown route"});return
        try:size=int(self.headers.get("Content-Length","0"))
        except ValueError:size=0
        if size<2 or size>MAX_BODY:
            self._json(413,{"error":"Request too large or missing body"});return
        if self.headers.get("Content-Type","").split(";")[0]!="application/json":
            self._json(415,{"error":"JSON request required"});return
        if not LOCK.acquire(blocking=False):
            self._json(429,{"error":"Spectra Core is already processing a request"});return
        try:
            request=json.loads(self.rfile.read(size))
            if not isinstance(request,dict):raise AgentError("Invalid request")
            answer=run_agent(request)
            self._json(200,answer)
        except AgentError as e:self._json(400,{"error":str(e)})
        except (ValueError,KeyError,TypeError) as e:self._json(400,{"error":"Invalid input: "+str(e)})
        except Exception as e:
            print("Spectra Core error:",repr(e),file=sys.stderr)
            self._json(500,{"error":"Local agent error. See the Spectra Core terminal for details."})
        finally:LOCK.release()

def main():
    if not DIST.joinpath("index.html").is_file():
        print("Built app missing. Run npm install && npm run build first.");raise SystemExit(1)
    server=ThreadingHTTPServer(("127.0.0.1",PORT),Handler)
    print(f"Spectra Studio + private Spectra Core: http://127.0.0.1:{PORT}")
    print("All AI calls run locally through Ollama. Press Ctrl+C to stop.")
    if getattr(sys,"frozen",False):
        import threading,time,webbrowser
        def launch_browser():
            time.sleep(.6)
            webbrowser.open(f"http://127.0.0.1:{PORT}")
        threading.Thread(target=launch_browser,daemon=True).start()
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=="__main__":main()
