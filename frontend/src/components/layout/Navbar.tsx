"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Compass, Sun, Moon, Menu, X, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { name: "Compare", href: "/compare" },
  { name: "Build Contract", href: "/contract/bc_demo_rag" },
  { name: "Break My Build", href: "/challenge/bc_demo_rag" },
  { name: "WhatsApp", href: "/whatsapp" },
  { name: "Analytics", href: "/admin" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          scrolled ? "pt-2" : "pt-4"
        } pointer-events-none`}
      >
        <div
          className={`max-w-6xl mx-auto pointer-events-auto transition-all duration-300 ${
            scrolled ? "max-w-5xl" : "max-w-6xl"
          }`}
        >
          <div
            className={`glass-panel rounded-2xl flex items-center justify-between transition-all duration-300 ${
              scrolled
                ? "px-4 sm:px-5 h-14 shadow-lg shadow-black/8 dark:shadow-black/40"
                : "px-4 sm:px-6 h-16"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  Project Compass
                </span>
                <span className="hidden sm:inline text-[10px] font-bold text-indigo-500 dark:text-indigo-400 font-mono tracking-wider uppercase opacity-70">
                  2026
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-500" />
                    )}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {mounted ? (
                  isDark ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300" />
                  )
                ) : (
                  <div className="w-3.5 h-3.5" />
                )}
              </button>

              {/* CTA - Desktop */}
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                <span>Free Workshop</span>
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
                aria-label="Toggle Menu"
              >
                <div className={`transition-all duration-200 ${mobileMenuOpen ? "rotate-90 scale-90" : "rotate-0"}`}>
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 max-w-full glass-panel shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Project Compass</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV_LINKS.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/8 space-y-2">
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>Register Free Workshop</span>
          </Link>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            {mounted && isDark ? (
              <><Sun className="w-3.5 h-3.5 text-amber-400" /><span>Switch to Light Mode</span></>
            ) : (
              <><Moon className="w-3.5 h-3.5 text-indigo-600" /><span>Switch to Dark Mode</span></>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
