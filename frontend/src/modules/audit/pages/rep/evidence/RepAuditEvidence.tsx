import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Upload, 
  FileText, 
  X, 
  Eye,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { useAudit } from '../../hooks/useAudit';
import { toast } from 'react-hot-toast';

interface Evidence {
  _id: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  findingId?: string;
  checklistId?: string;
}

export function RepAuditEvidence() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState<string | null>(null);

  // Hooks do React Query
  const {
    useEvidenceByPlan,
    useUploadEvidence,
    useDeleteEvidence,
  } = useAudit();

  // Buscar evidências do plano
  const {
    data: evidenceData,
    isLoading,
    error,
    refetch,
  } = useEvidenceByPlan(planId || '');

  // Mutations
  const uploadEvidenceMutation = useUploadEvidence();
  const deleteEvidenceMutation = useDeleteEvidence();

  const evidences = evidenceData?.data || [];

  // Handler para upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('auditPlanId', planId || '');
      formData.append('description', description);

      await uploadEvidenceMutation.mutateAsync(formData);
      toast.success('Evidência enviada com sucesso!');
      setSelectedFile(null);
      setDescription('');
      setShowUploadModal(false);
      await refetch();
    } catch (err) {
      toast.error('Erro ao enviar evidência');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para deletar
  const handleDelete = async (id: string) => {
    try {
      await deleteEvidenceMutation.mutateAsync(id);
      toast.success('Evidência removida com sucesso!');
      setEvidenceToDelete(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao remover evidência');
      console.error(err);
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando evidências...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar evidências
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evidências de Auditoria</h1>
          <p className="text-sm text-gray-500">
            Gerencie as evidências da auditoria
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Nova Evidência
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total de Evidências</p>
          <p className="text-2xl font-bold text-gray-900">{evidences.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Documentos</p>
          <p className="text-2xl font-bold text-gray-900">
            {evidences.filter((e: Evidence) => e.mimeType.includes('document') || e.mimeType.includes('pdf')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Imagens</p>
          <p className="text-2xl font-bold text-gray-900">
            {evidences.filter((e: Evidence) => e.mimeType.startsWith('image/')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Outros</p>
          <p className="text-2xl font-bold text-gray-900">
            {evidences.filter((e: Evidence) => !e.mimeType.startsWith('image/') && !e.mimeType.includes('document') && !e.mimeType.includes('pdf')).length}
          </p>
        </div>
      </div>

      {/* Lista de Evidências */}
      {evidences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma evidência cadastrada
          </h3>
          <p className="text-gray-500 text-sm text-center max-w-md mb-4">
            Adicione evidências para embasar as constatações da auditoria.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Adicionar Evidência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidences.map((evidence: Evidence) => (
            <div
              key={evidence._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-xl">
                  {getFileIcon(evidence.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {evidence.filename}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(evidence.size)}</span>
                    <span>•</span>
                    <span>{new Date(evidence.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {evidence.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {evidence.description}
                    </p>
                  )}
                  {evidence.findingId && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                      Vinculado a NC
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => window.open(evidence.filepath, '_blank')}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(evidence.filepath, '_blank')}
                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded hover:bg-green-50"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEvidenceToDelete(evidence._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nova Evidência
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload de arquivo */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para selecionar um arquivo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, imagens, documentos — até 10MB
                    </p>
                  </>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva esta evidência..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {evidenceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar exclusão
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir esta evidência? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEvidenceToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(evidenceToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}