"""Discord webhook integration.

Posts embeds into named threads when DISCORD_THREAD_* IDs are configured.
Without a thread id, the webhook's default channel is used.
"""

from __future__ import annotations

import httpx

from config import DISCORD_THREADS, DISCORD_WEBHOOK_URL


class DiscordError(RuntimeError):
    """Raised when the webhook is misconfigured or the request fails."""


def thread_id_for_sector(market_sector: str) -> str | None:
    """Resolve a Discord thread for a classified desk, if configured."""
    sector = (market_sector or "general").lower()
    return DISCORD_THREADS.get(sector) or DISCORD_THREADS.get("general") or None


async def send_discord_message(message: str, thread_id: str | None = None) -> None:
    """Send a plain-text message to the configured Discord webhook."""
    await _post({"content": message}, thread_id=thread_id)


async def send_discord_embed(embed: dict, thread_id: str | None = None) -> None:
    """Send a single Discord embed, optionally into a forum/text thread."""
    await _post({"embeds": [embed]}, thread_id=thread_id)


async def _post(payload: dict, thread_id: str | None = None) -> None:
    if not DISCORD_WEBHOOK_URL or DISCORD_WEBHOOK_URL == "YOUR_DISCORD_WEBHOOK_URL":
        raise DiscordError(
            "DISCORD_WEBHOOK_URL is not configured. Set it in your .env file."
        )

    params: dict[str, str] = {"wait": "true"}
    if thread_id:
        params["thread_id"] = thread_id

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(DISCORD_WEBHOOK_URL, params=params, json=payload)
        resp.raise_for_status()
