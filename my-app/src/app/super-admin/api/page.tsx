"use client";

import React from 'react';
import { useApi } from '../super-admin_hooks/useApi';
import ApiKeysTable from '../super-admin_components/API/ApiKeysTable';
import WebhooksList from '../super-admin_components/API/WebhooksList';

export default function SuperAdminApiPage() {
  const { apiKeys, webhooks, revokeKey, toggleWebhook } = useApi();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">API & Integrations</h1>
        <p className="text-[14px] text-secondary mt-1">Manage global API keys and outgoing webhook endpoints for enterprise integrations.</p>
      </div>
      
      <div>
        <ApiKeysTable apiKeys={apiKeys} onRevoke={revokeKey} />
        <WebhooksList webhooks={webhooks} onToggle={toggleWebhook} />
      </div>
    </div>
  );
}
