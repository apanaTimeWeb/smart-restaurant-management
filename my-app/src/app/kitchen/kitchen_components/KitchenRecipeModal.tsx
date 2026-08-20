"use client";

// RESPONSIBILITY: Modal showing recipe specs, ingredients, prep instructions, portion size, and allergen warnings for a menu item.
// DATA FLOW: KitchenKotCard / KitchenStockToggle → setRecipeItemId → KitchenRecipeModal → UI

import { useMemo } from "react";
import { X, BookOpen, Utensils, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppMenuItem } from "@/types/appTypes";
import type { KitchenRecipeModalProps, KitchenRecipeSpec } from "@/app/kitchen/kitchen_types/KitchenTypes";

// Mock recipe database lookup fallback
const RECIPE_DATABASE: Record<string, KitchenRecipeSpec> = {
  default: {
    itemId: "default",
    name: "Standard Recipe Spec",
    station: "Kitchen",
    portionSize: "1 Portion (350g)",
    prepTimeEstimateMins: 12,
    ingredients: ["Fresh seasonal produce", "Signature spice blend", "Refined cooking oil", "Garnish herbs"],
    instructions: [
      "Prep ingredients according to portion standard.",
      "Sear on medium-high heat until golden brown.",
      "Add signature seasoning blend and simmer for 5 minutes.",
      "Garnish with fresh herbs and transfer to warm serving dish.",
    ],
    allergens: ["Gluten", "Dairy"],
    spiceLevel: "Medium",
  },
};

export function KitchenRecipeModal({ isOpen, itemId, onClose }: KitchenRecipeModalProps) {
  const [menuItems] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  const menuItem = useMemo(
    () => menuItems.find((m) => m.id === itemId),
    [menuItems, itemId]
  );

  const recipeSpec = useMemo<KitchenRecipeSpec>(() => {
    if (!itemId) return RECIPE_DATABASE.default;
    
    // Check if we have item-specific or dynamic mock spec
    return {
      itemId,
      name: menuItem?.name ?? itemId,
      station: menuItem?.station ?? "Kitchen",
      portionSize: "1 Standard Serving",
      prepTimeEstimateMins: 12,
      ingredients: [
        `${menuItem?.name ?? itemId} base portion`,
        "Chef's special marinade & oil",
        "Aromatic spices & seasonings",
        "Fresh green garnish & citrus wedge",
      ],
      instructions: [
        "Clean and measure raw ingredients according to standard recipe card.",
        "Pre-heat station skillet or grill to target temperature.",
        "Sauté / Cook items thoroughly, ensuring core temp exceeds safety limits.",
        "Plate neatly with fresh garnish and notify waiter dispatch.",
      ],
      allergens: menuItem?.name.toLowerCase().includes("paneer") || menuItem?.name.toLowerCase().includes("cheese")
        ? ["Dairy", "Lactose"]
        : menuItem?.name.toLowerCase().includes("naan") || menuItem?.name.toLowerCase().includes("pizza")
        ? ["Gluten", "Wheat"]
        : ["May contain traces of nuts/dairy"],
      spiceLevel: menuItem?.name.toLowerCase().includes("spicy") ? "Spicy" : "Medium",
    };
  }, [itemId, menuItem]);

  if (!isOpen || !itemId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recipe card for ${recipeSpec.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{recipeSpec.name}</h2>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Station: {recipeSpec.station}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-page hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Recipe Body */}
        <div className="mt-4 flex flex-col gap-4 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-3 border border-border/40">
            <div className="flex flex-col gap-0.5">
              <span className="text-text-secondary font-medium">Portion Size</span>
              <span className="font-bold text-text-primary">{recipeSpec.portionSize}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-secondary font-medium">Est. Prep Time</span>
              <span className="font-bold text-text-primary flex items-center gap-1">
                <Clock size={12} className="text-info" /> {recipeSpec.prepTimeEstimateMins} mins
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-secondary font-medium">Spice Level</span>
              <span className="font-bold text-warning">{recipeSpec.spiceLevel}</span>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-text-primary flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Utensils size={14} className="text-primary" /> Key Ingredients & Ratios
            </h3>
            <ul className="grid grid-cols-2 gap-1.5 rounded-lg border border-border/40 bg-page p-3 text-text-primary">
              {recipeSpec.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cooking Instructions */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-text-primary flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <BookOpen size={14} className="text-info" /> Step-by-Step Preparation
            </h3>
            <ol className="flex flex-col gap-2 rounded-lg border border-border/40 bg-page p-3 text-text-primary">
              {recipeSpec.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Allergens & Warnings */}
          <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-bg/40 p-3 text-warning">
            <ShieldAlert size={18} className="shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold">Allergen Information</span>
              <span className="text-[11px]">Contains: {recipeSpec.allergens.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Close Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Close Spec Card
          </button>
        </div>
      </div>
    </div>
  );
}
