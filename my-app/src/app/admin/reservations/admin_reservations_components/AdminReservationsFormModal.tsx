"use client";

// RESPONSIBILITY: Modal form for adding a new reservation.
// React Hook Form + Zod validation (Rule 16). Only AVAILABLE tables shown in dropdown.
// Pessimistic submit button with Loader2 spinner (Rule 15).
// Escape key + backdrop click closes modal (Rule 18).
// DATA FLOW: admin_reservations/page.tsx → AdminReservationsFormModal → onSubmit → useAdminReservations.addReservation

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, CalendarPlus } from "lucide-react";
import type {
  AdminReservationsFormModalProps,
  AdminReservationsFormValues,
} from "@/app/admin/reservations/admin_reservations_types/AdminReservationsTypes";

// ─── Zod Schema (Rule 16: schema defined here, not inline) ───────────────────

const reservationSchema = z.object({
  tableId:      z.string().min(1, "Select a table"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone:        z.string().length(10, "Phone must be exactly 10 digits"),
  guestCount:   z.number().min(1, "At least 1 guest").max(20, "Max 20 guests"),
  slotTime:     z.string().min(1, "Select date & time"),
});

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const MODAL_TITLE   = "New Reservation"                          as const;
const SUBMIT_LABEL  = "Confirm Reservation"                      as const;
const SAVING_LABEL  = "Saving…"                                  as const;
const NO_TABLES_MSG = "No available tables right now"            as const;

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Full-screen overlay modal for creating a new reservation.
 * Resets form on every open. Escape key and backdrop click close the modal.
 * Submit button is disabled while isSubmitting (pessimistic UI).
 *
 * @param isOpen          - Controls modal visibility
 * @param availableTables - Only AVAILABLE tables shown in dropdown
 * @param isSubmitting    - Disables submit button while saving
 * @param onSubmit        - Called with validated form values
 * @param onClose         - Closes the modal
 */
export function AdminReservationsFormModal({
  isOpen,
  availableTables,
  isSubmitting,
  onSubmit,
  onClose,
}: AdminReservationsFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminReservationsFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      tableId:      "",
      customerName: "",
      phone:        "",
      guestCount:   2,
      slotTime:     "",
    },
  });

  // Reset form whenever modal opens
  // Deps: isOpen — re-run on every open to clear stale values
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  // Escape key closes modal
  // Deps: isOpen, onClose — only attach when visible
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleFormSubmit(values: AdminReservationsFormValues): void {
    onSubmit(values);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarPlus size={18} className="text-primary" />
            <h2 className="text-[15px] font-bold text-text-primary">{MODAL_TITLE}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-page"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="flex flex-col gap-4 px-5 py-5"
        >
          {/* Customer Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary">
              Customer Name <span className="text-danger">*</span>
            </label>
            <input
              {...register("customerName")}
              placeholder="e.g. Rahul Sharma"
              className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
            />
            {errors.customerName && (
              <p className="text-[11px] text-danger">{errors.customerName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
            />
            {errors.phone && (
              <p className="text-[11px] text-danger">{errors.phone.message}</p>
            )}
          </div>

          {/* Table + Guest Count row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">
                Table <span className="text-danger">*</span>
              </label>
              <select
                {...register("tableId")}
                className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="">Select table</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} — {t.section}
                  </option>
                ))}
              </select>
              {availableTables.length === 0 && (
                <p className="text-[11px] text-warning">{NO_TABLES_MSG}</p>
              )}
              {errors.tableId && (
                <p className="text-[11px] text-danger">{errors.tableId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">
                Guests <span className="text-danger">*</span>
              </label>
              <input
                {...register("guestCount", { valueAsNumber: true })}
                type="number"
                min={1}
                max={20}
                placeholder="2"
                className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
              />
              {errors.guestCount && (
                <p className="text-[11px] text-danger">{errors.guestCount.message}</p>
              )}
            </div>
          </div>

          {/* Slot Time */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary">
              Date & Time <span className="text-danger">*</span>
            </label>
            <input
              {...register("slotTime")}
              type="datetime-local"
              className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary focus:border-border-focus focus:outline-none"
            />
            {errors.slotTime && (
              <p className="text-[11px] text-danger">{errors.slotTime.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || availableTables.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? SAVING_LABEL : SUBMIT_LABEL}
          </button>
        </form>
      </div>
    </div>
  );
}
