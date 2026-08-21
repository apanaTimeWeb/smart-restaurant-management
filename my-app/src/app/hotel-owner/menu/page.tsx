"use client";

// RESPONSIBILITY: Owner Menu & Item Master page shell.
// Two tabs: "Menu Items" and "Combos & Happy Hours".
// "+ Add Item" button opens OwnerMenuFormModal.
// Wires useOwnerMenu hook to OwnerMenuTable, OwnerMenuFormModal, OwnerComboEditor.
// DATA FLOW: useOwnerMenu → OwnerMenuTable + OwnerMenuFormModal + OwnerComboEditor → UI

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useOwnerMenu } from "@/app/hotel-owner/hotel-owner_hooks/useOwnerMenu";
import { OwnerMenuTable } from "@/app/hotel-owner/hotel-owner_components/OwnerMenuTable";
import { OwnerMenuFormModal } from "@/app/hotel-owner/hotel-owner_components/OwnerMenuFormModal";
import { OwnerComboEditor } from "@/app/hotel-owner/hotel-owner_components/OwnerComboEditor";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { AppMenuItem } from "@/types/appTypes";
import type { OwnerMenuFormValues } from "@/app/hotel-owner/hotel-owner_types/OwnerTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Menu & Item Master"          as const;
const PAGE_SUBTITLE = "Add, edit, and manage menu items, recipes, combos & happy hours" as const;
const TAB_MENU      = "menu"                        as const;
const TAB_COMBOS    = "combos"                      as const;
const SKELETON_ROWS = 5                             as const;

type ActiveTab = typeof TAB_MENU | typeof TAB_COMBOS;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerMenuPage() {
  // Hydration guard — prevents SSR/client mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Deps: [] — run once on mount only
  useEffect(() => { setIsMounted(true); }, []);

  const {
    menuItems,
    combos,
    inventoryItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    addCombo,
    updateCombo,
    deleteCombo,
    saveRecipe,
  } = useOwnerMenu();

  const [activeTab,   setActiveTab]   = useState<ActiveTab>(TAB_MENU);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editItem,    setEditItem]    = useState<AppMenuItem | null>(null);

  function handleAddClick() {
    setEditItem(null);
    setIsModalOpen(true);
  }

  function handleEditClick(item: AppMenuItem) {
    setEditItem(item);
    setIsModalOpen(true);
  }

  function handleModalSave(values: OwnerMenuFormValues) {
    if (editItem) {
      updateMenuItem(editItem.id, values);
    } else {
      addMenuItem(values);
    }
  }

  function handleDeleteMenuItem(id: string) {
    deleteMenuItem(id);
  }

  function handleDeleteCombo(id: string) {
    deleteCombo(id);
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <MenuPageHeader onAddClick={() => undefined} />
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["HOTEL_OWNER"]}>
      <div className="flex flex-col gap-6">
        <MenuPageHeader onAddClick={handleAddClick} />

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
          {([TAB_MENU, TAB_COMBOS] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors",
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {tab === TAB_MENU ? "Menu Items" : "Combos & Happy Hours"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === TAB_MENU && (
          <OwnerMenuTable
            menuItems={menuItems}
            onEdit={handleEditClick}
            onDelete={handleDeleteMenuItem}
            onToggleAvailability={toggleAvailability}
          />
        )}

        {activeTab === TAB_COMBOS && (
          <OwnerComboEditor
            combos={combos}
            menuItems={menuItems}
            onAdd={addCombo}
            onUpdate={updateCombo}
            onDelete={handleDeleteCombo}
          />
        )}

        {/* Add/Edit modal */}
        <OwnerMenuFormModal
          isOpen={isModalOpen}
          editItem={editItem}
          inventoryItems={inventoryItems}
          onSave={handleModalSave}
          onSaveRecipe={saveRecipe}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Static page header with title, subtitle, and Add Item button.
function MenuPageHeader({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
        <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
      </div>
      <button
        onClick={onAddClick}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
      >
        <Plus size={15} />
        Add Item
      </button>
    </div>
  );
}
