"use client";

import React, { useState } from "react";
import { SuperAdminUser, AdminRole } from "../../super-admin_types/roles_types";
import { Users, Shield, Trash2, MailPlus } from "lucide-react";

interface Props {
  admins: SuperAdminUser[];
  onRemove: (id: string) => void;
  onInvite: (email: string, role: AdminRole) => void;
}

export default function RolesTable({ admins, onRemove, onInvite }: Props) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('Support Agent');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      onInvite(inviteEmail, inviteRole);
      setInviteEmail('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <Users size={18} className="text-secondary" /> Active Staff Members
        </h2>
        
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <input 
            type="email" 
            placeholder="colleague@smartpos360.com" 
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="w-full sm:w-auto bg-background border border-border rounded-md px-3 py-1.5 text-[13px] text-primary focus:outline-none focus:border-primary"
            required
          />
          <select 
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as AdminRole)}
            className="w-full sm:w-auto bg-background border border-border rounded-md px-3 py-1.5 text-[13px] text-primary focus:outline-none focus:border-primary"
          >
            <option value="Support Agent">Support Agent</option>
            <option value="Financial Controller">Financial Controller</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Owner">Owner</option>
          </select>
          <button type="submit" className="w-full sm:w-auto bg-primary text-white px-4 py-1.5 rounded-md text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <MailPlus size={14} /> Invite
          </button>
        </form>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Staff Member</th>
              <th className="p-4 font-medium">Assigned Role</th>
              <th className="p-4 font-medium">2FA Status</th>
              <th className="p-4 font-medium">Last Login</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-primary">{admin.name}</p>
                  <p className="text-[12px] text-secondary">{admin.email}</p>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold">
                    {admin.role}
                  </span>
                </td>
                <td className="p-4">
                  {admin.mfaEnabled ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-success font-medium">
                      <Shield size={14} /> Enabled
                    </span>
                  ) : (
                    <span className="text-[12px] text-danger font-medium">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {admin.lastLogin === '-' ? '-' : new Date(admin.lastLogin).toLocaleString()}
                </td>
                <td className="p-4 text-right flex items-center justify-end">
                  <button 
                    onClick={() => onRemove(admin.id)}
                    disabled={admin.role === 'Owner'}
                    className="p-2 text-danger hover:bg-danger/10 transition-colors rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title={admin.role === 'Owner' ? 'Cannot remove Owner' : 'Remove Access'}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
