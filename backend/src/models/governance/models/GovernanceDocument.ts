import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGovernanceDocument extends Document {
  // Identificação
  code: string;              // POL-001, NOR-001, PRC-001, INS-001
  title: string;
  version: string;           // v1.0, v2.0
  status: 'draft' | 'review' | 'approved' | 'archived';
  
  // Hierarquia
  level: 1 | 2 | 3 | 4 | 5;  // 1=Política, 2=Norma, 3=Procedimento, 4=Instrução, 5=Registro
  category: string;          // Gestão de Acessos, Incidentes, etc.
  parentId?: string;         // Referência ao documento pai
  
  // Conteúdo
  content: string;           // Conteúdo em Markdown/HTML
  summary: string;           // Resumo executivo
  keywords: string[];        // Palavras-chave para busca
  
  // Metadados
  createdBy: string;         // User ID
  updatedBy: string;         // User ID
  approvedBy?: string;       // User ID
  approvedAt?: Date;
  effectiveDate: Date;
  reviewDate: Date;          // Data de revisão obrigatória
  
  // 🆕 CAMPOS ADICIONAIS PARA POLÍTICAS
  responsible?: string;           // Responsável pela política
  strategicObjective?: string;    // Objetivo estratégico
  scope?: 'all' | 'it' | 'security' | 'privacy';  // Escopo da política
  
  // Frameworks
  frameworks: {
    iso27001?: string[];
    nist?: string[];
    cobit?: string[];
    pciDss?: string[];
    lgpd?: string[];
    bacen?: string[];
  };
  
  // Empresa
  companyId: string | null;  // 🆕 Permitir null para documentos globais
  
  // 🆕 NOVO (v40) - Documento global (acessível a todas as empresas Enterprise)
  isGlobal: boolean;
  
  // Controle de versão
  versionHistory: Array<{
    version: string;
    date: Date;
    user: string;
    changes: string;
  }>;
  
  // Arquivos
  attachments: Array<{
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: Date;
  }>;
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const GovernanceDocumentSchema = new Schema<IGovernanceDocument>(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    version: { type: String, required: true, default: 'v1.0' },
    status: { 
      type: String, 
      enum: ['draft', 'review', 'approved', 'archived'], 
      default: 'draft',
      required: true 
    },
    
    level: { 
      type: Number, 
      enum: [1, 2, 3, 4, 5], 
      required: true 
    },
    category: { type: String, required: true },
    parentId: { type: String, ref: 'GovernanceDocument' },
    
    content: { type: String, required: true },
    summary: { type: String, required: true },
    keywords: { type: [String], default: [] },
    
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true },
    approvedBy: { type: String, ref: 'User' },
    approvedAt: { type: Date },
    effectiveDate: { type: Date, required: true },
    reviewDate: { type: Date, required: true },
    
    // 🆕 CAMPOS ADICIONAIS PARA POLÍTICAS
    responsible: { type: String, default: '' },
    strategicObjective: { type: String, default: '' },
    scope: { 
      type: String, 
      enum: ['all', 'it', 'security', 'privacy'], 
      default: 'all' 
    },
    
    frameworks: {
      iso27001: { type: [String], default: [] },
      nist: { type: [String], default: [] },
      cobit: { type: [String], default: [] },
      pciDss: { type: [String], default: [] },
      lgpd: { type: [String], default: [] },
      bacen: { type: [String], default: [] },
    },
    
    // 🆕 CORRIGIDO (v40) - Removido required para permitir documentos globais
    companyId: { type: String, ref: 'Company', default: null },
    
    // 🆕 NOVO (v40) - Documento global acessível a todas as empresas Enterprise
    isGlobal: { 
      type: Boolean, 
      default: false,
      description: 'Documento global acessível a todas as empresas com plano Enterprise'
    },
    
    versionHistory: [
      {
        version: { type: String, required: true },
        date: { type: Date, default: Date.now },
        user: { type: String, ref: 'User', required: true },
        changes: { type: String, required: true },
      },
    ],
    
    attachments: [
      {
        filename: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
        mimetype: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    discriminatorKey: '__type',
  }
);

// Índices para performance
GovernanceDocumentSchema.index({ code: 1, companyId: 1 }, { unique: true, partialFilterExpression: { companyId: { $ne: null } } });
GovernanceDocumentSchema.index({ companyId: 1, level: 1 });
GovernanceDocumentSchema.index({ companyId: 1, status: 1 });
GovernanceDocumentSchema.index({ companyId: 1, category: 1 });
GovernanceDocumentSchema.index({ keywords: 1 });
// 🆕 NOVO (v40) - Índice para documentos globais
GovernanceDocumentSchema.index({ isGlobal: 1 });

export const GovernanceDocument = mongoose.model<IGovernanceDocument>(
  'GovernanceDocument',
  GovernanceDocumentSchema
);