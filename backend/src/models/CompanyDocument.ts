// backend/src/models/CompanyDocument.ts
import mongoose, { Schema, Model, Document } from 'mongoose';

export type DocumentCategory = 'policy' | 'procedure' | 'evidence' | 'other';
export type DocumentStatus = 'draft' | 'active' | 'archived';

export interface ICompanyDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  status: DocumentStatus;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags?: string[];
  controlIds?: mongoose.Types.ObjectId[];
  metadata?: Record<string, any>;
}

const CompanyDocumentSchema = new Schema<ICompanyDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Empresa é obrigatória'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres'],
    },
    category: {
      type: String,
      enum: ['policy', 'procedure', 'evidence', 'other'],
      required: [true, 'Categoria é obrigatória'],
      index: true,
    },
    subcategory: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'Subcategoria deve ter no máximo 100 caracteres'],
    },
    fileName: {
      type: String,
      required: [true, 'Nome do arquivo é obrigatório'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'URL do arquivo é obrigatória'],
    },
    fileSize: {
      type: Number,
      required: [true, 'Tamanho do arquivo é obrigatório'],
      min: [0, 'Tamanho deve ser maior que 0'],
    },
    mimeType: {
      type: String,
      required: [true, 'Tipo MIME é obrigatório'],
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Versão deve ser maior que 0'],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário que fez o upload é obrigatório'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    controlIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Control',
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Índices otimizados
CompanyDocumentSchema.index({ companyId: 1, category: 1 });
CompanyDocumentSchema.index({ companyId: 1, status: 1 });
CompanyDocumentSchema.index({ companyId: 1, createdAt: -1 });
CompanyDocumentSchema.index({ companyId: 1, title: 'text' });
CompanyDocumentSchema.index({ tags: 1 });
CompanyDocumentSchema.index({ controlIds: 1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Buscar documentos por empresa
CompanyDocumentSchema.statics.findByCompany = function(companyId: string, filters?: {
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
}) {
  const query: any = { companyId };
  if (filters?.category) query.category = filters.category;
  if (filters?.status) query.status = filters.status;
  if (filters?.search) {
    query.$text = { $search: filters.search };
  }
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

// Buscar documentos por controle
CompanyDocumentSchema.statics.findByControl = function(controlId: string) {
  return this.find({ controlIds: controlId })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

// Contar documentos por categoria
CompanyDocumentSchema.statics.countByCategory = function(companyId: string) {
  return this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
};

export const CompanyDocument: Model<ICompanyDocument> = mongoose.model<ICompanyDocument>(
  'CompanyDocument',
  CompanyDocumentSchema
);