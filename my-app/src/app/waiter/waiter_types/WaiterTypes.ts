// RESPONSIBILITY: All TypeScript types and interfaces for the Waiter module only.
// No logic, no imports from other modules — pure type definitions.
// DATA FLOW: WaiterTypes.ts → WaiterTableCard, WaiterTableGrid, waiter/page.tsx

import type { AppTable, AppMenuItem, AppCombo, KotPriority } from "@/types/appTypes";

// ─── Union Types (Rule 35: No inline string literals) ────────────────────────

/** Controls whether the floor is shown as a grid or a positioned floor map. */
export type WaiterViewMode = "grid" | "floor-map";

/** Section filter tabs on the waiter page. "All" shows every section. */
export type WaiterTableSection = "All" | "Dining" | "AC" | "Outdoor";

// ─── Order / Cart Types ───────────────────────────────────────────────────────

/** A single line item in the waiter's cart before KOT submission. */
export interface WaiterCartItem {
  /** Unique key: itemId + variantName (or itemId alone if no variant) */
  cartKey: string;
  itemId: string;
  name: string;
  /** Resolved price — variant price if selected, else base item price */
  unitPrice: number;
  qty: number;
  /** Variant name e.g. "Half" | "Full" — empty string if none */
  variantName: string;
  notes: string;
}

/** A combo that was auto-detected from the current cart contents. */
export interface WaiterDetectedCombo {
  combo: AppCombo;
  /** Saving = sum of individual item prices − comboPrice */
  saving: number;
}

/** Return shape of the useWaiterOrder hook. */
export interface UseWaiterOrderReturn {
  cart: WaiterCartItem[];
  detectedCombos: WaiterDetectedCombo[];
  happyHourDiscount: number;
  subtotal: number;
  kotNumber: number;
  addToCart: (item: AppMenuItem, variantName: string, notes: string) => void;
  removeFromCart: (cartKey: string) => void;
  updateQty: (cartKey: string, delta: number) => void;
  updateNotes: (cartKey: string, newNotes: string) => void;
  submitKOT: (tableId: string, tableNumber: string, priority?: KotPriority) => void;
  clearCart: () => void;
  /** Sets the active table so kotNumber can be derived correctly. */
  setActiveTableId: (tableId: string) => void;
}


// ─── Component Prop Interfaces (Rule 7: types isolated) ──────────────────────

export interface WaiterTableCardProps {
  /** Full table object from localStorage */
  table: AppTable;
  /** Called when the card is clicked — passes table id up to parent */
  onTableClick: (tableId: string) => void;
  /** Called when QR icon button on table card is clicked */
  onQrClick?: (table: AppTable) => void;
  /** Called when Mark Cleaned button is clicked */
  onMarkCleaned?: (tableId: string) => void;
}

export interface WaiterTableGridProps {
  /** Filtered list of tables to render */
  tables: AppTable[];
  /** Current view mode — grid or floor-map */
  viewMode: WaiterViewMode;
  /** Callback forwarded to each card */
  onTableClick: (tableId: string) => void;
  /** Callback for QR modal trigger */
  onQrClick?: (table: AppTable) => void;
  /** Callback for Mark Cleaned trigger */
  onMarkCleaned?: (tableId: string) => void;
}

export interface WaiterOrderModalProps {
  tableId: string;
  tableNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface WaiterTableQrModalProps {
  table: AppTable | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface WaiterMenuItemCardProps {
  item: AppMenuItem;
  /** Called when user taps "+ Add" — passes item + chosen variant + notes */
  onAdd: (item: AppMenuItem, variantName: string, notes: string) => void;
}

export interface WaiterCartSummaryProps {
  cart: WaiterCartItem[];
  detectedCombos: WaiterDetectedCombo[];
  happyHourDiscount: number;
  subtotal: number;
  kotNumber: number;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onUpdateNotes: (cartKey: string, newNotes: string) => void;
  onRemove: (cartKey: string) => void;
}

// ─── Table Actions Types ──────────────────────────────────────────────────────

/** A KOT item reference passed to the void modal. */
export interface WaiterVoidTarget {
  kotId: string;
  itemId: string;
  itemName: string;
  orderId: string;
}

export interface WaiterTableActionsDrawerProps {
  tableId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Opens the order punching modal for this table */
  onAddItems: (tableId: string) => void;
  /** Opens QR modal for table from drawer */
  onViewQr?: (table: AppTable) => void;
}

export interface WaiterVoidRequestModalProps {
  target: WaiterVoidTarget | null;
  isOpen: boolean;
  onConfirm: (target: WaiterVoidTarget, reason: string) => Promise<void>;
  onCancel: () => void;
}

/** Return shape of the useWaiterTableActions hook. */
export interface UseWaiterTableActionsReturn {
  mergeTable: (sourceTableId: string, targetTableId: string) => void;
  moveTable: (orderId: string, fromTableId: string, toTableId: string) => void;
  sendToBill: (tableId: string) => void;
  requestVoid: (target: WaiterVoidTarget, reason: string) => Promise<void>;
}
