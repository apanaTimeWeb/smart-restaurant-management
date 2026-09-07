"use client";

import React from "react";
import { FeatureFlag, FeatureRolloutType } from "../../super-admin_types/features_types";
import { ToggleRight, Users, Globe, XCircle } from "lucide-react";

interface Props {
  features: FeatureFlag[];
  onUpdateRollout: (id: string, rollout: FeatureRolloutType) => void;
}

export default function FeatureFlagsTable({ features, onUpdateRollout }: Props) {
  const getRolloutIcon = (type: string) => {
    switch (type) {
      case 'global': return <Globe size={14} className="text-success" />;
      case 'beta_only': return <Users size={14} className="text-warning" />;
      case 'disabled': return <XCircle size={14} className="text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mt-6">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
          <ToggleRight size={18} className="text-secondary" /> Active Feature Flags
        </h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors">
          + New Flag
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/30 text-secondary text-[12px] uppercase tracking-wider">
              <th className="p-4 font-medium">Feature</th>
              <th className="p-4 font-medium">Rollout Scope</th>
              <th className="p-4 font-medium">Active Tenants</th>
              <th className="p-4 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {features.map((feature) => (
              <tr key={feature.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-primary">{feature.name}</p>
                  <p className="text-[12px] text-secondary mt-1">{feature.description}</p>
                  <p className="text-[11px] text-primary/50 font-mono mt-1">ID: {feature.id}</p>
                </td>
                <td className="p-4">
                  <select 
                    value={feature.rolloutType}
                    onChange={(e) => onUpdateRollout(feature.id, e.target.value as FeatureRolloutType)}
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-[13px] text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="global">Global (100%)</option>
                    <option value="beta_only">Beta Tenants Only</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-secondary font-medium">
                    {getRolloutIcon(feature.rolloutType)}
                    <span className="capitalize">{feature.rolloutType.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="p-4 text-primary font-medium">
                  {feature.tenantCount.toLocaleString()} 
                  <span className="text-secondary font-normal text-[12px]"> enabled</span>
                </td>
                <td className="p-4">
                  <p className="text-[12px] text-primary">{new Date(feature.lastUpdated).toLocaleDateString()}</p>
                  <p className="text-[11px] text-secondary mt-1">by {feature.updatedBy}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
