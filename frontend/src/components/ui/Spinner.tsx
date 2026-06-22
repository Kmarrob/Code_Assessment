// frontend/src/components/ui/Spinner.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
  label?: string;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
};

const variants = {
  primary: 'border-primary-200 border-t-primary-600',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-label={label || 'Carregando'}>
      <div
        className={cn(
          'animate-spin rounded-full',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
};

interface SpinnerOverlayProps {
  active: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  active,
  label = 'Carregando...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-50">
          <Spinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
};
