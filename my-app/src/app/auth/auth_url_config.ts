// RESPONSIBILITY: Centralized URL configuration for Auth module (Rule 11)
export const AuthUrlConfig = {
  pages: {
    root: "/auth",
  },
  api: {
    base: "/api/auth",
  },
} as const;
