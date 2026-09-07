"use client";

import React from 'react';
import { useBroadcasts } from '../super-admin_hooks/useBroadcasts';
import NewBroadcastForm from '../super-admin_components/Broadcasts/NewBroadcastForm';
import BroadcastsHistoryTable from '../super-admin_components/Broadcasts/BroadcastsHistoryTable';

export default function SuperAdminBroadcastsPage() {
  const { broadcasts, isSending, createBroadcast, deleteBroadcast } = useBroadcasts();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Platform Broadcasts</h1>
        <p className="text-[14px] text-secondary mt-1">Blast global alerts, maintenance windows, and feature announcements to tenant dashboards.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NewBroadcastForm isSending={isSending} onSubmit={createBroadcast} />
        </div>
        <div className="lg:col-span-2">
          <BroadcastsHistoryTable broadcasts={broadcasts} onDelete={deleteBroadcast} />
        </div>
      </div>
    </div>
  );
}
