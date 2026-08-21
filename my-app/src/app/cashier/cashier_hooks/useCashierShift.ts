"use client";

// RESPONSIBILITY: All shift management logic for the Cashier module.
// Reads/writes SHIFT_REGISTER + SALES_HISTORY from localStorage.
// openShift creates a new shift record. closeShift calculates expectedCash,
// variance, and marks shift CLOSED.
// No JSX — pure logic hook consumed by cashier/shift/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → useCashierShift → CashierShiftReport
//            + cashier/shift/page.tsx

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppShiftRegister, AppSalesRecord } from "@/types/appTypes";
import type { UseCashierShiftReturn } from "@/app/cashier/cashier_types/CashierTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const STATUS_OPEN   = "OPEN"   as const;
const STATUS_CLOSED = "CLOSED" as const;
const METHOD_CASH   = "CASH"   as const;
const ID_PREFIX     = "shift"  as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/** Generates a timestamped shift id. */
function generateShiftId(): string {
  return `${ID_PREFIX}-${Date.now()}`;
}

/**
 * Sums totalAmount of all CASH payment sales in the given history.
 * Used to calculate expectedCash = openingCash + cashSales.
 */
function sumCashSales(salesHistory: AppSalesRecord[]): number {
  return salesHistory.reduce(
    (sum, s) => (s.paymentMethod === METHOD_CASH ? sum + s.totalAmount : sum),
    0
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages shift open/close lifecycle for the Cashier module.
 * openShift creates a fresh shift. closeShift computes variance and seals it.
 *
 * @returns shift, isOpen, isSubmitting, salesHistory, openShift, closeShift
 */
export function useCashierShift(): UseCashierShiftReturn {
  // Rule 61: No direct localStorage — hooks only
  const [shift,        setShift]        = useLocalStorage<AppShiftRegister | null>(
    STORAGE_KEYS.SHIFT_REGISTER,
    null
  );
  const [salesHistory]                  = useLocalStorage<AppSalesRecord[]>(
    STORAGE_KEYS.SALES_HISTORY,
    []
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Derived: is there a currently OPEN shift?
  // Deps: shift
  const isOpen = useMemo(() => shift?.shiftStatus === STATUS_OPEN, [shift]);

  /**
   * Opens a new shift with the given opening cash amount.
   * Replaces any existing shift record.
   *
   * @param openingCash - Cash in drawer at shift start
   */
  const openShift = useCallback(
    (openingCash: number) => {
      setIsSubmitting(true);
      const newShift: AppShiftRegister = {
        id:           generateShiftId(),
        openingCash,
        closingCash:  null,
        expectedCash: null,
        variance:     null,
        totalSales:   0,
        shiftStatus:  STATUS_OPEN,
        openedAt:     Date.now(),
        closedAt:     null,
        waiterStats:  {},
      };
      setShift(newShift);
      setIsSubmitting(false);
    },
    [setShift]
  );

  /**
   * Closes the current shift.
   * Calculates expectedCash = openingCash + cashSales.
   * Calculates variance = closingCash - expectedCash.
   *
   * @param closingCash - Actual cash counted at shift end
   */
  const closeShift = useCallback(
    (closingCash: number) => {
      if (!shift || shift.shiftStatus !== STATUS_OPEN) return;
      setIsSubmitting(true);

      const cashSales    = sumCashSales(salesHistory);
      const expectedCash = shift.openingCash + cashSales;
      const variance     = closingCash - expectedCash;

      setShift({
        ...shift,
        closingCash,
        expectedCash,
        variance,
        shiftStatus: STATUS_CLOSED,
        closedAt:    Date.now(),
      });
      setIsSubmitting(false);
    },
    [shift, salesHistory, setShift]
  );

  return { shift, isOpen, isSubmitting, salesHistory, openShift, closeShift };
}
