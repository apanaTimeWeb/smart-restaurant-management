import { Affiliate, AffiliateKPIs } from '../super-admin_types/affiliates_types';

export const MOCK_AFFILIATES: Affiliate[] = [
  {
    id: 'aff-001',
    name: 'Tech Influencer X',
    email: 'contact@influencerx.com',
    referralCode: 'TECHX',
    commissionRate: 15,
    totalReferred: 42,
    pendingPayout: 1250.00,
    status: 'active',
    joinedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'aff-002',
    name: 'Restaurant Consultants LLC',
    email: 'partners@resconsultants.com',
    referralCode: 'RCONSULT',
    commissionRate: 20,
    totalReferred: 18,
    pendingPayout: 3400.50,
    status: 'active',
    joinedAt: '2026-03-22T14:30:00Z',
  },
  {
    id: 'aff-003',
    name: 'Spammy Marketer',
    email: 'deals@cheapleads.com',
    referralCode: 'CHEAP10',
    commissionRate: 10,
    totalReferred: 0,
    pendingPayout: 0,
    status: 'suspended',
    joinedAt: '2026-08-01T09:15:00Z',
  }
];

export const MOCK_AFFILIATE_KPIS: AffiliateKPIs = {
  totalAffiliates: 145,
  totalPaidOut: 125400.00,
  pendingPayouts: 18450.75
};
