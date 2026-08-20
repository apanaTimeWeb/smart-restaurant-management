"use client";

// RESPONSIBILITY: Modal showing Kitchen Station Speed Analytics, Rush Hour Charts, and Efficiency Ratings.
// DATA FLOW: KitchenPage → setAnalyticsOpen → KitchenAnalyticsModal → UI

import { X, BarChart3, TrendingUp, Zap, Clock, ShieldCheck, Flame } from "lucide-react";
import type { KitchenAnalyticsModalProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

// Mock analytics data for current shift
const STATION_SPEEDS = [
  { station: "Main Kitchen", avgMins: 13.5, targetMins: 15, status: "EXCELLENT", color: "text-warning" },
  { station: "Bar / Drinks",  avgMins: 4.2,  targetMins: 5,  status: "FAST",      color: "text-info"    },
  { station: "Bakery / Desserts", avgMins: 8.8, targetMins: 10, status: "GOOD",  color: "text-success" },
];

const RUSH_HOURS = [
  { hour: "12 PM - 1 PM", count: 28, volume: "HIGH" },
  { hour: "1 PM - 2 PM",  count: 34, volume: "PEAK 🔥" },
  { hour: "2 PM - 3 PM",  count: 14, volume: "NORMAL" },
  { hour: "7 PM - 8 PM",  count: 42, volume: "PEAK 🔥" },
];

export function KitchenAnalyticsModal({ isOpen, onClose }: KitchenAnalyticsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kitchen Station Speed & Efficiency Analytics"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Kitchen Speed & Station Analytics</h2>
              <p className="text-xs text-text-secondary">Live shift performance, preparation speeds & rush hour breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-page hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 flex flex-col gap-5 text-xs">
          {/* Top Scorecard Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-surface p-3">
              <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                <Zap size={13} className="text-warning" /> Efficiency Index
              </span>
              <span className="text-xl font-extrabold text-success">94.2%</span>
              <span className="text-[10px] text-text-secondary">Above 90% Target</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-surface p-3">
              <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                <Clock size={13} className="text-info" /> Shift Avg Prep
              </span>
              <span className="text-xl font-extrabold text-text-primary">11.4 mins</span>
              <span className="text-[10px] text-text-secondary">-1.6m vs Yesterday</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-surface p-3">
              <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                <Flame size={13} className="text-danger" /> Peak Hour
              </span>
              <span className="text-xl font-extrabold text-danger">7 PM - 8 PM</span>
              <span className="text-[10px] text-text-secondary">42 KOTs fulfilled</span>
            </div>
          </div>

          {/* Station Prep Speed Breakdown */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-bold text-text-primary uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <TrendingUp size={14} className="text-primary" /> Station Preparation Speeds
            </h3>
            <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-page p-3">
              {STATION_SPEEDS.map((item) => (
                <div key={item.station} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">{item.station}</span>
                    <span className="text-[10px] text-text-secondary">Target: {item.targetMins} mins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-border/40 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(100, (item.avgMins / item.targetMins) * 100)}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-text-primary w-14 text-right">{item.avgMins} mins</span>
                    <span className={`text-[10px] font-bold ${item.color} uppercase w-16 text-right`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Rush Heatmap */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-bold text-text-primary uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Flame size={14} className="text-danger" /> Order Rush Volumes Today
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RUSH_HOURS.map((hr) => (
                <div key={hr.hour} className="flex flex-col gap-1 rounded-lg border border-border/50 bg-surface p-2.5">
                  <span className="font-semibold text-text-secondary text-[10px]">{hr.hour}</span>
                  <span className="font-bold text-text-primary text-sm">{hr.count} Orders</span>
                  <span className="text-[10px] font-bold text-warning">{hr.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
