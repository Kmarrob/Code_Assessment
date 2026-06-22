// frontend/src/components/admin/AdminLazyLoader.tsx
import React, { Suspense } from 'react';
import { AdminLoadingFallback } from './AdminFallbacks.js';

interface AdminLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminLazyLoader: React.FC<AdminLazyLoaderProps> = ({
  children,
  fallback = <AdminLoadingFallback />,
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};
