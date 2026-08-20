"use client";

// RESPONSIBILITY: Renders the 3-step KOT item status pipeline for the Kitchen KDS.
// Steps: PENDING (Received) → COOKING (In Preparation) → READY (Ready to Serve).
// Active step is highlighted. Completed steps show a checkmark.
// Disabled while isDisabled=true (pessimistic UI during save).
// DATA FLOW: KitchenKotCard → KitchenStatusPipeline → onStatusChange → useKitchenKds

import { Check } from "lucide-react";
import type { KitchenStatusPipelineProps, KitchenPipelineStep } from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PIPELINE_STEPS: { status: KitchenPipelineStep; label: string }[] = [
  { status: "PENDING", label: "Received"       },
  { status: "COOKING", label: "In Preparation" },
  { status: "READY",   label: "Ready to Serve" },
];

// Maps KotItemStatus → pipeline step index (VOID_REQUESTED / VOIDED = -1, not in pipeline)
const STATUS_TO_STEP_INDEX: Record<string, number> = {
  PENDING:        0,
  COOKING:        1,
  READY:          2,
  VOID_REQUESTED: -1,
  VOIDED:         -1,
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 3-step status pipeline for a single KOT item.
 * Clicking a step calls onStatusChange with the new status.
 * Steps before the active one show a checkmark (completed).
 * Disabled while isDisabled=true (pessimistic UI).
 */
export function KitchenStatusPipeline({
  currentStatus,
  onStatusChange,
  isDisabled,
}: KitchenStatusPipelineProps) {
  const activeIndex = STATUS_TO_STEP_INDEX[currentStatus] ?? 0;

  // VOID_REQUESTED / VOIDED — pipeline not applicable, show void badge instead
  if (activeIndex === -1) {
    return (
      <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
        {currentStatus.replace("_", " ")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STEPS.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive    = index === activeIndex;

        function handleClick() {
          if (isDisabled || isActive || isCompleted) return;
          onStatusChange(step.status);
        }

        return (
          <button
            key={step.status}
            onClick={handleClick}
            disabled={isDisabled || isActive || isCompleted}
            aria-label={`Mark as ${step.label}`}
            aria-pressed={isActive}
            className={[
              "flex items-center gap-1 rounded-full px-2 py-0.5",
              "text-[10px] font-semibold transition-colors duration-150",
              isCompleted
                ? "bg-success-bg text-success cursor-default"
                : isActive
                ? "bg-warning-bg text-warning cursor-default"
                : "bg-card text-text-secondary border border-border hover:border-primary hover:text-primary",
              isDisabled ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {isCompleted && <Check size={10} strokeWidth={3} />}
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
