"""Main article analyzer.

Combines sector classification, importance scoring, and a simple impact
heuristic into a single structured `Analysis`. This module is the stable
interface; the underlying classifiers can be swapped for ML models later.
"""

from __future__ import annotations

from config import PUSH_THRESHOLD, SKIP_THRESHOLD
from models.schemas import Analysis, Article

from .importance_classifier import score_importance
from .market_sector_classifier import classify_market_sector
from .sector_classifier import classify_sectors

_POSITIVE_TERMS = [
    "beat", "surge", "record", "growth", "strong", "demand", "expands",
    "expansion", "wins", "gains", "rises", "boom", "breakthrough", "up",
]
_NEGATIVE_TERMS = [
    "miss", "falls", "decline", "cut", "cuts", "weak", "shortage", "ban",
    "sanction", "lawsuit", "drop", "slump", "loss", "down", "warning",
]

_SECTOR_LABELS = {
    "memory": "Memory",
    "semiconductors": "Semiconductors",
    "nuclear": "Nuclear",
    "energy": "Energy",
    "ai_infrastructure": "AI Infrastructure",
}


_MARKET_SECTOR_LABELS = {
    "tech": "Tech",
    "nuclear": "Nuclear",
    "healthcare": "Healthcare",
    "finance": "Finance",
    "energy": "Energy",
    "industrials": "Industrials",
    "consumer": "Consumer",
    "general": "General",
}


def _detect_impact(text: str) -> str:
    haystack = text.lower()
    pos = sum(1 for t in _POSITIVE_TERMS if t in haystack)
    neg = sum(1 for t in _NEGATIVE_TERMS if t in haystack)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def _build_reason(
    sectors: list[str],
    market_sector: str,
    impact: str,
    importance: float,
) -> str:
    desk = _MARKET_SECTOR_LABELS.get(market_sector, market_sector)
    if market_sector == "general" and not sectors:
        return "No market sector matched; kept off the Discord desks."
    labels = ", ".join(_SECTOR_LABELS.get(s, s) for s in sectors) or desk
    return (
        f"{impact.capitalize()} {desk.lower()} story"
        f"{f' ({labels})' if sectors else ''} "
        f"(importance {importance:.0%})."
    )


def analyze_article(article: Article) -> Analysis:
    """Analyze a single article and return structured intelligence."""
    text = f"{article.title} {article.summary}"

    sectors = classify_sectors(text, article.keywords)
    market_sector = classify_market_sector(text, article.keywords, article.tickers)
    importance = score_importance(text, article.tickers)
    impact = _detect_impact(text)

    relevant = market_sector != "general" and importance >= SKIP_THRESHOLD

    return Analysis(
        relevant=relevant,
        importance=round(importance, 2),
        sectors=sectors,
        market_sector=market_sector,
        tickers=article.tickers,
        impact=impact,
        reason=_build_reason(sectors, market_sector, impact, importance),
    )


def publish_decision(analysis: Analysis) -> str:
    """Map analysis into SKIP / LOW / PUSH using the configured thresholds."""
    if not analysis.relevant or analysis.importance < SKIP_THRESHOLD:
        return "SKIP"
    if analysis.importance >= PUSH_THRESHOLD:
        return "PUSH"
    return "LOW"
