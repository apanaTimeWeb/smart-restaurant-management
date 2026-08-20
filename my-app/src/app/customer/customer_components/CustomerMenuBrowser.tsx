"use client";

// RESPONSIBILITY: Ultra-premium mobile menu browser for Customer QR self-ordering.
// Renders hero restaurant header, category pills, dietary filters, search,
// responsive 2-to-4 column Grid Box layout with pagination, interactive +/- steppers,
// and sticky bottom order bar.
// DATA FLOW: customer/page.tsx -> CustomerMenuBrowser -> UI

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Sparkles,
  Clock,
  UtensilsCrossed,
  X,
  ChevronRight,
  ChevronLeft,
  Receipt,
  LayoutGrid,
} from "lucide-react";
import type { AppMenuItem } from "@/types/appTypes";
import type {
  CustomerDietaryFilter,
  CustomerMenuBrowserProps,
} from "@/app/customer/customer_types/CustomerTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8 as const; // 8 Box Cards per page

const DIETARY_TABS: { label: string; value: CustomerDietaryFilter }[] = [
  { label: "All Items", value: "ALL" },
  { label: "Veg 🟢", value: "VEG" },
  { label: "Non-Veg 🔴", value: "NON_VEG" },
  { label: "Jain 🟡", value: "JAIN" },
];

const NON_VEG_KEYWORDS = ["chicken", "mutton", "fish", "prawn", "egg", "meat", "tikka masala non-veg"] as const;
const JAIN_SAFE_KEYWORDS = [
  "jain",
  "veg",
  "paneer",
  "dal",
  "roti",
  "naan",
  "rice",
  "lassi",
  "chai",
  "soda",
  "coffee",
  "gulab",
  "rasgulla",
  "kulfi",
  "brownie",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isNonVeg(item: AppMenuItem): boolean {
  const lower = item.name.toLowerCase();
  return NON_VEG_KEYWORDS.some((kw) => lower.includes(kw));
}

function isJainSafe(item: AppMenuItem): boolean {
  const lower = item.name.toLowerCase();
  if (isNonVeg(item)) return false;
  return JAIN_SAFE_KEYWORDS.some((kw) => lower.includes(kw));
}

function matchesDietaryFilter(item: AppMenuItem, filter: CustomerDietaryFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "NON_VEG") return isNonVeg(item);
  if (filter === "VEG") return !isNonVeg(item);
  if (filter === "JAIN") return isJainSafe(item);
  return true;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Vertical Grid Card Box Component with interactive Stepper Action
function MenuItemCardBox({
  item,
  cartQty,
  onAdd,
  onUpdateQty,
}: {
  item: AppMenuItem;
  cartQty: number;
  onAdd: (itemId: string) => void;
  onUpdateQty?: (itemId: string, delta: number) => void;
}) {
  const isNonVegItem = isNonVeg(item);

  return (
    <div
      className={`group relative flex flex-col justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${
        cartQty > 0
          ? "border-emerald-500/50 bg-emerald-500/5 shadow-md ring-1 ring-emerald-500/30"
          : "border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md"
      }`}
    >
      {/* Top Header Badge: FSSAI Symbol + Special Tag */}
      <div className="flex items-center justify-between gap-1.5">
        <div
          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-xs border-2 ${
            isNonVegItem ? "border-red-500 bg-red-500/5" : "border-emerald-500 bg-emerald-500/5"
          }`}
          title={isNonVegItem ? "Non-Vegetarian" : "Vegetarian"}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isNonVegItem ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
        </div>

        {item.isSpecial && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-500">
            <Star size={9} className="fill-amber-500" />
            Special
          </span>
        )}
      </div>

      {/* Dish Name & Metadata */}
      <div className="flex flex-col gap-1 my-0.5">
        <h3 className="font-extrabold text-sm sm:text-base text-text-primary leading-snug line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        <div className="flex items-center justify-between gap-1 text-[11px] text-text-muted mt-0.5">
          <span className="font-semibold text-text-secondary truncate">{item.category}</span>
          <span className="flex items-center gap-0.5 shrink-0">
            <Clock size={10} /> 15-20m
          </span>
        </div>

        {item.variants && item.variants.length > 0 && (
          <p className="text-[10px] text-text-muted/80 line-clamp-1 mt-0.5 font-medium">
            {item.variants.map((v) => `${v.name} ₹${v.price}`).join(" · ")}
          </p>
        )}
      </div>

      {/* Bottom Price & Full Width Stepper Button */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-text-muted font-medium">Price</span>
          <span className="font-black text-base sm:text-lg text-text-primary">
            ₹{item.price}
          </span>
        </div>

        {!item.isAvailable ? (
          <span className="w-full text-center rounded-xl border border-border bg-page py-2 text-xs font-bold text-text-disabled">
            Out of Stock
          </span>
        ) : cartQty === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(item.id)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2 text-xs font-extrabold text-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95 transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>ADD</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-500/15 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => (onUpdateQty ? onUpdateQty(item.id, -1) : null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-90 transition-all font-bold"
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="font-black text-sm text-text-primary px-2">
              {cartQty}
            </span>
            <button
              type="button"
              onClick={() => onAdd(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 active:scale-90 transition-all font-bold"
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerMenuBrowser({
  menuItems,
  cart,
  activeOrder,
  onAddToCart,
  onOpenCart,
  onViewRunningOrder,
  onUpdateQty,
}: CustomerMenuBrowserProps) {
  const [search, setSearch] = useState<string>("");
  const [dietaryFilter, setDietaryFilter] = useState<CustomerDietaryFilter>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Cart Quantities Map
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) {
      map.set(item.itemId, (map.get(item.itemId) || 0) + item.qty);
    }
    return map;
  }, [cart]);

  const cartQtyTotal = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, c) => sum + (c.unitPrice * c.qty), 0), [cart]);

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    return menuItems.filter((item) => {
      const matchesSearch = query === "" || item.name.toLowerCase().includes(query);
      const matchesDietary = matchesDietaryFilter(item, dietaryFilter);
      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
      return matchesSearch && matchesDietary && matchesCat;
    });
  }, [menuItems, search, dietaryFilter, selectedCategory]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dietaryFilter, selectedCategory]);

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Categories List
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category)));
    return ["ALL", ...cats];
  }, [menuItems]);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Top Header & Restaurant Branding Bar */}
      <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-header/90 p-4 backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-text-primary tracking-tight">
                Royal Spice Bistro 🍽️
              </h1>
              <p className="text-xs text-text-secondary flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Self-Order Menu
              </p>
            </div>
          </div>

          {/* Cart Icon trigger top-right */}
          {cartQtyTotal > 0 && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <ShoppingCart size={15} />
              <span>Cart</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-700 text-[11px] font-black">
                {cartQtyTotal}
              </span>
            </button>
          )}
        </div>

        {/* Active Running Order Notification Bar */}
        {activeOrder && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <div>
                <p className="font-extrabold text-text-primary">Active Dining Order</p>
                <p className="text-[10px] text-text-secondary">Dishes prep status live on KDS</p>
              </div>
            </div>
            {onViewRunningOrder && (
              <button
                onClick={onViewRunningOrder}
                className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-extrabold text-black shadow-xs hover:bg-amber-400 active:scale-95 transition-all"
              >
                <Receipt size={12} />
                <span>Track Order</span>
              </button>
            )}
          </div>
        )}

        {/* Search Input Box */}
        <div className="relative mt-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search favorite dishes, starters, drinks…"
            className="w-full rounded-2xl border border-border/80 bg-input/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Carousel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 pb-0.5">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? "bg-text-primary text-page shadow-xs"
                    : "border border-border/70 bg-card text-text-secondary hover:border-text-primary hover:text-text-primary"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>

        {/* Dietary Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {DIETARY_TABS.map((tab) => {
            const isSelected = dietaryFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setDietaryFilter(tab.value)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "border border-border/70 bg-card text-text-secondary hover:border-emerald-500 hover:text-emerald-500"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Menu Feed (Responsive 2/3/4 Card Box Grid + Pagination) */}
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2 text-text-primary">
            <LayoutGrid size={16} className="text-emerald-500" />
            <h2 className="font-extrabold text-sm sm:text-base">
              {selectedCategory === "ALL" ? "All Dishes" : selectedCategory}
            </h2>
          </div>
          <span className="text-xs font-bold text-text-muted">
            Showing {filteredItems.length} dish{filteredItems.length !== 1 ? "es" : ""}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
            <Search size={44} className="mb-3 opacity-40" />
            <h3 className="font-bold text-base text-text-primary">No Menu Items Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs">
              Try resetting your search query or dietary filters to view the full menu.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setDietaryFilter("ALL");
                setSelectedCategory("ALL");
              }}
              className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-text-primary hover:bg-page transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid Box Cards Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {paginatedItems.map((item) => (
                <MenuItemCardBox
                  key={item.id}
                  item={item}
                  cartQty={cartQtyMap.get(item.id) || 0}
                  onAdd={onAddToCart}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs mt-4">
                <span className="text-xs font-bold text-text-secondary">
                  Page <strong className="text-text-primary">{currentPage}</strong> of{" "}
                  <strong className="text-text-primary">{totalPages}</strong> ({filteredItems.length} total items)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-page disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setCurrentPage(pNum)}
                          className={`h-7 w-7 rounded-lg text-xs font-extrabold transition-all ${
                            currentPage === pNum
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "border border-border text-text-secondary hover:text-text-primary hover:border-emerald-500"
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-page disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Floating Bottom Order Bar */}
      {cartQtyTotal > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
          <button
            type="button"
            onClick={onOpenCart}
            className="flex w-full items-center justify-between rounded-2xl bg-emerald-500 px-5 py-3.5 text-white shadow-xl hover:bg-emerald-600 active:scale-98 transition-all ring-4 ring-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 font-black text-sm text-white">
                {cartQtyTotal}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm">View Cart Summary</span>
                <span className="text-xs text-white/90 font-medium">
                  Total: <strong className="font-black">₹{cartSubtotal}</strong> + Taxes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-extrabold text-xs bg-white/20 px-3 py-1.5 rounded-xl">
              <span>Checkout</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
