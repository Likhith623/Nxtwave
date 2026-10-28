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
  Sparkles,
  Zap,
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
  const [submittedSuccess, setSubmittedSuccess] = useState<any | null>(null);

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

    setSubmitting(true);
    try {
      const res = await submitChallenge(contractId, {
        challenger_name: challengerName.trim(),
        challenger_role: challengerRole,
        challenge_type: challengeType,
        critique: critique.trim(),
        suggested_fix: suggestedFix.trim() || undefined,
      });

      const newEntry = {
        id: res?.challenge_id || `ch_${Date.now()}`,
        challenger_name: challengerName.trim(),
        challenger_role: challengerRole,
        challenge_type: challengeType,
        critique: critique.trim(),
        suggested_fix: suggestedFix.trim() || undefined,
        created_at: "Just now",
        recommendation: res?.recommendation,
      };

      setChallengesList((prev) => [newEntry, ...prev]);
      setSubmittedSuccess(res?.recommendation || {
        risk_level: "High Risk",
        recommended_scope_adjustment: "Wrap the query pipeline in a fallback threshold before calling external services.",
        architectural_safeguard: "Added explicit boundary checks to project specification.",
      });

      setCritique("");
      setSuggestedFix("");
      success("Edge-case critique submitted! Contract risk mitigation logged.");
      trackAnalyticsEvent("challenge_submitted", { contract_id: contractId, attack_vector: challengeType });
    } catch (err: any) {
      error(err.message || "Failed to submit challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ⚡ Top Workshop Conversion Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              ⚡ Reviewing a Classmate&apos;s Build? Now Build Your Own in 60 Minutes
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Don&apos;t spend 4 months coding the wrong project. Join NxtWave&apos;s free live workshop to scaffold and deploy a working prototype.
            </p>
          </div>
        </div>
        <Link
          href="/register?utm_source=break_my_build_peer"
          className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition active:scale-95 whitespace-nowrap"
        >
          <span>Register Free (₹0) →</span>
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            🛡️ Feature 3: Viral Peer Validation Loop
          </span>
          <span className="text-xs text-slate-500">Zero-Login Classmate Review Arena</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Break My Build: Peer Stress-Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Classmates find edge cases, latency bottlenecks, and scope creep before college examiners conduct the final viva review.
        </p>
      </div>

      {/* Target Project Card */}
      {contract && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
              Active Build Contract Under Review
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {contract.project_name}
            </h3>
            {contract.first_hour_milestone && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Milestone 1: {contract.first_hour_milestone}
              </p>
            )}
          </div>
          <Link
            href={`/contract/${contract.contract_id || contractId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span>View Full Contract</span>
          </Link>
        </div>
      )}

      {/* Post-Submission Viral Banner (Organic Loop Hook) */}
      {submittedSuccess && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 space-y-3 animate-fade-up">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Critique Accepted! Architectural Safeguard Applied</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <strong>Safeguard: </strong>{submittedSuccess.architectural_safeguard || submittedSuccess.recommended_scope_adjustment}
          </p>
          <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              💡 Have your own final-year idea? Test your project for free or join the 60-Minute Workshop!
            </p>
            <div className="flex gap-2">
              <Link
                href="/compare"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-500 transition"
              >
                Test My Own Idea 🧭
              </Link>
              <Link
                href="/register?utm_source=peer_review_cta"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition"
              >
                Join Free Workshop ⚡
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Submit Challenge */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 sm:p-7 rounded-2xl sticky top-24 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Launch a Challenge</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Where will this architecture break when college faculty or 100 students query it?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera (4th Year CSE)"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Peer Hacker">Peer Classmate</option>
                    <option value="Senior Mentor">Senior Student</option>
                    <option value="Security Dev">Faculty / Guide</option>
                    <option value="Product Judge">Placement Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Attack Vector
                  </label>
                  <select
                    value={challengeType}
                    onChange={(e) => setChallengeType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  placeholder="Detail the failure scenario: e.g. What if the college circular is in scanned Telugu/Hindi image format rather than English text?"
                  value={critique}
                  onChange={(e) => setCritique(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Suggested Mitigation / Fix (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Add OCR bounding-box filter before embedding text"
                  value={suggestedFix}
                  onChange={(e) => setSuggestedFix(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    <span>Submitting Challenge...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Peer Challenge 🛡️</span>
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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
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
                &ldquo;{ch.critique}&rdquo;
              </p>

              {ch.suggested_fix && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Mitigation Strategy: </span>{ch.suggested_fix}
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
