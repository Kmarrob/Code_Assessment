// frontend/src/components/ui/Container.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
  padding?: boolean;
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  as: Component = 'div',
  padding = true,
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        containerSizes[size],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
