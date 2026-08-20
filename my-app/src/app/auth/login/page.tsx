"use client";

// RESPONSIBILITY: Page wrapper for central user login terminal.
// DATA FLOW: Renders AuthLoginForm component

import React, { Suspense } from "react";
import Link from "next/link";
import { AuthLoginForm } from "@/app/auth/auth_components/AuthLoginForm";
import { Utensils } from "lucide-react";

function LoginPageContent(): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-page p-4 text-text-primary">
      {/* Brand Header */}
      <Link href="/" className="mb-6 flex items-center gap-3 transition-opacity hover:opacity-80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
          <Utensils className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Smart POS 360</h1>
          <p className="text-xs text-text-secondary">Enterprise Restaurant Management</p>
        </div>
      </Link>

      {/* Main Login Card */}
      <AuthLoginForm />

      {/* Footer Navigation Links */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary">
        <Link href="/" className="text-primary hover:underline font-bold mr-2">
          &larr; Back to Home
        </Link>
        <Link
          href="/auth/register"
          className="text-primary hover:underline hover:text-primary-hover font-medium"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
