import json
import re
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator

class CandidateIdeaInput(BaseModel):
    title: str = Field(..., min_length=2, max_length=120, description="Short title of the idea")
    description: str = Field(..., min_length=10, max_length=1000, description="Description of the project idea")

class ProjectComparisonRequest(BaseModel):
    domain: str = Field(..., min_length=2, max_length=64, description="Target domain, e.g., AI/ML, Web, Computer Vision")
    experience: str = Field(..., description="Coding experience: beginner, intermediate, or advanced")
    languages: List[str] = Field(..., min_length=1, description="Preferred programming languages")
    time_weeks: int = Field(default=4, ge=1, le=52, description="Available development time in weeks")
    team_size: int = Field(default=1, ge=1, le=10, description="Number of team members")
    resources: List[str] = Field(default_factory=list, description="Available resources: laptop, GPU, public dataset, cloud credit")
    primary_goal: str = Field(default="college_project", description="Primary goal: learn_skills, college_project, practical_problem, portfolio")
    candidates: List[CandidateIdeaInput] = Field(..., min_length=1, max_length=5, description="1 to 5 candidate project ideas")
    
    # Optional UTM parameters
    utm_source: Optional[str] = Field(default=None, max_length=64)
    utm_medium: Optional[str] = Field(default=None, max_length=64)
    utm_campaign: Optional[str] = Field(default=None, max_length=64)
    ref: Optional[str] = Field(default=None, max_length=128)

    @field_validator("experience")
    @classmethod
    def validate_experience(cls, v: str) -> str:
        valid = {"beginner", "intermediate", "advanced"}
        if v.lower() not in valid:
            raise ValueError(f"Experience must be one of {valid}")
        return v.lower()

class CriterionScore(BaseModel):
    name: str
    label: str
    weight: float
    score: float  # 0 to 10
    weighted_score: float
    reason: str

class ScoredProjectIdea(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str  # Beginner, Intermediate, Advanced
    composite_score: float  # 0 to 100
    rank: int
    is_best_fit: bool
    
    # Detailed scoring breakdown
    criteria: List[CriterionScore]
    score_explanation: str
    
    # Engineering Insights
    strongest_reason: str
    largest_risk: str
    mvp_summary: str
    recommended_stack: Dict[str, str]
    technical_challenges: List[str]
    resource_constraints: List[str]

class ProjectComparisonResponse(BaseModel):
    comparison_id: str
    best_fit_index: int
    recommended_project: ScoredProjectIdea
    all_scored_projects: List[ScoredProjectIdea]
    scoring_weights_explanation: str
    created_at: datetime

class FailureScenario(BaseModel):
    test_id: str
    test_name: str
    what_is_tested: str
    why_it_matters: str
    test_procedure: str
    expected_observation: str
    acceptance_criteria: str
    remediation_plan: str

class Plan60MinMilestone(BaseModel):
    time_window: str  # e.g., "Minutes 00-15"
    phase_title: str  # e.g., "Project Scaffolding & Data Sample"
    objective: str
    action_items: List[str]
    deliverable: str

class BuildContractCreateRequest(BaseModel):
    comparison_id: Optional[str] = None
    selected_project_title: str = Field(..., min_length=2, max_length=120)
    selected_project_description: str = Field(..., min_length=10, max_length=1500)
    domain: Optional[str] = "AI/ML"
    experience: Optional[str] = "intermediate"
    languages: Optional[List[str]] = ["Python"]
    time_weeks: Optional[int] = 4
    team_size: Optional[int] = 1
    resources: Optional[List[str]] = ["laptop"]
    primary_goal: Optional[str] = "college_project"
    referral_source: Optional[str] = None

class BuildContractResponse(BaseModel):
    contract_id: str
    comparison_id: Optional[str] = None
    project_title: str
    original_idea: str
    category: str
    difficulty: str
    
    # Technical foundation
    frontend_rec: str
    backend_rec: str
    ai_model_rec: str
    db_rec: str
    tech_reasoning: str
    required_data: str
    
    # Stress Testing
    critical_assumption: str
    failure_scenarios: List[FailureScenario]
    mvp_features: List[str]
    deferred_features: List[str]
    plan_60min: List[Plan60MinMilestone]
    immediate_action: str
    peer_challenge_prompt: str
    
    # Meta
    analysis_mode: str
    share_url: str
    challenge_url: str
    challenges_count: int = 0
    created_at: datetime

class PeerChallengeCreateRequest(BaseModel):
    peer_name: Optional[str] = Field(default="Anonymous Peer", max_length=100)
    challenge_text: str = Field(..., min_length=10, max_length=1200, description="The edge case, failure scenario, or missing requirement")
    why_it_matters: str = Field(..., min_length=5, max_length=1200, description="Why this failure could jeopardize the project")
    improvement_suggestion: Optional[str] = Field(default=None, max_length=1200, description="Constructive idea to mitigate this risk")

class ImprovementRecommendation(BaseModel):
    challenge_summary: str
    risk_level: str  # "High", "Moderate", "Minor"
    recommended_scope_adjustment: str
    new_failure_test_added: Optional[FailureScenario] = None
    architectural_safeguard: str
    workshop_relevance: str

class PeerChallengeResponse(BaseModel):
    challenge_id: str
    contract_id: str
    peer_name: str
    challenge_text: str
    why_it_matters: str
    improvement_suggestion: Optional[str] = None
    status: str
    recommendation: ImprovementRecommendation
    created_at: datetime

class WorkshopRegistrationRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=256)
    phone: Optional[str] = Field(default=None, max_length=20)
    phone_whatsapp: Optional[str] = Field(default=None, max_length=20)
    contract_id: Optional[str] = None
    referral_source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    college: Optional[str] = None
    track: Optional[str] = None
    year_of_study: Optional[int] = None
    github_handle: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def unify_name(cls, data: Any) -> Any:
        if isinstance(data, dict):
            raw_name = data.get('name') or data.get('full_name') or data.get('student_name')
            if not raw_name or not str(raw_name).strip():
                raw_name = 'Engineering Student'
            cleaned = str(raw_name).strip()
            data['name'] = cleaned
            data['full_name'] = cleaned
        return data

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_email = v.strip().lower()
        # Standard RFC 5322 compatible regex check
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, clean_email):
            raise ValueError("Invalid email address format.")
        return clean_email

class WorkshopRegistrationResponse(BaseModel):
    registration_id: str
    message: str
    name: str
    email: str
    is_demo: bool
    external_url: Optional[str] = None
    created_at: datetime

class AnalyticsEventRequest(BaseModel):
    event_name: Optional[str] = Field(default='page_view', max_length=64)
    event_type: Optional[str] = Field(default=None, max_length=64)
    contract_id: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    ref: Optional[str] = None
    session_id: Optional[str] = None
    payload: Optional[Any] = None
    metadata: Optional[Any] = None

class AdminMetricsResponse(BaseModel):
    total_comparisons: int
    total_contracts: int
    total_challenges: int
    total_registrations: int
    demo_registrations: int
    confirmed_registrations: int
    cta_clicks: int
    challenge_participation_rate: float
    funnel_conversion_rates: Dict[str, float]
    campaign_sources: List[Dict[str, Any]]
    recent_registrations: List[Dict[str, Any]]
    recent_events: List[Dict[str, Any]]
