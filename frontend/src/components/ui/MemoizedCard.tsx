// frontend/src/components/ui/MemoizedCard.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface MemoizedCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const MemoizedCard = React.memo(({
  title,
  description,
  icon,
  className,
  children,
  onClick,
}: MemoizedCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer hover:border-primary-300',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {children}
    </div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';
