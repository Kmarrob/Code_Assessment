// frontend/src/pages/rep/RepResponses.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { ReviewModal } from '../../components/rep/ReviewModal.js';
import { ReviewList } from '../../components/rep/ReviewList.js';
import { IAttachment } from '../../types/review.js';
import { reviewService } from '../../services/review.service.js';
import { userService } from '../../services/user.service.js';
import toast from 'react-hot-toast';

interface UserWithResponses {
  _id: string;
  name: string;
  email: string;
  responses: {
    _id: string;
    controlId: string;
    controlName: string;
    maturityLevel: number;
    scenario: string;
    observations: string;
    updatedAt: string;
  }[];
  totalResponses: number;
  completedResponses: number;
  progress: number;
}

export const RepResponses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithResponses | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'reviews'>('responses');

  const companyId = (user as any)?.companyId || (user as any)?.company?._id || '';

  const loadUsersWithResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyUsers = await userService.getUsersByCompany(companyId);
      const usersWithResponses: UserWithResponses[] = [];

      for (const u of companyUsers) {
        // Buscar respostas do usuário
        const userResponses = await userService.getUserResponses(u._id);

        const totalResponses = userResponses.length;
        const completedResponses = userResponses.filter(
          (r: any) => r.maturityLevel !== undefined && r.maturityLevel !== null
        ).length;

        usersWithResponses.push({
          _id: u._id,
          name: u.name,
          email: u.email,
          responses: userResponses.map((r: any) => ({
            _id: r._id,
            controlId: r.controlId?._id || r.controlId,
            controlName: r.controlId?.name || 'Controle não identificado',
            maturityLevel: r.maturityLevel,
            scenario: r.scenario || '',
            observations: r.observations || '',
            updatedAt: r.updatedAt,
          })),
          totalResponses,
          completedResponses,
          progress: totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0,
        });
      }

      setUsers(usersWithResponses);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadUsersWithResponses();
    }
  }, [companyId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsersWithResponses();
    setRefreshing(false);
    toast.success('Dados atualizados');
  };

  const handleOpenReviewModal = (user: UserWithResponses, response: any) => {
    setSelectedUser(user);
    setSelectedResponse(response);
    setShowReviewModal(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gerenciar Respostas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe as respostas dos usuários e solicite revisões quando necessário
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('responses')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'responses'
              ? 'border-blue-600 text-blue-600'
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
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Solicitações de Revisão
        </button>
      </div>

      {activeTab === 'responses' ? (
        <>
          {/* Barra de busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuário por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
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
                  {/* Cabeçalho do usuário */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{u.name}</h3>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {u.completedResponses} / {u.totalResponses} respondidos
                          </p>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${u.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {u.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de respostas */}
                  <div className="divide-y divide-gray-100">
                    {u.responses.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        Nenhuma resposta atribuída
                      </div>
                    ) : (
                      u.responses.map((response) => (
                        <div
                          key={response._id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-800 text-sm truncate">
                                {response.controlName}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  response.maturityLevel !== undefined ? response.maturityLevel : -1
                                )}`}
                              >
                                {getStatusIcon(
                                  response.maturityLevel !== undefined ? response.maturityLevel : -1
                                )}
                                {getStatusLabel(
                                  response.maturityLevel !== undefined ? response.maturityLevel : -1
                                )}
                              </span>
                            </div>
                            {response.scenario && (
                              <p className="text-sm text-gray-500 truncate mt-0.5">
                                {response.scenario}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              Atualizado em: {new Date(response.updatedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleOpenReviewModal(u, response)}
                            className="ml-4 flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Solicitar Revisão
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <p className="text-sm text-gray-400 mt-4">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </p>
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

      {/* Modal de Solicitação de Revisão */}
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
    </div>
  );
};