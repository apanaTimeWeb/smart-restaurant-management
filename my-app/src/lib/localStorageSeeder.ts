// RESPONSIBILITY: Single source of truth for all localStorage seed data.
// Initializes 12 keys with realistic Indian restaurant data on first app load.
// Skips keys that already exist â€” never overwrites user data.
// DATA FLOW: initializeLocalStorageSeeds() â†’ localStorage â†’ useLocalStorage hook â†’ components

import type {
  AppTable,
  AppMenuItem,
  AppCombo,
  AppInventoryItem,
  AppOrder,
  AppSalesRecord,
  AppCrmCustomer,
  AppReservation,
  AppShiftRegister,
  AppAuditLog,
  AppUser,
  AppSalaryRecord,
} from "@/types/appTypes";

// â”€â”€â”€ Storage Key Constants (Rule 35: No magic strings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const STORAGE_KEYS = {
  TABLES:                   "app_tables",
  MENU:                     "app_menu",
  COMBOS:                   "app_combos",
  INVENTORY:                "app_inventory",
  ORDERS:                   "app_orders",
  SALES_HISTORY:            "app_sales_history",
  CRM_CUSTOMERS:            "app_crm_customers",
  RESERVATIONS:             "app_reservations",
  SHIFT_REGISTER:           "app_shift_register",
  AUDIT_LOGS:               "app_audit_logs",
  WASTAGE:                  "app_wastage",
  FEEDBACKS:                "app_feedbacks",
  USERS:                    "app_users",
  CURRENT_USER:             "app_current_user",
  SALARY_RECORDS:           "app_salary_records",
  STAFF_ATTENDANCE:         "app_staff_attendance",
  SERVICE_REQUESTS:         "app_service_requests",
  SAAS_TENANTS:             "app_saas_tenants",
  ADVANCE_RESERVATIONS:     "app_advance_reservations",
  NOTIFICATIONS:            "app_notifications",
  ORDER_EVENTS:             "app_order_events",
  ORDER_DRAFTS:             "app_order_drafts",
  COUPONS:                  "app_coupons",
  RESTAURANT_SETTINGS:      "app_restaurant_settings",
  CUSTOMER_FAVORITES:       "app_customer_favorites",
  CUSTOMER_RECENTLY_VIEWED: "app_customer_recently_viewed",
  SHIFT_HANDOVER_NOTES:     "app_shift_handover_notes",
  REFUNDS:                  "app_refunds",
  PARKED_BILLS:             "app_parked_bills",
  STORAGE_META:             "app_storage_meta",
  FLOOR_LAYOUTS:            "app_floor_layouts",
  STOCK_ALERTS:             "app_stock_alerts",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// â”€â”€â”€ Seed Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SEED_TABLES: AppTable[] = [
  { id: "tbl-01", tableNumber: "T-01", section: "Dining",  status: "AVAILABLE",       currentOrderId: null,    mergedTables: [] },
  { id: "tbl-02", tableNumber: "T-02", section: "Dining",  status: "OCCUPIED",        currentOrderId: "ord-01", mergedTables: [] },
  { id: "tbl-03", tableNumber: "T-03", section: "Dining",  status: "BILLING_PENDING", currentOrderId: "ord-02", mergedTables: [] },
  { id: "tbl-04", tableNumber: "T-04", section: "Dining",  status: "AVAILABLE",       currentOrderId: null,    mergedTables: [] },
  { id: "tbl-05", tableNumber: "T-05", section: "AC",      status: "RESERVED",        currentOrderId: null,    mergedTables: [] },
  { id: "tbl-06", tableNumber: "T-06", section: "AC",      status: "OCCUPIED",        currentOrderId: "ord-03", mergedTables: [] },
  { id: "tbl-07", tableNumber: "T-07", section: "AC",      status: "AVAILABLE",       currentOrderId: null,    mergedTables: [] },
  { id: "tbl-08", tableNumber: "T-08", section: "Outdoor", status: "AVAILABLE",       currentOrderId: null,    mergedTables: [] },
  { id: "tbl-09", tableNumber: "T-09", section: "Outdoor", status: "AVAILABLE",       currentOrderId: null,    mergedTables: [] },
  { id: "tbl-10", tableNumber: "T-10", section: "Outdoor", status: "OCCUPIED",        currentOrderId: "ord-04", mergedTables: [] },
];

const SEED_MENU: AppMenuItem[] = [
  // Starters â€” Kitchen
  { id: "menu-01", name: "Paneer Tikka",        price: 280, category: "Starters",     station: "Kitchen", isAvailable: true,  variants: [{ name: "Half", price: 180 }, { name: "Full", price: 280 }], recipe: [{ ingredientId: "ing-01", qty: 200 }, { ingredientId: "ing-02", qty: 20 }], isSpecial: true,  specialExpiry: Date.now() + 86400000 },
  { id: "menu-02", name: "Veg Spring Roll",     price: 160, category: "Starters",     station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-05", qty: 100 }], isSpecial: false },
  { id: "menu-03", name: "Chicken Tikka",       price: 320, category: "Starters",     station: "Kitchen", isAvailable: true,  variants: [{ name: "Half", price: 200 }, { name: "Full", price: 320 }], recipe: [{ ingredientId: "ing-06", qty: 250 }], isSpecial: false },
  { id: "menu-04", name: "Hara Bhara Kabab",    price: 180, category: "Starters",     station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-05", qty: 150 }], isSpecial: false },
  // Main Course â€” Kitchen
  { id: "menu-05", name: "Dal Makhani",         price: 220, category: "Main Course",  station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-07", qty: 150 }, { ingredientId: "ing-02", qty: 30 }], isSpecial: false },
  { id: "menu-06", name: "Paneer Butter Masala",price: 260, category: "Main Course",  station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-01", qty: 200 }, { ingredientId: "ing-02", qty: 40 }], isSpecial: false },
  { id: "menu-07", name: "Veg Biryani",         price: 240, category: "Main Course",  station: "Kitchen", isAvailable: true,  variants: [{ name: "Half", price: 160 }, { name: "Full", price: 240 }], recipe: [{ ingredientId: "ing-08", qty: 200 }, { ingredientId: "ing-05", qty: 100 }], isSpecial: false },
  { id: "menu-08", name: "Chicken Curry",       price: 300, category: "Main Course",  station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-06", qty: 300 }], isSpecial: false },
  { id: "menu-09", name: "Shahi Paneer",        price: 280, category: "Main Course",  station: "Kitchen", isAvailable: false, variants: [], recipe: [{ ingredientId: "ing-01", qty: 200 }], isSpecial: false },
  // Breads â€” Kitchen
  { id: "menu-10", name: "Butter Naan",         price: 40,  category: "Breads",       station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-03", qty: 80 }, { ingredientId: "ing-02", qty: 10 }], isSpecial: false },
  { id: "menu-11", name: "Tandoori Roti",       price: 25,  category: "Breads",       station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-03", qty: 60 }], isSpecial: false },
  { id: "menu-12", name: "Garlic Naan",         price: 50,  category: "Breads",       station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-03", qty: 80 }, { ingredientId: "ing-02", qty: 10 }], isSpecial: false },
  { id: "menu-13", name: "Paratha",             price: 60,  category: "Breads",       station: "Kitchen", isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-03", qty: 100 }], isSpecial: false },
  // Beverages â€” Bar
  { id: "menu-14", name: "Mango Lassi",         price: 120, category: "Beverages",    station: "Bar",     isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-04", qty: 200 }], isSpecial: true, specialExpiry: Date.now() + 43200000 },
  { id: "menu-15", name: "Masala Chai",         price: 40,  category: "Beverages",    station: "Bar",     isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-04", qty: 100 }], isSpecial: false },
  { id: "menu-16", name: "Fresh Lime Soda",     price: 60,  category: "Beverages",    station: "Bar",     isAvailable: true,  variants: [], recipe: [], isSpecial: false },
  { id: "menu-17", name: "Cold Coffee",         price: 100, category: "Beverages",    station: "Bar",     isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-04", qty: 150 }], isSpecial: false },
  // Desserts â€” Bakery
  { id: "menu-18", name: "Gulab Jamun",         price: 80,  category: "Desserts",     station: "Bakery",  isAvailable: true,  variants: [{ name: "2 Pcs", price: 80 }, { name: "4 Pcs", price: 140 }], recipe: [{ ingredientId: "ing-03", qty: 50 }, { ingredientId: "ing-04", qty: 50 }], isSpecial: false },
  { id: "menu-19", name: "Rasgulla",            price: 70,  category: "Desserts",     station: "Bakery",  isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-01", qty: 100 }], isSpecial: false },
  { id: "menu-20", name: "Chocolate Brownie",   price: 120, category: "Desserts",     station: "Bakery",  isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-03", qty: 80 }], isSpecial: false },
  { id: "menu-21", name: "Kulfi",               price: 90,  category: "Desserts",     station: "Bakery",  isAvailable: true,  variants: [], recipe: [{ ingredientId: "ing-04", qty: 150 }], isSpecial: false },
];

const SEED_COMBOS: AppCombo[] = [
  {
    id: "combo-01",
    name: "Thali Combo",
    requiredItemIds: ["menu-05", "menu-10", "menu-15"],
    comboPrice: 260,
    happyHourStart: null,
    happyHourEnd: null,
  },
  {
    id: "combo-02",
    name: "Snacks & Drinks",
    requiredItemIds: ["menu-02", "menu-16"],
    comboPrice: 200,
    happyHourStart: "16:00",
    happyHourEnd: "19:00",
  },
  {
    id: "combo-03",
    name: "Tikka Party",
    requiredItemIds: ["menu-01", "menu-03", "menu-17"],
    comboPrice: 650,
    happyHourStart: null,
    happyHourEnd: null,
  },
];

const SEED_INVENTORY: AppInventoryItem[] = [
  { id: "ing-01", name: "Paneer",        currentStock: 5,   unit: "kg",  threshold: 1,   expiryDate: "2025-08-10" },
  { id: "ing-02", name: "Butter",        currentStock: 2,   unit: "kg",  threshold: 0.5, expiryDate: "2025-08-05" },
  { id: "ing-03", name: "Wheat Flour",   currentStock: 10,  unit: "kg",  threshold: 2,   expiryDate: "2025-10-01" },
  { id: "ing-04", name: "Milk",          currentStock: 8,   unit: "L",   threshold: 2,   expiryDate: "2025-07-28" },
  { id: "ing-05", name: "Mixed Veggies", currentStock: 3,   unit: "kg",  threshold: 1,   expiryDate: "2025-07-26" },
  { id: "ing-06", name: "Chicken",       currentStock: 6,   unit: "kg",  threshold: 1,   expiryDate: "2025-07-25" },
  { id: "ing-07", name: "Black Dal",     currentStock: 4,   unit: "kg",  threshold: 1,   expiryDate: "2025-09-01" },
  { id: "ing-08", name: "Basmati Rice",  currentStock: 12,  unit: "kg",  threshold: 2,   expiryDate: "2025-12-01" },
  { id: "ing-09", name: "Tomatoes",      currentStock: 2,   unit: "kg",  threshold: 1,   expiryDate: "2025-07-27" },
  { id: "ing-10", name: "Onions",        currentStock: 5,   unit: "kg",  threshold: 1,   expiryDate: "2025-08-15" },
  { id: "ing-11", name: "Cooking Oil",   currentStock: 3,   unit: "L",   threshold: 1,   expiryDate: "2025-11-01" },
  { id: "ing-12", name: "Sugar",         currentStock: 3,   unit: "kg",  threshold: 0.5, expiryDate: "2025-12-01" },
  { id: "ing-13", name: "Salt",          currentStock: 2,   unit: "kg",  threshold: 0.5, expiryDate: "2026-01-01" },
  { id: "ing-14", name: "Cream",         currentStock: 1,   unit: "L",   threshold: 0.5, expiryDate: "2025-07-29" },
  { id: "ing-15", name: "Garam Masala",  currentStock: 0.3, unit: "kg",  threshold: 0.1, expiryDate: "2025-10-01" },
];

const NOW = Date.now();

const SEED_ORDERS: AppOrder[] = [
  {
    id: "ord-01",
    tableNumber: "T-02",
    kots: [
      {
        kotId: "kot-01",
        station: "Kitchen",
        items: [
          { itemId: "menu-01", qty: 1, notes: "Less spicy", status: "COOKING" },
          { itemId: "menu-10", qty: 2, notes: "",           status: "READY"   },
        ],
        timestamp: NOW - 900000,
      },
    ],
    status: "ACTIVE",
    customerInfo: { name: "Rahul Sharma", phone: "9876543210" },
  },
  {
    id: "ord-02",
    tableNumber: "T-03",
    kots: [
      {
        kotId: "kot-02",
        station: "Kitchen",
        items: [
          { itemId: "menu-05", qty: 1, notes: "",           status: "READY" },
          { itemId: "menu-06", qty: 1, notes: "Extra gravy", status: "READY" },
          { itemId: "menu-11", qty: 3, notes: "",           status: "READY" },
        ],
        timestamp: NOW - 1800000,
      },
      {
        kotId: "kot-03",
        station: "Bakery",
        items: [
          { itemId: "menu-18", qty: 2, notes: "", status: "READY" },
        ],
        timestamp: NOW - 600000,
      },
    ],
    status: "ACTIVE",
    customerInfo: { name: "Priya Patel", phone: "9123456789" },
  },
  {
    id: "ord-03",
    tableNumber: "T-06",
    kots: [
      {
        kotId: "kot-04",
        station: "Bar",
        items: [
          { itemId: "menu-14", qty: 2, notes: "", status: "COOKING" },
          { itemId: "menu-17", qty: 1, notes: "", status: "PENDING" },
        ],
        timestamp: NOW - 300000,
      },
    ],
    status: "ACTIVE",
    customerInfo: null,
  },
  {
    id: "ord-04",
    tableNumber: "T-10",
    kots: [
      {
        kotId: "kot-05",
        station: "Kitchen",
        items: [
          { itemId: "menu-08", qty: 2, notes: "Boneless", status: "COOKING" },
          { itemId: "menu-12", qty: 4, notes: "",          status: "PENDING" },
        ],
        timestamp: NOW - 600000,
      },
    ],
    status: "ACTIVE",
    customerInfo: { name: "Amit Singh", phone: "9988776655" },
  },
];

const SEED_SALES_HISTORY: AppSalesRecord[] = [
  { id: "sale-01", orderId: "ord-hist-01", tableNumber: "T-01", subtotal: 680,  cgst: 17,   sgst: 17,   serviceCharge: 34,  vat: 0,  discount: 0,  loyaltyRedeemed: 0,  totalAmount: 748,  paymentMethod: "UPI",   splitDetails: null, cashierId: "staff-01", timestamp: NOW - 86400000 },
  { id: "sale-02", orderId: "ord-hist-02", tableNumber: "T-04", subtotal: 1240, cgst: 31,   sgst: 31,   serviceCharge: 62,  vat: 0,  discount: 100, loyaltyRedeemed: 50, totalAmount: 1214, paymentMethod: "CASH",  splitDetails: null, cashierId: "staff-01", timestamp: NOW - 72000000 },
  { id: "sale-03", orderId: "ord-hist-03", tableNumber: "T-07", subtotal: 560,  cgst: 14,   sgst: 14,   serviceCharge: 0,   vat: 0,  discount: 0,  loyaltyRedeemed: 0,  totalAmount: 588,  paymentMethod: "CARD",  splitDetails: null, cashierId: "staff-02", timestamp: NOW - 43200000 },
  { id: "sale-04", orderId: "ord-hist-04", tableNumber: "T-02", subtotal: 920,  cgst: 23,   sgst: 23,   serviceCharge: 46,  vat: 0,  discount: 0,  loyaltyRedeemed: 0,  totalAmount: 1012, paymentMethod: "SPLIT", splitDetails: { cash: 500, upi: 512, card: 0 }, cashierId: "staff-01", timestamp: NOW - 21600000 },
  { id: "sale-05", orderId: "ord-hist-05", tableNumber: "T-05", subtotal: 380,  cgst: 9.5,  sgst: 9.5,  serviceCharge: 19,  vat: 0,  discount: 0,  loyaltyRedeemed: 0,  totalAmount: 418,  paymentMethod: "UPI",   splitDetails: null, cashierId: "staff-02", timestamp: NOW - 7200000  },
];

const SEED_CRM_CUSTOMERS: AppCrmCustomer[] = [
  { phone: "9876543210", name: "Rahul Sharma",  loyaltyPoints: 374,  totalVisits: 8,  history: ["sale-01", "sale-04"] },
  { phone: "9123456789", name: "Priya Patel",   loyaltyPoints: 209,  totalVisits: 5,  history: ["sale-02"] },
  { phone: "9988776655", name: "Amit Singh",    loyaltyPoints: 506,  totalVisits: 12, history: ["sale-03"] },
  { phone: "9765432100", name: "Sunita Verma",  loyaltyPoints: 125,  totalVisits: 3,  history: ["sale-05"] },
  { phone: "9654321098", name: "Vikram Mehta",  loyaltyPoints: 0,    totalVisits: 1,  history: [] },
];

const SEED_RESERVATIONS: AppReservation[] = [
  { id: "res-01", tableId: "tbl-05", customerName: "Neha Gupta",   phone: "9871234560", guestCount: 4, slotTime: "2025-07-25T19:00:00", status: "CONFIRMED" },
  { id: "res-02", tableId: "tbl-07", customerName: "Rohan Kapoor", phone: "9812345670", guestCount: 2, slotTime: "2025-07-25T20:30:00", status: "CONFIRMED" },
  { id: "res-03", tableId: "tbl-04", customerName: "Meera Joshi",  phone: "9823456780", guestCount: 6, slotTime: "2025-07-26T13:00:00", status: "CONFIRMED" },
];

const SEED_SHIFT_REGISTER: AppShiftRegister = {
  id: "shift-01",
  openingCash: 5000,
  closingCash: null,
  expectedCash: null,
  variance: null,
  totalSales: 3980,
  shiftStatus: "OPEN",
  openedAt: NOW - 28800000,
  closedAt: null,
  waiterStats: {
    "staff-01": { ordersServed: 8,  totalSales: 2760 },
    "staff-02": { ordersServed: 5,  totalSales: 1220 },
  },
};

const SEED_AUDIT_LOGS: AppAuditLog[] = [
  { id: "log-01", action: "DISCOUNT_APPLIED",   details: "10% discount on order ord-hist-02, Table T-04. Reason: Regular customer",  userRole: "CASHIER", timestamp: NOW - 72000000 },
  { id: "log-02", action: "ITEM_VOID",          details: "Shahi Paneer voided from ord-hist-03, Table T-07. Reason: Out of stock",    userRole: "WAITER",  timestamp: NOW - 43200000 },
  { id: "log-03", action: "LOYALTY_REDEEMED",   details: "50 points redeemed by Priya Patel (9123456789) on order ord-hist-02",       userRole: "CASHIER", timestamp: NOW - 72000000 },
];

const SEED_USERS: AppUser[] = [
  {
    id: "usr-superadmin-01",
    username: "superadmin",
    passwordHash: "superadmin123",
    role: "SUPER_ADMIN",
    name: "Platform Super Admin Master",
    phone: "9999999999",
    email: "superadmin@smartpos.com",
    createdByAdmin: false,
    createdAt: NOW - 2592000000,
    isActive: true,
  },
  {
    id: "usr-admin-01",
    username: "admin",
    passwordHash: "admin123",
    role: "ADMIN",
    name: "System Admin",
    phone: "9876543210",
    createdByAdmin: false,
    createdAt: NOW - 2592000000,
    isActive: true,
  },
  {
    id: "usr-cashier-01",
    username: "cashier",
    passwordHash: "cashier123",
    role: "CASHIER",
    name: "Rahul Sharma",
    phone: "9876543211",
    createdByAdmin: true,
    createdAt: NOW - 1296000000,
    isActive: true,
    baseSalary: 15000,
    joinDate: "2025-05-01",
  },
  {
    id: "usr-waiter-01",
    username: "waiter",
    passwordHash: "waiter123",
    role: "WAITER",
    name: "Amit Kumar",
    phone: "9876543212",
    createdByAdmin: true,
    createdAt: NOW - 1296000000,
    isActive: true,
    baseSalary: 12000,
    joinDate: "2025-06-15",
  },
  {
    id: "usr-kitchen-01",
    username: "kitchen",
    passwordHash: "kitchen123",
    role: "KITCHEN",
    name: "Chef Suresh",
    phone: "9876543213",
    createdByAdmin: true,
    createdAt: NOW - 1296000000,
    isActive: true,
    baseSalary: 25000,
    joinDate: "2025-01-10",
  },
  {
    id: "usr-cust-01",
    username: "customer",
    passwordHash: "customer123",
    role: "CUSTOMER",
    name: "Priya Singh",
    phone: "9876543214",
    createdByAdmin: false,
    createdAt: NOW - 648000000,
    isActive: true,
  },
  {
    id: "usr-owner-01",
    username: "owner",
    passwordHash: "owner123",
    role: "HOTEL_OWNER",
    name: "Vikram Mehta",
    phone: "9876543215",
    createdByAdmin: false,
    createdAt: NOW - 648000000,
    isActive: true,
  },
];

// â”€â”€â”€ Main Initializer Function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Initializes all 13 localStorage keys with seed data on first app load.
 * Skips any key that already has data â€” never overwrites existing user data.
 * Must be called once at app startup (e.g., in AppShell useEffect).
 */
export function initializeLocalStorageSeeds(): void {
  if (typeof window === "undefined") return;

  const seedMap: Record<string, unknown> = {
    [STORAGE_KEYS.TABLES]:         SEED_TABLES,
    [STORAGE_KEYS.MENU]:           SEED_MENU,
    [STORAGE_KEYS.COMBOS]:         SEED_COMBOS,
    [STORAGE_KEYS.INVENTORY]:      SEED_INVENTORY,
    [STORAGE_KEYS.ORDERS]:         SEED_ORDERS,
    [STORAGE_KEYS.SALES_HISTORY]:  SEED_SALES_HISTORY,
    [STORAGE_KEYS.CRM_CUSTOMERS]:  SEED_CRM_CUSTOMERS,
    [STORAGE_KEYS.RESERVATIONS]:   SEED_RESERVATIONS,
    [STORAGE_KEYS.SHIFT_REGISTER]: SEED_SHIFT_REGISTER,
    [STORAGE_KEYS.AUDIT_LOGS]:     SEED_AUDIT_LOGS,
    [STORAGE_KEYS.WASTAGE]:        [],
    [STORAGE_KEYS.FEEDBACKS]:      [],
    [STORAGE_KEYS.USERS]:          SEED_USERS,
    [STORAGE_KEYS.SALARY_RECORDS]: [],
  };

  Object.entries(seedMap).forEach(([key, data]) => {
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  });
  // MIGRATION: Ensure all existing seeded staff users have a tenantId so they connect to the seeded DB
  try {
    const rawUsers = window.localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      let users = JSON.parse(rawUsers);
      let updated = false;
      users = users.map((u: any) => {
        if (["ADMIN", "WAITER", "CASHIER", "KITCHEN"].includes(u.role) && !u.tenantId) {
          updated = true;
          return { ...u, tenantId: "tenant-royal-spice-01" };
        }
        return u;
      });
      if (updated) {
        window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        const activeTid = window.localStorage.getItem("active_tenant_id");
        if (activeTid && activeTid.startsWith("usr-")) {
          window.localStorage.setItem("active_tenant_id", "tenant-royal-spice-01");
        }
      }
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
}
