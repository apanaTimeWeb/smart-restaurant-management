"use client";

import React from "react";
import { ExternalService } from "../../super-admin_types/system_types";
import { ServerCog, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  services: ExternalService[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function ServicesListTable({ services, onRefresh, isRefreshing }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle size={14} className="text-success" />;
      case 'degraded': return <AlertTriangle size={14} className="text-warning" />;
      case 'down': return <XCircle size={14} className="text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <ServerCog size={18} className="text-secondary" /> External Service Health
        </h2>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-secondary/10 text-primary px-4 py-2 rounded-md text-[14px] font-medium hover:bg-secondary/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Ping Services
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Service Name</th>
              <th className="p-4 font-medium">Provider</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Latency</th>
              <th className="p-4 font-medium">Error Rate</th>
              <th className="p-4 font-medium">Last Checked</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {services.map((service) => (
              <tr key={service.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 font-bold text-primary">{service.name}</td>
                <td className="p-4 text-secondary">{service.provider}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 capitalize text-[13px] font-bold text-primary">
                    {getStatusIcon(service.status)}
                    {service.status}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`font-medium ${service.latencyMs > 500 ? 'text-warning' : 'text-primary'}`}>
                    {service.latencyMs.toFixed(0)}ms
                  </span>
                </td>
                <td className="p-4 text-primary">
                  {service.errorRate.toFixed(2)}%
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
