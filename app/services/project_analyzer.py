import json
from typing import List, Dict, Any, Tuple
from app.schemas import (
    CandidateIdeaInput,
    ProjectComparisonRequest,
    ScoredProjectIdea,
    ProjectComparisonResponse
)
from app.scoring import score_candidate_idea, WEIGHTS_EXPLANATION

SAMPLE_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "sample_college_policy_rag",
        "title": "AI College-Policy QA Assistant",
        "category": "RAG & Document Intelligence",
        "domain": "AI/ML",
        "description": "An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings.",
        "difficulty": "Intermediate",
        "recommended_for": "Students with Python basics wanting practical NLP/RAG experience without paid API dependencies.",
        "default_constraints": {
            "experience": "intermediate",
            "languages": ["Python", "JavaScript"],
            "time_weeks": 4,
            "team_size": 2,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "college_project"
        },
        "strongest_reason": "High demo relevance: solves daily student confusion over PDF academic regulations with verifiable source citations.",
        "largest_risk": "Hallucination risk when students query rules not explicitly documented in the campus handbook.",
        "mvp_summary": "CLI or simple web UI indexing 3-5 key college regulation PDFs with sentence-transformers and exact passage quotes.",
        "recommended_stack": {
            "frontend": "HTML5 / Tailwind CSS / Vanilla JS",
            "backend": "FastAPI (Python 3.11)",
            "ai_engine": "ChromaDB + Sentence-Transformers (MiniLM-L6-v2) + Local Llama.cpp / Rule Ranker",
            "database": "SQLite (Session history and feedback)"
        },
        "technical_challenges": [
            "Parsing PDF tables and multi-column handbook layouts cleanly.",
            "Eliminating out-of-domain hallucinations by enforcing strict similarity cutoffs.",
            "Keeping vector indexing fast on standard dual-core laptops without GPU."
        ],
        "resource_constraints": [
            "Requires official college handbook PDFs (publicly available).",
            "RAM consumption for local embedding models (~500MB)."
        ]
    },
    {
        "id": "sample_plant_disease_cv",
        "title": "Plant Disease Image Classifier",
        "category": "Computer Vision & CNNs",
        "domain": "Computer Vision",
        "description": "A computer vision model that classifies crop leaf diseases from photos and suggests organic remediation steps.",
        "difficulty": "Beginner-Friendly",
        "recommended_for": "Students learning PyTorch or TensorFlow with pre-trained MobileNet transfer learning.",
        "default_constraints": {
            "experience": "beginner",
            "languages": ["Python"],
            "time_weeks": 3,
            "team_size": 1,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "portfolio"
        },
        "strongest_reason": "Visually striking demo with immediate real-world agricultural relevance.",
        "largest_risk": "Overfitting to clean lab backgrounds (PlantVillage dataset) while failing on messy real-world farm conditions.",
        "mvp_summary": "Web interface where users upload a leaf photo (3 classes: healthy, blight, rust) and see top-3 confidence scores.",
        "recommended_stack": {
            "frontend": "Drag-and-drop HTML5 + Vanilla JS preview",
            "backend": "FastAPI with Pillow image preprocessor",
            "ai_engine": "PyTorch / ONNX Runtime with MobileNetV3 (Transfer Learning)",
            "database": "SQLite (Classification logs and user feedback)"
        },
        "technical_challenges": [
            "Domain shift: lab photos vs camera glare, partial leaf occlusion, and shadows.",
            "Quantizing model weights to ONNX for sub-100ms inference on CPU.",
            "Distinguishing visually identical early-stage fungal vs bacterial spots."
        ],
        "resource_constraints": [
            "PlantVillage public dataset (free, ~800MB subset).",
            "No GPU required for ONNX inference; initial transfer learning on Google Colab free tier."
        ]
    },
    {
        "id": "sample_study_assistant_quiz",
        "title": "AI Study Assistant & Adaptive Quiz Generator",
        "category": "EdTech & Generative Learning",
        "domain": "NLP / EdTech",
        "description": "An automated study assistant that ingests lecture notes, extracts key concepts, and generates multiple-choice quizzes with instant reasoning feedback.",
        "difficulty": "Intermediate",
        "recommended_for": "Students interested in prompt engineering, text chunking, and deterministic quiz evaluation.",
        "default_constraints": {
            "experience": "intermediate",
            "languages": ["Python", "JavaScript"],
            "time_weeks": 4,
            "team_size": 2,
            "resources": ["laptop"],
            "primary_goal": "practical_problem"
        },
        "strongest_reason": "High peer utility; fellow classmates can test and use the quiz generator immediately.",
        "largest_risk": "Generating inaccurate distractor options or nonsensical quiz answers if input notes are fragmented.",
        "mvp_summary": "Paste text or upload 1 markdown lecture note; system produces 5 structured MCQs with validated correct answers.",
        "recommended_stack": {
            "frontend": "Minimalist interactive quiz UI with progress bar",
            "backend": "FastAPI with regex / spaCy keyphrase extractor",
            "ai_engine": "Deterministic Cloze/Distractor generator + optional HuggingFace T5-small / Local LLM",
            "database": "SQLite (Quiz banks and student attempt metrics)"
        },
        "technical_challenges": [
            "Distractor generation: creating plausible yet unambiguous wrong choices.",
            "Validating that generated answers are factually supported by provided lecture notes.",
            "Structuring question data into strict Pydantic JSON schemas."
        ],
        "resource_constraints": [
            "Runs entirely on standard laptop CPU.",
            "Zero paid API cost using local keyphrase extraction and templated generation."
        ]
    },
    {
        "id": "sample_waste_classifier_cv",
        "title": "Smart Waste Classification for Recycling",
        "category": "Computer Vision & Edge AI",
        "domain": "Computer Vision",
        "description": "An automated vision system that classifies recyclable vs organic waste items via webcam to assist campus green initiatives.",
        "difficulty": "Intermediate",
        "recommended_for": "Builders keen on computer vision and practical IoT or edge deployment.",
        "default_constraints": {
            "experience": "intermediate",
            "languages": ["Python"],
            "time_weeks": 5,
            "team_size": 3,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "college_project"
        },
        "strongest_reason": "Clear institutional appeal: campuses love sustainability and green tech project showcases.",
        "largest_risk": "Complex packaging (e.g., plastic bottle with paper label) confuses single-label classification.",
        "mvp_summary": "Live webcam capture classifying 4 categories: Plastic, Paper, Metal, Organic with visual bounding box.",
        "recommended_stack": {
            "frontend": "HTML5 WebRTC video stream + Canvas overlay",
            "backend": "FastAPI WebSocket streaming or REST snapshot endpoint",
            "ai_engine": "YOLOv8-Nano / MobileNet quantized for CPU inference",
            "database": "SQLite (Waste auditing statistics)"
        },
        "technical_challenges": [
            "Low-latency frame processing on standard laptops without frame lag.",
            "Handling crushed, folded, or semi-obscured waste items.",
            "Thresholding low confidence outputs to trigger 'Uncertain - Manual Inspection'."
        ],
        "resource_constraints": [
            "Kaggle TrashNet / TACO public datasets (free).",
            "Laptop built-in webcam."
        ]
    },
    {
        "id": "sample_placement_prediction_ml",
        "title": "Student Placement & Skill-Gap Recommendation Platform",
        "category": "Predictive Modeling & Tabular ML",
        "domain": "Data Science",
        "description": "A machine-learning model analyzing academic metrics, coding profiles, and internship history to predict placement readiness and recommend targeted skill courses.",
        "difficulty": "Beginner-Friendly",
        "recommended_for": "Students strong in statistics, pandas, and scikit-learn wanting measurable benchmark accuracy.",
        "default_constraints": {
            "experience": "beginner",
            "languages": ["Python", "SQL"],
            "time_weeks": 3,
            "team_size": 1,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "college_project"
        },
        "strongest_reason": "Deterministic evaluation: easy to compute precision, recall, feature importances, and SHAP explainability.",
        "largest_risk": "Small historical campus datasets can embed selection bias or correlate spurious features.",
        "mvp_summary": "Form collecting GPA, branch, projects, and LeetCode solved count; outputs placement readiness score + top 3 skill gaps.",
        "recommended_stack": {
            "frontend": "Modern responsive form with interactive radar chart",
            "backend": "FastAPI with Scikit-learn pipeline",
            "ai_engine": "RandomForest / XGBoost classifier with TreeExplainer (SHAP)",
            "database": "SQLite (Aggregated batch predictions)"
        },
        "technical_challenges": [
            "Preventing data leakage between training and validation splits.",
            "Converting black-box ML predictions into actionable human-readable advice.",
            "Explicitly disclaiming advisory nature to avoid misleading students."
        ],
        "resource_constraints": [
            "Campus placement tabular dataset or Kaggle Campus Recruitment dataset (free).",
            "Runs in under 2 seconds on standard CPU."
        ]
    }
]

def detect_category_and_difficulty(title: str, description: str, experience: str) -> Tuple[str, str]:
    """Infers category and estimated difficulty level from text and user background."""
    text = f"{title} {description}".lower()
    
    if any(k in text for k in ["rag", "policy", "handbook", "chatbot", "pdf", "retrieval", "document"]):
        cat = "RAG & Document Intelligence"
    elif any(k in text for k in ["plant", "leaf", "waste", "camera", "image", "yolo", "vision", "crop"]):
        cat = "Computer Vision & Edge AI"
    elif any(k in text for k in ["placement", "predict", "churn", "salary", "recommend", "fraud", "tabular"]):
        cat = "Predictive Modeling & Tabular ML"
    elif any(k in text for k in ["quiz", "exam", "study", "lecture", "flashcard", "education"]):
        cat = "EdTech & Generative Learning"
    elif any(k in text for k in ["automation", "scraper", "portal", "bot", "crawler"]):
        cat = "Intelligent Web Automation"
    else:
        cat = "Applied AI & Intelligent Software"
        
    # Difficulty
    if any(k in text for k in ["transformer from scratch", "gan", "realtime video", "lidar", "multimodal", "agi"]):
        diff = "Advanced"
    elif any(k in text for k in ["rag", "yolo", "webcam", "pipeline", "fine-tuning"]):
        diff = "Intermediate" if experience != "advanced" else "Intermediate"
    else:
        diff = "Beginner-Friendly" if experience == "beginner" else "Intermediate"
        
    return cat, diff

def generate_insights_for_project(
    title: str,
    description: str,
    category: str,
    difficulty: str,
    score: float,
    experience: str,
    languages: List[str],
    time_weeks: int,
    resources: List[str]
) -> Dict[str, Any]:
    """Generates structured engineering guidance for a candidate project."""
    text = f"{title} {description}".lower()
    
    # Check if this matches one of our rich sample projects closely
    for sample in SAMPLE_PROJECTS:
        if sample["title"].lower() in title.lower() or title.lower() in sample["title"].lower():
            return {
                "strongest_reason": sample["strongest_reason"],
                "largest_risk": sample["largest_risk"],
                "mvp_summary": sample["mvp_summary"],
                "recommended_stack": sample["recommended_stack"],
                "technical_challenges": sample["technical_challenges"],
                "resource_constraints": sample["resource_constraints"]
            }
            
    # Generic intelligent generation based on category heuristics
    if "Vision" in category:
        strongest = "High visual demonstration value; easily grabs attention during college project reviews."
        largest = "Dataset bias and real-world camera lighting variation causing accuracy drop outside clean test images."
        mvp = "A responsive web interface supporting single-image upload with top-3 classification confidence scores."
        stack = {
            "frontend": "HTML5 / Tailwind CSS / Vanilla JS",
            "backend": "FastAPI (Python 3.11)",
            "ai_engine": "MobileNetV3 / ResNet via PyTorch or ONNX Runtime",
            "database": "SQLite for audit logs"
        }
        challenges = [
            "Data augmentation to prevent overfitting on small training samples.",
            "Optimizing image resizing and preprocessing pipeline for sub-second inference."
        ]
        res_constraints = [
            "Curated dataset of at least 50-100 labeled images per class.",
            "Google Colab (free tier) for initial training, local CPU for runtime demo."
        ]
    elif "RAG" in category or "NLP" in category or "EdTech" in category:
        strongest = "Direct problem solver: turns unstructured text into actionable, conversational answers."
        largest = "Hallucination and unsupported extrapolation when users query topics absent from reference materials."
        mvp = "Ingest 3-5 markdown or PDF documents, embed into a lightweight vector store, and return grounded answers with exact source snippets."
        stack = {
            "frontend": "HTML5 / Vanilla JS minimal chat interface",
            "backend": "FastAPI (Python 3.11)",
            "ai_engine": "Sentence-Transformers (all-MiniLM-L6-v2) + ChromaDB / SQLite FTS5",
            "database": "SQLite for session storage"
        }
        challenges = [
            "Splitting documents into semantically coherent chunks (250-400 words) with overlap.",
            "Rejecting out-of-scope questions with a polite, deterministic 'Information not found' response."
        ]
        res_constraints = [
            "Source documents in text/PDF format.",
            "Standard laptop CPU (no external paid API required)."
        ]
    elif "Predictive" in category or "Tabular" in category:
        strongest = "Clear, measurable evaluation criteria (Accuracy, Precision, Recall, ROC-AUC) that evaluators respect."
        largest = "Feature imbalance or small sample sizes yielding high apparent accuracy that fails on unseen real inputs."
        mvp = "Clean input web form predicting the outcome class with feature importance graphs and plain-text rationales."
        stack = {
            "frontend": "HTML5 / CSS form with dynamic chart visualization",
            "backend": "FastAPI (Python 3.11)",
            "ai_engine": "Scikit-Learn (RandomForestClassifier / LogisticRegression)",
            "database": "SQLite for storing evaluation records"
        }
        challenges = [
            "Proper handling of missing values, categorical encoding, and feature scaling.",
            "Transparent explanation of model decisions without deceptive precision."
        ]
        res_constraints = [
            "CSV or SQL dataset with at least 500-1000 historic records.",
            "Runs on any standard PC in seconds."
        ]
    else:
        strongest = "Flexible engineering scope that demonstrates full-stack software integration with applied intelligence."
        largest = "Scope creep: trying to build too many tangential features instead of mastering the core technical workflow."
        mvp = "A single-screen prototype executing the primary user task end-to-end with verified input validation."
        stack = {
            "frontend": "HTML5 / CSS / Vanilla JS",
            "backend": "FastAPI (Python 3.11)",
            "ai_engine": "Rule-based heuristic engine or Scikit-learn estimator",
            "database": "SQLite"
        }
        challenges = [
            "Defining strict boundary conditions between prototype MVP and deferred scope.",
            "Building robust automated test coverage for core edge cases."
        ]
        res_constraints = [
            "Standard development workstation.",
            "Zero paid services or licenses."
        ]
        
    return {
        "strongest_reason": strongest,
        "largest_risk": largest,
        "mvp_summary": mvp,
        "recommended_stack": stack,
        "technical_challenges": challenges,
        "resource_constraints": res_constraints
    }

def analyze_and_rank_candidates(request: ProjectComparisonRequest) -> ProjectComparisonResponse:
    """Compares all candidate project ideas against student constraints, producing ranked scores."""
    import uuid
    from datetime import datetime
    
    scored_list: List[ScoredProjectIdea] = []
    
    for idea in request.candidates:
        composite_score, criteria, explanation = score_candidate_idea(
            idea=idea,
            domain=request.domain,
            experience=request.experience,
            languages=request.languages,
            time_weeks=request.time_weeks,
            team_size=request.team_size,
            resources=request.resources,
            primary_goal=request.primary_goal
        )
        
        category, difficulty = detect_category_and_difficulty(idea.title, idea.description, request.experience)
        
        insights = generate_insights_for_project(
            title=idea.title,
            description=idea.description,
            category=category,
            difficulty=difficulty,
            score=composite_score,
            experience=request.experience,
            languages=request.languages,
            time_weeks=request.time_weeks,
            resources=request.resources
        )
        
        scored_list.append(ScoredProjectIdea(
            title=idea.title,
            description=idea.description,
            category=category,
            difficulty=difficulty,
            composite_score=composite_score,
            rank=0,  # will update after sort
            is_best_fit=False,
            criteria=criteria,
            score_explanation=explanation,
            strongest_reason=insights["strongest_reason"],
            largest_risk=insights["largest_risk"],
            mvp_summary=insights["mvp_summary"],
            recommended_stack=insights["recommended_stack"],
            technical_challenges=insights["technical_challenges"],
            resource_constraints=insights["resource_constraints"]
        ))
        
    # Sort descending by composite score
    scored_list.sort(key=lambda x: x.composite_score, reverse=True)
    
    # Assign ranks and mark best fit
    for idx, item in enumerate(scored_list):
        item.rank = idx + 1
        item.is_best_fit = (idx == 0)
        
    comparison_id = f"cmp_{uuid.uuid4().hex[:10]}"
    
    return ProjectComparisonResponse(
        comparison_id=comparison_id,
        best_fit_index=0,
        recommended_project=scored_list[0],
        all_scored_projects=scored_list,
        scoring_weights_explanation=WEIGHTS_EXPLANATION,
        created_at=datetime.utcnow()
    )

