import json
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Request, Response, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.schemas import CandidateIdeaInput, ProjectComparisonRequest
from app.services.project_analyzer import analyze_and_rank_candidates
from app.services.contract_planner import generate_build_contract_data
from app.models import BuildContract
from app.security import sanitize_string
from app.analytics import record_event

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WhatsApp Adapter & Simulator"])

class WhatsAppSimulateRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=500, description="Project idea sent via WhatsApp")
    experience: Optional[str] = "intermediate"
    domain: Optional[str] = "AI/ML"
    sender_name: Optional[str] = "Campus Student"

class WhatsAppSimulateResponse(BaseModel):
    reply_text: str
    contract_url: Optional[str] = None
    workshop_cta: str
    is_dry_run: bool

def format_whatsapp_reply(
    title: str,
    score: float,
    assumption: str,
    contract_id: str,
    base_url: str
) -> str:
    """Formats a concise, friendly WhatsApp message with bolding and emojis."""
    contract_url = f"{base_url}/contract/{contract_id}"
    workshop_url = f"{base_url}/register"
    
    return (
        f"🧭 *PROJECT COMPASS: INSTANT FIT ANALYSIS*\n\n"
        f"🎯 *Project:* {title}\n"
        f"📊 *Feasibility Score:* {score}/100\n\n"
        f"⚠️ *Key Risk Assumption:*\n\"{assumption[:140]}...\"\n\n"
        f"🔗 *Full Build Contract & Peer Challenge Link:*\n{contract_url}\n\n"
        f"🚀 *Next Step:* Ready to build your working prototype in 60 minutes?\n"
        f"Register free: {workshop_url}"
    )

@router.post("/api/whatsapp/simulate", response_model=WhatsAppSimulateResponse)
def simulate_whatsapp_interaction(
    sim_in: WhatsAppSimulateRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Zero-Cost WhatsApp Simulator: Tests the campus community distribution bot without paid gateways."""
    clean_msg = sanitize_string(sim_in.message)
    base_url = str(req.base_url).rstrip("/")
    
    # Analyze project idea using zero-cost deterministic engine
    req_obj = ProjectComparisonRequest(
        domain=sim_in.domain or "AI/ML",
        experience=sim_in.experience or "intermediate",
        languages=["Python"],
        time_weeks=4,
        team_size=1,
        resources=["laptop"],
        primary_goal="college_project",
        candidates=[CandidateIdeaInput(title=clean_msg[:40], description=clean_msg)],
        utm_source="whatsapp_simulator"
    )
    
    comp_res = analyze_and_rank_candidates(req_obj)
    top_project = comp_res.recommended_project
    
    # Auto-generate a Build Contract
    contract_data = generate_build_contract_data(
        title=top_project.title,
        description=top_project.description,
        domain=req_obj.domain,
        experience=req_obj.experience,
        languages=req_obj.languages,
        referral_source="whatsapp_simulator"
    )
    
    db_contract = BuildContract(
        contract_id=contract_data["contract_id"],
        comparison_id=comp_res.comparison_id,
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
        analysis_mode="rules_based",
        referral_source="whatsapp_simulator"
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    reply = format_whatsapp_reply(
        title=top_project.title,
        score=top_project.composite_score,
        assumption=contract_data["critical_assumption"],
        contract_id=db_contract.contract_id,
        base_url=base_url
    )
    
    # Record analytics
    record_event(
        db=db,
        event_name="whatsapp_simulated_interaction",
        contract_id=db_contract.contract_id,
        utm_source="whatsapp_sim",
        metadata={"sender": sim_in.sender_name}
    )
    
    return WhatsAppSimulateResponse(
        reply_text=reply,
        contract_url=f"{base_url}/contract/{db_contract.contract_id}",
        workshop_cta="Build Your First AI Project in 60 Minutes (NxtWave Free Workshop)",
        is_dry_run=True
    )

@router.get("/webhook")
def meta_whatsapp_verify_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge")
):
    """Official Meta WhatsApp Cloud API Webhook Verification endpoint."""
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Meta WhatsApp Webhook successfully verified.")
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")

@router.post("/webhook")
async def meta_whatsapp_inbound_webhook(req: Request, db: Session = Depends(get_db)):
    """Receives incoming messages from Meta WhatsApp Cloud API."""
    try:
        body = await req.json()
    except Exception:
        return {"status": "ignored", "reason": "invalid_json"}
        
    logger.info(f"Received WhatsApp webhook event: {json.dumps(body)}")
    
    # Meta webhook acknowledges 200 OK immediately
    # In dry-run mode (default), we log and simulate without external billing or Twilio
    return {"status": "received", "dry_run": settings.WHATSAPP_DRY_RUN}
