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

  useEffect(() => {
    trackAnalyticsEvent("page_view_register");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-4">
          <UserCheck className="w-3.5 h-3.5" />
          <span>NxtWave Growth Intern Challenge 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Register for Demo Day
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Lock in your place for the 48-Hour Sprint Showcase. Present your Build Contract,
          demonstrate your Hour-One milestone, and receive direct feedback from engineering mentors.
        </p>
      </div>

      {!registered ? (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
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
  );
}
