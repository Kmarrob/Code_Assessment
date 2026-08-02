export type DocumentLevel = 1 | 2 | 3 | 4 | 5;
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived';
export type PolicyScope = 'all' | 'it' | 'security' | 'privacy';
export type RecordType = 'form' | 'evidence' | 'report' | 'log';

export interface FrameworkReference {
  iso27001?: string[];
  nist?: string[];
  cobit?: string[];
  pciDss?: string[];
  lgpd?: string[];
  bacen?: string[];
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

export interface GovernanceDocument {
  id: string;
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
  frameworks: FrameworkReference;
  companyId: string;
  versionHistory: VersionHistoryEntry[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Policy extends GovernanceDocument {
  level: 1;
  scope: PolicyScope;
  strategicObjective: string;
  responsible: string;
}

export interface Standard extends GovernanceDocument {
  level: 2;
  policyId: string;
  mandatory: boolean;
  nonCompliancePenalty?: string;
}

export interface Procedure extends GovernanceDocument {
  level: 3;
  standardId: string;
  steps: ProcedureStep[];
  inputs: string[];
  outputs: string[];
}

export interface ProcedureStep {
  order: number;
  description: string;
  responsible: string;
  expectedTime: string;
}

export interface WorkInstruction extends GovernanceDocument {
  level: 4;
  procedureId: string;
  detailedSteps: string;
  tools: string[];
  prerequisites: string[];
  verificationPoints: string[];
}

export interface Record extends GovernanceDocument {
  level: 5;
  procedureId: string;
  recordType: RecordType;
  retentionPeriod: number;
  retentionPolicy: string;
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
  frameworks?: FrameworkReference;
}

export interface UpdateGovernanceDocumentDTO {
  title?: string;
  content?: string;
  summary?: string;
  keywords?: string[];
  status?: DocumentStatus;
  effectiveDate?: Date;
  reviewDate?: Date;
  frameworks?: FrameworkReference;
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

export interface CreatePolicyDTO extends CreateGovernanceDocumentDTO {
  scope: PolicyScope;
  strategicObjective: string;
  responsible: string;
}

export interface CreateStandardDTO extends CreateGovernanceDocumentDTO {
  policyId: string;
  mandatory?: boolean;
  nonCompliancePenalty?: string;
}

export interface CreateProcedureDTO extends CreateGovernanceDocumentDTO {
  standardId: string;
  steps: ProcedureStep[];
  inputs: string[];
  outputs: string[];
}

export interface CreateWorkInstructionDTO extends CreateGovernanceDocumentDTO {
  procedureId: string;
  detailedSteps: string;
  tools: string[];
  prerequisites: string[];
  verificationPoints: string[];
}

export interface CreateRecordDTO extends CreateGovernanceDocumentDTO {
  procedureId: string;
  recordType: RecordType;
  retentionPeriod: number;
  retentionPolicy: string;
}