import { useState, useMemo } from 'react';
import { DatabaseMigration } from '../super-admin_types/migrations_types';
import { MOCK_MIGRATIONS } from '../super-admin_constants/migrations_constants';

export const useMigrations = () => {
  const [migrations, setMigrations] = useState<DatabaseMigration[]>(MOCK_MIGRATIONS);
  const [isApplying, setIsApplying] = useState(false);

  const pendingCount = useMemo(() => migrations.filter(m => m.status === 'pending').length, [migrations]);

  const applyPendingMigrations = () => {
    setIsApplying(true);
    setTimeout(() => {
      setMigrations(prev => prev.map(m => {
        if (m.status === 'pending') {
          return {
            ...m,
            status: 'applied',
            appliedAt: new Date().toISOString(),
            executionTimeMs: Math.floor(Math.random() * 5000) + 1000,
          };
        }
        return m;
      }));
      setIsApplying(false);
      alert('Pending migrations successfully applied to production cluster.');
    }, 2500);
  };

  const rollbackMigration = (id: string) => {
    setMigrations(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'rolling_back' } : m
    ));
    setTimeout(() => {
      setMigrations(prev => prev.map(m => 
        m.id === id ? { ...m, status: 'pending' } : m
      ));
    }, 2000);
  };

  return {
    migrations,
    pendingCount,
    isApplying,
    applyPendingMigrations,
    rollbackMigration
  };
};
