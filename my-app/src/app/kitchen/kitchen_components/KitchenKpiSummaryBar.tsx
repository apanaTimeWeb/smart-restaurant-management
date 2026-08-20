"use client";

// RESPONSIBILITY: Live Kitchen KPI & SLA summary metrics bar.
// Displays active KOT count, urgent order alerts (>15m), avg prep time, ready items waiting for pickup, out-of-stock items, sound test, and analytics.
// DATA FLOW: kitchen/page.tsx → KitchenKpiSummaryBar → UI

import { Flame, Clock, AlertTriangle, CheckCircle2, AlertOctagon, Volume2, VolumeX, BellRing, BarChart3 } from "lucide-react";
import type { KitchenKpiSummaryBarProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

export function KitchenKpiSummaryBar({
  metrics,
  isMuted,
  onToggleMute,
  onTestSound,
  onOpenAnalytics,
  onSelectStockTab,
}: KitchenKpiSummaryBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Top Title & Audio Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Flame size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">Kitchen Operations Overview</h2>
            <p className="text-[11px] text-text-secondary">Real-time KDS performance & station alert metrics</p>
          </div>
        </div>

        {/* Audio & Analytics Controls */}
        <div className="flex items-center gap-2">
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              aria-label="Open Kitchen Station Speed Analytics"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-page px-2.5 py-1 text-xs font-semibold text-text-primary hover:border-primary hover:text-primary transition-colors"
            >
              <BarChart3 size={13} className="text-primary" />
              Station Analytics
            </button>
          )}

          <button
            onClick={onTestSound}
            aria-label="Test kitchen alert bell"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-page px-2.5 py-1 text-xs font-semibold text-text-primary hover:border-primary hover:text-primary transition-colors"
          >
            <BellRing size={13} className="text-warning" />
            Test Bell
          </button>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute audio alerts" : "Mute audio alerts"}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold border transition-all duration-200",
              isMuted
                ? "border-danger/30 bg-danger-bg text-danger hover:bg-danger/20"
                : "border-success/30 bg-success-bg text-success hover:bg-success/20",
            ].join(" ")}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isMuted ? "Sound Off" : "Sound On"}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Active KOTs */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3 transition-colors hover:border-primary/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <Flame size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Active KOTs</span>
            <span className="text-lg font-extrabold text-text-primary">{metrics.totalActiveKots}</span>
          </div>
        </div>

        {/* Card 2: Urgent Orders (>15m) */}
        <div
          className={[
            "flex items-center gap-3 rounded-xl border p-3 transition-colors",
            metrics.urgentCount > 0
              ? "border-danger bg-danger-bg/40 text-danger animate-pulse ring-1 ring-danger/30"
              : "border-border/60 bg-surface text-text-primary hover:border-warning/40",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              metrics.urgentCount > 0 ? "bg-danger text-white" : "bg-warning-bg text-warning",
            ].join(" ")}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Delayed (&gt;15m)</span>
            <span className={metrics.urgentCount > 0 ? "text-lg font-extrabold text-danger" : "text-lg font-extrabold text-text-primary"}>
              {metrics.urgentCount}
            </span>
          </div>
        </div>

        {/* Card 3: Avg Prep Time */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3 transition-colors hover:border-info/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <Clock size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Target Prep Time</span>
            <span className="text-lg font-extrabold text-text-primary">{metrics.avgPrepTimeMins} mins</span>
          </div>
        </div>

        {/* Card 4: Ready for Pickup */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3 transition-colors hover:border-success/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Ready Items</span>
            <span className="text-lg font-extrabold text-text-primary">{metrics.readyItemsCount}</span>
          </div>
        </div>

        {/* Card 5: Out of Stock (Interactive Clickable Card) */}
        <div
          onClick={() => {
            if (onSelectStockTab) onSelectStockTab("OUT_OF_STOCK");
          }}
          title="Click to view & filter Out of Stock items"
          className="flex items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3 transition-all cursor-pointer hover:bg-danger/20 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-danger/30 shadow-xs"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger text-white shadow-xs">
            <AlertOctagon size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-danger uppercase tracking-wider">Out of Stock ↗</span>
            <span className="text-lg font-black text-danger">{metrics.outOfStockCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

