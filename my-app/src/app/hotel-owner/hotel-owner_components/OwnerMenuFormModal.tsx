"use client";

// RESPONSIBILITY: Add/Edit menu item modal with React Hook Form + Zod validation.
// Fields: name, price, category, station, isAvailable, isSpecial, variants (dynamic array).
// Includes inline OwnerRecipeEditor for recipe ingredient linking.
// Pessimistic submit button with Loader2 spinner.
// DATA FLOW: admin/menu/page.tsx → OwnerMenuFormModal → onSave(values) → useOwnerMenu

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { OwnerRecipeEditor } from "@/app/hotel-owner/hotel-owner_components/OwnerRecipeEditor";
import type { OwnerMenuFormModalProps, OwnerMenuFormValues } from "@/app/hotel-owner/hotel-owner_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const STATIONS = ["Kitchen", "Bar", "Bakery"] as const;

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const variantSchema = z.object({
  name:  z.string().min(1, "Variant name required"),
  price: z.number().min(1, "Price must be ≥ 1"),
});

const menuItemSchema = z.object({
  name:        z.string().min(2, "Name must be at least 2 characters"),
  price:       z.number().min(1, "Price must be ≥ 1"),
  category:    z.string().min(1, "Category is required"),
  station:     z.enum(["Kitchen", "Bar", "Bakery"]),
  isAvailable: z.boolean(),
  isSpecial:   z.boolean(),
  variants:    z.array(variantSchema),
});

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Full-screen modal for adding or editing a menu item.
 * Escape key closes the modal.
 * Recipe editor is shown only when editing an existing item (itemId available).
 */
export function OwnerMenuFormModal({
  isOpen,
  editItem,
  inventoryItems,
  onSave,
  onSaveRecipe,
  onClose,
}: OwnerMenuFormModalProps) {
  const isEditing = editItem !== null;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OwnerMenuFormValues>({
    mode: "onChange",
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name:        "",
      price:       0,
      category:    "",
      station:     "Kitchen",
      isAvailable: true,
      isSpecial:   false,
      variants:    [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  // Populate form when editing — reset when modal opens/closes
  // Deps: isOpen, editItem — reset whenever modal state changes
  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      reset({
        name:        editItem.name,
        price:       editItem.price,
        category:    editItem.category,
        station:     editItem.station,
        isAvailable: editItem.isAvailable,
        isSpecial:   editItem.isSpecial,
        variants:    editItem.variants,
      });
    } else {
      reset({
        name: "", price: 0, category: "", station: "Kitchen",
        isAvailable: true, isSpecial: false, variants: [],
      });
    }
  }, [isOpen, editItem, reset]);

  // Escape key handler
  // Deps: isOpen, onClose
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function onSubmit(values: OwnerMenuFormValues) {
    onSave(values);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-text-primary">
            {isEditing ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-page transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-5 py-5">

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary">Item Name *</label>
            <input
              {...register("name")}
              value={watch("name")}
              onChange={(e) => setValue("name", e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder="e.g. Paneer Tikka"
              className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
            />
            {errors.name && (
              <p className="text-[11px] text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Price + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">Price (₹) *</label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                min={0}
                value={watch("price") || ""}
                onChange={(e) => setValue("price", e.target.value ? Number(e.target.value) : 0, { shouldValidate: true, shouldDirty: true })}
                placeholder="280"
                className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
              />
              {errors.price && (
                <p className="text-[11px] text-danger">{errors.price.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary">Category *</label>
              <input
                {...register("category")}
                value={watch("category")}
                onChange={(e) => setValue("category", e.target.value, { shouldValidate: true, shouldDirty: true })}
                placeholder="e.g. Starters"
                className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
              />
              {errors.category && (
                <p className="text-[11px] text-danger">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Station */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary">Station *</label>
            <select
              {...register("station")}
              className="rounded-lg border border-border bg-input px-3 py-2 text-[13px] text-text-primary focus:border-border-focus focus:outline-none"
            >
              {STATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Toggles row */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register("isAvailable")}
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-[13px] text-text-primary">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register("isSpecial")}
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-[13px] text-text-primary">Special Item</span>
            </label>
          </div>

          {/* Variants */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-text-secondary">Variants</label>
              <button
                type="button"
                onClick={() => append({ name: "", price: 0 })}
                className="flex items-center gap-1 text-[12px] font-medium text-primary hover:opacity-70"
              >
                <Plus size={13} /> Add Variant
              </button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`variants.${index}.name`)}
                  placeholder="e.g. Half"
                  className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
                />
                <input
                  {...register(`variants.${index}.price`, { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="Price"
                  className="w-24 rounded-lg border border-border bg-input px-3 py-2 text-[12px] text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors"
                  aria-label="Remove variant"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Recipe Editor — only for existing items */}
          {isEditing && editItem && (
            <OwnerRecipeEditor
              itemId={editItem.id}
              currentRecipe={editItem.recipe}
              inventoryItems={inventoryItems}
              onSave={(recipe) => onSaveRecipe(editItem.id, recipe)}
            />
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isEditing ? "Save Changes" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
