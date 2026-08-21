import React from 'react';

export default function SuperAdminFeaturesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Feature Flags</h1>
        <p className="text-[14px] text-secondary mt-1">Manage global feature toggles and beta rollouts.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">Feature flag management coming soon.</p>
      </div>
    </div>
  );
}
