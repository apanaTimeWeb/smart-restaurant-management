// RESPONSIBILITY: Isolated TypeScript interfaces and types for Authentication & RBAC module.
// DATA FLOW: AuthTypes.ts → useAuth.ts → AuthContext → Auth Forms & Guards

import type { AppUser, UserRole } from "@/types/appTypes";

export type AuthUserRole = UserRole;

export interface AuthSessionState {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

export interface AuthLoginFormProps {
  onSuccessRedirect?: string;
}

export interface AuthCustomerSignupFormProps {
  onSuccessRedirect?: string;
}

export interface AuthAdminSignupFormProps {
  onSuccessRedirect?: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AuthUserRole[];
}

export interface UseAuthReturn {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (username: string, passwordHash: string) => { success: boolean; message: string; user?: AppUser };
  signupCustomer: (name: string, phone: string, username: string, passwordHash: string) => { success: boolean; message: string; user?: AppUser };
  signupAdmin: (name: string, phone: string, username: string, passwordHash: string) => { success: boolean; message: string; user?: AppUser };
  signupHotelOwner: (name: string, phone: string, email: string, passwordHash: string) => { success: boolean; message: string; user?: AppUser };
  logout: () => void;
  hasRole: (roles: AuthUserRole[]) => boolean;
}
