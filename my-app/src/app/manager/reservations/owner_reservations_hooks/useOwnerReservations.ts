"use client";

// RESPONSIBILITY: All data and mutation logic for the OwnerReservations page.
// Reads/writes RESERVATIONS + TABLES from localStorage via useLocalStorage.
// Derives upcoming and past lists via useMemo.
// No JSX — pure logic hook consumed by owner_reservations/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → useOwnerReservations
//            → OwnerReservationsTable + OwnerReservationsFormModal → UI

import { useState, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppReservation, AppTable } from "@/types/appTypes";
import type {
  OwnerReservationsFormValues,
  UseOwnerReservationsReturn,
} from "@/app/manager/reservations/owner_reservations_types/OwnerReservationsTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const STATUS_CONFIRMED  = "CONFIRMED"  as const;
const STATUS_CANCELLED  = "CANCELLED"  as const;
const TABLE_RESERVED    = "RESERVED"   as const;
const TABLE_AVAILABLE   = "AVAILABLE"  as const;
const ID_PREFIX_RES     = "res"        as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a simple unique ID with a given prefix.
 * Uses Date.now() + random suffix — sufficient for localStorage-only app.
 *
 * @param prefix - Short string prefix e.g. "res"
 * @returns Unique string ID e.g. "res-1753401600000-4f2"
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Returns true if a reservation is considered "upcoming":
 * status is CONFIRMED and slotTime is in the future.
 *
 * @param r   - AppReservation to check
 * @param now - Current timestamp in ms
 */
function isUpcoming(r: AppReservation, now: number): boolean {
  return r.status === STATUS_CONFIRMED && new Date(r.slotTime).getTime() > now;
}

/**
 * Returns true if a reservation is considered "past":
 * status is CANCELLED, or slotTime has already passed.
 *
 * @param r   - AppReservation to check
 * @param now - Current timestamp in ms
 */
function isPast(r: AppReservation, now: number): boolean {
  return r.status === STATUS_CANCELLED || new Date(r.slotTime).getTime() <= now;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages all reservation state and mutations.
 * addReservation creates a new AppReservation and marks the table as RESERVED.
 * cancelReservation sets status to CANCELLED and restores the table to AVAILABLE.
 * upcoming/past lists are memoized and recalculate only when owner_reservations change.
 *
 * @returns upcoming, past, availableTables, isSubmitting, cancellingId, handlers
 */
export function useOwnerReservations(): UseOwnerReservationsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Rule 61: No direct localStorage — hooks only
  const [owner_reservations, setOwnerReservations] = useLocalStorage<AppReservation[]>(
    STORAGE_KEYS.RESERVATIONS,
    []
  );
  const [tables, setTables] = useLocalStorage<AppTable[]>(
    STORAGE_KEYS.TABLES,
    []
  );

  // Deps: owner_reservations — recompute when list changes
  const now = Date.now();

  const upcoming = useMemo(
    () =>
      owner_reservations
        .filter((r) => isUpcoming(r, now))
        .sort((a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [owner_reservations]
  );

  const past = useMemo(
    () =>
      owner_reservations
        .filter((r) => isPast(r, now))
        .sort((a, b) => new Date(b.slotTime).getTime() - new Date(a.slotTime).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [owner_reservations]
  );

  // Deps: tables — only AVAILABLE tables shown in form dropdown
  const availableTables = useMemo(
    () => tables.filter((t) => t.status === TABLE_AVAILABLE),
    [tables]
  );

  /**
   * Creates a new reservation and marks the selected table as RESERVED.
   * Uses pessimistic UI — isSubmitting blocks the submit button.
   *
   * @param values - Validated form values from OwnerReservationsFormModal
   */
  const addReservation = useCallback(
    (values: OwnerReservationsFormValues) => {
      setIsSubmitting(true);

      const newReservation: AppReservation = {
        id:           generateId(ID_PREFIX_RES),
        tableId:      values.tableId,
        customerName: values.customerName,
        phone:        values.phone,
        guestCount:   values.guestCount,
        slotTime:     values.slotTime,
        status:       STATUS_CONFIRMED,
      };

      // Write reservation
      setOwnerReservations((prev) => [...prev, newReservation]);

      // Mark table as RESERVED
      setTables((prev) =>
        prev.map((t) =>
          t.id === values.tableId ? { ...t, status: TABLE_RESERVED } : t
        )
      );

      setIsSubmitting(false);
    },
    [setOwnerReservations, setTables]
  );

  /**
   * Cancels a reservation by ID and restores the table to AVAILABLE.
   * cancellingId tracks which row is in the loading state (pessimistic UI).
   *
   * @param id - Reservation ID to cancel
   */
  const cancelReservation = useCallback(
    (id: string) => {
      setCancellingId(id);

      const target = owner_reservations.find((r) => r.id === id);

      // Update reservation status
      setOwnerReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: STATUS_CANCELLED } : r))
      );

      // Restore table to AVAILABLE if we found the reservation
      if (target) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === target.tableId ? { ...t, status: TABLE_AVAILABLE } : t
          )
        );
      }

      setCancellingId(null);
    },
    [owner_reservations, setOwnerReservations, setTables]
  );

  return {
    upcoming,
    past,
    availableTables,
    isSubmitting,
    cancellingId,
    addReservation,
    cancelReservation,
  };
}
