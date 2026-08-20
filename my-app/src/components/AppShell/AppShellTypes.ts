// RESPONSIBILITY: All TypeScript interfaces and types for the AppShell module.
// No logic, no JSX — pure type definitions only.
// DATA FLOW: AppShellTypes.ts → consumed by AppShellConstants, hooks, components

// ─── Nav Item Types ───────────────────────────────────────────────────────────

import type { UserRole } from "@/types/appTypes";

export interface AppShellNavItem {
  id:          string;
  label:       string;
  href:        string;
  iconName:    string; // lucide-react icon name string
  openInNew?:  boolean; // true = opens in new tab (e.g. Customer QR standalone page)
  allowedRoles?: UserRole[]; // Roles permitted to see this sidebar item
}

export interface AppShellNavGroup {
  groupLabel: string | null; // null = no group label (first group)
  items: AppShellNavItem[];
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface AppShellSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export interface AppShellSidebarNavItemProps {
  item: AppShellNavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

export interface AppShellHeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}
