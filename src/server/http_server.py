"""
HTTP server: static file serving + JSON API routing.

Routing table:
    POST /api/save_wrong_words  -> api_handlers.save_wrong_words
    GET  /api/get_wrong_words   -> api_handlers.get_wrong_words
    POST /api/srs/record        -> api_handlers.srs_record
    GET  /api/srs/today         -> api_handlers.srs_get_today
    GET  /api/srs/get           -> api_handlers.srs_get_all
    *    (everything else)      -> static files from BASE_DIR
"""
import json
import logging
import socketserver
from http.server import SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from src.config.settings import BASE_DIR, PORT_RANGE_START, PORT_RANGE_END
from src.server import api_handlers

logger = logging.getLogger(__name__)


class PDFAppHandler(SimpleHTTPRequestHandler):
    """HTTP handler for the PDF Word Separation app."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, fmt, *args):
        logger.debug(fmt, *args)

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        page_id = params.get("pageId", [None])[0]

        route_map = {
            "/api/get_wrong_words": lambda: api_handlers.get_wrong_words(page_id),
            "/api/srs/today":       lambda: api_handlers.srs_get_today(page_id),
            "/api/srs/get":         lambda: api_handlers.srs_get_all(page_id),
        }

        handler = route_map.get(parsed.path)
        if handler:
            self._send_json(handler())
        else:
            super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        parsed = urlparse(self.path)

        if parsed.path == "/api/save_wrong_words":
            result = api_handlers.save_wrong_words(body.get("pageId"), body.get("records", {}))
            self._send_json(result)
        elif parsed.path == "/api/srs/record":
            result = api_handlers.srs_record(body["pageId"], body["word"], body["quality"])
            self._send_json(result)
        else:
            self.send_error(404)

    def _send_json(self, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def create_server() -> tuple:
    """Find a free port in PORT_RANGE_START..PORT_RANGE_END and create the server."""
    for port in range(PORT_RANGE_START, PORT_RANGE_END):
        try:
            server = ThreadingServer(("", port), PDFAppHandler)
            return server, port
        except OSError:
            continue
    raise RuntimeError(f"No free port found in range {PORT_RANGE_START}-{PORT_RANGE_END}")
