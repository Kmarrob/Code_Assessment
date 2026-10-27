"use strict";
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
exports.AuditQuestion = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ============================================================
// SCHEMA
// ============================================================
const auditQuestionSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    collection: 'auditquestions',
});
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
exports.AuditQuestion = mongoose_1.default.model('AuditQuestion', auditQuestionSchema);
//# sourceMappingURL=AuditQuestion.js.map