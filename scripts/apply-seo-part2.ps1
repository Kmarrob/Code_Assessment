# scripts/apply-seo-part2.ps1
# Script para implementar SEO & Semântica - Parte 2/4 (Meta Tags e SEO Dinâmico)

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
Write-Host "║     PARTE 2/4 - META TAGS E SEO DINÂMICO                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: USE SEO HOOK
# ============================================
Write-Step "PARTE 1/3: USE SEO HOOK"

Write-Info "Criando useSEO.ts..."
@'
// frontend/src/hooks/useSEO.ts
import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const defaultSEO: SEOProps = {
  title: 'Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001',
  description: 'Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001.',
  keywords: ['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade'],
  ogTitle: 'Code_Assessment - Avaliação de Maturidade ISO 27001',
  ogDescription: 'Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001.',
  twitterCard: 'summary_large_image',
};

export function useSEO(props: Partial<SEOProps> = {}) {
  const seo = { ...defaultSEO, ...props };

  useEffect(() => {
    document.title = seo.title;
    updateMetaTag('description', seo.description);

    if (seo.keywords) {
      updateMetaTag('keywords', seo.keywords.join(', '));
    }

    updateLinkTag('canonical', seo.canonical || window.location.href);

    if (seo.noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    updateMetaTag('og:title', seo.ogTitle || seo.title);
    updateMetaTag('og:description', seo.ogDescription || seo.description);
    updateMetaTag('og:image', seo.ogImage || 'https://code-assessment.com/og-image.jpg');
    updateMetaTag('og:url', seo.ogUrl || window.location.href);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'Code_Assessment');

    updateMetaTag('twitter:card', seo.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seo.twitterTitle || seo.ogTitle || seo.title);
    updateMetaTag('twitter:description', seo.twitterDescription || seo.ogDescription || seo.description);
    updateMetaTag('twitter:image', seo.twitterImage || seo.ogImage || 'https://code-assessment.com/og-image.jpg');
  }, [seo]);
}

function updateMetaTag(name: string, content: string | undefined) {
  if (!content) return;

  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string | undefined) {
  if (!href) return;

  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useSEO.ts" -Encoding UTF8
Write-Success "useSEO.ts criado"

# ============================================
# PARTE 2: META TAGS COMPONENT
# ============================================
Write-Step "PARTE 2/3: META TAGS COMPONENT"

Write-Info "Criando MetaTags.tsx..."
@'
// frontend/src/components/MetaTags.tsx
import React from 'react';
import { useSEO, SEOProps } from '../hooks/useSEO.js';

export interface MetaTagsProps extends SEOProps {
  children?: React.ReactNode;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  children,
  ...seoProps
}) => {
  useSEO(seoProps);
  return <>{children}</>;
};

export const HomeMetaTags: React.FC = () => (
  <MetaTags
    title="Code_Assessment - Avaliação de Maturidade ISO 27001"
    description="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001. Gerencie controles, usuários e relatórios em um só lugar."
    keywords={['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade', 'Controles']}
    ogTitle="Code_Assessment - Avaliação de Maturidade ISO 27001"
    ogDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
  />
);

export const LoginMetaTags: React.FC = () => (
  <MetaTags
    title="Login - Code_Assessment"
    description="Faça login no Code_Assessment para acessar o sistema de avaliação de maturidade ISO 27001."
    keywords={['login', 'acesso', 'autenticação']}
    ogTitle="Login - Code_Assessment"
    ogDescription="Faça login no Code_Assessment para acessar o sistema de avaliação de maturidade ISO 27001."
    noIndex
  />
);

export const RegisterMetaTags: React.FC = () => (
  <MetaTags
    title="Cadastro - Code_Assessment"
    description="Cadastre-se no Code_Assessment e comece a avaliar a maturidade em Segurança da Informação da sua organização."
    keywords={['cadastro', 'registro', 'criar conta']}
    ogTitle="Cadastro - Code_Assessment"
    ogDescription="Cadastre-se no Code_Assessment e comece a avaliar a maturidade em Segurança da Informação."
    noIndex
  />
);

export const DashboardMetaTags: React.FC<{ role?: string }> = ({ role }) => (
  <MetaTags
    title={`Dashboard ${role ? `- ${role.charAt(0).toUpperCase() + role.slice(1)}` : ''} - Code_Assessment`}
    description="Dashboard do Code_Assessment com métricas e indicadores de maturidade em Segurança da Informação."
    keywords={['dashboard', 'métricas', 'indicadores', 'maturidade']}
    ogTitle="Dashboard - Code_Assessment"
    ogDescription="Dashboard com métricas e indicadores de maturidade em Segurança da Informação."
    noIndex
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\MetaTags.tsx" -Encoding UTF8
Write-Success "MetaTags.tsx criado"

# ============================================
# PARTE 3: ATUALIZAR PÁGINAS
# ============================================
Write-Step "PARTE 3/3: ATUALIZAR PÁGINAS"

# 3.1 - LandingPage
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
import { MetaTags } from '../components/MetaTags.js';

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
    <>
      <MetaTags
        title="Code_Assessment - Avaliação de Maturidade ISO 27001"
        description="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001. Gerencie controles, usuários e relatórios em um só lugar."
        keywords={['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade', 'Controles']}
        ogTitle="Code_Assessment - Avaliação de Maturidade ISO 27001"
        ogDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
        ogImage="https://code-assessment.com/og-image.jpg"
        twitterCard="summary_large_image"
        twitterTitle="Code_Assessment - Avaliação de Maturidade ISO 27001"
        twitterDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
      />

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
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LandingPage.tsx" -Encoding UTF8
Write-Success "LandingPage.tsx atualizado"

# 3.2 - LoginPage
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
import { LoginMetaTags } from '../components/MetaTags.js';

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
    <>
      <LoginMetaTags />
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
          </section>
        </Container>
      </main>
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LoginPage.tsx" -Encoding UTF8
Write-Success "LoginPage.tsx atualizado"

# 3.3 - RegisterPage
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
import { RegisterMetaTags } from '../components/MetaTags.js';

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
    <>
      <RegisterMetaTags />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
        <Container size="sm">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
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
    </>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RegisterPage.tsx" -Encoding UTF8
Write-Success "RegisterPage.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/hooks/useSEO.ts"
Write-Info "  • frontend/src/components/MetaTags.tsx"
Write-Info "  • frontend/src/pages/LandingPage.tsx"
Write-Info "  • frontend/src/pages/LoginPage.tsx"
Write-Info "  • frontend/src/pages/RegisterPage.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ useSEO Hook para gerenciamento dinâmico" -ForegroundColor White
Write-Info "  ✅ Componente MetaTags reutilizável" -ForegroundColor White
Write-Info "  ✅ Meta tags dinâmicas por página" -ForegroundColor White
Write-Info "  ✅ Open Graph tags para compartilhamento" -ForegroundColor White
Write-Info "  ✅ Twitter Cards configurados" -ForegroundColor White
Write-Info "  ✅ Canonical tags dinâmicas" -ForegroundColor White
Write-Info "  ✅ Robots meta tag (noIndex para páginas sensíveis)" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Inspecione o head da página para ver as meta tags" -ForegroundColor White
Write-Info "  3. Teste compartilhamento no Facebook/Twitter" -ForegroundColor White

Write-Success "🎉 Parte 2/4 concluída com sucesso!"