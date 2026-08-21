import { useState } from 'react';
import { FeatureFlag, FeatureRolloutType } from '../super-admin_types/features_types';
import { MOCK_FEATURE_FLAGS } from '../super-admin_constants/features_constants';

export const useFeatures = () => {
  const [features, setFeatures] = useState<FeatureFlag[]>(MOCK_FEATURE_FLAGS);

  const updateRollout = (id: string, newRollout: FeatureRolloutType) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          rolloutType: newRollout,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Current User'
        };
      }
      return f;
    }));
  };

  return {
    features,
    updateRollout
  };
};
