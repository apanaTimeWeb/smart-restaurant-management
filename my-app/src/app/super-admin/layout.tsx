"use client";

import React, { useState, useEffect } from "react";
import { SuperAdminSidebar } from "./super-admin_components/SuperAdminSidebar";
import { SuperAdminHeader } from "./super-admin_components/SuperAdminHeader";
import { usePathname } from "next/navigation";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <SuperAdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <SuperAdminHeader 
        isCollapsed={isCollapsed} 
        onMenuClick={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setIsMobileOpen(true);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }}
      />
      
      <main
        className="transition-all duration-300 ease-in-out pt-[64px]"
        style={{ 
          // Default to no margin for mobile, handled by media query classes if possible,
          // but inline styles are harder to make responsive. 
          // We will use CSS classes instead of inline style for margin.
        }}
      >
        <div 
          className={`p-6 transition-all duration-300 ease-in-out ${
            isCollapsed ? "md:ml-[60px]" : "md:ml-[240px]"
          } ml-0`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
