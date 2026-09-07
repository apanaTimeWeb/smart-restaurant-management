import { useState, useEffect } from 'react';
import { ServerMetrics, DatabaseConnection } from '../super-admin_types/infrastructure_types';
import { MOCK_SERVER_METRICS, MOCK_DATABASE_CONNECTIONS } from '../super-admin_constants/infrastructure_constants';

export const useInfrastructure = () => {
  const [metrics, setMetrics] = useState<ServerMetrics>(MOCK_SERVER_METRICS);
  const [databases] = useState<DatabaseConnection[]>(MOCK_DATABASE_CONNECTIONS);

  // Simulate real-time metrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() * 4 - 2))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    databases
  };
};
