"use client";

import React from "react";
import { PlatformBroadcast } from "../../super-admin_types/broadcasts_types";
import { Trash2, Radio } from "lucide-react";

interface Props {
  broadcasts: PlatformBroadcast[];
  onDelete: (id: string) => void;
}

export default function BroadcastsHistoryTable({ broadcasts, onDelete }: Props) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'info': return 'bg-primary/10 text-primary';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-danger/10 text-danger';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-success';
      case 'scheduled': return 'text-warning';
      case 'draft': return 'text-secondary';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <Radio size={18} className="text-secondary" /> Broadcast History
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Alert Title</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Audience</th>
              <th className="p-4 font-medium">Status / Timing</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {broadcasts.map((broadcast) => (
              <tr key={broadcast.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-primary">{broadcast.title}</p>
                  <p className="text-[12px] text-secondary max-w-[300px] truncate mt-1">{broadcast.message}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getPriorityColor(broadcast.priority)}`}>
                    {broadcast.priority}
                  </span>
                </td>
                <td className="p-4 text-primary text-[13px] capitalize">
                  {broadcast.targetAudience.replace('_', ' ')}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`text-[13px] font-bold capitalize ${getStatusColor(broadcast.status)}`}>
                      {broadcast.status}
                    </span>
                    <span className="text-[11px] text-secondary">
                      {broadcast.status === 'scheduled' ? new Date(broadcast.scheduledFor!).toLocaleString() : 
                       broadcast.status === 'sent' ? new Date(broadcast.sentAt!).toLocaleString() : '-'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right flex items-center justify-end">
                  <button 
                    onClick={() => onDelete(broadcast.id)}
                    className="p-2 text-danger hover:bg-danger/10 transition-colors rounded-md"
                    title="Delete Broadcast"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {broadcasts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary text-[14px]">
                  No broadcasts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
