// frontend/src/components/ui/PageLoader.tsx
import React from 'react';
import { Spinner } from './Spinner.js';
import { cn } from '../../utils/helpers.js';

interface PageLoaderProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  fullScreen = false,
  message = 'Carregando...',
  className,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-gray-500 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-gray-50', className)}>
        {content}
      </div>
    );
  }

  return <div className={cn('py-12 flex items-center justify-center', className)}>{content}</div>;
};
