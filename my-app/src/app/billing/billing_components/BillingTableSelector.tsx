"use client";

// RESPONSIBILITY: Renders the left panel Table Selector Grid & Order Type Tabs for Cashier POS.
// Supports Order Types: Dine-In, Takeaway / Parcel, Online Delivery (Swiggy/Zomato).
// Supports Table Grid View & List View with status badges: Occupied 🔴, Bill Requested 🟡, Available 🟢, Cleaning 🧹.
// DATA FLOW: billing/page.tsx -> BillingTableSelector -> onSelect -> useBillingOrder

import React, { useState, useMemo } from "react";
import { Clock, UtensilsCrossed, Search, Grid, List, ShoppingBag, Truck, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { formatRelativeTime } from "@/lib/formatters";
import type { BillingTableSelectorProps } from "@/app/billing/billing_types/BillingTypes";

const SECTION_BADGE_CLASS: Record<string, string> = {
  Dining:  "bg-info-bg text-info",
  AC:      "bg-primary-subtle text-primary",
  Outdoor: "bg-success-bg text-success",
};

export type OrderTypeTab = "Dine-In" | "Takeaway" | "Online Delivery";

export function BillingTableSelector({
  tables,
  selectedTableId,
  onSelect,
}: BillingTableSelectorProps): React.JSX.Element {
  const [orderType, setOrderType] = useState<OrderTypeTab>("Dine-In");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTables = useMemo(() => {
    return tables.filter(({ table, order }) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        table.tableNumber.toLowerCase().includes(q) ||
        table.section.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [tables, searchQuery]);

  return (
    <div className="flex flex-col gap-3">
      {/* Order Type Tabs */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1 shadow-xs">
        <button
          onClick={() => setOrderType("Dine-In")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            orderType === "Dine-In"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          <span>Dine-In</span>
        </button>

        <button
          onClick={() => setOrderType("Takeaway")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            orderType === "Takeaway"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Parcel</span>
        </button>

        <button
          onClick={() => setOrderType("Online Delivery")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            orderType === "Online Delivery"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Online</span>
        </button>
      </div>

      {/* Search Input & View Toggle Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            id="table-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table (e.g. T-01)... [F2]"
            className="w-full rounded-xl border border-border bg-input pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1 transition-colors ${
              viewMode === "grid" ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-1 transition-colors ${
              viewMode === "list" ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table Selector Rendering */}
      {filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-text-secondary rounded-2xl border border-border bg-card">
          <UtensilsCrossed size={32} strokeWidth={1.5} />
          <p className="text-xs font-medium">No pending tables found</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Visual Table Layout Grid View */
        <div className="grid grid-cols-2 gap-2.5">
          {filteredTables.map(({ table, order }) => {
            const isSelected = table.id === selectedTableId;
            const isBillRequested = table.status === "BILLING_PENDING";

            return (
              <button
                key={table.id}
                onClick={() => onSelect(table.id)}
                className={`flex flex-col justify-between rounded-2xl border p-3 text-left transition-all active:scale-95 shadow-xs ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : isBillRequested
                    ? "border-amber-500/50 bg-amber-500/10 hover:border-amber-500"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-extrabold text-base text-text-primary">
                    T-{table.tableNumber}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1 ${
                      isBillRequested
                        ? "bg-amber-500 text-white animate-pulse shadow-xs"
                        : "bg-emerald-500/20 text-emerald-500"
                    }`}
                  >
                    {isBillRequested ? "BILL REQ 🧾" : "OCCUPIED 🔴"}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-text-secondary flex justify-between items-center border-t border-border/40 pt-1.5">
                  <span>{order.kots.reduce((sum, k) => sum + k.items.length, 0)} items</span>
                  <span className="font-bold text-text-primary">
                    {order.kots.length} KOTs
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* List View */
        <ul className="flex flex-col gap-2">
          {filteredTables.map(({ table, order }) => {
            const isSelected = table.id === selectedTableId;
            const sectionBadge = SECTION_BADGE_CLASS[table.section] ?? "bg-card text-text-secondary";

            return (
              <li key={table.id}>
                <button
                  onClick={() => onSelect(table.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-text-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">
                      Table {table.tableNumber}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sectionBadge}`}>
                      {table.section}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {order.kots.length} KOTs &middot;{" "}
                    {order.kots.reduce((sum, k) => sum + k.items.length, 0)} items
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
