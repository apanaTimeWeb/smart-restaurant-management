"use client";

// RESPONSIBILITY: Dedicated Stock Recovery Hub Modal for Cashiers to manage low stock alerts from Kitchen.
// DATA FLOW: app_stock_alerts -> BillingStockRecoveryModal -> Cashier Actions (In Progress / Supplied) -> Sync with Admin & Kitchen

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { dispatchNotification } from "@/lib/notificationService";
import { showToast } from "@/lib/toastService";
import { formatRelativeTime } from "@/lib/formatters";
import type { AppLowStockAlert } from "@/types/appTypes";
import {
  Package,
  Truck,
  PackageCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export interface BillingStockRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingStockRecoveryModal({
  isOpen,
  onClose,
}: BillingStockRecoveryModalProps): React.JSX.Element | null {
  const [stockAlerts, setStockAlerts] = useLocalStorage<AppLowStockAlert[]>(
    STORAGE_KEYS.STOCK_ALERTS,
    []
  );

  const [now, setNow] = useState(Date.now());

  // Tick clock every 5s for live SLA timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Active low stock alerts (only items that have NOT been fully restocked by kitchen)
  const activeAlerts = stockAlerts
    .filter((a) => a.status !== "RESTOCKED")
    .sort((a, b) => b.requestedAt - a.requestedAt);

  const handleUpdateStatus = (
    alertId: string,
    itemId: string,
    itemName: string,
    newStatus: "IN_PROGRESS" | "DISPATCHED"
  ) => {
    setStockAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, status: newStatus } : a
      )
    );

    if (newStatus === "IN_PROGRESS") {
      // Dispatch notification to Admin & Kitchen
      dispatchNotification({
        role: "ADMIN",
        type: "LOW_STOCK_ALERT",
        title: `Restock In Progress: ${itemName} 🚚`,
        message: `Cashier initiated restock procurement for ${itemName}. Status updated to IN PROGRESS.`,
        entityId: itemId,
        entityType: "INVENTORY",
        route: "/admin/inventory",
        playSound: false,
      });

      dispatchNotification({
        role: "KITCHEN",
        type: "LOW_STOCK_ALERT",
        title: `Restock In Progress: ${itemName} 🚚`,
        message: `Cashier initiated restock procurement for ${itemName}. Status updated to IN PROGRESS.`,
        entityId: itemId,
        entityType: "INVENTORY",
        route: "/kitchen",
        playSound: true,
        soundType: "BELL",
      });

      showToast({
        type: "info",
        title: "Restock Initiated 🚚",
        message: `Marked ${itemName} restock as IN PROGRESS! Admin & Kitchen notified.`,
      });
    } else if (newStatus === "DISPATCHED") {
      // Dispatch notification to Admin & Kitchen
      dispatchNotification({
        role: "ADMIN",
        type: "LOW_STOCK_ALERT",
        title: `Stock Supplied: ${itemName} 📦`,
        message: `Cashier supplied stock for ${itemName}. Awaiting Kitchen receipt confirmation.`,
        entityId: itemId,
        entityType: "INVENTORY",
        route: "/admin/inventory",
        playSound: false,
      });

      dispatchNotification({
        role: "KITCHEN",
        type: "LOW_STOCK_ALERT",
        title: `Stock Supplied: ${itemName} 📦`,
        message: `Cashier supplied stock for ${itemName}. Please confirm Full Stock Received!`,
        entityId: itemId,
        entityType: "INVENTORY",
        route: "/kitchen",
        playSound: true,
        soundType: "BELL",
      });

      showToast({
        type: "success",
        title: "Stock Supplied 📦",
        message: `Marked stock for ${itemName} as SUPPLIED to kitchen!`,
      });
    }
  };

  const getStatusBadge = (status: AppLowStockAlert["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-400 animate-pulse">
            <Truck className="h-3 w-3" /> Restock In Progress 🚚
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-400 animate-pulse">
            <PackageCheck className="h-3 w-3" /> Stock Supplied 📦
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-500 animate-pulse">
            <AlertTriangle className="h-3 w-3" /> Alert Sent 🚨
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-full max-h-[600px] w-full max-w-2xl flex-col rounded-2xl bg-surface text-text-primary shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2">
                Stock Recovery Hub 📦
                {activeAlerts.length > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    {activeAlerts.length} Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-text-secondary">
                Manage low stock items reported by kitchen. Update restock status to sync with Admin & Kitchen.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:bg-page hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-text-muted">
              <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-500 opacity-80" />
              <h4 className="text-base font-bold text-text-primary">All Stock Restocked & Recovered!</h4>
              <p className="text-xs text-text-muted mt-1 max-w-sm">
                There are no pending low stock alerts. When kitchen triggers a stock alert, it will appear here for Cashier restock processing.
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const elapsedMins = Math.floor((now - alert.requestedAt) / 60000);

              return (
                <div
                  key={alert.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border p-4 bg-page/60 shadow-xs hover:border-border/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-base text-text-primary flex items-center gap-2">
                        {alert.itemName}
                        <span className="text-xs font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-md border border-border/60">
                          {alert.station}
                        </span>
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Category: <span className="font-medium text-text-primary">{alert.category}</span>
                        {" · "}
                        Reported <span className="font-medium">{formatRelativeTime(alert.requestedAt)}</span>
                      </p>
                    </div>

                    {getStatusBadge(alert.status)}
                  </div>

                  {/* Cashier Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(
                          alert.id,
                          alert.itemId,
                          alert.itemName,
                          "IN_PROGRESS"
                        )
                      }
                      disabled={alert.status === "IN_PROGRESS" || alert.status === "DISPATCHED"}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 py-2 px-3 text-xs font-extrabold text-blue-400 hover:bg-blue-500/20 active:scale-95 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Truck className="h-4 w-4" />
                      <span>
                        {alert.status === "IN_PROGRESS"
                          ? "In Progress 🚚"
                          : "Mark Restock In Progress 🚚"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(
                          alert.id,
                          alert.itemId,
                          alert.itemName,
                          "DISPATCHED"
                        )
                      }
                      disabled={alert.status === "DISPATCHED"}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 py-2 px-3 text-xs font-extrabold text-purple-400 hover:bg-purple-500/20 active:scale-95 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <PackageCheck className="h-4 w-4" />
                      <span>
                        {alert.status === "DISPATCHED"
                          ? "Stock Supplied 📦"
                          : "Mark Stock Supplied 📦"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border p-4 bg-page/40">
          <span className="text-xs text-text-secondary font-medium">
            When kitchen confirms "Full Stock Received", item automatically removes from this hub & Admin alerts!
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-surface border border-border px-4 py-2 text-xs font-bold text-text-primary hover:bg-page transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
