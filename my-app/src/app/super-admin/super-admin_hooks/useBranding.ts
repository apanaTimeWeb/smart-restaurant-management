import { useState } from 'react';
import { TenantBranding } from '../super-admin_types/branding_types';
import { MOCK_TENANT_BRANDING } from '../super-admin_constants/branding_constants';

export const useBranding = () => {
  const [branding, setBranding] = useState<TenantBranding>(MOCK_TENANT_BRANDING);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateBranding = (updates: Partial<TenantBranding>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Branding settings saved successfully!");
    }, 1000);
  };

  return {
    branding,
    isSaving,
    handleUpdateBranding,
    handleSave,
  };
};
