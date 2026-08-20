"use client";

// RESPONSIBILITY: All advanced table-action logic for the Waiter module.
// Handles merge, move, send-to-bill, and void-request operations.
// Every mutation writes an audit log entry. No JSX — pure logic hook.
// DATA FLOW: useWaiterTableActions → WaiterTableActionsDrawer / WaiterTableTransferModal → UI

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type {
  AppTable,
  AppOrder,
  AppAuditLog,
  AppKot,
} from "@/types/appTypes";
import type {
  WaiterVoidTarget,
  UseWaiterTableActionsReturn,
} from "@/app/waiter/waiter_types/WaiterTypes";

const STATUS_OCCUPIED        = "OCCUPIED"         as const;
const STATUS_BILLING_PENDING = "BILLING_PENDING"  as const;
const STATUS_AVAILABLE       = "AVAILABLE"        as const;
const STATUS_VOID_REQUESTED  = "VOID_REQUESTED"   as const;
const STATUS_ACTIVE          = "ACTIVE"           as const;
const ROLE_WAITER            = "WAITER"           as const;

const ACTION_MERGE_TABLE  = "TABLE_MERGE"         as const;
const ACTION_MOVE_TABLE   = "TABLE_MOVE"          as const;
const ACTION_SEND_TO_BILL = "SEND_TO_BILL"        as const;
const ACTION_VOID_REQUEST = "VOID_REQUEST"        as const;

function buildAuditLog(action: string, details: string): AppAuditLog {
  return {
    id:        `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    details,
    userRole:  ROLE_WAITER,
    timestamp: Date.now(),
  };
}

function mergeOrderKots(
  orders: AppOrder[],
  sourceOrderId: string,
  targetOrderId: string
): AppOrder[] {
  const source = orders.find((o) => o.id === sourceOrderId);
  const target = orders.find((o) => o.id === targetOrderId);
  if (!source || !target) return orders;

  const mergedKots: AppKot[] = [...target.kots, ...source.kots];

  return orders.map((o) => {
    if (o.id === targetOrderId) return { ...o, kots: mergedKots };
    if (o.id === sourceOrderId) return { ...o, status: "CANCELLED" as const };
    return o;
  });
}

export function useWaiterTableActions(): UseWaiterTableActionsReturn {
  const [tables,    setTables]    = useLocalStorage<AppTable[]>   (STORAGE_KEYS.TABLES,     []);
  const [orders,    setOrders]    = useLocalStorage<AppOrder[]>   (STORAGE_KEYS.ORDERS,     []);
  const [auditLogs, setAuditLogs] = useLocalStorage<AppAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);

  const appendAuditLog = useCallback(
    (action: string, details: string) => {
      setAuditLogs((prev) => [buildAuditLog(action, details), ...prev]);
    },
    [setAuditLogs]
  );

  /**
   * Merges sourceTable's active order & table number into targetTable.
   * Works whether targetTable has an existing order or is empty/available.
   */
  const mergeTable = useCallback(
    (sourceTableId: string, targetTableId: string) => {
      const sourceTable = tables.find((t) => t.id === sourceTableId);
      const targetTable = tables.find((t) => t.id === targetTableId);

      if (!sourceTable || !targetTable) return;

      let targetOrderId = targetTable.currentOrderId;
      const sourceOrderId = sourceTable.currentOrderId;

      if (sourceOrderId && targetOrderId && sourceOrderId !== targetOrderId) {
        setOrders((prev) => mergeOrderKots(prev, sourceOrderId, targetOrderId!));
      } else if (sourceOrderId && !targetOrderId) {
        targetOrderId = sourceOrderId;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === sourceOrderId ? { ...o, tableNumber: targetTable.tableNumber } : o
          )
        );
      }

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === sourceTableId) {
            return { ...t, status: STATUS_AVAILABLE, currentOrderId: null, mergedTables: [] };
          }
          if (t.id === targetTableId) {
            const updatedMerged = Array.from(
              new Set([...(t.mergedTables || []), sourceTable.tableNumber])
            );
            return {
              ...t,
              status: targetOrderId ? STATUS_OCCUPIED : t.status,
              currentOrderId: targetOrderId,
              mergedTables: updatedMerged,
            };
          }
          return t;
        })
      );

      appendAuditLog(
        ACTION_MERGE_TABLE,
        `Table ${sourceTable.tableNumber} merged into ${targetTable.tableNumber}.`
      );
    },
    [tables, orders, setOrders, setTables, appendAuditLog]
  );

  /**
   * Transfers active order from fromTable to toTable.
   */
  const moveTable = useCallback(
    (orderId: string, fromTableId: string, toTableId: string) => {
      const fromTable = tables.find((t) => t.id === fromTableId);
      const toTable   = tables.find((t) => t.id === toTableId);
      const order     = orders.find((o) => o.id === orderId);

      if (!fromTable || !toTable || !order) return;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, tableNumber: toTable.tableNumber } : o
        )
      );

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === fromTableId) {
            return { ...t, status: STATUS_AVAILABLE, currentOrderId: null, mergedTables: [] };
          }
          if (t.id === toTableId) {
            return { ...t, status: STATUS_OCCUPIED, currentOrderId: orderId };
          }
          return t;
        })
      );

      appendAuditLog(
        ACTION_MOVE_TABLE,
        `Order ${orderId} moved from Table ${fromTable.tableNumber} to ${toTable.tableNumber}.`
      );
    },
    [tables, orders, setOrders, setTables, appendAuditLog]
  );

  const sendToBill = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId);
      if (!table || table.status !== STATUS_OCCUPIED) return;

      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status: STATUS_BILLING_PENDING } : t
        )
      );

      appendAuditLog(
        ACTION_SEND_TO_BILL,
        `Table ${table.tableNumber} (Order ${table.currentOrderId ?? "—"}) sent to billing.`
      );
    },
    [tables, setTables, appendAuditLog]
  );

  const requestVoid = useCallback(
    async (target: WaiterVoidTarget, reason: string): Promise<void> => {
      return new Promise((resolve) => {
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== target.orderId) return order;

            const updatedKots = order.kots.map((kot) => {
              if (kot.kotId !== target.kotId) return kot;

              const updatedItems = kot.items.map((item) =>
                item.itemId === target.itemId
                  ? { ...item, status: STATUS_VOID_REQUESTED }
                  : item
              );
              return { ...kot, items: updatedItems };
            });

            return { ...order, kots: updatedKots };
          })
        );

        appendAuditLog(
          ACTION_VOID_REQUEST,
          `Void requested for "${target.itemName}" (KOT: ${target.kotId}, Order: ${target.orderId}). Reason: ${reason}`
        );

        resolve();
      });
    },
    [setOrders, appendAuditLog]
  );

  return { mergeTable, moveTable, sendToBill, requestVoid };
}
