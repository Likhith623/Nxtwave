import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_registration_status():
    """Verify workshop registration mode status endpoint."""
    res = client.get("/api/register/status")
    assert res.status_code == 200
    data = res.json()
    assert "mode" in data
    assert "workshop_title" in data
    assert data["workshop_title"] == "Build Your First AI Project in 60 Minutes"

def test_registration_success_and_normalization():
    """Verify successful demo registration, lowercase normalization, and attribution."""
    payload = {
        "name": "Rohan Verma",
        "email": "Rohan.Verma.2026@Campus.Edu",  # Mixed case
        "phone": "+91 91234 56789",
        "contract_id": "bc_demo_rag",
        "utm_source": "whatsapp_club",
        "utm_medium": "message_forward",
        "utm_campaign": "growth_round_1"
    }
    
    res = client.post("/api/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Rohan Verma"
    assert data["email"] == "rohan.verma.2026@campus.edu"  # Normalized lowercase
    assert data["is_demo"] is True
    assert "registration_id" in data

def test_duplicate_registration_prevention():
    """Verify that registering twice with same email returns existing record gracefully."""
    email = "duplicate.check@example.com"
    payload = {
        "name": "Same Person",
        "email": email,
        "contract_id": "bc_demo_rag"
    }
    
    # First registration
    res1 = client.post("/api/register", json=payload)
    assert res1.status_code == 201
    reg_id_1 = res1.json()["registration_id"]

    # Second registration with uppercase variation
    payload2 = {
        "name": "Same Person",
        "email": "DUPLICATE.CHECK@EXAMPLE.COM",
        "contract_id": "bc_demo_rag"
    }
    res2 = client.post("/api/register", json=payload2)
    assert res2.status_code == 200  # Returns existing with friendly message
    assert res2.json()["registration_id"] == reg_id_1
    assert "already registered" in res2.json()["message"].lower()

def test_invalid_email_format():
    """Verify server rejects malformed email strings."""
    payload = {
        "name": "Invalid Person",
        "email": "not-an-email-at-all",
        "contract_id": "bc_demo_rag"
    }
    res = client.post("/api/register", json=payload)
    assert res.status_code == 422

