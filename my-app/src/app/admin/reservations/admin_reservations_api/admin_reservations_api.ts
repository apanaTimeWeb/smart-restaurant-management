// RESPONSIBILITY: Centralized API client for AdminReservations module (Rule 31)
import { AdminReservationsUrlConfig } from "@/app/admin/reservations/admin_reservations_url_config";

export const admin_reservationsApi = {
  async getBaseData() {
    return fetch(AdminReservationsUrlConfig.api.base).then((res) => res.json());
  },
};
