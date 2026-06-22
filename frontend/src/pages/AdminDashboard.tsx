// frontend/src/pages/AdminDashboard.tsx
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useUsers } from '../hooks/useAdmin.js';
import { 
  Users, Settings, Shield, 
  BarChart3, Database, Activity,
  LogOut, Building2, ClipboardList, UserCog, LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1 });
  const { data: activeUsersData } = useUsers({ limit: 1, isActive: true });

  const stats = useMemo(() => ({
    totalUsers: usersData?.pagination?.total || 0,
    activeUsers: activeUsersData?.pagination?.total || 0,
    totalControls: 93,
    completedAssessments: 8,
    isLoading: isLoadingUsers,
  }), [usersData, activeUsersData, isLoadingUsers]);

  const handleNavigateToUsers = useCallback(() => {
    navigate('/admin/usuarios');
  }, [navigate]);

  const handleNavigateToControls = useCallback(() => {
    navigate('/admin/controles');
  }, [navigate]);

  const handleNavigateToCompanies = useCallback(() => {
    navigate('/admin/empresas');
  }, [navigate]);

  const handleNavigateToQuestions = useCallback(() => {
    navigate('/admin/perguntas');
  }, [navigate]);

  const handleNavigateToConsultants = useCallback(() => {
    navigate('/admin/consultores');
  }, [navigate]);

  // ============================================
  // NOVO HANDLER: DASHBOARD DE MATURIDADE
  // ============================================
  const handleNavigateToDashboard = useCallback(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <>
      <AdminMetaTags
        title="Dashboard Administrativo - Code_Assessment"
        description="Painel administrativo do Code_Assessment com métricas e indicadores do sistema de avaliação de maturidade ISO 27001."
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40" role="banner">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" aria-hidden="true" />
              <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
              <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Sair do sistema"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8" role="main" aria-label="Dashboard administrativo">
          <nav aria-label="Breadcrumb" className="mb-4">
            <AdminBreadcrumbs />
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">
              Gerencie toda a plataforma Code_Assessment
            </p>
          </header>

          <section aria-label="Estatísticas do sistema" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total de Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Activity className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Controles ISO 27001</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalControls}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Database className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avaliações Concluídas</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.completedAssessments}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section aria-label="Ações rápidas" className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToUsers}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Usuários</h3>
                    <p className="text-sm text-gray-500">Gerenciar usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToControls}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Database className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Controles</h3>
                    <p className="text-sm text-gray-500">Gerenciar os 93 controles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToCompanies}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Empresas</h3>
                    <p className="text-sm text-gray-500">Gerenciar empresas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToQuestions}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Perguntas</h3>
                    <p className="text-sm text-gray-500">Gerenciar perguntas por controle</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToConsultants}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <UserCog className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Consultores</h3>
                    <p className="text-sm text-gray-500">Gerenciar consultores e empresas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================
                NOVO CARD: DASHBOARD DE MATURIDADE
                ============================================ */}
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleNavigateToDashboard}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-500">Maturidade das empresas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Componentes temporariamente removidos para teste */}
          <section aria-label="Métricas e logs do sistema" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>📊 Métricas do Sistema (em breve)</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>📋 Atividades Recentes (em breve)</p>
            </div>
          </section>

          <section aria-label="Lista de usuários" className="mt-6">
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>👥 Lista de Usuários (em breve)</p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;