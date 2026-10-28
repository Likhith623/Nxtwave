"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
  Zap,
  Target,
  ExternalLink,
} from "lucide-react";
import { ParticleHero } from "@/components/home/ParticleHero";
import { trackAnalyticsEvent } from "@/lib/api";

const ARCHETYPES = [
  {
    title: "RAG Pipeline & Semantic Search",
    tag: "AI / Search",
    feasibility: "88%",
    difficulty: "Medium",
    desc: "Embeddings, vector stores, hybrid retrieval, and grounded hallucinations filter.",
    sampleStack: "LangChain • pgvector • FastAPI",
  },
  {
    title: "WhatsApp Conversational Bot",
    tag: "Messaging",
    feasibility: "94%",
    difficulty: "Low-Med",
    desc: "Meta Cloud API, webhook verification, deterministic state machine, instant reach.",
    sampleStack: "FastAPI • Webhooks • SQLite",
  },
  {
    title: "Micro-SaaS Workflow Automation",
    tag: "SaaS",
    feasibility: "91%",
    difficulty: "Medium",
    desc: "Multi-tenant auth, scheduled cron jobs, stripe checkout, and webhook listeners.",
    sampleStack: "Next.js • Supabase • Resend",
  },
  {
    title: "Developer CLI & Code Analyzer",
    tag: "DevTools",
    feasibility: "96%",
    difficulty: "Low",
    desc: "Command-line ergonomics, AST parsing, Git hooks, and lightning-fast terminal output.",
    sampleStack: "Rust / Node • Clack • Chalk",
  },
  {
    title: "Real-Time Collaborative Canvas",
    tag: "Realtime",
    feasibility: "78%",
    difficulty: "High",
    desc: "WebSockets, CRDTs, optimistic UI updates, and conflict resolution engine.",
    sampleStack: "Liveblocks • Canvas API • React",
  },
  {
    title: "Chrome Extension AI Assistant",
    tag: "Browser",
    feasibility: "92%",
    difficulty: "Low-Med",
    desc: "Manifest V3, content script injection, background service workers, DOM scraping.",
    sampleStack: "WXT • Tailwind • OpenAI",
  },
];

export default function HomePage() {
  useEffect(() => {
    trackAnalyticsEvent("page_view_home");
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Particles Canvas */}
        <ParticleHero />

        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm mb-6 animate-float">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>NxtWave Growth Intern Challenge • 48-Hour Sprint Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Choose. Test. Prove.{" "}
            <br />
            <span className="gradient-text">
              Before Writing a Line of Code.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
            Stop abandoning hackathon projects at hour 36. Project Compass scores your
            software concepts across 9 deterministic archetypes, eliminates scope creep,
            and generates an ironclad 60-Minute Build Contract.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/compare"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Compare My Project Ideas</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/contract/bc_demo_rag"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-base transition-all hover:scale-[1.01]"
            >
              <FileCheck2 className="w-5 h-5 text-indigo-500" />
              <span>View Sample Build Contract</span>
            </Link>
          </div>

          {/* Micro WhatsApp prompt */}
          <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Prefer chat? Test our</span>
            <Link
              href="/whatsapp"
              className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Live WhatsApp Bot Simulator
            </Link>
          </div>
        </div>
      </section>

      {/* METRIC RIBBON */}
      <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 backdrop-blur-sm py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              48h
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Sprint Execution Time
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black gradient-text">
              9
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Curated Archetypes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-emerald-500">
              60m
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              First-Hour Milestone
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-indigo-500">
              100%
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Deterministic Scoring
            </span>
          </div>
        </div>
      </section>

      {/* 3-STEP WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
            The Three Pillars
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Project Compass Protects Your Sprint
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-card p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                Step 01
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
                Deterministic Comparison
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Pit up to three candidate concepts against each other. Our matrix evaluates
                Feasibility, Uniqueness, 48-Hour Scope, and Market Demand without subjective bias.
              </p>
            </div>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:translate-x-1 transition-transform"
            >
              <span>Test Ideas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 flex flex-col justify-between border-indigo-500/30 dark:border-indigo-500/30 glow-primary">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                Step 02
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
                60-Minute Build Contract
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Lock in an explicit scope contract. Pinpoints the 3 lethal assumptions,
                mandates what NOT to build, and defines your verifiable Hour-One milestone.
              </p>
            </div>
            <Link
              href="/contract/bc_demo_rag"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:translate-x-1 transition-transform"
            >
              <span>Inspect Sample Contract</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Step 03
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
                Break My Build Challenge
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Share your contract with peers and mentors before coding. Invite them to assault
                your edge cases, latency bottlenecks, and API quota traps early.
              </p>
            </div>
            <Link
              href="/challenge/bc_demo_rag"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:translate-x-1 transition-transform"
            >
              <span>Challenge a Build</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ARCHETYPES SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Curated Patterns
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Proven 48-Hour Engineering Archetypes
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Score your own idea against these</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHETYPES.map((arch, idx) => (
            <div
              key={idx}
              className="glass-card p-6 flex flex-col justify-between hover:border-indigo-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {arch.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{arch.feasibility} Feasible</span>
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {arch.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {arch.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{arch.sampleStack}</span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {arch.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP HIGHLIGHT */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 mb-4">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Meta Cloud API Integrated</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Evaluate Concepts Directly Inside WhatsApp
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                No need to sit at a laptop during ideation. Message our official Meta-verified
                bot from anywhere. Send two raw concepts, and get instant comparative scores,
                failure-mode analysis, and contract links delivered to your chat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/whatsapp"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch WhatsApp Simulator</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
                >
                  <span>Register Your Phone</span>
                </Link>
              </div>
            </div>

            {/* Simulated Chat Bubble Snapshot */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-xs font-mono shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-sans font-semibold text-emerald-400">Project Compass WhatsApp Engine</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Cloud API Verified
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl text-slate-300">
                <span className="text-indigo-400 font-bold block mb-1">User:</span>
                "Compare: 1) WhatsApp AI bot for student doubts vs 2) Fullstack crypto trading bot"
              </div>
              <div className="bg-emerald-950/60 border border-emerald-800/50 p-3 rounded-xl text-emerald-200 space-y-1.5">
                <span className="text-emerald-400 font-bold block">Compass AI:</span>
                <p>🏆 <b>WINNER: WhatsApp AI Bot (Score: 89/100)</b></p>
                <p>• Feasibility: 92% | 48h Viability: 94%</p>
                <p>• Blindspot: Watch Meta 24-hr session window limit.</p>
                <p className="text-cyan-300 underline">compass.nxtwave.dev/contract/bc_auto_941</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="glass-panel p-10 sm:p-16 rounded-3xl relative">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/30">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Ready to Win Your Next 48-Hour Sprint?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Join dozens of engineers building high-impact products with verified feasibility.
              Don't guess — let Project Compass prove it first.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/compare"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition hover:scale-[1.02]"
              >
                Launch Decision Matrix
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
              >
                Register for Demo Day
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
