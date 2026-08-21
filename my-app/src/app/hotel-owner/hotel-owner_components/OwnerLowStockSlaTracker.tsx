"use client";

// RESPONSIBILITY: Live 24-Hour SLA Low Stock Escalation Tracker & Strict Cashier Warning System for Owner.
// DATA FLOW: app_stock_alerts -> OwnerLowStockSlaTracker -> 24h SLA Countdown / CRITICAL RED Badge / Send Strict Warning

import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Send, Clock, CheckCircle2, AlertOctagon } from "lucide-react";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { showToast } from "@/lib/toastService";
import type { AppLowStockAlert, AppNotification } from "@/types/appTypes";

const SLA_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

export function OwnerLowStockSlaTracker(): React.JSX.Element | null {
  const [stockAlerts, setStockAlerts] = useLocalStorage<AppLowStockAlert[]>(STORAGE_KEYS.STOCK_ALERTS, []);
  const [, setNotifications] = useLocalStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const [now, setNow] = useState<number>(Date.now());

  // 1-second interval to update SLA timers live
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = stockAlerts.filter((a) => a.status !== "RESTOCKED");

  if (activeAlerts.length === 0) return null;

  const { currentUser } = useAuth();
  const canSend = currentUser?.role === "HOTEL_OWNER" || currentUser?.role === "SUPER_ADMIN";

  const handleSendStrictReminder = (alert: AppLowStockAlert) => {
    const cashierNotif: AppNotification = {
      id: `notif-strict-${Date.now()}`,
      role: "CASHIER",
      type: "LOW_STOCK_ALERT",
      title: `🚨 STRICT ADMIN WARNING: ${alert.itemName}`,
      message: `STRICT WARNING FROM ADMIN: Stock for ${alert.itemName} has been LOW for over 24 hours! Procure and restock immediately.`,
      entityId: alert.itemId,
      entityType: "INVENTORY",
      isRead: false,
      createdAt: Date.now(),
    };

    setNotifications((prev) => [cashierNotif, ...prev]);

    setStockAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, lastReminderSentAt: Date.now() } : a))
    );

    showToast({
      type: "error",
      title: "Strict Warning Sent ⚡",
      message: `High-priority strict warning sent to Cashier for ${alert.itemName}!`,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-red-500/40 bg-red-500/5 p-4 shadow-sm animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-500">
          <ShieldAlert className="h-5 w-5 animate-pulse shrink-0" />
          <h3 className="font-extrabold text-sm text-text-primary">
            Kitchen Low Stock SLA Monitor ({activeAlerts.length} Pending Alert{activeAlerts.length > 1 ? "s" : ""})
          </h3>
        </div>
        <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
          24-Hour Procurement SLA
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeAlerts.map((alert) => {
          const elapsedMs = now - alert.requestedAt;
          const remainingMs = SLA_DURATION_MS - elapsedMs;
          const isOverdue = elapsedMs >= SLA_DURATION_MS;

          // Format remaining time HH:MM:SS
          const formatSlaTimer = (ms: number) => {
            if (ms <= 0) return "00h 00m 00s (EXPIRED)";
            const totalSec = Math.floor(ms / 1000);
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
          };

          return (
            <div
              key={alert.id}
              className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                isOverdue
                  ? "border-red-500 bg-red-500/10 shadow-md ring-2 ring-red-500/30"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-text-primary">{alert.itemName}</span>
                  <span className="text-xs text-text-secondary">
                    Station: <strong>{alert.station}</strong> &middot; Category: {alert.category}
                  </span>
                </div>

                {alert.status === "IN_PROGRESS" ? (
                  <span className="flex items-center gap-1 rounded-md bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-extrabold text-blue-400 animate-pulse">
                    Restock In Progress 🚚
                  </span>
                ) : alert.status === "DISPATCHED" ? (
                  <span className="flex items-center gap-1 rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-extrabold text-purple-400 animate-pulse">
                    Stock Supplied 📦
                  </span>
                ) : isOverdue ? (
                  <span className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider animate-bounce shadow-md">
                    <AlertOctagon className="h-3 w-3" />
                    CRITICAL LOW STOCK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-500">
                    <Clock className="h-3 w-3" />
                    SLA Active
                  </span>
                )}
              </div>

              {/* SLA Timer Bar */}
              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-red-500 animate-spin" : "text-amber-500"}`} />
                  <span className={`font-bold ${isOverdue ? "text-red-500" : "text-amber-500"}`}>
                    {isOverdue ? "SLA Overdue (> 24 Hours)" : formatSlaTimer(remainingMs)}
                  </span>
                </div>

                {/* Send Strict Reminder Button (Unlocked when overdue or active) */}
                {canSend && (
                  <button
                    onClick={() => handleSendStrictReminder(alert)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs active:scale-95 ${
                      isOverdue
                        ? "border-red-500 bg-red-500 text-white hover:bg-red-600 animate-pulse"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Strict Reminder to Cashier</span>
                  </button>
                )}
                {!canSend && (
                  <button
                    disabled
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 px-3 py-1.5 text-xs font-bold cursor-not-allowed"
                    title="Only Owner can send strict reminders"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Strict Reminder to Cashier</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
