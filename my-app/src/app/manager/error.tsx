"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Module Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-danger/10 p-4 text-danger">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-text-primary">Something went wrong!</h2>
      <p className="mt-2 max-w-md text-text-secondary">
        An unexpected error occurred while loading this module. Please try again or contact support if the issue persists.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
