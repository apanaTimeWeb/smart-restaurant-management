"use client";

// RESPONSIBILITY: All Kitchen KDS data logic — reads orders + menu from localStorage,
// flattens KOTs, filters by station, updates item status with audio triggers,
// computes live KPI metrics, handles void requests, batch actions, auto inventory deduction,
// order priority sorting (RUSH first), and waiter pickup broadcasts.
// No JSX — pure logic hook consumed by kitchen/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → flattenKots → filter → kitchen/page.tsx → KitchenKotGrid

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { playKitchenBell, playReadyChime, playVoidAlert } from "@/lib/audioHelper";
import type { AppOrder, AppMenuItem, AppKotItem, AppInventoryItem, AppAuditLog, AppNotification, KotItemStatus } from "@/types/appTypes";
import type {
  KitchenFlatKot,
  KitchenCompletedKot,
  KitchenKpiMetrics,
  KitchenStationTab,
  KitchenPipelineStep,
  UseKitchenKdsReturn,
} from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const ORDER_STATUS_ACTIVE = "ACTIVE" as const;

const VISIBLE_STATUSES: AppKotItem["status"][] = [
  "PENDING",
  "COOKING",
  "READY",
  "VOID_REQUESTED",
];

const URGENT_THRESHOLD_MS = 900000; // 15 minutes in ms

const PRIORITY_WEIGHT: Record<string, number> = {
  RUSH:   3,
  VIP:    2,
  NORMAL: 1,
};

// ─── Pure Helpers (Rule 6: logic outside JSX) ─────────────────────────────────

/**
 * Flattens all active orders → KOTs into KitchenFlatKot[].
 * Sorts RUSH orders first, then VIP, then oldest timestamp first.
 */
function flattenKots(orders: AppOrder[]): KitchenFlatKot[] {
  const result: KitchenFlatKot[] = [];

  for (const order of orders) {
    if (order.status !== ORDER_STATUS_ACTIVE) continue;

    for (const kot of order.kots) {
      const visibleItems = kot.items.filter((item) =>
        (VISIBLE_STATUSES as string[]).includes(item.status)
      );
      if (visibleItems.length === 0) continue;

      const hasUnfulfilledItem = visibleItems.some(
        (item) => item.status === "PENDING" || item.status === "COOKING" || item.status === "VOID_REQUESTED"
      );

      if (!hasUnfulfilledItem) continue;

      result.push({
        kotId:        kot.kotId,
        orderId:      order.id,
        tableNumber:  order.tableNumber,
        station:      kot.station,
        items:        visibleItems,
        timestamp:    kot.timestamp,
        priority:     kot.priority ?? "NORMAL",
      });
    }
  }

  // Priority sort: RUSH (3) > VIP (2) > NORMAL (1), then oldest timestamp first
  return result.sort((a, b) => {
    const wA = PRIORITY_WEIGHT[a.priority ?? "NORMAL"] ?? 1;
    const wB = PRIORITY_WEIGHT[b.priority ?? "NORMAL"] ?? 1;
    if (wA !== wB) return wB - wA;
    return a.timestamp - b.timestamp;
  });
}

function filterByStation(
  kots: KitchenFlatKot[],
  tab: KitchenStationTab
): KitchenFlatKot[] {
  if (tab === "All") return kots;
  return kots.filter((k) => k.station === tab);
}

function hasNewVoidRequest(
  prev: KitchenFlatKot[],
  next: KitchenFlatKot[]
): boolean {
  const prevVoidSet = new Set<string>();
  for (const kot of prev) {
    for (const item of kot.items) {
      if (item.status === "VOID_REQUESTED") {
        prevVoidSet.add(`${kot.kotId}-${item.itemId}`);
      }
    }
  }
  for (const kot of next) {
    for (const item of kot.items) {
      if (
        item.status === "VOID_REQUESTED" &&
        !prevVoidSet.has(`${kot.kotId}-${item.itemId}`)
      ) {
        return true;
      }
    }
  }
  return false;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useKitchenKds(activeTab: KitchenStationTab): UseKitchenKdsReturn {
  const [orders, setOrders]       = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menuItems]               = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);
  const [inventory, setInventory] = useLocalStorage<AppInventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
  const [, setAuditLogs]          = useLocalStorage<AppAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  const [, setNotifications]      = useLocalStorage<AppNotification[]>("app_notifications", []);

  const [savingKey, setSavingKey] = useState<string>("");

  const prevKotCountRef = useRef<number>(-1);
  const prevFlatKotsRef = useRef<KitchenFlatKot[]>([]);

  const allFlatKots = useMemo(() => flattenKots(orders), [orders]);

  const filteredKots = useMemo(
    () => filterByStation(allFlatKots, activeTab),
    [allFlatKots, activeTab]
  );

  const completedKots = useMemo<KitchenCompletedKot[]>(() => {
    const result: KitchenCompletedKot[] = [];

    for (const order of orders) {
      for (const kot of order.kots) {
        const nonVoidItems = kot.items.filter((i) => i.status !== "VOIDED");
        const isFullyReady =
          nonVoidItems.length > 0 &&
          nonVoidItems.every((i) => i.status === "READY");

        if (isFullyReady) {
          result.push({
            kotId:       kot.kotId,
            orderId:     order.id,
            tableNumber: order.tableNumber,
            station:     kot.station,
            items:       kot.items,
            timestamp:   kot.timestamp,
            completedAt: kot.timestamp + 300000,
            priority:    kot.priority ?? "NORMAL",
          });
        }
      }
    }

    return result.sort((a, b) => b.completedAt - a.completedAt);
  }, [orders]);

  const metrics = useMemo<KitchenKpiMetrics>(() => {
    const now = Date.now();
    let urgentCount = 0;
    let readyItemsCount = 0;

    for (const kot of allFlatKots) {
      const elapsedMs = now - kot.timestamp;
      const hasActivePrep = kot.items.some(
        (i) => i.status === "PENDING" || i.status === "COOKING"
      );
      if (elapsedMs > URGENT_THRESHOLD_MS && hasActivePrep) {
        urgentCount++;
      }
      for (const item of kot.items) {
        if (item.status === "READY") {
          readyItemsCount++;
        }
      }
    }

    const outOfStockCount = menuItems.filter((m) => !m.isAvailable).length;

    return {
      totalActiveKots: allFlatKots.length,
      urgentCount,
      avgPrepTimeMins: 12,
      readyItemsCount,
      outOfStockCount,
    };
  }, [allFlatKots, menuItems]);

  const menuNameMap = useMemo(
    () => new Map(menuItems.map((m) => [m.id, m.name])),
    [menuItems]
  );

  const menuItemName = useCallback(
    (itemId: string): string => menuNameMap.get(itemId) ?? itemId,
    [menuNameMap]
  );

  // ── Auto Inventory Deduction Helper ─────────────────────────────────────────
  const deductInventoryForDish = useCallback(
    (dishNameOrId: string) => {
      setInventory((prevInv) => {
        if (prevInv.length === 0) return prevInv;

        // Find matching inventory ingredient (e.g. Paneer, Butter, Flour, Rice, Vegetables)
        const lowerName = dishNameOrId.toLowerCase();
        let targetId = prevInv[0].id; // fallback

        for (const item of prevInv) {
          if (lowerName.includes(item.name.toLowerCase())) {
            targetId = item.id;
            break;
          }
        }

        return prevInv.map((item) => {
          if (item.id !== targetId) return item;
          const newStock = Math.max(0, item.currentStock - 0.2);

          // Log low stock alert if below threshold
          if (newStock < item.threshold) {
            const audit: AppAuditLog = {
              id: `log-${Date.now()}`,
              action: "LOW_STOCK_ALERT",
              details: `Auto Stock Deduction: ${item.name} is now low (${newStock.toFixed(1)}${item.unit})`,
              userRole: "KITCHEN",
              timestamp: Date.now(),
            };
            setAuditLogs((prevLogs) => [...prevLogs, audit]);
          }

          return { ...item, currentStock: Number(newStock.toFixed(1)) };
        });
      });
    },
    [setInventory, setAuditLogs]
  );

  // ── Audio alerts ────────────────────────────────────────────────────────────
  useEffect(() => {
    const currentCount = allFlatKots.length;

    if (prevKotCountRef.current === -1) {
      prevKotCountRef.current = currentCount;
      prevFlatKotsRef.current = allFlatKots;
      return;
    }

    if (currentCount > prevKotCountRef.current) {
      playKitchenBell();
    }

    if (hasNewVoidRequest(prevFlatKotsRef.current, allFlatKots)) {
      playVoidAlert();
    }

    prevKotCountRef.current = currentCount;
    prevFlatKotsRef.current = allFlatKots;
  }, [allFlatKots]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateKotItemStatus = useCallback(
    (
      orderId: string,
      kotId: string,
      itemId: string,
      newStatus: KotItemStatus
    ) => {
      const key = `${kotId}-${itemId}`;
      setSavingKey(key);

      // Auto inventory deduction when starting cooking or ready
      if (newStatus === "COOKING" || newStatus === "READY") {
        deductInventoryForDish(itemId);
      }

      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            kots: order.kots.map((kot) => {
              if (kot.kotId !== kotId) return kot;
              return {
                ...kot,
                items: kot.items.map((item) =>
                  item.itemId === itemId 
                    ? { 
                        ...item, 
                        status: newStatus,
                        ...(newStatus === "READY" ? { prepEndsAt: null } : {})
                      } 
                    : item
                ),
              };
            }),
          };
        })
      );

      if (newStatus === "READY") {
        playReadyChime();
      }

      setSavingKey("");
    },
    [setOrders, deductInventoryForDish]
  );

  const batchUpdateKotStatus = useCallback(
    (kotId: string, targetStatus: KitchenPipelineStep) => {
      setOrders((prev) =>
        prev.map((order) => {
          const hasKot = order.kots.some((k) => k.kotId === kotId);
          if (!hasKot) return order;
          return {
            ...order,
            kots: order.kots.map((kot) => {
              if (kot.kotId !== kotId) return kot;

              // Deduct stock for all items
              kot.items.forEach((i) => {
                if (targetStatus === "COOKING" || targetStatus === "READY") {
                  deductInventoryForDish(i.itemId);
                }
              });

              return {
                ...kot,
                items: kot.items.map((item) => {
                  if (item.status === "VOIDED" || item.status === "VOID_REQUESTED") return item;
                  return {
                    ...item,
                    status: targetStatus,
                    ...(targetStatus === "READY" ? { prepEndsAt: null } : {}),
                  };
                }),
              };
            }),
          };
        })
      );

      if (targetStatus === "READY") {
        playReadyChime();
      }
    },
    [setOrders, deductInventoryForDish]
  );

  const handleVoidDecision = useCallback(
    (orderId: string, kotId: string, itemId: string, approved: boolean) => {
      const newStatus: KotItemStatus = approved ? "VOIDED" : "COOKING";
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            kots: order.kots.map((kot) => {
              if (kot.kotId !== kotId) return kot;
              return {
                ...kot,
                items: kot.items.map((item) =>
                  item.itemId === itemId ? { ...item, status: newStatus } : item
                ),
              };
            }),
          };
        })
      );
    },
    [setOrders]
  );

  /**
   * Broadcasts a live pickup ready notification to Waiter panel.
   */
  const broadcastPickupNotification = useCallback(
    (kot: KitchenFlatKot) => {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        role: "WAITER",
        title: `Table ${kot.tableNumber} Order Ready!`,
        message: `${kot.station} station has finished preparing items for Table ${kot.tableNumber}. Ready for pickup!`,
        type: "PICKUP_READY",
        tableNumber: kot.tableNumber,
        createdAt: Date.now(),
        isRead: false,
      };

      setNotifications((prev) => [notif, ...prev]);
    },
    [setNotifications]
  );

  const recallCompletedKot = useCallback(
    (kotId: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          const hasKot = order.kots.some((k) => k.kotId === kotId);
          if (!hasKot) return order;
          return {
            ...order,
            kots: order.kots.map((kot) => {
              if (kot.kotId !== kotId) return kot;
              return {
                ...kot,
                items: kot.items.map((item) => ({
                  ...item,
                  status: "COOKING" as const,
                })),
              };
            }),
          };
        })
      );
    },
    [setOrders]
  );

  const setItemPrepTime = useCallback(
    (orderId: string, kotId: string, itemId: string, mins: number) => {
      const now = Date.now();
      const prepEndsAt = now + mins * 60000;
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            kots: order.kots.map((kot) => {
              if (kot.kotId !== kotId) return kot;
              return {
                ...kot,
                items: kot.items.map((item) =>
                  item.itemId === itemId ? { ...item, prepTimeMins: mins, prepEndsAt } : item
                ),
              };
            }),
          };
        })
      );
    },
    [setOrders]
  );

  return {
    allFlatKots,
    filteredKots,
    completedKots,
    metrics,
    menuItemName,
    savingKey,
    updateKotItemStatus,
    batchUpdateKotStatus,
    handleVoidDecision,
    broadcastPickupNotification,
    recallCompletedKot,
    setItemPrepTime,
    menuItems,
  };
}


