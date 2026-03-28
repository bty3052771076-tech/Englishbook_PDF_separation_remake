"""
Entry point: start the PDF Word Separation web server.
"""
import logging
from src.config.settings import LOG_LEVEL, LOG_FORMAT
from src.server.http_server import create_server

logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    server, port = create_server()
    logger.info("Server running at http://localhost:%d", port)
    logger.info("Open in browser: http://localhost:%d/?page=7", port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped.")
