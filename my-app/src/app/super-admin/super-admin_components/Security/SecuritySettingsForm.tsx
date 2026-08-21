"use client";

import React from "react";
import { SecuritySettings } from "../../super-admin_types/security_types";

interface Props {
  settings: SecuritySettings;
  onUpdate: (newSettings: Partial<SecuritySettings>) => void;
}

export default function SecuritySettingsForm({ settings, onUpdate }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-[18px] font-bold text-primary mb-4">Global Security Policies</h2>
      
      <div className="flex flex-col gap-6">
        {/* 2FA Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-primary">Enforce Two-Factor Authentication (2FA)</p>
            <p className="text-[12px] text-secondary">Require all restaurant managers to use OTP for login.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.enforce2FA}
              onChange={(e) => onUpdate({ enforce2FA: e.target.checked })}
            />
            <div className="w-11 h-6 bg-secondary/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Session Timeout */}
        <div>
          <label className="block text-[14px] font-medium text-primary mb-1">
            Global Session Timeout (Minutes)
          </label>
          <input 
            type="number" 
            value={settings.sessionTimeoutMinutes}
            onChange={(e) => onUpdate({ sessionTimeoutMinutes: parseInt(e.target.value) || 0 })}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
          />
          <p className="text-[12px] text-secondary mt-1">Users will be automatically logged out after this period of inactivity.</p>
        </div>

        {/* Failed Logins */}
        <div>
          <label className="block text-[14px] font-medium text-primary mb-1">
            Max Failed Login Attempts
          </label>
          <input 
            type="number" 
            value={settings.maxFailedLoginAttempts}
            onChange={(e) => onUpdate({ maxFailedLoginAttempts: parseInt(e.target.value) || 0 })}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
          />
          <p className="text-[12px] text-secondary mt-1">Account will be locked after this many consecutive failed attempts.</p>
        </div>
      </div>
    </div>
  );
}
