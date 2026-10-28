import json
import uuid
import logging
from typing import List
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
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event
from app.supabase_client import (
    supabase_get_contract,
    supabase_save_challenge,
    supabase_get_challenges,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contracts/{contract_id}/challenges", tags=["Peer Challenges"])

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
