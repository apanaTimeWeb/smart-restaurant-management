"use client";

// RESPONSIBILITY: Hero section for landing page showcasing fine dining & smart POS features.
// DATA FLOW: Renders Hero title, subtitle, CTA links, and badge counters.

import React from "react";
import Link from "next/link";
import { Sparkles, Calendar, LogIn, ChevronRight, ShieldCheck, Zap, Award } from "lucide-react";

export function HomeHeroSection(): React.JSX.Element {
  return (
    <section id="hero" className="relative overflow-hidden bg-page py-16 sm:py-24 border-b border-border">
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Smart Restaurant Management & POS System</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Experience Authentic Culinary Excellence & <span className="text-primary">Instant Digital Ordering</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-text-secondary">
            Welcome to <strong className="text-text-primary">Royal Spice Bistro & Bar</strong>. Enjoy gourmet Indian delicacies,
            advance table pre-booking, and instant QR ordering powered by our enterprise offline-first POS architecture.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/auth/customer-signup"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Reserve Table & Pre-Order</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-border-focus hover:bg-primary/5 hover:-translate-y-0.5"
            >
              <LogIn className="h-4 w-4 text-primary" />
              <span>Staff / Admin Sign In</span>
            </Link>
          </div>

          {/* Feature Highlights Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-4xl text-left">
            <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Security</span>
              </div>
              <p className="mt-1.5 text-base font-extrabold text-text-primary">5-Role RBAC</p>
              <p className="text-[11px] text-text-secondary">Strict isolated terminals</p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-success">
                <Zap className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Speed</span>
              </div>
              <p className="mt-1.5 text-base font-extrabold text-text-primary">Real-Time Sync</p>
              <p className="text-[11px] text-text-secondary">Sub-second cross-tab</p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-warning">
                <Award className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Menu</span>
              </div>
              <p className="mt-1.5 text-base font-extrabold text-text-primary">21+ Dishes</p>
              <p className="text-[11px] text-text-secondary">Combos & Happy Hours</p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-info">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Booking</span>
              </div>
              <p className="mt-1.5 text-base font-extrabold text-text-primary">10 Tables</p>
              <p className="text-[11px] text-text-secondary">Dining, AC & Outdoor</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
