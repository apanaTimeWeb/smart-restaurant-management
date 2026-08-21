"use client";

// RESPONSIBILITY: Hotel Profile Onboarding Creation Wizard (`/manager/onboarding`).
// Collects restaurant details (Basic info, Location, FSSAI, GSTIN, Logo/Banner, UPI VPA).
// Submits application to Super Admin Verification Queue (status: APPROVAL_PENDING).
// DATA FLOW: owner/onboarding/page.tsx -> registerNewTenant() -> owner/dashboard/page.tsx

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  FileCheck,
  Clock,
  IndianRupee,
  Image,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { registerNewTenant } from "@/lib/tenantService";

export default function OwnerOnboardingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    restaurantName: "",
    tagline: "",
    city: "Bengaluru",
    address: "",
    landmark: "",
    pincode: "",
    cuisineTypes: "North Indian, Biryani, Mughlai",
    costForTwo: 1000,
    fssaiNumber: "",
    gstinNumber: "",
    upiVpa: "",
    openingTime: "11:00 AM",
    closingTime: "11:00 PM",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cuisinesArray = formData.cuisineTypes.split(",").map((c) => c.trim());

    setTimeout(() => {
      registerNewTenant({
        restaurantName: formData.restaurantName,
        tagline: formData.tagline,
        city: formData.city,
        address: formData.address,
        landmark: formData.landmark,
        pincode: formData.pincode,
        cuisineTypes: cuisinesArray,
        costForTwo: Number(formData.costForTwo),
        fssaiNumber: formData.fssaiNumber,
        gstinNumber: formData.gstinNumber,
        upiVpa: formData.upiVpa,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
      });

      router.push("/manager/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-3xl">
        {/* Onboarding Progress Header */}
        <div className="mb-8 rounded-3xl border border-border/80 bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/30">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="font-black text-xl text-text-primary">
                  Restaurant Onboarding Profile
                </h1>
                <p className="text-xs text-text-secondary">
                  Step 2 of 4: Business Details & Verification Credentials
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <Sparkles size={13} />
              Under Onboarding Setup
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-primary font-bold text-sm">
              <Building2 size={18} />
              <span>1. Basic Restaurant Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  placeholder="e.g. Royal Spice Bistro"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Fine Dining & Royal Mughlai Cuisine"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Cuisines Offered (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.cuisineTypes}
                  onChange={(e) => setFormData({ ...formData, cuisineTypes: e.target.value })}
                  placeholder="North Indian, Chinese, Biryani"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Average Cost for Two (₹)
                </label>
                <input
                  type="number"
                  value={formData.costForTwo}
                  onChange={(e) => setFormData({ ...formData, costForTwo: Number(e.target.value) })}
                  placeholder="1000"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Address */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-primary font-bold text-sm">
              <MapPin size={18} />
              <span>2. Location & Address Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Goa">Goa</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near Metro Station"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560038"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                Full Physical Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="100 Feet Road, Indiranagar, Bengaluru"
                className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Legal & Payment Verification Credentials */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-primary font-bold text-sm">
              <FileCheck size={18} />
              <span>3. Legal & Payment Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  FSSAI License Number
                </label>
                <input
                  type="text"
                  value={formData.fssaiNumber}
                  onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                  placeholder="11223344556677"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  value={formData.gstinNumber}
                  onChange={(e) => setFormData({ ...formData, gstinNumber: e.target.value })}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-text-secondary">
                  UPI VPA ID for Customer QR Payments
                </label>
                <input
                  type="text"
                  value={formData.upiVpa}
                  onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                  placeholder="restaurant@upi"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-black text-sm text-white shadow-xl hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Application to Super Admin…</span>
            ) : (
              <>
                <span>Submit Restaurant Registration for Approval</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
