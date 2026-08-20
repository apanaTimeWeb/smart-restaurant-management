// RESPONSIBILITY: Centralized API client for AdminReports module (Rule 31)
import { AdminReportsUrlConfig } from "@/app/admin/reports/admin_reports_url_config";

export const admin_reportsApi = {
  async getBaseData() {
    return fetch(AdminReportsUrlConfig.api.base).then((res) => res.json());
  },
};
