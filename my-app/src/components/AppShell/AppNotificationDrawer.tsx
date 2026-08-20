"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { dispatchNotification } from "@/lib/notificationService";
import { showToast } from "@/lib/toastService";
import { formatRelativeTime } from "@/lib/formatters";
import type { UserRole, AppLowStockAlert } from "@/types/appTypes";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Clock,
  DollarSign,
  AlertCircle,
  Truck,
  PackageCheck,
  Sparkles,
} from "lucide-react";

export interface AppNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
}

export function AppNotificationDrawer({
  isOpen,
  onClose,
  role,
}: AppNotificationDrawerProps): React.JSX.Element | null {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications(role);
  const [stockAlerts, setStockAlerts] = useLocalStorage<AppLowStockAlert[]>(
    STORAGE_KEYS.STOCK_ALERTS,
    []
  );
  const router = useRouter();

  if (!isOpen) return null;

  const handleNotificationClick = (id: string, route?: string) => {
    markAsRead(id);
    if (route) {
      router.push(route);
      onClose();
    }
  };

  const handleUpdateStockAlertStatus = (
    entityId: string,
    newStatus: "IN_PROGRESS" | "DISPATCHED"
  ) => {
    let targetAlertName = "Item";
    setStockAlerts((prev) =>
      prev.map((a) => {
        if (a.itemId === entityId && a.status !== "RESTOCKED") {
          targetAlertName = a.itemName;
          return { ...a, status: newStatus };
        }
        return a;
      })
    );

    if (newStatus === "IN_PROGRESS") {
      dispatchNotification({
        role: "KITCHEN",
        type: "LOW_STOCK_ALERT",
        title: `Restock In Progress: ${targetAlertName} 🚚`,
        message: `Cashier has initiated restock procurement for ${targetAlertName}.`,
        entityId: entityId,
        entityType: "INVENTORY",
        route: "/kitchen",
        playSound: true,
        soundType: "BELL",
      });

      showToast({
        type: "info",
        title: "Restock Initiated 🚚",
        message: `Marked ${targetAlertName} restock as IN PROGRESS!`,
      });
    } else if (newStatus === "DISPATCHED") {
      dispatchNotification({
        role: "KITCHEN",
        type: "LOW_STOCK_ALERT",
        title: `Stock Supplied: ${targetAlertName} 📦`,
        message: `Cashier supplied stock for ${targetAlertName}. Please click Full Stock Received!`,
        entityId: entityId,
        entityType: "INVENTORY",
        route: "/kitchen",
        playSound: true,
        soundType: "BELL",
      });

      showToast({
        type: "success",
        title: "Stock Dispatched 📦",
        message: `Marked stock for ${targetAlertName} as SUPPLIED to kitchen!`,
      });
    }
  };

  const getEntityIcon = (type?: string) => {
    switch (type) {
      case "SERVICE_REQUEST":
        return <Utensils className="h-4 w-4 text-amber-500 shrink-0" />;
      case "KOT_NEW":
      case "KOT_READY":
        return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
      case "BILL_REQUESTED":
      case "PAYMENT":
        return <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "VOID_REQUEST":
      case "LOW_STOCK_ALERT":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-full w-full max-w-md flex-col bg-surface text-text-primary shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-page hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border/50 bg-page/50 px-4 py-2 text-xs">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button
            onClick={() => {
              if (window.confirm("Clear all notifications?")) {
                clearAll();
              }
            }}
            disabled={notifications.length === 0}
            className="flex items-center gap-1 font-medium text-danger hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-text-muted">
              <Bell className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-text-muted mt-1">Updates will appear here in real-time.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const activeAlert = n.entityId
                ? stockAlerts.find((a) => a.itemId === n.entityId && a.status !== "RESTOCKED")
                : undefined;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.route)}
                  className={`flex flex-col gap-2 py-3 px-2 rounded-lg transition-colors cursor-pointer ${
                    !n.isRead ? "bg-primary/5 font-medium" : "hover:bg-page/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getEntityIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm text-text-primary truncate ${!n.isRead ? "font-bold" : ""}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-text-muted shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>

                  {/* Cashier Action Buttons for Low Stock Alerts */}
                  {n.type === "LOW_STOCK_ALERT" && n.entityId && (
                    <div
                      className="mt-1.5 flex items-center gap-2 pt-2 border-t border-border/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateStockAlertStatus(n.entityId!, "IN_PROGRESS")}
                        disabled={activeAlert?.status === "IN_PROGRESS" || activeAlert?.status === "DISPATCHED"}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2 py-1.5 text-[11px] font-extrabold text-blue-400 hover:bg-blue-500/20 active:scale-95 disabled:opacity-40 transition-all shadow-xs"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>{activeAlert?.status === "IN_PROGRESS" ? "In Progress 🚚" : "Stock In Progress 🚚"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateStockAlertStatus(n.entityId!, "DISPATCHED")}
                        disabled={activeAlert?.status === "DISPATCHED"}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-purple-500/10 border border-purple-500/30 px-2 py-1.5 text-[11px] font-extrabold text-purple-400 hover:bg-purple-500/20 active:scale-95 disabled:opacity-40 transition-all shadow-xs"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>{activeAlert?.status === "DISPATCHED" ? "Stock Supplied 📦" : "Stock Supplied 📦"}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
