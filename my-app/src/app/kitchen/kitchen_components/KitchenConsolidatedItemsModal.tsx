"use client";

// RESPONSIBILITY: Aggregates pending and cooking dish quantities across all active KOTs.
// DATA FLOW: KOT list -> KitchenConsolidatedItemsModal -> Aggregate Quantities UI

import React from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppOrder, AppMenuItem, KitchenStation } from "@/types/appTypes";
import { Layers, X, ChefHat } from "lucide-react";

export interface KitchenConsolidatedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStation?: KitchenStation | "All";
}

export function KitchenConsolidatedItemsModal({
  isOpen,
  onClose,
  activeStation = "All",
}: KitchenConsolidatedItemsModalProps): React.JSX.Element | null {
  const [orders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  if (!isOpen) return null;

  const menuMap = new Map(menu.map((m) => [m.id, m]));

  // Aggregate quantities
  const itemMap = new Map<
    string,
    {
      itemId: string;
      name: string;
      station: KitchenStation;
      pendingQty: number;
      cookingQty: number;
      contributingTables: Set<string>;
    }
  >();

  orders.forEach((ord) => {
    if (ord.status !== "ACTIVE") return;

    ord.kots.forEach((kot) => {
      if (activeStation !== "All" && kot.station !== activeStation) return;

      kot.items.forEach((item) => {
        if (item.status === "PENDING" || item.status === "COOKING") {
          const menuItem = menuMap.get(item.itemId);
          const name = menuItem ? menuItem.name : item.itemId;
          const station = menuItem ? menuItem.station : kot.station;

          const existing = itemMap.get(item.itemId) || {
            itemId: item.itemId,
            name,
            station,
            pendingQty: 0,
            cookingQty: 0,
            contributingTables: new Set<string>(),
          };

          if (item.status === "PENDING") existing.pendingQty += item.qty;
          if (item.status === "COOKING") existing.cookingQty += item.qty;
          existing.contributingTables.add(ord.tableNumber);

          itemMap.set(item.itemId, existing);
        }
      });
    });
  });

  const consolidatedList = Array.from(itemMap.values()).sort(
    (a, b) => b.pendingQty + b.cookingQty - (a.pendingQty + a.cookingQty)
  );

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Consolidated Item Summary</h3>
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
          {consolidatedList.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-text-muted">
              <ChefHat className="h-10 w-10 mb-2 opacity-30 text-emerald-500" />
              <p className="text-sm font-medium">No pending or cooking items!</p>
            </div>
          ) : (
            consolidatedList.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between rounded-xl border border-border bg-page/70 p-3.5 shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-base text-text-primary">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {item.station}
                    </span>
                    <span className="text-xs text-text-muted">
                      Tables: {Array.from(item.contributingTables).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.pendingQty > 0 && (
                    <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-500">
                      Pending: {item.pendingQty}
                    </span>
                  )}
                  {item.cookingQty > 0 && (
                    <span className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-extrabold text-blue-500">
                      Cooking: {item.cookingQty}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
