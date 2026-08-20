// RESPONSIBILITY: All TypeScript types for the Kitchen KDS module.
// No logic, no imports from other modules — pure type definitions only.
// DATA FLOW: KitchenTypes.ts → imported by KitchenKotCard, KitchenKotGrid,
//            KitchenStatusPipeline, KitchenPrepTimeInput, useKitchenKds, kitchen/page.tsx

import type { AppKotItem, AppMenuItem, AppInventoryItem, KitchenStation, KotItemStatus, KotPriority } from "@/types/appTypes";

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


