// RESPONSIBILITY: Centralized API client for Customer module (Rule 31)
import { CustomerUrlConfig } from "@/app/customer/customer_url_config";

export const customerApi = {
  async getBaseData() {
    return fetch(CustomerUrlConfig.api.base).then((res) => res.json());
  },
};
