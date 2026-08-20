// RESPONSIBILITY: All TypeScript types for the Customer QR Self-Ordering module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: CustomerTypes.ts → imported by useCustomerOrder, CustomerMenuBrowser,
//            CustomerCartDrawer, CustomerOrderStatus, CustomerFeedbackForm

import type { AppMenuItem, AppOrder } from "@/types/appTypes";

// ─── Union Types (Rule 35: No inline string literals) ─────────────────────────

export type CustomerDietaryFilter = "ALL" | "VEG" | "NON_VEG" | "JAIN";

export type CustomerPageView = "MENU" | "ORDER_STATUS" | "FEEDBACK" | "THANK_YOU";

export type CustomerOrderPhase =
  | "RECEIVED"
  | "COOKING"
  | "READY"
  | "COMPLETED";

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CustomerCartItem {
  itemId:    string;
  name:      string;
  qty:       number;
  unitPrice: number;
  notes:     string;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface CustomerMenuBrowserProps {
  menuItems:           AppMenuItem[];
  cart:                CustomerCartItem[];
  activeOrder?:        AppOrder | null;
  onAddToCart:         (itemId: string) => void;
  onOpenCart:          () => void;
  onViewRunningOrder?: () => void;
  onUpdateQty?:        (itemId: string, delta: number) => void;
}

export interface CustomerCartDrawerProps {
  isOpen:          boolean;
  cart:            CustomerCartItem[];
  isSubmitting:    boolean;
  onClose:         () => void;
  onUpdateQty:     (itemId: string, delta: number) => void;
  onUpdateNotes:   (itemId: string, notes: string) => void;
  onRemove:        (itemId: string) => void;
  onPlaceOrder:    () => void;
}

export interface CustomerOrderStatusProps {
  order:       AppOrder;
  tableNumber: string;
  onComplete:  () => void;
  onOrderMore?: () => void;
}

export interface CustomerFeedbackFormProps {
  orderId:     string;
  tableNumber: string;
  onSubmit:    (rating: number, comment: string) => void;
  isSubmitting: boolean;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseCustomerOrderReturn {
  // State
  tableNumber:   string;
  menuItems:     AppMenuItem[];
  cart:          CustomerCartItem[];
  activeOrder:   AppOrder | null;
  pageView:      CustomerPageView;
  isSubmitting:  boolean;
  isMounted:     boolean;

  // Handlers
  addToCart:       (itemId: string) => void;
  updateQty:       (itemId: string, delta: number) => void;
  updateNotes:     (itemId: string, notes: string) => void;
  removeFromCart:  (itemId: string) => void;
  submitOrder:     () => Promise<void>;
  submitFeedback:  (rating: number, comment: string) => void;
  handleComplete:  () => void;
  openMenu:        () => void;
  viewOrderStatus: () => void;
}
