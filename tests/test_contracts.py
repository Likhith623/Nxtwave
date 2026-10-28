import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_and_get_build_contract():
    """Verify creating a Build Contract and retrieving it via public ID."""
    payload = {
        "selected_project_title": "AI Plant Disease Classifier",
        "selected_project_description": "Mobile camera photo classifier using MobileNet transfer learning on crop leaf diseases.",
        "domain": "Computer Vision",
        "experience": "beginner",
        "languages": ["Python"],
        "time_weeks": 3,
        "team_size": 1,
        "resources": ["laptop", "public dataset"],
        "primary_goal": "portfolio",
        "referral_source": "test_runner"
    }
    
    # 1. Create contract
    res = client.post("/api/contracts", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "contract_id" in data
    assert data["contract_id"].startswith("bc_")
    assert data["project_title"] == "AI Plant Disease Classifier"
    assert "critical_assumption" in data
    assert len(data["critical_assumption"]) > 10
    
    # Verify Failure Tests
    assert len(data["failure_scenarios"]) >= 2
    test_1 = data["failure_scenarios"][0]
    assert "test_procedure" in test_1
    assert "expected_observation" in test_1
    assert "acceptance_criteria" in test_1
    assert "remediation_plan" in test_1

    # Verify MVP Boundaries
    assert len(data["mvp_features"]) >= 3
    assert len(data["deferred_features"]) >= 2

    # Verify 60-Minute Plan
    assert len(data["plan_60min"]) == 4
    assert data["plan_60min"][0]["time_window"] == "Minutes 00-15"

    # Verify URLs
    assert "/contract/" in data["share_url"]
    assert "/challenge/" in data["challenge_url"]

    # 2. Retrieve contract by ID
    contract_id = data["contract_id"]
    get_res = client.get(f"/api/contracts/{contract_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["contract_id"] == contract_id
    assert retrieved["project_title"] == data["project_title"]

def test_get_nonexistent_contract():
    """Verify 404 response on unknown contract ID."""
    res = client.get("/api/contracts/bc_non_existent_9999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_contract_html_page_rendering():
    """Verify that the contract HTML page renders without template errors."""
    res = client.get("/contract/bc_demo_rag")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "AI College-Policy QA Assistant" in res.text
    assert "Critical Assumption" in res.text

