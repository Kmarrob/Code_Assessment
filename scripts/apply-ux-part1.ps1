# scripts/apply-ux-part1.ps1
# Script para implementar UX & Usabilidade - Parte 1/5 (Loading States e Skeletons)

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
Write-Host "║     PARTE 1/5 - LOADING STATES E SKELETONS                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: SPINNER
# ============================================
Write-Step "PARTE 1/7: SPINNER"

Write-Info "Criando Spinner.tsx..."
@'
// frontend/src/components/ui/Spinner.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
  label?: string;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
};

const variants = {
  primary: 'border-primary-200 border-t-primary-600',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-label={label || 'Carregando'}>
      <div
        className={cn(
          'animate-spin rounded-full',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
};

interface SpinnerOverlayProps {
  active: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  active,
  label = 'Carregando...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-50">
          <Spinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Spinner.tsx" -Encoding UTF8
Write-Success "Spinner.tsx criado"

# ============================================
# PARTE 2: PROGRESS
# ============================================
Write-Step "PARTE 2/7: PROGRESS"

Write-Info "Criando Progress.tsx..."
@'
// frontend/src/components/ui/Progress.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const variantColors = {
  primary: 'bg-primary-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'primary',
  size = 'md',
  animated = true,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          {showValue && <span className="text-gray-600 font-medium">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size], className)}
        {...props}
      >
        <div
          className={cn(
            'transition-all duration-500 rounded-full',
            variantColors[variant],
            animated && 'animate-pulse',
            sizes[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const IndeterminateProgress: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden h-1', className)}>
    <div className="h-full bg-primary-600 animate-progress-indeterminate" />
  </div>
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Progress.tsx" -Encoding UTF8
Write-Success "Progress.tsx criado"

# ============================================
# PARTE 3: PAGE LOADER
# ============================================
Write-Step "PARTE 3/7: PAGE LOADER"

Write-Info "Criando PageLoader.tsx..."
@'
// frontend/src/components/ui/PageLoader.tsx
import React from 'react';
import { Spinner } from './Spinner.js';
import { cn } from '../../utils/helpers.js';

interface PageLoaderProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  fullScreen = false,
  message = 'Carregando...',
  className,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-gray-500 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-gray-50', className)}>
        {content}
      </div>
    );
  }

  return <div className={cn('py-12 flex items-center justify-center', className)}>{content}</div>;
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\PageLoader.tsx" -Encoding UTF8
Write-Success "PageLoader.tsx criado"

# ============================================
# PARTE 4: BUTTON ATUALIZADO
# ============================================
Write-Step "PARTE 4/7: BUTTON ATUALIZADO"

Write-Info "Atualizando Button.tsx..."
@'
// frontend/src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers.js';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      children,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Button.tsx" -Encoding UTF8
Write-Success "Button.tsx atualizado"

# ============================================
# PARTE 5: SKELETON ATUALIZADO
# ============================================
Write-Step "PARTE 5/7: SKELETON ATUALIZADO"

Write-Info "Atualizando Skeleton.tsx..."
@'
// frontend/src/components/ui/Skeleton.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  ...props
}) => {
  const baseStyles = 'bg-gray-200 rounded';

  const variantStyles = {
    text: 'h-4 rounded',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-lg',
    card: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const styles = cn(
    baseStyles,
    variantStyles[variant],
    animationStyles[animation],
    className
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return <div className={styles} style={style} {...props} />;
};

export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="card" className="h-24" />
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton variant="circle" className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-4">
    <div className="flex gap-4">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-8 flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        {[...Array(columns)].map((_, j) => (
          <Skeleton key={j} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const LoginSkeleton: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
    <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-lg p-8 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <Skeleton variant="circle" className="h-14 w-14" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton variant="circle" className="h-8 w-8" />
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6">
    {[...Array(fields)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <Skeleton className="h-10 w-full" />
  </div>
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Skeleton.tsx" -Encoding UTF8
Write-Success "Skeleton.tsx atualizado"

# ============================================
# PARTE 6: LOADING BUTTON
# ============================================
Write-Step "PARTE 6/7: LOADING BUTTON"

Write-Info "Criando LoadingButton.tsx..."
@'
// frontend/src/components/ui/LoadingButton.tsx
import React, { useState } from 'react';
import { Button, ButtonProps } from './Button.js';
import { CheckCircle, XCircle } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
  successDuration?: number;
  errorDuration?: number;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  onSuccess,
  onError,
  successDuration = 2000,
  errorDuration = 3000,
  children,
  loadingText = 'Processando...',
  ...props
}) => {
  const [state, setState] = useState<ButtonState>('idle');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === 'loading') return;

    setState('loading');

    try {
      if (onClick) {
        await onClick(e);
      }
      setState('success');
      onSuccess?.();

      const id = setTimeout(() => {
        setState('idle');
      }, successDuration);
      setTimeoutId(id);
    } catch (error) {
      setState('error');
      onError?.();

      const id = setTimeout(() => {
        setState('idle');
      }, errorDuration);
      setTimeoutId(id);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const getButtonContent = () => {
    if (state === 'loading') return loadingText || children;
    if (state === 'success') return <><CheckCircle className="mr-2 h-4 w-4" /> Concluído</>;
    if (state === 'error') return <><XCircle className="mr-2 h-4 w-4" /> Erro</>;
    return children;
  };

  const getVariant = (): ButtonProps['variant'] => {
    if (state === 'success') return 'success';
    if (state === 'error') return 'destructive';
    return props.variant || 'default';
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      loading={state === 'loading'}
      variant={getVariant()}
      disabled={state === 'loading' || props.disabled}
      className={`
        ${state === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
        ${state === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        ${props.className || ''}
      `}
    >
      {getButtonContent()}
    </Button>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\LoadingButton.tsx" -Encoding UTF8
Write-Success "LoadingButton.tsx criado"

# ============================================
# PARTE 7: TOAST E AUTH CONTEXT
# ============================================
Write-Step "PARTE 7/7: TOAST E AUTH CONTEXT ATUALIZADO"

Write-Info "Criando Toast.tsx..."
@'
// frontend/src/components/ui/Toast.tsx
import React from 'react';
import { toast, ToastOptions } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastConfig: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#1f2937',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    maxWidth: '440px',
  },
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-green-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Sucesso</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-red-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Erro</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options, duration: 6000 }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-yellow-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Atenção</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-blue-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Info</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...toastConfig, ...options });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Toast.tsx" -Encoding UTF8
Write-Success "Toast.tsx criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/5 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/ui/Spinner.tsx"
Write-Info "  • frontend/src/components/ui/Progress.tsx"
Write-Info "  • frontend/src/components/ui/PageLoader.tsx"
Write-Info "  • frontend/src/components/ui/Button.tsx (atualizado)"
Write-Info "  • frontend/src/components/ui/Skeleton.tsx (atualizado)"
Write-Info "  • frontend/src/components/ui/LoadingButton.tsx"
Write-Info "  • frontend/src/components/ui/Toast.tsx"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste loading states em login e registro" -ForegroundColor White
Write-Info "  3. Teste skeletons em diferentes telas" -ForegroundColor White
Write-Info "  4. Teste toasts com diferentes tipos" -ForegroundColor White

Write-Success "🎉 Parte 1/5 concluída com sucesso!"