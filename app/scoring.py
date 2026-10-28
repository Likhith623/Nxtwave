import re
from typing import List, Dict, Any, Tuple
from app.schemas import CriterionScore, ScoredProjectIdea, CandidateIdeaInput

# Documented Weighted Scoring System
SCORING_WEIGHTS = {
    "skill_fit": {
        "weight": 0.25,
        "label": "Skill Fit",
        "description": "Compatibility between the student's programming languages/experience and project stack."
    },
    "time_feasibility": {
        "weight": 0.20,
        "label": "Time Feasibility",
        "description": "Likelihood of completing a working MVP within the stated timeline."
    },
    "resource_availability": {
        "weight": 0.20,
        "label": "Data & Resource Fit",
        "description": "Availability of datasets, compute (GPU/CPU), and necessary tools without paid dependencies."
    },
    "technical_complexity": {
        "weight": 0.15,
        "label": "Scope & Complexity",
        "description": "Balance between technical ambition and architectural simplicity."
    },
    "practical_usefulness": {
        "weight": 0.10,
        "label": "Practical Utility",
        "description": "Real-world utility, user value, and portfolio demonstrability."
    },
    "testability": {
        "weight": 0.10,
        "label": "Objective Testability",
        "description": "Ease of formulating concrete failure tests and measurable acceptance criteria."
    }
}

WEIGHTS_EXPLANATION = (
    "Scores are calculated using a weighted multi-criteria decision model: "
    "Skill Fit (25%), Time Feasibility (20%), Data & Resource Fit (20%), "
    "Scope & Complexity (15%), Practical Utility (10%), and Objective Testability (10%). "
    "Each criterion is scored from 1.0 to 10.0 based on rule heuristics and student constraints. "
    "Scores represent heuristic feasibility estimates for prototype completion, not scientific guarantees."
)

# Keyword patterns for heuristic detection
HEURISTIC_PATTERNS = {
    "high_compute": ["video", "realtime", "transformer from scratch", "gan", "diffusion", "llm pre-training", "3d", "lidar", "multimodal"],
    "rag_nlp": ["chatbot", "assistant", "policy", "faq", "qa", "retrieval", "rag", "summariz", "document", "pdf", "nlp", "search"],
    "vision": ["image", "camera", "detect", "classif", "leaf", "plant", "waste", "face", "gesture", "yolo", "cnn"],
    "tabular_data": ["predict", "recommend", "placement", "salary", "churn", "fraud", "finance", "student", "credit", "sales", "housing"],
    "web_system": ["portal", "platform", "dashboard", "app", "website", "tracker", "booking", "management", "system"],
    "overambitious": ["blockchain", "agi", "operating system", "metaverse", "autonomous car", "medical diagnosis", "cure", "stock market market beating"]
}

def analyze_skill_fit(experience: str, languages: List[str], text: str) -> Tuple[float, str]:
    """Evaluates how well the project aligns with the student's stated experience and languages."""
    exp = experience.lower()
    langs = [lang.lower().strip() for lang in languages]
    text_lower = text.lower()
    
    score = 7.0
    reason_parts = []
    
    # Language match
    has_python = any("python" in l for l in langs)
    has_js = any(l in ["javascript", "typescript", "js", "ts", "html", "css"] for l in langs)
    
    needs_vision_or_ai = any(kw in text_lower for kw in HEURISTIC_PATTERNS["vision"] + HEURISTIC_PATTERNS["rag_nlp"] + HEURISTIC_PATTERNS["tabular_data"])
    
    if needs_vision_or_ai:
        if has_python:
            score += 2.0
            reason_parts.append("Python strongly matches AI/ML toolchains (PyTorch/Scikit/FastAPI).")
        else:
            score -= 3.0
            reason_parts.append("AI project without Python requires complex web-based or API alternatives.")
            
    # Experience penalty for heavy ML
    is_heavy_compute = any(kw in text_lower for kw in HEURISTIC_PATTERNS["high_compute"])
    if is_heavy_compute:
        if exp == "beginner":
            score -= 3.5
            reason_parts.append("Beginner level faces severe steep learning curve for heavy ML architectures.")
        elif exp == "intermediate":
            score -= 1.0
            reason_parts.append("Intermediate experience will require focused scoping to avoid getting stuck.")
        else:
            score += 1.0
            reason_parts.append("Advanced experience suitable for high-compute modeling.")
    else:
        if exp == "beginner":
            score += 0.5
            reason_parts.append("Scope is approachable for beginner foundations.")
            
    # Clamp score
    final_score = max(2.0, min(10.0, score))
    reason = " ".join(reason_parts) if reason_parts else "Good baseline alignment with your current stack."
    return round(final_score, 1), reason

def analyze_time_feasibility(time_weeks: int, team_size: int, text: str) -> Tuple[float, str]:
    """Evaluates feasibility given available weeks and team members."""
    text_lower = text.lower()
    total_man_weeks = time_weeks * team_size
    
    score = 7.0
    reason_parts = []
    
    is_overambitious = any(kw in text_lower for kw in HEURISTIC_PATTERNS["overambitious"])
    is_heavy = any(kw in text_lower for kw in HEURISTIC_PATTERNS["high_compute"])
    
    if is_overambitious:
        score -= 4.0
        reason_parts.append("Goal carries significant overambitious scope for student timelines.")
    elif is_heavy:
        score -= 2.0
        reason_parts.append("High compute training and data curation often overrun initial schedules.")
        
    if time_weeks <= 2:
        score -= 2.5
        reason_parts.append(f"Short deadline ({time_weeks} weeks) requires aggressive MVP trimming.")
    elif time_weeks >= 8:
        score += 1.5
        reason_parts.append(f"Comfortable timeline ({time_weeks} weeks) permits thorough iterative testing.")
    else:
        reason_parts.append(f"{time_weeks} weeks is balanced for a focused prototype.")
        
    if team_size > 1:
        reason_parts.append(f"Team of {team_size} enables parallel UI and model development.")
    else:
        reason_parts.append("Solo builder requires tight single-pipeline focus.")
        
    final_score = max(2.0, min(10.0, score))
    return round(final_score, 1), " ".join(reason_parts)

def analyze_resource_fit(resources: List[str], text: str) -> Tuple[float, str]:
    """Checks whether needed datasets, GPU, or compute hardware are available."""
    text_lower = text.lower()
    res = [r.lower().strip() for r in resources]
    
    has_gpu = any("gpu" in r or "cuda" in r for r in res)
    has_dataset = any("dataset" in r or "data" in r for r in res)
    has_laptop_only = ("laptop" in res or "standard laptop" in res) and not has_gpu
    
    score = 7.5
    reason_parts = []
    
    needs_gpu = any(kw in text_lower for kw in HEURISTIC_PATTERNS["high_compute"])
    needs_vision = any(kw in text_lower for kw in HEURISTIC_PATTERNS["vision"])
    
    if needs_gpu and not has_gpu:
        score -= 3.5
        reason_parts.append("Deep neural network training without GPU will experience slow iteration cycles.")
    elif needs_gpu and has_gpu:
        score += 1.5
        reason_parts.append("Available GPU satisfies heavy training acceleration requirements.")
        
    if needs_vision and not has_dataset:
        score -= 1.5
        reason_parts.append("Image classification demands clean, labeled public datasets (e.g. PlantVillage/Kaggle).")
    elif has_dataset:
        score += 1.0
        reason_parts.append("Access to dataset reduces data collection bottleneck.")
        
    if has_laptop_only and not needs_gpu:
        score += 1.0
        reason_parts.append("Project runs efficiently on CPU/standard laptop via lightweight models.")
        
    final_score = max(2.5, min(10.0, score))
    return round(final_score, 1), " ".join(reason_parts)

def analyze_complexity(text: str) -> Tuple[float, str]:
    """Estimates architectural scope balance vs. over-engineering."""
    text_lower = text.lower()
    score = 7.5
    reason_parts = []
    
    word_count = len(text.split())
    if any(kw in text_lower for kw in HEURISTIC_PATTERNS["overambitious"]):
        score -= 4.0
        reason_parts.append("High architectural risk: too many speculative or non-deterministic layers.")
    elif any(kw in text_lower for kw in HEURISTIC_PATTERNS["high_compute"]):
        score -= 1.5
        reason_parts.append("Moderate complexity due to model hyperparameter tuning and data pipelines.")
    else:
        score += 1.0
        reason_parts.append("Pragmatic architecture: modular, easy to isolate components and mock inputs.")
        
    final_score = max(2.0, min(10.0, score))
    return round(final_score, 1), " ".join(reason_parts)

def analyze_utility(goal: str, text: str) -> Tuple[float, str]:
    """Estimates practical value, problem impact, and portfolio demonstrability."""
    text_lower = text.lower()
    score = 7.0
    reason_parts = []
    
    if any(kw in text_lower for kw in HEURISTIC_PATTERNS["overambitious"]):
        score -= 3.5
        reason_parts.append("Low practical demonstrability: overambitious scope rarely yields verifiable student prototypes.")
    elif any(kw in text_lower for kw in ["college", "policy", "student", "placement", "waste", "plant", "study", "faq"]):
        score += 2.0
        reason_parts.append("Directly addresses an immediate campus or social challenge with high demo appeal.")
    else:
        score += 0.5
        reason_parts.append("Solid problem domain with clear user workflow.")
        
    if goal == "portfolio":
        reason_parts.append("Strong portfolio narrative if packaged with interactive web demo.")
    elif goal == "college_project":
        reason_parts.append("Well-suited for academic project evaluation rubrics.")
    elif goal == "learn_skills":
        reason_parts.append("Excellent playground for hands-on modern engineering patterns.")
        
    final_score = max(3.0, min(10.0, score))
    return round(final_score, 1), " ".join(reason_parts)

def analyze_testability(text: str) -> Tuple[float, str]:
    """Estimates how objectively the project's core functionality can be tested."""
    text_lower = text.lower()
    score = 7.5
    reason_parts = []
    
    if any(kw in text_lower for kw in HEURISTIC_PATTERNS["tabular_data"]):
        score += 1.5
        reason_parts.append("Tabular benchmarks have deterministic accuracy, F1-scores, and cross-validation.")
    elif any(kw in text_lower for kw in HEURISTIC_PATTERNS["vision"]):
        score += 1.0
        reason_parts.append("Image classification tests cleanly with fixed test-set confusion matrices and edge-case photos.")
    elif any(kw in text_lower for kw in HEURISTIC_PATTERNS["rag_nlp"]):
        score += 0.5
        reason_parts.append("RAG systems require grounding verification, citation tests, and out-of-domain rejection tests.")
    else:
        reason_parts.append("Standard input/output test assertions apply to web and pipeline services.")
        
    final_score = max(3.0, min(10.0, score))
    return round(final_score, 1), " ".join(reason_parts)

def score_candidate_idea(
    idea: CandidateIdeaInput,
    domain: str,
    experience: str,
    languages: List[str],
    time_weeks: int,
    team_size: int,
    resources: List[str],
    primary_goal: str
) -> Tuple[float, List[CriterionScore], str]:
    """Calculates weighted composite score and criterion breakdowns for a single candidate idea."""
    combined_text = f"{idea.title} {idea.description}"
    
    s_fit, r_fit = analyze_skill_fit(experience, languages, combined_text)
    s_time, r_time = analyze_time_feasibility(time_weeks, team_size, combined_text)
    s_res, r_res = analyze_resource_fit(resources, combined_text)
    s_comp, r_comp = analyze_complexity(combined_text)
    s_util, r_util = analyze_utility(primary_goal, combined_text)
    s_test, r_test = analyze_testability(combined_text)
    
    raw_scores = {
        "skill_fit": (s_fit, r_fit),
        "time_feasibility": (s_time, r_time),
        "resource_availability": (s_res, r_res),
        "technical_complexity": (s_comp, r_comp),
        "practical_usefulness": (s_util, r_util),
        "testability": (s_test, r_test)
    }
    
    criteria_list: List[CriterionScore] = []
    weighted_sum = 0.0
    
    for key, spec in SCORING_WEIGHTS.items():
        score_val, reason = raw_scores[key]
        w_score = round(score_val * spec["weight"] * 10, 2)  # Normalized to 100-point contribution
        weighted_sum += w_score
        criteria_list.append(CriterionScore(
            name=key,
            label=spec["label"],
            weight=spec["weight"],
            score=score_val,
            weighted_score=w_score,
            reason=reason
        ))
        
    composite_score = round(weighted_sum, 1)
    
    # Generate human explanation
    explanation = (
        f"Composite Score: {composite_score}/100. "
        f"Highest contributor: {max(criteria_list, key=lambda c: c.weighted_score).label} ({max(criteria_list, key=lambda c: c.weighted_score).score}/10). "
        f"Key bottleneck: {min(criteria_list, key=lambda c: c.weighted_score).label} ({min(criteria_list, key=lambda c: c.weighted_score).score}/10)."
    )
    
    return composite_score, criteria_list, explanation
