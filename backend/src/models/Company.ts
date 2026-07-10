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
  // ============================================
  // CAMPOS DE BRANDING - LOGO E FAVICON DA MRS CONSULTORIA
  // ============================================
  branding?: {
    logo: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
      dimensions: { width: number; height: number; };
      uploadedAt: Date | null;
      uploadedBy: mongoose.Types.ObjectId | null;
    };
    favicon: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
      uploadedAt: Date | null;
      uploadedBy: mongoose.Types.ObjectId | null;
    };
    colors: {
      primary: string;      // #122A40 - Azul Marinho Escuro
      secondary: string;    // #1E5359 - Verde Petróleo
      accent: string;       // #30736C - Verde Azulado
      background: string;   // #F2F2F2 - Cinza Claro
      text: string;         // #122A40 - Azul Marinho
      extractedFrom: Date | null;
    };
    settings: {
      showLogoInHeader: boolean;
      showLogoInReport: boolean;
      useCustomColors: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  };
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
    // ============================================
    // CAMPOS DE BRANDING - LOGO E FAVICON DA MRS CONSULTORIA
    // ============================================
    branding: {
      logo: {
        url: {
          type: String,
          default: '',
          trim: true,
        },
        filename: {
          type: String,
          default: '',
          trim: true,
        },
        size: {
          type: Number,
          default: 0,
        },
        mimeType: {
          type: String,
          default: '',
          trim: true,
        },
        dimensions: {
          width: { type: Number, default: 0 },
          height: { type: Number, default: 0 },
        },
        uploadedAt: {
          type: Date,
          default: null,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
      },
      favicon: {
        url: {
          type: String,
          default: '',
          trim: true,
        },
        filename: {
          type: String,
          default: '',
          trim: true,
        },
        size: {
          type: Number,
          default: 0,
        },
        mimeType: {
          type: String,
          default: '',
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: null,
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
      },
      colors: {
        primary: {
          type: String,
          default: '#122A40',     // Azul Marinho Escuro - Cor principal
          trim: true,
        },
        secondary: {
          type: String,
          default: '#1E5359',     // Verde Petróleo - Cor secundária
          trim: true,
        },
        accent: {
          type: String,
          default: '#30736C',     // Verde Azulado - Cor de destaque
          trim: true,
        },
        background: {
          type: String,
          default: '#F2F2F2',     // Cinza Claro - Fundo
          trim: true,
        },
        text: {
          type: String,
          default: '#122A40',     // Azul Marinho - Texto principal
          trim: true,
        },
        extractedFrom: {
          type: Date,
          default: null,
        },
      },
      settings: {
        showLogoInHeader: {
          type: Boolean,
          default: true,
        },
        showLogoInReport: {
          type: Boolean,
          default: true,
        },
        useCustomColors: {
          type: Boolean,
          default: false,
        },
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices existentes
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ cnpj: 1 }, { sparse: true });
companySchema.index({ status: 1 });
companySchema.index({ assignedControls: 1 });
companySchema.index({ consultantId: 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ consultantId: 1, status: 1 });

// ============================================
// NOVOS ÍNDICES PARA BRANDING
// ============================================
companySchema.index({ 'branding.logo.url': 1 }, { sparse: true });
companySchema.index({ 'branding.favicon.url': 1 }, { sparse: true });

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);