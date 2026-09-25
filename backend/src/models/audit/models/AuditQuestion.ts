// ============================================================
// AuditQuestion.ts
// ============================================================
//
// MODELO: Perguntas de auditoria de cláusulas ISO 27001:2022
//
// ESCOPO:
//   Perguntas usadas pelo auditor para auditar as CLÁUSULAS
//   4 a 10 da norma ISO/IEC 27001:2022 (SGSI).
//
//   NÃO confundir com o modelo "Question" (Assessment), que
//   audita os 93 controles com maturidade 0/1/2.
//
// CARACTERÍSTICAS:
//   - Perguntas GLOBAIS (todas as empresas veem as mesmas)
//   - Cadastro MANUAL pelo admin master (sem seed)
//   - Apenas ADMIN pode criar/editar/excluir
//
// COMPATIBILIDADE:
//   - Coleção NOVA no MongoDB (não interfere em nada existente)
//   - Zero dependência do módulo de Assessment
//   - Zero alteração em coleções existentes
//
// ============================================================

import mongoose, { Schema, Model } from 'mongoose';

// ============================================================
// INTERFACE
// ============================================================

export interface IAuditQuestion {
  _id: mongoose.Types.ObjectId;

  // ---- Identificação da cláusula ISO 27001:2022 ----
  clauseId: string;         // '4.1', '5.2', '9.2.1', '10.2'
  clauseTitle: string;      // 'Compreender a organização e seu contexto'
  clauseGroup: string;      // '4. Contexto da organização'

  // ---- Conteúdo da pergunta ----
  text: string;             // A pergunta em si
  objective: string;        // Objetivo da pergunta
  guidance: string;         // Orientação ao auditor

  // ---- Critérios de avaliação (opcional) ----
  evidenceExpected: string;       // Evidência esperada
  conformityCriteria: string;     // Critério para CONFORMIDADE (C)
  nonconformityCriteria: string;  // Critério para NÃO CONFORMIDADE (NC)

  // ---- Criticidade ----
  criticality: 'low' | 'medium' | 'high' | 'critical';

  // ---- Rastreabilidade ----
  relatedControls: string[];      // Controles Anexo A relacionados
  relatedDocuments: string[];     // Documentos SGSI esperados

  // ---- Controle ----
  order: number;
  active: boolean;

  // ---- Metadados ----
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============================================================
// SCHEMA
// ============================================================

const auditQuestionSchema = new Schema<IAuditQuestion>(
  {
    // ---- Identificação da cláusula ----
    clauseId: {
      type: String,
      required: [true, 'ID da cláusula é obrigatório'],
      trim: true,
      index: true,
    },
    clauseTitle: {
      type: String,
      default: '',
      trim: true,
    },
    clauseGroup: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },

    // ---- Conteúdo da pergunta ----
    text: {
      type: String,
      required: [true, 'Texto da pergunta é obrigatório'],
      trim: true,
      minlength: [5, 'Texto da pergunta deve ter no mínimo 5 caracteres'],
    },
    objective: {
      type: String,
      default: '',
      trim: true,
    },
    guidance: {
      type: String,
      default: '',
      trim: true,
    },

    // ---- Critérios de avaliação ----
    evidenceExpected: {
      type: String,
      default: '',
      trim: true,
    },
    conformityCriteria: {
      type: String,
      default: '',
      trim: true,
    },
    nonconformityCriteria: {
      type: String,
      default: '',
      trim: true,
    },

    // ---- Criticidade ----
    criticality: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },

    // ---- Rastreabilidade ----
    relatedControls: {
      type: [String],
      default: [],
    },
    relatedDocuments: {
      type: [String],
      default: [],
    },

    // ---- Controle ----
    order: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ---- Metadados ----
    createdBy: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'auditquestions',
  }
);

// ============================================================
// ÍNDICES
// ============================================================

auditQuestionSchema.index({ clauseId: 1, order: 1 });
auditQuestionSchema.index({ clauseGroup: 1, clauseId: 1, order: 1 });
auditQuestionSchema.index({ active: 1, deletedAt: 1 });

// ============================================================
// VIRTUAL ID
// ============================================================

auditQuestionSchema.virtual('id').get(function () {
  return this._id.toString();
});

// ============================================================
// SOFT DELETE (consistente com AuditPlan)
// ============================================================

auditQuestionSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

auditQuestionSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

auditQuestionSchema.pre('findOneAndUpdate', function () {
  this.where({ deletedAt: null });
});

// ============================================================
// MODEL
// ============================================================

export const AuditQuestion: Model<IAuditQuestion> = mongoose.model<IAuditQuestion>(
  'AuditQuestion',
  auditQuestionSchema
);