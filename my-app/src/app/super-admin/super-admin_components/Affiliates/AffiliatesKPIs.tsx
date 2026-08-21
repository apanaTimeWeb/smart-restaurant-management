"use client";

import React from 'react';
import { AffiliateKPIs } from '../../super-admin_types/affiliates_types';
import { Users, Banknote, Clock } from 'lucide-react';

interface Props {
  kpis: AffiliateKPIs;
}

export default function AffiliatesKPIs({ kpis }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Total Affiliates</p>
          <p className="text-[24px] font-bold text-primary">{kpis.totalAffiliates}</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
          <Banknote size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Total Paid Out</p>
          <p className="text-[24px] font-bold text-primary">${kpis.totalPaidOut.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-[12px] text-secondary font-medium uppercase tracking-wider">Pending Payouts</p>
          <p className="text-[24px] font-bold text-primary">${kpis.pendingPayouts.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
