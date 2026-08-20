// RESPONSIBILITY: Single source of truth for ALL status-to-badge mappings
// across the entire app (Waiter, Kitchen, Billing, Admin, Inventory).
// No component logic here — pure data + types + one helper function.
// DATA FLOW: statusBadgeConfig.ts → getBadgeConfig() → StatusBadge component → JSX

// ─── Types ────────────────────────────────────────────────────────────────────

// Structure.txt Rule 7: No inline string unions — extracted to named types here
export type BadgeVariant = "success" | "warning" | "danger" | "info" | "inactive";

export interface BadgeConfig {
  variant: BadgeVariant;
  // CSS variable names — used as Tailwind tokens (text-success, bg-success-bg)
  textColorClass: string;
  bgColorClass: string;
  iconName: string; // lucide-react icon name — consumed by StatusBadge component
  label: string;
}

// ─── Status Enums (Structure.txt Rule 35: No magic strings) ──────────────────

export const TABLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  BILLING_PENDING: "BILLING_PENDING",
  RESERVED: "RESERVED",
  CLEANING: "CLEANING",
  DIRTY: "DIRTY",
} as const;

export const KOT_ITEM_STATUS = {
  PENDING: "PENDING",
  COOKING: "COOKING",
  READY: "READY",
  VOID_REQUESTED: "VOID_REQUESTED",
  VOIDED: "VOIDED",
} as const;

export const PAYMENT_STATUS = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  CANCELLED: "CANCELLED",
} as const;

export const INVENTORY_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRED: "EXPIRED",
} as const;

export const SHIFT_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export const RESERVATION_STATUS = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

// ─── Default Fallback Config ──────────────────────────────────────────────────

const INACTIVE_CONFIG: BadgeConfig = {
  variant: "success",
  textColorClass: "text-emerald-400",
  bgColorClass: "bg-emerald-500/15",
  iconName: "CheckCircle",
  label: "Available",
};

// ─── Master Badge Map ─────────────────────────────────────────────────────────
// Structure.txt Rule 3: All hardcoded UI data in one central constants file.
// Tomorrow when backend sends status strings, only this file changes.

const STATUS_BADGE_MAP: Record<string, BadgeConfig> = {
  // Table Status
  [TABLE_STATUS.AVAILABLE]: {
    variant: "success",
    textColorClass: "text-success",
    bgColorClass: "bg-success-bg",
    iconName: "CheckCircle",
    label: "Available",
  },
  [TABLE_STATUS.OCCUPIED]: {
    variant: "danger",
    textColorClass: "text-danger",
    bgColorClass: "bg-danger-bg",
    iconName: "XCircle",
    label: "Occupied",
  },
  [TABLE_STATUS.BILLING_PENDING]: {
    variant: "warning",
    textColorClass: "text-warning",
    bgColorClass: "bg-warning-bg",
    iconName: "AlertTriangle",
    label: "Billing Pending",
  },
  [TABLE_STATUS.RESERVED]: {
    variant: "info",
    textColorClass: "text-info",
    bgColorClass: "bg-info-bg",
    iconName: "Info",
    label: "Reserved",
  },
  [TABLE_STATUS.CLEANING]: {
    variant: "info",
    textColorClass: "text-purple-400",
    bgColorClass: "bg-purple-500/15",
    iconName: "Sparkles",
    label: "Cleaning 🧹",
  },
  [TABLE_STATUS.DIRTY]: {
    variant: "warning",
    textColorClass: "text-amber-400",
    bgColorClass: "bg-amber-500/15",
    iconName: "AlertTriangle",
    label: "Needs Cleaning 🧹",
  },

  // KOT Item Status
  [KOT_ITEM_STATUS.PENDING]: {
    variant: "info",
    textColorClass: "text-info",
    bgColorClass: "bg-info-bg",
    iconName: "Info",
    label: "Pending",
  },
  [KOT_ITEM_STATUS.COOKING]: {
    variant: "warning",
    textColorClass: "text-warning",
    bgColorClass: "bg-warning-bg",
    iconName: "AlertTriangle",
    label: "Cooking",
  },
  [KOT_ITEM_STATUS.READY]: {
    variant: "success",
    textColorClass: "text-success",
    bgColorClass: "bg-success-bg",
    iconName: "CheckCircle",
    label: "Ready",
  },
  [KOT_ITEM_STATUS.VOID_REQUESTED]: {
    variant: "danger",
    textColorClass: "text-danger",
    bgColorClass: "bg-danger-bg",
    iconName: "XCircle",
    label: "Void Requested",
  },
  [KOT_ITEM_STATUS.VOIDED]: {
    variant: "inactive",
    textColorClass: "text-text-secondary",
    bgColorClass: "bg-[#1E1E2E]",
    iconName: "MinusCircle",
    label: "Voided",
  },

  // Payment Status
  [PAYMENT_STATUS.PAID]: {
    variant: "success",
    textColorClass: "text-success",
    bgColorClass: "bg-success-bg",
    iconName: "CheckCircle",
    label: "Paid",
  },
  [PAYMENT_STATUS.UNPAID]: {
    variant: "warning",
    textColorClass: "text-warning",
    bgColorClass: "bg-warning-bg",
    iconName: "AlertTriangle",
    label: "Unpaid",
  },
  [PAYMENT_STATUS.CANCELLED]: {
    variant: "inactive",
    textColorClass: "text-text-secondary",
    bgColorClass: "bg-[#1E1E2E]",
    iconName: "MinusCircle",
    label: "Cancelled",
  },

  // Inventory Status
  [INVENTORY_STATUS.IN_STOCK]: {
    variant: "success",
    textColorClass: "text-success",
    bgColorClass: "bg-success-bg",
    iconName: "CheckCircle",
    label: "In Stock",
  },
  [INVENTORY_STATUS.LOW_STOCK]: {
    variant: "warning",
    textColorClass: "text-warning",
    bgColorClass: "bg-warning-bg",
    iconName: "AlertTriangle",
    label: "Low Stock",
  },
  [INVENTORY_STATUS.OUT_OF_STOCK]: {
    variant: "danger",
    textColorClass: "text-danger",
    bgColorClass: "bg-danger-bg",
    iconName: "XCircle",
    label: "Out of Stock",
  },
  [INVENTORY_STATUS.EXPIRED]: {
    variant: "inactive",
    textColorClass: "text-text-secondary",
    bgColorClass: "bg-[#1E1E2E]",
    iconName: "MinusCircle",
    label: "Expired",
  },

  // Shift Status
  [SHIFT_STATUS.OPEN]: {
    variant: "success",
    textColorClass: "text-success",
    bgColorClass: "bg-success-bg",
    iconName: "CheckCircle",
    label: "Open",
  },
  [SHIFT_STATUS.CLOSED]: {
    variant: "inactive",
    textColorClass: "text-text-secondary",
    bgColorClass: "bg-[#1E1E2E]",
    iconName: "MinusCircle",
    label: "Closed",
  },

  // Reservation Status (prefixed to avoid key collision with PAYMENT_STATUS.CANCELLED)
  RESERVATION_CONFIRMED: {
    variant: "info",
    textColorClass: "text-info",
    bgColorClass: "bg-info-bg",
    iconName: "Info",
    label: "Confirmed",
  },
  RESERVATION_CANCELLED: {
    variant: "inactive",
    textColorClass: "text-text-secondary",
    bgColorClass: "bg-[#1E1E2E]",
    iconName: "MinusCircle",
    label: "Cancelled",
  },
};

// ─── Helper Function ──────────────────────────────────────────────────────────

/**
 * Returns the BadgeConfig for a given status string.
 * Falls back to INACTIVE_CONFIG if status is not found in the map.
 * @param status - Any status string from TABLE_STATUS, KOT_ITEM_STATUS, etc.
 */
export function getBadgeConfig(status: string): BadgeConfig {
  return STATUS_BADGE_MAP[status] ?? INACTIVE_CONFIG;
}
