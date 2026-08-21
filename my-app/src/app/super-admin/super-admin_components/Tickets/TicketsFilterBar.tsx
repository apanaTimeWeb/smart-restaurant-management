"use client";

import React from "react";
import { TicketStatus } from "../../super-admin_types/tickets_types";
import { Search, Filter } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: TicketStatus | 'all';
  onStatusFilterChange: (val: TicketStatus | 'all') => void;
}

export default function TicketsFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-lg p-4 mb-6">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
        <input 
          type="text" 
          placeholder="Search by subject or tenant..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Filter className="text-secondary" size={18} />
        <select 
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as TicketStatus | 'all')}
          className="w-full sm:w-48 bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary capitalize"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
}
