"use client";

// RESPONSIBILITY: All inventory management logic for the Kitchen module.
// Reads/writes INVENTORY from localStorage. Provides updateStock, and
// derived lowStockItems + expiringItems lists via useMemo.
// No JSX — pure logic hook consumed by admin/inventory/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → useKitchenInventory
//            → KitchenInventoryTable + admin/inventory/page.tsx

import { useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppInventoryItem } from "@/types/appTypes";
import type { UseKitchenInventoryReturn } from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const MS_PER_DAY          = 86_400_000 as const;
const EXPIRY_WARNING_DAYS = 3          as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages inventory stock levels for the Kitchen module.
 * Derives lowStockItems and expiringItems via useMemo — no recalc on unrelated renders.
 *
 * @returns inventoryItems, lowStockItems, expiringItems, updateStock
 */
export function useKitchenInventory(): UseKitchenInventoryReturn {
  // Rule 61: No direct localStorage — hooks only
  const [inventoryItems, setInventoryItems] = useLocalStorage<AppInventoryItem[]>(
    STORAGE_KEYS.INVENTORY,
    []
  );

  // Items where currentStock < threshold
  // Deps: inventoryItems
  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.currentStock < item.threshold),
    [inventoryItems]
  );

  // Items expiring within EXPIRY_WARNING_DAYS days from today
  // Deps: inventoryItems
  const expiringItems = useMemo(() => {
    const now         = Date.now();
    const cutoffMs    = now + EXPIRY_WARNING_DAYS * MS_PER_DAY;
    const cutoffDate  = new Date(cutoffMs).toISOString().slice(0, 10); // "YYYY-MM-DD"
    const todayDate   = new Date(now).toISOString().slice(0, 10);
    return inventoryItems.filter(
      (item) => item.expiryDate >= todayDate && item.expiryDate <= cutoffDate
    );
  }, [inventoryItems]);

  /**
   * Updates the currentStock of an inventory item by id.
   *
   * @param id     - Inventory item id
   * @param newQty - New stock quantity
   */
  const updateStock = useCallback(
    (id: string, newQty: number) => {
      setInventoryItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, currentStock: newQty } : item
        )
      );
    },
    [setInventoryItems]
  );

  // Delete an inventory item
  const deleteInventoryItem = useCallback(
    (id: string) => {
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setInventoryItems]
  );

  // Update expiry date of an item
  const updateExpiryDate = useCallback(
    (id: string, newDate: string) => {
      setInventoryItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, expiryDate: newDate } : item
        )
      );
    },
    [setInventoryItems]
  );

  /**
   * Adds a new inventory item.
   */
  const addInventoryItem = useCallback((itemData: Omit<AppInventoryItem, "id">) => {
    setInventoryItems((prev) => [
      ...prev,
      {
        ...itemData,
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      },
    ]);
  }, [setInventoryItems]);

  return {
    inventoryItems,
    lowStockItems,
    expiringItems,
    updateStock,
    addInventoryItem,
    deleteInventoryItem,
    updateExpiryDate,
  };
}
