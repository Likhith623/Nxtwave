import pytest
from app.schemas import CandidateIdeaInput
from app.scoring import score_candidate_idea, SCORING_WEIGHTS
from app.services.project_analyzer import detect_category_and_difficulty

def test_weights_sum_to_one():
    """Verify that scoring model criteria weights sum exactly to 1.0 (100%)."""
    total_weight = sum(spec["weight"] for spec in SCORING_WEIGHTS.values())
    assert abs(total_weight - 1.0) < 0.001

def test_scoring_beginner_vs_advanced():
    """Verify that beginner constraints on heavy tasks score differently than advanced with GPU."""
    idea = CandidateIdeaInput(
        title="Real-time Drone Video Surveillance",
        description="Transformer from scratch on live 4K video stream for aerial target tracking."
    )
    
    # Beginner, 1 week, standard laptop
    score_beginner, criteria_b, expl_b = score_candidate_idea(
        idea=idea,
        domain="Computer Vision",
        experience="beginner",
        languages=["Python"],
        time_weeks=1,
        team_size=1,
        resources=["laptop"],
        primary_goal="college_project"
    )
    
    # Advanced, 8 weeks, GPU
    score_adv, criteria_a, expl_a = score_candidate_idea(
        idea=idea,
        domain="Computer Vision",
        experience="advanced",
        languages=["Python"],
        time_weeks=8,
        team_size=3,
        resources=["gpu", "public dataset"],
        primary_goal="college_project"
    )
    
    # Advanced setup should score significantly higher feasibility than beginner solo 1-week
    assert score_adv > score_beginner
    assert "Composite Score" in expl_b
    assert len(criteria_b) == 6

def test_rag_nlp_scoring_with_python():
    """Verify that NLP/RAG projects score high when student has Python and reasonable timeline."""
    idea = CandidateIdeaInput(
        title="College Regulations Assistant",
        description="RAG question answering over official PDF circulars and exam guidelines."
    )
    score, criteria, expl = score_candidate_idea(
        idea=idea,
        domain="NLP",
        experience="intermediate",
        languages=["Python"],
        time_weeks=4,
        team_size=2,
        resources=["laptop", "public dataset"],
        primary_goal="college_project"
    )
    assert score >= 70.0
    skill_fit = next(c for c in criteria if c.name == "skill_fit")
    assert skill_fit.score >= 8.0

def test_overambitious_project_penalty():
    """Verify that unrealistic projects (AGI, stock beating, blockchain OS) receive penalties."""
    idea = CandidateIdeaInput(
        title="Autonomous Stock Market Beating AGI",
        description="AGI system that predicts stock market prices with 100% accuracy and executes crypto trades on blockchain operating system."
    )
    score, criteria, expl = score_candidate_idea(
        idea=idea,
        domain="AI/ML",
        experience="intermediate",
        languages=["Python"],
        time_weeks=4,
        team_size=1,
        resources=["laptop"],
        primary_goal="college_project"
    )
    # Score should be heavily penalized
    complexity = next(c for c in criteria if c.name == "technical_complexity")
    assert complexity.score <= 5.0
    assert score < 65.0

def test_detect_category_and_difficulty():
    """Verify category and difficulty detection across different archetypes."""
    cat1, diff1 = detect_category_and_difficulty("Policy Handbook Bot", "RAG retrieval over PDF files", "beginner")
    assert "RAG" in cat1
    assert diff1 in ["Beginner-Friendly", "Intermediate"]

    cat2, diff2 = detect_category_and_difficulty("Crop Leaf Disease", "Image classification with camera", "intermediate")
    assert "Computer Vision" in cat2

    cat3, diff3 = detect_category_and_difficulty("Quantum Transformer AGI from scratch", "realtime video", "beginner")
    assert diff3 == "Advanced"

