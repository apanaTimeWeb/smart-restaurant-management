"use client";

// RESPONSIBILITY: Landing page footer component with copyright, brand info, and quick links.
// DATA FLOW: Renders static footer information.

import React from "react";
import Link from "next/link";
import { Utensils } from "lucide-react";

export function HomeFooter(): React.JSX.Element {
  return (
    <footer className="bg-header py-10 text-xs text-text-secondary border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Utensils size={18} />
            </div>
            <div>
              <span className="font-bold text-text-primary text-sm">Royal Spice Bistro</span>
              <span className="block text-[10px] text-text-secondary">Smart Restaurant POS 360 v1.0</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-4 text-text-secondary font-medium">
            <Link href="#hero" className="hover:text-text-primary">Home</Link>
            <Link href="#menu" className="hover:text-text-primary">Menu</Link>
            <Link href="#terminals" className="hover:text-text-primary">Terminals</Link>
            <Link href="/auth/login" className="hover:text-primary">Staff Login</Link>
            <Link href="/auth/customer-signup" className="hover:text-primary">Customer Signup</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-[11px] text-text-disabled">
          © {new Date().getFullYear()} Royal Spice Bistro & Smart POS 360. All rights reserved. Powered by Next.js 16 & TypeScript.
        </div>
      </div>
    </footer>
  );
}
