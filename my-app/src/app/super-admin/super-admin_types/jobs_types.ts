export type JobStatus = 'completed' | 'failed' | 'processing' | 'delayed';

export interface BackgroundJob {
  id: string;
  name: string;
  queue: string;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  durationMs: number;
  processedAt: string;
  error?: string;
}

export interface JobMetrics {
  totalProcessed: number;
  failedCount: number;
  delayedCount: number;
  successRate: number; // Percentage
}
