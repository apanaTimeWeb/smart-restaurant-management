"use client";

// RESPONSIBILITY: Renders the active Customer Service Request queue for Waiters.
// Features SLA timers (Yellow warning at 3m, Red alert at 5m), filtering, and status updates.
// DATA FLOW: app_service_requests -> WaiterServiceRequestsDrawer -> updateServiceRequestStatus

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { updateServiceRequestStatus } from "@/lib/serviceRequestService";
import type { AppServiceRequest } from "@/types/appTypes";
import {
  Utensils,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
  Droplets,
  DollarSign,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export interface WaiterServiceRequestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  waiterId?: string;
}

export function WaiterServiceRequestsDrawer({
  isOpen,
  onClose,
  waiterId = "staff-waiter-01",
}: WaiterServiceRequestsDrawerProps): React.JSX.Element | null {
  const [requests] = useLocalStorage<AppServiceRequest[]>(
    STORAGE_KEYS.SERVICE_REQUESTS,
    []
  );

  const [now, setNow] = useState(Date.now());

  // Tick clock every 5s for live SLA timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const pendingRequests = requests
    .filter((r) => r.status === "PENDING" || r.status === "ACKNOWLEDGED")
    .sort((a, b) => a.createdAt - b.createdAt); // Oldest first

  const getSlaBadge = (createdAt: number) => {
    const elapsedMins = Math.floor((now - createdAt) / 60000);
    if (elapsedMins >= 5) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-500 animate-pulse">
          <AlertTriangle className="h-3 w-3" /> {elapsedMins}m (Overdue)
        </span>
      );
    }
    if (elapsedMins >= 3) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-500">
          <Clock className="h-3 w-3" /> {elapsedMins}m (Warning)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
        <Clock className="h-3 w-3" /> {elapsedMins}m
      </span>
    );
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case "WATER":
        return <Droplets className="h-5 w-5 text-blue-500 shrink-0" />;
      case "BILL":
        return <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "CLEANING":
        return <RefreshCw className="h-5 w-5 text-purple-500 shrink-0" />;
      default:
        return <Utensils className="h-5 w-5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-full w-full max-w-md flex-col bg-surface text-text-primary shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-lg">Customer Service Requests</h3>
            {pendingRequests.length > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {pendingRequests.length} active
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

        {/* Request Queue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-text-muted">
              <CheckCircle2 className="h-10 w-10 mb-2 opacity-30 text-emerald-500" />
              <p className="text-sm font-medium">All service requests completed!</p>
              <p className="text-xs text-text-muted mt-1">New requests from customer tables will appear here.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-3 rounded-2xl border border-border p-4 bg-page/60 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getRequestIcon(req.type)}
                    <div>
                      <h4 className="font-bold text-base text-text-primary">
                        Table {req.tableNumber}
                      </h4>
                      <p className="text-xs text-text-secondary font-medium">
                        Request: <span className="text-primary font-semibold">{req.type.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>
                  {getSlaBadge(req.createdAt)}
                </div>

                {req.customMessage && (
                  <div className="rounded-lg bg-surface border border-border/60 p-2.5 text-xs text-text-secondary italic">
                    "{req.customMessage}"
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {req.status === "PENDING" && (
                    <button
                      onClick={() => updateServiceRequestStatus(req.id, "ACKNOWLEDGED", waiterId)}
                      className="flex-1 rounded-xl bg-primary/10 border border-primary/30 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => updateServiceRequestStatus(req.id, "COMPLETED", waiterId)}
                    className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
