"use client";

// RESPONSIBILITY: Inline recipe ingredient linker for a menu item.
// Renders a list of ingredient rows (dropdown + qty input) that map to
// AppMenuRecipeItem[]. Add/remove rows, save writes to parent via onSave.
// Pure display component — no localStorage access.
// DATA FLOW: OwnerMenuFormModal → OwnerRecipeEditor → onSave(recipe) → useOwnerMenu.saveRecipe

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AppMenuRecipeItem } from "@/types/appTypes";
import type { OwnerRecipeEditorProps } from "@/app/manager/manager_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const EMPTY_ROW: AppMenuRecipeItem = { ingredientId: "", qty: 0 };

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Inline recipe editor — add/remove ingredient rows, save to parent.
 * Ingredient dropdown sourced from inventoryItems.
 * Unit is read-only from the selected ingredient.
 */
export function OwnerRecipeEditor({
  currentRecipe,
  inventoryItems,
  onSave,
}: OwnerRecipeEditorProps) {
  const [rows, setRows] = useState<AppMenuRecipeItem[]>(
    currentRecipe.length > 0 ? currentRecipe : []
  );

  function handleAddRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function handleRemoveRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleIngredientChange(index: number, ingredientId: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ingredientId } : row))
    );
  }

  function handleQtyChange(index: number, qty: number) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, qty } : row))
    );
  }

  function handleSave() {
    const valid = rows.filter((r) => r.ingredientId !== "" && r.qty > 0);
    onSave(valid);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-page p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        Recipe Ingredients
      </p>

      {rows.length === 0 && (
        <p className="text-[12px] text-text-disabled">No ingredients linked yet.</p>
      )}

      {rows.map((row, index) => {
        const ingredient = inventoryItems.find((i) => i.id === row.ingredientId);
        return (
          <div key={index} className="flex items-center gap-2">
            {/* Ingredient dropdown */}
            <select
              value={row.ingredientId}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="">Select ingredient</option>
              {inventoryItems.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>

            {/* Qty input */}
            <input
              type="number"
              min={0}
              value={row.qty || ""}
              onChange={(e) => handleQtyChange(index, parseFloat(e.target.value) || 0)}
              placeholder="Qty"
              className="w-20 rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
            />

            {/* Unit — read-only */}
            <span className="w-8 text-[11px] text-text-secondary">
              {ingredient?.unit ?? "—"}
            </span>

            {/* Remove row */}
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors"
              aria-label="Remove ingredient"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-card transition-colors"
        >
          <Plus size={13} />
          Add Ingredient
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Save Recipe
        </button>
      </div>
    </div>
  );
}
