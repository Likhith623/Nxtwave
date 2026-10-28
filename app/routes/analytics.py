from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Header, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AnalyticsEventRequest, AdminMetricsResponse
from app.analytics import record_event, get_growth_metrics, reset_demo_data
from app.security import verify_admin_token, sanitize_string
from app.config import settings

router = APIRouter(prefix="/api", tags=["Analytics & Administration"])

@router.post("/analytics/event")
def track_event(
    event_in: AnalyticsEventRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Logs client-side interactions (e.g., CTA clicks, page impressions, share button clicks)."""
    client_ip = req.client.host if req.client else None
    evt = record_event(
        db=db,
        event_name=sanitize_string(event_in.event_name),
        contract_id=sanitize_string(event_in.contract_id) if event_in.contract_id else None,
        utm_source=sanitize_string(event_in.utm_source) if event_in.utm_source else None,
        utm_medium=sanitize_string(event_in.utm_medium) if event_in.utm_medium else None,
        utm_campaign=sanitize_string(event_in.utm_campaign) if event_in.utm_campaign else None,
        ref=sanitize_string(event_in.ref) if event_in.ref else None,
        session_id=sanitize_string(event_in.session_id) if event_in.session_id else None,
        client_ip=client_ip,
        metadata=event_in.metadata
    )
    return {"status": "recorded", "event_id": evt.event_id}

@router.get("/admin/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(
    req: Request,
    token: Optional[str] = Query(None, description="Admin secret token for access"),
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    db: Session = Depends(get_db)
):
    """Protected endpoint: Returns live campaign growth funnel metrics and conversion rates."""
    auth_token = token or x_admin_token or ""
    verify_admin_token(auth_token)
    
    metrics = get_growth_metrics(db)
    return AdminMetricsResponse(**metrics)

@router.post("/admin/reset")
def reset_database_demo_records(
    token: Optional[str] = Query(None),
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    db: Session = Depends(get_db)
):
    """Protected endpoint: Clears test records and re-seeds baseline demo presentation records."""
    auth_token = token or x_admin_token or ""
    verify_admin_token(auth_token)
    
    reset_demo_data(db)
    return {"status": "success", "message": "Demo data reset and re-seeded successfully."}

