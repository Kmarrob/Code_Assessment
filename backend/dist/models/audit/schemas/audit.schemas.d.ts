import { z } from 'zod';
export declare const createAuditPlanSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    companyId: z.ZodString;
    programId: z.ZodOptional<z.ZodString>;
    scope: z.ZodObject<{
        controls: z.ZodArray<z.ZodString, "many">;
        processes: z.ZodArray<z.ZodString, "many">;
        areas: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        controls: string[];
        processes: string[];
        areas: string[];
    }, {
        controls: string[];
        processes: string[];
        areas: string[];
    }>;
    team: z.ZodObject<{
        leadAuditor: z.ZodString;
        auditors: z.ZodArray<z.ZodString, "many">;
        observers: z.ZodArray<z.ZodString, "many">;
        specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    }, {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    }>;
    period: z.ZodObject<{
        startDate: z.ZodEffects<z.ZodString, Date, string>;
        endDate: z.ZodEffects<z.ZodString, Date, string>;
        estimatedDays: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startDate: Date;
        endDate: Date;
        estimatedDays: number;
    }, {
        startDate: string;
        endDate: string;
        estimatedDays: number;
    }>;
    criteria: z.ZodArray<z.ZodString, "many">;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    description: string;
    title: string;
    scope: {
        controls: string[];
        processes: string[];
        areas: string[];
    };
    period: {
        startDate: Date;
        endDate: Date;
        estimatedDays: number;
    };
    team: {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    };
    criteria: string[];
    observations?: string | undefined;
    programId?: string | undefined;
}, {
    companyId: string;
    description: string;
    title: string;
    scope: {
        controls: string[];
        processes: string[];
        areas: string[];
    };
    period: {
        startDate: string;
        endDate: string;
        estimatedDays: number;
    };
    team: {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    };
    criteria: string[];
    observations?: string | undefined;
    programId?: string | undefined;
}>;
export declare const updateAuditPlanSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
    programId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    scope: z.ZodOptional<z.ZodObject<{
        controls: z.ZodArray<z.ZodString, "many">;
        processes: z.ZodArray<z.ZodString, "many">;
        areas: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        controls: string[];
        processes: string[];
        areas: string[];
    }, {
        controls: string[];
        processes: string[];
        areas: string[];
    }>>;
    team: z.ZodOptional<z.ZodObject<{
        leadAuditor: z.ZodString;
        auditors: z.ZodArray<z.ZodString, "many">;
        observers: z.ZodArray<z.ZodString, "many">;
        specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    }, {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    }>>;
    period: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodEffects<z.ZodString, Date, string>;
        endDate: z.ZodEffects<z.ZodString, Date, string>;
        estimatedDays: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startDate: Date;
        endDate: Date;
        estimatedDays: number;
    }, {
        startDate: string;
        endDate: string;
        estimatedDays: number;
    }>>;
    criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    description?: string | undefined;
    title?: string | undefined;
    observations?: string | undefined;
    scope?: {
        controls: string[];
        processes: string[];
        areas: string[];
    } | undefined;
    period?: {
        startDate: Date;
        endDate: Date;
        estimatedDays: number;
    } | undefined;
    programId?: string | undefined;
    team?: {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    } | undefined;
    criteria?: string[] | undefined;
}, {
    companyId?: string | undefined;
    description?: string | undefined;
    title?: string | undefined;
    observations?: string | undefined;
    scope?: {
        controls: string[];
        processes: string[];
        areas: string[];
    } | undefined;
    period?: {
        startDate: string;
        endDate: string;
        estimatedDays: number;
    } | undefined;
    programId?: string | undefined;
    team?: {
        leadAuditor: string;
        auditors: string[];
        observers: string[];
        specialists?: string[] | undefined;
    } | undefined;
    criteria?: string[] | undefined;
}>;
export declare const updateChecklistSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        answer: z.ZodEnum<["C", "NC", "OB", "OM", "NA"]>;
        observations: z.ZodOptional<z.ZodString>;
        evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        responsible: z.ZodString;
        answeredAt: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        answeredBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        responsible: string;
        question: string;
        answer: "C" | "NC" | "OB" | "OM" | "NA";
        observations?: string | undefined;
        evidenceIds?: string[] | undefined;
        answeredAt?: Date | undefined;
        answeredBy?: string | undefined;
    }, {
        responsible: string;
        question: string;
        answer: "C" | "NC" | "OB" | "OM" | "NA";
        observations?: string | undefined;
        evidenceIds?: string[] | undefined;
        answeredAt?: string | undefined;
        answeredBy?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    questions: {
        responsible: string;
        question: string;
        answer: "C" | "NC" | "OB" | "OM" | "NA";
        observations?: string | undefined;
        evidenceIds?: string[] | undefined;
        answeredAt?: Date | undefined;
        answeredBy?: string | undefined;
    }[];
}, {
    questions: {
        responsible: string;
        question: string;
        answer: "C" | "NC" | "OB" | "OM" | "NA";
        observations?: string | undefined;
        evidenceIds?: string[] | undefined;
        answeredAt?: string | undefined;
        answeredBy?: string | undefined;
    }[];
}>;
export declare const createAuditFindingSchema: z.ZodObject<{
    auditPlanId: z.ZodString;
    checklistId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["NC_A", "NC_B", "CM", "OM", "AP"]>;
    title: z.ZodString;
    description: z.ZodString;
    area: z.ZodString;
    process: z.ZodString;
    clause: z.ZodString;
    controlId: z.ZodOptional<z.ZodString>;
    evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deadline: z.ZodEffects<z.ZodString, Date, string>;
}, "strip", z.ZodTypeAny, {
    type: "OM" | "NC_A" | "NC_B" | "CM" | "AP";
    description: string;
    title: string;
    area: string;
    auditPlanId: string;
    process: string;
    clause: string;
    deadline: Date;
    controlId?: string | undefined;
    evidenceIds?: string[] | undefined;
    checklistId?: string | undefined;
}, {
    type: "OM" | "NC_A" | "NC_B" | "CM" | "AP";
    description: string;
    title: string;
    area: string;
    auditPlanId: string;
    process: string;
    clause: string;
    deadline: string;
    controlId?: string | undefined;
    evidenceIds?: string[] | undefined;
    checklistId?: string | undefined;
}>;
export declare const updateAuditFindingSchema: z.ZodObject<{
    auditPlanId: z.ZodOptional<z.ZodString>;
    checklistId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<["NC_A", "NC_B", "CM", "OM", "AP"]>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodString>;
    process: z.ZodOptional<z.ZodString>;
    clause: z.ZodOptional<z.ZodString>;
    controlId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    evidenceIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    deadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
}, "strip", z.ZodTypeAny, {
    type?: "OM" | "NC_A" | "NC_B" | "CM" | "AP" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    controlId?: string | undefined;
    area?: string | undefined;
    auditPlanId?: string | undefined;
    evidenceIds?: string[] | undefined;
    checklistId?: string | undefined;
    process?: string | undefined;
    clause?: string | undefined;
    deadline?: Date | undefined;
}, {
    type?: "OM" | "NC_A" | "NC_B" | "CM" | "AP" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    controlId?: string | undefined;
    area?: string | undefined;
    auditPlanId?: string | undefined;
    evidenceIds?: string[] | undefined;
    checklistId?: string | undefined;
    process?: string | undefined;
    clause?: string | undefined;
    deadline?: string | undefined;
}>;
export declare const createAuditActionPlanSchema: z.ZodObject<{
    findingId: z.ZodString;
    auditPlanId: z.ZodString;
    companyId: z.ZodString;
    action: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    responsible: z.ZodString;
    deadline: z.ZodEffects<z.ZodString, Date, string>;
    evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    action: string;
    responsible: string;
    auditPlanId: string;
    deadline: Date;
    findingId: string;
    description?: string | undefined;
    evidenceIds?: string[] | undefined;
}, {
    companyId: string;
    action: string;
    responsible: string;
    auditPlanId: string;
    deadline: string;
    findingId: string;
    description?: string | undefined;
    evidenceIds?: string[] | undefined;
}>;
export declare const updateAuditActionPlanSchema: z.ZodObject<{
    findingId: z.ZodOptional<z.ZodString>;
    auditPlanId: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    responsible: z.ZodOptional<z.ZodString>;
    deadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    evidenceIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    description?: string | undefined;
    action?: string | undefined;
    responsible?: string | undefined;
    auditPlanId?: string | undefined;
    evidenceIds?: string[] | undefined;
    deadline?: Date | undefined;
    findingId?: string | undefined;
}, {
    companyId?: string | undefined;
    description?: string | undefined;
    action?: string | undefined;
    responsible?: string | undefined;
    auditPlanId?: string | undefined;
    evidenceIds?: string[] | undefined;
    deadline?: string | undefined;
    findingId?: string | undefined;
}>;
export declare const createAuditReportSchema: z.ZodObject<{
    auditPlanId: z.ZodString;
    companyId: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    organization: z.ZodObject<{
        legalName: z.ZodString;
        corporateGroup: z.ZodOptional<z.ZodString>;
        address: z.ZodString;
        country: z.ZodString;
        contact: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        language: z.ZodString;
        scope: z.ZodString;
        industry: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    }, {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    }>;
    profile: z.ZodObject<{
        standards: z.ZodArray<z.ZodString, "many">;
        auditType: z.ZodEnum<["internal", "external", "supplier"]>;
        documentation: z.ZodString;
        frequency: z.ZodString;
        leadAuditor: z.ZodString;
        auditTeam: z.ZodArray<z.ZodString, "many">;
        specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        trainees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        multiSite: z.ZodDefault<z.ZodBoolean>;
        sites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        operationalShifts: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        multiSite: boolean;
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        sites?: string[] | undefined;
    }, {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        multiSite?: boolean | undefined;
        sites?: string[] | undefined;
    }>;
    details: z.ZodObject<{
        auditedLocations: z.ZodArray<z.ZodString, "many">;
        auditDate: z.ZodEffects<z.ZodString, Date, string>;
        auditEndDate: z.ZodEffects<z.ZodString, Date, string>;
        workDays: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        auditedLocations: string[];
        auditDate: Date;
        auditEndDate: Date;
        workDays: number;
    }, {
        auditedLocations: string[];
        auditDate: string;
        auditEndDate: string;
        workDays: number;
    }>;
    summary: z.ZodString;
    conclusion: z.ZodString;
    followUp: z.ZodObject<{
        required: z.ZodDefault<z.ZodEnum<["none", "reaudit", "next_audit"]>>;
        details: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        required: "none" | "reaudit" | "next_audit";
        details?: string | undefined;
    }, {
        required?: "none" | "reaudit" | "next_audit" | undefined;
        details?: string | undefined;
    }>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["checklist", "questionnaire", "evidence", "other"]>;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }, {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    version: string;
    details: {
        auditedLocations: string[];
        auditDate: Date;
        auditEndDate: Date;
        workDays: number;
    };
    summary: string;
    auditPlanId: string;
    organization: {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    };
    profile: {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        multiSite: boolean;
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        sites?: string[] | undefined;
    };
    conclusion: string;
    followUp: {
        required: "none" | "reaudit" | "next_audit";
        details?: string | undefined;
    };
    attachments?: {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }[] | undefined;
}, {
    companyId: string;
    details: {
        auditedLocations: string[];
        auditDate: string;
        auditEndDate: string;
        workDays: number;
    };
    summary: string;
    auditPlanId: string;
    organization: {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    };
    profile: {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        multiSite?: boolean | undefined;
        sites?: string[] | undefined;
    };
    conclusion: string;
    followUp: {
        required?: "none" | "reaudit" | "next_audit" | undefined;
        details?: string | undefined;
    };
    version?: string | undefined;
    attachments?: {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }[] | undefined;
}>;
export declare const updateAuditReportSchema: z.ZodObject<{
    auditPlanId: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    organization: z.ZodOptional<z.ZodObject<{
        legalName: z.ZodString;
        corporateGroup: z.ZodOptional<z.ZodString>;
        address: z.ZodString;
        country: z.ZodString;
        contact: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        language: z.ZodString;
        scope: z.ZodString;
        industry: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    }, {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    }>>;
    profile: z.ZodOptional<z.ZodObject<{
        standards: z.ZodArray<z.ZodString, "many">;
        auditType: z.ZodEnum<["internal", "external", "supplier"]>;
        documentation: z.ZodString;
        frequency: z.ZodString;
        leadAuditor: z.ZodString;
        auditTeam: z.ZodArray<z.ZodString, "many">;
        specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        trainees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        multiSite: z.ZodDefault<z.ZodBoolean>;
        sites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        operationalShifts: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        multiSite: boolean;
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        sites?: string[] | undefined;
    }, {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        multiSite?: boolean | undefined;
        sites?: string[] | undefined;
    }>>;
    details: z.ZodOptional<z.ZodObject<{
        auditedLocations: z.ZodArray<z.ZodString, "many">;
        auditDate: z.ZodEffects<z.ZodString, Date, string>;
        auditEndDate: z.ZodEffects<z.ZodString, Date, string>;
        workDays: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        auditedLocations: string[];
        auditDate: Date;
        auditEndDate: Date;
        workDays: number;
    }, {
        auditedLocations: string[];
        auditDate: string;
        auditEndDate: string;
        workDays: number;
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    followUp: z.ZodOptional<z.ZodObject<{
        required: z.ZodDefault<z.ZodEnum<["none", "reaudit", "next_audit"]>>;
        details: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        required: "none" | "reaudit" | "next_audit";
        details?: string | undefined;
    }, {
        required?: "none" | "reaudit" | "next_audit" | undefined;
        details?: string | undefined;
    }>>;
    attachments: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["checklist", "questionnaire", "evidence", "other"]>;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }, {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    version?: string | undefined;
    details?: {
        auditedLocations: string[];
        auditDate: Date;
        auditEndDate: Date;
        workDays: number;
    } | undefined;
    summary?: string | undefined;
    attachments?: {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }[] | undefined;
    auditPlanId?: string | undefined;
    organization?: {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    } | undefined;
    profile?: {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        multiSite: boolean;
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        sites?: string[] | undefined;
    } | undefined;
    conclusion?: string | undefined;
    followUp?: {
        required: "none" | "reaudit" | "next_audit";
        details?: string | undefined;
    } | undefined;
}, {
    companyId?: string | undefined;
    version?: string | undefined;
    details?: {
        auditedLocations: string[];
        auditDate: string;
        auditEndDate: string;
        workDays: number;
    } | undefined;
    summary?: string | undefined;
    attachments?: {
        type: "evidence" | "other" | "checklist" | "questionnaire";
        name: string;
        url: string;
    }[] | undefined;
    auditPlanId?: string | undefined;
    organization?: {
        email: string;
        scope: string;
        address: string;
        legalName: string;
        country: string;
        contact: string;
        phone: string;
        language: string;
        industry: string;
        corporateGroup?: string | undefined;
    } | undefined;
    profile?: {
        leadAuditor: string;
        standards: string[];
        auditType: "external" | "internal" | "supplier";
        documentation: string;
        frequency: string;
        auditTeam: string[];
        operationalShifts: string;
        specialists?: string[] | undefined;
        trainees?: string[] | undefined;
        multiSite?: boolean | undefined;
        sites?: string[] | undefined;
    } | undefined;
    conclusion?: string | undefined;
    followUp?: {
        required?: "none" | "reaudit" | "next_audit" | undefined;
        details?: string | undefined;
    } | undefined;
}>;
export declare const uploadEvidenceSchema: z.ZodObject<{
    auditPlanId: z.ZodString;
    findingId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    auditPlanId: string;
    description?: string | undefined;
    findingId?: string | undefined;
}, {
    auditPlanId: string;
    description?: string | undefined;
    findingId?: string | undefined;
}>;
export declare const createAuditProgramSchema: z.ZodObject<{
    companyId: z.ZodString;
    year: z.ZodNumber;
    sectors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        processes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        importance: z.ZodDefault<z.ZodEnum<["critical", "standard"]>>;
        scoreA: z.ZodDefault<z.ZodNumber>;
        scoreB: z.ZodDefault<z.ZodNumber>;
        frequency: z.ZodDefault<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
        nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        processes: string[];
        frequency: "annual" | "semiannual" | "quarterly";
        importance: "critical" | "standard";
        scoreA: number;
        scoreB: number;
        nextAuditDate?: Date | undefined;
    }, {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: string | undefined;
    }>, "many">>;
    supplierAudits: z.ZodDefault<z.ZodArray<z.ZodObject<{
        supplierName: z.ZodString;
        supplierId: z.ZodOptional<z.ZodString>;
        auditDate: z.ZodEffects<z.ZodString, Date, string>;
        scope: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        scope: string;
        auditDate: Date;
        supplierName: string;
        supplierId?: string | undefined;
    }, {
        scope: string;
        auditDate: string;
        supplierName: string;
        supplierId?: string | undefined;
    }>, "many">>;
    externalAudit: z.ZodDefault<z.ZodObject<{
        plannedDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        certificationBody: z.ZodOptional<z.ZodString>;
        scope: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["not_planned", "scheduled", "in_progress", "completed", "cancelled"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
        scope?: string | undefined;
        plannedDate?: Date | undefined;
        certificationBody?: string | undefined;
    }, {
        status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
        scope?: string | undefined;
        plannedDate?: string | undefined;
        certificationBody?: string | undefined;
    }>>;
    otherActivities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        scheduledDate: Date;
        description?: string | undefined;
    }, {
        name: string;
        scheduledDate: string;
        description?: string | undefined;
    }>, "many">>;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    year: number;
    sectors: {
        name: string;
        processes: string[];
        frequency: "annual" | "semiannual" | "quarterly";
        importance: "critical" | "standard";
        scoreA: number;
        scoreB: number;
        nextAuditDate?: Date | undefined;
    }[];
    supplierAudits: {
        scope: string;
        auditDate: Date;
        supplierName: string;
        supplierId?: string | undefined;
    }[];
    externalAudit: {
        status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
        scope?: string | undefined;
        plannedDate?: Date | undefined;
        certificationBody?: string | undefined;
    };
    otherActivities: {
        name: string;
        scheduledDate: Date;
        description?: string | undefined;
    }[];
    observations?: string | undefined;
}, {
    companyId: string;
    year: number;
    observations?: string | undefined;
    sectors?: {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: string | undefined;
    }[] | undefined;
    supplierAudits?: {
        scope: string;
        auditDate: string;
        supplierName: string;
        supplierId?: string | undefined;
    }[] | undefined;
    externalAudit?: {
        status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
        scope?: string | undefined;
        plannedDate?: string | undefined;
        certificationBody?: string | undefined;
    } | undefined;
    otherActivities?: {
        name: string;
        scheduledDate: string;
        description?: string | undefined;
    }[] | undefined;
}>;
export declare const updateAuditProgramSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    sectors: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        processes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        importance: z.ZodDefault<z.ZodEnum<["critical", "standard"]>>;
        scoreA: z.ZodDefault<z.ZodNumber>;
        scoreB: z.ZodDefault<z.ZodNumber>;
        frequency: z.ZodDefault<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
        nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        processes: string[];
        frequency: "annual" | "semiannual" | "quarterly";
        importance: "critical" | "standard";
        scoreA: number;
        scoreB: number;
        nextAuditDate?: Date | undefined;
    }, {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: string | undefined;
    }>, "many">>>;
    supplierAudits: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        supplierName: z.ZodString;
        supplierId: z.ZodOptional<z.ZodString>;
        auditDate: z.ZodEffects<z.ZodString, Date, string>;
        scope: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        scope: string;
        auditDate: Date;
        supplierName: string;
        supplierId?: string | undefined;
    }, {
        scope: string;
        auditDate: string;
        supplierName: string;
        supplierId?: string | undefined;
    }>, "many">>>;
    externalAudit: z.ZodOptional<z.ZodDefault<z.ZodObject<{
        plannedDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        certificationBody: z.ZodOptional<z.ZodString>;
        scope: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["not_planned", "scheduled", "in_progress", "completed", "cancelled"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
        scope?: string | undefined;
        plannedDate?: Date | undefined;
        certificationBody?: string | undefined;
    }, {
        status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
        scope?: string | undefined;
        plannedDate?: string | undefined;
        certificationBody?: string | undefined;
    }>>>;
    otherActivities: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        scheduledDate: Date;
        description?: string | undefined;
    }, {
        name: string;
        scheduledDate: string;
        description?: string | undefined;
    }>, "many">>>;
    observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    year?: number | undefined;
    observations?: string | undefined;
    sectors?: {
        name: string;
        processes: string[];
        frequency: "annual" | "semiannual" | "quarterly";
        importance: "critical" | "standard";
        scoreA: number;
        scoreB: number;
        nextAuditDate?: Date | undefined;
    }[] | undefined;
    supplierAudits?: {
        scope: string;
        auditDate: Date;
        supplierName: string;
        supplierId?: string | undefined;
    }[] | undefined;
    externalAudit?: {
        status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
        scope?: string | undefined;
        plannedDate?: Date | undefined;
        certificationBody?: string | undefined;
    } | undefined;
    otherActivities?: {
        name: string;
        scheduledDate: Date;
        description?: string | undefined;
    }[] | undefined;
}, {
    companyId?: string | undefined;
    year?: number | undefined;
    observations?: string | undefined;
    sectors?: {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: string | undefined;
    }[] | undefined;
    supplierAudits?: {
        scope: string;
        auditDate: string;
        supplierName: string;
        supplierId?: string | undefined;
    }[] | undefined;
    externalAudit?: {
        status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
        scope?: string | undefined;
        plannedDate?: string | undefined;
        certificationBody?: string | undefined;
    } | undefined;
    otherActivities?: {
        name: string;
        scheduledDate: string;
        description?: string | undefined;
    }[] | undefined;
}>;
export declare const addSectorSchema: z.ZodObject<{
    name: z.ZodString;
    processes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    importance: z.ZodOptional<z.ZodEnum<["critical", "standard"]>>;
    scoreA: z.ZodOptional<z.ZodNumber>;
    scoreB: z.ZodOptional<z.ZodNumber>;
    frequency: z.ZodOptional<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
    nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    processes?: string[] | undefined;
    frequency?: "annual" | "semiannual" | "quarterly" | undefined;
    importance?: "critical" | "standard" | undefined;
    scoreA?: number | undefined;
    scoreB?: number | undefined;
    nextAuditDate?: Date | undefined;
}, {
    name: string;
    processes?: string[] | undefined;
    frequency?: "annual" | "semiannual" | "quarterly" | undefined;
    importance?: "critical" | "standard" | undefined;
    scoreA?: number | undefined;
    scoreB?: number | undefined;
    nextAuditDate?: string | undefined;
}>;
export declare const addSupplierAuditSchema: z.ZodObject<{
    supplierName: z.ZodString;
    supplierId: z.ZodOptional<z.ZodString>;
    auditDate: z.ZodEffects<z.ZodString, Date, string>;
    scope: z.ZodString;
}, "strip", z.ZodTypeAny, {
    scope: string;
    auditDate: Date;
    supplierName: string;
    supplierId?: string | undefined;
}, {
    scope: string;
    auditDate: string;
    supplierName: string;
    supplierId?: string | undefined;
}>;
export declare const addActivitySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scheduledDate: Date;
    description?: string | undefined;
}, {
    name: string;
    scheduledDate: string;
    description?: string | undefined;
}>;
export declare const createAuditSoASchema: z.ZodObject<{
    companyId: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    controls: z.ZodOptional<z.ZodArray<z.ZodObject<{
        clause: z.ZodString;
        title: z.ZodString;
        objective: z.ZodString;
        motivators: z.ZodDefault<z.ZodObject<{
            business: z.ZodDefault<z.ZodBoolean>;
            risk: z.ZodDefault<z.ZodBoolean>;
            legal: z.ZodDefault<z.ZodBoolean>;
            contract: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        }, {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        }>>;
        applicable: z.ZodDefault<z.ZodBoolean>;
        justification: z.ZodOptional<z.ZodString>;
        lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        implemented: z.ZodDefault<z.ZodBoolean>;
        implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        responsible: z.ZodOptional<z.ZodString>;
        evidence: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        objective: string;
        implemented: boolean;
        clause: string;
        motivators: {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        };
        applicable: boolean;
        evidence?: string | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        lastAssessmentDate?: Date | undefined;
        implementationDate?: Date | undefined;
    }, {
        title: string;
        objective: string;
        clause: string;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: string | undefined;
        implementationDate?: string | undefined;
    }>, "many">>;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    version: string;
    controls?: {
        title: string;
        objective: string;
        implemented: boolean;
        clause: string;
        motivators: {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        };
        applicable: boolean;
        evidence?: string | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        lastAssessmentDate?: Date | undefined;
        implementationDate?: Date | undefined;
    }[] | undefined;
    observations?: string | undefined;
}, {
    companyId: string;
    version?: string | undefined;
    controls?: {
        title: string;
        objective: string;
        clause: string;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: string | undefined;
        implementationDate?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
}>;
export declare const updateAuditSoASchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    controls: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        clause: z.ZodString;
        title: z.ZodString;
        objective: z.ZodString;
        motivators: z.ZodDefault<z.ZodObject<{
            business: z.ZodDefault<z.ZodBoolean>;
            risk: z.ZodDefault<z.ZodBoolean>;
            legal: z.ZodDefault<z.ZodBoolean>;
            contract: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        }, {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        }>>;
        applicable: z.ZodDefault<z.ZodBoolean>;
        justification: z.ZodOptional<z.ZodString>;
        lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        implemented: z.ZodDefault<z.ZodBoolean>;
        implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        responsible: z.ZodOptional<z.ZodString>;
        evidence: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        objective: string;
        implemented: boolean;
        clause: string;
        motivators: {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        };
        applicable: boolean;
        evidence?: string | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        lastAssessmentDate?: Date | undefined;
        implementationDate?: Date | undefined;
    }, {
        title: string;
        objective: string;
        clause: string;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: string | undefined;
        implementationDate?: string | undefined;
    }>, "many">>>;
    observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    version?: string | undefined;
    controls?: {
        title: string;
        objective: string;
        implemented: boolean;
        clause: string;
        motivators: {
            legal: boolean;
            business: boolean;
            risk: boolean;
            contract: boolean;
        };
        applicable: boolean;
        evidence?: string | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        lastAssessmentDate?: Date | undefined;
        implementationDate?: Date | undefined;
    }[] | undefined;
    observations?: string | undefined;
}, {
    companyId?: string | undefined;
    version?: string | undefined;
    controls?: {
        title: string;
        objective: string;
        clause: string;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: string | undefined;
        implementationDate?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
}>;
export declare const updateSoAControlSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    objective: z.ZodOptional<z.ZodString>;
    motivators: z.ZodOptional<z.ZodObject<{
        business: z.ZodOptional<z.ZodBoolean>;
        risk: z.ZodOptional<z.ZodBoolean>;
        legal: z.ZodOptional<z.ZodBoolean>;
        contract: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        legal?: boolean | undefined;
        business?: boolean | undefined;
        risk?: boolean | undefined;
        contract?: boolean | undefined;
    }, {
        legal?: boolean | undefined;
        business?: boolean | undefined;
        risk?: boolean | undefined;
        contract?: boolean | undefined;
    }>>;
    applicable: z.ZodOptional<z.ZodBoolean>;
    justification: z.ZodOptional<z.ZodString>;
    lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    implemented: z.ZodOptional<z.ZodBoolean>;
    implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    responsible: z.ZodOptional<z.ZodString>;
    evidence: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    objective?: string | undefined;
    evidence?: string | undefined;
    implemented?: boolean | undefined;
    justification?: string | undefined;
    responsible?: string | undefined;
    motivators?: {
        legal?: boolean | undefined;
        business?: boolean | undefined;
        risk?: boolean | undefined;
        contract?: boolean | undefined;
    } | undefined;
    applicable?: boolean | undefined;
    lastAssessmentDate?: Date | undefined;
    implementationDate?: Date | undefined;
}, {
    title?: string | undefined;
    objective?: string | undefined;
    evidence?: string | undefined;
    implemented?: boolean | undefined;
    justification?: string | undefined;
    responsible?: string | undefined;
    motivators?: {
        legal?: boolean | undefined;
        business?: boolean | undefined;
        risk?: boolean | undefined;
        contract?: boolean | undefined;
    } | undefined;
    applicable?: boolean | undefined;
    lastAssessmentDate?: string | undefined;
    implementationDate?: string | undefined;
}>;
export declare const createAuditRiskSchema: z.ZodObject<{
    companyId: z.ZodString;
    auditPlanId: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    eventOrAsset: z.ZodString;
    owner: z.ZodString;
    threat: z.ZodString;
    vulnerability: z.ZodString;
    existingControl: z.ZodString;
    probability: z.ZodNumber;
    impact: z.ZodNumber;
    riskClassification: z.ZodString;
    treatment: z.ZodDefault<z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>>;
    treatmentPlan: z.ZodOptional<z.ZodString>;
    probabilityAfter: z.ZodOptional<z.ZodNumber>;
    impactAfter: z.ZodOptional<z.ZodNumber>;
    treatmentDeadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    status: z.ZodDefault<z.ZodEnum<["identified", "analyzed", "treated", "monitored", "closed"]>>;
}, "strip", z.ZodTypeAny, {
    status: "closed" | "identified" | "analyzed" | "treated" | "monitored";
    companyId: string;
    description: string;
    eventOrAsset: string;
    owner: string;
    threat: string;
    vulnerability: string;
    existingControl: string;
    probability: number;
    impact: number;
    riskClassification: string;
    treatment: "accept" | "mitigate" | "transfer" | "avoid";
    auditPlanId?: string | undefined;
    treatmentPlan?: string | undefined;
    probabilityAfter?: number | undefined;
    impactAfter?: number | undefined;
    treatmentDeadline?: Date | undefined;
}, {
    companyId: string;
    description: string;
    eventOrAsset: string;
    owner: string;
    threat: string;
    vulnerability: string;
    existingControl: string;
    probability: number;
    impact: number;
    riskClassification: string;
    status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
    auditPlanId?: string | undefined;
    treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
    treatmentPlan?: string | undefined;
    probabilityAfter?: number | undefined;
    impactAfter?: number | undefined;
    treatmentDeadline?: string | undefined;
}>;
export declare const updateAuditRiskSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    auditPlanId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    eventOrAsset: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    threat: z.ZodOptional<z.ZodString>;
    vulnerability: z.ZodOptional<z.ZodString>;
    existingControl: z.ZodOptional<z.ZodString>;
    probability: z.ZodOptional<z.ZodNumber>;
    impact: z.ZodOptional<z.ZodNumber>;
    riskClassification: z.ZodOptional<z.ZodString>;
    treatment: z.ZodOptional<z.ZodDefault<z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>>>;
    treatmentPlan: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    probabilityAfter: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    impactAfter: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    treatmentDeadline: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["identified", "analyzed", "treated", "monitored", "closed"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
    companyId?: string | undefined;
    description?: string | undefined;
    auditPlanId?: string | undefined;
    eventOrAsset?: string | undefined;
    owner?: string | undefined;
    threat?: string | undefined;
    vulnerability?: string | undefined;
    existingControl?: string | undefined;
    probability?: number | undefined;
    impact?: number | undefined;
    riskClassification?: string | undefined;
    treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
    treatmentPlan?: string | undefined;
    probabilityAfter?: number | undefined;
    impactAfter?: number | undefined;
    treatmentDeadline?: Date | undefined;
}, {
    status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
    companyId?: string | undefined;
    description?: string | undefined;
    auditPlanId?: string | undefined;
    eventOrAsset?: string | undefined;
    owner?: string | undefined;
    threat?: string | undefined;
    vulnerability?: string | undefined;
    existingControl?: string | undefined;
    probability?: number | undefined;
    impact?: number | undefined;
    riskClassification?: string | undefined;
    treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
    treatmentPlan?: string | undefined;
    probabilityAfter?: number | undefined;
    impactAfter?: number | undefined;
    treatmentDeadline?: string | undefined;
}>;
export declare const updateRiskAssessmentSchema: z.ZodObject<{
    probability: z.ZodNumber;
    impact: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    probability: number;
    impact: number;
}, {
    probability: number;
    impact: number;
}>;
export declare const treatRiskSchema: z.ZodObject<{
    treatment: z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>;
    treatmentPlan: z.ZodString;
    probabilityAfter: z.ZodNumber;
    impactAfter: z.ZodNumber;
    treatmentDeadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
}, "strip", z.ZodTypeAny, {
    treatment: "accept" | "mitigate" | "transfer" | "avoid";
    treatmentPlan: string;
    probabilityAfter: number;
    impactAfter: number;
    treatmentDeadline?: Date | undefined;
}, {
    treatment: "accept" | "mitigate" | "transfer" | "avoid";
    treatmentPlan: string;
    probabilityAfter: number;
    impactAfter: number;
    treatmentDeadline?: string | undefined;
}>;
export declare const monitorRiskSchema: z.ZodObject<{
    status: z.ZodEnum<["monitored", "closed"]>;
}, "strip", z.ZodTypeAny, {
    status: "closed" | "monitored";
}, {
    status: "closed" | "monitored";
}>;
export declare const reopenRiskSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const createAuditDocumentReviewSchema: z.ZodObject<{
    companyId: z.ZodString;
    auditPlanId: z.ZodString;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        clause: z.ZodString;
        requirement: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
        observations: z.ZodOptional<z.ZodString>;
        reviewer: z.ZodString;
        reviewDate: z.ZodEffects<z.ZodString, Date, string>;
        documentId: z.ZodOptional<z.ZodString>;
        documentName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        reviewDate: Date;
        clause: string;
        requirement: string;
        reviewer: string;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }, {
        reviewDate: string;
        clause: string;
        requirement: string;
        reviewer: string;
        status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }>, "many">>;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    auditPlanId: string;
    documents?: {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        reviewDate: Date;
        clause: string;
        requirement: string;
        reviewer: string;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
}, {
    companyId: string;
    auditPlanId: string;
    documents?: {
        reviewDate: string;
        clause: string;
        requirement: string;
        reviewer: string;
        status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
}>;
export declare const updateAuditDocumentReviewSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    auditPlanId: z.ZodOptional<z.ZodString>;
    documents: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        clause: z.ZodString;
        requirement: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
        observations: z.ZodOptional<z.ZodString>;
        reviewer: z.ZodString;
        reviewDate: z.ZodEffects<z.ZodString, Date, string>;
        documentId: z.ZodOptional<z.ZodString>;
        documentName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        reviewDate: Date;
        clause: string;
        requirement: string;
        reviewer: string;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }, {
        reviewDate: string;
        clause: string;
        requirement: string;
        reviewer: string;
        status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }>, "many">>>;
    observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    companyId?: string | undefined;
    documents?: {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        reviewDate: Date;
        clause: string;
        requirement: string;
        reviewer: string;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
    auditPlanId?: string | undefined;
}, {
    companyId?: string | undefined;
    documents?: {
        reviewDate: string;
        clause: string;
        requirement: string;
        reviewer: string;
        status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
        observations?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }[] | undefined;
    observations?: string | undefined;
    auditPlanId?: string | undefined;
}>;
export declare const updateDocumentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
    observations?: string | undefined;
}, {
    status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
    observations?: string | undefined;
}>;
export declare const addDocumentReviewSchema: z.ZodObject<{
    clause: z.ZodString;
    requirement: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
    observations: z.ZodOptional<z.ZodString>;
    reviewer: z.ZodString;
    reviewDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    documentId: z.ZodOptional<z.ZodString>;
    documentName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
    clause: string;
    requirement: string;
    reviewer: string;
    observations?: string | undefined;
    reviewDate?: Date | undefined;
    documentId?: string | undefined;
    documentName?: string | undefined;
}, {
    clause: string;
    requirement: string;
    reviewer: string;
    status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
    observations?: string | undefined;
    reviewDate?: string | undefined;
    documentId?: string | undefined;
    documentName?: string | undefined;
}>;
declare const _default: {
    createAuditPlanSchema: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        companyId: z.ZodString;
        programId: z.ZodOptional<z.ZodString>;
        scope: z.ZodObject<{
            controls: z.ZodArray<z.ZodString, "many">;
            processes: z.ZodArray<z.ZodString, "many">;
            areas: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            controls: string[];
            processes: string[];
            areas: string[];
        }, {
            controls: string[];
            processes: string[];
            areas: string[];
        }>;
        team: z.ZodObject<{
            leadAuditor: z.ZodString;
            auditors: z.ZodArray<z.ZodString, "many">;
            observers: z.ZodArray<z.ZodString, "many">;
            specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        }, {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        }>;
        period: z.ZodObject<{
            startDate: z.ZodEffects<z.ZodString, Date, string>;
            endDate: z.ZodEffects<z.ZodString, Date, string>;
            estimatedDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startDate: Date;
            endDate: Date;
            estimatedDays: number;
        }, {
            startDate: string;
            endDate: string;
            estimatedDays: number;
        }>;
        criteria: z.ZodArray<z.ZodString, "many">;
        observations: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        description: string;
        title: string;
        scope: {
            controls: string[];
            processes: string[];
            areas: string[];
        };
        period: {
            startDate: Date;
            endDate: Date;
            estimatedDays: number;
        };
        team: {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        };
        criteria: string[];
        observations?: string | undefined;
        programId?: string | undefined;
    }, {
        companyId: string;
        description: string;
        title: string;
        scope: {
            controls: string[];
            processes: string[];
            areas: string[];
        };
        period: {
            startDate: string;
            endDate: string;
            estimatedDays: number;
        };
        team: {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        };
        criteria: string[];
        observations?: string | undefined;
        programId?: string | undefined;
    }>;
    updateAuditPlanSchema: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        companyId: z.ZodOptional<z.ZodString>;
        programId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        scope: z.ZodOptional<z.ZodObject<{
            controls: z.ZodArray<z.ZodString, "many">;
            processes: z.ZodArray<z.ZodString, "many">;
            areas: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            controls: string[];
            processes: string[];
            areas: string[];
        }, {
            controls: string[];
            processes: string[];
            areas: string[];
        }>>;
        team: z.ZodOptional<z.ZodObject<{
            leadAuditor: z.ZodString;
            auditors: z.ZodArray<z.ZodString, "many">;
            observers: z.ZodArray<z.ZodString, "many">;
            specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        }, {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        }>>;
        period: z.ZodOptional<z.ZodObject<{
            startDate: z.ZodEffects<z.ZodString, Date, string>;
            endDate: z.ZodEffects<z.ZodString, Date, string>;
            estimatedDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startDate: Date;
            endDate: Date;
            estimatedDays: number;
        }, {
            startDate: string;
            endDate: string;
            estimatedDays: number;
        }>>;
        criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        observations?: string | undefined;
        scope?: {
            controls: string[];
            processes: string[];
            areas: string[];
        } | undefined;
        period?: {
            startDate: Date;
            endDate: Date;
            estimatedDays: number;
        } | undefined;
        programId?: string | undefined;
        team?: {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        } | undefined;
        criteria?: string[] | undefined;
    }, {
        companyId?: string | undefined;
        description?: string | undefined;
        title?: string | undefined;
        observations?: string | undefined;
        scope?: {
            controls: string[];
            processes: string[];
            areas: string[];
        } | undefined;
        period?: {
            startDate: string;
            endDate: string;
            estimatedDays: number;
        } | undefined;
        programId?: string | undefined;
        team?: {
            leadAuditor: string;
            auditors: string[];
            observers: string[];
            specialists?: string[] | undefined;
        } | undefined;
        criteria?: string[] | undefined;
    }>;
    updateChecklistSchema: z.ZodObject<{
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            answer: z.ZodEnum<["C", "NC", "OB", "OM", "NA"]>;
            observations: z.ZodOptional<z.ZodString>;
            evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            responsible: z.ZodString;
            answeredAt: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            answeredBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            responsible: string;
            question: string;
            answer: "C" | "NC" | "OB" | "OM" | "NA";
            observations?: string | undefined;
            evidenceIds?: string[] | undefined;
            answeredAt?: Date | undefined;
            answeredBy?: string | undefined;
        }, {
            responsible: string;
            question: string;
            answer: "C" | "NC" | "OB" | "OM" | "NA";
            observations?: string | undefined;
            evidenceIds?: string[] | undefined;
            answeredAt?: string | undefined;
            answeredBy?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        questions: {
            responsible: string;
            question: string;
            answer: "C" | "NC" | "OB" | "OM" | "NA";
            observations?: string | undefined;
            evidenceIds?: string[] | undefined;
            answeredAt?: Date | undefined;
            answeredBy?: string | undefined;
        }[];
    }, {
        questions: {
            responsible: string;
            question: string;
            answer: "C" | "NC" | "OB" | "OM" | "NA";
            observations?: string | undefined;
            evidenceIds?: string[] | undefined;
            answeredAt?: string | undefined;
            answeredBy?: string | undefined;
        }[];
    }>;
    createAuditFindingSchema: z.ZodObject<{
        auditPlanId: z.ZodString;
        checklistId: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["NC_A", "NC_B", "CM", "OM", "AP"]>;
        title: z.ZodString;
        description: z.ZodString;
        area: z.ZodString;
        process: z.ZodString;
        clause: z.ZodString;
        controlId: z.ZodOptional<z.ZodString>;
        evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        deadline: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        type: "OM" | "NC_A" | "NC_B" | "CM" | "AP";
        description: string;
        title: string;
        area: string;
        auditPlanId: string;
        process: string;
        clause: string;
        deadline: Date;
        controlId?: string | undefined;
        evidenceIds?: string[] | undefined;
        checklistId?: string | undefined;
    }, {
        type: "OM" | "NC_A" | "NC_B" | "CM" | "AP";
        description: string;
        title: string;
        area: string;
        auditPlanId: string;
        process: string;
        clause: string;
        deadline: string;
        controlId?: string | undefined;
        evidenceIds?: string[] | undefined;
        checklistId?: string | undefined;
    }>;
    updateAuditFindingSchema: z.ZodObject<{
        auditPlanId: z.ZodOptional<z.ZodString>;
        checklistId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        type: z.ZodOptional<z.ZodEnum<["NC_A", "NC_B", "CM", "OM", "AP"]>>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        area: z.ZodOptional<z.ZodString>;
        process: z.ZodOptional<z.ZodString>;
        clause: z.ZodOptional<z.ZodString>;
        controlId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        evidenceIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        deadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        type?: "OM" | "NC_A" | "NC_B" | "CM" | "AP" | undefined;
        description?: string | undefined;
        title?: string | undefined;
        controlId?: string | undefined;
        area?: string | undefined;
        auditPlanId?: string | undefined;
        evidenceIds?: string[] | undefined;
        checklistId?: string | undefined;
        process?: string | undefined;
        clause?: string | undefined;
        deadline?: Date | undefined;
    }, {
        type?: "OM" | "NC_A" | "NC_B" | "CM" | "AP" | undefined;
        description?: string | undefined;
        title?: string | undefined;
        controlId?: string | undefined;
        area?: string | undefined;
        auditPlanId?: string | undefined;
        evidenceIds?: string[] | undefined;
        checklistId?: string | undefined;
        process?: string | undefined;
        clause?: string | undefined;
        deadline?: string | undefined;
    }>;
    createAuditActionPlanSchema: z.ZodObject<{
        findingId: z.ZodString;
        auditPlanId: z.ZodString;
        companyId: z.ZodString;
        action: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        responsible: z.ZodString;
        deadline: z.ZodEffects<z.ZodString, Date, string>;
        evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        action: string;
        responsible: string;
        auditPlanId: string;
        deadline: Date;
        findingId: string;
        description?: string | undefined;
        evidenceIds?: string[] | undefined;
    }, {
        companyId: string;
        action: string;
        responsible: string;
        auditPlanId: string;
        deadline: string;
        findingId: string;
        description?: string | undefined;
        evidenceIds?: string[] | undefined;
    }>;
    updateAuditActionPlanSchema: z.ZodObject<{
        findingId: z.ZodOptional<z.ZodString>;
        auditPlanId: z.ZodOptional<z.ZodString>;
        companyId: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        responsible: z.ZodOptional<z.ZodString>;
        deadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        evidenceIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        description?: string | undefined;
        action?: string | undefined;
        responsible?: string | undefined;
        auditPlanId?: string | undefined;
        evidenceIds?: string[] | undefined;
        deadline?: Date | undefined;
        findingId?: string | undefined;
    }, {
        companyId?: string | undefined;
        description?: string | undefined;
        action?: string | undefined;
        responsible?: string | undefined;
        auditPlanId?: string | undefined;
        evidenceIds?: string[] | undefined;
        deadline?: string | undefined;
        findingId?: string | undefined;
    }>;
    createAuditReportSchema: z.ZodObject<{
        auditPlanId: z.ZodString;
        companyId: z.ZodString;
        version: z.ZodDefault<z.ZodString>;
        organization: z.ZodObject<{
            legalName: z.ZodString;
            corporateGroup: z.ZodOptional<z.ZodString>;
            address: z.ZodString;
            country: z.ZodString;
            contact: z.ZodString;
            email: z.ZodString;
            phone: z.ZodString;
            language: z.ZodString;
            scope: z.ZodString;
            industry: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        }, {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        }>;
        profile: z.ZodObject<{
            standards: z.ZodArray<z.ZodString, "many">;
            auditType: z.ZodEnum<["internal", "external", "supplier"]>;
            documentation: z.ZodString;
            frequency: z.ZodString;
            leadAuditor: z.ZodString;
            auditTeam: z.ZodArray<z.ZodString, "many">;
            specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            trainees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            multiSite: z.ZodDefault<z.ZodBoolean>;
            sites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            operationalShifts: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            multiSite: boolean;
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            sites?: string[] | undefined;
        }, {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            multiSite?: boolean | undefined;
            sites?: string[] | undefined;
        }>;
        details: z.ZodObject<{
            auditedLocations: z.ZodArray<z.ZodString, "many">;
            auditDate: z.ZodEffects<z.ZodString, Date, string>;
            auditEndDate: z.ZodEffects<z.ZodString, Date, string>;
            workDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            auditedLocations: string[];
            auditDate: Date;
            auditEndDate: Date;
            workDays: number;
        }, {
            auditedLocations: string[];
            auditDate: string;
            auditEndDate: string;
            workDays: number;
        }>;
        summary: z.ZodString;
        conclusion: z.ZodString;
        followUp: z.ZodObject<{
            required: z.ZodDefault<z.ZodEnum<["none", "reaudit", "next_audit"]>>;
            details: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            required: "none" | "reaudit" | "next_audit";
            details?: string | undefined;
        }, {
            required?: "none" | "reaudit" | "next_audit" | undefined;
            details?: string | undefined;
        }>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["checklist", "questionnaire", "evidence", "other"]>;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }, {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        version: string;
        details: {
            auditedLocations: string[];
            auditDate: Date;
            auditEndDate: Date;
            workDays: number;
        };
        summary: string;
        auditPlanId: string;
        organization: {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        };
        profile: {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            multiSite: boolean;
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            sites?: string[] | undefined;
        };
        conclusion: string;
        followUp: {
            required: "none" | "reaudit" | "next_audit";
            details?: string | undefined;
        };
        attachments?: {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }[] | undefined;
    }, {
        companyId: string;
        details: {
            auditedLocations: string[];
            auditDate: string;
            auditEndDate: string;
            workDays: number;
        };
        summary: string;
        auditPlanId: string;
        organization: {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        };
        profile: {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            multiSite?: boolean | undefined;
            sites?: string[] | undefined;
        };
        conclusion: string;
        followUp: {
            required?: "none" | "reaudit" | "next_audit" | undefined;
            details?: string | undefined;
        };
        version?: string | undefined;
        attachments?: {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }[] | undefined;
    }>;
    updateAuditReportSchema: z.ZodObject<{
        auditPlanId: z.ZodOptional<z.ZodString>;
        companyId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        organization: z.ZodOptional<z.ZodObject<{
            legalName: z.ZodString;
            corporateGroup: z.ZodOptional<z.ZodString>;
            address: z.ZodString;
            country: z.ZodString;
            contact: z.ZodString;
            email: z.ZodString;
            phone: z.ZodString;
            language: z.ZodString;
            scope: z.ZodString;
            industry: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        }, {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        }>>;
        profile: z.ZodOptional<z.ZodObject<{
            standards: z.ZodArray<z.ZodString, "many">;
            auditType: z.ZodEnum<["internal", "external", "supplier"]>;
            documentation: z.ZodString;
            frequency: z.ZodString;
            leadAuditor: z.ZodString;
            auditTeam: z.ZodArray<z.ZodString, "many">;
            specialists: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            trainees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            multiSite: z.ZodDefault<z.ZodBoolean>;
            sites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            operationalShifts: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            multiSite: boolean;
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            sites?: string[] | undefined;
        }, {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            multiSite?: boolean | undefined;
            sites?: string[] | undefined;
        }>>;
        details: z.ZodOptional<z.ZodObject<{
            auditedLocations: z.ZodArray<z.ZodString, "many">;
            auditDate: z.ZodEffects<z.ZodString, Date, string>;
            auditEndDate: z.ZodEffects<z.ZodString, Date, string>;
            workDays: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            auditedLocations: string[];
            auditDate: Date;
            auditEndDate: Date;
            workDays: number;
        }, {
            auditedLocations: string[];
            auditDate: string;
            auditEndDate: string;
            workDays: number;
        }>>;
        summary: z.ZodOptional<z.ZodString>;
        conclusion: z.ZodOptional<z.ZodString>;
        followUp: z.ZodOptional<z.ZodObject<{
            required: z.ZodDefault<z.ZodEnum<["none", "reaudit", "next_audit"]>>;
            details: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            required: "none" | "reaudit" | "next_audit";
            details?: string | undefined;
        }, {
            required?: "none" | "reaudit" | "next_audit" | undefined;
            details?: string | undefined;
        }>>;
        attachments: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["checklist", "questionnaire", "evidence", "other"]>;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }, {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        version?: string | undefined;
        details?: {
            auditedLocations: string[];
            auditDate: Date;
            auditEndDate: Date;
            workDays: number;
        } | undefined;
        summary?: string | undefined;
        attachments?: {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }[] | undefined;
        auditPlanId?: string | undefined;
        organization?: {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        } | undefined;
        profile?: {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            multiSite: boolean;
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            sites?: string[] | undefined;
        } | undefined;
        conclusion?: string | undefined;
        followUp?: {
            required: "none" | "reaudit" | "next_audit";
            details?: string | undefined;
        } | undefined;
    }, {
        companyId?: string | undefined;
        version?: string | undefined;
        details?: {
            auditedLocations: string[];
            auditDate: string;
            auditEndDate: string;
            workDays: number;
        } | undefined;
        summary?: string | undefined;
        attachments?: {
            type: "evidence" | "other" | "checklist" | "questionnaire";
            name: string;
            url: string;
        }[] | undefined;
        auditPlanId?: string | undefined;
        organization?: {
            email: string;
            scope: string;
            address: string;
            legalName: string;
            country: string;
            contact: string;
            phone: string;
            language: string;
            industry: string;
            corporateGroup?: string | undefined;
        } | undefined;
        profile?: {
            leadAuditor: string;
            standards: string[];
            auditType: "external" | "internal" | "supplier";
            documentation: string;
            frequency: string;
            auditTeam: string[];
            operationalShifts: string;
            specialists?: string[] | undefined;
            trainees?: string[] | undefined;
            multiSite?: boolean | undefined;
            sites?: string[] | undefined;
        } | undefined;
        conclusion?: string | undefined;
        followUp?: {
            required?: "none" | "reaudit" | "next_audit" | undefined;
            details?: string | undefined;
        } | undefined;
    }>;
    uploadEvidenceSchema: z.ZodObject<{
        auditPlanId: z.ZodString;
        findingId: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        auditPlanId: string;
        description?: string | undefined;
        findingId?: string | undefined;
    }, {
        auditPlanId: string;
        description?: string | undefined;
        findingId?: string | undefined;
    }>;
    createAuditProgramSchema: z.ZodObject<{
        companyId: z.ZodString;
        year: z.ZodNumber;
        sectors: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            processes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            importance: z.ZodDefault<z.ZodEnum<["critical", "standard"]>>;
            scoreA: z.ZodDefault<z.ZodNumber>;
            scoreB: z.ZodDefault<z.ZodNumber>;
            frequency: z.ZodDefault<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
            nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            processes: string[];
            frequency: "annual" | "semiannual" | "quarterly";
            importance: "critical" | "standard";
            scoreA: number;
            scoreB: number;
            nextAuditDate?: Date | undefined;
        }, {
            name: string;
            processes?: string[] | undefined;
            frequency?: "annual" | "semiannual" | "quarterly" | undefined;
            importance?: "critical" | "standard" | undefined;
            scoreA?: number | undefined;
            scoreB?: number | undefined;
            nextAuditDate?: string | undefined;
        }>, "many">>;
        supplierAudits: z.ZodDefault<z.ZodArray<z.ZodObject<{
            supplierName: z.ZodString;
            supplierId: z.ZodOptional<z.ZodString>;
            auditDate: z.ZodEffects<z.ZodString, Date, string>;
            scope: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            scope: string;
            auditDate: Date;
            supplierName: string;
            supplierId?: string | undefined;
        }, {
            scope: string;
            auditDate: string;
            supplierName: string;
            supplierId?: string | undefined;
        }>, "many">>;
        externalAudit: z.ZodDefault<z.ZodObject<{
            plannedDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            certificationBody: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodString>;
            status: z.ZodDefault<z.ZodEnum<["not_planned", "scheduled", "in_progress", "completed", "cancelled"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
            scope?: string | undefined;
            plannedDate?: Date | undefined;
            certificationBody?: string | undefined;
        }, {
            status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
            scope?: string | undefined;
            plannedDate?: string | undefined;
            certificationBody?: string | undefined;
        }>>;
        otherActivities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            scheduledDate: Date;
            description?: string | undefined;
        }, {
            name: string;
            scheduledDate: string;
            description?: string | undefined;
        }>, "many">>;
        observations: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        year: number;
        sectors: {
            name: string;
            processes: string[];
            frequency: "annual" | "semiannual" | "quarterly";
            importance: "critical" | "standard";
            scoreA: number;
            scoreB: number;
            nextAuditDate?: Date | undefined;
        }[];
        supplierAudits: {
            scope: string;
            auditDate: Date;
            supplierName: string;
            supplierId?: string | undefined;
        }[];
        externalAudit: {
            status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
            scope?: string | undefined;
            plannedDate?: Date | undefined;
            certificationBody?: string | undefined;
        };
        otherActivities: {
            name: string;
            scheduledDate: Date;
            description?: string | undefined;
        }[];
        observations?: string | undefined;
    }, {
        companyId: string;
        year: number;
        observations?: string | undefined;
        sectors?: {
            name: string;
            processes?: string[] | undefined;
            frequency?: "annual" | "semiannual" | "quarterly" | undefined;
            importance?: "critical" | "standard" | undefined;
            scoreA?: number | undefined;
            scoreB?: number | undefined;
            nextAuditDate?: string | undefined;
        }[] | undefined;
        supplierAudits?: {
            scope: string;
            auditDate: string;
            supplierName: string;
            supplierId?: string | undefined;
        }[] | undefined;
        externalAudit?: {
            status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
            scope?: string | undefined;
            plannedDate?: string | undefined;
            certificationBody?: string | undefined;
        } | undefined;
        otherActivities?: {
            name: string;
            scheduledDate: string;
            description?: string | undefined;
        }[] | undefined;
    }>;
    updateAuditProgramSchema: z.ZodObject<{
        companyId: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodNumber>;
        sectors: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            processes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            importance: z.ZodDefault<z.ZodEnum<["critical", "standard"]>>;
            scoreA: z.ZodDefault<z.ZodNumber>;
            scoreB: z.ZodDefault<z.ZodNumber>;
            frequency: z.ZodDefault<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
            nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            processes: string[];
            frequency: "annual" | "semiannual" | "quarterly";
            importance: "critical" | "standard";
            scoreA: number;
            scoreB: number;
            nextAuditDate?: Date | undefined;
        }, {
            name: string;
            processes?: string[] | undefined;
            frequency?: "annual" | "semiannual" | "quarterly" | undefined;
            importance?: "critical" | "standard" | undefined;
            scoreA?: number | undefined;
            scoreB?: number | undefined;
            nextAuditDate?: string | undefined;
        }>, "many">>>;
        supplierAudits: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            supplierName: z.ZodString;
            supplierId: z.ZodOptional<z.ZodString>;
            auditDate: z.ZodEffects<z.ZodString, Date, string>;
            scope: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            scope: string;
            auditDate: Date;
            supplierName: string;
            supplierId?: string | undefined;
        }, {
            scope: string;
            auditDate: string;
            supplierName: string;
            supplierId?: string | undefined;
        }>, "many">>>;
        externalAudit: z.ZodOptional<z.ZodDefault<z.ZodObject<{
            plannedDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            certificationBody: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodString>;
            status: z.ZodDefault<z.ZodEnum<["not_planned", "scheduled", "in_progress", "completed", "cancelled"]>>;
        }, "strip", z.ZodTypeAny, {
            status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
            scope?: string | undefined;
            plannedDate?: Date | undefined;
            certificationBody?: string | undefined;
        }, {
            status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
            scope?: string | undefined;
            plannedDate?: string | undefined;
            certificationBody?: string | undefined;
        }>>>;
        otherActivities: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            scheduledDate: Date;
            description?: string | undefined;
        }, {
            name: string;
            scheduledDate: string;
            description?: string | undefined;
        }>, "many">>>;
        observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        year?: number | undefined;
        observations?: string | undefined;
        sectors?: {
            name: string;
            processes: string[];
            frequency: "annual" | "semiannual" | "quarterly";
            importance: "critical" | "standard";
            scoreA: number;
            scoreB: number;
            nextAuditDate?: Date | undefined;
        }[] | undefined;
        supplierAudits?: {
            scope: string;
            auditDate: Date;
            supplierName: string;
            supplierId?: string | undefined;
        }[] | undefined;
        externalAudit?: {
            status: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned";
            scope?: string | undefined;
            plannedDate?: Date | undefined;
            certificationBody?: string | undefined;
        } | undefined;
        otherActivities?: {
            name: string;
            scheduledDate: Date;
            description?: string | undefined;
        }[] | undefined;
    }, {
        companyId?: string | undefined;
        year?: number | undefined;
        observations?: string | undefined;
        sectors?: {
            name: string;
            processes?: string[] | undefined;
            frequency?: "annual" | "semiannual" | "quarterly" | undefined;
            importance?: "critical" | "standard" | undefined;
            scoreA?: number | undefined;
            scoreB?: number | undefined;
            nextAuditDate?: string | undefined;
        }[] | undefined;
        supplierAudits?: {
            scope: string;
            auditDate: string;
            supplierName: string;
            supplierId?: string | undefined;
        }[] | undefined;
        externalAudit?: {
            status?: "in_progress" | "completed" | "cancelled" | "scheduled" | "not_planned" | undefined;
            scope?: string | undefined;
            plannedDate?: string | undefined;
            certificationBody?: string | undefined;
        } | undefined;
        otherActivities?: {
            name: string;
            scheduledDate: string;
            description?: string | undefined;
        }[] | undefined;
    }>;
    addSectorSchema: z.ZodObject<{
        name: z.ZodString;
        processes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        importance: z.ZodOptional<z.ZodEnum<["critical", "standard"]>>;
        scoreA: z.ZodOptional<z.ZodNumber>;
        scoreB: z.ZodOptional<z.ZodNumber>;
        frequency: z.ZodOptional<z.ZodEnum<["annual", "semiannual", "quarterly"]>>;
        nextAuditDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: Date | undefined;
    }, {
        name: string;
        processes?: string[] | undefined;
        frequency?: "annual" | "semiannual" | "quarterly" | undefined;
        importance?: "critical" | "standard" | undefined;
        scoreA?: number | undefined;
        scoreB?: number | undefined;
        nextAuditDate?: string | undefined;
    }>;
    addSupplierAuditSchema: z.ZodObject<{
        supplierName: z.ZodString;
        supplierId: z.ZodOptional<z.ZodString>;
        auditDate: z.ZodEffects<z.ZodString, Date, string>;
        scope: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        scope: string;
        auditDate: Date;
        supplierName: string;
        supplierId?: string | undefined;
    }, {
        scope: string;
        auditDate: string;
        supplierName: string;
        supplierId?: string | undefined;
    }>;
    addActivitySchema: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        scheduledDate: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        scheduledDate: Date;
        description?: string | undefined;
    }, {
        name: string;
        scheduledDate: string;
        description?: string | undefined;
    }>;
    createAuditSoASchema: z.ZodObject<{
        companyId: z.ZodString;
        version: z.ZodDefault<z.ZodString>;
        controls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            clause: z.ZodString;
            title: z.ZodString;
            objective: z.ZodString;
            motivators: z.ZodDefault<z.ZodObject<{
                business: z.ZodDefault<z.ZodBoolean>;
                risk: z.ZodDefault<z.ZodBoolean>;
                legal: z.ZodDefault<z.ZodBoolean>;
                contract: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            }, {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            }>>;
            applicable: z.ZodDefault<z.ZodBoolean>;
            justification: z.ZodOptional<z.ZodString>;
            lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            implemented: z.ZodDefault<z.ZodBoolean>;
            implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            responsible: z.ZodOptional<z.ZodString>;
            evidence: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            objective: string;
            implemented: boolean;
            clause: string;
            motivators: {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            };
            applicable: boolean;
            evidence?: string | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            lastAssessmentDate?: Date | undefined;
            implementationDate?: Date | undefined;
        }, {
            title: string;
            objective: string;
            clause: string;
            evidence?: string | undefined;
            implemented?: boolean | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            motivators?: {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            } | undefined;
            applicable?: boolean | undefined;
            lastAssessmentDate?: string | undefined;
            implementationDate?: string | undefined;
        }>, "many">>;
        observations: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        version: string;
        controls?: {
            title: string;
            objective: string;
            implemented: boolean;
            clause: string;
            motivators: {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            };
            applicable: boolean;
            evidence?: string | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            lastAssessmentDate?: Date | undefined;
            implementationDate?: Date | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }, {
        companyId: string;
        version?: string | undefined;
        controls?: {
            title: string;
            objective: string;
            clause: string;
            evidence?: string | undefined;
            implemented?: boolean | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            motivators?: {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            } | undefined;
            applicable?: boolean | undefined;
            lastAssessmentDate?: string | undefined;
            implementationDate?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }>;
    updateAuditSoASchema: z.ZodObject<{
        companyId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        controls: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
            clause: z.ZodString;
            title: z.ZodString;
            objective: z.ZodString;
            motivators: z.ZodDefault<z.ZodObject<{
                business: z.ZodDefault<z.ZodBoolean>;
                risk: z.ZodDefault<z.ZodBoolean>;
                legal: z.ZodDefault<z.ZodBoolean>;
                contract: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            }, {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            }>>;
            applicable: z.ZodDefault<z.ZodBoolean>;
            justification: z.ZodOptional<z.ZodString>;
            lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            implemented: z.ZodDefault<z.ZodBoolean>;
            implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
            responsible: z.ZodOptional<z.ZodString>;
            evidence: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            objective: string;
            implemented: boolean;
            clause: string;
            motivators: {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            };
            applicable: boolean;
            evidence?: string | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            lastAssessmentDate?: Date | undefined;
            implementationDate?: Date | undefined;
        }, {
            title: string;
            objective: string;
            clause: string;
            evidence?: string | undefined;
            implemented?: boolean | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            motivators?: {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            } | undefined;
            applicable?: boolean | undefined;
            lastAssessmentDate?: string | undefined;
            implementationDate?: string | undefined;
        }>, "many">>>;
        observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        version?: string | undefined;
        controls?: {
            title: string;
            objective: string;
            implemented: boolean;
            clause: string;
            motivators: {
                legal: boolean;
                business: boolean;
                risk: boolean;
                contract: boolean;
            };
            applicable: boolean;
            evidence?: string | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            lastAssessmentDate?: Date | undefined;
            implementationDate?: Date | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }, {
        companyId?: string | undefined;
        version?: string | undefined;
        controls?: {
            title: string;
            objective: string;
            clause: string;
            evidence?: string | undefined;
            implemented?: boolean | undefined;
            justification?: string | undefined;
            responsible?: string | undefined;
            motivators?: {
                legal?: boolean | undefined;
                business?: boolean | undefined;
                risk?: boolean | undefined;
                contract?: boolean | undefined;
            } | undefined;
            applicable?: boolean | undefined;
            lastAssessmentDate?: string | undefined;
            implementationDate?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }>;
    updateSoAControlSchema: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        objective: z.ZodOptional<z.ZodString>;
        motivators: z.ZodOptional<z.ZodObject<{
            business: z.ZodOptional<z.ZodBoolean>;
            risk: z.ZodOptional<z.ZodBoolean>;
            legal: z.ZodOptional<z.ZodBoolean>;
            contract: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        }, {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        }>>;
        applicable: z.ZodOptional<z.ZodBoolean>;
        justification: z.ZodOptional<z.ZodString>;
        lastAssessmentDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        implemented: z.ZodOptional<z.ZodBoolean>;
        implementationDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        responsible: z.ZodOptional<z.ZodString>;
        evidence: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        objective?: string | undefined;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: Date | undefined;
        implementationDate?: Date | undefined;
    }, {
        title?: string | undefined;
        objective?: string | undefined;
        evidence?: string | undefined;
        implemented?: boolean | undefined;
        justification?: string | undefined;
        responsible?: string | undefined;
        motivators?: {
            legal?: boolean | undefined;
            business?: boolean | undefined;
            risk?: boolean | undefined;
            contract?: boolean | undefined;
        } | undefined;
        applicable?: boolean | undefined;
        lastAssessmentDate?: string | undefined;
        implementationDate?: string | undefined;
    }>;
    createAuditRiskSchema: z.ZodObject<{
        companyId: z.ZodString;
        auditPlanId: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        eventOrAsset: z.ZodString;
        owner: z.ZodString;
        threat: z.ZodString;
        vulnerability: z.ZodString;
        existingControl: z.ZodString;
        probability: z.ZodNumber;
        impact: z.ZodNumber;
        riskClassification: z.ZodString;
        treatment: z.ZodDefault<z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>>;
        treatmentPlan: z.ZodOptional<z.ZodString>;
        probabilityAfter: z.ZodOptional<z.ZodNumber>;
        impactAfter: z.ZodOptional<z.ZodNumber>;
        treatmentDeadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        status: z.ZodDefault<z.ZodEnum<["identified", "analyzed", "treated", "monitored", "closed"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "closed" | "identified" | "analyzed" | "treated" | "monitored";
        companyId: string;
        description: string;
        eventOrAsset: string;
        owner: string;
        threat: string;
        vulnerability: string;
        existingControl: string;
        probability: number;
        impact: number;
        riskClassification: string;
        treatment: "accept" | "mitigate" | "transfer" | "avoid";
        auditPlanId?: string | undefined;
        treatmentPlan?: string | undefined;
        probabilityAfter?: number | undefined;
        impactAfter?: number | undefined;
        treatmentDeadline?: Date | undefined;
    }, {
        companyId: string;
        description: string;
        eventOrAsset: string;
        owner: string;
        threat: string;
        vulnerability: string;
        existingControl: string;
        probability: number;
        impact: number;
        riskClassification: string;
        status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
        auditPlanId?: string | undefined;
        treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
        treatmentPlan?: string | undefined;
        probabilityAfter?: number | undefined;
        impactAfter?: number | undefined;
        treatmentDeadline?: string | undefined;
    }>;
    updateAuditRiskSchema: z.ZodObject<{
        companyId: z.ZodOptional<z.ZodString>;
        auditPlanId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodString>;
        eventOrAsset: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        threat: z.ZodOptional<z.ZodString>;
        vulnerability: z.ZodOptional<z.ZodString>;
        existingControl: z.ZodOptional<z.ZodString>;
        probability: z.ZodOptional<z.ZodNumber>;
        impact: z.ZodOptional<z.ZodNumber>;
        riskClassification: z.ZodOptional<z.ZodString>;
        treatment: z.ZodOptional<z.ZodDefault<z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>>>;
        treatmentPlan: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        probabilityAfter: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        impactAfter: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        treatmentDeadline: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>>;
        status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["identified", "analyzed", "treated", "monitored", "closed"]>>>;
    }, "strip", z.ZodTypeAny, {
        status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
        companyId?: string | undefined;
        description?: string | undefined;
        auditPlanId?: string | undefined;
        eventOrAsset?: string | undefined;
        owner?: string | undefined;
        threat?: string | undefined;
        vulnerability?: string | undefined;
        existingControl?: string | undefined;
        probability?: number | undefined;
        impact?: number | undefined;
        riskClassification?: string | undefined;
        treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
        treatmentPlan?: string | undefined;
        probabilityAfter?: number | undefined;
        impactAfter?: number | undefined;
        treatmentDeadline?: Date | undefined;
    }, {
        status?: "closed" | "identified" | "analyzed" | "treated" | "monitored" | undefined;
        companyId?: string | undefined;
        description?: string | undefined;
        auditPlanId?: string | undefined;
        eventOrAsset?: string | undefined;
        owner?: string | undefined;
        threat?: string | undefined;
        vulnerability?: string | undefined;
        existingControl?: string | undefined;
        probability?: number | undefined;
        impact?: number | undefined;
        riskClassification?: string | undefined;
        treatment?: "accept" | "mitigate" | "transfer" | "avoid" | undefined;
        treatmentPlan?: string | undefined;
        probabilityAfter?: number | undefined;
        impactAfter?: number | undefined;
        treatmentDeadline?: string | undefined;
    }>;
    updateRiskAssessmentSchema: z.ZodObject<{
        probability: z.ZodNumber;
        impact: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        probability: number;
        impact: number;
    }, {
        probability: number;
        impact: number;
    }>;
    treatRiskSchema: z.ZodObject<{
        treatment: z.ZodEnum<["accept", "mitigate", "transfer", "avoid"]>;
        treatmentPlan: z.ZodString;
        probabilityAfter: z.ZodNumber;
        impactAfter: z.ZodNumber;
        treatmentDeadline: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    }, "strip", z.ZodTypeAny, {
        treatment: "accept" | "mitigate" | "transfer" | "avoid";
        treatmentPlan: string;
        probabilityAfter: number;
        impactAfter: number;
        treatmentDeadline?: Date | undefined;
    }, {
        treatment: "accept" | "mitigate" | "transfer" | "avoid";
        treatmentPlan: string;
        probabilityAfter: number;
        impactAfter: number;
        treatmentDeadline?: string | undefined;
    }>;
    monitorRiskSchema: z.ZodObject<{
        status: z.ZodEnum<["monitored", "closed"]>;
    }, "strip", z.ZodTypeAny, {
        status: "closed" | "monitored";
    }, {
        status: "closed" | "monitored";
    }>;
    reopenRiskSchema: z.ZodObject<{
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
    }, {
        reason: string;
    }>;
    createAuditDocumentReviewSchema: z.ZodObject<{
        companyId: z.ZodString;
        auditPlanId: z.ZodString;
        documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            clause: z.ZodString;
            requirement: z.ZodString;
            status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
            observations: z.ZodOptional<z.ZodString>;
            reviewer: z.ZodString;
            reviewDate: z.ZodEffects<z.ZodString, Date, string>;
            documentId: z.ZodOptional<z.ZodString>;
            documentName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
            reviewDate: Date;
            clause: string;
            requirement: string;
            reviewer: string;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }, {
            reviewDate: string;
            clause: string;
            requirement: string;
            reviewer: string;
            status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }>, "many">>;
        observations: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        auditPlanId: string;
        documents?: {
            status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
            reviewDate: Date;
            clause: string;
            requirement: string;
            reviewer: string;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }, {
        companyId: string;
        auditPlanId: string;
        documents?: {
            reviewDate: string;
            clause: string;
            requirement: string;
            reviewer: string;
            status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
    }>;
    updateAuditDocumentReviewSchema: z.ZodObject<{
        companyId: z.ZodOptional<z.ZodString>;
        auditPlanId: z.ZodOptional<z.ZodString>;
        documents: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
            clause: z.ZodString;
            requirement: z.ZodString;
            status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
            observations: z.ZodOptional<z.ZodString>;
            reviewer: z.ZodString;
            reviewDate: z.ZodEffects<z.ZodString, Date, string>;
            documentId: z.ZodOptional<z.ZodString>;
            documentName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
            reviewDate: Date;
            clause: string;
            requirement: string;
            reviewer: string;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }, {
            reviewDate: string;
            clause: string;
            requirement: string;
            reviewer: string;
            status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }>, "many">>>;
        observations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        companyId?: string | undefined;
        documents?: {
            status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
            reviewDate: Date;
            clause: string;
            requirement: string;
            reviewer: string;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
        auditPlanId?: string | undefined;
    }, {
        companyId?: string | undefined;
        documents?: {
            reviewDate: string;
            clause: string;
            requirement: string;
            reviewer: string;
            status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
            observations?: string | undefined;
            documentId?: string | undefined;
            documentName?: string | undefined;
        }[] | undefined;
        observations?: string | undefined;
        auditPlanId?: string | undefined;
    }>;
    updateDocumentStatusSchema: z.ZodObject<{
        status: z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>;
        observations: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        observations?: string | undefined;
    }, {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        observations?: string | undefined;
    }>;
    addDocumentReviewSchema: z.ZodObject<{
        clause: z.ZodString;
        requirement: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["OK", "NC_A", "NC_B", "PI", "GP", "CM", "--"]>>;
        observations: z.ZodOptional<z.ZodString>;
        reviewer: z.ZodString;
        reviewDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
        documentId: z.ZodOptional<z.ZodString>;
        documentName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP";
        clause: string;
        requirement: string;
        reviewer: string;
        observations?: string | undefined;
        reviewDate?: Date | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }, {
        clause: string;
        requirement: string;
        reviewer: string;
        status?: "--" | "NC_A" | "NC_B" | "CM" | "OK" | "PI" | "GP" | undefined;
        observations?: string | undefined;
        reviewDate?: string | undefined;
        documentId?: string | undefined;
        documentName?: string | undefined;
    }>;
};
export default _default;
//# sourceMappingURL=audit.schemas.d.ts.map