// RESPONSIBILITY: Centralized API client for Reports module (Rule 31)
import { ReportsUrlConfig } from "@/app/reports/reports_url_config";

export const reportsApi = {
  async getBaseData() {
    return fetch(ReportsUrlConfig.api.base).then((res) => res.json());
  },
};
