"use client";

// RESPONSIBILITY: Renders the Admin Single-Day Revenue Filter & Analytics Card.
// Allows Admin to pick any specific calendar date and view exact revenue, AOV, order volume, and payment method split for that single day.
// DATA FLOW: Date input → AdminSingleDayRevenueFilter.tsx → filters app_sales_history → Single-day KPIs & breakdown

import React, { useState, useMemo } from "react";
import type { AppSalesRecord } from "@/types/appTypes";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters";
import { Calendar, DollarSign, ShoppingBag, CreditCard, Filter, RefreshCw } from "lucide-react";

export interface AdminSingleDayRevenueFilterProps {
  salesHistory: AppSalesRecord[];
}

export function AdminSingleDayRevenueFilter({ salesHistory }: AdminSingleDayRevenueFilterProps): React.JSX.Element {
  // Default to today's date in YYYY-MM-DD format
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Calculate single day metrics
  const singleDayMetrics = useMemo(() => {
    if (!selectedDate) {
      return {
        totalRevenue: 0,
        orderCount: 0,
        aov: 0,
        cashTotal: 0,
        upiTotal: 0,
        cardTotal: 0,
        splitTotal: 0,
      };
    }

    const startOfDay = new Date(`${selectedDate}T00:00:00`).getTime();
    
    // 5-day window (Start of selected date to end of 4 days later)
    const endWindow = new Date(`${selectedDate}T00:00:00`);
    endWindow.setDate(endWindow.getDate() + 4);
    endWindow.setHours(23, 59, 59, 999);
    const endOfDay = endWindow.getTime();

    const filteredRecords = salesHistory.filter(
      (s) => s.timestamp >= startOfDay && s.timestamp <= endOfDay
    );

    let totalRevenue = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let splitTotal = 0;

    filteredRecords.forEach((s) => {
      totalRevenue += s.totalAmount;

      if (s.paymentMethod === "CASH") cashTotal += s.totalAmount;
      else if (s.paymentMethod === "UPI") upiTotal += s.totalAmount;
      else if (s.paymentMethod === "CARD") cardTotal += s.totalAmount;
      else if (s.paymentMethod === "SPLIT" && s.splitDetails) {
        cashTotal += s.splitDetails.cash || 0;
        upiTotal += s.splitDetails.upi || 0;
        cardTotal += s.splitDetails.card || 0;
        splitTotal += s.totalAmount;
      }
    });

    const orderCount = filteredRecords.length;
    const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalRevenue,
      orderCount,
      aov,
      cashTotal,
      upiTotal,
      cardTotal,
      splitTotal,
    };
  }, [salesHistory, selectedDate]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      {/* Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">5-Day Revenue Window</h3>
            <p className="text-xs text-text-secondary">
              Select a start date to analyze revenue breakdown over a 5-day period
            </p>
          </div>
        </div>

        {/* Date Picker Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Calendar size={14} className="absolute left-3 text-text-disabled" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-xs font-semibold text-text-primary focus:border-border-focus focus:outline-none"
            />
          </div>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="flex items-center gap-1 rounded-lg border border-border bg-page px-2.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
            title="Reset to today"
          >
            <RefreshCw size={12} />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* 5-Day KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-lg border border-border bg-page p-3.5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Target Revenue</span>
            <DollarSign size={14} className="text-primary" />
          </div>
          <p className="mt-1 text-xl font-bold text-text-primary">
            {formatCurrency(singleDayMetrics.totalRevenue)}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">
            Dates: <strong className="text-text-primary">
              {selectedDate ? `${selectedDate} to ${new Date(new Date(selectedDate).getTime() + 86400000 * 4).toISOString().split("T")[0]}` : "N/A"}
            </strong>
          </p>
        </div>

        {/* Orders Count */}
        <div className="rounded-lg border border-border bg-page p-3.5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Orders Billed</span>
            <ShoppingBag size={14} className="text-info" />
          </div>
          <p className="mt-1 text-xl font-bold text-text-primary">{singleDayMetrics.orderCount}</p>
          <p className="mt-1 text-[11px] text-text-secondary">Total transactions</p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="rounded-lg border border-border bg-page p-3.5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Order Value</span>
            <CreditCard size={14} className="text-warning" />
          </div>
          <p className="mt-1 text-xl font-bold text-text-primary">
            {formatCurrency(singleDayMetrics.aov)}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">AOV for this period</p>
        </div>

        {/* Payment Split Breakdown */}
        <div className="rounded-lg border border-border bg-page p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Payment Split
          </span>
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-pay-cash font-semibold">Cash:</span>
              <span className="font-mono text-text-primary">{formatCurrencyCompact(singleDayMetrics.cashTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pay-upi font-semibold">UPI:</span>
              <span className="font-mono text-text-primary">{formatCurrencyCompact(singleDayMetrics.upiTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pay-card font-semibold">Card:</span>
              <span className="font-mono text-text-primary">{formatCurrencyCompact(singleDayMetrics.cardTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
