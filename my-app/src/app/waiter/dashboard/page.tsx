"use client";

// RESPONSIBILITY: Dashboard landing page — shows 6 live KPI cards from localStorage.
// Reads real data via useLocalStorage hook. No direct localStorage access.
// DATA FLOW: localStorage → useLocalStorage → derived KPI values → DashboardKpiCard → UI

import { useMemo, useState, useEffect } from "react";
import {
  IndianRupee,
  ShoppingBag,
  TableProperties,
  TrendingUp,
  Wallet,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type {
  AppOrder,
  AppSalesRecord,
  AppTable,
  AppShiftRegister,
} from "@/types/appTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const PAGE_TITLE = "Dashboard" as const;
const PAGE_SUBTITLE = "Live overview of today's restaurant operations" as const;

const ORDER_STATUS_ACTIVE = "ACTIVE" as const;
const TABLE_STATUS_OCCUPIED = "OCCUPIED" as const;
const TABLE_STATUS_BILLING = "BILLING_PENDING" as const;
const KOT_STATUS_PENDING = "PENDING" as const;
const KOT_STATUS_COOKING = "COOKING" as const;

const SKELETON_CARD_COUNT = 6 as const;
const MS_PER_DAY = 86_400_000 as const;

// ─── KPI Card Types (Rule 7: types isolated) ─────────────────────────────────

interface DashboardKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

// ─── DashboardKpiCard — inline component (small, single responsibility) ───────

// RESPONSIBILITY: Renders one KPI stat card. Pure display — no logic, no data fetching.
function DashboardKpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: DashboardKpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Icon + Label row */}
      <div className="flex items-center gap-2">
        <Icon size={20} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
      </div>

      {/* Big KPI number */}
      <p className="text-[28px] font-bold leading-none text-text-primary">
        {value}
      </p>

      {/* Trend line — only shown if trend prop provided */}
      {trend !== undefined && (
        <p
          className={[
            "text-[12px] font-medium",
            trendUp === true ? "text-success" : "text-danger",
          ].join(" ")}
        >
          {trend}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton Card — shown while data loads ───────────────────────────────────

function DashboardKpiCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-8 w-32 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function WaiterDashboardPage() {
  // isMounted guard — server aur first client render pe skeleton dikhao
  // Why: localStorage SSR pe available nahi — hydration mismatch rokne ke liye
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 61: No direct localStorage — useLocalStorage hook only
  const [orders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [salesHistory] = useLocalStorage<AppSalesRecord[]>(STORAGE_KEYS.SALES_HISTORY, []);
  const [tables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);
  const [shiftRegister] = useLocalStorage<AppShiftRegister | null>(
    STORAGE_KEYS.SHIFT_REGISTER,
    null
  );

  // Derived KPI values — memoized to avoid recalc on every render
  // Why these deps: all 4 data sources affect at least one KPI value
  const kpis = useMemo(() => {
    const todayStart = Date.now() - MS_PER_DAY;

    const todaySales = salesHistory.filter((s) => s.timestamp >= todayStart);

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

    const avgOrderValue =
      todaySales.length > 0 ? todayRevenue / todaySales.length : 0;

    const activeOrders = orders.filter(
      (o) => o.status === ORDER_STATUS_ACTIVE
    ).length;

    const occupiedTables = tables.filter(
      (t) =>
        t.status === TABLE_STATUS_OCCUPIED ||
        t.status === TABLE_STATUS_BILLING
    ).length;

    const pendingKots = orders
      .filter((o) => o.status === ORDER_STATUS_ACTIVE)
      .flatMap((o) => o.kots)
      .flatMap((k) => k.items)
      .filter(
        (item) =>
          item.status === KOT_STATUS_PENDING ||
          item.status === KOT_STATUS_COOKING
      ).length;

    const shiftSales = shiftRegister?.totalSales ?? 0;

    return {
      todayRevenue,
      activeOrders,
      occupiedTables,
      avgOrderValue,
      shiftSales,
      pendingKots,
    };
  }, [orders, salesHistory, tables, shiftRegister]);

  // Show skeleton until client mounts — prevents SSR/client hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
            <DashboardKpiCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Loading state — data not yet hydrated from localStorage
  const isLoading =
    orders.length === 0 &&
    salesHistory.length === 0 &&
    tables.length === 0 &&
    shiftRegister === null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
            // index key acceptable here — static skeleton list, never reorders
            <DashboardKpiCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["WAITER"]}>
      <div className="flex flex-col gap-6">
        <DashboardPageHeader />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <DashboardKpiCard
            icon={IndianRupee}
            label="Today's Revenue"
            value={formatCurrencyCompact(kpis.todayRevenue)}
            trend="Last 24 hours"
            trendUp={kpis.todayRevenue > 0}
          />
          <DashboardKpiCard
            icon={ShoppingBag}
            label="Active Orders"
            value={String(kpis.activeOrders)}
            trend={kpis.activeOrders > 0 ? "Tables being served" : "No active orders"}
            trendUp={kpis.activeOrders > 0}
          />
          <DashboardKpiCard
            icon={TableProperties}
            label="Tables Occupied"
            value={`${kpis.occupiedTables} / ${tables.length}`}
            trend={kpis.occupiedTables > 0 ? "Including billing pending" : "All tables free"}
            trendUp={kpis.occupiedTables > 0}
          />
          <DashboardKpiCard
            icon={TrendingUp}
            label="Avg Order Value"
            value={formatCurrency(kpis.avgOrderValue)}
            trend="Today's average"
            trendUp={kpis.avgOrderValue > 0}
          />
          <DashboardKpiCard
            icon={Wallet}
            label="Shift Sales"
            value={formatCurrencyCompact(kpis.shiftSales)}
            trend="Current open shift"
            trendUp={kpis.shiftSales > 0}
          />
          <DashboardKpiCard
            icon={Clock}
            label="Pending KOTs"
            value={String(kpis.pendingKots)}
            trend={kpis.pendingKots > 0 ? "Pending + Cooking items" : "Kitchen clear"}
            trendUp={false}
          />
        </div>
      </div>
    </AuthGuard>
  );
}

// ─── Page Header — extracted to keep main component clean (Rule 1 file ceiling) ─

// RESPONSIBILITY: Renders static page title and subtitle only.
function DashboardPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
