# Project Compass: 5-Minute Live Demonstration Checklist
## NxtWave Growth Intern Challenge — Evaluator & Presenter Guide

This step-by-step walkthrough allows an evaluator or presenter to experience the full end-to-end workflow in **under five minutes**, using one consistent sample project: **The AI College-Policy QA Assistant**.

---

## 0. Pre-Flight Verification (30 Seconds)

1. Ensure the local server is running:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
2. Verify the health status endpoint:
   - Open: [http://localhost:8000/health](http://localhost:8000/health)
   - Expected Output:
     ```json
     {
       "status": "healthy",
       "app": "Project Compass",
       "zero_cost_local_mode": true
     }
     ```
3. Open your browser to the homepage: [http://localhost:8000/](http://localhost:8000/)

---

## Step 1: Discover the Platform & Problem (1 Minute)

- **Action:** Open [http://localhost:8000/](http://localhost:8000/)
- **What to Observe:**
  - Notice the **NxtWave Workshop Conversion Banner** at the top: *“Build Your First AI Project in 60 Minutes.”*
  - Scroll past the hero to the **3 Core Questions**:
    - **Why:** Explains the final-year capstone project dilemma and viva failure risks.
    - **What:** Introduces the transparent multi-criteria comparison and official Build Contract.
    - **How:** Introduces the **Break My Build** peer validation stress-testing mechanism.
  - Scroll to the **Sample Project Explorer** showing 5 realistic engineering archetypes.
- **Click:** Click the primary CTA button: **“Find My Best-Fit Project 🎯”** (navigates to `/compare`).

---

## Step 2: Compare Candidate Ideas Against Constraints (1 Minute)

- **Action:** On the `/compare` page:
  1. Click the top quick-loader button: **“College Policy Bot”** (auto-fills student constraints and Idea #1).
  2. Notice the constraints:
     - **Domain:** AI / Machine Learning
     - **Experience:** Intermediate
     - **Languages:** Python, JavaScript
     - **Timeline:** 4 Weeks | **Team:** 2 Members
     - **Hardware:** Standard Laptop, Public Dataset (Zero GPU)
  3. Notice Idea #1 (AI College-Policy QA Assistant) vs. Idea #2 (Autonomous Drone Surveillance using Real-time Transformer from scratch).
  4. Click: **“Compare Ideas & Calculate Feasibility 🧭”**
- **What to Observe:**
  - In under 50ms, the deterministic rules engine renders the comparative analysis.
  - **Idea #1 (College Policy Bot)** is ranked **#1 Best-Fit (Score: ~85–90/100)** with high scores in Skill Fit and Resource Fit.
  - **Idea #2 (Drone Transformer)** is heavily penalized for excessive architectural complexity and lack of GPU resources.
  - Expand the **Transparent Scoring Breakdown** to see the 6 weighted criteria (Skill Fit 25%, Feasibility 20%, Resources 20%, Scope 15%, Utility 10%, Testability 10%).
  - Notice the **Largest Risk to Reconsider**: *“Hallucination risk when students query rules not explicitly documented in the campus handbook.”*
- **Click:** Click **“Generate Build Contract for This Project 📋 →”** on Idea #1.

---

## Step 3: Inspect the Generated Build Contract (1 Minute)

- **Action:** Observe the official Build Contract page: `/contract/{contract_id}`
- **Key Artifacts to Highlight:**
  1. **Contract Identity Badge:** Shows unique ID (e.g. `bc_...`) and *“Deterministic Rules-Based Analysis”*.
  2. **Technical Foundation:** Recommends a ₹0 local stack (FastAPI + Sentence-Transformers on CPU + SQLite).
  3. **The Critical Assumption:**
     > *“Students will primarily ask questions whose factual answers are explicitly stated within the indexed college handbook...”*
  4. **Proposed Stress Tests:** Inspect test `TST-RAG-01` (*“Out-of-Domain Hallucination Trap”*). Notice it defines the exact procedure, expected observation, acceptance criteria, and remediation plan.
  5. **MVP Boundary:** Clearly demarcates *Essential MVP Features* (Week 1) versus *Postponed Scope* (user accounts, audio, real-time sync).
  6. **60-Minute Build Roadmap:** Shows the 4 x 15-minute milestone progression.
  7. **Immediate Next Action:** Gives one actionable 5-minute task to start right now.
- **Click:** Click the button: **“Invite Peer to Break My Build 🛡️”** (or open the shareable link).

---

## Step 4: Break My Build — Submit a Peer Challenge (1 Minute)

- **Action:** Open the unique challenge link: `/challenge/{contract_id}`
- **Scenario:** You are now acting as a skeptical classmate testing the student's project design.
- **Fill Form:**
  - **Peer Name:** `Aditya (4th Year CSE)`
  - **Challenge Scenario:** `What happens if a student asks for hostel curfew rules that were cancelled in a 2026 circular?`
  - **Why It Matters:** `If the assistant quotes the superseded 2022 policy, a student will face disciplinary action and blame the software.`
  - **Suggested Fix:** `Add a circular issue date tag and flag any document older than 18 months as potentially outdated.`
- **Click:** Click **“Submit Peer Challenge 🛡️”**
- **What to Observe:**
  - The form instantly submits and saves to SQLite.
  - The system analyzes the challenge and displays:
    - **Risk Level:** `High Risk`
    - **Recommended Scope Adjustment:** Explains the boundary check needed.
    - **Architectural Safeguard Added:** Explains how to wrap the query pipeline in a date-filtering threshold.
    - **Why Prototyping Matters:** Connects this discovery back to the workshop value.

---

## Step 5: Workshop Conversion & Growth Analytics (1 Minute)

- **Action 1: Test Workshop Registration**
  1. Click **“Register Free for 60-Minute AI Workshop ⚡”** in the banner or footer (navigates to `/register`).
  2. Enter:
     - **Name:** `Demo Student`
     - **Email:** `demo.student@engineering.edu`
  3. Click **“Confirm Free Workshop Registration ⚡”**
  4. Notice instant confirmation message, unique registration ID, and explicit demo simulation badge.
- **Action 2: Inspect Campaign Analytics**
  1. Navigate to: [http://localhost:8000/admin](http://localhost:8000/admin)
  2. The Admin Token is pre-filled (`compass_growth_admin_secret_2026`). Click **“Refresh 🔄”**.
  3. **Observe Live Metrics:**
     - Total Comparisons updated.
     - Total Build Contracts updated.
     - Peer Challenge count and participation rate updated.
     - Workshop CTA clicks and registrations recorded.
     - Funnel conversion rates calculated dynamically.
     - Recent Registrations feed showing the masked demo student record.
  4. Test the **“Reset Demo Data ⚠️”** button to restore clean presentation baseline records at any time.

---

## Fallback Procedures

| Scenario | Fallback Action |
| :--- | :--- |
| **No Internet Connection** | Application runs 100% locally. SQLite, templates, CSS, and JS have zero external CDN dependencies. |
| **Missing OpenAI API Key** | Project Compass defaults to the deterministic rules engine. No API key is needed or expected. |
| **No WhatsApp Gateway** | Use the built-in browser WhatsApp Simulator at `/whatsapp` to demonstrate the conversational flow. |
| **Corrupted Test Database** | Click **“Reset Demo Data”** on `/admin` or delete `local_compass.db` and restart `uvicorn`. Tables re-seed automatically. |

---
*Demonstration complete in under 5 minutes.*

