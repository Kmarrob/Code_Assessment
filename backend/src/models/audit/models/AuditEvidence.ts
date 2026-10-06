import mongoose, { Schema } from 'mongoose';
import { IAuditEvidence } from '../types/audit.types';

// ============================================================
// 🆕 v51.1 — SUB-SCHEMA `questionRef`
// ============================================================
//
// MOTIVO:
//   A evidência pode estar vinculada a uma pergunta específica
//   do checklist (pergunta de auditoria OU constatação final).
//   Este sub-schema tipa e valida esse vínculo.
//
// COMPATIBILIDADE:
//   - Campo OPCIONAL: evidências antigas (sem `questionRef`)
//     continuam válidas.
//   - `_id: false` evita gerar um ObjectId próprio — o vínculo
//     é um valor embutido, não uma entidade.
//
// ============================================================

const questionRefSchema = new Schema(
  {
    controlId: { type: String, required: true },
    // AUSENTE = constatação final (não pergunta específica)
    questionIndex: { type: Number },
  },
  { _id: false }
);

const AuditEvidenceSchema = new Schema<IAuditEvidence>(
  {
    auditPlanId: { type: String, ref: 'AuditPlan', required: true },
    findingId: { type: String, ref: 'AuditFinding' },

    // 🆕 v51.1 — Vínculo opcional com pergunta do checklist
    questionRef: { type: questionRefSchema, required: false },

    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String },
    uploadedBy: { type: String, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para ID
AuditEvidenceSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Índices
AuditEvidenceSchema.index({ auditPlanId: 1 });
AuditEvidenceSchema.index({ findingId: 1 });

// ============================================================
// 🆕 v51.1 — ÍNDICE PARA CONSULTA REVERSA POR PERGUNTA
// ============================================================
//
// Permite buscar eficientemente:
//   "todas as evidências da pergunta 3 do controle 5.12"
//
// O índice é ESPARSO (sparse: true) porque nem toda evidência
// tem `questionRef` — evidências de NC, por exemplo, não têm.
//
// ============================================================

AuditEvidenceSchema.index(
  { 'questionRef.controlId': 1, 'questionRef.questionIndex': 1 },
  { sparse: true }
);

export const AuditEvidence = mongoose.model<IAuditEvidence>('AuditEvidence', AuditEvidenceSchema);