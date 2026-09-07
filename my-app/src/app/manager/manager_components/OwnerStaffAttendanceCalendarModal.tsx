"use client";

// RESPONSIBILITY: Interactive Staff Monthly Attendance Calendar Modal.
// Allows Owner to mark daily attendance (Present, Absent, Half Day) for selected staff member.
// Auto-calculates leave days and syncs directly into payroll salary calculations.
// DATA FLOW: OwnerStaffTable → OwnerStaffAttendanceCalendarModal → markAttendance → app_staff_attendance

import React, { useState } from "react";
import type { AppUser, AppStaffAttendanceRecord, AttendanceStatus } from "@/types/appTypes";
import { X, Calendar, Check, AlertCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface OwnerStaffAttendanceCalendarModalProps {
  isOpen: boolean;
  staff: AppUser | null;
  attendanceRecords: AppStaffAttendanceRecord[];
  onMarkAttendance: (staffId: string, date: string, status: AttendanceStatus) => void;
  onClose: () => void;
}

export function OwnerStaffAttendanceCalendarModal({
  isOpen,
  staff,
  attendanceRecords,
  onMarkAttendance,
  onClose,
}: OwnerStaffAttendanceCalendarModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // "YYYY-MM"
  });

  if (!isOpen || !staff) return null;

  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  // Get attendance logs for this staff member in this month
  const staffMonthLogs = attendanceRecords.filter(
    (r) => r.staffId === staff.id && r.date.startsWith(selectedMonth)
  );

  const attendanceMap: Record<string, AttendanceStatus> = {};
  staffMonthLogs.forEach((r) => {
    attendanceMap[r.date] = r.status;
  });

  // Calculate monthly stats
  let presentCount = 0;
  let absentCount = 0;
  let halfDayCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
    const status = attendanceMap[dateStr] || "PRESENT"; // Default to PRESENT if un-marked
    if (status === "PRESENT") presentCount++;
    else if (status === "ABSENT") absentCount++;
    else if (status === "HALF_DAY") halfDayCount++;
  }

  function handleDayStatusToggle(dateStr: string) {
    const current = attendanceMap[dateStr] || "PRESENT";
    let nextStatus: AttendanceStatus = "ABSENT";
    if (current === "PRESENT") nextStatus = "ABSENT";
    else if (current === "ABSENT") nextStatus = "HALF_DAY";
    else if (current === "HALF_DAY") nextStatus = "PRESENT";

    onMarkAttendance(staff!.id, dateStr, nextStatus);
  }

  function handleMarkAllPresent() {
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
      onMarkAttendance(staff!.id, dateStr, "PRESENT");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-hover/30 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Staff Monthly Attendance Calendar</h2>
              <p className="text-[11px] text-text-secondary">Click any day to toggle status: Present → Absent → Half Day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Staff & Month Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-page p-3.5">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-text-primary">{staff.name}</span>
              <span className="text-[11px] text-text-secondary">{staff.role} • {staff.phone || "No Phone"}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-1.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
              >
                Mark All Present
              </button>
            </div>
          </div>

          {/* Monthly Stats KPI Chips */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center rounded-xl border border-success/30 bg-success/5 p-2.5">
              <span className="text-[10px] font-bold text-success uppercase">Present (P)</span>
              <span className="text-[18px] font-extrabold text-success">{presentCount} Days</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-danger/30 bg-danger/5 p-2.5">
              <span className="text-[10px] font-bold text-danger uppercase">Absent / Leave (A)</span>
              <span className="text-[18px] font-extrabold text-danger">{absentCount} Days</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-warning/30 bg-warning/5 p-2.5">
              <span className="text-[10px] font-bold text-warning uppercase">Half Day (HD)</span>
              <span className="text-[18px] font-extrabold text-warning">{halfDayCount} Days</span>
            </div>
          </div>

          {/* Monthly Days Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
              <span>Calendar Days for {selectedMonth}</span>
              <span className="text-[11px] text-text-secondary">Legend: Green = Present | Red = Absent | Yellow = Half Day</span>
            </div>

            <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto p-1">
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, "0")}`;
                const status = attendanceMap[dateStr] || "PRESENT";

                const bgClass =
                  status === "PRESENT"
                    ? "bg-success text-white"
                    : status === "ABSENT"
                    ? "bg-danger text-white"
                    : "bg-warning text-text-primary font-bold";

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDayStatusToggle(dateStr)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 h-14 transition-all hover:scale-105 shadow-xs ${bgClass}`}
                  >
                    <span className="text-[11px] font-semibold opacity-90">Day {dayNum}</span>
                    <span className="text-[12px] font-extrabold">
                      {status === "PRESENT" ? "P" : status === "ABSENT" ? "ABSENT" : "HALF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-border bg-page px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-all"
          >
            Done & Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
