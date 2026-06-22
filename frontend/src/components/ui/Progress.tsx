// frontend/src/components/ui/Progress.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const variantColors = {
  primary: 'bg-primary-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'primary',
  size = 'md',
  animated = true,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          {showValue && <span className="text-gray-600 font-medium">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size], className)}
        {...props}
      >
        <div
          className={cn(
            'transition-all duration-500 rounded-full',
            variantColors[variant],
            animated && 'animate-pulse',
            sizes[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const IndeterminateProgress: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden h-1', className)}>
    <div className="h-full bg-primary-600 animate-progress-indeterminate" />
  </div>
);
