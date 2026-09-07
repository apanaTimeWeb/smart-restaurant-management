import { FeatureFlag } from '../super-admin_types/features_types';

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-001',
    name: 'AI Inventory Predictions',
    description: 'Uses historical sales data to predict required ingredient restocks.',
    rolloutType: 'beta_only',
    tenantCount: 15,
    lastUpdated: '2026-08-15T14:00:00Z',
    updatedBy: 'Data Science Team'
  },
  {
    id: 'ff-002',
    name: 'Advanced KDS Routing',
    description: 'Allows splitting single orders across multiple kitchen display screens.',
    rolloutType: 'global',
    tenantCount: 1450,
    lastUpdated: '2026-07-01T09:30:00Z',
    updatedBy: 'Core Platform Team'
  },
  {
    id: 'ff-003',
    name: 'Crypto Payments Gateway',
    description: 'Experimental integration with Coinbase Commerce for bill settlements.',
    rolloutType: 'disabled',
    tenantCount: 0,
    lastUpdated: '2026-08-20T16:45:00Z',
    updatedBy: 'Fintech Team'
  }
];
