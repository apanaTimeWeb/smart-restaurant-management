// RESPONSIBILITY: Centralized API client for Auth module (Rule 31)
import { AuthUrlConfig } from "@/app/auth/auth_url_config";

export const authApi = {
  async getBaseData() {
    return fetch(AuthUrlConfig.api.base).then((res) => res.json());
  },
};
