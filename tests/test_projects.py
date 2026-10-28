import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    """Verify application health check returns 200 and correct metadata."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Project Compass"
    assert data["zero_cost_local_mode"] is True

def test_get_sample_projects():
    """Verify that all 5 sample projects are returned with full details."""
    res = client.get("/api/projects/samples")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) == 5
    sample_ids = [s["id"] for s in samples]
    assert "sample_college_policy_rag" in sample_ids
    assert "sample_plant_disease_cv" in sample_ids
    assert "sample_study_assistant_quiz" in sample_ids
    assert "sample_waste_classifier_cv" in sample_ids
    assert "sample_placement_prediction_ml" in sample_ids

def test_get_single_sample_project():
    """Verify fetching a single sample project by ID."""
    res = client.get("/api/projects/samples/sample_college_policy_rag")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "AI College-Policy QA Assistant"
    assert "strongest_reason" in data

    # 404 test
    res_err = client.get("/api/projects/samples/non_existent_id")
    assert res_err.status_code == 404

def test_compare_candidate_projects_success():
    """Verify transparent comparison of multiple project candidates."""
    payload = {
        "domain": "AI/ML",
        "experience": "intermediate",
        "languages": ["Python", "JavaScript"],
        "time_weeks": 4,
        "team_size": 2,
        "resources": ["laptop", "public dataset"],
        "primary_goal": "college_project",
        "candidates": [
            {
                "title": "AI College Policy Bot",
                "description": "RAG question answering over college academic regulations and handbook PDFs."
            },
            {
                "title": "Stock Market Beating AGI",
                "description": "High frequency autonomous trading robot predicting crypto prices."
            }
        ],
        "utm_source": "test_suite"
    }
    res = client.post("/api/projects/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "comparison_id" in data
    assert len(data["all_scored_projects"]) == 2
    # Realistic project should beat out overambitious AGI
    assert data["all_scored_projects"][0]["title"] == "AI College Policy Bot"
    assert data["all_scored_projects"][0]["is_best_fit"] is True
    assert data["all_scored_projects"][1]["rank"] == 2

def test_invalid_experience_constraint():
    """Verify server-side validation catches invalid experience levels."""
    payload = {
        "domain": "AI/ML",
        "experience": "expert_wizard",  # Invalid
        "languages": ["Python"],
        "candidates": [{"title": "Test Title", "description": "This is a valid length description test."}]
    }
    res = client.post("/api/projects/compare", json=payload)
    assert res.status_code == 422

def test_empty_candidates_rejection():
    """Verify server rejects empty candidates list."""
    payload = {
        "domain": "AI/ML",
        "experience": "intermediate",
        "languages": ["Python"],
        "candidates": []  # Empty
    }
    res = client.post("/api/projects/compare", json=payload)
    assert res.status_code == 422

