import mongoose, { Schema } from 'mongoose';

export interface IAuditRisk {
  _id: string;
  companyId: string;
  auditPlanId?: string; // Opcional - vinculado a um plano de auditoria específico
  id: string; // R-001, R-002, etc.
  
  // Dados do risco
  description: string;
  eventOrAsset: string;
  owner: string;
  threat: string;
  vulnerability: string;
  existingControl: string;
  
  // Avaliação
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskClassification: string;
  
  // Tratamento
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  treatmentPlan: string;
  
  // Pós-tratamento
  probabilityAfter: 1 | 2 | 3 | 4 | 5;
  impactAfter: 1 | 2 | 3 | 4 | 5;
  residualRisk: 'low' | 'medium' | 'high' | 'critical';
  
  // Status
  status: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
  treatmentDeadline?: Date;
  treatedAt?: Date;
  treatedBy?: string;
  
  // Metadados
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Função auxiliar para calcular nível de risco
function calculateRiskLevel(probability: number, impact: number): 'low' | 'medium' | 'high' | 'critical' {
  const score = probability * impact;
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
}

const AuditRiskSchema = new Schema<IAuditRisk>(
  {
    companyId: { type: String, required: true, index: true },
    auditPlanId: { type: String, index: true },
    id: { type: String, required: true, unique: true },
    
    description: { type: String, required: true },
    eventOrAsset: { type: String, required: true },
    owner: { type: String, required: true },
    threat: { type: String, required: true },
    vulnerability: { type: String, required: true },
    existingControl: { type: String, required: true },
    
    probability: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    impact: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    riskClassification: { type: String, required: true },
    
    treatment: {
      type: String,
      enum: ['accept', 'mitigate', 'transfer', 'avoid'],
      required: true,
    },
    treatmentPlan: { type: String, required: true },
    
    probabilityAfter: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    impactAfter: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    residualRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    
    status: {
      type: String,
      enum: ['identified', 'analyzed', 'treated', 'monitored', 'closed'],
      default: 'identified',
    },
    treatmentDeadline: { type: Date },
    treatedAt: { type: Date },
    treatedBy: { type: String },
    
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
AuditRiskSchema.index({ companyId: 1, id: 1 }, { unique: true });
AuditRiskSchema.index({ companyId: 1, status: 1 });
AuditRiskSchema.index({ companyId: 1, riskLevel: 1 });

// Virtual
AuditRiskSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Middleware para soft delete
AuditRiskSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditRiskSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Middleware para calcular níveis automaticamente antes de salvar
AuditRiskSchema.pre('save', function (next) {
  // Calcular nível de risco
  this.riskLevel = calculateRiskLevel(this.probability, this.impact);
  
  // Calcular risco residual
  this.residualRisk = calculateRiskLevel(this.probabilityAfter, this.impactAfter);
  
  next();
});

export const AuditRisk = mongoose.model<IAuditRisk>('AuditRisk', AuditRiskSchema);