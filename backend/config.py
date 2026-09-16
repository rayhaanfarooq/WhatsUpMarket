"""Application configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root (one level above backend/).
_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env")

ALPHA_VANTAGE_API_KEY: str | None = os.getenv("ALPHA_VANTAGE_API_KEY")
DISCORD_WEBHOOK_URL: str | None = os.getenv("DISCORD_WEBHOOK_URL")

# Postgres (Supabase) when set. Render should use the pooled URI + sslmode=require.
DATABASE_URL: str | None = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

# Local SQLite fallback when DATABASE_URL is unset.
DATABASE_PATH = Path(
    os.getenv("DATABASE_PATH", str(_ROOT / "backend" / "data" / "marketbrief.db"))
)

ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

# Theme tags (existing keyword model).
SECTORS = [
    "semiconductors",
    "memory",
    "nuclear",
    "energy",
    "ai_infrastructure",
]

# Discord routing buckets (second classifier).
MARKET_SECTORS = [
    "tech",
    "nuclear",
    "healthcare",
    "finance",
    "energy",
    "industrials",
    "consumer",
    "general",
]

# Importance thresholds.
SKIP_THRESHOLD = 0.40   # below this -> SKIP
PUSH_THRESHOLD = 0.60   # at/above this -> PUSH (else LOW)
