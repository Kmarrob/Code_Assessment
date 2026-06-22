// frontend/src/components/SuspenseWrapper.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';
import { PageSkeleton } from './ui/Skeleton.js';
import { ServerErrorFallback } from './ui/Fallback.js';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <PageSkeleton />,
  errorFallback,
  onError,
}) => (
  <ErrorBoundary
    fallback={errorFallback || <ServerErrorFallback onRetry={() => window.location.reload()} />}
    onError={onError}
  >
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: () => Promise<T>;
  reset: () => void;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const reset = React.useCallback(() => {
    setData(null);
    setIsLoading(true);
    setError(null);
  }, []);

  React.useEffect(() => {
    execute();
  }, dependencies);

  return { data, isLoading, error, execute, reset };
}
