"use client";

// RESPONSIBILITY: Main Admin Dashboard page shell located at route `/admin/dashboard`.
// Composes AdminKpiGrid + AdminRevenueChart + AdminPaymentDonut + AdminLowStockSlaTracker + AdminStaffCredentialsPanel.
// All data logic delegated to useAdminDashboard hook.
// isMounted guard prevents SSR/client hydration mismatch.
// DATA FLOW: useAdminDashboard → kpiCards + dailyStats + paymentSplit
//            → AdminKpiGrid + AdminRevenueChart + AdminPaymentDonut → UI

import { useState, useEffect } from "react";
import { useAdminDashboard } from "@/app/admin/admin_hooks/useAdminDashboard";
import { AdminKpiGrid, AdminKpiCardSkeleton } from "@/app/admin/admin_components/AdminKpiGrid";
import { AdminRevenueChart } from "@/app/admin/admin_components/AdminRevenueChart";
import { AdminPaymentDonut } from "@/app/admin/admin_components/AdminPaymentDonut";
import { AdminStaffCredentialsPanel } from "@/app/admin/admin_components/AdminStaffCredentialsPanel";
import { AdminLowStockSlaTracker } from "@/app/admin/admin_components/AdminLowStockSlaTracker";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { getTenantsByOwner } from "@/lib/tenantService";

const PAGE_TITLE       = "Admin Dashboard" as const;
const PAGE_SUBTITLE    = "Live analytics, operations, and staff credential management" as const;
const SKELETON_COUNT   = 6 as const;

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  const { currentUser, isHydrated: authHydrated } = useAuth();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Bounce HOTEL_OWNER to owner dashboard if their hotel is not ACTIVE
  useEffect(() => {
    if (authHydrated && currentUser && currentUser.role === "HOTEL_OWNER") {
      const ownerTenants = getTenantsByOwner(currentUser.id, currentUser.phone || undefined);
      const activeTenant = ownerTenants.find(t => t.status === "ACTIVE");
      if (!activeTenant) {
        window.location.href = "/owner/dashboard";
      }
    }
  }, [authHydrated, currentUser]);

  const { kpiCards, dailyStats, paymentSplit, totalTransactions } = useAdminDashboard();

  if (!isMounted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
        <AdminPageHeader />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <AdminKpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="skeleton h-[308px] rounded-lg" />
          <div className="skeleton h-[308px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["ADMIN", "HOTEL_OWNER"]}>
      <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
        <AdminPageHeader />

        {/* Live Kitchen Low Stock SLA Tracker & 24-Hour Escalation Monitor */}
        <AdminLowStockSlaTracker />

        {/* KPI Cards — top row */}
        <AdminKpiGrid cards={kpiCards} />

        {/* Charts row — Revenue bar+line left, Payment donut right */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <AdminRevenueChart dailyStats={dailyStats} />
          <AdminPaymentDonut
            paymentSplit={paymentSplit}
            totalTransactions={totalTransactions}
          />
        </div>

        {/* Staff Management & Credentials Generator Panel */}
        <AdminStaffCredentialsPanel />
      </div>
    </AuthGuard>
  );
}

function AdminPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
