"use client";

// RESPONSIBILITY: All CRM customer logic for the Billing POS module.
// Reads/writes CRM_CUSTOMERS from localStorage.
// Handles customer search by phone, new customer creation,
// loyalty points earned calculation, and redeem amount setting.
// No JSX — pure logic hook consumed by BillingCrmPanel.
// DATA FLOW: localStorage → useLocalStorage → useBillingCrm → BillingCrmPanel → UI

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppCrmCustomer } from "@/types/appTypes";
import type { BillingCrmCustomer, UseBillingCrmReturn } from "@/app/billing/billing_types/BillingTypes";

// ─── Constants (Rule 35: No magic numbers) ────────────────────────────────────

const LOYALTY_CASHBACK_RATE = 0.05 as const; // 5% of total = points earned
const POINTS_TO_RUPEE_RATE  = 1    as const; // 1 point = ₹1 discount

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Maps AppCrmCustomer (full app type) to BillingCrmCustomer (billing-scoped type).
 * Keeps billing module self-contained — no direct AppCrmCustomer in UI.
 */
function mapToBillingCustomer(c: AppCrmCustomer): BillingCrmCustomer {
  return {
    phone:         c.phone,
    name:          c.name,
    loyaltyPoints: c.loyaltyPoints,
    totalVisits:   c.totalVisits,
  };
}

/**
 * Calculates loyalty points earned on a bill.
 * 5% of totalAmount = points earned (rounded down).
 *
 * @param totalAmount - Final bill amount in ₹
 * @returns Integer loyalty points earned
 */
function calcLoyaltyEarned(totalAmount: number): number {
  return Math.floor(totalAmount * LOYALTY_CASHBACK_RATE);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages CRM customer lookup and loyalty points for the Billing POS.
 * searchCustomer finds by exact phone match.
 * addNewCustomer creates a new CRM entry with 0 points.
 * setRedeemAmount lets cashier choose how many points to redeem (capped at balance).
 *
 * @param totalAmount - Current bill total (used to calculate loyalty earned)
 * @returns customer, loyaltyEarned, redeemablePoints, redeemAmount, handlers
 */
export function useBillingCrm(totalAmount: number): UseBillingCrmReturn {
  // Rule 61: No direct localStorage — hooks only
  const [crmCustomers, setCrmCustomers] = useLocalStorage<AppCrmCustomer[]>(
    STORAGE_KEYS.CRM_CUSTOMERS,
    []
  );

  const [customer,      setCustomer]      = useState<BillingCrmCustomer | null>(null);
  const [isSearching,   setIsSearching]   = useState<boolean>(false);
  const [redeemAmount,  setRedeemAmountState] = useState<number>(0);

  // Loyalty earned on this bill — recalculates when totalAmount changes
  // Deps: totalAmount — only this affects earned points
  const loyaltyEarned = useMemo(
    () => calcLoyaltyEarned(totalAmount),
    [totalAmount]
  );

  // Max redeemable = customer's current points × ₹1 per point
  // Deps: customer — changes when customer is found/cleared
  const redeemablePoints = useMemo(
    () => (customer ? customer.loyaltyPoints * POINTS_TO_RUPEE_RATE : 0),
    [customer]
  );

  /**
   * Searches CRM_CUSTOMERS by exact phone number match.
   * Sets customer state if found, clears if not found.
   * Resets redeemAmount on every new search.
   */
  const searchCustomer = useCallback(
    (phone: string) => {
      setIsSearching(true);
      setRedeemAmountState(0);

      const trimmed = phone.trim();
      const found   = crmCustomers.find((c) => c.phone === trimmed);

      setCustomer(found ? mapToBillingCustomer(found) : null);
      setIsSearching(false);
    },
    [crmCustomers]
  );

  /**
   * Creates a new CRM customer with 0 loyalty points and sets as active customer.
   */
  const addNewCustomer = useCallback(
    (name: string, phone: string) => {
      const newEntry: AppCrmCustomer = {
        phone:         phone.trim(),
        name:          name.trim(),
        loyaltyPoints: 0,
        totalVisits:   0,
        history:       [],
      };

      setCrmCustomers((prev) => {
        // Prevent duplicate phone entries
        const exists = prev.some((c) => c.phone === newEntry.phone);
        return exists ? prev : [...prev, newEntry];
      });

      setCustomer(mapToBillingCustomer(newEntry));
      setRedeemAmountState(0);
    },
    [setCrmCustomers]
  );

  /**
   * Sets the ₹ amount to redeem from loyalty points.
   * Capped at redeemablePoints and totalAmount (cannot exceed bill).
   */
  const setRedeemAmount = useCallback(
    (amount: number) => {
      const capped = Math.min(amount, redeemablePoints, totalAmount);
      setRedeemAmountState(Math.max(0, capped));
    },
    [redeemablePoints, totalAmount]
  );

  /**
   * Clears the active customer and resets redeem amount.
   */
  const clearCustomer = useCallback(() => {
    setCustomer(null);
    setRedeemAmountState(0);
  }, []);

  return {
    customer,
    isSearching,
    loyaltyEarned,
    redeemablePoints,
    redeemAmount,
    searchCustomer,
    addNewCustomer,
    setRedeemAmount,
    clearCustomer,
  };
}
