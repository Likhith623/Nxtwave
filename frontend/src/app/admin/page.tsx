"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileCheck2,
  ShieldAlert,
  MessageSquare,
  Key,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getAdminMetrics, resetAdminData, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

const DEFAULT_SECRET = "compass_growth_admin_secret_2026";

export default function AdminPage() {
  const { success, error } = useToast();

  const [token, setToken] = useState(DEFAULT_SECRET);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchMetrics = async (authToken: string) => {
    try {
      setLoading(true);
      const data = await getAdminMetrics(authToken);
      setMetrics(data);
      success("Real-time metrics updated");
    } catch (err: any) {
      error(err.message || "Failed to load metrics. Check token.");
      // Provide demo metrics fallback if backend is waiting for events
      setMetrics({
        kpis: {
          total_visitors: 142,
          comparisons_run: 38,
          contracts_generated: 19,
          challenges_submitted: 12,
          registrations: 27,
          whatsapp_messages: 54,
        },
        funnel: [
          { stage: "Landing Page Visits", count: 142, conversion: "100%" },
          { stage: "Project Comparisons", count: 38, conversion: "26.7%" },
          { stage: "Build Contracts Generated", count: 19, conversion: "50.0%" },
          { stage: "Peer Challenges Filed", count: 12, conversion: "63.1%" },
          { stage: "Workshop Registrations", count: 27, conversion: "19.0%" },
        ],
        recent_contracts: [
          {
            contract_id: "bc_demo_rag",
            project_name: "Academic Document RAG Assistant",
            archetype: "RAG_PIPELINE",
            created_at: "Today",
          },
          {
            contract_id: "bc_auto_941",
            project_name: "WhatsApp Student Doubt Bot",
            archetype: "WHATSAPP_BOT",
            created_at: "Today",
          },
        ],
        recent_registrations: [
          {
            full_name: "Nikitha Kunapareddy",
            email: "nikitha@example.com",
            track: "RAG Pipeline & Semantic Search",
            created_at: "Today",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackAnalyticsEvent("page_view_admin");
    fetchMetrics(DEFAULT_SECRET);
  }, []);

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to re-seed default demo contracts and clear telemetry?")) {
      return;
    }

    try {
      setResetting(true);
      await resetAdminData(token);
      success("Demo data reset successfully!");
      fetchMetrics(token);
    } catch (err: any) {
      error(err.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const kpis = metrics?.kpis || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Growth & Product Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Sprint Analytics Dashboard
          </h1>
        </div>

        {/* Token Input & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Admin secret token"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => fetchMetrics(token)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Unique Visitors</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.total_visitors ?? 142}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Comparisons Run</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.comparisons_run ?? 38}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Contracts Issued</span>
            <FileCheck2 className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.contracts_generated ?? 19}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Peer Critiques</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.challenges_submitted ?? 12}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Registrations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.registrations ?? 27}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>WhatsApp Messages</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.whatsapp_messages ?? 54}
          </span>
        </div>
      </div>

      {/* Funnel & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Conversion Funnel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Sprint Conversion Funnel
          </h3>
          <div className="space-y-4">
            {(metrics?.funnel || []).map((step: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {step.stage}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {step.count} ({step.conversion})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.max(10, 100 - i * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Contracts Table */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Build Contracts
            </h3>
            <Link
              href="/contract/bc_demo_rag"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Seeded Contract</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-2 font-bold uppercase">Contract ID</th>
                  <th className="pb-2 font-bold uppercase">Project</th>
                  <th className="pb-2 font-bold uppercase">Archetype</th>
                  <th className="pb-2 font-bold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(metrics?.recent_contracts || []).map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {c.contract_id}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                      {c.project_name}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.archetype}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/contract/${c.contract_id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

