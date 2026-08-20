"use client";

// RESPONSIBILITY: Physical Cash Denomination Counter Modal for Shift Reconciliation.
// Calculates physical cash total across ₹500, ₹200, ₹100, ₹50, ₹20, ₹10 notes & coins and computes variance vs expected cash.
// DATA FLOW: Physical inputs -> BillingCashDenominationModal -> Total & Variance calculation

import React, { useState } from "react";
import { Calculator, X, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export interface BillingCashDenominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedCash?: number;
  onConfirmReconciliation?: (physicalCash: number, variance: number) => void;
}

export function BillingCashDenominationModal({
  isOpen,
  onClose,
  expectedCash = 5000,
  onConfirmReconciliation,
}: BillingCashDenominationModalProps): React.JSX.Element | null {
  const [counts, setCounts] = useState<{
    500: number;
    200: number;
    100: number;
    50: number;
    20: number;
    10: number;
    coins: number;
  }>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    coins: 0,
  });

  if (!isOpen) return null;

  const totalPhysicalCash =
    counts[500] * 500 +
    counts[200] * 200 +
    counts[100] * 100 +
    counts[50] * 50 +
    counts[20] * 20 +
    counts[10] * 10 +
    counts.coins;

  const variance = totalPhysicalCash - expectedCash;

  const handleInputChange = (denom: keyof typeof counts, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [denom]: num }));
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-lg">Cash Denomination Counter</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-page hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[500, 200, 100, 50, 20, 10].map((denom) => (
              <div
                key={denom}
                className="flex items-center justify-between rounded-xl border border-border bg-page/60 p-3"
              >
                <span className="font-bold text-sm text-text-primary">₹{denom} Notes</span>
                <input
                  type="number"
                  min="0"
                  value={counts[denom as keyof typeof counts] || ""}
                  onChange={(e) => handleInputChange(denom as keyof typeof counts, e.target.value)}
                  placeholder="0"
                  className="w-20 rounded-lg border border-border bg-input px-2 py-1 text-right text-sm font-bold text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-page/60 p-3">
            <span className="font-bold text-sm text-text-primary">Coins / Change Amount</span>
            <input
              type="number"
              min="0"
              value={counts.coins || ""}
              onChange={(e) => handleInputChange("coins", e.target.value)}
              placeholder="0"
              className="w-24 rounded-lg border border-border bg-input px-2 py-1 text-right text-sm font-bold text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Variance Summary Card */}
          <div className="rounded-2xl border border-border bg-page p-4 space-y-2 mt-4">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Expected System Cash:</span>
              <span className="font-semibold text-text-primary">{formatCurrency(expectedCash)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-text-primary">
              <span>Physical Cash Total:</span>
              <span className="text-emerald-500">{formatCurrency(totalPhysicalCash)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-2 border-t border-border/60">
              <span>Variance (Excess / Shortfall):</span>
              <span
                className={
                  variance === 0
                    ? "text-emerald-500"
                    : variance > 0
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                {variance > 0 ? `+${formatCurrency(variance)} (Excess)` : variance < 0 ? `${formatCurrency(variance)} (Shortage)` : "Balanced (₹0)"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-page/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onConfirmReconciliation) {
                onConfirmReconciliation(totalPhysicalCash, variance);
              }
              onClose();
            }}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
          >
            Confirm Cash Count
          </button>
        </div>
      </div>
    </div>
  );
}
