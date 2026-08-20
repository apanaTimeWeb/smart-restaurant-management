"use client";

// RESPONSIBILITY: Displays items marked READY in the kitchen grouped by table for waiters to serve.
// Features 1-click "Mark Served" action updating KotItemStatus to SERVED.
// DATA FLOW: app_orders -> WaiterReadyQueue -> update KotItemStatus to SERVED

import React from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { recordOrderEvent } from "@/lib/orderEventService";
import { showToast } from "@/lib/toastService";
import type { AppOrder, AppMenuItem } from "@/types/appTypes";
import { CheckCircle2, Clock, Utensils, Sparkles } from "lucide-react";

export function WaiterReadyQueue(): React.JSX.Element | null {
  const [orders, setOrders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  const menuMap = new Map(menu.map((m) => [m.id, m.name]));

  // Find all active orders with READY items
  const readyGroups: Array<{
    orderId: string;
    tableNumber: string;
    items: Array<{
      kotId: string;
      itemId: string;
      itemName: string;
      qty: number;
      notes?: string;
      timestamp: number;
    }>;
  }> = [];

  orders.forEach((ord) => {
    if (ord.status !== "ACTIVE") return;

    const readyItems: Array<{
      kotId: string;
      itemId: string;
      itemName: string;
      qty: number;
      notes?: string;
      timestamp: number;
    }> = [];

    ord.kots.forEach((kot) => {
      kot.items.forEach((item) => {
        if (item.status === "READY") {
          readyItems.push({
            kotId: kot.kotId,
            itemId: item.itemId,
            itemName: menuMap.get(item.itemId) || "Menu Item",
            qty: item.qty,
            notes: item.notes,
            timestamp: kot.timestamp,
          });
        }
      });
    });

    if (readyItems.length > 0) {
      readyGroups.push({
        orderId: ord.id,
        tableNumber: ord.tableNumber,
        items: readyItems,
      });
    }
  });

  if (readyGroups.length === 0) return null;

  const markItemServed = (orderId: string, kotId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedKots = ord.kots.map((kot) => {
          if (kot.kotId !== kotId) return kot;
          const updatedItems = kot.items.map((it) =>
            it.itemId === itemId ? { ...it, status: "SERVED" as const } : it
          );
          return { ...kot, items: updatedItems };
        });

        return { ...ord, kots: updatedKots };
      })
    );

    recordOrderEvent({
      orderId,
      type: "ITEM_SERVED",
      message: `Item served at Table ${orderId}`,
      actorRole: "WAITER",
    });

    showToast({
      type: "success",
      message: "Item marked as SERVED!",
    });
  };

  const markTableAllServed = (orderId: string, tableNumber: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedKots = ord.kots.map((kot) => ({
          ...kot,
          items: kot.items.map((it) =>
            it.status === "READY" ? { ...it, status: "SERVED" as const } : it
          ),
        }));

        return { ...ord, kots: updatedKots };
      })
    );

    recordOrderEvent({
      orderId,
      type: "TABLE_ALL_SERVED",
      message: `All ready dishes served to Table ${tableNumber}`,
      actorRole: "WAITER",
    });

    showToast({
      type: "success",
      title: `Table ${tableNumber}`,
      message: "All ready dishes served to table!",
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm animate-in fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500 animate-bounce" />
          <h3 className="font-bold text-base text-text-primary">
            Ready to Serve Queue ({readyGroups.reduce((acc, g) => acc + g.items.length, 0)} items)
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {readyGroups.map((group) => (
          <div
            key={group.orderId}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                <span className="font-bold text-base text-text-primary">
                  Table {group.tableNumber}
                </span>
                <button
                  onClick={() => markTableAllServed(group.orderId, group.tableNumber)}
                  className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  Serve All ({group.items.length})
                </button>
              </div>

              <div className="space-y-1.5 mb-3">
                {group.items.map((item, idx) => (
                  <div
                    key={`${item.kotId}-${item.itemId}-${idx}`}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-page/70"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{item.qty}x</span>
                      <span className="font-medium text-text-primary">{item.itemName}</span>
                    </div>
                    <button
                      onClick={() => markItemServed(group.orderId, item.kotId, item.itemId)}
                      className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      Serve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
