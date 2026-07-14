// frontend/src/pages/PlansPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, X, ArrowRight, Crown, Sparkles, Star, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Container } from '../components/ui/Container.js';
import { planService, Plan } from '../services/plan.service.js';
import { useAuth } from '../contexts/AuthContext.js';
import { MetaTags } from '../components/MetaTags.js';
import toast from 'react-hot-toast';

export const PlansPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await planService.getPublicPlans();
        setPlans(data.plans || []);
        
        // Selecionar plano padrão (o do meio, geralmente o mais popular)
        const popularPlan = data.plans?.find(p => p.isPopular);
        if (popularPlan) {
          setSelectedPlan(popularPlan._id);
        } else if (data.plans?.length > 0) {
          setSelectedPlan(data.plans[0]._id);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        toast.error('Erro ao carregar planos');
        // Fallback: usar planos padrão
        setPlans([
          {
            _id: 'basic',
            name: 'basic',
            displayName: 'Básico',
            description: 'Perfeito para pequenas empresas que estão começando sua jornada de maturidade.',
            priceMonthly: 149700,
            priceAnnual: 1497000,
            pricePerUser: 29700,
            features: {
              maxUsers: 5,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: false,
              canDownloadReport: false,
              canViewRoadmap: false,
              canViewComparative: false,
              canExportData: false,
              hasConsultingHours: false,
              consultingHours: 0,
              consultingHoursUsed: 0,
              supportPriority: 'low',
              supportHours: 'business',
              canCustomizeBranding: false,
              canAddCustomControls: false,
              canIntegrateAPI: false,
              canIntegrateSSO: false,
            },
            isActive: true,
            isPublic: true,
            trialDays: 7,
            allowCustomPricing: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'pro',
            name: 'pro',
            displayName: 'Profissional',
            description: 'Ideal para empresas que buscam um assessment completo com suporte especializado.',
            priceMonthly: 329700,
            priceAnnual: 3297000,
            pricePerUser: 29700,
            features: {
              maxUsers: 10,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: false,
              canDownloadReport: false,
              canViewRoadmap: false,
              canViewComparative: false,
              canExportData: true,
              hasConsultingHours: true,
              consultingHours: 4,
              consultingHoursUsed: 0,
              supportPriority: 'high',
              supportHours: 'extended',
              canCustomizeBranding: true,
              canAddCustomControls: false,
              canIntegrateAPI: false,
              canIntegrateSSO: false,
            },
            isActive: true,
            isPublic: true,
            trialDays: 7,
            allowCustomPricing: true,
            sortOrder: 2,
            badge: 'Mais Popular',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'enterprise',
            name: 'enterprise',
            displayName: 'Enterprise',
            description: 'Solução completa para grandes organizações com necessidades avançadas.',
            priceMonthly: 599700,
            priceAnnual: 5997000,
            pricePerUser: 29700,
            features: {
              maxUsers: 999,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: true,
              canDownloadReport: true,
              canViewRoadmap: true,
              canViewComparative: true,
              canExportData: true,
              hasConsultingHours: true,
              consultingHours: 12,
              consultingHoursUsed: 0,
              supportPriority: 'critical',
              supportHours: '24x7',
              canCustomizeBranding: true,
              canAddCustomControls: true,
              canIntegrateAPI: true,
              canIntegrateSSO: true,
            },
            isActive: true,
            isPublic: true,
            trialDays: 7,
            allowCustomPricing: true,
            sortOrder: 3,
            badge: 'Completo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        if (plans.length > 0) {
          setSelectedPlan(plans[0]._id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = (planId: string) => {
    if (user) {
      // Usuário já logado - redirecionar para checkout
      navigate(`/checkout?plan=${planId}&cycle=${billingCycle}`);
    } else {
      // Usuário não logado - redirecionar para registro com plano selecionado
      navigate(`/register?plan=${plans.find(p => p._id === planId)?.name || 'basic'}`);
    }
  };

  const handleContact = () => {
    window.location.href = 'mailto:contato@cisatool.com.br?subject=Enterprise%20Plan%20-%20Code_Assessment';
  };

  const formatPrice = (price: number): string => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getPrice = (plan: Plan): number => {
    return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  };

  const getPriceDisplay = (plan: Plan): string => {
    return formatPrice(getPrice(plan));
  };

  const getPeriodLabel = (): string => {
    return billingCycle === 'annual' ? '/ano' : '/mês';
  };

  const getAnnualDiscount = (plan: Plan): number => {
    if (plan.priceMonthly === 0) return 0;
    const monthlyTotal = plan.priceMonthly * 12;
    const annualTotal = plan.priceAnnual;
    return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100);
  };

  if (loading) {
    return (
      <>
        <MetaTags title="Planos - Code_Assessment" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30736C] mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando planos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title="Planos - Code_Assessment | Avaliação de Maturidade ISO 27001"
        description="Escolha o plano ideal para sua empresa. Comece com 7 dias grátis em qualquer plano. Básico, Profissional e Enterprise."
        keywords={['Planos', 'Preços', 'ISO 27001', 'Assessment', 'Maturidade', 'Segurança da Informação']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Code<span className="text-[#30736C]">_Assessment</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" style={{ backgroundColor: '#30736C', color: '#FFFFFF' }}>
                  Começar
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="py-16">
          <Container size="lg">
            {/* Título */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha o Plano Ideal
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comece com 7 dias grátis em qualquer plano. Cancele quando quiser.
              </p>
            </div>

            {/* Toggle de faturamento */}
            <div className="flex justify-center items-center gap-4 mb-10">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none"
                style={{ backgroundColor: billingCycle === 'annual' ? '#30736C' : '#d1d5db' }}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
                Anual
                <span className="ml-1 text-xs text-[#10b981] font-bold">(Economize 10%)</span>
              </span>
            </div>

            {/* Cards de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan._id;
                const isPopular = plan.badge === 'Mais Popular';
                const price = getPrice(plan);
                const discount = getAnnualDiscount(plan);

                return (
                  <div
                    key={plan._id}
                    className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                      isSelected
                        ? 'border-[#30736C] shadow-xl'
                        : isPopular
                        ? 'border-[#30736C]/30 shadow-lg'
                        : 'border-gray-100'
                    } ${isPopular ? 'scale-105' : ''}`}
                    onClick={() => handleSelectPlan(plan._id)}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute top-0 right-0">
                        <div
                          className="text-white text-xs font-bold px-4 py-1 rounded-bl-lg"
                          style={{
                            backgroundColor: isPopular ? '#30736C' : '#122A40',
                          }}
                        >
                          ★ {plan.badge}
                        </div>
                      </div>
                    )}

                    {/* 7 dias grátis */}
                    <div className="absolute top-0 left-0">
                      <div className="bg-[#10b981] text-white text-[10px] font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        7 dias grátis
                      </div>
                    </div>

                    <div className="p-6 pt-12">
                      {/* Nome do Plano */}
                      <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
                      
                      {/* Preço */}
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">{getPriceDisplay(plan)}</span>
                        <span className="text-gray-500 text-sm ml-1">{getPeriodLabel()}</span>
                      </div>
                      {billingCycle === 'annual' && discount > 0 && (
                        <div className="text-sm text-[#10b981] font-medium mt-1">
                          Economize {discount}% no plano anual
                        </div>
                      )}

                      {/* Descrição */}
                      <p className="text-sm text-gray-600 mt-4">{plan.description}</p>

                      {/* Usuários */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          👥 {plan.features.maxUsers >= 999 ? 'Ilimitado' : `Até ${plan.features.maxUsers}`} usuários
                        </span>
                      </div>

                      {/* Features */}
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">O que está incluso:</p>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">93 Controles ISO 27001</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Dashboards Avançados</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">Matriz de Priorização</span>
                          </div>
                          {plan.features.canExportData && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Exportação de Dados</span>
                            </div>
                          )}
                          {plan.features.canPrintReport && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Impressão/Download do Relatório</span>
                            </div>
                          )}
                          {plan.features.canViewRoadmap && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Roadmap de Implementação</span>
                            </div>
                          )}
                          {plan.features.canViewComparative && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Comparativo com Avaliações Anteriores</span>
                            </div>
                          )}
                          {plan.features.hasConsultingHours && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{plan.features.consultingHours}h de Consultoria</span>
                            </div>
                          )}
                          {plan.features.supportPriority === 'high' && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Suporte Prioritário</span>
                            </div>
                          )}
                          {plan.features.supportHours === '24x7' && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">Suporte 24x7</span>
                            </div>
                          )}
                          {plan.features.canIntegrateAPI && (
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">API e SSO</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botão CTA */}
                      <div className="mt-6">
                        {plan.name === 'enterprise' ? (
                          <Button
                            className="w-full py-2.5"
                            style={{
                              backgroundColor: '#122A40',
                              color: '#FFFFFF',
                            }}
                            onClick={() => handleContact()}
                          >
                            Fale Conosco
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            className="w-full py-2.5"
                            style={{
                              backgroundColor: isSelected ? '#30736C' : '#122A40',
                              color: '#FFFFFF',
                              opacity: isSelected ? 1 : 0.7,
                            }}
                            onClick={() => handleSubscribe(plan._id)}
                            disabled={!isSelected}
                          >
                            {isSelected ? 'Escolher Plano' : 'Selecione este plano'}
                            {isSelected && <ArrowRight className="ml-2 h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé dos planos */}
            <div className="text-center mt-12">
              <p className="text-sm text-gray-500">
                Todos os planos incluem 7 dias de teste gratuito. Não é necessário cartão de crédito.
              </p>
              <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                <span>✓ Cancele quando quiser</span>
                <span>✓ Sem fidelidade</span>
                <span>✓ Suporte incluso</span>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
                Perguntas Frequentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Como funciona o teste gratuito de 7 dias?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Você tem acesso completo a todas as funcionalidades do plano escolhido por 7 dias, sem custo. 
                    Não é necessário cartão de crédito para começar.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Posso mudar de plano depois?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor será ajustado proporcionalmente.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">O que acontece se eu cancelar?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Você pode cancelar a qualquer momento. O acesso será mantido até o final do período pago atual.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Code_Assessment. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};