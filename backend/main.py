"""MarketBrief FastAPI application.

Pipeline: Alpha Vantage NEWS_SENTIMENT -> Analyzer -> Filter -> Discord.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from analyzer.analyzer import analyze_article
from config import PUSH_THRESHOLD
from integrations.alpha_vantage import AlphaVantageError, fetch_news
from integrations.discord import DiscordError, send_discord_embed
from integrations.formatter import build_discord_embed
from models.schemas import (
    AnalyzedArticle,
    Analysis,
    Article,
    RunSummary,
)

app = FastAPI(title="MarketBrief", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health() -> dict:
    """Health check."""
    return {"status": "ok", "service": "marketbrief"}


@app.get("/news", response_model=list[Article])
async def get_news(
    ticker: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> list[Article]:
    """Fetch recent Alpha Vantage news."""
    try:
        return await fetch_news(tickers=ticker, topics=topic, limit=limit)
    except AlphaVantageError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/analyze", response_model=Analysis)
async def analyze(article: Article) -> Analysis:
    """Analyze a single article."""
    return analyze_article(article)


@app.post("/run", response_model=RunSummary)
async def run(
    ticker: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> RunSummary:
    """Run the complete pipeline and publish qualifying articles to Discord."""
    try:
        articles = await fetch_news(tickers=ticker, topics=topic, limit=limit)
    except AlphaVantageError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    fetched = len(articles)
    published = 0

    for article in articles:
        analysis = analyze_article(article)
        # PUSH: importance high enough and relevant.
        if analysis.relevant and analysis.importance >= PUSH_THRESHOLD:
            embed = build_discord_embed(article, analysis)
            try:
                await send_discord_embed(embed)
                published += 1
            except DiscordError as exc:
                raise HTTPException(status_code=502, detail=str(exc)) from exc

    return RunSummary(
        articles_fetched=fetched,
        articles_analyzed=fetched,
        articles_published=published,
        articles_skipped=fetched - published,
    )


@app.post("/preview", response_model=list[AnalyzedArticle])
async def preview(
    ticker: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> list[AnalyzedArticle]:
    """Fetch + analyze without publishing (useful for local demos)."""
    try:
        articles = await fetch_news(tickers=ticker, topics=topic, limit=limit)
    except AlphaVantageError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return [
        AnalyzedArticle(article=a, analysis=analyze_article(a)) for a in articles
    ]
