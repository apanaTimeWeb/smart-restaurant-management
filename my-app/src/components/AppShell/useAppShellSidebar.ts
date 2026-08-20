"use client";

// RESPONSIBILITY: Manages sidebar collapsed/open state and mobile drawer state.
// All sidebar logic lives here — zero logic in the Sidebar component itself.
// DATA FLOW: useAppShellSidebar.ts → AppShellSidebar + AppShellHeader → JSX

import { useState, useCallback, useEffect } from "react";

// Structure.txt Rule 44: Network/UI state as typed value, not boolean flags
type SidebarMode = "expanded" | "collapsed" | "mobile-open";

interface UseAppShellSidebarReturn {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

/**
 * Manages sidebar state across desktop (collapsed/expanded) and mobile (drawer).
 * Auto-collapses on tablet breakpoint (< 1280px) via resize listener.
 */
export function useAppShellSidebar(): UseAppShellSidebarReturn {
  const [mode, setMode] = useState<SidebarMode>("expanded");

  // Auto-collapse on tablet, hide on mobile based on window width
  // Why window.innerWidth in dependency: we only run this on mount + resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setMode("mobile-open"); // will be closed by default via isMobileOpen=false
        setMode("collapsed");
      } else if (window.innerWidth < 1280) {
        setMode("collapsed");
      } else {
        setMode("expanded");
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleCollapsed = useCallback(() => {
    setMode((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  }, []);

  const openMobile = useCallback(() => {
    setMode("mobile-open");
  }, []);

  const closeMobile = useCallback(() => {
    setMode("collapsed");
  }, []);

  return {
    isCollapsed: mode === "collapsed",
    isMobileOpen: mode === "mobile-open",
    toggleCollapsed,
    openMobile,
    closeMobile,
  };
}
