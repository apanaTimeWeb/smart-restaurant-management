"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, User, LogOut, Menu, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";

interface HeaderProps {
  isCollapsed: boolean;
  onMenuClick: () => void;
}

export function SuperAdminHeader({ isCollapsed, onMenuClick }: HeaderProps) {
  const { logout, currentUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[64px] bg-header/80 backdrop-blur-md border-b border-border z-20 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6"
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <UtensilsCrossed size={22} className="text-primary" aria-hidden="true" />
          <span className="text-base font-bold text-text-primary">
            Smart POS 360
          </span>
        </Link>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Branch Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card cursor-pointer hover:bg-border/50 transition-colors">
          <span className="text-xs font-bold text-text-primary">Master Branch</span>
          <ChevronDown size={14} className="text-text-secondary" />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger border-2 border-header"></span>
        </button>

        {/* User Profile Dropdown & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:border-l border-border">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <User size={16} />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-text-primary">Super Admin</p>
              <p className="text-[10px] text-text-secondary">{currentUser?.email || "Owner"}</p>
            </div>
            <ChevronDown size={14} className="text-text-secondary hidden sm:block mr-2" />
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
      </div>
    </header>
  );
}
