"use client";

// RESPONSIBILITY: Global Search & Command Palette Modal (Ctrl+K / Cmd+K).
// Allows searching across Tables, Active Orders, Menu Catalog, Invoices, Customers, and Staff.
// DATA FLOW: Keyboard Event -> CommandPaletteModal -> Navigation / Action

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useRouter } from "next/navigation";
import type {
  AppTable,
  AppOrder,
  AppMenuItem,
  AppSalesRecord,
  AppCrmCustomer,
  AppUser,
} from "@/types/appTypes";
import {
  Search,
  Utensils,
  Table as TableIcon,
  ShoppingBag,
  Receipt,
  Users,
  UserCheck,
  X,
  ChevronRight,
} from "lucide-react";

export function CommandPaletteModal(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const [tables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);
  const [orders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [menu] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);
  const [sales] = useLocalStorage<AppSalesRecord[]>(STORAGE_KEYS.SALES_HISTORY, []);
  const [customers] = useLocalStorage<AppCrmCustomer[]>(STORAGE_KEYS.CRM_CUSTOMERS, []);
  const [users] = useLocalStorage<AppUser[]>(STORAGE_KEYS.USERS, []);

  // Shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchedTables = trimmed
    ? tables.filter((t) => t.tableNumber.toLowerCase().includes(trimmed) || t.section.toLowerCase().includes(trimmed))
    : tables.slice(0, 3);

  const matchedMenu = trimmed
    ? menu.filter((m) => m.name.toLowerCase().includes(trimmed) || m.category.toLowerCase().includes(trimmed))
    : menu.slice(0, 3);

  const matchedOrders = trimmed
    ? orders.filter((o) => o.tableNumber.toLowerCase().includes(trimmed) || o.id.toLowerCase().includes(trimmed))
    : orders.slice(0, 3);

  const matchedSales = trimmed
    ? sales.filter((s) => s.id.toLowerCase().includes(trimmed) || s.tableNumber.toLowerCase().includes(trimmed))
    : [];

  const matchedCustomers = trimmed
    ? customers.filter((c) => c.name.toLowerCase().includes(trimmed) || c.phone.includes(trimmed))
    : [];

  const handleSelect = (route: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(route);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-auto max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-page/50">
          <Search className="h-5 w-5 text-text-muted shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tables, menu, orders, customers..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-text-muted hover:bg-page hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tables */}
          {matchedTables.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
                Tables
              </p>
              <div className="space-y-1">
                {matchedTables.map((tbl) => (
                  <button
                    key={tbl.id}
                    onClick={() => handleSelect("/waiter")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <TableIcon className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{tbl.tableNumber}</span>
                      <span className="text-xs text-text-muted">({tbl.section})</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-page text-text-secondary">
                      {tbl.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Catalog */}
          {matchedMenu.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
                Menu Items
              </p>
              <div className="space-y-1">
                {matchedMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect("/admin/menu")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <Utensils className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-text-muted">({item.category})</span>
                    </div>
                    <span className="text-xs font-bold text-primary">₹{item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Orders */}
          {matchedOrders.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
                Active Orders
              </p>
              <div className="space-y-1">
                {matchedOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => handleSelect("/billing")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">Order {ord.id}</span>
                      <span className="text-xs text-text-muted">Table {ord.tableNumber}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500">{ord.kots.length} KOTs</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchedSales.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
                Recent Invoices
              </p>
              <div className="space-y-1">
                {matchedSales.map((sale) => (
                  <button
                    key={sale.id}
                    onClick={() => handleSelect("/billing")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">{sale.id}</span>
                      <span className="text-xs text-text-muted">Table {sale.tableNumber}</span>
                    </div>
                    <span className="text-xs font-bold text-text-primary">₹{sale.totalAmount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
                Customers
              </p>
              <div className="space-y-1">
                {matchedCustomers.map((c) => (
                  <button
                    key={c.phone}
                    onClick={() => handleSelect("/billing")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-xs text-text-muted">({c.phone})</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-500">{c.loyaltyPoints} pts</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-page/50 px-4 py-2 text-[11px] text-text-muted">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1 font-mono">
            <kbd className="rounded bg-surface border border-border px-1.5 py-0.5">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
