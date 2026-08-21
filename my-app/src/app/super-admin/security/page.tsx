import React from 'react';

export default function SuperAdminSecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Security & Compliance</h1>
        <p className="text-[14px] text-secondary mt-1">Manage global platform security, IP whitelisting, and 2FA policies.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">Security management dashboard coming soon.</p>
      </div>
    </div>
  );
}
