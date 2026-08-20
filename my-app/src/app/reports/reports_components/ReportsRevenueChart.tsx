"use client";

// RESPONSIBILITY: Renders the last-30-days daily revenue area line chart.
// Uses react-apexcharts with dark theme consistent with AdminRevenueChart.
// Dynamic import used — ApexCharts is browser-only (no SSR).
// DATA FLOW: useReports → reports/page.tsx → ReportsRevenueChart → ApexCharts → UI

import dynamic from "next/dynamic";
import type { ReportsRevenueChartProps } from "@/app/reports/reports_types/ReportsTypes";

// ─── Dynamic import (ApexCharts is browser-only — no SSR) ────────────────────

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Chart Color Constants (Rule 35: No magic strings) ───────────────────────

const COLOR_LINE       = "#10B981"                   as const; // Emerald-500 — success token
const COLOR_FILL       = "rgba(16,185,129,0.15)"     as const; // Emerald area fill
const COLOR_AXIS_TEXT  = "#94A3B8"                   as const; // Slate-400 — text-secondary
const COLOR_GRID_LINE  = "rgba(255,255,255,0.05)"    as const;
const COLOR_TOOLTIP_BG = "#1A1A2E"                   as const; // matches --bg-card
const COLOR_BG         = "transparent"               as const;

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Area line chart showing daily revenue for the last 30 calendar days.
 * Green line with semi-transparent fill, dark theme, no toolbar.
 *
 * @param dailyRevenue - Array of 30 ReportsDailyStat entries from useReports
 */
export function ReportsRevenueChart({ dailyRevenue }: ReportsRevenueChartProps) {
  const categories  = dailyRevenue.map((d) => d.date);
  const revenueData = dailyRevenue.map((d) => d.revenue);

  const series = [{ name: "Revenue (₹)", data: revenueData }];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type:       "area",
      background: COLOR_BG,
      toolbar:    { show: false },
      zoom:       { enabled: false },
      animations: { enabled: true, speed: 400 },
    },
    colors: [COLOR_LINE],
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: {
      type:    "solid",
      opacity: 0,
      gradient: {
        shadeIntensity: 1,
        opacityFrom:    0.4,
        opacityTo:      0.05,
        stops:          [0, 100],
      },
    },
    // Override fill with explicit color for area
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      tickAmount: 6,
      labels: {
        style:  { colors: COLOR_AXIS_TEXT, fontSize: "11px" },
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style:     { colors: COLOR_AXIS_TEXT, fontSize: "11px" },
        formatter: (val: number) => `₹${Math.round(val / 1000)}K`,
      },
    },
    grid: {
      borderColor:     COLOR_GRID_LINE,
      strokeDashArray: 4,
    },
    tooltip: {
      theme:           "dark",
      style:           { fontSize: "12px" },
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `₹${val.toLocaleString("en-IN")}`,
      },
    },
    markers: {
      size:        0,
      hover:       { size: 5 },
      strokeWidth: 0,
    },
  };

  // Apply area fill color via CSS override approach
  const areaOptions: ApexCharts.ApexOptions = {
    ...options,
    fill: {
      type:    "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom:    0.35,
        opacityTo:      0.02,
        stops:          [0, 100],
        colorStops: [
          { offset: 0,   color: COLOR_FILL, opacity: 0.35 },
          { offset: 100, color: COLOR_FILL, opacity: 0.02 },
        ],
      },
    },
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        Revenue Trend — Last 30 Days
      </p>
      <ReactApexChart
        options={areaOptions}
        series={series}
        type="area"
        height={240}
      />
    </div>
  );
}
