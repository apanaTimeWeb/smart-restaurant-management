"use client";

// RESPONSIBILITY: Hotel Owner Registration page (`/owner/register`).
// Allows new restaurant owners to create an account with Owner Name, Phone, Email, Password.
// Automatically assigns UserRole: "MANAGER" and redirects to Onboarding Profile Wizard.
// DATA FLOW: owner/register/page.tsx -> useAuth / registerUser -> owner/onboarding/page.tsx

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User, Phone, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError("Please fill in all required registration fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    setTimeout(() => {
      // Simulate successful registration & store owner session
      login(formData.phone, "MANAGER");
      router.push("/owner/dashboard");
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-page text-text-primary">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white shadow-lg">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-black text-text-primary">
            Partner With Smart POS 360
          </h1>
          <p className="text-xs text-text-secondary max-w-xs">
            Register your Restaurant Business & Manager Account to get started.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs font-bold text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Owner Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Business Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. owner@restaurant.com"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Account Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-extrabold text-xs text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Creating Partner Account…</span>
            ) : (
              <>
                <span>Continue to Restaurant Onboarding</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-border/50 pt-4 text-center">
          <p className="text-xs text-text-secondary">
            Already registered?{" "}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
