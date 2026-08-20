// RESPONSIBILITY: Centralized API client for Cashier module (Rule 31)
import { CashierUrlConfig } from "@/app/cashier/cashier_url_config";

export const cashierApi = {
  async getBaseData() {
    return fetch(CashierUrlConfig.api.base).then((res) => res.json());
  },
};
