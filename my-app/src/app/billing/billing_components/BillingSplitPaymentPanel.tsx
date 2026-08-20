"use client";

// RESPONSIBILITY: Renders the payment method selection panel for the Billing POS.
// Three modes: Single Payment (Cash/UPI/Card), Split Bill (N guests), Split Payment (mixed).
// Real-time validation: Split Payment inputs must sum to totalAmount.
// Calls onPaymentReady when a valid payment configuration is selected.
// DATA FLOW: BillingSplitPaymentPanel → onPaymentReady → billing/page.tsx → checkout

import { useState, useEffect, useMemo } from "react";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type {
  BillingSplitPaymentPanelProps,
  BillingPaymentMode,
  BillingSingleMethod,
  BillingSplitPaymentValues,
} from "@/app/billing/billing_types/BillingTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAYMENT_MODES: { value: BillingPaymentMode; label: string }[] = [
  { value: "SINGLE",        label: "Single Payment"  },
  { value: "SPLIT_BILL",    label: "Split Bill"       },
  { value: "SPLIT_PAYMENT", label: "Split Payment"    },
];

const SINGLE_METHODS: { value: BillingSingleMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Cash", icon: <Banknote size={14} />    },
  { value: "UPI",  label: "UPI",  icon: <Smartphone size={14} />  },
  { value: "CARD", label: "Card", icon: <CreditCard size={14} />  },
];

const MIN_GUESTS = 2 as const;
const MAX_GUESTS = 20 as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Payment method panel — Single / Split Bill / Split Payment.
 * Split Payment: Cash + UPI + Card inputs must sum to totalAmount.
 * Calls onPaymentReady with current valid configuration on every valid change.
 */
export function BillingSplitPaymentPanel({
  totalAmount,
  onPaymentReady,
}: BillingSplitPaymentPanelProps) {
  const [mode,         setMode]         = useState<BillingPaymentMode>("SINGLE");
  const [singleMethod, setSingleMethod] = useState<BillingSingleMethod>("CASH");
  const [guestCount,   setGuestCount]   = useState<number>(2);
  const [splitCash,    setSplitCash]    = useState<number>(0);
  const [splitUpi,     setSplitUpi]     = useState<number>(0);
  const [splitCard,    setSplitCard]    = useState<number>(0);

  // Per-person amount for Split Bill mode
  const perPersonAmount = useMemo(
    () => (guestCount > 0 ? totalAmount / guestCount : 0),
    [totalAmount, guestCount]
  );

  // Split Payment sum validation
  const splitSum      = splitCash + splitUpi + splitCard;
  const splitMismatch = mode === "SPLIT_PAYMENT" && Math.abs(splitSum - totalAmount) > 0.01;

  // Notify parent whenever a valid config is ready
  // Deps: mode, singleMethod, splitCash, splitUpi, splitCard, totalAmount, splitMismatch
  useEffect(() => {
    if (mode === "SINGLE") {
      onPaymentReady(mode, singleMethod, { cash: 0, upi: 0, card: 0 });
    } else if (mode === "SPLIT_BILL") {
      onPaymentReady(mode, "CASH", { cash: 0, upi: 0, card: 0 });
    } else if (mode === "SPLIT_PAYMENT" && !splitMismatch) {
      onPaymentReady(mode, "CASH", { cash: splitCash, upi: splitUpi, card: splitCard });
    }
  }, [mode, singleMethod, splitCash, splitUpi, splitCard, totalAmount, splitMismatch, onPaymentReady]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        Payment Method
      </p>

      {/* Mode radio buttons */}
      <div className="flex flex-wrap gap-3">
        {PAYMENT_MODES.map((pm) => (
          <label key={pm.value} className="flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              name="payment-mode"
              value={pm.value}
              checked={mode === pm.value}
              onChange={() => setMode(pm.value)}
              className="accent-primary"
            />
            <span className="text-[13px] text-text-primary">{pm.label}</span>
          </label>
        ))}
      </div>

      {/* ── Single Payment ── */}
      {mode === "SINGLE" && (
        <div className="flex flex-wrap gap-2">
          {SINGLE_METHODS.map((sm) => (
            <button
              key={sm.value}
              onClick={() => setSingleMethod(sm.value)}
              aria-pressed={singleMethod === sm.value}
              className={[
                "flex items-center gap-1.5 rounded-md border px-4 py-2",
                "text-[13px] font-medium transition-colors duration-150",
                singleMethod === sm.value
                  ? "border-primary bg-primary text-white"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {sm.icon}
              {sm.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Split Bill ── */}
      {mode === "SPLIT_BILL" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label htmlFor="guest-count" className="text-[13px] text-text-secondary">
              Number of guests:
            </label>
            <input
              id="guest-count"
              type="number"
              min={MIN_GUESTS}
              max={MAX_GUESTS}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(MIN_GUESTS, parseInt(e.target.value, 10) || MIN_GUESTS))}
              className={[
                "w-16 rounded-md border border-border bg-input px-2 py-1.5",
                "text-center text-[14px] text-text-primary",
                "focus:outline-none focus:border-border-focus",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
              ].join(" ")}
            />
          </div>
          <div className="rounded-md bg-info-bg px-3 py-2">
            <p className="text-[13px] font-semibold text-info">
              {formatCurrency(perPersonAmount)} per person
            </p>
            <p className="text-[11px] text-text-secondary">
              {guestCount} guests × {formatCurrency(perPersonAmount)} = {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      )}

      {/* ── Split Payment ── */}
      {mode === "SPLIT_PAYMENT" && (
        <div className="flex flex-col gap-3">
          {[
            { label: "Cash (₹)",  value: splitCash, setter: setSplitCash,  icon: <Banknote size={13} />   },
            { label: "UPI (₹)",   value: splitUpi,  setter: setSplitUpi,   icon: <Smartphone size={13} /> },
            { label: "Card (₹)",  value: splitCard, setter: setSplitCard,  icon: <CreditCard size={13} /> },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-3">
              <div className="flex w-24 items-center gap-1.5 text-[12px] text-text-secondary">
                {field.icon}
                {field.label}
              </div>
              <input
                type="number"
                min={0}
                value={field.value || ""}
                onChange={(e) => field.setter(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={[
                  "w-32 rounded-md border bg-input px-3 py-1.5",
                  "text-[14px] text-text-primary",
                  "focus:outline-none focus:border-border-focus",
                  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
                  splitMismatch ? "border-danger" : "border-border",
                ].join(" ")}
              />
            </div>
          ))}

          {/* Sum display */}
          <div className={[
            "flex items-center justify-between rounded-md px-3 py-2 text-[12px] font-medium",
            splitMismatch ? "bg-danger-bg text-danger" : "bg-success-bg text-success",
          ].join(" ")}>
            <span>Total entered:</span>
            <span>{formatCurrency(splitSum)}</span>
          </div>

          {splitMismatch && (
            <p className="text-[12px] text-danger">
              Sum must equal {formatCurrency(totalAmount)} (difference: {formatCurrency(Math.abs(splitSum - totalAmount))})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
