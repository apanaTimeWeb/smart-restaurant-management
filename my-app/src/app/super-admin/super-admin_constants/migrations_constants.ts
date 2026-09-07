import { DatabaseMigration } from '../super-admin_types/migrations_types';

export const MOCK_MIGRATIONS: DatabaseMigration[] = [
  {
    id: 'mig-101',
    name: '202608221000_add_webhooks_table',
    batch: 45,
    status: 'pending',
    author: 'DBA Team',
  },
  {
    id: 'mig-100',
    name: '202608201400_index_transactions',
    batch: 44,
    status: 'applied',
    appliedAt: '2026-08-20T14:05:00Z',
    executionTimeMs: 14500,
    author: 'Backend Team',
  },
  {
    id: 'mig-099',
    name: '202608180900_alter_user_roles',
    batch: 43,
    status: 'applied',
    appliedAt: '2026-08-18T09:01:00Z',
    executionTimeMs: 2300,
    author: 'DBA Team',
  },
  {
    id: 'mig-098',
    name: '202608151200_drop_legacy_logs',
    batch: 42,
    status: 'failed',
    appliedAt: '2026-08-15T12:00:00Z',
    executionTimeMs: 450,
    author: 'Backend Team',
  }
];
