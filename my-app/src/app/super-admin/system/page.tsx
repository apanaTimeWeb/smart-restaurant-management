import React from 'react';

export default function SuperAdminSystemPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">System Health</h1>
        <p className="text-[14px] text-secondary mt-1">Monitor global uptime and third-party API statuses.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">System health dashboard coming soon.</p>
      </div>
    </div>
  );
}
