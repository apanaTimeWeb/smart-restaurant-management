"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Plus, UserCircle, Edit2, Shield, Ban, CheckCircle2 } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const mockUsers = [
    {
      id: "USR-001",
      name: "Saurabh Mishra",
      email: "saurabh@smartlib360.com",
      role: "Super Admin",
      status: "ACTIVE",
    },
    {
      id: "USR-002",
      name: "Ankita Roy",
      email: "ankita@smartlib360.com",
      role: "Support Manager",
      status: "ACTIVE",
    },
    {
      id: "USR-003",
      name: "Ramesh Kumar",
      email: "ramesh@smartlib360.com",
      role: "Sales Executive",
      status: "SUSPENDED",
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Staff & Users</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">User Management</h1>
            <p className="text-[12px] text-text-secondary">Manage platform access, roles, and permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <Plus size={16} />
              <span>Add User</span>
            </button>
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
              placeholder="Search user by name or email..."
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
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-border/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-input border border-border flex items-center justify-center text-text-secondary">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{user.name}</p>
                        <p className="text-[12px] text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[13px] text-text-primary font-medium">
                      <Shield size={14} className="text-primary" /> {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.status === 'ACTIVE' ? 'bg-success-bg text-success border border-success/30' : 'bg-danger-bg text-danger border border-danger/30'
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-text-primary transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-danger-bg text-text-secondary hover:text-danger transition-colors" title="Suspend">
                        <Ban size={16} />
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
