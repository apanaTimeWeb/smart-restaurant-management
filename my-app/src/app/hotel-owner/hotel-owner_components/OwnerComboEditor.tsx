"use client";

// RESPONSIBILITY: Combo and Happy Hours editor for the Owner Menu page.
// Lists existing combos with edit/delete. Add combo form: name + multi-select items + comboPrice.
// Happy Hours toggle: start + end time inputs per combo.
// DATA FLOW: useOwnerMenu → admin/menu/page.tsx → OwnerComboEditor → onAdd/onUpdate/onDelete

import { useState } from "react";
import { Plus, Trash2, Clock, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { AppCombo } from "@/types/appTypes";
import type { OwnerComboEditorProps } from "@/app/hotel-owner/hotel-owner_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const EMPTY_COMBO_FORM = {
  name:           "",
  requiredItemIds: [] as string[],
  comboPrice:     0,
  happyHourStart: null as string | null,
  happyHourEnd:   null as string | null,
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Single combo row with edit/delete actions.
interface ComboRowProps {
  combo:     AppCombo;
  itemNames: string;
  onEdit:    () => void;
  onDelete:  () => void;
}

function ComboRow({ combo, itemNames, onEdit, onDelete }: ComboRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-semibold text-text-primary">{combo.name}</p>
        <p className="text-[11px] text-text-secondary">{itemNames}</p>
        <p className="text-[12px] font-medium text-primary">{formatCurrency(combo.comboPrice)}</p>
        {combo.happyHourStart && combo.happyHourEnd && (
          <div className="flex items-center gap-1 text-[11px] text-warning">
            <Clock size={11} />
            <span>Happy Hours: {combo.happyHourStart} – {combo.happyHourEnd}</span>
          </div>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-text-secondary hover:bg-info-bg hover:text-info transition-colors"
          aria-label={`Edit ${combo.name}`}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors"
          aria-label={`Delete ${combo.name}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Combo + Happy Hours editor.
 * Add form at bottom, existing combos listed above.
 * Multi-select for required items, optional happy hour time range.
 */
export function OwnerComboEditor({
  combos,
  menuItems,
  onAdd,
  onUpdate,
  onDelete,
}: OwnerComboEditorProps) {
  const [form, setForm] = useState<{
    name: string;
    requiredItemIds: string[];
    comboPrice: number;
    happyHourStart: string | null;
    happyHourEnd: string | null;
  }>({ ...EMPTY_COMBO_FORM, requiredItemIds: [] });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [happyHoursEnabled, setHappyHoursEnabled] = useState<boolean>(false);

  function handleItemToggle(itemId: string) {
    setForm((prev) => {
      const already = prev.requiredItemIds.includes(itemId);
      return {
        ...prev,
        requiredItemIds: already
          ? prev.requiredItemIds.filter((id) => id !== itemId)
          : [...prev.requiredItemIds, itemId],
      };
    });
  }

  function handleEditClick(combo: AppCombo) {
    setEditingId(combo.id);
    setHappyHoursEnabled(combo.happyHourStart !== null);
    setForm({
      name:            combo.name,
      requiredItemIds: combo.requiredItemIds,
      comboPrice:      combo.comboPrice,
      happyHourStart:  combo.happyHourStart,
      happyHourEnd:    combo.happyHourEnd,
    });
  }

  function handleSave() {
    if (!form.name.trim() || form.requiredItemIds.length === 0 || form.comboPrice <= 0) return;

    const payload = {
      name:            form.name.trim(),
      requiredItemIds: form.requiredItemIds,
      comboPrice:      form.comboPrice,
      happyHourStart:  happyHoursEnabled ? (form.happyHourStart ?? null) : null,
      happyHourEnd:    happyHoursEnabled ? (form.happyHourEnd ?? null) : null,
    };

    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd(payload);
    }

    setForm({ ...EMPTY_COMBO_FORM, requiredItemIds: [] });
    setEditingId(null);
    setHappyHoursEnabled(false);
  }

  function handleCancel() {
    setForm({ ...EMPTY_COMBO_FORM, requiredItemIds: [] });
    setEditingId(null);
    setHappyHoursEnabled(false);
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Existing combos list */}
      {combos.length === 0 ? (
        <p className="text-[12px] text-text-disabled">No combos created yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {combos.map((combo) => {
            const itemNames = combo.requiredItemIds
              .map((id: string) => menuItems.find((m) => m.id === id)?.name ?? id)
              .join(" + ");
            return (
              <ComboRow
                key={combo.id}
                combo={combo}
                itemNames={itemNames}
                onEdit={() => handleEditClick(combo)}
                onDelete={() => onDelete(combo.id, combo.name)}
              />
            );
          })}
        </div>
      )}

      {/* Add / Edit form */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
          {editingId ? "Edit Combo" : "New Combo"}
        </p>

        {/* Combo name */}
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Combo name e.g. Thali Combo"
          className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />

        {/* Combo price */}
        <input
          type="number"
          min={0}
          value={form.comboPrice || ""}
          onChange={(e) => setForm((p) => ({ ...p, comboPrice: parseFloat(e.target.value) || 0 }))}
          placeholder="Combo price (₹)"
          className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />

        {/* Item multi-select */}
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-text-secondary">Select Items *</p>
          <div className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-input p-2">
            {menuItems.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.requiredItemIds.includes(item.id)}
                  onChange={() => handleItemToggle(item.id)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="text-[12px] text-text-primary">{item.name}</span>
                <span className="ml-auto text-[11px] text-text-secondary">
                  {formatCurrency(item.price)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Happy Hours toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={happyHoursEnabled}
            onChange={(e) => setHappyHoursEnabled(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <Clock size={13} className="text-warning" />
          <span className="text-[13px] text-text-primary">Enable Happy Hours</span>
        </label>

        {happyHoursEnabled && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-text-secondary">Start</label>
              <input
                type="time"
                value={form.happyHourStart ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, happyHourStart: e.target.value }))}
                className="rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-text-secondary">End</label>
              <input
                type="time"
                value={form.happyHourEnd ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, happyHourEnd: e.target.value }))}
                className="rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary focus:border-border-focus focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-page transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Plus size={14} />
            {editingId ? "Update Combo" : "Add Combo"}
          </button>
        </div>
      </div>
    </div>
  );
}
