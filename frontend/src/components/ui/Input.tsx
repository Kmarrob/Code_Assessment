// frontend/src/components/ui/Input.tsx
import React, { useState } from 'react';
import { cn } from '../../utils/helpers.js';
import { Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  success?: boolean;
  required?: boolean;
  onValidate?: (value: string) => string | undefined;
  validateOnChange?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    icon, 
    type, 
    showPasswordToggle, 
    success,
    required,
    onValidate,
    validateOnChange = false,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const id = React.useId();
    const [showPassword, setShowPassword] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    const [isValidating, setIsValidating] = useState(false);
    const [touched, setTouched] = useState(false);

    const inputType = showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      if (validateOnChange && onValidate && touched) {
        setIsValidating(true);
        const result = onValidate(e.target.value);
        setInternalError(result);
        setIsValidating(false);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      setTouched(true);
      
      if (onValidate) {
        const result = onValidate(e.target.value);
        setInternalError(result);
      }
    };

    const displayError = error || (touched ? internalError : undefined);
    const hasError = !!displayError;
    const hasSuccess = (success || (onValidate && !internalError && touched)) && !hasError;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={inputType}
            className={cn(
              'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              showPasswordToggle && type === 'password' && 'pr-10',
              hasError && 'border-red-500 focus-visible:ring-red-500 bg-red-50/50',
              hasSuccess && 'border-green-500 focus-visible:ring-green-500 bg-green-50/50',
              !hasError && !hasSuccess && 'border-input focus-visible:ring-primary-500',
              className
            )}
            ref={ref}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
            </div>
          )}
          {!isValidating && hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          {!isValidating && hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {hasError && (
          <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1.5 animate-slide-up">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {displayError}
          </p>
        )}
        {hint && !hasError && (
          <p id={`${id}-hint`} className="text-sm text-gray-500 flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
