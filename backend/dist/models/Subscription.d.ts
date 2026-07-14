import mongoose, { Model } from 'mongoose';
/**
 * Status da assinatura
 */
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired' | 'pending' | 'trialing';
/**
 * Modelo de Assinatura
 */
export interface ISubscription {
    _id: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    trialStartDate?: Date;
    trialEndDate?: Date;
    cancelledAt?: Date;
    suspendedAt?: Date;
    reactivatedAt?: Date;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    amount: number;
    currency: 'BRL' | 'USD';
    billingCycle: 'monthly' | 'annual';
    autoRenew: boolean;
    maxUsers: number;
    currentUsers: number;
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
    consultingHoursTotal: number;
    consultingHoursUsed: number;
    consultingHoursRemaining: number;
    paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
    paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
    paymentId?: string;
    subscriptionId?: string;
    changeHistory: Array<{
        fromPlan: string;
        toPlan: string;
        changedAt: Date;
        changedBy: mongoose.Types.ObjectId;
        reason?: string;
    }>;
    metadata?: Record<string, any>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}
export interface SubscriptionModel extends Model<ISubscription> {
    findActiveByCompany(companyId: string): Promise<ISubscription | null>;
    findByCompany(companyId: string): Promise<ISubscription[]>;
    findExpired(): Promise<ISubscription[]>;
    findPastDue(): Promise<ISubscription[]>;
    getActiveCount(): Promise<number>;
}
export declare const Subscription: SubscriptionModel;
//# sourceMappingURL=Subscription.d.ts.map