import mongoose, { Schema } from 'mongoose';

export interface IAuditReportOrganization {
  legalName: string;
  corporateGroup?: string;
  address: string;
  country: string;
  contact: string;
  email: string;
  phone: string;
  language: string;
  scope: string;
  industry: string;
}

export interface IAuditReportProfile {
  standards: string[];
  auditType: 'internal' | 'external' | 'supplier';
  documentation: string;
  frequency: string;
  leadAuditor: string;
  auditTeam: string[];
  specialists: string[];
  trainees: string[];
  multiSite: boolean;
  sites: string[];
  operationalShifts: string;
}

export interface IAuditReportDetails {
  auditedLocations: string[];
  auditDate: Date;
  auditEndDate: Date;
  workDays: number;
}

export interface IAuditReportFinding {
  type: 'NC_A' | 'NC_B' | 'CM' | 'OM' | 'AP';
  number: string;
  description: string;
  area: string;
  process: string;
  clause: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'closed';
  actionPlan?: string;
}

export interface IAuditReportAttachment {
  name: string;
  type: 'checklist' | 'questionnaire' | 'evidence' | 'other';
  url: string;
}

export interface IAuditReportFollowUp {
  required: 'none' | 'reaudit' | 'next_audit';
  details: string;
}

export interface IAuditReportResults {
  conforme: number;
  nonconformitiesA: number;
  nonconformitiesB: number;
  comments: number;
  opportunities: number;
  goodPractices: number;
}

export interface IAuditReport {
  _id: string;
  auditPlanId: string;
  companyId: string;
  version: string;
  
  // Dados da organização
  organization: IAuditReportOrganization;
  
  // Perfil da auditoria
  profile: IAuditReportProfile;
  
  // Detalhes da auditoria
  details: IAuditReportDetails;
  
  // Resultados
  results: IAuditReportResults;
  
  // Não conformidades detalhadas
  findings: IAuditReportFinding[];
  
  // Resumo
  summary: string;
  
  // Conclusão
  conclusion: string;
  
  // Ações de acompanhamento
  followUp: IAuditReportFollowUp;
  
  // Anexos
  attachments: IAuditReportAttachment[];
  
  // Status do relatório
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  
  // Aprovação
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditReportSchema = new Schema<IAuditReport>(
  {
    auditPlanId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    version: { type: String, required: true, default: '1.0' },
    
    organization: {
      legalName: { type: String, required: true },
      corporateGroup: { type: String },
      address: { type: String, required: true },
      country: { type: String, required: true },
      contact: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      language: { type: String, required: true },
      scope: { type: String, required: true },
      industry: { type: String, required: true },
    },
    
    profile: {
      standards: [{ type: String, required: true }],
      auditType: {
        type: String,
        enum: ['internal', 'external', 'supplier'],
        required: true,
      },
      documentation: { type: String, required: true },
      frequency: { type: String, required: true },
      leadAuditor: { type: String, required: true },
      auditTeam: [{ type: String }],
      specialists: [{ type: String }],
      trainees: [{ type: String }],
      multiSite: { type: Boolean, default: false },
      sites: [{ type: String }],
      operationalShifts: { type: String, required: true },
    },
    
    details: {
      auditedLocations: [{ type: String, required: true }],
      auditDate: { type: Date, required: true },
      auditEndDate: { type: Date, required: true },
      workDays: { type: Number, required: true, min: 0 },
    },
    
    results: {
      conforme: { type: Number, default: 0 },
      nonconformitiesA: { type: Number, default: 0 },
      nonconformitiesB: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      opportunities: { type: Number, default: 0 },
      goodPractices: { type: Number, default: 0 },
    },
    
    findings: [
      {
        type: {
          type: String,
          enum: ['NC_A', 'NC_B', 'CM', 'OM', 'AP'],
          required: true,
        },
        number: { type: String, required: true },
        description: { type: String, required: true },
        area: { type: String, required: true },
        process: { type: String, required: true },
        clause: { type: String, required: true },
        deadline: { type: Date, required: true },
        status: {
          type: String,
          enum: ['open', 'in_progress', 'closed'],
          default: 'open',
        },
        actionPlan: { type: String },
      },
    ],
    
    summary: { type: String, required: true },
    conclusion: { type: String, required: true },
    
    followUp: {
      required: {
        type: String,
        enum: ['none', 'reaudit', 'next_audit'],
        default: 'none',
      },
      details: { type: String, default: '' },
    },
    
    attachments: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['checklist', 'questionnaire', 'evidence', 'other'],
          default: 'other',
        },
        url: { type: String, required: true },
      },
    ],
    
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected'],
      default: 'draft',
    },
    rejectionReason: { type: String },
    
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditReportSchema.index({ auditPlanId: 1 }, { unique: true });
AuditReportSchema.index({ companyId: 1, status: 1 });

// Virtual
AuditReportSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Virtual para total de não conformidades
AuditReportSchema.virtual('totalNonconformities').get(function () {
  return this.results.nonconformitiesA + this.results.nonconformitiesB;
});

// Middleware para soft delete
AuditReportSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditReportSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const AuditReport = mongoose.model<IAuditReport>('AuditReport', AuditReportSchema);