import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WorkshopRegistration
from app.schemas import (
    WorkshopRegistrationRequest,
    WorkshopRegistrationResponse
)
from app.config import settings
from app.security import verify_rate_limit, sanitize_string
from app.analytics import record_event
from app.supabase_client import (
    supabase_save_registration,
    supabase_get_registrations,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/register", tags=["Workshop Registration"])

@router.get("/status")
def get_registration_config():
    """Returns whether the workshop is running in Mode A (External NxtWave URL) or Mode B (Local Demo)."""
    return {
        "mode": "Mode A (External URL)" if settings.has_external_workshop else "Mode B (Local Demo Simulation)",
        "has_external_url": settings.has_external_workshop,
        "workshop_url": settings.WORKSHOP_REGISTRATION_URL if settings.has_external_workshop else None,
        "workshop_title": "Build Your First AI Project in 60 Minutes"
    }

@router.post("", response_model=WorkshopRegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_workshop(
    reg_in: WorkshopRegistrationRequest,
    req: Request,
    res: Response,
    db: Session = Depends(get_db)
):
    """Registers a student for the NxtWave Workshop — persists to Supabase and local DB."""
    verify_rate_limit(req)

    name = sanitize_string(reg_in.name)
    normalized_email = reg_in.email.lower().strip()
    phone = sanitize_string(reg_in.phone) if reg_in.phone else None

    # Check for duplicate registration by normalized email
    existing_reg = (
        db.query(WorkshopRegistration)
        .filter(WorkshopRegistration.email == normalized_email)
        .first()
    )
    if existing_reg:
        res.status_code = status.HTTP_200_OK
        return WorkshopRegistrationResponse(
            registration_id=existing_reg.registration_id,
            message="You are already registered for the workshop! Check your inbox for access details.",
            name=existing_reg.name,
            email=existing_reg.email,
            is_demo=existing_reg.is_demo,
            external_url=settings.WORKSHOP_REGISTRATION_URL if settings.has_external_workshop else None,
            created_at=existing_reg.created_at
        )

    is_demo = not settings.has_external_workshop

    db_reg = WorkshopRegistration(
        name=name,
        email=normalized_email,
        phone=phone,
        referral_source=reg_in.referral_source,
        contract_id=reg_in.contract_id,
        utm_source=reg_in.utm_source,
        utm_medium=reg_in.utm_medium,
        utm_campaign=reg_in.utm_campaign,
        is_demo=is_demo
    )

    # 1. Save to Supabase Cloud Database
    supabase_save_registration({
        "registration_id": db_reg.registration_id,
        "name": name,
        "email": normalized_email,
        "phone": phone,
        "referral_source": reg_in.referral_source,
        "contract_id": reg_in.contract_id,
        "utm_source": reg_in.utm_source,
        "utm_medium": reg_in.utm_medium,
        "utm_campaign": reg_in.utm_campaign,
        "is_demo": is_demo
    })

    # 2. Local DB persistence
    try:
        db.add(db_reg)
        db.commit()
        db.refresh(db_reg)
    except Exception as e:
        logger.warning("[DB] Local registration save warning: %s", e)

    # Record analytics event
    client_ip = req.client.host if req.client else None
    record_event(
        db=db,
        event_name="registration_completed",
        contract_id=reg_in.contract_id,
        utm_source=reg_in.utm_source,
        utm_medium=reg_in.utm_medium,
        utm_campaign=reg_in.utm_campaign,
        ref=reg_in.referral_source,
        client_ip=client_ip,
        metadata={"is_demo": is_demo, "registration_id": db_reg.registration_id}
    )

    success_msg = (
        "Demonstration registration successful! In live production, confirmation is sent via email."
        if is_demo else
        "Registration confirmed for 'Build Your First AI Project in 60 Minutes'!"
    )

    return WorkshopRegistrationResponse(
        registration_id=db_reg.registration_id,
        message=success_msg,
        name=db_reg.name,
        email=db_reg.email,
        is_demo=is_demo,
        external_url=settings.WORKSHOP_REGISTRATION_URL if settings.has_external_workshop else None,
        created_at=db_reg.created_at
    )
