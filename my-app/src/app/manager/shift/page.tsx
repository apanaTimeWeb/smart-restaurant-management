"use client";

// RESPONSIBILITY: Owner Shift Management page shell.
// If shift OPEN: shows current stats + Close Shift form.
// If shift CLOSED or null: shows Open Shift form + Z-Report (if closed).
// DATA FLOW: useOwnerShift → OwnerShiftReport + RHF forms → UI

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useOwnerShift } from "@/app/manager/manager_hooks/useOwnerShift";
import { OwnerShiftReport } from "@/app/manager/manager_components/OwnerShiftReport";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { OwnerShiftOpenFormValues, OwnerShiftCloseFormValues } from "@/app/manager/manager_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Shift Management & Z-Report"                    as const;
const PAGE_SUBTITLE = "Open/close shifts, track cash, view Z-Report"  as const;

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const openSchema = z.object({
  openingCash: z.number().min(0, "Opening cash must be ≥ 0"),
});

const closeSchema = z.object({
  closingCash: z.number().min(0, "Closing cash must be ≥ 0"),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Form to open a new shift.
function OpenShiftForm({
  onOpen,
  isSubmitting,
}: {
  onOpen: (cash: number) => void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<OwnerShiftOpenFormValues>({ resolver: zodResolver(openSchema), defaultValues: { openingCash: 0 } });

  function onSubmit(values: OwnerShiftOpenFormValues) {
    onOpen(values.openingCash);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 max-w-sm">
      <p className="text-[14px] font-semibold text-text-primary">Open New Shift</p>
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold text-text-secondary">Opening Cash (₹)</label>
        <input
          {...register("openingCash", { valueAsNumber: true })}
          type="number"
          min={0}
          placeholder="5000"
          className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
        {errors.openingCash && (
          <p className="text-[11px] text-danger">{errors.openingCash.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        Open Shift
      </button>
    </form>
  );
}

// RESPONSIBILITY: Form to close the current shift.
function CloseShiftForm({
  onClose,
  isSubmitting,
}: {
  onClose: (cash: number) => void;
  isSubmitting: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const { register, handleSubmit, formState: { errors } } =
    useForm<OwnerShiftCloseFormValues>({ resolver: zodResolver(closeSchema), defaultValues: { closingCash: 0 } });

  function onSubmit(values: OwnerShiftCloseFormValues) {
    onClose(values.closingCash);
  }

  if (!confirmed) {
    return (
      <button
        onClick={() => setConfirmed(true)}
        className="rounded-xl border border-danger px-5 py-2.5 text-[13px] font-semibold text-danger hover:bg-danger-bg transition-colors"
      >
        Close Shift
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-danger bg-danger-bg p-5 max-w-sm">
      <p className="text-[14px] font-semibold text-danger">Confirm Close Shift</p>
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold text-text-secondary">Closing Cash Counted (₹)</label>
        <input
          {...register("closingCash", { valueAsNumber: true })}
          type="number"
          min={0}
          placeholder="0"
          className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
        {errors.closingCash && (
          <p className="text-[11px] text-danger">{errors.closingCash.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmed(false)}
          className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-card transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-2.5 text-[13px] font-semibold text-white disabled:opacity-60 transition-colors"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          Confirm Close
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerShiftPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Deps: [] — run once on mount only
  useEffect(() => { setIsMounted(true); }, []);

  const { shift, isOpen, isSubmitting, salesHistory, openShift, closeShift } = useOwnerShift();

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <ShiftPageHeader />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["MANAGER"]}>
      <div className="flex flex-col gap-6">
        <ShiftPageHeader />

        {/* Open shift status banner */}
        {isOpen && shift && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-success bg-success-bg px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-success">Shift is OPEN</p>
              <p className="text-[12px] text-text-secondary">
                Opened at {formatDateTime(shift.openedAt)} · Opening cash: {formatCurrency(shift.openingCash)}
              </p>
            </div>
            <CloseShiftForm onClose={closeShift} isSubmitting={isSubmitting} />
          </div>
        )}

        {/* No shift — show open form */}
        {!shift && (
          <OpenShiftForm onOpen={openShift} isSubmitting={isSubmitting} />
        )}

        {/* Shift closed — show open new shift + Z-Report */}
        {shift && !isOpen && (
          <>
            <OpenShiftForm onOpen={openShift} isSubmitting={isSubmitting} />
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
                Last Shift Z-Report
              </p>
              <OwnerShiftReport shift={shift} salesHistory={salesHistory} />
            </div>
          </>
        )}

        {/* Shift open — show Z-Report preview (live) */}
        {shift && isOpen && (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
              Live Shift Report
            </p>
            <OwnerShiftReport shift={shift} salesHistory={salesHistory} />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

// RESPONSIBILITY: Static page header.
function ShiftPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
