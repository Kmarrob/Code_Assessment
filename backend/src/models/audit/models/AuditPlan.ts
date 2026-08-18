import mongoose, { Schema } from 'mongoose';

export interface IAuditPlanScope {
  controls: string[]; // IDs dos controles ISO 27001
  processes: string[]; // Processos a serem auditados
  areas: string[]; // Áreas/departamentos
}

export interface IAuditPlanTeam {
  leadAuditor: string; // User ID
  auditors: string[]; // User IDs
  observers: string[]; // User IDs
  specialists?: string[]; // Especialistas convidados
}

export interface IAuditPlanPeriod {
  startDate: Date;
  endDate: Date;
  estimatedDays: number;
}

export interface IAuditPlan {
  _id: string;
  
  // Identificação
  title: string;
  description: string;
  code: string; // AUD-2026-001
  
  // Empresa
  companyId: string;
  
  // Programa de auditoria (referência)
  programId?: string;
  
  // Escopo
  scope: IAuditPlanScope;
  
  // Equipe
  team: IAuditPlanTeam;
  
  // Período
  period: IAuditPlanPeriod;
  
  // Critérios
  criteria: string[];
  
  // Status
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  
  // Aprovação
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Execução
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  
  // Observações
  observations?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditPlanSchema = new Schema<IAuditPlan>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    
    companyId: { type: String, required: true, index: true },
    programId: { type: String, index: true },
    
    scope: {
      controls: [{ type: String }],
      processes: [{ type: String }],
      areas: [{ type: String }],
    },
    
    team: {
      leadAuditor: { type: String, required: true },
      auditors: [{ type: String }],
      observers: [{ type: String }],
      specialists: [{ type: String }],
    },
    
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      estimatedDays: { type: Number, required: true, min: 1 },
    },
    
    criteria: [{ type: String, required: true }],
    
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    startedAt: { type: Date },
    completedAt: { type: Date },
    completedBy: { type: String },
    
    observations: { type: String },
    
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditPlanSchema.index({ companyId: 1, status: 1 });
AuditPlanSchema.index({ companyId: 1, code: 1 }, { unique: true });
AuditPlanSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

// Virtual
AuditPlanSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Validação: leadAuditor não pode ser o criador (segregação de funções)
AuditPlanSchema.pre('save', function (next) {
  if (this.createdBy === this.team.leadAuditor) {
    next(new Error('O Auditor Líder não pode ser a mesma pessoa que criou o plano de auditoria'));
  }
  next();
});

// Middleware para soft delete
AuditPlanSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditPlanSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const AuditPlan = mongoose.model<IAuditPlan>('AuditPlan', AuditPlanSchema);