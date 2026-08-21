import { ApiKey, WebhookEndpoint } from '../super-admin_types/api_types';

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key-101',
    name: 'Enterprise ERP Sync',
    keyPrefix: 'spos_prod_8f9a...',
    tenantId: 'tenant-405',
    status: 'active',
    createdAt: '2026-05-10T10:00:00Z',
    lastUsedAt: '2026-08-22T01:30:00Z',
  },
  {
    id: 'key-102',
    name: 'Zapier Integration',
    keyPrefix: 'spos_test_2b4c...',
    tenantId: 'tenant-112',
    status: 'active',
    createdAt: '2026-07-20T14:15:00Z',
    lastUsedAt: '2026-08-21T09:45:00Z',
  },
  {
    id: 'key-103',
    name: 'Compromised Key (Rotated)',
    keyPrefix: 'spos_prod_99xx...',
    tenantId: 'tenant-405',
    status: 'revoked',
    createdAt: '2026-01-15T08:00:00Z',
  }
];

export const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh-01',
    url: 'https://api.acmerestaurants.com/pos/webhook',
    tenantId: 'tenant-405',
    events: ['order.created', 'payment.failed'],
    isActive: true,
    failureCount: 0,
  },
  {
    id: 'wh-02',
    url: 'https://hooks.zapier.com/hooks/catch/12345/',
    tenantId: 'tenant-112',
    events: ['tenant.suspended'],
    isActive: false,
    failureCount: 15, // Disabled due to failures
  }
];
