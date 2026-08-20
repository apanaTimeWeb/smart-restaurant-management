"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, CreditCard, Clock, CheckCircle2, Ban } from "lucide-react";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");

  const mockSubs = [
    {
      id: "SUB-001",
      hotel: "Spicy Route",
      plan: "Annual Pro",
      amount: "₹2,999",
      status: "ACTIVE",
      expiresIn: "340 days",
    },
    {
      id: "SUB-002",
      hotel: "Burger Hub",
      plan: "Annual Pro",
      amount: "₹2,999",
      status: "EXPIRING",
      expiresIn: "5 days",
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Subscriptions</span>
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">SaaS Subscriptions</h1>
          <p className="text-[12px] text-text-secondary">Manage active subscriptions, renewals, and expirations.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search hotel or subscription ID..."
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
                <th className="px-6 py-4">Sub ID</th>
                <th className="px-6 py-4">Hotel</th>
                <th className="px-6 py-4">Plan & Amount</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-border/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[13px] text-primary">{sub.id}</td>
                  <td className="px-6 py-4 font-semibold text-text-primary">{sub.hotel}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-primary">{sub.plan}</p>
                    <p className="text-[12px] text-text-secondary">{sub.amount}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-text-secondary">{sub.expiresIn}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      sub.status === 'ACTIVE' ? 'bg-success-bg text-success border border-success/30' : 'bg-warning-bg text-warning border border-warning/30'
                    }`}>
                      {sub.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {sub.status}
                    </span>
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
