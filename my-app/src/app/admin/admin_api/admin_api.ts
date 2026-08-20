// RESPONSIBILITY: Centralized API client for Admin module (Rule 31)
import { AdminUrlConfig } from "@/app/admin/admin_url_config";

export const adminApi = {
  async getBaseData() {
    return fetch(AdminUrlConfig.api.base).then((res) => res.json());
  },
};
