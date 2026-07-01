// frontend/src/components/rep/ViewResponseModal.tsx
import React from 'react';
import { X, CheckCircle, Clock, XCircle, AlertCircle, FileText, MessageSquare } from 'lucide-react';

interface ViewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    _id: string;
    controlIdString: string;
    controlName: string;
    maturityLevel: number;
    questionText: string;
    questionObjective: string;
    scenarioDescription: string;
    observations: string;
    updatedAt: string;
  } | null;
  onRequestReview?: () => void;
}

const getStatusInfo = (level: number) => {
  if (level === 2) {
    return { 
      label: 'Implementado', 
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      color: 'text-green-600 bg-green-50 border-green-200'
    };
  }
  if (level === 1) {
    return { 
      label: 'Parcialmente Implementado', 
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
  }
  if (level === 0) {
    return { 
      label: 'Não Implementado', 
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      color: 'text-red-600 bg-red-50 border-red-200'
    };
  }
  return { 
    label: 'Não respondido', 
    icon: <AlertCircle className="w-5 h-5 text-gray-400" />,
    color: 'text-gray-400 bg-gray-50 border-gray-200'
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ViewResponseModal: React.FC<ViewResponseModalProps> = ({
  isOpen,
  onClose,
  response,
  onRequestReview,
}) => {
  if (!isOpen || !response) return null;

  const statusInfo = getStatusInfo(response.maturityLevel);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalhes da Resposta</h2>
              <p className="text-sm text-gray-500">
                {response.controlIdString} - {response.controlName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>

          {/* ID e Data */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">ID do Controle:</span>
              <span className="ml-2 font-mono font-medium text-gray-900">{response.controlIdString}</span>
            </div>
            <div>
              <span className="text-gray-500">Última atualização:</span>
              <span className="ml-2 text-gray-900">{formatDate(response.updatedAt)}</span>
            </div>
          </div>

          {/* Pergunta */}
          {response.questionText && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span className="text-blue-500">❓</span> Pergunta
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {response.questionText}
              </p>
            </div>
          )}

          {/* Objetivo */}
          {response.questionObjective && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span className="text-purple-500">🎯</span> Objetivo da Pergunta
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {response.questionObjective}
              </p>
            </div>
          )}

          {/* Resposta do Usuário */}
          {response.scenarioDescription && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span className="text-green-500">📝</span> Resposta do Usuário
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {response.scenarioDescription}
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          {response.observations && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <span className="text-yellow-500">💬</span> Observações
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {response.observations}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
          {onRequestReview && (
            <button
              onClick={onRequestReview}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Solicitar Revisão
            </button>
          )}
        </div>
      </div>
    </div>
  );
};