import json
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

def generate_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"

class ProjectComparison(Base):
    __tablename__ = "project_comparisons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("cmp"))
    
    # Input constraints
    domain = Column(String(64), nullable=False)
    experience = Column(String(32), nullable=False)
    languages = Column(String(256), nullable=False)  # JSON or comma-separated
    time_weeks = Column(Integer, nullable=False, default=4)
    team_size = Column(Integer, nullable=False, default=1)
    resources = Column(String(256), nullable=False)  # JSON or comma-separated
    primary_goal = Column(String(64), nullable=False)

    # Input and output JSON payloads
    candidates_json = Column(Text, nullable=False)  # List of ideas
    results_json = Column(Text, nullable=False)     # Ranked scoring outputs
    recommended_index = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def get_candidates(self):
        try:
            return json.loads(self.candidates_json)
        except Exception:
            return []

    def get_results(self):
        try:
            return json.loads(self.results_json)
        except Exception:
            return []


class BuildContract(Base):
    __tablename__ = "build_contracts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("bc"))
    comparison_id = Column(String(64), nullable=True, index=True)

    # Project identity
    project_title = Column(String(256), nullable=False)
    original_idea = Column(Text, nullable=False)
    category = Column(String(64), nullable=False)
    difficulty = Column(String(32), nullable=False)

    # Technical foundation
    frontend_rec = Column(String(128), nullable=False)
    backend_rec = Column(String(128), nullable=False)
    ai_model_rec = Column(String(128), nullable=False)
    db_rec = Column(String(128), nullable=False)
    tech_reasoning = Column(Text, nullable=False)
    required_data = Column(Text, nullable=False)

    # Stress testing & assumptions
    critical_assumption = Column(Text, nullable=False)
    failure_scenarios_json = Column(Text, nullable=False)  # List of failure test dicts
    mvp_features_json = Column(Text, nullable=False)       # List of essential MVP features
    deferred_features_json = Column(Text, nullable=False)  # List of deferred features
    plan_60min_json = Column(Text, nullable=False)         # 4 x 15-min milestones
    immediate_action = Column(Text, nullable=False)
    peer_challenge_prompt = Column(Text, nullable=False)

    # Metadata & attribution
    analysis_mode = Column(String(32), default="rules_based")  # "rules_based" or "llm"
    referral_source = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    challenges = relationship("PeerChallenge", back_populates="contract", cascade="all, delete-orphan")

    def get_failure_scenarios(self):
        try:
            return json.loads(self.failure_scenarios_json)
        except Exception:
            return []

    def get_mvp_features(self):
        try:
            return json.loads(self.mvp_features_json)
        except Exception:
            return []

    def get_deferred_features(self):
        try:
            return json.loads(self.deferred_features_json)
        except Exception:
            return []

    def get_plan_60min(self):
        try:
            return json.loads(self.plan_60min_json)
        except Exception:
            return []


class PeerChallenge(Base):
    __tablename__ = "peer_challenges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    challenge_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("ch"))
    contract_id = Column(String(64), ForeignKey("build_contracts.contract_id", ondelete="CASCADE"), nullable=False, index=True)

    peer_name = Column(String(128), default="Anonymous Peer")
    challenge_text = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    improvement_suggestion = Column(Text, nullable=True)
    status = Column(String(32), default="processed")

    # Structured revision recommendation
    improvement_recommendation_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    contract = relationship("BuildContract", back_populates="challenges")

    def get_improvement_recommendation(self):
        try:
            return json.loads(self.improvement_recommendation_json)
        except Exception:
            return {}


class WorkshopRegistration(Base):
    __tablename__ = "workshop_registrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    registration_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("reg"))
    
    name = Column(String(128), nullable=False)
    email = Column(String(256), nullable=False, index=True)  # Normalized lowercase
    phone = Column(String(32), nullable=True)
    
    referral_source = Column(String(128), nullable=True)
    contract_id = Column(String(64), nullable=True, index=True)
    utm_source = Column(String(64), nullable=True)
    utm_medium = Column(String(64), nullable=True)
    utm_campaign = Column(String(64), nullable=True)
    
    is_demo = Column(Boolean, default=True)  # True = simulated demo; False = real confirmed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("evt"))
    event_name = Column(String(64), nullable=False, index=True)
    
    contract_id = Column(String(64), nullable=True, index=True)
    utm_source = Column(String(64), nullable=True)
    utm_medium = Column(String(64), nullable=True)
    utm_campaign = Column(String(64), nullable=True)
    ref = Column(String(128), nullable=True)
    
    session_id = Column(String(64), nullable=True, index=True)
    ip_hash = Column(String(64), nullable=True)
    metadata_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def get_metadata(self):
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}


# ==============================================================================
# WHATSAPP CLOUD API — Persistence Models
# ==============================================================================

class WhatsAppConversationState(Base):
    """Persisted multi-turn conversation state per WhatsApp sender."""
    __tablename__ = "wa_conversation_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    wa_id = Column(String(32), unique=True, index=True, nullable=False)  # sender phone
    state = Column(String(64), nullable=False, default="idle")           # FSM state
    context_json = Column(Text, nullable=True)                           # serialised dict
    last_contract_id = Column(String(64), nullable=True)
    message_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def get_context(self) -> dict:
        try:
            return json.loads(self.context_json) if self.context_json else {}
        except Exception:
            return {}

    def set_context(self, data: dict):
        self.context_json = json.dumps(data)


class ProcessedWhatsAppMessage(Base):
    """Tracks processed wamid values — prevents duplicate handling on Meta retries."""
    __tablename__ = "wa_processed_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    wamid = Column(String(128), unique=True, index=True, nullable=False)
    wa_id = Column(String(32), index=True, nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)


class WhatsAppMessageLog(Base):
    """Immutable audit log of all inbound and outbound WhatsApp messages."""
    __tablename__ = "wa_message_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(String(64), unique=True, index=True, default=lambda: generate_id("wml"))
    direction = Column(String(8), nullable=False)           # "inbound" | "outbound"
    wa_id = Column(String(32), index=True, nullable=False)
    wamid = Column(String(128), nullable=True)
    body = Column(Text, nullable=True)                      # safe/truncated text
    state_before = Column(String(64), nullable=True)
    state_after = Column(String(64), nullable=True)
    status = Column(String(32), default="ok")               # ok | error | simulated
    error_detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
