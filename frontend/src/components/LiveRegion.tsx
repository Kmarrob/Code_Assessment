// frontend/src/components/LiveRegion.tsx
import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive';
  children?: React.ReactNode;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  children,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      regionRef.current.textContent = message;
    }
  }, [message]);

  if (children) {
    return (
      <div
        ref={regionRef}
        className="aria-live-polite"
        role="status"
        aria-live={politeness}
        aria-atomic="true"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={regionRef}
      className="aria-live-polite"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    />
  );
};

export function useAccessibilityMessage() {
  const [message, setMessage] = React.useState<string>('');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const announce = React.useCallback((text: string, duration: number = 3000) => {
    setMessage(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, duration);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    announce,
    LiveRegion: () => <LiveRegion message={message} />,
  };
}
