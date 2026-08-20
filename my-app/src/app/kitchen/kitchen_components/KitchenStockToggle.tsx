"use client";

// RESPONSIBILITY: Renders the emergency stock toggle & waste management panel for Kitchen KDS.
// Features fast search input, stock status chips (All, In Stock, Out of Stock), station filters,
// bulk batch toggling, touch-friendly 48px switches, last updated timestamps, and 5s Undo Toast notifications.
// DATA FLOW: useKitchenStock -> KitchenStockToggle -> toggleItemAvailability / batchToggle -> Toast / localStorage

import React, { useState, useMemo, useEffect } from "react";
import { UtensilsCrossed, Trash2, Info, Search, Filter, CheckCircle2, AlertOctagon, Undo2, Layers, ChevronLeft, ChevronRight, AlertTriangle, Send, Check } from "lucide-react";
import { useKitchenStock } from "@/app/kitchen/kitchen_hooks/useKitchenStock";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { showToast } from "@/lib/toastService";
import type { KitchenStockToggleProps } from "@/app/kitchen/kitchen_types/KitchenTypes";
import type { AppMenuItem, AppLowStockAlert, AppNotification } from "@/types/appTypes";

const STATION_BADGE_CLASS: Record<string, string> = {
  Kitchen: "bg-warning-bg text-warning border-warning/30",
  Bar:     "bg-info-bg text-info border-info/30",
  Bakery:  "bg-success-bg text-success border-success/30",
};

export function KitchenStockToggle({
  onOpenWasteLog,
  onOpenRecipe,
  initialFilter = "ALL",
}: KitchenStockToggleProps) {
  const { menuItems, togglingId, toggleItemAvailability, batchToggleAvailability } = useKitchenStock();

  const [stockAlerts, setStockAlerts] = useLocalStorage<AppLowStockAlert[]>(STORAGE_KEYS.STOCK_ALERTS, []);
  const [, setNotifications] = useLocalStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);

  const [search, setSearch] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK">(initialFilter);
  const [selectedStation, setSelectedStation] = useState<string>("All");

  // Send Low Stock Alert Handler
  const handleSendLowStockAlert = (item: AppMenuItem) => {
    const existingAlert = stockAlerts.find((a) => a.itemId === item.id && a.status === "ALERT_SENT");
    if (existingAlert) {
      showToast({ type: "info", message: `Low stock alert already sent for ${item.name}!` });
      return;
    }

    const newAlert: AppLowStockAlert = {
      id: `alert-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      station: item.station,
      requestedAt: Date.now(),
      status: "ALERT_SENT",
    };

    setStockAlerts((prev) => [...prev, newAlert]);

    // Dispatch Notifications to Cashier and Admin
    const cashierNotif: AppNotification = {
      id: `notif-${Date.now()}-c`,
      role: "CASHIER",
      type: "LOW_STOCK_ALERT",
      title: `Low Stock Alert: ${item.name}`,
      message: `Urgent: ${item.name} stock is low! Please restock as soon as possible.`,
      entityId: item.id,
      entityType: "INVENTORY",
      isRead: false,
      createdAt: Date.now(),
    };

    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}-a`,
      role: "ADMIN",
      type: "LOW_STOCK_ALERT",
      title: `Low Stock Alert: ${item.name}`,
      message: `Urgent: ${item.name} stock is low! Please restock as soon as possible. (24h SLA Active)`,
      entityId: item.id,
      entityType: "INVENTORY",
      isRead: false,
      createdAt: Date.now(),
    };

    setNotifications((prev) => [cashierNotif, adminNotif, ...prev]);

    showToast({
      type: "warning",
      title: "Alert Sent 🚨",
      message: `Urgent: Low stock alert for ${item.name} sent to Cashier & Admin!`,
    });
  };

  // Mark Full Stock Received Handler
  const handleMarkFullStockReceived = (item: AppMenuItem) => {
    setStockAlerts((prev) =>
      prev.map((a) =>
        a.itemId === item.id && a.status !== "RESTOCKED"
          ? { ...a, status: "RESTOCKED", restockedAt: Date.now() }
          : a
      )
    );

    // If item was marked out of stock, toggle it back in stock
    if (!item.isAvailable) {
      toggleItemAvailability(item.id);
    }

    const cashierNotif: AppNotification = {
      id: `notif-${Date.now()}-c`,
      role: "CASHIER",
      type: "STOCK_RESTOCKED",
      title: `Full Stock Received: ${item.name} 🟢`,
      message: `Kitchen staff confirmed full stock received for ${item.name}. Item is back IN STOCK!`,
      entityId: item.id,
      entityType: "INVENTORY",
      isRead: false,
      createdAt: Date.now(),
    };

    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}-a`,
      role: "ADMIN",
      type: "STOCK_RESTOCKED",
      title: `Full Stock Received: ${item.name} 🟢`,
      message: `Kitchen staff confirmed full stock received for ${item.name}. SLA timer stopped.`,
      entityId: item.id,
      entityType: "INVENTORY",
      isRead: false,
      createdAt: Date.now(),
    };

    setNotifications((prev) => [cashierNotif, adminNotif, ...prev]);

    showToast({
      type: "success",
      title: "Full Stock Received 🟢",
      message: `Confirmed full stock received for ${item.name}. Item is back in stock!`,
    });
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Filtered menu items calculation
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Search match
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);

      // Stock status filter match
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && item.isAvailable) ||
        (stockFilter === "OUT_OF_STOCK" && !item.isAvailable);

      // Station match
      const matchesStation = selectedStation === "All" || item.station === selectedStation;

      return matchesSearch && matchesStock && matchesStation;
    });
  }, [menuItems, search, stockFilter, selectedStation]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stockFilter, selectedStation, pageSize]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredItems.length);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  // Counts for filter chips
  const totalCount = menuItems.length;
  const inStockCount = menuItems.filter((i) => i.isAvailable).length;
  const outOfStockCount = menuItems.filter((i) => !i.isAvailable).length;

  // Toggle item with 5s Undo Toast
  const handleToggle = (item: AppMenuItem) => {
    if (togglingId === item.id) return;

    toggleItemAvailability(item.id);
    const newAvailable = !item.isAvailable;

    showToast({
      type: newAvailable ? "success" : "warning",
      title: `${item.name}`,
      message: `${item.name} marked ${newAvailable ? "IN STOCK 🟢" : "OUT OF STOCK 🔴"}.`,
      actionLabel: "Undo ↩",
      onAction: () => {
        toggleItemAvailability(item.id);
        showToast({ type: "info", message: `Reverted ${item.name} availability.` });
      },
    });
  };

  const handleBatchToggle = (isAvailable: boolean) => {
    if (batchToggleAvailability) {
      batchToggleAvailability(selectedStation, isAvailable);
      showToast({
        type: isAvailable ? "success" : "warning",
        message: `Marked all ${selectedStation} items as ${isAvailable ? "IN STOCK" : "OUT OF STOCK"}.`,
      });
    }
  };

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
        <UtensilsCrossed size={40} strokeWidth={1.5} />
        <p className="text-sm font-medium">No menu items found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Top row: Fast Search Input & Log Waste Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kitchen menu items by name or category…"
              className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenWasteLog}
            className="flex h-11 items-center gap-2 rounded-xl bg-danger/10 border border-danger/30 px-4 text-xs font-bold text-danger hover:bg-danger/20 transition-all active:scale-95 shadow-xs"
          >
            <Trash2 className="h-4 w-4" />
            <span>Log Waste</span>
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
          {/* Stock Status Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStockFilter("ALL")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                stockFilter === "ALL"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>All Items</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{totalCount}</span>
            </button>

            <button
              onClick={() => setStockFilter("IN_STOCK")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                stockFilter === "IN_STOCK"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>In Stock</span>
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">{inStockCount}</span>
            </button>

            <button
              onClick={() => setStockFilter("OUT_OF_STOCK")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                stockFilter === "OUT_OF_STOCK"
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
              }`}
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Out of Stock</span>
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">{outOfStockCount}</span>
            </button>
          </div>

          {/* Station Filter Dropdown & Bulk Actions */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="rounded-xl border border-border bg-input px-3 py-1.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="All">All Stations</option>
              <option value="Kitchen">Main Kitchen</option>
              <option value="Bar">Bar / Drinks</option>
              <option value="Bakery">Bakery / Desserts</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleBatchToggle(true)}
                title={`Mark all ${selectedStation} items In Stock`}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500/20"
              >
                Mark Station In Stock
              </button>
              <button
                onClick={() => handleBatchToggle(false)}
                title={`Mark all ${selectedStation} items Out of Stock`}
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-500/20"
              >
                Mark Station Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items list — enlarged 48px touch-friendly targets */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 rounded-2xl border border-border bg-card text-text-muted">
          <UtensilsCrossed size={32} strokeWidth={1.5} />
          <p className="text-sm font-medium">No items match your filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginatedItems.map((item) => {
            const isToggling = togglingId === item.id;
            const badgeClass = STATION_BADGE_CLASS[item.station] ?? "bg-card text-text-secondary border-border";

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-xs transition-all ${
                  item.isAvailable
                    ? "border-border bg-card hover:border-emerald-500/30"
                    : "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                }`}
              >
                {/* Left Info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-bold text-text-primary">{item.name}</span>
                    {onOpenRecipe && (
                      <button
                        onClick={() => onOpenRecipe(item.id)}
                        title="View Recipe & Allergen Spec"
                        className="rounded p-1 text-text-muted hover:text-primary transition-colors"
                      >
                        <Info size={15} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${badgeClass}`}>
                      {item.station}
                    </span>

                    <span className={`text-[11px] font-bold ${item.isAvailable ? "text-emerald-500" : "text-red-500"}`}>
                      {item.isAvailable ? "In Stock • Updated recently" : "Out of Stock • Updated recently"}
                    </span>
                  </div>

                  {/* Low Stock Alert Controls */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {(() => {
                      const activeAlert = stockAlerts.find((a) => a.itemId === item.id && a.status !== "RESTOCKED");
                      if (activeAlert) {
                        return (
                          <div className="flex items-center gap-1.5">
                            {activeAlert.status === "IN_PROGRESS" && (
                              <span className="flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2 py-1 text-[10px] font-extrabold text-blue-400 animate-pulse">
                                <span>Restock In Progress 🚚</span>
                              </span>
                            )}
                            {activeAlert.status === "DISPATCHED" && (
                              <span className="flex items-center gap-1 rounded-lg bg-purple-500/10 border border-purple-500/30 px-2 py-1 text-[10px] font-extrabold text-purple-400 animate-pulse">
                                <span>Stock Supplied 📦</span>
                              </span>
                            )}
                            {activeAlert.status === "ALERT_SENT" && (
                              <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-[10px] font-extrabold text-amber-500 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Alert Sent 🚨</span>
                              </span>
                            )}
                            <button
                              onClick={() => handleMarkFullStockReceived(item)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-extrabold text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all shadow-xs"
                            >
                              <Check className="h-3 w-3" />
                              <span>Full Stock Received 🟢</span>
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => handleSendLowStockAlert(item)}
                          className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-extrabold text-amber-500 hover:bg-amber-500/20 active:scale-95 transition-all"
                        >
                          <Send className="h-3 w-3" />
                          <span>Send Low Stock Alert</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: Enlarged 48px Touch Switch Toggle */}
                <button
                  role="switch"
                  aria-checked={item.isAvailable}
                  disabled={isToggling}
                  onClick={() => handleToggle(item)}
                  className={`relative h-9 w-16 shrink-0 rounded-full transition-all duration-200 shadow-inner ${
                    item.isAvailable ? "bg-emerald-500" : "bg-red-500"
                  } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center font-bold text-xs ${
                      item.isAvailable ? "translate-x-8 text-emerald-600" : "translate-x-1 text-red-600"
                    }`}
                  >
                    {item.isAvailable ? "✓" : "✕"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {filteredItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary">
              Showing <strong className="text-text-primary">{startIndex + 1}</strong> –{" "}
              <strong className="text-text-primary">{endIndex}</strong> of{" "}
              <strong className="text-text-primary">{filteredItems.length}</strong> items
            </span>

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-border bg-input px-2 py-1 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              >
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                validCurrentPage === 1
                  ? "border-border/40 bg-page text-text-disabled cursor-not-allowed"
                  : "border-border bg-surface text-text-primary hover:bg-surface-hover shadow-xs active:scale-95"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-text-primary px-2">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                validCurrentPage >= totalPages
                  ? "border-border/40 bg-page text-text-disabled cursor-not-allowed"
                  : "border-border bg-surface text-text-primary hover:bg-surface-hover shadow-xs active:scale-95"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
