"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Search, CheckCircle, XCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { getStoredTenants, updateTenantStatus } from "@/lib/tenantService";
import type { AppTenant } from "@/types/appTypes";
import { dispatchNotification } from "@/lib/notificationService";

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<AppTenant[]>([]);

  useEffect(() => {
    refreshRequests();
  }, []);

  const refreshRequests = () => {
    const all = getStoredTenants();
    const pending = all.filter(t => t.status === "APPROVAL_PENDING");
    setRequests(pending);
  };

  const handleApprove = (tenant: AppTenant) => {
    updateTenantStatus(tenant.tenantId, "PAYMENT_PENDING");
    dispatchNotification({
      role: "MANAGER",
      type: "HOTEL_REGISTRATION_NEW", // Using generic type for now
      title: "Hotel Approved! 🎉",
      message: `Your hotel "${tenant.restaurantName}" is approved. Please proceed to payment.`,
      route: "/owner/dashboard",
      playSound: true,
      soundType: "READY",
    });
    refreshRequests();
  };

  const filteredRequests = requests.filter(req => 
    req.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
    req.tenantId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Audit Requests</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Audit & Approval Requests</h1>
            <p className="text-[12px] text-text-secondary">Review FSSAI documents and new restaurant onboardings.</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search request ID, restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus rounded-md pl-9 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-primary/5 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Tenant ID</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                    No pending approval requests.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.tenantId} className="hover:bg-border/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[13px] text-primary">{req.tenantId}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-primary">{req.restaurantName}</p>
                      <p className="text-[12px] text-text-secondary">{req.ownerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-text-primary">
                        <FileText size={14} className="text-text-secondary" /> New Onboarding
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-bg text-warning border border-warning/30`}>
                        <AlertTriangle size={12} />
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleApprove(req)}
                          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-success-bg text-text-secondary hover:text-success transition-colors" 
                          title="Approve & Send to Payment"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-danger-bg text-text-secondary hover:text-danger transition-colors" title="Reject">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
