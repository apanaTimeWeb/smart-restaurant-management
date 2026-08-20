// RESPONSIBILITY: Centralized API client for OwnerReservations module (Rule 31)
import { OwnerReservationsUrlConfig } from "@/app/hotel-owner/reservations/owner_reservations_url_config";

export const owner_reservationsApi = {
  async getBaseData() {
    return fetch(OwnerReservationsUrlConfig.api.base).then((res) => res.json());
  },
};
