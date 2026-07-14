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
import { User, Building, Shield, CheckCircle, Crown, Sparkles, Star } from 'lucide-react';
import { RegisterMetaTags } from '../components/MetaTags.js';
import { planService } from '../services/plan.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

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
      // TODO: Integrar com o registro de empresa + plano
      await registerUser(data);
      navigate('/login');
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

  return (
    <>
      <RegisterMetaTags />
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
                Comece sua jornada de assessment digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Seleção de Plano */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Escolha seu plano
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
                                {plan.features.maxUsers === 999 ? 'Ilimitado' : plan.features.maxUsers} usuários
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