"use client";

// RESPONSIBILITY: Modal form to log spoiled/damaged ingredients for waste tracking.
// Enhanced for Touch KDS Tablets: Features Item Dropdown, Quantity Counter (+/-), Reason Tag Chips, Notes field.
// DATA FLOW: KitchenWasteLogModal -> useKitchenStock.logWaste -> app_wastage + app_audit_logs

import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, Check, Flame, AlertTriangle, Clock, Ban } from "lucide-react";
import { useKitchenStock } from "@/app/kitchen/kitchen_hooks/useKitchenStock";
import { showToast } from "@/lib/toastService";
import type { KitchenWasteLogModalProps } from "@/app/kitchen/kitchen_types/KitchenTypes";

const REASON_CHIPS = [
  { label: "Spoiled", icon: AlertTriangle, color: "border-amber-500/40 bg-amber-500/10 text-amber-500" },
  { label: "Burnt", icon: Flame, color: "border-orange-500/40 bg-orange-500/10 text-orange-500" },
  { label: "Expired", icon: Clock, color: "border-red-500/40 bg-red-500/10 text-red-500" },
  { label: "Order Cancelled", icon: Ban, color: "border-blue-500/40 bg-blue-500/10 text-blue-500" },
];

export function KitchenWasteLogModal({ isOpen, onClose }: KitchenWasteLogModalProps) {
  const { inventoryItems, logWaste } = useKitchenStock();

  const [ingredientId, setIngredientId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [selectedReason, setSelectedReason] = useState<string>("Spoiled");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setIngredientId("");
      setQty(1);
      setSelectedReason("Spoiled");
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedIngredient = inventoryItems.find((i) => i.id === ingredientId);
  const unit = selectedIngredient?.unit ?? "pcs";

  const handleIncrement = () => setQty((prev) => parseFloat((prev + 1).toFixed(1)));
  const handleDecrement = () => setQty((prev) => Math.max(0.5, parseFloat((prev - 1).toFixed(1))));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId) {
      showToast({ type: "warning", message: "Please select an ingredient to log waste." });
      return;
    }

    const fullReason = notes ? `${selectedReason} - ${notes}` : selectedReason;
    logWaste(ingredientId, qty, fullReason);

    showToast({
      type: "success",
      title: "Waste Logged",
      message: `Logged ${qty} ${unit} of ${selectedIngredient?.name ?? ingredientId}.`,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Log Waste Entry</h2>
              <p className="text-xs text-text-secondary">Record damaged or spoiled ingredients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-page hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ingredient Select */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Select Ingredient <span className="text-danger">*</span>
            </label>
            <select
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-text-primary font-semibold focus:border-primary focus:outline-none"
            >
              <option value="">— Select ingredient / item —</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit}) — Current Stock: {item.currentStock}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Counter with Touch Buttons */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Wasted Quantity ({unit})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-page text-text-primary font-extrabold text-xl hover:bg-surface-hover active:scale-95 transition-all shadow-xs"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full rounded-xl border border-border bg-input py-2.5 text-center text-xl font-black text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-page text-text-primary font-extrabold text-xl hover:bg-surface-hover active:scale-95 transition-all shadow-xs"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Reason Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Reason Selector
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REASON_CHIPS.map((chip) => {
                const Icon = chip.icon;
                const isSelected = selectedReason === chip.label;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setSelectedReason(chip.label)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-sm"
                        : `${chip.color} hover:opacity-80`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. dropped during dinner rush..."
              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-danger px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-danger/80 active:scale-95 transition-all"
            >
              Confirm Log Waste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
