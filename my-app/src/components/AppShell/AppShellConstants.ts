import type { AppShellNavGroup } from "@/components/AppShell/AppShellTypes";

import { ADMIN_ROUTES } from "@/app/admin/admin_url_config";
import { OWNER_ROUTES } from "@/app/manager/manager_url_config";
import { CASHIER_ROUTES } from "@/app/cashier/cashier_url_config";
import { WAITER_ROUTES } from "@/app/waiter/waiter_url_config";
import { KITCHEN_ROUTES } from "@/app/kitchen/kitchen_url_config";
import { CUSTOMER_ROUTES } from "@/app/customer/customer_url_config";
import { SUPER_ADMIN_ROUTES } from "@/app/super-admin/super-admin_url_config";

export const APP_ROUTES = {
  // Admin Routes
  ADMIN_DASHBOARD: ADMIN_ROUTES.DASHBOARD,
  ADMIN_REPORTS: ADMIN_ROUTES.REPORTS,
  ADMIN_RESERVATIONS: ADMIN_ROUTES.RESERVATIONS,
  ADMIN_MENU: ADMIN_ROUTES.MENU,
  ADMIN_INVENTORY: ADMIN_ROUTES.INVENTORY,
  ADMIN_COUPONS: ADMIN_ROUTES.COUPONS,
  ADMIN_SETTINGS: ADMIN_ROUTES.SETTINGS,
  ADMIN_STAFF: ADMIN_ROUTES.STAFF,
  ADMIN_AUDIT: ADMIN_ROUTES.AUDIT,
  ADMIN_SHIFT: ADMIN_ROUTES.SHIFT,
  ADMIN_BACKUP: ADMIN_ROUTES.BACKUP,
  ADMIN_QR: ADMIN_ROUTES.QR,
  ADMIN_LIST_HOTEL: ADMIN_ROUTES.LIST_HOTEL,

  // Hotel Owner Routes
  OWNER_DASHBOARD: OWNER_ROUTES.DASHBOARD,
  OWNER_REPORTS: OWNER_ROUTES.REPORTS,
  OWNER_RESERVATIONS: OWNER_ROUTES.RESERVATIONS,
  OWNER_CREDENTIALS: OWNER_ROUTES.CREDENTIALS,
  OWNER_MENU: OWNER_ROUTES.MENU,
  OWNER_INVENTORY: OWNER_ROUTES.INVENTORY,
  OWNER_COUPONS: OWNER_ROUTES.COUPONS,
  OWNER_SETTINGS: OWNER_ROUTES.SETTINGS,
  OWNER_STAFF: OWNER_ROUTES.STAFF,
  OWNER_AUDIT: OWNER_ROUTES.AUDIT,
  OWNER_SHIFT: OWNER_ROUTES.SHIFT,
  OWNER_BACKUP: OWNER_ROUTES.BACKUP,
  OWNER_QR: OWNER_ROUTES.QR,
  OWNER_LIST_HOTEL: OWNER_ROUTES.LIST_HOTEL,

  // Cashier Routes
  CASHIER_DASHBOARD: CASHIER_ROUTES.DASHBOARD,
  CASHIER_REPORTS: CASHIER_ROUTES.REPORTS,
  CASHIER_BILLING: CASHIER_ROUTES.BILLING,
  CASHIER_SHIFT: CASHIER_ROUTES.SHIFT,

  // Waiter Routes
  WAITER_DASHBOARD: WAITER_ROUTES.DASHBOARD,
  WAITER_RESERVATIONS: WAITER_ROUTES.RESERVATIONS,
  WAITER: WAITER_ROUTES.BASE,

  // Kitchen Routes
  KITCHEN: KITCHEN_ROUTES.BASE,
  KITCHEN_MENU: KITCHEN_ROUTES.MENU,
  KITCHEN_INVENTORY: KITCHEN_ROUTES.INVENTORY,

  // Customer Routes
  CUSTOMER_QR: CUSTOMER_ROUTES.QR,
  CUSTOMER_RESERVATIONS: CUSTOMER_ROUTES.RESERVATIONS,

  // Super Admin Routes
  SUPER_ADMIN: SUPER_ADMIN_ROUTES.DASHBOARD,
  SUPER_ADMIN_USERS: SUPER_ADMIN_ROUTES.USERS,
  SUPER_ADMIN_AUDIT: SUPER_ADMIN_ROUTES.AUDIT,
  SUPER_ADMIN_BILLING: SUPER_ADMIN_ROUTES.BILLING,
  SUPER_ADMIN_SETTINGS: SUPER_ADMIN_ROUTES.SETTINGS,
  SUPER_ADMIN_ANALYTICS: SUPER_ADMIN_ROUTES.ANALYTICS,
  SUPER_ADMIN_HOTEL_LIST: SUPER_ADMIN_ROUTES.HOTEL_LIST,
  SUPER_ADMIN_SUBSCRIPTION_PLAN: SUPER_ADMIN_ROUTES.SUBSCRIPTION_PLAN,
  SUPER_ADMIN_BACKUP: SUPER_ADMIN_ROUTES.BACKUP,
} as const;

export const APP_SHELL_NAV_GROUPS: AppShellNavGroup[] = [
  // ================= ADMIN & OWNER =================
  {
    groupLabel: null,
    items: [
      { id: "admin-dashboard", label: "Analytics Dashboard", href: APP_ROUTES.ADMIN_DASHBOARD, iconName: "BarChart3", allowedRoles: ["ADMIN"] },
      { id: "owner-dashboard", label: "Analytics Dashboard", href: APP_ROUTES.OWNER_DASHBOARD, iconName: "BarChart3", allowedRoles: ["MANAGER"] },
      { id: "super-admin", label: "Super Admin Portal", href: APP_ROUTES.SUPER_ADMIN, iconName: "ShieldCheck", allowedRoles: ["SUPER_ADMIN"] },
      
      { id: "admin-reports", label: "Reports & Analytics", href: APP_ROUTES.ADMIN_REPORTS, iconName: "PieChart", allowedRoles: ["ADMIN"] },
      { id: "owner-reports", label: "Reports & Analytics", href: APP_ROUTES.OWNER_REPORTS, iconName: "PieChart", allowedRoles: ["MANAGER"] },
    ],
  },
  {
    groupLabel: "Operations",
    items: [
      { id: "waiter-ops", label: "Waiter / Floor Captain", href: APP_ROUTES.WAITER, iconName: "Bell", allowedRoles: ["WAITER"] },
      { id: "kitchen-ops", label: "Kitchen KDS Terminal", href: APP_ROUTES.KITCHEN, iconName: "ChefHat", allowedRoles: ["KITCHEN"] },
      
      { id: "cashier-dashboard", label: "Cashier Dashboard", href: APP_ROUTES.CASHIER_DASHBOARD, iconName: "BarChart3", allowedRoles: ["CASHIER"] },
      { id: "cashier-billing", label: "Cashier Billing POS", href: APP_ROUTES.CASHIER_BILLING, iconName: "CreditCard", allowedRoles: ["CASHIER"] },
      { id: "cashier-reports", label: "Cashier Reports", href: APP_ROUTES.CASHIER_REPORTS, iconName: "PieChart", allowedRoles: ["CASHIER"] },
      
      { id: "waiter-dashboard", label: "Waiter Dashboard", href: APP_ROUTES.WAITER_DASHBOARD, iconName: "BarChart3", allowedRoles: ["WAITER"] },

      { id: "customer-qr", label: "Customer QR View", href: APP_ROUTES.CUSTOMER_QR, iconName: "QrCode", allowedRoles: ["CUSTOMER"] },
    ],
  },
  {
    groupLabel: "Tables & Reservations",
    items: [
      { id: "admin-reservations", label: "Advance Reservations", href: APP_ROUTES.ADMIN_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["ADMIN"] },
      { id: "owner-reservations", label: "Advance Reservations", href: APP_ROUTES.OWNER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["MANAGER"] },
      { id: "waiter-reservations", label: "Advance Reservations", href: APP_ROUTES.WAITER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["WAITER"] },
      { id: "customer-reservations", label: "My Reservations", href: APP_ROUTES.CUSTOMER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["CUSTOMER"] },
    ],
  },
  {
    groupLabel: "Inventory & Menu",
    items: [
      { id: "admin-menu", label: "Menu & Item Master", href: APP_ROUTES.ADMIN_MENU, iconName: "UtensilsCrossed", allowedRoles: ["ADMIN"] },
      { id: "owner-menu", label: "Menu & Item Master", href: APP_ROUTES.OWNER_MENU, iconName: "UtensilsCrossed", allowedRoles: ["MANAGER"] },
      { id: "kitchen-menu", label: "Menu & Item Master", href: APP_ROUTES.KITCHEN_MENU, iconName: "UtensilsCrossed", allowedRoles: ["KITCHEN"] },
      
      { id: "admin-inventory", label: "Stock Inventory", href: APP_ROUTES.ADMIN_INVENTORY, iconName: "Package", allowedRoles: ["ADMIN"] },
      { id: "owner-inventory", label: "Stock Inventory", href: APP_ROUTES.OWNER_INVENTORY, iconName: "Package", allowedRoles: ["MANAGER"] },
      { id: "kitchen-inventory", label: "Stock Inventory", href: APP_ROUTES.KITCHEN_INVENTORY, iconName: "Package", allowedRoles: ["KITCHEN"] },
      
      { id: "admin-coupons", label: "Coupons & Discounts", href: APP_ROUTES.ADMIN_COUPONS, iconName: "Tag", allowedRoles: ["ADMIN"] },
      { id: "owner-coupons", label: "Coupons & Discounts", href: APP_ROUTES.OWNER_COUPONS, iconName: "Tag", allowedRoles: ["MANAGER"] },
    ],
  },
  {
    groupLabel: "Admin & System",
    items: [
      { id: "admin-settings", label: "Restaurant Settings", href: APP_ROUTES.ADMIN_SETTINGS, iconName: "Sliders", allowedRoles: ["ADMIN"] },
      { id: "owner-settings", label: "Restaurant Settings", href: APP_ROUTES.OWNER_SETTINGS, iconName: "Sliders", allowedRoles: ["MANAGER"] },
      
      { id: "admin-staff", label: "Staff Management", href: APP_ROUTES.ADMIN_STAFF, iconName: "Users", allowedRoles: ["ADMIN"] },
      { id: "owner-staff", label: "Staff Management", href: APP_ROUTES.OWNER_STAFF, iconName: "Users", allowedRoles: ["MANAGER"] },
      
      { id: "owner-credentials", label: "Staff Credentials", href: APP_ROUTES.OWNER_CREDENTIALS, iconName: "Key", allowedRoles: ["MANAGER"] },
      
      { id: "admin-audit", label: "Permissions & Audit Logs", href: APP_ROUTES.ADMIN_AUDIT, iconName: "ShieldCheck", allowedRoles: ["ADMIN"] },
      { id: "owner-audit", label: "Permissions & Audit Logs", href: APP_ROUTES.OWNER_AUDIT, iconName: "ShieldCheck", allowedRoles: ["MANAGER"] },
      
      { id: "admin-shift", label: "Shift & Day-Close", href: APP_ROUTES.ADMIN_SHIFT, iconName: "Timer", allowedRoles: ["ADMIN"] },
      { id: "owner-shift", label: "Shift & Day-Close", href: APP_ROUTES.OWNER_SHIFT, iconName: "Timer", allowedRoles: ["MANAGER"] },
      { id: "cashier-shift", label: "Shift & Day-Close", href: APP_ROUTES.CASHIER_SHIFT, iconName: "Timer", allowedRoles: ["CASHIER"] },
      
      { id: "admin-backup", label: "Data Backup & Restore", href: APP_ROUTES.ADMIN_BACKUP, iconName: "HardDrive", allowedRoles: ["ADMIN"] },
      { id: "owner-backup", label: "Data Backup & Restore", href: APP_ROUTES.OWNER_BACKUP, iconName: "HardDrive", allowedRoles: ["MANAGER"] },
      
      { id: "admin-qr-gen", label: "Table QR Generator", href: APP_ROUTES.ADMIN_QR, iconName: "QrCode", allowedRoles: ["ADMIN"] },
      { id: "owner-qr-gen", label: "Table QR Generator", href: APP_ROUTES.OWNER_QR, iconName: "QrCode", allowedRoles: ["MANAGER"] },
      
      { id: "admin-list-hotel", label: "List Your Hotel", href: APP_ROUTES.ADMIN_LIST_HOTEL, iconName: "MapPin", allowedRoles: ["ADMIN"] },
      { id: "owner-list-hotel", label: "List Your Hotel", href: APP_ROUTES.OWNER_LIST_HOTEL, iconName: "MapPin", allowedRoles: ["MANAGER"] },
    ],
  },
  // ================= SUPER ADMIN =================
  {
    groupLabel: "Super Admin",
    items: [
      { id: "sa-dashboard", label: "Dashboard", href: APP_ROUTES.SUPER_ADMIN, iconName: "ShieldCheck", allowedRoles: ["SUPER_ADMIN"] },
      { id: "sa-hotels", label: "Hotel List", href: APP_ROUTES.SUPER_ADMIN_HOTEL_LIST, iconName: "Building2", allowedRoles: ["SUPER_ADMIN"] },
      { id: "sa-subscriptions", label: "Subscription Plan", href: APP_ROUTES.SUPER_ADMIN_SUBSCRIPTION_PLAN, iconName: "Layers", allowedRoles: ["SUPER_ADMIN"] },
      { id: "sa-backup", label: "Backup", href: APP_ROUTES.SUPER_ADMIN_BACKUP, iconName: "HardDrive", allowedRoles: ["SUPER_ADMIN"] },
      { id: "sa-settings", label: "Settings", href: APP_ROUTES.SUPER_ADMIN_SETTINGS, iconName: "Sliders", allowedRoles: ["SUPER_ADMIN"] },
    ],
  },
];

export const APP_SHELL_DEFAULT_BRANCH = "Main Branch";
