"use client";

import React from 'react';
import { ServerMetrics } from '../../super-admin_types/infrastructure_types';
import { Server, Cpu, HardDrive } from 'lucide-react';

interface Props {
  metrics: ServerMetrics;
}

export default function ServerMetricsCards({ metrics }: Props) {
  const getProgressColor = (value: number) => {
    if (value > 85) return 'bg-danger';
    if (value > 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Cpu size={16} />
          </div>
          <p className="text-[14px] text-secondary font-medium uppercase tracking-wider">CPU Load Avg</p>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[24px] font-bold text-primary">{metrics.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-background rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(metrics.cpuUsage)}`} 
            style={{ width: `${metrics.cpuUsage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Server size={16} />
          </div>
          <p className="text-[14px] text-secondary font-medium uppercase tracking-wider">Memory Usage</p>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[24px] font-bold text-primary">{metrics.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-background rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(metrics.memoryUsage)}`} 
            style={{ width: `${metrics.memoryUsage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-6">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <HardDrive size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Active Nodes</p>
          <p className="text-[24px] font-bold text-primary">{metrics.activeNodes}</p>
          <p className="text-[11px] text-secondary mt-1">Uptime: {metrics.uptime}</p>
        </div>
      </div>
    </div>
  );
}
