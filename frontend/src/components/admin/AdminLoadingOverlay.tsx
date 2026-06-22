// frontend/src/components/admin/AdminLoadingOverlay.tsx
import React from 'react';
import { Spinner } from '../ui/Spinner.js';
import { cn } from '../../utils/helpers.js';

interface AdminLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminLoadingOverlay: React.FC<AdminLoadingOverlayProps> = ({
  isLoading,
  message = 'Carregando...',
  children,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-50 animate-fade-in">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
        </div>
      )}
    </div>
  );
};
