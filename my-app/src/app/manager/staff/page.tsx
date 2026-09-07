"use client";

// RESPONSIBILITY: Owner Staff Page shell composing summary metrics, OwnerStaffTable, OwnerStaffSalaryModal, OwnerStaffAttendanceCalendarModal, and OwnerStaffSalaryPayslipModal.
// DATA FLOW: useOwnerStaff → staff + salaryRecords + attendanceRecords → OwnerStaffTable & modals → paySalary & markAttendance

import { useState } from "react";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import { useOwnerStaff } from "@/app/manager/manager_hooks/useOwnerStaff";
import { OwnerStaffTable } from "@/app/manager/manager_components/OwnerStaffTable";
import { OwnerStaffSalaryModal } from "@/app/manager/manager_components/OwnerStaffSalaryModal";
import { OwnerStaffAttendanceCalendarModal } from "@/app/manager/manager_components/OwnerStaffAttendanceCalendarModal";
import { OwnerStaffSalaryPayslipModal } from "@/app/manager/manager_components/OwnerStaffSalaryPayslipModal";
import type { AppUser, AppSalaryRecord, AttendanceStatus } from "@/types/appTypes";
import { Users, Banknote, CalendarCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function OwnerStaffPage() {
  const {
    staff,
    salaryRecords,
    attendanceRecords,
    toggleStaffActive,
    markAttendance,
    getStaffMonthLeaveDays,
    paySalary,
  } = useOwnerStaff();

  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<AppUser | null>(null);
  const [selectedStaffForAttendance, setSelectedStaffForAttendance] = useState<AppUser | null>(null);
  const [payslipData, setPayslipData] = useState<{
    staff: AppUser;
    record: AppSalaryRecord;
  } | null>(null);

  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  // Summary calculations
  const totalPaid = salaryRecords.reduce((sum, record) => sum + record.amountPaid, 0);
  const activeCount = staff.filter((s) => s.isActive).length;
  const currentMonthPaidCount = staff.filter((s) =>
    salaryRecords.some((r) => r.staffId === s.id && r.month === currentMonthStr)
  ).length;

  function handlePaySalaryClick(staffMember: AppUser) {
    setSelectedStaffForSalary(staffMember);
  }

  function handleOpenAttendanceClick(staffMember: AppUser) {
    setSelectedStaffForAttendance(staffMember);
  }

  function handleViewPayslipClick(staffMember: AppUser, record: AppSalaryRecord) {
    setPayslipData({ staff: staffMember, record });
  }

  function handleConfirmPayment(
    staffId: string,
    amount: number,
    month: string,
    leaveDays: number,
    baseSalary: number,
    deductionAmount: number,
    bonus: number,
    overtime: number
  ) {
    paySalary(
      staffId,
      amount,
      month,
      leaveDays,
      baseSalary,
      deductionAmount,
      bonus,
      overtime
    );

    // Auto open payslip preview for confirmed payment
    const staffMember = staff.find((s) => s.id === staffId);
    if (staffMember) {
      const newRecord: AppSalaryRecord = {
        id: `sal-${Date.now()}`,
        staffId,
        amountPaid: amount,
        baseSalary,
        leaveDays,
        deductionAmount,
        bonus,
        overtime,
        paymentDate: Date.now(),
        month,
        status: "PAID",
      };
      setPayslipData({ staff: staffMember, record: newRecord });
    }

    setSelectedStaffForSalary(null);
  }

  const initialLeaveDaysForSelected = selectedStaffForSalary
    ? getStaffMonthLeaveDays(selectedStaffForSalary.id, currentMonthStr)
    : 0;

  return (
    <AuthGuard allowedRoles={["MANAGER"]}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-text-primary">Staff Management, Attendance & Payroll</h1>
          <p className="text-sm text-text-secondary">
            Manage staff roster, track monthly attendance calendars, and disburse salary with live payslip generation.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-text-secondary">Total Staff Roster</span>
              <span className="text-[20px] font-bold text-text-primary">
                {staff.length} <span className="text-[12px] font-medium text-text-secondary">({activeCount} Active)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <Banknote size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-text-secondary">Total Salary Disbursed</span>
              <span className="text-[20px] font-bold text-text-primary">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <CalendarCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-text-secondary">Current Month Payroll Progress</span>
              <span className="text-[20px] font-bold text-text-primary">
                {currentMonthPaidCount} / {staff.length} <span className="text-[12px] font-medium text-text-secondary">Paid</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-text-primary">Staff Roster & Payroll Processing</h2>
          <OwnerStaffTable
            staffList={staff}
            salaryRecords={salaryRecords}
            onToggleStatus={toggleStaffActive}
            onPaySalary={handlePaySalaryClick}
            onOpenAttendance={handleOpenAttendanceClick}
            onViewPayslip={handleViewPayslipClick}
          />
        </div>

        {/* Modals */}
        <OwnerStaffSalaryModal
          isOpen={selectedStaffForSalary !== null}
          staff={selectedStaffForSalary}
          initialLeaveDays={initialLeaveDaysForSelected}
          onClose={() => setSelectedStaffForSalary(null)}
          onConfirm={handleConfirmPayment}
        />

        <OwnerStaffAttendanceCalendarModal
          isOpen={selectedStaffForAttendance !== null}
          staff={selectedStaffForAttendance}
          attendanceRecords={attendanceRecords}
          onMarkAttendance={markAttendance}
          onClose={() => setSelectedStaffForAttendance(null)}
        />

        <OwnerStaffSalaryPayslipModal
          isOpen={payslipData !== null}
          staff={payslipData?.staff || null}
          salaryRecord={payslipData?.record || null}
          onClose={() => setPayslipData(null)}
        />
      </div>
    </AuthGuard>
  );
}
