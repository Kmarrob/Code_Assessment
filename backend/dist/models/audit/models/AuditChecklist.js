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
exports.AuditChecklist = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ============================================================
// SCHEMA: PERGUNTA DO ASSESSMENT (INTACTO)
// ============================================================
const AuditChecklistQuestionSchema = new mongoose_1.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    answer: {
        type: String,
        enum: [
            'C',
            'NC',
            'OB',
            'OM',
            'NA',
            '--',
        ],
        default: '--',
    },
    observations: {
        type: String,
        default: '',
    },
    evidenceIds: {
        type: [String],
        default: [],
    },
    responsible: {
        type: String,
        required: true,
    },
    answeredAt: {
        type: Date,
    },
    answeredBy: {
        type: String,
    },
}, {
    _id: false,
});
// ============================================================
// 🆕 v50.1 — SCHEMA: PERGUNTA DE AUDITORIA (NOVO)
// ============================================================
const AuditChecklistAuditQuestionSchema = new mongoose_1.Schema({
    sourceQuestionId: {
        type: String,
        default: '',
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    objective: {
        type: String,
        default: '',
    },
    guidance: {
        type: String,
        default: '',
    },
    evidenceExpected: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 1,
        min: 1,
    },
    answer: {
        type: String,
        enum: [
            'C',
            'NC',
            'OB',
            'OM',
            'NA',
            '--',
        ],
        default: '--',
    },
    observations: {
        type: String,
        default: '',
    },
    evidenceIds: {
        type: [String],
        default: [],
    },
    answeredAt: {
        type: Date,
    },
    answeredBy: {
        type: String,
    },
}, {
    _id: false,
});
// ============================================================
// SCHEMA PRINCIPAL — AuditChecklist
// ============================================================
const AuditChecklistSchema = new mongoose_1.Schema({
    auditPlanId: {
        type: String,
        required: true,
        index: true,
    },
    controlId: {
        type: String,
        required: true,
        index: true,
    },
    // ============================================================
    // PERGUNTAS DO ASSESSMENT (INTACTO)
    // ============================================================
    questions: {
        type: [
            AuditChecklistQuestionSchema,
        ],
        default: [],
    },
    // ============================================================
    // 🆕 v50.1 — PERGUNTAS DE AUDITORIA (NOVO)
    // ============================================================
    auditQuestions: {
        type: [
            AuditChecklistAuditQuestionSchema,
        ],
        default: [],
    },
    // ============================================================
    // 🆕 v50.1 — CONSTATAÇÃO FINAL DO CONTROLE (NOVO)
    // ============================================================
    finalConclusion: {
        type: String,
        enum: [
            'C',
            'NC',
            'OB',
            'OM',
            'NA',
            '--',
        ],
        default: '--',
    },
    finalObservation: {
        type: String,
        default: '',
    },
    finalEvidenceIds: {
        type: [String],
        default: [],
    },
    finalJustification: {
        type: String,
        default: '',
    },
    // ============================================================
    // ESTATÍSTICAS DO CHECKLIST (INTACTO)
    // ============================================================
    statistics: {
        total: {
            type: Number,
            default: 0,
        },
        conforme: {
            type: Number,
            default: 0,
        },
        nonConforme: {
            type: Number,
            default: 0,
        },
        observacao: {
            type: Number,
            default: 0,
        },
        oportunidade: {
            type: Number,
            default: 0,
        },
        naoAplicavel: {
            type: Number,
            default: 0,
        },
    },
    // ============================================================
    // 🆕 v50.1 — ESTATÍSTICAS DE AUDITORIA (NOVO)
    // ============================================================
    auditStatistics: {
        total: {
            type: Number,
            default: 0,
        },
        conforme: {
            type: Number,
            default: 0,
        },
        nonConforme: {
            type: Number,
            default: 0,
        },
        observacao: {
            type: Number,
            default: 0,
        },
        oportunidade: {
            type: Number,
            default: 0,
        },
        naoAplicavel: {
            type: Number,
            default: 0,
        },
    },
    // ============================================================
    // STATUS (INTACTO)
    // ============================================================
    status: {
        type: String,
        enum: [
            'pending',
            'in_progress',
            'completed',
        ],
        default: 'pending',
        index: true,
    },
    completedBy: {
        type: String,
    },
    completedAt: {
        type: Date,
    },
    // ============================================================
    // METADADOS (INTACTO)
    // ============================================================
    createdBy: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
// ============================================================
// ÍNDICES COMPOSTOS
// ============================================================
AuditChecklistSchema.index({
    auditPlanId: 1,
    controlId: 1,
}, {
    unique: true,
});
AuditChecklistSchema.index({
    auditPlanId: 1,
    status: 1,
});
AuditChecklistSchema.index({
    auditPlanId: 1,
    deletedAt: 1,
});
// ============================================================
// VIRTUAL ID
// ============================================================
AuditChecklistSchema.virtual('id').get(function () {
    return this._id.toString();
});
// ============================================================
// SOFT DELETE
// ============================================================
AuditChecklistSchema.pre('find', function () {
    this.where({
        deletedAt: null,
    });
});
AuditChecklistSchema.pre('findOne', function () {
    this.where({
        deletedAt: null,
    });
});
AuditChecklistSchema.pre('findOneAndUpdate', function () {
    this.where({
        deletedAt: null,
    });
});
AuditChecklistSchema.pre('findOneAndDelete', function () {
    this.where({
        deletedAt: null,
    });
});
// ============================================================
// MÉTODO PARA ATUALIZAR ESTATÍSTICAS
// ============================================================
//
// Este método é o ÚNICO ponto que sofreu alteração funcional
// (aditiva). Agora ele:
//   1. Contabiliza as perguntas do Assessment (como antes).
//   2. Contabiliza as perguntas de auditoria (novo).
//   3. Verifica se o checklist pode ser concluído.
//
// REGRA DE CONCLUSÃO (atualizada):
//   - Se o checklist TEM perguntas de auditoria:
//       → considerar apenas elas para a conclusão
//       (o Assessment é contexto, não roteiro).
//   - Se NÃO TEM perguntas de auditoria:
//       → manter comportamento anterior (só Assessment).
//
// Isso preserva os checklists antigos que ainda não têm
// perguntas de auditoria.
// ============================================================
AuditChecklistSchema.methods.updateStatistics =
    function () {
        // ---- 1. Estatísticas do ASSESSMENT ----
        const stats = {
            total: this.questions.length,
            conforme: 0,
            nonConforme: 0,
            observacao: 0,
            oportunidade: 0,
            naoAplicavel: 0,
        };
        this.questions.forEach((question) => {
            switch (question.answer) {
                case 'C':
                    stats.conforme++;
                    break;
                case 'NC':
                    stats.nonConforme++;
                    break;
                case 'OB':
                    stats.observacao++;
                    break;
                case 'OM':
                    stats.oportunidade++;
                    break;
                case 'NA':
                    stats.naoAplicavel++;
                    break;
                case '--':
                    break;
                default:
                    break;
            }
        });
        this.statistics =
            stats;
        // ---- 2. Estatísticas das PERGUNTAS DE AUDITORIA (novo) ----
        const auditQs = this.auditQuestions || [];
        const auditStats = {
            total: auditQs.length,
            conforme: 0,
            nonConforme: 0,
            observacao: 0,
            oportunidade: 0,
            naoAplicavel: 0,
        };
        auditQs.forEach((q) => {
            switch (q.answer) {
                case 'C':
                    auditStats.conforme++;
                    break;
                case 'NC':
                    auditStats.nonConforme++;
                    break;
                case 'OB':
                    auditStats.observacao++;
                    break;
                case 'OM':
                    auditStats.oportunidade++;
                    break;
                case 'NA':
                    auditStats.naoAplicavel++;
                    break;
                case '--':
                    break;
                default:
                    break;
            }
        });
        this.auditStatistics = auditStats;
        // ---- 3. Verificação de conclusão ----
        const hasAuditQuestions = auditQs.length > 0;
        let allAnswered = false;
        if (hasAuditQuestions) {
            // Se existem perguntas de auditoria, elas são o critério
            // de conclusão (o Assessment é apenas contexto).
            allAnswered = auditQs.every((q) => q.answer !== '--');
        }
        else {
            // Comportamento anterior (só Assessment).
            allAnswered =
                this.questions.length > 0 &&
                    this.questions.every((q) => q.answer !== '--');
        }
        if (allAnswered) {
            this.status = 'completed';
            if (!this.completedAt) {
                this.completedAt =
                    new Date();
            }
        }
        else {
            this.completedAt =
                undefined;
            this.completedBy =
                undefined;
            const hasAnyAnswer = hasAuditQuestions
                ? auditQs.some((q) => q.answer !== '--')
                : this.questions.some((q) => q.answer !== '--');
            this.status =
                hasAnyAnswer
                    ? 'in_progress'
                    : 'pending';
        }
    };
// ============================================================
// EXPORTAÇÃO DO MODEL
// ============================================================
exports.AuditChecklist = mongoose_1.default.model('AuditChecklist', AuditChecklistSchema);
//# sourceMappingURL=AuditChecklist.js.map