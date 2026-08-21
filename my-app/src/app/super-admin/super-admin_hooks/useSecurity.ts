import { useState } from 'react';
import { SecuritySettings, WhitelistedIp } from '../super-admin_types/security_types';
import { MOCK_SECURITY_SETTINGS, MOCK_WHITELISTED_IPS } from '../super-admin_constants/security_constants';

export const useSecurity = () => {
  const [settings, setSettings] = useState<SecuritySettings>(MOCK_SECURITY_SETTINGS);
  const [ips, setIps] = useState<WhitelistedIp[]>(MOCK_WHITELISTED_IPS);

  const handleUpdateSettings = (newSettings: Partial<SecuritySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleRemoveIp = (id: string) => {
    setIps((prev) => prev.filter((ip) => ip.id !== id));
  };

  const handleToggleIpStatus = (id: string) => {
    setIps((prev) =>
      prev.map((ip) =>
        ip.id === id
          ? { ...ip, status: ip.status === 'active' ? 'inactive' : 'active' }
          : ip
      )
    );
  };

  return {
    settings,
    ips,
    handleUpdateSettings,
    handleRemoveIp,
    handleToggleIpStatus,
  };
};
