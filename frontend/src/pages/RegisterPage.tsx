// frontend/src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { 
  User, Building, Shield, CheckCircle, Crown, Sparkles, Star, 
  Info, Users, Mail, AlertCircle, X, Check, Zap, 
  FileText, Download, Eye, BarChart, Clock, Headphones,
  Palette, Code, Key, Briefcase, TrendingUp, Award
} from 'lucide-react';
import { RegisterMetaTags } from '../components/MetaTags.js';
import { planService } from '../services/plan.service.js';
import { Button } from '../components/ui/Button.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

// 🔴 CORRIGIDO: Validação de senha com 8 caracteres
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial'),
  company: z.string().min(2, 'Nome da empresa é obrigatório'),
  department: z.string().optional(),
  plan: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface Plan {
  _id: string;
  name: 'basic' | 'pro' | 'enterprise';
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  pricePerUser: number;
  features: {
    maxUsers: number;
    maxControls: number;
    canViewReport: boolean;
    canPrintReport: boolean;
    canDownloadReport: boolean;
    canViewRoadmap: boolean;
    canViewComparative: boolean;
    canExportData: boolean;
    hasConsultingHours: boolean;
    consultingHours: number;
    canCustomizeBranding: boolean;
    canAddCustomControls: boolean;
    canIntegrateAPI: boolean;
    canIntegrateSSO: boolean;
    supportPriority: 'low' | 'medium' | 'high' | 'critical';
    supportHours: 'business' | 'extended' | '24x7';
  };
  badge?: string;
  isPopular: boolean;
}

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Carregar planos disponíveis
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await planService.getPublicPlans();
        setPlans(data.plans || []);
        
        // Verificar se veio um plano na URL
        const planParam = searchParams.get('plan');
        if (planParam && ['basic', 'pro', 'enterprise'].includes(planParam)) {
          setSelectedPlan(planParam);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        // Fallback: usar planos padrão
        setPlans([
          {
            _id: 'basic',
            name: 'basic',
            displayName: 'Básico',
            description: 'Perfeito para pequenas empresas que estão começando.',
            priceMonthly: 149700,
            priceAnnual: 1497000,
            pricePerUser: 29700,
            features: {
              maxUsers: 3,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: false,
              canDownloadReport: false,
              canViewRoadmap: false,
              canViewComparative: false,
              canExportData: false,
              hasConsultingHours: false,
              consultingHours: 0,
              canCustomizeBranding: false,
              canAddCustomControls: false,
              canIntegrateAPI: false,
              canIntegrateSSO: false,
              supportPriority: 'low',
              supportHours: 'business',
            },
            badge: undefined,
            isPopular: false,
          },
          {
            _id: 'pro',
            name: 'pro',
            displayName: 'Profissional',
            description: 'Ideal para empresas que buscam um assessment completo.',
            priceMonthly: 329700,
            priceAnnual: 3297000,
            pricePerUser: 29700,
            features: {
              maxUsers: 4,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: false,
              canDownloadReport: false,
              canViewRoadmap: false,
              canViewComparative: false,
              canExportData: true,
              hasConsultingHours: true,
              consultingHours: 4,
              canCustomizeBranding: false,
              canAddCustomControls: false,
              canIntegrateAPI: false,
              canIntegrateSSO: false,
              supportPriority: 'high',
              supportHours: 'extended',
            },
            badge: 'Mais Popular',
            isPopular: true,
          },
          {
            _id: 'enterprise',
            name: 'enterprise',
            displayName: 'Enterprise',
            description: 'Solução completa para grandes organizações.',
            priceMonthly: 599700,
            priceAnnual: 5997000,
            pricePerUser: 29700,
            features: {
              maxUsers: 10,
              maxControls: 93,
              canViewReport: true,
              canPrintReport: true,
              canDownloadReport: true,
              canViewRoadmap: true,
              canViewComparative: true,
              canExportData: true,
              hasConsultingHours: true,
              consultingHours: 12,
              canCustomizeBranding: true,
              canAddCustomControls: true,
              canIntegrateAPI: true,
              canIntegrateSSO: true,
              supportPriority: 'critical',
              supportHours: '24x7',
            },
            badge: 'Completo',
            isPopular: false,
          },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      plan: 'basic',
    },
  });

  const password = watch('password');
  const selectedPlanName = watch('plan');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      // 🔴 O usuário que se cadastra é o preposto (REP)
      await registerUser({
        ...data,
        role: 'rep', // Preposto
      });
      setRegisteredEmail(data.email);
      setShowSuccessModal(true);
      // Não navega automaticamente, espera o usuário clicar em "Entrar"
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleAcceptTerms = () => {
    setShowInfoModal(false);
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  // Obter informações do plano selecionado
  const selectedPlanData = plans.find(p => p.name === selectedPlanName);
  const maxUsers = selectedPlanData?.features.maxUsers || 3;

  // Mapeamento de ícones para features
  const featureIcons: Record<string, React.ReactNode> = {
    'maxUsers': <Users className="h-4 w-4" />,
    'canViewReport': <FileText className="h-4 w-4" />,
    'canPrintReport': <FileText className="h-4 w-4" />,
    'canDownloadReport': <Download className="h-4 w-4" />,
    'canViewRoadmap': <TrendingUp className="h-4 w-4" />,
    'canViewComparative': <BarChart className="h-4 w-4" />,
    'canExportData': <Download className="h-4 w-4" />,
    'hasConsultingHours': <Briefcase className="h-4 w-4" />,
    'canCustomizeBranding': <Palette className="h-4 w-4" />,
    'canAddCustomControls': <Code className="h-4 w-4" />,
    'canIntegrateAPI': <Code className="h-4 w-4" />,
    'canIntegrateSSO': <Key className="h-4 w-4" />,
    'supportPriority': <Headphones className="h-4 w-4" />,
    'supportHours': <Clock className="h-4 w-4" />,
  };

  // Mapeamento de labels para features
  const featureLabels: Record<string, string> = {
    'maxUsers': 'Usuários',
    'canViewReport': 'Relatório Executivo',
    'canPrintReport': 'Imprimir Relatório',
    'canDownloadReport': 'Baixar Relatório (PDF)',
    'canViewRoadmap': 'Roadmap de Implementação',
    'canViewComparative': 'Análise Comparativa',
    'canExportData': 'Exportar Dados (CSV/Excel)',
    'hasConsultingHours': 'Consultoria Especializada',
    'canCustomizeBranding': 'Branding Personalizado',
    'canAddCustomControls': 'Controles Personalizados',
    'canIntegrateAPI': 'Integração API',
    'canIntegrateSSO': 'Integração SSO',
    'supportPriority': 'Suporte Prioritário',
    'supportHours': 'Horário de Suporte',
  };

  // Lista de features para exibir no modal
  const featureList = [
    { key: 'maxUsers', label: 'Usuários', icon: <Users className="h-4 w-4" /> },
    { key: 'canViewReport', label: 'Relatório Executivo', icon: <FileText className="h-4 w-4" /> },
    { key: 'canPrintReport', label: 'Imprimir Relatório', icon: <FileText className="h-4 w-4" /> },
    { key: 'canDownloadReport', label: 'Baixar Relatório (PDF)', icon: <Download className="h-4 w-4" /> },
    { key: 'canViewRoadmap', label: 'Roadmap de Implementação', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'canViewComparative', label: 'Análise Comparativa', icon: <BarChart className="h-4 w-4" /> },
    { key: 'canExportData', label: 'Exportar Dados', icon: <Download className="h-4 w-4" /> },
    { key: 'hasConsultingHours', label: 'Consultoria Especializada', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'canCustomizeBranding', label: 'Branding Personalizado', icon: <Palette className="h-4 w-4" /> },
    { key: 'canAddCustomControls', label: 'Controles Personalizados', icon: <Code className="h-4 w-4" /> },
    { key: 'canIntegrateAPI', label: 'Integração API', icon: <Code className="h-4 w-4" /> },
    { key: 'canIntegrateSSO', label: 'Integração SSO', icon: <Key className="h-4 w-4" /> },
    { key: 'supportPriority', label: 'Suporte Prioritário', icon: <Headphones className="h-4 w-4" /> },
    { key: 'supportHours', label: 'Horário de Suporte', icon: <Clock className="h-4 w-4" /> },
  ];

  // Função para verificar se a feature está disponível no plano
  const hasFeature = (plan: Plan, featureKey: string): boolean => {
    const value = plan.features[featureKey as keyof typeof plan.features];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') return value !== 'low' && value !== 'business';
    return false;
  };

  // Função para obter o valor da feature
  const getFeatureValue = (plan: Plan, featureKey: string): string | number | boolean => {
    return plan.features[featureKey as keyof typeof plan.features];
  };

  // Função para formatar o valor da feature
  const formatFeatureValue = (plan: Plan, featureKey: string): string => {
    const value = getFeatureValue(plan, featureKey);
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (typeof value === 'number') {
      if (featureKey === 'maxUsers') return value === 0 ? 'Ilimitado' : String(value);
      if (featureKey === 'consultingHours') return value === 0 ? '❌' : `${value}h`;
      return String(value);
    }
    if (typeof value === 'string') {
      if (featureKey === 'supportPriority') {
        const map: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica' };
        return map[value] || value;
      }
      if (featureKey === 'supportHours') {
        const map: Record<string, string> = { business: 'Comercial', extended: 'Estendido', '24x7': '24x7' };
        return map[value] || value;
      }
      return value;
    }
    return String(value);
  };

  return (
    <>
      <RegisterMetaTags />

      {/* 🔴 MODAL INFORMATIVO COMPLETO - ANTES DO CADASTRO */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#30736C]/10 rounded-full">
                <Shield className="h-8 w-8 text-[#30736C]" />
              </div>
              <DialogTitle className="text-2xl font-bold text-[#122A40]">
                Bem-vindo ao Code Assessment!
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Escolha o plano ideal para sua empresa e comece sua jornada de assessment digital.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 🔴 SEÇÃO: PLANOS COMPARATIVOS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-[#30736C]" />
                Planos Disponíveis
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Funcionalidades
                      </th>
                      {plans.map((plan) => (
                        <th key={plan.name} className={`p-3 text-center border-b ${plan.isPopular ? 'bg-[#30736C]/5' : ''}`}>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900">{plan.displayName}</span>
                            <span className="text-xs text-gray-500">{formatPrice(plan.priceMonthly)}/mês</span>
                            {plan.badge && (
                              <span className="mt-1 text-[10px] font-bold text-[#30736C] bg-[#30736C]/10 px-2 py-0.5 rounded-full">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featureList.map((feature) => (
                      <tr key={feature.key} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-700 border-b flex items-center gap-2">
                          {feature.icon}
                          <span>{feature.label}</span>
                        </td>
                        {plans.map((plan) => {
                          const value = getFeatureValue(plan, feature.key);
                          const isAvailable = hasFeature(plan, feature.key);
                          const formattedValue = formatFeatureValue(plan, feature.key);
                          
                          return (
                            <td key={`${plan.name}-${feature.key}`} className="p-3 text-center border-b">
                              <span className={isAvailable ? 'text-green-600' : 'text-gray-400'}>
                                {typeof value === 'boolean' ? (
                                  isAvailable ? <Check className="h-5 w-5 mx-auto text-green-600" /> : <X className="h-5 w-5 mx-auto text-gray-300" />
                                ) : (
                                  <span className="font-medium">{formattedValue}</span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🔴 SEÇÃO: SEU PAPEL COMO PREPOSTO */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seu papel como Preposto (Responsável)
              </h4>
              <ul className="mt-2 space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Você será o <strong>responsável</strong> pela condução do assessment da sua empresa</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Poderá convidar até <strong>{maxUsers}</strong> usuários (de acordo com seu plano)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Atribuir controles específicos para cada usuário</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Acompanhar o progresso em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Visualizar relatórios consolidados do assessment</span>
                </li>
              </ul>
            </div>

            {/* 🔴 SEÇÃO: FLUXO DE CONVITE */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Como funciona o convite para usuários?
              </h4>
              <ul className="mt-2 space-y-2 text-sm text-yellow-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-yellow-800">1.</span>
                  <span>Após o cadastro, acesse o painel do Preposto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-yellow-800">2.</span>
                  <span>Clique em "Convidar Usuário" e informe o email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-yellow-800">3.</span>
                  <span>O usuário receberá um e-mail para criar sua senha</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-yellow-800">4.</span>
                  <span>Após criar a senha, o usuário poderá responder aos controles atribuídos</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex justify-end">
            <Button
              onClick={handleAcceptTerms}
              className="bg-[#30736C] hover:bg-[#1E5359] text-white px-8 py-2"
            >
              Entendi, vamos começar!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔴 MODAL DE SUCESSO - APÓS O CADASTRO */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-[#122A40]">
              Cadastro realizado com sucesso! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Bem-vindo ao Code Assessment!
              <br /><br />
              Um e-mail de confirmação foi enviado para <strong>{registeredEmail}</strong>.
              <br /><br />
              Agora você pode fazer login e começar a gerenciar sua empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700 font-medium">
                📋 Próximos passos:
              </p>
              <ul className="mt-1 text-xs text-blue-600 space-y-1">
                <li>1. Faça login com seu email e senha</li>
                <li>2. Acesse o painel do Preposto</li>
                <li>3. Convide usuários e atribua controles</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex justify-center">
            <Button
              onClick={handleGoToLogin}
              className="bg-[#30736C] hover:bg-[#1E5359] text-white px-8 py-2"
            >
              Ir para Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4 py-8">
        <Container size="md">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Seleção de Plano - Versão simplificada para o formulário */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione seu plano
                </label>
                {loadingPlans ? (
                  <div className="text-center py-4 text-gray-500">Carregando planos...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanName === plan.name;
                      return (
                        <div
                          key={plan._id}
                          onClick={() => {
                            setSelectedPlan(plan.name);
                            setValue('plan', plan.name);
                          }}
                          className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                            isSelected
                              ? 'border-[#30736C] bg-[#30736C]/5 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {plan.displayName}
                                </h4>
                                {plan.isPopular && (
                                  <span className="text-[10px] font-bold text-[#30736C] bg-[#30736C]/10 px-2 py-0.5 rounded-full">
                                    ★ Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {plan.features.maxUsers === 0 ? 'Ilimitado' : plan.features.maxUsers} usuários
                              </p>
                              <p className="text-sm font-bold text-gray-900 mt-1">
                                {formatPrice(plan.priceMonthly)}
                                <span className="text-xs font-normal text-gray-500">/mês</span>
                              </p>
                              {plan.badge && (
                                <span className="text-[10px] text-gray-400 mt-0.5 block">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-[#30736C] bg-[#30736C]'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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

                  {/* 🔴 CAMPO OCULTO: Role = REP (Preposto) */}
                  <input type="hidden" name="role" value="rep" />
                  
                  {/* Campo oculto para o plano */}
                  <input type="hidden" {...register('plan')} />
                </FormGroup>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Entrar
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/terms" className="text-[#30736C] hover:underline">
                  Termos de Serviço
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-[#30736C] hover:underline">
                  Política de Privacidade
                </Link>
              </p>
            </CardFooter>
          </Card>
        </Container>
      </div>
    </>
  );
};