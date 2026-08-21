// RESPONSIBILITY: Centralized constants for Authentication, RBAC routing, and error messages.
// DATA FLOW: AuthConstants.ts → useAuth.ts → Auth components & pages

import type { UserRole } from "@/types/appTypes";

export const AUTH_DEFAULT_REDIRECT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  MANAGER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
  CUSTOMER: "/customer",
  CASHIER: "/billing",
  WAITER: "/waiter",
  KITCHEN: "/kitchen",
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid Username/ID or Password. Please try again.",
  INACTIVE_ACCOUNT: "Your account is deactivated. Please contact the Admin.",
  USER_ALREADY_EXISTS: "Username or Phone number already registered.",
  UNAUTHORIZED: "You are not authorized to access this page.",
  REQUIRED_FIELDS: "Please fill in all required fields.",
} as const;

export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: "Login successful! Redirecting...",
  CUSTOMER_SIGNUP_SUCCESS: "Account created successfully! Redirecting...",
  ADMIN_SIGNUP_SUCCESS: "Admin branch registered successfully! Redirecting...",
  LOGOUT_SUCCESS: "Logged out successfully.",
} as const;
