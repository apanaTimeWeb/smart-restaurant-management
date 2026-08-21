import { ExternalService, SystemHealthOverall } from '../super-admin_types/system_types';

export const MOCK_SERVICES: ExternalService[] = [
  {
    id: 'srv-01',
    name: 'Payment Gateway',
    provider: 'Stripe',
    status: 'operational',
    latencyMs: 125,
    lastChecked: '2026-08-22T10:15:00Z',
    errorRate: 0.01,
  },
  {
    id: 'srv-02',
    name: 'Transactional Email',
    provider: 'SendGrid',
    status: 'operational',
    latencyMs: 85,
    lastChecked: '2026-08-22T10:15:00Z',
    errorRate: 0.0,
  },
  {
    id: 'srv-03',
    name: 'SMS Notifications',
    provider: 'Twilio',
    status: 'degraded',
    latencyMs: 850,
    lastChecked: '2026-08-22T10:14:30Z',
    errorRate: 4.5,
  },
  {
    id: 'srv-04',
    name: 'Cloud Storage',
    provider: 'AWS S3',
    status: 'operational',
    latencyMs: 45,
    lastChecked: '2026-08-22T10:15:00Z',
    errorRate: 0.0,
  }
];

export const MOCK_SYSTEM_HEALTH: SystemHealthOverall = {
  globalStatus: 'degraded',
  incidentCount: 1,
  overallUptime: 99.98,
};
