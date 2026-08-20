"use client";

// RESPONSIBILITY: Renders a single KOT card for the Kitchen KDS.
// Shows table number, KOT id, station badge, priority badges (RUSH 🔥 / VIP ⭐), live elapsed time, item list,
// per-item status pipeline, bulk actions (Start All / Mark All Ready),
// thermal ticket print preview button, recipe info modal trigger, "Notify Waiter" pickup broadcast,
// and interactive Waiter Void Request approve/reject buttons.
// DATA FLOW: KitchenKotGrid → KitchenKotCard → KitchenStatusPipeline / KitchenPrepTimeInput → UI

import { useState, useEffect } from "react";
import { Printer, Info, CheckCheck, Play, Check, X, Clock, Flame, Star, BellRing } from "lucide-react";
import { KitchenStatusPipeline } from "./KitchenStatusPipeline";
import { KitchenPrepTimeInput } from "./KitchenPrepTimeInput";
import { OrderCountdownTimer } from "@/components/ui/OrderCountdownTimer";
import type { KitchenKotCardProps, KitchenPipelineStep } from "@/app/kitchen/kitchen_types/KitchenTypes";
import type { KotItemStatus } from "@/types/appTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const STATION_BORDER: Record<string, string> = {
  Kitchen: "border-l-warning",
  Bar:     "border-l-info",
  Bakery:  "border-l-success",
};

const STATION_BADGE: Record<string, string> = {
  Kitchen: "bg-warning-bg text-warning",
  Bar:     "bg-info-bg text-info",
  Bakery:  "bg-success-bg text-success",
};

const PIPELINE_STATUSES: KotItemStatus[] = ["PENDING", "COOKING", "READY"];

const WARNING_ELAPSED_SEC = 450;  // 7.5 minutes (Yellow)
const EXCEEDED_ELAPSED_SEC = 600; // 10 minutes (Orange)
const URGENT_ELAPSED_SEC   = 900; // 15 minutes (Red)

// ─── Elapsed Time Helper ──────────────────────────────────────────────────────

function getElapsedLabel(timestamp: number, nowMs: number): string {
  const diffSec = Math.floor((nowMs - timestamp) / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins}m ${secs}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KitchenKotCard({
  kot,
  onStatusChange,
  onBatchStatusChange,
  onVoidDecision,
  onItemPrepTimeSet,
  onOpenRecipe,
  onOpenTicket,
  onNotifyWaiter,
  savingKey,
}: KitchenKotCardProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Live elapsed timer — updates every second
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedSec  = Math.floor((nowMs - kot.timestamp) / 1000);
  const isUrgent    = elapsedSec >= URGENT_ELAPSED_SEC;
  const isExceeded  = elapsedSec >= EXCEEDED_ELAPSED_SEC && !isUrgent;
  const isWarning   = elapsedSec >= WARNING_ELAPSED_SEC && !isExceeded && !isUrgent;

  const isRush = kot.priority === "RUSH";
  const isVip  = kot.priority === "VIP";

  const stationBorderClass = STATION_BORDER[kot.station] ?? "border-l-border";
  const badgeClass         = STATION_BADGE[kot.station]  ?? "bg-card text-text-secondary";

  // SLA Urgency Border Styling
  const borderClass = isRush
    ? "border-l-danger border-l-[6px] ring-2 ring-danger/50 bg-danger-bg/20 animate-pulse"
    : isUrgent
    ? "border-l-red-600 border-l-[6px] ring-2 ring-red-600/50 bg-red-500/10 animate-pulse"
    : isExceeded
    ? "border-l-orange-500 border-l-[5px] ring-1 ring-orange-500/40 bg-orange-500/10"
    : isWarning
    ? "border-l-amber-500 border-l-[5px] ring-1 ring-amber-500/30 bg-amber-500/10"
    : `${stationBorderClass} border-l-[5px]`;

  const hasPendingItems = kot.items.some((item) => item.status === "PENDING");
  const hasCookingItems = kot.items.some((item) => item.status === "COOKING" || item.status === "PENDING");
  const hasReadyItems   = kot.items.some((item) => item.status === "READY");

  return (
    <div
      className={[
        "group flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-b from-card to-page p-4",
        "shadow-sm transition-all duration-300 hover:shadow-md",
        borderClass,
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-extrabold text-text-primary tracking-tight">
              Table {kot.tableNumber}
            </span>

            {/* Priority Badges */}
            {isRush && (
              <span className="flex items-center gap-1 rounded bg-danger px-1.5 py-0.5 text-[10px] font-black text-white uppercase animate-bounce">
                <Flame size={10} /> RUSH
              </span>
            )}
            {isVip && (
              <span className="flex items-center gap-1 rounded bg-warning px-1.5 py-0.5 text-[10px] font-black text-black uppercase">
                <Star size={10} /> VIP
              </span>
            )}

            {/* Ticket Print Button */}
            <button
              onClick={() => onOpenTicket(kot)}
              title="Print Thermal Ticket"
              aria-label={`Print ticket for KOT ${kot.kotId}`}
              className="rounded p-1 text-text-secondary hover:bg-surface hover:text-primary transition-colors"
            >
              <Printer size={14} />
            </button>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary">
            KOT: {kot.kotId}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* Station badge */}
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              badgeClass,
            ].join(" ")}
          >
            {kot.station}
          </span>

          {/* Elapsed time */}
          <span
            className={[
              "flex items-center gap-1 text-[11px] font-semibold tabular-nums",
              isUrgent
                ? "text-danger font-extrabold"
                : isWarning
                ? "text-warning font-bold"
                : "text-text-secondary",
            ].join(" ")}
          >
            <Clock size={11} />
            {getElapsedLabel(kot.timestamp, nowMs)}
          </span>
        </div>
      </div>

      {/* ── Bulk Action & Pickup Broadcast Header Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/80 rounded-lg px-2.5 py-1.5 border border-border/40">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Quick Actions</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {hasPendingItems && (
            <button
              onClick={() => onBatchStatusChange(kot.kotId, "COOKING")}
              aria-label="Start all pending items cooking"
              className="flex items-center gap-1 rounded bg-warning-bg px-2 py-0.5 text-[10px] font-bold text-warning hover:bg-warning/20 transition-colors"
            >
              <Play size={10} /> Start All
            </button>
          )}
          {hasCookingItems && (
            <button
              onClick={() => onBatchStatusChange(kot.kotId, "READY")}
              aria-label="Mark all items as ready"
              className="flex items-center gap-1 rounded bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success hover:bg-success/20 transition-colors"
            >
              <CheckCheck size={10} /> Mark All Ready
            </button>
          )}
          {hasReadyItems && onNotifyWaiter && (
            <button
              onClick={() => onNotifyWaiter(kot)}
              aria-label="Broadcast pickup alert to waiter"
              className="flex items-center gap-1 rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <BellRing size={10} /> Notify Waiter
            </button>
          )}
        </div>
      </div>

      {/* ── Item list ── */}
      <ul className="flex flex-col gap-2.5">
        {kot.items.map((item) => {
          const isVoidRequested = item.status === "VOID_REQUESTED";
          const isPipelineItem  = (PIPELINE_STATUSES as string[]).includes(item.status);
          const itemSavingKey   = `${kot.kotId}-${item.itemId}`;
          const isSaving        = savingKey === itemSavingKey;

          return (
            <li
              key={item.itemId}
              className={[
                "flex flex-col gap-2 rounded-lg p-3 transition-colors duration-200 border",
                isVoidRequested 
                  ? "animate-pulse bg-danger-bg border-danger/40 ring-1 ring-danger/30" 
                  : "bg-surface border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
              ].join(" ")}
            >
              {/* Item name + qty + notes + Recipe spec trigger */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-text-primary">
                      {item.itemId} <span className="text-text-secondary font-medium ml-1">× {item.qty}</span>
                    </span>
                    <button
                      onClick={() => onOpenRecipe(item.itemId)}
                      title="View Recipe & Allergen Spec"
                      aria-label={`View recipe spec for ${item.itemId}`}
                      className="rounded text-text-disabled hover:text-primary transition-colors"
                    >
                      <Info size={13} />
                    </button>
                  </div>
                  {item.notes && (
                    <span className="text-[11px] italic text-text-secondary bg-page rounded w-fit px-1.5 py-0.5 mt-0.5">
                      Note: {item.notes}
                    </span>
                  )}
                </div>

                {/* Countdown Timer & Saving Spinner */}
                <div className="flex items-center gap-2">
                  {item.prepEndsAt && item.status !== "READY" && (
                    <OrderCountdownTimer prepEndsAt={item.prepEndsAt} />
                  )}
                  {isSaving && (
                    <span className="text-[10px] text-text-secondary animate-pulse">
                      saving…
                    </span>
                  )}
                </div>
              </div>

              {/* Action row: Pipeline and Prep Time Input */}
              {isPipelineItem && (
                <div className="flex items-center justify-between gap-3 mt-1 pt-2 border-t border-border/40">
                  <KitchenStatusPipeline
                    currentStatus={item.status}
                    isDisabled={isSaving}
                    onStatusChange={(newStatus: KitchenPipelineStep) =>
                      onStatusChange(kot.kotId, item.itemId, newStatus)
                    }
                  />
                  {(item.status === "PENDING" || item.status === "COOKING") && (
                    <div className="shrink-0">
                      <KitchenPrepTimeInput
                        currentMins={item.prepTimeMins || 0}
                        onSet={(mins) => onItemPrepTimeSet(kot.orderId, kot.kotId, item.itemId, mins)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Waiter Void Request Decision Buttons */}
              {isVoidRequested && (
                <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-danger/30">
                  <span className="text-[11px] font-bold text-danger uppercase tracking-wider">
                    ⚠️ Waiter Void Requested
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVoidDecision(kot.orderId, kot.kotId, item.itemId, true)}
                      aria-label="Approve void request"
                      className="flex items-center gap-1 rounded bg-danger px-2.5 py-1 text-[11px] font-bold text-white hover:bg-danger/80 transition-colors"
                    >
                      <Check size={11} /> Approve Void
                    </button>
                    <button
                      onClick={() => onVoidDecision(kot.orderId, kot.kotId, item.itemId, false)}
                      aria-label="Reject void request (already cooking)"
                      className="flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-text-primary hover:bg-surface transition-colors"
                    >
                      <X size={11} /> Reject (Cooking)
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


