"use client";

// RESPONSIBILITY: Admin Data Backup & Restore page shell.
// Wires useAdminData hook to AdminDataPanel.
// DATA FLOW: useAdminData → AdminDataPanel → UI

import { useEffect, useState } from "react";
import { useAdminData } from "@/app/admin/admin_hooks/useAdminData";
import { AdminDataPanel } from "@/app/admin/admin_components/AdminDataPanel";
import { AuthGuard } from "@/app/auth/auth_components/AuthGuard";

// ─── Constants (Rule 35: No magic strings) ────────────────────────────────────

const PAGE_TITLE    = "Data Backup & Restore"                                    as const;
const PAGE_SUBTITLE = "Export, import, and emergency reset system data"          as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDataPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Deps: [] — run once on mount only
  useEffect(() => { setIsMounted(true); }, []);

  const {
    storageUsage,
    isExporting,
    isImporting,
    isResetting,
    exportBackup,
    importRestore,
    emergencyReset,
  } = useAdminData();

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <DataPageHeader />
        <div className="skeleton h-20 max-w-2xl rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
          <div className="skeleton h-36 rounded-xl" />
          <div className="skeleton h-36 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["ADMIN", "HOTEL_OWNER"]}>
      <div className="flex flex-col gap-5">
        <DataPageHeader />
        <AdminDataPanel
          storageUsage={storageUsage}
          isExporting={isExporting}
          isImporting={isImporting}
          isResetting={isResetting}
          onExport={exportBackup}
          onImport={importRestore}
          onReset={emergencyReset}
        />
      </div>
    </AuthGuard>
  );
}

// RESPONSIBILITY: Static page header.
function DataPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[22px] font-bold text-text-primary">{PAGE_TITLE}</h1>
      <p className="text-sm text-text-secondary">{PAGE_SUBTITLE}</p>
    </div>
  );
}
