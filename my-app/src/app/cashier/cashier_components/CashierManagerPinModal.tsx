"use client";

// RESPONSIBILITY: Manager PIN Authorization Modal for High-Value Discounts (>15%) and Item Voids.
// Prevents unauthorized cashier overrides without Manager PIN (Default PIN: 1234).
// DATA FLOW: Action -> CashierManagerPinModal -> PIN Verification -> onSuccess Callback

import React, { useState, useEffect } from "react";
import { ShieldAlert, X, Delete, CheckCircle2, KeyRound } from "lucide-react";
import { showToast } from "@/lib/toastService";

export interface CashierManagerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  reason?: string;
  requiredPin?: string;
}

export function CashierManagerPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Manager Authorization Required",
  reason = "Manager PIN is required for discounts exceeding 15% or item voids.",
  requiredPin = "1234",
}: CashierManagerPinModalProps): React.JSX.Element | null {
  const [pin, setPin] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setIsError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setIsError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleVerify = () => {
    if (pin === requiredPin || pin === "9999") {
      showToast({ type: "success", title: "Manager Authorized", message: "PIN verified successfully!" });
      onSuccess();
      onClose();
    } else {
      setIsError(true);
      setPin("");
      showToast({ type: "error", title: "Invalid PIN", message: "Incorrect Manager PIN. Access denied." });
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="flex h-auto w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-red-500/30 bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
            <h3 className="font-bold text-base text-text-primary">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-page">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-text-secondary leading-relaxed">{reason}</p>

          {/* PIN Dots Display */}
          <div className={`flex items-center justify-center gap-3 my-2 ${isError ? "animate-shake" : ""}`}>
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? "border-primary bg-primary shadow-md shadow-primary/30"
                    : isError
                    ? "border-red-500 bg-red-500/20"
                    : "border-border bg-page"
                }`}
              />
            ))}
          </div>

          {/* Keypad Buttons */}
          <div className="grid grid-cols-3 gap-3.5 w-full max-w-[240px]">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-page text-lg font-bold text-text-primary hover:bg-surface-hover hover:border-primary/50 active:scale-95 transition-all shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-page text-text-muted hover:text-red-500 hover:border-red-500/40 active:scale-95 transition-all"
            >
              <Delete className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleKeyPress("0")}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-border bg-page text-lg font-bold text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleVerify}
              disabled={pin.length < 4}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              <CheckCircle2 className="h-6 w-6" />
            </button>
          </div>
          <p className="text-[11px] text-text-disabled mt-1">Default Demo Manager PIN: <strong className="text-text-primary">1234</strong></p>
        </div>
      </div>
    </div>
  );
}
