"use client";

import React from 'react';
import { useBranding } from '../super-admin_hooks/useBranding';
import BrandingForm from '../super-admin_components/Branding/BrandingForm';

export default function SuperAdminBrandingPage() {
  const { branding, isSaving, handleUpdateBranding, handleSave } = useBranding();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Platform Branding</h1>
        <p className="text-[14px] text-secondary mt-1">Manage white-labeling, custom domains, and platform themes for enterprise clients.</p>
      </div>
      
      <div>
        <BrandingForm 
          branding={branding} 
          isSaving={isSaving}
          onUpdate={handleUpdateBranding} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}
