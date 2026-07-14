// frontend/src/pages/PlansPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, TrendingUp, Rocket, Shield, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Plan, formatPrice } from '../types/plan.js';
import { planService } from '../services/plan.service.js';
import { useAuth } from '../contexts/AuthContext.js';

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔴 ADICIONADO: LOGS PARA DEPURAÇÃO
  useEffect(() => {
    console.log('🔍 useEffect do PlansPage executado');
    loadPlans();
  }, [searchParams]);

  const loadPlans = async () => {
    console.log('🔄 loadPlans iniciado');
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Chamando planService.getPublicPlans()...');
      const response = await planService.getPublicPlans();
      console.log('✅ Dados recebidos da API:', response);
      
      // Ordenar: basic, pro, enterprise
      const order = ['basic', 'pro', 'enterprise'];
      const sorted = (response.plans || []).sort((a, b) => {
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        return indexA - indexB;
      });
      
      console.log('📋 Planos ordenados:', sorted);
      setPlans(sorted);
    } catch (error) {
      console.error('❌ Erro ao carregar planos (usando fallback):', error);
      setError('Não foi possível carregar os planos. Tente novamente.');
      
      // 🔴 FALLBACK ATUALIZADO COM VALORES CORRETOS
      console.log('📋 Usando fallback com valores corrigidos');
      setPlans([
        {
          _id: 'basic',
          name: 'basic',
          displayName: 'Básico',
          description: 'Perfeito para pequenas empresas que estão começando sua jornada de maturidade em segurança da informação.',
          priceMonthly: 149700,
          priceAnnual: 1497000,
          pricePerUser: 29700,
          features: {
            maxUsers: 3,
            maxControls: 93,
            canViewReport: true,
            canPrintReport: true,
            canDownloadReport: true,
            canViewRoadmap: true,
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
          allowCustomPricing: false,
          sortOrder: 1,
          badge: 'Para começar',
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
            maxUsers: 4,
            maxControls: 93,
            canViewReport: true,
            canPrintReport: true,
            canDownloadReport: true,
            canViewRoadmap: true,
            canViewComparative: true,
            canExportData: true,
            hasConsultingHours: true,
            consultingHours: 4,
            consultingHoursUsed: 0,
            supportPriority: 'high',
            supportHours: 'extended',
            canCustomizeBranding: false,
            canAddCustomControls: false,
            canIntegrateAPI: false,
            canIntegrateSSO: false,
          },
          isActive: true,
          isPublic: true,
          trialDays: 7,
          allowCustomPricing: false,
          sortOrder: 2,
          badge: 'Mais popular',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'enterprise',
          name: 'enterprise',
          displayName: 'Enterprise',
          description: 'Solução completa para grandes organizações com necessidades avançadas de conformidade e segurança.',
          priceMonthly: 599700,
          priceAnnual: 5997000,
          pricePerUser: 29700,
          features: {
            maxUsers: 10,
            maxControls: 0,
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
    } finally {
      setLoading(false);
      console.log('🏁 loadPlans finalizado, loading:', false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}`);
    } else {
      navigate(`/billing?plan=${planId}`);
    }
  };

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'basic':
        return <TrendingUp className="h-6 w-6" />;
      case 'pro':
        return <Sparkles className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Check className="h-6 w-6" />;
    }
  };

  const getPlanColor = (name: string) => {
    switch (name) {
      case 'basic':
        return 'blue';
      case 'pro':
        return 'purple';
      case 'enterprise':
        return 'amber';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#30736C] animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Carregando planos...</p>
          <p className="text-xs text-gray-400 mt-2">🔍 Verificando API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p className="font-medium">❌ {error}</p>
            <button 
              onClick={loadPlans}
              className="mt-3 text-red-600 font-medium hover:text-red-700 underline"
            >
              Tentar novamente
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Usando dados de fallback com valores corrigidos.</p>
            <p>Verifique o console para mais detalhes.</p>
          </div>
        </div>
      </div>
    );
  }

  // Identificar qual plano é o mais popular (pro)
  const popularPlanId = plans.find(p => p.name === 'pro')?._id || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 bg-[#30736C]/10 text-[#30736C] px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                Planos e Preços
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para sua empresa
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comece com <strong>7 dias grátis</strong> em qualquer plano. Cancele quando quiser.
            </p>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan._id === popularPlanId;
            const color = getPlanColor(plan.name);
            
            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                  isPopular ? 'border-[#30736C] shadow-xl' : 'border-gray-200'
                } hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
              >
                {/* Badge Popular */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-[#30736C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      ★ Mais Popular
                    </span>
                  </div>
                )}

                {/* Trial Badge */}
                {plan.trialDays > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {plan.trialDays} dias grátis
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                      color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      color === 'purple' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
                    {plan.badge && (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                        color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        color === 'purple' ? 'bg-purple-50 text-purple-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.priceMonthly)}
                      </span>
                      <span className="text-gray-500 text-sm mb-1">/mês</span>
                    </div>
                    {plan.priceAnnual > 0 && (
                      <p className="text-sm text-gray-400 mt-1">
                        ou {formatPrice(plan.priceAnnual)}/ano <span className="text-green-600 font-medium">(10% de desconto)</span>
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2 mb-6">
                    {/* Usuários - Destaque principal */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-[#30736C]" />
                      <span>
                        {plan.features.maxUsers >= 999 ? 'Ilimitado' : `Até ${plan.features.maxUsers}`} usuários
                      </span>
                    </div>

                    {/* Features principais */}
                    {plan.features.maxControls > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{plan.features.maxControls} Controles ISO 27001</span>
                      </div>
                    )}
                    {plan.features.canViewReport && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Visualização do Relatório</span>
                      </div>
                    )}
                    {plan.features.canPrintReport && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Impressão/Download do Relatório</span>
                      </div>
                    )}
                    {plan.features.canViewRoadmap && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Roadmap de Implementação</span>
                      </div>
                    )}
                    {plan.features.canViewComparative && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Comparativo Anual</span>
                      </div>
                    )}
                    {plan.features.canExportData && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Exportação de Dados (CSV/Excel)</span>
                      </div>
                    )}
                    {plan.features.hasConsultingHours && plan.features.consultingHours > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{plan.features.consultingHours} Horas de Consultoria Inclusas</span>
                      </div>
                    )}
                    {plan.features.supportPriority === 'high' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Suporte Prioritário</span>
                      </div>
                    )}
                    {plan.features.supportPriority === 'critical' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Suporte 24x7</span>
                      </div>
                    )}
                    {plan.features.canCustomizeBranding && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Customização de Branding</span>
                      </div>
                    )}
                    {plan.features.canIntegrateAPI && plan.features.canIntegrateSSO && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>API e SSO</span>
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan._id)}
                    className={`w-full py-3 text-base ${
                      isPopular 
                        ? 'bg-[#30736C] hover:bg-[#265a54] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isAuthenticated ? 'Selecionar Plano' : 'Começar Agora'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Precisa de um plano personalizado? <a href="/contact" className="text-[#30736C] hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;