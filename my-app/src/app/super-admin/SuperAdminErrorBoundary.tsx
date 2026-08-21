"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export default function SuperAdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} />
      </div>
      
      <h2 className="text-[22px] font-bold text-primary mb-2">
        Something went wrong in Super-Admin
      </h2>
      
      <p className="text-secondary max-w-md mx-auto mb-8">
        We encountered an unexpected error while loading this super-admin module. 
        Our engineering team has been notified.
      </p>

      <button
        onClick={() => reset()}
        className="bg-primary text-white font-medium px-6 py-2.5 rounded-md hover:bg-primary-hover transition-colors"
      >
        Try Again
      </button>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-card border border-border rounded-lg text-left overflow-auto max-w-2xl w-full">
          <p className="text-danger font-mono text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
}
