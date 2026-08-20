"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Search, ChevronRight, Filter, Building2, MoreVertical, Edit2, Ban, Copy, CheckCircle2, Clock } from 'lucide-react';
import { getStoredTenants } from '@/lib/tenantService';
import type { AppTenant } from '@/types/appTypes';
import Link from 'next/link';

export default function HotelsPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setTenants(getStoredTenants());
  }, []);

  const filtered = useMemo(() => {
    let list = tenants;
    if (statusFilter !== 'ALL') {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 bg-success-bg text-success border border-success/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"><CheckCircle2 size={12} /> Active</span>;
      case 'APPROVAL_PENDING':
        return <span className="inline-flex items-center gap-1 bg-warning-bg text-warning border border-warning/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"><Clock size={12} /> Pending</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center gap-1 bg-danger-bg text-danger border border-danger/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"><Ban size={12} /> Suspended</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-info-bg text-info border border-info/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Hotel List</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Hotel Matrix</h1>
            <p className="text-[12px] text-text-secondary">Manage and monitor all onboarded restaurants and their active POS systems.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <Building2 size={16} />
              <span>Register New Hotel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search hotel, city, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus rounded-md pl-9 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 py-2">
              <Filter size={16} className="text-text-secondary" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[13px] text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active POS</option>
                <option value="APPROVAL_PENDING">Pending Audit</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-primary/5 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Restaurant Details</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Owner Contact</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-text-secondary">
                      <Building2 size={40} className="mb-3 opacity-20" />
                      <p className="text-[16px] font-medium text-text-primary">No hotels found</p>
                      <p className="text-[13px] mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.tenantId} className="hover:bg-border/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.logoUrl ? (
                          <img src={t.logoUrl} alt="" className="h-10 w-10 rounded-md object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-input border border-border flex items-center justify-center text-text-secondary font-bold text-lg">
                            {t.restaurantName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-text-primary">{t.restaurantName}</p>
                          <div className="flex items-center gap-1 group/id cursor-pointer text-[11px] text-text-secondary font-mono mt-0.5">
                            {t.tenantId}
                            <Copy size={10} className="opacity-0 group-hover/id:opacity-100 hover:text-primary transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{t.city}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{t.ownerName}</p>
                      <p className="text-[12px] text-text-secondary">{t.ownerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-text-primary transition-colors" title="Edit Hotel">
                          <Edit2 size={16} />
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-danger-bg text-text-secondary hover:text-danger transition-colors" title="Suspend Hotel">
                          <Ban size={16} />
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-text-primary transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between text-[13px] text-text-secondary bg-card/50">
          <span>Showing {filtered.length} results</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-border hover:bg-border disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border hover:bg-border disabled:opacity-50 transition-colors" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
