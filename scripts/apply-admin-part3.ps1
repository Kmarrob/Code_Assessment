# scripts/apply-admin-part3.ps1
# Script para aplicar Parte 3/4 - Frontend - Páginas do Admin

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - ADMIN (PILAR 1: CLEAN CODE)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/4 - FRONTEND - PÁGINAS DO ADMIN                ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN USERS PAGE
# ============================================
Write-Step "PARTE 1/3: ADMIN USERS PAGE"

Write-Info "Criando AdminUsers.tsx..."
@'
// frontend/src/pages/AdminUsers.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from '../components/admin/UsersTable.js';
import { UserForm } from '../components/admin/UserForm.js';
import { useCreateUser, useUpdateUser } from '../hooks/useAdmin.js';
import { IUser } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { showToast } from '../components/ui/Toast.js';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | undefined>(undefined);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleCreate = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        // Atualizar usuário
        await updateUser.mutateAsync({
          id: editingUser._id,
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
            company: data.company,
            department: data.department,
            isActive: data.isActive,
          },
        });
      } else {
        // Criar usuário
        await createUser.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password!,
          role: data.role,
          company: data.company,
          department: data.department,
        });
      }
      setShowForm(false);
      setEditingUser(undefined);
    } catch (error) {
      // Erro já tratado pelos hooks
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
          </div>
          <Button onClick={handleCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="mb-6">
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createUser.isPending || updateUser.isPending}
            />
          </div>
        )}

        {/* Tabela */}
        <UsersTable onEdit={handleEdit} onCreate={handleCreate} />
      </div>
    </div>
  );
};

export default AdminUsers;
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminUsers.tsx" -Encoding UTF8
Write-Success "AdminUsers.tsx criado"

# ============================================
# PARTE 2: ADMIN DASHBOARD ATUALIZADO
# ============================================
Write-Step "PARTE 2/3: ADMIN DASHBOARD ATUALIZADO"

Write-Info "Atualizando AdminDashboard.tsx..."
@'
// frontend/src/pages/AdminDashboard.tsx
import React, { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  LayoutDashboard, Users, Settings, Shield, 
  BarChart3, Database, Activity, AlertTriangle,
  UserPlus, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { PageLoader } from '../components/ui/PageLoader.js';
import { DashboardMetaTags } from '../components/MetaTags.js';

// Lazy loading dos componentes
const UsersTable = lazy(() => import('../components/admin/UsersTable.js'));
const SystemMetrics = lazy(() => import('../components/admin/SystemMetrics.js'));
const ActivityLog = lazy(() => import('../components/admin/ActivityLog.js'));

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = {
    totalUsers: 25,
    activeUsers: 22,
    totalControls: 93,
    completedAssessments: 8,
  };

  return (
    <>
      <DashboardMetaTags role="admin" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
              <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">
              Gerencie toda a plataforma Code_Assessment
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
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
                    <Activity className="h-6 w-6 text-green-600" />
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
                    <Database className="h-6 w-6 text-purple-600" />
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
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/users')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gerenciar Usuários</h3>
                    <p className="text-sm text-gray-500">Cadastrar, editar e remover usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Controles</h3>
                    <p className="text-sm text-gray-500">Gerenciar os 93 controles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Configurações</h3>
                    <p className="text-sm text-gray-500">Configurações do sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Componentes com Lazy Loading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<PageLoader message="Carregando métricas..." />}>
              <SystemMetrics />
            </Suspense>
            
            <Suspense fallback={<PageLoader message="Carregando logs..." />}>
              <ActivityLog />
            </Suspense>
          </div>

          <div className="mt-6">
            <Suspense fallback={<PageLoader message="Carregando usuários..." />}>
              <UsersTable onCreate={() => navigate('/admin/users')} />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminDashboard.tsx" -Encoding UTF8
Write-Success "AdminDashboard.tsx atualizado"

# ============================================
# PARTE 3: APP.TSX ATUALIZADO
# ============================================
Write-Step "PARTE 3/3: APP.TSX ATUALIZADO"

Write-Info "Atualizando App.tsx..."
@'
// frontend/src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { UserRole } from './types/index.js';
import { PageLoader } from './components/ui/PageLoader.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { AuthErrorFallback } from './components/ui/Fallback.js';
import { SuspenseWrapper } from './components/SuspenseWrapper.js';
import { SkipLink } from './components/SkipLink.js';

// Lazy loading
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.js'));
const AdminUsers = lazy(() => import('./pages/AdminUsers.js'));
const RepDashboard = lazy(() => import('./pages/RepDashboard.js'));
const ConsultantDashboard = lazy(() => import('./pages/ConsultantDashboard.js'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.js'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SkipLink targetId="main-content" />
        
        <AuthProvider>
          <ErrorBoundary
            fallback={<AuthErrorFallback onLogin={() => window.location.href = '/login'} />}
          >
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
            
            <main id="main-content" role="main">
              <SuspenseWrapper>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={[UserRole.REP, UserRole.ADMIN]} />}>
                    <Route path="/rep" element={<RepDashboard />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={[UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                    <Route path="/consultant" element={<ConsultantDashboard />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.REP, UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SuspenseWrapper>
            </main>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
'@ | Out-File -FilePath "$BaseDir\frontend\src\App.tsx" -Encoding UTF8
Write-Success "App.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/pages/AdminUsers.tsx"
Write-Info "  • frontend/src/pages/AdminDashboard.tsx (atualizado)"
Write-Info "  • frontend/src/App.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Faça login com um usuário admin" -ForegroundColor White
Write-Info "  3. Acesse /admin para ver o dashboard" -ForegroundColor White
Write-Info "  4. Clique em 'Gerenciar Usuários' ou acesse /admin/users" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"