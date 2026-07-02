// frontend/src/components/rep/DocumentUploadModal.tsx
import React, { useState, useRef } from 'react';
import { 
  X, Upload, File, Loader2, AlertCircle, CheckCircle,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { documentService, DocumentCategory } from '../../services/document.service.js';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('policy');
  const [subcategory, setSubcategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limite de caracteres para descrição
  const MAX_DESCRIPTION_LENGTH = 1000;

  // ============================================
  // HANDLERS
  // ============================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de arquivo não permitido. Use: PDF, Word, Excel, Imagem, TXT ou CSV');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!selectedFile) {
      setError('Selecione um arquivo');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await documentService.uploadDocument({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        subcategory: subcategory.trim() || undefined,
        file: selectedFile,
      });

      setSuccess('Documento enviado com sucesso!');
      
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('policy');
        setSubcategory('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSuccess(null);
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao enviar documento:', err);
      setError(err.response?.data?.message || 'Erro ao enviar o documento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    setSuccess(null);
    onClose();
  };

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null;

  const getFileIcon = (file: File) => {
    const type = file.type;
    let color = 'text-gray-400';
    
    if (type.includes('pdf')) color = 'text-red-500';
    else if (type.includes('word')) color = 'text-blue-500';
    else if (type.includes('excel') || type.includes('sheet')) color = 'text-green-500';
    else if (type.includes('image')) color = 'text-purple-500';
    else if (type.includes('text')) color = 'text-gray-500';
    
    return <File className={`h-8 w-8 ${color}`} />;
  };

  const remainingChars = MAX_DESCRIPTION_LENGTH - description.length;
  const isNearLimit = remainingChars <= 100;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Novo Documento</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Política de Segurança da Informação"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Descrição com contador */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <span className={`text-xs ${remainingChars <= 100 ? 'text-orange-500' : 'text-gray-400'}`}>
                {remainingChars} caracteres restantes
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Breve descrição do documento (máx. 1000 caracteres)..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 ${
                remainingChars < 0 ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            {remainingChars <= 100 && remainingChars >= 0 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Aproximando-se do limite de 1000 caracteres
              </p>
            )}
            {remainingChars < 0 && (
              <p className="text-xs text-red-500 mt-1">
                ❌ Limite de 1000 caracteres excedido
              </p>
            )}
          </div>

          {/* Categoria e Subcategoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="policy">📋 Política</option>
                <option value="procedure">📄 Procedimento</option>
                <option value="evidence">📎 Evidência</option>
                <option value="other">📁 Outros</option>
              </select>
            </div>
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria
              </label>
              <Input
                id="subcategory"
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Ex: Senhas, Backup, etc."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Upload de arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arquivo * (PDF, Word, Excel, Imagem, TXT, CSV - até 10MB)
            </label>
            
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Clique para selecionar um arquivo</p>
                <p className="text-sm text-gray-400 mt-1">ou arraste e solte aqui</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700 text-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !selectedFile || !title.trim() || remainingChars < 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;