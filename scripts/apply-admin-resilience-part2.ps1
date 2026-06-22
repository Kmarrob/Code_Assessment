# scripts/apply-admin-resilience-part2.ps1
# Script para aplicar Parte 2/3 - Frontend - Error Boundaries e Fallbacks

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
Write-Host "║     CODE_ASSESSMENT - ADMIN RESILIÊNCIA (PILAR 3)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 2/3 - FRONTEND - ERROR BOUNDARIES E FALLBACKS   ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN ERROR BOUNDARY
# ============================================
Write-Step "PARTE 1/4: ADMIN ERROR BOUNDARY"

Write-Info "Criando AdminErrorBoundary.tsx..."
@'
// frontend/src/components/AdminErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button.js';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/admin';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Shield className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro no Painel Administrativo
            </h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro ao carregar o conteúdo administrativo. Por favor, tente novamente.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-500 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\AdminErrorBoundary.tsx" -Encoding UTF8
Write-Success "AdminErrorBoundary.tsx criado"

# ============================================
# PARTE 2: ADMIN FALLBACKS
# ============================================
Write-Step "PARTE 2/4: ADMIN FALLBACKS"

Write-Info "Criando AdminFallbacks.tsx..."
@'
// frontend/src/components/admin/AdminFallbacks.tsx
import React from 'react';
import { Button } from '../ui/Button.js';
import { RefreshCw, AlertCircle, ServerOff, WifiOff } from 'lucide-react';

interface AdminFallbackProps {
  onRetry?: () => void;
}

export const AdminLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="loading-spinner" />
    <p className="mt-4 text-gray-500">Carregando dados administrativos...</p>
  </div>
);

export const AdminErrorFallback: React.FC<AdminFallbackProps> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erro ao carregar dados
    </h3>
    <p className="text-gray-500 mb-4">
      Não foi possível carregar os dados administrativos.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    )}
  </div>
);

export const AdminNetworkFallback: React.FC<AdminFallbackProps> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <WifiOff className="h-12 w-12 text-yellow-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erro de conexão
    </h3>
    <p className="text-gray-500 mb-4">
      Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    )}
  </div>
);

export const AdminEmptyFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <ServerOff className="h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Nenhum dado disponível
    </h3>
    <p className="text-gray-500">
      Não há dados para exibir no momento.
    </p>
  </div>
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminFallbacks.tsx" -Encoding UTF8
Write-Success "AdminFallbacks.tsx criado"

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao dashboard
            </button>
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
# PARTE 4: USERS TABLE ATUALIZADO
# ============================================
Write-Step "PARTE 4/4: USERS TABLE ATUALIZADO"

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
import { AdminErrorFallback, AdminLoadingFallback } from './AdminFallbacks.js';
import { 
  Search, UserPlus, Edit, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle
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
      await deleteUser.mutateAsync(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  const handleConfirmReactivate = async () => {
    if (reactivateTarget) {
      await reactivateUser.mutateAsync(reactivateTarget._id);
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

  return (
    <>
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                  ))
                )}
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
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/AdminErrorBoundary.tsx"
Write-Info "  • frontend/src/components/admin/AdminFallbacks.tsx"
Write-Info "  • frontend/src/pages/AdminUsers.tsx (atualizado)"
Write-Info "  • frontend/src/components/admin/UsersTable.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ AdminErrorBoundary específico" -ForegroundColor White
Write-Info "  ✅ Fallbacks para diferentes tipos de erro" -ForegroundColor White
Write-Info "  ✅ Loading states aprimorados" -ForegroundColor White
Write-Info "  ✅ Retry automático com botão" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Simule um erro no componente admin" -ForegroundColor White
Write-Info "  3. Verifique o fallback com opção de retry" -ForegroundColor White
Write-Info "  4. Teste o loading state" -ForegroundColor White

Write-Success "🎉 Parte 2/3 concluída com sucesso!"