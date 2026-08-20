// RESPONSIBILITY: Centralized URL configuration for CustomerReservations module (Rule 11)
export const CustomerReservationsUrlConfig = {
  pages: {
    root: "/customer_reservations",
  },
  api: {
    base: "/api/customer_reservations",
  },
} as const;
