"use client";

// RESPONSIBILITY: Renders the central login form with password visibility toggle and role-based redirect.
// DATA FLOW: User input → AuthLoginForm.tsx → useAuth.ts → localStorage session → Dashboard redirect

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import type { AuthLoginFormProps } from "@/app/auth/auth_types/AuthTypes";
import { AUTH_DEFAULT_REDIRECT_ROUTES } from "@/app/auth/auth_constants/AuthConstants";
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthLoginForm({ onSuccessRedirect }: AuthLoginFormProps): React.JSX.Element {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    // Call login from hook
    const result = login(username, password);

    if (!result.success) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(result.message);

    // Determine target redirect route
    const targetRoute =
      onSuccessRedirect || (result.user ? AUTH_DEFAULT_REDIRECT_ROUTES[result.user.role] : "/dashboard");

    setTimeout(() => {
      router.push(targetRoute);
    }, 600);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl shadow-black/40">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="mt-1 text-xs text-text-secondary">
          Enter your system credentials to access your assigned terminal
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger-bg bg-danger-bg/20 p-3 text-xs text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success-bg bg-success-bg/20 p-3 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username / System ID Field */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Email / Phone / Username <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-text-disabled" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. owner@gmail.com, 9876543210, admin"
              className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Password Field with Visibility Toggle (Rule 23) */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Password <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-text-disabled" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-disabled hover:text-text-secondary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {isSubmitting ? "Authenticating..." : "Sign In to Terminal"}
        </button>
      </form>

      {/* Development Quick Login Buttons */}
      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          Development Quick Login (Auto-fill & Submit)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { role: "Super Admin", user: "superadmin", pass: "superadmin123", color: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500 hover:text-white" },
            { role: "Hotel Owner", user: "owner", pass: "owner123", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white" },
            { role: "Admin", user: "admin", pass: "admin123", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500 hover:text-white" },
            { role: "Cashier", user: "cashier", pass: "cashier123", color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white" },
            { role: "Waiter", user: "waiter", pass: "waiter123", color: "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500 hover:text-white" },
            { role: "Kitchen", user: "kitchen", pass: "kitchen123", color: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500 hover:text-white" },
            { role: "Customer", user: "customer", pass: "customer123", color: "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500 hover:text-white" },
          ].map((btn) => (
            <button
              key={btn.role}
              type="button"
              onClick={() => {
                setUsername(btn.user);
                setPassword(btn.pass);
                // We use a small timeout to let React update the state before submitting
                setTimeout(() => {
                  const formEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                  handleSubmit(formEvent);
                }, 100);
              }}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors ${btn.color}`}
            >
              {btn.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
