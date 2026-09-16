"""Pydantic models for the MarketBrief POC."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Impact = Literal["positive", "negative", "neutral"]


class Article(BaseModel):
    """A normalized news article used as analyzer input."""

    title: str
    summary: str = ""
    tickers: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    source: str | None = None
    url: str | None = None


class Analysis(BaseModel):
    """Structured analysis produced for a single article."""

    relevant: bool
    importance: float = Field(ge=0.0, le=1.0)
    sectors: list[str] = Field(default_factory=list)
    tickers: list[str] = Field(default_factory=list)
    impact: Impact = "neutral"
    reason: str = ""


class AnalyzedArticle(BaseModel):
    """An article paired with its analysis."""

    article: Article
    analysis: Analysis


class RunSummary(BaseModel):
    """Summary returned by the /run pipeline endpoint."""

    articles_fetched: int
    articles_analyzed: int
    articles_published: int
    articles_skipped: int
    articles_duplicate: int = 0


class FeedItem(BaseModel):
    """Latest analysis for an article, used by the dashboard feed."""

    article_id: int
    title: str
    summary: str = ""
    url: str | None = None
    source: str | None = None
    tickers: list[str] = Field(default_factory=list)
    sectors: list[str] = Field(default_factory=list)
    importance: float
    impact: Impact = "neutral"
    relevant: bool
    decision: str
    reason: str = ""
    published: bool = False
    analyzed_at: str


class DashboardStats(BaseModel):
    """Aggregate counts for the operator dashboard."""

    articles_stored: int
    analyses_stored: int
    published: int
    pipeline_runs: int
    last_run_at: str | None = None
    latest_by_decision: dict[str, int] = Field(default_factory=dict)


class PipelineRun(BaseModel):
    """One recorded /run invocation."""

    ticker: str | None = None
    topic: str | None = None
    articles_fetched: int
    articles_analyzed: int
    articles_published: int
    articles_skipped: int
    articles_duplicate: int = 0
    started_at: str
    finished_at: str
