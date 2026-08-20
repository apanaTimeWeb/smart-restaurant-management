"use client";

// RESPONSIBILITY: Inline prep time input for the Kitchen KDS.
// Shows "Est. prep: [__] min" — saves on Enter key or blur.
// Only rendered when KOT has at least one PENDING item (first accept).
// DATA FLOW: KitchenKotCard → KitchenPrepTimeInput → onSet → useKitchenKds → localStorage

import { useState, useEffect } from "react";
import type { KitchenPrepTimeInputProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const MIN_PREP_MINS = 1  as const;
const MAX_PREP_MINS = 120 as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline prep time input for a KOT card.
 * Saves on Enter or blur. Validates range 1–120 min.
 * Syncs local input state when currentMins prop changes externally.
 */
export function KitchenPrepTimeInput({ currentMins, onSet }: KitchenPrepTimeInputProps) {
  const [inputVal, setInputVal] = useState<string>(
    currentMins > 0 ? String(currentMins) : ""
  );

  // Sync if parent updates prepTimeMins (e.g., cross-tab)
  // Deps: currentMins — re-sync local input when prop changes
  useEffect(() => {
    setInputVal(currentMins > 0 ? String(currentMins) : "");
  }, [currentMins]);

  function handleCommit() {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < MIN_PREP_MINS || parsed > MAX_PREP_MINS) {
      // Reset to current valid value on invalid input
      setInputVal(currentMins > 0 ? String(currentMins) : "");
      return;
    }
    onSet(parsed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-text-secondary">Est. prep:</span>
      <input
        type="number"
        min={MIN_PREP_MINS}
        max={MAX_PREP_MINS}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        aria-label="Estimated prep time in minutes"
        placeholder="—"
        className={[
          "w-10 rounded border border-border bg-input px-1.5 py-0.5",
          "text-center text-[11px] text-text-primary",
          "focus:border-border-focus focus:outline-none",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
        ].join(" ")}
      />
      <span className="text-[11px] text-text-secondary">min</span>
    </div>
  );
}
