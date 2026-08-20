"use client";

// RESPONSIBILITY: Confirmation modal for voiding a KOT item.
// Uses React Hook Form + Zod for reason input validation (Rule 16).
// Confirm button is pessimistic — disabled while async void request is in flight.
// DATA FLOW: WaiterTableActionsDrawer → WaiterVoidRequestModal → useWaiterTableActions.requestVoid

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { WaiterVoidRequestModalProps } from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Zod Schema (Rule 16: schema in types/utils, not inline) ─────────────────

const VoidReasonSchema = z.object({
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .max(200, "Reason must be under 200 characters"),
});

type VoidReasonFormValues = z.infer<typeof VoidReasonSchema>;

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const MODAL_TITLE       = "Request Item Void"                          as const;
const REASON_LABEL      = "Reason for void"                           as const;
const REASON_PLACEHOLDER = "e.g. Customer changed mind, Out of stock" as const;
const CONFIRM_LABEL     = "Confirm Void Request"                      as const;
const CANCEL_LABEL      = "Cancel"                                    as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal for requesting a KOT item void.
 * Requires a reason (min 5 chars) validated via Zod.
 * Confirm button stays disabled until form is valid and while submitting.
 */
export function WaiterVoidRequestModal({
  target,
  isOpen,
  onConfirm,
  onCancel,
}: WaiterVoidRequestModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<VoidReasonFormValues>({
    resolver: zodResolver(VoidReasonSchema),
    mode: "onChange",
  });

  // Reset form whenever modal opens for a new target
  // Why isOpen + target in deps: re-run on every open to clear stale reason
  useEffect(() => {
    if (isOpen) reset({ reason: "" });
  }, [isOpen, target, reset]);

  // Close on Escape key
  // Why isOpen in deps: only attach listener when modal is visible
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  async function handleConfirm(values: VoidReasonFormValues) {
    if (!target) return;
    await onConfirm(target, values.reason);
    reset();
  }

  if (!isOpen || !target) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Void request confirmation"
    >
      {/* Modal card */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-2xl shadow-black/50">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg">
              <AlertTriangle size={18} className="text-danger" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold text-text-primary">{MODAL_TITLE}</h2>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                This will alert the kitchen with a red flash.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close void modal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Item info */}
        <div className="mb-5 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-danger">
            Item to void
          </p>
          <p className="mt-1 text-[14px] font-bold text-text-primary">
            {target.itemName}
          </p>
          <p className="text-[11px] text-text-secondary">KOT: {target.kotId}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleConfirm)} noValidate>
          <div className="mb-5 flex flex-col gap-1.5">
            <label
              htmlFor="void-reason"
              className="text-[12px] font-semibold text-text-secondary"
            >
              {REASON_LABEL}
              <span className="ml-1 text-danger" aria-hidden="true">*</span>
            </label>
            <textarea
              id="void-reason"
              rows={3}
              placeholder={REASON_PLACEHOLDER}
              aria-required="true"
              aria-describedby={errors.reason ? "void-reason-error" : undefined}
              {...register("reason")}
              className={[
                "w-full resize-none rounded-lg border bg-input px-3 py-2",
                "text-[13px] text-text-primary placeholder:text-text-disabled",
                "focus:border-border-focus focus:outline-none",
                "transition-colors duration-150",
                errors.reason ? "border-danger" : "border-border",
              ].join(" ")}
            />
            {errors.reason && (
              <p
                id="void-reason-error"
                role="alert"
                className="text-[12px] text-danger"
              >
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3">
            {/* Cancel — ghost */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-border py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CANCEL_LABEL}
            </button>

            {/* Confirm — danger primary, pessimistic UI */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              aria-label="Confirm void request"
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5",
                "text-[13px] font-semibold text-white transition-all",
                !isValid || isSubmitting
                  ? "cursor-not-allowed bg-danger/40"
                  : "bg-danger hover:bg-danger/80 active:scale-95",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                CONFIRM_LABEL
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
