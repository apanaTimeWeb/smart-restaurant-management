"use client";

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
import { getStoredTenants } from "@/lib/tenantService";

export default function SuperAdminDashboardPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  // KPIs
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

  const todayRegistrationsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return tenants.filter((t) => t.createdAt && new Date(t.createdAt).toISOString().split("T")[0] === todayStr).length;
  }, [tenants]);

  // Mock Monthly Data for Chart representation (Since we don't have ApexCharts fully installed yet, we'll use a styled div representation)
  const monthlyData = [
    { month: "Jan", hotels: 4, revenue: 11996 },
    { month: "Feb", hotels: 7, revenue: 20993 },
    { month: "Mar", hotels: 12, revenue: 35988 },
    { month: "Apr", hotels: 18, revenue: 53982 },
    { month: "May", hotels: 25, revenue: 74975 },
    { month: "Jun", hotels: tenants.length, revenue: totalSaaSRevenue },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Overview</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Platform Command Center</h1>
            <p className="text-[12px] text-text-secondary">Global SaaS metrics and partner growth overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/requests"
              className="flex items-center gap-2 rounded-md bg-warning-bg border border-warning px-4 py-2 text-[14px] font-medium text-warning hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <Clock size={16} />
              <span>Audit Requests ({pendingRequestsCount})</span>
            </Link>
            <Link
              href="/super-admin/payments"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <CreditCard size={16} />
              <span>Verify Payments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards (Pattern 5a) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-bg text-success shrink-0">
              <IndianRupee size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Total Revenue</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">₹{totalSaaSRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[12px] text-success font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> ↑ 12% vs last month
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-bg text-info shrink-0">
              <Building2 size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Total Hotels</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">{totalHotelsCount}</p>
            <p className="text-[12px] text-text-secondary mt-1">Onboarded across cities</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary shrink-0">
              <Zap size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Joined Today</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">+{todayRegistrationsCount}</p>
            <p className="text-[12px] text-text-secondary mt-1">New partner signups</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-bg text-warning shrink-0">
              <Clock size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Pending Audit</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">{pendingRequestsCount}</p>
            <p className="text-[12px] text-text-secondary mt-1">Awaiting FSSAI checks</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3b0764] text-[#d8b4fe] shrink-0">
              <CreditCard size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Paid Hotels</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">{paidHotelsCount}</p>
            <p className="text-[12px] text-text-secondary mt-1">₹2,999 fee collected</p>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-bg text-success shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Active POS</span>
          </div>
          <div>
            <p className="text-[28px] font-bold text-text-primary">{activeTenantsCount}</p>
            <p className="text-[12px] text-text-secondary mt-1">Live terminals</p>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Growth Trend Bar Representation */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                <h2 className="font-semibold text-[16px] text-text-primary">
                  SaaS Platform Growth Trend
                </h2>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-success bg-success-bg px-2.5 py-1 rounded-full border border-success/30">
                <TrendingUp size={14} />
                <span>+48% YoY</span>
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 h-[200px] pt-4 pb-2 border-b border-border/50">
              {monthlyData.map((d, i) => {
                const heightPct = Math.min(100, Math.max(20, (d.hotels / 30) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-medium text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity bg-input border border-border px-2 py-1 rounded-md shadow-lg absolute -translate-y-8 z-30">
                      ₹{(d.revenue / 1000).toFixed(1)}k
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[48px] rounded-t-md bg-primary hover:bg-primary-hover transition-colors shadow-md cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-text-secondary">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <PieChart size={20} className="text-success" />
              <h2 className="font-semibold text-[16px] text-text-primary">
                Status Breakdown
              </h2>
            </div>

            <div className="flex flex-col gap-5 mt-6">
              <div>
                <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
                  <span className="text-success flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div>Active POS ({activeTenantsCount})</span>
                  <span className="text-text-primary">{totalHotelsCount ? Math.round((activeTenantsCount / totalHotelsCount) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-input overflow-hidden border border-border/50">
                  <div
                    style={{ width: `${totalHotelsCount ? (activeTenantsCount / totalHotelsCount) * 100 : 0}%` }}
                    className="h-full bg-success rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
                  <span className="text-info flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-info"></div>Payment Pending ({pendingPaymentsCount})</span>
                  <span className="text-text-primary">{totalHotelsCount ? Math.round((pendingPaymentsCount / totalHotelsCount) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-input overflow-hidden border border-border/50">
                  <div
                    style={{ width: `${totalHotelsCount ? (pendingPaymentsCount / totalHotelsCount) * 100 : 0}%` }}
                    className="h-full bg-info rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
                  <span className="text-warning flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning"></div>Audit Pending ({pendingRequestsCount})</span>
                  <span className="text-text-primary">{totalHotelsCount ? Math.round((pendingRequestsCount / totalHotelsCount) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-input overflow-hidden border border-border/50">
                  <div
                    style={{ width: `${totalHotelsCount ? (pendingRequestsCount / totalHotelsCount) * 100 : 0}%` }}
                    className="h-full bg-warning rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
