"use client";

import React from "react";
import { DatabaseConnection } from "../../super-admin_types/infrastructure_types";
import { Database, Activity } from "lucide-react";

interface Props {
  databases: DatabaseConnection[];
}

export default function DatabaseConnectionsTable({ databases }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-danger/10 text-danger';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <Database size={18} className="text-secondary" /> Global Database Connections
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Cluster Name</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Host</th>
              <th className="p-4 font-medium">Connections</th>
              <th className="p-4 font-medium">Latency</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {databases.map((db) => (
              <tr key={db.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 font-medium text-primary">{db.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-background rounded-md border border-border text-[12px] text-primary uppercase font-bold tracking-wider">
                    {db.type}
                  </span>
                </td>
                <td className="p-4 text-secondary font-mono text-[12px]">{db.host}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-primary text-[12px]">{db.activeConnections} / {db.maxConnections}</span>
                    <div className="w-full bg-background rounded-full h-1.5">
                      <div 
                        className={`${(db.activeConnections/db.maxConnections) > 0.8 ? 'bg-danger' : 'bg-primary'} h-1.5 rounded-full`} 
                        style={{ width: `${(db.activeConnections / db.maxConnections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-secondary text-[12px] flex items-center gap-1.5 mt-2">
                  <Activity size={12} className={db.latencyMs > 20 ? 'text-warning' : 'text-success'} />
                  {db.latencyMs}ms
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${getStatusColor(db.status)}`}>
                    {db.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
