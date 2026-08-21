// RESPONSIBILITY: All TypeScript types for the Owner Dashboard + Menu CRUD module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: OwnerTypes.ts → imported by useOwnerDashboard, OwnerKpiGrid,
//            OwnerRevenueChart, OwnerPaymentDonut, useOwnerMenu, OwnerMenuTable,
//            OwnerMenuFormModal, OwnerRecipeEditor, OwnerComboEditor, admin pages

import type { LucideIcon } from "lucide-react";
import type { AppMenuItem, AppCombo, AppInventoryItem, KitchenStation } from "@/types/appTypes";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

export interface OwnerKpiCardData {
  id:       string;
  label:    string;
  value:    string;
  icon:     LucideIcon;
  trend?:   string;
  trendUp?: boolean;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface OwnerDailyStat {
  date:       string; // "DD MMM" display format e.g. "25 Jul"
  revenue:    number;
  orderCount: number;
}

export interface OwnerPaymentSplit {
  cash:  number;
  upi:   number;
  card:  number;
  split: number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface OwnerKpiGridProps {
  cards: OwnerKpiCardData[];
}

export interface OwnerRevenueChartProps {
  dailyStats: OwnerDailyStat[];
}

export interface OwnerPaymentDonutProps {
  paymentSplit:      OwnerPaymentSplit;
  totalTransactions: number;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseOwnerDashboardReturn {
  kpiCards:          OwnerKpiCardData[];
  dailyStats:        OwnerDailyStat[];
  paymentSplit:      OwnerPaymentSplit;
  totalTransactions: number;
}

// ─── Menu CRUD Types ──────────────────────────────────────────────────────────

// Zod-validated form values for add/edit menu item
export interface OwnerMenuFormValues {
  name:        string;
  price:       number;
  category:    string;
  station:     KitchenStation;
  isAvailable: boolean;
  isSpecial:   boolean;
  variants:    { name: string; price: number }[];
}

// Delete confirm dialog state
export interface OwnerDeleteConfirm {
  type:  "menu" | "combo";
  id:    string;
  label: string;
}

// useOwnerMenu hook return shape
export interface UseOwnerMenuReturn {
  menuItems:      AppMenuItem[];
  combos:         AppCombo[];
  inventoryItems: AppInventoryItem[];
  isSubmitting:   boolean;
  addMenuItem:    (values: OwnerMenuFormValues) => void;
  updateMenuItem: (id: string, values: OwnerMenuFormValues) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addCombo:       (combo: Omit<AppCombo, "id">) => void;
  updateCombo:    (id: string, updates: Omit<AppCombo, "id">) => void;
  deleteCombo:    (id: string) => void;
  saveRecipe:     (itemId: string, recipe: AppMenuItem["recipe"]) => void;
}

// OwnerMenuTable props
export interface OwnerMenuTableProps {
  menuItems:          AppMenuItem[];
  onEdit:             (item: AppMenuItem) => void;
  onDelete:           (id: string, name: string) => void;
  onToggleAvailability: (id: string) => void;
}

// OwnerMenuFormModal props
export interface OwnerMenuFormModalProps {
  isOpen:         boolean;
  editItem:       AppMenuItem | null;
  inventoryItems: AppInventoryItem[];
  onSave:         (values: OwnerMenuFormValues) => void;
  onSaveRecipe:   (itemId: string, recipe: AppMenuItem["recipe"]) => void;
  onClose:        () => void;
}

// OwnerRecipeEditor props
export interface OwnerRecipeEditorProps {
  itemId:         string;
  currentRecipe:  AppMenuItem["recipe"];
  inventoryItems: AppInventoryItem[];
  onSave:         (recipe: AppMenuItem["recipe"]) => void;
}

// OwnerComboEditor props
export interface OwnerComboEditorProps {
  combos:    AppCombo[];
  menuItems: AppMenuItem[];
  onAdd:     (combo: Omit<AppCombo, "id">) => void;
  onUpdate:  (id: string, updates: Omit<AppCombo, "id">) => void;
  onDelete:  (id: string, name: string) => void;
}

// ─── Inventory Types ──────────────────────────────────────────────────────────

export interface UseOwnerInventoryReturn {
  inventoryItems: AppInventoryItem[];
  lowStockItems:  AppInventoryItem[];
  expiringItems:  AppInventoryItem[];
  updateStock:    (id: string, newQty: number) => void;
  addInventoryItem: (item: Omit<AppInventoryItem, "id">) => void;
  deleteInventoryItem: (id: string) => void;
  updateExpiryDate: (id: string, newDate: string) => void;
}

export interface OwnerInventoryTableProps {
  inventoryItems: AppInventoryItem[];
  onUpdateStock:  (id: string, newQty: number) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateExpiry: (id: string, newDate: string) => void;
}

// ─── Shift Types ──────────────────────────────────────────────────────────────

import type { AppShiftRegister, AppSalesRecord } from "@/types/appTypes";

export interface OwnerShiftOpenFormValues {
  openingCash: number;
}

export interface OwnerShiftCloseFormValues {
  closingCash: number;
}

export interface UseOwnerShiftReturn {
  shift:        AppShiftRegister | null;
  isOpen:       boolean;
  isSubmitting: boolean;
  salesHistory: AppSalesRecord[];
  openShift:    (openingCash: number) => void;
  closeShift:   (closingCash: number) => void;
}

export interface OwnerShiftReportProps {
  shift:        AppShiftRegister;
  salesHistory: AppSalesRecord[];
}

// ─── Audit Log Types ──────────────────────────────────────────────────────────

import type { AppAuditLog } from "@/types/appTypes";

export interface OwnerAuditLogTableProps {
  auditLogs: AppAuditLog[];
}

// ─── QR Generator Types ──────────────────────────────────────────────────────

import type { AppTable } from "@/types/appTypes";

export interface OwnerQrGeneratorProps {
  tables: AppTable[];
  tenantId: string;
}

// ─── Data Backup / Restore Types ──────────────────────────────────────────────────

export interface OwnerStorageUsage {
  usedKb:        number;
  limitKb:       number;
  usagePercent:  number; // 0–100
}

export interface UseOwnerDataReturn {
  storageUsage:   OwnerStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  exportBackup:   () => void;
  importRestore:  (file: File) => Promise<void>;
  emergencyReset: (pin: string) => boolean; // returns false if PIN wrong
}

export interface OwnerDataPanelProps {
  storageUsage:   OwnerStorageUsage;
  isExporting:    boolean;
  isImporting:    boolean;
  isResetting:    boolean;
  onExport:       () => void;
  onImport:       (file: File) => Promise<void>;
  onReset:        (pin: string) => boolean;
}
