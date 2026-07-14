// frontend/src/services/plan.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';

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

export interface PriceCalculation {
  basePrice: number;
  extraUsers: number;
  extraPrice: number;
  total: number;
}

export const planService = {
  /**
   * Obter planos públicos (página de planos)
   * GET /api/plans/public
   */
  async getPublicPlans(): Promise<{ plans: Plan[] }> {
    const response = await api.get<ApiResponse<{ plans: Plan[] }>>('/plans/public');
    return response.data.data;
  },

  /**
   * Listar todos os planos (admin)
   * GET /api/admin/plans
   */
  async listPlans(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isPublic?: boolean;
  }): Promise<{ plans: Plan[]; pagination: any }> {
    const response = await api.get<ApiResponse<{ plans: Plan[]; pagination: any }>>('/admin/plans', {
      params,
    });
    return response.data.data;
  },

  /**
   * Obter plano por ID
   * GET /api/admin/plans/:id
   */
  async getPlanById(id: string): Promise<Plan> {
    const response = await api.get<ApiResponse<{ plan: Plan }>>(`/admin/plans/${id}`);
    return response.data.data.plan;
  },

  /**
   * Criar novo plano (admin)
   * POST /api/admin/plans
   */
  async createPlan(data: CreatePlanData): Promise<Plan> {
    const response = await api.post<ApiResponse<{ plan: Plan }>>('/admin/plans', data);
    return response.data.data.plan;
  },

  /**
   * Atualizar plano (admin)
   * PUT /api/admin/plans/:id
   */
  async updatePlan(id: string, data: UpdatePlanData): Promise<Plan> {
    const response = await api.put<ApiResponse<{ plan: Plan }>>(`/admin/plans/${id}`, data);
    return response.data.data.plan;
  },

  /**
   * Deletar plano (admin)
   * DELETE /api/admin/plans/:id
   */
  async deletePlan(id: string): Promise<void> {
    await api.delete(`/admin/plans/${id}`);
  },

  /**
   * Calcular preço efetivo de um plano
   * GET /api/plans/:id/calculate?users=5&annual=true
   */
  async calculatePrice(
    planId: string,
    userCount: number = 1,
    isAnnual: boolean = false
  ): Promise<PriceCalculation> {
    const response = await api.get<ApiResponse<PriceCalculation>>(
      `/plans/${planId}/calculate`,
      {
        params: {
          users: userCount,
          annual: isAnnual,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Obter plano por nome
   */
  async getPlanByName(name: string): Promise<Plan | null> {
    try {
      const plans = await this.getPublicPlans();
      return plans.plans.find((p) => p.name === name) || null;
    } catch {
      return null;
    }
  },

  /**
   * Formatar preço para exibição
   */
  formatPrice(price: number): string {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  },

  /**
   * Obter descrição do limite de usuários
   */
  getUserLimitDisplay(features: PlanFeature): string {
    if (features.maxUsers >= 999) return 'Ilimitado';
    return `Até ${features.maxUsers}`;
  },

  /**
   * Verificar se plano tem uma feature específica
   */
  hasFeature(plan: Plan, feature: keyof PlanFeature): boolean {
    return plan.features[feature] as boolean;
  },
};