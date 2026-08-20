"use client";

// RESPONSIBILITY: Modal allowing Cashier to split a table's bill equally (N guests) or itemized per person.
// DATA FLOW: billing/page.tsx → BillingGuestSplitModal → UI

import { useState } from "react";
import { X, Users, Split, Printer, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { BillingCartItem, BillingTaxBreakdown } from "@/app/billing/billing_types/BillingTypes";

interface BillingGuestSplitModalProps {
  isOpen: boolean;
  tableNumber: string;
  cartItems: BillingCartItem[];
  taxBreakdown: BillingTaxBreakdown;
  onClose: () => void;
}

export function BillingGuestSplitModal({
  isOpen,
  tableNumber,
  cartItems,
  taxBreakdown,
  onClose,
}: BillingGuestSplitModalProps) {
  const [splitMode, setSplitMode] = useState<"EQUAL" | "ITEMIZED">("EQUAL");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [paidGuests, setPaidGuests] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const equalPerGuest = Math.round(taxBreakdown.totalAmount / guestCount);

  function toggleGuestPaid(idx: number) {
    setPaidGuests((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Split Bill per Guest"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Split size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Split Bill — Table {tableNumber}</h2>
              <p className="text-xs text-text-secondary">Divide payment equally or itemized per guest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-page hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 flex flex-col gap-5 text-xs">
          {/* Mode Switcher */}
          <div className="flex rounded-xl border border-border bg-page p-1">
            <button
              onClick={() => setSplitMode("EQUAL")}
              className={[
                "flex-1 rounded-lg py-2 font-bold transition-all text-xs flex items-center justify-center gap-1.5",
                splitMode === "EQUAL" ? "bg-primary text-white shadow-xs" : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              <Users size={14} /> Equal N-Way Split
            </button>
            <button
              onClick={() => setSplitMode("ITEMIZED")}
              className={[
                "flex-1 rounded-lg py-2 font-bold transition-all text-xs flex items-center justify-center gap-1.5",
                splitMode === "ITEMIZED" ? "bg-primary text-white shadow-xs" : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              <Split size={14} /> Itemized Guest Split
            </button>
          </div>

          {/* EQUAL SPLIT MODE */}
          {splitMode === "EQUAL" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <span className="font-bold text-text-primary">Number of Guests Sharing:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuestCount(Math.max(2, guestCount - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card font-extrabold text-text-primary hover:bg-surface-hover"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold text-primary w-6 text-center">{guestCount}</span>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card font-extrabold text-text-primary hover:bg-surface-hover"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Guest Shares List */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {Array.from({ length: guestCount }).map((_, idx) => {
                  const isPaid = !!paidGuests[idx];
                  return (
                    <div
                      key={idx}
                      className={[
                        "flex items-center justify-between rounded-xl border p-3 transition-colors",
                        isPaid ? "border-success/40 bg-success-bg/20" : "border-border/60 bg-surface",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">Guest #{idx + 1}</span>
                        {isPaid && <span className="text-[10px] font-bold text-success uppercase">PAID</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-text-primary text-sm">
                          {formatCurrency(equalPerGuest)}
                        </span>
                        <button
                          onClick={() => toggleGuestPaid(idx)}
                          className={[
                            "rounded-lg px-2.5 py-1 font-bold text-[11px] border transition-colors",
                            isPaid
                              ? "bg-success text-white border-success"
                              : "border-border bg-card text-text-secondary hover:text-text-primary",
                          ].join(" ")}
                        >
                          {isPaid ? "Paid ✓" : "Mark Paid"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ITEMIZED SPLIT MODE */}
          {splitMode === "ITEMIZED" && (
            <div className="flex flex-col gap-3">
              <p className="text-text-secondary text-[11px]">
                Items assigned to individual table guests. Total Bill: <strong className="text-text-primary">{formatCurrency(taxBreakdown.totalAmount)}</strong>
              </p>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.itemId} className="flex items-center justify-between rounded-lg border border-border/50 bg-surface p-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-primary">{item.name} × {item.qty}</span>
                      <span className="text-[10px] text-text-secondary">{formatCurrency(item.totalPrice)}</span>
                    </div>
                    <span className="rounded bg-page px-2 py-1 text-[10px] font-semibold text-text-secondary">
                      Guest #1
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-secondary uppercase">Total Bill</span>
            <span className="text-base font-extrabold text-text-primary">{formatCurrency(taxBreakdown.totalAmount)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-page px-3 py-2 font-bold text-text-primary hover:bg-surface transition-colors"
            >
              <Printer size={14} /> Print Guest Receipts
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover transition-colors"
            >
              Done Splitting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
