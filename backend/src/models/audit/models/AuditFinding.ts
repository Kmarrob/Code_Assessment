import mongoose, { Schema } from 'mongoose';

export type FindingType = 'NC_A' | 'NC_B' | 'CM' | 'OM' | 'AP';
export type FindingStatus = 'open' | 'in_progress' | 'pending_validation' | 'closed' | 'reopened';

export interface IAuditFinding {
  _id: string;
  auditPlanId: string;
  checklistId?: string; // Referência ao checklist onde foi identificado
  
  // Identificação
  number: string; // NC-001, NC-002, etc.
  type: FindingType;
  
  // Descrição
  title: string;
  description: string;
  area: string;
  process: string;
  clause: string; // ISO 27001:2022 cláusula
  controlId?: string; // Controle relacionado (5.1, 6.2, etc.)
  
  // Evidências
  evidenceIds: string[];
  
  // Prazo
  deadline: Date;
  
  // Status
  status: FindingStatus;
  
  // Validação
  createdBy: string;
  validatedBy?: string;
  validatedAt?: Date;
  validationComment?: string;
  
  // Reabertura
  reopenedAt?: Date;
  reopenedBy?: string;
  reopenReason?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditFindingSchema = new Schema<IAuditFinding>(
  {
    auditPlanId: { type: String, required: true, index: true },
    checklistId: { type: String, index: true },
    
    number: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['NC_A', 'NC_B', 'CM', 'OM', 'AP'],
      required: true,
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: { type: String, required: true },
    process: { type: String, required: true },
    clause: { type: String, required: true },
    controlId: { type: String },
    
    evidenceIds: [{ type: String }],
    
    deadline: { type: Date, required: true },
    
    status: {
      type: String,
      enum: ['open', 'in_progress', 'pending_validation', 'closed', 'reopened'],
      default: 'open',
    },
    
    createdBy: { type: String, required: true },
    validatedBy: { type: String },
    validatedAt: { type: Date },
    validationComment: { type: String },
    
    reopenedAt: { type: Date },
    reopenedBy: { type: String },
    reopenReason: { type: String },
    
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditFindingSchema.index({ auditPlanId: 1, type: 1 });
AuditFindingSchema.index({ auditPlanId: 1, status: 1 });
AuditFindingSchema.index({ number: 1 }, { unique: true });

// Virtual
AuditFindingSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Virtual para classificação textual
AuditFindingSchema.virtual('typeLabel').get(function () {
  const labels = {
    NC_A: 'Não Conformidade Maior',
    NC_B: 'Não Conformidade Menor',
    CM: 'Comentário',
    OM: 'Oportunidade de Melhoria',
    AP: 'Boas Práticas / Aspecto Positivo',
  };
  return labels[this.type as FindingType] || this.type;
});

// Virtual para cor/severidade
AuditFindingSchema.virtual('severity').get(function () {
  const severities = {
    NC_A: 'critical',
    NC_B: 'high',
    CM: 'medium',
    OM: 'low',
    AP: 'info',
  };
  return severities[this.type as FindingType] || 'medium';
});

// Middleware para soft delete
AuditFindingSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditFindingSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const AuditFinding = mongoose.model<IAuditFinding>('AuditFinding', AuditFindingSchema);