"use client";

// RESPONSIBILITY: All Billing POS data logic — reads ORDERS + MENU + TABLES from
// localStorage, filters BILLING_PENDING tables, aggregates all KOTs into a flat
// cart, calculates tax breakdown (CGST + SGST + Service Charge + Liquor VAT),
// and handles discount application.
// No JSX — pure logic hook consumed by billing/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → aggregateKots → calculateTax → billing/page.tsx

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppOrder, AppTable, AppMenuItem, AppServiceRequest } from "@/types/appTypes";
import type {
  BillingCartItem,
  BillingTaxBreakdown,
  BillingDiscount,
  BillingSelectedTable,
  UseBillingOrderReturn,
} from "@/app/billing/billing_types/BillingTypes";

// ─── Tax & Billing Constants (Rule 35: No magic numbers) ─────────────────────

const CGST_RATE            = 0.025  as const; // 2.5%
const SGST_RATE            = 0.025  as const; // 2.5%
const SERVICE_CHARGE_RATE  = 0.05   as const; // 5%
const LIQUOR_VAT_RATE      = 0.18   as const; // 18% on Bar station items
const BAR_STATION          = "Bar"  as const;
const STATUS_BILLING_PENDING = "BILLING_PENDING" as const;
const STATUS_OCCUPIED        = "OCCUPIED"        as const;
const STATUS_ACTIVE          = "ACTIVE"          as const;
const KOT_ITEM_VOIDED        = "VOIDED"          as const;

// ─── Pure Helpers (Rule 6: logic outside JSX) ─────────────────────────────────

/**
 * Flattens all KOTs of an order into BillingCartItem[].
 * Merges duplicate itemId+notes combinations by summing qty.
 * Excludes VOIDED items — they should not appear on the bill.
 *
 * @param order  - The active AppOrder to aggregate
 * @param menu   - Full menu array for name + price lookup
 * @returns      Flat array of BillingCartItem, duplicates merged
 */
function aggregateKots(order: AppOrder, menu: AppMenuItem[]): BillingCartItem[] {
  const menuMap = new Map(menu.map((m) => [m.id, m]));

  // Use a map keyed by "itemId||notes" to merge duplicates
  const mergeMap = new Map<string, BillingCartItem>();

  for (const kot of order.kots) {
    for (const item of kot.items) {
      if (item.status === KOT_ITEM_VOIDED) continue;

      const menuItem  = menuMap.get(item.itemId);
      const name      = menuItem?.name      ?? item.itemId;
      const unitPrice = menuItem?.price     ?? 0;
      const station   = menuItem?.station   ?? "Kitchen";
      const notes     = item.notes          ?? "";
      const mergeKey  = `${item.itemId}||${notes}`;

      const existing = mergeMap.get(mergeKey);
      if (existing) {
        existing.qty        += item.qty;
        existing.totalPrice  = existing.qty * existing.unitPrice;
      } else {
        mergeMap.set(mergeKey, {
          itemId:     item.itemId,
          name,
          qty:        item.qty,
          unitPrice,
          totalPrice: item.qty * unitPrice,
          station,
          notes,
        });
      }
    }
  }

  return Array.from(mergeMap.values());
}

/**
 * Calculates the full tax breakdown for a given cart.
 * Liquor VAT (18%) applied only to Bar station items.
 * Round-off = nearest rupee difference from pre-roundoff total.
 *
 * @param items              - Aggregated cart items
 * @param includeServiceCharge - Whether to include 5% service charge
 * @param discount           - Applied discount (optional)
 * @param loyaltyRedeemed    - Loyalty points redeemed as ₹ discount
 * @returns BillingTaxBreakdown
 */
function calculateTax(
  items:               BillingCartItem[],
  includeServiceCharge: boolean,
  discount:            BillingDiscount | null,
  loyaltyRedeemed:     number,
  customTip:           number = 0,
  packagingCharge:     number = 0
): BillingTaxBreakdown {
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  // Liquor VAT — only on Bar station items
  const barSubtotal = items
    .filter((i) => i.station === BAR_STATION)
    .reduce((sum, i) => sum + i.totalPrice, 0);
  const vat = barSubtotal * LIQUOR_VAT_RATE;

  const cgst          = subtotal * CGST_RATE;
  const sgst          = subtotal * SGST_RATE;
  const serviceCharge = includeServiceCharge ? subtotal * SERVICE_CHARGE_RATE : 0;

  // Discount calculation
  let discountAmount = 0;
  if (discount) {
    if (discount.type === "PERCENT") {
      discountAmount = (subtotal * discount.value) / 100;
    } else if (discount.type === "FLAT" || discount.type === "NC") {
      discountAmount = discount.value;
    }
  }

  const preTotalExact =
    subtotal + cgst + sgst + serviceCharge + vat + customTip + packagingCharge - discountAmount - loyaltyRedeemed;

  const totalRounded = Math.round(preTotalExact);
  const roundOff     = totalRounded - preTotalExact;

  return {
    subtotal,
    cgst,
    sgst,
    serviceCharge,
    vat,
    discount:           discountAmount,
    loyaltyRedeemed,
    customTip,
    packagingCharge,
    roundingAdjustment: roundOff,
    roundOff,
    totalAmount:        Math.max(0, totalRounded),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages all Billing POS state and calculations.
 * Reads BILLING_PENDING tables, aggregates KOTs, computes tax breakdown.
 *
 * @returns billingTables, selectedTableId, cartItems, taxBreakdown, handlers
 */
export function useBillingOrder(): UseBillingOrderReturn & {
  customTip: number;
  packagingCharge: number;
  setCustomTip: (val: number) => void;
  setPackagingCharge: (val: number) => void;
} {
  // Rule 61: No direct localStorage — hooks only
  const [orders]          = useLocalStorage<AppOrder[]>         (STORAGE_KEYS.ORDERS,           []);
  const [tables]          = useLocalStorage<AppTable[]>         (STORAGE_KEYS.TABLES,           []);
  const [menuItems]       = useLocalStorage<AppMenuItem[]>      (STORAGE_KEYS.MENU,             []);
  const [serviceRequests] = useLocalStorage<AppServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, []);

  const [selectedTableId,      setSelectedTableId]      = useState<string>("");
  const [includeServiceCharge, setIncludeServiceCharge] = useState<boolean>(true);
  const [appliedDiscount,      setAppliedDiscount]      = useState<BillingDiscount | null>(null);
  const [loyaltyRedeemed,      setLoyaltyRedeemed]      = useState<number>(0);
  const [customTip,            setCustomTipState]       = useState<number>(0);
  const [packagingCharge,      setPackagingChargeState] = useState<number>(0);

  // Derive pending tables paired with active orders (Rule 6: useMemo)
  const billingTables = useMemo((): BillingSelectedTable[] => {
    const safeLower = (s?: string) => (s || "").toLowerCase().replace(/^(tbl|t)-?/i, "");

    // Map table IDs/numbers that have pending BILL service requests
    const billReqSet = new Set<string>();
    for (const req of serviceRequests) {
      if (req && req.type === "BILL" && (req.status === "PENDING" || req.status === "ACKNOWLEDGED")) {
        if (req.tableId) billReqSet.add(req.tableId);
        if (req.tableNumber) billReqSet.add(req.tableNumber);
        const norm = safeLower(req.tableId || req.tableNumber);
        if (norm) billReqSet.add(norm);
      }
    }

    return tables
      .filter((t) => {
        if (!t || !t.id) return false;
        const normId = safeLower(t.id);
        const normNum = safeLower(t.tableNumber);
        const hasBillReq = billReqSet.has(t.id) || (t.tableNumber && billReqSet.has(t.tableNumber)) || billReqSet.has(normId) || billReqSet.has(normNum);
        return t.status === STATUS_BILLING_PENDING || t.status === STATUS_OCCUPIED || hasBillReq;
      })
      .reduce<BillingSelectedTable[]>((acc, table) => {
        const order = orders.find(
          (o) =>
            o &&
            o.status === STATUS_ACTIVE &&
            (o.id === table.currentOrderId ||
              safeLower(o.tableNumber) === safeLower(table.tableNumber) ||
              safeLower(o.tableNumber) === safeLower(table.id))
        );
        if (order) {
          const normId = safeLower(table.id);
          const normNum = safeLower(table.tableNumber);
          const hasBillReq = billReqSet.has(table.id) || (table.tableNumber && billReqSet.has(table.tableNumber)) || billReqSet.has(normId) || billReqSet.has(normNum);

          const finalTable = hasBillReq && table.status !== STATUS_BILLING_PENDING
            ? { ...table, status: STATUS_BILLING_PENDING }
            : table;

          acc.push({ table: finalTable, order });
        }
        return acc;
      }, []);
  }, [tables, orders, serviceRequests]);

  // Aggregate KOTs for the selected table
  const cartItems = useMemo((): BillingCartItem[] => {
    if (!selectedTableId) return [];
    const selected = billingTables.find((bt) => bt.table.id === selectedTableId);
    if (!selected) return [];
    return aggregateKots(selected.order, menuItems);
  }, [selectedTableId, billingTables, menuItems]);

  // Recalculate tax whenever cart, service charge, discount, or extra charges change
  const taxBreakdown = useMemo(
    () => calculateTax(cartItems, includeServiceCharge, appliedDiscount, loyaltyRedeemed, customTip, packagingCharge),
    [cartItems, includeServiceCharge, appliedDiscount, loyaltyRedeemed, customTip, packagingCharge]
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const selectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setAppliedDiscount(null);
    setLoyaltyRedeemed(0);
    setCustomTipState(0);
    setPackagingChargeState(0);
  }, []);

  const toggleServiceCharge = useCallback((val: boolean) => {
    setIncludeServiceCharge(val);
  }, []);

  const applyDiscount = useCallback((discount: BillingDiscount) => {
    setAppliedDiscount(discount);
  }, []);

  const clearDiscount = useCallback(() => {
    setAppliedDiscount(null);
  }, []);

  return {
    billingTables,
    selectedTableId,
    cartItems,
    taxBreakdown,
    includeServiceCharge,
    appliedDiscount,
    customTip,
    packagingCharge,
    selectTable,
    toggleServiceCharge,
    applyDiscount,
    clearDiscount,
    setLoyaltyRedeemed,
    setCustomTip: setCustomTipState,
    setPackagingCharge: setPackagingChargeState,
  };
}

