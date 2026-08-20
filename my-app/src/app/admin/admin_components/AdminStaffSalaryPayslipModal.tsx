"use client";

// RESPONSIBILITY: Official Staff Salary Payslip Modal with print & PDF download capability.
// Displays branded payslip with restaurant header, staff info, base salary, daily rate, leave deductions, bonus, overtime, and net pay.
// DATA FLOW: AdminStaffTable / AdminStaffSalaryModal → AdminStaffSalaryPayslipModal → window.print()

import React from "react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { AppUser, AppSalaryRecord } from "@/types/appTypes";
import { X, Printer, CheckCircle2, Shield, Calendar, Banknote } from "lucide-react";

interface AdminStaffSalaryPayslipModalProps {
  isOpen: boolean;
  staff: AppUser | null;
  salaryRecord: AppSalaryRecord | null;
  onClose: () => void;
}

const RESTAURANT_NAME = "Royal Spice Bistro & Smart POS 360" as const;
const RESTAURANT_ADDRESS = "123, MG Road, Bengaluru — 560001" as const;

export function AdminStaffSalaryPayslipModal({
  isOpen,
  staff,
  salaryRecord,
  onClose,
}: AdminStaffSalaryPayslipModalProps) {
  if (!isOpen || !staff || !salaryRecord) return null;

  const baseSalary = salaryRecord.baseSalary || staff.baseSalary || 15000;
  const leaveDays = salaryRecord.leaveDays || 0;
  const leaveDeduction = salaryRecord.deductionAmount || Math.round((baseSalary / 30) * leaveDays);
  const bonus = salaryRecord.bonus || 0;
  const overtime = salaryRecord.overtime || 0;
  const dailyRate = Math.round(baseSalary / 30);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      {/* Container with print styles */}
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden print:m-0 print:w-full print:max-w-none print:border-none print:shadow-none">
        {/* Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-primary" />
            <h2 className="text-[16px] font-bold text-text-primary">Salary Payslip</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition-all"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 flex flex-col gap-6 bg-card text-text-primary">
          {/* Header */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Official Salary Voucher</span>
            <h1 className="text-[18px] font-extrabold text-text-primary">{RESTAURANT_NAME}</h1>
            <p className="text-[11px] text-text-secondary">{RESTAURANT_ADDRESS}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-0.5 text-[11px] font-bold text-success">
              <CheckCircle2 size={12} />
              <span>Payment Status: CONFIRMED & PAID</span>
            </div>
          </div>

          {/* Employee & Pay Details Meta */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-page p-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary font-medium">Employee Name:</span>
              <span className="font-bold text-text-primary text-[13px]">{staff.name}</span>
              <span className="text-text-secondary">Role: {staff.role}</span>
              <span className="text-text-secondary">Username: {staff.username}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-text-secondary font-medium">Pay Period:</span>
              <span className="font-bold text-primary text-[13px]">{salaryRecord.month}</span>
              <span className="text-text-secondary">Voucher ID: {salaryRecord.id}</span>
              <span className="text-text-secondary">Paid On: {formatDateTime(salaryRecord.paymentDate)}</span>
            </div>
          </div>

          {/* Itemized Calculation Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-border text-xs">
            <table className="w-full text-left">
              <thead className="bg-header uppercase text-[10px] font-bold text-text-secondary">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5">Salary Description</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-text-primary">Fixed Monthly Base Salary</span>
                    <p className="text-[10px] text-text-secondary">Standard 30-day base ({formatCurrency(dailyRate)}/day)</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-text-primary">
                    {formatCurrency(baseSalary)}
                  </td>
                </tr>

                {leaveDays > 0 && (
                  <tr>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-danger">Attendance Leave Deduction</span>
                      <p className="text-[10px] text-text-secondary">{leaveDays} days leave × {formatCurrency(dailyRate)}/day</p>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-danger">
                      -{formatCurrency(leaveDeduction)}
                    </td>
                  </tr>
                )}

                {bonus > 0 && (
                  <tr>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-success">Performance Bonus / Reward</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-success">
                      +{formatCurrency(bonus)}
                    </td>
                  </tr>
                )}

                {overtime > 0 && (
                  <tr>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-primary">Overtime Allowance</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-primary">
                      +{formatCurrency(overtime)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Footer */}
            <div className="flex items-center justify-between border-t-2 border-border bg-surface-hover/40 px-4 py-3 text-sm">
              <span className="font-bold text-text-primary">Net Amount Disbursed:</span>
              <span className="text-[18px] font-extrabold text-success">
                {formatCurrency(salaryRecord.amountPaid)}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-text-secondary">
            <span>Generated electronically by Smart POS 360</span>
            <span>Authorized Signature: System Admin</span>
          </div>
        </div>

        {/* Bottom Actions (hidden on print) */}
        <div className="flex justify-end gap-3 border-t border-border bg-page px-6 py-4 print:hidden">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-all active:scale-95"
          >
            <Printer size={14} />
            <span>Print Payslip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
