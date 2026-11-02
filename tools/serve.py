"""
serve.py: OPTIONAL local web server that also shows the custom 404 page.

The normal command (python3 -m http.server 8000) works fine for everything,
but it shows a plain grey error page for missing pages. This version shows
our own 404.html instead.

How to run (from the football-site folder):
    python3 tools/serve.py           (Mac/Linux)
    python tools/serve.py            (Windows)
Then open http://localhost:8000 . Press Ctrl+C to stop.

To test on a phone on the same Wi-Fi, it already listens on all networks
(0.0.0.0), so open http://<your-laptop-ip>:8000 on the phone.
"""

import http.server
import os
import socketserver

PORT = 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # Make sure .js files are sent as JavaScript (needed for modules on Windows)
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".svg": "image/svg+xml"}

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            page = os.path.join(ROOT, "404.html")
            with open(page, "rb") as f:
                body = f.read()
            # The 404 page uses relative links, so send people to the site root
            body = body.replace(b"<head>", b'<head>\n  <base href="/">', 1)
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as server:
    print(f"Serving the website at http://localhost:{PORT}  (press Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
