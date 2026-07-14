// frontend/src/types/plan.ts

/**
 * Features disponíveis em um plano
 */
export interface PlanFeature {
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
  consultingHoursUsed: number;
  supportPriority: 'low' | 'medium' | 'high' | 'critical';
  supportHours: 'business' | 'extended' | '24x7';
  canCustomizeBranding: boolean;
  canAddCustomControls: boolean;
  canIntegrateAPI: boolean;
  canIntegrateSSO: boolean;
}

/**
 * Plano de assinatura
 */
export interface Plan {
  _id: string;
  name: 'basic' | 'pro' | 'enterprise' | 'trial';
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  pricePerUser: number;
  features: PlanFeature;
  isActive: boolean;
  isPublic: boolean;
  trialDays: number;
  allowCustomPricing: boolean;
  customPriceMonthly?: number;
  customPriceAnnual?: number;
  sortOrder: number;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para criar um plano (admin)
 */
export interface CreatePlanData {
  name: 'basic' | 'pro' | 'enterprise' | 'trial';
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  pricePerUser: number;
  features: Omit<PlanFeature, 'consultingHoursUsed'>;
  sortOrder?: number;
  badge?: string;
  trialDays?: number;
  isActive?: boolean;
  isPublic?: boolean;
  allowCustomPricing?: boolean;
}

/**
 * Dados para atualizar um plano (admin)
 */
export interface UpdatePlanData {
  displayName?: string;
  description?: string;
  priceMonthly?: number;
  priceAnnual?: number;
  pricePerUser?: number;
  features?: Partial<PlanFeature>;
  sortOrder?: number;
  badge?: string;
  isActive?: boolean;
  isPublic?: boolean;
  allowCustomPricing?: boolean;
  customPriceMonthly?: number;
  customPriceAnnual?: number;
  trialDays?: number;
}

/**
 * Resposta do cálculo de preço
 */
export interface PriceCalculation {
  basePrice: number;
  extraUsers: number;
  extraPrice: number;
  total: number;
}

/**
 * Assinatura do usuário
 */
export interface Subscription {
  _id: string;
  companyId: string;
  planId: string;
  planName: string;
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired' | 'pending' | 'trialing';
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  userCount: number;
  pricePerUser: number;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature;
  isAnnual: boolean;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  autoRenew: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagamento realizado
 */
export interface Payment {
  _id: string;
  subscriptionId: string;
  companyId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'chargeback' | 'processing' | 'cancelled' | 'expired';
  method: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  provider: string;
  providerPaymentId?: string;
  providerWebhookData?: Record<string, any>;
  paidAt?: string;
  refundedAt?: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resumo da assinatura para exibição no billing
 */
export interface SubscriptionSummary {
  plan: Plan;
  subscription: Subscription;
  nextPayment: {
    date: string;
    amount: number;
  } | null;
  isTrialing: boolean;
  daysUntilTrialEnd: number;
  isCancelled: boolean;
  canCancel: boolean;
  canReactivate: boolean;
}

// ============================================
// HELPERS E UTILITÁRIOS
// ============================================

/**
 * Verifica se o plano tem uma feature específica
 */
export const hasFeature = (plan: Plan | null, feature: keyof PlanFeature): boolean => {
  if (!plan) return false;
  return Boolean(plan.features[feature]);
};

/**
 * Obtém label do nível de suporte
 */
export const getSupportPriorityLabel = (priority: PlanFeature['supportPriority']): string => {
  const labels: Record<PlanFeature['supportPriority'], string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  };
  return labels[priority] || 'Média';
};

/**
 * Obtém label do horário de suporte
 */
export const getSupportHoursLabel = (hours: PlanFeature['supportHours']): string => {
  const labels: Record<PlanFeature['supportHours'], string> = {
    business: 'Horário Comercial',
    extended: 'Horário Estendido',
    '24x7': '24x7',
  };
  return labels[hours] || 'Horário Comercial';
};

/**
 * Formata preço para exibição em Reais
 */
export const formatPrice = (price: number): string => {
  return (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Obtém descrição do limite de usuários
 */
export const getUserLimitDisplay = (features: PlanFeature): string => {
  if (features.maxUsers === 0) return 'Ilimitado';
  return `Até ${features.maxUsers} usuários`;
};

/**
 * Obtém cor do plano para badges e ícones
 */
export const getPlanColor = (planName: Plan['name']): string => {
  const colors: Record<Plan['name'], string> = {
    basic: 'blue',
    pro: 'purple',
    enterprise: 'amber',
    trial: 'green',
  };
  return colors[planName] || 'gray';
};

/**
 * Obtém ícone do plano (nome do lucide)
 */
export const getPlanIconName = (planName: Plan['name']): string => {
  const icons: Record<Plan['name'], string> = {
    basic: 'TrendingUp',
    pro: 'Sparkles',
    enterprise: 'Crown',
    trial: 'Rocket',
  };
  return icons[planName] || 'Package';
};

/**
 * Obtém label do status da assinatura
 */
export const getSubscriptionStatusLabel = (status: Subscription['status']): string => {
  const labels: Record<Subscription['status'], string> = {
    trial: 'Em teste',
    trialing: 'Em teste',
    active: 'Ativa',
    past_due: 'Pagamento pendente',
    suspended: 'Suspensa',
    cancelled: 'Cancelada',
    expired: 'Expirada',
    pending: 'Pendente',
  };
  return labels[status] || status;
};

/**
 * Obtém cor do status da assinatura
 */
export const getSubscriptionStatusColor = (status: Subscription['status']): string => {
  const colors: Record<Subscription['status'], string> = {
    trial: 'text-blue-600 bg-blue-50',
    trialing: 'text-blue-600 bg-blue-50',
    active: 'text-green-600 bg-green-50',
    past_due: 'text-yellow-600 bg-yellow-50',
    suspended: 'text-red-600 bg-red-50',
    cancelled: 'text-gray-600 bg-gray-50',
    expired: 'text-gray-600 bg-gray-50',
    pending: 'text-yellow-600 bg-yellow-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

/**
 * Obtém label do método de pagamento
 */
export const getPaymentMethodLabel = (method: Payment['method']): string => {
  const labels: Record<Payment['method'], string> = {
    credit_card: 'Cartão de Crédito',
    boleto: 'Boleto Bancário',
    pix: 'Pix',
    bank_transfer: 'Transferência Bancária',
  };
  return labels[method] || method;
};

/**
 * Obtém label do status do pagamento
 */
export const getPaymentStatusLabel = (status: Payment['status']): string => {
  const labels: Record<Payment['status'], string> = {
    pending: 'Pendente',
    paid: 'Pago',
    failed: 'Falhou',
    refunded: 'Estornado',
    chargeback: 'Chargeback',
    processing: 'Processando',
    cancelled: 'Cancelado',
    expired: 'Expirado',
  };
  return labels[status] || status;
};