"use client";

// RESPONSIBILITY: Hotel Owner & Admin Reservations Management Module (`/owner/reservations`).
// Displays incoming advance table reservations, guest counts, paid advance deposit (e.g. ₹1,000),
// pre-ordered dishes, and assigned table numbers.
// DATA FLOW: tenantService -> STORAGE_KEYS.ADVANCE_RESERVATIONS -> owner/reservations/page.tsx -> UI

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Users,
  CreditCard,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Search,
  Building2,
} from "lucide-react";
import { getStoredAdvanceReservations } from "@/lib/tenantService";
import type { AppAdvanceReservation } from "@/types/appTypes";

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<AppAdvanceReservation[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const activeTenantId = typeof window !== "undefined" ? localStorage.getItem("active_tenant_id") : null;
    const allReservations = getStoredAdvanceReservations();
    
    if (activeTenantId && activeTenantId !== "SUPER_ADMIN") {
      setReservations(allReservations.filter((r) => r.tenantId === activeTenantId));
    } else {
      setReservations(allReservations);
    }
  }, []);

  const filtered = reservations.filter(
    (r) =>
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (r.customerPhone && r.customerPhone.includes(search)) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
              <CalendarCheck size={26} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                Advance Table Reservations & Pre-Orders
              </h1>
              <p className="text-xs text-text-secondary">
                Live manager tracking for guest deposits, person count & zero-wait pre-ordered dishes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/owner/dashboard"
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-extrabold text-text-secondary hover:text-text-primary"
            >
              Owner Dashboard
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or phone…"
            className="w-full rounded-xl border border-border bg-input py-2 pl-9 pr-3 text-xs text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted border border-dashed border-border rounded-2xl bg-card">
            <CalendarCheck size={48} className="mb-3 text-blue-500 opacity-60" />
            <h3 className="font-bold text-base text-text-primary">No Advance Reservations Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs">
              Upcoming bookings from the public marketplace will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-text-primary">
                      {res.customerName}
                    </h3>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500">
                      {res.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                    <span>📞 {res.customerPhone}</span>
                    <span>📅 Date: <strong>{res.bookingDate}</strong></span>
                    <span>⏰ Time: <strong>{res.bookingTime}</strong></span>
                    <span>👥 Guests: <strong className="text-primary">{res.guestCount} Persons</strong></span>
                  </div>

                  {res.preOrderItems && res.preOrderItems.length > 0 && (
                    <div className="mt-1 rounded-xl bg-surface p-2.5 border border-border/50 text-xs">
                      <p className="font-extrabold text-[11px] text-amber-500 mb-1">
                        🍲 Zero-Wait Pre-Ordered Dishes:
                      </p>
                      <div className="flex flex-wrap gap-2 text-text-primary">
                        {res.preOrderItems.map((p) => (
                          <span key={p.itemId} className="bg-card px-2 py-0.5 rounded border text-[11px] font-bold">
                            {p.name} × {p.qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 border-t md:border-t-0 border-border/50 pt-3 md:pt-0 w-full md:w-auto">
                  <span className="text-xs text-text-muted">Advance Deposit Paid</span>
                  <span className="text-lg font-black text-emerald-500">₹{res.totalAdvanceDeposit}</span>
                  <span className="text-[10px] text-text-muted font-mono">Txn: {res.paymentTxnId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
