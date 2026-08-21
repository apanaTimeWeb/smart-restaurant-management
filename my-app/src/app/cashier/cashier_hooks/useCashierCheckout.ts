"use client";

// RESPONSIBILITY: All checkout automation logic for the Cashier POS module.
// Orchestrates 6 steps: inventory deduction → sales save → CRM update →
// order COMPLETED → table AVAILABLE → audit log.
// Also provides buildWhatsAppLink and buildReceiptText pure helpers.
// No JSX — pure logic hook consumed by cashier/page.tsx.
// DATA FLOW: CashierCheckoutPayload → processCheckout → 6 localStorage writes
//            → returns success boolean → cashier/page.tsx shows CashierReceiptModal

import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { dispatchNotification } from "@/lib/notificationService";
import { createServiceRequest } from "../cashier_utils/cashier_serviceRequestService";
import type {
  AppOrder,
  AppTable,
  AppSalesRecord,
  AppCrmCustomer,
  AppAuditLog,
  AppMenuItem,
  AppInventoryItem,
  PaymentMethod,
} from "@/types/appTypes";
import type {
  CashierCartItem,
  CashierTaxBreakdown,
  CashierCheckoutPayload,
  UseCashierCheckoutReturn,
} from "@/app/cashier/cashier_types/CashierTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const STATUS_COMPLETED  = "COMPLETED"  as const;
const STATUS_AVAILABLE  = "AVAILABLE"  as const;
const ACTION_CHECKOUT   = "CHECKOUT_COMPLETED" as const;
const ROLE_CASHIER      = "CASHIER"    as const;
const CASHIER_ID        = "staff-01"   as const; // placeholder until auth module
const WHATSAPP_BASE_URL = "https://wa.me/" as const;
const RESTAURANT_NAME   = "Spice Garden Restaurant" as const;
const RECEIPT_DIVIDER   = "─────────────────────────" as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Builds a pre-filled WhatsApp wa.me link with the receipt text as message.
 *
 * @param phone       - Customer phone number (digits only, no +91 prefix needed)
 * @param receiptText - Plain text receipt to pre-fill in WhatsApp
 * @returns Full wa.me URL string
 */
export function buildWhatsAppLink(phone: string, receiptText: string): string {
  const digits  = phone.replace(/\D/g, "");
  const e164    = digits.startsWith("91") ? digits : `91${digits}`;
  const encoded = encodeURIComponent(receiptText);
  return `${WHATSAPP_BASE_URL}${e164}?text=${encoded}`;
}

/**
 * Builds a plain-text itemized receipt string for WhatsApp sharing.
 *
 * @param cartItems    - Aggregated cart items
 * @param taxBreakdown - Full tax breakdown
 * @param tableNumber  - Table number string (e.g. "T-03")
 * @returns Multi-line plain text receipt
 */
export function buildReceiptText(
  cartItems:    CashierCartItem[],
  taxBreakdown: CashierTaxBreakdown,
  tableNumber:  string
): string {
  const now   = formatDateTime(Date.now());
  const lines: string[] = [
    `🍽️ ${RESTAURANT_NAME}`,
    `Table: ${tableNumber}  |  ${now}`,
    RECEIPT_DIVIDER,
  ];

  for (const item of cartItems) {
    const itemTotal = formatCurrency(item.totalPrice);
    lines.push(`${item.name} x${item.qty}  ${itemTotal}`);
  }

  lines.push(RECEIPT_DIVIDER);
  lines.push(`Subtotal       ${formatCurrency(taxBreakdown.subtotal)}`);

  if (taxBreakdown.cgst > 0) {
    lines.push(`CGST (2.5%)    ${formatCurrency(taxBreakdown.cgst)}`);
  }
  if (taxBreakdown.sgst > 0) {
    lines.push(`SGST (2.5%)    ${formatCurrency(taxBreakdown.sgst)}`);
  }
  if (taxBreakdown.serviceCharge > 0) {
    lines.push(`Service (5%)   ${formatCurrency(taxBreakdown.serviceCharge)}`);
  }
  if (taxBreakdown.vat > 0) {
    lines.push(`Liquor VAT     ${formatCurrency(taxBreakdown.vat)}`);
  }
  if (taxBreakdown.discount > 0) {
    lines.push(`Discount       -${formatCurrency(taxBreakdown.discount)}`);
  }
  if (taxBreakdown.loyaltyRedeemed > 0) {
    lines.push(`Loyalty        -${formatCurrency(taxBreakdown.loyaltyRedeemed)}`);
  }
  if (taxBreakdown.roundOff !== 0) {
    lines.push(`Round Off      ${formatCurrency(taxBreakdown.roundOff)}`);
  }

  lines.push(RECEIPT_DIVIDER);
  lines.push(`*TOTAL  ${formatCurrency(taxBreakdown.totalAmount)}*`);
  lines.push(RECEIPT_DIVIDER);
  lines.push("Thank you for dining with us! 🙏");

  return lines.join("/n");
}

/**
 * Derives the PaymentMethod union value from cashier panel selections.
 * SPLIT_BILL and SPLIT_PAYMENT both map to "SPLIT" in AppSalesRecord.
 */
function resolvePaymentMethod(
  paymentMode:  CashierCheckoutPayload["paymentMode"],
  singleMethod: CashierCheckoutPayload["singleMethod"]
): PaymentMethod {
  if (paymentMode === "SINGLE") return singleMethod;
  return "SPLIT";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Orchestrates the full checkout flow for the Cashier POS.
 * processCheckout runs 6 sequential localStorage writes (pessimistic — all or nothing per step).
 * buildWhatsAppLink and buildReceiptText are exposed for CashierReceiptModal.
 *
 * @returns isProcessing, processCheckout, buildWhatsAppLink, buildReceiptText
 */
export function useCashierCheckout(): UseCashierCheckoutReturn {
  // Rule 61: No direct localStorage — hooks only
  const [salesHistory, setSalesHistory] = useLocalStorage<AppSalesRecord[]>  (STORAGE_KEYS.SALES_HISTORY,  []);
  const [crmCustomers, setCrmCustomers] = useLocalStorage<AppCrmCustomer[]>  (STORAGE_KEYS.CRM_CUSTOMERS,  []);
  const [orders,       setOrders]       = useLocalStorage<AppOrder[]>        (STORAGE_KEYS.ORDERS,         []);
  const [tables,       setTables]       = useLocalStorage<AppTable[]>        (STORAGE_KEYS.TABLES,         []);
  const [auditLogs,    setAuditLogs]    = useLocalStorage<AppAuditLog[]>     (STORAGE_KEYS.AUDIT_LOGS,     []);
  const [menu,         setMenu]         = useLocalStorage<AppMenuItem[]>     (STORAGE_KEYS.MENU,           []);
  const [inventory,    setInventory]    = useLocalStorage<AppInventoryItem[]>(STORAGE_KEYS.INVENTORY,      []);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Runs the full 6-step checkout sequence.
   * Returns true on success, false if any critical step fails.
   * Rule 15: Pessimistic UI — isProcessing blocks re-submission.
   */
  const processCheckout = useCallback(
    async (payload: CashierCheckoutPayload): Promise<boolean> => {
      if (isProcessing) return false;
      if (!payload.orderId || !payload.tableNumber) {
        console.warn("[useCashierCheckout] orderId or tableNumber missing — aborting checkout");
        return false;
      }
      setIsProcessing(true);

      const saleId    = `sale-${Date.now()}`;
      const timestamp = Date.now();

      // ── Step 1: Recipe-based inventory deduction ──────────────────────────
      setInventory((prevInventory) => {
        let newInventory = [...prevInventory];
        
        payload.cartItems.forEach((cartItem) => {
          const menuItem = menu.find(m => m.id === cartItem.itemId || m.name === cartItem.name);
          if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
            menuItem.recipe.forEach(recipeItem => {
              const totalDeduction = recipeItem.qty * cartItem.qty;
              newInventory = newInventory.map(invItem => 
                invItem.id === recipeItem.ingredientId 
                  ? { ...invItem, currentStock: Math.max(0, invItem.currentStock - totalDeduction) }
                  : invItem
              );
            });
          }
        });
        
        return newInventory;
      });

      // ── Step 2: Save AppSalesRecord to app_sales_history ─────────────────
      const paymentMethod = resolvePaymentMethod(payload.paymentMode, payload.singleMethod);
      const splitDetails  =
        paymentMethod === "SPLIT"
          ? { cash: payload.splitValues.cash, upi: payload.splitValues.upi, card: payload.splitValues.card }
          : null;

      const salesRecord: AppSalesRecord = {
        id:              saleId,
        orderId:         payload.orderId,
        tableNumber:     payload.tableNumber,
        subtotal:        payload.taxBreakdown.subtotal,
        cgst:            payload.taxBreakdown.cgst,
        sgst:            payload.taxBreakdown.sgst,
        serviceCharge:   payload.taxBreakdown.serviceCharge,
        vat:             payload.taxBreakdown.vat,
        discount:        payload.taxBreakdown.discount,
        loyaltyRedeemed: payload.taxBreakdown.loyaltyRedeemed,
        totalAmount:     payload.taxBreakdown.totalAmount,
        paymentMethod,
        splitDetails,
        cashierId:       CASHIER_ID,
        timestamp,
        customerPhone:   payload.customerPhone || undefined,
      };

      setSalesHistory((prev) => [...prev, salesRecord]);

      // ── Step 3: Update CRM customer loyalty points ────────────────────────
      // loyaltyEarned added, totalVisits++, saleId pushed to history.
      // Auto-creates new customer record if phone is provided but not in CRM yet.
      if (payload.customerPhone && payload.customerPhone.length >= 10) {
        setCrmCustomers((prev) => {
          const existing = prev.find((c) => c.phone === payload.customerPhone);
          if (existing) {
            return prev.map((c) => {
              if (c.phone !== payload.customerPhone) return c;
              return {
                ...c,
                loyaltyPoints: c.loyaltyPoints + payload.loyaltyEarned - payload.redeemAmount,
                totalVisits:   c.totalVisits + 1,
                history:       [...c.history, saleId],
              };
            });
          }
          const newCust: AppCrmCustomer = {
            phone:         payload.customerPhone,
            name:          `Guest (Table ${payload.tableNumber})`,
            loyaltyPoints: payload.loyaltyEarned,
            totalVisits:   1,
            history:       [saleId],
          };
          return [...prev, newCust];
        });
      }

      // ── Step 4: Mark order status = COMPLETED ────────────────────────────
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.orderId ? { ...o, status: STATUS_COMPLETED } : o
        )
      );

      // ── Step 5: Update table status = CLEANING, currentOrderId = null ────
      const normKey = (s?: string) => (s || "").toLowerCase().trim().replace(/^(table|tbl|t)-?/i, "").trim().padStart(2, "0");
      const targetTableKey = normKey(payload.tableNumber);

      setTables((prev) =>
        prev.map((t) => {
          const tKey = normKey(t.tableNumber || t.id);
          const isMatch = t.currentOrderId === payload.orderId || tKey === targetTableKey;
          return isMatch ? { ...t, status: "CLEANING" as const, currentOrderId: null } : t;
        })
      );

      // Clear dedicated table_phone_XX key from localStorage upon checkout
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`table_phone_${targetTableKey}`);
      }

      // ── Step 6: Write audit log entry ─────────────────────────────────────
      const auditEntry: AppAuditLog = {
        id:        `log-${timestamp}`,
        action:    ACTION_CHECKOUT,
        details:   `Order ${payload.orderId} checked out. Table ${payload.tableNumber}. Total: ${formatCurrency(payload.taxBreakdown.totalAmount)}. Payment: ${paymentMethod}.`,
        userRole:  ROLE_CASHIER,
        timestamp,
      };

      setAuditLogs((prev) => [...prev, auditEntry]);

      // ── Step 7: Dispatch CLEANING notification & Service Request to Waiters 🧹
      dispatchNotification({
        role: "WAITER",
        type: "SERVICE_REQUEST",
        title: `Clean Table ${payload.tableNumber} 🧹`,
        message: `Bill paid for Table ${payload.tableNumber}. Please clean table & reset for next guests!`,
        entityId: payload.tableNumber,
        entityType: "TABLE",
        route: "/waiter",
        playSound: true,
        soundType: "BELL",
      });

      createServiceRequest({
        tableId: payload.tableNumber,
        tableNumber: payload.tableNumber,
        type: "CLEANING",
        customMessage: `Bill paid. Please clean table & reset for next guests.`,
      });

      setIsProcessing(false);
      return true;
    },
    // Deps: isProcessing + all setters (stable)
    [isProcessing, setSalesHistory, setCrmCustomers, setOrders, setTables, setAuditLogs, setInventory, menu]
  );

  return {
    isProcessing,
    processCheckout,
    buildWhatsAppLink,
    buildReceiptText,
  };
}
