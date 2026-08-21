// RESPONSIBILITY: All TypeScript types for the Kitchen KDS module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: KitchenTypes.ts → imported by KitchenKotCard, KitchenKotGrid,
//            KitchenStatusPipeline, KitchenPrepTimeInput, useKitchenKds, kitchen/page.tsx

import type { AppKotItem, AppMenuItem, AppInventoryItem, KitchenStation, KotItemStatus, KotPriority, AppCombo } from "@/types/appTypes";

// ─── Station Tab Type (Rule 35: No magic strings) ─────────────────────────────

export type KitchenStationTab = "All" | KitchenStation;

// ─── Pipeline Step (maps KotItemStatus → 3-step UI pipeline) ─────────────────

export type KitchenPipelineStep = "PENDING" | "COOKING" | "READY";

// ─── Flattened KOT (orderId + tableNumber merged with KOT data) ───────────────

export interface KitchenFlatKot {
  kotId: string;
  orderId: string;
  tableNumber: string;
  station: KitchenStation;
  items: AppKotItem[];
  timestamp: number; // Unix ms — used for oldest-first sort
  priority?: KotPriority;
}

// ─── Completed KOT ─────────────────────────────────────────────────────────────

export interface KitchenCompletedKot {
  kotId: string;
  orderId: string;
  tableNumber: string;
  station: KitchenStation;
  items: AppKotItem[];
  timestamp: number;
  completedAt: number; // Unix ms when marked fully ready/completed
  priority?: KotPriority;
}

// ─── KPI Summary Metrics ──────────────────────────────────────────────────────

export interface KitchenKpiMetrics {
  totalActiveKots: number;
  urgentCount: number; // KOTs waiting > 15 mins
  avgPrepTimeMins: number;
  readyItemsCount: number;
  outOfStockCount: number;
}

// ─── Recipe Specification ──────────────────────────────────────────────────────

export interface KitchenRecipeSpec {
  itemId: string;
  name: string;
  station: KitchenStation;
  portionSize: string;
  prepTimeEstimateMins: number;
  ingredients: string[];
  instructions: string[];
  allergens: string[];
  spiceLevel?: "Mild" | "Medium" | "Spicy" | "Very Spicy";
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface KitchenKotCardProps {
  kot: KitchenFlatKot;
  onStatusChange: (kotId: string, itemId: string, newStatus: KitchenPipelineStep) => void;
  onBatchStatusChange: (kotId: string, targetStatus: KitchenPipelineStep) => void;
  onVoidDecision: (orderId: string, kotId: string, itemId: string, approved: boolean) => void;
  onItemPrepTimeSet: (orderId: string, kotId: string, itemId: string, mins: number) => void;
  onOpenRecipe: (itemId: string) => void;
  onOpenTicket: (kot: KitchenFlatKot) => void;
  onNotifyWaiter?: (kot: KitchenFlatKot) => void;
  savingKey: string; // "kotId-itemId" — which item is currently saving
}

export interface KitchenKotGridProps {
  kots: KitchenFlatKot[];
  onStatusChange: KitchenKotCardProps["onStatusChange"];
  onBatchStatusChange: KitchenKotCardProps["onBatchStatusChange"];
  onVoidDecision: KitchenKotCardProps["onVoidDecision"];
  onItemPrepTimeSet: KitchenKotCardProps["onItemPrepTimeSet"];
  onOpenRecipe: KitchenKotCardProps["onOpenRecipe"];
  onOpenTicket: KitchenKotCardProps["onOpenTicket"];
  onNotifyWaiter?: KitchenKotCardProps["onNotifyWaiter"];
  savingKey: string;
}

export interface KitchenKpiSummaryBarProps {
  metrics: KitchenKpiMetrics;
  isMuted: boolean;
  onToggleMute: () => void;
  onTestSound: () => void;
  onOpenAnalytics?: () => void;
  onSelectStockTab?: (stockFilter?: "OUT_OF_STOCK" | "IN_STOCK" | "ALL") => void;
}

export interface KitchenStatusPipelineProps {
  currentStatus: AppKotItem["status"];
  onStatusChange: (status: KitchenPipelineStep) => void;
  isDisabled: boolean;
}

export interface KitchenPrepTimeInputProps {
  currentMins: number;
  onSet: (mins: number) => void;
}

export interface KitchenRecipeModalProps {
  isOpen: boolean;
  itemId: string | null;
  onClose: () => void;
}

export interface KitchenTicketModalProps {
  isOpen: boolean;
  kot: KitchenFlatKot | null;
  onClose: () => void;
}

export interface KitchenAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface KitchenCompletedOrdersViewProps {
  completedKots: KitchenCompletedKot[];
  onRecallKot: (kotId: string) => void;
}

// ─── Stock Toggle Props ──────────────────────────────────────────────────────

export interface KitchenStockToggleProps {
  onOpenWasteLog: () => void;
  onOpenRecipe?: (itemId: string) => void;
  initialFilter?: "ALL" | "IN_STOCK" | "OUT_OF_STOCK";
}

// ─── Waste Log Modal Props ────────────────────────────────────────────────────

export interface KitchenWasteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Waste Log Form Values (Rule 7: types isolated) ──────────────────────────

export interface WasteLogFormValues {
  ingredientId: string;
  qty: number;
  reason: string;
}

// ─── useKitchenStock Return Shape ─────────────────────────────────────────────

export interface UseKitchenStockReturn {
  menuItems: AppMenuItem[];
  inventoryItems: AppInventoryItem[];
  togglingId: string;
  toggleItemAvailability: (itemId: string) => void;
  batchToggleAvailability?: (station: string, isAvailable: boolean) => void;
  logWaste: (ingredientId: string, qty: number, reason: string) => void;
}

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseKitchenKdsReturn {
  allFlatKots: KitchenFlatKot[];
  filteredKots: KitchenFlatKot[];
  completedKots: KitchenCompletedKot[];
  metrics: KitchenKpiMetrics;
  menuItemName: (itemId: string) => string;
  savingKey: string;
  updateKotItemStatus: (
    orderId: string,
    kotId: string,
    itemId: string,
    newStatus: KotItemStatus
  ) => void;
  batchUpdateKotStatus: (
    kotId: string,
    targetStatus: KitchenPipelineStep
  ) => void;
  handleVoidDecision: (
    orderId: string,
    kotId: string,
    itemId: string,
    approved: boolean
  ) => void;
  broadcastPickupNotification: (kot: KitchenFlatKot) => void;
  recallCompletedKot: (kotId: string) => void;
  setItemPrepTime: (orderId: string, kotId: string, itemId: string, mins: number) => void;
  menuItems: AppMenuItem[];
}




// ─── Menu CRUD Types ──────────────────────────────────────────────────────────

// Zod-validated form values for add/edit menu item
export interface KitchenMenuFormValues {
  name:        string;
  price:       number;
  category:    string;
  station:     KitchenStation;
  isAvailable: boolean;
  isSpecial:   boolean;
  variants:    { name: string; price: number }[];
}

// Delete confirm dialog state
export interface KitchenDeleteConfirm {
  type:  "menu" | "combo";
  id:    string;
  label: string;
}

// useKitchenMenu hook return shape
export interface UseKitchenMenuReturn {
  menuItems:      AppMenuItem[];
  combos:         AppCombo[];
  inventoryItems: AppInventoryItem[];
  isSubmitting:   boolean;
  addMenuItem:    (values: KitchenMenuFormValues) => void;
  updateMenuItem: (id: string, values: KitchenMenuFormValues) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addCombo:       (combo: Omit<AppCombo, "id">) => void;
  updateCombo:    (id: string, updates: Omit<AppCombo, "id">) => void;
  deleteCombo:    (id: string) => void;
  saveRecipe:     (itemId: string, recipe: AppMenuItem["recipe"]) => void;
}

// KitchenMenuTable props
export interface KitchenMenuTableProps {
  menuItems:          AppMenuItem[];
  onEdit:             (item: AppMenuItem) => void;
  onDelete:           (id: string, name: string) => void;
  onToggleAvailability: (id: string) => void;
}

// KitchenMenuFormModal props
export interface KitchenMenuFormModalProps {
  isOpen:         boolean;
  editItem:       AppMenuItem | null;
  inventoryItems: AppInventoryItem[];
  onSave:         (values: KitchenMenuFormValues) => void;
  onSaveRecipe:   (itemId: string, recipe: AppMenuItem["recipe"]) => void;
  onClose:        () => void;
}

// KitchenRecipeEditor props
export interface KitchenRecipeEditorProps {
  itemId:         string;
  currentRecipe:  AppMenuItem["recipe"];
  inventoryItems: AppInventoryItem[];
  onSave:         (recipe: AppMenuItem["recipe"]) => void;
}

// KitchenComboEditor props
export interface KitchenComboEditorProps {
  combos:    AppCombo[];
  menuItems: AppMenuItem[];
  onAdd:     (combo: Omit<AppCombo, "id">) => void;
  onUpdate:  (id: string, updates: Omit<AppCombo, "id">) => void;
  onDelete:  (id: string, name: string) => void;
}

// ─── Inventory Types ──────────────────────────────────────────────────────────

export interface UseKitchenInventoryReturn {
  inventoryItems: AppInventoryItem[];
  lowStockItems:  AppInventoryItem[];
  expiringItems:  AppInventoryItem[];
  updateStock:    (id: string, newQty: number) => void;
  addInventoryItem: (item: Omit<AppInventoryItem, "id">) => void;
  deleteInventoryItem: (id: string) => void;
  updateExpiryDate: (id: string, newDate: string) => void;
}

export interface KitchenInventoryTableProps {
  inventoryItems: AppInventoryItem[];
  onUpdateStock:  (id: string, newQty: number) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateExpiry: (id: string, newDate: string) => void;
}

