"use client";

// RESPONSIBILITY: Renders a single sidebar navigation item with icon, label,
// active state highlight, and collapsed (icon-only) mode.
// Receives all data via props — no state, no API calls.
// DATA FLOW: AppShellConstants → AppShellSidebar → AppShellSidebarNavItem

import Link from "next/link";
import {
  LayoutDashboard, BarChart2, Bell, ChefHat, CreditCard, QrCode,
  Map, Grid3x3, CalendarDays, UtensilsCrossed, FlaskConical, Package,
  Trash2, Zap, Banknote, Receipt, Gift, Percent, Building2, Users,
  ShieldCheck, Timer, HardDrive, Settings,
  type LucideProps,
} from "lucide-react";
import type { AppShellSidebarNavItemProps } from "@/components/AppShell/AppShellTypes";

// Structure.txt Rule 35: Icon map — no magic strings in JSX
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  LayoutDashboard, BarChart2, Bell, ChefHat, CreditCard, QrCode,
  Map, Grid3x3, CalendarDays, UtensilsCrossed, FlaskConical, Package,
  Trash2, Zap, Banknote, Receipt, Gift, Percent, Building2, Users,
  ShieldCheck, Timer, HardDrive, Settings,
};

export function AppShellSidebarNavItem({
  item,
  isCollapsed,
  isActive,
  onClick,
}: AppShellSidebarNavItemProps) {
  const IconComponent = ICON_MAP[item.iconName];

  return (
    <Link
      href={item.href}
      onClick={onClick}
      target={item.openInNew ? "_blank" : undefined}
      rel={item.openInNew ? "noopener noreferrer" : undefined}
      title={isCollapsed ? item.label : undefined}
      aria-label={item.label}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isCollapsed ? "justify-center px-2" : "",
        isActive
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-primary/10 hover:text-text-primary",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {IconComponent && (
        <IconComponent
          size={18}
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );
}
