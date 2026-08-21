"use client";

// RESPONSIBILITY: Renders interactive role cards for instant demo terminal access.
// DATA FLOW: Role card click → useAuth.ts login → role dashboard redirect

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { UserRole } from "@/types/appTypes";
import { Shield, CreditCard, Utensils, Flame, Smartphone, ArrowRight, Upload, QrCode } from "lucide-react";
import { CustomerQrUploadModal } from "@/app/customer/customer_components/CustomerQrUploadModal";

interface RoleCardInfo {
  role: UserRole;
  title: string;
  subtitle: string;
  username: string;
  password: string;
  icon: React.ElementType;
  badgeColor: string;
  description: string;
}

const ROLE_CARDS: RoleCardInfo[] = [
  {
    role: "SUPER_ADMIN",
    title: "Platform Super Admin Master",
    subtitle: "Global SaaS Command Center",
    username: "superadmin@smartpos.com",
    password: "superadmin123",
    icon: Shield,
    badgeColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    description: "SaaS revenue KPIs, today's joins, audit queues, payment verifications & tenant toggles.",
  },
  {
    role: "CUSTOMER",
    title: "Customer Self-Service",
    subtitle: "QR & Advance Booking",
    username: "customer",
    password: "customer123",
    icon: Smartphone,
    badgeColor: "bg-success-bg text-success border-success/30",
    description: "Table QR scanning, upload existing QR image, dish pre-ordering, menu browsing, live order tracker.",
  },
];

export function HomeRoleAccessPanel(): React.JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleInstantDemoLogin = (username: string, password: string, targetRoute: string) => {
    const res = login(username, password);
    if (res.success) {
      router.push(targetRoute);
    }
  };

  return (
    <>
      <section id="terminals" className="py-16 bg-page border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Role-Based Access Control</span>
            <h2 className="mt-1 text-2xl font-black text-text-primary sm:text-4xl">
              2 Operating Role Terminals
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl mx-auto">
              Each role logs into its own dedicated isolated dashboard. Click any role below for instant demo login.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROLE_CARDS.map((card) => {
              const IconComp = card.icon;
              const targetRoute =
                card.role === "SUPER_ADMIN" ? "/super-admin/dashboard" :
                card.role === "MANAGER" ? "/owner/dashboard" :
                card.role === "ADMIN" ? "/admin/dashboard" :
                card.role === "CASHIER" ? "/billing" :
                card.role === "WAITER" ? "/waiter" :
                card.role === "KITCHEN" ? "/kitchen" : "/customer";
              const isCustomer = card.role === "CUSTOMER";

              return (
                <div
                  key={card.role}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-border-focus hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComp size={24} />
                      </div>
                      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase ${card.badgeColor}`}>
                        {card.role}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-text-secondary">{card.subtitle}</p>
                    <p className="mt-3 text-xs text-text-secondary leading-relaxed">{card.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60">
                    <div className="mb-3 flex items-center justify-between text-[11px] font-mono text-text-secondary">
                      <span>ID: <strong className="text-text-primary">{card.username}</strong></span>
                      <span>Pass: <strong className="text-text-primary">{card.password}</strong></span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleInstantDemoLogin(card.username, card.password, targetRoute)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
                      >
                        <span>Launch {card.role} Terminal</span>
                        <ArrowRight size={14} />
                      </button>

                      {isCustomer && (
                        <button
                          onClick={() => setIsQrModalOpen(true)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/10 py-2 text-xs font-bold text-success transition-all hover:bg-success hover:text-white"
                        >
                          <Upload size={13} />
                          <span>Upload Existing Waiter QR Image</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer QR Upload & Selector Modal */}
      <CustomerQrUploadModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </>
  );
}
