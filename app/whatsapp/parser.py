"""
app/whatsapp/parser.py
Parse raw Meta WhatsApp Cloud API webhook payloads into structured objects.

Meta webhook format reference:
https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
"""
from __future__ import annotations
import logging
from dataclasses import dataclass, field
from typing import Optional, List

logger = logging.getLogger(__name__)


@dataclass
class InboundMessage:
    """A single parsed inbound WhatsApp message."""
    wamid: str                     # Meta message ID — used for deduplication
    wa_id: str                     # Sender's E.164 phone number (no +)
    display_name: str              # Sender's WhatsApp profile name
    msg_type: str                  # text | interactive | button | image | audio | …
    body: str                      # Normalised text content
    phone_number_id: str           # Receiving phone number ID


@dataclass
class StatusUpdate:
    """A delivery / read status update from Meta."""
    wamid: str
    status: str        # sent | delivered | read | failed
    wa_id: str


def parse_webhook_payload(payload: dict) -> tuple[List[InboundMessage], List[StatusUpdate]]:
    """
    Parse a raw Meta webhook POST body.
    Returns (messages, status_updates).
    Skips unknown event types silently.
    """
    messages: List[InboundMessage] = []
    updates: List[StatusUpdate] = []

    if payload.get("object") != "whatsapp_business_account":
        return messages, updates

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            if change.get("field") != "messages":
                continue
            value = change.get("value", {})
            phone_number_id = value.get("metadata", {}).get("phone_number_id", "")

            # ── Status updates ────────────────────────────────────────────────
            for s in value.get("statuses", []):
                try:
                    updates.append(StatusUpdate(
                        wamid=s["id"],
                        status=s.get("status", "unknown"),
                        wa_id=s.get("recipient_id", ""),
                    ))
                except Exception as exc:
                    logger.debug("Skipping malformed status: %s", exc)

            # ── Inbound messages ──────────────────────────────────────────────
            contacts = {c.get("wa_id", ""): c.get("profile", {}).get("name", "User")
                        for c in value.get("contacts", [])}

            for msg in value.get("messages", []):
                try:
                    wamid = msg["id"]
                    wa_id = msg.get("from", "")
                    display_name = contacts.get(wa_id, "User")
                    msg_type = msg.get("type", "unknown")

                    body = _extract_body(msg, msg_type)

                    messages.append(InboundMessage(
                        wamid=wamid,
                        wa_id=wa_id,
                        display_name=display_name,
                        msg_type=msg_type,
                        body=body,
                        phone_number_id=phone_number_id,
                    ))
                except Exception as exc:
                    logger.warning("Skipping malformed message: %s", exc)

    return messages, updates


def _extract_body(msg: dict, msg_type: str) -> str:
    """Extract the text body from a message object based on its type."""
    if msg_type == "text":
        return msg.get("text", {}).get("body", "").strip()
    if msg_type == "interactive":
        itype = msg.get("interactive", {}).get("type", "")
        if itype == "button_reply":
            return msg["interactive"]["button_reply"].get("title", "").strip()
        if itype == "list_reply":
            return msg["interactive"]["list_reply"].get("title", "").strip()
    if msg_type == "button":
        return msg.get("button", {}).get("text", "").strip()
    # Unsupported type — return a placeholder
    return f"[{msg_type}]"
