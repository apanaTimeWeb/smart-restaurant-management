"use client";

import React from 'react';
import { useTickets } from '../super-admin_hooks/useTickets';
import TicketsFilterBar from '../super-admin_components/Tickets/TicketsFilterBar';
import TicketsTable from '../super-admin_components/Tickets/TicketsTable';

export default function SuperAdminTicketsPage() {
  const { tickets, searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useTickets();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Support Inbox</h1>
        <p className="text-[14px] text-secondary mt-1">Manage, assign, and resolve incoming tickets from restaurant managers.</p>
      </div>
      
      <div>
        <TicketsFilterBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          statusFilter={statusFilter} 
          onStatusFilterChange={setStatusFilter} 
        />
        <TicketsTable tickets={tickets} />
      </div>
    </div>
  );
}
