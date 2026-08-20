// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// WaiterReservations module. No logic, no imports, no JSX â€” pure type definitions only.
// DATA FLOW: WaiterReservationsTypes.ts â†’ useWaiterReservations.ts + all WaiterReservations components

import type { AppReservation, AppTable } from "@/types/appTypes";

// â”€â”€â”€ Form Values (Rule 7: types in _types file, not inline) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface WaiterReservationsFormValues {
  tableId:      string;
  customerName: string;
  phone:        string;
  guestCount:   number;
  slotTime:     string; // datetime-local string "YYYY-MM-DDTHH:MM"
}

// â”€â”€â”€ Tab Type (Rule 35: No inline string literals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type WaiterReservationsTab = "UPCOMING" | "PAST";

// â”€â”€â”€ Hook Return Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseWaiterReservationsReturn {
  upcoming:          AppReservation[];
  past:              AppReservation[];
  availableTables:   AppTable[];
  isSubmitting:      boolean;
  cancellingId:      string | null;
  addReservation:    (values: WaiterReservationsFormValues) => void;
  cancelReservation: (id: string) => void;
}

// â”€â”€â”€ Component Prop Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface WaiterReservationsTableProps {
  waiter_reservations: AppReservation[];
  tab:          WaiterReservationsTab;
  cancellingId: string | null;
  onCancel:     (id: string) => void;
}

export interface WaiterReservationsFormModalProps {
  isOpen:          boolean;
  availableTables: AppTable[];
  isSubmitting:    boolean;
  onSubmit:        (values: WaiterReservationsFormValues) => void;
  onClose:         () => void;
}
