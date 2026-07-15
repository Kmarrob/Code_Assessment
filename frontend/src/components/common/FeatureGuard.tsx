// frontend/src/components/common/FeatureGuard.tsx

import React, { ReactNode } from 'react';
import { useFeatureAccess } from '../../hooks/useFeatureAccess.js';
import { PlanFeature } from '../../services/plan.service.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  feature: keyof PlanFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showLock = true,
}) => {
  const { user } = useAuth();
  const { hasFeature, isLoading } = useFeatureAccess();

  // ADMIN TEM ACESSO TOTAL
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-8 w-full rounded" />;
  }

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLock) {
      return (
        <div className="flex items-center gap-2 text-gray-400 text-sm cursor-not-allowed opacity-60">
          <Lock className="h-4 w-4" />
          <span>Funcionalidade disponível apenas em planos superiores</span>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};
