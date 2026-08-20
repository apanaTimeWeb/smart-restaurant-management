"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Database, DownloadCloud, AlertTriangle } from "lucide-react";

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Database Backup</span>
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">System Backups</h1>
          <p className="text-[12px] text-text-secondary">Export complete platform data or run manual snapshots.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">Full Platform Export</h2>
              <p className="text-[13px] text-text-secondary">Download all tenants, payments, and users as JSON.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-md border border-border bg-input px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-border transition-colors">
            <DownloadCloud size={16} />
            <span>Export .JSON</span>
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-danger-bg border border-danger/30 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-bold text-danger">Danger Zone</h3>
            <p className="text-[13px] text-danger/80 mt-1">Actions here can irreversibly affect platform data. Proceed with extreme caution.</p>
            <button className="mt-3 rounded-md bg-danger px-4 py-2 text-[13px] font-medium text-white hover:bg-red-600 transition-colors">
              Purge Orphaned Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
