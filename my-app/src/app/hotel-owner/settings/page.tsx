"use client";

// RESPONSIBILITY: Admin Master Restaurant Settings page.
// Configures Restaurant Name, Logo, Address, Phone, GSTIN, Tax rates, VPA, SLA Thresholds.
// DATA FLOW: localStorage (app_restaurant_settings) -> AdminSettingsPage -> form submit -> localStorage

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { showToast } from "@/lib/toastService";
import type { AppRestaurantSettings } from "@/types/appTypes";
import { Building2, Save, Store, Receipt, Sliders, ShieldCheck } from "lucide-react";

const DEFAULT_SETTINGS: AppRestaurantSettings = {
  restaurantName: "Spice Garden Restaurant",
  logoUrl: "",
  address: "123 MG Road, Connaught Place, New Delhi",
  phone: "9876543210",
  gstin: "07AAAAA0000A1Z5",
  currency: "₹",
  invoicePrefix: "INV-",
  kotPrefix: "KOT-",
  upiVpa: "spicegarden@upi",
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  vatPercent: 0,
  serviceChargePercent: 5,
  loyaltyRupeesPerPoint: 100,
  defaultPrepTimeMins: 15,
  businessHours: "11:00 AM - 11:00 PM",
  receiptFooter: "Thank you for dining with us! Please come again.",
  kdsSlaWarningMins: 10,
  kdsSlaDangerMins: 15,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useLocalStorage<AppRestaurantSettings>(
    STORAGE_KEYS.RESTAURANT_SETTINGS,
    DEFAULT_SETTINGS
  );

  const [formData, setFormData] = useState<AppRestaurantSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AppRestaurantSettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    showToast({
      type: "success",
      title: "Settings Saved",
      message: "Master restaurant settings updated successfully!",
    });
  };

  return (
    <AuthGuard allowedRoles={["HOTEL_OWNER"]}>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Master Restaurant Settings</h1>
            <p className="text-sm text-text-secondary">Configure branding, taxes, VPA, and SLA rules</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity & Address */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary border-b border-border pb-3">
              <Store className="h-5 w-5" />
              <h3 className="font-bold text-base text-text-primary">Restaurant Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => handleChange("restaurantName", e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Taxes & Financials */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 border-b border-border pb-3">
              <Receipt className="h-5 w-5" />
              <h3 className="font-bold text-base text-text-primary">Taxes, UPI VPA & Invoicing</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">UPI VPA Address</label>
                <input
                  type="text"
                  value={formData.upiVpa}
                  onChange={(e) => handleChange("upiVpa", e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">CGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cgstPercent}
                  onChange={(e) => handleChange("cgstPercent", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">SGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sgstPercent}
                  onChange={(e) => handleChange("sgstPercent", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.serviceChargePercent}
                  onChange={(e) => handleChange("serviceChargePercent", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Loyalty ₹ per 1 Point</label>
                <input
                  type="number"
                  value={formData.loyaltyRupeesPerPoint}
                  onChange={(e) => handleChange("loyaltyRupeesPerPoint", parseInt(e.target.value, 10) || 100)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* KDS & Operational SLAs */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 border-b border-border pb-3">
              <Sliders className="h-5 w-5" />
              <h3 className="font-bold text-base text-text-primary">KDS & Kitchen SLA Rules</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Default Prep Time (Mins)</label>
                <input
                  type="number"
                  value={formData.defaultPrepTimeMins}
                  onChange={(e) => handleChange("defaultPrepTimeMins", parseInt(e.target.value, 10) || 15)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">KDS SLA Yellow Warning (Mins)</label>
                <input
                  type="number"
                  value={formData.kdsSlaWarningMins}
                  onChange={(e) => handleChange("kdsSlaWarningMins", parseInt(e.target.value, 10) || 10)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">KDS SLA Red Alert (Mins)</label>
                <input
                  type="number"
                  value={formData.kdsSlaDangerMins}
                  onChange={(e) => handleChange("kdsSlaDangerMins", parseInt(e.target.value, 10) || 15)}
                  className="w-full rounded-xl border border-border bg-input px-3.5 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-hover transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
