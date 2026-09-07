import { useState } from 'react';
import { BackupRecord } from '../super-admin_types/backup_types';
import { MOCK_BACKUPS } from '../super-admin_constants/backup_constants';

export const useBackup = () => {
  const [backups, setBackups] = useState<BackupRecord[]>(MOCK_BACKUPS);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const triggerManualBackup = () => {
    setIsBackingUp(true);
    
    // Add a dummy in-progress backup
    const newBackupId = `bkp-${Date.now()}`;
    const inProgressBackup: BackupRecord = {
      id: newBackupId,
      filename: `smartpos_manual_${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}.sql.gz`,
      sizeBytes: 0,
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      type: 'manual',
    };
    
    setBackups(prev => [inProgressBackup, ...prev]);

    setTimeout(() => {
      setBackups(prev => prev.map(b => 
        b.id === newBackupId 
          ? { ...b, status: 'completed', sizeBytes: 1542500000 } 
          : b
      ));
      setIsBackingUp(false);
      alert('Manual backup completed successfully.');
    }, 2500); // Simulate backup taking 2.5s
  };

  const deleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
  };

  return {
    backups,
    isBackingUp,
    triggerManualBackup,
    deleteBackup
  };
};
