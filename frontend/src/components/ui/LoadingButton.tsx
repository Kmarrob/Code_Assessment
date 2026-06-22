// frontend/src/components/ui/LoadingButton.tsx
import React, { useState } from 'react';
import { Button, ButtonProps } from './Button.js';
import { CheckCircle, XCircle } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
  successDuration?: number;
  errorDuration?: number;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  onSuccess,
  onError,
  successDuration = 2000,
  errorDuration = 3000,
  children,
  loadingText = 'Processando...',
  ...props
}) => {
  const [state, setState] = useState<ButtonState>('idle');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === 'loading') return;

    setState('loading');

    try {
      if (onClick) {
        await onClick(e);
      }
      setState('success');
      onSuccess?.();

      const id = setTimeout(() => {
        setState('idle');
      }, successDuration);
      setTimeoutId(id);
    } catch (error) {
      setState('error');
      onError?.();

      const id = setTimeout(() => {
        setState('idle');
      }, errorDuration);
      setTimeoutId(id);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const getButtonContent = () => {
    if (state === 'loading') return loadingText || children;
    if (state === 'success') return <><CheckCircle className="mr-2 h-4 w-4" /> Concluído</>;
    if (state === 'error') return <><XCircle className="mr-2 h-4 w-4" /> Erro</>;
    return children;
  };

  const getVariant = (): ButtonProps['variant'] => {
    if (state === 'success') return 'success';
    if (state === 'error') return 'destructive';
    return props.variant || 'default';
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      loading={state === 'loading'}
      variant={getVariant()}
      disabled={state === 'loading' || props.disabled}
      className={`
        ${state === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
        ${state === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        ${props.className || ''}
      `}
    >
      {getButtonContent()}
    </Button>
  );
};
