import json
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

router = APIRouter(prefix="/api/contracts/{contract_id}/challenges", tags=["Peer Challenges"])

@router.get("", response_model=List[PeerChallengeResponse])
def list_contract_challenges(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """Lists all peer challenges submitted for a specific Build Contract."""
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
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
    
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Build Contract '{contract_id}' not found."
        )
        
    # Sanitize inputs
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
    if existing_dupe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A challenge with this exact text has already been submitted for this Build Contract."
        )
        
    # Process peer challenge & generate structured recommendation
    recommendation = process_peer_challenge_submission(
        contract_title=contract.project_title,
        contract_category=contract.category,
        critical_assumption=contract.critical_assumption,
        challenge_text=challenge_text,
        why_it_matters=why_it_matters,
        improvement_suggestion=suggestion
    )
    
    db_challenge = PeerChallenge(
        contract_id=contract_id,
        peer_name=peer_name,
        challenge_text=challenge_text,
        why_it_matters=why_it_matters,
        improvement_suggestion=suggestion,
        status="processed",
        improvement_recommendation_json=json.dumps(recommendation.model_dump())
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    
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
        challenge_id=db_challenge.challenge_id,
        contract_id=db_challenge.contract_id,
        peer_name=db_challenge.peer_name,
        challenge_text=db_challenge.challenge_text,
        why_it_matters=db_challenge.why_it_matters,
        improvement_suggestion=db_challenge.improvement_suggestion,
        status=db_challenge.status,
        recommendation=recommendation,
        created_at=db_challenge.created_at
    )
