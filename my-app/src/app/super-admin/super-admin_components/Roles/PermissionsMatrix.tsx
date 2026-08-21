"use client";

import React from 'react';
import { Permission, AdminRole } from '../../super-admin_types/roles_types';
import { Lock, Check, X } from 'lucide-react';

interface Props {
  selectedRole: AdminRole;
  onRoleSelect: (role: AdminRole) => void;
  permissionsMatrix: Record<AdminRole, Permission[]>;
}

export default function PermissionsMatrix({ selectedRole, onRoleSelect, permissionsMatrix }: Props) {
  const roles: AdminRole[] = ['Owner', 'Support Agent', 'Financial Controller', 'DevOps Engineer'];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mt-6 flex flex-col md:flex-row">
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-background/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-[14px] font-bold text-primary flex items-center gap-2">
            <Lock size={16} className="text-secondary" /> Access Roles
          </h2>
        </div>
        <div className="flex flex-row md:flex-col p-2 gap-1 overflow-x-auto">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => onRoleSelect(role)}
              className={`text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
                selectedRole === role ? 'bg-primary text-white' : 'text-secondary hover:bg-background'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        <h3 className="text-[16px] font-bold text-primary mb-4">{selectedRole} Permissions</h3>
        
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50 text-secondary text-[12px] uppercase tracking-wider">
                <th className="p-3 font-medium">Module Access</th>
                <th className="p-3 font-medium text-center">Read</th>
                <th className="p-3 font-medium text-center">Write</th>
                <th className="p-3 font-medium text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix[selectedRole].map((perm, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-background/30">
                  <td className="p-3 font-medium text-primary text-[13px]">{perm.module}</td>
                  <td className="p-3 text-center">
                    {perm.canRead ? <Check size={16} className="text-success mx-auto" /> : <X size={16} className="text-danger mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {perm.canWrite ? <Check size={16} className="text-success mx-auto" /> : <X size={16} className="text-danger mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {perm.canDelete ? <Check size={16} className="text-success mx-auto" /> : <X size={16} className="text-danger mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-secondary mt-4">
          Note: Roles and permissions are strictly enforced at the API gateway level.
        </p>
      </div>
    </div>
  );
}
