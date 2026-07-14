// frontend/src/hooks/useFeatureAccess.ts

import { usePlan } from '../contexts/PlanContext.js';
import { PlanFeature } from '../services/plan.service.js';

interface FeatureAccessResult {
  hasFeature: (feature: keyof PlanFeature) => boolean;
  getFeatureValue: <T extends keyof PlanFeature>(feature: T) => PlanFeature[T] | null;
  isLoading: boolean;
  isActive: boolean;
  isOnTrial: boolean;
  planName: string | null;
}

export const useFeatureAccess = (): FeatureAccessResult => {
  const { hasFeature, getFeatureValue, isLoading, isActive, isOnTrial, planName } = usePlan();

  return {
    hasFeature,
    getFeatureValue,
    isLoading,
    isActive,
    isOnTrial,
    planName,
  };
};