"use client";

// RESPONSIBILITY: All Customer QR Self-Ordering logic.
// Reads table param from URL, auto-detects active table orders (re-scan QR session recovery),
// manages cart, appends KOTs to running table orders, polls live status, and handles feedback.
// No JSX — pure logic hook consumed by customer/page.tsx.
// DATA FLOW: URL(?table) + localStorage ↔ useCustomerOrder ↔ customer/page.tsx ↔ Customer* components

import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppMenuItem, AppOrder, AppTable, AppFeedback } from "@/types/appTypes";
import type {
  CustomerCartItem,
  CustomerPageView,
  UseCustomerOrderReturn,
} from "@/app/customer/customer_types/CustomerTypes";

// ─── Tenant Scope Interceptor ────────────────────────────────────────────────
// If a customer scans a QR code, it includes ?tenant=ID. We MUST set this before 
// useLocalStorage hooks run, so they read from the correct hotel's database space.
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  const tenantParam = params.get("tenant");
  if (tenantParam) {
    window.localStorage.setItem("active_tenant_id", tenantParam);
  }
}

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const STATUS_POLL_INTERVAL_MS = 3_000 as const;
const STATUS_ACTIVE           = "ACTIVE"    as const;
const STATUS_COMPLETED        = "COMPLETED" as const;
const STATUS_OCCUPIED         = "OCCUPIED"  as const;
const KOT_STATUS_PENDING      = "PENDING"   as const;
const STATION_KITCHEN         = "Kitchen"   as const;
const STATION_BAR             = "Bar"       as const;
const STATION_BAKERY          = "Bakery"    as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Reads the `table` query param from the current URL.
 * Returns empty string if not found or SSR context.
 */
function readTableParam(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("table") ?? "";
}

/**
 * Generates a short unique ID for KOT / order / feedback entries.
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Derives the overall order phase from all KOT item statuses.
 */
function deriveOrderPhase(order: AppOrder): "RECEIVED" | "COOKING" | "READY" {
  const allItems = order.kots.flatMap((k) => k.items);
  const visible  = allItems.filter((i) => i.status !== "VOIDED");

  if (visible.length === 0) return "RECEIVED";

  const allReady   = visible.every((i) => i.status === "READY");
  const anyCooking = visible.some((i) => i.status === "COOKING" || i.status === "READY");

  if (allReady)   return "READY";
  if (anyCooking) return "COOKING";
  return "RECEIVED";
}

/**
 * Helper to normalize table strings (e.g. "T-01" <-> "tbl-01" <-> "1")
 */
function normalizeTable(s?: string): string {
  if (!s) return "";
  return s.toLowerCase().trim().replace(/^(tbl|t)-?/i, "");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCustomerOrder(): UseCustomerOrderReturn {
  // Rule 61: No direct localStorage — hooks only
  const [menuItems]              = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU,      []);
  const [orders, setOrders]      = useLocalStorage<AppOrder[]>  (STORAGE_KEYS.ORDERS,    []);
  const [, setTables]            = useLocalStorage<AppTable[]>  (STORAGE_KEYS.TABLES,    []);
  const [, setFeedbacks]         = useLocalStorage<AppFeedback[]>(STORAGE_KEYS.FEEDBACKS, []);

  const [cart,         setCart]         = useState<CustomerCartItem[]>([]);
  const [pageView,     setPageView]     = useState<CustomerPageView>("MENU");
  const [activeOrderId,setActiveOrderId]= useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMounted,    setIsMounted]    = useState<boolean>(false);
  const [tableParamState, setTableParamState] = useState<string>("");

  // Hydration guard & URL reader
  useEffect(() => {
    setIsMounted(true);
    const read = () => setTableParamState(readTableParam());
    read();

    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Dynamically resolve tableNumber from state or URL window search
  const tableNumber = useMemo(() => {
    if (tableParamState) return tableParamState;
    return readTableParam();
  }, [tableParamState, isMounted]);

  // ── Auto-Occupancy & Active Session Hydration on QR Re-scan ────────────────
  // Automatically detects existing ACTIVE order for tableNumber in app_orders.
  // Re-hydrates session so customer never loses their ongoing order status page!
  useEffect(() => {
    if (!isMounted || !tableNumber) return;

    const normTable = normalizeTable(tableNumber);
    if (!normTable) return;

    // Look for an existing ACTIVE order for this table
    const existingActiveOrder = orders.find(
      (o) => o.status === STATUS_ACTIVE && normalizeTable(o.tableNumber) === normTable
    );

    if (existingActiveOrder) {
      if (activeOrderId !== existingActiveOrder.id) {
        setActiveOrderId(existingActiveOrder.id);
      }

      // Automatically switch view to ORDER_STATUS if customer is on MENU or initial load
      setPageView((prev) => (prev === "MENU" ? "ORDER_STATUS" : prev));

      // Ensure table status is OCCUPIED in app_tables
      setTables((prev) => {
        const target = prev.find(
          (t) => normalizeTable(t.tableNumber) === normTable || normalizeTable(t.id) === normTable
        );
        if (!target || (target.status === STATUS_OCCUPIED && target.currentOrderId === existingActiveOrder.id)) {
          return prev;
        }
        return prev.map((t) =>
          t.id === target.id
            ? { ...t, status: STATUS_OCCUPIED, currentOrderId: existingActiveOrder.id }
            : t
        );
      });
    } else {
      // No active order exists for this table (e.g. cashier completed checkout)
      if (activeOrderId) {
        setActiveOrderId("");
        setPageView("MENU");
      }
    }
  }, [isMounted, tableNumber, orders, activeOrderId, setTables]);

  // Derive active order from orders array
  const activeOrder = useMemo((): AppOrder | null => {
    if (!activeOrderId) return null;
    return orders.find((o) => o.id === activeOrderId) ?? null;
  }, [orders, activeOrderId]);

  // ── Live status polling ────────────────────────────────────────────────────
  useEffect(() => {
    if (pageView !== "ORDER_STATUS" || !activeOrderId) return;

    const interval = setInterval(() => {
      const currentOrder = orders.find((o) => o.id === activeOrderId);
      if (!currentOrder) return;

      const phase = deriveOrderPhase(currentOrder);
      if (phase === "READY" && currentOrder.status === STATUS_COMPLETED) {
        setPageView("FEEDBACK");
      }
    }, STATUS_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeOrderId, pageView, orders]);

  // ── Cart Actions ───────────────────────────────────────────────────────────

  const addToCart = useCallback((itemId: string) => {
    const menuItem = menuItems.find((m) => m.id === itemId);
    if (!menuItem || !menuItem.isAvailable) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId);
      if (existing) {
        return prev.map((c) =>
          c.itemId === itemId ? { ...c, qty: c.qty + 1 } : c
        );
      }
      const newItem: CustomerCartItem = {
        itemId,
        name:      menuItem.name,
        qty:       1,
        unitPrice: menuItem.price,
        notes:     "",
      };
      return [...prev, newItem];
    });
  }, [menuItems]);

  const updateQty = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.itemId === itemId ? { ...c, qty: c.qty + delta } : c
      );
      return updated.filter((c) => c.qty > 0);
    });
  }, []);

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.itemId === itemId ? { ...c, notes } : c))
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  }, []);

  // ── Order Submission (Appends to active order if exists) ───────────────────

  const submitOrder = useCallback(async (): Promise<void> => {
    if (isSubmitting || cart.length === 0 || !tableNumber) return;
    setIsSubmitting(true);

    const now = Date.now();
    const normTable = normalizeTable(tableNumber);

    // Group cart items by station
    const stationMap: Record<string, CustomerCartItem[]> = {
      [STATION_KITCHEN]: [],
      [STATION_BAR]:     [],
      [STATION_BAKERY]:  [],
    };

    for (const cartItem of cart) {
      const menuItem = menuItems.find((m) => m.id === cartItem.itemId);
      const station  = menuItem?.station ?? STATION_KITCHEN;
      stationMap[station].push(cartItem);
    }

    // Build new KOTs — one per station that has items
    const newKots = Object.entries(stationMap)
      .filter(([, items]) => items.length > 0)
      .map(([station, items]) => ({
        kotId:     generateId("cust-kot"),
        station:   station as AppOrder["kots"][number]["station"],
        items:     items.map((ci) => ({
          itemId: ci.itemId,
          qty:    ci.qty,
          notes:  ci.notes || undefined,
          status: KOT_STATUS_PENDING,
        })),
        timestamp: now,
      }));

    // Check if an ACTIVE order already exists for this table
    const existingActiveOrder = orders.find(
      (o) => o.status === STATUS_ACTIVE && normalizeTable(o.tableNumber) === normTable
    );

    let targetOrderId = "";

    if (existingActiveOrder) {
      // Append new KOTs to existing active order!
      targetOrderId = existingActiveOrder.id;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === existingActiveOrder.id
            ? { ...o, kots: [...o.kots, ...newKots] }
            : o
        )
      );
    } else {
      // Create a brand new active order
      targetOrderId = generateId("cust-ord");
      const newOrder: AppOrder = {
        id:           targetOrderId,
        tableNumber,
        kots:         newKots,
        status:       STATUS_ACTIVE,
        customerInfo: null,
      };

      setOrders((prev) => [...prev, newOrder]);

      // Update table status to OCCUPIED and save currentOrderId
      setTables((prev) =>
        prev.map((t) =>
          normalizeTable(t.tableNumber) === normTable || normalizeTable(t.id) === normTable
            ? { ...t, status: STATUS_OCCUPIED, currentOrderId: targetOrderId }
            : t
        )
      );
    }

    setActiveOrderId(targetOrderId);
    setCart([]);
    setIsSubmitting(false);
    setPageView("ORDER_STATUS");
  }, [isSubmitting, cart, tableNumber, menuItems, orders, setOrders, setTables]);

  // ── Feedback ───────────────────────────────────────────────────────────────

  const submitFeedback = useCallback((rating: number, comment: string) => {
    const entry: AppFeedback = {
      id:          generateId("fb"),
      orderId:     activeOrderId,
      tableNumber,
      rating,
      comment,
      timestamp:   Date.now(),
    };
    setFeedbacks((prev) => [...prev, entry]);
    setPageView("THANK_YOU");
  }, [activeOrderId, tableNumber, setFeedbacks]);

  const handleComplete = useCallback(() => {
    setPageView("FEEDBACK");
  }, []);

  const openMenu = useCallback(() => {
    setPageView("MENU");
  }, []);

  const viewOrderStatus = useCallback(() => {
    setPageView("ORDER_STATUS");
  }, []);

  return {
    tableNumber,
    menuItems,
    cart,
    activeOrder,
    pageView,
    isSubmitting,
    isMounted,
    addToCart,
    updateQty,
    updateNotes,
    removeFromCart,
    submitOrder,
    submitFeedback,
    handleComplete,
    openMenu,
    viewOrderStatus,
  };
}
