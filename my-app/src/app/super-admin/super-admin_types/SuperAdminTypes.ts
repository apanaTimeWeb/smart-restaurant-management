// RESPONSIBILITY: All TypeScript types for the SuperAdmin Dashboard + Menu CRUD module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: SuperAdminTypes.ts → imported by useSuperAdminDashboard, SuperAdminKpiGrid,
//            SuperAdminRevenueChart, SuperAdminPaymentDonut, useSuperAdminMenu, SuperAdminMenuTable,
//            SuperAdminMenuFormModal, SuperAdminRecipeEditor, SuperAdminComboEditor, admin pages

import type { LucideIcon } from "lucide-react";
import type { AppMenuItem, AppCombo, AppInventoryItem, KitchenStation } from "@/types/appTypes";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

export interface SuperAdminKpiCardData {
  id:       string;
  label:    string;
  value:    string;
  icon:     LucideIcon;
  trend?:   string;
  trendUp?: boolean;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface SuperAdminDailyStat {
  date:       string; // "DD MMM" display format e.g. "25 Jul"
  revenue:    number;
  orderCount: number;
}

export interface SuperAdminPaymentSplit {
  cash:  number;
  upi:   number;
  card:  number;
  split: number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface SuperAdminKpiGridProps {
  cards: SuperAdminKpiCardData[];
}

export interface SuperAdminRevenueChartProps {
  dailyStats: SuperAdminDailyStat[];
}

export interface SuperAdminPaymentDonutProps {
  paymentSplit:      SuperAdminPaymentSplit;
  totalTransactions: number;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseSuperAdminDashboardReturn {
  kpiCards:          SuperAdminKpiCardData[];
  dailyStats:        SuperAdminDailyStat[];
  paymentSplit:      SuperAdminPaymentSplit;
  totalTransactions: number;
}

// ─── Menu CRUD Types ──────────────────────────────────────────────────────────

// Zod-validated form values for add/edit menu item
export interface SuperAdminMenuFormValues {
  name:        string;
  price:       number;
  category:    string;
  station:     KitchenStation;
  isAvailable: boolean;
  isSpecial:   boolean;
  variants:    { name: string; price: number }[];
}

// Delete confirm dialog state
export interface SuperAdminDeleteConfirm {
  type:  "menu" | "combo";
  id:    string;
  label: string;
}

// useSuperAdminMenu hook return shape
export interface UseSuperAdminMenuReturn {
  menuItems:      AppMenuItem[];
  combos:         AppCombo[];
  inventoryItems: AppInventoryItem[];
  isSubmitting:   boolean;
  addMenuItem:    (values: SuperAdminMenuFormValues) => void;
  updateMenuItem: (id: string, values: SuperAdminMenuFormValues) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addCombo:       (combo: Omit<AppCombo, "id">) => void;
  updateCombo:    (id: string, updates: Omit<AppCombo, "id">) => void;
  deleteCombo:    (id: string) => void;
  saveRecipe:     (itemId: string, recipe: AppMenuItem["recipe"]) => void;
}

// SuperAdminMenuTable props
export interface SuperAdminMenuTableProps {
  menuItems:          AppMenuItem[];
  onEdit:             (item: AppMenuItem) => void;
  onDelete:           (id: string, name: string) => void;
  onToggleAvailability: (id: string) => void;
}

// SuperAdminMenuFormModal props
export interface SuperAdminMenuFormModalProps {
  isOpen:         boolean;
  editItem:       AppMenuItem | null;
  inventoryItems: AppInventoryItem[];
  onSave:         (values: SuperAdminMenuFormValues) => void;
  onSaveRecipe:   (itemId: string, recipe: AppMenuItem["recipe"]) => void;
  onClose:        () => void;
}

// SuperAdminRecipeEditor props
export interface SuperAdminRecipeEditorProps {
  itemId:         string;
  currentRecipe:  AppMenuItem["recipe"];
  inventoryItems: AppInventoryItem[];
  onSave:         (recipe: AppMenuItem["recipe"]) => void;
}

// SuperAdminComboEditor props
export interface SuperAdminComboEditorProps {
  combos:    AppCombo[];
  menuItems: AppMenuItem[];
  onAdd:     (combo: Omit<AppCombo, "id">) => void;
  onUpdate:  (id: string, updates: Omit<AppCombo, "id">) => void;
  onDelete:  (id: string, name: string) => void;
}

// ─── Inventory Types ──────────────────────────────────────────────────────────

export interface UseSuperAdminInventoryReturn {
  inventoryItems: AppInventoryItem[];
  lowStockItems:  AppInventoryItem[];
  expiringItems:  AppInventoryItem[];
  updateStock:    (id: string, newQty: number) => void;
  addInventoryItem: (item: Omit<AppInventoryItem, "id">) => void;
  deleteInventoryItem: (id: string) => void;
  updateExpiryDate: (id: string, newDate: string) => void;
}

export interface SuperAdminInventoryTableProps {
  inventoryItems: AppInventoryItem[];
  onUpdateStock:  (id: string, newQty: number) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateExpiry: (id: string, newDate: string) => void;
}

// ─── Shift Types ──────────────────────────────────────────────────────────────

import type { AppShiftRegister, AppSalesRecord } from "@/types/appTypes";

export interface SuperAdminShiftOpenFormValues {
  openingCash: number;
}

export interface SuperAdminShiftCloseFormValues {
  closingCash: number;
}

export interface UseSuperAdminShiftReturn {
  shift:        AppShiftRegister | null;
  isOpen:       boolean;
  isSubmitting: boolean;
  salesHistory: AppSalesRecord[];
  openShift:    (openingCash: number) => void;
  closeShift:   (closingCash: number) => void;
}

export interface SuperAdminShiftReportProps {
  shift:        AppShiftRegister;
  salesHistory: AppSalesRecord[];
}

// ─── Audit Log Types ──────────────────────────────────────────────────────────

import type { AppAuditLog } from "@/types/appTypes";

export interface SuperAdminAuditLogTableProps {
  auditLogs: AppAuditLog[];
}

// ─── QR Generator Types ──────────────────────────────────────────────────────

import type { AppTable } from "@/types/appTypes";

export interface SuperAdminQrGeneratorProps {
  tables: AppTable[];
  tenantId: string;
}

// ─── Data Backup / Restore Types ──────────────────────────────────────────────────

export interface SuperAdminStorageUsage {
  usedKb:        number;
  limitKb:       number;
  usagePercent:  number; // 0–100
}

export interface UseSuperAdminDataReturn {
  storageUsage:   SuperAdminStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  exportBackup:   () => void;
  importRestore:  (file: File) => Promise<void>;
  emergencyReset: (pin: string) => boolean; // returns false if PIN wrong
}

export interface SuperAdminDataPanelProps {
  storageUsage:   SuperAdminStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  onExport:       () => void;
  onImport:       (file: File) => Promise<void>;
  onReset:        (pin: string) => boolean;
}
