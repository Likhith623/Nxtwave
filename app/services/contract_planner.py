import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas import (
    BuildContractCreateRequest,
    BuildContractResponse,
    FailureScenario,
    Plan60MinMilestone,
    PeerChallengeCreateRequest,
    ImprovementRecommendation,
    PeerChallengeResponse
)
from app.services.project_analyzer import detect_category_and_difficulty, SAMPLE_PROJECTS

def generate_build_contract_data(
    title: str,
    description: str,
    domain: str = "AI/ML",
    experience: str = "intermediate",
    languages: List[str] = None,
    time_weeks: int = 4,
    team_size: int = 1,
    resources: List[str] = None,
    primary_goal: str = "college_project",
    comparison_id: Optional[str] = None,
    referral_source: Optional[str] = None
) -> Dict[str, Any]:
    """Generates a complete, structured Build Contract for a chosen project."""
    languages = languages or ["Python"]
    resources = resources or ["laptop"]
    contract_id = f"bc_{uuid.uuid4().hex[:10]}"
    category, difficulty = detect_category_and_difficulty(title, description, experience)
    text = f"{title} {description}".lower()

    # Determine domain-specific artifacts
    if "rag" in text or "policy" in text or "handbook" in text or "faq" in text or "document" in text:
        tech_foundation = {
            "frontend_rec": "Lightweight HTML5 + Vanilla JS Chat Interface",
            "backend_rec": "FastAPI (Python 3.11) with Streaming SSE Responses",
            "ai_model_rec": "Sentence-Transformers (all-MiniLM-L6-v2) + SQLite FTS5 / Local ChromaDB",
            "db_rec": "SQLite (Session history and document chunk index)",
            "tech_reasoning": "Sentence-Transformers runs at 50ms latency on CPU without GPU or paid OpenAI API costs. SQLite handles vectors and query logs in a single local zero-dependency file.",
            "required_data": "3 to 5 official college PDF policy documents (academic handbook, exam regulations, hostel rules). Clean text extraction via PyPDF/pdfplumber."
        }
        critical_assumption = (
            "Students will primarily ask questions whose factual answers are explicitly stated "
            "within the indexed college handbook, and queries outside this document set will be gracefully admitted as unanswerable."
        )
        failure_scenarios = [
            FailureScenario(
                test_id="TST-RAG-01",
                test_name="Out-of-Domain Hallucination Trap",
                what_is_tested="System response when asked about a topic non-existent in college documents (e.g., 'What is the syllabus for Rocket Propulsion 401?').",
                why_it_matters="If the model fabricates policy details, students will take real-world academic actions based on false information, discrediting the application.",
                test_procedure="Send 5 known unindexed queries via the API endpoint. Record response text, similarity threshold score, and citation fields.",
                expected_observation="System detects low semantic similarity (<0.45 cosine score) and outputs standard admission of uncertainty.",
                acceptance_criteria="100% of out-of-scope questions return 'This topic is not covered in the official college regulations' with zero speculative claims.",
                remediation_plan="Implement a strict semantic distance ceiling. If top document chunk distance exceeds threshold, short-circuit before model generation."
            ),
            FailureScenario(
                test_id="TST-RAG-02",
                test_name="Contradictory Policy Precedence Test",
                what_is_tested="Querying an attendance clause that was amended in 2026 vs an older 2023 rule present in the same directory.",
                why_it_matters="Colleges update circulars regularly; serving superseded rules causes official administrative disputes.",
                test_procedure="Index both 'Regulations_2023.pdf' and 'Amendment_Circular_2026.pdf'. Ask: 'What is the minimum attendance required for exam eligibility?'.",
                expected_observation="Retriever ranks the newer circular higher and clearly cites the circular date and section.",
                acceptance_criteria="System includes document publication date in metadata citation and highlights the active amendment.",
                remediation_plan="Add metadata filtering to chunk schemas (doc_year, version_priority) and sort candidates by recency before prompt injection."
            ),
            FailureScenario(
                test_id="TST-RAG-03",
                test_name="Table & Multi-Column Parsing Integrity",
                what_is_tested="Extracting grading scales and grade point equivalencies from PDF layout tables.",
                why_it_matters="Standard PDF parsers often scramble table cells into disjointed strings, confusing grade boundaries.",
                test_procedure="Query: 'What letter grade corresponds to 74% in end-semester exams?'.",
                expected_observation="The exact row from the grading table is returned without misattributing marks to adjacent columns.",
                acceptance_criteria="Response accurately reports grade range 70-79% without column swapping.",
                remediation_plan="Pre-convert complex tabular pages into Markdown tables during the ingestion pipeline rather than relying on raw text extraction."
            )
        ]
        mvp_features = [
            "Document ingestion script converting 3 sample college PDFs into chunked text with metadata.",
            "Embedding generation using local Sentence-Transformers (MiniLM) stored in memory or SQLite.",
            "Single-query search endpoint returning top 3 matching source passages with similarity scores.",
            "Minimalist responsive web chat UI displaying answers with expandable source document citations."
        ]
        deferred_features = [
            "User login / authentication system (unnecessary for MVP demo).",
            "Multi-modal image/diagram scanning in scanned documents.",
            "Voice-to-text integration or automated WhatsApp chatbot deployment.",
            "Live syncing with college intranet portals behind authentication."
        ]
        plan_60min = [
            Plan60MinMilestone(
                time_window="Minutes 00-15",
                phase_title="Project Scaffolding & PDF Extraction",
                objective="Create FastAPI directory, install sentence-transformers, and extract clean text from 1 college handbook PDF.",
                action_items=[
                    "Initialize virtual environment and app/main.py structure.",
                    "Load PyPDF and extract text from 5 pages of college rules.",
                    "Split text into 300-word chunks with 50-word overlap."
                ],
                deliverable="Working script that outputs list of chunks with page numbers."
            ),
            Plan60MinMilestone(
                time_window="Minutes 15-30",
                phase_title="Local Embedding & Similarity Engine",
                objective="Generate embeddings for document chunks and build cosine similarity search.",
                action_items=[
                    "Load 'all-MiniLM-L6-v2' model locally.",
                    "Embed chunks and compute dot-product similarity against a test query.",
                    "Set similarity threshold to filter irrelevant results."
                ],
                deliverable="Function `search_handbook(query)` returning top-3 relevant passages."
            ),
            Plan60MinMilestone(
                time_window="Minutes 30-45",
                phase_title="FastAPI Endpoint & Web UI Connection",
                objective="Wrap search logic into REST endpoint and hook up clean single-page chat UI.",
                action_items=[
                    "Create POST /api/ask endpoint with Pydantic request/response validation.",
                    "Serve simple Jinja2 HTML page with question input and chat log.",
                    "Display retrieved passages with collapsible source citations."
                ],
                deliverable="Interactive browser chat where typing a question returns grounded handbook text."
            ),
            Plan60MinMilestone(
                time_window="Minutes 45-60",
                phase_title="Stress Test Verification & Demo Rehearsal",
                objective="Execute Out-of-Domain failure test and prepare 60-second live demonstration walkthrough.",
                action_items=[
                    "Test with 1 valid question and 1 completely fake question.",
                    "Verify the system politely declines to answer the fake question.",
                    "Record response latency (target: <250ms)."
                ],
                deliverable="Verified working prototype ready for peer review and workshop conversion."
            )
        ]
        immediate_action = "Download 1 official college regulation PDF (e.g., student conduct or exam rules) and verify you can extract text from page 1 using Python."
        peer_prompt = "What tricky edge-case question would a mischievous student ask that might trick this assistant into giving a false or misleading policy guarantee?"

    elif "plant" in text or "leaf" in text or "waste" in text or "image" in text or "camera" in text or "vision" in text:
        tech_foundation = {
            "frontend_rec": "HTML5 Drag-and-Drop Image Uploader with Canvas Preview",
            "backend_rec": "FastAPI (Python 3.11) with Async Image Preprocessing",
            "ai_model_rec": "MobileNetV3 / ResNet18 via ONNX Runtime (CPU-optimized)",
            "db_rec": "SQLite (Classification logs and user feedback telemetry)",
            "tech_reasoning": "ONNX Runtime with pre-trained MobileNet delivers sub-60ms inference on standard laptop CPUs without needing expensive GPU cloud servers.",
            "required_data": "Public labeled dataset (e.g., PlantVillage or TrashNet subset). 100 images per target class split 80/20 train/validation."
        }
        critical_assumption = (
            "The model can maintain acceptable classification confidence on smartphone camera images captured under variable indoor lighting, "
            "rather than only on perfectly lit, uniform lab backgrounds."
        )
        failure_scenarios = [
            FailureScenario(
                test_id="TST-CV-01",
                test_name="Shadow & Camera Glare Invariance Test",
                what_is_tested="Inference accuracy when an image has harsh lateral shadows or lens glare.",
                why_it_matters="Students and users do not take studio photos; glare frequently flips feature activations.",
                test_procedure="Take 5 test images; digitally apply artificial glare gradient and 50% diagonal shadow. Run classification.",
                expected_observation="Confidence on correct class remains above 60% without misclassifying to random background class.",
                acceptance_criteria="Top-1 class prediction remains unchanged across at least 4 of 5 corrupted images.",
                remediation_plan="Incorporate random brightness, contrast, and color-jitter augmentations during fine-tuning."
            ),
            FailureScenario(
                test_id="TST-CV-02",
                test_name="Out-of-Vocabulary / Blank Image Rejection",
                what_is_tested="Submitting a non-relevant object (e.g. coffee cup or blank white image) into the classifier.",
                why_it_matters="Classifiers without thresholding will confidently output 'Tomato Late Blight: 98%' on a photo of a keyboard.",
                test_procedure="Upload 3 completely non-domain images (e.g., shoe, keyboard, plain white square).",
                expected_observation="Maximum softmax probability is low or entropy is high; system flags 'Unrecognized Object'.",
                acceptance_criteria="System rejects non-domain images and prompts user to re-center subject.",
                remediation_plan="Add an entropy or confidence threshold (e.g., softmax < 0.65 triggers 'Inconclusive / Out of Domain')."
            )
        ]
        mvp_features = [
            "Single-screen web upload supporting JPG/PNG files under 5MB.",
            "Server-side resizing to 224x224 and normalization pipeline.",
            "ONNX model inference returning top 3 predicted classes with percentage bars.",
            "Actionable remediation or disposal recommendation for top predicted class."
        ]
        deferred_features = [
            "Real-time 60fps video bounding-box tracking.",
            "Mobile app compilation for iOS and Android.",
            "Automated drone camera integration.",
            "GPS location tagging with cloud GIS mapping."
        ]
        plan_60min = [
            Plan60MinMilestone(
                time_window="Minutes 00-15",
                phase_title="Scaffolding & Model Download",
                objective="Set up FastAPI and load pre-trained MobileNet ONNX weights.",
                action_items=[
                    "Create project directory and install pillow, onnxruntime, fastapi.",
                    "Download pre-trained MobileNetV3 ONNX model (free, ~15MB).",
                    "Verify image loading and tensor transformation."
                ],
                deliverable="Script that feeds 1 local sample image into ONNX and prints top class index."
            ),
            Plan60MinMilestone(
                time_window="Minutes 15-30",
                phase_title="Inference & Output Mapping Pipeline",
                objective="Map model output indices to human-readable labels with confidence scores.",
                action_items=[
                    "Create class dictionary mapping index to name and guidance.",
                    "Apply softmax to output logits to obtain percentages.",
                    "Format top 3 results into JSON response."
                ],
                deliverable="Function `predict_image(file_bytes)` returning structured predictions."
            ),
            Plan60MinMilestone(
                time_window="Minutes 30-45",
                phase_title="Drag-and-Drop Web UI",
                objective="Build clean image upload interface with live preview.",
                action_items=[
                    "Create upload card with file input and drag-drop support.",
                    "Render immediate client-side preview via FileReader API.",
                    "Send multipart POST request to FastAPI backend."
                ],
                deliverable="Working web page where dropping an image displays classification bars in <200ms."
            ),
            Plan60MinMilestone(
                time_window="Minutes 45-60",
                phase_title="Edge Case Thresholding & Demo Check",
                objective="Test non-domain rejection and confirm demonstration script.",
                action_items=[
                    "Upload a blank image; verify threshold catches it.",
                    "Verify latency under 100ms on CPU.",
                    "Document 3 test photos for the live demonstration."
                ],
                deliverable="Robust prototype ready for peer challenge and workshop presentation."
            )
        ]
        immediate_action = "Collect 3 sample test photos (one healthy, one diseased/target, one blank/off-target) in a local folder."
        peer_prompt = "What photo condition (e.g. angle, lighting, mixed background) do you think would completely fool this model?"

    elif "placement" in text or "predict" in text or "tabular" in text or "data" in text:
        tech_foundation = {
            "frontend_rec": "Interactive Form with Instant Visual Feedback & Radar Chart",
            "backend_rec": "FastAPI (Python 3.11) with Scikit-learn Pipeline",
            "ai_model_rec": "RandomForest / GradientBoosting with SHAP Feature Attribution",
            "db_rec": "SQLite (Candidate input profiles and prediction logs)",
            "tech_reasoning": "Scikit-learn tree ensembles are transparent, deterministic, and explainable with zero GPU requirement.",
            "required_data": "Tabular dataset of historical campus placement records (GPA, branch, LeetCode solved count, internships, certifications)."
        }
        critical_assumption = (
            "Historical placement correlates reasonably with observable student academic and skill metrics, "
            "and predictions will be presented transparently as advisory skill benchmarks rather than guaranteed career outcomes."
        )
        failure_scenarios = [
            FailureScenario(
                test_id="TST-ML-01",
                test_name="Out-of-Bounds Input Boundary Test",
                what_is_tested="Submitting extreme values (e.g., GPA = 15.0 or negative backlog count).",
                why_it_matters="Invalid inputs corrupt model inferences and can crash numerical pipelines.",
                test_procedure="Submit edge-case payload: GPA 12.0, internships -3, projects 999.",
                expected_observation="Pydantic validation layer catches out-of-range fields with specific error messages.",
                acceptance_criteria="HTTP 422 returned with clear correction tips; no silent corrupted predictions.",
                remediation_plan="Enforce strict Pydantic `ge` and `le` constraints on all numerical fields."
            ),
            FailureScenario(
                test_id="TST-ML-02",
                test_name="Explainability Coherence Test",
                what_is_tested="Verifying that high-impact features (e.g., 0 projects vs 5 projects) produce sensible directionality in recommendations.",
                why_it_matters="A black-box prediction that says 'Your score dropped because you completed an internship' destroys user trust.",
                test_procedure="Run two identical profiles differing only in project count (0 vs 3). Compare feature contributions.",
                expected_observation="The profile with 3 projects receives higher readiness probability and positive project attribution.",
                acceptance_criteria="Feature contribution direction matches domain intuition across benchmark tests.",
                remediation_plan="Use constrained monotonic models or tree SHAP values to audit feature effect directions."
            )
        ]
        mvp_features = [
            "Structured 6-field web input form (GPA, Branch, Projects, Coding Problems, Internships, Certifications).",
            "Scikit-learn preprocessor with StandardScaler and OneHotEncoder.",
            "Prediction outcome (Readiness Tier: High, Moderate, Needs Preparation) with top 2 skill gaps.",
            "Clear ethical disclaimer regarding the advisory and educational nature of the prototype."
        ]
        deferred_features = [
            "Full automated resume PDF parser with OCR.",
            "Integration with LinkedIn / GitHub OAuth APIs.",
            "Company-specific interview scheduling portal.",
            "Salary negotiation AI simulator."
        ]
        plan_60min = [
            Plan60MinMilestone(
                time_window="Minutes 00-15",
                phase_title="Scaffolding & Data Pipeline",
                objective="Create FastAPI project and prepare synthetic or sample campus recruitment dataset.",
                action_items=[
                    "Set up virtual environment with pandas, scikit-learn, fastapi.",
                    "Load dataset and inspect feature distributions.",
                    "Train baseline Random Forest model and save pipeline with joblib."
                ],
                deliverable="Saved .joblib pipeline that takes a test dictionary and outputs probability."
            ),
            Plan60MinMilestone(
                time_window="Minutes 15-30",
                phase_title="API & Validation Layer",
                objective="Build POST /api/predict endpoint with strict Pydantic schemas.",
                action_items=[
                    "Define StudentProfile schema with field constraints.",
                    "Write inference handler extracting top feature importances.",
                    "Format response with category and specific skill recommendations."
                ],
                deliverable="FastAPI endpoint responding with structured readiness JSON in <20ms."
            ),
            Plan60MinMilestone(
                time_window="Minutes 30-45",
                phase_title="Interactive Web Form UI",
                objective="Build clean, responsive input form with instant visual score display.",
                action_items=[
                    "Create modern cards for profile entry with sliders and dropdowns.",
                    "Render readiness badge and skill-gap checklist dynamically.",
                    "Add prominent educational disclaimer badge."
                ],
                deliverable="Working web form delivering personalized skill-gap feedback."
            ),
            Plan60MinMilestone(
                time_window="Minutes 45-60",
                phase_title="Validation & Demo Rehearsal",
                objective="Run boundary tests and rehearse 60-second student walkthrough.",
                action_items=[
                    "Submit test cases with low and high preparation.",
                    "Verify UI error highlights on invalid inputs.",
                    "Prepare sample student profile for demonstration."
                ],
                deliverable="Verified working prototype ready for peer review and workshop conversion."
            )
        ]
        immediate_action = "Draft a list of 5 key input fields (e.g. GPA, LeetCode count) and define realistic min/max ranges for each."
        peer_prompt = "What unmeasured factor (e.g. communication skills, campus interview quotas) might invalidate this prediction?"

    else:
        # Default structured build contract for general applied AI project
        tech_foundation = {
            "frontend_rec": "Modern HTML5 / Tailwind CSS / Vanilla JS",
            "backend_rec": "FastAPI (Python 3.11) with Structured JSON Schemas",
            "ai_model_rec": "Heuristic Rule Ranker + Lightweight Scikit-Learn Model",
            "db_rec": "SQLite (Local storage)",
            "tech_reasoning": "Zero-dependency local stack that runs reliably on any operating system without cloud credentials.",
            "required_data": "Domain-specific input records or sample test files."
        }
        critical_assumption = (
            "The core problem logic can be encapsulated into deterministic rules and lightweight scoring heuristics "
            "before adding complex machine-learning dependencies."
        )
        failure_scenarios = [
            FailureScenario(
                test_id="TST-GEN-01",
                test_name="Empty & Malformed Input Handling",
                what_is_tested="Submitting empty payloads, whitespace-only strings, or corrupted JSON.",
                why_it_matters="Real users frequently submit unexpected inputs; the system must never crash with unhandled 500 errors.",
                test_procedure="Send POST requests with empty strings, 5000-character spam strings, and null fields.",
                expected_observation="FastAPI returns clean HTTP 422 validation errors detailing the exact violated field constraints.",
                acceptance_criteria="Zero 500 Internal Server Errors; 100% graceful validation responses.",
                remediation_plan="Enforce Pydantic validation schemas with min_length and max_length attributes."
            ),
            FailureScenario(
                test_id="TST-GEN-02",
                test_name="Performance Under Concurrent Requests",
                what_is_tested="Handling 10 rapid consecutive requests without deadlock.",
                why_it_matters="Demonstrations often involve rapid clicking or multiple evaluators testing simultaneously.",
                test_procedure="Execute automated loop of 10 requests within 2 seconds.",
                expected_observation="All requests succeed with response times under 200ms and no database locks.",
                acceptance_criteria="100% success rate under rapid local load.",
                remediation_plan="Use SQLite WAL mode and ensure database sessions close cleanly via FastAPI dependencies."
            )
        ]
        mvp_features = [
            "Single-purpose web workflow executing the primary task end-to-end.",
            "Server-side validation and structured error messaging.",
            "Visual output display with clear explanations and next steps."
        ]
        deferred_features = [
            "User accounts, password reset, and OAuth login.",
            "External third-party API integrations.",
            "Multi-language localization."
        ]
        plan_60min = [
            Plan60MinMilestone(
                time_window="Minutes 00-15",
                phase_title="Scaffolding & Configuration",
                objective="Initialize project structure, environment configuration, and database models.",
                action_items=["Create virtual environment.", "Define models and configuration.", "Verify server runs."],
                deliverable="FastAPI server running with /health returning 200 OK."
            ),
            Plan60MinMilestone(
                time_window="Minutes 15-30",
                phase_title="Core Logic Implementation",
                objective="Implement core processing rules and data transformation.",
                action_items=["Write core service functions.", "Implement input validation.", "Write unit test."],
                deliverable="Verified service returning correct output for sample input."
            ),
            Plan60MinMilestone(
                time_window="Minutes 30-45",
                phase_title="Web UI & API Integration",
                objective="Connect frontend templates to API routes.",
                action_items=["Build HTML form.", "Connect fetch API handler.", "Render result card."],
                deliverable="End-to-end working web experience in browser."
            ),
            Plan60MinMilestone(
                time_window="Minutes 45-60",
                phase_title="Verification & Polish",
                objective="Execute edge case tests and rehearse demonstration.",
                action_items=["Test edge cases.", "Add helpful validation hints.", "Prepare demo walkthrough."],
                deliverable="Polished prototype ready for review."
            )
        ]
        immediate_action = "Write down the single most important user input and the exact output you expect to deliver."
        peer_prompt = "What edge case or unexpected real-world condition would break this system on day one?"

    return {
        "contract_id": contract_id,
        "comparison_id": comparison_id,
        "project_title": title,
        "original_idea": description,
        "category": category,
        "difficulty": difficulty,
        "frontend_rec": tech_foundation["frontend_rec"],
        "backend_rec": tech_foundation["backend_rec"],
        "ai_model_rec": tech_foundation["ai_model_rec"],
        "db_rec": tech_foundation["db_rec"],
        "tech_reasoning": tech_foundation["tech_reasoning"],
        "required_data": tech_foundation["required_data"],
        "critical_assumption": critical_assumption,
        "failure_scenarios": failure_scenarios,
        "mvp_features": mvp_features,
        "deferred_features": deferred_features,
        "plan_60min": plan_60min,
        "immediate_action": immediate_action,
        "peer_challenge_prompt": peer_prompt,
        "analysis_mode": "rules_based",
        "referral_source": referral_source
    }

def process_peer_challenge_submission(
    contract_title: str,
    contract_category: str,
    critical_assumption: str,
    challenge_text: str,
    why_it_matters: str,
    improvement_suggestion: Optional[str] = None
) -> ImprovementRecommendation:
    """Analyzes a peer challenge and generates a structured improvement recommendation."""
    text = f"{challenge_text} {why_it_matters} {improvement_suggestion or ''}".lower()
    
    # Assess risk level
    if any(k in text for k in ["fail", "crash", "hallucinat", "bias", "security", "illegal", "false", "leak"]):
        risk = "High"
    elif any(k in text for k in ["slow", "glare", "accuracy", "edge case", "format", "missing", "confus"]):
        risk = "Moderate"
    else:
        risk = "Minor"

    # Generate structured adjustment
    new_test_id = f"TST-PEER-{uuid.uuid4().hex[:4].upper()}"
    new_failure_test = FailureScenario(
        test_id=new_test_id,
        test_name=f"Peer Stress Test: {challenge_text[:50]}...",
        what_is_tested=challenge_text[:200],
        why_it_matters=why_it_matters[:200],
        test_procedure=f"Inject simulated peer scenario into input handler and inspect behavior: '{challenge_text[:120]}'.",
        expected_observation="System detects anomaly gracefully without silent failure or crash.",
        acceptance_criteria="Deterministic fallback response triggered; system logs warning with diagnostic metadata.",
        remediation_plan=improvement_suggestion or "Implement explicit boundary validation and fallback admission of uncertainty."
    )

    scope_adj = (
        f"Incorporate an explicit boundary check for: '{challenge_text[:90]}...'. "
        f"Rather than attempting to silently guess an answer, add a structured fallback guardrail."
    )

    safeguard = (
        f"Architectural safeguard: Wrap the core pipeline in a validation filter. "
        f"If confidence or semantic similarity drops below threshold, return an honest 'Scenario Not Supported' response."
    )

    workshop_note = (
        "This challenge highlights exactly why building a fast 60-minute prototype matters: "
        "discovering this vulnerability before writing weeks of code saves you from complete project redesigns later!"
    )

    return ImprovementRecommendation(
        challenge_summary=challenge_text[:140],
        risk_level=risk,
        recommended_scope_adjustment=scope_adj,
        new_failure_test_added=new_failure_test,
        architectural_safeguard=safeguard,
        workshop_relevance=workshop_note
    )
