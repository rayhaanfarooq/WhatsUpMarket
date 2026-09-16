"""MarketBrief FastAPI application.

Pipeline: Alpha Vantage NEWS_SENTIMENT -> Analyzer -> Filter -> Discord.
Articles, analyses, and publishes are persisted to Postgres (Supabase)
when DATABASE_URL is set, otherwise local SQLite.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from analyzer.analyzer import analyze_article, publish_decision
from config import PUSH_THRESHOLD
from integrations.alpha_vantage import AlphaVantageError, fetch_news
from integrations.discord import DiscordError, send_discord_embed
from integrations.formatter import build_discord_embed
from models.schemas import (
    AnalyzedArticle,
    Analysis,
    Article,
    DashboardStats,
    FeedItem,
    PipelineRun,
    RunSummary,
)
import store


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    store.init_db()
    yield


app = FastAPI(title="MarketBrief", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health() -> dict:
    """Health check."""
    return {"status": "ok", "service": "marketbrief", "database": store.backend_name()}


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
    started_at = _utcnow()
    try:
        articles = await fetch_news(tickers=ticker, topics=topic, limit=limit)
    except AlphaVantageError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    fetched = len(articles)
    published = 0
    duplicates = 0

    for article in articles:
        analysis = analyze_article(article)
        decision = publish_decision(analysis)
        article_id, created = store.upsert_article(article)
        if not created:
            duplicates += 1
        analysis_id = store.save_analysis(article_id, analysis, decision)

        already_sent = store.is_published(article_id)
        if (
            decision == "PUSH"
            and analysis.relevant
            and analysis.importance >= PUSH_THRESHOLD
            and not already_sent
        ):
            embed = build_discord_embed(article, analysis)
            try:
                await send_discord_embed(embed)
            except DiscordError as exc:
                raise HTTPException(status_code=502, detail=str(exc)) from exc
            store.record_publish(article_id, analysis_id)
            published += 1

    skipped = fetched - published
    store.record_run(
        ticker=ticker,
        topic=topic,
        articles_fetched=fetched,
        articles_analyzed=fetched,
        articles_published=published,
        articles_skipped=skipped,
        articles_duplicate=duplicates,
        started_at=started_at,
    )

    return RunSummary(
        articles_fetched=fetched,
        articles_analyzed=fetched,
        articles_published=published,
        articles_skipped=skipped,
        articles_duplicate=duplicates,
    )


@app.post("/preview", response_model=list[AnalyzedArticle])
async def preview(
    ticker: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> list[AnalyzedArticle]:
    """Fetch + analyze without publishing (useful for local demos)."""
    started_at = _utcnow()
    try:
        articles = await fetch_news(tickers=ticker, topics=topic, limit=limit)
    except AlphaVantageError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    results: list[AnalyzedArticle] = []
    duplicates = 0
    for article in articles:
        analysis = analyze_article(article)
        decision = publish_decision(analysis)
        article_id, created = store.upsert_article(article)
        if not created:
            duplicates += 1
        store.save_analysis(article_id, analysis, decision)
        results.append(AnalyzedArticle(article=article, analysis=analysis))

    store.record_run(
        ticker=ticker,
        topic=topic,
        articles_fetched=len(articles),
        articles_analyzed=len(articles),
        articles_published=0,
        articles_skipped=len(articles),
        articles_duplicate=duplicates,
        started_at=started_at,
    )
    return results


@app.get("/feed", response_model=list[FeedItem])
async def get_feed(
    decision: str | None = Query(default=None),
    sector: str | None = Query(default=None),
    ticker: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[FeedItem]:
    """Latest stored analyses for the dashboard."""
    return [FeedItem(**item) for item in store.list_feed(
        decision=decision,
        sector=sector,
        ticker=ticker,
        limit=limit,
    )]


@app.get("/stats", response_model=DashboardStats)
async def get_stats() -> DashboardStats:
    """Aggregate counts for the dashboard header."""
    return DashboardStats(**store.get_stats())


@app.get("/runs", response_model=list[PipelineRun])
async def get_runs(limit: int = Query(default=20, ge=1, le=100)) -> list[PipelineRun]:
    """Recent pipeline invocations."""
    return [PipelineRun(**row) for row in store.list_runs(limit=limit)]
