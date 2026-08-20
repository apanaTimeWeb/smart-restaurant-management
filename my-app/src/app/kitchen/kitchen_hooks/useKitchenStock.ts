"use client";

// RESPONSIBILITY: All Kitchen stock management and waste logging logic.
// Reads MENU, INVENTORY, AUDIT_LOGS, WASTAGE from localStorage.
// toggleItemAvailability flips isAvailable and writes an audit log entry.
// logWaste appends to app_wastage and writes an audit log entry.
// No JSX — pure logic hook consumed by KitchenStockToggle and KitchenWasteLogModal.
// DATA FLOW: localStorage → useLocalStorage → KitchenStockToggle / KitchenWasteLogModal → UI

import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type {
  AppMenuItem,
  AppInventoryItem,
  AppAuditLog,
  AppWastage,
  StockUnit,
} from "@/types/appTypes";
import type { UseKitchenStockReturn } from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const USER_ROLE_KITCHEN   = "KITCHEN"              as const;
const ACTION_STOCK_TOGGLE = "STOCK_TOGGLE"         as const;
const ACTION_WASTE_LOG    = "WASTE_LOG"            as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Builds a typed AppAuditLog entry.
 * Pure function — no side effects.
 */
function buildAuditLog(action: string, details: string): AppAuditLog {
  return {
    id:        `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    details,
    userRole:  USER_ROLE_KITCHEN,
    timestamp: Date.now(),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages kitchen stock availability toggles and waste log submissions.
 * Both actions write an audit log entry to localStorage.
 *
 * @returns menuItems, inventoryItems, togglingId, toggleItemAvailability, logWaste
 */
export function useKitchenStock(): UseKitchenStockReturn {
  // Rule 61: No direct localStorage — hooks only
  const [menuItems,  setMenuItems]  = useLocalStorage<AppMenuItem[]>     (STORAGE_KEYS.MENU,       []);
  const [inventoryItems]            = useLocalStorage<AppInventoryItem[]> (STORAGE_KEYS.INVENTORY,  []);
  const [, setAuditLogs]            = useLocalStorage<AppAuditLog[]>      (STORAGE_KEYS.AUDIT_LOGS, []);
  const [, setWastage]              = useLocalStorage<AppWastage[]>       (STORAGE_KEYS.WASTAGE,    []);

  // Pessimistic UI — itemId currently being toggled
  const [togglingId, setTogglingId] = useState<string>("");

  /**
   * Flips isAvailable on a menu item and writes an audit log entry.
   * Pessimistic: togglingId set during save, cleared after.
   */
  const toggleItemAvailability = useCallback(
    (itemId: string) => {
      setTogglingId(itemId);

      setMenuItems((prev) => {
        const item = prev.find((m) => m.id === itemId);
        if (!item) return prev;

        const newAvailable = !item.isAvailable;
        const updated = prev.map((m) =>
          m.id === itemId ? { ...m, isAvailable: newAvailable } : m
        );

        const log = buildAuditLog(
          ACTION_STOCK_TOGGLE,
          `${item.name} marked ${newAvailable ? "AVAILABLE" : "OUT OF STOCK"} by Kitchen`
        );
        setAuditLogs((prevLogs) => [...prevLogs, log]);

        return updated;
      });

      setTogglingId("");
    },
    [setMenuItems, setAuditLogs]
  );

  /**
   * Batch toggles availability for all items in a station or all stations.
   */
  const batchToggleAvailability = useCallback(
    (station: string, isAvailable: boolean) => {
      setMenuItems((prev) => {
        const updated = prev.map((m) => {
          if (station === "All" || m.station === station) {
            return { ...m, isAvailable };
          }
          return m;
        });

        const log = buildAuditLog(
          ACTION_STOCK_TOGGLE,
          `Batch marked all ${station} items as ${isAvailable ? "AVAILABLE" : "OUT OF STOCK"}`
        );
        setAuditLogs((prevLogs) => [...prevLogs, log]);

        return updated;
      });
    },
    [setMenuItems, setAuditLogs]
  );

  /**
   * Appends a waste entry to app_wastage and writes an audit log entry.
   * Unit is resolved from the inventory item.
   */
  const logWaste = useCallback(
    (ingredientId: string, qty: number, reason: string) => {
      const ingredient = inventoryItems.find((i) => i.id === ingredientId);
      const unit: StockUnit = ingredient?.unit ?? "pcs";
      const name = ingredient?.name ?? ingredientId;

      const wasteEntry: AppWastage = {
        id:           `waste-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ingredientId,
        qty,
        unit,
        reason,
        timestamp:    Date.now(),
      };

      setWastage((prev) => [...prev, wasteEntry]);

      const log = buildAuditLog(
        ACTION_WASTE_LOG,
        `Waste logged: ${qty}${unit} of ${name}. Reason: ${reason}`
      );
      setAuditLogs((prev) => [...prev, log]);
    },
    [inventoryItems, setWastage, setAuditLogs]
  );

  return {
    menuItems,
    inventoryItems,
    togglingId,
    toggleItemAvailability,
    batchToggleAvailability,
    logWaste,
  };
}
