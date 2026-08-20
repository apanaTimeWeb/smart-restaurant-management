"use client";

// RESPONSIBILITY: Platform Super Admin Command Center (`/super-admin/dashboard`).
// Pre-seeded Account: superadmin@smartpos.com / superadmin123
// Displays global SaaS platform revenue KPIs, today's new hotels count, partner growth charts,
// tenant lifecycle manager (Active/Suspended), and quick action links to audit & payment queues.
// DATA FLOW: tenantService -> STORAGE_KEYS.SAAS_TENANTS -> super-admin/dashboard/page.tsx -> UI

import React, { useState, useEffect, useMemo } from "react";

import type { AppTenant } from "@/types/appTypes";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  IndianRupee,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Sparkles,
  Search,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
} from "lucide-react";
import { getStoredTenants, updateTenantStatus } from "@/lib/tenantService";


export default function SuperAdminDashboardPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  // 1. Core KPIs
  const totalHotelsCount = tenants.length;

  const activeTenantsCount = useMemo(
    () => tenants.filter((t) => t.status === "ACTIVE").length,
    [tenants]
  );

  const pendingRequestsCount = useMemo(
    () => tenants.filter((t) => t.status === "APPROVAL_PENDING").length,
    [tenants]
  );

  const pendingPaymentsCount = useMemo(
    () => tenants.filter((t) => t.status === "PAYMENT_SUBMITTED" || t.status === "PAYMENT_PENDING").length,
    [tenants]
  );

  const paidHotelsCount = useMemo(
    () => tenants.filter((t) => t.status === "ACTIVE" || t.status === "PAYMENT_SUBMITTED").length,
    [tenants]
  );

  const totalSaaSRevenue = useMemo(() => {
    return tenants
      .filter((t) => t.status === "ACTIVE" || t.status === "PAYMENT_SUBMITTED")
      .reduce((sum, t) => sum + (t.advanceFeePaid || 2999), 0);
  }, [tenants]);

  // Today's new registrations count
  const todayRegistrationsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return tenants.filter((t) => t.createdAt && new Date(t.createdAt).toISOString().split("T")[0] === todayStr).length;
  }, [tenants]);

  // 2. Filtered list
  const filteredTenants = useMemo(() => {
    let list = tenants;
    if (statusFilter !== "ALL") {
      list = list.filter((t) => t.status === statusFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (t) =>
          t.restaurantName.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tenants, search, statusFilter]);

  // Toggle tenant active/suspended status
  const handleToggleTenantStatus = (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated = updateTenantStatus(tenantId, nextStatus);
    if (updated) {
      setTenants(getStoredTenants());
    }
  };

  // Mock Monthly Growth Data
  const monthlyData = [
    { month: "Jan", hotels: 4, revenue: 11996 },
    { month: "Feb", hotels: 7, revenue: 20993 },
    { month: "Mar", hotels: 12, revenue: 35988 },
    { month: "Apr", hotels: 18, revenue: 53982 },
    { month: "May", hotels: 25, revenue: 74975 },
    { month: "Jun", hotels: tenants.length, revenue: totalSaaSRevenue },
  ];

  return (
    <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        {/* Top Header */}
        <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-white shadow-xl shrink-0">
              <ShieldCheck size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-2xl text-text-primary tracking-tight">
                  Platform Super Admin Command Center
                </h1>
                <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-[10px] font-black text-primary uppercase">
                  MASTER PLATFORM
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Pre-seeded Account: <code className="font-mono text-primary font-bold">superadmin@smartpos.com</code> · Pass: <code className="font-mono font-bold">superadmin123</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/super-admin/requests"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:shadow-lg transition"
            >
              <Clock size={16} />
              <span>Audit Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>

            <Link
              href="/super-admin/payments"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:shadow-lg transition"
            >
              <CreditCard size={16} />
              <span>Verify Payments</span>
              {pendingPaymentsCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  {pendingPaymentsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Powerful 6-KPI Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Total Revenue</span>
              <IndianRupee size={18} />
            </div>
            <p className="font-black text-2xl text-emerald-500">
              ₹{totalSaaSRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-text-muted">Subscription fees collected</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-primary">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Total Registered</span>
              <Building2 size={18} />
            </div>
            <p className="font-black text-2xl text-text-primary">
              {totalHotelsCount} Hotels
            </p>
            <p className="text-[10px] text-text-muted">Onboarded across cities</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-blue-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Joined Today</span>
              <Zap size={18} />
            </div>
            <p className="font-black text-2xl text-blue-500">
              +{todayRegistrationsCount} New
            </p>
            <p className="text-[10px] text-text-muted">New partner signups today</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Audit Requests</span>
              <Clock size={18} />
            </div>
            <p className="font-black text-2xl text-amber-500">
              {pendingRequestsCount} Pending
            </p>
            <p className="text-[10px] text-text-muted">Awaiting FSSAI approval</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-purple-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Paid Subscription</span>
              <CreditCard size={18} />
            </div>
            <p className="font-black text-2xl text-purple-500">
              {paidHotelsCount} Paid
            </p>
            <p className="text-[10px] text-text-muted">Completed ₹2,999 fee</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-4 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wide">Active POS Terminals</span>
              <CheckCircle2 size={18} />
            </div>
            <p className="font-black text-2xl text-emerald-500">
              {activeTenantsCount} Live
            </p>
            <p className="text-[10px] text-text-muted">Operating POS stores</p>
          </div>
        </div>

        {/* Analytics & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Growth Trend Bar Representation */}
          <div className="lg:col-span-2 rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  <h3 className="font-black text-base text-text-primary">
                    SaaS Platform Growth & Partner Acquisition Trend
                  </h3>
                </div>
                <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <TrendingUp size={14} />
                  <span>+48% YoY Growth</span>
                </span>
              </div>

              <div className="flex items-end justify-between gap-3 h-48 pt-4 pb-2 border-b border-border/40">
                {monthlyData.map((d, i) => {
                  const heightPct = Math.min(100, Math.max(20, (d.hotels / 30) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(d.revenue / 1000).toFixed(1)}k
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-primary to-amber-500 opacity-80 group-hover:opacity-100 transition-all shadow-md"
                      />
                      <span className="text-[11px] font-extrabold text-text-secondary">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
              <span>📊 Bar height indicates active partner hotel acquisition per month</span>
              <span className="font-bold text-primary">Target: 50 Hotels / City</span>
            </div>
          </div>

          {/* Chart 2: Status Distribution & Revenue Share */}
          <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PieChart size={20} className="text-emerald-500" />
                  <h3 className="font-black text-base text-text-primary">
                    Tenant Status Breakdown
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-500">Active POS ({activeTenantsCount})</span>
                    <span>{totalHotelsCount ? Math.round((activeTenantsCount / totalHotelsCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      style={{ width: `${totalHotelsCount ? (activeTenantsCount / totalHotelsCount) * 100 : 0}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-blue-500">Payment Pending / Submitted ({pendingPaymentsCount})</span>
                    <span>{totalHotelsCount ? Math.round((pendingPaymentsCount / totalHotelsCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      style={{ width: `${totalHotelsCount ? (pendingPaymentsCount / totalHotelsCount) * 100 : 0}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-amber-500">FSSAI Audit Pending ({pendingRequestsCount})</span>
                    <span>{totalHotelsCount ? Math.round((pendingRequestsCount / totalHotelsCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      style={{ width: `${totalHotelsCount ? (pendingRequestsCount / totalHotelsCount) * 100 : 0}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-surface p-3 border border-border/50 text-center">
              <p className="text-[11px] font-bold text-text-secondary">
                Annual Subscription Model: <strong className="text-emerald-500">₹2,999 / Restaurant</strong>
              </p>
            </div>
          </div>
              {/* Multi‑Tenant Hotel Lifecycle Registry moved to Hotel List page */}
          <p className="text-center text-text-muted py-8">Hotel lifecycle management is now available under "Hotel List".</p>        </div>
      </div>
    </div>
  );
}
