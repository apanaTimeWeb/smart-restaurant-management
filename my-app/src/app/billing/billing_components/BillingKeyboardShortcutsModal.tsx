"use client";

// RESPONSIBILITY: POS Keyboard Shortcuts Guide Modal for High-Speed Cashiers.
// Displays hotkeys for table search (F2), manager PIN (F4), print & settle (F8), cash calculator (F9), clear (Esc).
// DATA FLOW: Keyboard event listener -> opens modal / executes hotkey

import React, { useEffect } from "react";
import { Keyboard, X, Command } from "lucide-react";

export interface BillingKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "F2", action: "Focus Table & Order Search Input" },
  { key: "F4", action: "Trigger Manager PIN Authorization Modal" },
  { key: "F8", action: "Settle Bill & Print Thermal Receipt" },
  { key: "F9", action: "Open Quick Cash & Change Calculator" },
  { key: "Ctrl + D", action: "Toggle 5% / 10% / Flat Discount Panel" },
  { key: "Esc", action: "Clear Table Selection / Close Modals" },
];

export function BillingKeyboardShortcutsModal({
  isOpen,
  onClose,
}: BillingKeyboardShortcutsModalProps): React.JSX.Element | null {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F1" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base">POS Keyboard Hotkeys</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-page">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-text-secondary">
            Use these keyboard shortcuts for high-speed counter operations:
          </p>

          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-xl border border-border bg-page/60 p-3 shadow-xs"
              >
                <span className="text-xs font-semibold text-text-secondary">{s.action}</span>
                <kbd className="rounded-lg border border-border bg-surface px-3 py-1 font-mono text-xs font-extrabold text-primary shadow-xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-border p-4 bg-page/50">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
