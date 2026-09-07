export interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeNodes: number;
  uptime: string;
}

export type DbStatus = 'healthy' | 'warning' | 'critical';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgres' | 'redis';
  host: string;
  activeConnections: number;
  maxConnections: number;
  status: DbStatus;
  latencyMs: number;
}
