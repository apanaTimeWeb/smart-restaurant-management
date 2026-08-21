"use client";

// RESPONSIBILITY: Staff Salary Payment Modal with fixed monthly salary, auto-synced attendance leave deduction, bonus, and overtime.
// Eliminates manual amount input box; auto-calculates salary based on base salary, 30-day rate, leave days, bonus, and overtime.
// DATA FLOW: Owner selects leave days/bonus/overtime → Dynamic formula calculation → onConfirm(...)

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";
import type { AppUser } from "@/types/appTypes";
import { X, Calendar, Minus, Plus, Banknote, ShieldAlert, Award, Clock } from "lucide-react";

interface OwnerStaffSalaryModalProps {
  isOpen: boolean;
  staff: AppUser | null;
  initialLeaveDays?: number;
  onClose: () => void;
  onConfirm: (
    staffId: string,
    amount: number,
    month: string,
    leaveDays: number,
    baseSalary: number,
    deductionAmount: number,
    bonus: number,
    overtime: number
  ) => void;
}

export function OwnerStaffSalaryModal({
  isOpen,
  staff,
  initialLeaveDays = 0,
  onClose,
  onConfirm,
}: OwnerStaffSalaryModalProps) {
  const [leaveDays, setLeaveDays] = useState<number>(initialLeaveDays);
  const [bonus, setBonus] = useState<string>("0");
  const [overtime, setOvertime] = useState<string>("0");
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // "YYYY-MM"
  });

  useEffect(() => {
    if (isOpen) {
      setLeaveDays(initialLeaveDays);
      setBonus("0");
      setOvertime("0");
    }
  }, [isOpen, initialLeaveDays]);

  if (!isOpen || !staff) return null;

  // Fixed base monthly salary per role
  const baseSalary =
    staff.baseSalary ||
    (staff.role === "KITCHEN"
      ? 25000
      : staff.role === "CASHIER"
      ? 15000
      : 12000);

  const totalMonthDays = 30; // standard payroll base
  const dailyRate = baseSalary / totalMonthDays;
  const leaveDeduction = Math.round(leaveDays * dailyRate);
  const bonusNum = Math.max(0, parseFloat(bonus) || 0);
  const overtimeNum = Math.max(0, parseFloat(overtime) || 0);

  const netPayableSalary = Math.max(
    0,
    Math.round(baseSalary - leaveDeduction + bonusNum + overtimeNum)
  );

  function handleIncrementLeave() {
    setLeaveDays((prev) => Math.min(totalMonthDays, prev + 1));
  }

  function handleDecrementLeave() {
    setLeaveDays((prev) => Math.max(0, prev - 1));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(
      staff!.id,
      netPayableSalary,
      month,
      leaveDays,
      baseSalary,
      leaveDeduction,
      bonusNum,
      overtimeNum
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Banknote size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Staff Monthly Payroll Payment</h2>
              <p className="text-[11px] text-text-secondary">Fixed monthly pay + Leave deductions + Bonus & Overtime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
          {/* Staff Info Pill */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-page p-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-text-primary">{staff.name}</span>
              <span className="text-[12px] text-text-secondary">{staff.phone || "No Phone"}</span>
            </div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              {staff.role}
            </span>
          </div>

          {/* Payment Month Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Select Payment Month</span>
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-border bg-input px-3.5 py-2 text-[14px] font-semibold text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Fixed Base Salary & Rate Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-page p-3">
              <span className="text-[11px] font-medium text-text-secondary">Fixed Base Salary</span>
              <span className="text-[16px] font-bold text-text-primary">
                {formatCurrency(baseSalary)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-page p-3">
              <span className="text-[11px] font-medium text-text-secondary">Daily Wage Rate (30 Days)</span>
              <span className="text-[16px] font-bold text-text-primary">
                {formatCurrency(Math.round(dailyRate))}<span className="text-[11px] font-normal text-text-secondary">/day</span>
              </span>
            </div>
          </div>

          {/* Leave Days Stepper */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-hover/40 p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-text-primary flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-warning" />
                <span>Leave / Absent Days</span>
              </label>
              <span className="text-[11px] font-bold text-text-secondary">
                {leaveDays} {leaveDays === 1 ? "day" : "days"} absent
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <button
                type="button"
                onClick={handleDecrementLeave}
                disabled={leaveDays <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-text-primary hover:bg-border disabled:opacity-40 transition-all active:scale-95"
              >
                <Minus size={14} />
              </button>

              <div className="flex-1 text-center font-bold text-[16px] text-text-primary">
                {leaveDays} <span className="text-[12px] font-normal text-text-secondary">Leave Days</span>
              </div>

              <button
                type="button"
                onClick={handleIncrementLeave}
                disabled={leaveDays >= totalMonthDays}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-text-primary hover:bg-border disabled:opacity-40 transition-all active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Bonus & Overtime Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                <Award size={12} className="text-success" />
                <span>Performance Bonus (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-input px-3 py-2 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                <span>Overtime Pay (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                value={overtime}
                onChange={(e) => setOvertime(e.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-input px-3 py-2 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Net Salary Calculation Summary */}
          <div className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex justify-between text-[12px] text-text-secondary">
              <span>Base Monthly Salary:</span>
              <span className="font-semibold text-text-primary">{formatCurrency(baseSalary)}</span>
            </div>
            {leaveDays > 0 && (
              <div className="flex justify-between text-[12px] text-danger">
                <span>Leave Deduction ({leaveDays} days × {formatCurrency(Math.round(dailyRate))}):</span>
                <span className="font-semibold">-{formatCurrency(leaveDeduction)}</span>
              </div>
            )}
            {bonusNum > 0 && (
              <div className="flex justify-between text-[12px] text-success">
                <span>Performance Bonus:</span>
                <span className="font-semibold">+{formatCurrency(bonusNum)}</span>
              </div>
            )}
            {overtimeNum > 0 && (
              <div className="flex justify-between text-[12px] text-primary">
                <span>Overtime Pay:</span>
                <span className="font-semibold">+{formatCurrency(overtimeNum)}</span>
              </div>
            )}
            <div className="my-1 border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-text-primary">Net Payable Amount:</span>
              <span className="text-[20px] font-extrabold text-success">
                {formatCurrency(netPayableSalary)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-success py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-success/90 transition-all active:scale-95"
            >
              Pay Salary ({formatCurrency(netPayableSalary)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
