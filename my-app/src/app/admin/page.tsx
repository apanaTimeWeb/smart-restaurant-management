"use client";

// RESPONSIBILITY: Admin route shell at `/admin` — redirects cleanly to `/admin/dashboard`.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
