"use client";

// RESPONSIBILITY: OwnerReservations page shell.
// Composes OwnerReservationsTable + OwnerReservationsFormModal.
// All data logic delegated to useOwnerReservations hook.
// isMounted guard prevents SSR/client hydration mismatch.
// DATA FLOW: useOwnerReservations → upcoming + past + availableTables
//            → OwnerReservationsTable + OwnerReservationsFormModal → UI

import { useState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { useOwnerReservations } from "@/app/hotel-owner/reservations/owner_reservations_hooks/useOwnerReservations";
import { OwnerReservationsTable } from "@/app/hotel-owner/reservations/owner_reservations_components/OwnerReservationsTable";
import { OwnerReservationsFormModal } from "@/app/hotel-owner/reservations/owner_reservations_components/OwnerReservationsFormModal";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { OwnerReservationsTab } from "@/app/hotel-owner/reservations/owner_reservations_types/OwnerReservationsTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Advance OwnerReservations"                      as const;
const PAGE_SUBTITLE = "Manage table bookings and customer slots"  as const;

const TABS: { label: string; value: OwnerReservationsTab }[] = [
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Past",     value: "PAST"     },
] as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerReservationsPage() {
  // isMounted guard — prevents SSR/client hydration mismatch
  // Deps: [] — run once on mount only
  const [isMounted,   setIsMounted]   = useState(false);
  const [activeTab,   setActiveTab]   = useState<OwnerReservationsTab>("UPCOMING");
  const [modalOpen,   setModalOpen]   = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 6: All data + mutation logic in hook — page is pure shell
  const {
    upcoming,
    past,
    availableTables,
    isSubmitting,
    cancellingId,
    addReservation,
    cancelReservation,
  } = useOwnerReservations();

  const activeOwnerReservations = activeTab === "UPCOMING" ? upcoming : past;

  function handleOpenModal(): void {
    setModalOpen(true);
  }

  function handleCloseModal(): void {
    setModalOpen(false);
  }

  // ── Skeleton — shown before client mounts ─────────────────────────────────
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <OwnerReservationsPageHeader
          activeTab={activeTab}
          upcomingCount={0}
          pastCount={0}
          onTabChange={setActiveTab}
          onNewReservation={handleOpenModal}
        />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <AuthGuard allowedRoles={["ADMIN", "WAITER", "CUSTOMER"]}>
      <div className="flex flex-col gap-6">
        <OwnerReservationsPageHeader
          activeTab={activeTab}
          upcomingCount={upcoming.length}
          pastCount={past.length}
          onTabChange={setActiveTab}
          onNewReservation={handleOpenModal}
        />

        <OwnerReservationsTable
          owner_reservations={activeOwnerReservations}
          tab={activeTab}
          cancellingId={cancellingId}
          onCancel={cancelReservation}
        />
      </div>

      {/* Add Reservation Modal */}
      <OwnerReservationsFormModal
        isOpen={modalOpen}
        availableTables={availableTables}
        isSubmitting={isSubmitting}
        onSubmit={addReservation}
        onClose={handleCloseModal}
      />
    </AuthGuard>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// RESPONSIBILITY: Page header — title, tab switcher, and New Reservation button.
interface OwnerReservationsPageHeaderProps {
  activeTab:        OwnerReservationsTab;
  upcomingCount:    number;
  pastCount:        number;
  onTabChange:      (tab: OwnerReservationsTab) => void;
  onNewReservation: () => void;
}

function OwnerReservationsPageHeader({
  activeTab,
  upcomingCount,
  pastCount,
  onTabChange,
  onNewReservation,
}: OwnerReservationsPageHeaderProps) {
  const counts: Record<OwnerReservationsTab, number> = {
    UPCOMING: upcomingCount,
    PAST:     pastCount,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title + New button row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
          <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
        </div>

        <button
          onClick={onNewReservation}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <CalendarPlus size={15} />
          <span className="hidden sm:inline">New Reservation</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  activeTab === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-primary-subtle text-primary"
                }`}
              >
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
