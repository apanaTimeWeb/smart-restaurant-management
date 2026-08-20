"use client";

// RESPONSIBILITY: Route guard component enforcing authentication and Role-Based Access Control (RBAC).
// DATA FLOW: AuthGuard.tsx ← useAuth.ts ← renders children or redirects to /auth/login

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { AuthGuardProps } from "@/app/auth/auth_types/AuthTypes";
import { AUTH_DEFAULT_REDIRECT_ROUTES } from "@/app/auth/auth_constants/AuthConstants";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * AuthGuard wraps protected pages/components and verifies session & role permissions.
 * Redirects unauthenticated users to /auth/login and unauthorized roles to their default dashboard.
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps): React.JSX.Element {
  const router = useRouter();
  const { currentUser, isAuthenticated, isHydrated, hasRole } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      // Redirect unauthorized user to their default role dashboard
      if (currentUser) {
        const defaultRoute = AUTH_DEFAULT_REDIRECT_ROUTES[currentUser.role] || "/dashboard";
        router.push(defaultRoute);
      }
    }
  }, [isHydrated, isAuthenticated, allowedRoles, currentUser, hasRole, router]);

  // Loading skeleton state during hydration check
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-page text-text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-text-secondary">Verifying authentication...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
        <ShieldAlert className="h-12 w-12 text-danger" />
        <h2 className="mt-3 text-lg font-bold">Authentication Required</h2>
        <p className="mt-1 text-sm text-text-secondary">Please log in to access this terminal.</p>
      </div>
    );
  }

  // Role mismatch
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
        <ShieldAlert className="h-12 w-12 text-warning" />
        <h2 className="mt-3 text-lg font-bold">Access Restricted</h2>
        <p className="mt-1 text-sm text-text-secondary">Your account role does not have permission for this view.</p>
      </div>
    );
  }

  return <>{children}</>;
}
