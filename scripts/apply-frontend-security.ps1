# scripts/apply-frontend-security.ps1
# Script para implementar Frontend - Segurança (Pilar 2 - Parte 3/4)

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
Write-Host "║     CODE_ASSESSMENT - FRONTEND SEGURANÇA (PILAR 2)           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: INSTALAR DOMPURIFY
# ============================================
Write-Step "PARTE 1/3: INSTALANDO DOMPURIFY"

Write-Info "Instalando DOMPurify no frontend..."
Push-Location "$BaseDir\frontend"
npm install dompurify @types/dompurify --save
Pop-Location
Write-Success "DOMPurify instalado"

# ============================================
# PARTE 2: HOOKS E COMPONENTES
# ============================================
Write-Step "PARTE 2/3: CRIANDO HOOKS E COMPONENTES DE SEGURANÇA"

# 2.1 - useSanitize Hook
Write-Info "Criando useSanitize.ts..."
@'
// frontend/src/hooks/useSanitize.ts
import { useCallback } from 'react';
import DOMPurify from 'dompurify';

const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'code', 'pre', 'blockquote', 'table', 'thead',
    'tbody', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
  USE_PROFILES: { html: true },
};

export function useSanitize() {
  const sanitizeHtml = useCallback((html: string): string => {
    if (!html) return '';
    return DOMPurify.sanitize(html, purifyConfig);
  }, []);

  const sanitizeObject = useCallback(<T extends Record<string, any>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') return obj;

    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key as keyof T] = DOMPurify.sanitize(value, {
          ...purifyConfig,
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        }) as any;
      } else if (Array.isArray(value)) {
        result[key as keyof T] = value.map((item) =>
          typeof item === 'string'
            ? DOMPurify.sanitize(item, {
                ...purifyConfig,
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: [],
              })
            : typeof item === 'object' && item !== null
            ? sanitizeObject(item)
            : item
        ) as any;
      } else if (typeof value === 'object' && value !== null) {
        result[key as keyof T] = sanitizeObject(value);
      } else {
        result[key as keyof T] = value;
      }
    }
    return result;
  }, []);

  const sanitizeApiData = useCallback(<T>(data: T): T => {
    if (!data) return data;
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data, {
        ...purifyConfig,
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      }) as any;
    }
    if (typeof data === 'object') {
      return sanitizeObject(data as any);
    }
    return data;
  }, [sanitizeObject]);

  return {
    sanitizeHtml,
    sanitizeObject,
    sanitizeApiData,
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useSanitize.ts" -Encoding UTF8
Write-Success "useSanitize.ts criado"

# 2.2 - SafeText Component
Write-Info "Criando SafeText.tsx..."
@'
// frontend/src/components/ui/SafeText.tsx
import React, { useMemo } from 'react';
import { useSanitize } from '../../hooks/useSanitize.js';

interface SafeTextProps {
  html: string;
  as?: 'span' | 'div' | 'p';
  className?: string;
  allowTags?: boolean;
}

export const SafeText: React.FC<SafeTextProps> = ({
  html,
  as: Component = 'span',
  className = '',
  allowTags = true,
}) => {
  const { sanitizeHtml } = useSanitize();

  const sanitized = useMemo(() => {
    if (!html) return '';
    if (allowTags) {
      return sanitizeHtml(html);
    }
    return sanitizeHtml(html).replace(/<[^>]*>/g, '');
  }, [html, allowTags, sanitizeHtml]);

  if (!sanitized) return null;

  if (allowTags) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <Component className={className}>{sanitized}</Component>;
};

export const SafeString: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();
  const sanitized = useMemo(() => sanitizeApiData(text), [text, sanitizeApiData]);
  return <span className={className}>{sanitized}</span>;
};

export const SafeArray: React.FC<{
  items: string[];
  className?: string;
  renderItem?: (item: string, index: number) => React.ReactNode;
}> = ({ items, className = '', renderItem }) => {
  const { sanitizeApiData } = useSanitize();

  const sanitizedItems = useMemo(
    () => sanitizeApiData(items),
    [items, sanitizeApiData]
  );

  if (!sanitizedItems || sanitizedItems.length === 0) {
    return null;
  }

  if (renderItem) {
    return <>{sanitizedItems.map((item, index) => renderItem(item, index))}</>;
  }

  return (
    <span className={className}>
      {sanitizedItems.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </span>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\SafeText.tsx" -Encoding UTF8
Write-Success "SafeText.tsx criado"

# 2.3 - SafeDisplay Component
Write-Info "Criando SafeDisplay.tsx..."
@'
// frontend/src/components/ui/SafeDisplay.tsx
import React from 'react';
import { useSanitize } from '../../hooks/useSanitize.js';

interface SafeDisplayProps {
  data: any;
  format?: 'text' | 'json' | 'html';
  className?: string;
}

export const SafeDisplay: React.FC<SafeDisplayProps> = ({
  data,
  format = 'text',
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();

  if (!data) return null;

  const sanitized = sanitizeApiData(data);

  if (format === 'json') {
    return (
      <pre className={className}>
        {JSON.stringify(sanitized, null, 2)}
      </pre>
    );
  }

  if (format === 'html') {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <span className={className}>{String(sanitized)}</span>;
};

export const SafeUserInfo: React.FC<{ user: any; className?: string }> = ({
  user,
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();

  if (!user) return null;

  const safeUser = sanitizeApiData(user);

  return (
    <div className={className}>
      <span className="font-medium">{safeUser.name}</span>
      <span className="text-gray-500 text-sm ml-2">{safeUser.email}</span>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\SafeDisplay.tsx" -Encoding UTF8
Write-Success "SafeDisplay.tsx criado"

# 2.4 - PasswordStrength Component
Write-Info "Criando PasswordStrength.tsx..."
@'
// frontend/src/components/ui/PasswordStrength.tsx
import React, { useMemo } from 'react';
import { cn } from '../../utils/helpers.js';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
  score: number;
}

const levels: StrengthLevel[] = [
  { label: 'Muito fraca', color: 'text-red-600', bgColor: 'bg-red-600', score: 0 },
  { label: 'Fraca', color: 'text-orange-500', bgColor: 'bg-orange-500', score: 1 },
  { label: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-600', score: 2 },
  { label: 'Forte', color: 'text-green-500', bgColor: 'bg-green-500', score: 3 },
  { label: 'Muito forte', color: 'text-emerald-600', bgColor: 'bg-emerald-600', score: 4 },
];

const requirements = [
  { id: 'length', label: 'Pelo menos 12 caracteres', test: (p: string) => p.length >= 12 },
  { id: 'uppercase', label: 'Pelo menos 1 letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Pelo menos 1 letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Pelo menos 1 número', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Pelo menos 1 caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className,
}) => {
  const { score, level, passedRequirements } = useMemo(() => {
    const passed = requirements.filter((req) => req.test(password));
    const score = passed.length;
    const level = levels[Math.min(score, levels.length - 1)] || levels[0];
    return { score, level, passedRequirements: passed };
  }, [password]);

  const percentage = (score / requirements.length) * 100;

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', level.bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={cn('text-xs font-medium', level.color)}>
          {level.label}
        </span>
        <span className="text-xs text-gray-400">
          {score}/{requirements.length}
        </span>
      </div>

      <ul className="space-y-1 mt-2">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li
              key={req.id}
              className={cn(
                'text-xs flex items-center gap-2 transition-colors',
                passed ? 'text-green-600' : 'text-gray-400'
              )}
            >
              <span className="text-lg leading-none">
                {passed ? '✓' : '○'}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\PasswordStrength.tsx" -Encoding UTF8
Write-Success "PasswordStrength.tsx criado"

# 2.5 - Atualizar Input.tsx
Write-Info "Atualizando Input.tsx..."
@'
// frontend/src/components/ui/Input.tsx
import React, { useState } from 'react';
import { cn } from '../../utils/helpers.js';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, showPasswordToggle, ...props }, ref) => {
    const id = React.useId();
    const [showPassword, setShowPassword] = useState(false);

    const inputType = showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
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
              'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              showPasswordToggle && type === 'password' && 'pr-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Input.tsx" -Encoding UTF8
Write-Success "Input.tsx atualizado"

# ============================================
# PARTE 3: ATUALIZAR PÁGINAS
# ============================================
Write-Step "PARTE 3/3: ATUALIZANDO PÁGINAS"

# 3.1 - Atualizar RegisterPage
Write-Info "Atualizando RegisterPage.tsx..."
# (Criar versão simplificada com validação de senha)
@'
// frontend/src/pages/RegisterPage.tsx (versão atualizada)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { PasswordStrength } from '../components/ui/PasswordStrength.js';
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
    watch,
    formState: { errors },
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
          <CardDescription>Comece sua jornada de assessment digital</CardDescription>
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
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                showPasswordToggle
                {...register('password')}
              />
              <PasswordStrength password={password || ''} className="mt-2" />
            </div>
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
            <Button type="submit" className="w-full" loading={isLoading}>
              Criar conta
            </Button>
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

# 3.2 - Atualizar index.html com CSP
Write-Info "Atualizando index.html com CSP..."
@'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data: https:;
      connect-src 'self' http://localhost:3000 https://api.code-assessment.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    " />
    
    <title>Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</title>
    <meta name="description" content="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@ | Out-File -FilePath "$BaseDir\frontend\index.html" -Encoding UTF8
Write-Success "index.html atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ FRONTEND SEGURANÇA APLICADA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/hooks/useSanitize.ts"
Write-Info "  • frontend/src/components/ui/SafeText.tsx"
Write-Info "  • frontend/src/components/ui/SafeDisplay.tsx"
Write-Info "  • frontend/src/components/ui/PasswordStrength.tsx"
Write-Info "  • frontend/src/components/ui/Input.tsx (atualizado)"
Write-Info "  • frontend/src/pages/RegisterPage.tsx (atualizado)"
Write-Info "  • frontend/index.html (atualizado com CSP)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse: http://localhost:5173/register" -ForegroundColor White
Write-Info "  3. Teste a validação de senha em tempo real" -ForegroundColor White
Write-Info "  4. Verifique os headers de segurança (CSP)" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"