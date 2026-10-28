"""
app/supabase_client.py
Direct, production-grade Supabase Cloud Database Client.
Provides instant persistence and retrieval across all Project Compass features.
"""
import json
import uuid
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)

_supabase_client = None

def get_supabase():
    """Initializes and caches the Supabase client."""
    global _supabase_client
    if not settings.supabase_configured:
        return None
    if _supabase_client is None:
        try:
            from supabase import create_client
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("[Supabase] Successfully connected to %s", settings.SUPABASE_URL)
        except Exception as e:
            logger.error("[Supabase] Failed to initialize client: %s", e)
            return None
    return _supabase_client


# ==============================================================================
# BUILD CONTRACTS
# ==============================================================================

def supabase_save_contract(contract_data: Dict[str, Any]) -> bool:
    """Inserts or updates a Build Contract in Supabase."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        # Handle failure scenarios serialization
        scenarios = contract_data.get("failure_scenarios_json") or contract_data.get("failure_scenarios") or []
        if not isinstance(scenarios, str):
            scenarios = json.dumps([s.model_dump() if hasattr(s, "model_dump") else s for s in scenarios])

        # Handle MVP features serialization
        mvp = contract_data.get("mvp_features_json") or contract_data.get("mvp_features") or []
        if not isinstance(mvp, str):
            mvp = json.dumps(mvp)

        # Handle deferred features serialization
        deferred = contract_data.get("deferred_features_json") or contract_data.get("deferred_features") or []
        if not isinstance(deferred, str):
            deferred = json.dumps(deferred)

        # Handle 60min plan serialization
        plan = contract_data.get("plan_60min_json") or contract_data.get("plan_60min") or []
        if not isinstance(plan, str):
            plan = json.dumps([p.model_dump() if hasattr(p, "model_dump") else p for p in plan])

        payload = {
            "contract_id": contract_data["contract_id"],
            "comparison_id": contract_data.get("comparison_id"),
            "project_title": contract_data["project_title"],
            "original_idea": contract_data["original_idea"],
            "category": contract_data["category"],
            "difficulty": contract_data["difficulty"],
            "frontend_rec": contract_data["frontend_rec"],
            "backend_rec": contract_data["backend_rec"],
            "ai_model_rec": contract_data["ai_model_rec"],
            "db_rec": contract_data["db_rec"],
            "tech_reasoning": contract_data["tech_reasoning"],
            "required_data": contract_data["required_data"],
            "critical_assumption": contract_data["critical_assumption"],
            "failure_scenarios_json": scenarios,
            "mvp_features_json": mvp,
            "deferred_features_json": deferred,
            "plan_60min_json": plan,
            "immediate_action": contract_data["immediate_action"],
            "peer_challenge_prompt": contract_data["peer_challenge_prompt"],
            "analysis_mode": contract_data.get("analysis_mode", "rules_based"),
            "referral_source": contract_data.get("referral_source"),
        }
        sb.table("build_contracts").upsert(payload, on_conflict="contract_id").execute()
        logger.info("[Supabase] Successfully saved contract: %s", contract_data["contract_id"])
        return True
    except Exception as e:
        logger.warning("[Supabase] Failed to save contract %s: %s", contract_data.get("contract_id"), e)
        return False


def supabase_get_contract(contract_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a Build Contract from Supabase by contract_id."""
    sb = get_supabase()
    if not sb:
        return None
    try:
        res = sb.table("build_contracts").select("*").eq("contract_id", contract_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        logger.warning("[Supabase] Error fetching contract %s: %s", contract_id, e)
        return None


# ==============================================================================
# PROJECT COMPARISONS
# ==============================================================================

def supabase_save_comparison(comp_data: Dict[str, Any]) -> bool:
    """Inserts or updates a Project Comparison in Supabase."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        payload = {
            "comparison_id": comp_data["comparison_id"],
            "domain": comp_data["domain"],
            "experience": comp_data["experience"],
            "languages": comp_data["languages"] if isinstance(comp_data["languages"], str) else ", ".join(comp_data["languages"]),
            "time_weeks": comp_data["time_weeks"],
            "team_size": comp_data["team_size"],
            "resources": comp_data["resources"] if isinstance(comp_data["resources"], str) else ", ".join(comp_data["resources"]),
            "primary_goal": comp_data["primary_goal"],
            "candidates_json": comp_data["candidates_json"] if isinstance(comp_data["candidates_json"], str) else json.dumps(comp_data["candidates_json"]),
            "results_json": comp_data["results_json"] if isinstance(comp_data["results_json"], str) else json.dumps(comp_data["results_json"]),
            "recommended_index": comp_data.get("recommended_index", 0),
        }
        sb.table("project_comparisons").upsert(payload, on_conflict="comparison_id").execute()
        logger.info("[Supabase] Successfully saved comparison: %s", comp_data["comparison_id"])
        return True
    except Exception as e:
        logger.warning("[Supabase] Failed to save comparison: %s", e)
        return False


def supabase_get_comparison(comparison_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a Project Comparison from Supabase."""
    sb = get_supabase()
    if not sb:
        return None
    try:
        res = sb.table("project_comparisons").select("*").eq("comparison_id", comparison_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        logger.warning("[Supabase] Error fetching comparison %s: %s", comparison_id, e)
        return None


# ==============================================================================
# PEER CHALLENGES (BREAK MY BUILD)
# ==============================================================================

def supabase_save_challenge(challenge_data: Dict[str, Any]) -> bool:
    """Inserts a Peer Challenge into Supabase."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        ch_id = challenge_data.get("challenge_id") or f"ch_{uuid.uuid4().hex[:10]}"
        payload = {
            "challenge_id": ch_id,
            "contract_id": challenge_data["contract_id"],
            "peer_name": challenge_data.get("peer_name", "Anonymous Peer"),
            "challenge_text": challenge_data["challenge_text"],
            "why_it_matters": challenge_data["why_it_matters"],
            "improvement_suggestion": challenge_data.get("improvement_suggestion"),
            "status": challenge_data.get("status", "processed"),
            "improvement_recommendation_json": (
                challenge_data["improvement_recommendation_json"]
                if isinstance(challenge_data["improvement_recommendation_json"], str)
                else json.dumps(challenge_data["improvement_recommendation_json"])
            ),
        }
        sb.table("peer_challenges").upsert(payload, on_conflict="challenge_id").execute()
        logger.info("[Supabase] Successfully saved peer challenge: %s", ch_id)
        return True
    except Exception as e:
        logger.warning("[Supabase] Failed to save challenge: %s", e)
        return False


def supabase_get_challenges(contract_id: str) -> List[Dict[str, Any]]:
    """Fetches all peer challenges for a given contract from Supabase."""
    sb = get_supabase()
    if not sb:
        return []
    try:
        res = (
            sb.table("peer_challenges")
            .select("*")
            .eq("contract_id", contract_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.warning("[Supabase] Error fetching challenges for %s: %s", contract_id, e)
        return []


# ==============================================================================
# WORKSHOP REGISTRATIONS
# ==============================================================================

def supabase_save_registration(reg_data: Dict[str, Any]) -> bool:
    """Inserts a workshop registration into Supabase."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        reg_id = reg_data.get("registration_id") or f"reg_{uuid.uuid4().hex[:10]}"
        payload = {
            "registration_id": reg_id,
            "name": reg_data["name"],
            "email": reg_data["email"].strip().lower(),
            "phone": reg_data.get("phone"),
            "referral_source": reg_data.get("referral_source"),
            "contract_id": reg_data.get("contract_id"),
            "utm_source": reg_data.get("utm_source"),
            "utm_medium": reg_data.get("utm_medium"),
            "utm_campaign": reg_data.get("utm_campaign"),
            "is_demo": reg_data.get("is_demo", True),
        }
        sb.table("workshop_registrations").upsert(payload, on_conflict="registration_id").execute()
        logger.info("[Supabase] Successfully saved workshop registration: %s", reg_id)
        return True
    except Exception as e:
        logger.warning("[Supabase] Failed to save registration: %s", e)
        return False


def supabase_get_registrations(limit: int = 50) -> List[Dict[str, Any]]:
    """Fetches recent workshop registrations from Supabase."""
    sb = get_supabase()
    if not sb:
        return []
    try:
        res = (
            sb.table("workshop_registrations")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.warning("[Supabase] Error fetching registrations: %s", e)
        return []


# ==============================================================================
# ANALYTICS EVENTS
# ==============================================================================

def supabase_save_event(event_data: Dict[str, Any]) -> bool:
    """Inserts an analytics event into Supabase."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        evt_id = event_data.get("event_id") or f"evt_{uuid.uuid4().hex[:10]}"
        payload = {
            "event_id": evt_id,
            "event_name": event_data["event_name"],
            "contract_id": event_data.get("contract_id"),
            "utm_source": event_data.get("utm_source"),
            "utm_medium": event_data.get("utm_medium"),
            "utm_campaign": event_data.get("utm_campaign"),
            "ref": event_data.get("ref"),
            "session_id": event_data.get("session_id"),
            "ip_hash": event_data.get("ip_hash"),
            "metadata_json": (
                event_data["metadata_json"]
                if isinstance(event_data.get("metadata_json"), str)
                else json.dumps(event_data["metadata_json"])
                if event_data.get("metadata_json") is not None
                else None
            ),
        }
        sb.table("analytics_events").upsert(payload, on_conflict="event_id").execute()
        return True
    except Exception as e:
        logger.warning("[Supabase] Failed to save event: %s", e)
        return False


def supabase_get_events(limit: int = 50) -> List[Dict[str, Any]]:
    """Fetches recent analytics events from Supabase."""
    sb = get_supabase()
    if not sb:
        return []
    try:
        res = (
            sb.table("analytics_events")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.warning("[Supabase] Error fetching events: %s", e)
        return []


# ==============================================================================
# ADMIN METRICS
# ==============================================================================

def supabase_get_admin_metrics() -> Optional[Dict[str, Any]]:
    """Computes funnel analytics directly from Supabase tables."""
    sb = get_supabase()
    if not sb:
        return None
    try:
        # Get counts via Supabase exact count
        res_comp = sb.table("project_comparisons").select("id", count="exact").execute()
        total_comp = res_comp.count or 0

        res_cont = sb.table("build_contracts").select("id", count="exact").execute()
        total_cont = res_cont.count or 0

        res_chal = sb.table("peer_challenges").select("id", count="exact").execute()
        total_chal = res_chal.count or 0

        res_reg = sb.table("workshop_registrations").select("*").execute()
        regs = res_reg.data or []
        total_reg = len(regs)
        demo_reg = sum(1 for r in regs if r.get("is_demo") is True)
        confirmed_reg = total_reg - demo_reg

        res_cta = sb.table("analytics_events").select("id", count="exact").eq("event_name", "workshop_cta_clicked").execute()
        cta_clicks = res_cta.count or 0

        # Ratios
        comp_to_contract = round((total_cont / total_comp * 100), 1) if total_comp > 0 else 0.0
        contract_to_cta = round((cta_clicks / total_cont * 100), 1) if total_cont > 0 else 0.0
        cta_to_reg = round((total_reg / cta_clicks * 100), 1) if cta_clicks > 0 else 0.0
        overall = round((total_reg / total_comp * 100), 1) if total_comp > 0 else 0.0
        part_rate = round((total_chal / total_cont * 100), 1) if total_cont > 0 else 0.0

        # Campaign sources breakdown
        source_counts: Dict[str, int] = {}
        for r in regs:
            src = r.get("utm_source") or r.get("referral_source") or "direct"
            source_counts[src] = source_counts.get(src, 0) + 1

        campaign_sources = [
            {"source": src, "registrations": count, "percentage": round((count / total_reg * 100), 1) if total_reg > 0 else 0.0}
            for src, count in sorted(source_counts.items(), key=lambda x: x[1], reverse=True)
        ]

        # Recent registrations (privacy masked)
        recent_regs = []
        for r in regs[:10]:
            email = r.get("email", "")
            if "@" in email:
                p1, p2 = email.split("@", 1)
                masked_email = (p1[:3] + "***@" + p2) if len(p1) > 3 else (p1[0] + "***@" + p2)
            else:
                masked_email = "***"
            recent_regs.append({
                "registration_id": r.get("registration_id"),
                "masked_email": masked_email,
                "referral_source": r.get("referral_source"),
                "utm_source": r.get("utm_source"),
                "is_demo": r.get("is_demo", True),
                "created_at": r.get("created_at"),
            })

        return {
            "total_comparisons": total_comp,
            "total_contracts": total_cont,
            "total_challenges": total_chal,
            "total_registrations": total_reg,
            "demo_registrations": demo_reg,
            "confirmed_registrations": confirmed_reg,
            "cta_clicks": cta_clicks,
            "challenge_participation_rate": part_rate,
            "funnel_conversion_rates": {
                "comparisons_to_contracts": comp_to_contract,
                "contracts_to_cta_clicks": contract_to_cta,
                "cta_clicks_to_registrations": cta_to_reg,
                "overall_conversion": overall,
            },
            "campaign_sources": campaign_sources,
            "recent_registrations": recent_regs,
        }
    except Exception as e:
        logger.warning("[Supabase] Error computing admin metrics: %s", e)
        return None
