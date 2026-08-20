"use client";

// RESPONSIBILITY: Renders a single table card for the waiter floor view.
// Shows status badge, table number, section label, active order info, and live KOT preparation badge.
// DATA FLOW: WaiterTableGrid → WaiterTableCard → UI

import { getBadgeConfig } from "@/config/statusBadgeConfig";
import type { WaiterTableCardProps } from "@/app/waiter/waiter_types/WaiterTypes";
import type { AppOrder } from "@/types/appTypes";
import { Bell, ChefHat, Check, QrCode, Sparkles } from "lucide-react";

const STATUS_WITH_ORDER = ["OCCUPIED", "BILLING_PENDING"] as const;

const STATUS_BORDER_CLASS: Record<string, string> = {
  AVAILABLE:       "border-success/40",
  OCCUPIED:        "border-danger/40",
  BILLING_PENDING: "border-warning/40",
  RESERVED:        "border-info/40",
  CLEANING:        "border-purple-500/40",
  DIRTY:           "border-amber-500/40",
};

const STATUS_GLOW_CLASS: Record<string, string> = {
  AVAILABLE:       "",
  OCCUPIED:        "shadow-danger/10",
  BILLING_PENDING: "shadow-warning/10",
  RESERVED:        "shadow-info/10",
  CLEANING:        "shadow-purple-500/10",
  DIRTY:           "shadow-amber-500/10",
};

export function WaiterTableCard({ table, orders = [], onTableClick, onQrClick, onMarkCleaned }: WaiterTableCardProps & { orders?: AppOrder[] }) {
  const badge = getBadgeConfig(table.status);

  const borderClass = STATUS_BORDER_CLASS[table.status] ?? "border-border";
  const glowClass   = STATUS_GLOW_CLASS[table.status]   ?? "";

  const hasOrder = (STATUS_WITH_ORDER as readonly string[]).includes(table.status);

  // Live KOT Status detection
  const activeOrder = orders.find((o) => o.id === table.currentOrderId);
  let kotStatus: "READY" | "COOKING" | "PENDING" | null = null;

  if (activeOrder && activeOrder.kots.length > 0) {
    const allItems = activeOrder.kots.flatMap((k) => k.items);
    if (allItems.some((i) => i.status === "READY")) {
      kotStatus = "READY";
    } else if (allItems.some((i) => i.status === "COOKING")) {
      kotStatus = "COOKING";
    } else if (allItems.some((i) => i.status === "PENDING")) {
      kotStatus = "PENDING";
    }
  }

  function handleClick() {
    onTableClick(table.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTableClick(table.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Table ${table.tableNumber}, ${table.section}, ${badge.label}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        "flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3.5 relative",
        "transition-all duration-200",
        "hover:scale-105 hover:shadow-lg",
        "focus-visible:ring-2 focus-visible:ring-primary",
        borderClass,
        glowClass,
      ].join(" ")}
    >
      {/* Top Status & KOT Badges */}
      <div className="flex items-center justify-between gap-1">
        <span
          className={[
            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5",
            "text-[10px] font-bold uppercase tracking-wide",
            badge.textColorClass,
            badge.bgColorClass,
          ].join(" ")}
        >
          {badge.label}
        </span>

        <div className="flex items-center gap-1">
          {/* Live KOT Badge */}
          {kotStatus === "READY" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[9px] font-extrabold text-white animate-pulse shadow-sm">
              <Bell size={10} className="animate-bounce" />
              <span>READY TO SERVE</span>
            </span>
          )}

          {kotStatus === "COOKING" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
              <ChefHat size={10} />
              <span>Cooking</span>
            </span>
          )}

          {/* Dedicated 1-Click QR Code Button */}
          {onQrClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQrClick(table);
              }}
              title="View Table QR Code"
              aria-label={`View Table ${table.tableNumber} QR Code`}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-page text-text-secondary transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              <QrCode size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table number */}
      <p className="text-[22px] font-extrabold leading-none text-text-primary mt-1">
        T-{table.tableNumber.replace(/^(table|tbl|t)-?/i, "").padStart(2, "0")}
      </p>

      {/* Section label */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-text-secondary font-medium">{table.section}</p>
        {table.mergedTables && table.mergedTables.length > 0 && (
          <span className="text-[9px] font-bold text-info bg-info/10 px-1.5 py-0.5 rounded">
            Merged
          </span>
        )}
      </div>

      {/* Active order info */}
      {hasOrder && table.currentOrderId !== null && (
        <p className="truncate text-[10px] font-bold font-mono text-primary mt-0.5">
          Order #{table.currentOrderId}
        </p>
      )}

      {/* Mark Cleaned CTA for CLEANING / DIRTY tables */}
      {(table.status === "CLEANING" || table.status === "DIRTY") && onMarkCleaned && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkCleaned(table.id);
          }}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-[10px] font-extrabold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all"
        >
          <Sparkles size={12} />
          <span>Mark Cleaned 🟢</span>
        </button>
      )}
    </div>
  );
}
