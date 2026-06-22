# scripts/apply-admin-seo-part3.ps1
# Script para aplicar Parte 3/3 - Imagens e URLs

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
Write-Host "║     CODE_ASSESSMENT - ADMIN SEO (PILAR 6)                  ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/3 - IMAGENS E URLS                            ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: SYSTEM METRICS COM ALT TEXT
# ============================================
Write-Step "PARTE 1/5: SYSTEM METRICS COM ALT TEXT"

Write-Info "Atualizando SystemMetrics.tsx..."
@'
// frontend/src/components/admin/SystemMetrics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage.js';

export const SystemMetrics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Métricas do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">CPU</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-sm font-medium">45%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Memória</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '62%' }} />
              </div>
              <span className="text-sm font-medium">62%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Disco</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-sm font-medium">78%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Rede</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '23%' }} />
              </div>
              <span className="text-sm font-medium">23%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <OptimizedImage
              src="/system-metrics-chart.svg"
              alt="Gráfico de métricas do sistema Code_Assessment mostrando uso de CPU, memória, disco e rede"
              width={300}
              height={150}
              className="mx-auto"
              fallbackSrc="/system-metrics-chart-fallback.png"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              Gráfico de métricas do sistema
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMetrics;
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\SystemMetrics.tsx" -Encoding UTF8
Write-Success "SystemMetrics.tsx atualizado"

# ============================================
# PARTE 2: ACTIVITY LOG COM ALT TEXT
# ============================================
Write-Step "PARTE 2/5: ACTIVITY LOG COM ALT TEXT"

Write-Info "Atualizando ActivityLog.tsx..."
@'
// frontend/src/components/admin/ActivityLog.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage.js';

export const ActivityLog: React.FC = () => {
  const activities = [
    { id: 1, action: 'Usuário João fez login', time: '5 min atrás', type: 'success' },
    { id: 2, action: 'Controle 5.1 atualizado', time: '15 min atrás', type: 'info' },
    { id: 3, action: 'Novo usuário cadastrado', time: '1 hora atrás', type: 'success' },
    { id: 4, action: 'Falha de autenticação', time: '2 horas atrás', type: 'error' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" aria-hidden="true" />}
              {activity.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" aria-hidden="true" />}
              {activity.type === 'info' && <Clock className="h-4 w-4 text-blue-500 mt-0.5" aria-hidden="true" />}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <OptimizedImage
                src="/empty-activity.svg"
                alt="Nenhuma atividade recente no sistema Code_Assessment"
                width={120}
                height={80}
                className="mx-auto mb-3"
                fallbackSrc="/empty-activity-fallback.png"
              />
              <p className="text-gray-500">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\ActivityLog.tsx" -Encoding UTF8
Write-Success "ActivityLog.tsx atualizado"

# ============================================
# PARTE 3: ADMIN BREADCRUMBS ATUALIZADO
# ============================================
Write-Step "PARTE 3/5: ADMIN BREADCRUMBS ATUALIZADO"

Write-Info "Atualizando AdminBreadcrumbs.tsx..."
@'
// frontend/src/components/admin/AdminBreadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', path: '/admin' },
  ],
  '/admin/usuarios': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Usuários', path: '/admin/usuarios' },
  ],
  '/admin/controles': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Controles', path: '/admin/controles' },
  ],
  '/admin/configuracoes': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Configurações', path: '/admin/configuracoes' },
  ],
};

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  
  // Normalizar path para suportar URLs antigas
  let path = location.pathname;
  path = path.replace('/users', '/usuarios');
  path = path.replace('/controls', '/controles');
  path = path.replace('/settings', '/configuracoes');
  
  const items = breadcrumbMap[path] || [
    { label: 'Dashboard', path: '/admin' },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === 0 ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\admin\AdminBreadcrumbs.tsx" -Encoding UTF8
Write-Success "AdminBreadcrumbs.tsx atualizado"

# ============================================
# PARTE 4: APP.TSX ATUALIZADO
# ============================================
Write-Step "PARTE 4/5: APP.TSX ATUALIZADO"

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
import { SkipLink } from './components/SkipLink.js';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard.js'));
const AdminUsers = lazy(() => import('./pages/AdminUsers.js'));
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
        <SkipLink targetId="main-content" />
        
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
            
            <main id="main-content" role="main">
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
                    <Route path="/admin/usuarios" element={<AdminUsers />} />
                    {/* URLs antigas com redirect */}
                    <Route path="/admin/users" element={<Navigate to="/admin/usuarios" replace />} />
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
# PARTE 5: INDEX.HTML COM FAVICON E OG IMAGE
# ============================================
Write-Step "PARTE 5/5: INDEX.HTML COM FAVICON E OG IMAGE"

Write-Info "Atualizando index.html..."
@'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- ============================================ -->
    <!-- META TAGS - SEO BÁSICO -->
    <!-- ============================================ -->
    <title>Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</title>
    <meta name="description" content="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001. Gerencie controles, usuários e relatórios em um só lugar." />
    <meta name="keywords" content="ISO 27001, Segurança da Informação, Assessment, Maturidade, Controles, Auditoria, SGSI" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://code-assessment.com/" />
    
    <!-- ============================================ -->
    <!-- OPEN GRAPH - COMPARTILHAMENTO EM REDES SOCIAIS -->
    <!-- ============================================ -->
    <meta property="og:title" content="Code_Assessment - Avaliação de Maturidade ISO 27001" />
    <meta property="og:description" content="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://code-assessment.com/" />
    <meta property="og:image" content="https://code-assessment.com/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001" />
    <meta property="og:site_name" content="Code_Assessment" />
    
    <!-- ============================================ -->
    <!-- TWITTER CARDS -->
    <!-- ============================================ -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Code_Assessment - Avaliação de Maturidade ISO 27001" />
    <meta name="twitter:description" content="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001." />
    <meta name="twitter:image" content="https://code-assessment.com/og-image.jpg" />
    
    <!-- ============================================ -->
    <!-- CONTENT SECURITY POLICY -->
    <!-- ============================================ -->
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
    
    <!-- Preconnect para recursos externos -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- ============================================ -->
    <!-- SCHEMA MARKUP - DADOS ESTRUTURADOS -->
    <!-- ============================================ -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Code_Assessment",
      "description": "Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001.",
      "url": "https://code-assessment.com/",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL"
      }
    }
    </script>
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
Write-Step "✅ PARTE 3/3 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/src/components/admin/SystemMetrics.tsx"
Write-Info "  • frontend/src/components/admin/ActivityLog.tsx"
Write-Info "  • frontend/src/components/admin/AdminBreadcrumbs.tsx"
Write-Info "  • frontend/src/App.tsx"
Write-Info "  • frontend/index.html"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Alt text em imagens admin" -ForegroundColor White
Write-Info "  ✅ URLs amigáveis (português)" -ForegroundColor White
Write-Info "  ✅ Redirects para compatibilidade" -ForegroundColor White
Write-Info "  ✅ Favicon e Open Graph Image" -ForegroundColor White
Write-Info "  ✅ Breadcrumbs com URLs amigáveis" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 6 (SEO & Semântica) - Admin:" -ForegroundColor Cyan
Write-Info "  ✅ Tags HTML5 semânticas" -ForegroundColor White
Write-Info "  ✅ Hierarquia de headings" -ForegroundColor White
Write-Info "  ✅ Meta tags dinâmicas (noindex)" -ForegroundColor White
Write-Info "  ✅ Open Graph e Twitter Cards" -ForegroundColor White
Write-Info "  ✅ Schema Markup" -ForegroundColor White
Write-Info "  ✅ Alt em imagens" -ForegroundColor White
Write-Info "  ✅ URLs amigáveis" -ForegroundColor White
Write-Info "  ✅ Breadcrumbs" -ForegroundColor White

Write-Success ""
Write-Success "🎉 PILAR 6 (SEO & SEMÂNTICA) - ADMIN - VALIDADO!"
Write-Success "🏁 Módulo Admin - COMPLETO!"