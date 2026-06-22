# scripts/apply-admin-performance-part2.ps1
# Script para aplicar Parte 2/3 - Frontend - Memoização e Lazy Loading

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
Write-Host "║     PARTE 2/3 - FRONTEND - MEMOIZAÇÃO E LAZY LOADING      ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: USERS TABLE COM REACT.MEMO
# ============================================
Write-Step "PARTE 1/4: USERS TABLE COM REACT.MEMO"

Write-Info "Atualizando UsersTable.tsx..."
@'
// frontend/src/components/admin/UsersTable.tsx
import React, { useState, useMemo, useCallback } from 'react';
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
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table 
                  className="min-w-full divide-y divide-gray-200"
                  aria-labelledby="users-table-title"
                  role="table"
                >
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Usuário
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Email
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Perfil
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Último Login
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm" aria-hidden="true">
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
                              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
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
                                aria-label={`Editar usuário ${user.name}`}
                              >
                                <Edit className="h-4 w-4" aria-hidden="true" />
                              </button>
                            )}
                            {user.isActive ? (
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                aria-label={`Desativar usuário ${user.name}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(user)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                aria-label={`Reativar usuário ${user.name}`}
                              >
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
# PARTE 2: USER FORM COM USEMEMO E USECALLBACK
# ============================================
Write-Step "PARTE 2/4: USER FORM COM USEMEMO E USECALLBACK"

Write-Info "Atualizando UserForm.tsx..."
@'
// frontend/src/components/admin/UserForm.tsx
import React, { useMemo, useCallback, useEffect } from 'react';
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
import { AnimatedCheckmark } from '../ui/MicroInteractions.js';
import { useAdminSecurity } from '../../hooks/useAdminSecurity.js';
import { CheckCircle, X } from 'lucide-react';

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

export const UserForm = React.memo(({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) => {
  const isEditing = !!user;
  const { validatePassword, validateEmail } = useAdminSecurity();

  const defaultValues = useMemo(() => isEditing ? {
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    company: user.company || '',
    department: user.department || '',
    isActive: user.isActive,
  } : {
    role: 'user',
    isActive: true,
  }, [user, isEditing]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
    setError,
    clearErrors,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  const password = watch('password');
  const email = watch('email');
  const name = watch('name');

  const validateEmailField = useCallback((value: string) => {
    if (value && value.length > 0) {
      const result = validateEmail(value);
      if (!result.valid && result.errors.email) {
        setError('email', { type: 'manual', message: result.errors.email[0] });
      } else {
        clearErrors('email');
      }
    }
  }, [validateEmail, setError, clearErrors]);

  const validatePasswordField = useCallback((value: string) => {
    if (value && value.length > 0 && !isEditing) {
      const result = validatePassword(value);
      if (!result.valid && result.errors.password) {
        setError('password', { type: 'manual', message: result.errors.password[0] });
      } else {
        clearErrors('password');
      }
    }
  }, [validatePassword, setError, clearErrors, isEditing]);

  const validateNameField = useCallback((value: string) => {
    if (value && value.length > 0 && value.length < 3) {
      setError('name', { type: 'manual', message: 'Nome deve ter pelo menos 3 caracteres' });
    } else {
      clearErrors('name');
    }
  }, [setError, clearErrors]);

  useEffect(() => {
    validateEmailField(email);
  }, [email, validateEmailField]);

  useEffect(() => {
    validatePasswordField(password);
  }, [password, validatePasswordField]);

  useEffect(() => {
    validateNameField(name);
  }, [name, validateNameField]);

  const fieldStatus = useCallback((field: string) => {
    const touched = touchedFields[field as keyof typeof touchedFields];
    const error = errors[field as keyof typeof errors];
    if (!touched) return null;
    if (error) return 'error';
    return 'success';
  }, [touchedFields, errors]);

  const handleFormSubmit = useCallback(async (data: UserFormData) => {
    await onSubmit(data);
  }, [onSubmit]);

  if (isLoading) {
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
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Spinner size="lg" variant="primary" />
            <p className="mt-4 text-gray-500 animate-pulse">
              {isEditing ? 'Salvando alterações...' : 'Criando usuário...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="relative animate-slide-up">
            <Input
              label="Nome completo"
              placeholder="Nome do usuário"
              hint="Digite o nome completo do usuário"
              error={errors.name?.message}
              success={fieldStatus('name') === 'success'}
              {...register('name')}
            />
            {fieldStatus('name') === 'success' && (
              <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" aria-hidden="true" />
            )}
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <EmailInput
              label="Email"
              placeholder="usuario@email.com"
              hint="Digite um email válido para o usuário"
              error={errors.email?.message}
              success={fieldStatus('email') === 'success'}
              {...register('email')}
            />
            {fieldStatus('email') === 'success' && (
              <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" aria-hidden="true" />
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••"
                  hint="A senha deve ser forte e conter caracteres especiais"
                  error={errors.password?.message}
                  success={fieldStatus('password') === 'success'}
                  {...register('password')}
                />
              </div>
              {password && password.length > 0 && (
                <div className="animate-slide-up">
                  <PasswordStrength password={password} />
                </div>
              )}
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 12 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.
              </p>
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Perfil
            </label>
            <select
              className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200"
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

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              hint="Nome da empresa do usuário"
              error={errors.company?.message}
              {...register('company')}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <Input
              label="Departamento"
              placeholder="Departamento"
              hint="Departamento do usuário"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all duration-200"
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Usuário ativo
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <Button 
              type="submit" 
              loading={isLoading}
              loadingText={isEditing ? 'Salvando...' : 'Criando...'}
              disabled={!isValid}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              {isEditing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 animate-fade-in">
            <AnimatedCheckmark 
              active={isValid && Object.keys(touchedFields).length > 0} 
              size="sm"
            />
            <span className="text-xs text-gray-400">
              {isValid && Object.keys(touchedFields).length > 0 
                ? 'Formulário válido' 
                : 'Preencha todos os campos obrigatórios'}
            </span>
          </div>

          <p className="text-xs text-gray-400 text-center">
            * Campos obrigatórios
          </p>
        </form>
      </CardContent>
    </Card>
  );
});

UserForm.displayName = 'UserForm';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\UserForm.tsx" -Encoding UTF8
Write-Success "UserForm.tsx atualizado"

# ============================================
# PARTE 3: ADMIN DASHBOARD COM LAZY LOADING
# ============================================
Write-Step "PARTE 3/4: ADMIN DASHBOARD COM LAZY LOADING"

Write-Info "Atualizando AdminDashboard.tsx..."
@'
// frontend/src/pages/AdminDashboard.tsx
import React, { lazy, Suspense, useMemo } from 'react';
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: usersData } = useUsers({ limit: 1 });
  const totalUsers = usersData?.pagination?.total || 0;

  const stats = useMemo(() => ({
    totalUsers,
    activeUsers: 0,
    totalControls: 93,
    completedAssessments: 8,
  }), [totalUsers]);

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
            <AdminLazyLoader>
              <SystemMetrics />
            </AdminLazyLoader>
            
            <AdminLazyLoader>
              <ActivityLog />
            </AdminLazyLoader>
          </div>

          <div className="mt-6">
            <AdminLazyLoader>
              <UsersTable onCreate={() => navigate('/admin/users')} />
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
# PARTE 4: ADMIN LAZY LOADER
# ============================================
Write-Step "PARTE 4/4: ADMIN LAZY LOADER"

Write-Info "Criando AdminLazyLoader.tsx..."
@'
// frontend/src/components/admin/AdminLazyLoader.tsx
import React, { Suspense } from 'react';
import { AdminLoadingFallback } from './AdminFallbacks.js';

interface AdminLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminLazyLoader: React.FC<AdminLazyLoaderProps> = ({
  children,
  fallback = <AdminLoadingFallback />,
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminLazyLoader.tsx" -Encoding UTF8
Write-Success "AdminLazyLoader.tsx criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/3 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/src/components/admin/UsersTable.tsx"
Write-Info "  • frontend/src/components/admin/UserForm.tsx"
Write-Info "  • frontend/src/pages/AdminDashboard.tsx"
Write-Info "  • frontend/src/components/admin/AdminLazyLoader.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ React.memo para componentes admin" -ForegroundColor White
Write-Info "  ✅ useMemo para valores calculados" -ForegroundColor White
Write-Info "  ✅ useCallback para funções" -ForegroundColor White
Write-Info "  ✅ Lazy loading para componentes pesados" -ForegroundColor White
Write-Info "  ✅ AdminLazyLoader com fallback" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse /admin/users" -ForegroundColor White
Write-Info "  3. Verifique o lazy loading no Network tab" -ForegroundColor White
Write-Info "  4. Teste a performance com muitos usuários" -ForegroundColor White

Write-Success "🎉 Parte 2/3 concluída com sucesso!"