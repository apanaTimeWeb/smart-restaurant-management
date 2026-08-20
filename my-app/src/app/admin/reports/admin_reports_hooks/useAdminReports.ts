"use client";

// RESPONSIBILITY: All data-fetching and calculation logic for the AdminReports page.
// Reads SALES_HISTORY, ORDERS, MENU from localStorage via useLocalStorage.
// Derives summary KPIs, top-selling items, daily revenue trend, and CSV export.
// No JSX â€” pure logic hook consumed by admin_reports/page.tsx.
// DATA FLOW: localStorage â†’ useLocalStorage â†’ calc functions â†’ UseAdminReportsReturn
//            â†’ AdminReportsSummaryCards + AdminReportsRevenueChart + AdminReportsTopItemsTable â†’ UI

import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { formatDate } from "@/lib/formatters";
import type { AppSalesRecord, AppOrder, AppMenuItem, PaymentMethod, AppAdvanceReservation } from "@/types/appTypes";
import type {
  AdminReportsPeriod,
  AdminReportsSummary,
  AdminReportsTopItem,
  AdminReportsDailyStat,
  UseAdminReportsReturn,
} from "@/app/admin/reports/admin_reports_types/AdminReportsTypes";

// â”€â”€â”€ Constants (Rule 35: No magic strings / numbers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MS_PER_DAY      = 86_400_000 as const;
const DAYS_FOR_CHART  = 30         as const;
const TOP_ITEMS_LIMIT = 10         as const;

const PERIOD_LABELS: Record<AdminReportsPeriod, string> = {
  TODAY:  "Today",
  WEEK:   "This Week",
  MONTH:  "This Month",
  ALL:    "All Time",
  CUSTOM: "Custom Date",
} as const;

const CSV_HEADERS = "Date,Table,Payment Method,Subtotal,CGST,SGST,Service Charge,VAT,Discount,Total\n" as const;

// â”€â”€â”€ Pure Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns the start timestamp (midnight) for a given AdminReportsPeriod.
 * ALL returns 0 (epoch) to include every record.
 *
 * @param period - The selected reporting period
 * @returns Unix ms timestamp for the start of the period
 */
function getPeriodStart(period: AdminReportsPeriod): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (period === "TODAY") return now.getTime();

  if (period === "WEEK") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return d.getTime();
  }

  if (period === "MONTH") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return d.getTime();
  }

  return 0; // ALL
}

/**
 * Filters sales records to only those within the given period or custom date.
 *
 * @param records - Full sales history array
 * @param period  - Selected period
 * @param customDate - ISO YYYY-MM-DD string when period is CUSTOM
 * @returns Filtered array of AppSalesRecord
 */
function filterByPeriod<T extends { timestamp?: number; createdAt?: number }>(records: T[], period: AdminReportsPeriod, customDate: string): T[] {
  if (period === "CUSTOM" && customDate) {
    const targetStart = new Date(`${customDate}T00:00:00`).getTime();
    const targetEnd   = targetStart + (MS_PER_DAY * 5); // 5-day window
    return records.filter((r) => {
      const time = r.timestamp || r.createdAt || 0;
      return time >= targetStart && time < targetEnd;
    });
  }
  const start = getPeriodStart(period);
  return records.filter((r) => {
    const time = r.timestamp || r.createdAt || 0;
    return time >= start;
  });
}

/**
 * Derives the top payment method by total revenue from a set of sales records.
 * Returns "N/A" if records array is empty.
 *
 * @param records - Filtered sales records
 * @returns Payment method label string
 */
function getTopPaymentMethod(records: AppSalesRecord[]): string {
  if (records.length === 0) return "N/A";

  const totals: Record<PaymentMethod, number> = { CASH: 0, UPI: 0, CARD: 0, SPLIT: 0 };

  records.forEach((r) => {
    totals[r.paymentMethod] += r.totalAmount;
  });

  const top = (Object.entries(totals) as [PaymentMethod, number][]).reduce(
    (best, curr) => (curr[1] > best[1] ? curr : best)
  );

  return top[0];
}

/**
 * Calculates summary KPIs from filtered sales records.
 *
 * @param records - Period-filtered sales records
 * @param period  - Selected period (for label)
 * @param customDate - Custom date string if period is CUSTOM
 * @returns AdminReportsSummary object
 */
function calcSummary(records: AppSalesRecord[], advanceRecords: AppAdvanceReservation[], period: AdminReportsPeriod, customDate: string): AdminReportsSummary {
  const advanceBookingCount = advanceRecords.filter(r => r.paymentStatus === "PAID").length;
  const advanceBookingRevenue = advanceRecords
    .filter(r => r.paymentStatus === "PAID")
    .reduce((sum, r) => sum + r.totalAdvanceDeposit, 0);

  const totalRevenue   = records.reduce((sum, r) => sum + r.totalAmount, 0) + advanceBookingRevenue;
  const totalOrders    = records.length;
  const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topPaymentMethod = getTopPaymentMethod(records);
  
  let periodLabel = PERIOD_LABELS[period];
  if (period === "CUSTOM" && customDate) {
    const endDate = new Date(new Date(customDate).getTime() + MS_PER_DAY * 4).toISOString().split("T")[0];
    periodLabel = `Dates: ${customDate} to ${endDate}`;
  }

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    topPaymentMethod,
    periodLabel,
    advanceBookingCount,
    advanceBookingRevenue,
  };
}

/**
 * Calculates top-selling items by aggregating KOT items across all orders
 * that have a matching sale record in the filtered period.
 * Joins with menu data for name + category.
 * Returns top N items sorted by totalRevenue descending.
 *
 * @param orders  - All orders from localStorage
 * @param menu    - All menu items from localStorage
 * @param records - Period-filtered sales records (used to scope order IDs)
 * @returns Array of AdminReportsTopItem, max TOP_ITEMS_LIMIT entries
 */
function calcTopItems(
  orders: AppOrder[],
  menu: AppMenuItem[],
  records: AppSalesRecord[]
): AdminReportsTopItem[] {
  const scopedOrderIds = new Set(records.map((r) => r.orderId));
  const menuMap = new Map(menu.map((m) => [m.id, m]));

  const aggregated = new Map<string, AdminReportsTopItem>();

  orders
    .filter((o) => scopedOrderIds.has(o.id))
    .forEach((order) => {
      order.kots.forEach((kot) => {
        kot.items.forEach((kotItem) => {
          const menuItem = menuMap.get(kotItem.itemId);
          if (!menuItem) return;

          const existing = aggregated.get(kotItem.itemId);
          const revenue  = menuItem.price * kotItem.qty;

          if (existing) {
            existing.totalQty     += kotItem.qty;
            existing.totalRevenue += revenue;
          } else {
            aggregated.set(kotItem.itemId, {
              itemId:       kotItem.itemId,
              name:         menuItem.name,
              category:     menuItem.category,
              totalQty:     kotItem.qty,
              totalRevenue: revenue,
            });
          }
        });
      });
    });

  return Array.from(aggregated.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, TOP_ITEMS_LIMIT);
}

/**
 * Builds last-N-days daily revenue array from all sales records.
 * Each entry represents one calendar day, oldest first.
 *
 * @param records - Full (unfiltered) sales history
 * @param days    - Number of days to include (default 30)
 * @returns Array of AdminReportsDailyStat entries
 */
function calcDailyRevenue(records: AppSalesRecord[], days: number): AdminReportsDailyStat[] {
  return Array.from({ length: days }, (_, i) => {
    const dayIndex = days - 1 - i;
    const dayStart = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - dayIndex);
      return d.getTime();
    })();
    const dayEnd = dayStart + MS_PER_DAY;

    const revenue = records
      .filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd)
      .reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      date:    formatDate(dayStart),
      revenue,
    };
  });
}

/**
 * Generates a CSV string from filtered sales records and triggers a browser download.
 *
 * @param records - Period-filtered sales records to export
 */
function buildAndDownloadCsv(records: AppSalesRecord[]): void {
  if (typeof window === "undefined") return;

  const rows = records.map((r) =>
    [
      formatDate(r.timestamp),
      r.tableNumber,
      r.paymentMethod,
      r.subtotal,
      r.cgst,
      r.sgst,
      r.serviceCharge,
      r.vat,
      r.discount,
      r.totalAmount,
    ].join(",")
  );

  const csvContent = CSV_HEADERS + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href     = url;
  link.download = `sales-report-${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Derives all AdminReports page data from localStorage.
 * Recalculates when period changes or source data changes.
 * All heavy calculations are memoized.
 *
 * @returns summary, topItems, dailyRevenue, period, customDate, setPeriod, setCustomDate, exportCsv
 */
export function useAdminReports(): UseAdminReportsReturn {
  const [period, setPeriod] = useState<AdminReportsPeriod>("MONTH");
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Rule 61: No direct localStorage â€” hooks only
  const [salesHistory] = useLocalStorage<AppSalesRecord[]>(STORAGE_KEYS.SALES_HISTORY, []);
  const [orders]       = useLocalStorage<AppOrder[]>      (STORAGE_KEYS.ORDERS,        []);
  const [menu]         = useLocalStorage<AppMenuItem[]>   (STORAGE_KEYS.MENU,          []);
  const [advanceReservations] = useLocalStorage<AppAdvanceReservation[]>(STORAGE_KEYS.ADVANCE_RESERVATIONS, []);

  // Deps: salesHistory + period + customDate â€” refilter when any changes
  const filteredRecords = useMemo(
    () => filterByPeriod(salesHistory, period, customDate) as AppSalesRecord[],
    [salesHistory, period, customDate]
  );

  // Read directly because active_tenant_id is stored as a raw string, not a JSON string!
  const activeTenantId = typeof window !== "undefined" ? window.localStorage.getItem("active_tenant_id") : null;

  const filteredAdvance = useMemo(
    () => {
      const filteredByPeriod = filterByPeriod(advanceReservations, period, customDate) as AppAdvanceReservation[];
      return filteredByPeriod.filter(r => r.tenantId === activeTenantId);
    },
    [advanceReservations, period, customDate, activeTenantId]
  );

  // Deps: filteredRecords + period + customDate â€” recalc KPIs when filtered set changes
  const summary = useMemo(
    () => calcSummary(filteredRecords, filteredAdvance, period, customDate),
    [filteredRecords, filteredAdvance, period, customDate]
  );

  // Deps: orders + menu + filteredRecords â€” recalc top items when any source changes
  const topItems = useMemo(
    () => calcTopItems(orders, menu, filteredRecords),
    [orders, menu, filteredRecords]
  );

  // Deps: salesHistory â€” always last 30 days regardless of period selector
  const dailyRevenue = useMemo(
    () => calcDailyRevenue(salesHistory, DAYS_FOR_CHART),
    [salesHistory]
  );

  function exportCsv(): void {
    buildAndDownloadCsv(filteredRecords);
  }

  return {
    summary,
    topItems,
    dailyRevenue,
    period,
    customDate,
    setPeriod,
    setCustomDate,
    exportCsv,
  };
}
