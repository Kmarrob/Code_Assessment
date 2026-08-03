export type DocumentLevel = 1 | 2 | 3 | 4 | 5;
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived';
export type PolicyScope = 'all' | 'it' | 'security' | 'privacy';
export type RecordType = 'form' | 'evidence' | 'report' | 'log';
export interface GovernanceDocumentBase {
    code: string;
    title: string;
    version: string;
    status: DocumentStatus;
    level: DocumentLevel;
    category: string;
    parentId?: string;
    content: string;
    summary: string;
    keywords: string[];
    createdBy: string;
    updatedBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    effectiveDate: Date;
    reviewDate: Date;
    frameworks: {
        iso27001?: string[];
        nist?: string[];
        cobit?: string[];
        pciDss?: string[];
        lgpd?: string[];
        bacen?: string[];
    };
    companyId: string;
    versionHistory: VersionHistoryEntry[];
    attachments: Attachment[];
}
export interface VersionHistoryEntry {
    version: string;
    date: Date;
    user: string;
    changes: string;
}
export interface Attachment {
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: Date;
}
export interface CreateGovernanceDocumentDTO {
    code: string;
    title: string;
    level: DocumentLevel;
    category: string;
    content: string;
    summary: string;
    keywords?: string[];
    effectiveDate: Date;
    reviewDate: Date;
    frameworks?: {
        iso27001?: string[];
        nist?: string[];
        cobit?: string[];
        pciDss?: string[];
        lgpd?: string[];
        bacen?: string[];
    };
}
export interface UpdateGovernanceDocumentDTO {
    title?: string;
    content?: string;
    summary?: string;
    keywords?: string[];
    status?: DocumentStatus;
    effectiveDate?: Date;
    reviewDate?: Date;
    frameworks?: {
        iso27001?: string[];
        nist?: string[];
        cobit?: string[];
        pciDss?: string[];
        lgpd?: string[];
        bacen?: string[];
    };
    version?: string;
    versionChanges?: string;
}
export interface GovernanceFilters {
    level?: DocumentLevel;
    status?: DocumentStatus;
    category?: string;
    search?: string;
    framework?: 'iso27001' | 'nist' | 'cobit' | 'pciDss' | 'lgpd' | 'bacen';
}
//# sourceMappingURL=governance.types.d.ts.map