"use client";

// RESPONSIBILITY: Full-screen z-40 overlay modal for order punching.
// Left panel: searchable menu browser with category tabs.
// Right panel: WaiterCartSummary with KOT submit.
// Delegates all cart logic to useWaiterOrder hook (Rule 6).
// DATA FLOW: waiter/page.tsx → WaiterOrderModal → useWaiterOrder + WaiterMenuItemCard + WaiterCartSummary

import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, SendHorizonal } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useWaiterOrder } from "@/app/waiter/waiter_hooks/useWaiterOrder";
import { WaiterMenuItemCard } from "./WaiterMenuItemCard";
import { WaiterCartSummary } from "./WaiterCartSummary";
import type { AppMenuItem } from "@/types/appTypes";
import type { WaiterOrderModalProps } from "@/app/waiter/waiter_types/WaiterTypes";

// ─── Constants (Rule 35: No magic strings / numbers) ─────────────────────────

const CATEGORY_ALL        = "All"      as const;
const DEBOUNCE_MS         = 300        as const;
const SEND_KOT_LABEL      = "Send KOT" as const;
const MODAL_TITLE         = "New Order" as const;

const CATEGORY_TABS = [
  CATEGORY_ALL,
  "Starters",
  "Main Course",
  "Breads",
  "Beverages",
  "Desserts",
] as const;

type CategoryTab = (typeof CATEGORY_TABS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Order punching modal — opens when a table card is clicked.
 * Renders a two-panel layout: menu browser (left) + cart summary (right).
 * Traps focus and closes on Escape key.
 */
export function WaiterOrderModal({
  tableId,
  tableNumber,
  isOpen,
  onClose,
}: WaiterOrderModalProps) {
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  const [activeCategory, setActiveCategory] = useState<CategoryTab>(CATEGORY_ALL);
  const [searchRaw, setSearchRaw]           = useState("");
  const [searchQuery, setSearchQuery]       = useState("");
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    cart,
    detectedCombos,
    happyHourDiscount,
    subtotal,
    kotNumber,
    addToCart,
    removeFromCart,
    updateQty,
    updateNotes,
    submitKOT,
    clearCart,
    setActiveTableId,
  } = useWaiterOrder();

  // Set active table when modal opens so kotNumber is correct
  // Why isOpen + tableId in deps: re-run whenever modal opens for a new table
  useEffect(() => {
    if (!isOpen) return;
    setActiveTableId(tableId);
    searchRef.current?.focus();
  }, [isOpen, tableId, setActiveTableId]);

  // Debounced search — Rule 15: debounce 300ms
  // Why searchRaw in deps: trigger on every keystroke, debounce the state update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(searchRaw), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchRaw]);

  // Close on Escape key
  // Why isOpen in deps: only attach listener when modal is visible
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered menu — memoized (Rule 6: logic in memo, not JSX)
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        activeCategory === CATEGORY_ALL || item.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  function handleClose() {
    clearCart();
    setSearchRaw("");
    setSearchQuery("");
    setActiveCategory(CATEGORY_ALL);
    onClose();
  }

  const [selectedPriority, setSelectedPriority] = useState<"NORMAL" | "RUSH" | "VIP">("NORMAL");

  function handleSendKOT() {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    submitKOT(tableId, tableNumber, selectedPriority);
    setIsSubmitting(false);
    handleClose();
  }

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-40 flex items-stretch bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Order for Table ${tableNumber}`}
    >
      {/* Modal card — full height, two-panel */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-none bg-card shadow-2xl shadow-black/50 sm:m-4 sm:rounded-xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[18px] font-bold text-text-primary">{MODAL_TITLE}</h2>
            <p className="text-[12px] text-text-secondary">Table {tableNumber}</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close order modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-danger hover:text-danger"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Body — two panels ────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: Menu browser */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-border">

            {/* Search */}
            <div className="shrink-0 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 focus-within:border-border-focus">
                <Search size={14} className="shrink-0 text-text-disabled" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  placeholder="Search menu..."
                  aria-label="Search menu items"
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-disabled focus:outline-none"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div
              role="tablist"
              aria-label="Menu categories"
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-4 py-2"
            >
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu items grid — scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMenu.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <p className="text-[13px] text-text-secondary">No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMenu.map((item) => (
                    <WaiterMenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart summary */}
          <div className="flex w-72 shrink-0 flex-col overflow-hidden xl:w-80">
            <div className="flex flex-1 flex-col overflow-hidden p-4">
              <WaiterCartSummary
                cart={cart}
                detectedCombos={detectedCombos}
                happyHourDiscount={happyHourDiscount}
                subtotal={subtotal}
                kotNumber={kotNumber}
                onUpdateQty={updateQty}
                onUpdateNotes={updateNotes}
                onRemove={removeFromCart}
              />
            </div>

            {/* Priority Selector & Send KOT footer */}
            <div className="shrink-0 flex flex-col gap-2 border-t border-border p-4">
              {/* Order Priority Selector */}
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="text-[11px] font-semibold text-text-secondary uppercase">Priority:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPriority("NORMAL")}
                    className={[
                      "rounded px-2 py-0.5 text-[10px] font-bold transition-colors",
                      selectedPriority === "NORMAL" ? "bg-surface text-text-primary border border-border" : "text-text-secondary hover:text-text-primary",
                    ].join(" ")}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPriority("RUSH")}
                    className={[
                      "rounded px-2 py-0.5 text-[10px] font-bold transition-colors",
                      selectedPriority === "RUSH" ? "bg-danger text-white" : "text-danger hover:bg-danger-bg",
                    ].join(" ")}
                  >
                    🔥 RUSH
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPriority("VIP")}
                    className={[
                      "rounded px-2 py-0.5 text-[10px] font-bold transition-colors",
                      selectedPriority === "VIP" ? "bg-warning text-black" : "text-warning hover:bg-warning-bg",
                    ].join(" ")}
                  >
                    ⭐ VIP
                  </button>
                </div>
              </div>

              <button
                onClick={handleSendKOT}
                disabled={cart.length === 0 || isSubmitting}
                aria-label="Send KOT to kitchen"
                className={[
                  "flex w-full items-center justify-center gap-2 rounded-lg py-3",
                  "text-[14px] font-semibold text-white transition-all",
                  cart.length === 0 || isSubmitting
                    ? "cursor-not-allowed bg-primary/40"
                    : "bg-primary hover:bg-primary-hover active:scale-95",
                ].join(" ")}
              >
                <SendHorizonal size={16} aria-hidden="true" />
                {SEND_KOT_LABEL} {selectedPriority !== "NORMAL" ? `(${selectedPriority})` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

