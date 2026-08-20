"use client";

// RESPONSIBILITY: Renders 4 KPI summary cards for the Reports page.
// Receives pre-calculated summary data via props — no data fetching.
// DATA FLOW: useReports → reports/page.tsx → ReportsSummaryCards → UI

import { TrendingUp, ShoppingBag, IndianRupee, CreditCard, CalendarClock } from "lucide-react";
import { formatCurrencyCompact, formatCurrency } from "@/lib/formatters";
import type { ReportsSummaryCardsProps } from "@/app/reports/reports_types/ReportsTypes";

// ─── Sub-component ────────────────────────────────────────────────────────────

// RESPONSIBILITY: Single KPI card — icon + label + value display.
interface ReportsKpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}

function ReportsKpiCard({ icon: Icon, label, value, sub }: ReportsKpiCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </span>
      </div>
      <p className="text-[26px] font-bold leading-none text-text-primary">{value}</p>
      {sub !== undefined && (
        <p className="text-[12px] text-text-secondary">{sub}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Renders 4 KPI cards: Total Revenue, Total Orders, Avg Order Value, Top Payment Method.
 * Responsive: 2-column on mobile, 4-column on md+.
 *
 * @param summary - Pre-calculated ReportsSummary from useReports
 */
export function ReportsSummaryCards({ summary }: ReportsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <ReportsKpiCard
        icon={IndianRupee}
        label="Total Revenue"
        value={formatCurrencyCompact(summary.totalRevenue)}
        sub={summary.periodLabel}
      />
      <ReportsKpiCard
        icon={ShoppingBag}
        label="Total Orders"
        value={String(summary.totalOrders)}
        sub={summary.periodLabel}
      />
      <ReportsKpiCard
        icon={TrendingUp}
        label="Avg Order Value"
        value={formatCurrency(summary.avgOrderValue)}
        sub="Per transaction"
      />
      <ReportsKpiCard
        icon={CreditCard}
        label="Top Payment"
        value={summary.topPaymentMethod}
        sub="By revenue"
      />
      <ReportsKpiCard
        icon={CalendarClock}
        label="Adv. Bookings"
        value={String(summary.advanceBookingCount)}
        sub={summary.periodLabel}
      />
      <ReportsKpiCard
        icon={IndianRupee}
        label="Adv. Revenue"
        value={formatCurrencyCompact(summary.advanceBookingRevenue)}
        sub="From deposits"
      />
    </div>
  );
}
