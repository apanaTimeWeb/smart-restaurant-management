"use client";

// RESPONSIBILITY: Live 80mm Thermal Paper Receipt Preview Modal for Cashier Billing POS.
// Renders monospaced thermal print preview with restaurant branding, items breakdown, taxes, QR code, and print trigger.
// DATA FLOW: cartItems + taxBreakdown -> BillingThermalReceiptPreviewModal -> Thermal UI Preview / Window Print

import React from "react";
import { Printer, X, Share2, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { BillingCartItem, BillingTaxBreakdown } from "@/app/billing/billing_types/BillingTypes";

export interface BillingThermalReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  cartItems: BillingCartItem[];
  taxBreakdown: BillingTaxBreakdown;
  customerPhone?: string;
  customerName?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  gstin?: string;
}

export function BillingThermalReceiptPreviewModal({
  isOpen,
  onClose,
  tableNumber,
  cartItems,
  taxBreakdown,
  customerPhone = "",
  customerName = "",
  restaurantName = "Spice Garden Restaurant",
  restaurantAddress = "123 MG Road, Connaught Place, New Delhi",
  gstin = "07AAAAA0000A1Z5",
}: BillingThermalReceiptPreviewModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="flex h-auto max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base">80mm Thermal Receipt</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-page">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thermal Roll Paper Card Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 flex justify-center">
          <div className="w-full max-w-[280px] bg-white text-black font-mono p-4 rounded-md shadow-2xl text-xs space-y-2 border-dashed border-b-2 border-zinc-400">
            {/* Restaurant Header */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-zinc-300">
              <h2 className="font-black text-sm uppercase tracking-wider">{restaurantName}</h2>
              <p className="text-[10px] text-zinc-600 leading-tight">{restaurantAddress}</p>
              <p className="text-[10px] font-semibold text-zinc-700">GSTIN: {gstin}</p>
            </div>

            {/* Bill Meta */}
            <div className="flex flex-col py-1 border-b border-dashed border-zinc-300 gap-0.5">
              <div className="flex justify-between text-[11px]">
                <span>Table: <strong>{tableNumber}</strong></span>
                <span>{formatDateTime(Date.now()).split(",")[1]}</span>
              </div>
              {(customerPhone || customerName) && (
                <div className="text-[10px] font-bold text-black">
                  Cust: {customerName || "Guest"} {customerPhone ? `(${customerPhone})` : ""}
                </div>
              )}
            </div>

            {/* Items Table Header */}
            <div className="flex justify-between font-bold text-[11px] pt-1">
              <span>ITEM</span>
              <span>QTY</span>
              <span>AMT</span>
            </div>
            <div className="border-b border-dashed border-zinc-300" />

            {/* Items Rows */}
            <div className="space-y-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] leading-snug">
                  <span className="truncate max-w-[140px] font-semibold">{item.name}</span>
                  <span className="text-zinc-600">x{item.qty}</span>
                  <span className="font-bold">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-zinc-300 pt-1" />

            {/* Pricing Totals */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(taxBreakdown.subtotal)}</span>
              </div>
              {taxBreakdown.cgst > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>CGST (2.5%)</span>
                  <span>{formatCurrency(taxBreakdown.cgst)}</span>
                </div>
              )}
              {taxBreakdown.sgst > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>SGST (2.5%)</span>
                  <span>{formatCurrency(taxBreakdown.sgst)}</span>
                </div>
              )}
              {taxBreakdown.serviceCharge > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Service (5%)</span>
                  <span>{formatCurrency(taxBreakdown.serviceCharge)}</span>
                </div>
              )}
              {taxBreakdown.discount > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(taxBreakdown.discount)}</span>
                </div>
              )}
              <div className="border-b border-zinc-400 pt-1" />
              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(taxBreakdown.totalAmount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 text-[10px] text-zinc-600 space-y-1 border-t border-dashed border-zinc-300">
              <p>Thank you for dining with us! 🙏</p>
              <p className="font-bold text-black">Visit Again soon!</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-page/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
