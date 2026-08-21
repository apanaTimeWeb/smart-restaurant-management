"use client";

import React from 'react';
import { useFeatures } from '../super-admin_hooks/useFeatures';
import FeatureFlagsTable from '../super-admin_components/Features/FeatureFlagsTable';

export default function SuperAdminFeaturesPage() {
  const { features, updateRollout } = useFeatures();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Feature Flags</h1>
        <p className="text-[14px] text-secondary mt-1">Toggle experimental beta features globally or per-tenant.</p>
      </div>
      
      <div>
        <FeatureFlagsTable features={features} onUpdateRollout={updateRollout} />
      </div>
    </div>
  );
}
