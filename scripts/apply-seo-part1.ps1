# scripts/apply-seo-part1.ps1
# Script para implementar SEO & Semântica - Parte 1/4 (HTML Semântico e Headings)

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
Write-Host "║     CODE_ASSESSMENT - SEO & SEMÂNTICA (PILAR 6)            ║" -ForegroundColor Cyan
Write-Host "║     PARTE 1/4 - HTML SEMÂNTICO E HEADINGS                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: INDEX.HTML
# ============================================
Write-Step "PARTE 1/4: INDEX.HTML"

Write-Info "Atualizando index.html..."
@'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
# PARTE 2: APP.TSX
# ============================================
Write-Step "PARTE 2/4: APP.TSX"

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
# PARTE 3: LANDING PAGE
# ============================================
Write-Step "PARTE 3/4: LANDING PAGE"

Write-Info "Atualizando LandingPage.tsx..."
@'
// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { 
  Shield, Users, BarChart3, Zap, 
  ArrowRight, FileText, PieChart, 
  TrendingUp, Layers, Award, Database
} from 'lucide-react';
import { FadeTransition } from '../components/ui/Transition.js';
import { Typewriter } from '../components/ui/MicroInteractions.js';
import { Grid, GridItem } from '../components/ui/Grid.js';

const features = [
  {
    icon: FileText,
    title: '93 Controles ISO 27002',
    description: 'Avaliação completa dos controles da norma ISO/IEC 27002:2022 com metodologia estruturada.',
  },
  {
    icon: PieChart,
    title: 'Dashboards Avançados',
    description: '8 visualizações analíticas: CID, NIST, Categorização, Domínios de SI e muito mais.',
  },
  {
    icon: TrendingUp,
    title: 'Matriz de Priorização',
    description: 'Classifique riscos por probabilidade e impacto para orientar ações corretivas.',
  },
  {
    icon: Layers,
    title: 'NIST Framework',
    description: 'Mapeamento automático para os conceitos de Segurança Cibernética do NIST.',
  },
  {
    icon: Award,
    title: 'Benchmarking',
    description: 'Compare o nível de maturidade da sua organização com o mercado.',
  },
  {
    icon: Database,
    title: 'Multi-tenant Seguro',
    description: 'Dados isolados por empresa com controle de acesso granular por perfis.',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900">Code_Assessment</span>
          </div>
          <nav aria-label="Navegação principal">
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Começar</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section 
          className="container mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-32"
          aria-labelledby="hero-title"
        >
          <div className="max-w-4xl mx-auto text-center">
            <FadeTransition show={true}>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Transforme seu assessment manual em digital
              </div>
            </FadeTransition>

            <h1 id="hero-title" className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Avalie sua maturidade em
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                <Typewriter
                  text="Segurança da Informação"
                  speed={100}
                  delay={1000}
                />
              </span>
            </h1>

            <FadeTransition show={true}>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Automatize o processo de assessment baseado na ISO 27001, com gestão de usuários,
                controles e relatórios em tempo real.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-base">
                    Iniciar Agora
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </FadeTransition>
          </div>
        </section>

        <section 
          className="py-16 bg-white"
          aria-labelledby="features-title"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="features-title" className="text-3xl font-bold text-gray-900 mb-4">
                Funcionalidades Completas
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para um assessment profissional
              </p>
            </div>
            <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap={8}>
              {features.map((feature) => (
                <GridItem key={feature.title}>
                  <article className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <feature.icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                </GridItem>
              ))}
            </Grid>
          </div>
        </section>

        <section 
          className="py-16 gradient-primary text-white"
          aria-labelledby="cta-title"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-title" className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8">
              Cadastre-se agora e transforme seu processo de assessment em uma experiência digital e eficiente.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-primary-700 hover:text-primary-800">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Code_Assessment. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LandingPage.tsx" -Encoding UTF8
Write-Success "LandingPage.tsx atualizado"

# ============================================
# PARTE 4: LOGIN PAGE
# ============================================
Write-Step "PARTE 4/4: LOGIN PAGE"

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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Container size="sm">
        <section aria-labelledby="login-title">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle id="login-title" className="text-2xl font-bold">
                Bem-vindo de volta
              </CardTitle>
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
                    aria-describedby="email-description"
                  />
                  
                  <PasswordInput
                    label="Senha"
                    placeholder="••••••••"
                    showStrength={false}
                    error={errors.password?.message}
                    {...register('password')}
                    autoComplete="current-password"
                    aria-describedby="password-description"
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
        </section>
      </Container>
    </main>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LoginPage.tsx" -Encoding UTF8
Write-Success "LoginPage.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/4 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • frontend/index.html"
Write-Info "  • frontend/src/App.tsx"
Write-Info "  • frontend/src/pages/LandingPage.tsx"
Write-Info "  • frontend/src/pages/LoginPage.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Tags HTML5 semânticas (header, main, section, article, footer)" -ForegroundColor White
Write-Info "  ✅ Hierarquia correta de headings (H1 → H2 → H3)" -ForegroundColor White
Write-Info "  ✅ Nav com aria-label" -ForegroundColor White
Write-Info "  ✅ Main com id para skip link" -ForegroundColor White
Write-Info "  ✅ Meta tags básicas (title, description)" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Verifique a estrutura HTML com as ferramentas de desenvolvedor" -ForegroundColor White
Write-Info "  3. Verifique as tags semânticas (header, main, section, article)" -ForegroundColor White

Write-Success "🎉 Parte 1/4 concluída com sucesso!"