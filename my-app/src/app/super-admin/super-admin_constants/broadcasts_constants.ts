import { PlatformBroadcast } from '../super-admin_types/broadcasts_types';

export const MOCK_BROADCASTS: PlatformBroadcast[] = [
  {
    id: 'brd-001',
    title: 'Scheduled System Maintenance',
    message: 'The POS system will be undergoing maintenance on Sunday at 2 AM EST. Expect up to 15 minutes of downtime.',
    priority: 'warning',
    status: 'scheduled',
    targetAudience: 'all',
    scheduledFor: '2026-08-30T02:00:00Z',
    author: 'System Admin'
  },
  {
    id: 'brd-002',
    title: 'New Feature: AI Inventory Predictions',
    message: 'We are thrilled to announce that AI inventory predictions are now live for all active tenants! Check your dashboard.',
    priority: 'info',
    status: 'sent',
    targetAudience: 'active_only',
    sentAt: '2026-08-20T10:00:00Z',
    author: 'Product Team'
  },
  {
    id: 'brd-003',
    title: 'Critical Database Upgrade',
    message: 'Immediate action required for legacy tenants on cluster B. Please review the migration docs.',
    priority: 'critical',
    status: 'draft',
    targetAudience: 'specific_tenants',
    author: 'DevOps Team'
  }
];
