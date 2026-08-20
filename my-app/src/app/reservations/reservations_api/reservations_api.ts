// RESPONSIBILITY: Centralized API client for Reservations module (Rule 31)
import { ReservationsUrlConfig } from "@/app/reservations/reservations_url_config";

export const reservationsApi = {
  async getBaseData() {
    return fetch(ReservationsUrlConfig.api.base).then((res) => res.json());
  },
};
