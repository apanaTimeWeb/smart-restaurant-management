import React from 'react';

export default function SuperAdminInfrastructurePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Infrastructure</h1>
        <p className="text-[14px] text-secondary mt-1">Monitor server metrics (CPU, RAM, DB connections, Redis load).</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">Server monitoring dashboard coming soon.</p>
      </div>
    </div>
  );
}
