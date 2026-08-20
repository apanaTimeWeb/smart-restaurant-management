// RESPONSIBILITY: Single source of truth for all AppShell navigation data.
// Hardcoded now — tomorrow replace with API call in this file only, zero UI changes.
// DATA FLOW: AppShellConstants.ts → AppShellSidebar → AppShellSidebarNavItem

import type { AppShellNavGroup } from "@/components/AppShell/AppShellTypes";

// Structure.txt Rule 35: No magic strings — nav hrefs as constants
export const APP_ROUTES = {
  DASHBOARD:       "/admin/dashboard",
  REPORTS:         "/reports",
  WAITER:          "/waiter",
  KITCHEN:         "/kitchen",
  BILLING:         "/billing",
  CUSTOMER_QR:     "/customer",
  RESERVATIONS:    "/owner/reservations",
  MENU:            "/admin/menu",
  INVENTORY:       "/admin/inventory",
  STAFF_DASHBOARD: "/admin/dashboard",
  STAFF_MGMT:      "/admin/staff",
  AUDIT_LOGS:      "/admin/audit",
  SHIFT:           "/admin/shift",
  BACKUP:          "/admin/data",
  ADMIN_QR:        "/admin/qr",
  SETTINGS:        "/admin/settings",
  COUPONS:         "/admin/coupons",
  LIST_HOTEL:      "/admin/list-hotel",
  // Super Admin expanded routes
  SUPER_ADMIN:            "/super-admin/dashboard",
  SUPER_ADMIN_USERS:      "/super-admin/users",
  SUPER_ADMIN_AUDIT:      "/super-admin/audit",
  SUPER_ADMIN_BILLING:    "/super-admin/billing",
  SUPER_ADMIN_SETTINGS:   "/super-admin/settings",
  SUPER_ADMIN_ANALYTICS:  "/super-admin/analytics",
  SUPER_ADMIN_SUPPORT:    "/super-admin/support",
  // New Super Admin pages
  SUPER_ADMIN_HOTEL_LIST: "/super-admin/hotels",
  SUPER_ADMIN_SUBSCRIPTION_PLAN: "/super-admin/subscriptions",
  SUPER_ADMIN_BACKUP:     "/super-admin/backup",
  OWNER_DASHBOARD:        "/owner/dashboard",
} as const;

export const APP_SHELL_NAV_GROUPS: AppShellNavGroup[] = [
  {
    groupLabel: null,
    items: [
      { id: "analytics-dashboard", label: "Analytics Dashboard", href: APP_ROUTES.DASHBOARD, iconName: "BarChart3", allowedRoles: ["ADMIN", "HOTEL_OWNER", "CASHIER", "WAITER"] },
      { id: "super-admin", label: "Super Admin Portal", href: APP_ROUTES.SUPER_ADMIN, iconName: "ShieldCheck", allowedRoles: ["SUPER_ADMIN"] },
      { id: "reports", label: "Reports & Analytics", href: APP_ROUTES.REPORTS, iconName: "PieChart", allowedRoles: ["ADMIN", "HOTEL_OWNER", "CASHIER"] },
    ],
  },
  {
    groupLabel: "Operations",
    items: [
      { id: "waiter", label: "Waiter / Floor Captain", href: APP_ROUTES.WAITER, iconName: "Bell", allowedRoles: ["WAITER"] },
      { id: "kitchen", label: "Kitchen KDS Terminal", href: APP_ROUTES.KITCHEN, iconName: "ChefHat", allowedRoles: ["KITCHEN"] },
      { id: "billing", label: "Cashier Billing POS", href: APP_ROUTES.BILLING, iconName: "CreditCard", allowedRoles: ["CASHIER"] },
      { id: "customer-qr", label: "Customer QR View", href: APP_ROUTES.CUSTOMER_QR, iconName: "QrCode", allowedRoles: ["CUSTOMER"] },
    ],
  },
  {
    groupLabel: "Tables & Reservations",
    items: [
      { id: "reservations", label: "Advance Reservations", href: APP_ROUTES.RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["ADMIN", "HOTEL_OWNER", "WAITER", "CUSTOMER"] },
    ],
  },
  {
    groupLabel: "Inventory & Menu",
    items: [
      { id: "menu", label: "Menu & Item Master", href: APP_ROUTES.MENU, iconName: "UtensilsCrossed", allowedRoles: ["ADMIN", "HOTEL_OWNER", "KITCHEN"] },
      { id: "inventory", label: "Stock Inventory", href: APP_ROUTES.INVENTORY, iconName: "Package", allowedRoles: ["ADMIN", "HOTEL_OWNER", "KITCHEN"] },
      { id: "coupons", label: "Coupons & Discounts", href: APP_ROUTES.COUPONS, iconName: "Tag", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
    ],
  },
  {
    groupLabel: "Admin & System",
    items: [
      { id: "settings", label: "Restaurant Settings", href: APP_ROUTES.SETTINGS, iconName: "Sliders", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
      { id: "staff-mgmt", label: "Staff Management", href: APP_ROUTES.STAFF_MGMT, iconName: "Users", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
      { id: "audit-logs", label: "Permissions & Audit Logs", href: APP_ROUTES.AUDIT_LOGS, iconName: "ShieldCheck", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
      { id: "shift", label: "Shift & Day-Close", href: APP_ROUTES.SHIFT, iconName: "Timer", allowedRoles: ["ADMIN", "HOTEL_OWNER", "CASHIER"] },
      { id: "backup", label: "Data Backup & Restore", href: APP_ROUTES.BACKUP, iconName: "HardDrive", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
      { id: "admin-qr", label: "Table QR Generator", href: APP_ROUTES.ADMIN_QR, iconName: "QrCode", allowedRoles: ["ADMIN", "HOTEL_OWNER"] },
      { id: "list-hotel", label: "List Your Hotel", href: APP_ROUTES.LIST_HOTEL, iconName: "MapPin", allowedRoles: ["HOTEL_OWNER", "ADMIN"] },
    ],
  },
  // Super Admin navigation (ordered)
  {
    groupLabel: "Super Admin",
    items: [
      { id: "super-admin", label: "Dashboard", href: APP_ROUTES.SUPER_ADMIN, iconName: "ShieldCheck", allowedRoles: ["SUPER_ADMIN"] },
      { id: "super-admin-hotels", label: "Hotel List", href: APP_ROUTES.SUPER_ADMIN_HOTEL_LIST, iconName: "Building2", allowedRoles: ["SUPER_ADMIN"] },
      { id: "super-admin-subscriptions", label: "Subscription Plan", href: APP_ROUTES.SUPER_ADMIN_SUBSCRIPTION_PLAN, iconName: "Layers", allowedRoles: ["SUPER_ADMIN"] },
      { id: "super-admin-backup", label: "Backup", href: APP_ROUTES.SUPER_ADMIN_BACKUP, iconName: "HardDrive", allowedRoles: ["SUPER_ADMIN"] },
      { id: "super-admin-settings", label: "Settings", href: APP_ROUTES.SUPER_ADMIN_SETTINGS, iconName: "Sliders", allowedRoles: ["SUPER_ADMIN"] },
    ],
  },
];

// Branch name — hardcoded now, replace with API/context later
export const APP_SHELL_DEFAULT_BRANCH = "Main Branch";
