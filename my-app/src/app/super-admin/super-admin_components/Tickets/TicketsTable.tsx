"use client";

import React from "react";
import { SupportTicket } from "../../super-admin_types/tickets_types";
import { MessageSquare, ExternalLink } from "lucide-react";

interface Props {
  tickets: SupportTicket[];
}

export default function TicketsTable({ tickets }: Props) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-danger/10 text-danger';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-primary/10 text-primary';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-danger/10 text-danger border border-danger/20';
      case 'in-progress': return 'bg-warning/10 text-warning border border-warning/20';
      case 'resolved': return 'bg-success/10 text-success border border-success/20';
      case 'closed': return 'bg-secondary/10 text-secondary border border-secondary/20';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Ticket ID</th>
              <th className="p-4 font-medium">Tenant</th>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Assignee</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 text-secondary font-mono text-[12px]">{ticket.id}</td>
                <td className="p-4 font-medium text-primary">{ticket.tenantName}</td>
                <td className="p-4 text-primary max-w-[300px] truncate" title={ticket.subject}>
                  {ticket.subject}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-4 text-secondary">
                  {ticket.assignee ? ticket.assignee : <span className="italic opacity-50">Unassigned</span>}
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    className="flex items-center justify-center p-2 text-primary hover:bg-primary/10 transition-colors rounded-md"
                    title="Reply to Ticket"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    className="flex items-center justify-center p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background"
                    title="View Full Details"
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-secondary text-[14px]">
                  No tickets found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
