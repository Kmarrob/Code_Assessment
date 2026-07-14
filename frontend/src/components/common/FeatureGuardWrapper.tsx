// frontend/src/components/common/FeatureGuardWrapper.tsx

import React, { ReactNode } from 'react';
import { FeatureGuard } from './FeatureGuard.js';
import { PlanFeature } from '../../services/plan.service.js';

interface FeatureGuardWrapperProps {
  feature: keyof PlanFeature;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGuardWrapper: React.FC<FeatureGuardWrapperProps> = ({
  feature,
  children,
  fallback,
}) => {
  return (
    <FeatureGuard feature={feature} fallback={fallback}>
      {children}
    </FeatureGuard>
  );
};

// Exemplo de uso:
// <FeatureGuardWrapper feature="canExportData">
//   <ExportButton />
// </FeatureGuardWrapper>