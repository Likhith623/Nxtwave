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
            archetype: "RAG_PIPELINE",
            target_audience: "Research students & university faculty",
            first_hour_milestone: "Working FastAPI endpoint embedding a 5-page PDF and performing top-3 cosine similarity retrieval.",
            key_assumptions: [
              "PDF text extraction won't mangle mathematical equations or multi-column layouts.",
              "OpenAI / local embedding latency stays under 400ms per query.",
              "Document corpus fits in SQLite vector storage without requiring distributed clustering.",
            ],
            out_of_scope: [
              "Multi-tenant user authentication and team workspace sharing.",
              "Subscription billing or stripe checkout integration.",
              "OCR support for hand-written scanned documents.",
            ],
            suggested_stack: {
              frontend: "Next.js 14 + Tailwind CSS",
              backend: "FastAPI + LangChain",
              database: "SQLite (sqlite-vec) / pgvector",
            },
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
          Contract ID "{contractId}" could not be located in the database.
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
  const assumptions = contract.key_assumptions || [];
  const outOfScope = contract.out_of_scope || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Breadcrumb & Share */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:underline">Contracts</Link>
          <span>/</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            {contract.contract_id || contractId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Link Copied" : "Share Contract"}</span>
          </button>

          <Link
            href={`/challenge/${contract.contract_id || contractId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Break My Build</span>
          </Link>
        </div>
      </div>

      {/* Main Contract Document Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        {/* Stamp / Watermark Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <FileCheck2 className="w-5 h-5" />
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CONTRACT LOCKED</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {contract.contract_id || contractId}
            </span>
          </div>
        </div>

        {/* Project Overview */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Archetype: {contract.archetype || "RAG_PIPELINE"}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Target Audience: {contract.target_audience}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {contract.project_name}
          </h1>
        </div>

        {/* 60-Minute First Milestone Guarantee */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>The Hour-One Verifiable Proof</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            First 60-Minute Implementation Goal
          </h3>
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-950 dark:text-indigo-200 font-mono leading-relaxed">
            {contract.first_hour_milestone}
          </div>
        </div>

        {/* Lethal Assumptions */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Risk Surface</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            3 Lethal Assumptions to Test Early
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assumptions.map((ass: string, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                <span className="font-bold text-amber-500 block mb-1">
                  Assumption #{i + 1}
                </span>
                {ass}
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Scope Exclusion (What NOT to build) */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            <Ban className="w-4 h-4" />
            <span>Scope Protection</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Explicitly OUT OF SCOPE (Do NOT Build in 48h)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Building any of these during the 48-hour sprint triggers scope failure.
          </p>
          <div className="space-y-2">
            {outOfScope.map((item: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 dark:bg-red-950/30 border border-red-500/20 text-xs text-red-800 dark:text-red-300 font-medium"
              >
                <Ban className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Stack */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            <Cpu className="w-4 h-4" />
            <span>Architecture</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Recommended Lean Tech Stack
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Frontend UI
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {stack.frontend || "Next.js 14 + Tailwind CSS"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Backend Engine
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {stack.backend || "FastAPI + Pydantic v2"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Database / State
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {stack.database || "SQLite / Supabase Postgres"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/challenge/${contract.contract_id || contractId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition hover:scale-[1.02]"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Invite Peers to Break My Build</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition"
          >
            <span>Register for NxtWave Demo Day</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

