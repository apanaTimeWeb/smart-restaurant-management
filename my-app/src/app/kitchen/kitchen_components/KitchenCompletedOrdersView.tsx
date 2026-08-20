"use client";

// RESPONSIBILITY: Renders the Completed KOTs History view with order recall functionality.
// DATA FLOW: kitchen/page.tsx → KitchenCompletedOrdersView → onRecallKot → useKitchenKds → UI

import { History, RotateCcw, CheckCircle2 } from "lucide-react";
import type { KitchenCompletedOrdersViewProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

export function KitchenCompletedOrdersView({
  completedKots,
  onRecallKot,
}: KitchenCompletedOrdersViewProps) {
  if (completedKots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
        <History size={40} strokeWidth={1.5} />
        <p className="text-sm font-medium">No completed orders for this shift yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          Showing {completedKots.length} completed KOT{completedKots.length !== 1 ? "s" : ""} — click Recall to return order to live KDS
        </p>
      </div>

      {/* Grid of Completed KOT Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {completedKots.map((kot) => {
          const timeLabel = new Date(kot.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={kot.kotId}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card/70 p-4 opacity-90 transition-all hover:opacity-100 shadow-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border/50 pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-extrabold text-text-primary">
                    Table {kot.tableNumber}
                  </span>
                  <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                    KOT: {kot.kotId}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success">
                    <CheckCircle2 size={10} /> {kot.station}
                  </span>
                  <span className="text-[10px] text-text-secondary">{timeLabel}</span>
                </div>
              </div>

              {/* Items List */}
              <ul className="flex flex-col gap-1.5 py-1 text-xs">
                {kot.items.map((item) => (
                  <li key={item.itemId} className="flex items-center justify-between text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {item.itemId} <span className="text-text-secondary font-normal">× {item.qty}</span>
                    </span>
                    <span className="text-[10px] uppercase text-success font-semibold">READY</span>
                  </li>
                ))}
              </ul>

              {/* Recall Action Button */}
              <div className="pt-2 border-t border-border/40 flex justify-end">
                <button
                  onClick={() => onRecallKot(kot.kotId)}
                  aria-label={`Recall KOT ${kot.kotId} back to active KDS`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition-all hover:border-primary hover:text-primary hover:bg-page"
                >
                  <RotateCcw size={13} className="text-primary" /> Recall to KDS
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
