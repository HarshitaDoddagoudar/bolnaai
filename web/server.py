import sys
from pathlib import Path

# Redirect to root server.py
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import server

if __name__ == "__main__":
    server.run_server()
