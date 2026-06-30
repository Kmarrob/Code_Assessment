// frontend/src/components/rep/ReviewModal.tsx
import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { FileUpload } from './FileUpload.js';
import { IAttachment } from '../../types/review.js';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (justification: string, attachments: IAttachment[]) => Promise<void>;
  userName?: string;
  controlName?: string;
  isLoading?: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
  controlName,
  isLoading = false,
}) => {
  const [justification, setJustification] = useState('');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!justification.trim() || justification.trim().length < 10) {
      setError('A justificativa deve ter no mínimo 10 caracteres');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(justification.trim(), attachments);
      setJustification('');
      setAttachments([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setJustification('');
      setAttachments([]);
      setError(null);
      onClose();
    }
  };

  const handleAddFiles = (newFiles: IAttachment[]) => {
    setAttachments([...attachments, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Solicitar Revisão</h2>
            <p className="text-sm text-gray-500 mt-1">
              {userName && controlName
                ? `Solicitar revisão da resposta de ${userName} para o controle ${controlName}`
                : 'Solicitar revisão de resposta'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Justificativa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificativa <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Descreva o motivo da solicitação de revisão (mínimo 10 caracteres)..."
              className={`
                w-full rounded-lg border p-3 resize-none h-32 text-sm transition-colors
                ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                focus:outline-none focus:ring-2
              `}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">
                {justification.length} / 10 caracteres mínimos
              </p>
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Anexos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexos <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <FileUpload
              files={attachments}
              onFilesSelected={handleAddFiles}
              onFileRemove={handleRemoveFile}
              maxFiles={5}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !justification.trim()}
            className="
              px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
              hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Solicitar Revisão
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};