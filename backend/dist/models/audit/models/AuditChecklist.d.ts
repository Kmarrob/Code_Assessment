import mongoose from 'mongoose';
export interface IAuditChecklistQuestion {
    question: string;
    answer: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
    observations: string;
    evidenceIds: string[];
    responsible: string;
    answeredAt?: Date;
    answeredBy?: string;
}
export interface IAuditChecklist {
    _id: string;
    auditPlanId: string;
    controlId: string;
    questions: IAuditChecklistQuestion[];
    statistics: {
        total: number;
        conforme: number;
        nonConforme: number;
        observacao: number;
        oportunidade: number;
        naoAplicavel: number;
    };
    status: 'pending' | 'in_progress' | 'completed';
    completedBy?: string;
    completedAt?: Date;
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare const AuditChecklist: mongoose.Model<IAuditChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IAuditChecklist, {}, {}> & IAuditChecklist & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditChecklist.d.ts.map