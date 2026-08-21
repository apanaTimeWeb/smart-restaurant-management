// RESPONSIBILITY: Single source of truth for all TypeScript types used in the
// CashierReports module. No logic, no imports, no JSX â€” pure type definitions only.
// DATA FLOW: CashierReportsTypes.ts â†’ useCashierReports.ts + all CashierReports components

// â”€â”€â”€ Period Union (Rule 35: No inline string literals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CashierReportsPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL" | "CUSTOM";

// â”€â”€â”€ Data Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierReportsTopItem {
  itemId: string;
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export interface CashierReportsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topPaymentMethod: string;
  periodLabel: string;
  advanceBookingCount: number;
  advanceBookingRevenue: number;
}

export interface CashierReportsDailyStat {
  date: string;   // formatted display string e.g. "25 Jul"
  revenue: number;
}

// â”€â”€â”€ Hook Return Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseCashierReportsReturn {
  summary: CashierReportsSummary;
  topItems: CashierReportsTopItem[];
  dailyRevenue: CashierReportsDailyStat[];
  period: CashierReportsPeriod;
  customDate: string;
  setPeriod: (period: CashierReportsPeriod) => void;
  setCustomDate: (date: string) => void;
  exportCsv: () => void;
}

// â”€â”€â”€ Component Prop Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CashierReportsSummaryCardsProps {
  summary: CashierReportsSummary;
}

export interface CashierReportsRevenueChartProps {
  dailyRevenue: CashierReportsDailyStat[];
}

export interface CashierReportsTopItemsTableProps {
  topItems: CashierReportsTopItem[];
}
