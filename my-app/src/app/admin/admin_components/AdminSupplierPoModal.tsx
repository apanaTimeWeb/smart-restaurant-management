"use client";

// RESPONSIBILITY: Supplier Purchase Order (PO) Requisition Modal for low-stock inventory items.
// Auto-filters items below threshold, calculates suggested reorder quantities, and generates printable PO.
// DATA FLOW: AdminInventoryTable / inventory/page.tsx → AdminSupplierPoModal → window.print()

import React from "react";
import type { AppInventoryItem } from "@/types/appTypes";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { X, Printer, Package, ShoppingCart, CheckCircle2 } from "lucide-react";

interface AdminSupplierPoModalProps {
  isOpen: boolean;
  lowStockItems: AppInventoryItem[];
  onClose: () => void;
}

const RESTAURANT_NAME = "Royal Spice Bistro & Smart POS 360" as const;
const RESTAURANT_ADDRESS = "123, MG Road, Bengaluru — 560001" as const;
const DEFAULT_SUPPLIER_NAME = "Apex Fresh Foods & Ingredients Wholesale" as const;
const DEFAULT_SUPPLIER_CONTACT = "+91 9811223344 (orders@apexfresh.com)" as const;

export function AdminSupplierPoModal({
  isOpen,
  lowStockItems,
  onClose,
}: AdminSupplierPoModalProps) {
  if (!isOpen) return null;

  const poDate = formatDateTime(Date.now());
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;

  // Estimated unit rates for common ingredients if not stored
  const unitPrices: Record<string, number> = {
    kg: 180,
    g: 0.2,
    L: 95,
    pcs: 25,
  };

  const poItems = lowStockItems.map((item) => {
    const suggestedQty = Math.max(10, Math.ceil(item.threshold * 2 - item.currentStock));
    const estimatedPricePerUnit = unitPrices[item.unit] || 100;
    const totalEstCost = Math.round(suggestedQty * estimatedPricePerUnit);
    return {
      ...item,
      suggestedQty,
      estimatedPricePerUnit,
      totalEstCost,
    };
  });

  const grandTotalCost = poItems.reduce((sum, item) => sum + item.totalEstCost, 0);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:m-0 print:w-full print:max-w-none print:border-none print:shadow-none">
        {/* Header (hidden on print) */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-warning/10 p-2 text-warning">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Supplier Purchase Order (PO) Requisition</h2>
              <p className="text-[11px] text-text-secondary">Auto-generated PO draft for items below safety threshold</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition-all"
            >
              <Printer size={14} />
              <span>Print / Download PO</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Purchase Order Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto bg-card text-text-primary">
          {/* Company & Supplier Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-border">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Buyer Details</span>
              <h1 className="text-[18px] font-extrabold text-text-primary">{RESTAURANT_NAME}</h1>
              <p className="text-[11px] text-text-secondary">{RESTAURANT_ADDRESS}</p>
            </div>

            <div className="flex flex-col sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-warning">Purchase Order ID</span>
              <span className="text-[15px] font-mono font-extrabold text-text-primary">{poNumber}</span>
              <span className="text-[11px] text-text-secondary">Date: {poDate}</span>
            </div>
          </div>

          {/* Supplier Info Pill */}
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-page p-3.5 text-xs">
            <span className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Vendor / Supplier Information:</span>
            <span className="font-bold text-primary text-[13px]">{DEFAULT_SUPPLIER_NAME}</span>
            <span className="text-text-secondary">Contact & Orders: {DEFAULT_SUPPLIER_CONTACT}</span>
          </div>

          {/* Low Stock PO Items Table */}
          <div className="overflow-hidden rounded-xl border border-border text-xs">
            <table className="w-full text-left">
              <thead className="bg-header uppercase text-[10px] font-bold text-text-secondary">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5">Item Name</th>
                  <th className="px-4 py-2.5">Current Stock</th>
                  <th className="px-4 py-2.5">Safety Threshold</th>
                  <th className="px-4 py-2.5 text-right">Suggested Reorder Qty</th>
                  <th className="px-4 py-2.5 text-right">Est. Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Est. Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {poItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">
                      All inventory items are healthy! No low stock items detected.
                    </td>
                  </tr>
                ) : (
                  poItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-hover/30">
                      <td className="px-4 py-2.5 font-bold text-text-primary">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-danger">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">
                        {item.threshold} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary">
                        {item.suggestedQty} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-text-secondary">
                        {formatCurrency(item.estimatedPricePerUnit)}/{item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-text-primary">
                        {formatCurrency(item.totalEstCost)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="flex items-center justify-between border-t-2 border-border bg-surface-hover/40 px-4 py-3 text-sm">
              <span className="font-bold text-text-primary">Estimated Purchase Order Total:</span>
              <span className="text-[18px] font-extrabold text-primary">
                {formatCurrency(grandTotalCost)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-text-secondary">
            <span>Requisition generated by Smart POS 360 Inventory Engine</span>
            <span>Approval: Inventory Manager</span>
          </div>
        </div>

        {/* Footer Actions (hidden on print) */}
        <div className="flex justify-end gap-3 border-t border-border bg-page px-6 py-4 print:hidden">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-all active:scale-95"
          >
            <Printer size={14} />
            <span>Print Purchase Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
