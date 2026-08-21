export type FeatureRolloutType = 'global' | 'beta_only' | 'disabled';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  rolloutType: FeatureRolloutType;
  tenantCount: number; // For beta rollouts
  lastUpdated: string;
  updatedBy: string;
}
