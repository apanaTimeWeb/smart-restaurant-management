"use client";

import React from "react";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-page text-text-primary">
      {/* Theme Toggle in Top Right Corner */}
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Main Content Area */}
      {children}
    </div>
  );
}
