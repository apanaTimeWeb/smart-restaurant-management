"use client";

// RESPONSIBILITY: Cashier Void & Discount Request Approval Center Modal.
// Displays pending void item requests and discount authorization requests from Waiters.
// DATA FLOW: app_orders -> CashierApprovalCenterModal -> Approve / Reject decisions

import React from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { recordOrderEvent } from "../cashier_utils/cashier_orderEventService";
import { dispatchNotification } from "@/lib/notificationService";
import { showToast } from "@/lib/toastService";
import type { AppOrder, AppMenuItem } from "@/types/appTypes";
import { ShieldCheck, X, Check, AlertTriangle } from "lucide-react";

export interface CashierApprovalCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CashierApprovalCenterModal({
  isOpen,
  onClose,
}: CashierApprovalCenterModalProps): React.JSX.Element | null {
  const [orders, setOrders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  if (!isOpen) return null;

  const menuMap = new Map(menu.map((m) => [m.id, m.name]));

  // Find all pending void requests
  const pendingVoidRequests: Array<{
    orderId: string;
    tableNumber: string;
    kotId: string;
    itemId: string;
    itemName: string;
    qty: number;
    notes?: string;
  }> = [];

  orders.forEach((ord) => {
    if (ord.status !== "ACTIVE") return;

    ord.kots.forEach((kot) => {
      kot.items.forEach((item) => {
        if (item.status === "VOID_REQUESTED") {
          pendingVoidRequests.push({
            orderId: ord.id,
            tableNumber: ord.tableNumber,
            kotId: kot.kotId,
            itemId: item.itemId,
            itemName: menuMap.get(item.itemId) || item.itemId,
            qty: item.qty,
            notes: item.notes,
          });
        }
      });
    });
  });

  const handleDecision = (
    orderId: string,
    kotId: string,
    itemId: string,
    tableNumber: string,
    approve: boolean
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedKots = ord.kots.map((kot) => {
          if (kot.kotId !== kotId) return kot;
          const updatedItems = kot.items.map((it) => {
            if (it.itemId !== itemId) return it;
            return {
              ...it,
              status: approve ? ("VOIDED" as const) : ("PENDING" as const),
            };
          });
          return { ...kot, items: updatedItems };
        });

        return { ...ord, kots: updatedKots };
      })
    );

    recordOrderEvent({
      orderId,
      type: approve ? "VOID_APPROVED" : "VOID_REJECTED",
      message: approve
        ? `Item void APPROVED for Table ${tableNumber}`
        : `Item void REJECTED for Table ${tableNumber}`,
      actorRole: "CASHIER",
    });

    dispatchNotification({
      role: "WAITER",
      type: "VOID_RESPONSE",
      title: approve ? "Void Approved" : "Void Rejected",
      message: `Void request for Table ${tableNumber} was ${approve ? "approved" : "rejected"}.`,
      entityId: orderId,
      entityType: "ORDER",
      route: "/waiter",
    });

    showToast({
      type: approve ? "success" : "info",
      message: `Void request ${approve ? "APPROVED" : "REJECTED"}!`,
    });
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Void & Approval Center</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-page hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pendingVoidRequests.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-text-muted">
              <ShieldCheck className="h-10 w-10 mb-2 opacity-30 text-emerald-500" />
              <p className="text-sm font-medium">No pending void approval requests!</p>
            </div>
          ) : (
            pendingVoidRequests.map((req, idx) => (
              <div
                key={`${req.kotId}-${req.itemId}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-text-primary">
                      Table {req.tableNumber}
                    </span>
                    <span className="text-xs text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded">
                      Void Requested
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-secondary mt-1">
                    Item: <span className="text-text-primary">{req.qty}x {req.itemName}</span>
                  </p>
                  {req.notes && (
                    <p className="text-[11px] text-text-muted italic mt-0.5">
                      Reason: "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleDecision(req.orderId, req.kotId, req.itemId, req.tableNumber, false)
                    }
                    className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-page"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      handleDecision(req.orderId, req.kotId, req.itemId, req.tableNumber, true)
                    }
                    className="rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-600 shadow-sm"
                  >
                    Approve Void
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
