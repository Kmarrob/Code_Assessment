// frontend/src/components/ui/ConfirmDialog.tsx
import React from 'react';
import { Button } from './Button.js';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    button: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={cn(
        'w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-slide-up',
        styles.border,
        'border'
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full', styles.bg)}>
              <AlertTriangle className={cn('h-5 w-5', styles.icon)} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            className={styles.button}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
