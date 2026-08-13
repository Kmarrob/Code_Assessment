// frontend/src/pages/UserDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 👈 ADICIONADO: useLocation
import { useAuth } from '../contexts/AuthContext.js';
import { LayoutDashboard, ClipboardList, CheckCircle, Clock, AlertCircle, Loader2, LogOut, Download, Filter, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { userService, UserStats, UserControl, InProgressActivity } from '../services/user.service.js';
import { FeatureGuard } from '../components/common/FeatureGuard.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog.js';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 ADICIONADO: Hook para acessar o estado da navegação
  
  const [stats, setStats] = useState<UserStats>({ total: 0, completed: 0, pending: 0, inProgress: 0 });
  const [controls, setControls] = useState<UserControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para filtro de status
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // 🆕 ESTADOS PARA PROGRESSO
  const [isCheckingProgress, setIsCheckingProgress] = useState(false);
  const [pendingActivities, setPendingActivities] = useState<InProgressActivity[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);

  // ============================================
  // 🆕 VERIFICAR ATIVIDADES PENDENTES
  // ============================================
  const checkPendingActivities = async () => {
    if (hasCheckedProgress) return;
    
    setIsCheckingProgress(true);
    try {
      const activities = await userService.getInProgressActivities();
      if (activities && activities.length > 0) {
        setPendingActivities(activities);
        setShowProgressModal(true);
      }
    } catch (err) {
      console.error('Erro ao verificar atividades pendentes:', err);
    } finally {
      setIsCheckingProgress(false);
      setHasCheckedProgress(true);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleAnswer = (assignmentId: string) => {
    navigate(`/user/answer/${assignmentId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handler para mudar o filtro
  const handleFilterChange = (status: 'all' | 'pending' | 'in_progress' | 'completed') => {
    setFilterStatus(status);
  };

  // 🆕 Handler para continuar de onde parou
  const handleContinueProgress = (assignmentId: string) => {
    setShowProgressModal(false);
    navigate(`/user/answer/${assignmentId}`);
  };

  // 🆕 Handler para fechar o modal (ignorar)
  const handleCloseModal = () => {
    setShowProgressModal(false);
  };

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, controlsData] = await Promise.all([
        userService.getStats(),
        userService.getControls(),
      ]);
      setStats(statsData);
      setControls(controlsData);
      
      // 🆕 APÓS CARREGAR DADOS, VERIFICAR ATIVIDADES PENDENTES
      await checkPendingActivities();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 🆕 CORREÇÃO: Recarregar dados ao voltar da página de resposta
  // ============================================
  useEffect(() => {
    // Verifica se o estado de navegação contém a flag 'refresh'
    if (location.state && (location.state as any).refresh) {
      console.log('🔄 Recarregando dados do dashboard após salvar resposta...');
      // Limpa o estado para evitar recarregamentos infinitos
      navigate(location.pathname, { replace: true, state: {} });
      loadData();
    }
  }, [location.state]); // 👈 Executa quando o estado de navegação mudar

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // CORREÇÃO: Calcular progresso baseado nos controles atribuídos
  // ============================================
  const calculateProgress = () => {
    const total = stats.total || 0;
    const completed = stats.completed || 0;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // CORREÇÃO: Definir cor da barra baseada no progresso
  const getProgressBarColor = () => {
    if (progress >= 67) return 'bg-green-500';
    if (progress >= 34) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressBarColor = getProgressBarColor();

  // Filtrar controles pelo status selecionado
  const filteredControls = useMemo(() => {
    if (filterStatus === 'all') {
      return controls;
    }
    return controls.filter((item) => item.status === filterStatus);
  }, [controls, filterStatus]);

  // Contar quantos controles estão sendo exibidos
  const displayedCount = filteredControls.length;

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Ir para o dashboard"
          >
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus controles atribuídos e acompanhe seu progresso
            </p>
          </div>
          <FeatureGuard feature="canExportData">
            <Button
              variant="outline"
              size="sm"
              className="mt-2 md:mt-0"
              onClick={() => {
                console.log('Exportar dados do usuário');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
          </FeatureGuard>
        </div>

        {/* Barra de Progresso Geral */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Seu Progresso Geral</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-bold text-gray-900">{progress}%</span>
                    <span className="text-sm text-gray-500">
                      ({stats.completed} de {stats.total} controles respondidos)
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressBarColor} rounded-full transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Controles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Meus Controles</CardTitle>
                <p className="text-sm text-gray-500">
                  {displayedCount} {displayedCount === 1 ? 'controle exibido' : 'controles exibidos'}
                  {filterStatus !== 'all' && ` (filtrado por ${filterStatus === 'pending' ? 'Pendentes' : filterStatus === 'in_progress' ? 'Em Andamento' : 'Concluídos'})`}
                </p>
              </div>
              
              {/* Filtros por Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filtrar:
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => handleFilterChange('pending')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterStatus === 'pending'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => handleFilterChange('in_progress')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterStatus === 'in_progress'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => handleFilterChange('completed')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterStatus === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Concluídos
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredControls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum controle encontrado com o filtro selecionado.</p>
                <button
                  onClick={() => handleFilterChange('all')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ver todos os controles
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Controle</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Domínio</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredControls.map((item) => (
                      <tr key={item.assignmentId} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-600">{item.control?.id || '-'}</td>
                        <td className="py-3 px-4 text-gray-900">{item.control?.nome || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.control?.dominioDeSI?.join(', ') || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'completed' ? 'Concluído' :
                             item.status === 'in_progress' ? 'Em andamento' :
                             'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleAnswer(item.assignmentId)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {item.response ? 'Editar Resposta' : 'Responder'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 🆕 MODAL DE ATIVIDADES PENDENTES */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="h-6 w-6 text-yellow-600" />
              Você possui atividades em andamento
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Identificamos que você interrompeu atividades anteriormente. 
              Escolha uma para continuar de onde parou.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {pendingActivities.map((activity) => (
              <div
                key={activity.assignmentId}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {activity.controlCode || 'N/A'}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {activity.controlName || 'Controle não identificado'}
                      </h4>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <span>
                        <span className="font-medium">Status:</span>{' '}
                        {activity.progressStatus === 'in_progress' ? 'Em andamento' : 'Interrompido'}
                      </span>
                      <span>
                        <span className="font-medium">Última atividade:</span>{' '}
                        {activity.lastActivityAt ? new Date(activity.lastActivityAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                      {activity.domain && activity.domain.length > 0 && (
                        <span className="col-span-2">
                          <span className="font-medium">Domínio:</span>{' '}
                          {activity.domain.join(', ')}
                        </span>
                      )}
                      {activity.partialData?.maturityLevel && (
                        <span className="col-span-2">
                          <span className="font-medium">Nível selecionado:</span>{' '}
                          {activity.partialData.maturityLevel === '2' ? 'Implementado' :
                           activity.partialData.maturityLevel === '1' ? 'Parcial' :
                           activity.partialData.maturityLevel === '0' ? 'Não Implementado' : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleContinueProgress(activity.assignmentId)}
                    className="flex items-center gap-2 bg-[#30736C] hover:bg-[#1E5359] text-white flex-shrink-0 ml-4"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              onClick={handleCloseModal}
              variant="outline"
              className="text-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
            <span className="text-xs text-gray-400">
              Seu progresso foi salvo e não será perdido.
            </span>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;