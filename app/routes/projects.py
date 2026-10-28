import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ProjectComparison
from app.schemas import (
    ProjectComparisonRequest,
    ProjectComparisonResponse
)
from app.services.project_analyzer import analyze_and_rank_candidates, SAMPLE_PROJECTS
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event
from app.supabase_client import (
    supabase_save_comparison,
    supabase_get_comparison,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("/samples", response_model=List[Dict[str, Any]])
def get_sample_projects():
    """Returns the 5 realistic sample engineering projects for immediate testing."""
    return SAMPLE_PROJECTS

@router.get("/samples/{sample_id}")
def get_single_sample_project(sample_id: str):
    """Fetches details and pre-filled constraints for a specific sample project."""
    for p in SAMPLE_PROJECTS:
        if p["id"] == sample_id:
            return p
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample project not found")

@router.post("/compare", response_model=ProjectComparisonResponse)
def compare_candidate_projects(
    request_data: ProjectComparisonRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Compares candidate project ideas against student constraints using the transparent scoring engine."""
    verify_rate_limit(req)

    # Sanitize user string inputs
    request_data.domain = sanitize_string(request_data.domain)
    for c in request_data.candidates:
        c.title = sanitize_string(c.title)
        c.description = sanitize_string(c.description)

    # Analyze and rank
    comparison_response = analyze_and_rank_candidates(request_data)

    candidates_dicts = [c.model_dump() for c in request_data.candidates]
    results_dicts = [r.model_dump() for r in comparison_response.all_scored_projects]

    # 1. Save to Supabase Cloud Database
    supabase_save_comparison({
        "comparison_id": comparison_response.comparison_id,
        "domain": request_data.domain,
        "experience": request_data.experience,
        "languages": ", ".join(request_data.languages),
        "time_weeks": request_data.time_weeks,
        "team_size": request_data.team_size,
        "resources": ", ".join(request_data.resources),
        "primary_goal": request_data.primary_goal,
        "candidates_json": json.dumps(candidates_dicts),
        "results_json": json.dumps(results_dicts),
        "recommended_index": comparison_response.best_fit_index
    })

    # 2. Local DB persistence fallback
    try:
        db_cmp = ProjectComparison(
            comparison_id=comparison_response.comparison_id,
            domain=request_data.domain,
            experience=request_data.experience,
            languages=", ".join(request_data.languages),
            time_weeks=request_data.time_weeks,
            team_size=request_data.team_size,
            resources=", ".join(request_data.resources),
            primary_goal=request_data.primary_goal,
            candidates_json=json.dumps(candidates_dicts),
            results_json=json.dumps(results_dicts),
            recommended_index=comparison_response.best_fit_index
        )
        db.add(db_cmp)
        db.commit()
    except Exception as e:
        logger.warning("[DB] Local comparison save warning: %s", e)

    # Record analytics event
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="comparison_completed",
        utm_source=request_data.utm_source,
        utm_medium=request_data.utm_medium,
        utm_campaign=request_data.utm_campaign,
        ref=request_data.ref,
        client_ip=client_ip,
        metadata={"candidates_count": len(request_data.candidates), "comparison_id": comparison_response.comparison_id}
    )

    return comparison_response
