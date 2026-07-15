import { IPlan } from '../types/plan.types.js';
export interface CreatePlanData {
    name: 'basic' | 'pro' | 'enterprise' | 'trial';
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
        consultingHoursUsed: number;
        supportPriority: 'low' | 'medium' | 'high' | 'critical';
        supportHours: 'business' | 'extended' | '24x7';
        canCustomizeBranding: boolean;
        canAddCustomControls: boolean;
        canIntegrateAPI: boolean;
        canIntegrateSSO: boolean;
    };
    sortOrder?: number;
    badge?: string;
    trialDays?: number;
    isActive?: boolean;
    isPublic?: boolean;
    allowCustomPricing?: boolean;
    createdBy?: string;
}
export interface UpdatePlanData {
    displayName?: string;
    description?: string;
    priceMonthly?: number;
    priceAnnual?: number;
    pricePerUser?: number;
    features?: Partial<CreatePlanData['features']>;
    sortOrder?: number;
    badge?: string;
    isActive?: boolean;
    isPublic?: boolean;
    allowCustomPricing?: boolean;
    customPriceMonthly?: number;
    customPriceAnnual?: number;
    trialDays?: number;
}
export declare class PlanService {
    /**
     * Criar um novo plano
     */
    static createPlan(data: CreatePlanData, userId: string): Promise<IPlan>;
    /**
     * Listar todos os planos (admin)
     */
    static listPlans(filters?: {
        isActive?: boolean;
        isPublic?: boolean;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        plans: IPlan[];
        total: number;
        totalPages: number;
    }>;
    /**
   * Obter planos públicos (para página de planos)
   */
    static getPublicPlans(): Promise<IPlan[]>;
    /**
     * Obter plano por ID
     */
    static getPlanById(planId: string): Promise<IPlan>;
    /**
     * Obter plano por nome
     */
    static getPlanByName(name: string): Promise<IPlan | null>;
    /**
     * Atualizar plano
     */
    static updatePlan(planId: string, data: UpdatePlanData, userId: string): Promise<IPlan>;
    /**
     * Deletar plano (soft delete - apenas desativa)
     */
    static deletePlan(planId: string, userId: string): Promise<void>;
    /**
     * Obter plano padrão (basic)
     */
    static getDefaultPlan(): Promise<IPlan | null>;
    /**
     * Calcular preço efetivo com base no número de usuários
     */
    static calculateEffectivePrice(planId: string, userCount: number, isAnnual?: boolean): Promise<{
        basePrice: number;
        extraUsers: number;
        extraPrice: number;
        total: number;
    }>;
    /**
     * Verificar se um plano tem uma feature específica
     */
    static hasFeature(planId: string, feature: keyof IPlan['features']): Promise<boolean>;
    /**
     * Obter todos os planos ativos (para cache)
     */
    static getActivePlans(): Promise<IPlan[]>;
}
//# sourceMappingURL=PlanService.d.ts.map