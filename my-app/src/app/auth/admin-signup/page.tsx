"use client";

// RESPONSIBILITY: Page wrapper for Admin Branch registration.
// DATA FLOW: Renders AuthAdminSignupForm component

import Link from "next/link";
import { AuthAdminSignupForm } from "@/app/auth/auth_components/AuthAdminSignupForm";
import { Utensils } from "lucide-react";

export default function AdminSignupPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
          <Utensils className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Smart POS 360</h1>
          <p className="text-xs text-text-secondary">Admin Branch Setup</p>
        </div>
      </div>

      {/* Main Admin Signup Form */}
      <AuthAdminSignupForm />

      {/* Footer Navigation Link */}
      <div className="mt-6 text-xs text-text-secondary">
        Already registered as Admin?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
