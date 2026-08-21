export type CommunicationType = 'email' | 'sms' | 'whatsapp';
export type DeliverabilityStatus = 'delivered' | 'bounced' | 'failed' | 'sent';

export interface CommunicationLog {
  id: string;
  type: CommunicationType;
  recipient: string;
  subject: string;
  status: DeliverabilityStatus;
  sentAt: string;
  errorMessage?: string;
  tenantName: string;
}
