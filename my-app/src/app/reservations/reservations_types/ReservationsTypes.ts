// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// Reservations module. No logic, no imports, no JSX — pure type definitions only.
// DATA FLOW: ReservationsTypes.ts → useReservations.ts + all Reservations components

import type { AppReservation, AppTable } from "@/types/appTypes";

// ─── Form Values (Rule 7: types in _types file, not inline) ──────────────────

export interface ReservationsFormValues {
  tableId:      string;
  customerName: string;
  phone:        string;
  guestCount:   number;
  slotTime:     string; // datetime-local string "YYYY-MM-DDTHH:MM"
}

// ─── Tab Type (Rule 35: No inline string literals) ────────────────────────────

export type ReservationsTab = "UPCOMING" | "PAST";

// ─── Hook Return Interface ────────────────────────────────────────────────────

export interface UseReservationsReturn {
  upcoming:          AppReservation[];
  past:              AppReservation[];
  availableTables:   AppTable[];
  isSubmitting:      boolean;
  cancellingId:      string | null;
  addReservation:    (values: ReservationsFormValues) => void;
  cancelReservation: (id: string) => void;
}

// ─── Component Prop Interfaces ────────────────────────────────────────────────

export interface ReservationsTableProps {
  reservations: AppReservation[];
  tab:          ReservationsTab;
  cancellingId: string | null;
  onCancel:     (id: string) => void;
}

export interface ReservationsFormModalProps {
  isOpen:          boolean;
  availableTables: AppTable[];
  isSubmitting:    boolean;
  onSubmit:        (values: ReservationsFormValues) => void;
  onClose:         () => void;
}
