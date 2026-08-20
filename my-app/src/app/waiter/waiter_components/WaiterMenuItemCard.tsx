"use client";

// RESPONSIBILITY: Renders a single menu item card inside the order punching modal.
// Handles variant selection, special countdown, and the "+ Add" action.
// No cart state here — delegates to onAdd callback (Rule 6: logic in hook).
// DATA FLOW: WaiterOrderModal → WaiterMenuItemCard → onAdd → useWaiterOrder.addToCart

import { useState, useEffect } from "react";
import { Plus, Star, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { WaiterMenuItemCardProps } from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const NO_VARIANT      = ""           as const;
const SPECIAL_LABEL   = "Special"    as const;
const UNAVAIL_LABEL   = "Unavailable" as const;
const MS_PER_SECOND   = 1_000        as const;
const SECONDS_PER_MIN = 60           as const;
const SECONDS_PER_HR  = 3_600        as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats remaining ms into "Xh Ym" or "Ym" string for the countdown. */
function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "Expired";
  const totalSecs = Math.floor(remainingMs / MS_PER_SECOND);
  const hrs  = Math.floor(totalSecs / SECONDS_PER_HR);
  const mins = Math.floor((totalSecs % SECONDS_PER_HR) / SECONDS_PER_MIN);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Single menu item card for the order punching modal.
 * Shows name, price, variant selector, special badge, and countdown timer.
 */
export function WaiterMenuItemCard({ item, onAdd }: WaiterMenuItemCardProps) {
  const hasVariants = item.variants.length > 0;

  // Default to first variant if available, else empty string (no variant)
  const [selectedVariant, setSelectedVariant] = useState<string>(
    hasVariants ? item.variants[0].name : NO_VARIANT
  );

  // Countdown state — only active when item.isSpecial && specialExpiry exists
  const [countdown, setCountdown] = useState<string>("");

  // Countdown ticker — updates every minute
  // Why specialExpiry in deps: re-register if expiry changes
  useEffect(() => {
    if (!item.isSpecial || !item.specialExpiry) return;

    function tick() {
      const remaining = (item.specialExpiry ?? 0) - Date.now();
      setCountdown(formatCountdown(remaining));
    }

    tick(); // immediate first render
    const id = setInterval(tick, MS_PER_SECOND * SECONDS_PER_MIN);
    return () => clearInterval(id);
  }, [item.isSpecial, item.specialExpiry]);

  // Resolved display price — variant price if selected, else base price
  const displayPrice = hasVariants
    ? (item.variants.find((v) => v.name === selectedVariant)?.price ?? item.price)
    : item.price;

  function handleAdd() {
    if (!item.isAvailable) return;
    onAdd(item, selectedVariant, "");
  }

  function handleVariantChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedVariant(e.target.value);
  }

  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-3",
        "transition-all duration-200",
        !item.isAvailable && "opacity-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Name row + special badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold leading-snug text-text-primary">
          {item.name}
        </p>
        {item.isSpecial && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-semibold text-warning">
            <Star size={9} aria-hidden="true" />
            {SPECIAL_LABEL}
          </span>
        )}
      </div>

      {/* Countdown timer — only for specials with expiry */}
      {item.isSpecial && item.specialExpiry && countdown && (
        <p className="flex items-center gap-1 text-[11px] text-warning">
          <Clock size={10} aria-hidden="true" />
          {countdown}
        </p>
      )}

      {/* Variant selector */}
      {hasVariants && (
        <select
          value={selectedVariant}
          onChange={handleVariantChange}
          disabled={!item.isAvailable}
          aria-label={`Variant for ${item.name}`}
          className="rounded-md border border-border bg-input px-2 py-1 text-[12px] text-text-primary focus:border-border-focus focus:outline-none disabled:cursor-not-allowed"
        >
          {item.variants.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} — {formatCurrency(v.price)}
            </option>
          ))}
        </select>
      )}

      {/* Price + Add button row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-bold text-text-primary">
          {formatCurrency(displayPrice)}
        </p>

        {item.isAvailable ? (
          <button
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-hover active:scale-95"
          >
            <Plus size={12} aria-hidden="true" />
            Add
          </button>
        ) : (
          <span className="text-[11px] font-medium text-danger">
            {UNAVAIL_LABEL}
          </span>
        )}
      </div>
    </div>
  );
}
