"use client";

// RESPONSIBILITY: Z-Report display for a closed or open shift.
// Shows opening cash, total sales, expected cash, actual cash, variance.
// Payment breakdown by method. Waiter stats table. Print button.
// Pure display component — no localStorage access.
// DATA FLOW: useAdminShift → admin/shift/page.tsx → AdminShiftReport → UI

import { Printer } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { AdminShiftReportProps } from "@/app/admin/admin_types/AdminTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const METHOD_CASH  = "CASH"  as const;
const METHOD_UPI   = "UPI"   as const;
const METHOD_CARD  = "CARD"  as const;
const METHOD_SPLIT = "SPLIT" as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Single stat row in the Z-Report summary.
function ReportRow({
  label,
  value,
  highlight,
}: {
  label:      string;
  value:      string;
  highlight?: "success" | "danger" | "warning" | "none";
}) {
  const valueClass =
    highlight === "success" ? "text-success" :
    highlight === "danger"  ? "text-danger"  :
    highlight === "warning" ? "text-warning" :
    "text-text-primary";

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className={`text-[14px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Z-Report for a shift — shows financial summary, payment breakdown, waiter stats.
 * Print button triggers window.print() — @media print hides chrome.
 */
export function AdminShiftReport({ shift, salesHistory }: AdminShiftReportProps) {
  // Payment breakdown from salesHistory
  const cashTotal  = salesHistory.reduce((s, r) => r.paymentMethod === METHOD_CASH  ? s + r.totalAmount : s, 0);
  const upiTotal   = salesHistory.reduce((s, r) => r.paymentMethod === METHOD_UPI   ? s + r.totalAmount : s, 0);
  const cardTotal  = salesHistory.reduce((s, r) => r.paymentMethod === METHOD_CARD  ? s + r.totalAmount : s, 0);
  const splitTotal = salesHistory.reduce((s, r) => r.paymentMethod === METHOD_SPLIT ? s + r.totalAmount : s, 0);
  const grandTotal = cashTotal + upiTotal + cardTotal + splitTotal;

  // Variance highlight
  function varianceHighlight(): "success" | "danger" | "warning" | "none" {
    if (shift.variance === null) return "none";
    if (shift.variance === 0)   return "success";
    if (shift.variance < 0)     return "danger";
    return "warning";
  }

  return (
    <div className="flex flex-col gap-6" id="shift-z-report">

      {/* Print button — hidden on print */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-text-secondary hover:bg-card transition-colors"
        >
          <Printer size={15} />
          Print Z-Report
        </button>
      </div>

      {/* Shift summary */}
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
          Shift Summary
        </p>
        <ReportRow label="Shift ID"       value={shift.id} />
        <ReportRow label="Opened At"      value={formatDateTime(shift.openedAt)} />
        {shift.closedAt && (
          <ReportRow label="Closed At"    value={formatDateTime(shift.closedAt)} />
        )}
        <ReportRow label="Opening Cash"   value={formatCurrency(shift.openingCash)} />
        <ReportRow label="Total Sales"    value={formatCurrency(grandTotal)} />
        {shift.expectedCash !== null && (
          <ReportRow label="Expected Cash" value={formatCurrency(shift.expectedCash)} />
        )}
        {shift.closingCash !== null && (
          <ReportRow label="Actual Cash (Counted)" value={formatCurrency(shift.closingCash)} />
        )}
        {shift.variance !== null && (
          <ReportRow
            label="Variance"
            value={`${shift.variance >= 0 ? "+" : ""}${formatCurrency(shift.variance)}`}
            highlight={varianceHighlight()}
          />
        )}
      </div>

      {/* Payment breakdown */}
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
          Payment Breakdown
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Cash",  value: cashTotal,  color: "text-pay-cash" },
            { label: "UPI",   value: upiTotal,   color: "text-pay-upi"  },
            { label: "Card",  value: cardTotal,  color: "text-pay-card" },
            { label: "Split", value: splitTotal, color: "text-primary"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-0.5 rounded-lg border border-border bg-page p-3">
              <span className="text-[11px] text-text-secondary">{label}</span>
              <span className={`text-[15px] font-bold ${color}`}>{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waiter stats */}
      {Object.keys(shift.waiterStats).length > 0 && (
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
            Waiter Performance
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {["Waiter ID", "Orders Served", "Total Sales"].map((h) => (
                    <th key={h} className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(shift.waiterStats).map(([waiterId, stats]) => (
                  <tr key={waiterId} className="border-b border-border last:border-0">
                    <td className="py-2.5 text-[13px] font-medium text-text-primary">{waiterId}</td>
                    <td className="py-2.5 text-[13px] text-text-secondary">{stats.ordersServed}</td>
                    <td className="py-2.5 text-[13px] font-medium text-text-primary">{formatCurrency(stats.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
