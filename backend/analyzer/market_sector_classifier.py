"""Broad market-sector classifier (second model).

Assigns each article to one Discord routing bucket: tech, nuclear,
healthcare, finance, energy, industrials, consumer, or general.

Isolated from the existing theme classifier (semis / memory / AI infra)
so either can be swapped independently.
"""

from __future__ import annotations

import re

# Priority used when keyword scores tie. Nuclear beats generic energy.
SECTOR_PRIORITY = (
    "nuclear",
    "healthcare",
    "finance",
    "tech",
    "energy",
    "industrials",
    "consumer",
    "general",
)

MARKET_SECTOR_KEYWORDS: dict[str, list[str]] = {
    "nuclear": [
        "nuclear", "uranium", "reactor", "smr", "small modular",
        "enrichment", "fission", "fuel rod", "cameco", "oklo",
        "nuscale", "atomic",
    ],
    "healthcare": [
        "health", "healthcare", "pharma", "pharmaceutical", "biotech",
        "biotechnology", "drug", "fda", "hospital", "medicare",
        "vaccine", "clinical trial", "oncology", "medtech", "pfizer",
        "moderna", "eli lilly", "novo nordisk",
    ],
    "finance": [
        "bank", "banks", "banking", "fintech", "insurance", "insurer",
        "credit", "loan", "mortgage", "federal reserve", "interest rate",
        "sec filing", "ipo", "hedge fund", "asset manager", "jpmorgan",
        "goldman", "blackrock", "visa", "mastercard", "crypto",
        "bitcoin", "etf",
    ],
    "tech": [
        "software", "semiconductor", "semiconductors", "chip", "chips",
        "gpu", "foundry", "tsmc", "nvidia", "apple", "microsoft",
        "google", "alphabet", "amazon", "meta", "cloud", "ai",
        "artificial intelligence", "data center", "datacenter", "saas",
        "cyber", "smartphone", "app store", "llm", "hyperscaler",
    ],
    "energy": [
        "oil", "crude", "lng", "natural gas", "refinery", "opec",
        "solar", "wind", "renewable", "utilities", "utility",
        "electricity", "power grid", "exxon", "chevron", "aramco",
    ],
    "industrials": [
        "aerospace", "defense", "airline", "boeing", "lockheed",
        "manufacturing", "factory", "freight", "logistics", "shipping",
        "construction", "caterpillar", "rail",
    ],
    "consumer": [
        "retail", "retailer", "consumer", "e-commerce", "walmart",
        "costco", "nike", "starbucks", "restaurant", "auto",
        "electric vehicle", "tesla", "ford", "gm ",
    ],
}


def _term_hits(haystack: str, terms: list[str]) -> int:
    score = 0
    for term in terms:
        if " " in term:
            if term in haystack:
                score += 2
            continue
        if re.search(rf"\b{re.escape(term)}\b", haystack):
            score += 1
    return score


def classify_market_sector(
    text: str,
    keywords: list[str] | None = None,
    tickers: list[str] | None = None,
) -> str:
    """Return the single best market sector for Discord routing."""
    haystack = text.lower()
    if keywords:
        haystack += " " + " ".join(k.lower() for k in keywords)
    if tickers:
        haystack += " " + " ".join(t.lower() for t in tickers)

    scores: dict[str, int] = {}
    for sector, terms in MARKET_SECTOR_KEYWORDS.items():
        hits = _term_hits(haystack, terms)
        if hits:
            scores[sector] = hits

    if not scores:
        return "general"

    best = max(scores.values())
    tied = [sector for sector, value in scores.items() if value == best]
    tied.sort(key=lambda s: SECTOR_PRIORITY.index(s) if s in SECTOR_PRIORITY else 99)
    return tied[0]
