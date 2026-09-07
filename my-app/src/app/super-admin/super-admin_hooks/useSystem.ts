import { useState, useEffect } from 'react';
import { ExternalService, SystemHealthOverall } from '../super-admin_types/system_types';
import { MOCK_SERVICES, MOCK_SYSTEM_HEALTH } from '../super-admin_constants/system_constants';

export const useSystem = () => {
  const [services, setServices] = useState<ExternalService[]>(MOCK_SERVICES);
  const [health] = useState<SystemHealthOverall>(MOCK_SYSTEM_HEALTH);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatuses = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        lastChecked: new Date().toISOString(),
        latencyMs: s.status === 'degraded' ? s.latencyMs - (Math.random() * 50) : s.latencyMs + (Math.random() * 10 - 5),
      })));
      setIsRefreshing(false);
    }, 1500);
  };

  // Simulate auto-refresh ping
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        lastChecked: new Date().toISOString(),
      })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    services,
    health,
    isRefreshing,
    refreshStatuses
  };
};
