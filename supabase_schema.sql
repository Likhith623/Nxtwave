-- ==============================================================================
-- PROJECT COMPASS: COMPLETE SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- NxtWave Growth Intern Challenge | 48-Hour Build | Supabase Database Setup
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/hoahamrnxwyzrqyrskzh
-- 2. Click on "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run" (or Ctrl + Enter).
-- ==============================================================================

-- 1. CLEANUP (Optional reset: drops existing tables if re-running)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS workshop_registrations CASCADE;
DROP TABLE IF EXISTS peer_challenges CASCADE;
DROP TABLE IF EXISTS build_contracts CASCADE;
DROP TABLE IF EXISTS project_comparisons CASCADE;

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Table: project_comparisons
CREATE TABLE project_comparisons (
    id SERIAL PRIMARY KEY,
    comparison_id VARCHAR(64) UNIQUE NOT NULL,
    domain VARCHAR(64) NOT NULL,
    experience VARCHAR(32) NOT NULL,
    languages VARCHAR(256) NOT NULL,
    time_weeks INTEGER NOT NULL DEFAULT 4,
    team_size INTEGER NOT NULL DEFAULT 1,
    resources VARCHAR(256) NOT NULL,
    primary_goal VARCHAR(64) NOT NULL,
    candidates_json TEXT NOT NULL,
    results_json TEXT NOT NULL,
    recommended_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: build_contracts
CREATE TABLE build_contracts (
    id SERIAL PRIMARY KEY,
    contract_id VARCHAR(64) UNIQUE NOT NULL,
    comparison_id VARCHAR(64),
    project_title VARCHAR(256) NOT NULL,
    original_idea TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    difficulty VARCHAR(32) NOT NULL,
    frontend_rec VARCHAR(128) NOT NULL,
    backend_rec VARCHAR(128) NOT NULL,
    ai_model_rec VARCHAR(128) NOT NULL,
    db_rec VARCHAR(128) NOT NULL,
    tech_reasoning TEXT NOT NULL,
    required_data TEXT NOT NULL,
    critical_assumption TEXT NOT NULL,
    failure_scenarios_json TEXT NOT NULL,
    mvp_features_json TEXT NOT NULL,
    deferred_features_json TEXT NOT NULL,
    plan_60min_json TEXT NOT NULL,
    immediate_action TEXT NOT NULL,
    peer_challenge_prompt TEXT NOT NULL,
    analysis_mode VARCHAR(32) DEFAULT 'rules_based',
    referral_source VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: peer_challenges (Break My Build feature)
CREATE TABLE peer_challenges (
    id SERIAL PRIMARY KEY,
    challenge_id VARCHAR(64) UNIQUE NOT NULL,
    contract_id VARCHAR(64) NOT NULL REFERENCES build_contracts(contract_id) ON DELETE CASCADE,
    peer_name VARCHAR(128) DEFAULT 'Anonymous Peer',
    challenge_text TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    improvement_suggestion TEXT,
    status VARCHAR(32) DEFAULT 'processed',
    improvement_recommendation_json TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: workshop_registrations
CREATE TABLE workshop_registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(256) NOT NULL,
    phone VARCHAR(32),
    referral_source VARCHAR(128),
    contract_id VARCHAR(64),
    utm_source VARCHAR(64),
    utm_medium VARCHAR(64),
    utm_campaign VARCHAR(64),
    is_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: analytics_events
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(64) UNIQUE NOT NULL,
    event_name VARCHAR(64) NOT NULL,
    contract_id VARCHAR(64),
    utm_source VARCHAR(64),
    utm_medium VARCHAR(64),
    utm_campaign VARCHAR(64),
    ref VARCHAR(128),
    session_id VARCHAR(64),
    ip_hash VARCHAR(64),
    metadata_json TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CREATE PERFORMANCE & ATTRIBUTION INDEXES
-- ==============================================================================

CREATE INDEX idx_project_comparisons_comp_id ON project_comparisons(comparison_id);
CREATE INDEX idx_project_comparisons_created ON project_comparisons(created_at);

CREATE INDEX idx_build_contracts_contract_id ON build_contracts(contract_id);
CREATE INDEX idx_build_contracts_comp_id ON build_contracts(comparison_id);
CREATE INDEX idx_build_contracts_created ON build_contracts(created_at);

CREATE INDEX idx_peer_challenges_contract_id ON peer_challenges(contract_id);
CREATE INDEX idx_peer_challenges_created ON peer_challenges(created_at);

CREATE INDEX idx_workshop_registrations_email ON workshop_registrations(email);
CREATE INDEX idx_workshop_registrations_contract ON workshop_registrations(contract_id);
CREATE INDEX idx_workshop_registrations_created ON workshop_registrations(created_at);

CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_contract ON analytics_events(contract_id);
CREATE INDEX idx_analytics_events_source ON analytics_events(utm_source);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
-- Allows public anonymous access for student workflow without forcing student logins

ALTER TABLE project_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert on project_comparisons
CREATE POLICY "Public can insert comparisons" ON project_comparisons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read comparisons" ON project_comparisons FOR SELECT USING (true);

-- Allow public read & insert on build_contracts
CREATE POLICY "Public can insert build contracts" ON build_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read build contracts" ON build_contracts FOR SELECT USING (true);

-- Allow public read & insert on peer_challenges
CREATE POLICY "Public can insert peer challenges" ON peer_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read peer challenges" ON peer_challenges FOR SELECT USING (true);

-- Allow public read & insert on workshop_registrations
CREATE POLICY "Public can insert registrations" ON workshop_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read registrations" ON workshop_registrations FOR SELECT USING (true);

-- Allow public read & insert on analytics_events
CREATE POLICY "Public can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read analytics events" ON analytics_events FOR SELECT USING (true);

-- ==============================================================================
-- 5. SEED PRESENTATION BASELINE RECORDS
-- ==============================================================================

-- 5.1 Sample Comparison
INSERT INTO project_comparisons (
    comparison_id, domain, experience, languages, time_weeks, team_size, resources, primary_goal, candidates_json, results_json, recommended_index
) VALUES (
    'cmp_demo_01',
    'AI/ML',
    'intermediate',
    'Python, JavaScript',
    4,
    2,
    'laptop, public dataset',
    'college_project',
    '[{"title": "AI College Policy Bot", "description": "RAG handbook assistant for college academic regulations."}]',
    '[{"title": "AI College Policy Bot", "composite_score": 88.5, "rank": 1, "is_best_fit": true}]',
    0
);

-- 5.2 Sample Build Contract
INSERT INTO build_contracts (
    contract_id, comparison_id, project_title, original_idea, category, difficulty,
    frontend_rec, backend_rec, ai_model_rec, db_rec, tech_reasoning, required_data,
    critical_assumption, failure_scenarios_json, mvp_features_json, deferred_features_json,
    plan_60min_json, immediate_action, peer_challenge_prompt, referral_source
) VALUES (
    'bc_demo_rag',
    'cmp_demo_01',
    'AI College-Policy QA Assistant',
    'An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings.',
    'RAG & Document Intelligence',
    'Intermediate',
    'HTML5 / Vanilla JS Chat',
    'FastAPI (Python 3.11)',
    'Sentence-Transformers (all-MiniLM-L6-v2) + SQLite FTS5',
    'SQLite (Local chunk index & logs)',
    'Sentence-Transformers runs at 50ms latency on CPU without GPU or paid OpenAI API costs. SQLite handles vectors and query logs locally.',
    '3 to 5 official college PDF policy documents (academic handbook, exam regulations, hostel rules). Clean text extraction via PyPDF/pdfplumber.',
    'Students will primarily ask questions whose factual answers are explicitly stated within the indexed college handbook, and queries outside this document set will be gracefully admitted as unanswerable.',
    '[{"test_id": "TST-RAG-01", "test_name": "Out-of-Domain Hallucination Trap", "what_is_tested": "System response when asked about a topic non-existent in college documents.", "why_it_matters": "If the model fabricates policy details, students will take real-world academic actions based on false information.", "test_procedure": "Send 5 known unindexed queries via API endpoint.", "expected_observation": "System detects low semantic similarity and outputs standard admission of uncertainty.", "acceptance_criteria": "100% of out-of-scope questions return unanswerable notice with zero speculative claims.", "remediation_plan": "Implement a strict semantic distance ceiling before model generation."}, {"test_id": "TST-RAG-02", "test_name": "Contradictory Policy Precedence Test", "what_is_tested": "Querying an attendance clause amended in 2026 vs older 2023 rule.", "why_it_matters": "Colleges update circulars regularly; serving superseded rules causes official administrative disputes.", "test_procedure": "Index both old regulations and new circular.", "expected_observation": "Retriever ranks newer circular higher and clearly cites circular date.", "acceptance_criteria": "System includes document publication date in metadata citation.", "remediation_plan": "Add metadata filtering to chunk schemas (doc_year) and sort candidates by recency."}]',
    '["Document ingestion script converting 3 sample college PDFs into chunked text with metadata.", "Embedding generation using local Sentence-Transformers (MiniLM).", "Single-query search endpoint returning top 3 matching source passages.", "Minimalist responsive web chat UI displaying answers with expandable citations."]',
    '["User login / authentication system (unnecessary for MVP demo).", "Multi-modal image/diagram scanning in scanned documents.", "Voice-to-text integration or automated WhatsApp chatbot deployment."]',
    '[{"time_window": "Minutes 00-15", "phase_title": "Project Scaffolding & PDF Extraction", "objective": "Set up project directory and extract clean text from 1 college handbook PDF.", "action_items": ["Initialize virtual environment.", "Extract text from 5 pages of college rules.", "Split text into 300-word chunks."], "deliverable": "Working script that outputs list of chunks with page numbers."}, {"time_window": "Minutes 15-30", "phase_title": "Local Embedding & Similarity Engine", "objective": "Generate embeddings for document chunks and build cosine similarity search.", "action_items": ["Load all-MiniLM-L6-v2 model.", "Embed chunks and compute dot-product similarity.", "Set similarity threshold."], "deliverable": "Function search_handbook(query) returning top-3 relevant passages."}, {"time_window": "Minutes 30-45", "phase_title": "FastAPI Endpoint & Web UI Connection", "objective": "Wrap search logic into REST endpoint and hook up clean single-page chat UI.", "action_items": ["Create POST /api/ask endpoint.", "Serve Jinja2 HTML page.", "Display retrieved passages with collapsible source citations."], "deliverable": "Interactive browser chat returning grounded handbook text."}, {"time_window": "Minutes 45-60", "phase_title": "Stress Test Verification & Demo Rehearsal", "objective": "Execute Out-of-Domain failure test and prepare 60-second live walkthrough.", "action_items": ["Test with 1 valid question and 1 fake question.", "Verify the system politely declines to answer fake question.", "Record response latency."], "deliverable": "Verified working prototype ready for peer review."}]',
    'Download 1 official college regulation PDF and verify you can extract text from page 1 using Python.',
    'What tricky edge-case question would a mischievous student ask that might trick this assistant into giving a false or misleading policy guarantee?',
    'campus_club_whatsapp'
);

-- 5.3 Sample Peer Challenge
INSERT INTO peer_challenges (
    challenge_id, contract_id, peer_name, challenge_text, why_it_matters, improvement_suggestion, status, improvement_recommendation_json
) VALUES (
    'ch_demo_01',
    'bc_demo_rag',
    'Arjun (Final Year CSE)',
    'What happens if a student asks about fee refund rules that are only on a separate administrative circular not yet indexed?',
    'Giving wrong fee advice causes serious financial headaches and administrative disputes for students.',
    'Add an explicit Circular date and coverage badge to every answer, with an honest fallback if financial keywords appear.',
    'processed',
    '{"challenge_summary": "Fee refund circular coverage gap", "risk_level": "High", "recommended_scope_adjustment": "Add explicit disclaimer when querying financial or fee topics.", "architectural_safeguard": "Implement strict distance threshold and circular date filtering.", "workshop_relevance": "Key architectural insight on setting clear AI domain boundaries."}'
);

-- 5.4 Sample Workshop Registration
INSERT INTO workshop_registrations (
    registration_id, name, email, phone, referral_source, contract_id, utm_source, utm_medium, utm_campaign, is_demo
) VALUES (
    'reg_demo_01',
    'Priya Sharma',
    'priya.demo@engineering.edu',
    '+91 98765 43210',
    'campus_club_whatsapp',
    'bc_demo_rag',
    'campus_club',
    'whatsapp',
    'growth_challenge',
    TRUE
);

-- 5.5 Sample Analytics Events
INSERT INTO analytics_events (event_name, contract_id, utm_source, utm_medium, utm_campaign) VALUES
    ('page_view', NULL, 'campus_club', 'whatsapp', 'growth_challenge'),
    ('comparison_completed', NULL, 'campus_club', 'whatsapp', 'growth_challenge'),
    ('build_contract_created', 'bc_demo_rag', 'campus_club', 'whatsapp', 'growth_challenge'),
    ('workshop_cta_clicked', 'bc_demo_rag', 'campus_club', 'whatsapp', 'growth_challenge'),
    ('registration_completed', 'bc_demo_rag', 'campus_club', 'whatsapp', 'growth_challenge');

-- ==============================================================================
-- END OF SCRIPT. All tables, indexes, RLS policies, and seed data created.
-- ==============================================================================
