"use client";

// RESPONSIBILITY: Super Admin Payment Audit & 1-Click Tenant Activation (`/super-admin/payments`).
// Displays all restaurants with status "PAYMENT_SUBMITTED" or "PAYMENT_PENDING".
// Allows Super Admin to verify payment transaction IDs and trigger 1-click Tenant POS Activation.
// DATA FLOW: tenantService -> updateTenantStatus("ACTIVE") -> STORAGE_KEYS.SAAS_TENANTS

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getStoredTenants, updateTenantStatus } from "@/lib/tenantService";
import { dispatchNotification } from "@/lib/notificationService";
import type { AppTenant } from "@/types/appTypes";

export default function SuperAdminPaymentsPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  const paymentTenants = tenants.filter(
    (t) => t.status === "PAYMENT_SUBMITTED" || t.status === "PAYMENT_PENDING"
  );

  const handleConfirmPaymentAndActivate = (tenantId: string) => {
    const updated = updateTenantStatus(tenantId, "ACTIVE");
    if (updated) {
      dispatchNotification({
        role: "HOTEL_OWNER",
        type: "HOTEL_ACTIVATED",
        title: "Hotel POS Terminal Activated! 🚀",
        message: `Congratulations! Your restaurant POS for "${updated.restaurantName}" is now FULLY ACTIVE and live on the City Marketplace.`,
        route: "/owner/dashboard",
        playSound: true,
        soundType: "READY",
      });
      setTenants(getStoredTenants());
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <CreditCard size={26} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                Payment Verification & Tenant Provisioning
              </h1>
              <p className="text-xs text-text-secondary">
                Audit advance subscription payments and activate isolated tenant POS workspaces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/requests"
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-extrabold text-text-secondary hover:text-text-primary"
            >
              Onboarding Requests
            </Link>
            <Link
              href="/super-admin/dashboard"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-primary/90"
            >
              Super Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Payments Feed */}
        {paymentTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted border border-dashed border-border rounded-2xl bg-card">
            <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
            <h3 className="font-bold text-base text-text-primary">No Pending Payments</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              All partner subscription payments have been verified and tenant POS workspaces are fully active.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {paymentTenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border p-5 shadow-md ${
                  tenant.status === "PAYMENT_SUBMITTED"
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-amber-500/40 bg-card"
                }`}
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
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                          tenant.status === "PAYMENT_SUBMITTED"
                            ? "bg-blue-500/15 border-blue-500/30 text-blue-500 animate-pulse"
                            : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                        }`}
                      >
                        {tenant.status === "PAYMENT_SUBMITTED"
                          ? "Payment Receipt Submitted"
                          : "Payment Awaiting Submission"}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary">
                      Owner: <strong>{tenant.ownerName}</strong> ({tenant.ownerPhone}) · {tenant.city}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span>Annual Subscription: <strong className="text-emerald-500">₹2,999</strong></span>
                      {tenant.txnRefId && (
                        <span>Txn Ref ID: <strong className="text-text-primary font-mono">{tenant.txnRefId}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                  <button
                    onClick={() => handleConfirmPaymentAndActivate(tenant.tenantId)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-white shadow-xl hover:bg-emerald-600 active:scale-95 transition-all"
                  >
                    <Sparkles size={16} />
                    <span>Confirm Payment & Activate Tenant POS</span>
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
