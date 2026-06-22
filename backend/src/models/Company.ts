// backend/src/models/Company.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface ICompany {
  _id: mongoose.Types.ObjectId;
  name: string;
  cnpj?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  maxUsers: number;
  maxControls: number;
  assignedControls: mongoose.Types.ObjectId[];
  // ============================================
  // NOVOS CAMPOS PARA GESTÃO DE CONSULTORES
  // ============================================
  consultantId?: mongoose.Types.ObjectId;  // Consultor responsável pela empresa
  createdBy?: mongoose.Types.ObjectId;     // Admin que criou a empresa
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Nome da empresa é obrigatório'],
      trim: true,
      unique: true,
    },
    cnpj: {
      type: String,
      trim: true,
      sparse: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    maxUsers: {
      type: Number,
      default: 10,
    },
    maxControls: {
      type: Number,
      default: 93,
    },
    assignedControls: {
      type: [Schema.Types.ObjectId],
      ref: 'Control',
      default: [],
    },
    // ============================================
    // NOVOS CAMPOS
    // ============================================
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ cnpj: 1 }, { sparse: true });
companySchema.index({ status: 1 });
companySchema.index({ assignedControls: 1 });
companySchema.index({ consultantId: 1 }); // NOVO ÍNDICE
companySchema.index({ createdBy: 1 }); // NOVO ÍNDICE
companySchema.index({ consultantId: 1, status: 1 }); // NOVO ÍNDICE COMPOSTO

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);