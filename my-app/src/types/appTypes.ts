// RESPONSIBILITY: Single source of truth for ALL TypeScript interfaces and
// union types used across the entire app — Waiter, Kitchen, Billing, Admin, CRM.
// No logic, no imports, no component code — pure type definitions only.
// DATA FLOW: appTypes.ts → imported by hooks, components, utils across all modules

// ─── Union Types (Rule 35: No inline string literals anywhere in the app) ─────

export type TableSection = "Dining" | "AC" | "Outdoor";

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "BILLING_PENDING"
  | "CLEANING"
  | "DIRTY"
  | "RESERVED";

export type KitchenStation = "Kitchen" | "Bar" | "Bakery";

export type KotItemStatus =
  | "PENDING"
  | "COOKING"
  | "READY"
  | "SERVED"
  | "VOID_REQUESTED"
  | "VOIDED";

export type OrderStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "SPLIT";

export type StockUnit = "kg" | "g" | "L" | "pcs";

export type ShiftStatus = "OPEN" | "CLOSED";

export type ReservationStatus = "CONFIRMED" | "CANCELLED";

export type UserRole = "SUPER_ADMIN" | "HOTEL_OWNER" | "ADMIN" | "CUSTOMER" | "WAITER" | "CASHIER" | "KITCHEN";

export type CourseType = "DRINKS" | "STARTERS" | "MAIN_COURSE" | "DESSERTS" | "OTHER";

export type DietaryTag = "VEG" | "NON_VEG" | "EGG" | "VEGAN" | "JAIN" | "GLUTEN_FREE" | "DAIRY_FREE" | "CONTAINS_NUTS" | "SPICY";

export interface AppUser {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone: string | null;
  email?: string;
  createdByAdmin: boolean;
  createdAt: number;
  isActive: boolean;
  baseSalary?: number;
  joinDate?: string; // "YYYY-MM-DD"
  tenantId?: string; // Links staff to a specific hotel
}

// ─── 1. Tables ────────────────────────────────────────────────────────────────

export interface AppTable {
  id: string;
  tableNumber: string;
  section: TableSection;
  status: TableStatus;
  currentOrderId: string | null;
  mergedTables: string[];
}

// ─── 2. Menu ──────────────────────────────────────────────────────────────────

export interface AppMenuVariant {
  name: string;
  price: number;
}

export interface AppMenuRecipeItem {
  ingredientId: string;
  qty: number;
}

export interface AppModifierItem {
  name: string;
  price: number;
}

export interface AppMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  station: KitchenStation;
  isAvailable: boolean;
  variants: AppMenuVariant[];
  recipe: AppMenuRecipeItem[];
  isSpecial: boolean;
  specialExpiry?: number; // Unix timestamp ms
  dietaryTags?: DietaryTag[];
  modifiers?: AppModifierItem[];
  description?: string;
  imageUrl?: string;
}

// ─── 3. Combos ────────────────────────────────────────────────────────────────

export interface AppCombo {
  id: string;
  name: string;
  requiredItemIds: string[];
  comboPrice: number;
  happyHourStart: string | null; // "HH:MM" format
  happyHourEnd: string | null;   // "HH:MM" format
}

// ─── 4. Inventory ─────────────────────────────────────────────────────────────

export interface AppInventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: StockUnit;
  threshold: number;
  expiryDate: string; // "YYYY-MM-DD"
}

// ─── 5. Orders & KOTs ────────────────────────────────────────────────────────

export type KotPriority = "NORMAL" | "RUSH" | "VIP";

export interface AppKotItem {
  itemId: string;
  qty: number;
  notes?: string;
  status: KotItemStatus;
  prepTimeMins?: number;
  prepEndsAt?: number | null;
  seatNumber?: number;
  course?: CourseType;
  selectedModifiers?: string[];
  isOnHold?: boolean;
}

export interface AppKot {
  kotId: string;
  station: KitchenStation;
  items: AppKotItem[];
  timestamp: number; // Unix ms
  priority?: KotPriority;
}

export interface AppCustomerInfo {
  name: string;
  phone: string;
}

export interface AppOrder {
  id: string;
  tableNumber: string;
  kots: AppKot[];
  status: OrderStatus;
  customerInfo: AppCustomerInfo | null;
  createdAt?: number;
}

// ─── Live App Notifications ──────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  role: UserRole | "ALL";
  userId?: string;
  type: string;
  title: string;
  message: string;
  tableNumber?: string;
  entityId?: string;
  entityType?:
    | "ORDER"
    | "KOT"
    | "TABLE"
    | "PAYMENT"
    | "INVENTORY"
    | "SERVICE_REQUEST"
    | "RESERVATION";
  route?: string;
  isRead: boolean;
  createdAt: number;
}

// ─── Customer Service Requests ───────────────────────────────────────────────

export type ServiceRequestType =
  | "WATER"
  | "BILL"
  | "NAPKINS"
  | "WAITER_CALL"
  | "CLEANING"
  | "CUTLERY"
  | "OTHER";

export type ServiceRequestStatus =
  | "PENDING"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "CANCELLED";

export interface AppServiceRequest {
  id: string;
  tableId: string;
  tableNumber: string;
  orderId?: string;
  customerId?: string;
  type: ServiceRequestType;
  customMessage?: string;
  status: ServiceRequestStatus;
  assignedWaiterId?: string;
  acknowledgedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// ─── Low Stock Alerts & 24-Hour SLA Tracking ─────────────────────────────────

export type StockAlertStatus = "ALERT_SENT" | "IN_PROGRESS" | "DISPATCHED" | "RESTOCKED" | "CRITICAL_EXPIRED";

export interface AppLowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  station: KitchenStation;
  requestedAt: number; // Unix timestamp ms
  status: StockAlertStatus;
  restockedAt?: number;
  lastReminderSentAt?: number;
}

// ─── Order Events Timeline ───────────────────────────────────────────────────

export interface AppOrderEvent {
  id: string;
  orderId: string;
  type: string;
  message: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ─── Restaurant Settings & Master Config ──────────────────────────────────────

export interface AppRestaurantSettings {
  restaurantName: string;
  logoUrl: string;
  address: string;
  phone: string;
  gstin: string;
  currency: string;
  invoicePrefix: string;
  kotPrefix: string;
  upiVpa: string;
  cgstPercent: number;
  sgstPercent: number;
  vatPercent: number;
  serviceChargePercent: number;
  loyaltyRupeesPerPoint: number;
  defaultPrepTimeMins: number;
  businessHours: string;
  receiptFooter: string;
  kdsSlaWarningMins: number;
  kdsSlaDangerMins: number;
}

// ─── Coupons & Discount Rules ────────────────────────────────────────────────

export interface AppCoupon {
  id: string;
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

// ─── Order Drafts ─────────────────────────────────────────────────────────────

export interface AppDraftCartItem {
  cartKey: string;
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  variantName: string;
  notes: string;
  seatNumber?: number;
  course?: CourseType;
  selectedModifiers?: string[];
}

export interface AppOrderDraft {
  id: string;
  tableId: string;
  tableNumber: string;
  cart: AppDraftCartItem[];
  updatedAt: number;
}

// ─── 6. Sales History ────────────────────────────────────────────────────────

export interface AppSplitDetails {
  cash: number;
  upi: number;
  card: number;
}

export interface AppSalesRecord {
  id: string;
  orderId: string;
  tableNumber: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  vat: number;
  discount: number;
  loyaltyRedeemed: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  splitDetails: AppSplitDetails | null;
  cashierId: string;
  timestamp: number; // Unix ms
  customerPhone?: string;
  customerName?: string;
  tipAmount?: number;
  isReprinted?: boolean;
}

// ─── 7. CRM Customers ────────────────────────────────────────────────────────



export interface AppCrmCustomer {
  phone: string;
  name: string;
  loyaltyPoints: number;
  totalVisits: number;
  history: string[]; // sale IDs
}

// ─── 8. Staff Salary & Attendance ────────────────────────────────────────────

export interface AppSalaryRecord {
  id: string;
  staffId: string;
  amountPaid: number;
  baseSalary?: number;
  leaveDays?: number;
  deductionAmount?: number;
  bonus?: number;
  overtime?: number;
  paymentDate: number; // Unix ms
  month: string;       // "YYYY-MM" format
  status: "PAID";
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY";

export interface AppStaffAttendanceRecord {
  id: string; // `${staffId}_${date}`
  staffId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  notes?: string;
}

// ─── 9. Reservations ─────────────────────────────────────────────────────────

export interface AppReservation {
  id: string;
  tableId: string;
  customerName: string;
  phone: string;
  guestCount: number;
  slotTime: string; // ISO 8601
  status: ReservationStatus;
}

// ─── 10. Shift Register ───────────────────────────────────────────────────────

export interface AppWaiterStat {
  ordersServed: number;
  totalSales: number;
}

export interface AppShiftRegister {
  id: string;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  variance: number | null;
  totalSales: number;
  shiftStatus: ShiftStatus;
  openedAt: number;   // Unix ms
  closedAt: number | null;
  waiterStats: Record<string, AppWaiterStat>;
}

// ─── 11. Audit Logs ──────────────────────────────────────────────────────────

export interface AppAuditLog {
  id: string;
  action: string;
  details: string;
  userRole: UserRole;
  timestamp: number; // Unix ms
}

// ─── 12. Wastage ─────────────────────────────────────────────────────────────

export interface AppWastage {
  id: string;
  ingredientId: string;
  qty: number;
  unit: StockUnit;
  reason: string;
  timestamp: number; // Unix ms
}

// ─── 13. Feedbacks ───────────────────────────────────────────────────────────

export interface AppFeedback {
  id: string;
  orderId: string;
  tableNumber: string;
  rating: number; // 1–5
  comment: string;
  timestamp: number; // Unix ms
}

// ─── 14. SaaS Multi-Tenant Platform Types ─────────────────────────────────────

export type TenantStatus =
  | "APPROVAL_PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUBMITTED"
  | "ACTIVE"
  | "SUSPENDED";

export type SubscriptionPlan = "STARTER" | "PRO" | "ENTERPRISE";

export interface AppTenantSpecialItem {
  name: string;
  description?: string;
  imageUrl: string;
}

export interface AppTenant {
  tenantId: string;
  restaurantName: string;
  isListed?: boolean;
  tagline?: string;
  description?: string;
  city: string;
  address: string;
  landmark?: string;
  pincode?: string;
  cuisineTypes: string[];
  fssaiNumber?: string;
  gstinNumber?: string;
  logoUrl?: string;
  bannerUrl?: string;
  upiVpa?: string;
  openingTime?: string;
  closingTime?: string;
  rating: number;
  costForTwo: number;
  amenities?: string[];
  galleryUrls?: string[];
  specialties?: string[];
  offers?: string[];
  featuredItems?: AppTenantSpecialItem[];
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  advanceFeePaid: number;
  txnRefId?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AppPreOrderItem {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface AppAdvanceReservation {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestCount: number;
  perPersonAdvance: number;
  totalAdvanceDeposit: number;
  bookingDate: string;
  bookingTime: string;
  tableNumber?: string;
  paymentStatus: "PAID" | "PENDING";
  paymentTxnId: string;
  preOrderItems: AppPreOrderItem[];
  status: "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED";
  createdAt: number;
}

