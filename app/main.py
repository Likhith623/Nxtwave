import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings, BASE_DIR
from app.database import init_db, get_db, SessionLocal
from app.models import BuildContract, PeerChallenge
from app.security import SecurityHeadersMiddleware
from app.analytics import seed_sample_growth_data

# Import API Routers
from app.routes.projects import router as projects_router
from app.routes.contracts import router as contracts_router
from app.routes.challenges import router as challenges_router
from app.routes.registration import router as registration_router
from app.routes.analytics import router as analytics_router
from app.routes.whatsapp import router as whatsapp_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    # Initialize DB schema
    init_db()
    # Seed presentation sample records if database is fresh
    db = SessionLocal()
    try:
        seed_sample_growth_data(db)
    finally:
        db.close()
    yield

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Project Selection, Technical Stress Testing, and Peer Validation Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Ensure database tables exist on import as well as lifespan
init_db()

# Attach Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Mount Static Files
static_dir = BASE_DIR / "app" / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Configure Jinja2 Templates
templates_dir = BASE_DIR / "app" / "templates"
templates = Jinja2Templates(directory=str(templates_dir))

# Include API Routers
app.include_router(projects_router)
app.include_router(contracts_router)
app.include_router(challenges_router)
app.include_router(registration_router)
app.include_router(analytics_router)
app.include_router(whatsapp_router)

# ==============================================================================
# HTML FRONTEND ROUTES
# ==============================================================================

@app.get("/health", tags=["System Health"])
def health_check():
    """Health status endpoint for monitoring and deployment verification."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "zero_cost_local_mode": True,
        "database": "sqlite_local",
        "optional_llm_enabled": settings.ENABLE_OPTIONAL_LLM,
        "whatsapp_dry_run": settings.WHATSAPP_DRY_RUN
    }

@app.get("/", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_home(request: Request):
    """Stage 1: Homepage & Value Proposition."""
    return templates.TemplateResponse(request=request, name="index.html", context={"settings": settings})

@app.get("/compare", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_compare(request: Request):
    """Stage 2 & 3: Input Constraints & Compare Project Ideas."""
    return templates.TemplateResponse(request=request, name="compare.html", context={"settings": settings})

@app.get("/contract/{contract_id}", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_build_contract(contract_id: str, request: Request, db: Session = Depends(get_db)):
    """Stage 4: View Detailed Build Contract."""
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Build Contract '{contract_id}' not found.")
        
    challenges = (
        db.query(PeerChallenge)
        .filter(PeerChallenge.contract_id == contract_id)
        .order_by(PeerChallenge.created_at.desc())
        .all()
    )
    
    # Unpack parsed lists for template
    contract_dict = {
        "contract_id": contract.contract_id,
        "project_title": contract.project_title,
        "original_idea": contract.original_idea,
        "category": contract.category,
        "difficulty": contract.difficulty,
        "frontend_rec": contract.frontend_rec,
        "backend_rec": contract.backend_rec,
        "ai_model_rec": contract.ai_model_rec,
        "db_rec": contract.db_rec,
        "tech_reasoning": contract.tech_reasoning,
        "required_data": contract.required_data,
        "critical_assumption": contract.critical_assumption,
        "failure_scenarios": contract.get_failure_scenarios(),
        "mvp_features": contract.get_mvp_features(),
        "deferred_features": contract.get_deferred_features(),
        "plan_60min": contract.get_plan_60min(),
        "immediate_action": contract.immediate_action,
        "peer_challenge_prompt": contract.peer_challenge_prompt,
        "created_at": contract.created_at
    }
    
    return templates.TemplateResponse(
        request=request,
        name="contract.html",
        context={
            "contract": contract_dict,
            "challenges": challenges,
            "settings": settings
        }
    )

@app.get("/challenge/{contract_id}", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_peer_challenge(contract_id: str, request: Request, db: Session = Depends(get_db)):
    """Stage 5: Break My Build — Peer Validation Page."""
    contract = db.query(BuildContract).filter(BuildContract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Build Contract '{contract_id}' not found.")
        
    challenges = (
        db.query(PeerChallenge)
        .filter(PeerChallenge.contract_id == contract_id)
        .order_by(PeerChallenge.created_at.desc())
        .all()
    )
    
    contract_dict = {
        "contract_id": contract.contract_id,
        "project_title": contract.project_title,
        "original_idea": contract.original_idea,
        "category": contract.category,
        "difficulty": contract.difficulty,
        "critical_assumption": contract.critical_assumption,
        "failure_scenarios": contract.get_failure_scenarios(),
        "mvp_features": contract.get_mvp_features(),
        "peer_challenge_prompt": contract.peer_challenge_prompt
    }
    
    return templates.TemplateResponse(
        request=request,
        name="challenge.html",
        context={
            "contract": contract_dict,
            "challenges": challenges,
            "settings": settings
        }
    )

@app.get("/register", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_register(request: Request):
    """Stage 6: Workshop Conversion Page."""
    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={
            "settings": settings,
            "has_external_url": settings.has_external_workshop,
            "external_url": settings.WORKSHOP_REGISTRATION_URL
        }
    )

@app.get("/admin", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_admin(request: Request):
    """Growth Campaign Analytics & Admin Panel."""
    return templates.TemplateResponse(request=request, name="admin.html", context={"settings": settings})

@app.get("/whatsapp", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_whatsapp_simulator(request: Request):
    """WhatsApp Campus Community Bot Simulator."""
    return templates.TemplateResponse(request=request, name="whatsapp.html", context={"settings": settings})

@app.get("/privacy", response_class=HTMLResponse, tags=["Frontend Pages"])
def page_privacy(request: Request):
    """Privacy Notice & Data Handling."""
    return templates.TemplateResponse(request=request, name="privacy.html", context={"settings": settings})
