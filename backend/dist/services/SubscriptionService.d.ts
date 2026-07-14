import { ISubscription, SubscriptionStatus } from '../models/Subscription.js';
export interface CreateSubscriptionData {
    companyId: string;
    planId: string;
    userId: string;
    billingCycle: 'monthly' | 'annual';
    autoRenew?: boolean;
    paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
    paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
    paymentId?: string;
    subscriptionId?: string;
    notes?: string;
}
export interface UpdateSubscriptionData {
    status?: SubscriptionStatus;
    planId?: string;
    autoRenew?: boolean;
    maxUsers?: number;
    currentUsers?: number;
    consultingHoursUsed?: number;
    notes?: string;
}
export interface SubscriptionStatusResult {
    isActive: boolean;
    status: SubscriptionStatus;
    daysUntilExpiration: number;
    daysUntilTrialEnd: number;
    isOnTrial: boolean;
    isExpired: boolean;
    isSuspended: boolean;
}
export declare class SubscriptionService {
    /**
     * Criar uma nova assinatura
     */
    static createSubscription(data: CreateSubscriptionData): Promise<ISubscription>;
    /**
     * Ativar assinatura (após pagamento confirmado)
     */
    static activateSubscription(subscriptionId: string): Promise<ISubscription>;
    /**
     * Obter assinatura ativa de uma empresa
     */
    static getActiveSubscription(companyId: string): Promise<ISubscription | null>;
    /**
     * Obter histórico de assinaturas de uma empresa
     */
    static getSubscriptionHistory(companyId: string): Promise<ISubscription[]>;
    /**
     * Verificar status da assinatura
     */
    static checkSubscriptionStatus(companyId: string): Promise<SubscriptionStatusResult>;
    /**
     * Atualizar assinatura
     */
    static updateSubscription(subscriptionId: string, data: UpdateSubscriptionData, userId: string): Promise<ISubscription>;
    /**
     * Cancelar assinatura
     */
    static cancelSubscription(subscriptionId: string, userId: string, reason?: string): Promise<ISubscription>;
    /**
     * Suspender assinatura (por não pagamento)
     */
    static suspendSubscription(subscriptionId: string, userId: string, reason?: string): Promise<ISubscription>;
    /**
     * Reativar assinatura (após pagamento)
     */
    static reactivateSubscription(subscriptionId: string, userId: string): Promise<ISubscription>;
    /**
     * Processar renovações automáticas (job diário)
     */
    static processAutoRenewals(): Promise<{
        renewed: number;
        suspended: number;
        errors: number;
    }>;
    /**
     * Obter métricas de assinaturas (admin)
     */
    static getSubscriptionMetrics(): Promise<{
        total: number;
        active: number;
        trial: number;
        suspended: number;
        cancelled: number;
        expired: number;
        byPlan: Record<string, number>;
        monthlyRevenue: number;
        annualRevenue: number;
    }>;
    /**
     * 🔴 NOVO: Obter assinatura por ID
     */
    static getSubscriptionById(subscriptionId: string): Promise<ISubscription>;
}
//# sourceMappingURL=SubscriptionService.d.ts.map