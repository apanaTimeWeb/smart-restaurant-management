"use client";

// RESPONSIBILITY: Owner Audit Log page shell.
// Reads audit logs from localStorage and renders OwnerAuditLogTable.
// DATA FLOW: useLocalStorage(AUDIT_LOGS) → OwnerAuditLogTable → UI

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { OwnerAuditLogTable } from "@/app/hotel-owner/hotel-owner_components/OwnerAuditLogTable";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";
import type { AppAuditLog } from "@/types/appTypes";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Audit Log"                                          as const;
const PAGE_SUBTITLE = "All sensitive actions — checkout, discounts, voids, loyalty" as const;
const SKELETON_ROWS = 5                                                    as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerAuditPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Deps: [] — run once on mount only
  useEffect(() => { setIsMounted(true); }, []);

  // Rule 61: No direct localStorage — hooks only
  const [auditLogs] = useLocalStorage<AppAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <AuditPageHeader />
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["HOTEL_OWNER"]}>
      <div className="flex flex-col gap-5">
        <AuditPageHeader />
        <OwnerAuditLogTable auditLogs={auditLogs} />
      </div>
    </AuthGuard>
  );
}

// RESPONSIBILITY: Static page header.
function AuditPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
