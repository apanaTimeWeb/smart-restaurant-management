"use client";

// RESPONSIBILITY: Super Admin Partner Onboarding Audit Queue (`/super-admin/requests`).
// Displays all incoming restaurant registration requests for Super Admin review.
// Allows Super Admin to inspect legal docs (FSSAI, GSTIN) and dispatch Advance Payment Requests.
// DATA FLOW: tenantService -> STORAGE_KEYS.SAAS_TENANTS -> super-admin/requests -> updateTenantStatus()

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileCheck,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { getStoredTenants, updateTenantStatus } from "@/lib/tenantService";
import { dispatchNotification } from "@/lib/notificationService";
import type { AppTenant } from "@/types/appTypes";

export default function SuperAdminRequestsPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  const pendingRequests = tenants.filter((t) => t.status === "APPROVAL_PENDING");

  const handleApproveAndRequestPayment = (tenantId: string) => {
    const updated = updateTenantStatus(tenantId, "PAYMENT_PENDING");
    if (updated) {
      dispatchNotification({
        role: "HOTEL_OWNER",
        type: "HOTEL_APPROVED",
        title: "Hotel Application Approved! 🎉",
        message: `Your hotel application for "${updated.restaurantName}" has been APPROVED by Super Admin. Please pay the annual subscription fee to activate your POS.`,
        route: "/owner/dashboard",
        playSound: true,
        soundType: "READY",
      });
      setTenants(getStoredTenants());
    }
  };

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                Partner Onboarding Audit Queue
              </h1>
              <p className="text-xs text-text-secondary">
                Review FSSAI, GSTIN & location credentials of new restaurant applicants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/dashboard"
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-extrabold text-text-secondary hover:text-text-primary"
            >
              Super Admin Dashboard
            </Link>
            <Link
              href="/super-admin/payments"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-primary/90"
            >
              Payment Verification Queue
            </Link>
          </div>
        </div>

        {/* Requests Feed */}
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted border border-dashed border-border rounded-2xl bg-card">
            <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
            <h3 className="font-bold text-base text-text-primary">All Audit Requests Cleared</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              There are currently no pending restaurant registration applications waiting for verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-card p-5 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.restaurantName}
                    className="h-14 w-14 rounded-2xl object-cover border border-border shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-text-primary">
                        {tenant.restaurantName}
                      </h3>
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-500">
                        Approval Pending
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      📍 {tenant.address} · {tenant.city} (Pincode: {tenant.pincode})
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1 flex-wrap">
                      <span>Owner: <strong>{tenant.ownerName}</strong> ({tenant.ownerPhone})</span>
                      <span>FSSAI: <strong>{tenant.fssaiNumber || "Submitted"}</strong></span>
                      <span>GSTIN: <strong>{tenant.gstinNumber || "Submitted"}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                  <button
                    onClick={() => handleApproveAndRequestPayment(tenant.tenantId)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-600 active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={15} />
                    <span>Verify & Request Payment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
