"use client";

// RESPONSIBILITY: Renders the 6-card KPI grid for the Admin Dashboard.
// Pure display component — receives pre-calculated AdminKpiCardData[] from parent.
// No data fetching, no localStorage access.
// DATA FLOW: useAdminDashboard → admin/page.tsx → AdminKpiGrid → AdminKpiCard → UI

import type { AdminKpiCardData, AdminKpiGridProps } from "@/app/admin/admin_types/AdminTypes";

// ─── Sub-component ────────────────────────────────────────────────────────────

// RESPONSIBILITY: Single KPI stat card — icon, label, value, trend.
function AdminKpiCard({ id: _id, label, value, icon: Icon, trend, trendUp }: AdminKpiCardData) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Icon + Label */}
      <div className="flex items-center gap-2">
        <Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
      </div>

      {/* Big value */}
      <p className="text-[26px] font-bold leading-none text-text-primary">
        {value}
      </p>

      {/* Trend — only shown when provided */}
      {trend !== undefined && (
        <p
          className={[
            "text-[12px] font-medium",
            trendUp === true  ? "text-success" :
            trendUp === false ? "text-danger"  : "text-text-secondary",
          ].join(" ")}
        >
          {trend}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

// RESPONSIBILITY: Placeholder card shown during SSR / data loading.
export function AdminKpiCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-7 w-28 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Renders a responsive grid of AdminKpiCard components.
 * 2 cols on mobile → 3 cols on md → 6 cols on xl.
 *
 * @param cards - Array of AdminKpiCardData from useAdminDashboard
 */
export function AdminKpiGrid({ cards }: AdminKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <AdminKpiCard key={card.id} {...card} />
      ))}
    </div>
  );
}
