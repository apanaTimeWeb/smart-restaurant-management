"use client";

// RESPONSIBILITY: Custom hook managing authentication, session persistence, login, signup, and RBAC authorization.
// DATA FLOW: localStorage (app_users, app_current_user) → useAuth.ts → AuthContextProvider → AuthGuard / UI Components

import { useState, useEffect, useCallback } from "react";
import type { AppUser, UserRole } from "@/types/appTypes";
import type { UseAuthReturn } from "@/app/auth/auth_types/AuthTypes";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { AUTH_DEFAULT_REDIRECT_ROUTES, AUTH_ERRORS, AUTH_SUCCESS } from "@/app/auth/auth_constants/AuthConstants";

/**
 * Custom hook for Authentication and RBAC Session Management.
 * Synchronizes session across browser tabs via storage events.
 */

  const setActiveTenantIdForUser = (user: AppUser) => {
    if (typeof window === "undefined") return;
    let tid = "";
    if (user.role === "MANAGER") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.SAAS_TENANTS);
        if (raw) {
          const tenants = JSON.parse(raw);
          const t = tenants.find((t: any) => t.ownerId === user.id);
          if (t) tid = t.tenantId;
        }
      } catch {}
    } else if (["CASHIER", "WAITER", "KITCHEN", "ADMIN"].includes(user.role)) {
      tid = user.tenantId || user.id;
    } else if (user.role === "SUPER_ADMIN") {
      tid = "SUPER_ADMIN";
    }
    
    // Fallback default for any missing tenant
    if (!tid && user.role !== "SUPER_ADMIN") {
      tid = "T-DEFAULT-01";
    }
    window.localStorage.setItem("active_tenant_id", tid);
  };

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initialize current user from localStorage on mount (SSR safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawUser = window.localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (rawUser) {
        setCurrentUser(JSON.parse(rawUser) as AppUser);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Listen to cross-tab storage changes for instant auth sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CURRENT_USER) {
        if (e.newValue) {
          try {
            setCurrentUser(JSON.parse(e.newValue) as AppUser);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /**
   * Helper function to fetch all registered users from localStorage
   */
  const getUsers = useCallback((): AppUser[] => {
    if (typeof window === "undefined") return [];
    try {
      const rawUsers = window.localStorage.getItem(STORAGE_KEYS.USERS);
      const list: AppUser[] = rawUsers ? (JSON.parse(rawUsers) as AppUser[]) : [];

      // Ensure superadmin is always present
      const hasSuperAdmin = list.some((u) => u.username === "superadmin" || u.email === "superadmin@smartpos.com");
      if (!hasSuperAdmin) {
        const superAdminUser: AppUser = {
          id: "usr-superadmin-01",
          username: "superadmin",
          passwordHash: "superadmin123",
          role: "SUPER_ADMIN",
          name: "Platform Super Admin Master",
          phone: "9999999999",
          email: "superadmin@smartpos.com",
          createdByAdmin: false,
          createdAt: Date.now(),
          isActive: true,
        };
        const updated = [superAdminUser, ...list];
        window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
        return updated;
      }
      return list;
    } catch {
      return [];
    }
  }, []);

  /**
   * Helper function to save users back to localStorage
   */
  const saveUsers = useCallback((users: AppUser[]): void => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, []);

  /**
   * Authenticate user with username and password
   */
  const login = useCallback(
    (username: string, passwordHash: string): { success: boolean; message: string; user?: AppUser } => {
      if (!username || !passwordHash) {
        return { success: false, message: AUTH_ERRORS.REQUIRED_FIELDS };
      }

      const trimmedUser = username.trim().toLowerCase();

      // Direct fallback for Super Admin master login
      if ((trimmedUser === "superadmin" || trimmedUser === "superadmin@smartpos.com") && passwordHash === "superadmin123") {
        const superAdminUser: AppUser = {
          id: "usr-superadmin-01",
          username: "superadmin",
          passwordHash: "superadmin123",
          role: "SUPER_ADMIN",
          name: "Platform Super Admin Master",
          phone: "9999999999",
          email: "superadmin@smartpos.com",
          createdByAdmin: false,
          createdAt: Date.now(),
          isActive: true,
        };

        setCurrentUser(superAdminUser);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(superAdminUser)); setActiveTenantIdForUser(superAdminUser);
        }
        return { success: true, message: AUTH_SUCCESS.LOGIN_SUCCESS, user: superAdminUser };
      }

      const users = getUsers();

      const matchedUser = users.find(
        (u) =>
          (u.username.toLowerCase() === trimmedUser ||
            (u.email && u.email.toLowerCase() === trimmedUser) ||
            (u.phone && u.phone === trimmedUser)) &&
          u.passwordHash === passwordHash
      );

      if (!matchedUser) {
        return { success: false, message: AUTH_ERRORS.INVALID_CREDENTIALS };
      }

      if (!matchedUser.isActive) {
        return { success: false, message: AUTH_ERRORS.INACTIVE_ACCOUNT };
      }

      // Save active session
      setCurrentUser(matchedUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matchedUser)); setActiveTenantIdForUser(matchedUser);
      }

      return { success: true, message: AUTH_SUCCESS.LOGIN_SUCCESS, user: matchedUser };
    },
    [getUsers]
  );

  /**
   * Customer Self-Registration
   */
  const signupCustomer = useCallback(
    (name: string, phone: string, username: string, passwordHash: string): { success: boolean; message: string; user?: AppUser } => {
      if (!name || !username || !passwordHash) {
        return { success: false, message: AUTH_ERRORS.REQUIRED_FIELDS };
      }

      const users = getUsers();
      const trimmedUser = username.trim().toLowerCase();

      const existingUser = users.find(
        (u) => u.username.toLowerCase() === trimmedUser || (phone && u.phone === phone)
      );

      if (existingUser) {
        return { success: false, message: AUTH_ERRORS.USER_ALREADY_EXISTS };
      }

      const newCustomer: AppUser = {
        id: `usr-cust-${Date.now()}`,
        username: trimmedUser,
        passwordHash,
        role: "CUSTOMER",
        name: name.trim(),
        phone: phone.trim() || null,
        createdByAdmin: false,
        createdAt: Date.now(),
        isActive: true,
      };

      const updatedUsers = [...users, newCustomer];
      saveUsers(updatedUsers);

      // Auto-login newly registered customer
      setCurrentUser(newCustomer);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newCustomer)); setActiveTenantIdForUser(newCustomer);
      }

      return { success: true, message: AUTH_SUCCESS.CUSTOMER_SIGNUP_SUCCESS, user: newCustomer };
    },
    [getUsers, saveUsers]
  );

  /**
   * Admin Restaurant Branch Registration
   */
  const signupAdmin = useCallback(
    (name: string, phone: string, username: string, passwordHash: string): { success: boolean; message: string; user?: AppUser } => {
      if (!name || !username || !passwordHash) {
        return { success: false, message: AUTH_ERRORS.REQUIRED_FIELDS };
      }

      const users = getUsers();
      const trimmedUser = username.trim().toLowerCase();

      const existingUser = users.find((u) => u.username.toLowerCase() === trimmedUser);

      if (existingUser) {
        return { success: false, message: AUTH_ERRORS.USER_ALREADY_EXISTS };
      }

      const newAdmin: AppUser = {
        id: `usr-admin-${Date.now()}`,
        username: trimmedUser,
        passwordHash,
        role: "ADMIN",
        name: name.trim(),
        phone: phone.trim() || null,
        createdByAdmin: false,
        createdAt: Date.now(),
        isActive: true,
      };

      const updatedUsers = [...users, newAdmin];
      saveUsers(updatedUsers);

      // Auto-login newly registered admin
      setCurrentUser(newAdmin);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newAdmin)); setActiveTenantIdForUser(newAdmin);
      }

      return { success: true, message: AUTH_SUCCESS.ADMIN_SIGNUP_SUCCESS, user: newAdmin };
    },
    [getUsers, saveUsers]
  );

  /**
   * Hotel Owner Registration with Strict Duplicate Email & Phone Validation
   */
  const signupManager = useCallback(
    (name: string, phone: string, email: string, passwordHash: string): { success: boolean; message: string; user?: AppUser } => {
      if (!name || !phone || !passwordHash) {
        return { success: false, message: AUTH_ERRORS.REQUIRED_FIELDS };
      }

      const users = getUsers();
      const trimmedPhone = phone.trim();
      const trimmedEmail = email ? email.trim().toLowerCase() : "";

      // Strict duplicate validation by phone, username, or email
      const existingUser = users.find(
        (u) =>
          u.phone === trimmedPhone ||
          u.username.toLowerCase() === trimmedPhone.toLowerCase() ||
          (trimmedEmail && u.email && u.email.toLowerCase() === trimmedEmail)
      );

      if (existingUser) {
        return {
          success: false,
          message: "An account with this Email or Phone number is already registered. Please sign in instead.",
        };
      }

      const newOwner: AppUser = {
        id: `usr-owner-${Date.now()}`,
        username: trimmedPhone,
        passwordHash,
        role: "MANAGER",
        name: name.trim(),
        phone: trimmedPhone,
        email: trimmedEmail || undefined,
        createdByAdmin: false,
        createdAt: Date.now(),
        isActive: true,
      };

      const updatedUsers = [...users, newOwner];
      saveUsers(updatedUsers);

      // Auto-login newly registered Hotel Owner with isolated session
      setCurrentUser(newOwner);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newOwner)); setActiveTenantIdForUser(newOwner);
      }

      return { success: true, message: "Hotel Owner account created successfully!", user: newOwner };
    },
    [getUsers, saveUsers]
  );

  /**
   * Terminate current user session
   */
  const logout = useCallback((): void => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.localStorage.removeItem("active_tenant_id");
    }
  }, []);

  /**
   * Check if current user has any of the allowed roles
   */
  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!currentUser) return false;
      return roles.includes(currentUser.role);
    },
    [currentUser]
  );

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    isHydrated,
    login,
    signupCustomer,
    signupAdmin,
    signupManager,
    logout,
    hasRole,
  };
}
