"use client";

import React from 'react';
import { useCommunications } from '../super-admin_hooks/useCommunications';
import CommunicationsFilterBar from '../super-admin_components/Communications/CommunicationsFilterBar';
import CommunicationsTable from '../super-admin_components/Communications/CommunicationsTable';

export default function SuperAdminCommunicationsPage() {
  const { logs, searchTerm, setSearchTerm, typeFilter, setTypeFilter } = useCommunications();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Communication Logs</h1>
        <p className="text-[14px] text-secondary mt-1">Master log for debugging all sent Emails, SMS, and WhatsApp messages.</p>
      </div>
      
      <div>
        <CommunicationsFilterBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          typeFilter={typeFilter} 
          onTypeFilterChange={setTypeFilter} 
        />
        <CommunicationsTable logs={logs} />
      </div>
    </div>
  );
}
