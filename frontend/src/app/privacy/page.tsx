import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, MessageSquare, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-xl space-y-8 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Transparency Guarantee</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Privacy & Messaging Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last updated: October 2026 • NxtWave Growth Intern Challenge
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>WhatsApp Cloud API Policy</span>
            </h2>
            <p>
              Project Compass adheres strictly to Meta's Business Messaging guidelines.
              Our sandbox and production instances operate under the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <b>Zero Unsolicited Outreach:</b> We will never send unprompted marketing or cold
                outreach messages. Messages are sent solely in direct response to user-initiated queries.
              </li>
              <li>
                <b>Allowed Recipients Whitelist:</b> While in developer test mode, messages are
                exclusively sent to verified test numbers registered in the Meta Developer Console.
              </li>
              <li>
                <b>24-Hour Messaging Window:</b> All automated interactions respect the standard
                24-hour customer service window mandated by Meta.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              <span>Telemetry & Data Storage</span>
            </h2>
            <p>
              When you submit project ideas, generate contracts, or submit peer critiques:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <b>No Proprietary Code Is Stored:</b> Project Compass only accepts high-level concept
                summaries, target audiences, and tech stacks. We never request or store source code.
              </li>
              <li>
                <b>Local / Encrypted Persistence:</b> Contracts and evaluations are stored in our SQLite
                database instance or Supabase Postgres instance protected by environment credentials.
              </li>
              <li>
                <b>Anonymized Growth Metrics:</b> Funnel conversions and telemetry are tracked for
                hackathon evaluation purposes without third-party ad tracker pixels.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-purple-500" />
              <span>Open Source & Rights</span>
            </h2>
            <p>
              Project Compass is licensed under the permissive MIT Open Source license.
              You retain 100% intellectual property rights over any project concept, build contract,
              or product created using this platform.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Project Compass • Built with Next.js, TypeScript & FastAPI</span>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

