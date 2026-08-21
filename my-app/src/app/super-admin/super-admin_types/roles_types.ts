export type AdminRole = 'Owner' | 'Support Agent' | 'Financial Controller' | 'DevOps Engineer';

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string;
  mfaEnabled: boolean;
}

export interface Permission {
  module: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}
