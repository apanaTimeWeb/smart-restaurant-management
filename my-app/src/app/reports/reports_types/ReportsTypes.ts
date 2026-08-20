// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// Reports module. No logic, no imports, no JSX — pure type definitions only.
// DATA FLOW: ReportsTypes.ts → useReports.ts + all Reports components

// ─── Period Union (Rule 35: No inline string literals) ────────────────────────

export type ReportsPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL" | "CUSTOM";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface ReportsTopItem {
  itemId: string;
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export interface ReportsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topPaymentMethod: string;
  periodLabel: string;
  advanceBookingCount: number;
  advanceBookingRevenue: number;
}

export interface ReportsDailyStat {
  date: string;   // formatted display string e.g. "25 Jul"
  revenue: number;
}

// ─── Hook Return Interface ────────────────────────────────────────────────────

export interface UseReportsReturn {
  summary: ReportsSummary;
  topItems: ReportsTopItem[];
  dailyRevenue: ReportsDailyStat[];
  period: ReportsPeriod;
  customDate: string;
  setPeriod: (period: ReportsPeriod) => void;
  setCustomDate: (date: string) => void;
  exportCsv: () => void;
}

// ─── Component Prop Interfaces ────────────────────────────────────────────────

export interface ReportsSummaryCardsProps {
  summary: ReportsSummary;
}

export interface ReportsRevenueChartProps {
  dailyRevenue: ReportsDailyStat[];
}

export interface ReportsTopItemsTableProps {
  topItems: ReportsTopItem[];
}
