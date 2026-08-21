"use client";

// RESPONSIBILITY: Live Cashier Shift Summary bar displaying float cash, collected cash, UPI, Card sales, and Z-report trigger.
// DATA FLOW: cashier/page.tsx â†’ CashierShiftSummaryBar â†’ UI

import { DollarSign, QrCode, CreditCard, Lock, TrendingUp, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { CashierShiftMetrics } from "@/app/cashier/cashier_types/CashierTypes";

interface CashierShiftSummaryBarProps {
  metrics: CashierShiftMetrics;
  onOpenReconciliation: () => void;
}

export function CashierShiftSummaryBar({
  metrics,
  onOpenReconciliation,
}: CashierShiftSummaryBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">Cashier Shift Summary</h2>
            <p className="text-[11px] text-text-secondary">Today's active cash till & digital collection metrics</p>
          </div>
        </div>

        {/* Z-Report Shift Closing Trigger */}
        <button
          onClick={onOpenReconciliation}
          aria-label="Close cash counter and reconcile till"
          className="flex items-center gap-1.5 rounded-lg border border-danger/40 bg-danger-bg px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/20 transition-all shadow-xs"
        >
          <Lock size={14} />
          <span>Close Counter (Z-Report)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Cash Collected */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success">
            <DollarSign size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">Cash Collected</span>
            <span className="text-base font-extrabold text-text-primary">{formatCurrency(metrics.cashCollected)}</span>
          </div>
        </div>

        {/* UPI Collected */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <QrCode size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">UPI / QR Sales</span>
            <span className="text-base font-extrabold text-text-primary">{formatCurrency(metrics.upiCollected)}</span>
          </div>
        </div>

        {/* Card Collected */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning">
            <CreditCard size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">Card POS</span>
            <span className="text-base font-extrabold text-text-primary">{formatCurrency(metrics.cardCollected)}</span>
          </div>
        </div>

        {/* Total Net Sales */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Receipt size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-text-secondary uppercase">Total Net Sales</span>
            <span className="text-base font-extrabold text-primary">{formatCurrency(metrics.totalNetSales)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
