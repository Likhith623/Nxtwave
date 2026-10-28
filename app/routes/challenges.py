import json
import uuid
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import BuildContract, PeerChallenge
from app.schemas import (
    PeerChallengeCreateRequest,
    PeerChallengeResponse,
    ImprovementRecommendation
)
from app.services.contract_planner import process_peer_challenge_submission
from app.services.llm_provider import llm_service
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event
from app.supabase_client import (
    supabase_get_contract,
    supabase_save_challenge,
    supabase_get_challenges,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contracts/{contract_id}/challenges", tags=["Peer Challenges"])

class ProjectChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=2000)
    peer_name: Optional[str] = "Anonymous Peer"

class ProjectChatResponse(BaseModel):
    reply: str
    is_critique: bool = False
    risk_level: Optional[str] = None
    model_used: str = "gemini-2.5-flash"
    status: str = "success"

@router.get("", response_model=List[PeerChallengeResponse])
def list_contract_challenges(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """Lists all peer challenges submitted for a specific Build Contract."""
    # 1. Try Supabase first
    supa_challenges = supabase_get_challenges(contract_id)
    if supa_challenges:
        out: List[PeerChallengeResponse] = []
        for ch in supa_challenges:
            rec_raw = ch.get("improvement_recommendation_json", "{}")
            rec_data = json.loads(rec_raw) if isinstance(rec_raw, str) else (rec_raw or {})
            out.append(PeerChallengeResponse(
                challenge_id=ch["challenge_id"],
                contract_id=ch["contract_id"],
                peer_name=ch.get("peer_name", "Anonymous Peer"),
                challenge_text=ch["challenge_text"],
                why_it_matters=ch["why_it_matters"],
                improvement_suggestion=ch.get("improvement_suggestion"),
                status=ch.get("status", "processed"),
                recommendation=ImprovementRecommendation(**rec_data) if rec_data else ImprovementRecommendation(
                    challenge_summary=ch["challenge_text"][:100],
                    risk_level="Moderate",
                    recommended_scope_adjustment="Add validation guardrail",
                    architectural_safeguard="Fallback handling",
                    workshop_relevance="Prototype verification"
                ),
                created_at=ch.get("created_at")
            ))
        return out

    # 2. Local DB fallback
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        supa_c = supabase_get_contract(contract_id)
        if not supa_c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Build Contract '{contract_id}' not found."
            )

    challenges = (
        db.query(PeerChallenge)
        .filter(PeerChallenge.contract_id == contract_id)
        .order_by(PeerChallenge.created_at.desc())
        .all()
    )

    output: List[PeerChallengeResponse] = []
    for ch in challenges:
        rec_data = ch.get_improvement_recommendation()
        output.append(PeerChallengeResponse(
            challenge_id=ch.challenge_id,
            contract_id=ch.contract_id,
            peer_name=ch.peer_name,
            challenge_text=ch.challenge_text,
            why_it_matters=ch.why_it_matters,
            improvement_suggestion=ch.improvement_suggestion,
            status=ch.status,
            recommendation=ImprovementRecommendation(**rec_data) if rec_data else ImprovementRecommendation(
                challenge_summary=ch.challenge_text[:100],
                risk_level="Moderate",
                recommended_scope_adjustment="Add validation guardrail",
                architectural_safeguard="Fallback handling",
                workshop_relevance="Prototype verification"
            ),
            created_at=ch.created_at
        ))
    return output

@router.post("", response_model=PeerChallengeResponse, status_code=status.HTTP_201_CREATED)
def submit_peer_challenge(
    contract_id: str,
    challenge_in: PeerChallengeCreateRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Submits a technical stress test or failure scenario against a Build Contract (Break My Build)."""
    verify_rate_limit(req)

    # Find contract — check local DB then Supabase
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    project_title = None
    category = "AI/ML"
    critical_assumption = "Core logic holds true."

    if contract:
        project_title = contract.project_title
        category = contract.category
        critical_assumption = contract.critical_assumption
    else:
        supa_c = supabase_get_contract(contract_id)
        if supa_c:
            project_title = supa_c["project_title"]
            category = supa_c["category"]
            critical_assumption = supa_c["critical_assumption"]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Build Contract '{contract_id}' not found."
            )

    peer_name = sanitize_string(challenge_in.peer_name) or "Anonymous Peer"
    challenge_text = sanitize_string(challenge_in.challenge_text)
    why_it_matters = sanitize_string(challenge_in.why_it_matters)
    suggestion = sanitize_string(challenge_in.improvement_suggestion) if challenge_in.improvement_suggestion else None

    # Check for accidental immediate duplicate submission (exact same text on same contract)
    existing_dupe = (
        db.query(PeerChallenge)
        .filter(
            PeerChallenge.contract_id == contract_id,
            PeerChallenge.challenge_text == challenge_text
        )
        .first()
    )
    if not existing_dupe:
        # Also check Supabase for duplicate
        supa_existing = supabase_get_challenges(contract_id)
        if any(c.get("challenge_text") == challenge_text for c in supa_existing):
            existing_dupe = True

    if existing_dupe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A challenge with this exact text has already been submitted for this Build Contract."
        )

    # Generate consistent challenge_id up front
    new_challenge_id = f"ch_{uuid.uuid4().hex[:10]}"

    # Process peer challenge & generate structured recommendation
    recommendation = process_peer_challenge_submission(
        contract_title=project_title,
        contract_category=category,
        critical_assumption=critical_assumption,
        challenge_text=challenge_text,
        why_it_matters=why_it_matters,
        improvement_suggestion=suggestion
    )

    db_challenge = PeerChallenge(
        challenge_id=new_challenge_id,
        contract_id=contract_id,
        peer_name=peer_name,
        challenge_text=challenge_text,
        why_it_matters=why_it_matters,
        improvement_suggestion=suggestion,
        status="processed",
        improvement_recommendation_json=json.dumps(recommendation.model_dump())
    )

    # 1. Save to Supabase
    supabase_save_challenge({
        "challenge_id": new_challenge_id,
        "contract_id": contract_id,
        "peer_name": peer_name,
        "challenge_text": challenge_text,
        "why_it_matters": why_it_matters,
        "improvement_suggestion": suggestion,
        "status": "processed",
        "improvement_recommendation_json": json.dumps(recommendation.model_dump())
    })

    # 2. Save to local DB fallback
    try:
        db.add(db_challenge)
        db.commit()
        db.refresh(db_challenge)
    except Exception as e:
        logger.warning("[DB] Local challenge save warning: %s", e)

    # Record analytics event
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="peer_challenge_submitted",
        contract_id=contract_id,
        client_ip=client_ip,
        metadata={"risk_level": recommendation.risk_level, "peer": peer_name}
    )

    return PeerChallengeResponse(
        challenge_id=new_challenge_id,
        contract_id=contract_id,
        peer_name=peer_name,
        challenge_text=challenge_text,
        why_it_matters=why_it_matters,
        improvement_suggestion=suggestion,
        status="processed",
        recommendation=recommendation,
        created_at=db_challenge.created_at
    )


@router.post("/chat", response_model=ProjectChatResponse)
async def chat_about_contract(
    contract_id: str,
    chat_in: ProjectChatRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Interactive AI chat endpoint powered by Google Gemini (with rules engine fallback).
    
    Allows classmates and visitors to probe, test edge-cases, and ask questions about a specific Build Contract.
    """
    verify_rate_limit(req)

    # 1. Resolve contract details
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    contract_data = None
    if contract:
        contract_data = {
            "contract_id": contract.contract_id,
            "project_title": contract.project_title,
            "original_idea": contract.original_idea,
            "category": contract.category,
            "difficulty": contract.difficulty,
            "feasibility_score": 88,
            "critical_assumption": contract.critical_assumption,
            "frontend_rec": contract.frontend_rec,
            "backend_rec": contract.backend_rec,
            "ai_model_rec": contract.ai_model_rec,
            "db_rec": contract.db_rec,
            "failure_scenarios": contract.get_failure_scenarios(),
            "mvp_features": contract.get_mvp_features(),
        }
    else:
        supa_c = supabase_get_contract(contract_id)
        if supa_c:
            def _parse(val, def_val):
                if isinstance(val, str):
                    try:
                        return json.loads(val)
                    except Exception:
                        return def_val
                return val or def_val
            contract_data = {
                "contract_id": supa_c["contract_id"],
                "project_title": supa_c["project_title"],
                "original_idea": supa_c["original_idea"],
                "category": supa_c["category"],
                "difficulty": supa_c.get("difficulty", "intermediate"),
                "feasibility_score": supa_c.get("feasibility_score", 88),
                "critical_assumption": supa_c["critical_assumption"],
                "frontend_rec": supa_c.get("frontend_rec", "Next.js / HTML5"),
                "backend_rec": supa_c.get("backend_rec", "FastAPI"),
                "ai_model_rec": supa_c.get("ai_model_rec", "Sentence-Transformers on CPU"),
                "db_rec": supa_c.get("db_rec", "SQLite"),
                "failure_scenarios": _parse(supa_c.get("failure_scenarios_json"), []),
                "mvp_features": _parse(supa_c.get("mvp_features_json"), []),
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Build Contract '{contract_id}' not found."
            )

    msg = sanitize_string(chat_in.message)
    res = await llm_service.chat_with_project(contract_data, msg)

    # Record analytics
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="peer_chat_message",
        contract_id=contract_id,
        client_ip=client_ip,
        metadata={"is_critique": res.get("is_critique", False), "model": res.get("model_used")}
    )

    return ProjectChatResponse(
        reply=res.get("reply", "Understood. The 60-minute build plan is ready to review."),
        is_critique=res.get("is_critique", False),
        risk_level=res.get("risk_level"),
        model_used=res.get("model_used", "gemini-2.5-flash"),
        status="success"
    )
