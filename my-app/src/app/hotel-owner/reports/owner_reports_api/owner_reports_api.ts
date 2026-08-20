// RESPONSIBILITY: Centralized API client for OwnerReports module (Rule 31)
import { OwnerReportsUrlConfig } from "@/app/hotel-owner/reports/owner_reports_url_config";

export const owner_reportsApi = {
  async getBaseData() {
    return fetch(OwnerReportsUrlConfig.api.base).then((res) => res.json());
  },
};
