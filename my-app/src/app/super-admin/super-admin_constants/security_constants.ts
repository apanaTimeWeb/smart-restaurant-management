import { SecuritySettings, WhitelistedIp } from '../super-admin_types/security_types';

export const MOCK_SECURITY_SETTINGS: SecuritySettings = {
  enforce2FA: true,
  sessionTimeoutMinutes: 60,
  maxFailedLoginAttempts: 5,
  passwordExpiryDays: 90,
};

export const MOCK_WHITELISTED_IPS: WhitelistedIp[] = [
  {
    id: 'ip-1',
    ipAddress: '192.168.1.100',
    description: 'HQ Main Office',
    addedBy: 'admin@platform.com',
    addedAt: '2026-08-10T10:00:00Z',
    status: 'active',
  },
  {
    id: 'ip-2',
    ipAddress: '203.0.113.45',
    description: 'Delhi Support Center',
    addedBy: 'support@platform.com',
    addedAt: '2026-08-15T14:30:00Z',
    status: 'active',
  },
  {
    id: 'ip-3',
    ipAddress: '198.51.100.22',
    description: 'Mumbai Sales Office',
    addedBy: 'sales@platform.com',
    addedAt: '2026-08-20T09:15:00Z',
    status: 'inactive',
  },
];
