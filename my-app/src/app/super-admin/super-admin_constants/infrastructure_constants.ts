import { ServerMetrics, DatabaseConnection } from '../super-admin_types/infrastructure_types';

export const MOCK_SERVER_METRICS: ServerMetrics = {
  cpuUsage: 45,
  memoryUsage: 78,
  diskUsage: 32,
  activeNodes: 6,
  uptime: '45d 12h 30m',
};

export const MOCK_DATABASE_CONNECTIONS: DatabaseConnection[] = [
  {
    id: 'db-1',
    name: 'Primary Cluster (Mumbai)',
    type: 'postgres',
    host: 'db-master-01.internal',
    activeConnections: 450,
    maxConnections: 1000,
    status: 'healthy',
    latencyMs: 12,
  },
  {
    id: 'db-2',
    name: 'Read Replica (Delhi)',
    type: 'postgres',
    host: 'db-replica-01.internal',
    activeConnections: 120,
    maxConnections: 1000,
    status: 'healthy',
    latencyMs: 18,
  },
  {
    id: 'db-3',
    name: 'Cache Cluster',
    type: 'redis',
    host: 'redis-master.internal',
    activeConnections: 4950,
    maxConnections: 5000,
    status: 'warning',
    latencyMs: 45,
  }
];
