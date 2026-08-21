// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// AdminReservations module. No logic, no imports, no JSX â€” pure type definitions only.
// DATA FLOW: AdminReservationsTypes.ts â†’ useAdminReservations.ts + all AdminReservations components

import type { AppReservation, AppTable } from "@/types/appTypes";

// â”€â”€â”€ Form Values (Rule 7: types in _types file, not inline) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AdminReservationsFormValues {
  tableId:      string;
  customerName: string;
  phone:        string;
  guestCount:   number;
  slotTime:     string; // datetime-local string "YYYY-MM-DDTHH:MM"
}

// â”€â”€â”€ Tab Type (Rule 35: No inline string literals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type AdminReservationsTab = "UPCOMING" | "PAST";

// â”€â”€â”€ Hook Return Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseAdminReservationsReturn {
  upcoming:          AppReservation[];
  past:              AppReservation[];
  availableTables:   AppTable[];
  isSubmitting:      boolean;
  cancellingId:      string | null;
  addReservation:    (values: AdminReservationsFormValues) => void;
  cancelReservation: (id: string) => void;
}

// â”€â”€â”€ Component Prop Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AdminReservationsTableProps {
  admin_reservations: AppReservation[];
  tab:          AdminReservationsTab;
  cancellingId: string | null;
  onCancel:     (id: string) => void;
}

export interface AdminReservationsFormModalProps {
  isOpen:          boolean;
  availableTables: AppTable[];
  isSubmitting:    boolean;
  onSubmit:        (values: AdminReservationsFormValues) => void;
  onClose:         () => void;
}
