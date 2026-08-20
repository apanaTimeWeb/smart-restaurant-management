// RESPONSIBILITY: Centralized API client for Billing module (Rule 31)
import { BillingUrlConfig } from "@/app/billing/billing_url_config";

export const billingApi = {
  async getBaseData() {
    return fetch(BillingUrlConfig.api.base).then((res) => res.json());
  },
};
