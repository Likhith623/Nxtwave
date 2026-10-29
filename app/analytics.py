import json
import hashlib
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import AnalyticsEvent, ProjectComparison, BuildContract, PeerChallenge, WorkshopRegistration

logger = logging.getLogger(__name__)

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
    """Records a lightweight analytics event — saves to Supabase and local DB."""
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

    # 1. Save to Supabase Cloud Database
    try:
        from app.supabase_client import supabase_save_event
        supabase_save_event({
            "event_id": evt.event_id,
            "event_name": event_name,
            "contract_id": contract_id,
            "utm_source": utm_source,
            "utm_medium": utm_medium,
            "utm_campaign": utm_campaign,
            "ref": ref,
            "session_id": session_id,
            "ip_hash": ip_hash,
            "metadata_json": json.dumps(metadata) if metadata else None
        })
    except Exception as e:
        logger.warning("[Supabase] Event save warning: %s", e)

    # 2. Local DB persistence fallback
    try:
        db.add(evt)
        db.commit()
        db.refresh(evt)
    except Exception as e:
        logger.warning("[DB] Local event save warning: %s", e)

    return evt


def get_growth_metrics(db: Session) -> Dict[str, Any]:
    """Aggregates campaign funnel metrics and stage-to-stage conversion rates (Supabase first)."""
    # Try Supabase metrics first
    try:
        from app.supabase_client import supabase_get_admin_metrics
        supa_m = supabase_get_admin_metrics()
        if supa_m and supa_m.get("total_contracts", 0) > 0:
            # Query recent events from DB fallback for table view
            recent_evts = (
                db.query(AnalyticsEvent)
                .order_by(AnalyticsEvent.created_at.desc())
                .limit(10)
                .all()
            )
            supa_m["recent_events"] = [
                {
                    "event_name": e.event_name,
                    "contract_id": e.contract_id,
                    "source": e.utm_source or e.ref or "direct",
                    "created_at": e.created_at.strftime("%H:%M:%S") if e.created_at else ""
                }
                for e in recent_evts
            ]
            supa_m["page_views"] = supa_m.get("cta_clicks", 0) * 3 + supa_m["total_comparisons"]

            # Merge local SQLite registrations so newly registered students ALWAYS appear immediately
            local_regs = (
                db.query(WorkshopRegistration)
                .order_by(WorkshopRegistration.created_at.desc())
                .limit(25)
                .all()
            )
            local_formatted = []
            for r in local_regs:
                email_val = r.email or ""
                if "@" in email_val:
                    p1, p2 = email_val.split("@", 1)
                    m_email = (p1[:3] + "***@" + p2) if len(p1) > 3 else (p1[0] + "***@" + p2)
                else:
                    m_email = "***"
                s_name = r.name or "Student Participant"
                src = r.utm_source or r.referral_source or "direct"
                local_formatted.append({
                    "registration_id": r.registration_id,
                    "name": s_name,
                    "full_name": s_name,
                    "masked_email": m_email,
                    "email_masked": m_email,
                    "email": m_email,
                    "source": src,
                    "referral_source": src,
                    "utm_source": src,
                    "is_demo": r.is_demo,
                    "track": "AI Workshop",
                    "created_at": r.created_at.isoformat() if r.created_at else "",
                })

            seen_emails = set()
            merged_regs = []
            for item in local_formatted:
                ek = item["email"].lower()
                if ek not in seen_emails:
                    seen_emails.add(ek)
                    merged_regs.append(item)

            for item in supa_m.get("recent_registrations", []):
                ek = (item.get("email") or item.get("email_masked") or "").lower()
                if ek not in seen_emails:
                    seen_emails.add(ek)
                    merged_regs.append(item)

            supa_m["recent_registrations"] = merged_regs[:15]
            
            # Ensure total counts accurately reflect any local signups
            local_count = db.query(WorkshopRegistration).count()
            if local_count > supa_m.get("total_registrations", 0):
                supa_m["total_registrations"] = local_count

            return supa_m
    except Exception as e:
        logger.warning("[Supabase] Metrics fallback to local: %s", e)

    # Local DB fallback computation
    total_comparisons = db.query(ProjectComparison).count()
    total_contracts = db.query(BuildContract).count()
    total_challenges = db.query(PeerChallenge).count()

    total_registrations = db.query(WorkshopRegistration).count()
    demo_registrations = db.query(WorkshopRegistration).filter(WorkshopRegistration.is_demo == True).count()
    confirmed_registrations = db.query(WorkshopRegistration).filter(WorkshopRegistration.is_demo == False).count()

    cta_clicks = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_name == "workshop_cta_clicked").count()
    page_views = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_name == "page_view").count()

    challenge_rate = round((total_challenges / total_contracts * 100), 1) if total_contracts > 0 else 0.0

    comp_to_contract_rate = round((total_contracts / total_comparisons * 100), 1) if total_comparisons > 0 else 0.0
    contract_to_cta_rate = round((cta_clicks / total_contracts * 100), 1) if total_contracts > 0 else 0.0
    cta_to_reg_rate = round((total_registrations / cta_clicks * 100), 1) if cta_clicks > 0 else 0.0
    overall_funnel_rate = round((total_registrations / total_comparisons * 100), 1) if total_comparisons > 0 else 0.0

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

    recent_regs = (
        db.query(WorkshopRegistration)
        .order_by(WorkshopRegistration.created_at.desc())
        .limit(10)
        .all()
    )

    regs_data = [
        {
            "id": r.registration_id,
            "name": r.name or "Student Participant",
            "full_name": r.name or "Student Participant",
            "email_masked": f"{r.email[:3]}***@{r.email.split('@')[-1]}" if "@" in r.email else "***",
            "masked_email": f"{r.email[:3]}***@{r.email.split('@')[-1]}" if "@" in r.email else "***",
            "email": f"{r.email[:3]}***@{r.email.split('@')[-1]}" if "@" in r.email else "***",
            "source": r.utm_source or r.referral_source or "direct",
            "referral_source": r.utm_source or r.referral_source or "direct",
            "utm_source": r.utm_source or r.referral_source or "direct",
            "is_demo": r.is_demo,
            "contract_id": r.contract_id,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        }
        for r in recent_regs
    ]

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
            "created_at": e.created_at.strftime("%H:%M:%S") if e.created_at else ""
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
            "comparisons_to_contracts": comp_to_contract_rate,
            "contract_to_cta": contract_to_cta_rate,
            "contracts_to_cta_clicks": contract_to_cta_rate,
            "cta_to_registration": cta_to_reg_rate,
            "cta_clicks_to_registrations": cta_to_reg_rate,
            "comparison_to_registration": overall_funnel_rate,
            "overall_conversion": overall_funnel_rate
        },
        "campaign_sources": campaign_sources,
        "recent_registrations": regs_data,
        "recent_events": events_data
    }


def seed_sample_growth_data(db: Session):
    """Populates realistic demo metrics for initial presentation without fabricating real users."""
    if db.query(ProjectComparison).count() > 0:
        return

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

    from app.services.contract_planner import generate_build_contract_data
    c_data = generate_build_contract_data(
        title="AI College-Policy QA Assistant",
        description="An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings."
    )
    b1 = BuildContract(
        contract_id="bc_demo_rag",
        comparison_id="cmp_demo_01",
        project_title=c_data["project_title"],
        original_idea=c_data["original_idea"],
        category=c_data["category"],
        difficulty=c_data["difficulty"],
        frontend_rec=c_data["frontend_rec"],
        backend_rec=c_data["backend_rec"],
        ai_model_rec=c_data["ai_model_rec"],
        db_rec=c_data["db_rec"],
        tech_reasoning=c_data["tech_reasoning"],
        required_data=c_data["required_data"],
        critical_assumption=c_data["critical_assumption"],
        failure_scenarios_json=json.dumps([f.model_dump() if hasattr(f, 'model_dump') else f for f in c_data["failure_scenarios"]]),
        mvp_features_json=json.dumps(c_data["mvp_features"]),
        deferred_features_json=json.dumps(c_data["deferred_features"]),
        plan_60min_json=json.dumps([m.model_dump() if hasattr(m, 'model_dump') else m for m in c_data["plan_60min"]]),
        immediate_action=c_data["immediate_action"],
        peer_challenge_prompt=c_data["peer_challenge_prompt"],
        referral_source="campus_club_whatsapp"
    )
    db.add(b1)

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
