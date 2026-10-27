import mongoose from 'mongoose';
export interface IAuditChecklistQuestion {
    question: string;
    /**
     * C  = Conforme
     * NC = Não Conforme
     * OB = Observação
     * OM = Oportunidade
     * NA = Não Aplicável
     * -- = Não Respondido
     */
    answer: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
    observations: string;
    evidenceIds: string[];
    responsible: string;
    answeredAt?: Date;
    answeredBy?: string;
}
export interface IAuditChecklistAuditQuestion {
    /**
     * ID original da AuditControlQuestion no momento da geração.
     * Usado apenas para rastreabilidade.
     */
    sourceQuestionId?: string;
    /**
     * Texto da pergunta de auditoria (snapshot).
     */
    text: string;
    /**
     * Objetivo da pergunta (snapshot).
     */
    objective?: string;
    /**
     * Orientação ao auditor (snapshot).
     */
    guidance?: string;
    /**
     * Evidência esperada (snapshot).
     */
    evidenceExpected?: string;
    /**
     * Ordem de exibição dentro do controle.
     */
    order: number;
    /**
     * Resposta do auditor.
     * Mesmo enum das perguntas do Assessment.
     */
    answer: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
    /**
     * Observação do auditor para esta pergunta.
     */
    observations: string;
    /**
     * IDs das evidências anexadas pelo auditor.
     */
    evidenceIds: string[];
    answeredAt?: Date;
    answeredBy?: string;
}
export interface IAuditChecklistAuditStatistics {
    total: number;
    conforme: number;
    nonConforme: number;
    observacao: number;
    oportunidade: number;
    naoAplicavel: number;
}
export interface IAuditChecklist {
    _id: string;
    auditPlanId: string;
    controlId: string;
    questions: IAuditChecklistQuestion[];
    /**
     * Perguntas de auditoria do controle (vindas de
     * AuditControlQuestion no momento da geração).
     *
     * Opcional: checklists antigos não têm este campo.
     */
    auditQuestions?: IAuditChecklistAuditQuestion[];
    /**
     * Constatação final consolidada do controle.
     * O auditor marca após revisar todas as perguntas de auditoria.
     */
    finalConclusion?: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--';
    /**
     * Observação geral do controle.
     */
    finalObservation?: string;
    /**
     * Evidências anexadas à constatação final.
     */
    finalEvidenceIds?: string[];
    /**
     * Justificativa (obrigatória se não houver evidência final).
     */
    finalJustification?: string;
    statistics: {
        total: number;
        conforme: number;
        nonConforme: number;
        observacao: number;
        oportunidade: number;
        naoAplicavel: number;
    };
    /**
     * Estatísticas das perguntas de auditoria.
     * Separada das estatísticas do Assessment.
     */
    auditStatistics?: IAuditChecklistAuditStatistics;
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