"use client";

// RESPONSIBILITY: About Us section highlighting restaurant story, quality standards, and offline POS tech.
// DATA FLOW: Renders About content and feature highlights.

import React from "react";
import { CheckCircle2, ShieldCheck, Heart, Coffee } from "lucide-react";

export function HomeAboutSection(): React.JSX.Element {
  return (
    <section id="about" className="py-16 bg-page border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Column: Narrative */}
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Heritage & Tech</span>
            <h2 className="mt-1 text-2xl font-black text-text-primary sm:text-4xl">
              Authentic Flavors Powered by Zero-Latency Smart POS
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
              Founded with a passion for authentic North Indian, Tandoori, and Mughlai culinary art,
              <strong className="text-text-primary"> Royal Spice Bistro</strong> pairs traditional recipes with cutting-edge
              smart restaurant management.
            </p>
            <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
              Our in-house POS architecture ensures zero ordering delays, real-time kitchen KDS dispatch,
              and sub-second cross-tab synchronization with 100% offline-first reliability.
            </p>

            <div className="mt-6 space-y-3 text-xs text-text-primary font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span>100% Fresh & Authentic Local Spices with Hygiene Rating 5/5</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span>Zero-Delay Kitchen KDS Dispatch for Starters & Main Courses</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span>Instant Table QR Self-Ordering & Advance Booking System</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span>Multi-Tax Compliant Thermal Receipts & Split Billing Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Highlight Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-text-primary">Clean Hygiene</h3>
              <p className="mt-1 text-xs text-text-secondary">Strictly audited 5-star kitchen sanitation</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <Heart size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-text-primary">Passionate Chefs</h3>
              <p className="mt-1 text-xs text-text-secondary">Master chefs with 15+ years experience</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Coffee size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-text-primary">Cozy Ambience</h3>
              <p className="mt-1 text-xs text-text-secondary">Dining, AC & Outdoor seating areas</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-text-primary">Loyalty Rewards</h3>
              <p className="mt-1 text-xs text-text-secondary">5% instant cashback points on every bill</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
