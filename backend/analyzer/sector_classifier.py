"""Keyword-based sector classification.

This is intentionally simple. It is isolated behind `classify_sectors`
so it can later be swapped for an ML model without touching the rest
of the pipeline.
"""

from __future__ import annotations

# Lowercase keyword lists per sector.
SECTOR_KEYWORDS: dict[str, list[str]] = {
    "memory": [
        "hbm", "dram", "nand", "memory", "sk hynix", "hynix",
        "micron", "samsung", "flash storage", "ssd",
    ],
    "semiconductors": [
        "gpu", "chip", "chips", "chipmaker", "semiconductor", "semiconductors",
        "foundry", "tsmc", "nvidia", "amd", "asml", "intel", "wafer",
        "lithography", "node", "fab",
    ],
    "nuclear": [
        "nuclear", "uranium", "reactor", "smr", "small modular reactor",
        "enrichment", "fission", "fuel rods", "nuclear power",
    ],
    "energy": [
        "energy", "oil", "gas", "renewable", "solar", "wind", "grid",
        "power plant", "electricity", "battery", "lng", "crude",
        "utilities", "utility",
    ],
    "ai_infrastructure": [
        "ai", "artificial intelligence", "data center", "datacenter",
        "cloud", "compute", "training cluster", "accelerator", "inference",
        "gpu cluster", "hyperscaler", "llm", "supercomputer",
    ],
}


def classify_sectors(text: str, keywords: list[str] | None = None) -> list[str]:
    """Return the list of sectors matched in the given text.

    Args:
        text: Combined title + summary text.
        keywords: Optional extra keywords (e.g. from the article) to include.
    """
    haystack = text.lower()
    if keywords:
        haystack += " " + " ".join(k.lower() for k in keywords)

    matched: list[str] = []
    for sector, terms in SECTOR_KEYWORDS.items():
        if any(term in haystack for term in terms):
            matched.append(sector)
    return matched
