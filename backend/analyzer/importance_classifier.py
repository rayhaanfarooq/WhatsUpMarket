"""Rule-based importance scoring.

Answers: "Is this article useful enough to surface in a sector-specific
investor feed?" Returns a score in [0.0, 1.0].

Isolated behind `score_importance` so it can be replaced by an ML model.
"""

from __future__ import annotations

# High-signal events that make an article more important.
HIGH_SIGNAL_TERMS: list[str] = [
    "earnings", "revenue beat", "guidance", "acquisition", "acquires",
    "merger", "capacity expansion", "expands capacity", "expansion",
    "contract", "deal", "partnership", "regulatory", "regulation",
    "ban", "sanction", "tariff", "new facility", "new plant", "factory",
    "product launch", "launches", "unveils", "breakthrough", "shortage",
    "supply", "demand surge", "record", "billion", "investment",
]

# Low-signal patterns that reduce importance.
LOW_SIGNAL_TERMS: list[str] = [
    "price target", "analyst", "upgrade", "downgrade", "reiterates",
    "intraday", "slightly", "opinion", "commentary", "why you should",
    "3 stocks", "5 stocks", "best stocks", "moving today", "premarket",
]


def score_importance(text: str, tickers: list[str] | None = None) -> float:
    """Compute an importance score in [0.0, 1.0] from article text."""
    haystack = text.lower()

    score = 0.45  # neutral baseline

    high_hits = sum(1 for term in HIGH_SIGNAL_TERMS if term in haystack)
    low_hits = sum(1 for term in LOW_SIGNAL_TERMS if term in haystack)

    score += 0.12 * high_hits
    score -= 0.15 * low_hits

    # Concrete affected companies add a small amount of signal.
    if tickers:
        score += 0.05

    return max(0.0, min(1.0, score))
