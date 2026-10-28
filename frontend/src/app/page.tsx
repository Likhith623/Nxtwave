"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  Zap,
  ChevronRight,
  Layers,
  BarChart3,
  Star,
  Users,
  Clock,
  TrendingUp,
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
    color: "from-indigo-500 to-violet-600",
    icon: "🔍",
  },
  {
    title: "WhatsApp Smart Agent",
    tag: "Conversational",
    score: "94",
    desc: "Meta Cloud API, state machine routing, and instant 24h messaging.",
    tech: "FastAPI • Webhooks • SQLite",
    color: "from-emerald-500 to-teal-600",
    icon: "💬",
  },
  {
    title: "Micro-SaaS Automation",
    tag: "Cloud / SaaS",
    score: "91",
    desc: "Multi-tenant auth, event queue, and automated webhook listeners.",
    tech: "Next.js 14 • Supabase • Resend",
    color: "from-blue-500 to-cyan-600",
    icon: "⚡",
  },
  {
    title: "Developer CLI Tooling",
    tag: "DevTools",
    score: "96",
    desc: "Command-line ergonomics, AST parsing, and zero-runtime binaries.",
    tech: "Node.js / Rust • Clack • Chalk",
    color: "from-amber-500 to-orange-600",
    icon: "🛠️",
  },
  {
    title: "Real-Time Canvas",
    tag: "WebSockets",
    score: "78",
    desc: "Collaborative multiplayer state, optimistic UI, and CRDT sync.",
    tech: "Canvas API • WebSockets • React",
    color: "from-pink-500 to-rose-600",
    icon: "🎨",
  },
  {
    title: "Browser AI Copilot",
    tag: "Extension",
    score: "92",
    desc: "Manifest V3, content script DOM scraper, and LLM background worker.",
    tech: "WXT • Tailwind • OpenAI",
    color: "from-violet-500 to-purple-600",
    icon: "🤖",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Score Your Ideas",
    desc: "Input your constraints and compare up to 3 project ideas across 9 deterministic archetypes. Get feasibility scores in under 50ms.",
    icon: <Layers className="w-5 h-5" />,
    color: "indigo",
  },
  {
    num: "02",
    title: "Generate Build Contract",
    desc: "Lock in your MVP scope, identify the single load-bearing assumption, and get a concrete 60-minute prototype roadmap.",
    icon: <FileCheck2 className="w-5 h-5" />,
    color: "violet",
  },
  {
    num: "03",
    title: "Break My Build",
    desc: "Share a peer challenge link. Classmates stress-test your architecture and submit edge cases before viva day.",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "cyan",
  },
  {
    num: "04",
    title: "Register & Build Live",
    desc: "Join the NxtWave free workshop and prototype your validated idea in exactly 60 minutes on your standard laptop.",
    icon: <Zap className="w-5 h-5" />,
    color: "emerald",
  },
];

const METRICS = [
  { value: "500", suffix: "+", label: "Students Targeted", icon: <Users className="w-4 h-4" /> },
  { value: "54", suffix: "", label: "Tests Passing", icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: "60", suffix: "min", label: "Prototype Window", icon: <Clock className="w-4 h-4" /> },
  { value: "₹0", suffix: "", label: "Dev Cost", icon: <TrendingUp className="w-4 h-4" /> },
];

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ""), 10);
    if (isNaN(num)) { setDisplay(target); return; }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const step = Math.ceil(num / (duration / 16));
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, num);
          setDisplay(String(current));
          if (current >= num) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

export default function HomePage() {
  useScrollReveal();

  useEffect(() => {
    trackAnalyticsEvent("page_view_home");
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      {/* ── AMBIENT ORB BACKGROUNDS ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/[0.08] blur-[120px] animate-orb" />
        <div className="absolute top-[40%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-500/[0.05] dark:bg-violet-500/[0.07] blur-[100px] animate-orb delay-500" />
        <div className="absolute bottom-0 left-[30%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06] blur-[90px] animate-orb delay-300" />
      </div>

      {/* ── WORKSHOP BANNER ─────────────────────────────────────────────────── */}
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="animate-fade-up glass-panel rounded-2xl p-4 sm:p-5 border border-indigo-500/20 shimmer-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 text-left">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 animate-pulse-glow">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  NxtWave Free Live Workshop: Build Your First AI Project in 60 Minutes
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Don&apos;t spend 4 months coding the wrong project. Scaffold, integrate, and test a working prototype live.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 ripple-btn"
            >
              <span>Register Free — ₹0</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <ParticleHero />

        {/* Pill badge */}
        <div className="animate-fade-up delay-100 relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-panel border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ripple-indicator text-emerald-500 animate-pulse" />
          <span>NxtWave Growth Intern Sprint Engine</span>
          <span className="mx-1 text-slate-300 dark:text-white/20">|</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">48-Hour Build</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-200 relative z-10 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.07] mb-6 max-w-4xl">
          Choose. Test. Prove.{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Before Writing a Line of Code.</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up delay-300 relative z-10 max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
          Stop abandoning projects at hour 36. Project Compass scores your software
          concepts across 9 deterministic archetypes, eliminates scope creep, and
          generates an ironclad 60-Minute Build Contract.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-up delay-400 relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link
            href="/compare"
            className="btn-primary ripple-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-bold text-sm"
          >
            <span>Compare My Project Ideas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contract/bc_demo_rag"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span>Sample Build Contract</span>
          </Link>
        </div>

        {/* Feature preview card */}
        <div className="animate-scale-in delay-500 relative z-10 w-full max-w-4xl glass-panel rounded-2xl p-5 sm:p-8 text-left shadow-2xl card-beam animate-border-dance">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">compass-matrix-v2.0.ts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Backend Active · 54 tests ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "01 • Benchmark", title: "Objective Scoring", body: "Evaluates feasibility, technical risk, and 48-hour delivery timeline without subjective bias.", color: "text-slate-400" },
              { step: "02 • Commit", title: "60-Min Build Contract", body: "Mandates what NOT to build and locks your verifiable first-hour milestone test.", color: "text-indigo-500" },
              { step: "03 • Harden", title: "Break My Build", body: "Peers stress-test your architecture for latency, data, and API quota traps early.", color: "text-amber-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-2 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/3 transition-colors duration-200">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${item.color}`}>{item.step}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ───────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal border border-slate-200/60 dark:border-white/5 rounded-2xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center bg-white/50 dark:bg-white/[0.02]">
          {METRICS.map((m, i) => (
            <div key={i} className={`reveal delay-${i * 100} stagger-children flex flex-col items-center gap-1`}>
              <div className="mb-1 text-indigo-500 dark:text-indigo-400">{m.icon}</div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                <AnimatedCounter target={m.value} />
                <span className="text-indigo-500">{m.suffix}</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14 reveal">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">The System</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
            Four Steps. Zero Guesswork.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            A deterministic engineering process that takes you from vague idea to deployable prototype.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`reveal delay-${i * 100} glass-card shimmer-card p-6 flex flex-col gap-4`}
            >
              {/* Step number */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black font-mono text-slate-900/10 dark:text-white/10">
                  {step.num}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white
                  ${step.color === "indigo" ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                    step.color === "violet" ? "bg-gradient-to-br from-violet-500 to-violet-600" :
                    step.color === "cyan" ? "bg-gradient-to-br from-cyan-500 to-cyan-600" :
                    "bg-gradient-to-br from-emerald-500 to-emerald-600"}
                  shadow-md`}>
                  {step.icon}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{step.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ARCHETYPES GRID ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 reveal">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Architecture Library</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
              Battle-Tested 48-Hour Archetypes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
              Each archetype is pre-scored for a final-year student with a standard laptop and zero GPU budget.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
          >
            <span>Score your idea</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARCHETYPES.map((arch, i) => (
            <div
              key={i}
              className={`reveal delay-${(i % 3) * 100} glass-card shimmer-card p-6 flex flex-col justify-between group cursor-default`}
            >
              <div>
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${arch.color} flex items-center justify-center text-base shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {arch.icon}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      {arch.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-500">
                    <Star className="w-3 h-3 fill-emerald-500" />
                    <span>{arch.score}/100</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {arch.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {arch.desc}
                </p>
              </div>

              {/* Score bar */}
              <div className="space-y-2">
                <div className="score-bar-track">
                  <div
                    className={`score-bar-fill bg-gradient-to-r ${arch.color}`}
                    style={{ width: `${arch.score}%` }}
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {arch.tech}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHATSAPP CTA ────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 overflow-hidden relative">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Real-Time Meta Cloud API v21.0</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Ideate Directly Inside WhatsApp
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Send your raw project concepts to our verified Meta Cloud API agent. Get deterministic
                feasibility scores and Build Contract links straight on your phone — no login required.
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <Link
                href="/whatsapp"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                Launch Simulator
              </Link>
              <p className="text-xs text-slate-400">No WhatsApp account needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="reveal max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>500 Registration Target · ₹2,000 Budget · 7 Days</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ready to Stop Guessing?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            Join the NxtWave free workshop and build a working AI prototype in 60 minutes.
            No GPU required. No paid APIs. Just your laptop and a validated plan.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/compare"
              className="btn-primary ripple-btn inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm"
            >
              <span>Start Free — Compare Ideas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
            >
              Register for Workshop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
