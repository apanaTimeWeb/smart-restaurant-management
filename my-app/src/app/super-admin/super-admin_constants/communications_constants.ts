import { CommunicationLog } from '../super-admin_types/communications_types';

export const MOCK_COMMUNICATION_LOGS: CommunicationLog[] = [
  {
    id: 'msg-101',
    type: 'whatsapp',
    recipient: '+91 9876543210',
    subject: 'Order Receipt #1042',
    status: 'delivered',
    sentAt: '2026-08-22T08:15:00Z',
    tenantName: 'The Spicy Pan',
  },
  {
    id: 'msg-102',
    type: 'email',
    recipient: 'manager@grandhotel.com',
    subject: 'Your August SaaS Invoice',
    status: 'bounced',
    errorMessage: 'Recipient mailbox is full.',
    sentAt: '2026-08-22T07:30:00Z',
    tenantName: 'Grand Hotel',
  },
  {
    id: 'msg-103',
    type: 'sms',
    recipient: '+91 9123456789',
    subject: 'Login OTP',
    status: 'failed',
    errorMessage: 'Number format invalid.',
    sentAt: '2026-08-22T07:15:00Z',
    tenantName: 'Burger Palace',
  },
  {
    id: 'msg-104',
    type: 'whatsapp',
    recipient: '+91 9988776655',
    subject: 'Marketing Blast: Weekend Offer',
    status: 'sent',
    sentAt: '2026-08-22T06:00:00Z',
    tenantName: 'The Spicy Pan',
  },
  {
    id: 'msg-105',
    type: 'email',
    recipient: 'admin@tajmumbai.com',
    subject: 'Welcome to Smart Restaurant POS',
    status: 'delivered',
    sentAt: '2026-08-21T14:20:00Z',
    tenantName: 'Taj Mumbai',
  }
];
