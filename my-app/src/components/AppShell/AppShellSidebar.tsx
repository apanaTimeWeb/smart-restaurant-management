"use client";

// RESPONSIBILITY: Renders responsive desktop sidebar and mobile drawer.
// Desktop sidebar (lg:flex) toggles between expanded (240px) and collapsed (60px).
// Mobile drawer (lg:hidden) is a full-height overlay drawer controlled by isMobileOpen.
// DATA FLOW: useAppShellSidebar -> AppShell -> AppShellSidebar -> UI

import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, UtensilsCrossed } from "lucide-react";
import { APP_SHELL_NAV_GROUPS } from "@/components/AppShell/AppShellConstants";
import { AppShellSidebarNavItem } from "@/components/AppShell/AppShellSidebarNavItem";
import type { AppShellSidebarProps, AppShellNavItem } from "@/components/AppShell/AppShellTypes";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";

export function AppShellSidebar({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: AppShellSidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const role = currentUser?.role || "ADMIN";

  // Role-based route filter logic (RBAC navigation)
  const isItemAllowedForRole = (item: AppShellNavItem) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return item.allowedRoles.includes(role);
  };

  return (
    <>
      {/* ── 1. Desktop Sidebar (lg:flex only) ────────────────────────────────── */}
      <aside
        data-sidebar
        className={`hidden lg:flex fixed left-0 top-16 z-30 flex-col h-[calc(100vh-64px)] border-r border-border bg-sidebar transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[60px]" : "w-60"
        }`}
      >
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Desktop navigation">
          {APP_SHELL_NAV_GROUPS.map((group) => {
            const allowedItems = group.items.filter(isItemAllowedForRole);
            if (allowedItems.length === 0) return null;

            return (
              <div key={group.groupLabel ?? "top"} className="mb-4">
                {group.groupLabel && !isCollapsed && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    {group.groupLabel}
                  </p>
                )}
                {group.groupLabel && isCollapsed && (
                  <div className="my-2 border-t border-border/60" />
                )}

                <ul className="flex flex-col gap-1">
                  {allowedItems.map((item) => (
                    <li key={item.id}>
                      <AppShellSidebarNavItem
                        item={item}
                        isCollapsed={isCollapsed}
                        isActive={pathname === item.href}
                        onClick={() => {}}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── 2. Mobile Drawer (lg:hidden only — rendered ONLY when isMobileOpen is true) ── */}
      {isMobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-[990] bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over Mobile Drawer */}
          <aside
            data-mobile-sidebar
            className="fixed left-0 top-0 bottom-0 z-[1000] flex w-72 max-w-[85vw] flex-col border-r border-border bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Header with Logo & Prominent Close Button */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
              <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <UtensilsCrossed size={20} className="text-primary" />
                <span className="text-base font-extrabold text-text-primary">
                  Smart POS 360
                </span>
              </Link>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close mobile navigation"
                className="rounded-xl p-1.5 text-text-secondary hover:bg-primary/10 hover:text-text-primary active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile navigation">
              {APP_SHELL_NAV_GROUPS.map((group) => {
                const allowedItems = group.items.filter(isItemAllowedForRole);
                if (allowedItems.length === 0) return null;

                return (
                  <div key={group.groupLabel ?? "top"} className="mb-4">
                    {group.groupLabel && (
                      <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                        {group.groupLabel}
                      </p>
                    )}

                    <ul className="flex flex-col gap-1">
                      {allowedItems.map((item) => (
                        <li key={item.id}>
                          <AppShellSidebarNavItem
                            item={item}
                            isCollapsed={false}
                            isActive={pathname === item.href}
                            onClick={onCloseMobile}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
