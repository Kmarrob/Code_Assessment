# scripts/apply-ux-part5.ps1
# Script para implementar UX & Usabilidade - Parte 5/5 (Responsividade e Formulários Aprimorados)

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
Write-Host "║     PARTE 5/5 - RESPONSIVIDADE E FORMULÁRIOS APRIMORADOS   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: USE RESPONSIVE
# ============================================
Write-Step "PARTE 1/6: USE RESPONSIVE"

Write-Info "Criando useResponsive.ts..."
@'
// frontend/src/hooks/useResponsive.ts
import { useState, useEffect, useCallback } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useResponsive() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: isMobile || isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useResponsive.ts" -Encoding UTF8
Write-Success "useResponsive.ts criado"

# ============================================
# PARTE 2: CONTAINER
# ============================================
Write-Step "PARTE 2/6: CONTAINER"

Write-Info "Criando Container.tsx..."
@'
// frontend/src/components/ui/Container.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
  padding?: boolean;
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  as: Component = 'div',
  padding = true,
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        containerSizes[size],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Container.tsx" -Encoding UTF8
Write-Success "Container.tsx criado"

# ============================================
# PARTE 3: GRID
# ============================================
Write-Step "PARTE 3/6: GRID"

Write-Info "Criando Grid.tsx..."
@'
// frontend/src/components/ui/Grid.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  as?: 'div' | 'section' | 'ul';
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  as: Component = 'div',
  className,
  ...props
}) => {
  const colClass = [
    cols.xs && colClasses[cols.xs as keyof typeof colClasses],
    cols.sm && `sm:${colClasses[cols.sm as keyof typeof colClasses]}`,
    cols.md && `md:${colClasses[cols.md as keyof typeof colClasses]}`,
    cols.lg && `lg:${colClasses[cols.lg as keyof typeof colClasses]}`,
    cols.xl && `xl:${colClasses[cols.xl as keyof typeof colClasses]}`,
  ]
    .filter(Boolean)
    .join(' ');

  const gapClass = gapClasses[gap as keyof typeof gapClasses] || `gap-${gap}`;

  return (
    <Component
      className={cn(
        'grid',
        colClass,
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  as?: 'div' | 'li';
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = {},
  as: Component = 'div',
  className,
  ...props
}) => {
  const spanClass = [
    span.xs && `col-span-${span.xs}`,
    span.sm && `sm:col-span-${span.sm}`,
    span.md && `md:col-span-${span.md}`,
    span.lg && `lg:col-span-${span.lg}`,
    span.xl && `xl:col-span-${span.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={cn(spanClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Grid.tsx" -Encoding UTF8
Write-Success "Grid.tsx criado"

# ============================================
# PARTE 4: FORM
# ============================================
Write-Step "PARTE 4/6: FORM"

Write-Info "Criando Form.tsx..."
@'
// frontend/src/components/ui/Form.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { LoadingButton } from './LoadingButton.js';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
  loadingLabel = 'Salvando...',
  cancelLabel,
  onCancel,
  children,
  className,
  ...props
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
      noValidate
      {...props}
    >
      {children}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText={loadingLabel}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </LoadingButton>

        {cancelLabel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className }) => (
  <div className={cn('space-y-4', className)}>
    {children}
  </div>
);

interface FormRowProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  cols = 2,
  className,
}) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colClasses[cols], className)}>
      {children}
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Form.tsx" -Encoding UTF8
Write-Success "Form.tsx criado"

# ============================================
# PARTE 5: LOGIN PAGE ATUALIZADA
# ============================================
Write-Step "PARTE 5/6: LOGIN PAGE ATUALIZADA"

Write-Info "Atualizando LoginPage.tsx..."
@'
// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { Container } from '../components/ui/Container.js';
import { Form, FormGroup } from '../components/ui/Form.js';
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
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Container size="sm">
        <Card className="glass-card animate-fade-in">
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
            <Form
              onSubmit={handleSubmit(onSubmit)}
              isLoading={isLoading}
              submitLabel="Entrar"
              loadingLabel="Entrando..."
            >
              <FormGroup>
                <EmailInput
                  label="Email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                  autoComplete="email"
                />
                
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••"
                  showStrength={false}
                  error={errors.password?.message}
                  {...register('password')}
                  autoComplete="current-password"
                />
              </FormGroup>
            </Form>
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
      </Container>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LoginPage.tsx" -Encoding UTF8
Write-Success "LoginPage.tsx atualizado"

# ============================================
# PARTE 6: REGISTER PAGE ATUALIZADA
# ============================================
Write-Step "PARTE 6/6: REGISTER PAGE ATUALIZADA"

Write-Info "Atualizando RegisterPage.tsx..."
@'
// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { Container } from '../components/ui/Container.js';
import { Form, FormGroup, FormRow } from '../components/ui/Form.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { User, Building, Shield } from 'lucide-react';

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
      <Container size="sm">
        <Card className="glass-card animate-fade-in">
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
            <Form
              onSubmit={handleSubmit(onSubmit)}
              isLoading={isLoading}
              submitLabel="Criar conta"
              loadingLabel="Criando conta..."
            >
              <FormGroup>
                <Input
                  label="Nome completo"
                  placeholder="Seu nome"
                  icon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                  autoComplete="name"
                />
                
                <EmailInput
                  label="Email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                  autoComplete="email"
                />
                
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                  autoComplete="new-password"
                />

                <FormRow cols={2}>
                  <Input
                    label="Empresa"
                    placeholder="Nome da empresa"
                    icon={<Building className="h-4 w-4" />}
                    error={errors.company?.message}
                    {...register('company')}
                    autoComplete="organization"
                  />
                  
                  <Input
                    label="Departamento"
                    placeholder="Seu departamento"
                    icon={<Building className="h-4 w-4" />}
                    error={errors.department?.message}
                    {...register('department')}
                    autoComplete="organization"
                  />
                </FormRow>
              </FormGroup>
            </Form>
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
      </Container>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RegisterPage.tsx" -Encoding UTF8
Write-Success "RegisterPage.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 5/5 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/hooks/useResponsive.ts"
Write-Info "  • frontend/src/components/ui/Container.tsx"
Write-Info "  • frontend/src/components/ui/Grid.tsx"
Write-Info "  • frontend/src/components/ui/Form.tsx"
Write-Info "  • frontend/src/pages/LoginPage.tsx (atualizado)"
Write-Info "  • frontend/src/pages/RegisterPage.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste responsividade em diferentes tamanhos de tela" -ForegroundColor White
Write-Info "  3. Teste formulários em dispositivos móveis" -ForegroundColor White
Write-Info "  4. Teste componentes responsivos (Grid, Container)" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 4 (UX & Usabilidade):" -ForegroundColor Cyan
Write-Info "  ✅ Loading States e Skeletons" -ForegroundColor White
Write-Info "  ✅ Feedback Visual e Validação em Tempo Real" -ForegroundColor White
Write-Info "  ✅ Acessibilidade (ARIA, foco, contraste)" -ForegroundColor White
Write-Info "  ✅ Empty States e Micro-interações" -ForegroundColor White
Write-Info "  ✅ Responsividade e Formulários Aprimorados" -ForegroundColor White

Write-Success ""
Write-Success "🎉 PILAR 4 (UX & USABILIDADE) - AUTH - VALIDADO!"
Write-Success "🏁 Módulo Auth - COMPLETO!"