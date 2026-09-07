import { BackgroundJob, JobMetrics } from '../super-admin_types/jobs_types';

export const MOCK_JOBS: BackgroundJob[] = [
  {
    id: 'job-100452',
    name: 'GenerateMonthlyInvoices',
    queue: 'billing',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    durationMs: 1450,
    processedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'job-100453',
    name: 'SyncUberEatsOrders',
    queue: 'integrations',
    status: 'failed',
    attempts: 3,
    maxAttempts: 3,
    durationMs: 5200,
    processedAt: '2026-08-22T08:15:00Z',
    error: 'API Rate Limit Exceeded (429)',
  },
  {
    id: 'job-100454',
    name: 'SendMarketingBlast',
    queue: 'communications',
    status: 'processing',
    attempts: 1,
    maxAttempts: 5,
    durationMs: 45000,
    processedAt: '2026-08-22T09:30:00Z',
  },
  {
    id: 'job-100455',
    name: 'DailyDatabaseBackup',
    queue: 'maintenance',
    status: 'delayed',
    attempts: 0,
    maxAttempts: 1,
    durationMs: 0,
    processedAt: '2026-08-23T00:00:00Z',
  }
];

export const MOCK_JOB_METRICS: JobMetrics = {
  totalProcessed: 14520,
  failedCount: 24,
  delayedCount: 5,
  successRate: 99.8,
};
