// frontend/src/components/rep/DocumentUploadModal.tsx
import React, { useState, useRef } from 'react';
import { 
  X, Upload, File, Loader2, AlertCircle, CheckCircle,
  FilePdf, FileWord, FileSpreadsheet, FileImage, FileText,
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

  // ============================================
  // HANDLERS
  // ============================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }
      
      // Validar tipo
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
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
      
      // Limpar formulário após 2 segundos
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

  // Obter ícone do arquivo
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return <FilePdf className="h-8 w-8 text-red-500" />;
    if (type.includes('word')) return <FileWord className="h-8 w-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    if (type.includes('image')) return <FileImage className="h-8 w-8 text-purple-500" />;
    if (type.includes('text')) return <FileText className="h-8 w-8 text-gray-500" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };

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

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do documento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
              disabled={isSubmitting}
            />
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
              disabled={isSubmitting || !selectedFile || !title.trim()}
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