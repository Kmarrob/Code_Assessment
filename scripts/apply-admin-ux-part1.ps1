# scripts/apply-admin-ux-part1.ps1
# Script para aplicar Parte 1/4 - Loading States e Feedback Visual

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
Write-Host "║     PARTE 1/4 - LOADING STATES E FEEDBACK VISUAL          ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: USER FORM ATUALIZADO
# ============================================
Write-Step "PARTE 1/4: USER FORM ATUALIZADO"

Write-Info "Atualizando UserForm.tsx..."
@'
// frontend/src/components/admin/UserForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IUser, UserRole } from '../../types/index.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Spinner } from '../ui/Spinner.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { EmailInput } from '../ui/EmailInput.js';
import { PasswordInput } from '../ui/PasswordInput.js';
import { PasswordStrength } from '../ui/PasswordStrength.js';
import { useAdminSecurity } from '../../hooks/useAdminSecurity.js';
import { X } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional(),
  role: z.enum(['admin', 'rep', 'consultant', 'user']),
  company: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: IUser;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = !!user;
  const { validatePassword, validateEmail } = useAdminSecurity();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: isEditing ? {
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      company: user.company || '',
      department: user.department || '',
      isActive: user.isActive,
    } : {
      role: 'user',
      isActive: true,
    },
  });

  const password = watch('password');
  const email = watch('email');

  React.useEffect(() => {
    if (email && email.length > 0) {
      const result = validateEmail(email);
      if (!result.valid && result.errors.email) {
        setError('email', { type: 'manual', message: result.errors.email[0] });
      } else {
        clearErrors('email');
      }
    }
  }, [email, validateEmail, setError, clearErrors]);

  React.useEffect(() => {
    if (password && password.length > 0 && !isEditing) {
      const result = validatePassword(password);
      if (!result.valid && result.errors.password) {
        setError('password', { type: 'manual', message: result.errors.password[0] });
      } else {
        clearErrors('password');
      }
    }
  }, [password, validatePassword, setError, clearErrors, isEditing]);

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" variant="primary" />
            <p className="mt-4 text-gray-500 animate-pulse">
              {isEditing ? 'Salvando alterações...' : 'Criando usuário...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Nome do usuário"
              error={errors.name?.message}
              {...register('name')}
            />

            <EmailInput
              label="Email"
              placeholder="usuario@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            {!isEditing && (
              <div className="space-y-2">
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                {password && password.length > 0 && (
                  <PasswordStrength password={password} />
                )}
                <p className="text-xs text-gray-500">
                  A senha deve ter pelo menos 12 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Perfil
              </label>
              <select
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                {...register('role')}
              >
                <option value="admin">Administrador</option>
                <option value="rep">Preposto</option>
                <option value="consultant">Consultor</option>
                <option value="user">Usuário</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              error={errors.company?.message}
              {...register('company')}
            />

            <Input
              label="Departamento"
              placeholder="Departamento"
              error={errors.department?.message}
              {...register('department')}
            />

            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('isActive')}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="submit" 
                loading={isLoading}
                loadingText={isEditing ? 'Salvando...' : 'Criando...'}
              >
                {isEditing ? 'Salvar alterações' : 'Criar usuário'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\UserForm.tsx" -Encoding UTF8
Write-Success "UserForm.tsx atualizado"

# ============================================
# PARTE 2: USE ADMIN ATUALIZADO
# ============================================
Write-Step "PARTE 2/4: USE ADMIN ATUALIZADO"

Write-Info "Atualizando useAdmin.ts..."
@'
// frontend/src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, UserFilters } from '../services/admin.service.js';
import { showToast } from '../components/ui/Toast.js';
import { IUser } from '../types/index.js';

export const adminKeys = {
  all: ['admin'] as const,
  users: (filters: UserFilters = {}) => [...adminKeys.all, 'users', filters] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
};

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => adminService.listUsers(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.user(id || ''),
    queryFn: () => adminService.getUserById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createUser,
    onMutate: () => {
      showToast.loading('Criando usuário...');
    },
    onSuccess: (data) => {
      showToast.dismiss();
      showToast.success(`Usuário ${data.name} criado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao criar usuário');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updateUser(id, data),
    onMutate: () => {
      showToast.loading('Atualizando usuário...');
    },
    onSuccess: (data, variables) => {
      showToast.dismiss();
      showToast.success(`Usuário ${data.name} atualizado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao atualizar usuário');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.deleteUser,
    onMutate: () => {
      showToast.loading('Desativando usuário...');
    },
    onSuccess: (_, id) => {
      showToast.dismiss();
      showToast.success('Usuário desativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao desativar usuário');
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.reactivateUser,
    onMutate: () => {
      showToast.loading('Reativando usuário...');
    },
    onSuccess: (_, id) => {
      showToast.dismiss();
      showToast.success('Usuário reativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao reativar usuário');
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminService.resetPassword(id, password),
    onMutate: () => {
      showToast.loading('Resetando senha...');
    },
    onSuccess: (_, variables) => {
      showToast.dismiss();
      showToast.success('Senha resetada com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao resetar senha');
    },
  });
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useAdmin.ts" -Encoding UTF8
Write-Success "useAdmin.ts atualizado"

# ============================================
# PARTE 3: ADMIN LOADING OVERLAY
# ============================================
Write-Step "PARTE 3/4: ADMIN LOADING OVERLAY"

Write-Info "Criando AdminLoadingOverlay.tsx..."
@'
// frontend/src/components/admin/AdminLoadingOverlay.tsx
import React from 'react';
import { Spinner } from '../ui/Spinner.js';
import { cn } from '../../utils/helpers.js';

interface AdminLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminLoadingOverlay: React.FC<AdminLoadingOverlayProps> = ({
  isLoading,
  message = 'Carregando...',
  children,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-50 animate-fade-in">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
        </div>
      )}
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminLoadingOverlay.tsx" -Encoding UTF8
Write-Success "AdminLoadingOverlay.tsx criado"

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
import { AdminLoadingOverlay } from './AdminLoadingOverlay.js';
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
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/4 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/src/components/admin/UserForm.tsx"
Write-Info "  • frontend/src/hooks/useAdmin.ts"
Write-Info "  • frontend/src/components/admin/AdminLoadingOverlay.tsx"
Write-Info "  • frontend/src/components/admin/UsersTable.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Spinners para operações admin" -ForegroundColor White
Write-Info "  ✅ Toasts com feedback aprimorado" -ForegroundColor White
Write-Info "  ✅ AdminLoadingOverlay" -ForegroundColor White
Write-Info "  ✅ Loading states em todas as ações" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse /admin/users" -ForegroundColor White
Write-Info "  3. Teste criar, editar, desativar e reativar usuários" -ForegroundColor White
Write-Info "  4. Verifique os toasts e loading states" -ForegroundColor White

Write-Success "🎉 Parte 1/4 concluída com sucesso!"