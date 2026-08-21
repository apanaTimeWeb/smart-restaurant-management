export type ServiceStatus = 'operational' | 'degraded' | 'down';

export interface ExternalService {
  id: string;
  name: string;
  provider: string; // e.g., Stripe, Twilio
  status: ServiceStatus;
  latencyMs: number;
  lastChecked: string;
  errorRate: number; // Percentage
}

export interface SystemHealthOverall {
  globalStatus: ServiceStatus;
  incidentCount: number;
  overallUptime: number; // Percentage
}
