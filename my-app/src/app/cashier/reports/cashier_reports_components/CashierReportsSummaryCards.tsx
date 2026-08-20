"use client";

// RESPONSIBILITY: Renders 4 KPI summary cards for the CashierReports page.
// Receives pre-calculated summary data via props â€” no data fetching.
// DATA FLOW: useCashierReports â†’ cashier_reports/page.tsx â†’ CashierReportsSummaryCards â†’ UI

import { TrendingUp, ShoppingBag, IndianRupee, CreditCard, CalendarClock } from "lucide-react";
import { formatCurrencyCompact, formatCurrency } from "@/lib/formatters";
import type { CashierReportsSummaryCardsProps } from "@/app/cashier/reports/cashier_reports_types/CashierReportsTypes";

// â”€â”€â”€ Sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// RESPONSIBILITY: Single KPI card â€” icon + label + value display.
interface CashierReportsKpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}

function CashierReportsKpiCard({ icon: Icon, label, value, sub }: CashierReportsKpiCardProps) {
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

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Renders 4 KPI cards: Total Revenue, Total Orders, Avg Order Value, Top Payment Method.
 * Responsive: 2-column on mobile, 4-column on md+.
 *
 * @param summary - Pre-calculated CashierReportsSummary from useCashierReports
 */
export function CashierReportsSummaryCards({ summary }: CashierReportsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <CashierReportsKpiCard
        icon={IndianRupee}
        label="Total Revenue"
        value={formatCurrencyCompact(summary.totalRevenue)}
        sub={summary.periodLabel}
      />
      <CashierReportsKpiCard
        icon={ShoppingBag}
        label="Total Orders"
        value={String(summary.totalOrders)}
        sub={summary.periodLabel}
      />
      <CashierReportsKpiCard
        icon={TrendingUp}
        label="Avg Order Value"
        value={formatCurrency(summary.avgOrderValue)}
        sub="Per transaction"
      />
      <CashierReportsKpiCard
        icon={CreditCard}
        label="Top Payment"
        value={summary.topPaymentMethod}
        sub="By revenue"
      />
      <CashierReportsKpiCard
        icon={CalendarClock}
        label="Adv. Bookings"
        value={String(summary.advanceBookingCount)}
        sub={summary.periodLabel}
      />
      <CashierReportsKpiCard
        icon={IndianRupee}
        label="Adv. Revenue"
        value={formatCurrencyCompact(summary.advanceBookingRevenue)}
        sub="From deposits"
      />
    </div>
  );
}
