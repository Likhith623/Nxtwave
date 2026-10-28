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
  CheckCircle2,
  Zap,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { ParticleHero } from "@/components/home/ParticleHero";
import { trackAnalyticsEvent } from "@/lib/api";

const ARCHETYPES = [
  {
    title: "RAG Pipeline & Search",
    tag: "AI / Semantic",
    score: "89",
    desc: "Embeddings, vector store retrieval, and grounded context injection.",
    tech: "LangChain • pgvector • FastAPI",
  },
  {
    title: "WhatsApp Smart Agent",
    tag: "Conversational",
    score: "94",
    desc: "Meta Cloud API, state machine routing, and instant 24h messaging.",
    tech: "FastAPI • Webhooks • SQLite",
  },
  {
    title: "Micro-SaaS Automation",
    tag: "Cloud / SaaS",
    score: "91",
    desc: "Multi-tenant auth, event queue, and automated webhook listeners.",
    tech: "Next.js 14 • Supabase • Resend",
  },
  {
    title: "Developer CLI Tooling",
    tag: "DevTools",
    score: "96",
    desc: "Command-line ergonomics, AST parsing, and zero-runtime binaries.",
    tech: "Node.js / Rust • Clack • Chalk",
  },
  {
    title: "Real-Time Canvas",
    tag: "WebSockets",
    score: "78",
    desc: "Collaborative multiplayer state, optimistic UI, and CRDT synchronization.",
    tech: "Canvas API • WebSockets • React",
  },
  {
    title: "Browser AI Copilot",
    tag: "Extension",
    score: "92",
    desc: "Manifest V3, content script DOM scraper, and LLM background worker.",
    tech: "WXT • Tailwind • OpenAI",
  },
];

export default function HomePage() {
  useEffect(() => {
    trackAnalyticsEvent("page_view_home");
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Top Workshop Announcement Banner */}
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-indigo-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10">
          <div className="flex items-start sm:items-center gap-3 text-left">
            <span className="text-xl flex-shrink-0 mt-0.5 sm:mt-0">⚡</span>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                NxtWave Free Live Workshop: Build Your First AI Project in 60 Minutes
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Don&apos;t spend 4 months coding the wrong project. Learn how to scaffold, integrate, and test a working AI prototype in one session.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <span>Register Free (₹0) →</span>
          </Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Animated Particles Canvas */}
        <ParticleHero />

        {/* Ambient Top Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NxtWave Growth Intern Sprint Engine</span>
          <span className="text-slate-400">|</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">48-Hour Spec</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6 max-w-4xl">
          Choose. Test. Prove. <br />
          <span className="gradient-text">
            Before Writing a Line of Code.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          Stop abandoning projects at hour 36. Project Compass scores your software
          concepts across 9 deterministic archetypes, eliminates scope creep, and generates
          an ironclad 60-Minute Build Contract.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link
            href="/compare"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            <span>Compare My Project Ideas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contract/bc_demo_rag"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span>Sample Build Contract</span>
          </Link>
        </div>

        {/* Interactive Live Preview Mockup Card */}
        <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 sm:p-8 text-left shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">compass-matrix-v2.0</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FastAPI Backend Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1 • Benchmark</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Objective Scoring</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluates feasibility, technical risk, and 48-hour delivery timeline without subjective bias.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Step 2 • Commit</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">60-Min Build Contract</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mandates what NOT to build and locks your verifiable first-hour milestone test.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Step 3 • Harden</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Break My Build</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Peers and mentors stress-test your architecture for latency and API quota traps early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-y border-slate-200/80 dark:border-white/5 py-8 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">48 Hours</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Sprint Execution Time</p>
          </div>
          <div>
            <span className="text-3xl font-extrabold gradient-text">9 Archetypes</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Deterministic Patterns</p>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-500">60 Minutes</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">First-Hour Milestone</p>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-indigo-500">100% Free</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Zero Paid APIs Required</p>
          </div>
        </div>
      </section>

      {/* ARCHETYPES GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Architecture Library</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Battle-Tested 48-Hour Archetypes
            </h2>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Score your idea</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARCHETYPES.map((arch, i) => (
            <div key={i} className="glass-card p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {arch.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {arch.score}/100 Viability
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-500 transition-colors">
                  {arch.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {arch.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 text-[11px] font-mono text-slate-400">
                {arch.tech}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP CTA STRIP */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Real-Time Meta Cloud API</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ideate Directly Inside WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Send your raw project concepts to our verified Meta Cloud API agent. Get deterministic
              feasibility scores and Build Contract links straight on your phone.
            </p>
          </div>

          <Link
            href="/whatsapp"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 flex-shrink-0"
          >
            Launch WhatsApp Simulator
          </Link>
        </div>
      </section>
    </div>
  );
}
