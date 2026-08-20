// RESPONSIBILITY: Centralized API client for Waiter module (Rule 31)
import { WaiterUrlConfig } from "@/app/waiter/waiter_url_config";

export const waiterApi = {
  async getBaseData() {
    return fetch(WaiterUrlConfig.api.base).then((res) => res.json());
  },
};
