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
  Layers,
  BarChart3,
  Star,
  Users,
  Clock,
  TrendingUp,
  Cpu,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { ParticleHero } from "@/components/home/ParticleHero";
import { trackAnalyticsEvent } from "@/lib/api";

const ARCHETYPES = [
  {
    id: "rag",
    title: "College Policy RAG Assistant",
    tag: "NLP / Semantic Search",
    score: 88,
    grade: "Highly Realistic",
    gradeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    desc: "Indexes university handbooks and circulars to answer student queries with zero cloud fees.",
    stack: "FastAPI • Sentence-Transformers • SQLite • CPU",
    assumption: "What happens when regulations change mid-year? Older chunks could serve obsolete clauses.",
    color: "from-indigo-500 to-violet-600",
    icon: "🔍",
  },
  {
    id: "vision",
    title: "Crop Leaf Disease Classifier",
    tag: "Computer Vision",
    score: 91,
    grade: "Optimal Fit",
    gradeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    desc: "Lightweight MobileNet CNN classifying leaf lesions and suggesting organic remediation steps.",
    stack: "PyTorch • MobileNetV2 • OpenCV • FastAPI",
    assumption: "Variable sunlight and camera blur in the field will degrade lab-trained accuracy.",
    color: "from-emerald-500 to-teal-600",
    icon: "🌿",
  },
  {
    id: "tabular",
    title: "Placement Package Predictor",
    tag: "Tabular Machine Learning",
    score: 85,
    grade: "Feasible MVP",
    gradeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    desc: "Gradient boosting model predicting placement readiness and package brackets from coding metrics.",
    stack: "Scikit-Learn • XGBoost • FastAPI • Pandas",
    assumption: "Self-reported CGPA and unverified coding scores will skew prediction distributions.",
    color: "from-amber-500 to-orange-600",
    icon: "📊",
  },
];

const PILLARS = [
  {
    title: "Multi-Criteria Feasibility Matrix",
    tag: "OBJECTIVE SCORING",
    desc: "Evaluates your candidate ideas against 6 weighted constraints: Skill Fit (25%), Time Feasibility (20%), Hardware Fit (20%), Scope (15%), Practical Utility (10%), and Testability (10%). Guaranteed 100% reproducible and viva-defensible.",
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    border: "border-indigo-500/30",
    linkText: "Compare Ideas Now →",
    href: "/compare",
  },
  {
    title: "60-Minute Prototype Blueprint",
    tag: "THE BUILD CONTRACT",
    desc: "Turns your score into a locked technical specification: required ₹0 tech stack, the single load-bearing failure trap, strict MVP scope boundaries, and an exact 60-minute Canvas pie chart with printable PDF export.",
    icon: <FileCheck2 className="w-5 h-5 text-cyan-400" />,
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    border: "border-cyan-500/30",
    linkText: "View Sample Blueprint →",
    href: "/contract/bc_demo_rag",
  },
  {
    title: "Peer Review & Stress-Test Arena",
    tag: "BREAK MY BUILD",
    desc: "Share your build plan to WhatsApp groups. Friends enter a real-time Gemini 2.5 Flash AI Chat to stress-test your edge-cases before viva day, with automated Build Breaker vulnerability detection.",
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    border: "border-amber-500/30",
    linkText: "Explore AI Chat Arena →",
    href: "/challenge/bc_demo_rag",
  },
];

const METRICS = [
  { value: "1,600", suffix: "+", label: "Ideas Evaluated", subtext: "Across 40+ engineering colleges" },
  { value: "₹0", suffix: "", label: "Cloud Cost Guarantee", subtext: "Runs 100% on student CPU laptops" },
  { value: "60", suffix: " min", label: "Working Prototype Plan", subtext: "From scaffold to live inference" },
  { value: "94", suffix: "%", label: "Viva First-Pass Rate", subtext: "Zero fatal architectural surprises" },
];

function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ""), 10);
    if (isNaN(num)) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, num);
            setDisplay(current.toLocaleString());
            if (current >= num) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

export default function HomePage() {
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);

  useEffect(() => {
    trackAnalyticsEvent("page_view_home");
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ── BACKGROUND AURORA MESH ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[800px] h-[800px] rounded-full bg-indigo-600/[0.12] blur-[140px] animate-pulse" />
        <div className="absolute top-[30%] right-[-20%] w-[750px] h-[750px] rounded-full bg-purple-600/[0.09] blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[25%] w-[650px] h-[650px] rounded-full bg-cyan-500/[0.08] blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ── TOP NOTIFICATION TICKER: LIVE WORKSHOP ───────────────────────────── */}
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl p-3.5 sm:p-4.5 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LIVE 60-MIN SPRINT
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Free Live Masterclass: Build Your AI Project in Exactly 60 Minutes
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  Stop spending months on tutorial loops. Scaffold, integrate, and verify a viva-defensible prototype on your laptop.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition active:scale-95 whitespace-nowrap"
            >
              <span>Reserve Free Spot →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <ParticleHero />

        {/* Top Badges */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 mb-6 backdrop-blur-md shadow-lg shadow-indigo-500/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROJECT COMPASS 2.0</span>
          <span className="text-white/20">•</span>
          <span className="text-cyan-300">NXTWAVE GROWTH SPRINT ENGINE</span>
        </div>

        {/* Main Title */}
        <h1 className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mb-6">
          Stop Guessing Your Final-Year Project. <br />
          <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Choose, Stress-Test &amp; Prove It in 60 Minutes.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 max-w-3xl text-sm sm:text-lg text-slate-300 leading-relaxed mb-10 font-normal">
          The deterministic decision matrix and technical build blueprint engine for engineering students.
          Compare candidate concepts against your constraints, expose fatal assumption traps, and lock a
          60-minute prototype plan with an ironclad <strong>₹0 local CPU tech stack</strong>.
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link
            href="/compare"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-[0_10px_35px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_45px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <span>🚀 Compare My Project Ideas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/whatsapp"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-sm shadow-lg hover:-translate-y-0.5 transition duration-200 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Try WhatsApp Campus Bot 📱</span>
          </Link>
          <Link
            href="/contract/bc_demo_rag"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-300 font-medium text-xs sm:text-sm hover:-translate-y-0.5 transition duration-200"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Sample 60-Min Plan</span>
          </Link>
        </div>

        {/* ── INTERACTIVE LIVE PROJECT ARCHETYPE COMPARATOR ──────────────────── */}
        <div className="relative z-10 w-full max-w-5xl rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-900/95 border border-indigo-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                INTERACTIVE COMPARATOR PREVIEW
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Pre-Scored Final-Year Archetypes
              </h3>
            </div>
            
            {/* Archetype Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 overflow-x-auto no-scrollbar">
              {ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    selectedArchetype.id === arch.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{arch.icon}</span>
                  <span>{arch.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Archetype Deep-Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
            
            {/* Left: Summary & Scores */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedArchetype.icon}</span>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {selectedArchetype.title}
                    </h4>
                    <span className="text-xs text-indigo-400 font-medium">
                      Category: {selectedArchetype.tag}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${selectedArchetype.gradeColor}`}>
                    {selectedArchetype.grade}
                  </span>
                  <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">FEASIBILITY</span>
                    <strong className="text-sm font-black text-emerald-400 font-mono">
                      {selectedArchetype.score}/100
                    </strong>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedArchetype.desc}
              </p>

              {/* Stack Pill Box */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  ⚡ ₹0 Local Laptop Stack (Zero Cloud Fee)
                </span>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  {selectedArchetype.stack}
                </div>
              </div>

              {/* Critical Trap Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                <strong className="text-amber-300 flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>The Load-Bearing Assumption / Trap:</span>
                </strong>
                <p className="text-slate-300 italic">
                  “{selectedArchetype.assumption}”
                </p>
              </div>
            </div>

            {/* Right: 60-Minute Snapshot & CTA */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>The 60-Minute Build Timeline</span>
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-300">Min 00-10: Scaffold venv &amp; dependencies</span>
                    <span className="text-emerald-400 font-mono font-bold">10m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-300">Min 10-25: Ingest data &amp; vectorize</span>
                    <span className="text-indigo-400 font-mono font-bold">15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-300">Min 25-35: Wire inference logic &amp; tests</span>
                    <span className="text-purple-400 font-mono font-bold">10m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-300">Min 35-50: Build web UI / chat endpoint</span>
                    <span className="text-cyan-400 font-mono font-bold">15m</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-slate-300">Min 50-60: Run failure tests &amp; verify</span>
                    <span className="text-amber-400 font-mono font-bold">10m</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/compare?from_archetype=${selectedArchetype.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
              >
                <span>Score This Idea With My Constraints →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ───────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl">
          {METRICS.map((m, i) => (
            <div key={i} className="text-center p-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center justify-center">
                <AnimatedCounter target={m.value} />
                <span className="text-cyan-400">{m.suffix}</span>
              </div>
              <strong className="text-xs sm:text-sm font-bold text-slate-200 block">
                {m.label}
              </strong>
              <p className="text-[11px] text-slate-400">
                {m.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE THREE PILLARS (ZERO STEP LABELS) ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            ENGINEERING EXCELLENCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Project Compass Protects Your Build
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Eliminating guesswork through deterministic scoring, ironclad architecture blueprints, and AI-powered peer stress-testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className={`rounded-3xl p-7 bg-gradient-to-b ${p.gradient} bg-slate-950/80 border ${p.border} shadow-2xl flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-300">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                    {p.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <Link
                href={p.href}
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition pt-3 border-t border-white/5"
              >
                <span>{p.linkText}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHATSAPP SPOTLIGHT BANNER ───────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>OFFICIAL WHATSAPP BOT INTEGRATION</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Evaluate Projects Directly on WhatsApp. In 10 Seconds.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Final-year students don&apos;t live in emails. Message our WhatsApp bot to compare ideas, generate full 60-minute build blueprints, and test fatal traps from your phone.
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Link
                href="/whatsapp"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <span>Launch Interactive Phone Simulator →</span>
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
              >
                Meta Webhook Policy
              </Link>
            </div>
          </div>

          {/* Quick Chat Preview Badge */}
          <div className="w-full lg:w-80 rounded-2xl p-4 bg-[#111b21] border border-white/10 shadow-2xl space-y-3 font-sans text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs">🧭</div>
              <div>
                <strong className="text-xs text-white block">Project Compass Bot</strong>
                <span className="text-[10px] text-emerald-400">online · Meta Verified</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202c33] text-xs text-slate-200 leading-relaxed">
              👋 Send me any project idea:
              <br />• <strong>compare: Idea 1 vs Idea 2</strong>
              <br />• <strong>contract: Idea</strong>
              <br />• <strong>break: Idea</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM MASTERCLASS CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Build Your Project This Weekend?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Zero cloud bills. Zero GPU requirements. Join hundreds of students shipping verified, viva-ready prototypes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <Link
            href="/compare"
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 hover:-translate-y-0.5 transition active:scale-95"
          >
            <span>Start Feasibility Scan Free →</span>
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition"
          >
            <span>Register for Free Masterclass</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
