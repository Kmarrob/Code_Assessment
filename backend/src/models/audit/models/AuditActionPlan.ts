import mongoose, { Schema } from 'mongoose';

export interface IAuditActionPlan {
  _id: string;
  findingId: string; // Referência à não conformidade
  auditPlanId: string;
  companyId: string;
  
  // Descrição da ação
  action: string;
  description?: string;
  
  // Responsáveis
  responsible: string; // User ID (responsável pela execução)
  createdBy: string; // Quem criou a ação (geralmente o auditor ou REP)
  
  // Prazos
  deadline: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Evidências
  evidenceIds: string[];
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  
  // Validação
  validatedBy?: string;
  validatedAt?: Date;
  validationComment?: string;
  rejectionReason?: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditActionPlanSchema = new Schema<IAuditActionPlan>(
  {
    findingId: { type: String, required: true, index: true },
    auditPlanId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    
    action: { type: String, required: true },
    description: { type: String },
    
    responsible: { type: String, required: true },
    createdBy: { type: String, required: true },
    
    deadline: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    
    evidenceIds: [{ type: String }],
    
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    
    validatedBy: { type: String },
    validatedAt: { type: Date },
    validationComment: { type: String },
    rejectionReason: { type: String },
    
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditActionPlanSchema.index({ findingId: 1, status: 1 });
AuditActionPlanSchema.index({ responsible: 1, status: 1 });
AuditActionPlanSchema.index({ deadline: 1 });

// Virtual
AuditActionPlanSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Validação: validador não pode ser o criador (segregação de funções)
AuditActionPlanSchema.pre('save', function (next) {
  if (this.validatedBy && this.validatedBy === this.createdBy) {
    next(new Error('O validador não pode ser a mesma pessoa que criou o plano de ação'));
  }
  next();
});

// Middleware para soft delete
AuditActionPlanSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditActionPlanSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const AuditActionPlan = mongoose.model<IAuditActionPlan>('AuditActionPlan', AuditActionPlanSchema);