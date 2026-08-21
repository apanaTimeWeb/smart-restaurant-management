import { SuperAdminUser, Permission, AdminRole } from '../super-admin_types/roles_types';

export const MOCK_ADMINS: SuperAdminUser[] = [
  {
    id: 'adm-01',
    name: 'Satya (You)',
    email: 'satya@smartpos360.com',
    role: 'Owner',
    lastLogin: '2026-08-22T01:40:00Z',
    mfaEnabled: true,
  },
  {
    id: 'adm-02',
    name: 'Sarah Support',
    email: 'sarah@smartpos360.com',
    role: 'Support Agent',
    lastLogin: '2026-08-21T09:15:00Z',
    mfaEnabled: true,
  },
  {
    id: 'adm-03',
    name: 'Mike Finance',
    email: 'mike@smartpos360.com',
    role: 'Financial Controller',
    lastLogin: '2026-08-20T14:30:00Z',
    mfaEnabled: false,
  }
];

export const MOCK_PERMISSIONS_MATRIX: Record<AdminRole, Permission[]> = {
  'Owner': [
    { module: 'All Modules', canRead: true, canWrite: true, canDelete: true }
  ],
  'Support Agent': [
    { module: 'Tenants', canRead: true, canWrite: false, canDelete: false },
    { module: 'Tickets', canRead: true, canWrite: true, canDelete: false },
    { module: 'Billing', canRead: false, canWrite: false, canDelete: false }
  ],
  'Financial Controller': [
    { module: 'Tenants', canRead: true, canWrite: false, canDelete: false },
    { module: 'Billing', canRead: true, canWrite: true, canDelete: false },
    { module: 'Infrastructure', canRead: false, canWrite: false, canDelete: false }
  ],
  'DevOps Engineer': [
    { module: 'Infrastructure', canRead: true, canWrite: true, canDelete: true },
    { module: 'Migrations', canRead: true, canWrite: true, canDelete: true },
    { module: 'Billing', canRead: false, canWrite: false, canDelete: false }
  ]
};
