"use client";

// RESPONSIBILITY: Waiter / Floor Captain page shell.
// Reads tables, orders, service requests from localStorage.
// Renders live Customer Service Call Bell panel, Chef Upsell Recommendations, WaiterTableGrid with KOT badges, and WaiterTableTransferModal.
// DATA FLOW: localStorage ↔ useLocalStorage ↔ WaiterPage ↔ WaiterTableGrid + Modals

import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, Map, Search, Filter, Languages, Bell, Droplets, Receipt, Sparkles, ArrowRightLeft, Check, ChefHat } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { WaiterTableGrid } from "@/app/waiter/waiter_components/WaiterTableGrid";
import { WaiterOrderModal } from "@/app/waiter/waiter_components/WaiterOrderModal";
import { WaiterTableActionsDrawer } from "@/app/waiter/waiter_components/WaiterTableActionsDrawer";
import { WaiterTableTransferModal } from "@/app/waiter/waiter_components/WaiterTableTransferModal";
import { useWaiterTableActions } from "@/app/waiter/waiter_hooks/useWaiterTableActions";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { formatCurrency, formatTime } from "@/lib/formatters";
import type { AppTable, AppOrder, AppServiceRequest, AppNotification } from "@/types/appTypes";
import type { WaiterViewMode, WaiterTableSection } from "@/app/waiter/waiter_types/WaiterTypes";
import { WaiterReadyQueue } from "@/app/waiter/waiter_components/WaiterReadyQueue";
import { WaiterServiceRequestsDrawer } from "@/app/waiter/waiter_components/WaiterServiceRequestsDrawer";
import { WaiterTableQrModal } from "@/app/waiter/waiter_components/WaiterTableQrModal";
import { showToast } from "@/lib/toastService";

const PAGE_TITLE = "Waiter / Floor Captain Terminal" as const;
const PAGE_SUBTITLE = "Manage tables, track live KOT status, acknowledge customer call bells, and take orders" as const;

const SECTION_TABS: WaiterTableSection[] = ["All", "Dining", "AC", "Outdoor"];
const SKELETON_COUNT = 8 as const;

export default function WaiterPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isServiceRequestsOpen, setIsServiceRequestsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { language, toggleLanguage } = useLanguage();

  const [tables, setTables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);
  const [orders, setOrders] = useLocalStorage<AppOrder[]>(STORAGE_KEYS.ORDERS, []);
  const [serviceRequests, setServiceRequests] = useLocalStorage<AppServiceRequest[]>(
    STORAGE_KEYS.SERVICE_REQUESTS,
    []
  );

  // UI state
  const [activeSection, setActiveSection] = useState<WaiterTableSection>("All");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<WaiterViewMode>("grid");

  // Modal states
  const [modalTableId, setModalTableId] = useState<string>("");
  const [modalTableNumber, setModalTableNumber] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [drawerTableId, setDrawerTableId] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Transfer / Merge Modal State
  const [transferSourceTable, setTransferSourceTable] = useState<AppTable | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // QR Modal state
  const [qrTable, setQrTable] = useState<AppTable | null>(null);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesSection = activeSection === "All" || t.section === activeSection;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.tableNumber.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      return matchesSection && matchesSearch && matchesStatus;
    });
  }, [tables, activeSection, search, statusFilter]);

  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(
    "app_notifications",
    []
  );

  const unreadPickupNotifs = useMemo(
    () => notifications.filter((n) => !n.isRead && n.type === "PICKUP_READY"),
    [notifications]
  );

  function handleDismissNotification(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  // Pending Customer Call Bell Requests
  const pendingRequests = serviceRequests.filter((r) => r.status === "PENDING");

  function handleAcknowledgeRequest(reqId: string) {
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "ACKNOWLEDGED" } : r))
    );
  }


  function handleTableClick(tableId: string) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const needsDrawer =
      table.status === "OCCUPIED" || table.status === "BILLING_PENDING";

    if (needsDrawer) {
      setDrawerTableId(table.id);
      setIsDrawerOpen(true);
    } else {
      setModalTableId(table.id);
      setModalTableNumber(table.tableNumber);
      setIsModalOpen(true);
    }
  }

  function handleOpenTransferModal(tableId: string) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    setTransferSourceTable(table);
    setIsTransferModalOpen(true);
    setIsDrawerOpen(false);
  }

  const { mergeTable, moveTable } = useWaiterTableActions();

  function handleConfirmTableTransfer(
    sourceTableId: string,
    targetTableId: string,
    mode: "TRANSFER" | "MERGE"
  ) {
    const source = tables.find((t) => t.id === sourceTableId);
    const target = tables.find((t) => t.id === targetTableId);
    if (!source || !target) return;

    if (mode === "TRANSFER") {
      if (source.currentOrderId) {
        moveTable(source.currentOrderId, sourceTableId, targetTableId);
      }
    } else {
      mergeTable(sourceTableId, targetTableId);
    }
  }

  function handleMarkTableCleaned(tableId: string) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // 1. Set table status to AVAILABLE
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: "AVAILABLE" as const, currentOrderId: null } : t))
    );

    // 2. Mark any pending CLEANING service requests for this table as COMPLETED
    const norm = (s: string) => (s || "").toLowerCase().replace(/^(table|tbl|t)-?/i, "").trim();
    const targetNorm = norm(table.tableNumber || table.id);

    setServiceRequests((prev) =>
      prev.map((r) =>
        r.type === "CLEANING" &&
        (r.status === "PENDING" || r.status === "ACKNOWLEDGED") &&
        (norm(r.tableId) === targetNorm || norm(r.tableNumber) === targetNorm)
          ? { ...r, status: "COMPLETED" as const, completedAt: Date.now() }
          : r
      )
    );

    showToast({
      type: "success",
      title: "Table Cleaned 🧹",
      message: `Table ${table.tableNumber} cleaned and now Available 🟢 for next guests!`,
    });
  }

  // Calculate Shift Performance metrics for Waiter
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const billingPendingCount = tables.filter((t) => t.status === "BILLING_PENDING").length;

  if (!isMounted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
        <WaiterPageHeader />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["WAITER", "ADMIN"]}>
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <WaiterPageHeader />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsServiceRequestsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-500 transition-all hover:bg-amber-500/20"
            >
              <Bell size={15} />
              <span>Service Requests</span>
              {pendingRequests.length > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                const occupiedTable = tables.find((t) => t.status === "OCCUPIED");
                if (occupiedTable) handleOpenTransferModal(occupiedTable.id);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              <ArrowRightLeft size={15} />
              <span>Transfer / Merge Table</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-page px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <Languages size={15} />
              {language === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </div>

        {/* Live Ready-to-Serve Queue */}
        <WaiterReadyQueue />


        {/* Live Kitchen Order Pickup Broadcast Alerts */}
        {unreadPickupNotifs.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-success/50 bg-success/10 p-3.5 animate-pulse shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat size={18} className="text-success animate-bounce" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-success">
                  Live Kitchen Pickup Alerts ({unreadPickupNotifs.length} Ready for Pickup)
                </h3>
              </div>
              <span className="text-[10px] text-text-secondary">Click Dismiss when picked up</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {unreadPickupNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-3 rounded-lg border border-success/30 bg-card px-3 py-2 text-xs shadow-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-text-primary">
                      {notif.title}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {notif.message}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDismissNotification(notif.id)}
                    className="flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-[10px] font-bold text-white hover:bg-success/90 transition-all"
                  >
                    <Check size={12} />
                    <span>Dismiss</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Customer Call Bell Requests Banner */}
        {pendingRequests.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-warning/50 bg-warning/10 p-3.5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-warning animate-bounce" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-warning">
                  Live Customer Service Call Bells ({pendingRequests.length} Pending)
                </h3>
              </div>
              <span className="text-[10px] text-text-secondary">Click Acknowledge when served</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-lg border border-warning/30 bg-card px-3 py-2 text-xs shadow-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-text-primary">
                      Table {req.tableNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-warning">
                      {req.type === "WATER"
                        ? "💧 Requested Water"
                        : req.type === "BILL"
                        ? "🧾 Requested Bill"
                        : req.type === "NAPKINS"
                        ? "🧻 Requested Extra Napkins"
                        : "🛎️ Waiter Call"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeRequest(req.id)}
                    className="flex items-center gap-1 rounded-md bg-warning px-2.5 py-1 text-[10px] font-bold text-white hover:bg-warning/90 transition-all"
                  >
                    <Check size={12} />
                    <span>Acknowledge</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Waiter Personal Shift Stats & Daily Chef Recommendation Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Active Dining Floor Status
              </span>
              <span className="text-[14px] font-bold text-text-primary">
                {occupiedCount} Occupied <span className="text-text-secondary">•</span> {billingPendingCount} Billing Pending
              </span>
            </div>
          </div>

          {/* Daily Chef Recommendation Hint */}
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
            <ChefHat size={16} className="text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-[11px]">Today's Chef Recommendation Tip:</span>
              <span className="text-text-secondary text-[11px]">
                Suggest <strong className="text-text-primary">Paneer Tikka & Mango Lassi</strong> to guests today!
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
          {/* Section tabs */}
          <div
            role="tablist"
            aria-label="Table sections"
            className="flex flex-wrap gap-1 rounded-lg border border-border bg-page p-1"
          >
            {SECTION_TABS.map((section) => (
              <button
                key={section}
                role="tab"
                aria-selected={activeSection === section}
                onClick={() => setActiveSection(section)}
                className={[
                  "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150",
                  activeSection === section
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Search, Status filter, and View toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search table #..."
                className="w-full rounded-md border border-border bg-input py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter size={13} className="text-text-disabled" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-input px-2.5 py-1.5 text-xs font-semibold text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="ALL">All Table Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="BILLING_PENDING">Billing Pending</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>

            <div
              role="group"
              aria-label="View mode"
              className="flex gap-1 rounded-lg border border-border bg-page p-1"
            >
              <ViewToggleButton
                label="Grid"
                icon={<LayoutGrid size={14} />}
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              />
              <ViewToggleButton
                label="Floor Map"
                icon={<Map size={14} />}
                active={viewMode === "floor-map"}
                onClick={() => setViewMode("floor-map")}
              />
            </div>
          </div>
        </div>

        {/* Table count summary */}
        <p className="text-[12px] text-text-secondary">
          {filteredTables.length} table{filteredTables.length !== 1 ? "s" : ""}{" "}
          {activeSection !== "All" ? `in ${activeSection}` : "across all sections"}
        </p>

        {/* Main Grid / Floor Map */}
        <WaiterTableGrid
          tables={filteredTables}
          orders={orders}
          viewMode={viewMode}
          onTableClick={handleTableClick}
          onQrClick={(table) => setQrTable(table)}
          onMarkCleaned={handleMarkTableCleaned}
        />

        {/* Modals */}
        <WaiterOrderModal
          tableId={modalTableId}
          tableNumber={modalTableNumber}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <WaiterTableActionsDrawer
          tableId={drawerTableId}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onAddItems={(tId) => {
            const table = tables.find((t) => t.id === tId);
            if (!table) return;
            setModalTableId(table.id);
            setModalTableNumber(table.tableNumber);
            setIsModalOpen(true);
          }}
          onViewQr={(table) => setQrTable(table)}
        />

        <WaiterTableQrModal
          table={qrTable}
          isOpen={qrTable !== null}
          onClose={() => setQrTable(null)}
        />

        <WaiterTableTransferModal
          isOpen={isTransferModalOpen}
          sourceTable={transferSourceTable}
          tables={tables}
          onTransferConfirm={handleConfirmTableTransfer}
          onClose={() => setIsTransferModalOpen(false)}
        />

        <WaiterServiceRequestsDrawer
          isOpen={isServiceRequestsOpen}
          onClose={() => setIsServiceRequestsOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}

function WaiterPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}

interface ViewToggleButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function ViewToggleButton({ label, icon, active, onClick }: ViewToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5",
        "text-[12px] font-semibold transition-colors duration-150",
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:text-text-primary",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
