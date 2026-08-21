"use client";

import React from "react";
import { BackupRecord } from "../../super-admin_types/backup_types";
import { Download, Trash2, Clock, CheckCircle, AlertCircle, Server } from "lucide-react";

interface Props {
  backups: BackupRecord[];
  onDelete: (id: string) => void;
}

export default function BackupHistoryTable({ backups, onDelete }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-success" />;
      case 'in-progress': return <Clock size={14} className="text-primary animate-spin" />;
      case 'failed': return <AlertCircle size={14} className="text-danger" />;
      default: return null;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mt-6">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <Server size={18} className="text-secondary" /> Backup History
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Filename</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Created At</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {backups.map((backup) => (
              <tr key={backup.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 font-medium text-primary font-mono text-[12px]">{backup.filename}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-background rounded-md border border-border text-[11px] text-primary uppercase font-bold tracking-wider">
                    {backup.type}
                  </span>
                </td>
                <td className="p-4 text-primary">{formatBytes(backup.sizeBytes)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 capitalize text-[13px] font-medium text-primary">
                    {getStatusIcon(backup.status)}
                    {backup.status}
                  </div>
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {new Date(backup.createdAt).toLocaleString()}
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    disabled={backup.status !== 'completed'}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background disabled:opacity-30"
                    title="Download Archive"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(backup.id)}
                    disabled={backup.status === 'in-progress'}
                    className="p-2 text-danger hover:bg-danger/10 transition-colors rounded-md disabled:opacity-30"
                    title="Delete Backup"
                  >
                    <Trash2 size={16} />
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
