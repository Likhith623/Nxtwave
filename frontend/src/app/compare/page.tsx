"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  Trophy,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { compareIdeas, generateContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface IdeaInput {
  name: string;
  description: string;
  target_audience: string;
  tech_stack: string;
}

const PRESETS = [
  {
    label: "RAG Support Bot vs Crypto Trading Engine",
    ideas: [
      {
        name: "AI Customer Support Agent",
        description: "RAG pipeline answering student doubts from university knowledge base with semantic search.",
        target_audience: "College students and faculty",
        tech_stack: "FastAPI, ChromaDB, OpenAI, React",
      },
      {
        name: "Algorithmic Crypto Arbitrage Bot",
        description: "High-frequency triangular arbitrage trading bot across Binance, Coinbase, and Kraken.",
        target_audience: "DeFi algorithmic traders",
        tech_stack: "Rust, WebSockets, Redis, PostgreSQL",
      },
    ],
  },
  {
    label: "WhatsApp Expense Tracker vs Peer Whiteboard",
    ideas: [
      {
        name: "WhatsApp Smart Expense Tracker",
        description: "Parse receipt photos and text logs over WhatsApp, categorize spending automatically with OCR.",
        target_audience: "Freelancers and students on tight budgets",
        tech_stack: "WhatsApp Cloud API, FastAPI, Tesseract OCR, SQLite",
      },
      {
        name: "Real-Time Collaborative Whiteboard",
        description: "Infinite collaborative canvas with WebSockets, multiplayer cursor tracking, and freehand drawing.",
        target_audience: "Remote software product teams",
        tech_stack: "React, WebSockets, Canvas API, Node.js",
      },
    ],
  },
];

export default function ComparePage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [ideas, setIdeas] = useState<IdeaInput[]>([
    {
      name: "",
      description: "",
      target_audience: "",
      tech_stack: "",
    },
    {
      name: "",
      description: "",
      target_audience: "",
      tech_stack: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [generatingContract, setGeneratingContract] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent("page_view_compare");
  }, []);

  const handleIdeaChange = (index: number, field: keyof IdeaInput, value: string) => {
    setIdeas((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addThirdIdea = () => {
    if (ideas.length < 3) {
      setIdeas((prev) => [
        ...prev,
        { name: "", description: "", target_audience: "", tech_stack: "" },
      ]);
    }
  };

  const removeThirdIdea = () => {
    if (ideas.length > 2) {
      setIdeas((prev) => [prev[0], prev[1]]);
    }
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setIdeas(
      preset.ideas.map((item) => ({
        ...item,
      }))
    );
    setResult(null);
    success(`Loaded preset: "${preset.label}"`);
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < ideas.length; i++) {
      if (!ideas[i].name.trim() || !ideas[i].description.trim()) {
        error(`Please fill in both name and description for Idea #${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = ideas.map((idea) => ({
        name: idea.name.trim(),
        description: idea.description.trim(),
        target_audience: idea.target_audience.trim() || "General developers",
        tech_stack: idea.tech_stack
          ? idea.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
          : ["Python", "FastAPI"],
      }));

      const res = await compareIdeas(payload);
      setResult(res);

      // Trigger celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      success("Comparison matrix evaluated successfully!");
      trackAnalyticsEvent("compare_submitted", { winner: res.winner?.name });
    } catch (err: any) {
      error(err.message || "Failed to compare ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async () => {
    if (!result?.winner) return;

    try {
      setGeneratingContract(true);
      const winner = result.winner;
      const contractPayload = {
        project_name: winner.name,
        archetype: winner.archetype || "RAG_PIPELINE",
        target_audience: winner.target_audience || "Engineering teams",
        key_assumptions: [
          `Assumption 1: Core value can be demonstrated within 3 user steps.`,
          `Assumption 2: Third-party API quotas and latency will stay under 1.5s.`,
          `Assumption 3: The database schema will not require migrations after hour 2.`,
        ],
        first_hour_milestone: `Verifiable ping: working backend route returning seeded payload with test passing.`,
        out_of_scope: [
          "Custom authentication system (use mock token or Supabase)",
          "Production billing and multi-currency billing integration",
          "Complex dark-mode themes for non-essential subpages",
        ],
        suggested_stack: {
          frontend: "Next.js 14 + Tailwind CSS",
          backend: "FastAPI + Pydantic v2",
          database: "SQLite / Supabase Postgres",
        },
        comparison_id: result.comparison_id,
      };

      const newContract = await generateContract(contractPayload);
      success("Build Contract generated!");
      router.push(`/contract/${newContract.contract_id || newContract.id}`);
    } catch (err: any) {
      error(err.message || "Failed to generate build contract");
    } finally {
      setGeneratingContract(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Deterministic Evaluation Matrix</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Compare Project Ideas
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Input 2 or 3 candidate project concepts. Project Compass objectively scores each on
          Feasibility, 48-Hour Scope Viability, and Market Traction to give you a definitive winner.
        </p>
      </div>

      {/* Preset Quick Fill Bar */}
      <div className="glass-card p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Quick Test Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleCompare} className="space-y-8">
        <div className={`grid grid-cols-1 ${ideas.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="glass-card p-6 sm:p-7 relative border-t-4 border-t-indigo-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Idea #{idx + 1}
                  </span>
                  {idx === 2 && (
                    <button
                      type="button"
                      onClick={removeThirdIdea}
                      className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Remove Idea #3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI Customer Support Agent"
                      value={idea.name}
                      onChange={(e) => handleIdeaChange(idx, "name", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Concept & Core Mechanism *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What does it solve and what is the primary technical workflow?"
                      value={idea.description}
                      onChange={(e) => handleIdeaChange(idx, "description", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CS students, B2B sales reps"
                      value={idea.target_audience}
                      onChange={(e) => handleIdeaChange(idx, "target_audience", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Tech Stack (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next.js, FastAPI, SQLite, OpenAI"
                      value={idea.tech_stack}
                      onChange={(e) => handleIdeaChange(idx, "tech_stack", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {ideas.length < 3 ? (
            <button
              type="button"
              onClick={addThirdIdea}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add 3rd Project Idea</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Deterministic Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run Objective Comparison</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* RESULTS SECTION */}
      {result && (
        <div className="mt-16 space-y-8 animate-in fade-in-50 duration-500">
          {/* Winner Banner */}
          <div className="p-8 sm:p-10 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-indigo-500/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>RECOMMENDED BUILD WINNER</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {result.winner?.name}
                </h3>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {result.winner?.reasoning ||
                    "Highest overall score balancing technical feasibility, 48-hour delivery timeline, and clear problem definition."}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[140px]">
                <span className="text-4xl font-black text-emerald-400">
                  {result.winner?.overall_score || result.winner?.score || "89"}
                </span>
                <span className="text-[11px] uppercase font-bold text-slate-400 mt-1">
                  Overall Index / 100
                </span>
              </div>
            </div>

            {/* CTA to Generate Contract */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ready to commit? Lock in this project's 60-Minute Build Contract now.</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateContract}
                disabled={generatingContract}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {generatingContract ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Contract...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Generate Build Contract</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Evaluations Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(result.evaluations || []).map((ev: any, i: number) => {
              const isWinner = ev.name === result.winner?.name;
              return (
                <div
                  key={i}
                  className={`glass-card p-6 flex flex-col justify-between ${
                    isWinner
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        Concept #{i + 1}
                      </span>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          WINNER
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {ev.name}
                    </h4>

                    {/* Progress Bars */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Feasibility (48h)</span>
                          <span className="font-bold">{ev.feasibility_score || ev.feasibility || 85}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${ev.feasibility_score || ev.feasibility || 85}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Uniqueness</span>
                          <span className="font-bold">{ev.uniqueness_score || ev.uniqueness || 80}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${ev.uniqueness_score || ev.uniqueness || 80}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Market Demand</span>
                          <span className="font-bold">{ev.market_score || ev.market || 88}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                            style={{ width: `${ev.market_score || ev.market || 88}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Strengths and Blindspots */}
                    <div className="space-y-3 text-xs">
                      {ev.strengths && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                          <span className="font-bold block mb-0.5">Key Advantage:</span>
                          {Array.isArray(ev.strengths) ? ev.strengths[0] : ev.strengths}
                        </div>
                      )}

                      {ev.blindspots && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                          <span className="font-bold block mb-0.5">Critical Risk:</span>
                          {Array.isArray(ev.blindspots) ? ev.blindspots[0] : ev.blindspots}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
