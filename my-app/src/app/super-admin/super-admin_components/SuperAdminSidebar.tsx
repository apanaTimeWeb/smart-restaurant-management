"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  Building2,
  Clock,
  CreditCard,
  Receipt,
  Users,
  Shield,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
  Library,
  X,
  UtensilsCrossed
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (v: boolean) => void;
}

export function SuperAdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen = false, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/super-admin/analytics", icon: BarChart2 },
      ]
    },
    {
      title: "TENANTS & CRM",
      items: [
        { label: "Hotel Matrix", href: "/super-admin/hotels", icon: Building2 },
        { label: "Audit Requests", href: "/super-admin/requests", icon: Clock },
      ]
    },
    {
      title: "FINANCE",
      items: [
        { label: "Subscriptions", href: "/super-admin/subscriptions", icon: Receipt },
        { label: "Payments", href: "/super-admin/payments", icon: CreditCard },
      ]
    },
    {
      title: "ADMIN & SYSTEM",
      items: [
        { label: "Staff & Users", href: "/super-admin/users", icon: Users },
        { label: "Audit Logs", href: "/super-admin/audit", icon: Shield },
        { label: "Settings", href: "/super-admin/settings", icon: Settings },
        { label: "Backups", href: "/super-admin/backup", icon: Database },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity" 
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-64px)] bg-sidebar border-r border-border z-40 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed && !isMobileOpen ? "md:w-[60px]" : "md:w-[240px]"
        } w-[240px] ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo Area (Mobile Only) */}
        <div className="md:hidden h-[64px] shrink-0 border-b border-border flex items-center justify-between px-4 bg-sidebar">
          <Link href="/" className="flex items-center gap-2 overflow-hidden transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shrink-0 shadow-sm">
              <UtensilsCrossed size={18} />
            </div>
            <span className="font-bold text-[15px] text-text-primary truncate">
              Smart POS 360
            </span>
          </Link>
          
          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button 
              className="p-1 text-text-secondary hover:text-text-primary rounded"
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              {(!isCollapsed || isMobileOpen) && (
                <p className="px-4 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {group.title}
                </p>
              )}
              <ul className="flex flex-col gap-1 px-2">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-text-secondary hover:bg-border/50 hover:text-text-primary"
                        } ${(isCollapsed && !isMobileOpen) ? "justify-center" : "justify-start"}`}
                        title={(isCollapsed && !isMobileOpen) ? item.label : ""}
                        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                      >
                        <Icon size={18} className="shrink-0" />
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="text-[14px] truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

      </aside>
    </>
  );
}
