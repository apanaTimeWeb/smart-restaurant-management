"use client";

// RESPONSIBILITY: Renders the customer_reservations data table with status badges,
// inline cancel confirm dialog (pessimistic UI), and per-tab empty state.
// Pure display component — no localStorage access.
// DATA FLOW: useCustomerReservations → customer_reservations/page.tsx → CustomerReservationsTable → UI

import React, { useState, useMemo } from "react";
import { XCircle, Loader2, CalendarX, Search, Filter } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { AppPagination } from "@/components/ui/AppPagination";
import type { CustomerReservationsTableProps } from "@/app/customer/reservations/customer_reservations_types/CustomerReservationsTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const STATUS_CONFIRMED = "CONFIRMED" as const;
const STATUS_CANCELLED = "CANCELLED" as const;

const STATUS_BADGE: Record<string, string> = {
  [STATUS_CONFIRMED]: "bg-info-bg text-info",
  [STATUS_CANCELLED]: "bg-danger-bg text-danger",
} as const;

const EMPTY_MESSAGES: Record<string, string> = {
  UPCOMING: "No upcoming customer_reservations",
  PAST:     "No past customer_reservations",
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Searchable, filterable, and paginated customer_reservations data table.
 * Columns: Slot Time | Customer | Phone | Table | Guests | Status | Actions
 * Cancel action shows an inline confirm row before executing (pessimistic UI).
 *
 * @param customer_reservations - Filtered list (upcoming or past) from useCustomerReservations
 * @param tab          - Active tab — used for empty state message
 * @param cancellingId - ID of reservation currently being cancelled
 * @param onCancel     - Callback to execute cancellation
 */
export function CustomerReservationsTable({
  customer_reservations,
  tab,
  cancellingId,
  onCancel,
}: CustomerReservationsTableProps) {
  // confirmId: which row is showing the inline confirm prompt
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter customer_reservations by search term & status
  const filtered = useMemo(() => {
    return customer_reservations.filter((res) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        res.customerName.toLowerCase().includes(q) ||
        res.phone.includes(q) ||
        res.tableId.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || res.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customer_reservations, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleCancelClick(id: string): void {
    setConfirmId(id);
  }

  function handleConfirm(id: string): void {
    setConfirmId(null);
    onCancel(id);
  }

  function handleDismiss(): void {
    setConfirmId(null);
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (customer_reservations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-text-secondary">
        <CalendarX size={36} className="opacity-40" />
        <p className="text-sm">{EMPTY_MESSAGES[tab] ?? "No customer_reservations"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Status Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, phone, table..."
            className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-text-disabled" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-border bg-input px-3 py-1.5 text-xs font-semibold text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed Only</option>
            <option value="CANCELLED">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-primary/5">
              {["Slot Time", "Customer", "Phone", "Table", "Guests", "Status", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-text-secondary">
                  No customer_reservations match your search or filter.
                </td>
              </tr>
            ) : (
              pageItems.map((res) => {
                const isConfirming = confirmId === res.id;
                const isCancelling = cancellingId === res.id;
                const badgeStyle = STATUS_BADGE[res.status] ?? "bg-card text-text-secondary";

                return (
                  <React.Fragment key={res.id}>
                    {/* Main data row */}
                    <tr className="border-b border-border last:border-0 odd:bg-card even:bg-page hover:bg-primary/5 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-[12px] text-text-secondary">
                        {formatDateTime(new Date(res.slotTime).getTime())}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {res.customerName}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-text-secondary">
                        {res.phone}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-medium text-text-primary">
                        {res.tableId}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-text-secondary">
                        {res.guestCount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeStyle}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {res.status === STATUS_CONFIRMED && (
                          <button
                            onClick={() => handleCancelClick(res.id)}
                            disabled={isCancelling}
                            aria-label={`Cancel reservation for ${res.customerName}`}
                            className="flex items-center gap-1 rounded-lg border border-danger/40 px-2.5 py-1 text-[12px] font-medium text-danger hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                          >
                            {isCancelling ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <XCircle size={12} />
                            )}
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Inline confirm row — shown below the target row */}
                    {isConfirming && (
                      <tr className="border-b border-danger/30 bg-danger-bg">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-[13px] font-medium text-danger">
                              Cancel reservation for <span className="font-bold">{res.customerName}</span>? This will free the table.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirm(res.id)}
                                className="rounded-lg bg-danger px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-danger/80 transition-colors"
                              >
                                Yes, Cancel
                              </button>
                              <button
                                onClick={handleDismiss}
                                className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold text-text-primary hover:bg-card transition-colors"
                              >
                                Keep
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <AppPagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
