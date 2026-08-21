import React from 'react';

export default function SuperAdminJobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Background Jobs</h1>
        <p className="text-[14px] text-secondary mt-1">Monitor async task queues and scheduled workers.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">Job queue monitor coming soon.</p>
      </div>
    </div>
  );
}
