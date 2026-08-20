"use client";

import { Sun, Moon } from "lucide-react";
import { useAppShellTheme } from "@/components/AppShell/AppShellThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppShellTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-md p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {theme === "dark" ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}
