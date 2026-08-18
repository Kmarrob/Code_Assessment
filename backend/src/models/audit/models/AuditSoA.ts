import mongoose, { Schema } from 'mongoose';

export interface IAuditSoAControl {
  clause: string; // 5.1, 5.2, etc.
  title: string;
  objective: string;
  motivators: {
    business: boolean;
    risk: boolean;
    legal: boolean;
    contract: boolean;
  };
  applicable: boolean;
  justification?: string;
  lastAssessmentDate?: Date;
  implemented: boolean;
  implementationDate?: Date;
  responsible?: string;
  evidence?: string;
}

export interface IAuditSoA {
  _id: string;
  companyId: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  
  // Controles
  controls: IAuditSoAControl[];
  
  // Estatísticas
  statistics: {
    total: number;
    applicable: number;
    notApplicable: number;
    implemented: number;
    notImplemented: number;
    byCategory: {
      organizational: number;
      people: number;
      physical: number;
      technological: number;
    };
  };
  
  // Metadados
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  reviewedAt?: Date;
  nextReviewDate?: Date;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditSoASchema = new Schema<IAuditSoA>(
  {
    companyId: { type: String, required: true, index: true },
    version: { type: String, required: true, default: '0.1' },
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'archived'],
      default: 'draft',
    },
    controls: [
      {
        clause: { type: String, required: true, index: true },
        title: { type: String, required: true },
        objective: { type: String, required: true },
        motivators: {
          business: { type: Boolean, default: false },
          risk: { type: Boolean, default: false },
          legal: { type: Boolean, default: false },
          contract: { type: Boolean, default: false },
        },
        applicable: { type: Boolean, default: true },
        justification: { type: String },
        lastAssessmentDate: { type: Date },
        implemented: { type: Boolean, default: false },
        implementationDate: { type: Date },
        responsible: { type: String },
        evidence: { type: String },
      },
    ],
    statistics: {
      total: { type: Number, default: 0 },
      applicable: { type: Number, default: 0 },
      notApplicable: { type: Number, default: 0 },
      implemented: { type: Number, default: 0 },
      notImplemented: { type: Number, default: 0 },
      byCategory: {
        organizational: { type: Number, default: 0 },
        people: { type: Number, default: 0 },
        physical: { type: Number, default: 0 },
        technological: { type: Number, default: 0 },
      },
    },
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    reviewedAt: { type: Date },
    nextReviewDate: { type: Date },
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
AuditSoASchema.index({ companyId: 1, version: 1 });
AuditSoASchema.index({ companyId: 1, status: 1 });
AuditSoASchema.index({ 'controls.clause': 1 });

// Virtual
AuditSoASchema.virtual('id').get(function () {
  return this._id.toString();
});

// Middleware para soft delete
AuditSoASchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditSoASchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Método para atualizar estatísticas
AuditSoASchema.methods.updateStatistics = function () {
  const total = this.controls.length;
  const applicable = this.controls.filter((c: IAuditSoAControl) => c.applicable).length;
  const implemented = this.controls.filter((c: IAuditSoAControl) => c.implemented).length;
  
  // Por categoria (baseado no clause prefix)
  const categories = {
    organizational: this.controls.filter((c: IAuditSoAControl) => 
      c.clause.startsWith('5.')
    ).length,
    people: this.controls.filter((c: IAuditSoAControl) => 
      c.clause.startsWith('6.')
    ).length,
    physical: this.controls.filter((c: IAuditSoAControl) => 
      c.clause.startsWith('7.')
    ).length,
    technological: this.controls.filter((c: IAuditSoAControl) => 
      c.clause.startsWith('8.')
    ).length,
  };
  
  this.statistics = {
    total,
    applicable,
    notApplicable: total - applicable,
    implemented,
    notImplemented: applicable - implemented,
    byCategory: categories,
  };
};

export const AuditSoA = mongoose.model<IAuditSoA>('AuditSoA', AuditSoASchema);