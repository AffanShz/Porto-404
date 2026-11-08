"""Dev server with no-store caching headers.

python -m http.server sends no Cache-Control, so the browser heuristically
caches pages and serves stale HTML after edits. This wrapper forces
revalidation for every request.

Usage: python serve.py [port]   (default 8000, serves from script directory)
"""
import functools
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(NoCacheHandler, directory=os.getcwd())
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    print(f"Serving {os.getcwd()} at http://127.0.0.1:{port} (no-store)")
    server.serve_forever()


if __name__ == "__main__":
    main()
