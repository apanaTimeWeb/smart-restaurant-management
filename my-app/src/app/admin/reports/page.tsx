"use client";

// RESPONSIBILITY: AdminReports & Analytics page shell.
// Composes AdminReportsSummaryCards + AdminReportsRevenueChart + AdminReportsTopItemsTable.
// All data logic delegated to useAdminReports hook.
// isMounted guard prevents SSR/client hydration mismatch.
// DATA FLOW: useAdminReports â†’ summary + topItems + dailyRevenue
//            â†’ AdminReportsSummaryCards + AdminReportsRevenueChart + AdminReportsTopItemsTable â†’ UI

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useAdminReports } from "@/app/admin/reports/admin_reports_hooks/useAdminReports";
import { AdminReportsSummaryCards } from "@/app/admin/reports/admin_reports_components/AdminReportsSummaryCards";
import { AdminReportsRevenueChart } from "@/app/admin/reports/admin_reports_components/AdminReportsRevenueChart";
import { AdminReportsTopItemsTable } from "@/app/admin/reports/admin_reports_components/AdminReportsTopItemsTable";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { AdminReportsPeriod } from "@/app/admin/reports/admin_reports_types/AdminReportsTypes";

// â”€â”€â”€ Constants (Rule 35: No magic strings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PAGE_TITLE    = "AdminReports & Analytics"                    as const;
const PAGE_SUBTITLE = "Sales performance and revenue insights" as const;

const PERIOD_TABS: { label: string; value: AdminReportsPeriod }[] = [
  { label: "Today",      value: "TODAY" },
  { label: "This Week",  value: "WEEK"  },
  { label: "This Month", value: "MONTH" },
  { label: "All Time",   value: "ALL"   },
] as const;

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminReportsPage() {
  // isMounted guard â€” prevents SSR/client hydration mismatch
  // Deps: [] â€” run once on mount only
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 6: All data + calculation logic in hook â€” page is pure shell
  const { summary, topItems, dailyRevenue, period, customDate, setPeriod, setCustomDate, exportCsv } = useAdminReports();

  // â”€â”€ Skeleton â€” shown before client mounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <AdminReportsPageHeader
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
        <AdminReportsPageHeader
          period={period}
          customDate={customDate}
          onPeriodChange={setPeriod}
          onCustomDateChange={setCustomDate}
          onExport={exportCsv}
        />

        {/* KPI Summary Cards */}
        <AdminReportsSummaryCards summary={summary} />

        {/* Revenue Trend Chart â€” last 30 days (always full range) */}
        <AdminReportsRevenueChart dailyRevenue={dailyRevenue} />

        {/* Top Items Table â€” scoped to selected period */}
        <AdminReportsTopItemsTable topItems={topItems} />
      </div>
    </AuthGuard>
  );
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// RESPONSIBILITY: Page header with title, period tabs, custom date picker, and Export CSV button.
interface AdminReportsPageHeaderProps {
  period: AdminReportsPeriod;
  customDate: string;
  onPeriodChange: (p: AdminReportsPeriod) => void;
  onCustomDateChange: (d: string) => void;
  onExport: () => void;
}

function AdminReportsPageHeader({
  period,
  customDate,
  onPeriodChange,
  onCustomDateChange,
  onExport,
}: AdminReportsPageHeaderProps) {
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
