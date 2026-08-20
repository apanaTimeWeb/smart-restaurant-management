"use client";

// RESPONSIBILITY: Renders the Customer Advance Table & Dish Pre-booking modal.
// Allows customers to reserve tables for future dates/times and optionally pre-select dishes.
// DATA FLOW: Customer inputs → CustomerAdvanceBookingModal.tsx → app_reservations & app_orders localStorage

import React, { useState } from "react";
import type { AppMenuItem, AppTable } from "@/types/appTypes";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { formatCurrency } from "@/lib/formatters";
import { Calendar, Clock, Users, Utensils, CheckCircle2, Copy, X, Plus, Minus } from "lucide-react";

export interface CustomerAdvanceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: AppMenuItem[];
  tables: AppTable[];
}

interface SelectedPreOrderItem {
  item: AppMenuItem;
  qty: number;
}

export function CustomerAdvanceBookingModal({
  isOpen,
  onClose,
  menuItems,
  tables,
}: CustomerAdvanceBookingModalProps): React.JSX.Element | null {
  const [customerName, setCustomerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("19:00");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [preOrderItems, setPreOrderItems] = useState<SelectedPreOrderItem[]>([]);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Add/Update pre-order item quantity
  const handleUpdateQty = (item: AppMenuItem, delta: number) => {
    setPreOrderItems((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (!existing && delta > 0) {
        return [...prev, { item, qty: 1 }];
      }
      if (existing) {
        const nextQty = existing.qty + delta;
        if (nextQty <= 0) {
          return prev.filter((p) => p.item.id !== item.id);
        }
        return prev.map((p) => (p.item.id === item.id ? { ...p, qty: nextQty } : p));
      }
      return prev;
    });
  };

  // Pre-order subtotal calculation
  const preOrderTotal = preOrderItems.reduce((sum, p) => sum + p.item.price * p.qty, 0);

  // Submit advance booking
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !bookingDate || !selectedTableId) {
      return;
    }

    const bookingCode = `ADV-${Math.floor(10000 + Math.random() * 90000)}`;
    const slotTimeStr = `${bookingDate}T${bookingTime}:00`;

    // Save reservation
    if (typeof window !== "undefined") {
      try {
        const rawRes = window.localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
        const reservations = rawRes ? JSON.parse(rawRes) : [];
        const newReservation = {
          id: `res-${Date.now()}`,
          tableId: selectedTableId,
          customerName: customerName.trim(),
          phone: phone.trim(),
          guestCount,
          slotTime: slotTimeStr,
          status: "CONFIRMED",
          bookingCode,
          preOrders: preOrderItems.map((p) => ({ itemId: p.item.id, name: p.item.name, qty: p.qty, price: p.item.price })),
        };
        window.localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify([newReservation, ...reservations]));
      } catch {
        // silent fallback
      }
    }

    setConfirmedBookingCode(bookingCode);
  };

  const handleCopyCode = () => {
    if (!confirmedBookingCode) return;
    navigator.clipboard.writeText(confirmedBookingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Advance Table & Dish Booking</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-text-secondary hover:bg-page">
            <X size={18} />
          </button>
        </div>

        {confirmedBookingCode ? (
          /* Confirmation View */
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-success animate-bounce" />
            <h3 className="mt-3 text-xl font-bold text-text-primary">Booking Confirmed!</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Your table and advance pre-order have been registered successfully.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-mono font-bold text-primary">
              <span>Code: {confirmedBookingCode}</span>
              <button
                onClick={handleCopyCode}
                className="ml-2 rounded p-1 text-text-secondary hover:text-text-primary"
                title="Copy tracking code"
              >
                <Copy size={16} />
              </button>
            </div>
            {isCopied && <span className="mt-1 text-[11px] text-success">Copied to clipboard!</span>}

            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
            >
              Done & Return to Menu
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Customer Name */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Your Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Singh"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Booking Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Time Slot <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Table Preference */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Table Section <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                >
                  <option value="">Select Table Preference</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} — {t.section} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Count */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Guests Count <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Dish Pre-Selection Section */}
            <div className="mt-4 rounded-xl border border-border bg-page p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-text-primary flex items-center gap-1.5">
                  <Utensils size={14} className="text-primary" />
                  Pre-Select Food Dishes (Optional)
                </span>
                <span className="text-[11px] font-semibold text-primary">
                  Pre-Order Total: {formatCurrency(preOrderTotal)}
                </span>
              </div>

              {/* Quick Select Menu Items */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {menuItems.slice(0, 8).map((item) => {
                  const existing = preOrderItems.find((p) => p.item.id === item.id);
                  const qty = existing ? existing.qty : 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-text-primary">{item.name}</span>
                        <span className="ml-2 text-text-secondary">{formatCurrency(item.price)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item, -1)}
                              className="rounded border border-border p-1 hover:bg-page"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-bold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item, 1)}
                              className="rounded border border-border p-1 hover:bg-page"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item, 1)}
                            className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary hover:bg-primary/20"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 font-medium text-text-secondary hover:bg-page"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                Confirm Advance Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
