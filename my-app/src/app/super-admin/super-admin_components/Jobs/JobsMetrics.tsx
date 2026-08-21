"use client";

import React from 'react';
import { JobMetrics } from '../../super-admin_types/jobs_types';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  metrics: JobMetrics;
}

export default function JobsMetrics({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Activity size={20} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Processed (24h)</p>
          <p className="text-[20px] font-bold text-primary">{metrics.totalProcessed.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={20} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Failed Jobs</p>
          <p className="text-[20px] font-bold text-primary">{metrics.failedCount}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Delayed</p>
          <p className="text-[20px] font-bold text-primary">{metrics.delayedCount}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Success Rate</p>
          <span className="text-[12px] font-bold text-success">{metrics.successRate}%</span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div 
            className="bg-success h-2 rounded-full" 
            style={{ width: `${metrics.successRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
