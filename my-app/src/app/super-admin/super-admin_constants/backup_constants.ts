import { BackupRecord } from '../super-admin_types/backup_types';

export const MOCK_BACKUPS: BackupRecord[] = [
  {
    id: 'bkp-5501',
    filename: 'smartpos_dump_20260822_0000.sql.gz',
    sizeBytes: 1542000000, // ~1.5 GB
    status: 'completed',
    createdAt: '2026-08-22T00:00:00Z',
    type: 'automated',
  },
  {
    id: 'bkp-5502',
    filename: 'smartpos_dump_20260821_0000.sql.gz',
    sizeBytes: 1541500000, 
    status: 'completed',
    createdAt: '2026-08-21T00:00:00Z',
    type: 'automated',
  },
  {
    id: 'bkp-5503',
    filename: 'smartpos_manual_20260820_1430.sql.gz',
    sizeBytes: 1538000000, 
    status: 'completed',
    createdAt: '2026-08-20T14:30:00Z',
    type: 'manual',
  },
  {
    id: 'bkp-5504',
    filename: 'smartpos_dump_20260820_0000.sql.gz',
    sizeBytes: 0, 
    status: 'failed',
    createdAt: '2026-08-20T00:00:00Z',
    type: 'automated',
  }
];
