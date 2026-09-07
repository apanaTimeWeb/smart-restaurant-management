"use client";

import React from 'react';
import { AlertTriangle, DatabaseZap } from 'lucide-react';

interface Props {
  pendingCount: number;
  isApplying: boolean;
  onApply: () => void;
}

export default function PendingMigrationsAlert({ pendingCount, isApplying, onApply }: Props) {
  if (pendingCount === 0) return null;

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-5 mb-6 flex items-start gap-4">
      <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center text-warning shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-[16px] font-bold text-warning">Pending Database Migrations</h3>
        <p className="text-[13px] text-primary/80 mt-1 max-w-[800px]">
          There are <strong>{pendingCount}</strong> database schema changes waiting to be applied. Applying these migrations will lock tables and may cause temporary downtime.
        </p>
        <button 
          onClick={onApply}
          disabled={isApplying}
          className="mt-4 flex items-center gap-2 bg-warning text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-warning/90 transition-colors disabled:opacity-50"
        >
          <DatabaseZap size={16} />
          {isApplying ? 'Applying Migrations...' : 'Apply Migrations Now'}
        </button>
      </div>
    </div>
  );
}
