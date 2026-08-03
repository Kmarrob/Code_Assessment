import { Document, Types } from 'mongoose';
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
    governance: boolean;
}
export interface IPlan extends Document {
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
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=plan.types.d.ts.map