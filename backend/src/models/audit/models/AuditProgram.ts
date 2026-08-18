import mongoose, { Schema } from 'mongoose';

export interface IAuditProgram {
  _id: string;
  year: number;
  companyId: string;
  status: 'draft' | 'approved' | 'active' | 'archived';
  
  // Setores/Áreas a serem auditados
  sectors: Array<{
    name: string;
    processes: string[];
    importance: 'critical' | 'standard';
    scoreA: number; // 0-2 (pontuação por NCs anteriores)
    scoreB: number; // 0-1 (pontuação por importância)
    totalScore: number; // A + B (0-3)
    frequency: 'annual' | 'semiannual' | 'quarterly';
    lastAuditDate?: Date;
    nextAuditDate?: Date;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    auditPlanId?: string; // Referência ao plano de auditoria
  }>;
  
  // Fornecedores a serem auditados
  supplierAudits: Array<{
    supplierName: string;
    supplierId?: string;
    auditDate: Date;
    scope: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    auditPlanId?: string;
  }>;
  
  // Auditoria externa (3ª parte)
  externalAudit: {
    plannedDate?: Date;
    certificationBody?: string;
    scope?: string;
    status: 'not_planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    auditPlanId?: string;
  };
  
  // Outras atividades do programa
  otherActivities: Array<{
    name: string;
    description: string;
    scheduledDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: Date;
  }>;
  
  // Metadados
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditProgramSchema = new Schema<IAuditProgram>(
  {
    year: { type: Number, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'active', 'archived'],
      default: 'draft',
    },
    sectors: [
      {
        name: { type: String, required: true },
        processes: [{ type: String }],
        importance: { type: String, enum: ['critical', 'standard'], default: 'standard' },
        scoreA: { type: Number, min: 0, max: 2, default: 0 },
        scoreB: { type: Number, min: 0, max: 1, default: 0 },
        totalScore: { type: Number, min: 0, max: 3, default: 0 },
        frequency: {
          type: String,
          enum: ['annual', 'semiannual', 'quarterly'],
          default: 'annual',
        },
        lastAuditDate: { type: Date },
        nextAuditDate: { type: Date },
        status: {
          type: String,
          enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
          default: 'scheduled',
        },
        auditPlanId: { type: String },
      },
    ],
    supplierAudits: [
      {
        supplierName: { type: String, required: true },
        supplierId: { type: String },
        auditDate: { type: Date, required: true },
        scope: { type: String, required: true },
        status: {
          type: String,
          enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
          default: 'scheduled',
        },
        auditPlanId: { type: String },
      },
    ],
    externalAudit: {
      plannedDate: { type: Date },
      certificationBody: { type: String },
      scope: { type: String },
      status: {
        type: String,
        enum: ['not_planned', 'scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'not_planned',
      },
      auditPlanId: { type: String },
    },
    otherActivities: [
      {
        name: { type: String, required: true },
        description: { type: String },
        scheduledDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
        completedAt: { type: Date },
      },
    ],
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    observations: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compostos para consultas eficientes
AuditProgramSchema.index({ companyId: 1, year: 1 }, { unique: true });
AuditProgramSchema.index({ companyId: 1, status: 1 });
AuditProgramSchema.index({ 'sectors.nextAuditDate': 1 });

// Virtual para ID
AuditProgramSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Middleware para soft delete
AuditProgramSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditProgramSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const AuditProgram = mongoose.model<IAuditProgram>('AuditProgram', AuditProgramSchema);