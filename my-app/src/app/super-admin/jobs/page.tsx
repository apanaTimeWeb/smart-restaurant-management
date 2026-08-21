"use client";

import React from 'react';
import { useJobs } from '../super-admin_hooks/useJobs';
import JobsMetrics from '../super-admin_components/Jobs/JobsMetrics';
import JobsQueueTable from '../super-admin_components/Jobs/JobsQueueTable';

export default function SuperAdminJobsPage() {
  const { jobs, metrics, retryJob, isRetrying } = useJobs();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Background Jobs</h1>
        <p className="text-[14px] text-secondary mt-1">Monitor BullMQ and Cron worker queues across the platform.</p>
      </div>
      
      <div>
        <JobsMetrics metrics={metrics} />
        <JobsQueueTable jobs={jobs} onRetry={retryJob} isRetrying={isRetrying} />
      </div>
    </div>
  );
}
