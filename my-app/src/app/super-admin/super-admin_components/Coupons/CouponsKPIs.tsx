"use client";

import React from 'react';
import { CouponKPIs } from '../../super-admin_types/coupons_types';
import { Tag, DollarSign, Award } from 'lucide-react';

interface Props {
  kpis: CouponKPIs;
}

export default function CouponsKPIs({ kpis }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Tag size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Active Coupons</p>
          <p className="text-[24px] font-bold text-primary">{kpis.totalActive}</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Total SaaS Savings</p>
          <p className="text-[24px] font-bold text-primary">${kpis.totalSavings.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
          <Award size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Most Used Code</p>
          <p className="text-[24px] font-bold text-primary">{kpis.mostUsedCode}</p>
        </div>
      </div>
    </div>
  );
}
