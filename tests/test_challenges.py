import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_peer_challenge_workflow():
    """Verify peer challenge submission, validation, and recommendation generation."""
    # Create fresh contract to guarantee test isolation
    c_res = client.post("/api/contracts", json={
        "selected_project_title": "AI College-Policy QA Assistant Test",
        "selected_project_description": "An interactive chatbot grounded in college academic regulations.",
        "domain": "AI/ML",
        "experience": "intermediate",
        "languages": ["Python"],
        "time_weeks": 4,
        "team_size": 2,
        "resources": ["laptop"]
    })
    assert c_res.status_code == 200
    contract_id = c_res.json()["contract_id"]
    
    payload = {
        "peer_name": "Siddharth (4th Year IT)",
        "challenge_text": "What happens when a student asks about attendance exemption for sports tournaments that is only documented in a separate 2026 circular?",
        "why_it_matters": "If the model quotes outdated 2022 rules, the student will miss the sports quota deadline and face attendance detention.",
        "improvement_suggestion": "Add metadata tags for publication year and reject queries matching sports keywords if circular is unindexed."
    }

    # 1. Submit challenge
    res = client.post(f"/api/contracts/{contract_id}/challenges", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "challenge_id" in data
    assert data["peer_name"] == "Siddharth (4th Year IT)"
    
    # Check recommendation
    rec = data["recommendation"]
    assert rec["risk_level"] in ["High", "Moderate", "Minor"]
    assert "Recommended Scope Adjustment" in rec["recommended_scope_adjustment"] or len(rec["recommended_scope_adjustment"]) > 10
    assert rec["new_failure_test_added"] is not None
    assert rec["new_failure_test_added"]["test_id"].startswith("TST-PEER-")

    # 2. Verify challenge history updated
    list_res = client.get(f"/api/contracts/{contract_id}/challenges")
    assert list_res.status_code == 200
    challenges = list_res.json()
    assert any(c["challenge_id"] == data["challenge_id"] for c in challenges)

def test_peer_challenge_invalid_length():
    """Verify rejection of empty or excessively short challenge text."""
    res = client.post("/api/contracts/bc_demo_rag/challenges", json={
        "peer_name": "Tester",
        "challenge_text": "Too short",  # < 10 chars
        "why_it_matters": "Why"         # < 5 chars
    })
    assert res.status_code == 422

def test_peer_challenge_duplicate_rejection():
    """Verify rejection of immediate duplicate submissions on same contract."""
    # Create fresh contract to guarantee clean slate for duplicate test
    c_res = client.post("/api/contracts", json={
        "selected_project_title": "AI Dupe Test Project",
        "selected_project_description": "Test project for duplicate rejection check.",
        "domain": "AI/ML",
        "experience": "intermediate",
        "languages": ["Python"],
        "time_weeks": 4,
        "team_size": 2,
        "resources": ["laptop"]
    })
    assert c_res.status_code == 200
    contract_id = c_res.json()["contract_id"]

    payload = {
        "peer_name": "Dupe Peer",
        "challenge_text": "What happens if a user submits random non-English symbols or corrupted UTF-8 files?",
        "why_it_matters": "Could trigger unhandled parsing exception on the ingestion pipeline.",
        "improvement_suggestion": "Wrap PDF parser in try-except block."
    }
    
    # First submit -> 201
    res1 = client.post(f"/api/contracts/{contract_id}/challenges", json=payload)
    assert res1.status_code == 201

    # Second identical submit -> 409 Conflict
    res2 = client.post(f"/api/contracts/{contract_id}/challenges", json=payload)
    assert res2.status_code == 409
    assert "already been submitted" in res2.json()["detail"]
