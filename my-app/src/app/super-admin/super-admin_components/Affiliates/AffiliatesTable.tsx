"use client";

import React from 'react';
import { Affiliate } from '../../super-admin_types/affiliates_types';
import { Power, ExternalLink, DollarSign } from 'lucide-react';

interface Props {
  affiliates: Affiliate[];
  onProcessPayout: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isProcessingPayout: boolean;
}

export default function AffiliatesTable({ affiliates, onProcessPayout, onToggleStatus, isProcessingPayout }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'suspended': return 'bg-danger/10 text-danger';
      case 'pending': return 'bg-warning/10 text-warning';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary">Affiliate Network</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors">
          + Invite Affiliate
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Affiliate</th>
              <th className="p-4 font-medium">Referral Code</th>
              <th className="p-4 font-medium">Rate</th>
              <th className="p-4 font-medium">Referred</th>
              <th className="p-4 font-medium">Pending Payout</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {affiliates.map((aff) => (
              <tr key={aff.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-primary">{aff.name}</p>
                  <p className="text-[12px] text-secondary">{aff.email}</p>
                </td>
                <td className="p-4 text-primary font-mono tracking-wide">{aff.referralCode}</td>
                <td className="p-4 text-primary">{aff.commissionRate}%</td>
                <td className="p-4 text-primary">{aff.totalReferred} tenants</td>
                <td className="p-4 font-medium text-primary">${aff.pendingPayout.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${getStatusColor(aff.status)}`}>
                    {aff.status}
                  </span>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  {aff.pendingPayout > 0 && (
                    <button 
                      onClick={() => onProcessPayout(aff.id)}
                      disabled={isProcessingPayout}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <DollarSign size={14} /> Pay
                    </button>
                  )}
                  <button 
                    onClick={() => onToggleStatus(aff.id)}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background"
                    title={aff.status === 'active' ? 'Suspend Affiliate' : 'Activate Affiliate'}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background"
                    title="View Details"
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-secondary text-[14px]">
                  No affiliates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
