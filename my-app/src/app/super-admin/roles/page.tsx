"use client";

import React from 'react';
import { useRoles } from '../super-admin_hooks/useRoles';
import RolesTable from '../super-admin_components/Roles/RolesTable';
import PermissionsMatrix from '../super-admin_components/Roles/PermissionsMatrix';

export default function SuperAdminRolesPage() {
  const { admins, selectedRole, setSelectedRole, permissionsMatrix, removeAdmin, inviteAdmin } = useRoles();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Role-Based Access Control</h1>
        <p className="text-[14px] text-secondary mt-1">Manage permissions for your internal staff accessing the Super Admin dashboard.</p>
      </div>
      
      <div>
        <RolesTable admins={admins} onRemove={removeAdmin} onInvite={inviteAdmin} />
        <PermissionsMatrix 
          selectedRole={selectedRole} 
          onRoleSelect={setSelectedRole} 
          permissionsMatrix={permissionsMatrix} 
        />
      </div>
    </div>
  );
}
