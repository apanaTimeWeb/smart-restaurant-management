"use client";

// RESPONSIBILITY: Renders the last-7-days revenue bar + order count line combo chart.
// Uses react-apexcharts with dark theme matching the app design system.
// Dynamic import used — ApexCharts is browser-only (no SSR).
// DATA FLOW: useAdminDashboard → admin/page.tsx → AdminRevenueChart → ApexCharts → UI

import dynamic from "next/dynamic";
import type { AdminRevenueChartProps } from "@/app/admin/admin_types/AdminTypes";

// ─── Dynamic import (Rule: ApexCharts is browser-only — no SSR) ──────────────

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Chart Color Constants (Rule 35: No magic strings) ───────────────────────

const COLOR_REVENUE    = "#6366F1" as const; // Indigo-500 — matches --primary
const COLOR_ORDERS     = "#10B981" as const; // Emerald-500 — matches --success
const COLOR_AXIS_TEXT  = "#94A3B8" as const; // Slate-400 — matches --text-secondary
const COLOR_GRID_LINE  = "rgba(255,255,255,0.05)" as const;
const COLOR_BG         = "transparent" as const;
const COLOR_TOOLTIP_BG = "#1A1A2E" as const; // matches --bg-card

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Bar + Line combo chart showing daily revenue (bars) and order count (line)
 * for the last 7 calendar days.
 *
 * @param dailyStats - Array of 7 AdminDailyStat entries from useAdminDashboard
 */
export function AdminRevenueChart({ dailyStats }: AdminRevenueChartProps) {
  const categories  = dailyStats.map((d) => d.date);
  const revenueData = dailyStats.map((d) => d.revenue);
  const orderData   = dailyStats.map((d) => d.orderCount);

  const series = [
    { name: "Revenue (₹)", type: "bar",  data: revenueData },
    { name: "Orders",       type: "line", data: orderData   },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type:       "line",
      background: COLOR_BG,
      toolbar:    { show: false },
      zoom:       { enabled: false },
      animations: { enabled: true, speed: 400 },
    },
    colors: [COLOR_REVENUE, COLOR_ORDERS],
    stroke: {
      width: [0, 3],
      curve: "smooth",
    },
    fill: {
      opacity: [0.85, 1],
    },
    plotOptions: {
      bar: {
        borderRadius:    4,
        columnWidth:     "55%",
        dataLabels:      { position: "top" },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { colors: COLOR_AXIS_TEXT, fontSize: "11px" },
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: [
      {
        // Left axis — Revenue
        labels: {
          style:     { colors: COLOR_AXIS_TEXT, fontSize: "11px" },
          formatter: (val: number) => `₹${Math.round(val / 1000)}K`,
        },
      },
      {
        // Right axis — Orders
        opposite: true,
        labels: {
          style:     { colors: COLOR_AXIS_TEXT, fontSize: "11px" },
          formatter: (val: number) => String(Math.round(val)),
        },
      },
    ],
    grid: {
      borderColor: COLOR_GRID_LINE,
      strokeDashArray: 4,
    },
    legend: {
      labels:   { colors: COLOR_AXIS_TEXT },
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      theme: "dark",
      style: { fontSize: "12px" },
      fillSeriesColor: false,
      y: [
        { formatter: (val: number) => `₹${val.toLocaleString("en-IN")}` },
        { formatter: (val: number) => `${val} orders` },
      ],
    },
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        Revenue & Orders — Last 7 Days
      </p>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={260}
      />
    </div>
  );
}
