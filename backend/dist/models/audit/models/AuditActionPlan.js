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
exports.AuditActionPlan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditActionPlanSchema = new mongoose_1.Schema({
    findingId: { type: String, required: true, index: true },
    auditPlanId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    description: { type: String },
    responsible: { type: String, required: true },
    createdBy: { type: String, required: true },
    deadline: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    evidenceIds: [{ type: String }],
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
        default: 'pending',
    },
    validatedBy: { type: String },
    validatedAt: { type: Date },
    validationComment: { type: String },
    rejectionReason: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditActionPlanSchema.index({ findingId: 1, status: 1 });
AuditActionPlanSchema.index({ responsible: 1, status: 1 });
AuditActionPlanSchema.index({ deadline: 1 });
// Virtual
AuditActionPlanSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Validação: validador não pode ser o criador (segregação de funções)
AuditActionPlanSchema.pre('save', function (next) {
    if (this.validatedBy && this.validatedBy === this.createdBy) {
        next(new Error('O validador não pode ser a mesma pessoa que criou o plano de ação'));
    }
    next();
});
// Middleware para soft delete
AuditActionPlanSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditActionPlanSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
exports.AuditActionPlan = mongoose_1.default.model('AuditActionPlan', AuditActionPlanSchema);
//# sourceMappingURL=AuditActionPlan.js.map