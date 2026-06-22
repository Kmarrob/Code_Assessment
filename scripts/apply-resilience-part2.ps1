# scripts/apply-resilience-part2.ps1
# Script para implementar Frontend - Error Boundaries e Fallbacks (Pilar 3 - Parte 2/4)

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
Write-Host "║     CODE_ASSESSMENT - RESILIÊNCIA (PILAR 3)                 ║" -ForegroundColor Cyan
Write-Host "║     PARTE 2/4 - FRONTEND - ERROR BOUNDARIES E FALLBACKS    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Step "PARTE 1/3: INSTALANDO DEPENDÊNCIAS"

Write-Info "Instalando react-error-boundary..."
Push-Location "$BaseDir\frontend"
npm install react-error-boundary --save
Pop-Location
Write-Success "react-error-boundary instalado"

# ============================================
# PARTE 2: ERROR BOUNDARY
# ============================================
Write-Step "PARTE 2/3: CRIANDO ERROR BOUNDARY"

Write-Info "Criando ErrorBoundary.tsx..."
@'
// frontend/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button.js';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.handleReset();
      }
    }
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
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo deu errado
            </h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.
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
                Ir para o início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    resetError,
    hasError: error !== null,
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ErrorBoundary.tsx" -Encoding UTF8
Write-Success "ErrorBoundary.tsx criado"

# ============================================
# PARTE 3: SKELETON E FALLBACKS
# ============================================
Write-Step "PARTE 3/3: CRIANDO SKELETON E FALLBACKS"

# 3.1 - Skeleton
Write-Info "Criando Skeleton.tsx..."
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
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Skeleton.tsx" -Encoding UTF8
Write-Success "Skeleton.tsx criado"

# 3.2 - Fallback
Write-Info "Criando Fallback.tsx..."
@'
// frontend/src/components/ui/Fallback.tsx
import React from 'react';
import { Button } from './Button.js';
import { 
  AlertCircle, 
  WifiOff, 
  ServerOff, 
  ShieldOff,
  RefreshCw,
  Home,
  LogIn
} from 'lucide-react';

interface FallbackProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const Fallback: React.FC<FallbackProps> = ({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro ao carregar o conteúdo.',
  icon,
  actionLabel = 'Tentar novamente',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="max-w-md w-full text-center p-8">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          {icon || <AlertCircle className="h-12 w-12 text-gray-600" />}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} className="gap-2">
            <Home className="h-4 w-4" />
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  </div>
);

export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Fallback
    title="Erro de conexão"
    message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
    icon={<WifiOff className="h-12 w-12 text-yellow-600" />}
    actionLabel="Tentar novamente"
    onAction={onRetry}
  />
);

export const ServerErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Fallback
    title="Erro no servidor"
    message="O servidor está temporariamente indisponível. Tente novamente mais tarde."
    icon={<ServerOff className="h-12 w-12 text-red-600" />}
    actionLabel="Tentar novamente"
    onAction={onRetry}
  />
);

export const AuthErrorFallback: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => (
  <Fallback
    title="Sessão expirada"
    message="Sua sessão expirou. Por favor, faça login novamente."
    icon={<ShieldOff className="h-12 w-12 text-orange-600" />}
    actionLabel="Fazer login"
    onAction={onLogin}
    secondaryActionLabel="Ir para o início"
    onSecondaryAction={() => window.location.href = '/'}
  />
);

export const NotFoundFallback: React.FC = () => (
  <Fallback
    title="Página não encontrada"
    message="A página que você está procurando não existe ou foi removida."
    icon={<AlertCircle className="h-12 w-12 text-gray-600" />}
    actionLabel="Ir para o início"
    onAction={() => window.location.href = '/'}
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Fallback.tsx" -Encoding UTF8
Write-Success "Fallback.tsx criado"

# 3.3 - SuspenseWrapper
Write-Info "Criando SuspenseWrapper.tsx..."
@'
// frontend/src/components/SuspenseWrapper.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary.js';
import { PageSkeleton } from './ui/Skeleton.js';
import { ServerErrorFallback } from './ui/Fallback.js';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <PageSkeleton />,
  errorFallback,
  onError,
}) => (
  <ErrorBoundary
    fallback={errorFallback || <ServerErrorFallback onRetry={() => window.location.reload()} />}
    onError={onError}
  >
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: () => Promise<T>;
  reset: () => void;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const reset = React.useCallback(() => {
    setData(null);
    setIsLoading(true);
    setError(null);
  }, []);

  React.useEffect(() => {
    execute();
  }, dependencies);

  return { data, isLoading, error, execute, reset };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\SuspenseWrapper.tsx" -Encoding UTF8
Write-Success "SuspenseWrapper.tsx criado"

# 3.4 - Atualizar App.tsx
Write-Info "Atualizando App.tsx..."
@'
// frontend/src/App.tsx (versão atualizada)
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { SuspenseWrapper } from './components/SuspenseWrapper.js';
import { AuthErrorFallback, ServerErrorFallback } from './components/ui/Fallback.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { UserRole } from './types/index.js';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard.js'));
const RepDashboard = lazy(() => import('./pages/RepDashboard.js'));
const ConsultantDashboard = lazy(() => import('./pages/ConsultantDashboard.js'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.js'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary
            fallback={<AuthErrorFallback onLogin={() => window.location.href = '/login'} />}
          >
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
            <SuspenseWrapper>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={[UserRole.REP, UserRole.ADMIN]} />}>
                  <Route path="/rep" element={<RepDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={[UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                  <Route path="/consultant" element={<ConsultantDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.REP, UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SuspenseWrapper>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
'@ | Out-File -FilePath "$BaseDir\frontend\src\App.tsx" -Encoding UTF8
Write-Success "App.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/ErrorBoundary.tsx"
Write-Info "  • frontend/src/components/ui/Skeleton.tsx"
Write-Info "  • frontend/src/components/ui/Fallback.tsx"
Write-Info "  • frontend/src/components/SuspenseWrapper.tsx"
Write-Info "  • frontend/src/App.tsx (atualizado)"
Write-Info "  • react-error-boundary instalado"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste ErrorBoundary: simule um erro em um componente" -ForegroundColor White
Write-Info "  3. Teste Skeleton: veja os loading states" -ForegroundColor White
Write-Info "  4. Teste Fallbacks: desconecte a internet" -ForegroundColor White

Write-Success "🎉 Parte 2/4 concluída com sucesso!"