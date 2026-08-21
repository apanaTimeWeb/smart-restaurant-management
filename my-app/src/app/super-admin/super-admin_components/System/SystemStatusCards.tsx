"use client";

import React from 'react';
import { SystemHealthOverall } from '../../super-admin_types/system_types';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  health: SystemHealthOverall;
}

export default function SystemStatusCards({ health }: Props) {
  const isHealthy = health.globalStatus === 'operational';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className={`col-span-1 md:col-span-2 bg-card border rounded-lg p-6 flex flex-col justify-center ${isHealthy ? 'border-success/30' : 'border-warning/30'}`}>
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isHealthy ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {isHealthy ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
          </div>
          <div>
            <p className="text-[14px] text-secondary font-medium uppercase tracking-wider">Global System Status</p>
            <p className={`text-[28px] font-bold capitalize ${isHealthy ? 'text-success' : 'text-warning'}`}>
              {health.globalStatus}
            </p>
            {!isHealthy && (
              <p className="text-[13px] text-secondary mt-1">Some external services are experiencing degraded performance.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={16} />
          </div>
          <p className="text-[14px] text-secondary font-medium uppercase tracking-wider">Overall Uptime</p>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[32px] font-bold text-primary">{health.overallUptime}%</span>
        </div>
      </div>
    </div>
  );
}
