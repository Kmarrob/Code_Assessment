// frontend/src/pages/RepResponses.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ReviewModal } from '../components/rep/ReviewModal.js';
import { ReviewList } from '../components/rep/ReviewList.js';
import { ViewResponseModal } from '../components/rep/ViewResponseModal.js';
import { IAttachment } from '../types/review.js';
import { reviewService } from '../services/review.service.js';
import { repService, UserWithResponses } from '../services/rep.service.js';
import toast from 'react-hot-toast';

interface UserResponse {
  _id: string;
  controlId: string;
  controlIdString: string;
  controlName: string;
  questionText: string;
  questionObjective: string;
  maturityLevel: number;
  scenario: string;
  scenarioDescription: string;
  observations: string;
  updatedAt: string;
}

export const RepResponses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  const [users, setUsers] = useState<UserWithResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithResponses | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<UserWithResponses['responses'][0] | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResponseForView, setSelectedResponseForView] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'reviews'>('responses');

  const companyId = (user as any)?.companyId || (user as any)?.company?._id || '';

  const loadUsersWithResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await repService.getUsersWithResponses();
      
      let filteredData = response.data;
      
      // 🔴 CORREÇÃO: Filtrar por userId se presente na URL
      if (userIdParam) {
        filteredData = filteredData.filter((u) => u._id === userIdParam);
      }
      
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filteredData = filteredData.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        );
      }

      setUsers(filteredData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 CORREÇÃO: userIdParam adicionado como dependência
  useEffect(() => {
    if (companyId) {
      loadUsersWithResponses();
    }
  }, [companyId, userIdParam]);

  // 🔴 CORREÇÃO: Recarregar quando o searchTerm mudar
  useEffect(() => {
    if (companyId) {
      loadUsersWithResponses();
    }
  }, [searchTerm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsersWithResponses();
    setRefreshing(false);
    toast.success('Dados atualizados');
  };

  const handleOpenReviewModal = (user: UserWithResponses, response: UserWithResponses['responses'][0]) => {
    setSelectedUser(user);
    setSelectedResponse(response);
    setShowReviewModal(true);
  };

  const handleViewResponse = (response: any) => {
    setSelectedResponseForView(response);
    setShowViewModal(true);
  };

  const handleSubmitReview = async (justification: string, attachments: IAttachment[]) => {
    if (!selectedUser || !selectedResponse) {
      throw new Error('Dados da solicitação incompletos');
    }

    try {
      await reviewService.createReviewRequest({
        responseId: selectedResponse._id,
        userId: selectedUser._id,
        controlId: selectedResponse.controlId,
        justification,
        attachments,
        companyId,
      });

      toast.success('Solicitação de revisão enviada com sucesso!');
      await loadUsersWithResponses();
    } catch (err: any) {
      console.error('Erro ao enviar solicitação:', err);
      throw new Error(err.message || 'Erro ao enviar solicitação de revisão');
    }
  };

  const getStatusIcon = (level: number) => {
    if (level === 2) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (level === 1) return <Clock className="w-4 h-4 text-yellow-500" />;
    if (level === 0) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusLabel = (level: number) => {
    if (level === 2) return 'Implementado';
    if (level === 1) return 'Parcial';
    if (level === 0) return 'Não Implementado';
    return 'Não respondido';
  };

  const getStatusColor = (level: number) => {
    if (level === 2) return 'text-green-600 bg-green-50';
    if (level === 1) return 'text-yellow-600 bg-yellow-50';
    if (level === 0) return 'text-red-600 bg-red-50';
    return 'text-gray-400 bg-gray-50';
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    navigate('/rep');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando respostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" aria-hidden="true" />
              <span className="text-lg font-semibold text-gray-900">Gerenciar Respostas</span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('responses')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'responses'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Respostas dos Usuários
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Solicitações de Revisão
          </button>
        </div>

        {activeTab === 'responses' ? (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuário por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
                {error}
              </div>
            )}

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Nenhum usuário encontrado com este termo'
                    : 'Nenhum usuário cadastrado na empresa'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{u.name}</h3>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          {u.department && u.department !== '-' && (
                            <p className="text-xs text-gray-400">{u.department}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {u.completedResponses} / {u.totalResponses} respondidos
                            </p>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all"
                                style={{ width: `${u.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-purple-600">
                            {u.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {u.responses.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Nenhuma resposta atribuída
                        </div>
                      ) : (
                        u.responses.map((response: any) => (
                          <div
                            key={response._id}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {response.controlIdString || 'N/A'}
                                </span>
                                <span className="font-medium text-gray-800 text-sm truncate">
                                  {response.controlName}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    response.maturityLevel !== undefined && response.maturityLevel !== null
                                      ? response.maturityLevel
                                      : -1
                                  )}`}
                                >
                                  {getStatusIcon(
                                    response.maturityLevel !== undefined && response.maturityLevel !== null
                                      ? response.maturityLevel
                                      : -1
                                  )}
                                  {getStatusLabel(
                                    response.maturityLevel !== undefined && response.maturityLevel !== null
                                      ? response.maturityLevel
                                      : -1
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Atualizado em: {new Date(response.updatedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleViewResponse(response)}
                                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Ver
                              </button>
                              <button
                                onClick={() => handleOpenReviewModal(u, response)}
                                className="flex items-center gap-1 px-2 py-1.5 text-xs text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Revisão
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ReviewList
            companyId={companyId}
            onReviewStatusChange={() => {
              loadUsersWithResponses();
            }}
          />
        )}
      </main>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedUser(null);
          setSelectedResponse(null);
        }}
        onSubmit={handleSubmitReview}
        userName={selectedUser?.name}
        controlName={selectedResponse?.controlName}
      />

      <ViewResponseModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedResponseForView(null);
        }}
        response={selectedResponseForView}
        onRequestReview={() => {
          setShowViewModal(false);
          if (selectedResponseForView) {
            const user = users.find(u => 
              u.responses.some(r => r._id === selectedResponseForView._id)
            );
            if (user) {
              const response = user.responses.find(r => r._id === selectedResponseForView._id);
              if (response) {
                handleOpenReviewModal(user, response);
              }
            }
          }
        }}
      />
    </div>
  );
};

export default RepResponses;