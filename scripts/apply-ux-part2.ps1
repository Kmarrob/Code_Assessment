# scripts/apply-ux-part2.ps1
# Script para implementar UX & Usabilidade - Parte 2/5 (Feedback Visual e Validação em Tempo Real)

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
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - UX & USABILIDADE (PILAR 4)            ║" -ForegroundColor Cyan
Write-Host "║     PARTE 2/5 - FEEDBACK VISUAL E VALIDAÇÃO EM TEMPO REAL  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: FORM FIELD
# ============================================
Write-Step "PARTE 1/6: FORM FIELD"

Write-Info "Criando FormField.tsx..."
@'
// frontend/src/components/ui/FormField.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  labelClassName?: string;
  errorClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  success,
  required,
  disabled,
  children,
  className,
  labelClassName,
  errorClassName,
  ...props
}) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label && (
        <label className={cn('block text-sm font-medium text-gray-700', labelClassName)}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        {hasSuccess && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className={cn('text-sm text-red-600 flex items-start gap-1.5', errorClassName)}>
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p className="text-sm text-gray-500 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
};

interface UseFieldValidationProps {
  value: string;
  validate?: (value: string) => string | undefined;
  debounceMs?: number;
}

export function useFieldValidation({
  value,
  validate,
  debounceMs = 300,
}: UseFieldValidationProps) {
  const [error, setError] = React.useState<string | undefined>();
  const [isValidating, setIsValidating] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!validate || !touched) return;

    setIsValidating(true);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      const result = validate(value);
      setError(result);
      setIsValidating(false);
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, validate, touched, debounceMs]);

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const result = validate(value);
      setError(result);
    }
  };

  const reset = () => {
    setError(undefined);
    setIsValidating(false);
    setTouched(false);
  };

  return {
    error,
    isValidating,
    touched,
    hasError: !!error && touched,
    isValid: !error && touched,
    handleBlur,
    reset,
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\FormField.tsx" -Encoding UTF8
Write-Success "FormField.tsx criado"

# ============================================
# PARTE 2: INPUT ATUALIZADO
# ============================================
Write-Step "PARTE 2/6: INPUT ATUALIZADO"

Write-Info "Atualizando Input.tsx..."
@'
// frontend/src/components/ui/Input.tsx
import React, { useState } from 'react';
import { cn } from '../../utils/helpers.js';
import { Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  success?: boolean;
  required?: boolean;
  onValidate?: (value: string) => string | undefined;
  validateOnChange?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    icon, 
    type, 
    showPasswordToggle, 
    success,
    required,
    onValidate,
    validateOnChange = false,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const id = React.useId();
    const [showPassword, setShowPassword] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    const [isValidating, setIsValidating] = useState(false);
    const [touched, setTouched] = useState(false);

    const inputType = showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      if (validateOnChange && onValidate && touched) {
        setIsValidating(true);
        const result = onValidate(e.target.value);
        setInternalError(result);
        setIsValidating(false);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      setTouched(true);
      
      if (onValidate) {
        const result = onValidate(e.target.value);
        setInternalError(result);
      }
    };

    const displayError = error || (touched ? internalError : undefined);
    const hasError = !!displayError;
    const hasSuccess = (success || (onValidate && !internalError && touched)) && !hasError;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={inputType}
            className={cn(
              'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              showPasswordToggle && type === 'password' && 'pr-10',
              hasError && 'border-red-500 focus-visible:ring-red-500 bg-red-50/50',
              hasSuccess && 'border-green-500 focus-visible:ring-green-500 bg-green-50/50',
              !hasError && !hasSuccess && 'border-input focus-visible:ring-primary-500',
              className
            )}
            ref={ref}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
            </div>
          )}
          {!isValidating && hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          {!isValidating && hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {hasError && (
          <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1.5 animate-slide-up">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {displayError}
          </p>
        )}
        {hint && !hasError && (
          <p id={`${id}-hint`} className="text-sm text-gray-500 flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Input.tsx" -Encoding UTF8
Write-Success "Input.tsx atualizado"

# ============================================
# PARTE 3: EMAIL INPUT
# ============================================
Write-Step "PARTE 3/6: EMAIL INPUT"

Write-Info "Criando EmailInput.tsx..."
@'
// frontend/src/components/ui/EmailInput.tsx
import React from 'react';
import { Input, InputProps } from './Input.js';
import { Mail } from 'lucide-react';

interface EmailInputProps extends Omit<InputProps, 'type' | 'icon'> {}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ onValidate, ...props }, ref) => {
    const validateEmail = (value: string): string | undefined => {
      if (!value) return undefined;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Digite um email válido';
      }
      
      const domain = value.split('@')[1];
      if (domain && !domain.includes('.')) {
        return 'Domínio de email inválido';
      }
      
      return undefined;
    };

    return (
      <Input
        ref={ref}
        type="email"
        icon={<Mail className="h-4 w-4" />}
        onValidate={onValidate || validateEmail}
        validateOnChange
        placeholder="seu@email.com"
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\EmailInput.tsx" -Encoding UTF8
Write-Success "EmailInput.tsx criado"

# ============================================
# PARTE 4: PASSWORD INPUT
# ============================================
Write-Step "PARTE 4/6: PASSWORD INPUT"

Write-Info "Criando PasswordInput.tsx..."
@'
// frontend/src/components/ui/PasswordInput.tsx
import React from 'react';
import { Input, InputProps } from './Input.js';
import { PasswordStrength } from './PasswordStrength.js';
import { Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputProps, 'type' | 'icon'> {
  showStrength?: boolean;
  minLength?: number;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = true, minLength = 12, onValidate, ...props }, ref) => {
    const [password, setPassword] = React.useState('');

    const validatePassword = (value: string): string | undefined => {
      if (!value) return undefined;
      
      if (value.length < minLength) {
        return `Senha deve ter pelo menos ${minLength} caracteres`;
      }
      if (!/[A-Z]/.test(value)) {
        return 'Senha deve conter pelo menos 1 letra maiúscula';
      }
      if (!/[a-z]/.test(value)) {
        return 'Senha deve conter pelo menos 1 letra minúscula';
      }
      if (!/[0-9]/.test(value)) {
        return 'Senha deve conter pelo menos 1 número';
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Senha deve conter pelo menos 1 caractere especial';
      }
      
      return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    return (
      <div className="space-y-2">
        <Input
          ref={ref}
          type="password"
          icon={<Lock className="h-4 w-4" />}
          onValidate={onValidate || validatePassword}
          validateOnChange
          onChange={handleChange}
          showPasswordToggle
          placeholder="••••••••"
          {...props}
        />
        {showStrength && password && (
          <PasswordStrength password={password} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\PasswordInput.tsx" -Encoding UTF8
Write-Success "PasswordInput.tsx criado"

# ============================================
# PARTE 5: LOGIN PAGE ATUALIZADO
# ============================================
Write-Step "PARTE 5/6: LOGIN PAGE ATUALIZADO"

Write-Info "Atualizando LoginPage.tsx..."
@'
// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { LoadingButton } from '../components/ui/LoadingButton.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <EmailInput
              label="Email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              showStrength={false}
              error={errors.password?.message}
              {...register('password')}
            />
            
            <LoadingButton
              type="submit"
              className="w-full"
              loadingText="Entrando..."
            >
              Entrar
            </LoadingButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LoginPage.tsx" -Encoding UTF8
Write-Success "LoginPage.tsx atualizado"

# ============================================
# PARTE 6: REGISTER PAGE ATUALIZADO
# ============================================
Write-Step "PARTE 6/6: REGISTER PAGE ATUALIZADO"

Write-Info "Atualizando RegisterPage.tsx..."
@'
// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { LoadingButton } from '../components/ui/LoadingButton.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { User, Mail, Lock, Building, Shield } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial'),
  company: z.string().optional(),
  department: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Comece sua jornada de assessment digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            
            <EmailInput
              label="Email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            
            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              icon={<Building className="h-4 w-4" />}
              error={errors.company?.message}
              {...register('company')}
            />
            
            <Input
              label="Departamento"
              placeholder="Seu departamento"
              icon={<Building className="h-4 w-4" />}
              error={errors.department?.message}
              {...register('department')}
            />
            
            <LoadingButton
              type="submit"
              className="w-full"
              loadingText="Criando conta..."
            >
              Criar conta
            </LoadingButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RegisterPage.tsx" -Encoding UTF8
Write-Success "RegisterPage.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/5 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/ui/FormField.tsx"
Write-Info "  • frontend/src/components/ui/Input.tsx (atualizado)"
Write-Info "  • frontend/src/components/ui/EmailInput.tsx"
Write-Info "  • frontend/src/components/ui/PasswordInput.tsx"
Write-Info "  • frontend/src/pages/LoginPage.tsx (atualizado)"
Write-Info "  • frontend/src/pages/RegisterPage.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste validação em tempo real nos campos" -ForegroundColor White
Write-Info "  3. Teste feedback visual (sucesso/erro)" -ForegroundColor White
Write-Info "  4. Teste EmailInput com validação de domínio" -ForegroundColor White
Write-Info "  5. Teste PasswordInput com indicador de força" -ForegroundColor White

Write-Success "🎉 Parte 2/5 concluída com sucesso!"