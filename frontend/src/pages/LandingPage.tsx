// frontend/src/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { 
  Shield, Users, BarChart3, Zap, 
  ArrowRight, FileText, PieChart, 
  TrendingUp, Layers, Award, Database,
  Building2
} from 'lucide-react';
import { FadeTransition } from '../components/ui/Transition.js';
import { Typewriter } from '../components/ui/MicroInteractions.js';
import { Grid, GridItem } from '../components/ui/Grid.js';
import { MetaTags } from '../components/MetaTags.js';
import { SchemaMarkup, WebApplicationSchema, OrganizationSchema } from '../components/SchemaMarkup.js';
import { OptimizedImage } from '../components/ui/OptimizedImage.js';
import { brandingService, PublicBrandingData } from '../services/branding.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

// Logo da MRS Consultoria (caminho fixo - imagem local - FALLBACK)
const MRS_LOGO_FALLBACK = '/images/brand/logo-mrs.png';

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
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch('/api/admin/companies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        let companyId = '67f8a1b2c3d4e5f6g7h8i9j0';
        if (response.ok) {
          const data = await response.json();
          if (data.data?.companies?.length > 0) {
            companyId = data.data.companies[0]._id;
          }
        }

        const data = await brandingService.getPublicBranding(companyId);
        setBranding(data);
      } catch (error) {
        console.error('Erro ao carregar branding na landing:', error);
        setBranding(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadBranding();
  }, []);

  const colors = branding?.colors || MRS_COLORS;
  const showLogo = branding?.settings?.showLogoInHeader !== false;
  const logoUrl = branding?.logo?.url;

  const finalLogoUrl = (showLogo && logoUrl) ? logoUrl : MRS_LOGO_FALLBACK;

  return (
    <>
      <MetaTags
        title="MRS Consultoria - Avaliação de Maturidade ISO 27001"
        description="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001. Gerencie controles, usuários e relatórios em um só lugar."
        keywords={['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade', 'Controles']}
        ogTitle="MRS Consultoria - Avaliação de Maturidade ISO 27001"
        ogDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
        ogImage="https://code-assessment.com/og-image.jpg"
        twitterCard="summary_large_image"
        twitterTitle="MRS Consultoria - Avaliação de Maturidade ISO 27001"
        twitterDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
      />

      <WebApplicationSchema />
      <OrganizationSchema />

      <div 
        className="min-h-screen"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.secondary}08 50%, ${colors.accent}08 100%)`
        }}
      >
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between" style={{ minHeight: '80px' }}>
            <div className="flex items-center gap-2">
              <img
                src={finalLogoUrl}
                alt="MRS Consultoria - Sistema de Avaliação de Maturidade ISO 27001"
                className="h-28 w-auto object-contain"
                style={{ maxHeight: '112px' }}
                onError={(e) => {
                  if (e.currentTarget.src !== MRS_LOGO_FALLBACK) {
                    e.currentTarget.src = MRS_LOGO_FALLBACK;
                  } else {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'flex items-center gap-2';
                    const icon = document.createElement('div');
                    icon.className = 'p-1.5 rounded';
                    icon.style.backgroundColor = colors.accent + '20';
                    const span = document.createElement('span');
                    span.className = 'text-xl font-bold';
                    span.style.color = colors.primary;
                    span.textContent = 'MRS Consultoria';
                    fallback.appendChild(icon);
                    fallback.appendChild(span);
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }
                }}
              />
            </div>
            <nav aria-label="Navegação principal">
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button 
                    variant="ghost"
                    style={{ color: colors.text }}
                    className="hover:bg-transparent hover:opacity-70"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button style={{ 
                    backgroundColor: colors.accent,
                    color: '#FFFFFF',
                  }}>
                    Começar
                  </Button>
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
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ 
                    backgroundColor: colors.accent + '25',
                    color: colors.primary,
                    border: `1px solid ${colors.accent}40`
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: colors.accent }}
                    ></span>
                    <span 
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: colors.accent }}
                    ></span>
                  </span>
                  Transforme seu assessment manual em digital
                </div>
              </FadeTransition>

              <h1 id="hero-title" className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" style={{ color: colors.primary }}>
                Avalie sua maturidade em
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`
                  }}
                >
                  <Typewriter
                    text="Segurança da Informação"
                    speed={100}
                    delay={1000}
                  />
                </span>
              </h1>

              <FadeTransition show={true}>
                <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: colors.text }}>
                  Automatize o processo de assessment baseado na ISO 27001, com gestão de usuários,
                  controles e relatórios em tempo real.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="text-base text-white hover:opacity-90"
                      style={{ 
                        backgroundColor: colors.accent,
                      }}
                    >
                      Iniciar Agora
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-base"
                      style={{ 
                        borderColor: colors.accent,
                        color: colors.text
                      }}
                    >
                      Já tenho conta
                    </Button>
                  </Link>
                </div>
              </FadeTransition>
            </div>
          </section>

          <section 
            className="py-16"
            style={{ backgroundColor: colors.background || '#FFFFFF' }}
            aria-labelledby="features-title"
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 id="features-title" className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                  Funcionalidades Completas
                </h2>
                <p className="max-w-2xl mx-auto" style={{ color: colors.secondary }}>
                  Tudo que você precisa para um assessment profissional
                </p>
              </div>
              <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap={8}>
                {features.map((feature) => (
                  <GridItem key={feature.title}>
                    <article 
                      className="text-center p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ 
                        borderColor: colors.accent + '30',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <div 
                        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                        style={{ 
                          backgroundColor: colors.accent + '15',
                          color: colors.accent
                        }}
                      >
                        <feature.icon className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                        {feature.description}
                      </p>
                    </article>
                  </GridItem>
                ))}
              </Grid>
            </div>
          </section>

          <section 
            className="py-16 text-white"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
            }}
            aria-labelledby="cta-title"
          >
            <div className="container mx-auto px-4 text-center">
              <h2 id="cta-title" className="text-3xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Cadastre-se agora e transforme seu processo de assessment em uma experiência digital e eficiente.
              </p>
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-white hover:opacity-90"
                  style={{ 
                    backgroundColor: colors.accent,
                  }}
                >
                  Criar conta gratuita
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <footer 
          className="py-8 text-gray-400"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src={finalLogoUrl}
                alt="MRS Consultoria"
                className="h-10 w-auto object-contain opacity-80"
                style={{ maxHeight: '40px' }}
                onError={(e) => {
                  if (e.currentTarget.src !== MRS_LOGO_FALLBACK) {
                    e.currentTarget.src = MRS_LOGO_FALLBACK;
                  } else {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('span');
                    fallback.className = 'font-medium text-white/80';
                    fallback.textContent = 'MRS Consultoria';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }
                }}
              />
            </div>
            <p className="text-white/60 text-sm">
              &copy; 2026 MRS Consultoria. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};