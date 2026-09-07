"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Search, CheckCircle2 } from "lucide-react";
import { getStoredTenants, updateTenantStatus } from "@/lib/tenantService";
import type { AppTenant } from "@/types/appTypes";
import { dispatchNotification } from "@/lib/notificationService";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<AppTenant[]>([]);

  useEffect(() => {
    refreshPayments();
  }, []);

  const refreshPayments = () => {
    const all = getStoredTenants();
    // We filter for PAYMENT_SUBMITTED which acts as "pending verification"
    // For demo purposes, we also show ACTIVE ones if we want, but let's stick to PAYMENT_SUBMITTED for verification.
    const pendingVerif = all.filter(t => t.status === "PAYMENT_SUBMITTED" || t.status === "ACTIVE");
    setPayments(pendingVerif);
  };

  const handleVerify = (tenant: AppTenant) => {
    updateTenantStatus(tenant.tenantId, "ACTIVE");
    dispatchNotification({
      role: "MANAGER",
      type: "PAYMENT_VERIFIED", 
      title: "Payment Verified! 🎉",
      message: `Your hotel request and payment success. Now fill the list hotel form and list your hotel.`,
      route: "/admin/list-hotel",
      playSound: true,
      soundType: "READY",
    });
    refreshPayments();
  };

  const filteredPayments = payments.filter(pay => 
    pay.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
    (pay.txnRefId && pay.txnRefId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Payments</span>
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Payment Verification & History</h1>
          <p className="text-[12px] text-text-secondary">Verify submitted setup fees and track subscription payments.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-card/50">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search hotel or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus rounded-md pl-9 pr-4 py-2 text-[14px] text-text-primary transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-primary/5 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Hotel</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.tenantId} className="hover:bg-border/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[13px] text-primary">{pay.txnRefId || "N/A"}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">{pay.restaurantName}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">₹{pay.advanceFeePaid || 2999}</td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                      {pay.updatedAt ? new Date(pay.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        pay.status === 'ACTIVE' 
                          ? 'bg-success-bg text-success border border-success/30' 
                          : 'bg-warning-bg text-warning border border-warning/30'
                      }`}>
                        <CheckCircle2 size={12} /> {pay.status === 'ACTIVE' ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pay.status === "PAYMENT_SUBMITTED" ? (
                        <button 
                          onClick={() => handleVerify(pay)}
                          className="px-3 py-1.5 rounded-md bg-success/10 text-success hover:bg-success hover:text-white transition-colors text-[12px] font-medium border border-success/30"
                        >
                          Verify & Activate
                        </button>
                      ) : (
                        <span className="text-[12px] text-text-secondary">No Action Needed</span>
                      )}
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
