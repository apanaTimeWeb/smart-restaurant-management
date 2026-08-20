// RESPONSIBILITY: Centralized API client for Home module (Rule 31)
import { HomeUrlConfig } from "@/app/dashboard/dashboard_url_config";

export const dashboardApi = {
  async getBaseData() {
    return fetch(HomeUrlConfig.api.base).then((res) => res.json());
  },
};
