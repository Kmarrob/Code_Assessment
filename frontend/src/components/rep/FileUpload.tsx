// frontend/src/components/rep/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, File, FileText, Image, FileArchive } from 'lucide-react';
import { IAttachment } from '../../types/review.js';

interface FileUploadProps {
  onFilesSelected: (files: IAttachment[]) => void;
  onFileRemove: (index: number) => void;
  files: IAttachment[];
  maxFiles?: number;
  maxSize?: number; // em bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="w-5 h-5 text-red-500" />,
  'image/png': <Image className="w-5 h-5 text-green-500" />,
  'image/jpeg': <Image className="w-5 h-5 text-green-500" />,
  'image/jpg': <Image className="w-5 h-5 text-green-500" />,
  'application/msword': <FileText className="w-5 h-5 text-blue-500" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText className="w-5 h-5 text-blue-500" />,
  'application/zip': <FileArchive className="w-5 h-5 text-yellow-500" />,
};

const getFileIcon = (mimeType: string): React.ReactNode => {
  return FILE_ICONS[mimeType] || <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  files,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
  ],
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    processFiles(Array.from(selectedFiles));
    event.target.value = '';
  };

  const processFiles = (fileList: File[]) => {
    setError(null);
    const newFiles: IAttachment[] = [];

    for (const file of fileList) {
      // Validar tipo
      if (!acceptedTypes.includes(file.type)) {
        setError(`Tipo de arquivo não permitido: ${file.type}`);
        continue;
      }

      // Validar tamanho
      if (file.size > maxSize) {
        setError(`Arquivo muito grande: ${file.name} (máx. ${formatFileSize(maxSize)})`);
        continue;
      }

      // Validar limite de arquivos
      if (files.length + newFiles.length >= maxFiles) {
        setError(`Limite de ${maxFiles} arquivos atingido`);
        break;
      }

      newFiles.push({
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    if (newFiles.length > 0) {
      onFilesSelected(newFiles);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = (index: number) => {
    onFileRemove(index);
  };

  return (
    <div className="space-y-3">
      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
          disabled={disabled}
        />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos para enviar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {acceptedTypes.map(t => t.replace('application/', '').replace('image/', '')).join(', ')}
          {' • '}Máx. {formatFileSize(maxSize)} por arquivo
          {' • '}Máx. {maxFiles} arquivos
        </p>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file.mimeType)}
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};