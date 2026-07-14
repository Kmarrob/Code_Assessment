// frontend/src/contexts/PlanContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext.js';
import { subscriptionService, Subscription, SubscriptionStatusResult } from '../services/subscription.service.js';
import { PlanFeature } from '../services/plan.service.js';

interface PlanContextData {
  subscription: Subscription | null;
  status: SubscriptionStatusResult | null;
  isLoading: boolean;
  hasFeature: (feature: keyof PlanFeature) => boolean;
  getFeatureValue: <T extends keyof PlanFeature>(feature: T) => PlanFeature[T] | null;
  isActive: boolean;
  isOnTrial: boolean;
  planName: string | null;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextData | undefined>(undefined);

export const usePlan = (): PlanContextData => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlanData = async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await subscriptionService.getActiveSubscription();
      setSubscription(data.subscription);
      setStatus(data.status);
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      setSubscription(null);
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlanData();
  }, [isAuthenticated, user]);

  const hasFeature = (feature: keyof PlanFeature): boolean => {
    if (!subscription || !subscription.features) return false;
    return subscription.features[feature] as boolean;
  };

  const getFeatureValue = <T extends keyof PlanFeature>(feature: T): PlanFeature[T] | null => {
    if (!subscription || !subscription.features) return null;
    return subscription.features[feature] as PlanFeature[T];
  };

  const isActive = status?.isActive || false;
  const isOnTrial = status?.isOnTrial || false;
  const planName = subscription?.planName || null;

  const refresh = async () => {
    await loadPlanData();
  };

  const value: PlanContextData = {
    subscription,
    status,
    isLoading,
    hasFeature,
    getFeatureValue,
    isActive,
    isOnTrial,
    planName,
    refresh,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};