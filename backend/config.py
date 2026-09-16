"""Application configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root (one level above backend/).
_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env")

ALPHA_VANTAGE_API_KEY: str | None = os.getenv("ALPHA_VANTAGE_API_KEY")
DISCORD_WEBHOOK_URL: str | None = os.getenv("DISCORD_WEBHOOK_URL")

ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

# Hardcoded sectors for the POC.
SECTORS = [
    "semiconductors",
    "memory",
    "nuclear",
    "energy",
    "ai_infrastructure",
]

# Importance thresholds.
SKIP_THRESHOLD = 0.40   # below this -> SKIP
PUSH_THRESHOLD = 0.60   # at/above this -> PUSH (else LOW)
