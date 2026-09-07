export interface WhitelistedIp {
  id: string;
  ipAddress: string;
  description: string;
  addedBy: string;
  addedAt: string;
  status: 'active' | 'inactive';
}

export interface SecuritySettings {
  enforce2FA: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  passwordExpiryDays: number;
}
