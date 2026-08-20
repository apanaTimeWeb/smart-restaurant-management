"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppUser, UserRole } from "@/types/appTypes";

export default function OwnerStaffCredentialsPage() {
  const [users, setUsers] = useLocalStorage<AppUser[]>(STORAGE_KEYS.USERS, []);
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "CASHIER" as UserRole,
    phone: "",
    password: "",
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) return;

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      username: staffForm.phone,
      passwordHash: staffForm.password || "123456",
      role: staffForm.role,
      name: staffForm.name,
      phone: staffForm.phone,
      createdByAdmin: true,
      createdAt: Date.now(),
      isActive: true,
    };

    setUsers([...users, newUser]);
    setStaffForm({ name: "", role: "CASHIER", phone: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                Staff Credentials Manager
              </h1>
              <p className="text-xs text-text-secondary">
                Generate and manage secure login access for your restaurant staff
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <form onSubmit={handleCreateStaff} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="font-black text-sm text-text-primary flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span>Create New Staff Account Login</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">Staff Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as UserRole })}
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="CASHIER">CASHIER</option>
                  <option value="WAITER">WAITER</option>
                  <option value="KITCHEN">KITCHEN</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">Phone Number (Login ID)</label>
                <input
                  type="tel"
                  required
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="self-end rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-primary/90 transition-colors"
            >
              Add Staff Member
            </button>
          </form>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h4 className="font-bold text-xs text-text-primary mb-4">Active Staff Accounts ({users.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-text-primary">{u.name}</p>
                      <p className="text-[10px] text-text-muted">{u.phone}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-black text-primary">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
