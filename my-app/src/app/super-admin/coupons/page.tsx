"use client";

import React from 'react';
import { useCoupons } from '../super-admin_hooks/useCoupons';
import CouponsKPIs from '../super-admin_components/Coupons/CouponsKPIs';
import CouponsTable from '../super-admin_components/Coupons/CouponsTable';

export default function SuperAdminCouponsPage() {
  const { coupons, kpis, toggleStatus } = useCoupons();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Coupons & Discounts</h1>
        <p className="text-[14px] text-secondary mt-1">Manage global SaaS discount codes for new and existing tenants.</p>
      </div>
      
      <div>
        <CouponsKPIs kpis={kpis} />
        <CouponsTable coupons={coupons} onToggleStatus={toggleStatus} />
      </div>
    </div>
  );
}
