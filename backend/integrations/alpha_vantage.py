"""Alpha Vantage NEWS_SENTIMENT integration.

Only the NEWS_SENTIMENT endpoint is implemented for the POC.
Docs: https://www.alphavantage.co/documentation/
"""

from __future__ import annotations

import httpx

from config import ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL
from models.schemas import Article


class AlphaVantageError(RuntimeError):
    """Raised when Alpha Vantage returns an error or is misconfigured."""


def _parse_article(item: dict) -> Article:
    """Convert a raw Alpha Vantage feed item into an Article."""
    tickers = [
        t.get("ticker", "")
        for t in item.get("ticker_sentiment", [])
        if t.get("ticker")
    ]
    keywords = [
        t.get("topic", "")
        for t in item.get("topics", [])
        if t.get("topic")
    ]
    return Article(
        title=item.get("title", "").strip(),
        summary=item.get("summary", "").strip(),
        tickers=tickers,
        keywords=keywords,
        source=item.get("source"),
        url=item.get("url"),
    )


async def fetch_news(
    tickers: str | None = None,
    topics: str | None = None,
    limit: int = 10,
) -> list[Article]:
    """Fetch recent financial news from Alpha Vantage NEWS_SENTIMENT.

    Args:
        tickers: Optional comma-separated tickers, e.g. "NVDA,MU,TSM".
        topics: Optional comma-separated topics, e.g. "technology".
        limit: Max number of articles to return (default 10).
    """
    if not ALPHA_VANTAGE_API_KEY or ALPHA_VANTAGE_API_KEY == "YOUR_ALPHA_VANTAGE_KEY":
        raise AlphaVantageError(
            "ALPHA_VANTAGE_API_KEY is not configured. Set it in your .env file."
        )

    params: dict[str, str | int] = {
        "function": "NEWS_SENTIMENT",
        "sort": "LATEST",
        "limit": limit,
        "apikey": ALPHA_VANTAGE_API_KEY,
    }
    if tickers:
        params["tickers"] = tickers
    if topics:
        params["topics"] = topics

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(ALPHA_VANTAGE_BASE_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    # Alpha Vantage returns error/notes as plain keys rather than HTTP errors.
    if "feed" not in data:
        note = (
            data.get("Note")
            or data.get("Information")
            or data.get("Error Message")
            or "Unexpected response from Alpha Vantage."
        )
        raise AlphaVantageError(str(note))

    feed = data.get("feed", [])[:limit]
    return [_parse_article(item) for item in feed]
