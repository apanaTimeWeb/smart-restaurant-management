export type CouponStatus = 'active' | 'expired' | 'depleted';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  status: CouponStatus;
  expiresAt: string;
}

export interface CouponKPIs {
  totalActive: number;
  totalSavings: number;
  mostUsedCode: string;
}
