// RESPONSIBILITY: All TypeScript types for the Billing POS module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: BillingTypes.ts → imported by useBillingOrder, BillingTableSelector,
//            BillingOrderSummary, billing/page.tsx

import type { AppTable, AppOrder } from "@/types/appTypes";

// ─── Cart Item (aggregated from all KOTs) ─────────────────────────────────────

export interface BillingCartItem {
  itemId:     string;
  name:       string;
  qty:        number;
  unitPrice:  number;
  totalPrice: number;
  station:    string; // "Kitchen" | "Bar" | "Bakery" — used for VAT calc
  notes:      string;
}

// ─── Tax Breakdown ────────────────────────────────────────────────────────────

export interface BillingTaxBreakdown {
  subtotal:           number;
  cgst:               number;
  sgst:               number;
  serviceCharge:      number;
  vat:                number; // Liquor VAT on Bar station items only
  discount:           number;
  loyaltyRedeemed:    number;
  customTip:          number;
  packagingCharge:    number;
  roundingAdjustment: number;
  roundOff:           number;
  totalAmount:        number;
}

// ─── Guest Split Types ────────────────────────────────────────────────────────

export type BillingSplitType = "EQUAL" | "ITEMIZED";

export interface BillingGuestSplitItem {
  guestId:   string;
  guestName: string;
  items:     BillingCartItem[];
  subtotal:  number;
  total:     number;
  isPaid:    boolean;
  paymentMethod?: string;
}

// ─── Cashier Shift & Reconciliation Types ─────────────────────────────────────

export interface BillingDenominations {
  d500: number;
  d200: number;
  d100: number;
  d50:  number;
  d20:  number;
  d10:  number;
}

export interface BillingShiftMetrics {
  openingFloat:   number;
  cashCollected:  number;
  upiCollected:   number;
  cardCollected:  number;
  discountGiven:  number;
  totalNetSales:  number;
  totalBillsPaid: number;
}

// ─── Thermal Receipt Settings ─────────────────────────────────────────────────

export interface ThermalReceiptSettings {
  showGstin:     boolean;
  gstinNumber:   string;
  headerLogoUrl: string;
  footerMessage: string;
  showQrCode:    boolean;
}

// ─── Discount (Rule 35: No inline string unions) ──────────────────────────────

export type BillingDiscountType = "PERCENT" | "FLAT" | "NC";

export interface BillingDiscount {
  type:     BillingDiscountType;
  value:    number;  // % value or flat ₹ amount
  reason:   string;
  adminPin: string;  // required for NC type
}

// ─── Selected Table Info (table + its active order) ───────────────────────────

export interface BillingSelectedTable {
  table: AppTable;
  order: AppOrder;
}


// ─── Component Props ──────────────────────────────────────────────────────────

export interface BillingTableSelectorProps {
  tables:          BillingSelectedTable[];
  selectedTableId: string;
  onSelect:        (tableId: string) => void;
}

export interface BillingOrderSummaryProps {
  cartItems:             BillingCartItem[];
  taxBreakdown:          BillingTaxBreakdown;
  includeServiceCharge:  boolean;
  onToggleServiceCharge: (val: boolean) => void;
  onProceedToPayment:    () => void;
}

// ─── Payment Mode (Rule 35: No inline string unions) ─────────────────────────

export type BillingPaymentMode = "SINGLE" | "SPLIT_BILL" | "SPLIT_PAYMENT";
export type BillingSingleMethod = "CASH" | "UPI" | "CARD";

export interface BillingSplitPaymentValues {
  cash: number;
  upi:  number;
  card: number;
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

export interface BillingCrmCustomer {
  phone:         string;
  name:          string;
  loyaltyPoints: number;
  totalVisits:   number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface BillingDiscountPanelProps {
  appliedDiscount:  BillingDiscount | null;
  onApply:          (discount: BillingDiscount) => void;
  onClear:          () => void;
}

export interface BillingCrmPanelProps {
  totalAmount:      number;
  customerPhone?:   string;
  onRedeemChange:   (redeemAmount: number) => void;
  onCustomerChange: (phone: string, name: string) => void;
}

export interface BillingSplitPaymentPanelProps {
  totalAmount:      number;
  onPaymentReady:   (mode: BillingPaymentMode, method: BillingSingleMethod, split: BillingSplitPaymentValues) => void;
}

export interface BillingUpiQrModalProps {
  isOpen:       boolean;
  amount:       number;
  tableNumber:  string;
  onConfirm:    () => void;
  onClose:      () => void;
}

// ─── useBillingCrm Return Shape ───────────────────────────────────────────────

export interface UseBillingCrmReturn {
  customer:          BillingCrmCustomer | null;
  isSearching:       boolean;
  loyaltyEarned:     number;
  redeemablePoints:  number;
  redeemAmount:      number;
  searchCustomer:    (phone: string) => void;
  addNewCustomer:    (name: string, phone: string) => void;
  setRedeemAmount:   (amount: number) => void;
  clearCustomer:     () => void;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface BillingCheckoutPayload {
  orderId:       string;
  tableNumber:   string;
  taxBreakdown:  BillingTaxBreakdown;
  cartItems:     BillingCartItem[];
  paymentMode:   BillingPaymentMode;
  singleMethod:  BillingSingleMethod;
  splitValues:   BillingSplitPaymentValues;
  customerPhone: string;
  loyaltyEarned: number;
  redeemAmount:  number;
}

export interface BillingReceiptModalProps {
  isOpen:                 boolean;
  cartItems:              BillingCartItem[];
  taxBreakdown:           BillingTaxBreakdown;
  tableNumber:            string;
  customerName:           string;
  customerPhone:          string;
  whatsAppLink:           string;
  onSaveCustomerWhatsApp?: (phone: string) => void;
  onClose:                () => void;
}

export interface UseBillingCheckoutReturn {
  isProcessing:      boolean;
  processCheckout:   (payload: BillingCheckoutPayload) => Promise<boolean>;
  buildWhatsAppLink: (phone: string, receiptText: string) => string;
  buildReceiptText:  (cartItems: BillingCartItem[], taxBreakdown: BillingTaxBreakdown, tableNumber: string) => string;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseBillingOrderReturn {
  billingTables:        BillingSelectedTable[];
  selectedTableId:      string;
  cartItems:            BillingCartItem[];
  taxBreakdown:         BillingTaxBreakdown;
  includeServiceCharge: boolean;
  appliedDiscount:      BillingDiscount | null;
  selectTable:          (tableId: string) => void;
  toggleServiceCharge:  (val: boolean) => void;
  applyDiscount:        (discount: BillingDiscount) => void;
  clearDiscount:        () => void;
  setLoyaltyRedeemed:   (amount: number) => void;
}
