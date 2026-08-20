"use client";

// RESPONSIBILITY: Composes the full app shell — header + sidebar + main content.
// Owns sidebar state via useAppShellSidebar hook. Runs seed data initializer once on mount.
// For standalone routes like /customer, shell UI is hidden but component stays mounted
// so state (sidebar collapsed/expanded) is never lost on navigation.
// DATA FLOW: initializeLocalStorageSeeds → useAppShellSidebar → AppShellHeader + AppShellSidebar → main content

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppShellSidebar } from "@/components/AppShell/useAppShellSidebar";
import { AppShellHeader } from "@/components/AppShell/AppShellHeader";
import { AppShellSidebar } from "@/components/AppShell/AppShellSidebar";
import { initializeLocalStorageSeeds } from "@/lib/localStorageSeeder";
import { runStorageMigrations } from "@/lib/storageMigration";
import { ToastProvider } from "@/components/ui/ToastProvider";

import { CommandPaletteModal } from "@/components/ui/CommandPaletteModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapsed, openMobile, closeMobile } =
    useAppShellSidebar();

  useEffect(() => {
    initializeLocalStorageSeeds();
    runStorageMigrations();
  }, []);

  function handleMenuClick() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      openMobile();
    } else {
      toggleCollapsed();
    }
  }

  // Standalone routes that should NOT render the AppShell sidebar or top header
  const isStandaloneRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/customer" ||
    pathname.startsWith("/hotel") ||
    pathname.startsWith("/reservations/book");

  if (isStandaloneRoute) {
    return (
      <>
        {children}
        <ToastProvider />
        <CommandPaletteModal />
      </>
    );
  }

  const isSuperAdmin = pathname.startsWith("/super-admin");
  const mainMargin = isSuperAdmin ? "" : (isCollapsed ? "lg:ml-[60px]" : "lg:ml-60");

  return (
    <>
      <AppShellHeader
        onMenuClick={handleMenuClick}
        isSidebarCollapsed={isCollapsed}
      />

      <AppShellSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      <main
        className={[
          "min-h-screen pt-16 transition-all duration-200 ease-in-out ml-0",
          "bg-page text-text-primary",
          mainMargin,
        ].join(" ")}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>

      <ToastProvider />
      <CommandPaletteModal />
    </>
  );
}


