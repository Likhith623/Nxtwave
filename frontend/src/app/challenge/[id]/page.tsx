"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  User,
  Send,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { getContract, submitChallenge, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

const CHALLENGE_TYPES = [
  "Scope Creep Trap",
  "Latency Bottleneck",
  "API Rate Limit Trap",
  "Schema Migration Lock",
  "Unrealistic 60m Milestone",
  "Missing Error Boundary",
];

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const { success, error } = useToast();

  const [contract, setContract] = useState<any | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [challengerName, setChallengerName] = useState("");
  const [challengerRole, setChallengerRole] = useState("Peer Hacker");
  const [challengeType, setChallengeType] = useState(CHALLENGE_TYPES[0]);
  const [critique, setCritique] = useState("");
  const [suggestedFix, setSuggestedFix] = useState("");

  const [challengesList, setChallengesList] = useState<any[]>([
    {
      id: "ch_mock_1",
      challenger_name: "Devon (Senior Mentor)",
      challenger_role: "Mentor",
      challenge_type: "Latency Bottleneck",
      critique: "If the PDF has complex tables, the embedding step will exceed 5s per chunk. The 60-min milestone will fail without asynchronous queueing.",
      suggested_fix: "Strip tables in v1 or process only the first 2 pages synchronously.",
      created_at: "10 mins ago",
    },
    {
      id: "ch_mock_2",
      challenger_name: "Priya",
      challenger_role: "Peer Hacker",
      challenge_type: "Scope Creep Trap",
      critique: "You listed 'Markdown export' in your assumptions, but that will force you to write a custom AST renderer by hour 30.",
      suggested_fix: "Return raw JSON with an inline pre-formatted block instead.",
      created_at: "25 mins ago",
    },
  ]);

  useEffect(() => {
    trackAnalyticsEvent("page_view_challenge", { contract_id: contractId });

    async function loadData() {
      try {
        setLoadingContract(true);
        const data = await getContract(contractId);
        setContract(data);
        if (data.challenges && Array.isArray(data.challenges) && data.challenges.length > 0) {
          setChallengesList(data.challenges);
        }
      } catch {
        // Fallback demo data
        setContract({
          contract_id: contractId,
          project_name: "Academic Document RAG Assistant",
          archetype: "RAG_PIPELINE",
          first_hour_milestone: "Working FastAPI endpoint embedding a 5-page PDF and performing top-3 cosine similarity retrieval.",
        });
      } finally {
        setLoadingContract(false);
      }
    }

    loadData();
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengerName.trim() || !critique.trim()) {
      error("Please fill in your name and critique.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        challenger_name: challengerName.trim(),
        challenger_role: challengerRole,
        challenge_type: challengeType,
        critique: critique.trim(),
        suggested_fix: suggestedFix.trim(),
      };

      await submitChallenge(contractId, payload);

      setChallengesList((prev) => [
        {
          id: `ch_${Date.now()}`,
          ...payload,
          created_at: "Just now",
        },
        ...prev,
      ]);

      setCritique("");
      setSuggestedFix("");
      success("Challenge submitted! You helped harden this build.");
      trackAnalyticsEvent("challenge_submitted", { contract_id: contractId });
    } catch (err: any) {
      error(err.message || "Failed to submit challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-4">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Stress Testing & Peer Assault Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Break My Build
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          The best code is the code you don't write. Challenge this Build Contract with edge cases,
          rate limits, and failure modes before the sprint starts.
        </p>
      </div>

      {/* Target Contract Snapshot */}
      {contract && (
        <div className="glass-card p-6 mb-10 border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase text-amber-500">Under Review:</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {contract.contract_id || contractId}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {contract.project_name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Goal: {contract.first_hour_milestone}
            </p>
          </div>

          <Link
            href={`/contract/${contract.contract_id || contractId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span>View Full Contract</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Submit Challenge */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 sm:p-7 rounded-2xl sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Launch a Challenge</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              How will this project blow past its 48-hour deadline?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Your Role
                  </label>
                  <select
                    value={challengerRole}
                    onChange={(e) => setChallengerRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Peer Hacker">Peer Hacker</option>
                    <option value="Senior Mentor">Senior Mentor</option>
                    <option value="Security Dev">Security Dev</option>
                    <option value="Product Judge">Product Judge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Attack Vector
                  </label>
                  <select
                    value={challengeType}
                    onChange={(e) => setChallengeType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CHALLENGE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  The Critique / Failure Mode *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the exact point of failure (e.g. at hour 36 when data volume increases...)"
                  value={critique}
                  onChange={(e) => setCritique(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Suggested Mitigation / Fix (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mock the 3rd party API or scope down to text-only"
                  value={suggestedFix}
                  onChange={(e) => setSuggestedFix(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Attack...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Challenge</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Feed of Challenges */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Active Critiques & Defenses</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {challengesList.length}
              </span>
            </h3>
          </div>

          {challengesList.map((ch, i) => (
            <div
              key={ch.id || i}
              className="glass-card p-6 border-l-4 border-l-amber-500 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {ch.challenger_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {ch.challenger_role || "Peer"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    {ch.challenge_type}
                  </span>
                  <span className="text-[11px] text-slate-400">{ch.created_at || "Recent"}</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "{ch.critique}"
              </p>

              {ch.suggested_fix && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Mitigation Strategy:</span> {ch.suggested_fix}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
