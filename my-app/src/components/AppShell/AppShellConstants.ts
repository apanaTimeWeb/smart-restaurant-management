import type { AppShellNavGroup } from "@/components/AppShell/AppShellTypes";

export const APP_ROUTES = {
  // Admin Routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_RESERVATIONS: "/admin/reservations",
  ADMIN_MENU: "/admin/menu",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_STAFF: "/admin/staff",
  ADMIN_AUDIT: "/admin/audit",
  ADMIN_SHIFT: "/admin/shift",
  ADMIN_BACKUP: "/admin/data",
  ADMIN_QR: "/admin/qr",
  ADMIN_LIST_HOTEL: "/admin/list-hotel",

  // Hotel Owner Routes
  OWNER_DASHBOARD: "/hotel-owner/dashboard",
  OWNER_REPORTS: "/hotel-owner/reports",
  OWNER_RESERVATIONS: "/hotel-owner/reservations",
  OWNER_CREDENTIALS: "/hotel-owner/staff-credentials",
  OWNER_MENU: "/hotel-owner/menu",
  OWNER_INVENTORY: "/hotel-owner/inventory",
  OWNER_COUPONS: "/hotel-owner/coupons",
  OWNER_SETTINGS: "/hotel-owner/settings",
  OWNER_STAFF: "/hotel-owner/staff",
  OWNER_AUDIT: "/hotel-owner/audit",
  OWNER_SHIFT: "/hotel-owner/shift",
  OWNER_BACKUP: "/hotel-owner/data",
  OWNER_QR: "/hotel-owner/qr",
  OWNER_LIST_HOTEL: "/hotel-owner/list-hotel",

  // Cashier Routes
  CASHIER_DASHBOARD: "/cashier/dashboard",
  CASHIER_REPORTS: "/cashier/reports",
  CASHIER_BILLING: "/cashier",
  CASHIER_SHIFT: "/cashier/shift",

  // Waiter Routes
  WAITER_DASHBOARD: "/waiter/dashboard",
  WAITER_RESERVATIONS: "/waiter/reservations",
  WAITER: "/waiter",

  // Kitchen Routes
  KITCHEN: "/kitchen",
  KITCHEN_MENU: "/kitchen/menu",
  KITCHEN_INVENTORY: "/kitchen/inventory",

  // Customer Routes
  CUSTOMER_QR: "/customer",
  CUSTOMER_RESERVATIONS: "/customer/reservations",

  // Super Admin Routes
  SUPER_ADMIN: "/super-admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users",
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  SUPER_ADMIN_BILLING: "/super-admin/billing",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
  SUPER_ADMIN_ANALYTICS: "/super-admin/analytics",
  SUPER_ADMIN_HOTEL_LIST: "/super-admin/hotels",
  SUPER_ADMIN_SUBSCRIPTION_PLAN: "/super-admin/subscriptions",
  SUPER_ADMIN_BACKUP: "/super-admin/backup",
} as const;

export const APP_SHELL_NAV_GROUPS: AppShellNavGroup[] = [
  // ================= ADMIN & OWNER =================
  {
    groupLabel: null,
    items: [
      { id: "admin-dashboard", label: "Analytics Dashboard", href: APP_ROUTES.ADMIN_DASHBOARD, iconName: "BarChart3", allowedRoles: ["ADMIN"] },
      { id: "owner-dashboard", label: "Analytics Dashboard", href: APP_ROUTES.OWNER_DASHBOARD, iconName: "BarChart3", allowedRoles: ["HOTEL_OWNER"] },
      { id: "super-admin", label: "Super Admin Portal", href: APP_ROUTES.SUPER_ADMIN, iconName: "ShieldCheck", allowedRoles: ["SUPER_ADMIN"] },
      
      { id: "admin-reports", label: "Reports & Analytics", href: APP_ROUTES.ADMIN_REPORTS, iconName: "PieChart", allowedRoles: ["ADMIN"] },
      { id: "owner-reports", label: "Reports & Analytics", href: APP_ROUTES.OWNER_REPORTS, iconName: "PieChart", allowedRoles: ["HOTEL_OWNER"] },
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
      { id: "owner-reservations", label: "Advance Reservations", href: APP_ROUTES.OWNER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["HOTEL_OWNER"] },
      { id: "waiter-reservations", label: "Advance Reservations", href: APP_ROUTES.WAITER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["WAITER"] },
      { id: "customer-reservations", label: "My Reservations", href: APP_ROUTES.CUSTOMER_RESERVATIONS, iconName: "CalendarCheck", allowedRoles: ["CUSTOMER"] },
    ],
  },
  {
    groupLabel: "Inventory & Menu",
    items: [
      { id: "admin-menu", label: "Menu & Item Master", href: APP_ROUTES.ADMIN_MENU, iconName: "UtensilsCrossed", allowedRoles: ["ADMIN"] },
      { id: "owner-menu", label: "Menu & Item Master", href: APP_ROUTES.OWNER_MENU, iconName: "UtensilsCrossed", allowedRoles: ["HOTEL_OWNER"] },
      { id: "kitchen-menu", label: "Menu & Item Master", href: APP_ROUTES.KITCHEN_MENU, iconName: "UtensilsCrossed", allowedRoles: ["KITCHEN"] },
      
      { id: "admin-inventory", label: "Stock Inventory", href: APP_ROUTES.ADMIN_INVENTORY, iconName: "Package", allowedRoles: ["ADMIN"] },
      { id: "owner-inventory", label: "Stock Inventory", href: APP_ROUTES.OWNER_INVENTORY, iconName: "Package", allowedRoles: ["HOTEL_OWNER"] },
      { id: "kitchen-inventory", label: "Stock Inventory", href: APP_ROUTES.KITCHEN_INVENTORY, iconName: "Package", allowedRoles: ["KITCHEN"] },
      
      { id: "admin-coupons", label: "Coupons & Discounts", href: APP_ROUTES.ADMIN_COUPONS, iconName: "Tag", allowedRoles: ["ADMIN"] },
      { id: "owner-coupons", label: "Coupons & Discounts", href: APP_ROUTES.OWNER_COUPONS, iconName: "Tag", allowedRoles: ["HOTEL_OWNER"] },
    ],
  },
  {
    groupLabel: "Admin & System",
    items: [
      { id: "admin-settings", label: "Restaurant Settings", href: APP_ROUTES.ADMIN_SETTINGS, iconName: "Sliders", allowedRoles: ["ADMIN"] },
      { id: "owner-settings", label: "Restaurant Settings", href: APP_ROUTES.OWNER_SETTINGS, iconName: "Sliders", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "admin-staff", label: "Staff Management", href: APP_ROUTES.ADMIN_STAFF, iconName: "Users", allowedRoles: ["ADMIN"] },
      { id: "owner-staff", label: "Staff Management", href: APP_ROUTES.OWNER_STAFF, iconName: "Users", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "owner-credentials", label: "Staff Credentials", href: APP_ROUTES.OWNER_CREDENTIALS, iconName: "Key", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "admin-audit", label: "Permissions & Audit Logs", href: APP_ROUTES.ADMIN_AUDIT, iconName: "ShieldCheck", allowedRoles: ["ADMIN"] },
      { id: "owner-audit", label: "Permissions & Audit Logs", href: APP_ROUTES.OWNER_AUDIT, iconName: "ShieldCheck", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "admin-shift", label: "Shift & Day-Close", href: APP_ROUTES.ADMIN_SHIFT, iconName: "Timer", allowedRoles: ["ADMIN"] },
      { id: "owner-shift", label: "Shift & Day-Close", href: APP_ROUTES.OWNER_SHIFT, iconName: "Timer", allowedRoles: ["HOTEL_OWNER"] },
      { id: "cashier-shift", label: "Shift & Day-Close", href: APP_ROUTES.CASHIER_SHIFT, iconName: "Timer", allowedRoles: ["CASHIER"] },
      
      { id: "admin-backup", label: "Data Backup & Restore", href: APP_ROUTES.ADMIN_BACKUP, iconName: "HardDrive", allowedRoles: ["ADMIN"] },
      { id: "owner-backup", label: "Data Backup & Restore", href: APP_ROUTES.OWNER_BACKUP, iconName: "HardDrive", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "admin-qr-gen", label: "Table QR Generator", href: APP_ROUTES.ADMIN_QR, iconName: "QrCode", allowedRoles: ["ADMIN"] },
      { id: "owner-qr-gen", label: "Table QR Generator", href: APP_ROUTES.OWNER_QR, iconName: "QrCode", allowedRoles: ["HOTEL_OWNER"] },
      
      { id: "admin-list-hotel", label: "List Your Hotel", href: APP_ROUTES.ADMIN_LIST_HOTEL, iconName: "MapPin", allowedRoles: ["ADMIN"] },
      { id: "owner-list-hotel", label: "List Your Hotel", href: APP_ROUTES.OWNER_LIST_HOTEL, iconName: "MapPin", allowedRoles: ["HOTEL_OWNER"] },
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
