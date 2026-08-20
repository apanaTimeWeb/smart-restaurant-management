"use client";

// RESPONSIBILITY: CashierReports & Analytics page shell.
// Composes CashierReportsSummaryCards + CashierReportsRevenueChart + CashierReportsTopItemsTable.
// All data logic delegated to useCashierReports hook.
// isMounted guard prevents SSR/client hydration mismatch.
// DATA FLOW: useCashierReports â†’ summary + topItems + dailyRevenue
//            â†’ CashierReportsSummaryCards + CashierReportsRevenueChart + CashierReportsTopItemsTable â†’ UI

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useCashierReports } from "@/app/cashier/reports/cashier_reports_hooks/useCashierReports";
import { CashierReportsSummaryCards } from "@/app/cashier/reports/cashier_reports_components/CashierReportsSummaryCards";
import { CashierReportsRevenueChart } from "@/app/cashier/reports/cashier_reports_components/CashierReportsRevenueChart";
import { CashierReportsTopItemsTable } from "@/app/cashier/reports/cashier_reports_components/CashierReportsTopItemsTable";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { CashierReportsPeriod } from "@/app/cashier/reports/cashier_reports_types/CashierReportsTypes";

// â”€â”€â”€ Constants (Rule 35: No magic strings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PAGE_TITLE    = "CashierReports & Analytics"                    as const;
const PAGE_SUBTITLE = "Sales performance and revenue insights" as const;

const PERIOD_TABS: { label: string; value: CashierReportsPeriod }[] = [
  { label: "Today",      value: "TODAY" },
  { label: "This Week",  value: "WEEK"  },
  { label: "This Month", value: "MONTH" },
  { label: "All Time",   value: "ALL"   },
] as const;

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CashierReportsPage() {
  // isMounted guard â€” prevents SSR/client hydration mismatch
  // Deps: [] â€” run once on mount only
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 6: All data + calculation logic in hook â€” page is pure shell
  const { summary, topItems, dailyRevenue, period, customDate, setPeriod, setCustomDate, exportCsv } = useCashierReports();

  // â”€â”€ Skeleton â€” shown before client mounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <CashierReportsPageHeader
          period={period}
          customDate={customDate}
          onPeriodChange={setPeriod}
          onCustomDateChange={setCustomDate}
          onExport={exportCsv}
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
        <div className="skeleton h-72 rounded-lg" />
      </div>
    );
  }

  // â”€â”€ Full render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <AuthGuard allowedRoles={["ADMIN", "CASHIER", "HOTEL_OWNER"]}>
      <div className="flex flex-col gap-6">
        <CashierReportsPageHeader
          period={period}
          customDate={customDate}
          onPeriodChange={setPeriod}
          onCustomDateChange={setCustomDate}
          onExport={exportCsv}
        />

        {/* KPI Summary Cards */}
        <CashierReportsSummaryCards summary={summary} />

        {/* Revenue Trend Chart â€” last 30 days (always full range) */}
        <CashierReportsRevenueChart dailyRevenue={dailyRevenue} />

        {/* Top Items Table â€” scoped to selected period */}
        <CashierReportsTopItemsTable topItems={topItems} />
      </div>
    </AuthGuard>
  );
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// RESPONSIBILITY: Page header with title, period tabs, custom date picker, and Export CSV button.
interface CashierReportsPageHeaderProps {
  period: CashierReportsPeriod;
  customDate: string;
  onPeriodChange: (p: CashierReportsPeriod) => void;
  onCustomDateChange: (d: string) => void;
  onExport: () => void;
}

function CashierReportsPageHeader({
  period,
  customDate,
  onPeriodChange,
  onCustomDateChange,
  onExport,
}: CashierReportsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
          <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
        </div>

        {/* Export CSV button */}
        <button
          onClick={onExport}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-text-primary hover:bg-primary-subtle"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Period selector tabs + Custom Date picker */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onPeriodChange(tab.value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                period === tab.value
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Custom Date Tab */}
          <button
            onClick={() => onPeriodChange("CUSTOM")}
            className={`flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              period === "CUSTOM"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            ðŸ“… 5-Day Window
          </button>
        </div>

        {/* Custom Single-Day Calendar Date Picker Input */}
        {period === "CUSTOM" && (
          <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-3 py-1.5">
            <span className="text-xs font-semibold text-primary">Pick Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => onCustomDateChange(e.target.value)}
              className="rounded-md border border-border bg-input px-2 py-1 text-xs font-bold text-text-primary focus:border-border-focus focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
