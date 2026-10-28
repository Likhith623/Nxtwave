"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  User,
  Send,
  RefreshCw,
  Cpu,
  Bot,
} from "lucide-react";
import { getContract, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  isCritique?: boolean;
  timestamp: string;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_challenge", { contract_id: contractId });

    async function loadData() {
      try {
        setLoadingContract(true);
        const data = await getContract(contractId);
        setContract(data);

        // Initial AI greeting message
        const title = data.project_name || data.project_title || "Academic Document RAG Assistant";
        const score = data.feasibility_score || 88;
        const assumption = data.critical_assumption || "Students will primarily query policies explicitly stated in the indexed PDF handbook.";

        setMessages([
          {
            id: "msg_init",
            sender: "bot",
            text: `👋 Hey! Your classmate shared their 60-minute build plan for **${title}** (Feasibility: **${score}/100**).\n\nTheir load-bearing assumption is:\n> *“${assumption}”*\n\nTry to break their build! Ask how their ₹0 architecture works, probe edge-cases (e.g. *“What if circulars change?”* or *“Can it run without GPU?”*), or challenge their design!`,
            timestamp: "Just now",
          },
        ]);
      } catch {
        // Fallback demo data
        const fallback = {
          contract_id: contractId,
          project_title: "Academic Document RAG Assistant",
          feasibility_score: 88,
          category: "RAG & Document Intelligence",
          critical_assumption: "What happens when someone asks an unlisted question? If the model hallucinates non-existent rules, students act on false advice.",
          frontend_rec: "Next.js / HTML5 Chat Interface",
          backend_rec: "FastAPI + Pydantic v2",
          ai_model_rec: "Sentence-Transformers on CPU",
          db_rec: "SQLite (Local ₹0)",
        };
        setContract(fallback);
        setMessages([
          {
            id: "msg_init",
            sender: "bot",
            text: `👋 Hey! Your classmate shared their 60-minute build plan for **${fallback.project_title}** (Score: **88/100**).\n\nTheir critical assumption is:\n> *“${fallback.critical_assumption}”*\n\nAsk me anything about how this build works, or test edge-cases to break their build!`,
            timestamp: "Just now",
          },
        ]);
      } finally {
        setLoadingContract(false);
      }
    }

    loadData();
  }, [contractId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Mini 3D Pie Chart Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 260;
    const h = 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const data = [
      { minutes: 10, color: "#f43f5e" },
      { minutes: 15, color: "#6366f1" },
      { minutes: 10, color: "#8b5cf6" },
      { minutes: 15, color: "#10b981" },
      { minutes: 10, color: "#f59e0b" },
    ];

    const cx = w / 2;
    const cy = h / 2;
    const rx = 85;
    const ry = 58;
    const depth = 12;

    let startAngle = -Math.PI / 2;
    const slices = data.map((s) => {
      const sweep = (s.minutes / 60) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const item = { ...s, startAngle, endAngle };
      startAngle = endAngle;
      return item;
    });

    for (let l = depth; l >= 1; l--) {
      slices.forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy + l, rx, ry, 0, s.startAngle, s.endAngle);
        ctx.lineTo(cx, cy + l);
        ctx.fillStyle = "#1e1b4b";
        ctx.fill();
      });
    }

    slices.forEach((s) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, s.startAngle, s.endAngle);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#0b1020";
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#090e1a";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("60m", cx, cy);
  }, [contract]);

  const handleSendMessage = async (text?: string) => {
    const msg = text || inputMsg;
    if (!msg.trim() || sending) return;

    const userEntry: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: msg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputMsg("");
    setSending(true);

    try {
      const res = await fetch(`/api/contracts/${contractId}/challenges/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg.trim(), peer_name: "Classmate" }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const botEntry: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "bot",
        text: data.reply,
        isCritique: data.is_critique,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botEntry]);
      trackAnalyticsEvent("peer_challenge_chat_message", { is_critique: data.is_critique });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b_err_${Date.now()}`,
          sender: "bot",
          text: "The architecture evaluates this query as an edge-case. Try checking the 60-minute plan on the right, or click 'Test My Idea Free' to run your own project!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">

      {/* Top Header */}
      <div>
        <div className="flex gap-2 flex-wrap mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PEER REVIEW &amp; STRESS-TEST ARENA
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            BREAK MY BUILD
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ZERO LOGIN REQUIRED
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Peer Review &amp; <span className="text-purple-400">AI Stress-Test Arena</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Your classmate shared their final-year AI project plan for <strong>{contract?.project_title || "Academic Document RAG Assistant"}</strong> (Score: <strong>{contract?.feasibility_score || 88}/100</strong>). Chat with the AI, probe edge-cases, or see if your own idea can beat their score!
        </p>
      </div>

      {/* 🔥 TEMPTING CTA BANNER: "Wait... what would MINE score?" */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-500/15 via-amber-500/15 to-indigo-500/15 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <strong className="text-base sm:text-lg font-bold text-white block">
              “Wait… what would MY idea score?!”
            </strong>
            <span className="text-xs text-slate-300">
              Curious if your own final-year idea is feasible? Get an instant score across 6 weighted criteria with ₹0 cloud budget.
            </span>
          </div>
        </div>
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition whitespace-nowrap text-center active:scale-95"
        >
          <span>Test My Idea Free → (Start Over)</span>
        </Link>
      </div>

      {/* Two-Column Grid: Left = AI Chat Room, Right = Friend's 60-Min Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

        {/* LEFT: Interactive Gemini AI Chat Room */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-950/90 border border-indigo-500/40 flex flex-col h-[640px] shadow-2xl overflow-hidden">

          {/* Chat Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <strong className="text-xs font-bold text-white block">Project Compass AI Assistant</strong>
                <span className="text-[10px] text-slate-400">Testing: {contract?.project_title || "Project Plan"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Gemini 2.5 Flash
              </span>
              <Link
                href="/"
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                Score My Idea 🚀
              </Link>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3.5 py-2 bg-slate-900/50 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage("What if fees or rules change in the 2026 circular?")}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] text-indigo-200 transition"
            >
              ⚡ What if fees change in 2026?
            </button>
            <button
              onClick={() => handleSendMessage("Can this really run on CPU with zero cloud costs?")}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] text-indigo-200 transition"
            >
              💻 Can it run on CPU for ₹0?
            </button>
            <button
              onClick={() => handleSendMessage("What happens when someone asks an unlisted question?")}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] text-indigo-200 transition"
            >
              ❓ Unlisted questions test
            </button>
            <button
              onClick={() => handleSendMessage("How will this pass the professor viva review?")}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] text-indigo-200 transition"
            >
              🎓 Viva presentation advice
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${isBot
                        ? "bg-slate-900/90 text-slate-100 rounded-tl-2xs border border-white/10"
                        : "bg-indigo-600 text-white rounded-tr-2xs shadow-md shadow-indigo-600/30"
                      }`}
                  >
                    {isBot && (
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-cyan-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Project Compass AI</span>
                        {m.isCritique && (
                          <span className="ml-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🚨 BUILD BREAKER DETECTED
                          </span>
                        )}
                      </div>
                    )}
                    <div>{m.text}</div>
                    {isBot && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-indigo-300 flex items-center justify-between">
                        <span>Curious about your own project?</span>
                        <Link href="/" className="text-emerald-400 font-bold underline">
                          Test My Idea Free →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-900/90 px-3.5 py-2 rounded-2xl rounded-tl-2xs text-xs text-slate-400 flex items-center gap-2 border border-white/10">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Evaluating architecture on Gemini 2.5 Flash...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or drop a critique to break this build..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* RIGHT: Friend's Blueprint & 60-Min Pie Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-950/80 border border-white/10 p-5 space-y-4">

          <div className="pb-3 border-b border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                FRIEND&apos;S PROJECT
              </span>
              <span className="font-mono text-xs font-black text-emerald-400">
                {contract?.feasibility_score || 88}/100 SCORE
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {contract?.project_title || "Academic Document RAG Assistant"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-3">
              {contract?.original_idea || "Interactive policy QA bot grounded in university handbooks."}
            </p>
          </div>

          {/* Mini 60-Minute Pie Chart */}
          <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/20 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
              ● EXACTLY 60 MINUTES PROTOTYPE PLAN
            </span>
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 text-left pt-2 border-t border-white/5">
              <div><span className="text-rose-400 font-bold">●</span> Scaffold: 10m</div>
              <div><span className="text-indigo-400 font-bold">●</span> Core AI: 15m</div>
              <div><span className="text-violet-400 font-bold">●</span> Query test: 10m</div>
              <div><span className="text-emerald-400 font-bold">●</span> Web UI: 15m</div>
              <div><span className="text-amber-400 font-bold">●</span> Verify: 10m</div>
              <div className="text-emerald-400 font-bold">Total: 60m (₹0)</div>
            </div>
          </div>

          {/* The ₹0 Tech Stack */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
            <strong className="text-white block font-bold">⚙️ The ₹0 Tech Stack:</strong>
            <div className="grid grid-cols-2 gap-1.5 text-slate-300 text-[11px]">
              <div><strong>Backend:</strong> {contract?.backend_rec || "FastAPI"}</div>
              <div><strong>Frontend:</strong> {contract?.frontend_rec || "Next.js"}</div>
              <div><strong>Model:</strong> {contract?.ai_model_rec || "MiniLM CPU"}</div>
              <div><strong>DB:</strong> {contract?.db_rec || "Local SQLite"}</div>
            </div>
          </div>

          {/* Load-Bearing Assumption */}
          <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-500 text-xs space-y-1">
            <strong className="text-amber-300 block font-bold">⚠️ Critical Assumption Under Test:</strong>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              &ldquo;{contract?.critical_assumption || "Students will only query policies explicitly in PDF."}&rdquo;
            </p>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/contract/${contractId}`}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs text-center transition"
            >
              View Full 6-Pillar Blueprint 📋
            </Link>
            <Link
              href={`/compare?from_contract=${contractId}`}
              className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-semibold text-xs text-center transition"
            >
              🔄 Remix This Plan as My Context →
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs text-center transition shadow-md"
            >
              🚀 Test My Own Project Idea Free →
            </Link>
          </div>

        </div>

      </div>

      {/* VIRAL LOOP RESTART BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 text-center space-y-3 shadow-xl">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
          THE VIRAL LOOP RESTARTS
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          “Your plan breaks if fees change.” · “Wait. Mine?!”
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          No ads. No rupee. Just ego, curiosity, and a WhatsApp group. Every friend who tests this plan becomes a visitor who tests their own.
        </p>
        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
          >
            🔥 Test Your Own Project Idea Free →
          </Link>
          <Link
            href={`/compare?from_contract=${contractId}`}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
          >
            Remix With This Context →
          </Link>
        </div>
      </div>

    </div>
  );
}
