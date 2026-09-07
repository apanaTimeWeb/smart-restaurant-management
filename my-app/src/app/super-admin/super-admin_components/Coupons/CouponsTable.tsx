"use client";

import React from 'react';
import { Coupon } from '../../super-admin_types/coupons_types';
import { Power, Trash2 } from 'lucide-react';

interface Props {
  coupons: Coupon[];
  onToggleStatus: (id: string) => void;
}

export default function CouponsTable({ coupons, onToggleStatus }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'depleted': return 'bg-warning/10 text-warning';
      case 'expired': return 'bg-danger/10 text-danger';
      default: return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary">Global Coupons</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors">
          + Create Coupon
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Discount</th>
              <th className="p-4 font-medium">Usage</th>
              <th className="p-4 font-medium">Expires At</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 text-primary font-mono font-bold tracking-wide">{coupon.code}</td>
                <td className="p-4 text-primary">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} Off
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-primary text-[12px]">{coupon.currentUses} / {coupon.maxUses}</span>
                    <div className="w-full bg-background rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-secondary text-[12px]">
                  {new Date(coupon.expiresAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${getStatusColor(coupon.status)}`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onToggleStatus(coupon.id)}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-md hover:bg-background disabled:opacity-30"
                    title="Toggle Status"
                    disabled={coupon.status === 'expired' || coupon.status === 'depleted'}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    className="p-2 text-danger hover:bg-danger/10 transition-colors rounded-md"
                    title="Delete Coupon"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary text-[14px]">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
