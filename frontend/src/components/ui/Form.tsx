// frontend/src/components/ui/Form.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { LoadingButton } from './LoadingButton.js';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
  loadingLabel = 'Salvando...',
  cancelLabel,
  onCancel,
  children,
  className,
  ...props
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
      noValidate
      {...props}
    >
      {children}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText={loadingLabel}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </LoadingButton>

        {cancelLabel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className }) => (
  <div className={cn('space-y-4', className)}>
    {children}
  </div>
);

interface FormRowProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  cols = 2,
  className,
}) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colClasses[cols], className)}>
      {children}
    </div>
  );
};
