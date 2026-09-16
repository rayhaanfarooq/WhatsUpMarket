# WhatsUpMarket — MarketBrief (Lean POC)

A lightweight financial-news intelligence pipeline:

> **Financial News → Analysis → Structured Intelligence → Discord**

It fetches financial news from Alpha Vantage (`NEWS_SENTIMENT`), analyzes each
article (sector classification, importance scoring, impact/sentiment), decides
whether it's worth surfacing, formats qualifying articles, and publishes them to
a Discord channel via a webhook. Exposed through a small FastAPI backend.

This is an intentionally lean V0. No database, no auth, no Discord bot.

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
│   ├── models/schemas.py      # Pydantic models
│   └── requirements.txt
├── frontend/                  # React + Vite + Tailwind (blank placeholder)
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
```

- Get a free Alpha Vantage key: https://www.alphavantage.co/support/#api-key
- Create a Discord webhook: Channel Settings → Integrations → Webhooks → New Webhook → Copy URL

Credentials are never hardcoded; `.env` is gitignored.

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000 (docs at `/docs`).

---

## Endpoints

| Method | Path        | Description |
| ------ | ----------- | ----------- |
| GET    | `/`         | Health check |
| GET    | `/news`     | Fetch recent news (`?ticker=`, `?topic=`, `?limit=`) |
| POST   | `/analyze`  | Analyze one article (JSON body) |
| POST   | `/run`      | Full pipeline: fetch → analyze → filter → publish to Discord |
| POST   | `/preview`  | Fetch + analyze without publishing (demo helper) |

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
  "articles_skipped": 6
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

## Frontend

`frontend/` is a React + Vite + Tailwind scaffold intentionally left blank
(`App.jsx` is a placeholder). To start it later:

```bash
cd frontend
npm install
npm run dev
```

---

## Non-Goals (V0)

No database, authentication, payments, Discord bot/OAuth/slash commands,
trading, or complex frontend. This POC proves one vertical slice only.
