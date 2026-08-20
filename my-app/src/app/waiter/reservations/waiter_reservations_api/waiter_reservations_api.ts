// RESPONSIBILITY: Centralized API client for WaiterReservations module (Rule 31)
import { WaiterReservationsUrlConfig } from "@/app/waiter/reservations/waiter_reservations_url_config";

export const waiter_reservationsApi = {
  async getBaseData() {
    return fetch(WaiterReservationsUrlConfig.api.base).then((res) => res.json());
  },
};
