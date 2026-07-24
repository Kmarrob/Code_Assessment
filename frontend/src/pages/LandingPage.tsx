// frontend/src/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { 
  Shield, Users, BarChart3, Zap, 
  ArrowRight, FileText, PieChart, 
  TrendingUp, Layers, Award, Database,
  Building2, CheckCircle, Clock, 
  Package, Box, HardDrive, FileCheck,
  ShieldCheck, Lock, CreditCard, FileSearch,
  Boxes, Crown, Sparkles, Star, Minus
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

// ============================================
// CARDS DE PRODUTOS/SERVIÇOS (COM IMAGENS MAIORES)
// ============================================
const products = [
  {
    id: 'code-assessment',
    name: 'Code_Assessment',
    image: '/products/code-assessment.png',
    description: 'Avaliação completa de maturidade em Segurança da Informação baseada na ISO 27001. Gerencie controles, usuários e relatórios em tempo real.',
    status: 'available',
    statusLabel: 'Disponível',
    statusColor: '#10b981',
    link: '/register',
    linkLabel: 'Começar Agora',
  },
  {
    id: 'lgpd',
    name: 'LGPD',
    image: '/products/lgpd.png',
    description: 'Sistema de adequação à Lei Geral de Proteção de Dados. Mapeamento de dados pessoais, avaliação de riscos e plano de conformidade.',
    status: 'coming-soon',
    statusLabel: 'Em breve',
    statusColor: '#f59e0b',
    link: '#',
    linkLabel: 'Saiba mais',
  },
  {
    id: 'pci-dss',
    name: 'PCI_DSS',
    image: '/products/pci-dss.png',
    description: 'Avaliação de conformidade para o Padrão de Segurança de Dados da Indústria de Cartões de Pagamento. Proteja dados de cartão e evite violações.',
    status: 'coming-soon',
    statusLabel: 'Em breve',
    statusColor: '#f59e0b',
    link: '#',
    linkLabel: 'Saiba mais',
  },
  {
    id: 'politicas-processos',
    name: 'Políticas, Processos e Procedimentos',
    image: '/products/politicas.png',
    description: 'Portfólio completo de documentos para o SGSI. Políticas de segurança, procedimentos operacionais, planos de continuidade e muito mais.',
    status: 'coming-soon',
    statusLabel: 'Em breve',
    statusColor: '#f59e0b',
    link: '#',
    linkLabel: 'Saiba mais',
  },
];

// ============================================
// PLANOS E PREÇOS - CORRIGIDO
// ============================================
const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: '1.497',
    priceAnnual: '14.970',
    description: 'Perfeito para pequenas empresas que estão começando sua jornada de maturidade em segurança da informação.',
    users: 'Até 3',
    features: [
      '93 Controles ISO 27001',
      'Dashboards Avançados',
      'Matriz de Priorização',
      'Visualização do Relatório',
      'Suporte por E-mail',
    ],
    notIncluded: [
      'Impressão/Download do Relatório',
      'Roadmap de Implementação',
      'Comparativo Anual',
      'Suporte Prioritário',
      'Horas de Consultoria',
    ],
    badge: null,
    isPopular: false,
    cta: 'Começar Agora',
    link: '/register?plan=basic',
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: '3.297',
    priceAnnual: '32.970',
    description: 'Ideal para empresas que buscam um assessment completo com suporte especializado.',
    users: 'Até 4',
    features: [
      'Tudo do Plano Básico',
      'Exportação de Dados (CSV/Excel)',
      'Customização de Branding',
      'Suporte Prioritário',
      '4 Horas de Consultoria Inclusas',
    ],
    notIncluded: [
      'Impressão/Download do Relatório',
      'Roadmap de Implementação',
      'Comparativo Anual',
    ],
    badge: 'Mais Popular',
    isPopular: true,
    cta: 'Começar Agora',
    link: '/register?plan=pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '5.997',
    priceAnnual: '59.970',
    description: 'Solução completa para grandes organizações com necessidades avançadas de conformidade.',
    users: 'Até 10',
    features: [
      'Tudo do Plano Profissional',
      'Impressão/Download do Relatório',
      'Roadmap de Implementação',
      'Comparativo Últimos 3 Anos',
      '12 Horas de Consultoria Inclusas',
      'Suporte 24x7',
      'API e SSO',
    ],
    notIncluded: [],
    badge: 'Completo',
    isPopular: false,
    cta: 'Contratar',
    link: '/register?plan=enterprise',
  },
];

export const LandingPage: React.FC = () => {
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // 🔴 CORRIGIDO: Carregar branding sem requisições autenticadas
  // ============================================
  useEffect(() => {
    const loadBranding = async () => {
      setIsLoading(true);
      try {
        // ✅ Buscar companyId do localStorage (se existir)
        const savedCompanyId = localStorage.getItem('companyId');
        
        // ✅ Se tiver companyId salvo, tentar carregar o branding
        if (savedCompanyId) {
          try {
            const data = await brandingService.getPublicBranding(savedCompanyId);
            if (data) {
              setBranding(data);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            // Se falhar, continua para o fallback
            console.debug('Erro ao carregar branding com companyId salvo:', err);
          }
        }

        // ✅ Fallback: usar valores padrão (sem fazer requisição)
        setBranding({
          companyId: 'default',
          companyName: 'MRS Consultoria',
          logo: null,
          favicon: null,
          colors: MRS_COLORS,
          settings: {
            showLogoInHeader: true,
            showLogoInReport: true,
            useCustomColors: false,
          },
        });
      } catch (error) {
        console.error('Erro ao carregar branding na landing:', error);
        // ✅ Fallback: usar valores padrão
        setBranding({
          companyId: 'default',
          companyName: 'MRS Consultoria',
          logo: null,
          favicon: null,
          colors: MRS_COLORS,
          settings: {
            showLogoInHeader: true,
            showLogoInReport: true,
            useCustomColors: false,
          },
        });
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
          {/* ============================================
              SEÇÃO 1: HERO
              ============================================ */}
          <section 
            className="container mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-32"
            aria-labelledby="hero-title"
          >
            <div className="max-w-4xl mx-auto text-center">
              <FadeTransition show={true}>
                {/* Tarja - CORRIGIDA com cores da paleta MRS */}
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ 
                    backgroundColor: colors.primary + '15',
                    color: colors.secondary,
                    border: `1px solid ${colors.primary}20`
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
                  Avaliação de maturidade ISO 27001 em tempo real
                </div>
              </FadeTransition>

              <h1 id="hero-title" className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" style={{ color: colors.primary }}>
                Avalie sua maturidade em
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.accent} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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

          {/* ============================================
              SEÇÃO 2: PRODUTOS/SERVIÇOS (COM IMAGENS MAIORES)
              ============================================ */}
          <section 
            className="py-20"
            style={{ backgroundColor: colors.background || '#FFFFFF' }}
            aria-labelledby="products-title"
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 id="products-title" className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                  Nossas Soluções
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.secondary }}>
                  Conheça nosso portfólio de produtos e serviços para segurança da informação
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                  const isAvailable = product.status === 'available';
                  
                  return (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                      style={{ 
                        borderColor: colors.accent + '20',
                      }}
                    >
                      {/* Badge de Status */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white`}
                          style={{ backgroundColor: product.statusColor }}
                        >
                          {isAvailable ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {product.statusLabel}
                        </span>
                      </div>

                      {/* Imagem do Produto (a "caixa" - MAIOR) */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          style={{ padding: '8%' }}
                          onError={(e) => {
                            // Fallback se a imagem não carregar
                            e.currentTarget.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex items-center justify-center';
                            fallback.innerHTML = `
                              <div class="text-center">
                                <div class="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center" 
                                     style="background-color: ${isAvailable ? colors.accent + '20' : colors.secondary + '15'}; color: ${isAvailable ? colors.accent : colors.secondary};">
                                  <svg class="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                  </svg>
                                </div>
                                <p class="text-base font-medium mt-3" style="color: ${colors.primary};">${product.name}</p>
                              </div>
                            `;
                            e.currentTarget.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>

                      {/* Conteúdo abaixo da imagem */}
                      <div className="p-5 relative z-10">
                        {/* Nome do Produto */}
                        <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                          {product.name}
                        </h3>

                        {/* Descrição */}
                        <p className="text-sm leading-relaxed mb-4" style={{ color: colors.text }}>
                          {product.description}
                        </p>

                        {/* Botão de Ação */}
                        <Link to={product.link}>
                          <Button
                            variant={isAvailable ? 'default' : 'outline'}
                            className="w-full py-2.5 group-hover:shadow-md transition-all duration-300"
                            style={{
                              backgroundColor: isAvailable ? colors.accent : 'transparent',
                              color: isAvailable ? '#FFFFFF' : colors.primary,
                              borderColor: isAvailable ? colors.accent : colors.accent + '40',
                            }}
                          >
                            {product.linkLabel}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>

                      {/* Linha inferior colorida */}
                      <div 
                        className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                        style={{ 
                          backgroundColor: product.statusColor,
                          opacity: isAvailable ? 1 : 0.6,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============================================
              SEÇÃO 3: FUNCIONALIDADES (EXISTENTE)
              ============================================ */}
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

          {/* ============================================
              SEÇÃO 4: PLANOS E PREÇOS (NOVA)
              ============================================ */}
          <section 
            className="py-16"
            style={{ backgroundColor: '#FFFFFF' }}
            aria-labelledby="plans-title"
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 id="plans-title" className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                  Escolha o Plano Ideal
                </h2>
                <p className="max-w-2xl mx-auto" style={{ color: colors.secondary }}>
                  Comece com 7 dias grátis em qualquer plano. Cancele quando quiser.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                      plan.isPopular ? 'border-[#30736C] shadow-xl scale-105' : 'border-gray-100'
                    }`}
                  >
                    {/* Badge "Mais Popular" */}
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-[#30736C] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                          ★ Mais Popular
                        </div>
                      </div>
                    )}

                    {/* Badge "Completo" */}
                    {plan.badge && plan.id === 'enterprise' && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-[#122A40] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                          ★ {plan.badge}
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Nome do Plano */}
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      
                      {/* Preço */}
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                        <span className="text-gray-500 text-sm">/mês</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        ou R$ {plan.priceAnnual}/ano (10% de desconto)
                      </div>

                      {/* Descrição */}
                      <p className="text-sm text-gray-600 mt-4">{plan.description}</p>

                      {/* Usuários */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">👥 {plan.users} usuários</span>
                      </div>

                      {/* Features */}
                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                        {plan.notIncluded.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                            <Minus className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Botão CTA */}
                      <div className="mt-6">
                        <Link to={plan.link}>
                          <Button
                            className="w-full py-2.5"
                            style={{
                              backgroundColor: plan.isPopular ? colors.accent : colors.primary,
                              color: '#FFFFFF',
                            }}
                          >
                            {plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-gray-500">
                  Todos os planos incluem 7 dias de teste gratuito. Não é necessário cartão de crédito.
                </p>
                <Link to="/plans" className="text-sm text-[#30736C] hover:underline font-medium">
                  Ver todos os detalhes dos planos →
                </Link>
              </div>
            </div>
          </section>

          {/* ============================================
              SEÇÃO 5: CTA (EXISTENTE)
              ============================================ */}
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