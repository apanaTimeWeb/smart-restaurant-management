// RESPONSIBILITY: Centralized API client for CashierReports module (Rule 31)
import { CashierReportsUrlConfig } from "@/app/cashier/reports/cashier_reports_url_config";

export const cashier_reportsApi = {
  async getBaseData() {
    return fetch(CashierReportsUrlConfig.api.base).then((res) => res.json());
  },
};
