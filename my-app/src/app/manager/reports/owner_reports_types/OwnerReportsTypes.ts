// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// OwnerReports module. No logic, no imports, no JSX â€” pure type definitions only.
// DATA FLOW: OwnerReportsTypes.ts â†’ useOwnerReports.ts + all OwnerReports components

// â”€â”€â”€ Period Union (Rule 35: No inline string literals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OwnerReportsPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL" | "CUSTOM";

// â”€â”€â”€ Data Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface OwnerReportsTopItem {
  itemId: string;
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export interface OwnerReportsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topPaymentMethod: string;
  periodLabel: string;
  advanceBookingCount: number;
  advanceBookingRevenue: number;
}

export interface OwnerReportsDailyStat {
  date: string;   // formatted display string e.g. "25 Jul"
  revenue: number;
}

// â”€â”€â”€ Hook Return Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseOwnerReportsReturn {
  summary: OwnerReportsSummary;
  topItems: OwnerReportsTopItem[];
  dailyRevenue: OwnerReportsDailyStat[];
  period: OwnerReportsPeriod;
  customDate: string;
  setPeriod: (period: OwnerReportsPeriod) => void;
  setCustomDate: (date: string) => void;
  exportCsv: () => void;
}

// â”€â”€â”€ Component Prop Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface OwnerReportsSummaryCardsProps {
  summary: OwnerReportsSummary;
}

export interface OwnerReportsRevenueChartProps {
  dailyRevenue: OwnerReportsDailyStat[];
}

export interface OwnerReportsTopItemsTableProps {
  topItems: OwnerReportsTopItem[];
}
