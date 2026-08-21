import { useState } from 'react';
import { ApiKey, WebhookEndpoint } from '../super-admin_types/api_types';
import { MOCK_API_KEYS, MOCK_WEBHOOKS } from '../super-admin_constants/api_constants';

export const useApi = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);

  const revokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => 
      k.id === id ? { ...k, status: 'revoked' } : k
    ));
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive, failureCount: 0 } : w
    ));
  };

  return {
    apiKeys,
    webhooks,
    revokeKey,
    toggleWebhook
  };
};
