// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// CustomerReservations module. No logic, no imports, no JSX â€” pure type definitions only.
// DATA FLOW: CustomerReservationsTypes.ts â†’ useCustomerReservations.ts + all CustomerReservations components

import type { AppReservation, AppTable } from "@/types/appTypes";

// â”€â”€â”€ Form Values (Rule 7: types in _types file, not inline) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CustomerReservationsFormValues {
  tableId:      string;
  customerName: string;
  phone:        string;
  guestCount:   number;
  slotTime:     string; // datetime-local string "YYYY-MM-DDTHH:MM"
}

// â”€â”€â”€ Tab Type (Rule 35: No inline string literals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CustomerReservationsTab = "UPCOMING" | "PAST";

// â”€â”€â”€ Hook Return Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseCustomerReservationsReturn {
  upcoming:          AppReservation[];
  past:              AppReservation[];
  availableTables:   AppTable[];
  isSubmitting:      boolean;
  cancellingId:      string | null;
  addReservation:    (values: CustomerReservationsFormValues) => void;
  cancelReservation: (id: string) => void;
}

// â”€â”€â”€ Component Prop Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CustomerReservationsTableProps {
  customer_reservations: AppReservation[];
  tab:          CustomerReservationsTab;
  cancellingId: string | null;
  onCancel:     (id: string) => void;
}

export interface CustomerReservationsFormModalProps {
  isOpen:          boolean;
  availableTables: AppTable[];
  isSubmitting:    boolean;
  onSubmit:        (values: CustomerReservationsFormValues) => void;
  onClose:         () => void;
}
