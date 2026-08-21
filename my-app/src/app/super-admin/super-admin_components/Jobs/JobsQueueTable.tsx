"use client";

import React from "react";
import { BackgroundJob } from "../../super-admin_types/jobs_types";
import { RotateCcw, AlertCircle } from "lucide-react";

interface Props {
  jobs: BackgroundJob[];
  onRetry: (id: string) => void;
  isRetrying: boolean;
}

export default function JobsQueueTable({ jobs, onRetry, isRetrying }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'failed': return 'bg-danger/10 text-danger';
      case 'processing': return 'bg-primary/10 text-primary';
      case 'delayed': return 'bg-warning/10 text-warning';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary">Active Worker Queues</h2>
        <button className="bg-secondary/10 text-primary px-4 py-2 rounded-md text-[14px] font-medium hover:bg-secondary/20 transition-colors">
          Pause Queues
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Job Name</th>
              <th className="p-4 font-medium">Queue</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Attempts</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Processed At</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-primary">{job.name}</p>
                  <p className="text-[11px] text-secondary font-mono">{job.id}</p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-background rounded-md border border-border text-[12px] text-primary">
                    {job.queue}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    {job.error && (
                      <span className="text-[11px] text-danger max-w-[150px] truncate flex items-center gap-1" title={job.error}>
                        <AlertCircle size={10} /> {job.error}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-primary text-[12px]">
                  {job.attempts} / {job.maxAttempts}
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {job.durationMs > 0 ? `${(job.durationMs / 1000).toFixed(2)}s` : '-'}
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {new Date(job.processedAt).toLocaleString()}
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  {job.status === 'failed' && (
                    <button 
                      onClick={() => onRetry(job.id)}
                      disabled={isRetrying}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={14} /> Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
