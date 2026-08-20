"use client";

// RESPONSIBILITY: Admin Staff Table view displaying staff members, role, base monthly salary, status, attendance, and Pay Salary action.
// DATA FLOW: staffList + salaryRecords → AdminStaffTable → Action triggers (onPaySalary, onOpenAttendance, onViewPayslip)

import { useState } from "react";
import type { AppUser, AppSalaryRecord } from "@/types/appTypes";
import { formatCurrency } from "@/lib/formatters";
import { CheckCircle2, XCircle, MoreVertical, Banknote, Check, Calendar, FileText } from "lucide-react";

interface AdminStaffTableProps {
  staffList: AppUser[];
  salaryRecords?: AppSalaryRecord[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onPaySalary: (staff: AppUser) => void;
  onOpenAttendance: (staff: AppUser) => void;
  onViewPayslip: (staff: AppUser, record: AppSalaryRecord) => void;
}

export function AdminStaffTable({
  staffList,
  salaryRecords = [],
  onToggleStatus,
  onPaySalary,
  onOpenAttendance,
  onViewPayslip,
}: AdminStaffTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  function getLatestSalaryStatus(staffId: string) {
    const record = salaryRecords.find(
      (r) => r.staffId === staffId && r.month === currentMonthStr
    );
    return record || null;
  }

  if (staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-text-secondary">
        <p className="text-sm font-medium">No staff members found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-page">
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Staff Member
            </th>
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Role
            </th>
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Fixed Base Salary
            </th>
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Payroll Status ({currentMonthStr})
            </th>
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Account Status
            </th>
            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {staffList.map((staff) => {
            const paidRecord = getLatestSalaryStatus(staff.id);
            const defaultBaseSalary =
              staff.baseSalary ||
              (staff.role === "KITCHEN" ? 25000 : staff.role === "CASHIER" ? 15000 : 12000);

            return (
              <tr
                key={staff.id}
                className="group hover:bg-surface-hover/50 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-text-primary">
                      {staff.name}
                    </span>
                    <span className="text-[12px] text-text-secondary font-mono">
                      {staff.username} • {staff.phone || "No Phone"}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {staff.role}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-text-primary">
                      {formatCurrency(defaultBaseSalary)}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      ₹{Math.round(defaultBaseSalary / 30)}/day
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {paidRecord ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
                      <Check size={12} />
                      <span>Paid {formatCurrency(paidRecord.amountPaid)}</span>
                      {paidRecord.leaveDays ? (
                        <span className="text-[10px] opacity-80">({paidRecord.leaveDays} leave days)</span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                      <span>Pending Payment</span>
                    </div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {staff.isActive ? (
                      <>
                        <CheckCircle2 size={14} className="text-success" />
                        <span className="text-[13px] font-medium text-success">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-danger" />
                        <span className="text-[13px] font-medium text-danger">Inactive</span>
                      </>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onPaySalary(staff)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition-all"
                    >
                      <Banknote size={14} />
                      <span>{paidRecord ? "Re-Pay / Adjust" : "Pay Salary"}</span>
                    </button>

                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === staff.id ? null : staff.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:bg-border transition-colors focus:outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openDropdown === staff.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-border bg-card p-1 shadow-lg flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                onOpenAttendance(staff);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
                            >
                              <Calendar size={14} className="text-primary" />
                              <span>Attendance Calendar</span>
                            </button>

                            {paidRecord && (
                              <button
                                onClick={() => {
                                  onViewPayslip(staff, paidRecord);
                                  setOpenDropdown(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
                              >
                                <FileText size={14} className="text-success" />
                                <span>View / Print Payslip</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onToggleStatus(staff.id, !staff.isActive);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-text-primary hover:bg-surface-hover transition-colors"
                            >
                              Mark {staff.isActive ? "Inactive" : "Active"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
