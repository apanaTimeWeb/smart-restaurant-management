export type KeyStatus = 'active' | 'revoked';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  tenantId: string;
  status: KeyStatus;
  createdAt: string;
  lastUsedAt?: string;
}

export type WebhookEvent = 'order.created' | 'payment.failed' | 'tenant.suspended';

export interface WebhookEndpoint {
  id: string;
  url: string;
  tenantId: string;
  events: WebhookEvent[];
  isActive: boolean;
  failureCount: number;
}
