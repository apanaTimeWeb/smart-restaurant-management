"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Receipt, IndianRupee, Clock, CheckCircle2, TrendingUp, TrendingDown, CreditCard, ArrowDownToLine, MoreVertical } from "lucide-react";

export default function BillingPage() {
  const [search, setSearch] = useState("");

  const mockInvoices = [
    {
      id: "INV-2026-081",
      hotel: "Spicy Route",
      date: "2026-08-01",
      amount: "₹2,999.00",
      status: "PAID",
      mode: "UPI"
    },
    {
      id: "INV-2026-082",
      hotel: "Burger Hub",
      date: "2026-08-05",
      amount: "₹2,999.00",
      status: "PAID",
      mode: "CARD"
    },
    {
      id: "INV-2026-083",
      hotel: "City Diner",
      date: "2026-08-15",
      amount: "₹2,999.00",
      status: "OVERDUE",
      mode: "PENDING"
    },
    {
      id: "INV-2026-084",
      hotel: "Ocean View",
      date: "2026-08-20",
      amount: "₹2,999.00",
      status: "PENDING",
      mode: "PENDING"
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Billing</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Platform Billing & Revenue</h1>
            <p className="text-[12px] text-text-secondary">Manage platform revenue, tenant invoices, and payment statuses.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <ArrowDownToLine size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Pattern 5a) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary shrink-0">
                <IndianRupee size={20} />
              </div>
              <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Monthly Recurring Revenue</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[32px] font-bold text-text-primary">₹8.4L</p>
            <p className="text-[13px] text-success font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={14} /> ↑ 18.5% from last month
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-bg text-success shrink-0">
                <Receipt size={20} />
              </div>
              <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Paid Invoices (Aug)</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[32px] font-bold text-text-primary">284</p>
            <p className="text-[13px] text-success font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={14} /> ↑ 12% collection rate
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-bg text-danger shrink-0">
                <Clock size={20} />
              </div>
              <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Overdue Payments</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[32px] font-bold text-text-primary">12</p>
            <p className="text-[13px] text-danger font-medium flex items-center gap-1 mt-1">
              <TrendingDown size={14} /> ₹35,988 outstanding
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card (Pattern 5b) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
          <h2 className="text-[16px] font-semibold text-text-primary">Recent Invoices</h2>
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search invoice ID or hotel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus rounded-md pl-9 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-primary/5 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Hotel Name</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-border/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[13px] text-primary font-medium">{inv.id}</td>
                  <td className="px-6 py-4 font-semibold text-text-primary">{inv.hotel}</td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">{inv.amount}</td>
                  <td className="px-6 py-4 text-[13px] text-text-secondary">{inv.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      inv.status === 'PAID' ? 'bg-success-bg text-success border border-success/30' :
                      inv.status === 'PENDING' ? 'bg-warning-bg text-warning border border-warning/30' :
                      'bg-danger-bg text-danger border border-danger/30'
                    }`}>
                      {inv.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-primary transition-colors" title="Download PDF">
                        <ArrowDownToLine size={16} />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-text-primary transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
