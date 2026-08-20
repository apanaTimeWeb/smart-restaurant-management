"use client";

// RESPONSIBILITY: Provides theme (dark/light) state to the entire app.
// Uses localStorage to persist theme. No external library — no script tag issues.
// DATA FLOW: localStorage → AppShellThemeProvider → useAppShellTheme hook → components

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

// Structure.txt Rule 44: typed state, not boolean flags
type Theme = "dark" | "light";

interface AppShellThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const AppShellThemeContext = createContext<AppShellThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "pos_theme";
const DEFAULT_THEME: Theme = "dark";

interface AppShellThemeProviderProps {
  children: React.ReactNode;
}

export function AppShellThemeProvider({ children }: AppShellThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  // On mount: read from localStorage and apply class to <html>
  // Why theme in dep array: we only want to run on mount once
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const resolved: Theme = stored === "light" ? "light" : "dark";
    setTheme(resolved);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      return next;
    });
  }, []);

  // Structure.txt Rule 5: memoize context value to prevent re-render chains
  const value = useMemo<AppShellThemeContextValue>(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <AppShellThemeContext.Provider value={value}>
      {children}
    </AppShellThemeContext.Provider>
  );
}

/**
 * Hook to consume theme context in any client component.
 * Returns current theme and toggleTheme function.
 */
export function useAppShellTheme(): AppShellThemeContextValue {
  const ctx = useContext(AppShellThemeContext);
  if (!ctx) {
    throw new Error("useAppShellTheme must be used inside AppShellThemeProvider");
  }
  return ctx;
}
