// RESPONSIBILITY: All TypeScript types for the Admin Dashboard + Menu CRUD module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: AdminTypes.ts → imported by useAdminDashboard, AdminKpiGrid,
//            AdminRevenueChart, AdminPaymentDonut, useAdminMenu, AdminMenuTable,
//            AdminMenuFormModal, AdminRecipeEditor, AdminComboEditor, admin pages

import type { LucideIcon } from "lucide-react";
import type { AppMenuItem, AppCombo, AppInventoryItem, KitchenStation } from "@/types/appTypes";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

export interface AdminKpiCardData {
  id:       string;
  label:    string;
  value:    string;
  icon:     LucideIcon;
  trend?:   string;
  trendUp?: boolean;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface AdminDailyStat {
  date:       string; // "DD MMM" display format e.g. "25 Jul"
  revenue:    number;
  orderCount: number;
}

export interface AdminPaymentSplit {
  cash:  number;
  upi:   number;
  card:  number;
  split: number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface AdminKpiGridProps {
  cards: AdminKpiCardData[];
}

export interface AdminRevenueChartProps {
  dailyStats: AdminDailyStat[];
}

export interface AdminPaymentDonutProps {
  paymentSplit:      AdminPaymentSplit;
  totalTransactions: number;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseAdminDashboardReturn {
  kpiCards:          AdminKpiCardData[];
  dailyStats:        AdminDailyStat[];
  paymentSplit:      AdminPaymentSplit;
  totalTransactions: number;
}

// ─── Menu CRUD Types ──────────────────────────────────────────────────────────

// Zod-validated form values for add/edit menu item
export interface AdminMenuFormValues {
  name:        string;
  price:       number;
  category:    string;
  station:     KitchenStation;
  isAvailable: boolean;
  isSpecial:   boolean;
  variants:    { name: string; price: number }[];
}

// Delete confirm dialog state
export interface AdminDeleteConfirm {
  type:  "menu" | "combo";
  id:    string;
  label: string;
}

// useAdminMenu hook return shape
export interface UseAdminMenuReturn {
  menuItems:      AppMenuItem[];
  combos:         AppCombo[];
  inventoryItems: AppInventoryItem[];
  isSubmitting:   boolean;
  addMenuItem:    (values: AdminMenuFormValues) => void;
  updateMenuItem: (id: string, values: AdminMenuFormValues) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addCombo:       (combo: Omit<AppCombo, "id">) => void;
  updateCombo:    (id: string, updates: Omit<AppCombo, "id">) => void;
  deleteCombo:    (id: string) => void;
  saveRecipe:     (itemId: string, recipe: AppMenuItem["recipe"]) => void;
}

// AdminMenuTable props
export interface AdminMenuTableProps {
  menuItems:          AppMenuItem[];
  onEdit:             (item: AppMenuItem) => void;
  onDelete:           (id: string, name: string) => void;
  onToggleAvailability: (id: string) => void;
}

// AdminMenuFormModal props
export interface AdminMenuFormModalProps {
  isOpen:         boolean;
  editItem:       AppMenuItem | null;
  inventoryItems: AppInventoryItem[];
  onSave:         (values: AdminMenuFormValues) => void;
  onSaveRecipe:   (itemId: string, recipe: AppMenuItem["recipe"]) => void;
  onClose:        () => void;
}

// AdminRecipeEditor props
export interface AdminRecipeEditorProps {
  itemId:         string;
  currentRecipe:  AppMenuItem["recipe"];
  inventoryItems: AppInventoryItem[];
  onSave:         (recipe: AppMenuItem["recipe"]) => void;
}

// AdminComboEditor props
export interface AdminComboEditorProps {
  combos:    AppCombo[];
  menuItems: AppMenuItem[];
  onAdd:     (combo: Omit<AppCombo, "id">) => void;
  onUpdate:  (id: string, updates: Omit<AppCombo, "id">) => void;
  onDelete:  (id: string, name: string) => void;
}

// ─── Inventory Types ──────────────────────────────────────────────────────────

export interface UseAdminInventoryReturn {
  inventoryItems: AppInventoryItem[];
  lowStockItems:  AppInventoryItem[];
  expiringItems:  AppInventoryItem[];
  updateStock:    (id: string, newQty: number) => void;
  addInventoryItem: (item: Omit<AppInventoryItem, "id">) => void;
  deleteInventoryItem: (id: string) => void;
  updateExpiryDate: (id: string, newDate: string) => void;
}

export interface AdminInventoryTableProps {
  inventoryItems: AppInventoryItem[];
  onUpdateStock:  (id: string, newQty: number) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateExpiry: (id: string, newDate: string) => void;
}

// ─── Shift Types ──────────────────────────────────────────────────────────────

import type { AppShiftRegister, AppSalesRecord } from "@/types/appTypes";

export interface AdminShiftOpenFormValues {
  openingCash: number;
}

export interface AdminShiftCloseFormValues {
  closingCash: number;
}

export interface UseAdminShiftReturn {
  shift:        AppShiftRegister | null;
  isOpen:       boolean;
  isSubmitting: boolean;
  salesHistory: AppSalesRecord[];
  openShift:    (openingCash: number) => void;
  closeShift:   (closingCash: number) => void;
}

export interface AdminShiftReportProps {
  shift:        AppShiftRegister;
  salesHistory: AppSalesRecord[];
}

// ─── Audit Log Types ──────────────────────────────────────────────────────────

import type { AppAuditLog } from "@/types/appTypes";

export interface AdminAuditLogTableProps {
  auditLogs: AppAuditLog[];
}

// ─── QR Generator Types ──────────────────────────────────────────────────────

import type { AppTable } from "@/types/appTypes";

export interface AdminQrGeneratorProps {
  tables: AppTable[];
  tenantId: string;
}

// ─── Data Backup / Restore Types ──────────────────────────────────────────────────

export interface AdminStorageUsage {
  usedKb:        number;
  limitKb:       number;
  usagePercent:  number; // 0–100
}

export interface UseAdminDataReturn {
  storageUsage:   AdminStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  exportBackup:   () => void;
  importRestore:  (file: File) => Promise<void>;
  emergencyReset: (pin: string) => boolean; // returns false if PIN wrong
}

export interface AdminDataPanelProps {
  storageUsage:   AdminStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  onExport:       () => void;
  onImport:       (file: File) => Promise<void>;
  onReset:        (pin: string) => boolean;
}
