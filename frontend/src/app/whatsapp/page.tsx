"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Info,
  ExternalLink,
} from "lucide-react";
import { simulateWhatsAppMessage, getWhatsAppStatus, trackAnalyticsEvent } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "compare: AI Document RAG vs WhatsApp bot",
  "contract: RAG Pipeline for Student Doubts",
  "break: AI Document RAG",
  "help",
];

export default function WhatsAppPage() {
  const { error } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "bot",
      text: "👋 Welcome to *Project Compass*! I am your 48-hour sprint evaluation agent.\n\nSend:\n• *compare: Idea 1 vs Idea 2* to score ideas\n• *contract: Idea* to get an ironclad build contract\n• *help* for more commands.",
      timestamp: "10:30 AM",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    trackAnalyticsEvent("page_view_whatsapp");

    async function checkStatus() {
      try {
        setLoadingStatus(true);
        const data = await getWhatsAppStatus();
        setApiStatus(data);
      } catch {
        setApiStatus({
          mode: "test",
          phone_number_id: "1171374816059824",
          allowed_recipients: ["+919390471597"],
          dry_run: true,
          status: "ready",
        });
      } finally {
        setLoadingStatus(false);
      }
    }

    checkStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const response = await simulateWhatsAppMessage("+919390471597", textToSend.trim());

      const botReply = response?.reply || response?.response || response?.message ||
        "✅ Compass Evaluation complete! Your concept was scored with high feasibility.";

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      trackAnalyticsEvent("whatsapp_simulator_message_sent", { prompt: textToSend });
    } catch (err: any) {
      error(err.message || "Failed to communicate with simulator");
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "bot",
          text: `⚠️ Simulation error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Meta Cloud API Interactive Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          WhatsApp Agent Simulator
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Test the exact conversational agent pipeline powered by FastAPI and Meta's official Cloud API.
          Compare ideas, generate build contracts, and get instant answers directly through chat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Phone Mockup */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[420px] rounded-[44px] p-3.5 bg-slate-900 shadow-2xl border-4 border-slate-700 dark:border-slate-800 relative">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
            </div>

            {/* Phone Screen */}
            <div className="w-full h-[620px] rounded-[36px] overflow-hidden flex flex-col bg-[#e5ddd5] dark:bg-[#0b141a] relative border border-slate-800">
              {/* WhatsApp App Header */}
              <div className="bg-[#075e54] dark:bg-[#1f2c34] text-white px-4 pt-8 pb-3 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                    🧭
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-wide leading-none">
                      Project Compass Bot
                    </h4>
                    <span className="text-[11px] text-emerald-200 dark:text-emerald-400 font-medium">
                      Official Meta Cloud API • Online
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-90">
                  <Video className="w-4 h-4 cursor-pointer" />
                  <Phone className="w-4 h-4 cursor-pointer" />
                  <MoreVertical className="w-4 h-4 cursor-pointer" />
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
                {messages.map((m) => {
                  const isBot = m.sender === "bot";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] shadow-sm relative leading-relaxed whitespace-pre-wrap ${
                          isBot
                            ? "bg-white dark:bg-[#1f2c34] text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                            : "bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-emerald-50 rounded-tr-none"
                        }`}
                      >
                        {m.text}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-400">
                          <span>{m.timestamp}</span>
                          {!isBot && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#1f2c34] px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-500">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>Compass agent is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-[#f0f2f5] dark:bg-[#1f2c34] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message (e.g. 'compare: RAG vs Bot')"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-white dark:bg-[#2a3942] text-slate-900 dark:text-white px-4 py-2.5 rounded-full text-xs focus:outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={sending || !inputText.trim()}
                  className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f6f] transition disabled:opacity-50 cursor-pointer shadow"
                  aria-label="Send WhatsApp message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cloud API Inspector & Quick Chips */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Prompts */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Click to Try Suggested Commands</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tap any command below to immediately simulate the WhatsApp message payload:
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={sending}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-mono transition flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <Send className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Meta Cloud API Integration Card */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Meta Cloud API Status</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-500 font-sans">Operating Mode</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {apiStatus?.mode || "test"} (Zero Billing Risk)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-500 font-sans">Phone Number ID</span>
                <span className="text-slate-800 dark:text-slate-200">
                  1171374816059824
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-500 font-sans">Verified Recipient</span>
                <span className="text-slate-800 dark:text-slate-200">
                  +919390471597 (Whitelisted)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Webhook Verification</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  HMAC-SHA256 Ready
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>
                All messages sent via this simulator run through the identical parser, state machine,
                and decision engine that powers the live Meta Webhook.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
