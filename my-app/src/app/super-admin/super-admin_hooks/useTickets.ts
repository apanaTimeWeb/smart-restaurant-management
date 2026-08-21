import { useState, useMemo } from 'react';
import { SupportTicket, TicketStatus } from '../super-admin_types/tickets_types';
import { MOCK_TICKETS } from '../super-admin_constants/tickets_constants';

export const useTickets = () => {
  const [tickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = ticket.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  return {
    tickets: filteredTickets,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  };
};
