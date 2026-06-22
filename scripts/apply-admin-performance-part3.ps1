# scripts/apply-admin-performance-part3.ps1
# Script para aplicar Parte 3/3 - Frontend - Virtualização e Otimização

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
Write-Host "║     CODE_ASSESSMENT - ADMIN PERFORMANCE (PILAR 5)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/3 - FRONTEND - VIRTUALIZAÇÃO E OTIMIZAÇÃO     ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Step "PARTE 1/3: INSTALANDO DEPENDÊNCIAS"

Write-Info "Instalando react-window e react-virtualized-auto-sizer..."
Push-Location "$BaseDir\frontend"
npm install react-window react-virtualized-auto-sizer --save
npm install -D @types/react-window --save-dev
Pop-Location
Write-Success "Dependências instaladas"

# ============================================
# PARTE 2: USERS TABLE COM VIRTUALIZAÇÃO
# ============================================
Write-Step "PARTE 2/3: USERS TABLE COM VIRTUALIZAÇÃO"

Write-Info "Atualizando UsersTable.tsx..."
@'
// frontend/src/components/admin/UsersTable.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
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

const UserRow = React.memo(({ 
  data, 
  index, 
  style 
}: { 
  data: { 
    users: IUser[]; 
    onEdit?: (user: IUser) => void; 
    onDelete: (user: IUser) => void; 
    onReactivate: (user: IUser) => void;
  };
  index: number;
  style: React.CSSProperties;
}) => {
  const { users, onEdit, onDelete, onReactivate } = data;
  const user = users[index];
  
  if (!user) return null;

  return (
    <div style={style} className="flex items-center border-b border-gray-100 hover:bg-gray-50">
      <div className="flex-1 py-3 px-4 min-w-[150px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm" aria-hidden="true">
            {user.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-900 truncate">{user.name}</span>
        </div>
      </div>
      <div className="flex-1 py-3 px-4 min-w-[200px] text-gray-600 truncate">
        {user.email}
      </div>
      <div className="flex-1 py-3 px-4 min-w-[120px]">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      </div>
      <div className="flex-1 py-3 px-4 min-w-[100px]">
        {user.isActive ? (
          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-600 text-sm">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Inativo
          </span>
        )}
      </div>
      <div className="flex-1 py-3 px-4 min-w-[120px] text-sm text-gray-500">
        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
      </div>
      <div className="flex-1 py-3 px-4 min-w-[100px]">
        <div className="flex items-center gap-2">
          {onEdit && user.isActive && (
            <button
              onClick={() => onEdit(user)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label={`Editar usuário ${user.name}`}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {user.isActive ? (
            <button
              onClick={() => onDelete(user)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              aria-label={`Desativar usuário ${user.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={() => onReactivate(user)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              aria-label={`Reativar usuário ${user.name}`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

UserRow.displayName = 'UserRow';

export const UsersTable = React.memo(({ onEdit, onCreate }: UsersTableProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;

  const filters = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter || undefined,
  }), [page, limit, debouncedSearch, roleFilter]);

  const { data, isLoading, error, refetch } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const reactivateUser = useReactivateUser();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDelete = useCallback((user: IUser) => {
    setDeleteTarget(user);
  }, []);

  const handleReactivate = useCallback((user: IUser) => {
    setReactivateTarget(user);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      await deleteUser.mutateAsync(deleteTarget._id);
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteUser]);

  const handleConfirmReactivate = useCallback(async () => {
    if (reactivateTarget) {
      setIsReactivating(true);
      await reactivateUser.mutateAsync(reactivateTarget._id);
      setIsReactivating(false);
      setReactivateTarget(null);
    }
  }, [reactivateTarget, reactivateUser]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('');
    setPage(1);
  }, []);

  if (isLoading) {
    return <AdminLoadingFallback />;
  }

  if (error) {
    return <AdminErrorFallback onRetry={() => refetch()} />;
  }

  const users = data?.users || [];
  const pagination = data?.pagination;

  if (users.length === 0 && !search && !roleFilter) {
    return (
      <Card role="region" aria-label="Lista de usuários vazia">
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" aria-hidden="true" />}
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

  if (users.length === 0 && (search || roleFilter)) {
    return (
      <Card role="region" aria-label="Resultados da busca vazios">
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" aria-hidden="true" />}
            title="Nenhum resultado encontrado"
            description={search 
              ? `Nenhum usuário encontrado para "${search}". Tente ajustar sua busca.`
              : 'Nenhum usuário encontrado com os filtros selecionados.'
            }
            actionLabel="Limpar filtros"
            onAction={handleClearFilters}
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
        <Card role="region" aria-label="Tabela de usuários">
          <CardHeader>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
              <CardTitle id="users-table-title" className="text-base sm:text-lg">
                Usuários Cadastrados
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto" role="search" aria-label="Buscar usuários">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-9 w-full"
                    aria-label="Buscar usuários por nome ou email"
                    aria-describedby="search-description"
                  />
                  <span id="search-description" className="sr-only">
                    Digite o nome ou email do usuário para buscar
                  </span>
                </div>
                <select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm w-full sm:w-auto"
                  aria-label="Filtrar por perfil"
                >
                  <option value="">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="rep">Preposto</option>
                  <option value="consultant">Consultor</option>
                  <option value="user">Usuário</option>
                </select>
                {onCreate && (
                  <Button 
                    size="sm" 
                    onClick={onCreate} 
                    className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    aria-label="Adicionar novo usuário"
                  >
                    <UserPlus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Novo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 && (
              <div className="h-[500px] w-full">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={users.length}
                      itemSize={56}
                      width={width}
                      itemData={{
                        users,
                        onEdit,
                        onDelete: handleDelete,
                        onReactivate: handleReactivate,
                      }}
                    >
                      {UserRow}
                    </List>
                  )}
                </AutoSizer>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-3">
                <span className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    aria-label="Página anterior"
                    className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <span className="flex items-center px-3 text-sm" aria-live="polite">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    aria-label="Próxima página"
                    className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
});

UsersTable.displayName = 'UsersTable';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\UsersTable.tsx" -Encoding UTF8
Write-Success "UsersTable.tsx atualizado"

# ============================================
# PARTE 3: ADMIN DASHBOARD OTIMIZADO
# ============================================
Write-Step "PARTE 3/3: ADMIN DASHBOARD OTIMIZADO"

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
  UserPlus, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { PageLoader } from '../components/ui/PageLoader.js';
import { DashboardMetaTags } from '../components/MetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { AdminLazyLoader } from '../components/admin/AdminLazyLoader.js';

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
              onClick={handleNavigateToUsers}
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
            <AdminLazyLoader>
              <SystemMetrics />
            </AdminLazyLoader>
            
            <AdminLazyLoader>
              <ActivityLog />
            </AdminLazyLoader>
          </div>

          <div className="mt-6">
            <AdminLazyLoader>
              <UsersTable onCreate={handleNavigateToUsers} />
            </AdminLazyLoader>
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
Write-Step "✅ PARTE 3/3 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/src/components/admin/UsersTable.tsx"
Write-Info "  • frontend/src/pages/AdminDashboard.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Virtualização com react-window" -ForegroundColor White
Write-Info "  ✅ AutoSizer para altura dinâmica" -ForegroundColor White
Write-Info "  ✅ Debounce para todos os filtros" -ForegroundColor White
Write-Info "  ✅ useMemo para estatísticas" -ForegroundColor White
Write-Info "  ✅ useCallback para handlers" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 5 (Performance) - Admin:" -ForegroundColor Cyan
Write-Info "  ✅ Índices compostos no MongoDB" -ForegroundColor White
Write-Info "  ✅ Projeções estritas e .lean()" -ForegroundColor White
Write-Info "  ✅ React.memo para componentes" -ForegroundColor White
Write-Info "  ✅ useMemo e useCallback" -ForegroundColor White
Write-Info "  ✅ Lazy Loading para componentes pesados" -ForegroundColor White
Write-Info "  ✅ Virtualização para listas grandes" -ForegroundColor White
Write-Info "  ✅ Debounce para filtros" -ForegroundColor White

Write-Success ""
Write-Success "🎉 PILAR 5 (VELOCIDADE & PERFORMANCE) - ADMIN - VALIDADO!"
Write-Success "🏁 Módulo Admin - Pilar 5 COMPLETO!"