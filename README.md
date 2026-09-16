# WhatsUpMarket — MarketBrief (Lean POC)

A lightweight financial-news intelligence pipeline:

> **Financial News → Analysis → Structured Intelligence → Discord**

It fetches financial news from Alpha Vantage (`NEWS_SENTIMENT`), analyzes each
article (sector classification, importance scoring, impact/sentiment), decides
whether it's worth surfacing, formats qualifying articles, and publishes them to
a Discord channel via a webhook. Exposed through a small FastAPI backend.

This is an intentionally lean V0. No auth, no Discord bot, no scheduler yet.

---

## Project Structure

```text
WhatsUpMarket/
├── backend/
│   ├── main.py                # FastAPI app + endpoints
│   ├── config.py              # env + constants (sectors, thresholds)
│   ├── analyzer/
│   │   ├── analyzer.py            # main analyzer (stable interface)
│   │   ├── sector_classifier.py   # keyword-based sector classification
│   │   └── importance_classifier.py  # rule-based importance scoring
│   ├── integrations/
│   │   ├── alpha_vantage.py    # NEWS_SENTIMENT fetch
│   │   ├── discord.py          # webhook send
│   │   └── formatter.py        # Discord embed formatting
│   ├── store.py               # SQLite or Supabase Postgres history + dedup
│   ├── models/schemas.py      # Pydantic models
│   └── requirements.txt
├── frontend/                  # Operator dashboard (React + Vite + Tailwind)
├── landingpage/               # Public Discord landing page
├── .env.example
└── .gitignore
```

---

## Setup

### 1. Environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

- Get a free Alpha Vantage key: https://www.alphavantage.co/support/#api-key
- Create a Discord webhook: Channel Settings → Integrations → Webhooks → New Webhook → Copy URL
- **Supabase (production / Render):** Project Settings → Database → Connect → copy the **Session pooler** URI (port `6543`). Direct connections are often IPv6-only and fail from Render. The password is the database password, not the `anon` API key.

Credentials are never hardcoded; `.env` is gitignored.

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000 (docs at `/docs`).

On startup the app creates tables if they are missing.

- If `DATABASE_URL` is set (Supabase Postgres), history lives there. Use this on Render so deploys do not wipe the tape.
- If `DATABASE_URL` is empty, it uses local SQLite at `backend/data/marketbrief.db` (gitignored).

The same article URL is not posted to Discord twice.

---

## Endpoints

| Method | Path        | Description |
| ------ | ----------- | ----------- |
| GET    | `/`         | Health check |
| GET    | `/news`     | Fetch recent news (`?ticker=`, `?topic=`, `?limit=`) |
| POST   | `/analyze`  | Analyze one article (JSON body) |
| POST   | `/run`      | Full pipeline: fetch → analyze → filter → publish to Discord |
| POST   | `/preview`  | Fetch + analyze without publishing (still stored) |
| GET    | `/feed`     | Latest stored analyses (`?decision=`, `?sector=`, `?ticker=`) |
| GET    | `/stats`    | Dashboard counts |
| GET    | `/runs`     | Recent pipeline invocations |

### Demo

```bash
curl -X POST "http://127.0.0.1:8000/run?topic=technology&limit=10"
```

Example response:

```json
{
  "articles_fetched": 10,
  "articles_analyzed": 10,
  "articles_published": 4,
  "articles_skipped": 6,
  "articles_duplicate": 2
}
```

Qualifying articles are posted to your Discord channel as embeds.

---

## How Analysis Works

- **Sectors** (`sector_classifier.py`): keyword matching against 5 hardcoded
  sectors — `semiconductors`, `memory`, `nuclear`, `energy`, `ai_infrastructure`.
  An article may match multiple sectors.
- **Importance** (`importance_classifier.py`): rule-based score in `[0.0, 1.0]`.
  High-signal events (earnings, acquisitions, capacity expansions, contracts,
  regulation) score higher; routine analyst notes / generic commentary score lower.
- **Publish decision**: `< 0.40` SKIP · `0.40–0.59` LOW · `≥ 0.60` PUSH.
  Only PUSH-tier, sector-relevant articles are sent to Discord.

The analyzer is modular — the rule-based classifiers can be replaced by ML
models later without changing the pipeline.

---

## Frontend (operator dashboard)

`frontend/` is a React + Vite + Tailwind dashboard that reads `/feed`, `/stats`,
and `/runs`, and can trigger Preview or Run. Vite proxies `/api` to the backend
on port 8000.

```bash
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173 with the API already running.

The public marketing site lives in `landingpage/`.

---

## Non-Goals (V0)

No authentication, payments, Discord bot/OAuth/slash commands, trading, or
cron scheduler yet. This slice proves fetch → analyze → store (SQLite locally, Supabase on Render)
→ optional Discord, plus an operator view of the tape.
