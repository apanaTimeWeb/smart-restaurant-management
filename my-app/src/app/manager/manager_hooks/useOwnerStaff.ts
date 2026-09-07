"use client";

// RESPONSIBILITY: Hook to manage staff users, attendance records, and salary payroll for Owner panel.
// DATA FLOW: STORAGE_KEYS (USERS, SALARY_RECORDS, STAFF_ATTENDANCE) ↔ useOwnerStaff ↔ Staff pages & modals

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type {
  AppUser,
  AppSalaryRecord,
  AppStaffAttendanceRecord,
  AttendanceStatus,
} from "@/types/appTypes";

export interface UseOwnerStaffReturn {
  staff: AppUser[];
  salaryRecords: AppSalaryRecord[];
  attendanceRecords: AppStaffAttendanceRecord[];
  toggleStaffActive: (userId: string, isActive: boolean) => void;
  markAttendance: (
    staffId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ) => void;
  getStaffMonthLeaveDays: (staffId: string, month: string) => number;
  paySalary: (
    staffId: string,
    amount: number,
    month: string,
    leaveDays?: number,
    baseSalary?: number,
    deductionAmount?: number,
    bonus?: number,
    overtime?: number
  ) => void;
}

export const ROLE_DEFAULT_BASE_SALARIES: Record<string, number> = {
  CASHIER: 15000,
  WAITER: 12000,
  KITCHEN: 25000,
};

/**
 * Hook to manage staff users, attendance calendars, and salary records.
 */
export function useOwnerStaff(): UseOwnerStaffReturn {
  const [users, setUsers] = useLocalStorage<AppUser[]>(STORAGE_KEYS.USERS, []);
  const [salaryRecords, setSalaryRecords] = useLocalStorage<AppSalaryRecord[]>(
    STORAGE_KEYS.SALARY_RECORDS,
    []
  );
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<
    AppStaffAttendanceRecord[]
  >(STORAGE_KEYS.STAFF_ATTENDANCE || ("app_staff_attendance" as any), []);

  const staff = users
    .filter((u) => u.role === "CASHIER" || u.role === "WAITER" || u.role === "KITCHEN")
    .filter((u) => {
      const tid = typeof window !== "undefined" ? window.localStorage.getItem("active_tenant_id") : null;
      const userTenant = u.tenantId || "usr-admin-01";
      return !(tid && tid !== "SUPER_ADMIN" && userTenant !== tid);
    })
    .map((u) => ({
      ...u,
      baseSalary: u.baseSalary || ROLE_DEFAULT_BASE_SALARIES[u.role] || 15000,
    }));

  function toggleStaffActive(userId: string, isActive: boolean) {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, isActive } : user))
    );
  }

  function markAttendance(
    staffId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ) {
    const recordId = `${staffId}_${date}`;
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === recordId);
      const newRec: AppStaffAttendanceRecord = {
        id: recordId,
        staffId,
        date,
        status,
        notes,
      };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRec;
        return copy;
      }
      return [...prev, newRec];
    });
  }

  function getStaffMonthLeaveDays(staffId: string, month: string): number {
    // month is format "YYYY-MM"
    const staffMonthLogs = attendanceRecords.filter(
      (r) => r.staffId === staffId && r.date.startsWith(month)
    );
    let absentCount = 0;
    for (const log of staffMonthLogs) {
      if (log.status === "ABSENT") absentCount += 1;
      else if (log.status === "HALF_DAY") absentCount += 0.5;
    }
    return Math.round(absentCount);
  }

  function paySalary(
    staffId: string,
    amount: number,
    month: string,
    leaveDays: number = 0,
    baseSalary?: number,
    deductionAmount: number = 0,
    bonus: number = 0,
    overtime: number = 0
  ) {
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
    setSalaryRecords((prev) => [...prev, newRecord]);
  }

  return {
    staff,
    salaryRecords,
    attendanceRecords,
    toggleStaffActive,
    markAttendance,
    getStaffMonthLeaveDays,
    paySalary,
  };
}
