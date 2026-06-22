// frontend/src/components/ui/FormField.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  labelClassName?: string;
  errorClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  success,
  required,
  disabled,
  children,
  className,
  labelClassName,
  errorClassName,
  ...props
}) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label && (
        <label className={cn('block text-sm font-medium text-gray-700', labelClassName)}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        {hasSuccess && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className={cn('text-sm text-red-600 flex items-start gap-1.5', errorClassName)}>
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p className="text-sm text-gray-500 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
};

interface UseFieldValidationProps {
  value: string;
  validate?: (value: string) => string | undefined;
  debounceMs?: number;
}

export function useFieldValidation({
  value,
  validate,
  debounceMs = 300,
}: UseFieldValidationProps) {
  const [error, setError] = React.useState<string | undefined>();
  const [isValidating, setIsValidating] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!validate || !touched) return;

    setIsValidating(true);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      const result = validate(value);
      setError(result);
      setIsValidating(false);
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, validate, touched, debounceMs]);

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const result = validate(value);
      setError(result);
    }
  };

  const reset = () => {
    setError(undefined);
    setIsValidating(false);
    setTouched(false);
  };

  return {
    error,
    isValidating,
    touched,
    hasError: !!error && touched,
    isValid: !error && touched,
    handleBlur,
    reset,
  };
}
