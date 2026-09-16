"""Discord webhook integration.

Sends messages to a single configured Discord webhook. No bot, OAuth,
slash commands, or user accounts are involved (per POC scope).
"""

from __future__ import annotations

import httpx

from config import DISCORD_WEBHOOK_URL


class DiscordError(RuntimeError):
    """Raised when the webhook is misconfigured or the request fails."""


async def send_discord_message(message: str) -> None:
    """Send a plain-text message to the configured Discord webhook."""
    await _post({"content": message})


async def send_discord_embed(embed: dict) -> None:
    """Send a single Discord embed to the configured webhook."""
    await _post({"embeds": [embed]})


async def _post(payload: dict) -> None:
    if not DISCORD_WEBHOOK_URL or DISCORD_WEBHOOK_URL == "YOUR_DISCORD_WEBHOOK_URL":
        raise DiscordError(
            "DISCORD_WEBHOOK_URL is not configured. Set it in your .env file."
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(DISCORD_WEBHOOK_URL, json=payload)
        resp.raise_for_status()
