// frontend/src/components/ui/AccessibleCard.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  as?: 'article' | 'section' | 'div';
  labelledBy?: string;
  describedBy?: string;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  description,
  as: Component = 'div',
  labelledBy,
  describedBy,
  children,
  className,
  ...props
}) => {
  const id = React.useId();
  const titleId = labelledBy || `${id}-title`;
  const descId = describedBy || `${id}-desc`;

  return (
    <Component
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      role="article"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      {...props}
    >
      {title && (
        <div className="p-6 pb-0">
          <h3 id={titleId} className="text-lg font-semibold">
            {title}
          </h3>
        </div>
      )}
      {description && (
        <div className="px-6 pt-1">
          <p id={descId} className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      )}
      <div className="p-6">{children}</div>
    </Component>
  );
};
