import { useState } from 'react';
import { Coupon, CouponKPIs } from '../super-admin_types/coupons_types';
import { MOCK_COUPONS, MOCK_COUPON_KPIS } from '../super-admin_constants/coupons_constants';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [kpis] = useState<CouponKPIs>(MOCK_COUPON_KPIS);
  const [isCreating, setIsCreating] = useState(false);

  const toggleStatus = (id: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status === 'expired' || c.status === 'depleted') return c;
        return { ...c, status: c.status === 'active' ? 'expired' : 'active' };
      }
      return c;
    }));
  };

  return {
    coupons,
    kpis,
    isCreating,
    setIsCreating,
    toggleStatus
  };
};
