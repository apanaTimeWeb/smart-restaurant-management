import { useState } from 'react';
import { SuperAdminUser, AdminRole } from '../super-admin_types/roles_types';
import { MOCK_ADMINS, MOCK_PERMISSIONS_MATRIX } from '../super-admin_constants/roles_constants';

export const useRoles = () => {
  const [admins, setAdmins] = useState<SuperAdminUser[]>(MOCK_ADMINS);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Support Agent');

  const removeAdmin = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const inviteAdmin = (email: string, role: AdminRole) => {
    const newAdmin: SuperAdminUser = {
      id: `adm-${Date.now()}`,
      name: 'Pending Invite',
      email,
      role,
      lastLogin: '-',
      mfaEnabled: false
    };
    setAdmins(prev => [...prev, newAdmin]);
  };

  return {
    admins,
    selectedRole,
    setSelectedRole,
    permissionsMatrix: MOCK_PERMISSIONS_MATRIX,
    removeAdmin,
    inviteAdmin
  };
};
