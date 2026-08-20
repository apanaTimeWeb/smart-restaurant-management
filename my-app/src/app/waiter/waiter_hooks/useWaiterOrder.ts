"use client";

// RESPONSIBILITY: All order-punching logic for the Waiter module.
// Manages cart state, auto-combo detection, happy-hours discounts, and KOT submission.
// No JSX — pure logic hook consumed by WaiterOrderModal.
// DATA FLOW: useWaiterOrder → WaiterOrderModal → WaiterCartSummary / WaiterMenuItemCard → UI

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppMenuItem, AppCombo, AppOrder, AppKot, AppKotItem, AppTable } from "@/types/appTypes";
import type {
  WaiterCartItem,
  WaiterDetectedCombo,
  UseWaiterOrderReturn,
} from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const HAPPY_HOUR_DISCOUNT_RATE = 0.20 as const; // 20% off beverages
const HAPPY_HOUR_CATEGORY      = "Beverages"    as const;
const HAPPY_HOUR_START_H       = 16             as const; // 4 PM
const HAPPY_HOUR_END_H         = 19             as const; // 7 PM
const KOT_STATUS_PENDING       = "PENDING"      as const;
const ORDER_STATUS_ACTIVE      = "ACTIVE"       as const;
const STATION_KITCHEN          = "Kitchen"      as const;
const STATION_BAR              = "Bar"          as const;
const STATION_BAKERY           = "Bakery"       as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a stable cart key from itemId + variantName.
 * Same item with different variants = different cart lines.
 */
function buildCartKey(itemId: string, variantName: string): string {
  return variantName ? `${itemId}__${variantName}` : itemId;
}

/**
 * Returns true if current time falls within happy hour window (16:00–19:00).
 * Pure function — no side effects.
 */
function isHappyHourNow(): boolean {
  const hour = new Date().getHours();
  return hour >= HAPPY_HOUR_START_H && hour < HAPPY_HOUR_END_H;
}

/**
 * Calculates total happy-hour discount for all Beverage items in cart.
 * Only applies when isHappyHourNow() is true.
 */
function calcHappyHourDiscount(
  cart: WaiterCartItem[],
  menu: AppMenuItem[]
): number {
  if (!isHappyHourNow()) return 0;

  const menuMap = new Map(menu.map((m) => [m.id, m]));

  return cart.reduce((total, cartItem) => {
    const menuItem = menuMap.get(cartItem.itemId);
    if (!menuItem || menuItem.category !== HAPPY_HOUR_CATEGORY) return total;
    return total + cartItem.unitPrice * cartItem.qty * HAPPY_HOUR_DISCOUNT_RATE;
  }, 0);
}

/**
 * Detects which combos are fully satisfied by the current cart.
 * Returns each matched combo with its saving amount.
 */
function detectCombos(
  cart: WaiterCartItem[],
  combos: AppCombo[],
  menu: AppMenuItem[]
): WaiterDetectedCombo[] {
  const cartItemIds = new Set(cart.map((c) => c.itemId));
  const menuPriceMap = new Map(menu.map((m) => [m.id, m.price]));

  const detected: WaiterDetectedCombo[] = [];

  for (const combo of combos) {
    const allPresent = combo.requiredItemIds.every((id) => cartItemIds.has(id));
    if (!allPresent) continue;

    const individualTotal = combo.requiredItemIds.reduce(
      (sum, id) => sum + (menuPriceMap.get(id) ?? 0),
      0
    );
    const saving = individualTotal - combo.comboPrice;
    if (saving > 0) {
      detected.push({ combo, saving });
    }
  }

  return detected;
}

/**
 * Groups cart items by kitchen station for KOT splitting.
 * Returns a map of station → cart items.
 */
function groupByStation(
  cart: WaiterCartItem[],
  menu: AppMenuItem[]
): Map<string, WaiterCartItem[]> {
  const menuMap = new Map(menu.map((m) => [m.id, m]));
  const groups = new Map<string, WaiterCartItem[]>();

  for (const cartItem of cart) {
    const station = menuMap.get(cartItem.itemId)?.station ?? STATION_KITCHEN;
    const existing = groups.get(station) ?? [];
    groups.set(station, [...existing, cartItem]);
  }

  return groups;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages all waiter order-punching state and actions.
 * Call once per WaiterOrderModal instance.
 *
 * @returns cart state, derived totals, and action handlers
 */
export function useWaiterOrder(): UseWaiterOrderReturn {
  const [cart, setCart] = useState<WaiterCartItem[]>([]);

  // Rule 61: No direct localStorage — hooks only
  const [menu]   = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU,   []);
  const [combos] = useLocalStorage<AppCombo[]>   (STORAGE_KEYS.COMBOS, []);
  const [orders, setOrders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [tables, setTables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);

  // KOT number = how many KOTs already exist on this table's order + 1
  // Recalculated on each render — no stale state
  const [activeTableId, setActiveTableId] = useState<string>("");

  const kotNumber = useMemo(() => {
    if (!activeTableId) return 1;
    const table  = tables.find((t) => t.id === activeTableId);
    const order  = orders.find((o) => o.id === table?.currentOrderId);
    return (order?.kots.length ?? 0) + 1;
  }, [activeTableId, tables, orders]);

  // Derived values — memoized (Rule 6: logic in hook, not JSX)
  const detectedCombos = useMemo(
    () => detectCombos(cart, combos, menu),
    [cart, combos, menu]
  );

  const happyHourDiscount = useMemo(
    () => calcHappyHourDiscount(cart, menu),
    [cart, menu]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
    [cart]
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Adds an item to cart. If same cartKey exists, increments qty.
   */
  const addToCart = useCallback(
    (item: AppMenuItem, variantName: string, notes: string) => {
      const cartKey  = buildCartKey(item.id, variantName);
      const variant  = item.variants.find((v) => v.name === variantName);
      const unitPrice = variant ? variant.price : item.price;

      setCart((prev) => {
        const existing = prev.find((c) => c.cartKey === cartKey);
        if (existing) {
          return prev.map((c) =>
            c.cartKey === cartKey ? { ...c, qty: c.qty + 1 } : c
          );
        }
        return [
          ...prev,
          {
            cartKey,
            itemId: item.id,
            name: item.name,
            unitPrice,
            qty: 1,
            variantName,
            notes,
          },
        ];
      });
    },
    []
  );

  /**
   * Removes a cart line entirely by cartKey.
   */
  const removeFromCart = useCallback((cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  }, []);

  /**
   * Increments or decrements qty. Removes item if qty reaches 0.
   */
  const updateQty = useCallback((cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartKey === cartKey ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  /**
   * Appends or sets quick-tags/notes for an item in the cart.
   */
  const updateNotes = useCallback((cartKey: string, newNotes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.cartKey === cartKey ? { ...c, notes: newNotes } : c))
    );
  }, []);

  /**
   * Clears the cart (called after KOT submit or modal close).
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setActiveTableId("");
  }, []);

  /**
   * Submits current cart as one or more KOTs (split by station).
   * Creates a new AppOrder if table has no active order, else appends KOTs.
   * Updates table.currentOrderId and table.status in localStorage.
   */
  const submitKOT = useCallback(
    (tableId: string, tableNumber: string, priority: "NORMAL" | "RUSH" | "VIP" = "NORMAL") => {
      if (cart.length === 0) return;

      const now        = Date.now();
      const stationMap = groupByStation(cart, menu);
      const newKots: AppKot[] = [];

      stationMap.forEach((items, station) => {
        const kotItems: AppKotItem[] = items.map((c) => ({
          itemId: c.itemId,
          qty:    c.qty,
          notes:  c.notes || undefined,
          status: KOT_STATUS_PENDING,
        }));

        newKots.push({
          kotId:     `kot-${now}-${station}`,
          station:   station as typeof STATION_KITCHEN | typeof STATION_BAR | typeof STATION_BAKERY,
          items:     kotItems,
          timestamp: now,
          priority,
        });
      });

      setOrders((prevOrders) => {
        const table        = tables.find((t) => t.id === tableId);
        const existingOrder = prevOrders.find(
          (o) => o.id === table?.currentOrderId && o.status === ORDER_STATUS_ACTIVE
        );

        if (existingOrder) {
          return prevOrders.map((o) =>
            o.id === existingOrder.id
              ? { ...o, kots: [...o.kots, ...newKots] }
              : o
          );
        }

        const newOrderId = `ord-${now}`;
        const newOrder: AppOrder = {
          id:           newOrderId,
          tableNumber,
          kots:         newKots,
          status:       ORDER_STATUS_ACTIVE,
          customerInfo: null,
        };

        setTables((prevTables) =>
          prevTables.map((t) =>
            t.id === tableId
              ? { ...t, status: "OCCUPIED", currentOrderId: newOrderId }
              : t
          )
        );

        return [...prevOrders, newOrder];
      });

      clearCart();
    },
    [cart, menu, tables, setOrders, setTables, clearCart]
  );


  // Expose activeTableId setter so modal can set it on open
  // Wrapped in a stable callback to avoid re-renders
  const setTable = useCallback((id: string) => setActiveTableId(id), []);

  return {
    cart,
    detectedCombos,
    happyHourDiscount,
    subtotal,
    kotNumber,
    addToCart,
    removeFromCart,
    updateQty,
    updateNotes,
    submitKOT,
    clearCart,
    setActiveTableId: setTable,
  };
}
