"use client";

import React from 'react';
import { useSecurity } from '../super-admin_hooks/useSecurity';
import SecuritySettingsForm from '../super-admin_components/Security/SecuritySettingsForm';
import WhitelistedIpsTable from '../super-admin_components/Security/WhitelistedIpsTable';

export default function SuperAdminSecurityPage() {
  const { settings, ips, handleUpdateSettings, handleRemoveIp, handleToggleIpStatus } = useSecurity();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Security & Compliance</h1>
        <p className="text-[14px] text-secondary mt-1">Manage global platform security, IP whitelisting, and 2FA policies.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SecuritySettingsForm 
            settings={settings} 
            onUpdate={handleUpdateSettings} 
          />
        </div>
        <div className="lg:col-span-2">
          <WhitelistedIpsTable 
            ips={ips} 
            onRemove={handleRemoveIp} 
            onToggleStatus={handleToggleIpStatus} 
          />
        </div>
      </div>
    </div>
  );
}
