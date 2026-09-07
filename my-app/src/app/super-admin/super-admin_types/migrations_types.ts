export type MigrationStatus = 'applied' | 'pending' | 'failed' | 'rolling_back';

export interface DatabaseMigration {
  id: string;
  name: string; // e.g., 202608221000_add_user_roles
  batch: number;
  status: MigrationStatus;
  appliedAt?: string;
  executionTimeMs?: number;
  author: string;
}
