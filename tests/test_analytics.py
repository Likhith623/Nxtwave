import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.llm_provider import llm_service

client = TestClient(app)

def test_record_analytics_event():
    """Verify that client-side interaction events are recorded."""
    payload = {
        "event_name": "workshop_cta_clicked",
        "contract_id": "bc_demo_rag",
        "utm_source": "test_script",
        "metadata": {"button_location": "navbar"}
    }
    res = client.post("/api/analytics/event", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "recorded"
    assert "event_id" in res.json()

def test_admin_metrics_unauthorized():
    """Verify that admin metrics endpoint is protected and rejects unauthorized calls."""
    # No token
    res1 = client.get("/api/admin/metrics")
    assert res1.status_code == 401

    # Wrong token
    res2 = client.get("/api/admin/metrics?token=wrong_secret_token_123")
    assert res2.status_code == 401

def test_admin_metrics_authorized():
    """Verify authorized access to growth analytics metrics."""
    valid_token = settings.ADMIN_TOKEN
    res = client.get(f"/api/admin/metrics?token={valid_token}")
    assert res.status_code == 200
    data = res.json()
    assert "total_comparisons" in data
    assert "total_contracts" in data
    assert "total_challenges" in data
    assert "funnel_conversion_rates" in data
    assert "campaign_sources" in data
    assert "recent_registrations" in data

def test_admin_reset_demo_data():
    """Verify admin endpoint to safely reset and re-seed presentation data."""
    valid_token = settings.ADMIN_TOKEN
    res = client.post(f"/api/admin/reset?token={valid_token}")
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_whatsapp_simulator_zero_credentials():
    """Verify that WhatsApp simulator works locally without any external credentials."""
    payload = {
        "message": "I want to build an AI chatbot for student hostel and mess rules using RAG.",
        "domain": "AI/ML",
        "sender_name": "Campus Club Lead"
    }
    res = client.post("/api/whatsapp/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply_text" in data
    # Reply format changed — check for key content that is always present
    assert any(k in data["reply_text"] for k in ("BUILD CONTRACT READY", "Feasibility Score", "Project", "contract"))
    assert "Feasibility Score" in data["reply_text"]
    assert "/contract/" in data["contract_url"]

def test_whatsapp_meta_webhook_verification():
    """Verify official Meta WhatsApp Cloud API challenge verification."""
    token = settings.WHATSAPP_VERIFY_TOKEN
    challenge = "meta_test_challenge_code_9876"
    res = client.get(f"/webhook?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}")
    assert res.status_code == 200
    assert res.text == challenge

    # Bad token
    res_bad = client.get(f"/webhook?hub.mode=subscribe&hub.verify_token=bad_token&hub.challenge={challenge}")
    assert res_bad.status_code == 403

def test_optional_llm_graceful_fallback():
    """Verify that when LLM credentials are absent, the provider gracefully reports unavailable."""
    from app.services.llm_provider import LLMProvider
    test_provider = LLMProvider()
    test_provider.enabled = False
    test_provider.gemini_key = None
    test_provider.openai_key = None
    assert test_provider.is_available() is False
