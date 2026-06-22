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
