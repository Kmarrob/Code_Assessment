"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvidence = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
const questionRefSchema = new mongoose_1.Schema({
    controlId: { type: String, required: true },
    // AUSENTE = constatação final (não pergunta específica)
    questionIndex: { type: Number },
}, { _id: false });
const AuditEvidenceSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
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
AuditEvidenceSchema.index({ 'questionRef.controlId': 1, 'questionRef.questionIndex': 1 }, { sparse: true });
exports.AuditEvidence = mongoose_1.default.model('AuditEvidence', AuditEvidenceSchema);
//# sourceMappingURL=AuditEvidence.js.map