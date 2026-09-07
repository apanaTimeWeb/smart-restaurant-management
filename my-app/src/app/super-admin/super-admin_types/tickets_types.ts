export type TicketPriority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  tenantName: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignee?: string;
}
