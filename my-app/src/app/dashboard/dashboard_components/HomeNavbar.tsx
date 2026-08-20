"use client";

// RESPONSIBILITY: Top Navigation bar for Landing Page with brand logo, nav links, and Sign In / Sign Up CTA buttons.
// DATA FLOW: HomeNavbar.tsx ← useAuth.ts → User profile or Sign In / Sign Up triggers

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { AUTH_DEFAULT_REDIRECT_ROUTES } from "@/app/auth/auth_constants/AuthConstants";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { Utensils, LogIn, UserPlus, LogOut, Menu as MenuIcon, X, Shield } from "lucide-react";

export function HomeNavbar(): React.JSX.Element {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleDashboardRedirect = () => {
    if (currentUser) {
      const target = AUTH_DEFAULT_REDIRECT_ROUTES[currentUser.role] || "/dashboard";
      router.push(target);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-header/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-text-primary">
              Royal Spice <span className="text-primary">Bistro</span>
            </span>
            <span className="block text-[10px] font-semibold text-text-secondary uppercase tracking-widest">
              Smart POS 360 System
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-6 md:flex text-xs font-semibold text-text-secondary">
          <Link href="#hero" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="#menu" className="transition-colors hover:text-primary">
            Menu Specials
          </Link>
          <Link href="#terminals" className="transition-colors hover:text-primary">
            Operating Terminals
          </Link>
          <Link href="#about" className="transition-colors hover:text-primary">
            About Us
          </Link>
          <Link href="#contact" className="transition-colors hover:text-primary">
            Contact & Location
          </Link>
        </nav>

        {/* Actions (Theme Toggle, Auth, Mobile Menu) */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          {/* Desktop Auth & Profile Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDashboardRedirect}
                  className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>My Dashboard ({currentUser.role})</span>
                </button>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="flex items-center gap-1 rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-text-primary transition-all hover:border-border-focus hover:bg-primary/5"
                >
                  <LogIn className="h-3.5 w-3.5 text-primary" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/customer-signup"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Book Table / Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg border border-border p-2 text-text-secondary md:hidden hover:text-text-primary"
          >
            {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden text-xs">
          <nav className="flex flex-col gap-3 font-semibold text-text-secondary">
            <Link
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Menu Specials
            </Link>
            <Link
              href="#terminals"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Operating Terminals
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              About Us
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Contact & Location
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-border">
            {isAuthenticated && currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDashboardRedirect();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-bold text-white"
              >
                <Shield size={16} />
                <span>Go to {currentUser.role} Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 font-semibold text-text-primary"
                >
                  <LogIn size={16} className="text-primary" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/customer-signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white"
                >
                  <UserPlus size={16} />
                  <span>Book Table / Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
