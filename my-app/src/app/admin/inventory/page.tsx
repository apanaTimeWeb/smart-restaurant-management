"use client";

// RESPONSIBILITY: Admin Stock Inventory page shell.
// Shows low stock + expiry alert banners, AdminInventoryTable, and AdminSupplierPoModal.
// DATA FLOW: useAdminInventory → AdminInventoryTable & AdminSupplierPoModal → UI

import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, ShoppingCart } from "lucide-react";
import { useAdminInventory } from "@/app/admin/admin_hooks/useAdminInventory";
import { AdminInventoryTable } from "@/app/admin/admin_components/AdminInventoryTable";
import { AdminSupplierPoModal } from "@/app/admin/admin_components/AdminSupplierPoModal";
import { AdminLowStockSlaTracker } from "@/app/admin/admin_components/AdminLowStockSlaTracker";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { AdminAddInventoryModal } from "@/app/admin/admin_components/AdminAddInventoryModal";
import { Plus } from "lucide-react";

const PAGE_TITLE = "Stock Inventory & Supplier PO Requisitions" as const;
const PAGE_SUBTITLE = "Monitor stock levels, threshold alerts, expiry dates, and generate supplier Purchase Orders" as const;
const SKELETON_ROWS = 6 as const;

export default function AdminInventoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { inventoryItems, lowStockItems, expiringItems, updateStock, addInventoryItem, deleteInventoryItem, updateExpiryDate } = useAdminInventory();

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <InventoryPageHeader />
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["ADMIN", "HOTEL_OWNER", "KITCHEN"]}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <InventoryPageHeader />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Add Inventory Item</span>
            </button>
            {lowStockItems.length > 0 && (
              <button
                onClick={() => setIsPoModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-warning px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-warning/90 transition-all active:scale-95"
              >
                <ShoppingCart size={16} />
                <span>Generate PO ({lowStockItems.length} Low)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Kitchen Low Stock SLA Tracker & 24-Hour Escalation Monitor */}
        <AdminLowStockSlaTracker />

        {/* Low stock alert banner */}
        {lowStockItems.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-warning bg-warning-bg px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="shrink-0 text-warning" />
              <p className="text-[13px] font-medium text-warning">
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} below safety threshold:{" "}
                <span className="font-bold">{lowStockItems.map((i) => i.name).join(", ")}</span>
              </p>
            </div>
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="text-xs font-bold text-warning underline hover:opacity-80"
            >
              Generate PO Draft →
            </button>
          </div>
        )}

        {/* Expiry alert banner */}
        {expiringItems.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-danger bg-danger-bg px-4 py-3">
            <AlertCircle size={16} className="shrink-0 text-danger" />
            <p className="text-[13px] font-medium text-danger">
              {expiringItems.length} item{expiringItems.length > 1 ? "s" : ""} expiring soon:{" "}
              <span className="font-bold">{expiringItems.map((i) => i.name).join(", ")}</span>
            </p>
          </div>
        )}

        <AdminInventoryTable
          inventoryItems={inventoryItems}
          onUpdateStock={updateStock}
          onDelete={deleteInventoryItem}
          onUpdateExpiry={updateExpiryDate}
        />

        <AdminSupplierPoModal
          isOpen={isPoModalOpen}
          lowStockItems={lowStockItems}
          onClose={() => setIsPoModalOpen(false)}
        />

        <AdminAddInventoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addInventoryItem}
        />
      </div>
    </AuthGuard>
  );
}

function InventoryPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
