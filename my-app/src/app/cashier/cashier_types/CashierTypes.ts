// RESPONSIBILITY: All TypeScript types for the Cashier POS module.
// No logic, no imports from other modules â€” pure type definitions only.
// DATA FLOW: CashierTypes.ts â†’ imported by useCashierOrder, CashierTableSelector,
//            CashierOrderSummary, cashier/page.tsx

import type { AppTable, AppOrder } from "@/types/appTypes";

// â”€â”€â”€ Cart Item (aggregated from all KOTs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierCartItem {
  itemId:     string;
  name:       string;
  qty:        number;
  unitPrice:  number;
  totalPrice: number;
  station:    string; // "Kitchen" | "Bar" | "Bakery" â€” used for VAT calc
  notes:      string;
}

// â”€â”€â”€ Tax Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierTaxBreakdown {
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

// â”€â”€â”€ Guest Split Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CashierSplitType = "EQUAL" | "ITEMIZED";

export interface CashierGuestSplitItem {
  guestId:   string;
  guestName: string;
  items:     CashierCartItem[];
  subtotal:  number;
  total:     number;
  isPaid:    boolean;
  paymentMethod?: string;
}

// â”€â”€â”€ Cashier Shift & Reconciliation Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierDenominations {
  d500: number;
  d200: number;
  d100: number;
  d50:  number;
  d20:  number;
  d10:  number;
}

export interface CashierShiftMetrics {
  openingFloat:   number;
  cashCollected:  number;
  upiCollected:   number;
  cardCollected:  number;
  discountGiven:  number;
  totalNetSales:  number;
  totalBillsPaid: number;
}

// â”€â”€â”€ Thermal Receipt Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ThermalReceiptSettings {
  showGstin:     boolean;
  gstinNumber:   string;
  headerLogoUrl: string;
  footerMessage: string;
  showQrCode:    boolean;
}

// â”€â”€â”€ Discount (Rule 35: No inline string unions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CashierDiscountType = "PERCENT" | "FLAT" | "NC";

export interface CashierDiscount {
  type:     CashierDiscountType;
  value:    number;  // % value or flat â‚¹ amount
  reason:   string;
  adminPin: string;  // required for NC type
}

// â”€â”€â”€ Selected Table Info (table + its active order) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierSelectedTable {
  table: AppTable;
  order: AppOrder;
}


// â”€â”€â”€ Component Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierTableSelectorProps {
  tables:          CashierSelectedTable[];
  selectedTableId: string;
  onSelect:        (tableId: string) => void;
}

export interface CashierOrderSummaryProps {
  cartItems:             CashierCartItem[];
  taxBreakdown:          CashierTaxBreakdown;
  includeServiceCharge:  boolean;
  onToggleServiceCharge: (val: boolean) => void;
  onProceedToPayment:    () => void;
}

// â”€â”€â”€ Payment Mode (Rule 35: No inline string unions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CashierPaymentMode = "SINGLE" | "SPLIT_BILL" | "SPLIT_PAYMENT";
export type CashierSingleMethod = "CASH" | "UPI" | "CARD";

export interface CashierSplitPaymentValues {
  cash: number;
  upi:  number;
  card: number;
}

// â”€â”€â”€ CRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierCrmCustomer {
  phone:         string;
  name:          string;
  loyaltyPoints: number;
  totalVisits:   number;
}

// â”€â”€â”€ Component Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierDiscountPanelProps {
  appliedDiscount:  CashierDiscount | null;
  onApply:          (discount: CashierDiscount) => void;
  onClear:          () => void;
}

export interface CashierCrmPanelProps {
  totalAmount:      number;
  customerPhone?:   string;
  onRedeemChange:   (redeemAmount: number) => void;
  onCustomerChange: (phone: string, name: string) => void;
}

export interface CashierSplitPaymentPanelProps {
  totalAmount:      number;
  onPaymentReady:   (mode: CashierPaymentMode, method: CashierSingleMethod, split: CashierSplitPaymentValues) => void;
}

export interface CashierUpiQrModalProps {
  isOpen:       boolean;
  amount:       number;
  tableNumber:  string;
  onConfirm:    () => void;
  onClose:      () => void;
}

// â”€â”€â”€ useCashierCrm Return Shape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseCashierCrmReturn {
  customer:          CashierCrmCustomer | null;
  isSearching:       boolean;
  loyaltyEarned:     number;
  redeemablePoints:  number;
  redeemAmount:      number;
  searchCustomer:    (phone: string) => void;
  addNewCustomer:    (name: string, phone: string) => void;
  setRedeemAmount:   (amount: number) => void;
  clearCustomer:     () => void;
}

// â”€â”€â”€ Checkout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierCheckoutPayload {
  orderId:       string;
  tableNumber:   string;
  taxBreakdown:  CashierTaxBreakdown;
  cartItems:     CashierCartItem[];
  paymentMode:   CashierPaymentMode;
  singleMethod:  CashierSingleMethod;
  splitValues:   CashierSplitPaymentValues;
  customerPhone: string;
  loyaltyEarned: number;
  redeemAmount:  number;
}

export interface CashierReceiptModalProps {
  isOpen:                 boolean;
  cartItems:              CashierCartItem[];
  taxBreakdown:           CashierTaxBreakdown;
  tableNumber:            string;
  customerName:           string;
  customerPhone:          string;
  whatsAppLink:           string;
  onSaveCustomerWhatsApp?: (phone: string) => void;
  onClose:                () => void;
}

export interface UseCashierCheckoutReturn {
  isProcessing:      boolean;
  processCheckout:   (payload: CashierCheckoutPayload) => Promise<boolean>;
  buildWhatsAppLink: (phone: string, receiptText: string) => string;
  buildReceiptText:  (cartItems: CashierCartItem[], taxBreakdown: CashierTaxBreakdown, tableNumber: string) => string;
}

// â”€â”€â”€ Hook Return Shape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseCashierOrderReturn {
  cashierTables:        CashierSelectedTable[];
  selectedTableId:      string;
  cartItems:            CashierCartItem[];
  taxBreakdown:         CashierTaxBreakdown;
  includeServiceCharge: boolean;
  appliedDiscount:      CashierDiscount | null;
  selectTable:          (tableId: string) => void;
  toggleServiceCharge:  (val: boolean) => void;
  applyDiscount:        (discount: CashierDiscount) => void;
  clearDiscount:        () => void;
  setLoyaltyRedeemed:   (amount: number) => void;
}
