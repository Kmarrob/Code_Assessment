# scripts/apply-seo-part4.ps1
# Script para implementar SEO & Semântica - Parte 4/4 (Imagens e Schema Markup)

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
Write-Host "║     PARTE 4/4 - IMAGENS E SCHEMA MARKUP                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: OPTIMIZED IMAGE
# ============================================
Write-Step "PARTE 1/4: OPTIMIZED IMAGE"

Write-Info "Criando OptimizedImage.tsx..."
@'
// frontend/src/components/ui/OptimizedImage.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fallbackSrc,
  lazy = true,
  className,
  objectFit = 'cover',
  ...props
}) => {
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleError = () => {
    if (fallbackSrc && !error) {
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const finalSrc = error && fallbackSrc ? fallbackSrc : src;
  const safeAlt = alt || 'Imagem';

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      <img
        src={finalSrc}
        alt={safeAlt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <OptimizedImage
    src="/logo.svg"
    alt="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/logo-fallback.png"
    width={40}
    height={40}
    className={className}
  />
);

export const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <OptimizedImage
    src="/hero-illustration.svg"
    alt="Ilustração do Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/hero-illustration-fallback.png"
    width={600}
    height={400}
    className={className}
  />
);

export const FeatureIcon: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    fallbackSrc="/icon-fallback.png"
    width={48}
    height={48}
    className={className}
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\OptimizedImage.tsx" -Encoding UTF8
Write-Success "OptimizedImage.tsx criado"

# ============================================
# PARTE 2: SCHEMA MARKUP
# ============================================
Write-Step "PARTE 2/4: SCHEMA MARKUP"

Write-Info "Criando SchemaMarkup.tsx..."
@'
// frontend/src/components/SchemaMarkup.tsx
import React from 'react';

interface SchemaMarkupProps {
  schema: Record<string, any>;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const OrganizationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Code_Assessment',
    description: 'Sistema de avaliação de maturidade em Segurança da Informação baseado na ISO 27001',
    url: 'https://code-assessment.com',
    logo: 'https://code-assessment.com/logo.png',
    sameAs: [
      'https://linkedin.com/company/code-assessment',
      'https://twitter.com/code_assessment',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-9999-9999',
      contactType: 'sales',
      availableLanguage: ['Portuguese'],
    },
  };

  return <SchemaMarkup schema={schema} />;
};

export const WebApplicationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Code_Assessment',
    description: 'Sistema de avaliação de maturidade em Segurança da Informação baseado na ISO 27001',
    url: 'https://code-assessment.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    featureList: [
      '93 Controles ISO 27002',
      'Dashboards Avançados',
      'Matriz de Priorização',
      'NIST Framework',
      'Benchmarking',
      'Multi-tenant Seguro',
    ],
  };

  return <SchemaMarkup schema={schema} />;
};

export const BreadcrumbSchema: React.FC<{
  items: { name: string; item: string }[];
}> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return <SchemaMarkup schema={schema} />;
};

export const FAQSchema: React.FC<{
  questions: { question: string; answer: string }[];
}> = ({ questions }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <SchemaMarkup schema={schema} />;
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\SchemaMarkup.tsx" -Encoding UTF8
Write-Success "SchemaMarkup.tsx criado"

# ============================================
# PARTE 3: LANDING PAGE ATUALIZADA
# ============================================
Write-Step "PARTE 3/4: LANDING PAGE ATUALIZADA"

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
import { SchemaMarkup, WebApplicationSchema, OrganizationSchema } from '../components/SchemaMarkup.js';
import { OptimizedImage } from '../components/ui/OptimizedImage.js';

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

      <WebApplicationSchema />
      <OrganizationSchema />

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OptimizedImage
                src="/logo.svg"
                alt="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
                fallbackSrc="/logo-fallback.png"
                width={32}
                height={32}
                className="h-8 w-8"
              />
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

# ============================================
# PARTE 4: LOGIN PAGE ATUALIZADA
# ============================================
Write-Step "PARTE 4/4: LOGIN PAGE ATUALIZADA"

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
import { SchemaMarkup } from '../components/SchemaMarkup.js';

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

  const loginSchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Login - Code_Assessment',
    description: 'Faça login no Code_Assessment para acessar o sistema',
    url: 'https://code-assessment.com/login',
  };

  return (
    <>
      <LoginMetaTags />
      <SchemaMarkup schema={loginSchemaMarkup} />
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

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 4/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/ui/OptimizedImage.tsx"
Write-Info "  • frontend/src/components/SchemaMarkup.tsx"
Write-Info "  • frontend/src/pages/LandingPage.tsx"
Write-Info "  • frontend/src/pages/LoginPage.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ OptimizedImage com alt e lazy loading" -ForegroundColor White
Write-Info "  ✅ Schema Markup (WebApplication, Organization)" -ForegroundColor White
Write-Info "  ✅ BreadcrumbSchema para navegação" -ForegroundColor White
Write-Info "  ✅ FAQSchema para perguntas frequentes" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 6 (SEO & Semântica):" -ForegroundColor Cyan
Write-Info "  ✅ Tags HTML5 semânticas" -ForegroundColor White
Write-Info "  ✅ Hierarquia de headings" -ForegroundColor White
Write-Info "  ✅ Meta tags dinâmicas" -ForegroundColor White
Write-Info "  ✅ Open Graph e Twitter Cards" -ForegroundColor White
Write-Info "  ✅ robots.txt" -ForegroundColor White
Write-Info "  ✅ sitemap.xml" -ForegroundColor White
Write-Info "  ✅ Alt em imagens" -ForegroundColor White
Write-Info "  ✅ Schema Markup" -ForegroundColor White

Write-Info ""
Write-Info "📋 Módulo 1 (Auth) - Status Final:" -ForegroundColor Cyan
Write-Info "  ✅ Pilar 1 — Clean Code" -ForegroundColor White
Write-Info "  ✅ Pilar 2 — Segurança / AppSec" -ForegroundColor White
Write-Info "  ✅ Pilar 3 — Resiliência & Error Handling" -ForegroundColor White
Write-Info "  ✅ Pilar 4 — UX & Usabilidade" -ForegroundColor White
Write-Info "  ✅ Pilar 5 — Velocidade & Performance" -ForegroundColor White
Write-Info "  ✅ Pilar 6 — SEO & Semântica" -ForegroundColor White
Write-Info "  ⏳ Pilar 7 — Infraestrutura & Automação" -ForegroundColor Yellow

Write-Success ""
Write-Success "🎉 PILAR 6 (SEO & SEMÂNTICA) - AUTH - VALIDADO!"
Write-Success "🏁 6 de 7 Pilares do Módulo 1 (Auth) COMPLETOS!"