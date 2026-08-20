// RESPONSIBILITY: Centralized API client for Kitchen module (Rule 31)
import { KitchenUrlConfig } from "@/app/kitchen/kitchen_url_config";

export const kitchenApi = {
  async getBaseData() {
    return fetch(KitchenUrlConfig.api.base).then((res) => res.json());
  },
};
