import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { AppInventoryItem, StockUnit } from "@/types/appTypes";

interface KitchenAddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<AppInventoryItem, "id">) => void;
}

export function KitchenAddInventoryModal({ isOpen, onClose, onAdd }: KitchenAddInventoryModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("RAW_MATERIALS");
  const [unit, setUnit] = useState("kg");
  const [currentStock, setCurrentStock] = useState("");
  const [threshold, setThreshold] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentStock || !threshold || !expiryDate) return;

    onAdd({
      name,
      unit: unit as StockUnit,
      currentStock: Number(currentStock),
      threshold: Number(threshold),
      expiryDate,
    } as Omit<AppInventoryItem, "id">);

    setName("");
    setCategory("RAW_MATERIALS");
    setUnit("kg");
    setCurrentStock("");
    setThreshold("");
    setExpiryDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-text-primary">Add New Inventory Item</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-text-secondary hover:bg-page hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Paneer"
              className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="RAW_MATERIALS">Raw Materials</option>
                <option value="DAIRY">Dairy</option>
                <option value="PRODUCE">Produce</option>
                <option value="MEAT">Meat</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="PACKAGING">Packaging</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="pcs">pcs</option>
                <option value="gm">gm</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Current Stock</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Low Stock Alert at</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 2"
                className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary uppercase">Expiry Date</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </form>
      </div>
    </div>
  );
}
