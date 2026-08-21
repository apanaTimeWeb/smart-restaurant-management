import { useState, useMemo } from 'react';
import { CommunicationLog, CommunicationType } from '../super-admin_types/communications_types';
import { MOCK_COMMUNICATION_LOGS } from '../super-admin_constants/communications_constants';

export const useCommunications = () => {
  const [logs] = useState<CommunicationLog[]>(MOCK_COMMUNICATION_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunicationType | 'all'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, typeFilter]);

  return {
    logs: filteredLogs,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
  };
};
