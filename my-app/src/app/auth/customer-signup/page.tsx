"use client";

// RESPONSIBILITY: Page wrapper for Customer self-registration.
// DATA FLOW: Renders AuthCustomerSignupForm component

import Link from "next/link";
import { AuthCustomerSignupForm } from "@/app/auth/auth_components/AuthCustomerSignupForm";
import { Utensils } from "lucide-react";

export default function CustomerSignupPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
          <Utensils className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Smart POS 360</h1>
          <p className="text-xs text-text-secondary">Customer Portal</p>
        </div>
      </div>

      {/* Main Customer Signup Form */}
      <AuthCustomerSignupForm />

      {/* Footer Navigation Link */}
      <div className="mt-6 text-xs text-text-secondary">
        Already registered?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
