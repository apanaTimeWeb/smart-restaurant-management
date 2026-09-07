"use client";

import React from 'react';
import { useSystem } from '../super-admin_hooks/useSystem';
import SystemStatusCards from '../super-admin_components/System/SystemStatusCards';
import ServicesListTable from '../super-admin_components/System/ServicesListTable';

export default function SuperAdminSystemPage() {
  const { services, health, isRefreshing, refreshStatuses } = useSystem();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">System Health</h1>
        <p className="text-[14px] text-secondary mt-1">Live status of internal microservices and external third-party providers.</p>
      </div>
      
      <div>
        <SystemStatusCards health={health} />
        <ServicesListTable services={services} onRefresh={refreshStatuses} isRefreshing={isRefreshing} />
      </div>
    </div>
  );
}
