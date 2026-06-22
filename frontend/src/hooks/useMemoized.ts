// frontend/src/hooks/useMemoized.ts
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

export function useMemoized<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export function useMemoizedComponent<P>(
  Component: React.ComponentType<P>,
  props: P,
  deps: React.DependencyList
): React.ReactElement {
  return useMemo(() => React.createElement(Component, props), deps);
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);  // <-- Mudado para useState

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}