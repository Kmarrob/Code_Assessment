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
exports.AuditPlan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditPlanSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    companyId: { type: String, required: true, index: true },
    programId: { type: String, index: true },
    scope: {
        controls: [{ type: String }],
        processes: [{ type: String }],
        areas: [{ type: String }],
    },
    team: {
        leadAuditor: { type: String, required: true },
        auditors: [{ type: String }],
        observers: [{ type: String }],
        specialists: [{ type: String }],
    },
    period: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        estimatedDays: { type: Number, required: true, min: 1 },
    },
    criteria: [{ type: String, required: true }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'draft',
    },
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    completedBy: { type: String },
    observations: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditPlanSchema.index({ companyId: 1, status: 1 });
AuditPlanSchema.index({ companyId: 1, code: 1 }, { unique: true });
AuditPlanSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
// Virtual
AuditPlanSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Validação: leadAuditor não pode ser o criador (segregação de funções)
AuditPlanSchema.pre('save', function (next) {
    if (this.createdBy === this.team.leadAuditor) {
        next(new Error('O Auditor Líder não pode ser a mesma pessoa que criou o plano de auditoria'));
    }
    next();
});
// Middleware para soft delete
AuditPlanSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditPlanSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
exports.AuditPlan = mongoose_1.default.model('AuditPlan', AuditPlanSchema);
//# sourceMappingURL=AuditPlan.js.map