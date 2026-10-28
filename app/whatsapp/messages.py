"""
app/whatsapp/messages.py
Format human-friendly WhatsApp text messages for each FSM state.

WhatsApp supports bold (*text*), italic (_text_), strikethrough (~text~).
Keep each message under 1024 chars for best rendering on feature phones.
"""
from __future__ import annotations
from typing import Optional


# ──────────────────────────────────────────────────────────────────────────────
# Static messages
# ──────────────────────────────────────────────────────────────────────────────

WELCOME_MESSAGE = """\
🧭 *Welcome to Project Compass!*
_Choose. Test. Prove._

I help final-year engineering students pick the *right* project — fast.

Here's how it works:
1️⃣ Tell me your project idea
2️⃣ I analyse feasibility & risks
3️⃣ You get a full *Build Contract* + stress-test

Reply with one of:
• *START* — analyse a project idea
• *HELP*  — show this menu again
• *DEMO*  — see a sample analysis instantly"""

HELP_MESSAGE = """\
🧭 *Project Compass — Commands*

• *START*   — begin a new project analysis
• *DEMO*    — instant sample Build Contract
• *RESET*   — clear conversation & start over
• *STATUS*  — your last contract link
• *PRIVACY* — how we handle your data

_Type anything else and I'll treat it as a project idea._"""

PRIVACY_MESSAGE = """\
🔒 *Privacy Notice*

• Your WhatsApp number is never stored in plain text.
• Messages are logged for bot improvement only.
• We never share your data with third parties.
• Type *RESET* to clear your session at any time.

Project Compass is a zero-cost NxtWave student project. 🎓"""

ASK_IDEA_MESSAGE = """\
💡 *Tell me your project idea!*

Describe it in 1–3 sentences. For example:
_"A resume screener that uses NLP to rank applicants for HR teams."_

Go ahead 👇"""

ASK_EXPERIENCE_MESSAGE = """\
📚 *What's your current skill level?*

Reply with one of:
• *1* — Beginner (< 6 months coding)
• *2* — Intermediate (6 months–2 years)
• *3* — Advanced (2+ years / hackathon winner)"""

ASK_DOMAIN_MESSAGE = """\
🎯 *Which domain fits your project best?*

• *1* — AI / ML / Data Science
• *2* — Web / Full-Stack
• *3* — Mobile App
• *4* — IoT / Hardware
• *5* — Cybersecurity
• *6* — Other"""

THINKING_MESSAGE = "⏳ Analysing your project idea… give me 5 seconds 🔍"

RESET_MESSAGE = """\
🔄 *Session cleared!*

Type *START* whenever you're ready to analyse a new idea."""

UNSUPPORTED_TYPE_MESSAGE = """\
😅 I can only read text messages right now.

Type *HELP* to see what I can do, or just send me your project idea as text!"""

ERROR_MESSAGE = """\
😬 Something went wrong on my end. Please try again in a moment.

If the issue persists, type *RESET* and start fresh."""


# ──────────────────────────────────────────────────────────────────────────────
# Dynamic messages built from analysis data
# ──────────────────────────────────────────────────────────────────────────────

def build_analysis_reply(
    project_title: str,
    composite_score: float,
    difficulty: str,
    category: str,
    frontend: str,
    backend: str,
    ai_model: str,
    critical_assumption: str,
    immediate_action: str,
    contract_id: str,
    base_url: str,
) -> str:
    """Full Build Contract summary — sent after analysis completes."""
    contract_url = f"{base_url}/contract/{contract_id}"
    challenge_url = f"{base_url}/challenge/{contract_id}"
    register_url = f"{base_url}/register"

    score_bar = _score_bar(composite_score)

    return (
        f"✅ *BUILD CONTRACT READY!*\n\n"
        f"📌 *Project:* {project_title}\n"
        f"🏷 *Category:* {category} | *Difficulty:* {difficulty.title()}\n\n"
        f"📊 *Feasibility Score*\n{score_bar} {composite_score:.0f}/100\n\n"
        f"🛠 *Recommended Stack*\n"
        f"• Frontend: {frontend}\n"
        f"• Backend: {backend}\n"
        f"• AI Model: {ai_model}\n\n"
        f"⚠️ *Critical Assumption*\n_{critical_assumption[:160]}_\n\n"
        f"🚀 *Immediate Next Action*\n{immediate_action[:120]}\n\n"
        f"🔗 *Full Contract:* {contract_url}\n"
        f"💥 *Stress-test it:* {challenge_url}\n\n"
        f"🎓 Want to build this in 60 minutes?\n"
        f"Register FREE → {register_url}"
    )


def build_demo_reply(base_url: str) -> str:
    """Quick demo message when user sends DEMO."""
    return (
        "🎯 *DEMO — AI Resume Screener*\n\n"
        "📊 *Feasibility:* ████████░░ 82/100\n"
        "🏷 *Category:* AI/ML | *Difficulty:* Intermediate\n\n"
        "🛠 *Stack:* Python + FastAPI | Streamlit | spaCy / HuggingFace\n\n"
        "⚠️ *Key Risk:* Real HR resume datasets are hard to source legally.\n\n"
        "🚀 *First Action:* Download the Resume Dataset from Kaggle (3.5k resumes).\n\n"
        f"🔗 Try a real analysis: {base_url}/compare\n"
        f"🎓 Register FREE: {base_url}/register"
    )


def build_status_reply(contract_id: Optional[str], base_url: str) -> str:
    """Reply when user asks for STATUS of their last contract."""
    if not contract_id:
        return (
            "📭 No recent project analysis found for your number.\n\n"
            "Type *START* to analyse a project idea!"
        )
    return (
        f"📋 *Your Last Build Contract*\n\n"
        f"🔗 {base_url}/contract/{contract_id}\n"
        f"💥 Stress-test: {base_url}/challenge/{contract_id}\n\n"
        "Type *START* to analyse a new idea."
    )


def build_experience_confirm(level: str) -> str:
    return f"Got it — *{level.title()}* level. \n\nNow, which domain? 👇\n\n" + ASK_DOMAIN_MESSAGE


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _score_bar(score: float, width: int = 10) -> str:
    filled = round((score / 100) * width)
    return "█" * filled + "░" * (width - filled)


EXPERIENCE_MAP = {
    "1": "beginner", "beginner": "beginner",
    "2": "intermediate", "intermediate": "intermediate",
    "3": "advanced", "advanced": "advanced",
}

DOMAIN_MAP = {
    "1": "AI/ML", "ai": "AI/ML", "ml": "AI/ML", "ai/ml": "AI/ML",
    "2": "Web", "web": "Web", "full-stack": "Web", "fullstack": "Web",
    "3": "Mobile", "mobile": "Mobile", "app": "Mobile",
    "4": "IoT", "iot": "IoT", "hardware": "IoT",
    "5": "Cybersecurity", "security": "Cybersecurity", "cybersecurity": "Cybersecurity",
    "6": "Other", "other": "Other",
}
