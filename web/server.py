"""
Smart Crisis Localhost Web Server
Serves the Emergency Command Center Dashboard at http://localhost:3000
"""

import os
import sys
import json
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 3000
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
REPORTS_DIR = PROJECT_ROOT / "testing" / "reports"
TRANSCRIPTS_DIR = PROJECT_ROOT / "testing" / "transcripts"

class SmartCrisisHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/api/status":
            self.send_json_response({
                "status": "online",
                "agent_id": "77903ab3-a9e5-4756-904b-345fdf96f785",
                "agent_name": "Smart Crisis Emergency Assistant",
                "voice": "Sarvam Bulbul v3 (Pooja)",
                "transcriber": "Sarvam Saaras v4",
                "languages": ["English", "Kannada", "Hindi"]
            })
        elif self.path == "/api/reports":
            reports = []
            if REPORTS_DIR.exists():
                for f in sorted(REPORTS_DIR.glob("*.json")):
                    try:
                        data = json.loads(f.read_text(encoding="utf-8"))
                        reports.append(data)
                    except:
                        pass
            self.send_json_response({"reports": reports})
        else:
            super().do_GET()

    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, SmartCrisisHandler)
    print(f"\n=======================================================")
    print(f"🔥 SMART CRISIS COMMAND CENTER IS LIVE")
    print(f"👉 Open in browser: http://localhost:{PORT}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
