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
exports.AuditRisk = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Função auxiliar para calcular nível de risco
function calculateRiskLevel(probability, impact) {
    const score = probability * impact;
    if (score <= 4)
        return 'low';
    if (score <= 9)
        return 'medium';
    if (score <= 16)
        return 'high';
    return 'critical';
}
const AuditRiskSchema = new mongoose_1.Schema({
    companyId: { type: String, required: true, index: true },
    auditPlanId: { type: String, index: true },
    id: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    eventOrAsset: { type: String, required: true },
    owner: { type: String, required: true },
    threat: { type: String, required: true },
    vulnerability: { type: String, required: true },
    existingControl: { type: String, required: true },
    probability: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    impact: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
    },
    riskClassification: { type: String, required: true },
    treatment: {
        type: String,
        enum: ['accept', 'mitigate', 'transfer', 'avoid'],
        required: true,
    },
    treatmentPlan: { type: String, required: true },
    probabilityAfter: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    impactAfter: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    residualRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
    },
    status: {
        type: String,
        enum: ['identified', 'analyzed', 'treated', 'monitored', 'closed'],
        default: 'identified',
    },
    treatmentDeadline: { type: Date },
    treatedAt: { type: Date },
    treatedBy: { type: String },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditRiskSchema.index({ companyId: 1, id: 1 }, { unique: true });
AuditRiskSchema.index({ companyId: 1, status: 1 });
AuditRiskSchema.index({ companyId: 1, riskLevel: 1 });
// Middleware para soft delete
AuditRiskSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditRiskSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
// Middleware para calcular níveis automaticamente antes de salvar
AuditRiskSchema.pre('save', function (next) {
    // Calcular nível de risco
    this.riskLevel = calculateRiskLevel(this.probability, this.impact);
    // Calcular risco residual
    this.residualRisk = calculateRiskLevel(this.probabilityAfter, this.impactAfter);
    next();
});
exports.AuditRisk = mongoose_1.default.model('AuditRisk', AuditRiskSchema);
//# sourceMappingURL=AuditRisk.js.map