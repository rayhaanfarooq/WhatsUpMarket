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

_MARKET_SECTOR_EMOJI = {
    "tech": "💻",
    "nuclear": "☢️",
    "healthcare": "🩺",
    "finance": "🏦",
    "energy": "⚡",
    "industrials": "🏭",
    "consumer": "🛒",
    "general": "📈",
}

_IMPACT_META = {
    "positive": ("🟢", "Positive", 0x2ECC71),
    "negative": ("🔴", "Negative", 0xE74C3C),
    "neutral": ("⚪", "Neutral", 0x95A5A6),
}


def _primary_desk(analysis: Analysis) -> str:
    return analysis.market_sector or (_primary_theme(analysis.sectors))


def _primary_theme(sectors: list[str]) -> str:
    return sectors[0] if sectors else "general"


def build_discord_embed(article: Article, analysis: Analysis) -> dict:
    """Build a Discord embed dict for a qualifying article."""
    desk = _primary_desk(analysis)
    sector_emoji = _MARKET_SECTOR_EMOJI.get(desk, "📈")
    sector_label = _MARKET_SECTOR_LABELS.get(desk, desk).upper()

    impact_emoji, impact_label, color = _IMPACT_META.get(
        analysis.impact, _IMPACT_META["neutral"]
    )

    labels = [_MARKET_SECTOR_LABELS.get(desk, desk)]
    for theme in analysis.sectors:
        label = _SECTOR_LABELS.get(theme, theme)
        if label not in labels:
            labels.append(label)
    sectors_str = " · ".join(labels) or "—"
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
