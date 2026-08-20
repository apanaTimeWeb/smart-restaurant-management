"use client";

// RESPONSIBILITY: Renders global floating toasts dispatched via toastService.ts.
// DATA FLOW: toastBus event -> ToastProvider state -> floating toast UI

import React, { useState, useEffect } from "react";
import { toastBus, type ToastMessage } from "@/lib/toastService";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastProvider(): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    function handleToast(e: Event) {
      const customEvent = e as CustomEvent<ToastMessage>;
      const toast = customEvent.detail;

      setToasts((prev) => [...prev, toast]);

      // Auto dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 4000);
    }

    toastBus.addEventListener("toast", handleToast);
    return () => toastBus.removeEventListener("toast", handleToast);
  }, []);

  if (toasts.length === 0) return <></>;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
          info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
        };

        const bgBorders = {
          success: "bg-surface border-emerald-500/30 text-text-primary",
          error: "bg-surface border-red-500/30 text-text-primary",
          warning: "bg-surface border-amber-500/30 text-text-primary",
          info: "bg-surface border-blue-500/30 text-text-primary",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bgBorders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm">
              {toast.title && <p className="font-semibold text-text-primary mb-0.5">{toast.title}</p>}
              <p className="text-text-secondary leading-snug">{toast.message}</p>
              {toast.actionLabel && (
                <button
                  onClick={() => {
                    if (toast.onAction) toast.onAction();
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="mt-2 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-text-muted hover:text-text-primary transition-colors p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
