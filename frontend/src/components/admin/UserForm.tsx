// frontend/src/components/admin/UserForm.tsx
import React, { useMemo, useCallback, useEffect, useState } from 'react';
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
import { CheckCircle, X, Building2 } from 'lucide-react';
import { companyService, Company } from '../../services/company.service.js';

const userFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional(),
  role: z.enum(['admin', 'rep', 'consultant', 'user']),
  companyId: z.string().optional(),
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // ============================================
  // CARREGAR EMPRESAS - CORRIGIDO
  // ============================================
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companyService.listCompanies({ limit: 100 });
        
        // Verificar diferentes formatos de resposta
        let companiesList: Company[] = [];
        
        if (response && Array.isArray(response)) {
          companiesList = response;
        } else if (response && response.items && Array.isArray(response.items)) {
          companiesList = response.items;
        } else if (response && response.data && Array.isArray(response.data)) {
          companiesList = response.data;
        } else if (response && response.companies && Array.isArray(response.companies)) {
          companiesList = response.companies;
        }
        
        setCompanies(companiesList);
        console.log('✅ Empresas carregadas no formulário:', companiesList.length);
      } catch (error) {
        console.error('❌ Erro ao carregar empresas no formulário:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  const defaultValues = useMemo(() => isEditing ? {
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    companyId: user.companyId || '',
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
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  const password = watch('password');
  const email = watch('email');
  const name = watch('name');
  const companyId = watch('companyId');

  // Quando o usuário seleciona uma empresa, limpar o campo company
  useEffect(() => {
    if (companyId) {
      const selectedCompany = companies.find(c => c._id === companyId);
      if (selectedCompany) {
        setValue('company', selectedCompany.name);
      }
    }
  }, [companyId, companies, setValue]);

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

          {/* ============================================
              CAMPO EMPRESA - COM SELECT
              ============================================ */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">
                Empresa
              </label>
            </div>
            {loadingCompanies ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Spinner size="sm" variant="primary" />
                Carregando empresas...
              </div>
            ) : companies.length === 0 ? (
              <div className="text-sm text-gray-400">
                <p>Nenhuma empresa cadastrada. <a href="/admin/empresas" className="text-blue-600 hover:underline">Criar empresa</a></p>
                <Input
                  placeholder="Nome da empresa manual"
                  {...register('company')}
                  className="mt-2"
                />
              </div>
            ) : (
              <>
                <select
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200"
                  {...register('companyId')}
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name} {company.status !== 'active' ? '(Inativa)' : ''}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyId.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Selecione uma empresa da lista ou digite manualmente abaixo
                </p>
                <Input
                  placeholder="Ou digite o nome manualmente"
                  {...register('company')}
                  className="mt-2"
                />
                {errors.company && (
                  <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
                )}
              </>
            )}
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