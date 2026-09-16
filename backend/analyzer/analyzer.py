"""Main article analyzer.

Combines sector classification, importance scoring, and a simple impact
heuristic into a single structured `Analysis`. This module is the stable
interface; the underlying classifiers can be swapped for ML models later.
"""

from __future__ import annotations

from config import SKIP_THRESHOLD
from models.schemas import Analysis, Article

from .importance_classifier import score_importance
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


def _detect_impact(text: str) -> str:
    haystack = text.lower()
    pos = sum(1 for t in _POSITIVE_TERMS if t in haystack)
    neg = sum(1 for t in _NEGATIVE_TERMS if t in haystack)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def _build_reason(sectors: list[str], impact: str, importance: float) -> str:
    if not sectors:
        return "No target sectors matched; likely not relevant to the feed."
    labels = ", ".join(_SECTOR_LABELS.get(s, s) for s in sectors)
    return (
        f"{impact.capitalize()} development relevant to {labels} "
        f"(importance {importance:.0%})."
    )


def analyze_article(article: Article) -> Analysis:
    """Analyze a single article and return structured intelligence."""
    text = f"{article.title} {article.summary}"

    sectors = classify_sectors(text, article.keywords)
    importance = score_importance(text, article.tickers)
    impact = _detect_impact(text)

    # An article is relevant if it maps to at least one sector and clears
    # the skip threshold.
    relevant = bool(sectors) and importance >= SKIP_THRESHOLD

    return Analysis(
        relevant=relevant,
        importance=round(importance, 2),
        sectors=sectors,
        tickers=article.tickers,
        impact=impact,
        reason=_build_reason(sectors, impact, importance),
    )
