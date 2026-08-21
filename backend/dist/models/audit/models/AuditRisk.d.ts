import mongoose from 'mongoose';
export interface IAuditRisk {
    _id: string;
    companyId: string;
    auditPlanId?: string;
    id: string;
    description: string;
    eventOrAsset: string;
    owner: string;
    threat: string;
    vulnerability: string;
    existingControl: string;
    probability: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskClassification: string;
    treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
    treatmentPlan: string;
    probabilityAfter: 1 | 2 | 3 | 4 | 5;
    impactAfter: 1 | 2 | 3 | 4 | 5;
    residualRisk: 'low' | 'medium' | 'high' | 'critical';
    status: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
    treatmentDeadline?: Date;
    treatedAt?: Date;
    treatedBy?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditRisk: mongoose.Model<IAuditRisk, {}, {}, {}, mongoose.Document<unknown, {}, IAuditRisk, {}, {}> & IAuditRisk & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditRisk.d.ts.map