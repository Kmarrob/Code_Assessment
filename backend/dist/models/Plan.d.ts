import mongoose, { Model } from 'mongoose';
/**
 * Features disponíveis para cada plano
 */
export interface IPlanFeatures {
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
 * Modelo de Plano
 */
export interface IPlan {
    _id: mongoose.Types.ObjectId;
    name: 'basic' | 'pro' | 'enterprise' | 'trial';
    displayName: string;
    description: string;
    priceMonthly: number;
    priceAnnual: number;
    pricePerUser: number;
    features: IPlanFeatures;
    isActive: boolean;
    isPublic: boolean;
    trialDays: number;
    allowCustomPricing: boolean;
    customPriceMonthly?: number;
    customPriceAnnual?: number;
    sortOrder: number;
    badge?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}
export interface PlanModel extends Model<IPlan> {
    getDefaultPlans(): Promise<IPlan[]>;
    getPlanByName(name: string): Promise<IPlan | null>;
    getPublicPlans(): Promise<IPlan[]>;
}
export declare const Plan: PlanModel;
export declare const seedPlans: () => Promise<void>;
//# sourceMappingURL=Plan.d.ts.map