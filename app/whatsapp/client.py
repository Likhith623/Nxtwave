"""
app/whatsapp/client.py
Async HTTP client for the Meta WhatsApp Cloud API (Graph API v21.0).

Responsibilities:
  - Send text messages via POST /messages
  - Respect WHATSAPP_MODE: local_simulation / test / production
  - In test mode — only send to WHATSAPP_ALLOWED_RECIPIENTS
  - In production mode — must be explicitly enabled; never auto-activated
  - Mask access tokens and full phone numbers in all log output
  - Handle retries, timeouts, and rate limits

Reference:
  https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
"""
from __future__ import annotations
import asyncio
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Timeout for all Graph API calls (seconds)
_TIMEOUT = httpx.Timeout(15.0, connect=5.0)
# Maximum retries on transient 5xx / network errors
_MAX_RETRIES = 2


def _mask_phone(wa_id: str) -> str:
    """Return only the last 4 digits of a phone number for safe logging."""
    if len(wa_id) > 4:
        return "****" + wa_id[-4:]
    return "****"


def _mask_token(token: str) -> str:
    """Return only the first 8 chars of a token for safe logging."""
    return token[:8] + "…" if len(token) > 8 else "***"


async def send_text_message(
    to_wa_id: str,
    body: str,
    *,
    preview_url: bool = False,
) -> dict:
    """
    Send a plain-text WhatsApp message.

    Returns a dict with keys:
        success (bool), wamid (str|None), mode (str), detail (str)
    """
    mode = settings.WHATSAPP_MODE

    # ── Local simulation — no network call ────────────────────────────────────
    if mode == "local_simulation":
        logger.info(
            "[WA-SIM] → %s | %.80s…", _mask_phone(to_wa_id), body
        )
        return {
            "success": True,
            "wamid": f"wamid.simulated_{to_wa_id[-4:]}",
            "mode": "local_simulation",
            "detail": "Simulated — no network call made.",
        }

    # ── Guard: test mode restricts recipients ─────────────────────────────────
    if mode == "test":
        allowed = settings.WHATSAPP_ALLOWED_RECIPIENTS
        # Normalise: compare without leading +
        normalised_to = to_wa_id.lstrip("+")
        normalised_allowed = [r.lstrip("+") for r in allowed]
        if allowed and normalised_to not in normalised_allowed:
            logger.warning(
                "[WA-TEST] Blocked outbound to %s — not in allowed recipients.",
                _mask_phone(to_wa_id),
            )
            return {
                "success": False,
                "wamid": None,
                "mode": "test",
                "detail": "Recipient not in WHATSAPP_ALLOWED_RECIPIENTS; message blocked.",
            }

    # ── Guard: production must be explicitly enabled ──────────────────────────
    if mode == "production" and not settings.is_production:
        logger.error("[WA] Production mode blocked — APP_ENV is not 'production'.")
        return {
            "success": False,
            "wamid": None,
            "mode": "production_blocked",
            "detail": "Set APP_ENV=production in .env to enable production messaging.",
        }

    # ── Real API call ─────────────────────────────────────────────────────────
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return {
            "success": False,
            "wamid": None,
            "mode": mode,
            "detail": "WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured.",
        }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_wa_id,
        "type": "text",
        "text": {"body": body, "preview_url": preview_url},
    }
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    url = settings.whatsapp_graph_url

    logger.info(
        "[WA-%s] → %s | token=%s",
        mode.upper(),
        _mask_phone(to_wa_id),
        _mask_token(settings.WHATSAPP_ACCESS_TOKEN),
    )

    for attempt in range(1, _MAX_RETRIES + 2):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, json=payload, headers=headers)

            if resp.status_code == 200:
                data = resp.json()
                wamid = (
                    data.get("messages", [{}])[0].get("id")
                    if data.get("messages")
                    else None
                )
                logger.info("[WA] Message accepted — wamid=%s", wamid)
                return {"success": True, "wamid": wamid, "mode": mode, "detail": "ok"}

            # Token expired / auth error — do not retry
            if resp.status_code in (401, 403):
                detail = resp.text[:200]
                logger.error("[WA] Auth error %d: %s", resp.status_code, detail)
                return {"success": False, "wamid": None, "mode": mode,
                        "detail": f"Auth error {resp.status_code}: token may be expired."}

            # Rate-limited — back off and retry
            if resp.status_code == 429 and attempt <= _MAX_RETRIES:
                await asyncio.sleep(2 ** attempt)
                continue

            # Other 4xx — bad request; do not retry
            if 400 <= resp.status_code < 500:
                detail = resp.text[:200]
                logger.error("[WA] Client error %d: %s", resp.status_code, detail)
                return {"success": False, "wamid": None, "mode": mode,
                        "detail": f"Client error {resp.status_code}."}

            # 5xx — retry
            if attempt <= _MAX_RETRIES:
                await asyncio.sleep(2 ** attempt)
                continue

            return {"success": False, "wamid": None, "mode": mode,
                    "detail": f"Server error {resp.status_code}."}

        except httpx.TimeoutException:
            logger.warning("[WA] Timeout on attempt %d/%d", attempt, _MAX_RETRIES + 1)
            if attempt <= _MAX_RETRIES:
                await asyncio.sleep(2)
                continue
            return {"success": False, "wamid": None, "mode": mode,
                    "detail": "Request timed out after retries."}

        except Exception as exc:
            logger.exception("[WA] Unexpected error: %s", exc)
            return {"success": False, "wamid": None, "mode": mode,
                    "detail": f"Unexpected error: {type(exc).__name__}"}

    return {"success": False, "wamid": None, "mode": mode, "detail": "Max retries exceeded."}
