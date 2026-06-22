# scripts/apply-admin-seo-part2.ps1
# Script para aplicar Parte 2/3 - Meta Tags e SEO Dinâmico

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
Write-Host "║     CODE_ASSESSMENT - ADMIN SEO (PILAR 6)                  ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 2/3 - META TAGS E SEO DINÂMICO                  ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN META TAGS
# ============================================
Write-Step "PARTE 1/3: ADMIN META TAGS"

Write-Info "Criando AdminMetaTags.tsx..."
@'
// frontend/src/components/admin/AdminMetaTags.tsx
import React from 'react';
import { MetaTags } from '../MetaTags.js';
import { useLocation } from 'react-router-dom';

interface AdminMetaTagsProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export const AdminMetaTags: React.FC<AdminMetaTagsProps> = ({
  title,
  description,
  noIndex = true,
}) => {
  const location = useLocation();
  
  const getMetaData = () => {
    const path = location.pathname;
    
    if (title) {
      return { title, description };
    }
    
    switch (path) {
      case '/admin':
        return {
          title: 'Dashboard Administrativo - Code_Assessment',
          description: 'Painel administrativo do Code_Assessment com métricas e indicadores do sistema de avaliação de maturidade ISO 27001.'
        };
      case '/admin/users':
        return {
          title: 'Gerenciar Usuários - Code_Assessment',
          description: 'Gerencie usuários do sistema Code_Assessment, incluindo administradores, prepostos, consultores e usuários finais.'
        };
      case '/admin/controls':
        return {
          title: 'Gerenciar Controles - Code_Assessment',
          description: 'Gerencie os 93 controles da ISO 27001 no sistema Code_Assessment.'
        };
      case '/admin/settings':
        return {
          title: 'Configurações - Code_Assessment',
          description: 'Configurações do sistema Code_Assessment.'
        };
      default:
        return {
          title: 'Administração - Code_Assessment',
          description: 'Painel administrativo do Code_Assessment.'
        };
    }
  };

  const meta = getMetaData();

  return (
    <MetaTags
      title={meta.title}
      description={meta.description}
      noIndex={noIndex}
      canonical={`https://code-assessment.com${location.pathname}`}
      ogTitle={meta.title}
      ogDescription={meta.description}
      ogImage="https://code-assessment.com/admin-og-image.jpg"
      twitterCard="summary"
      twitterTitle={meta.title}
      twitterDescription={meta.description}
    />
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminMetaTags.tsx" -Encoding UTF8
Write-Success "AdminMetaTags.tsx criado"

# ============================================
# PARTE 2: ADMIN SCHEMA MARKUP
# ============================================
Write-Step "PARTE 2/3: ADMIN SCHEMA MARKUP"

Write-Info "Criando AdminSchemaMarkup.tsx..."
@'
// frontend/src/components/admin/AdminSchemaMarkup.tsx
import React from 'react';
import { SchemaMarkup } from '../SchemaMarkup.js';

export const AdminSchemaMarkup: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Painel Administrativo - Code_Assessment',
    description: 'Painel administrativo do sistema Code_Assessment para gestão de usuários e controles.',
    url: 'https://code-assessment.com/admin',
    isPartOf: {
      '@type': 'WebApplication',
      name: 'Code_Assessment',
      description: 'Sistema de avaliação de maturidade ISO 27001',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://code-assessment.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Administração',
          item: 'https://code-assessment.com/admin',
        },
      ],
    },
  };

  return <SchemaMarkup schema={schema} />;
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminSchemaMarkup.tsx" -Encoding UTF8
Write-Success "AdminSchemaMarkup.tsx criado"

# ============================================
# PARTE 3: ADMIN USERS ATUALIZADO
# ============================================
Write-Step "PARTE 3/3: ADMIN USERS E DASHBOARD ATUALIZADOS"

Write-Info "Atualizando AdminUsers.tsx..."
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
import { useSanitize } from '../hooks/useSanitize.js';
import { AdminErrorBoundary } from '../components/AdminErrorBoundary.js';
import { AdminErrorFallback } from '../components/admin/AdminFallbacks.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';

type ViewMode = 'list' | 'create' | 'edit';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { sanitizeApiData } = useSanitize();
  const [mode, setMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleCreate = () => {
    setSelectedUser(undefined);
    setMode('create');
  };

  const handleEdit = (user: IUser) => {
    const sanitizedUser = sanitizeApiData(user);
    setSelectedUser(sanitizedUser);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedUser(undefined);
  };

  const handleSubmit = async (data: any) => {
    const sanitizedData = sanitizeApiData(data);
    
    if (mode === 'create') {
      await createUser.mutateAsync(sanitizedData);
    } else if (mode === 'edit' && selectedUser) {
      await updateUser.mutateAsync({ id: selectedUser._id, data: sanitizedData });
    }
    setMode('list');
    setSelectedUser(undefined);
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  return (
    <>
      <AdminMetaTags
        title="Gerenciar Usuários - Code_Assessment"
        description="Gerencie todos os usuários do sistema Code_Assessment, incluindo administradores, prepostos, consultores e usuários finais."
        noIndex={true}
      />

      <AdminErrorBoundary
        fallback={<AdminErrorFallback onRetry={() => window.location.reload()} />}
        onError={(error, errorInfo) => {
          console.error('AdminUsers Error:', error, errorInfo);
        }}
      >
        <main className="container mx-auto px-4 py-8" role="main" aria-label="Gerenciamento de usuários">
          <nav aria-label="Breadcrumb" className="mb-4">
            <AdminBreadcrumbs />
          </nav>

          <header className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                aria-label="Voltar ao dashboard"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar ao dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600">Cadastre, edite e gerencie usuários do sistema</p>
            </div>
            {mode === 'list' && (
              <Button onClick={handleCreate} aria-label="Adicionar novo usuário">
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Novo Usuário
              </Button>
            )}
          </header>

          <section aria-label="Conteúdo de gerenciamento de usuários">
            {mode === 'list' && (
              <UsersTable onEdit={handleEdit} onCreate={handleCreate} />
            )}

            {(mode === 'create' || mode === 'edit') && (
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            )}
          </section>
        </main>
      </AdminErrorBoundary>
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminUsers.tsx" -Encoding UTF8
Write-Success "AdminUsers.tsx atualizado"

Write-Info "Atualizando AdminDashboard.tsx..."
@'
// frontend/src/pages/AdminDashboard.tsx
import React, { lazy, Suspense, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useUsers } from '../hooks/useAdmin.js';
import { 
  LayoutDashboard, Users, Settings, Shield, 
  BarChart3, Database, Activity, AlertTriangle,
  UserPlus, Loader2, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { PageLoader } from '../components/ui/PageLoader.js';
import { DashboardMetaTags } from '../components/MetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { AdminLazyLoader } from '../components/admin/AdminLazyLoader.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';

const SystemMetrics = lazy(() => import('../components/admin/SystemMetrics.js'));
const ActivityLog = lazy(() => import('../components/admin/ActivityLog.js'));
const UsersTable = lazy(() => import('../components/admin/UsersTable.js'));

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
    navigate('/admin/users');
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
              <span className="text-sm text-gray-600">{user?.name}</span>
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

          <section aria-label="Ações rápidas" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <Database className="h-6 w-6 text-green-600" aria-hidden="true" />
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
                    <Settings className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Configurações</h3>
                    <p className="text-sm text-gray-500">Configurações do sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section aria-label="Métricas e logs do sistema" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminLazyLoader>
              <SystemMetrics />
            </AdminLazyLoader>
            
            <AdminLazyLoader>
              <ActivityLog />
            </AdminLazyLoader>
          </section>

          <section aria-label="Lista de usuários" className="mt-6">
            <AdminLazyLoader>
              <UsersTable onCreate={handleNavigateToUsers} />
            </AdminLazyLoader>
          </section>
        </main>
      </div>
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminDashboard.tsx" -Encoding UTF8
Write-Success "AdminDashboard.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/admin/AdminMetaTags.tsx"
Write-Info "  • frontend/src/components/admin/AdminSchemaMarkup.tsx"
Write-Info "  • frontend/src/pages/AdminUsers.tsx (atualizado)"
Write-Info "  • frontend/src/pages/AdminDashboard.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ AdminMetaTags dinâmicas" -ForegroundColor White
Write-Info "  ✅ Schema Markup para admin" -ForegroundColor White
Write-Info "  ✅ Open Graph tags para admin" -ForegroundColor White
Write-Info "  ✅ Twitter Cards para admin" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse /admin/users" -ForegroundColor White
Write-Info "  3. Inspecione o head da página" -ForegroundColor White
Write-Info "  4. Verifique as meta tags e schema markup" -ForegroundColor White

Write-Success "🎉 Parte 2/3 concluída com sucesso!"