# scripts/apply-performance-part3.ps1
# Script para implementar Velocidade & Performance - Parte 3/4 (Memoização e Lazy Loading)

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
Write-Host "║     CODE_ASSESSMENT - VELOCIDADE & PERFORMANCE (PILAR 5)   ║" -ForegroundColor Cyan
Write-Host "║     PARTE 3/4 - FRONTEND - MEMOIZAÇÃO E LAZY LOADING      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Step "PARTE 1/5: INSTALANDO DEPENDÊNCIAS"

Write-Info "Instalando vite-plugin-bundle-visualizer..."
Push-Location "$BaseDir\frontend"
npm install -D vite-plugin-bundle-visualizer
Pop-Location
Write-Success "vite-plugin-bundle-visualizer instalado"

# ============================================
# PARTE 2: VITE CONFIG
# ============================================
Write-Step "PARTE 2/5: VITE CONFIG COM BUNDLE ANALYZER"

Write-Info "Atualizando vite.config.ts..."
@'
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'vite-plugin-bundle-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'react-hot-toast',
          ],
          'data-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            'axios',
          ],
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
'@ | Out-File -FilePath "$BaseDir\frontend\vite.config.ts" -Encoding UTF8
Write-Success "vite.config.ts atualizado"

# ============================================
# PARTE 3: MEMOIZED CARD
# ============================================
Write-Step "PARTE 3/5: MEMOIZED CARD"

Write-Info "Criando MemoizedCard.tsx..."
@'
// frontend/src/components/ui/MemoizedCard.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface MemoizedCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const MemoizedCard = React.memo(({
  title,
  description,
  icon,
  className,
  children,
  onClick,
}: MemoizedCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer hover:border-primary-300',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {children}
    </div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\MemoizedCard.tsx" -Encoding UTF8
Write-Success "MemoizedCard.tsx criado"

# ============================================
# PARTE 4: USE MEMOIZED HOOK
# ============================================
Write-Step "PARTE 4/5: USE MEMOIZED HOOK"

Write-Info "Criando useMemoized.ts..."
@'
// frontend/src/hooks/useMemoized.ts
import { useMemo, useCallback, useRef, useEffect } from 'react';

export function useMemoized<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export function useMemoizedComponent<P>(
  Component: React.ComponentType<P>,
  props: P,
  deps: React.DependencyList
): React.ReactElement {
  return useMemo(() => React.createElement(Component, props), deps);
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useMemoized.ts" -Encoding UTF8
Write-Success "useMemoized.ts criado"

# ============================================
# PARTE 5: APP COM LAZY LOADING
# ============================================
Write-Step "PARTE 5/5: APP COM LAZY LOADING"

Write-Info "Atualizando App.tsx..."
@'
// frontend/src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { UserRole } from './types/index.js';
import { PageLoader } from './components/ui/PageLoader.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { AuthErrorFallback } from './components/ui/Fallback.js';
import { SuspenseWrapper } from './components/SuspenseWrapper.js';

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
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
Write-Step "✅ PARTE 3/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/vite.config.ts"
Write-Info "  • frontend/src/components/ui/MemoizedCard.tsx"
Write-Info "  • frontend/src/hooks/useMemoized.ts"
Write-Info "  • frontend/src/App.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ React.memo para componentes" -ForegroundColor White
Write-Info "  ✅ useMemo e useCallback com dependências" -ForegroundColor White
Write-Info "  ✅ Lazy Loading para rotas" -ForegroundColor White
Write-Info "  ✅ Code Splitting configurado" -ForegroundColor White
Write-Info "  ✅ Bundle Analyzer instalado" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Verifique o bundle visualizer: npm run build" -ForegroundColor White
Write-Info "  3. Verifique o lazy loading: abra o Network tab" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"