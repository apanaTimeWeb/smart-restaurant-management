"use client";

// RESPONSIBILITY: Thermal printer KOT ticket preview modal with print functionality.
// Renders standard physical ticket layout (Header, KOT #, Table #, Date/Time, Items & Notes).
// DATA FLOW: KitchenKotCard → setTicketKot → KitchenTicketModal → UI / window.print()

import { X, Printer, Receipt } from "lucide-react";
import type { KitchenTicketModalProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

export function KitchenTicketModal({ isOpen, kot, onClose }: KitchenTicketModalProps) {
  if (!isOpen || !kot) return null;

  const dateStr = new Date(kot.timestamp).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Kitchen ticket for KOT ${kot.kotId}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <Receipt size={16} className="text-primary" /> KOT Thermal Ticket Preview
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:bg-page hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thermal Ticket Container (Designed like paper receipt) */}
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-white p-5 font-mono text-black shadow-inner">
          {/* Header */}
          <div className="flex flex-col items-center border-b border-dashed border-gray-400 pb-3 text-center">
            <span className="text-sm font-black uppercase tracking-wider">KITCHEN ORDER TICKET</span>
            <span className="text-xs font-bold mt-0.5">{kot.station.toUpperCase()} STATION</span>
            <span className="text-[10px] text-gray-600 mt-1">{dateStr}</span>
          </div>

          {/* Table & Order Info */}
          <div className="flex items-center justify-between border-b border-dashed border-gray-400 py-2 text-xs font-bold">
            <span>TABLE: {kot.tableNumber}</span>
            <span>KOT #{kot.kotId.slice(-6)}</span>
          </div>

          {/* Items List */}
          <div className="flex flex-col gap-2 py-1">
            <div className="flex items-center justify-between text-[11px] font-bold border-b border-gray-300 pb-1">
              <span>QTY & ITEM</span>
              <span>STATUS</span>
            </div>
            {kot.items.map((item) => (
              <div key={item.itemId} className="flex flex-col text-xs">
                <div className="flex items-start justify-between font-bold">
                  <span>{item.qty}x {item.itemId}</span>
                  <span className="text-[10px] uppercase font-normal">{item.status}</span>
                </div>
                {item.notes && (
                  <span className="text-[10px] italic text-gray-700 ml-3 font-sans">
                    * Note: {item.notes}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Footer Barcode line */}
          <div className="flex flex-col items-center border-t border-dashed border-gray-400 pt-3 text-center">
            <span className="text-[10px] tracking-widest text-gray-500">*** SMART RESTAURANT KDS ***</span>
          </div>
        </div>

        {/* Print & Action Footer */}
        <div className="mt-5 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover shadow-sm"
          >
            <Printer size={14} /> Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
