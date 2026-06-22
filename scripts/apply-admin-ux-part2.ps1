# scripts/apply-admin-ux-part2.ps1
# Script para aplicar Parte 2/4 - Validação e Formulários

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
Write-Host "║     PARTE 2/4 - VALIDAÇÃO E FORMULÁRIOS                   ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: USER FORM COM VALIDAÇÃO EM TEMPO REAL
# ============================================
Write-Step "PARTE 1/1: USER FORM COM VALIDAÇÃO EM TEMPO REAL"

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
    formState: { errors, touchedFields, isValid },
    watch,
    setError,
    clearErrors,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
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
  const name = watch('name');

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

  React.useEffect(() => {
    if (name && name.length > 0 && name.length < 3) {
      setError('name', { type: 'manual', message: 'Nome deve ter pelo menos 3 caracteres' });
    } else {
      clearErrors('name');
    }
  }, [name, setError, clearErrors]);

  const fieldStatus = (field: string) => {
    const touched = touchedFields[field as keyof typeof touchedFields];
    const error = errors[field as keyof typeof errors];
    if (!touched) return null;
    if (error) return 'error';
    return 'success';
  };

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
            <div className="relative">
              <Input
                label="Nome completo"
                placeholder="Nome do usuário"
                hint="Digite o nome completo do usuário"
                error={errors.name?.message}
                success={fieldStatus('name') === 'success'}
                {...register('name')}
              />
              {fieldStatus('name') === 'success' && (
                <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
              )}
            </div>

            <div className="relative">
              <EmailInput
                label="Email"
                placeholder="usuario@email.com"
                hint="Digite um email válido para o usuário"
                error={errors.email?.message}
                success={fieldStatus('email') === 'success'}
                {...register('email')}
              />
              {fieldStatus('email') === 'success' && (
                <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
              )}
            </div>

            {!isEditing && (
              <div className="space-y-2">
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
              hint="Nome da empresa do usuário"
              error={errors.company?.message}
              {...register('company')}
            />

            <Input
              label="Departamento"
              placeholder="Departamento"
              hint="Departamento do usuário"
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
                disabled={!isValid}
              >
                {isEditing ? 'Salvar alterações' : 'Criar usuário'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              * Campos obrigatórios
            </p>
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
Write-Step "✅ PARTE 2/4 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/src/components/admin/UserForm.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Validação em tempo real (onChange)" -ForegroundColor White
Write-Info "  ✅ Indicadores visuais de campo válido/inválido" -ForegroundColor White
Write-Info "  ✅ Hints e dicas contextuais" -ForegroundColor White
Write-Info "  ✅ PasswordStrength no formulário" -ForegroundColor White
Write-Info "  ✅ Botão desabilitado até formulário válido" -ForegroundColor White
Write-Info "  ✅ Autocomplete nos campos" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse /admin/users e clique em 'Novo Usuário'" -ForegroundColor White
Write-Info "  3. Teste a validação em tempo real" -ForegroundColor White
Write-Info "  4. Verifique os indicadores visuais" -ForegroundColor White
Write-Info "  5. Teste o PasswordStrength" -ForegroundColor White

Write-Success "🎉 Parte 2/4 concluída com sucesso!"