# scripts/apply-admin-ux-part3.ps1
# Script para aplicar Parte 3/4 - Empty States e Navegação

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
Write-Host "║     CODE_ASSESSMENT - ADMIN UX (PILAR 4)                   ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/4 - EMPTY STATES E NAVEGAÇÃO                  ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: USERS TABLE COM EMPTY STATES
# ============================================
Write-Step "PARTE 1/4: USERS TABLE COM EMPTY STATES"

Write-Info "Atualizando UsersTable.tsx..."
@'
// frontend/src/components/admin/UsersTable.tsx
import React, { useState } from 'react';
import { useUsers, useDeleteUser, useReactivateUser } from '../../hooks/useAdmin.js';
import { IUser, UserRole } from '../../types/index.js';
import { getRoleLabel, getRoleColor, formatDate } from '../../utils/helpers.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { ConfirmDialog } from '../ui/ConfirmDialog.js';
import { EmptyState } from '../ui/EmptyState.js';
import { AdminErrorFallback, AdminLoadingFallback } from './AdminFallbacks.js';
import { AdminLoadingOverlay } from './AdminLoadingOverlay.js';
import { 
  Search, UserPlus, Edit, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Users
} from 'lucide-react';
import { useDebounce } from '../../hooks/useMemoized.js';

interface UsersTableProps {
  onEdit?: (user: IUser) => void;
  onCreate?: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ onEdit, onCreate }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter || undefined,
  });

  const deleteUser = useDeleteUser();
  const reactivateUser = useReactivateUser();

  const handleDelete = (user: IUser) => {
    setDeleteTarget(user);
  };

  const handleReactivate = (user: IUser) => {
    setReactivateTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      await deleteUser.mutateAsync(deleteTarget._id);
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleConfirmReactivate = async () => {
    if (reactivateTarget) {
      setIsReactivating(true);
      await reactivateUser.mutateAsync(reactivateTarget._id);
      setIsReactivating(false);
      setReactivateTarget(null);
    }
  };

  if (isLoading) {
    return <AdminLoadingFallback />;
  }

  if (error) {
    return <AdminErrorFallback onRetry={() => refetch()} />;
  }

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Empty State - Nenhum usuário cadastrado
  if (users.length === 0 && !search && !roleFilter) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" />}
            title="Nenhum usuário cadastrado"
            description="Comece adicionando seu primeiro usuário ao sistema. Os usuários poderão acessar o sistema e responder aos controles atribuídos."
            actionLabel="Adicionar usuário"
            onAction={onCreate}
            size="lg"
          />
        </CardContent>
      </Card>
    );
  }

  // Empty State - Nenhum resultado para busca
  if (users.length === 0 && (search || roleFilter)) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" />}
            title="Nenhum resultado encontrado"
            description={search 
              ? `Nenhum usuário encontrado para "${search}". Tente ajustar sua busca.`
              : 'Nenhum usuário encontrado com os filtros selecionados.'
            }
            actionLabel="Limpar filtros"
            onAction={() => {
              setSearch('');
              setRoleFilter('');
            }}
            size="lg"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AdminLoadingOverlay 
        isLoading={isDeleting || isReactivating}
        message={isDeleting ? 'Desativando usuário...' : 'Reativando usuário...'}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Usuários Cadastrados</CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="rep">Preposto</option>
                  <option value="consultant">Consultor</option>
                  <option value="user">Usuário</option>
                </select>
                {onCreate && (
                  <Button size="sm" onClick={onCreate}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Novo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Usuário
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Perfil
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Último Login
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                            <XCircle className="h-3.5 w-3.5" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {onEdit && user.isActive && (
                            <button
                              onClick={() => onEdit(user)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              aria-label="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {user.isActive ? (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Desativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(user)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              aria-label="Reativar"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPage(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(pagination.page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLoadingOverlay>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Desativar Usuário"
        message={`Tem certeza que deseja desativar o usuário "${deleteTarget?.name}"? Ele não poderá mais acessar o sistema.`}
        confirmLabel="Desativar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteUser.isPending}
      />

      <ConfirmDialog
        isOpen={!!reactivateTarget}
        title="Reativar Usuário"
        message={`Tem certeza que deseja reativar o usuário "${reactivateTarget?.name}"? Ele poderá acessar o sistema novamente.`}
        confirmLabel="Reativar"
        variant="info"
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={reactivateUser.isPending}
      />
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\UsersTable.tsx" -Encoding UTF8
Write-Success "UsersTable.tsx atualizado"

# ============================================
# PARTE 2: ADMIN BREADCRUMBS
# ============================================
Write-Step "PARTE 2/4: ADMIN BREADCRUMBS"

Write-Info "Criando AdminBreadcrumbs.tsx..."
@'
// frontend/src/components/admin/AdminBreadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', path: '/admin' },
  ],
  '/admin/users': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Usuários', path: '/admin/users' },
  ],
  '/admin/controls': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Controles', path: '/admin/controls' },
  ],
  '/admin/settings': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Configurações', path: '/admin/settings' },
  ],
};

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const items = breadcrumbMap[location.pathname] || [
    { label: 'Dashboard', path: '/admin' },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === 0 ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminBreadcrumbs.tsx" -Encoding UTF8
Write-Success "AdminBreadcrumbs.tsx criado"

# ============================================
# PARTE 3: ADMIN USERS ATUALIZADO
# ============================================
Write-Step "PARTE 3/4: ADMIN USERS ATUALIZADO"

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
    <AdminErrorBoundary
      fallback={<AdminErrorFallback onRetry={() => window.location.reload()} />}
      onError={(error, errorInfo) => {
        console.error('AdminUsers Error:', error, errorInfo);
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <AdminBreadcrumbs />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-gray-600">Cadastre, edite e gerencie usuários do sistema</p>
          </div>
          {mode === 'list' && (
            <Button onClick={handleCreate}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          )}
        </div>

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
      </div>
    </AdminErrorBoundary>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminUsers.tsx" -Encoding UTF8
Write-Success "AdminUsers.tsx atualizado"

# ============================================
# PARTE 4: ADMIN DASHBOARD ATUALIZADO
# ============================================
Write-Step "PARTE 4/4: ADMIN DASHBOARD ATUALIZADO"

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
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';

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
          <div className="mb-4">
            <AdminBreadcrumbs />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">
              Gerencie toda a plataforma Code_Assessment
            </p>
          </div>

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
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminDashboard.tsx" -Encoding UTF8
Write-Success "AdminDashboard.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/admin/UsersTable.tsx (atualizado)"
Write-Info "  • frontend/src/components/admin/AdminBreadcrumbs.tsx"
Write-Info "  • frontend/src/pages/AdminUsers.tsx (atualizado)"
Write-Info "  • frontend/src/pages/AdminDashboard.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Empty States para lista vazia" -ForegroundColor White
Write-Info "  ✅ Empty States para busca sem resultados" -ForegroundColor White
Write-Info "  ✅ Breadcrumbs para navegação" -ForegroundColor White
Write-Info "  ✅ Indicação de localização" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse /admin/users" -ForegroundColor White
Write-Info "  3. Teste o Empty State (sem usuários)" -ForegroundColor White
Write-Info "  4. Teste a busca com resultados vazios" -ForegroundColor White
Write-Info "  5. Verifique os breadcrumbs" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"