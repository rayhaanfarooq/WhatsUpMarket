"""Format analyzed articles into polished Discord embeds."""

from __future__ import annotations

from models.schemas import Article, Analysis

_SECTOR_LABELS = {
    "memory": "Memory",
    "semiconductors": "Semiconductors",
    "nuclear": "Nuclear",
    "energy": "Energy",
    "ai_infrastructure": "AI Infrastructure",
}

_SECTOR_EMOJI = {
    "memory": "💾",
    "semiconductors": "🧩",
    "nuclear": "☢️",
    "energy": "⚡",
    "ai_infrastructure": "🤖",
}

_IMPACT_META = {
    "positive": ("🟢", "Positive", 0x2ECC71),
    "negative": ("🔴", "Negative", 0xE74C3C),
    "neutral": ("⚪", "Neutral", 0x95A5A6),
}


def _primary_sector(sectors: list[str]) -> str:
    return sectors[0] if sectors else "ai_infrastructure"


def build_discord_embed(article: Article, analysis: Analysis) -> dict:
    """Build a Discord embed dict for a qualifying article."""
    primary = _primary_sector(analysis.sectors)
    sector_emoji = _SECTOR_EMOJI.get(primary, "📈")
    sector_label = _SECTOR_LABELS.get(primary, primary).upper()

    impact_emoji, impact_label, color = _IMPACT_META.get(
        analysis.impact, _IMPACT_META["neutral"]
    )

    sectors_str = " · ".join(
        _SECTOR_LABELS.get(s, s) for s in analysis.sectors
    ) or "—"
    tickers_str = " ".join(f"${t}" for t in analysis.tickers) or "—"

    fields = [
        {"name": "Sectors", "value": sectors_str, "inline": False},
        {"name": "Affected", "value": tickers_str, "inline": True},
        {
            "name": "Importance",
            "value": f"🔥 {analysis.importance:.0%}",
            "inline": True,
        },
        {"name": "Impact", "value": f"{impact_emoji} {impact_label}", "inline": True},
        {"name": "Why it matters", "value": analysis.reason or "—", "inline": False},
    ]

    embed: dict = {
        "title": article.title[:256],
        "color": color,
        "author": {"name": f"{sector_emoji} {sector_label} — MARKETBRIEF"},
        "fields": fields,
    }
    if article.url:
        embed["url"] = article.url
    if article.source:
        embed["footer"] = {"text": f"Source · {article.source}"}
    return embed
