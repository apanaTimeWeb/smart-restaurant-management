// RESPONSIBILITY: Centralized API client for CustomerReservations module (Rule 31)
import { CustomerReservationsUrlConfig } from "@/app/customer/reservations/customer_reservations_url_config";

export const customer_reservationsApi = {
  async getBaseData() {
    return fetch(CustomerReservationsUrlConfig.api.base).then((res) => res.json());
  },
};
