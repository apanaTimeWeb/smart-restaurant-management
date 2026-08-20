"use client";

// RESPONSIBILITY: Admin Staff Management & Credentials Generator panel.
// Allows Admin to view staff, generate IDs/Passwords for Cashier, Waiter, Kitchen roles, and toggle status.
// DATA FLOW: Admin inputs → AdminStaffCredentialsPanel.tsx → app_users localStorage → Auth & Audit logs

import React, { useState, useEffect, useCallback } from "react";
import type { AppUser, UserRole } from "@/types/appTypes";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { UserCheck, UserX, UserPlus, Key, Shield, RefreshCw, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { AppPagination } from "@/components/ui/AppPagination";

export function AdminStaffCredentialsPanel(): React.JSX.Element {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form State for New Staff
  const [staffName, setStaffName] = useState<string>("");
  const [staffPhone, setStaffPhone] = useState<string>("");
  const [staffRole, setStaffRole] = useState<UserRole>("CASHIER");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load users from localStorage
  const loadUsers = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.USERS);
      if (raw) {
        setUsers(JSON.parse(raw) as AppUser[]);
      }
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Save users helper
  const saveUsersToStorage = (updatedUsers: AppUser[]) => {
    setUsers(updatedUsers);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    }
  };

  // Auto-generate username suggestion based on staff role & name
  const handleRoleOrNameChange = (nameVal: string, roleVal: UserRole) => {
    setStaffName(nameVal);
    setStaffRole(roleVal);

    if (nameVal.trim()) {
      const cleanName = nameVal.trim().toLowerCase().replace(/\s+/g, "");
      const suggestedUsername = `${roleVal.toLowerCase()}_${cleanName}`;
      setUsername(suggestedUsername);
    }
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  // Handle staff creation submit
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!staffName.trim() || !username.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (existing) {
      setErrorMsg("Username already exists. Please choose a different username.");
      return;
    }

    const tid = typeof window !== "undefined" ? window.localStorage.getItem("active_tenant_id") : null;
    const newStaff: AppUser = {
      id: `usr-${staffRole.toLowerCase()}-${Date.now()}`,
      username: cleanUsername,
      passwordHash: password.trim(),
      role: staffRole,
      name: staffName.trim(),
      phone: staffPhone.trim() || null,
      createdByAdmin: true,
      createdAt: Date.now(),
      isActive: true,
      tenantId: (tid && tid !== "SUPER_ADMIN") ? tid : undefined,
    };

    const updated = [...users, newStaff];
    saveUsersToStorage(updated);

    // Audit log
    writeAuditLog(`STAFF_CREATED`, `Created ${staffRole} account '${cleanUsername}' for ${staffName.trim()}`);

    setSuccessMsg(`Credentials generated successfully for ${staffName.trim()}!`);
    setTimeout(() => {
      setIsModalOpen(false);
      setStaffName("");
      setStaffPhone("");
      setUsername("");
      setPassword("");
      setSuccessMsg(null);
    }, 1200);
  };

  // Toggle Staff Active/Inactive status
  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = !u.isActive;
        writeAuditLog(
          `STAFF_STATUS_CHANGED`,
          `Updated status of '${u.username}' to ${nextStatus ? "ACTIVE" : "INACTIVE"}`
        );
        return { ...u, isActive: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
  };

  // Audit log helper
  const writeAuditLog = (action: string, details: string) => {
    if (typeof window === "undefined") return;
    try {
      const rawLogs = window.localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: `log-${Date.now()}`,
        action,
        details,
        userRole: "ADMIN",
        timestamp: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...logs]));
    } catch {
      // silent
    }
  };

  // Filter staff list (excludes Admin and Customer by default in staff view)
  const staffList = users.filter((u) => {
    const isStaffRole = u.role === "CASHIER" || u.role === "WAITER" || u.role === "KITCHEN";
    if (!isStaffRole) return false;

    const tid = typeof window !== "undefined" ? window.localStorage.getItem("active_tenant_id") : null;
    if (tid && tid !== "SUPER_ADMIN" && u.tenantId !== tid) return false;

    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
      );
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(staffList.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStaff = staffList.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Staff Credentials Management</h2>
          <p className="text-xs text-text-secondary">
            Generate system IDs & Passwords for Cashier, Waiter, and Kitchen staff
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            generateRandomPassword();
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
        >
          <UserPlus size={16} />
          <span>Generate New Staff Credentials</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search staff name or ID..."
            className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
          />
        </div>

        {/* Role Tabs Filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-page p-1">
          {["ALL", "CASHIER", "WAITER", "KITCHEN"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                roleFilter === r
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Credentials Data Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-header uppercase text-text-secondary font-semibold">
            <tr>
              <th className="px-4 py-3">Staff Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Username / ID</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-primary">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                  No staff credentials found. Click "Generate New Staff Credentials" to create one.
                </td>
              </tr>
            ) : (
              pageStaff.map((u) => (
                <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-text-primary">{u.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[10px] ${
                        u.role === "CASHIER"
                          ? "bg-pay-cash-bg text-pay-cash"
                          : u.role === "WAITER"
                          ? "bg-info-bg text-info"
                          : "bg-warning-bg text-warning"
                      }`}
                    >
                      <Shield size={10} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{u.username}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{u.passwordHash}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[10px] ${
                        u.isActive
                          ? "bg-success-bg text-success"
                          : "bg-danger-bg text-danger"
                      }`}
                    >
                      {u.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        u.isActive
                          ? "border border-danger/30 text-danger hover:bg-danger/10"
                          : "border border-success/30 text-success hover:bg-success/10"
                      }`}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AppPagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={staffList.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      />

      {/* Modal: Generate New Staff Credentials */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">Generate Staff Credentials</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 flex items-center gap-2 rounded bg-danger-bg/20 p-2.5 text-xs text-danger">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 flex items-center gap-2 rounded bg-success-bg/20 p-2.5 text-xs text-success">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              {/* Staff Name */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Staff Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => handleRoleOrNameChange(e.target.value, staffRole)}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  Assigned Staff Role <span className="text-danger">*</span>
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => handleRoleOrNameChange(staffName, e.target.value as UserRole)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                >
                  <option value="CASHIER">CASHIER (POS Billing Terminal Access)</option>
                  <option value="WAITER">WAITER (Floor Captain App Access)</option>
                  <option value="KITCHEN">KITCHEN (KDS Terminal Access)</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Generated Username / System ID */}
              <div>
                <label className="mb-1 block font-semibold text-text-secondary uppercase">
                  System ID / Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cashier_ramesh"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono font-semibold text-primary focus:border-border-focus focus:outline-none"
                />
              </div>

              {/* Generated Password */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="font-semibold text-text-secondary uppercase">
                    System Password <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                </div>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-input py-2 pl-8 pr-3 font-mono text-xs font-bold text-text-primary focus:border-border-focus focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-text-secondary hover:bg-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-1.5 font-semibold text-white shadow-sm hover:bg-primary-hover"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
