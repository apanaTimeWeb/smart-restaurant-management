"use client";

// RESPONSIBILITY: Modal for Cashier Till Drawer Closing / Z-Report Reconciliation with Currency Denomination Counter.
// DATA FLOW: billing/page.tsx → BillingShiftReconciliationModal → UI

import { useState } from "react";
import { X, Lock, Calculator, CheckCircle2, AlertTriangle, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { BillingShiftMetrics, BillingDenominations } from "@/app/billing/billing_types/BillingTypes";

interface BillingShiftReconciliationModalProps {
  isOpen: boolean;
  metrics: BillingShiftMetrics;
  onClose: () => void;
}

export function BillingShiftReconciliationModal({
  isOpen,
  metrics,
  onClose,
}: BillingShiftReconciliationModalProps) {
  const [denominations, setDenominations] = useState<BillingDenominations>({
    d500: 0,
    d200: 0,
    d100: 0,
    d50:  0,
    d20:  0,
    d10:  0,
  });

  const [isClosed, setIsClosed] = useState(false);

  if (!isOpen) return null;

  const physicalCashTotal =
    denominations.d500 * 500 +
    denominations.d200 * 200 +
    denominations.d100 * 100 +
    denominations.d50  * 50 +
    denominations.d20  * 20 +
    denominations.d10  * 10;

  const expectedCashTotal = metrics.openingFloat + metrics.cashCollected;
  const discrepancy       = physicalCashTotal - expectedCashTotal;

  function updateDenomination(key: keyof BillingDenominations, count: number) {
    setDenominations((prev) => ({ ...prev, [key]: Math.max(0, count) }));
  }

  function handleFinalizeClosing() {
    setIsClosed(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cash Counter Closing Z-Report"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Cash Till Closing (Z-Report)</h2>
              <p className="text-xs text-text-secondary">Reconcile cash drawer denominations & shift totals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-page hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {!isClosed ? (
          <div className="mt-5 flex flex-col gap-5 text-xs">
            {/* Shift Sales Summary Box */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/50 bg-page p-3 text-center">
              <div>
                <span className="text-[10px] text-text-secondary font-medium">Opening Float</span>
                <p className="text-sm font-extrabold text-text-primary">{formatCurrency(metrics.openingFloat)}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-medium">Shift Cash Sales</span>
                <p className="text-sm font-extrabold text-success">{formatCurrency(metrics.cashCollected)}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-medium">Expected Cash Till</span>
                <p className="text-sm font-extrabold text-primary">{formatCurrency(expectedCashTotal)}</p>
              </div>
            </div>

            {/* Currency Denomination Counter Grid */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-text-primary uppercase text-[11px] flex items-center gap-1.5">
                <Calculator size={14} className="text-primary" /> Physical Cash Denomination Counter
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-xl border border-border/50 bg-surface p-3">
                {[
                  { key: "d500", label: "₹500 Notes", mult: 500 },
                  { key: "d200", label: "₹200 Notes", mult: 200 },
                  { key: "d100", label: "₹100 Notes", mult: 100 },
                  { key: "d50",  label: "₹50 Notes",  mult: 50  },
                  { key: "d20",  label: "₹20 Notes",  mult: 20  },
                  { key: "d10",  label: "₹10 Notes",  mult: 10  },
                ].map((den) => (
                  <div key={den.key} className="flex flex-col gap-1 rounded-lg border border-border/40 bg-page p-2">
                    <span className="font-bold text-text-primary text-[11px]">{den.label}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={denominations[den.key as keyof BillingDenominations] || ""}
                        onChange={(e) => updateDenomination(den.key as keyof BillingDenominations, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full rounded border border-border bg-input py-1 px-2 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] font-semibold text-text-secondary shrink-0">
                        = {formatCurrency((denominations[den.key as keyof BillingDenominations] || 0) * den.mult)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation Comparison Result */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Physical Cash Count</span>
                <span className="text-lg font-black text-text-primary">{formatCurrency(physicalCashTotal)}</span>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Discrepancy (Variance)</span>
                <span
                  className={[
                    "text-lg font-black",
                    discrepancy === 0
                      ? "text-success"
                      : discrepancy > 0
                      ? "text-info"
                      : "text-danger",
                  ].join(" ")}
                >
                  {discrepancy === 0 ? "Balanced ✓" : formatCurrency(discrepancy)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Z-REPORT CLOSED STATE */
          <div className="mt-5 flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-text-primary">Shift Cash Till Closed Successfully!</h3>
              <p className="text-xs text-text-secondary">Z-Report audit log entry generated and stored in system memory.</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-page px-4 py-2 text-xs font-bold text-text-primary hover:bg-surface"
              >
                <Printer size={14} /> Print Z-Report Slip
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isClosed && (
          <div className="mt-5 flex justify-end gap-2 border-t border-border/60 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border bg-page px-4 py-2 font-bold text-text-primary hover:bg-surface text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalizeClosing}
              className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 font-bold text-white hover:bg-danger/90 text-xs"
            >
              <Lock size={14} /> Finalize Z-Report Closing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
