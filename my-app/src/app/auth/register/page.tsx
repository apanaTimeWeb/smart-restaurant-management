"use client";

// RESPONSIBILITY: Unified User & Partner Registration page (`/auth/register`).
// Allows users to select their account role via tab toggle:
// 👤 Customer / Guest User (CUSTOMER) vs 🏨 Hotel / Restaurant Owner (MANAGER).
// DATA FLOW: /auth/register -> useAuth.login() -> Role Dashboard Redirect

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building2,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { UserRole } from "@/types/appTypes";

function UnifiedRegisterPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const { login, signupManager, signupCustomer } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("MANAGER");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      setErrorMessage("Please fill in your name, phone, and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let result;
    if (selectedRole === "MANAGER") {
      result = signupManager(formData.name, formData.phone, formData.email, formData.password);
    } else {
      result = signupCustomer(formData.name, formData.phone, formData.email, formData.password);
    }

    if (!result.success) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      if (redirect) {
        router.push(redirect);
      } else if (selectedRole === "MANAGER") {
        router.push("/manager/dashboard");
      } else {
        router.push("/");
      }
    }, 600);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
      {/* Brand Header */}
      <Link href="/" className="mb-6 flex items-center gap-3 transition-opacity hover:opacity-80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white shadow-lg">
          <UtensilsCrossed size={26} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-text-primary">Smart POS 360</h1>
          <p className="text-xs text-text-secondary">Enterprise Restaurant SaaS Platform</p>
        </div>
      </Link>

      {/* Main Registration Card */}
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-text-primary">Create Your Account</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Select your account type to get started on Smart POS 360
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface border border-border/60 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole("MANAGER")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-extrabold transition-all ${
              selectedRole === "MANAGER"
                ? "bg-primary text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Building2 size={16} />
            <span>Manager</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-extrabold transition-all ${
              selectedRole === "CUSTOMER"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <User size={16} />
            <span>Customer / User</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs font-bold text-danger">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Full Name *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={selectedRole === "MANAGER" ? "e.g. Rajesh Sharma" : "e.g. Vikram Sethi"}
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Mobile Phone Number *
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold text-text-secondary">
              Password *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-xs text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
              selectedRole === "MANAGER" ? "bg-primary hover:bg-primary/90" : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {isSubmitting ? (
              <span>Creating {selectedRole === "MANAGER" ? "Manager" : "User"} Account…</span>
            ) : (
              <>
                <span>Register as {selectedRole === "MANAGER" ? "Manager" : "Customer / User"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-border/50 pt-4 text-center">
          <p className="text-xs text-text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Sign In Here
            </Link>
          </p>
          <div className="mt-4">
            <Link href="/" className="text-xs font-bold text-primary hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedRegisterPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold">Loading...</div>}>
      <UnifiedRegisterPageContent />
    </Suspense>
  );
}
