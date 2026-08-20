"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, BarChart2, TrendingUp, Download, PieChart, Activity, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30D");

  const revenueByCity = [
    { city: "Mumbai", value: 45, label: "45%" },
    { city: "Delhi", value: 25, label: "25%" },
    { city: "Bangalore", value: 20, label: "20%" },
    { city: "Other", value: 10, label: "10%" },
  ];

  const userGrowth = [
    { month: "W1", users: 12 },
    { month: "W2", users: 18 },
    { month: "W3", users: 15 },
    { month: "W4", users: 24 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Advanced Analytics</h1>
            <p className="text-[12px] text-text-secondary">Platform-wide data visualization and reports.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-input border border-border rounded-md p-1">
              {["7D", "30D", "90D", "1Y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                    timeRange === range
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-border/50 hover:shadow-sm transition-all duration-200">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue by City (Horizontal Bars) */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={20} className="text-primary" />
              <h2 className="font-semibold text-[16px] text-text-primary">
                Revenue by Region
              </h2>
            </div>
            <Activity size={16} className="text-text-secondary" />
          </div>
          
          <div className="flex flex-col gap-4 mt-2">
            {revenueByCity.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
                  <span className="text-text-primary">{item.city}</span>
                  <span className="text-text-secondary">{item.label}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-input overflow-hidden border border-border/50">
                  <div
                    style={{ width: `${item.value}%` }}
                    className="h-full bg-primary rounded-full hover:bg-primary-hover transition-colors cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Recent User Growth (Trend Line mock) */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-success" />
              <h2 className="font-semibold text-[16px] text-text-primary">
                User Acquisition ({timeRange})
              </h2>
            </div>
            <Calendar size={16} className="text-text-secondary" />
          </div>

          <div className="flex items-end justify-between gap-4 h-[150px] pt-4 pb-2 border-b border-border/50 mt-4">
            {userGrowth.map((d, i) => {
              const heightPct = Math.min(100, Math.max(10, (d.users / 30) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-medium text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity bg-input border border-border px-2 py-1 rounded-md shadow-lg absolute -translate-y-8 z-30">
                    {d.users} Users
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] rounded-t-md bg-success/80 hover:bg-success transition-colors shadow-md cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-text-secondary">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
