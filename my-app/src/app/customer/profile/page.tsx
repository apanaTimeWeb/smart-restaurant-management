"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { getStoredAdvanceReservations, getTenantById } from "@/lib/tenantService";
import type { AppAdvanceReservation, AppTenant } from "@/types/appTypes";
import { CalendarCheck, ChevronLeft, MapPin, Clock, CalendarDays } from "lucide-react";

type ReservationWithTenant = AppAdvanceReservation & { tenant: AppTenant | null };

export default function CustomerProfilePage() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<ReservationWithTenant[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === "CUSTOMER") {
      const allReservations = getStoredAdvanceReservations();
      // Filter reservations by customer's phone number
      const userReservations = allReservations.filter((r) => r.customerPhone === currentUser.phone);
      
      // Attach tenant info
      const withTenants = userReservations.map((r) => ({
        ...r,
        tenant: getTenantById(r.tenantId),
      }));

      // Sort by latest first
      withTenants.sort((a, b) => b.createdAt - a.createdAt);
      setReservations(withTenants);
    }
  }, [currentUser]);

  if (!isMounted) return null;

  return (
    <AuthGuard allowedRoles={["CUSTOMER"]}>
      <div className="min-h-screen bg-page text-text-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-text-secondary hover:text-text-primary hover:bg-surface transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-text-primary">
                My Profile
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Hi, {currentUser?.name}! Here are your advance bookings.
              </p>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-lg flex items-center gap-2 mb-2">
              <CalendarCheck size={20} className="text-primary" />
              My Advance Bookings
            </h2>

            {reservations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-text-muted mb-4">
                  <CalendarCheck size={28} />
                </div>
                <h3 className="font-bold text-lg mb-1">No Bookings Yet</h3>
                <p className="text-sm text-text-muted max-w-sm mb-6">
                  You haven't made any advance reservations yet. Go discover top restaurants and book a table!
                </p>
                <Link
                  href="/"
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-extrabold text-white hover:bg-primary/90 shadow-md active:scale-95 transition-all"
                >
                  Explore Restaurants
                </Link>
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-lg text-text-primary">
                        {res.tenant ? res.tenant.restaurantName : "Unknown Hotel"}
                      </h3>
                      {res.tenant && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                          <MapPin size={12} />
                          {res.tenant.city}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                          res.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : res.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : res.status === "CANCELLED"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-surface text-text-secondary border-border"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>

                  <hr className="my-4 border-border" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-secondary">
                        <CalendarDays size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Date</p>
                        <p className="text-sm font-bold text-text-primary">{res.bookingDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-secondary">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Time</p>
                        <p className="text-sm font-bold text-text-primary">{res.bookingTime}</p>
                      </div>
                    </div>
                  </div>

                  {res.preOrderItems && res.preOrderItems.length > 0 && (
                    <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                      <p className="text-[10px] text-amber-600 uppercase font-extrabold tracking-wider mb-2">
                        Pre-Ordered Dishes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {res.preOrderItems.map((item, idx) => (
                          <span key={idx} className="bg-card px-2 py-1 rounded text-xs font-bold text-text-primary border border-border shadow-xs">
                            {item.name} <span className="text-text-muted">x{item.qty}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs bg-surface p-3 rounded-xl border border-border">
                    <span className="text-text-secondary font-semibold">Advance Paid:</span>
                    <span className="font-black text-emerald-500 text-sm">₹{res.totalAdvanceDeposit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
