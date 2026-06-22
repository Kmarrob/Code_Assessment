// frontend/src/components/ui/Transition.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/helpers.js';

interface TransitionProps {
  show: boolean;
  children: React.ReactNode;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  appear?: boolean;
  duration?: number;
  className?: string;
}

export const Transition: React.FC<TransitionProps> = ({
  show,
  children,
  enter = 'transition-all duration-300 ease-out',
  enterFrom = 'opacity-0 scale-95',
  enterTo = 'opacity-100 scale-100',
  leave = 'transition-all duration-200 ease-in',
  leaveFrom = 'opacity-100 scale-100',
  leaveTo = 'opacity-0 scale-95',
  appear = false,
  duration = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(show || appear);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const state = isAnimating
    ? (show ? `${enterFrom}` : `${leaveFrom}`)
    : (show ? `${enterTo}` : `${leaveTo}`);

  return (
    <div className={cn(
      enter,
      leave,
      state,
      className
    )}>
      {children}
    </div>
  );
};

export const FadeTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    {...props}
  />
);

export const SlideTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-all duration-300 ease-out"
    enterFrom="opacity-0 -translate-y-4"
    enterTo="opacity-100 translate-y-0"
    leave="transition-all duration-200 ease-in"
    leaveFrom="opacity-100 translate-y-0"
    leaveTo="opacity-0 -translate-y-4"
    {...props}
  />
);

export const ScaleTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-all duration-300 ease-out"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition-all duration-200 ease-in"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
    {...props}
  />
);
