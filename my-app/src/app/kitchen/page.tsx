"use client";

// RESPONSIBILITY: Kitchen KDS page shell.
// Manages station tab state, stock view, completed orders history, recipe spec modal, thermal ticket modal, and analytics.
// Delegates KDS data logic to useKitchenKds hook.
// Renders KitchenKpiSummaryBar, KitchenKotGrid, KitchenCompletedOrdersView, KitchenStockToggle, KitchenWasteLogModal, KitchenRecipeModal, KitchenTicketModal, KitchenAnalyticsModal.
// DATA FLOW: useKitchenKds → metrics / filteredKots / completedKots → KDS grid / modals → UI

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, History } from "lucide-react";
import { useKitchenKds } from "@/app/kitchen/kitchen_hooks/useKitchenKds";
import { KitchenKpiSummaryBar } from "@/app/kitchen/kitchen_components/KitchenKpiSummaryBar";
import { KitchenKotGrid } from "@/app/kitchen/kitchen_components/KitchenKotGrid";
import { KitchenCompletedOrdersView } from "@/app/kitchen/kitchen_components/KitchenCompletedOrdersView";
import { KitchenStockToggle } from "@/app/kitchen/kitchen_components/KitchenStockToggle";
import { KitchenWasteLogModal } from "@/app/kitchen/kitchen_components/KitchenWasteLogModal";
import { KitchenRecipeModal } from "@/app/kitchen/kitchen_components/KitchenRecipeModal";
import { KitchenTicketModal } from "@/app/kitchen/kitchen_components/KitchenTicketModal";
import { KitchenAnalyticsModal } from "@/app/kitchen/kitchen_components/KitchenAnalyticsModal";
import { KitchenConsolidatedItemsModal } from "@/app/kitchen/kitchen_components/KitchenConsolidatedItemsModal";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { playKitchenBell } from "@/lib/audioHelper";
import { Layers } from "lucide-react";
import type { KitchenStationTab, KitchenFlatKot } from "@/app/kitchen/kitchen_types/KitchenTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Kitchen KDS" as const;
const PAGE_SUBTITLE = "Live KOT feed — oldest orders first" as const;

const STATION_TABS: KitchenStationTab[] = ["All", "Kitchen", "Bar", "Bakery"];

const STATION_TAB_LABELS: Record<KitchenStationTab, string> = {
  All:     "All Stations",
  Kitchen: "Main Kitchen",
  Bar:     "Bar / Drinks",
  Bakery:  "Bakery / Desserts",
};

const STOCK_TAB_KEY     = "Stock"     as const;
const COMPLETED_TAB_KEY = "Completed" as const;

type PageTab = KitchenStationTab | typeof STOCK_TAB_KEY | typeof COMPLETED_TAB_KEY;

const SKELETON_COUNT = 4 as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KitchenPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<PageTab>("All");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen]   = useState(false);
  const [isConsolidatedOpen, setIsConsolidatedOpen] = useState(false);
  const [recipeItemId, setRecipeItemId]         = useState<string | null>(null);
  const [ticketKot, setTicketKot]               = useState<KitchenFlatKot | null>(null);
  const [stockInitialFilter, setStockInitialFilter] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK">("ALL");


  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevKotCountRef = useRef<number>(0);

  const activeStationTab: KitchenStationTab =
    activeTab === STOCK_TAB_KEY || activeTab === COMPLETED_TAB_KEY ? "All" : activeTab;

  const {
    allFlatKots,
    filteredKots,
    completedKots,
    metrics,
    savingKey,
    updateKotItemStatus,
    batchUpdateKotStatus,
    handleVoidDecision,
    broadcastPickupNotification,
    recallCompletedKot,
    setItemPrepTime,
  } = useKitchenKds(activeStationTab);

  // Trigger audio alert when new KOT arrives
  useEffect(() => {
    const currentCount = allFlatKots.length;
    if (currentCount > prevKotCountRef.current && prevKotCountRef.current !== 0) {
      if (!isMuted && audioRef.current) {
        audioRef.current.play().catch((err) => console.warn("Audio play blocked by browser:", err));
      }
    }
    prevKotCountRef.current = currentCount;
  }, [allFlatKots.length, isMuted]);

  // Filter KOTs by search term & item status
  const searchedAndFilteredKots = useMemo(() => {
    return filteredKots.filter((kot) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        kot.kotId.toLowerCase().includes(q) ||
        kot.tableNumber.toLowerCase().includes(q) ||
        kot.items.some((i) => i.itemId.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" ||
        kot.items.some((i) => i.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [filteredKots, search, statusFilter]);

  // KOT count per station tab
  const kotCounts = useMemo(() => {
    const counts: Record<PageTab, number> = {
      All:       allFlatKots.length,
      Kitchen:   allFlatKots.filter((k) => k.station === "Kitchen").length,
      Bar:       allFlatKots.filter((k) => k.station === "Bar").length,
      Bakery:    allFlatKots.filter((k) => k.station === "Bakery").length,
      Stock:     0,
      Completed: completedKots.length,
    };
    return counts;
  }, [allFlatKots, completedKots]);

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <KitchenPageHeader />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["KITCHEN", "ADMIN"]}>
      <div className="flex flex-col gap-6">
        <KitchenPageHeader onOpenConsolidated={() => setIsConsolidatedOpen(true)} />

        {/* Live KPI & SLA Summary Bar */}
        <KitchenKpiSummaryBar
          metrics={metrics}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onTestSound={() => playKitchenBell()}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onSelectStockTab={(filter) => {
            setActiveTab("Stock");
            if (filter) setStockInitialFilter(filter);
          }}
        />

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
          {/* Tab bar — station tabs + Stock tab + Completed tab */}
          <div
            role="tablist"
            aria-label="Kitchen views"
            className="flex flex-wrap gap-1 rounded-lg border border-border bg-page p-1"
          >
            {/* Station tabs */}
            {STATION_TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                  "text-[12px] font-semibold transition-colors duration-150",
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {STATION_TAB_LABELS[tab]}
                {kotCounts[tab] > 0 && (
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      activeTab === tab
                        ? "bg-white/20 text-white"
                        : "bg-danger-bg text-danger",
                    ].join(" ")}
                  >
                    {kotCounts[tab]}
                  </span>
                )}
              </button>
            ))}

            <span className="mx-1 self-center text-border">|</span>

            {/* Stock tab */}
            <button
              role="tab"
              aria-selected={activeTab === STOCK_TAB_KEY}
              onClick={() => setActiveTab(STOCK_TAB_KEY)}
              className={[
                "rounded-md px-3 py-1.5",
                "text-[12px] font-semibold transition-colors duration-150",
                activeTab === STOCK_TAB_KEY
                  ? "bg-warning-bg text-warning"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              Stock & Waste
            </button>

            {/* Completed Orders History Tab */}
            <button
              role="tab"
              aria-selected={activeTab === COMPLETED_TAB_KEY}
              onClick={() => setActiveTab(COMPLETED_TAB_KEY)}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                "text-[12px] font-semibold transition-colors duration-150",
                activeTab === COMPLETED_TAB_KEY
                  ? "bg-success-bg text-success"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              <History size={13} />
              Completed ({completedKots.length})
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        {activeTab !== STOCK_TAB_KEY && activeTab !== COMPLETED_TAB_KEY && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID or table..."
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
                <option value="ALL">All Item Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="COOKING">Cooking Only</option>
                <option value="READY">Ready Only</option>
              </select>
            </div>
          </div>
        )}

        {/* ── KOT Active Feed View ── */}
        {activeTab !== STOCK_TAB_KEY && activeTab !== COMPLETED_TAB_KEY && (
          <>
            <p className="text-[12px] text-text-secondary">
              {searchedAndFilteredKots.length} active KOT{searchedAndFilteredKots.length !== 1 ? "s" : ""}{" "}
              {activeTab !== "All"
                ? `at ${STATION_TAB_LABELS[activeTab]}`
                : "across all stations"}
            </p>
            <KitchenKotGrid
              kots={searchedAndFilteredKots}
              onStatusChange={(kotId, itemId, status) => {
                const kot = allFlatKots.find((k) => k.kotId === kotId);
                if (!kot) return;
                updateKotItemStatus(kot.orderId, kotId, itemId, status);
              }}
              onBatchStatusChange={batchUpdateKotStatus}
              onVoidDecision={handleVoidDecision}
              onItemPrepTimeSet={setItemPrepTime}
              onOpenRecipe={(itemId) => setRecipeItemId(itemId)}
              onOpenTicket={(kot) => setTicketKot(kot)}
              onNotifyWaiter={broadcastPickupNotification}
              savingKey={savingKey}
            />
          </>
        )}

        {/* ── Stock & Waste View ── */}
        {activeTab === STOCK_TAB_KEY && (
          <KitchenStockToggle
            onOpenWasteLog={() => setIsWasteModalOpen(true)}
            onOpenRecipe={(itemId) => setRecipeItemId(itemId)}
            initialFilter={stockInitialFilter}
          />
        )}

        {/* ── Completed Orders View ── */}
        {activeTab === COMPLETED_TAB_KEY && (
          <KitchenCompletedOrdersView
            completedKots={completedKots}
            onRecallKot={recallCompletedKot}
          />
        )}

        {/* Modals */}
        <KitchenWasteLogModal
          isOpen={isWasteModalOpen}
          onClose={() => setIsWasteModalOpen(false)}
        />

        <KitchenRecipeModal
          isOpen={!!recipeItemId}
          itemId={recipeItemId}
          onClose={() => setRecipeItemId(null)}
        />

        <KitchenTicketModal
          isOpen={!!ticketKot}
          kot={ticketKot}
          onClose={() => setTicketKot(null)}
        />

        <KitchenAnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
        />

        <KitchenConsolidatedItemsModal
          isOpen={isConsolidatedOpen}
          onClose={() => setIsConsolidatedOpen(false)}
          activeStation={activeStationTab}
        />

        <audio
          ref={audioRef}
          src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          preload="auto"
        />
      </div>
    </AuthGuard>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KitchenPageHeader({ onOpenConsolidated }: { onOpenConsolidated?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
        <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
      </div>

      {onOpenConsolidated && (
        <button
          onClick={onOpenConsolidated}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
        >
          <Layers className="h-4 w-4" />
          <span>Consolidated Items View</span>
        </button>
      )}
    </div>
  );
}



