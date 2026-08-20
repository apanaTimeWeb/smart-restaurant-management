"use client";

// RESPONSIBILITY: Quick Cash Tendered & Change Return Calculator Modal for Cashiers.
// Calculates Change to Return = Tendered Cash Amount - Bill Total Amount.
// DATA FLOW: bill Total -> Tendered Input -> Change Return Calculation

import React, { useState, useEffect } from "react";
import { DollarSign, X, ArrowRight, CheckCircle2, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export interface BillingCashCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  payableAmount: number;
  onConfirmPayment?: () => void;
}

export function BillingCashCalculatorModal({
  isOpen,
  onClose,
  payableAmount,
  onConfirmPayment,
}: BillingCashCalculatorModalProps): React.JSX.Element | null {
  const [tendered, setTendered] = useState<number>(payableAmount);

  useEffect(() => {
    if (isOpen) {
      setTendered(payableAmount);
    }
  }, [isOpen, payableAmount]);

  if (!isOpen) return null;

  const changeToReturn = Math.max(0, tendered - payableAmount);
  const isShortage = tendered < payableAmount;

  const handleQuickAmount = (amt: number) => {
    setTendered(amt);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-base">Quick Cash & Change Calculator</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-page">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Bill Payable Display */}
          <div className="flex justify-between items-center rounded-2xl border border-border bg-page p-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Bill Total Amount:</span>
            <span className="text-xl font-black text-text-primary">{formatCurrency(payableAmount)}</span>
          </div>

          {/* Quick Note Tender Buttons */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Select Cash Tendered Note:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`rounded-xl border p-2.5 text-xs font-extrabold transition-all ${
                    tendered === amt
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-border bg-page text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickAmount(payableAmount)}
                className={`rounded-xl border p-2.5 text-xs font-extrabold transition-all ${
                  tendered === payableAmount
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-page text-primary hover:bg-surface-hover"
                }`}
              >
                Exact
              </button>
            </div>
          </div>

          {/* Tendered Input Field */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Customer Tendered Amount (₹):
            </label>
            <input
              type="number"
              value={tendered || ""}
              onChange={(e) => setTendered(parseFloat(e.target.value) || 0)}
              className="w-full rounded-2xl border border-border bg-input py-3 px-4 text-2xl font-black text-text-primary text-right focus:border-primary focus:outline-none"
            />
          </div>

          {/* Change Return Result Card */}
          <div
            className={`rounded-2xl border p-4 space-y-1 text-center transition-all ${
              isShortage
                ? "border-red-500/40 bg-red-500/10"
                : "border-emerald-500/40 bg-emerald-500/10"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {isShortage ? "Shortage (Collect Remaining):" : "Change to Return to Customer:"}
            </span>
            <p
              className={`text-3xl font-black ${
                isShortage ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {isShortage
                ? formatCurrency(payableAmount - tendered)
                : formatCurrency(changeToReturn)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border p-4 bg-page/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-secondary hover:bg-page"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onConfirmPayment) onConfirmPayment();
              onClose();
            }}
            disabled={isShortage}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm & Complete Settle</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
