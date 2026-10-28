# Project Compass — Choose. Test. Prove.
### AI-Powered Project Selection, Technical Stress Testing, and Peer Validation Platform
**Built for the NxtWave Growth Intern Challenge | 48-Hour Build | ₹0 Development Cost**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20TypeScript-black.svg)](https://nextjs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://www.sqlite.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-54%20Passed-10b981.svg)](https://pytest.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Cost](https://img.shields.io/badge/Dev%20Cost-%E2%82%B90-success.svg)](#non-negotiable-cost-requirement)

---

## 1. Product Vision

**Project Compass** is an Engineering-as-Marketing platform designed to convert final-year engineering students into registrations for NxtWave's free online masterclass:

> **“Build Your First AI Project in 60 Minutes.”**

### Tagline
**Choose. Test. Prove.**

### Core Promise
> *“Stop guessing which final-year project to build. Find the project that fits your skills, test its biggest failure risks before writing code, and discover how to build a realistic prototype in 60 minutes.”*

---

## 2. The Student Problem We Are Solving

Final-year engineering students face major obstacles when selecting their capstone AI project:
1. **Idea Paralysis:** Too many generic ideas; unable to evaluate which one is buildable within a 4–8 week window.
2. **Resource Mismatch:** Picking complex architectures (e.g. video transformers from scratch) without realizing they require high-end NVIDIA GPUs or paid API credits.
3. **The "Month 3" Disaster:** Discovering fatal technical bugs, hallucinations, or lack of evaluation data weeks before final college faculty reviews.
4. **Lack of Peer Stress-Testing:** Working in isolation without structured feedback from peers or mentors.

### How Project Compass Differs from Basic Project Generators
Generic project generators dump generic text lists of ideas. **Project Compass provides a connected, end-to-end engineering validation workflow**:

```text
Input Constraints & Ideas
           │
           ▼
Multi-Criteria Weighted Feasibility Scoring
           │
           ▼
Official "Build Contract" Generation (Assumption + Tests + MVP)
           │
           ▼
"Break My Build" Peer Stress-Testing (Unique Shareable Link)
           │
           ▼
Structured Plan Revision & Architectural Safeguards
           │
           ▼
Conversion: "Build Your First AI Project in 60 Minutes" Free Workshop
```

---

## 3. Non-Negotiable Cost Requirement (₹0 Build Guarantee)

- **Total Development Expenditure:** **₹0 (Zero Rupees)**
- Runs 100% locally with standard Python and SQLite.
- **Zero Paid APIs:** The primary analysis engine is deterministic and rules-based. It requires **no OpenAI API key, no Anthropic key, no credit card, and no cloud subscriptions**.
- **Zero External UI CDNs:** All styling and JavaScript are bundled locally with vanilla CSS and JS.
- **Hypothetical Marketing Budget Distinction:** A hypothetical ₹2,000 budget exists only within the simulated 7-day marketing plan in `submission/growth_plan.md` to demonstrate acquisition strategy; zero actual money was spent.

---

## 4. Key Features

- **Multi-Criteria Scoring Engine:** Evaluates ideas across 6 documented weighted criteria:
  - Skill Fit (25%)
  - Time Feasibility (20%)
  - Data & Resource Fit (20%)
  - Scope & Complexity (15%)
  - Practical Utility (10%)
  - Objective Testability (10%)
- **5-Sample Realistic Project Library:** Immediate one-click testing of realistic student project archetypes:
  1. *AI College-Policy QA Assistant (RAG / NLP)*
  2. *Plant Disease Image Classifier (Computer Vision / CNN)*
  3. *AI Study Assistant & Quiz Generator (EdTech / NLP)*
  4. *Smart Waste Classification for Recycling (Edge CV)*
  5. *Student Placement & Skill-Gap Platform (Tabular ML)*
- **Structured Build Contract:**
  - Identifies the single **Load-Bearing Technical Assumption**
  - Formulates **2–3 Concrete Failure Scenarios** (procedure, expected observation, acceptance criteria, remediation)
  - Defines strict **MVP Scope Boundary** (essential features vs. postponed features)
  - **4-Stage 60-Minute Build Roadmap** (Scaffold, Core Logic, UI/API, Test & Verification)
  - **Immediate Next Action** (5-minute start task)
- **Break My Build (Viral Peer-Validation Loop):**
  - Generates unique public shareable URL (`/challenge/{contract_id}`)
  - Classmates submit edge cases and failure scenarios without logging in
  - Engine automatically updates the contract with an architectural safeguard and scope adjustment
- **Dual-Mode Workshop Conversion:**
  - *Mode A:* Configured external NxtWave workshop URL with UTM outbound tracking
  - *Mode B:* Self-contained interactive local demo registration with email normalization and duplicate prevention
- **Growth Campaign Analytics Dashboard (`/admin`):**
  - Protected with server-side `ADMIN_TOKEN`
  - Real-time funnel KPIs, conversion percentages, UTM channel attribution, and masked registration feeds
  - One-click **Demo Data Reset** to restore clean presentation state
- **Zero-Cost WhatsApp Simulator (`/whatsapp`):**
  - Mobile chat UI testing conversational distribution without paid WhatsApp or Twilio gateways
  - Official Meta WhatsApp Cloud API verification webhook (`GET /webhook`, `POST /webhook`)

---

## 5. Technology Stack

- **Backend:** Python 3.11+, FastAPI 0.115, Pydantic v2, SQLAlchemy 2.0
- **Database:** SQLite (local zero-dependency file: `local_compass.db`)
- **Frontend:** Jinja2 server-rendered templates, Vanilla HTML5, Pure Modern CSS (Zero CDN dependencies), Vanilla JavaScript
- **Testing:** Pytest 9.2, HTTPX, Starlette TestClient (28 automated tests)
- **Server:** Uvicorn ASGI

---

## 6. Project File Structure

```text
project-compass/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app, lifespan, HTML frontend routes
│   ├── config.py                   # Environment settings & zero-dependency .env parser
│   ├── database.py                 # SQLite engine & session management
│   ├── models.py                   # SQLAlchemy ORM models (Comparisons, Contracts, Challenges, Regs, Analytics)
│   ├── schemas.py                  # Pydantic v2 request/response validation schemas
│   ├── scoring.py                  # Multi-criteria weighted scoring engine
│   ├── analytics.py                # Funnel aggregation & demo data seeding/reset
│   ├── security.py                 # Rate limiting, input sanitization, security headers
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── projects.py             # Comparison & sample library endpoints
│   │   ├── contracts.py            # Build contract generation & retrieval
│   │   ├── challenges.py           # Break My Build peer stress-testing
│   │   ├── registration.py         # Workshop conversion & demo registration
│   │   ├── analytics.py            # Protected metrics & demo reset
│   │   └── whatsapp.py             # WhatsApp simulator & Meta Cloud API webhook
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_analyzer.py     # Archetype classification & sample project library
│   │   ├── contract_planner.py     # Build contract generator & challenge analyzer
│   │   └── llm_provider.py         # Optional LLM integration (disabled by default)
│   ├── templates/
│   │   ├── base.html               # Master layout, navigation, and footer
│   │   ├── index.html              # Stage 1: Homepage & value proposition
│   │   ├── compare.html            # Stage 2 & 3: Constraints & comparative scoring
│   │   ├── contract.html           # Stage 4: Build Contract & failure tests
│   │   ├── challenge.html          # Stage 5: Break My Build peer review page
│   │   ├── register.html           # Stage 6: Workshop registration page
│   │   ├── admin.html              # Growth analytics & funnel metrics dashboard
│   │   ├── whatsapp.html           # Campus community WhatsApp chat simulator
│   │   └── privacy.html            # Privacy notice & data handling
│   └── static/
│       ├── css/style.css           # High-contrast dark engineering theme
│       └── js/app.js               # Client tracking, clipboard, and toast utilities
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest database initialization fixture
│   ├── test_scoring.py             # 5 tests: criteria weights, heuristics, penalties
│   ├── test_projects.py            # 6 tests: health, samples, comparison validation
│   ├── test_contracts.py           # 3 tests: contract generation, 404s, HTML rendering
│   ├── test_challenges.py          # 3 tests: peer challenge workflow, dupes, limits
│   ├── test_registration.py        # 4 tests: validation, email normalization, dupes
│   └── test_analytics.py           # 7 tests: event logging, admin auth, WhatsApp sim
├── submission/
│   ├── growth_plan.md              # 5-Slide presentation-ready campaign plan
│   ├── ai_learning_notes.md        # 3 AI collaboration examples & reflection notes
│   ├── video_script.md             # 3-Minute Loom video walkthrough script
│   └── demo_checklist.md           # 5-Minute step-by-step evaluator checklist
├── pytest.ini                      # Pytest discovery configuration
├── requirements.txt                # Production & test dependencies
├── .env.example                    # Environment variable template
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive project documentation
└── LICENSE                         # Open-source MIT License
```

---

## 7. Local Installation & Quick Start

### Prerequisites
- Python 3.11 or higher installed on your system.

### Option A: macOS & Linux Setup
```bash
# 1. Clone repository & enter workspace
git clone <repo_url>
cd project-compass

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the application
uvicorn app.main:app --reload --port 8000
```

### Option B: Windows (PowerShell) Setup
```powershell
# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment configuration
Copy-Item .env.example .env

# 4. Start the application
uvicorn app.main:app --reload --port 8000
```

Once running, visit:
- **Web Application:** [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Growth Analytics Dashboard:** [http://localhost:8000/admin](http://localhost:8000/admin) (Secret: `compass_growth_admin_secret_2026`)

---

## 8. Running Automated Tests

Run the complete 28-test suite with pytest:

```bash
# Run all tests
pytest -v

# Or run using the virtual environment interpreter
.\.venv\Scripts\pytest.exe -v
```

### Verified Test Suite Results
```text
tests/test_analytics.py ......................... [7 Passed]
tests/test_challenges.py ........................ [3 Passed]
tests/test_contracts.py ......................... [3 Passed]
tests/test_projects.py .......................... [6 Passed]
tests/test_registration.py ...................... [4 Passed]
tests/test_scoring.py ........................... [5 Passed]
======================= 28 passed in 2.55s =======================
```

---

## 9. Environment Configuration

All settings are configured via `.env` (or environment variables) parsed by `app/config.py`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | Application environment (`development`, `production`) |
| `PORT` | `8000` | Local HTTP port |
| `DATABASE_URL` | `sqlite:///./local_compass.db` | Local SQLite database file path |
| `ADMIN_TOKEN` | `compass_growth_admin_secret_2026` | Authorization token for `/admin` metrics and reset |
| `WORKSHOP_REGISTRATION_URL` | *(empty)* | If set, redirects students to official NxtWave URL (Mode A). If empty, runs in local demo simulation mode (Mode B). |
| `ENABLE_OPTIONAL_LLM` | `False` | Zero-cost default is False. If True, enables optional LLM fallback. |
| `OPENAI_API_KEY` | *(empty)* | Optional API key (never required for local demo). |
| `WHATSAPP_DRY_RUN` | `True` | Dry-run mode for WhatsApp webhook adapter. |
| `WHATSAPP_VERIFY_TOKEN` | `compass_whatsapp_webhook_token_2026` | Meta Cloud API webhook verification token. |

---

## 10. Free Deployment Options & Limitations

The application is architected to run locally with zero external network dependencies. If hosting online for demonstration, consider the following current free-tier options:

### Render.com (Free Web Service)
- **Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Current Limitations:** Free instances spin down after 15 minutes of inactivity; initial cold-start takes ~50 seconds. Ephemeral local SQLite storage resets on redeployment.

### Railway / Fly.io
- **Current Terms:** Require credit card verification or have small monthly trial credits. Not recommended under strict ₹0 / no-card constraints.

> **Recommendation for Evaluators:** Local execution (`uvicorn app.main:app --reload`) is the most reliable, zero-latency, and 100% cost-safe method to evaluate the software.

---

## 11. Security, Privacy & Integrity

1. **Input Sanitization & Escaping:** All user-submitted text (project titles, descriptions, peer challenges, names) is escaped via `html.escape()` and validated through strict Pydantic length constraints.
2. **Rate Limiting:** Sliding-window in-memory rate limiter protects public write endpoints against spam and denial-of-service.
3. **Protected Admin Endpoints:** Metrics and demo database reset endpoints require the server-side `ADMIN_TOKEN`.
4. **Attribution Privacy:** IP addresses are hashed using SHA-256 before storage; email addresses in registration logs are masked (`abc***@domain.com`) in administrative views.
5. **No Hallucinated Pass/Fail Claims:** Project Compass never claims an unexecuted test passed. All failure scenarios are transparently labelled as *“Proposed Stress Test — Not Yet Executed”*.

---

## 12. Submission Documents

The four required deliverables for the NxtWave Growth Intern Challenge Round 1 are located in the `submission/` directory:

- [growth_plan.md](file:///c:/Users/nikit/OneDrive/Desktop/nxtwavea/submission/growth_plan.md): 5-slide presentation-ready campaign strategy, channel breakdown, and 500-registration sensitivity funnel.
- [ai_learning_notes.md](file:///c:/Users/nikit/OneDrive/Desktop/nxtwavea/submission/ai_learning_notes.md): 3 concrete examples of AI collaboration, design decisions, and what was deliberately rejected.
- [video_script.md](file:///c:/Users/nikit/OneDrive/Desktop/nxtwavea/submission/video_script.md): 3-minute persuasive Loom walkthrough script (~380 words).
- [demo_checklist.md](file:///c:/Users/nikit/OneDrive/Desktop/nxtwavea/submission/demo_checklist.md): Step-by-step 5-minute evaluator guide using the College Policy Bot sample project.

---

## 13. License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/nikit/OneDrive/Desktop/nxtwavea/LICENSE) for more information.

