"use client";

import React from "react";
import { ApiKey } from "../../super-admin_types/api_types";
import { KeyRound, ShieldOff, Copy } from "lucide-react";

interface Props {
  apiKeys: ApiKey[];
  onRevoke: (id: string) => void;
}

export default function ApiKeysTable({ apiKeys, onRevoke }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <KeyRound size={18} className="text-secondary" /> Global API Keys
        </h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors">
          + Generate Root Key
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Key Details</th>
              <th className="p-4 font-medium">Prefix</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Used</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-primary">{apiKey.name}</p>
                  <p className="text-[12px] text-secondary mt-1">Tenant: {apiKey.tenantId}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md w-fit">
                    <span className="font-mono text-[12px] text-primary">{apiKey.keyPrefix}</span>
                    <button className="text-secondary hover:text-primary transition-colors" title="Copy Prefix">
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold capitalize ${apiKey.status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {apiKey.status}
                  </span>
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleString() : 'Never'}
                </td>
                <td className="p-4 text-right flex items-center justify-end">
                  <button 
                    onClick={() => onRevoke(apiKey.id)}
                    disabled={apiKey.status === 'revoked'}
                    className="flex items-center gap-1.5 p-2 text-danger hover:bg-danger/10 transition-colors rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Revoke Key Permanently"
                  >
                    <ShieldOff size={16} /> Revoke
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
