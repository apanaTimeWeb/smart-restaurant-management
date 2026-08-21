"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4">
      {/* Generic Skeleton Pattern */}
      <div className="w-full max-w-4xl space-y-4 p-4">
        <div className="h-8 w-1/3 animate-pulse rounded-md bg-skeleton-base" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-skeleton-base" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-lg bg-skeleton-base" />
      </div>
      <div className="flex items-center space-x-2 text-text-secondary">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading data...</span>
      </div>
    </div>
  );
}
