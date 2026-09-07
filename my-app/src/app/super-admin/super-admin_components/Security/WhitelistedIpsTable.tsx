"use client";

import React from "react";
import { WhitelistedIp } from "../../super-admin_types/security_types";
import { Trash2, Power } from "lucide-react";

interface Props {
  ips: WhitelistedIp[];
  onRemove: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function WhitelistedIpsTable({ ips, onRemove, onToggleStatus }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary">Whitelisted IP Addresses</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors">
          + Add IP Range
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">IP Address</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Added By</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {ips.map((ip) => (
              <tr key={ip.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 text-primary font-mono">{ip.ipAddress}</td>
                <td className="p-4 text-secondary">{ip.description}</td>
                <td className="p-4 text-secondary">{ip.addedBy}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${
                    ip.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onToggleStatus(ip.id)}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background"
                    title={ip.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    onClick={() => onRemove(ip.id)}
                    className="p-2 text-danger hover:bg-danger/10 transition-colors rounded-md"
                    title="Remove IP"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {ips.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary text-[14px]">
                  No IPs whitelisted. The system is open to all IPs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
