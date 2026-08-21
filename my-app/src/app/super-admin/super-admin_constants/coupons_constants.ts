import { Coupon, CouponKPIs } from '../super-admin_types/coupons_types';

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'BFCM2026',
    discountType: 'percentage',
    discountValue: 50,
    maxUses: 100,
    currentUses: 98,
    status: 'active',
    expiresAt: '2026-11-30T23:59:59Z',
  },
  {
    id: 'c-2',
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    maxUses: 500,
    currentUses: 500,
    status: 'depleted',
    expiresAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'c-3',
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    maxUses: 1000,
    currentUses: 450,
    status: 'expired',
    expiresAt: '2026-08-01T23:59:59Z',
  }
];

export const MOCK_COUPON_KPIS: CouponKPIs = {
  totalActive: 12,
  totalSavings: 45200, // $45k given in discounts
  mostUsedCode: 'WELCOME50'
};
