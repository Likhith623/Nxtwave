"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Cpu,
  RefreshCw,
  Ban,
  Sparkles,
  Target,
  ListChecks,
  Share2,
} from "lucide-react";
import { getContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface PieStep {
  step: number;
  title: string;
  minutes: number;
  window: string;
  color: string;
  category: string;
  what_you_do: string;
  deliverable: string;
}

const CLASSIC_5_SLICES: PieStep[] = [
  {
    step: 1,
    title: "Setup & env",
    minutes: 10,
    window: "Min 00-10",
    color: "#4f46e5",
    category: "Setup & Environment",
    what_you_do: "Create Python venv, install FastAPI + local CPU dependencies, and verify setup.",
    deliverable: "Verified local environment running at ₹0 cloud cost.",
  },
  {
    step: 2,
    title: "Data & ingest",
    minutes: 15,
    window: "Min 10-25",
    color: "#6366f1",
    category: "Data & Ingestion",
    what_you_do: "Load sample dataset/PDF, clean records, and build local embeddings/index.",
    deliverable: "Indexed local dataset ready for sub-200ms queries.",
  },
  {
    step: 3,
    title: "Core AI logic",
    minutes: 10,
    window: "Min 25-35",
    color: "#818cf8",
    category: "Core AI Pipeline",
    what_you_do: "Wire inference/retrieval pipeline with strict confidence threshold & fallback.",
    deliverable: "Core inference function passing unit sanity check.",
  },
  {
    step: 4,
    title: "UI & wire-up",
    minutes: 15,
    window: "Min 35-50",
    color: "#10b981",
    category: "Interactive UI",
    what_you_do: "Connect FastAPI endpoint to interactive frontend UI for live viva demo.",
    deliverable: "End-to-end interactive UI responding in real time.",
  },
  {
    step: 5,
    title: "Test & demo",
    minutes: 10,
    window: "Min 50-60",
    color: "#f59e0b",
    category: "Stress-Test & Demo",
    what_you_do: "Execute the failure test scripts and record a 60-second demo walkthrough.",
    deliverable: "Viva-ready prototype verified against edge-case traps.",
  },
];

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
  const [pieMode, setPieMode] = useState<"detailed" | "classic5">("detailed");
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_contract", { contract_id: contractId });

    async function loadContract() {
      try {
        setLoading(true);
        const data = await getContract(contractId);
        setContract(data);
      } catch (err: any) {
        if (contractId === "bc_demo_rag") {
          setContract({
            contract_id: "bc_demo_rag",
            project_name: "Academic Document RAG Assistant",
            original_idea:
              "An interactive chatbot grounded in college academic regulations, exam rules, and attendance policies using document retrieval (RAG) and open-source embeddings.",
            archetype: "RAG_PIPELINE",
            category: "RAG & Document Intelligence",
            difficulty: "Intermediate",
            feasibility_score: 88,
            target_audience: "Research students & university faculty",
            critical_assumption:
              "What happens when someone asks an unlisted question? Students will primarily query policies explicitly stated in the indexed PDF handbook, and the pipeline must refuse out-of-domain questions.",
            failure_scenarios: [
              {
                test_id: "TST-RAG-01",
                test_name: "Out-of-Domain Hallucination Trap",
                what_is_tested:
                  "How the model handles queries about rules not documented in the college handbook.",
                why_it_matters:
                  "Hallucinating non-existent policies causes disciplinary issues and destroys student trust.",
                test_procedure:
                  "Query the assistant with fabricated rules like 'Can students bring pets during exam week?'.",
                expected_observation:
                  "Model recognizes missing context and outputs refusal rather than making up answers.",
                acceptance_criteria:
                  "Strict fallback triggered; zero hallucinations on 10 out-of-domain queries.",
                remediation_plan:
                  "Enforce cosine distance threshold (>0.45) with fallback prompt refusal template.",
              },
              {
                test_id: "TST-RAG-02",
                test_name: "Multi-Column PDF Table Mangling Test",
                what_is_tested:
                  "Accuracy of text extraction from complex university grading circulars.",
                why_it_matters:
                  "Mangled grade boundary numbers will provide wrong academic advice to students.",
                test_procedure:
                  "Ingest a 2-column PDF containing SGPA/CGPA cut-off tables.",
                expected_observation:
                  "Markdown table format preserved in vector chunks.",
                acceptance_criteria:
                  "100% extraction accuracy on 5 test grade queries.",
                remediation_plan:
                  "Use pdfplumber table extraction rather than raw unformatted text stream.",
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
                time_window: "Minutes 00-15",
                phase_title: "Scaffold & Vector Store",
                objective:
                  "Set up virtual environment, install FastAPI & sentence-transformers, parse sample PDF.",
                deliverable:
                  "Working script loading 1 PDF into local in-memory embeddings.",
              },
              {
                time_window: "Minutes 15-30",
                phase_title: "Retrieval & Query Logic",
                objective:
                  "Implement cosine similarity query endpoint returning top-3 text snippets.",
                deliverable:
                  "Curl test verifying relevant chunks returned in <200ms.",
              },
              {
                time_window: "Minutes 30-45",
                phase_title: "LLM / Prompt Grounding",
                objective:
                  "Feed retrieved snippets into lightweight generative endpoint with strict source citations.",
                deliverable: "Interactive answer with citation page numbers.",
              },
              {
                time_window: "Minutes 45-60",
                phase_title: "Stress Test & Verify",
                objective:
                  "Run out-of-domain query test and verify graceful refusal template.",
                deliverable:
                  "Zero-hallucination verified working prototype ready for demo.",
              },
            ],
            immediate_action:
              "Clone the starter template, create a Python 3.11 virtual environment, and install 'fastapi uvicorn sentence-transformers'.",
            peer_challenge_prompt:
              "Can you think of a tricky college regulation query that would cause this RAG assistant to quote wrong grading policies?",
            suggested_stack: {
              frontend: "Next.js 14 + Tailwind CSS",
              backend: "FastAPI + Pydantic v2",
              ai_model: "Sentence-Transformers (all-MiniLM-L6-v2) on CPU",
              database: "Local SQLite / ChromaDB (Zero Cloud Costs)",
              tech_reasoning:
                "Runs 100% locally on standard student laptop CPU with zero paid API keys.",
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

  const detailedSlices: PieStep[] =
    contract?.plan_60min_detailed && contract.plan_60min_detailed.length > 0
      ? contract.plan_60min_detailed
      : CLASSIC_5_SLICES;

  const activeSlices = pieMode === "classic5" ? CLASSIC_5_SLICES : detailedSlices;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSlices.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 380;
    const h = 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 10;
    const rx = 135;
    const ry = 102;
    const depth = 22;
    const total = activeSlices.reduce((acc, s) => acc + Number(s.minutes || 0), 0) || 60;

    let startAngle = -Math.PI / 2;
    const computed = activeSlices.map((s, idx) => {
      const sweep = (Number(s.minutes || 0) / total) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const midAngle = startAngle + sweep / 2;
      const item = { ...s, idx, startAngle, endAngle, midAngle };
      startAngle = endAngle;
      return item;
    });

    // Draw 3D extruded walls
    for (let layer = depth; layer >= 1; layer--) {
      computed.forEach((s) => {
        const isHovered = activeSlice === s.idx;
        const ox = isHovered ? Math.cos(s.midAngle) * 8 : 0;
        const oy = isHovered ? Math.sin(s.midAngle) * 6 : 0;
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy + layer, rx, ry, 0, s.startAngle, s.endAngle);
        ctx.lineTo(cx + ox, cy + oy + layer);
        ctx.closePath();
        ctx.fillStyle = "#1e1b4b";
        ctx.fill();
      });
    }

    // Draw top faces + labels
    computed.forEach((s) => {
      const isHovered = activeSlice === s.idx;
      const ox = isHovered ? Math.cos(s.midAngle) * 8 : 0;
      const oy = isHovered ? Math.sin(s.midAngle) * 6 : 0;
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, s.startAngle, s.endAngle);
      ctx.lineTo(cx + ox, cy + oy);
      ctx.closePath();
      ctx.fillStyle = s.color || "#6366f1";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0b1020";
      ctx.stroke();

      const lx = cx + ox + Math.cos(s.midAngle) * (rx * 0.66);
      const ly = cy + oy + Math.sin(s.midAngle) * (ry * 0.66);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${s.minutes}m`, lx, ly);
    });

    // Inner hub
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.34, ry * 0.34, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(99,102,241,0.5)";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("60 MIN", cx, cy - 5);
    ctx.fillStyle = "#34d399";
    ctx.font = "700 9px monospace";
    ctx.fillText("TOTAL PLAN", cx, cy + 10);
  }, [activeSlices, activeSlice, pieMode]);

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    success("Contract link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const shareToWhatsApp = () => {
    const url = window.location.href;
    const title = contract?.project_name || contract?.project_title || "My AI Project";
    const score = contract?.feasibility_score || 88;
    const text = `Hey! My final-year AI project "${title}" scored ${score}/100 on Project Compass 🎯\n\nCheck out my 60-minute build plan, try to break my build, or use this document as context for your own idea:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 font-medium">Loading 60-Minute Build Plan...</p>
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
  const projectTitle = contract.project_name || contract.project_title || "AI Build Plan";
  const feasibilityScore = contract.feasibility_score || 88;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500 mb-1">
            02 / THE 60-MINUTE BUILD PLAN · STEP 2 OF 4
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/compare" className="hover:underline">Compare</Link>
            <span>/</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {contract.contract_id || contractId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <a
            href="#pieChartSection"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
          >
            <span>🥧 60-Min Pie Chart</span>
          </a>
          <button
            onClick={shareToWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share to WhatsApp</span>
          </button>
          <Link
            href={`/compare?from_contract=${contract.contract_id || contractId}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <span>🔄 Remix With Context</span>
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
                Complete Technical Blueprint · Score {feasibilityScore}/100
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {projectTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>60-MIN PLAN LOCKED</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
              ID: {contract.contract_id || contractId}
            </span>
          </div>
        </div>

        {/* 1. The ₹0 Tech Stack */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-4 h-4" />
            <span>1. The ₹0 Tech Stack (Everything Required to Build)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frontend UI</span>
              <strong className="text-sm text-indigo-600 dark:text-indigo-400 block">{stack.frontend || "Next.js 14 / Streamlit"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Backend API</span>
              <strong className="text-sm text-blue-600 dark:text-blue-400 block">{stack.backend || "FastAPI + Pydantic v2"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">AI Model / Engine</span>
              <strong className="text-sm text-violet-600 dark:text-violet-400 block">{stack.ai_model || "Sentence-Transformers on CPU"}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Database</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400 block">{stack.database || "Local ChromaDB / SQLite (₹0)"}</strong>
            </div>
          </div>
        </div>

        {/* 2. Load-Bearing Assumption */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>2. The &ldquo;Load-Bearing Assumption&rdquo; (Single Point of Failure &amp; Key Limitation)</span>
          </div>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{contract.critical_assumption || contract.load_bearing_assumption}&rdquo;
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Key Limitation:</strong> If this assumption fails during your college viva and you have no fallback threshold, the project fails review.
            </p>
          </div>
        </div>

        {/* 3. Concrete Failure Tests */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <ListChecks className="w-4 h-4 text-indigo-500" />
              <span>3. Concrete Failure Tests</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Proposed Tests — Not Yet Executed
            </span>
          </div>
          <div className="space-y-4">
            {failureScenarios.map((test: any, i: number) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {test.test_id || `TST-0${i + 1}`}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{test.test_name || test.title}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">1. What to Test:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.what_is_tested || test.what_to_test}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">2. What to Expect:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.expected_observation || test.what_to_expect}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">3. Acceptance Criteria:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.acceptance_criteria}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/5">
                    <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">4. How to Fix It:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{test.remediation_plan || test.how_to_fix_it}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Strict Scope Boundary */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Target className="w-4 h-4" />
            <span>4. Strict Scope Boundary (What NOT to Build in Week 1)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-3">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Essential MVP Features (Build Now):</span>
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

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" />
                <span>DO NOT Build in Week 1:</span>
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

        {/* 5. The 60-Minute Prototype Plan */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>5. The 60-Minute Prototype Plan (Four 15-Minute Milestones)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planMilestones.map((m: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {m.time_window || `Minutes ${i * 15}-${(i + 1) * 15}`}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.phase_title || m.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.objective || m.task}</p>
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
            <span>6. 5-Minute Immediate Next Action</span>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
              {contract.immediate_action}
            </p>
          </div>
        </div>

        {/* 🥧 3D-EXTRUDED 60-MINUTE PIE CHART AT THE END OF THE DOCUMENT */}
        <div id="pieChartSection" className="pt-6 border-t-2 border-indigo-500/30 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-500 block">
                ● 60-MINUTE BUILD PIE CHART · TOTAL = 60 MINS
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Every Single Minute Accounted For (60 Minutes Total)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPieMode("detailed")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  pieMode === "detailed"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                }`}
              >
                8-Step Detailed (60m)
              </button>
              <button
                type="button"
                onClick={() => setPieMode("classic5")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  pieMode === "classic5"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                }`}
              >
                5-Slice Classic (60m)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950/90 text-white p-6 rounded-2xl border border-indigo-500/30">
            <div className="lg:col-span-5 flex flex-col items-center">
              <canvas ref={canvasRef} className="w-[360px] h-[300px] max-w-full" />
              <div className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase mt-1">
                EXACTLY 60 MINUTES · ZERO CLOUD COST
              </div>
            </div>
            <div className="lg:col-span-7 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeSlices.map((s, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveSlice(idx)}
                  onMouseLeave={() => setActiveSlice(null)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-md flex-shrink-0 mt-1"
                      style={{ backgroundColor: s.color || "#6366f1" }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {s.step}. {s.title}{" "}
                        <span className="text-slate-400 font-mono font-normal">({s.window})</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{s.what_you_do}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex-shrink-0">
                    {s.minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ "60 MINUTES = 60 MINUTES" WORKSHOP CTA BANNER (Right after the 60-min Pie Chart!) */}
        <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="px-4 py-3 rounded-2xl bg-indigo-600 text-white font-mono font-black text-sm tracking-wider uppercase shadow-lg shadow-indigo-600/40 flex-shrink-0 text-center">
              <div className="text-lg leading-none">60</div>
              <div className="text-[10px]">MINS</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
                60 MINUTES ON THE PIE CHART = 60 MINUTES LIVE
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                This plan takes 60 minutes. So does our workshop. Come build it live!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Your plan is ready! Learn how to build this exact prototype in 60 minutes at NxtWave&apos;s free live workshop.
              </p>
            </div>
          </div>
          <Link
            href={`/register?contract_id=${contract.contract_id || contractId}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 transition whitespace-nowrap"
          >
            <span>Join the 60-Min Workshop →</span>
          </Link>
        </div>

        {/* STEP 3: SHARE TO WHATSAPP GROUP & FRIEND CONTEXT CONTINUATION */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                03 / THE SHARE LOOP · STEP 3 OF 4
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Share Your Link to Your WhatsApp Group — Friends Can Critique or Continue With This Context
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                When a classmate opens your link, they see your full 60-minute build plan, can challenge weak spots, or click &ldquo;Continue With This Plan as Context&rdquo; to score &amp; remix their own version.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={shareToWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to WhatsApp Group</span>
              </button>
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs transition"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <Link
                href={`/compare?from_contract=${contract.contract_id || contractId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                <span>🔄 Continue / Remix With This Context →</span>
              </Link>
              <Link
                href={`/challenge/${contract.contract_id || contractId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Break My Build 🛡️</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
