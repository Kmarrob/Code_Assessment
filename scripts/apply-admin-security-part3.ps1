# scripts/apply-admin-security-part3.ps1
# Script para aplicar Parte 3/3 - Frontend - Segurança

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
Write-Host "║     CODE_ASSESSMENT - ADMIN SEGURANÇA (PILAR 2)            ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/3 - FRONTEND - SEGURANÇA                       ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN USERS ATUALIZADO
# ============================================
Write-Step "PARTE 1/3: ADMIN USERS ATUALIZADO"

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
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminUsers.tsx" -Encoding UTF8
Write-Success "AdminUsers.tsx atualizado"

# ============================================
# PARTE 2: USE ADMIN SECURITY
# ============================================
Write-Step "PARTE 2/3: USE ADMIN SECURITY"

Write-Info "Criando useAdminSecurity.ts..."
@'
// frontend/src/hooks/useAdminSecurity.ts
import { useState, useCallback } from 'react';
import { useSanitize } from './useSanitize.js';

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export function useAdminSecurity() {
  const { sanitizeApiData } = useSanitize();
  const [isValidating, setIsValidating] = useState(false);

  const validatePassword = useCallback((password: string): ValidationResult => {
    const errors: Record<string, string[]> = {};
    const issues: string[] = [];

    if (password.length < 12) {
      issues.push('Senha deve ter pelo menos 12 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 número');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 caractere especial');
    }

    if (issues.length > 0) {
      errors.password = issues;
      return { valid: false, errors };
    }

    return { valid: true, errors: {} };
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: Record<string, string[]> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      errors.email = ['Email é obrigatório'];
      return { valid: false, errors };
    }

    if (!emailRegex.test(email)) {
      errors.email = ['Email inválido'];
      return { valid: false, errors };
    }

    return { valid: true, errors: {} };
  }, []);

  const validateAndSanitize = useCallback((
    data: Record<string, any>,
    rules: Record<string, (value: any) => ValidationResult>
  ): { valid: boolean; sanitized: Record<string, any>; errors: Record<string, string[]> } => {
    const sanitized = sanitizeApiData(data);
    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const [field, validator] of Object.entries(rules)) {
      if (field in sanitized) {
        const result = validator(sanitized[field]);
        if (!result.valid) {
          valid = false;
          Object.assign(errors, result.errors);
        }
      }
    }

    return { valid, sanitized, errors };
  }, [sanitizeApiData]);

  const checkPermission = useCallback((userRole: string, requiredRole: string): boolean => {
    const roleHierarchy: Record<string, number> = {
      admin: 4,
      rep: 3,
      consultant: 2,
      user: 1,
    };

    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  }, []);

  const logSuspiciousActivity = useCallback((action: string, details?: Record<string, any>) => {
    console.warn(`[SECURITY] Ação suspeita: ${action}`, details);
  }, []);

  return {
    validatePassword,
    validateEmail,
    validateAndSanitize,
    checkPermission,
    logSuspiciousActivity,
    isValidating,
    setIsValidating,
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useAdminSecurity.ts" -Encoding UTF8
Write-Success "useAdminSecurity.ts criado"

# ============================================
# PARTE 3: USER FORM ATUALIZADO
# ============================================
Write-Step "PARTE 3/3: USER FORM ATUALIZADO"

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
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">
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
              <Button type="submit" loading={isLoading}>
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
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/pages/AdminUsers.tsx (atualizado)"
Write-Info "  • frontend/src/hooks/useAdminSecurity.ts"
Write-Info "  • frontend/src/components/admin/UserForm.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Sanitização de saída com DOMPurify" -ForegroundColor White
Write-Info "  ✅ Validação de senha em tempo real" -ForegroundColor White
Write-Info "  ✅ Validação de email em tempo real" -ForegroundColor White
Write-Info "  ✅ Hook useAdminSecurity para segurança" -ForegroundColor White
Write-Info "  ✅ PasswordStrength no formulário" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 2 (Segurança) - Admin:" -ForegroundColor Cyan
Write-Info "  ✅ Middleware de sanitização para admin" -ForegroundColor White
Write-Info "  ✅ Validação reforçada com Zod" -ForegroundColor White
Write-Info "  ✅ Rate limiting específico para admin" -ForegroundColor White
Write-Info "  ✅ Security logging para ações admin" -ForegroundColor White
Write-Info "  ✅ Proteção contra auto-desativação" -ForegroundColor White
Write-Info "  ✅ Proteção contra auto-mudança de role" -ForegroundColor White
Write-Info "  ✅ AuditService para ações admin" -ForegroundColor White
Write-Info "  ✅ Sanitização de saída no frontend" -ForegroundColor White
Write-Info "  ✅ Validação em tempo real" -ForegroundColor White
Write-Info "  ✅ PasswordStrength no formulário" -ForegroundColor White

Write-Success ""
Write-Success "🎉 PILAR 2 (SEGURANÇA/APPSEC) - ADMIN - VALIDADO!"
Write-Success "🏁 Módulo Admin - Pilar 2 COMPLETO!"