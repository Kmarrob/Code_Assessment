import mongoose, { Schema } from 'mongoose';

export interface IDocumentReviewItem {
  clause: string; // 4.3, 5.2, 6.1.2, etc.
  requirement: string;
  status: 'OK' | 'NC_A' | 'NC_B' | 'PI' | 'GP' | 'CM' | '--';
  observations: string;
  reviewer: string;
  reviewDate: Date;
  documentId?: string; // Referência ao documento revisado (da governança)
  documentName?: string;
}

export interface IAuditDocumentReview {
  _id: string;
  companyId: string;
  auditPlanId: string;
  
  // Documentos revisados por cláusula
  documents: IDocumentReviewItem[];
  
  // Resumo
  summary: {
    totalDocuments: number;
    ok: number;
    ncA: number;
    ncB: number;
    pi: number;
    gp: number;
    cm: number;
    notAssessed: number;
  };
  
  // Metadados
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditDocumentReviewSchema = new Schema<IAuditDocumentReview>(
  {
    companyId: { type: String, required: true, index: true },
    auditPlanId: { type: String, required: true, index: true },
    
    documents: [
      {
        clause: { type: String, required: true },
        requirement: { type: String, required: true },
        status: {
          type: String,
          enum: ['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--'],
          default: '--',
        },
        observations: { type: String, default: '' },
        reviewer: { type: String, required: true },
        reviewDate: { type: Date, required: true },
        documentId: { type: String },
        documentName: { type: String },
      },
    ],
    
    summary: {
      totalDocuments: { type: Number, default: 0 },
      ok: { type: Number, default: 0 },
      ncA: { type: Number, default: 0 },
      ncB: { type: Number, default: 0 },
      pi: { type: Number, default: 0 },
      gp: { type: Number, default: 0 },
      cm: { type: Number, default: 0 },
      notAssessed: { type: Number, default: 0 },
    },
    
    createdBy: { type: String, required: true },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
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
AuditDocumentReviewSchema.index({ auditPlanId: 1 });
AuditDocumentReviewSchema.index({ companyId: 1, auditPlanId: 1 }, { unique: true });

// Virtual
AuditDocumentReviewSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Middleware para soft delete
AuditDocumentReviewSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditDocumentReviewSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Método para atualizar resumo
AuditDocumentReviewSchema.methods.updateSummary = function () {
  const statusCounts = {
    OK: 0,
    NC_A: 0,
    NC_B: 0,
    PI: 0,
    GP: 0,
    CM: 0,
    '--': 0,
  };
  
  this.documents.forEach((doc: IDocumentReviewItem) => {
    if (statusCounts[doc.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[doc.status as keyof typeof statusCounts]++;
    }
  });
  
  this.summary = {
    totalDocuments: this.documents.length,
    ok: statusCounts.OK,
    ncA: statusCounts.NC_A,
    ncB: statusCounts.NC_B,
    pi: statusCounts.PI,
    gp: statusCounts.GP,
    cm: statusCounts.CM,
    notAssessed: statusCounts['--'],
  };
};

export const AuditDocumentReview = mongoose.model<IAuditDocumentReview>(
  'AuditDocumentReview',
  AuditDocumentReviewSchema
);