"use client";

// RESPONSIBILITY: Online Advance Table Booking & Zero-Wait Pre-Ordering System (`/owner_reservations/book`).
// Customer selects Date, Time, and Guest Count (e.g. 10 Persons).
// Calculates per-person deposit (10 x â‚¹100 = â‚¹1,000), collects payment via multi-gateway,
// and opens the Zero-Wait Pre-Order Menu Screen to select dishes prior to arrival.
// Saved customer profile persistence ensures zero re-entering of contact info!
// DATA FLOW: owner_reservations/book/page.tsx -> createAdvanceReservation() -> STORAGE_KEYS.ADVANCE_RESERVATIONS

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Receipt,
  Smartphone,
  ShieldCheck,
  Landmark,
  X,
  User,
  Phone,
  Mail,
} from "lucide-react";

import { getTenantById, getActiveTenants, createAdvanceReservation } from "@/lib/tenantService";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { AppMenuItem, AppTenant, AppPreOrderItem } from "@/types/appTypes";
export const dynamic = 'force-dynamic';

const ADVANCE_RATE_PER_PERSON = 100 as const; // â‚¹100 per guest

function AdvanceReservationBookingPageContent() {
  const searchParams = useSearchParams();
  const tenantIdParam = searchParams.get("tenant") || "tenant-royal-spice-01";

  const { currentUser, login, signupCustomer, isHydrated } = useAuth();

  const [tenant, setTenant] = useState<AppTenant | null>(null);
  const [menuItems] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  // Form State
  const [bookingDate, setBookingDate] = useState<string>("2026-08-16");
  const [bookingTime, setBookingTime] = useState<string>("19:30");
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone || "");
      setCustomerEmail(currentUser.email || "");
    }
  }, [currentUser]);

  // Booking Flow Steps: 1 = Form & Payment, 2 = Pre-Order Menu, 3 = Confirmation
  const [step, setStep] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentTxnId, setPaymentTxnId] = useState<string>("");
  const [preOrders, setPreOrders] = useState<AppPreOrderItem[]>([]);
  const [reservationId, setReservationId] = useState<string>("");

  useEffect(() => {
    const found = getTenantById(tenantIdParam);
    if (found) {
      setTenant(found);
    } else {
      const active = getActiveTenants();
      if (active.length > 0) setTenant(active[0]);
    }
  }, [tenantIdParam]);

  const totalAdvanceDeposit = useMemo(() => guestCount * ADVANCE_RATE_PER_PERSON, [guestCount]);

  const handlePayAdvanceDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const txnId = `TXN_RES_${Date.now().toString().slice(-6)}`;
    setPaymentTxnId(txnId);
    setIsPaymentModalOpen(false);

    // Save initial reservation
    const res = createAdvanceReservation({
      tenantId: tenant?.tenantId || tenantIdParam,
      customerName,
      customerPhone,
      customerEmail,
      guestCount,
      perPersonAdvance: ADVANCE_RATE_PER_PERSON,
      totalAdvanceDeposit,
      bookingDate,
      bookingTime,
      paymentStatus: "PAID",
      paymentTxnId: txnId,
      preOrderItems: [],
      status: "CONFIRMED",
    });

    setReservationId(res.id);
    setStep(2); // Proceed to Zero-Wait Pre-Ordering
  };

  const handleAddPreOrderItem = (item: AppMenuItem) => {
    setPreOrders((prev) => {
      const existing = prev.find((p) => p.itemId === item.id);
      if (existing) {
        return prev.map((p) => (p.itemId === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { itemId: item.id, name: item.name, qty: 1, unitPrice: item.price }];
    });
  };

  const handleUpdatePreOrderQty = (itemId: string, delta: number) => {
    setPreOrders((prev) => {
      return prev
        .map((p) => {
          if (p.itemId === itemId) {
            const nextQty = p.qty + delta;
            return nextQty > 0 ? { ...p, qty: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as AppPreOrderItem[];
    });
  };

  if (!isHydrated) {
    return null;
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-page text-text-primary min-h-screen">
        <UtensilsCrossed size={40} className="text-primary mb-2" />
        <p className="text-sm font-bold">Loading Restaurant Booking Engineâ€¦</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={tenant.logoUrl}
              alt={tenant.restaurantName}
              className="h-14 w-14 rounded-2xl object-cover border border-border"
            />
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                {tenant.restaurantName}
              </h1>
              <p className="text-xs text-text-secondary">
                ðŸ“ {tenant.address} Â· {tenant.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1 text-xs font-extrabold text-primary">
              Online Advance Booking
            </span>
          </div>
        </div>

        {/* â”€â”€ STEP 0: Authentication Gateway â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {!currentUser && (
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full text-center mt-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <User size={32} />
            </div>
            <div>
              <h2 className="font-black text-2xl text-text-primary mb-2">
                Authentication Required
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Please log in or create a customer account to continue with your advance table booking.
              </p>
            </div>
            
            <Link 
              href={`/auth/login?redirect=${encodeURIComponent(`/owner_reservations/book?tenant=${tenantIdParam}`)}`}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-black text-white hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <User size={18} />
              Continue to Login / Sign Up
            </Link>
          </div>
        )}

        {/* â”€â”€ STEP 1: Booking Details & Advance Deposit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {currentUser && step === 1 && (
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-black text-lg text-text-primary">
                  1. Reserve Table & Deposit
                </h2>
                <p className="text-xs text-text-secondary">
                  Guaranteed dining table arrangement + zero waiting time
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500">
                â‚¹{ADVANCE_RATE_PER_PERSON} / Guest Deposit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Booking Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Number of Guests (Persons)
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Saved Profile Customer Details */}
            <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Saved Guest Profile Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-text-muted block mb-0.5">Guest Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card p-2 text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-0.5">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card p-2 text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card p-2 text-xs text-text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Advance Deposit Summary Card */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted">Calculated Advance Deposit</p>
                <p className="font-black text-2xl text-emerald-500">
                  â‚¹{totalAdvanceDeposit}{" "}
                  <span className="text-xs font-bold text-text-secondary">
                    ({guestCount} Persons Ã— â‚¹{ADVANCE_RATE_PER_PERSON})
                  </span>
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  100% adjusted against your final food bill at table checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-black text-xs text-white shadow-xl hover:bg-emerald-600 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <CreditCard size={16} />
                <span>Pay â‚¹{totalAdvanceDeposit} Deposit & Book</span>
              </button>
            </div>
          </div>
        )}

        {/* â”€â”€ STEP 2: Zero-Wait Pre-Order Menu Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-text-primary">
                    Advance Table Reserved! (Txn ID: {paymentTxnId})
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Date: {bookingDate} at {bookingTime} Â· {guestCount} Persons
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-md"
              >
                <span>Confirm & Done</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Zero-Wait Pre-Ordering Menu */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                  <h2 className="font-black text-base text-text-primary">
                    2. Zero-Wait Pre-Order Dishes (Optional)
                  </h2>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  Dishes will be ready upon arrival
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {menuItems.map((item) => {
                  const pre = preOrders.find((p) => p.itemId === item.id);
                  const qty = pre ? pre.qty : 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-surface/50"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-text-primary">{item.name}</h4>
                        <p className="text-[11px] font-black text-emerald-500 mt-0.5">â‚¹{item.price}</p>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => handleAddPreOrderItem(item)}
                          className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-500 hover:bg-emerald-500 hover:text-white"
                        >
                          <Plus size={13} />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center rounded-xl border border-emerald-500/50 bg-emerald-500/15 p-0.5">
                          <button
                            onClick={() => handleUpdatePreOrderQty(item.id, -1)}
                            className="h-6 w-6 rounded-lg bg-surface text-emerald-500 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 font-black text-xs text-text-primary">{qty}</span>
                          <button
                            onClick={() => handleUpdatePreOrderQty(item.id, 1)}
                            className="h-6 w-6 rounded-lg bg-emerald-500 text-white font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pre-Order Summary Bar */}
              {preOrders.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-500 p-4 text-white shadow-xl">
                  <div>
                    <p className="text-xs font-medium">Pre-Ordered Items ({preOrders.length})</p>
                    <p className="font-black text-base">
                      Subtotal: â‚¹{preOrders.reduce((s, p) => s + p.unitPrice * p.qty, 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1 rounded-xl bg-white/20 px-4 py-2 text-xs font-extrabold text-white"
                  >
                    <span>Finalize Booking</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ STEP 3: Final Confirmation Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-emerald-500/40 bg-card shadow-2xl gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-3xl">
              ðŸŽ‰
            </div>
            <h2 className="text-2xl font-black text-text-primary">
              Table Reservation Confirmed!
            </h2>
            <p className="text-xs text-text-secondary max-w-sm">
              We look forward to serving you at <strong>{tenant.restaurantName}</strong> on {bookingDate} at {bookingTime}.
            </p>
            <div className="rounded-2xl border border-border bg-surface p-4 text-xs font-bold text-text-primary w-full max-w-xs">
              <p>Advance Paid: â‚¹{totalAdvanceDeposit}</p>
              <p className="text-[11px] text-text-muted font-normal mt-0.5">Pre-Ordered Dishes: {preOrders.length} item(s)</p>
            </div>
            <Link
              href="/"
              className="mt-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90"
            >
              Back to Marketplace
            </Link>
          </div>
        )}
      </div>

      {/* Multi-Option Deposit Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CreditCard size={20} />
                <span>Advance Deposit Payment Gateway</span>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-4">
              <p className="text-xs text-text-muted">Table Deposit ({guestCount} Guests)</p>
              <p className="font-black text-xl text-emerald-500">â‚¹{totalAdvanceDeposit}</p>
            </div>

            <form onSubmit={handlePayAdvanceDeposit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-2">
                  <Smartphone size={16} /> PhonePe / UPI
                </div>
                <div className="p-3 rounded-xl border border-border bg-input text-text-secondary text-xs font-bold flex items-center gap-2">
                  <CreditCard size={16} /> Card / NetBanking
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-black text-xs text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
              >
                <span>Complete â‚¹{totalAdvanceDeposit} Deposit Payment</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvanceReservationBookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20 text-sm font-bold">Loading Booking Engine...</div>}>
      <AdvanceReservationBookingPageContent />
    </Suspense>
  );
}
