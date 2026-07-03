// frontend/src/pages/UserDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { LayoutDashboard, ClipboardList, CheckCircle, Clock, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { userService, UserStats, UserControl } from '../services/user.service.js';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({ total: 0, completed: 0, pending: 0, inProgress: 0 });
  const [controls, setControls] = useState<UserControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
          </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus controles atribuídos e acompanhe seu progresso
          </p>
        </div>

        {/* CORREÇÃO: Barra de Progresso Geral */}
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
            <CardTitle>Meus Controles</CardTitle>
            <p className="text-sm text-gray-500">
              {controls.length} {controls.length === 1 ? 'controle atribuído' : 'controles atribuídos'}
            </p>
          </CardHeader>
          <CardContent>
            {controls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum controle atribuído ainda.</p>
                <p className="text-sm">Aguarde a atribuição do seu preposto.</p>
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
                    {controls.map((item) => (
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
    </div>
  );
};

export default UserDashboard;