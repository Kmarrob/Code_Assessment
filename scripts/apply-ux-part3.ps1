# scripts/apply-ux-part3.ps1
# Script para implementar UX & Usabilidade - Parte 3/5 (Acessibilidade)

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
Write-Host "║     PARTE 3/5 - ACESSIBILIDADE                              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: CSS ACESSÍVEL
# ============================================
Write-Step "PARTE 1/6: CSS ACESSÍVEL"

Write-Info "Atualizando index.css..."
@'
/* frontend/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: "Inter", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 16px;
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
  }
}

@layer components {
  .glass-card {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .gradient-primary {
    background-image: linear-gradient(to right, #2563eb, #1d4ed8);
  }

  .loading-spinner {
    display: inline-block;
    height: 2rem;
    width: 2rem;
    animation: spin 1s linear infinite;
    border-radius: 9999px;
    border: 4px solid #2563eb;
    border-top-color: transparent;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}

/* ============================================
   FOCUS VISIBLE - Acessibilidade
   ============================================ */

:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 2px;
}

.dark :focus-visible {
  outline-color: #60a5fa;
}

.skip-link {
  position: absolute;
  top: -9999px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  z-index: 1000;
  font-weight: 600;
  font-size: 0.875rem;
}

.skip-link:focus {
  top: 1rem;
  outline: 2px solid white;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ============================================
   CONTRASTE - WCAG AA
   ============================================ */

.text-gray-900 {
  color: #111827;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-600 {
  color: #4b5563;
}

.text-primary-600 {
  color: #2563eb;
}

.bg-primary-600 {
  background-color: #2563eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

/* ============================================
   ARIA - Live Regions
   ============================================ */

.aria-live-polite {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ============================================
   FONT SIZES - Legibilidade
   ============================================ */

.text-xs {
  font-size: 0.75rem;
}

p,
li,
label,
button,
input,
select,
textarea {
  line-height: 1.6;
}

/* ============================================
   ANIMAÇÕES ACESSÍVEIS
   ============================================ */

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\index.css" -Encoding UTF8
Write-Success "index.css atualizado"

# ============================================
# PARTE 2: SKIP LINK
# ============================================
Write-Step "PARTE 2/6: SKIP LINK"

Write-Info "Criando SkipLink.tsx..."
@'
// frontend/src/components/SkipLink.tsx
import React from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Pular para o conteúdo principal',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
      aria-label={label}
    >
      {label}
    </a>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\SkipLink.tsx" -Encoding UTF8
Write-Success "SkipLink.tsx criado"

# ============================================
# PARTE 3: ACCESSIBLE CARD
# ============================================
Write-Step "PARTE 3/6: ACCESSIBLE CARD"

Write-Info "Criando AccessibleCard.tsx..."
@'
// frontend/src/components/ui/AccessibleCard.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  as?: 'article' | 'section' | 'div';
  labelledBy?: string;
  describedBy?: string;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  description,
  as: Component = 'div',
  labelledBy,
  describedBy,
  children,
  className,
  ...props
}) => {
  const id = React.useId();
  const titleId = labelledBy || `${id}-title`;
  const descId = describedBy || `${id}-desc`;

  return (
    <Component
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      role="article"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      {...props}
    >
      {title && (
        <div className="p-6 pb-0">
          <h3 id={titleId} className="text-lg font-semibold">
            {title}
          </h3>
        </div>
      )}
      {description && (
        <div className="px-6 pt-1">
          <p id={descId} className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      )}
      <div className="p-6">{children}</div>
    </Component>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\AccessibleCard.tsx" -Encoding UTF8
Write-Success "AccessibleCard.tsx criado"

# ============================================
# PARTE 4: ACCESSIBLE NAV
# ============================================
Write-Step "PARTE 4/6: ACCESSIBLE NAV"

Write-Info "Criando AccessibleNav.tsx..."
@'
// frontend/src/components/AccessibleNav.tsx
import React from 'react';
import { cn } from '../utils/helpers.js';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface AccessibleNavProps {
  items: NavItem[];
  label?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onItemClick?: (item: NavItem, index: number) => void;
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  items,
  label = 'Navegação principal',
  className,
  orientation = 'horizontal',
  onItemClick,
}) => {
  const id = React.useId();

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1',
        className
      )}
      aria-label={label}
      role="navigation"
    >
      <ul
        className={cn(
          'flex list-none p-0 m-0',
          orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1'
        )}
        role="menubar"
        aria-label={label}
      >
        {items.map((item, index) => (
          <li
            key={index}
            role="none"
            className="list-none"
          >
            <a
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'hover:bg-gray-100 hover:text-gray-900',
                item.active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
              role="menuitem"
              aria-current={item.active ? 'page' : undefined}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick(e);
                }
                if (onItemClick) {
                  e.preventDefault();
                  onItemClick(item, index);
                }
              }}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\AccessibleNav.tsx" -Encoding UTF8
Write-Success "AccessibleNav.tsx criado"

# ============================================
# PARTE 5: LIVE REGION
# ============================================
Write-Step "PARTE 5/6: LIVE REGION"

Write-Info "Criando LiveRegion.tsx..."
@'
// frontend/src/components/LiveRegion.tsx
import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive';
  children?: React.ReactNode;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  children,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      regionRef.current.textContent = message;
    }
  }, [message]);

  if (children) {
    return (
      <div
        ref={regionRef}
        className="aria-live-polite"
        role="status"
        aria-live={politeness}
        aria-atomic="true"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={regionRef}
      className="aria-live-polite"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    />
  );
};

export function useAccessibilityMessage() {
  const [message, setMessage] = React.useState<string>('');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const announce = React.useCallback((text: string, duration: number = 3000) => {
    setMessage(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, duration);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    announce,
    LiveRegion: () => <LiveRegion message={message} />,
  };
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\LiveRegion.tsx" -Encoding UTF8
Write-Success "LiveRegion.tsx criado"

# ============================================
# PARTE 6: ATUALIZAR APP
# ============================================
Write-Step "PARTE 6/6: ATUALIZAR APP COM SKIPLINK"

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
import { SkipLink } from './components/SkipLink.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { SuspenseWrapper } from './components/SuspenseWrapper.js';
import { AuthErrorFallback } from './components/ui/Fallback.js';
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
          <SkipLink targetId="main-content" />
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
            <main id="main-content" role="main" className="min-h-screen">
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
            </main>
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
Write-Step "✅ PARTE 3/5 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/index.css (atualizado)"
Write-Info "  • frontend/src/components/SkipLink.tsx"
Write-Info "  • frontend/src/components/ui/AccessibleCard.tsx"
Write-Info "  • frontend/src/components/AccessibleNav.tsx"
Write-Info "  • frontend/src/components/LiveRegion.tsx"
Write-Info "  • frontend/src/App.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste navegação por teclado (Tab)" -ForegroundColor White
Write-Info "  3. Teste SkipLink (pressione Tab no início)" -ForegroundColor White
Write-Info "  4. Teste contraste e legibilidade" -ForegroundColor White
Write-Info "  5. Teste redução de movimento (prefers-reduced-motion)" -ForegroundColor White

Write-Success "🎉 Parte 3/5 concluída com sucesso!"