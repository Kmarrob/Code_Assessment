// frontend/src/components/ui/Grid.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  as?: 'div' | 'section' | 'ul';
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  as: Component = 'div',
  className,
  ...props
}) => {
  const colClass = [
    cols.xs && colClasses[cols.xs as keyof typeof colClasses],
    cols.sm && `sm:${colClasses[cols.sm as keyof typeof colClasses]}`,
    cols.md && `md:${colClasses[cols.md as keyof typeof colClasses]}`,
    cols.lg && `lg:${colClasses[cols.lg as keyof typeof colClasses]}`,
    cols.xl && `xl:${colClasses[cols.xl as keyof typeof colClasses]}`,
  ]
    .filter(Boolean)
    .join(' ');

  const gapClass = gapClasses[gap as keyof typeof gapClasses] || `gap-${gap}`;

  return (
    <Component
      className={cn(
        'grid',
        colClass,
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  as?: 'div' | 'li';
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = {},
  as: Component = 'div',
  className,
  ...props
}) => {
  const spanClass = [
    span.xs && `col-span-${span.xs}`,
    span.sm && `sm:col-span-${span.sm}`,
    span.md && `md:col-span-${span.md}`,
    span.lg && `lg:col-span-${span.lg}`,
    span.xl && `xl:col-span-${span.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={cn(spanClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
};
