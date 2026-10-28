"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Share2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  RefreshCw,
  Ban,
  Sparkles,
  Zap,
  Target,
  ListChecks,
} from "lucide-react";
import { getContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const { success, error } = useToast();

  const [contract, setContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent("page_view_contract", { contract_id: contractId });

    async function loadContract() {
      try {
        setLoading(true);
        const data = await getContract(contractId);
        setContract(data);
      } catch (err: any) {
        // Fallback for demo contract if not found in db yet
        if (contractId === "bc_demo_rag") {
          setContract({
            contract_id: "bc_demo_rag",
            project_name: "Academic Document RAG Assistant",
            original_idea: "An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings.",
            archetype: "RAG_PIPELINE",
            category: "RAG & Document Intelligence",
            difficulty: "Intermediate",
            target_audience: "Research students & university faculty",
            critical_assumption: "Students will primarily query policies explicitly stated in the indexed PDF handbook, and will not demand real-time college portal authentication in Week 1.",
            failure_scenarios: [
              {
                test_id: "TST-RAG-01",
                test_name: "Out-of-Domain Hallucination Trap",
                what_is_tested: "How the model handles queries about rules not documented in the college handbook.",
                why_it_matters: "Hallucinating non-existent policies causes disciplinary issues and destroys student trust.",
                test_procedure: "Query the assistant with fabricated rules like 'Can students bring pets during exam week?'.",
                expected_observation: "Model recognizes missing context and outputs refusal rather than making up answers.",
                acceptance_criteria: "Strict fallback triggered; zero hallucinations on 10 out-of-domain queries.",
                remediation_plan: "Enforce cosine distance threshold (>0.45) with fallback prompt refusal template.",
              },
              {
                test_id: "TST-RAG-02",
                test_name: "Multi-Column PDF Table Mangling Test",
                what_is_tested: "Accuracy of text extraction from complex university grading circulars.",
                why_it_matters: "Mangled grade boundary numbers will provide wrong academic advice to students.",
                test_procedure: "Ingest a 2-column PDF containing SGPA/CGPA cut-off tables.",
                expected_observation: "Markdown table format preserved in vector chunks.",
                acceptance_criteria: "100% extraction accuracy on 5 test grade queries.",
                remediation_plan: "Use pdfplumber table extraction rather than raw unformatted text stream.",
              },
            ],
            mvp_features: [
              "FastAPI CPU-only backend embedding 5-page college regulation PDF.",
              "Cosine similarity top-3 chunk retrieval with source page citations.",
              "Clean browser-based chat interface with zero login barrier.",
            ],
            deferred_features: [
              "Multi-tenant user authentication and team workspace sharing.",
              "Payment gateway / subscription billing.",
              "Multi-lingual audio speech-to-text recognition.",
            ],
            plan_60min: [
              {
                time_window: "Min 00–15",
                phase_title: "Scaffold & Vector Store",
                objective: "Set up virtual environment, install FastAPI & sentence-transformers, parse sample PDF.",
                deliverable: "Working script loading 1 PDF into local in-memory embeddings.",
              },
              {
                time_window: "Min 15–30",
                phase_title: "Retrieval & Query Logic",
                objective: "Implement cosine similarity query endpoint returning top-3 text snippets.",
                deliverable: "Curl test verifying relevant chunks returned in <200ms.",
              },
              {
                time_window: "Min 30–45",
                phase_title: "LLM / Prompt Grounding",
                objective: "Feed retrieved snippets into lightweight generative endpoint with strict source citations.",
                deliverable: "Interactive answer with citation page numbers.",
              },
              {
                time_window: "Min 45–60",
                phase_title: "Stress Test & Verify",
                objective: "Run out-of-domain query test and verify graceful refusal template.",
                deliverable: "Zero-hallucination verified working prototype ready for demo.",
              },
            ],
            immediate_action: "Clone the starter template, create a Python 3.11 virtual environment, and install 'fastapi uvicorn sentence-transformers'.",
            peer_challenge_prompt: "Can you think of a tricky college regulation query that would cause this RAG assistant to quote wrong grading policies?",
            suggested_stack: {
              frontend: "Next.js 14 + Tailwind CSS",
              backend: "FastAPI + Pydantic v2",
              ai_model: "Sentence-Transformers (all-MiniLM-L6-v2) on CPU",
              database: "Local SQLite (Zero Cloud Costs)",
              tech_reasoning: "Runs 100% locally on standard student laptop CPU with zero paid API keys.",
              required_data: "Official college handbook PDF (free public access).",
            },
            challenges: [],
            created_at: new Date().toISOString(),
          });
        } else {
          error(err.message || "Failed to load contract");
        }
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [contractId]);

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    success("Contract link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 font-medium">Loading Build Contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 glass-card text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Contract Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Contract ID &quot;{contractId}&quot; could not be located in the database.
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          <span>Create New Comparison</span>
        </Link>
      </div>
    );
  }

  const stack = contract.suggested_stack || {};
  const failureScenarios = contract.failure_scenarios || [];
  const mvpFeatures = contract.mvp_features || [];
  const deferredFeatures = contract.deferred_features || contract.out_of_scope || [];
  const planMilestones = contract.plan_60min || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ⚡ Top Workshop Conversion Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              ⚡ Your Plan is Ready! Learn How to Build This in 60 Minutes
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Don&apos;t let this sit on paper. Join NxtWave&apos;s free live workshop to scaffold and deploy this exact prototype live.
            </p>
          </div>
        </div>
        <Link
          href={`/register?contract_id=${contract.contract_id || contractId}`}
          className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition active:scale-95 whitespace-nowrap"
        >
          <span>Register Free (₹0) →</span>
        </Link>
      </div>

      {/* Top Breadcrumb & Share Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:underline">Compare</Link>
          <span>/</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            {contract.contract_id || contractId}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={copyShareLink}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Link Copied" : "Share Contract"}</span>
          </button>

          <Link
            href={`/challenge/${contract.contract_id || contractId}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Break My Build 🛡️</span>
          </Link>
        </div>
      </div>

      {/* Main Official Build Contract Document */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-2xl relative space-y-8">
        {/* Document Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
                Official Engineering Document
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                48-Hour Sprint Build Contract
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CONTRACT LOCKED</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
              ID: {contract.contract_id || contractId}
            </span>
          </div>
        </div>

        {/* Project Title & Scope */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Archetype: {contract.archetype || "RAG_PIPELINE"}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              Target Audience: {contract.target_audience || "Engineering Students & Faculty"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {contract.project_name}
          </h1>
          {contract.original_idea && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/3 p-4 rounded-xl border border-slate-200/60 dark:border-white/5">
              <strong className="text-slate-900 dark:text-white">Project Concept: </strong>
              {contract.original_idea}
            </p>
          )}
        </div>

        {/* 1. ₹0 Tech Stack Recommendation */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-4 h-4" />
            <span>1. The ₹0 Local Execution Stack</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recommended Free Architecture (Runs on Standard Laptop)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frontend</span>
              <strong className="text-sm text-indigo-600 dark:text-indigo-400 block">{stack.frontend || "Next.js 14 + Tailwind CSS"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Backend</span>
              <strong className="text-sm text-blue-600 dark:text-blue-400 block">{stack.backend || "FastAPI + Pydantic v2"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">AI Model / Engine</span>
              <strong className="text-sm text-violet-600 dark:text-violet-400 block">{stack.ai_model || "Sentence-Transformers on CPU"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Database</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400 block">{stack.database || "Local SQLite (0₹ Cloud)"}</strong>
            </div>
          </div>
          {stack.tech_reasoning && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Architectural Rationale: </strong>
              {stack.tech_reasoning}
            </p>
          )}
        </div>

        {/* 2. Load-Bearing Technical Assumption (The Trap) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>2. The Load-Bearing Assumption (Single Point of Failure)</span>
          </div>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Critical Trap to Stress-Test Before Writing Code:
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{contract.critical_assumption}&rdquo;
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Why this matters:</strong> If this assumption proves false during professor viva review, the entire project collapses regardless of how pretty the UI looks.
            </p>
          </div>
        </div>

        {/* 3. Concrete Failure Tests (Proposed Tests - Not Yet Executed) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <ListChecks className="w-4 h-4 text-indigo-500" />
              <span>3. Proposed Technical Stress Tests</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Proposed Tests — Not Yet Executed
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Pre-Implementation Failure Verification Scenarios
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Execute these targeted technical stress-tests before writing weeks of application code.
          </p>

          <div className="space-y-4">
            {failureScenarios.map((test: any, i: number) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {test.test_id || `TST-${i + 1}`}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{test.test_name}</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">What is Tested:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.what_is_tested}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-rose-600 dark:text-rose-400 block mb-0.5">Why It Matters:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.why_it_matters}</span>
                  </div>
                  {test.test_procedure && (
                    <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Test Procedure:</strong>
                      <span className="text-slate-600 dark:text-slate-400">{test.test_procedure}</span>
                    </div>
                  )}
                  {test.acceptance_criteria && (
                    <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Acceptance Criteria:</strong>
                      <span className="text-slate-600 dark:text-slate-400">{test.acceptance_criteria}</span>
                    </div>
                  )}
                </div>
                {test.remediation_plan && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <strong className="text-amber-700 dark:text-amber-400">Remediation if Test Fails: </strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.remediation_plan}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Strict Scope Boundary (What to build vs What NOT to build) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Target className="w-4 h-4" />
            <span>4. Strict Scope Boundaries</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Minimum Viable Prototype Boundary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Essential MVP Features */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-3">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Essential MVP Features (Build in Week 1):</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {mvpFeatures.map((feat: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Out of Scope Features */}
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" />
                <span>Explicitly OUT OF SCOPE (Do NOT Build in 48h):</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {deferredFeatures.map((feat: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. The 60-Minute Prototype Plan (Four 15-Minute Milestones) */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>5. The 60-Minute Prototype Roadmap</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Four 15-Minute Milestones to a Deployable AI Prototype
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This is the exact progression covered live in NxtWave&apos;s free masterclass.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planMilestones.map((m: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {m.time_window || `Min ${i * 15}–${(i + 1) * 15}`}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.phase_title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.objective}</p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  <strong>Deliverable: </strong>{m.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 5-Minute Immediate Next Action */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>6. Immediate Next Action (Start in 5 Minutes)</span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Your Day-1 First Step:
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
              {contract.immediate_action}
            </p>
          </div>
        </div>

        {/* Feature 3: Viral "Break My Build" Arena Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Viral Peer Validation Loop (₹0 Ad Spend)
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Break My Build: Invite Classmates to Stress-Test This Plan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Share your unique link. When classmates submit edge-case flaws, Project Compass adds architectural safeguards.
              </p>
            </div>
            <Link
              href={`/challenge/${contract.contract_id || contractId}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/25 transition active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Open Challenge Arena 🛡️</span>
            </Link>
          </div>
        </div>

        {/* Bottom Workshop Call to Action */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Your plan is ready! Learn how to build this working prototype on your laptop in 60 minutes.
          </p>
          <Link
            href={`/register?contract_id=${contract.contract_id || contractId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition hover:scale-[1.02] active:scale-95"
          >
            <span>Register for Free AI Workshop (₹0)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
