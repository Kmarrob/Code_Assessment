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
const AuditChecklistSchema = new mongoose_1.Schema({
    auditPlanId: { type: String, required: true, index: true },
    controlId: { type: String, required: true, index: true },
    questions: [
        {
            question: { type: String, required: true },
            answer: {
                type: String,
                enum: ['C', 'NC', 'OB', 'OM', 'NA', '--'],
                default: '--',
            },
            observations: { type: String, default: '' },
            evidenceIds: [{ type: String }],
            responsible: { type: String, required: true },
            answeredAt: { type: Date },
            answeredBy: { type: String },
        },
    ],
    statistics: {
        total: { type: Number, default: 0 },
        conforme: { type: Number, default: 0 },
        nonConforme: { type: Number, default: 0 },
        observacao: { type: Number, default: 0 },
        oportunidade: { type: Number, default: 0 },
        naoAplicavel: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    completedBy: { type: String },
    completedAt: { type: Date },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices compostos
AuditChecklistSchema.index({ auditPlanId: 1, controlId: 1 }, { unique: true });
AuditChecklistSchema.index({ auditPlanId: 1, status: 1 });
// Virtual
AuditChecklistSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Middleware para soft delete
AuditChecklistSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditChecklistSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
// Método para atualizar estatísticas
AuditChecklistSchema.methods.updateStatistics = function () {
    const stats = {
        total: this.questions.length,
        conforme: 0,
        nonConforme: 0,
        observacao: 0,
        oportunidade: 0,
        naoAplicavel: 0,
    };
    this.questions.forEach((q) => {
        switch (q.answer) {
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
            case '--': break;
        }
    });
    this.statistics = stats;
    // Verificar se todas as perguntas foram respondidas
    const allAnswered = this.questions.every((q) => q.answer !== '--');
    if (allAnswered && this.status !== 'completed') {
        this.status = 'completed';
        this.completedAt = new Date();
    }
};
exports.AuditChecklist = mongoose_1.default.model('AuditChecklist', AuditChecklistSchema);
//# sourceMappingURL=AuditChecklist.js.map