"use client";

// RESPONSIBILITY: Owner Table QR Standee Generator page shell.
// Reads tables from localStorage, passes to OwnerQrGenerator.
// DATA FLOW: localStorage(app_tables) → OwnerQrGenerator → QR canvas grid

import { useEffect, useState } from "react";
import { OwnerQrGenerator } from "@/app/hotel-owner/hotel-owner_components/OwnerQrGenerator";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AppTable, TableSection } from "@/types/appTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Table QR Standee Generator"                              as const;
const PAGE_SUBTITLE = "Generate and print QR codes for customer self-ordering"  as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerQrPage() {
  const [tables, setTables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);
  const [tenantId, setTenantId] = useState<string>("");
  const [isMounted,  setIsMounted]  = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNum, setNewTableNum] = useState("");
  const [newSection, setNewSection] = useState<TableSection>("Dining");

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;

    const newTable: AppTable = {
      id: `tbl_${Date.now()}`,
      tableNumber: newTableNum.trim(),
      section: newSection,
      status: "AVAILABLE",
      currentOrderId: null,
      mergedTables: [],
    };
    
    setTables([...tables, newTable]);
    setNewTableNum("");
    setShowAddForm(false);
  };

  // Deps: [] — read tables once on mount
  useEffect(() => {
    setTenantId(window.localStorage.getItem("active_tenant_id") || "T-DEFAULT-01");
    setIsMounted(true);
  }, []);

  return (
    <AuthGuard allowedRoles={["HOTEL_OWNER"]}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
            <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            {showAddForm ? "Cancel" : "+ Add New Table"}
          </button>
        </div>

        {/* Add Table Form */}
        {showAddForm && (
          <form onSubmit={handleAddTable} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/3">
              <label className="text-xs font-bold text-text-secondary mb-1 block">Table Number</label>
              <input 
                type="text" 
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                placeholder="e.g. T-01"
                className="w-full rounded-xl border border-border bg-input p-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label className="text-xs font-bold text-text-secondary mb-1 block">Section</label>
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value as TableSection)}
                className="w-full rounded-xl border border-border bg-input p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="Dining">Dining</option>
                <option value="AC">AC</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-success px-6 py-2.5 text-sm font-bold text-white hover:bg-success/90 transition-colors"
            >
              Save Table
            </button>
          </form>
        )}

        {/* Content */}
        {!isMounted ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-52 rounded-xl" />
            ))}
          </div>
        ) : (
          <OwnerQrGenerator tables={tables} tenantId={tenantId} />
        )}
      </div>
    </AuthGuard>
  );
}
