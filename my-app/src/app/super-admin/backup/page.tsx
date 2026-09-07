"use client";

import React from "react";
import { useBackup } from "../super-admin_hooks/useBackup";
import BackupHistoryTable from "../super-admin_components/Backup/BackupHistoryTable";
import { Database, DownloadCloud, AlertTriangle, Loader2 } from "lucide-react";

export default function SuperAdminBackupPage() {
  const { backups, isBackingUp, triggerManualBackup, deleteBackup } = useBackup();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">System Backups</h1>
        <p className="text-[14px] text-secondary mt-1">Export complete platform data or run manual snapshots.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-primary">Full Platform Export</h2>
              <p className="text-[13px] text-secondary">Download all tenants, payments, and users as JSON.</p>
            </div>
          </div>
          <button 
            onClick={triggerManualBackup}
            disabled={isBackingUp}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isBackingUp ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
            <span>{isBackingUp ? 'Snapshotting...' : 'Backup Now'}</span>
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-danger/10 border border-danger/30 rounded-lg flex items-start gap-3">
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

      <BackupHistoryTable backups={backups} onDelete={deleteBackup} />
    </div>
  );
}
