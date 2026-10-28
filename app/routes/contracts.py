import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BuildContract, PeerChallenge
from app.schemas import (
    BuildContractCreateRequest,
    BuildContractResponse,
    FailureScenario,
    Plan60MinMilestone
)
from app.services.contract_planner import generate_build_contract_data
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event

router = APIRouter(prefix="/api/contracts", tags=["Build Contracts"])

def serialize_contract_model(contract: BuildContract, req: Request) -> BuildContractResponse:
    """Helper to convert SQLAlchemy BuildContract model to Pydantic response schema."""
    base_url = str(req.base_url).rstrip("/")
    failure_scenarios = [FailureScenario(**item) for item in contract.get_failure_scenarios()]
    plan_60min = [Plan60MinMilestone(**item) for item in contract.get_plan_60min()]
    
    return BuildContractResponse(
        contract_id=contract.contract_id,
        comparison_id=contract.comparison_id,
        project_title=contract.project_title,
        original_idea=contract.original_idea,
        category=contract.category,
        difficulty=contract.difficulty,
        frontend_rec=contract.frontend_rec,
        backend_rec=contract.backend_rec,
        ai_model_rec=contract.ai_model_rec,
        db_rec=contract.db_rec,
        tech_reasoning=contract.tech_reasoning,
        required_data=contract.required_data,
        critical_assumption=contract.critical_assumption,
        failure_scenarios=failure_scenarios,
        mvp_features=contract.get_mvp_features(),
        deferred_features=contract.get_deferred_features(),
        plan_60min=plan_60min,
        immediate_action=contract.immediate_action,
        peer_challenge_prompt=contract.peer_challenge_prompt,
        analysis_mode=contract.analysis_mode,
        share_url=f"{base_url}/contract/{contract.contract_id}",
        challenge_url=f"{base_url}/challenge/{contract.contract_id}",
        challenges_count=len(contract.challenges),
        created_at=contract.created_at
    )

@router.post("", response_model=BuildContractResponse)
def create_build_contract(
    contract_in: BuildContractCreateRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Generates and persists a structured Build Contract with technical foundation and failure tests."""
    verify_rate_limit(req)
    
    title = sanitize_string(contract_in.selected_project_title)
    desc = sanitize_string(contract_in.selected_project_description)
    
    contract_data = generate_build_contract_data(
        title=title,
        description=desc,
        domain=contract_in.domain or "AI/ML",
        experience=contract_in.experience or "intermediate",
        languages=contract_in.languages or ["Python"],
        time_weeks=contract_in.time_weeks or 4,
        team_size=contract_in.team_size or 1,
        resources=contract_in.resources or ["laptop"],
        primary_goal=contract_in.primary_goal or "college_project",
        comparison_id=contract_in.comparison_id,
        referral_source=contract_in.referral_source
    )
    
    # Persist in DB
    db_contract = BuildContract(
        contract_id=contract_data["contract_id"],
        comparison_id=contract_data["comparison_id"],
        project_title=contract_data["project_title"],
        original_idea=contract_data["original_idea"],
        category=contract_data["category"],
        difficulty=contract_data["difficulty"],
        frontend_rec=contract_data["frontend_rec"],
        backend_rec=contract_data["backend_rec"],
        ai_model_rec=contract_data["ai_model_rec"],
        db_rec=contract_data["db_rec"],
        tech_reasoning=contract_data["tech_reasoning"],
        required_data=contract_data["required_data"],
        critical_assumption=contract_data["critical_assumption"],
        failure_scenarios_json=json.dumps([s.model_dump() for s in contract_data["failure_scenarios"]]),
        mvp_features_json=json.dumps(contract_data["mvp_features"]),
        deferred_features_json=json.dumps(contract_data["deferred_features"]),
        plan_60min_json=json.dumps([p.model_dump() for p in contract_data["plan_60min"]]),
        immediate_action=contract_data["immediate_action"],
        peer_challenge_prompt=contract_data["peer_challenge_prompt"],
        analysis_mode=contract_data["analysis_mode"],
        referral_source=contract_data["referral_source"]
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    # Record analytics event
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="build_contract_created",
        contract_id=db_contract.contract_id,
        client_ip=client_ip,
        metadata={"category": db_contract.category, "difficulty": db_contract.difficulty}
    )
    
    return serialize_contract_model(db_contract, req)

@router.get("/{contract_id}", response_model=BuildContractResponse)
def get_build_contract(
    contract_id: str,
    req: Request,
    db: Session = Depends(get_db)
):
    """Retrieves a public Build Contract by unique identifier."""
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Build Contract '{contract_id}' not found."
        )
    return serialize_contract_model(contract, req)
