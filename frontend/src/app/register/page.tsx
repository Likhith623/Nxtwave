"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { registerWorkshop, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

const TRACKS = [
  "RAG Pipeline & Semantic Search",
  "WhatsApp Conversational Agent",
  "Micro-SaaS & Workflow Automation",
  "Developer CLI & Code Tooling",
  "Real-Time Collaborative WebSockets",
  "Browser Extensions & AI Copilots",
];

export default function RegisterPage() {
  const { success, error } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [github, setGithub] = useState("");
  const [track, setTrack] = useState(TRACKS[0]);

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<any | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_register");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("contract_id");
      if (cid) setContractId(cid);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      error("Please provide both your name and email.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerWorkshop({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_whatsapp: phone.trim() !== "+91" ? phone.trim() : undefined,
        track,
        github_handle: github.trim() || undefined,
      });

      setRegistered(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      success("Registration complete! Welcome to the 48-Hour Sprint.");
      trackAnalyticsEvent("workshop_registered", { email: email.trim(), track });
    } catch (err: any) {
      error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          <UserCheck className="w-3.5 h-3.5" />
          <span>100% FREE ONLINE MASTERCLASS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Build Your First AI Project in 60 Minutes
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Turn your 60-minute Build Contract into a runnable prototype live with NxtWave mentors at ₹0 cloud cost.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Registration Form */}
        <div className="lg:col-span-7">
          {!registered ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-500/30 space-y-5 bg-gradient-to-b from-slate-950 to-slate-900">
              
              {/* Linked Plan Pill */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    Your plan: 88/100 · 60-min build blueprint ready
                  </span>
                </div>
                {contractId && (
                  <Link
                    href={`/contract/${contractId}`}
                    className="text-[11px] font-bold text-emerald-400 underline"
                  >
                    View Plan ({contractId})
                  </Link>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Nikitha Kunapareddy"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  WhatsApp Phone
                </label>
                <input
                  type="tel"
                  placeholder="+919390471597"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub Profile
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/yourhandle"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Archetype Track
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Registering for Sprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Confirm My Registration</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>We never send spam. WhatsApp updates are opt-in and restricted.</span>
            </div>
          </form>
        </div>
      ) : (
        /* Confirmation Screen */
        <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl max-w-2xl mx-auto text-center border border-emerald-500/40 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            You are Registered!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
            Welcome aboard, <b>{fullName}</b>. Your sprint registration has been confirmed in our
            database.
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-left space-y-3 mb-8">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Attendee:</span>
              <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Email:</span>
              <span className="font-bold text-slate-900 dark:text-white">{email}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Track:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{track}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Registration ID:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {registered.registration_id || "REG_" + Math.random().toString(36).substring(2, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/compare"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Start Your Project Comparison
            </Link>
            <Link
              href="/contract/bc_demo_rag"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
            >
              Inspect Demo Contract
            </Link>
          </div>
        </div>
      )}
        </div>

        {/* Right Column: Slide 5 Growth Target Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* HOW WE REACH 500 */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                HOW WE REACH 500 (PLANNING TARGETS)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                ~31% end-to-end
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-base font-extrabold text-white">1,600</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Runs</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-base font-extrabold text-white">900</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Plans</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-base font-extrabold text-white">650</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Visits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <div className="text-base font-extrabold text-emerald-400">500</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Registered</div>
              </div>
            </div>
          </div>

          {/* ₹2,000 BUDGET · ₹0 ON TECH & CLOUD */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ₹2,000 · ₹0 ON TECH &amp; CLOUD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                ₹4 CAC Target
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block">₹800 club stipends</strong>
                <span className="text-[10px] text-slate-400">4 × ₹200 campus ambassadors</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block">₹600 rewards</strong>
                <span className="text-[10px] text-slate-400">Top 3 peer referrers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block">₹400 QR posters</strong>
                <span className="text-[10px] text-slate-400">40 A3 prints in labs &amp; hostels</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block">₹200 reserve</strong>
                <span className="text-[10px] text-slate-400">Day 5–6 WhatsApp backup boost</span>
              </div>
            </div>
          </div>

          {/* 7-DAY SPRINT */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              7-DAY SPRINT EXECUTION
            </span>
            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D1</div><div className="text-[9px] text-slate-400">Build</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D2</div><div className="text-[9px] text-slate-400">Clubs</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D3</div><div className="text-[9px] text-slate-400">Waves</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D4</div><div className="text-[9px] text-slate-400">Posters</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D5</div><div className="text-[9px] text-slate-400">Board</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="font-bold text-[11px] text-indigo-400">D6</div><div className="text-[9px] text-slate-400">Push</div></div>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30"><div className="font-bold text-[11px] text-emerald-400">D7</div><div className="text-[9px] text-emerald-400 font-bold">500</div></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
