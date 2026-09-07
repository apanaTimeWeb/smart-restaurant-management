import { SupportTicket } from '../super-admin_types/tickets_types';

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-901',
    tenantName: 'The Spicy Pan',
    subject: 'Cannot void an order after payment',
    priority: 'high',
    status: 'open',
    createdAt: '2026-08-22T08:15:00Z',
  },
  {
    id: 'tkt-902',
    tenantName: 'Grand Hotel',
    subject: 'Requesting API key for custom integration',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-08-21T14:30:00Z',
    assignee: 'Sarah Admin'
  },
  {
    id: 'tkt-903',
    tenantName: 'Burger Palace',
    subject: 'Printer is skipping every second receipt',
    priority: 'high',
    status: 'open',
    createdAt: '2026-08-22T09:45:00Z',
  },
  {
    id: 'tkt-904',
    tenantName: 'Cafe Mocha',
    subject: 'Typo in the billing invoice',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-08-19T11:00:00Z',
    assignee: 'John Doe'
  }
];
