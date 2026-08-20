"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { UserRole } from "@/types/appTypes";

export function PublicNavbar() {
  const { currentUser, isHydrated, logout } = useAuth();
  const router = useRouter();

  const getDashboardLink = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN": return "/super-admin/dashboard";
      case "HOTEL_OWNER": return "/owner/dashboard";
      case "CUSTOMER": return "/customer/profile";
      case "KITCHEN": return "/kitchen";
      case "WAITER": return "/waiter";
      case "CASHIER": return "/billing";
      default: return "/admin/dashboard";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "HOTEL_OWNER": return "Hotel Owner";
      case "CASHIER": return "Cashier";
      case "WAITER": return "Waiter";
      case "KITCHEN": return "Kitchen Staff";
      case "CUSTOMER": return "Customer";
      default: return "Admin";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white shadow-md">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-text-primary">
              Smart POS 360 <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">SaaS</span>
            </span>
            <p className="text-[10px] text-text-muted hidden sm:block">Multi-City Enterprise Marketplace & POS</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isHydrated && currentUser ? (
            <>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500 border border-emerald-500/20">
                {getRoleDisplayName(currentUser.role)}
              </span>
              
              <Link
                href={getDashboardLink(currentUser.role)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                {currentUser.role === "CUSTOMER" ? "Profile" : "Go to Dashboard"}
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/owner/register"
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-extrabold text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xs"
              >
                <Building2 size={15} />
                <span className="hidden sm:inline">List Your Restaurant</span>
              </Link>

              <Link
                href="/auth/login"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
