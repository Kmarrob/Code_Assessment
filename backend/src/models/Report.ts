// backend/src/models/Report.ts
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IReport extends Document {
  companyId: mongoose.Types.ObjectId;
  // Dados do projeto
  projectNumber?: string;
  scope?: string;
  
  // Datas automáticas
  assessmentStartDate?: Date;
  assessmentEndDate?: Date;
  
  // Dados da equipe (gerados automaticamente)
  clientTeam: Array<{
    name: string;
    role: string;
    email: string;
  }>;
  consultantTeam: Array<{
    name: string;
    role: string;
    email: string;
  }>;
  
  // Status do relatório
  status: 'draft' | 'in_review' | 'finalized' | 'archived';
  
  // Metadados
  generatedBy?: mongoose.Types.ObjectId;
  generatedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt?: Date;
  
  // Histórico de alterações
  changeHistory?: Array<{
    changedBy: mongoose.Types.ObjectId;
    changes: string;
    changedAt: Date;
  }>;
}

const ReportSchema = new Schema<IReport>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
    },
    projectNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    scope: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    assessmentStartDate: {
      type: Date,
    },
    assessmentEndDate: {
      type: Date,
    },
    clientTeam: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Usuário' },
        email: { type: String, required: true },
      },
    ],
    consultantTeam: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'in_review', 'finalized', 'archived'],
      default: 'draft',
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    generatedAt: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
    },
    changeHistory: [
      {
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changes: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices
ReportSchema.index({ companyId: 1 }, { unique: true });
ReportSchema.index({ status: 1 });
ReportSchema.index({ generatedAt: -1 });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);