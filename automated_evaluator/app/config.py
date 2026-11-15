import os
from dotenv import load_dotenv
load_dotenv()
APP_NAME = "Smart Crisis Evaluator"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/smart_crisis.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
BOLNA_AGENT_ID = os.getenv("BOLNA_AGENT_ID", "")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
