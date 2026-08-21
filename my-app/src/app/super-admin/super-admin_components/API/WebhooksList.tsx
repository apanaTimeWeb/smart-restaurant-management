"use client";

import React from "react";
import { WebhookEndpoint } from "../../super-admin_types/api_types";
import { Webhook, Power, AlertCircle } from "lucide-react";

interface Props {
  webhooks: WebhookEndpoint[];
  onToggle: (id: string) => void;
}

export default function WebhooksList({ webhooks, onToggle }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mt-6">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <Webhook size={18} className="text-secondary" /> Registered Webhooks
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Endpoint URL</th>
              <th className="p-4 font-medium">Tenant</th>
              <th className="p-4 font-medium">Subscribed Events</th>
              <th className="p-4 font-medium">Health</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {webhooks.map((hook) => (
              <tr key={hook.id} className={`border-b border-border hover:bg-background/50 transition-colors ${!hook.isActive ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <p className="font-mono text-[12px] text-primary break-all max-w-[300px]">{hook.url}</p>
                </td>
                <td className="p-4 text-secondary text-[13px]">{hook.tenantId}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {hook.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 bg-background border border-border rounded text-[11px] text-primary">
                        {ev}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  {hook.failureCount > 10 ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-danger font-medium">
                      <AlertCircle size={14} /> Disabled (Failing)
                    </span>
                  ) : hook.isActive ? (
                    <span className="text-[12px] text-success font-medium">Healthy</span>
                  ) : (
                    <span className="text-[12px] text-secondary font-medium">Paused</span>
                  )}
                </td>
                <td className="p-4 text-right flex items-center justify-end">
                  <button 
                    onClick={() => onToggle(hook.id)}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background"
                    title={hook.isActive ? "Pause Webhook" : "Resume Webhook"}
                  >
                    <Power size={16} />
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
