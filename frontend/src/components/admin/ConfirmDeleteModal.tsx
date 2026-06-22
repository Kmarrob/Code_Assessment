// frontend/src/components/admin/ConfirmDeleteModal.tsx
import React from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  controlId: string;
  controlName: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  controlId,
  controlName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-2">
            Tem certeza que deseja excluir o controle?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-mono text-sm font-semibold text-gray-900">
              {controlId}
            </p>
            <p className="text-sm text-gray-600">
              {controlName}
            </p>
          </div>
          <p className="text-sm text-red-600 mt-4 flex items-start gap-1">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            Esta ação não pode ser desfeita!
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};