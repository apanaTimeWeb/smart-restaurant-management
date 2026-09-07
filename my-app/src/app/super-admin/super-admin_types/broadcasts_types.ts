export type BroadcastStatus = 'sent' | 'scheduled' | 'draft';
export type BroadcastPriority = 'info' | 'warning' | 'critical';

export interface PlatformBroadcast {
  id: string;
  title: string;
  message: string;
  priority: BroadcastPriority;
  status: BroadcastStatus;
  targetAudience: 'all' | 'active_only' | 'specific_tenants';
  scheduledFor?: string;
  sentAt?: string;
  author: string;
}
