"use client";

// RESPONSIBILITY: Renders the payment method split donut chart for Admin Dashboard.
// Shows Cash / UPI / Card / Split breakdown as donut segments.
// Dynamic import used — ApexCharts is browser-only (no SSR).
// DATA FLOW: useAdminDashboard → admin/page.tsx → AdminPaymentDonut → ApexCharts → UI

import dynamic from "next/dynamic";
import { formatCurrencyCompact } from "@/lib/formatters";
import type { AdminPaymentDonutProps } from "@/app/admin/admin_types/AdminTypes";

// ─── Dynamic import (Rule: ApexCharts is browser-only — no SSR) ──────────────

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Chart Color Constants (Rule 35: No magic strings) ───────────────────────

const COLOR_CASH       = "#5EEAD4" as const; // Teal — matches --pay-cash
const COLOR_UPI        = "#67E8F9" as const; // Cyan — matches --pay-upi
const COLOR_CARD       = "#94A3B8" as const; // Slate — matches --pay-card
const COLOR_SPLIT      = "#6366F1" as const; // Indigo — matches --primary
const COLOR_AXIS_TEXT  = "#94A3B8" as const;
const COLOR_BG         = "transparent" as const;

const PAYMENT_LABELS   = ["Cash", "UPI", "Card", "Split"] as const;
const PAYMENT_COLORS   = [COLOR_CASH, COLOR_UPI, COLOR_CARD, COLOR_SPLIT] as const;

// ─── Empty State ──────────────────────────────────────────────────────────────

// RESPONSIBILITY: Shown when no sales data exists yet.
function EmptyDonut() {
  return (
    <div className="flex h-[260px] items-center justify-center">
      <p className="text-[13px] text-text-secondary">No payment data yet</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Donut chart showing payment method breakdown (Cash / UPI / Card / Split).
 * Center label shows total transaction count.
 * Hides zero-value segments automatically via ApexCharts.
 *
 * @param paymentSplit      - Cash/UPI/Card/Split totals from useAdminDashboard
 * @param totalTransactions - Total number of sales records (all time)
 */
export function AdminPaymentDonut({ paymentSplit, totalTransactions }: AdminPaymentDonutProps) {
  const series = [
    paymentSplit.cash,
    paymentSplit.upi,
    paymentSplit.card,
    paymentSplit.split,
  ];

  const hasData = series.some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
          Payment Split
        </p>
        <EmptyDonut />
      </div>
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type:       "donut",
      background: COLOR_BG,
      toolbar:    { show: false },
      animations: { enabled: true, speed: 400 },
    },
    colors:  [...PAYMENT_COLORS],
    labels:  [...PAYMENT_LABELS],
    stroke:  { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show:      true,
              label:     "Transactions",
              color:     COLOR_AXIS_TEXT,
              fontSize:  "11px",
              formatter: () => String(totalTransactions),
            },
            value: {
              color:     "#F0F0FF",
              fontSize:  "18px",
              fontWeight: "700",
              formatter: (val: string) => formatCurrencyCompact(Number(val)),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position:        "bottom",
      horizontalAlign: "center",
      labels:          { colors: COLOR_AXIS_TEXT },
      fontSize:        "12px",
      markers:         { size: 8 },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => formatCurrencyCompact(val),
      },
    },
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        Payment Split
      </p>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={260}
      />
    </div>
  );
}
