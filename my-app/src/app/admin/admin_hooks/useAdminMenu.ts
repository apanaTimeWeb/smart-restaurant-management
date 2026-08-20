"use client";

// RESPONSIBILITY: All Menu CRUD logic for the Admin module.
// Reads/writes MENU, COMBOS, INVENTORY from localStorage via useLocalStorage.
// Provides add/update/delete/toggleAvailability for menu items,
// add/update/delete for combos, and saveRecipe for recipe linking.
// No JSX — pure logic hook consumed by admin/menu/page.tsx.
// DATA FLOW: localStorage → useLocalStorage → useAdminMenu → AdminMenuTable
//            + AdminMenuFormModal + AdminRecipeEditor + AdminComboEditor

import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppMenuItem, AppCombo, AppInventoryItem } from "@/types/appTypes";
import type { AdminMenuFormValues, UseAdminMenuReturn } from "@/app/admin/admin_types/AdminTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const ID_PREFIX_MENU  = "menu" as const;
const ID_PREFIX_COMBO = "combo" as const;

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/** Generates a timestamped unique ID with given prefix. */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

/** Maps AdminMenuFormValues → AppMenuItem (new item). */
function buildMenuItem(values: AdminMenuFormValues): AppMenuItem {
  return {
    id:          generateId(ID_PREFIX_MENU),
    name:        values.name,
    price:       values.price,
    category:    values.category,
    station:     values.station,
    isAvailable: values.isAvailable,
    isSpecial:   values.isSpecial,
    variants:    values.variants,
    recipe:      [],
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages all Admin Menu CRUD operations.
 * All writes go through useLocalStorage setters — no direct localStorage access.
 *
 * @returns menuItems, combos, inventoryItems, CRUD handlers, isSubmitting
 */
export function useAdminMenu(): UseAdminMenuReturn {
  // Rule 61: No direct localStorage — hooks only
  const [menuItems,      setMenuItems]      = useLocalStorage<AppMenuItem[]>     (STORAGE_KEYS.MENU,    []);
  const [combos,         setCombos]         = useLocalStorage<AppCombo[]>        (STORAGE_KEYS.COMBOS,  []);
  const [inventoryItems]                    = useLocalStorage<AppInventoryItem[]>(STORAGE_KEYS.INVENTORY, []);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── Menu Item CRUD ─────────────────────────────────────────────────────────

  /**
   * Adds a new menu item built from validated form values.
   * Pessimistic: isSubmitting blocks double-submit.
   */
  const addMenuItem = useCallback((values: AdminMenuFormValues) => {
    setIsSubmitting(true);
    setMenuItems((prev) => [...prev, buildMenuItem(values)]);
    setIsSubmitting(false);
  }, [setMenuItems]);

  /**
   * Updates an existing menu item by id with new form values.
   * Preserves existing recipe — recipe is managed separately via saveRecipe.
   */
  const updateMenuItem = useCallback((id: string, values: AdminMenuFormValues) => {
    setIsSubmitting(true);
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          name:        values.name,
          price:       values.price,
          category:    values.category,
          station:     values.station,
          isAvailable: values.isAvailable,
          isSpecial:   values.isSpecial,
          variants:    values.variants,
        };
      })
    );
    setIsSubmitting(false);
  }, [setMenuItems]);

  /**
   * Removes a menu item by id.
   */
  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }, [setMenuItems]);

  /**
   * Flips the isAvailable flag for a menu item.
   */
  const toggleAvailability = useCallback((id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  }, [setMenuItems]);

  /**
   * Saves the recipe ingredient list for a specific menu item.
   */
  const saveRecipe = useCallback(
    (itemId: string, recipe: AppMenuItem["recipe"]) => {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, recipe } : item))
      );
    },
    [setMenuItems]
  );

  // ── Combo CRUD ─────────────────────────────────────────────────────────────

  /**
   * Adds a new combo with a generated id.
   */
  const addCombo = useCallback((combo: Omit<AppCombo, "id">) => {
    setCombos((prev) => [...prev, { ...combo, id: generateId(ID_PREFIX_COMBO) }]);
  }, [setCombos]);

  /**
   * Updates an existing combo by id.
   */
  const updateCombo = useCallback((id: string, updates: Omit<AppCombo, "id">) => {
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...updates, id } : c))
    );
  }, [setCombos]);

  /**
   * Removes a combo by id.
   */
  const deleteCombo = useCallback((id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  }, [setCombos]);

  return {
    menuItems,
    combos,
    inventoryItems,
    isSubmitting,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    addCombo,
    updateCombo,
    deleteCombo,
    saveRecipe,
  };
}
