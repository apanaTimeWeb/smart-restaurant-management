"use client";

import React from "react";
import { DatabaseMigration } from "../../super-admin_types/migrations_types";
import { History, Undo2, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface Props {
  migrations: DatabaseMigration[];
  onRollback: (id: string) => void;
}

export default function MigrationsHistoryTable({ migrations, onRollback }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle size={14} className="text-success" />;
      case 'pending': return <Clock size={14} className="text-warning" />;
      case 'failed': return <AlertCircle size={14} className="text-danger" />;
      case 'rolling_back': return <Loader2 size={14} className="text-primary animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <History size={18} className="text-secondary" /> Migration History
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Batch</th>
              <th className="p-4 font-medium">Migration Name</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Execution Time</th>
              <th className="p-4 font-medium">Applied At</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {migrations.map((migration) => (
              <tr key={migration.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <span className="px-2 py-1 bg-background rounded-md border border-border text-[12px] text-primary font-mono">
                    #{migration.batch}
                  </span>
                </td>
                <td className="p-4">
                  <p className="font-mono text-primary font-medium">{migration.name}</p>
                  <p className="text-[11px] text-secondary mt-1">Author: {migration.author}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 capitalize text-[13px] font-medium text-primary">
                    {getStatusIcon(migration.status)}
                    {migration.status.replace('_', ' ')}
                  </div>
                </td>
                <td className="p-4 text-primary text-[12px]">
                  {migration.executionTimeMs ? `${(migration.executionTimeMs / 1000).toFixed(2)}s` : '-'}
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {migration.appliedAt ? new Date(migration.appliedAt).toLocaleString() : '-'}
                </td>
                <td className="p-4 text-right flex items-center justify-end">
                  <button 
                    onClick={() => onRollback(migration.id)}
                    disabled={migration.status !== 'applied'}
                    className="flex items-center gap-1 p-2 text-warning hover:bg-warning/10 transition-colors rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Rollback Migration"
                  >
                    <Undo2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
