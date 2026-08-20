"use client";

// RESPONSIBILITY: Renders the fixed top header — logo, sidebar toggle,
// branch name, theme toggle, notification bell, user avatar.
// No sidebar state logic — receives toggle handler via props.
// DATA FLOW: useAppShellSidebar → AppShellHeader (toggle fn as prop) → JSX

import { useState, useEffect } from "react";
import { Menu, UtensilsCrossed, ChevronDown, Bell, User, LogOut } from "lucide-react";
import { APP_SHELL_DEFAULT_BRANCH } from "@/components/AppShell/AppShellConstants";
import type { AppShellHeaderProps } from "@/components/AppShell/AppShellTypes";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { AppNotificationDrawer } from "@/components/AppShell/AppNotificationDrawer";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AppShellHeader({ onMenuClick }: AppShellHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { unreadCount } = useNotifications(currentUser?.role);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <>
      <header
        data-header
        className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-header/80 px-4 backdrop-blur-md"
      >
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <UtensilsCrossed size={22} className="text-primary" aria-hidden="true" />
            <span className="text-base font-bold text-text-primary">
              Smart POS 360
            </span>
          </Link>
        </div>

        {/* Right: Branch, Theme, Bell, User Profile & Logout */}
        <div className="flex items-center gap-1.5">
          {/* Branch Name */}
          <button
            aria-label="Select branch"
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex"
          >
            <span>{APP_SHELL_DEFAULT_BRANCH}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            title="Notifications"
            aria-label="Notifications"
            className="relative rounded-md p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-primary"
          >
            <Bell size={20} />
            {isMounted && unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Info & Logout Button */}
          {currentUser ? (
            <div className="ml-1 flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-semibold text-text-primary">{currentUser.name}</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="flex items-center gap-1 rounded-md bg-danger/10 px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="ml-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Notification Slide-Over Drawer */}
      <AppNotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        role={currentUser?.role}
      />
    </>
  );
}

