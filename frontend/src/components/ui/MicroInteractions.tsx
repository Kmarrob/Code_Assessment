// frontend/src/components/ui/MicroInteractions.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AnimatedCheckmarkProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  active,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn(
      'transition-all duration-300 transform',
      active ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      className
    )}>
      <CheckCircle className={cn('text-green-500', sizes[size])} />
    </div>
  );
};

interface PulseIndicatorProps {
  active: boolean;
  color?: 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const pulseColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
};

const pulseSizes = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  active,
  color = 'green',
  size = 'md',
  label,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(
          'rounded-full',
          pulseSizes[size],
          pulseColors[color],
          active && 'animate-pulse'
        )} />
        {active && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping',
            pulseColors[color],
            'opacity-75'
          )} />
        )}
      </div>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  visible,
  onDismiss,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg shadow-lg transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    )}>
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span className="text-sm text-green-800">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-green-600 hover:text-green-800 transition-colors"
          aria-label="Fechar"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className,
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return interval;
    };

    timeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={cn('font-mono', className)}>
      {displayText}
      {!isComplete && (
        <span className="inline-block h-4 w-0.5 bg-gray-400 ml-0.5 animate-pulse" />
      )}
    </span>
  );
};
