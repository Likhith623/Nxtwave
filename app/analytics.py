import json
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import AnalyticsEvent, ProjectComparison, BuildContract, PeerChallenge, WorkshopRegistration

def record_event(
    db: Session,
    event_name: str,
    contract_id: Optional[str] = None,
    utm_source: Optional[str] = None,
    utm_medium: Optional[str] = None,
    utm_campaign: Optional[str] = None,
    ref: Optional[str] = None,
    session_id: Optional[str] = None,
    client_ip: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> AnalyticsEvent:
    """Records a lightweight, non-sensitive analytics event for campaign attribution."""
    ip_hash = None
    if client_ip:
        ip_hash = hashlib.sha256(client_ip.encode("utf-8")).hexdigest()[:16]
        
    evt = AnalyticsEvent(
        event_name=event_name,
        contract_id=contract_id,
        utm_source=utm_source,
        utm_medium=utm_medium,
        utm_campaign=utm_campaign,
        ref=ref,
        session_id=session_id,
        ip_hash=ip_hash,
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return evt

def get_growth_metrics(db: Session) -> Dict[str, Any]:
    """Aggregates campaign funnel metrics and stage-to-stage conversion rates."""
    total_comparisons = db.query(ProjectComparison).count()
    total_contracts = db.query(BuildContract).count()
    total_challenges = db.query(PeerChallenge).count()
    
    total_registrations = db.query(WorkshopRegistration).count()
    demo_registrations = db.query(WorkshopRegistration).filter(WorkshopRegistration.is_demo == True).count()
    confirmed_registrations = db.query(WorkshopRegistration).filter(WorkshopRegistration.is_demo == False).count()
    
    cta_clicks = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_name == "workshop_cta_clicked").count()
    page_views = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_name == "page_view").count()
    
    # Participation rate: peer challenges per contract
    challenge_rate = round((total_challenges / total_contracts * 100), 1) if total_contracts > 0 else 0.0
    
    # Conversion funnel steps
    comp_to_contract_rate = round((total_contracts / total_comparisons * 100), 1) if total_comparisons > 0 else 0.0
    contract_to_cta_rate = round((cta_clicks / total_contracts * 100), 1) if total_contracts > 0 else 0.0
    cta_to_reg_rate = round((total_registrations / cta_clicks * 100), 1) if cta_clicks > 0 else 0.0
    overall_funnel_rate = round((total_registrations / total_comparisons * 100), 1) if total_comparisons > 0 else 0.0
    
    # Campaign source breakdown from analytics events and registrations
    sources_query = (
        db.query(
            func.coalesce(AnalyticsEvent.utm_source, "direct/organic").label("source"),
            func.count(AnalyticsEvent.id).label("count")
        )
        .group_by("source")
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(8)
        .all()
    )
    
    campaign_sources = [{"source": s[0], "events": s[1]} for s in sources_query]
    
    # Recent registrations
    recent_regs = (
        db.query(WorkshopRegistration)
        .order_by(WorkshopRegistration.created_at.desc())
        .limit(10)
        .all()
    )
    
    regs_data = [
        {
            "id": r.registration_id,
            "name": r.name,
            "email_masked": f"{r.email[:3]}***@{r.email.split('@')[-1]}" if "@" in r.email else "***",
            "source": r.utm_source or r.referral_source or "direct",
            "is_demo": r.is_demo,
            "contract_id": r.contract_id,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for r in recent_regs
    ]
    
    # Recent event feed
    recent_evts = (
        db.query(AnalyticsEvent)
        .order_by(AnalyticsEvent.created_at.desc())
        .limit(10)
        .all()
    )
    
    events_data = [
        {
            "event_name": e.event_name,
            "contract_id": e.contract_id,
            "source": e.utm_source or e.ref or "direct",
            "created_at": e.created_at.strftime("%H:%M:%S")
        }
        for e in recent_evts
    ]
    
    return {
        "total_comparisons": total_comparisons,
        "total_contracts": total_contracts,
        "total_challenges": total_challenges,
        "total_registrations": total_registrations,
        "demo_registrations": demo_registrations,
        "confirmed_registrations": confirmed_registrations,
        "cta_clicks": cta_clicks,
        "page_views": page_views,
        "challenge_participation_rate": challenge_rate,
        "funnel_conversion_rates": {
            "comparison_to_contract": comp_to_contract_rate,
            "contract_to_cta": contract_to_cta_rate,
            "cta_to_registration": cta_to_reg_rate,
            "comparison_to_registration": overall_funnel_rate
        },
        "campaign_sources": campaign_sources,
        "recent_registrations": regs_data,
        "recent_events": events_data
    }

def seed_sample_growth_data(db: Session):
    """Populates realistic demo metrics for initial presentation without fabricating real users."""
    import uuid
    # Only seed if database is empty
    if db.query(ProjectComparison).count() > 0:
        return
        
    # Seed 3 comparisons
    c1 = ProjectComparison(
        comparison_id="cmp_demo_01",
        domain="AI/ML",
        experience="intermediate",
        languages="Python, JavaScript",
        time_weeks=4,
        team_size=2,
        resources="laptop, public dataset",
        primary_goal="college_project",
        candidates_json=json.dumps([{"title": "College Policy Bot", "description": "RAG handbook assistant"}]),
        results_json=json.dumps([{"title": "College Policy Bot", "composite_score": 88.5}]),
        recommended_index=0
    )
    db.add(c1)
    
    # Seed 2 Build Contracts
    b1 = BuildContract(
        contract_id="bc_demo_rag",
        comparison_id="cmp_demo_01",
        project_title="AI College-Policy QA Assistant",
        original_idea="An interactive chatbot grounded in college academic regulations.",
        category="RAG & Document Intelligence",
        difficulty="Intermediate",
        frontend_rec="HTML5 / Vanilla JS Chat",
        backend_rec="FastAPI (Python 3.11)",
        ai_model_rec="Sentence-Transformers (all-MiniLM-L6-v2)",
        db_rec="SQLite FTS5",
        tech_reasoning="Fast local CPU execution with zero paid API dependencies.",
        required_data="3 official college regulation PDFs.",
        critical_assumption="Students ask questions answerable from official documents.",
        failure_scenarios_json=json.dumps([
            {
                "test_id": "TST-01",
                "test_name": "Out-of-Domain Hallucination",
                "what_is_tested": "Unindexed syllabus questions",
                "why_it_matters": "Prevents false academic policy advice",
                "test_procedure": "Ask unindexed question",
                "expected_observation": "Polite decline",
                "acceptance_criteria": "Zero hallucinations",
                "remediation_plan": "Strict distance threshold"
            }
        ]),
        mvp_features_json=json.dumps(["Document extraction", "Embeddings", "Search UI"]),
        deferred_features_json=json.dumps(["User accounts", "WhatsApp bot"]),
        plan_60min_json=json.dumps([
            {"time_window": "00-15", "phase_title": "Setup", "objective": "Scaffold", "action_items": ["Init"], "deliverable": "Repo"}
        ]),
        immediate_action="Extract page 1 of handbook.",
        peer_challenge_prompt="What tricky policy question could break this?",
        referral_source="campus_club_whatsapp"
    )
    db.add(b1)
    
    # Seed 1 peer challenge
    p1 = PeerChallenge(
        challenge_id="ch_demo_01",
        contract_id="bc_demo_rag",
        peer_name="Arjun (Final Year CSE)",
        challenge_text="What happens if a student asks about fee refund rules that are only on a separate administrative circular?",
        why_it_matters="Giving wrong fee advice causes financial headaches for students.",
        improvement_suggestion="Add an explicit 'Circular date & coverage' badge to every answer.",
        status="processed",
        improvement_recommendation_json=json.dumps({
            "challenge_summary": "Fee refund circular coverage gap",
            "risk_level": "High",
            "recommended_scope_adjustment": "Add disclaimer when querying financial/fee topics",
            "architectural_safeguard": "Threshold fallback for financial policies",
            "workshop_relevance": "Key insight on domain boundaries"
        })
    )
    db.add(p1)
    
    # Seed 2 demo registrations
    r1 = WorkshopRegistration(
        registration_id="reg_demo_01",
        name="Priya Sharma",
        email="priya.demo@engineering.edu",
        referral_source="campus_club_whatsapp",
        contract_id="bc_demo_rag",
        utm_source="campus_club",
        utm_medium="whatsapp",
        utm_campaign="growth_challenge",
        is_demo=True
    )
    db.add(r1)
    
    # Seed analytics events
    db.add(AnalyticsEvent(event_name="page_view", utm_source="campus_club"))
    db.add(AnalyticsEvent(event_name="comparison_completed", utm_source="campus_club"))
    db.add(AnalyticsEvent(event_name="build_contract_created", contract_id="bc_demo_rag", utm_source="campus_club"))
    db.add(AnalyticsEvent(event_name="workshop_cta_clicked", contract_id="bc_demo_rag", utm_source="campus_club"))
    db.add(AnalyticsEvent(event_name="registration_completed", contract_id="bc_demo_rag", utm_source="campus_club"))
    
    db.commit()

def reset_demo_data(db: Session):
    """Safely clears all demo data and re-seeds baseline presentation records."""
    db.query(PeerChallenge).delete()
    db.query(BuildContract).delete()
    db.query(ProjectComparison).delete()
    db.query(WorkshopRegistration).delete()
    db.query(AnalyticsEvent).delete()
    db.commit()
    seed_sample_growth_data(db)

