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
exports.AuditFinding = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditFindingSchema = new mongoose_1.Schema({
    auditPlanId: { type: String, required: true, index: true },
    checklistId: { type: String, index: true },
    number: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['NC_A', 'NC_B', 'CM', 'OM', 'AP'],
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: { type: String, required: true },
    process: { type: String, required: true },
    clause: { type: String, required: true },
    controlId: { type: String },
    evidenceIds: [{ type: String }],
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'pending_validation', 'closed', 'reopened'],
        default: 'open',
    },
    createdBy: { type: String, required: true },
    validatedBy: { type: String },
    validatedAt: { type: Date },
    validationComment: { type: String },
    reopenedAt: { type: Date },
    reopenedBy: { type: String },
    reopenReason: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditFindingSchema.index({ auditPlanId: 1, type: 1 });
AuditFindingSchema.index({ auditPlanId: 1, status: 1 });
AuditFindingSchema.index({ number: 1 }, { unique: true });
// Virtual
AuditFindingSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Virtual para classificação textual
AuditFindingSchema.virtual('typeLabel').get(function () {
    const labels = {
        NC_A: 'Não Conformidade Maior',
        NC_B: 'Não Conformidade Menor',
        CM: 'Comentário',
        OM: 'Oportunidade de Melhoria',
        AP: 'Boas Práticas / Aspecto Positivo',
    };
    return labels[this.type] || this.type;
});
// Virtual para cor/severidade
AuditFindingSchema.virtual('severity').get(function () {
    const severities = {
        NC_A: 'critical',
        NC_B: 'high',
        CM: 'medium',
        OM: 'low',
        AP: 'info',
    };
    return severities[this.type] || 'medium';
});
// Middleware para soft delete
AuditFindingSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditFindingSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
exports.AuditFinding = mongoose_1.default.model('AuditFinding', AuditFindingSchema);
//# sourceMappingURL=AuditFinding.js.map