"use client";

// RESPONSIBILITY: Admin Coupon & Discount Rules Manager Page.
// CRUD for promo coupons (Flat or Percentage, Min Order Value, Expiry Date, Usage Limits).
// DATA FLOW: app_coupons -> AdminCouponsPage -> localStorage

import React, { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { showToast } from "@/lib/toastService";
import type { AppCoupon } from "@/types/appTypes";
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useLocalStorage<AppCoupon[]>(STORAGE_KEYS.COUPONS, [
    {
      id: "coup-01",
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 500,
      validUntil: "2026-12-31",
      usageLimit: 100,
      timesUsed: 12,
      isActive: true,
    },
    {
      id: "coup-02",
      code: "FLAT100",
      discountType: "FLAT",
      discountValue: 100,
      minOrderValue: 1000,
      validUntil: "2026-12-31",
      usageLimit: 50,
      timesUsed: 5,
      isActive: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENTAGE">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(500);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: AppCoupon = {
      id: `coup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      validUntil: "2026-12-31",
      usageLimit: 100,
      timesUsed: 0,
      isActive: true,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    setIsModalOpen(false);
    setCode("");
    showToast({
      type: "success",
      title: "Coupon Created",
      message: `Coupon ${newCoupon.code} created successfully!`,
    });
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (id: string, couponCode: string) => {
    if (window.confirm(`Delete coupon ${couponCode}?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast({ type: "info", message: `Coupon ${couponCode} deleted.` });
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Coupon & Promo Code Manager</h1>
            <p className="text-sm text-text-secondary">Create promo codes, minimum order rules, and limits</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* Coupons List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all ${
                c.isActive ? "border-border bg-surface" : "border-border/40 bg-page/50 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="font-extrabold text-lg text-text-primary tracking-wider">{c.code}</span>
                  </div>
                  <button
                    onClick={() => toggleCouponStatus(c.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      c.isActive
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {c.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-text-secondary">
                  <p>
                    Discount: <strong className="text-text-primary font-bold">{c.discountType === "FLAT" ? formatCurrency(c.discountValue) : `${c.discountValue}% OFF`}</strong>
                  </p>
                  <p>
                    Min Order Value: <strong className="text-text-primary">{formatCurrency(c.minOrderValue)}</strong>
                  </p>
                  <p>
                    Used: <strong className="text-text-primary">{c.timesUsed} / {c.usageLimit} times</strong>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-3 border-t border-border/40">
                <button
                  onClick={() => deleteCoupon(c.id, c.code)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="flex h-auto w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text-primary shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border p-4 bg-page/50">
                <h3 className="font-bold text-lg">Create Promo Coupon</h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-text-muted hover:bg-page">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCoupon} className="p-4 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    className="w-full rounded-xl border border-border bg-input px-3.5 py-2 uppercase font-bold text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "FLAT" | "PERCENTAGE")}
                      className="w-full rounded-xl border border-border bg-input px-3 py-2 text-text-primary font-semibold focus:border-primary focus:outline-none"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-border bg-input px-3 py-2 text-text-primary font-bold focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary font-bold focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
